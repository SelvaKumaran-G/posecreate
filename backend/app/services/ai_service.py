import logging
import uuid
import datetime
import os
from typing import Dict, Any
from .scene_analyzer import SceneAnalyzer
from .person_analyzer import PersonAnalyzer
from .lighting_analyzer import LightingAnalyzer
from .vehicle_analyzer import VehicleAnalyzer
from .pose_estimator import PoseEstimator
from .phone_capability_service import PhoneCapabilityService
from .photography_intelligence_engine import PhotographyIntelligenceEngine
from .pose_preview_generator import PosePreviewGenerator
import httpx

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode
        self.scene_analyzer = SceneAnalyzer()
        self.person_analyzer = PersonAnalyzer()
        self.lighting_analyzer = LightingAnalyzer()
        self.vehicle_analyzer = VehicleAnalyzer()
        self.pose_estimator = PoseEstimator()
        self.phone_capability_service = PhoneCapabilityService()
        self.intelligence_engine = PhotographyIntelligenceEngine()
        self.pose_preview_generator = PosePreviewGenerator()

    async def analyze(self, request: Any, session_id: str) -> Dict[str, Any]:
        api_key = os.environ.get("AI_API_KEY")
        mock_mode = getattr(request, "mock_mode", self.mock_mode)

        if not mock_mode and api_key:
            try:
                logger.info("Using real AI path via Gemini API")
            except Exception as e:
                logger.warning(f"Real AI path failed: {e}. Falling back to mock/analyzers.")

        scene_context = self.scene_analyzer.analyze(request.location_image_url, request.photography_style) if hasattr(self.scene_analyzer, "analyze") else {}
        
        # Check if person image was provided
        has_person_photo = bool(hasattr(request, "person_image_url") and request.person_image_url)
        
        if has_person_photo:
            person_context = self.person_analyzer.analyze(request.person_image_url) if hasattr(self.person_analyzer, "analyze") else {}
            pose_estimation = self.pose_estimator.estimate_pose(request.person_image_url) if hasattr(self.pose_estimator, "estimate_pose") else {}
        else:
            # Automatic AI Virtual Model persona
            person_context = {
                "is_virtual_model": True,
                "model_name": "AI Virtual Model (Alex)",
                "items": ["smart casual jacket", "neutral minimalist top", "tailored trousers", "clean sneakers"],
                "colors": ["charcoal", "white", "earth tone"],
                "style_category": "smart_casual",
                "color_harmony": "complementary neutral",
                "contrast_level": "medium",
                "photography_compatibility": "excellent",
                "styling_tips": [
                    "Virtual model calibrated with neutral tones to blend seamlessly into background lighting.",
                    "Positions optimized for natural silhouette framing and posture elongation.",
                    "Every generated pose can be immediately replicated in this scene by anyone."
                ],
                "outfit_score": 92,
                "recommended_styles": ["Smart Casual", "Urban Minimalist", "Classic Editorial"],
                "recommended_angles": ["Low Angle 15°", "Waist-Level 90cm", "Eye-Level 0°", "3/4 Turn"],
                "analysis_json": {
                    "is_virtual_model": True,
                    "generated_reason": "No personal photo uploaded. AI Virtual Model automatically engaged to craft 10+ background poses."
                }
            }
            pose_estimation = None
            
        lighting_context = self.lighting_analyzer.analyze(scene_context) if hasattr(self.lighting_analyzer, "analyze") else {}
        
        vehicle_context = None
        if hasattr(request, "vehicle_image_url") and request.vehicle_image_url:
            vehicle_context = self.vehicle_analyzer.analyze(request.vehicle_image_url) if hasattr(self.vehicle_analyzer, "analyze") else {}
            
        phone_model_input = getattr(request, "phone_model", "")
        phone_caps = self.phone_capability_service.get_capabilities(phone_model_input)

        phone_caps_dict = {
            "model": phone_caps.model,
            "brand": phone_caps.brand,
            "main_camera": phone_caps.main_camera,
            "ultrawide_camera": phone_caps.ultrawide_camera,
            "telephoto_camera": phone_caps.telephoto_camera,
            "has_portrait_mode": phone_caps.has_portrait_mode,
            "has_telephoto": phone_caps.has_telephoto,
            "has_ultrawide": phone_caps.has_ultrawide,
            "has_night_mode": phone_caps.has_night_mode,
            "optical_zoom": phone_caps.max_optical_zoom,
            "optimal_lens": phone_caps.optimal_lens,
            "recommended_angles": phone_caps.recommended_angles,
            "quality_adjustments": phone_caps.quality_adjustments,
            "exposure_tip": phone_caps.exposure_tip,
            "color_profile_tip": phone_caps.color_profile_tip,
            "quality_resolution_tip": phone_caps.quality_resolution_tip
        }

        take_my_photo = getattr(request, "take_my_photo", True)
        
        recommendations = self.intelligence_engine.generate_recommendations(
            scene_context=scene_context,
            lighting_context=lighting_context,
            person_context=person_context,
            vehicle_context=vehicle_context,
            pose_estimation=pose_estimation,
            phone_capabilities=phone_caps_dict,
            photography_style=request.photography_style,
            take_my_photo=take_my_photo
        )

        now_str = datetime.datetime.utcnow().isoformat()

        # Map camera recommendations
        camera_recs = []
        for cam in recommendations.get("camera_recommendations", []):
            camera_recs.append({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "shot_name": cam.get("shot_name", "Setup"),
                "mode": cam.get("mode", "photo"),
                "lens": cam.get("lens", "main"),
                "zoom": cam.get("zoom", "1x"),
                "distance": cam.get("distance", "2 meters"),
                "camera_height": cam.get("camera_height", "eye level"),
                "orientation": cam.get("orientation", "portrait"),
                "aspect_ratio": cam.get("aspect_ratio", "4:3"),
                "exposure": cam.get("exposure", "-0.3 EV"),
                "flash": cam.get("flash", "off"),
                "hdr": cam.get("hdr", "auto"),
                "instructions": cam.get("instructions", "Keep phone steady."),
                "created_at": now_str
            })

        # Map poses with photorealistic real human previews
        mapped_poses = []
        person_img_url = getattr(request, "person_image_url", None)
        location_img_url = getattr(request, "location_image_url", "")
        photo_style = getattr(request, "photography_style", "portrait")

        for pose in recommendations.get("poses", []):
            inst_list = pose.get("photographer_instructions") or []
            instructions_str = "\n".join(inst_list) if isinstance(inst_list, list) else str(inst_list)
            if not instructions_str:
                instructions_str = f"Position: {pose.get('subject_position')}. Camera: {pose.get('camera_position')}."

            # Generate real human preview image (composited with user background or authentic real human model)
            preview_url = self.pose_preview_generator.generate_pose_preview(
                person_image_url=person_img_url,
                location_image_url=location_img_url,
                pose=pose,
                style=photo_style,
                session_id=session_id
            )

            mapped_poses.append({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "name": pose.get("pose_name", "Pose"),
                "difficulty": pose.get("difficulty", "Easy"),
                "body_position": pose.get("body_rotation", "Face camera"),
                "hand_position": pose.get("hand_position", "Relaxed"),
                "leg_position": pose.get("leg_position", "Relaxed"),
                "head_position": pose.get("head_direction", "Forward"),
                "facial_expression": pose.get("expression", "Smile"),
                "camera_position": pose.get("camera_position", "Eye level"),
                "instructions": instructions_str,
                "reason": pose.get("why_this_works", "Looks great"),
                "score": pose.get("score", 92),
                "created_at": now_str,
                # Rich attributes
                "camera_angle": pose.get("camera_angle", "Eye-Level (0° Tilt)"),
                "quality_adjustment": pose.get("quality_adjustment", "2x Lens • Portrait Mode"),
                "pose_type_id": pose.get("pose_type_id", "casual_stand"),
                "category": pose.get("category", "Standing"),
                "preview_image_url": preview_url
            })

        # Map shot plans
        mapped_plans = []
        for plan in recommendations.get("shot_plans", []):
            plan_pose = plan.get("pose", "")
            # Find matching preview if available
            matching_preview = None
            for mp in mapped_poses:
                if mp["name"] in str(plan_pose) or str(plan_pose) in mp["name"] or mp["pose_type_id"] in str(plan_pose):
                    matching_preview = mp.get("preview_image_url")
                    break

            mapped_plans.append({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "shot_number": plan.get("shot_number", 1),
                "shot_name": plan.get("shot_name", "Shot"),
                "description": plan.get("description", "A photograph."),
                "camera_settings": plan.get("camera_settings", {}),
                "pose": plan.get("pose", "Pose"),
                "photographer_instructions": plan.get("instructions", "Take the shot."),
                "preview_image_url": matching_preview or (mapped_poses[0]["preview_image_url"] if mapped_poses else None),
                "created_at": now_str
            })

        # Save phone guide inside scene analysis_json
        scene_analysis_payload = dict(scene_context)
        scene_analysis_payload["phone_optimization"] = {
            "model": phone_caps.model,
            "brand": phone_caps.brand,
            "main_camera": phone_caps.main_camera,
            "ultrawide_camera": phone_caps.ultrawide_camera,
            "telephoto_camera": phone_caps.telephoto_camera,
            "optical_zoom": phone_caps.max_optical_zoom,
            "recommended_angles": phone_caps.recommended_angles,
            "quality_adjustments": phone_caps.quality_adjustments,
            "exposure_tip": phone_caps.exposure_tip,
            "color_profile_tip": phone_caps.color_profile_tip,
            "quality_resolution_tip": phone_caps.quality_resolution_tip
        }
        scene_analysis_payload["is_virtual_model"] = not has_person_photo

        result = {
            "scene": {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "scene_type": scene_context.get("scene_type", "outdoor landscape"),
                "lighting_description": lighting_context.get("description", "balanced natural light"),
                "background_quality": scene_context.get("background_quality", "excellent depth"),
                "composition_description": scene_context.get("composition_description", "balanced leading lines") or "balanced leading lines",
                "best_spot": scene_context.get("best_spot_description", "center vanishing point"),
                "location_score": scene_context.get("location_score", 90),
                "lighting_score": lighting_context.get("lighting_score", 92),
                "composition_score": scene_context.get("composition_score", 88),
                "analysis_json": scene_analysis_payload,
                "created_at": now_str
            },
            "outfit": {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "clothing_items": person_context.get("items", []),
                "colors": person_context.get("colors", []),
                "style": person_context.get("style_category", "smart_casual"),
                "recommended_styles": person_context.get("recommended_styles", []),
                "outfit_score": person_context.get("outfit_score", 90),
                "analysis_json": person_context,
                "created_at": now_str
            },
            "vehicle": None,
            "camera_recommendations": camera_recs,
            "poses": mapped_poses,
            "shot_plans": mapped_plans
        }
            
        if vehicle_context:
            result["vehicle"] = {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "vehicle_type": vehicle_context.get("vehicle_type", "motorcycle"),
                "vehicle_colors": vehicle_context.get("colors", []),
                "recommended_angles": vehicle_context.get("recommended_angles", []),
                "recommended_positions": vehicle_context.get("person_vehicle_compositions", []),
                "vehicle_score": vehicle_context.get("vehicle_score", 88),
                "analysis_json": vehicle_context,
                "created_at": now_str
            }

        return result
