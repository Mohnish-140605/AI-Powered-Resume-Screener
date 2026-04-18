import { useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";
import { CandidateResult } from "../types";

interface ScreeningResponse {
  results: CandidateResult[];
}

interface UseUploadReturn {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  results: CandidateResult[];
  loading: boolean;
  error: string | null;
  submitScreening: () => Promise<void>;
}

interface ExtractedResume {
  filename: string;
  text: string;
  file_hash: string;
}

interface ExtractResponse {
  items: ExtractedResume[];
}

const BROWSER_AI_SYSTEM_PROMPT = `You are an expert AI recruiter performing a multi-dimensional semantic resume evaluation.

## Scoring Dimensions
1. experience_score (0-100): years of experience & seniority fit
2. skills_score (0-100): semantic match of technical/domain skills (partial credit for adjacent skills)
3. semantic_score (0-100): holistic contextual fit (industry, scale, impact language)
4. match_score (0-100): weighted composite = round(experience_score×0.30 + skills_score×0.45 + semantic_score×0.25)
5. evaluation_grade: "A+" (≥90), "A" (80-89), "B+" (70-79), "B" (60-69), "C" (45-59), "D" (<45)

Return ONLY a raw JSON object with EXACTLY these keys:
{
  "candidate_name": <string>,
  "experience_score": <int>,
  "skills_score": <int>,
  "semantic_score": <int>,
  "match_score": <int>,
  "evaluation_grade": <string>,
  "score_reasoning": <one sentence explaining the composite score>,
  "experience_years": <int extracted relevant years>,
  "matched_skills": [up to 8 skills present in both JD and resume],
  "missing_skills": [up to 6 important JD skills absent from resume],
  "strengths": [exactly 3 strings],
  "gaps": [exactly 2 strings],
  "summary": <one sentence overall candidate summary>,
  "file_hash": <string>
}`;

export function useUpload(useBrowserAI: boolean): UseUploadReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitScreening = async (): Promise<void> => {
    if (files.length === 0 || !jobDescription.trim()) {
      setError("Please upload at least one PDF and provide a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("job_description", jobDescription);

      const apiUrl = (import.meta as ImportMeta & { env: { VITE_API_URL: string } }).env.VITE_API_URL;

      if (!useBrowserAI) {
        // Fallback to Backend API
        const response = await axios.post<ScreeningResponse>(`${apiUrl}/api/screen`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResults(response.data.results);
      } else {
        // Free Browser AI via Puter.js
        if (!window.puter) {
          throw new Error("Puter.js not loaded. Please refresh.");
        }

        // 1. Extract text via backend endpoint first
        const extractRes = await axios.post<ExtractResponse>(`${apiUrl}/api/extract`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const extractedItems = extractRes.data.items;
        const newResults: CandidateResult[] = [];

        // 2. Loop over extracted items and screen in browser
        for (const item of extractedItems) {
          const cacheKey = `screener_cache_${item.file_hash}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsedCache = JSON.parse(cached) as CandidateResult;
              newResults.push(parsedCache);
              setResults([...newResults].sort((a, b) => b.match_score - a.match_score));
              continue;
            } catch (e) {
              console.error("Cache invalid", e);
            }
          }

          const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${item.text}\n\nfile_hash: ${item.file_hash}`;
          const prompt = BROWSER_AI_SYSTEM_PROMPT + "\n\n" + userPrompt;

          // Use gpt-4o-mini — best free model supported by Puter.js
          const aiResponse = await window.puter.ai.chat(prompt, { model: "gpt-4o-mini" });

          let content = "";
          if (typeof aiResponse === "string") {
            content = aiResponse;
          } else if (aiResponse?.message?.content) {
            content = typeof aiResponse.message.content === "string"
              ? aiResponse.message.content
              : aiResponse.message.content[0]?.text ?? "";
          } else if (aiResponse?.text) {
            content = aiResponse.text;
          }

          // Strip markdown fences
          const cleaned = content
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

          try {
            const parsed = JSON.parse(cleaned) as Partial<CandidateResult>;

            // Defensive defaults
            const exp = Number(parsed.experience_score ?? 0);
            const skl = Number(parsed.skills_score ?? 0);
            const sem = Number(parsed.semantic_score ?? 0);
            const computedScore = Math.round(exp * 0.30 + skl * 0.45 + sem * 0.25);

            let grade = "D";
            if (computedScore >= 90) grade = "A+";
            else if (computedScore >= 80) grade = "A";
            else if (computedScore >= 70) grade = "B+";
            else if (computedScore >= 60) grade = "B";
            else if (computedScore >= 45) grade = "C";

            const strengths = (parsed.strengths ?? []).slice(0, 3);
            while (strengths.length < 3) strengths.push("N/A");

            const gaps = (parsed.gaps ?? []).slice(0, 2);
            while (gaps.length < 2) gaps.push("N/A");

            const result: CandidateResult = {
              candidate_name: parsed.candidate_name ?? item.filename,
              experience_score: exp,
              skills_score: skl,
              semantic_score: sem,
              match_score: computedScore,
              evaluation_grade: grade,
              score_reasoning: parsed.score_reasoning ?? "",
              experience_years: Number(parsed.experience_years ?? 0),
              matched_skills: parsed.matched_skills ?? [],
              missing_skills: parsed.missing_skills ?? [],
              strengths,
              gaps,
              summary: parsed.summary ?? "",
              file_hash: parsed.file_hash ?? item.file_hash,
            };

            localStorage.setItem(cacheKey, JSON.stringify(result));
            newResults.push(result);
            // Stream update
            setResults([...newResults].sort((a, b) => b.match_score - a.match_score));
          } catch (e) {
            console.error("Failed to parse AI output for", item.filename, cleaned);
          }
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? "Failed to screen resumes.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to screen resumes.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    setFiles,
    jobDescription,
    setJobDescription,
    results,
    loading,
    error,
    submitScreening,
  };
}
