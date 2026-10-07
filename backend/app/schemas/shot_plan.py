from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any

class ShotPlanResponse(BaseModel):
    id: str
    session_id: str
    shot_number: int
    shot_name: str
    description: str
    camera_settings: Dict[str, Any]
    pose: str
    photographer_instructions: str
    created_at: datetime
