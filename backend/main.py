from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import HTTPException
from pathlib import Path

from routers.chat import router as chat_router
from routers.upload import router as upload_router

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

app = FastAPI(title="AI Resume Screener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="")
app.include_router(chat_router, prefix="")


@app.on_event("startup")
async def startup_event() -> None:
    load_dotenv(dotenv_path=ENV_PATH, override=False)


@app.get("/")
async def health_check() -> dict[str, str]:
    try:
        return {"status": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Health check failed: {exc}") from exc
