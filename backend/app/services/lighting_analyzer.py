from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class LightingContext:
    direction: str  # "left", "right", "front", "back", "overhead", "diffused"
    quality: str  # "soft", "hard", "mixed"
    strength: str  # "bright", "medium", "dim"
    lighting_type: str  # "golden_hour", "midday", "overcast", "shade", "artificial"
    shadows: str  # "long", "short", "minimal", "harsh"
    subject_facing: str  # which direction the subject should face
    photographer_side: str  # which side the photographer should be on
    face_lighting: str  # "lit_left", "lit_right", "front_lit", "rim_lit"
    flash_needed: bool
    hdr_recommended: bool
    exposure_adjustment: str  # "-0.3 EV", "0 EV", "+0.3 EV"
    lighting_warnings: List[str]
    recommendations: List[str]

class LightingAnalyzer:
    def analyze(self, scene_context: Dict[str, Any]) -> Dict[str, Any]:
        lighting_direction = scene_context.get("lighting", {}).get("direction", "diffused")
        quality = scene_context.get("lighting", {}).get("quality", "soft")
        strength = scene_context.get("lighting", {}).get("strength", "medium")

        if lighting_direction == "back":
            subject_facing = "away from camera"
            photographer_side = "facing the light source"
            face_lighting = "rim_lit"
            hdr = True
            exposure = "+0.3 EV"
            flash = True
        else:
            subject_facing = f"towards the {lighting_direction} light source"
            photographer_side = "with the light source behind or to the side"
            face_lighting = "front_lit" if lighting_direction == "front" else f"lit_{lighting_direction}"
            hdr = False
            exposure = "0 EV"
            flash = False

        recommendations = [
            f"Position the subject facing {subject_facing} for best illumination.",
            f"Ensure the {face_lighting} side of the face is clearly visible.",
            "Watch out for harsh shadows on the face."
        ]
        
        take_my_photo_steps = [
            f"Turn your face slightly towards the {lighting_direction} light.",
            "Wait for the photographer to find the optimal exposure.",
            "Keep your chin slightly down to avoid harsh neck shadows."
        ]

        return {
            "direction": lighting_direction,
            "quality": quality,
            "strength": strength,
            "lighting_type": "midday",
            "shadows": "minimal" if quality == "soft" else "harsh",
            "subject_facing": subject_facing,
            "photographer_side": photographer_side,
            "face_lighting": face_lighting,
            "flash_needed": flash,
            "hdr_recommended": hdr,
            "exposure_adjustment": exposure,
            "lighting_warnings": ["Avoid direct overhead midday sun if possible."] if lighting_direction == "overhead" else [],
            "recommendations": recommendations,
            "lighting_score": 85,
            "take_my_photo_lighting_steps": take_my_photo_steps
        }
