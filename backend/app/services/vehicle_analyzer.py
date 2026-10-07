from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass  
class VehicleContext:
    present: bool
    vehicle_type: str  # "motorcycle", "bicycle", "car", "scooter"
    colors: List[str]
    orientation: str  # "facing_left", "facing_right", "front_facing"
    recommended_angles: List[str]
    person_vehicle_compositions: List[Dict[str, Any]]  # 7 different person+bike poses
    vehicle_only_shots: List[Dict[str, Any]]
    vehicle_score: int

class VehicleAnalyzer:
    def analyze(self, vehicle_image_url: Optional[str]) -> Optional[Dict[str, Any]]:
        if not vehicle_image_url:
            return None

        compositions = [
            {
                "name": "Person beside bike (side profile)",
                "description": "Stand next to the motorcycle facing forward, capturing the side profile of both the subject and the bike.",
                "camera_position": "Side view",
                "camera_height": "Chest level",
                "camera_angle": "Straight on",
                "reason": "Shows the full length of the vehicle alongside the person."
            },
            {
                "name": "Person sitting on bike (looking over shoulder)",
                "description": "Sit naturally on the bike and turn your head to look back over your shoulder toward the camera.",
                "camera_position": "Slightly behind",
                "camera_height": "Eye level",
                "camera_angle": "Slightly elevated",
                "reason": "Creates an engaging, dynamic portrait with a narrative feel."
            },
            {
                "name": "Person leaning beside bike (arms crossed)",
                "description": "Lean casually against the side or seat of the bike with arms comfortably crossed.",
                "camera_position": "Front-quarter view",
                "camera_height": "Waist level",
                "camera_angle": "Slight upward angle",
                "reason": "Conveys a confident, relaxed attitude."
            },
            {
                "name": "Person standing in front of bike",
                "description": "Stand centered in front of the bike so it serves as an imposing background element.",
                "camera_position": "Directly in front",
                "camera_height": "Knee level",
                "camera_angle": "Low angle pointing up",
                "reason": "Emphasizes dominance and symmetry in the frame."
            },
            {
                "name": "Person walking toward bike (captured from behind)",
                "description": "Walk naturally toward the parked vehicle while the camera captures you from behind.",
                "camera_position": "Behind the subject",
                "camera_height": "Waist level",
                "camera_angle": "Straight on",
                "reason": "Adds a sense of motion, anticipation, and lifestyle storytelling."
            },
            {
                "name": "Bike-focused shot (person partially visible)",
                "description": "Focus sharply on the bike's details (like the tank or wheel) with the person blurred in the background or edge.",
                "camera_position": "Close-up on bike detail",
                "camera_height": "Varies (match detail height)",
                "camera_angle": "Macro/Detail perspective",
                "reason": "Highlights the vehicle's design while maintaining human context."
            },
            {
                "name": "Person + bike environmental wide shot",
                "description": "Capture the person and the bike within the larger landscape or urban setting.",
                "camera_position": "Far distance",
                "camera_height": "Eye level",
                "camera_angle": "Wide angle straight on",
                "reason": "Establishes the location and creates a cinematic atmosphere."
            }
        ]

        return {
            "present": True,
            "vehicle_type": "motorcycle",
            "colors": ["black", "silver"],
            "orientation": "facing_right",
            "recommended_angles": ["front_quarter", "side_profile", "low_angle_front"],
            "person_vehicle_compositions": compositions,
            "vehicle_only_shots": [],
            "vehicle_score": 85,
            "best_bike_angles": ["front_quarter", "side_profile"],
            "analysis_json": {
                "vehicle_type": "motorcycle",
                "orientation": "facing_right",
                "condition": "excellent"
            }
        }
