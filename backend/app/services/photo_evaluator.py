from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import random

@dataclass
class PhotoEvaluation:
    score: int  # 0-100
    grade: str  # "Excellent", "Good", "Fair", "Needs Work"
    composition_score: int
    lighting_score: int
    pose_score: int
    background_score: int
    overall_score: int
    good_points: List[str]
    improvements: List[str]
    retake_instructions: List[str]
    detailed_feedback: Dict[str, Any]

class PhotoEvaluator:
    def evaluate(self, evaluated_photo_url: str, original_session: Dict[str, Any], original_pose: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        composition_score = random.randint(70, 90)
        lighting_score = random.randint(65, 95)
        pose_score = random.randint(70, 88)
        background_score = random.randint(75, 92)
        
        overall_score = int((composition_score + lighting_score + pose_score + background_score) / 4)
        
        if overall_score >= 90:
            grade = "Excellent"
        elif overall_score >= 80:
            grade = "Good"
        elif overall_score >= 70:
            grade = "Fair"
        else:
            grade = "Needs Work"
            
        eval_data = PhotoEvaluation(
            score=overall_score,
            grade=grade,
            composition_score=composition_score,
            lighting_score=lighting_score,
            pose_score=pose_score,
            background_score=background_score,
            overall_score=overall_score,
            good_points=["Good lighting", "Subject is clearly visible", "Background is not distracting"],
            improvements=["Slightly adjust angle", "Check focus"],
            retake_instructions=["Lower the camera by approximately 20cm", "Step back one pace"],
            detailed_feedback={"next_improvement_priority": "Adjust composition to follow rule of thirds more closely."}
        )
        
        # return as dict
        return {
            "score": eval_data.score,
            "grade": eval_data.grade,
            "composition_score": eval_data.composition_score,
            "lighting_score": eval_data.lighting_score,
            "pose_score": eval_data.pose_score,
            "background_score": eval_data.background_score,
            "overall_score": eval_data.overall_score,
            "good_points": eval_data.good_points,
            "improvements": eval_data.improvements,
            "retake_instructions": eval_data.retake_instructions,
            "detailed_feedback": eval_data.detailed_feedback,
            "next_improvement_priority": eval_data.detailed_feedback["next_improvement_priority"]
        }
