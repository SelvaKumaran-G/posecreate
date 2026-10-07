from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, Optional

class SceneAnalysisResponse(BaseModel):
    id: str
    session_id: str
    scene_type: str
    lighting_description: str
    background_quality: str
    composition_description: str
    best_spot: str
    location_score: int
    lighting_score: int
    composition_score: int
    analysis_json: Dict[str, Any]
    created_at: datetime
