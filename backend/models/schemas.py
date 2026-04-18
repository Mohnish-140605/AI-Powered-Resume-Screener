from pydantic import BaseModel, Field


class CandidateResult(BaseModel):
    candidate_name: str
    # Sub-scores (each out of 100)
    experience_score: int   # years & seniority fit
    skills_score: int        # technical / hard skills match
    semantic_score: int      # semantic / contextual fit
    # Weighted composite
    match_score: int         # final 0-100 overall score
    evaluation_grade: str    # A+, A, B+, B, C, D
    score_reasoning: str     # one-sentence explanation of the composite score
    experience_years: int    # extracted years of relevant experience
    matched_skills: list[str] = Field(default_factory=list)   # skills present in both JD and resume
    missing_skills: list[str] = Field(default_factory=list)   # skills in JD but absent from resume
    strengths: list[str] = Field(min_length=3, max_length=3)
    gaps: list[str] = Field(min_length=2, max_length=2)
    summary: str
    file_hash: str


class ScreeningResponse(BaseModel):
    results: list[CandidateResult]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    resume_context: list[CandidateResult]


class ExtractedResume(BaseModel):
    filename: str
    text: str
    file_hash: str


class ExtractResponse(BaseModel):
    items: list[ExtractedResume]
