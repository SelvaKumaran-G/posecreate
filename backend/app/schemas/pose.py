from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PoseRecommendationResponse(BaseModel):
    id: str
    session_id: str
    name: str
    difficulty: str
    body_position: str
    hand_position: str
    leg_position: str
    head_position: str
    facial_expression: str
    camera_position: str
    instructions: str
    reason: str
    score: int
    created_at: datetime
    preview_image_url: Optional[str] = None
    camera_angle: Optional[str] = None
    quality_adjustment: Optional[str] = None
    pose_type_id: Optional[str] = None
    category: Optional[str] = None
