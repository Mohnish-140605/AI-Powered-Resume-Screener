import hashlib

from models.schemas import CandidateResult

_cache: dict[str, CandidateResult] = {}


def compute_hash(file_bytes: bytes) -> str:
    return hashlib.md5(file_bytes).hexdigest()


def get_cached(file_hash: str) -> CandidateResult | None:
    return _cache.get(file_hash)


def set_cached(file_hash: str, result: CandidateResult) -> None:
    _cache[file_hash] = result
