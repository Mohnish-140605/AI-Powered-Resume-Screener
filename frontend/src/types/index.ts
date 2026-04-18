export interface CandidateResult {
  candidate_name: string;
  experience_score: number;
  skills_score: number;
  semantic_score: number;
  match_score: number;
  evaluation_grade: string;
  score_reasoning: string;
  experience_years: number;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
  file_hash: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
