from typing import Any
from app.services.ai_service import AIService

class PoseGenerator:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    async def generate(self, scene: dict[str, Any], outfit: dict[str, Any], vehicle: dict[str, Any] | None, style: str, take_my_photo: bool) -> list[dict[str, Any]]:
        try:
            result = await self.ai_service.generate_poses(
                scene=scene, 
                outfit=outfit, 
                vehicle=vehicle, 
                style=style, 
                take_my_photo=take_my_photo
            )
            return result
        except Exception as e:
            raise Exception(f"Failed to generate poses: {str(e)}")
