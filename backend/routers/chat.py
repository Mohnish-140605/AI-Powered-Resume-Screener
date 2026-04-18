from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest
from services.llm_service import stream_chat

router = APIRouter()


@router.post("/api/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    try:
        message_dicts = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        context_dicts = [item.model_dump() for item in request.resume_context]
        generator = stream_chat(messages=message_dicts, resume_context=context_dicts)
        return StreamingResponse(generator, media_type="text/event-stream")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to stream chat: {exc}") from exc
