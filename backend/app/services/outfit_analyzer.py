from typing import Any
from app.services.ai_service import AIService

class OutfitAnalyzer:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    async def analyze(self, image_url: str) -> dict[str, Any]:
        try:
            result = await self.ai_service.analyze_outfit(image_url)
            # Only returns clothing items, privacy safe
            return result
        except Exception as e:
            raise Exception(f"Failed to analyze outfit: {str(e)}")
