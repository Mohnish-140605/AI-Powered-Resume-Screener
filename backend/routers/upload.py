from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import CandidateResult, ScreeningResponse
from services.cache_service import compute_hash, get_cached, set_cached
from services.llm_service import screen_resume
from services.pdf_parser import extract_text

router = APIRouter()


@router.post("/api/screen", response_model=ScreeningResponse)
async def screen_candidates(
    files: list[UploadFile] = File(...),
    job_description: str = Form(...),
) -> ScreeningResponse:
    try:
        if not files:
            raise HTTPException(status_code=400, detail="At least one PDF file is required.")
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required.")

        for file in files:
            if file.content_type != "application/pdf":
                raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF file.")

        results: list[CandidateResult] = []
        for file in files:
            file_bytes = await file.read()
            if not file_bytes:
                raise HTTPException(status_code=400, detail=f"{file.filename} is empty.")

            file_hash = compute_hash(file_bytes, job_description)
            cached_result = await get_cached(file_hash)
            if cached_result:
                results.append(cached_result)
                continue

            try:
                resume_text = extract_text(file_bytes)
                screened = screen_resume(
                    resume_text=resume_text,
                    job_description=job_description,
                    file_hash=file_hash,
                )
                await set_cached(file_hash, screened)
                results.append(screened)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=f"{file.filename}: {exc}") from exc

        sorted_results = sorted(results, key=lambda item: item.match_score, reverse=True)
        return ScreeningResponse(results=sorted_results)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to process screening request: {exc}") from exc


@router.post("/api/extract", response_model=dict)
async def extract_candidates(
    files: list[UploadFile] = File(...),
) -> dict:
    from models.schemas import ExtractedResume
    try:
        if not files:
            raise HTTPException(status_code=400, detail="At least one PDF file is required.")

        for file in files:
            if file.content_type != "application/pdf":
                raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF file.")

        results: list[dict] = []
        for file in files:
            file_bytes = await file.read()
            if not file_bytes:
                raise HTTPException(status_code=400, detail=f"{file.filename} is empty.")

            file_hash = compute_hash(file_bytes)
            try:
                resume_text = extract_text(file_bytes)
                results.append({
                    "filename": file.filename,
                    "text": resume_text,
                    "file_hash": file_hash
                })
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=f"{file.filename}: {exc}") from exc

        return {"items": results}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to extract resume text: {exc}") from exc

