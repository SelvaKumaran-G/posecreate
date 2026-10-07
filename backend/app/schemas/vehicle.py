from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any

class VehicleAnalysisResponse(BaseModel):
    id: str
    session_id: str
    vehicle_type: str
    vehicle_colors: List[str]
    recommended_angles: List[str]
    recommended_positions: List[str]
    vehicle_score: int
    analysis_json: Dict[str, Any]
    created_at: datetime
