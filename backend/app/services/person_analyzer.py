from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class OutfitContext:
    items: List[str]
    colors: List[str] 
    style_category: str  # "smart_casual", "formal", "streetwear", "athletic", "bohemian"
    color_harmony: str  # "monochromatic", "complementary", "neutral", "bold"
    contrast_level: str  # "high", "medium", "low"
    photography_compatibility: str  # "excellent", "good", "fair"
    styling_tips: List[str]
    outfit_score: int

class PersonAnalyzer:
    def analyze(self, person_image_url: Optional[str]) -> Optional[Dict[str, Any]]:
        if not person_image_url:
            return None
        
        return {
            "items": ["jacket", "t-shirt", "jeans"],
            "colors": ["blue", "white", "black"],
            "style_category": "smart_casual",
            "color_harmony": "complementary",
            "contrast_level": "medium",
            "photography_compatibility": "excellent",
            "styling_tips": [
                "Open your jacket slightly to add depth and layering to the shot.",
                "Ensure contrasting colors are visible to make the outfit pop against neutral backgrounds.",
                "Use the pockets for natural hand placement to look relaxed."
            ],
            "outfit_score": 85,
            "recommended_angles": ["straight_on", "three_quarter", "low_angle"],
            "analysis_json": {
                "color_harmony": "complementary",
                "contrast_level": "medium",
                "photography_compatibility": "excellent"
            }
        }
