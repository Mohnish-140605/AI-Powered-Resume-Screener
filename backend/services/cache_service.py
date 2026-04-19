import hashlib
import os
import asyncio
from models.schemas import CandidateResult
from motor.motor_asyncio import AsyncIOMotorClient

_cache: dict[str, CandidateResult] = {}
MONGO_URI = os.getenv("MONGODB_URI")
db_client = None
db_collection = None

if MONGO_URI:
    db_client = AsyncIOMotorClient(MONGO_URI)
    # Use database named "resume_screener", collection "candidates"
    db_collection = db_client.resume_screener.candidates

def compute_hash(file_bytes: bytes, job_description: str = "") -> str:
    combined = file_bytes + job_description.encode("utf-8")
    return hashlib.md5(combined).hexdigest()

async def get_cached(file_hash: str) -> CandidateResult | None:
    if db_collection is not None:
        try:
            doc = await db_collection.find_one({"file_hash": file_hash})
            if doc:
                # Remove MongoDB _id before validating with Pydantic
                doc.pop("_id", None)
                return CandidateResult(**doc)
        except Exception as e:
            print(f"MongoDB read error: {e}")
            pass
    # Fallback to in-memory
    return _cache.get(file_hash)

async def set_cached(file_hash: str, result: CandidateResult) -> None:
    if db_collection is not None:
        try:
            # Upsert into MongoDB
            doc = result.dict()
            doc["file_hash"] = file_hash
            await db_collection.update_one(
                {"file_hash": file_hash}, 
                {"$set": doc}, 
                upsert=True
            )
        except Exception as e:
            print(f"MongoDB write error: {e}")
    # Always keep in-memory sync as well
    _cache[file_hash] = result
