from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class BodyLandmark:
    name: str  # "left_shoulder", "right_hip", etc.
    x: float  # normalized 0.0-1.0
    y: float  # normalized 0.0-1.0
    confidence: float  # 0.0-1.0

@dataclass
class PoseEstimation:
    landmarks: List[BodyLandmark]
    body_orientation: str  # "facing_camera", "side_profile", "back_to_camera"
    current_pose_description: str
    confidence: float
    provider: str  # "mediapipe", "openpose", "mock"

class PoseEstimatorProvider(ABC):
    @abstractmethod
    def estimate(self, image_url: str) -> Optional[PoseEstimation]:
        pass

class NullPoseEstimator(PoseEstimatorProvider):
    """Placeholder — returns None until a real provider is configured."""
    def estimate(self, image_url: str) -> Optional[PoseEstimation]:
        return None

class PoseEstimator:
    """Main entry point. Uses the configured provider."""
    def __init__(self, provider: Optional[PoseEstimatorProvider] = None):
        self.provider = provider or NullPoseEstimator()
    
    def estimate_pose(self, image_url: Optional[str]) -> Optional[Dict[str, Any]]:
        if not image_url:
            return None
        result = self.provider.estimate(image_url)
        if not result:
            return None
        return {
            "landmarks": [{"name": lm.name, "x": lm.x, "y": lm.y, "confidence": lm.confidence} for lm in result.landmarks],
            "body_orientation": result.body_orientation,
            "current_pose_description": result.current_pose_description,
            "confidence": result.confidence,
            "provider": result.provider
        }
    
    @staticmethod
    def get_landmark_names() -> List[str]:
        return [
            "nose", "left_eye", "right_eye", "left_ear", "right_ear",
            "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
            "left_wrist", "right_wrist", "left_hip", "right_hip",
            "left_knee", "right_knee", "left_ankle", "right_ankle"
        ]
