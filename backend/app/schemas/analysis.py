from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AnalysisCreateRequest(BaseModel):
    location_image_url: str
    person_image_url: Optional[str] = None
    vehicle_image_url: Optional[str] = None
    phone_model: str
    photography_style: str
    take_my_photo: bool

class AnalysisSessionResponse(BaseModel):
    id: str
    user_id: str
    location_image_url: str
    person_image_url: Optional[str]
    vehicle_image_url: Optional[str]
    phone_model: str
    photography_style: str
    take_my_photo: bool
    status: str
    overall_score: Optional[int]
    created_at: datetime
    updated_at: datetime

from .scene import SceneAnalysisResponse
from .outfit import OutfitAnalysisResponse
from .vehicle import VehicleAnalysisResponse
from .camera import CameraRecommendationResponse
from .pose import PoseRecommendationResponse
from .shot_plan import ShotPlanResponse

class FullAnalysisResponse(BaseModel):
    session: AnalysisSessionResponse
    scene: Optional[SceneAnalysisResponse]
    outfit: Optional[OutfitAnalysisResponse]
    vehicle: Optional[VehicleAnalysisResponse]
    camera_recommendations: List[CameraRecommendationResponse]
    poses: List[PoseRecommendationResponse]
    shot_plans: List[ShotPlanResponse]

class EvaluatePhotoRequest(BaseModel):
    photo_url: str
    session_id: Optional[str] = None
    session_context: Optional[Dict[str, Any]] = None
    original_pose: Optional[Dict[str, Any]] = None

class PhotoEvaluationResponse(BaseModel):
    score: int
    grade: str
    composition_score: int
    lighting_score: int  
    pose_score: int
    background_score: int
    overall_score: int
    good_points: List[str]
    improvements: List[str]
    retake_instructions: List[str]
    next_improvement_priority: str
    detailed_feedback: Dict[str, Any]
