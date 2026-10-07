from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
import logging
import os

from app.api.routes import health, phones, upload, analysis

logger = logging.getLogger("uvicorn")

app = FastAPI(title="PoseAI API")

# Serve uploaded static files locally
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(phones.router, prefix="/api/phones")
app.include_router(upload.router, prefix="/api/upload")
app.include_router(analysis.router, prefix="/api/analysis")

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting PoseAI API with MOCK_AI={settings.MOCK_AI}")
    logger.info(f"Allowed Origins: {settings.allowed_origins_list}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
