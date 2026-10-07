from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any

class OutfitAnalysisResponse(BaseModel):
    id: str
    session_id: str
    clothing_items: List[str]
    colors: List[str]
    style: str
    recommended_styles: List[str]
    outfit_score: int
    analysis_json: Dict[str, Any]
    created_at: datetime
