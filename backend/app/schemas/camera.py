from pydantic import BaseModel
from datetime import datetime

class CameraRecommendationResponse(BaseModel):
    id: str
    session_id: str
    shot_name: str
    mode: str
    lens: str
    zoom: str
    distance: str
    camera_height: str
    orientation: str
    aspect_ratio: str
    exposure: str
    flash: str
    hdr: str
    instructions: str
    created_at: datetime
