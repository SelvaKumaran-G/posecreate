from typing import Any
from app.models.phone_database import PhoneSpec, get_phone_by_id
from app.services.ai_service import AIService

class CameraAdvisor:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    async def recommend(self, phone_id: str, scene: dict[str, Any], style: str) -> list[dict[str, Any]]:
        try:
            phone_data = get_phone_by_id(phone_id)
            
            # If phone not found, provide generic capabilities
            if not phone_data:
                phone_dict = {
                    "id": "unknown",
                    "brand": "Unknown",
                    "model": "Generic Smartphone",
                    "main_camera": "12MP",
                    "ultrawide_camera": "None",
                    "telephoto_camera": "None",
                    "portrait_mode": True,
                    "cinematic_mode": False,
                    "night_mode": True,
                    "optical_zoom": "1x",
                    "max_supported_zoom": "5x"
                }
            else:
                phone_dict = phone_data.__dict__

            result = await self.ai_service.generate_camera_settings(scene, phone_dict, style)
            return result
        except Exception as e:
            raise Exception(f"Failed to generate camera recommendations: {str(e)}")
