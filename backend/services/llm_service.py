import json
import os
import time
from collections.abc import Generator
from pathlib import Path

from fastapi import HTTPException
from dotenv import load_dotenv
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted
import google.generativeai as genai

from models.schemas import CandidateResult

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)


def _get_model_candidates() -> list[str]:
    configured = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    values = [item.strip() for item in configured.split(",") if item.strip()]
    if not values:
        values = ["gemini-2.0-flash"]
    fallback = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]
    for item in fallback:
        if item not in values:
            values.append(item)
    return values


def _build_model(system_instruction: str, model_name: str) -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction,
    )


SCREEN_SYSTEM_PROMPT = """\
You are an expert AI recruiter performing a multi-dimensional semantic resume evaluation.

Your task is to analyze the resume against the job description and return a structured JSON assessment.

## Scoring Dimensions

1. **experience_score** (0-100)
   - How well does the candidate's years of experience and seniority level match what the JD requires?
   - Consider: total years, relevance of those years, leadership/IC level fit.

2. **skills_score** (0-100)
   - Semantic match of technical and domain skills.
   - Award partial credit for adjacent or transferable skills.
   - Penalise for hard-required skills that are completely absent.

3. **semantic_score** (0-100)
   - Holistic contextual fit: industry, company type, project scale, work style, impact language.
   - Does the resume "feel like" someone who would thrive in this role?

4. **match_score** (0-100)
   - Weighted composite: experience_score × 0.30 + skills_score × 0.45 + semantic_score × 0.25
   - Round to nearest integer.

5. **evaluation_grade**
   - A+: match_score ≥ 90
   - A : 80–89
   - B+: 70–79
   - B : 60–69
   - C : 45–59
   - D : < 45

6. **experience_years** — extract the candidate's total years of clearly stated relevant professional experience (integer).

7. **matched_skills** — list of skills/technologies that appear in BOTH the JD and the resume (up to 8).

8. **missing_skills** — important skills/technologies mentioned in the JD that are NOT found in the resume (up to 6).

## Output Format
Return ONLY a raw JSON object (no markdown, no code fences) with EXACTLY these keys:
{
  "candidate_name": <string>,
  "experience_score": <int 0-100>,
  "skills_score": <int 0-100>,
  "semantic_score": <int 0-100>,
  "match_score": <int 0-100>,
  "evaluation_grade": <"A+" | "A" | "B+" | "B" | "C" | "D">,
  "score_reasoning": <one concise sentence explaining the composite score>,
  "experience_years": <int>,
  "matched_skills": [<string>, ...],
  "missing_skills": [<string>, ...],
  "strengths": [<string>, <string>, <string>],
  "gaps": [<string>, <string>],
  "summary": <one sentence overall candidate summary>,
  "file_hash": <string>
}
"""


def screen_resume(resume_text: str, job_description: str, file_hash: str) -> CandidateResult:
    user_prompt = (
        f"Job Description:\n{job_description}\n\n"
        f"Resume:\n{resume_text}\n\n"
        f"file_hash: {file_hash}"
    )

    backoff_seconds = [2, 4, 8]
    model_candidates = _get_model_candidates()
    for attempt in range(3):
        try:
            for model_name in model_candidates:
                try:
                    model = _build_model(system_instruction=SCREEN_SYSTEM_PROMPT, model_name=model_name)
                    response = model.generate_content(
                        user_prompt,
                        generation_config=genai.GenerationConfig(
                            temperature=0.1,
                            response_mime_type="application/json",
                        ),
                    )
                    content = response.text
                    if not content:
                        raise HTTPException(status_code=500, detail="Empty response from LLM.")

                    # Strip markdown code fences if present (defensive)
                    cleaned = (
                        content.strip()
                        .removeprefix("```json")
                        .removeprefix("```")
                        .removesuffix("```")
                        .strip()
                    )
                    parsed = json.loads(cleaned)

                    # Defensive: ensure array fields exist
                    parsed.setdefault("matched_skills", [])
                    parsed.setdefault("missing_skills", [])
                    parsed.setdefault("strengths", ["N/A", "N/A", "N/A"])
                    parsed.setdefault("gaps", ["N/A", "N/A"])

                    # Clamp strengths/gaps to exactly 3/2
                    while len(parsed["strengths"]) < 3:
                        parsed["strengths"].append("N/A")
                    while len(parsed["gaps"]) < 2:
                        parsed["gaps"].append("N/A")
                    parsed["strengths"] = parsed["strengths"][:3]
                    parsed["gaps"] = parsed["gaps"][:2]

                    # Enforce match_score formula if LLM returned wrong value
                    exp = int(parsed.get("experience_score", 0))
                    skl = int(parsed.get("skills_score", 0))
                    sem = int(parsed.get("semantic_score", 0))
                    computed = round(exp * 0.30 + skl * 0.45 + sem * 0.25)
                    parsed["match_score"] = computed

                    # Enforce grade
                    score = parsed["match_score"]
                    if score >= 90:
                        parsed["evaluation_grade"] = "A+"
                    elif score >= 80:
                        parsed["evaluation_grade"] = "A"
                    elif score >= 70:
                        parsed["evaluation_grade"] = "B+"
                    elif score >= 60:
                        parsed["evaluation_grade"] = "B"
                    elif score >= 45:
                        parsed["evaluation_grade"] = "C"
                    else:
                        parsed["evaluation_grade"] = "D"

                    return CandidateResult(**parsed)

                except GoogleAPIError as exc:
                    message = str(exc)
                    if "not found" in message.lower() or "not supported" in message.lower():
                        continue
                    raise
            raise HTTPException(status_code=500, detail="No compatible Gemini model found for screening.")
        except ResourceExhausted:
            if attempt == 2:
                raise HTTPException(status_code=429, detail="Gemini rate limit exceeded.")
            time.sleep(backoff_seconds[attempt])
        except HTTPException:
            raise
        except GoogleAPIError as exc:
            raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}") from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to screen resume: {exc}") from exc

    raise HTTPException(status_code=500, detail="Failed to screen resume after retries.")


def stream_chat(messages: list[dict], resume_context: list[dict]) -> Generator[str, None, None]:
    system_message = (
        "You are an expert recruitment assistant. The following candidates have been screened "
        "with multi-dimensional scoring (experience, skills, semantic fit):\n"
        f"{json.dumps(resume_context, indent=2)}\n"
        "Answer recruiter questions concisely. When asked to compare, reference the sub-scores "
        "(experience_score, skills_score, semantic_score) and matched/missing skills."
    )

    gemini_messages: list[dict[str, object]] = []
    for message in messages:
        role = "model" if message.get("role") == "assistant" else "user"
        content = str(message.get("content", ""))
        gemini_messages.append(
            {
                "role": role,
                "parts": [{"text": content}],
            }
        )

    model_candidates = _get_model_candidates()
    for model_name in model_candidates:
        try:
            model = _build_model(system_instruction=system_message, model_name=model_name)
            stream = model.generate_content(gemini_messages, stream=True)
            for chunk in stream:
                text = chunk.text or ""
                if text:
                    yield f"data: {text}\n\n"
            yield "data: [DONE]\n\n"
            return
        except ResourceExhausted as exc:
            raise HTTPException(status_code=429, detail=f"Gemini rate limit exceeded: {exc}") from exc
        except GoogleAPIError as exc:
            message = str(exc)
            if "not found" in message.lower() or "not supported" in message.lower():
                continue
            raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}") from exc

    raise HTTPException(status_code=500, detail="No compatible Gemini model found for chat streaming.")
