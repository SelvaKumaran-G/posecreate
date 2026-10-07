from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(tags=["health"])

@router.get("/health")
async def check_health():
    settings = get_settings()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "mock_mode": settings.MOCK_AI
    }
