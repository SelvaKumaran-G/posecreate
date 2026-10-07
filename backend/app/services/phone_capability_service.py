from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import re
from app.models.phone_database import get_phone_by_id, get_all_phones, PhoneSpec

@dataclass
class CameraCapability:
    phone_id: str
    brand: str  
    model: str
    main_camera: str
    ultrawide_camera: Optional[str]
    telephoto_camera: Optional[str]
    has_ultrawide: bool
    has_telephoto: bool
    has_portrait_mode: bool
    has_cinematic_mode: bool
    has_night_mode: bool
    max_optical_zoom: str  # "1x", "2x", "3x", "5x"
    max_digital_zoom: str
    available_lenses: List[str]  # ["Main 1x", "Ultra Wide 0.5x", "Telephoto 3x"]
    available_modes: List[str]  # ["Photo", "Portrait", "Video", "Night", "Cinematic"]
    recommended_portrait_zoom: str  # optimal zoom for portraits on this phone
    optimal_lens: str
    exposure_tip: str
    color_profile_tip: str
    quality_resolution_tip: str
    recommended_angles: List[Dict[str, Any]] = field(default_factory=list)
    quality_adjustments: List[Dict[str, Any]] = field(default_factory=list)

class PhoneCapabilityService:
    def _normalize_model_name(self, model: str) -> str:
        if not model:
            return ""
        return re.sub(r'[^a-z0-9]', '_', model.lower().strip()).strip('_')

    def find_phone_spec(self, phone_model: str) -> Optional[PhoneSpec]:
        if not phone_model or phone_model.lower() in ("default", "none", ""):
            return None
        
        # 1. Direct ID lookup
        spec = get_phone_by_id(phone_model)
        if spec:
            return spec

        normalized = self._normalize_model_name(phone_model)
        spec = get_phone_by_id(normalized)
        if spec:
            return spec

        # 2. Fuzzy match across all phones
        all_p = get_all_phones()
        for p in all_p:
            if p.id == normalized or normalized in p.id or p.id in normalized:
                return p
            p_model_norm = self._normalize_model_name(p.model)
            if p_model_norm in normalized or normalized in p_model_norm:
                return p
            p_full_norm = self._normalize_model_name(f"{p.brand} {p.model}")
            if p_full_norm in normalized or normalized in p_full_norm:
                return p

        return None

    def get_capabilities(self, phone_model: str) -> CameraCapability:
        spec = self.find_phone_spec(phone_model)
        
        if spec:
            has_uw = bool(spec.ultrawide_camera)
            has_tele = bool(spec.telephoto_camera)
            lenses = [f"Main 1x ({spec.main_camera})"]
            if has_uw:
                lenses.insert(0, f"Ultra Wide 0.5x ({spec.ultrawide_camera})")
            if has_tele:
                lenses.append(f"Telephoto {spec.optical_zoom or '3x'} ({spec.telephoto_camera})")

            modes = ["Photo"]
            if spec.portrait_mode:
                modes.append("Portrait")
            if spec.night_mode:
                modes.append("Night Mode")
            if spec.cinematic_mode:
                modes.append("Cinematic")
            modes.append("Pro / Manual")

            # Brand specific tips
            brand_lower = spec.brand.lower()
            if "apple" in brand_lower:
                exposure_tip = "Tap subject and drag exposure down to -0.3 EV to avoid blown sky highlights."
                color_profile = "Use 'Rich Contrast' or 'Warm' Photographic Style for cinematic skin tones."
                res_tip = f"Shoot in 48MP ProRAW / HEIF Max for 4x resolution clarity in {spec.model}."
                portrait_zoom = f"{spec.optical_zoom or '2x'} Optical (prevents wide-angle face distortion)"
                optimal_lens = f"{spec.optical_zoom or '2x'} Telephoto" if has_tele else "2x In-Sensor Crop"
            elif "samsung" in brand_lower:
                exposure_tip = "Touch-and-hold AE/AF lock on subject; adjust slider -0.5 EV to balance dynamic range."
                color_profile = "Select 'Natural' color tone in Camera Settings for true-to-life skin tones."
                res_tip = f"Activate {spec.main_camera} High Resolution Mode or Expert RAW for ultra-fine detail."
                portrait_zoom = f"{spec.optical_zoom or '3x'} Portrait Optical Zoom"
                optimal_lens = f"{spec.optical_zoom or '3x'} Periscope / Telephoto"
            elif "google" in brand_lower:
                exposure_tip = "Dual exposure sliders: boost shadow slider slightly, reduce main exposure slider by 1 notch."
                color_profile = "Real Tone automatically optimizes skin tones; use Cinematic Pan for motion shots."
                res_tip = f"Enable 50MP Pro mode in Google Camera settings for uncompressed optical detail."
                portrait_zoom = f"{spec.optical_zoom or '2x'} Super Res / Optical Zoom"
                optimal_lens = f"{spec.optical_zoom or '2x'} Telephoto" if has_tele else "2x Super Res Zoom"
            else:
                exposure_tip = "Set exposure slider slightly downward (-0.3 EV) for rich, saturated colors."
                color_profile = "Use Hasselblad / Natural Color Mode for creamy transitions."
                res_tip = f"Enable {spec.main_camera} Ultra HD / RAW toggle in camera top menu."
                portrait_zoom = f"{spec.optical_zoom or '3x'} Optical Portrait"
                optimal_lens = f"{spec.optical_zoom or '3x'} Telephoto" if has_tele else "2x Lossless Zoom"

            angles = [
                {
                    "name": "Low Angle (15°-20° Upward Tilt)",
                    "angle_degrees": "15° - 20° Upward",
                    "height": "Knee / Lower-Torso (40-60 cm from ground)",
                    "how_to_hold": "Flip phone upside-down so the camera lens is closest to the ground, tilt screen back ~15°",
                    "why_it_works": f"Elongates legs and posture, highlights architectural lines, and uses {spec.model}'s wide sensor to capture grand background scenery.",
                    "best_for": "Full-body standing, walking, and dynamic hero poses"
                },
                {
                    "name": "Eye-Level (0° Direct)",
                    "angle_degrees": "0° Perpendicular",
                    "height": "Eye Level (150-170 cm)",
                    "how_to_hold": "Hold phone vertical and flat, perpendicular to the floor with grid line aligned to horizon",
                    "why_it_works": "Produces natural, intimate perspective without optical distortion; ideal for genuine eye-contact portraits.",
                    "best_for": "Close-up portraits, casual seated poses, over-the-shoulder looks"
                },
                {
                    "name": "Waist-Level (90 cm Height)",
                    "angle_degrees": "0° - 5° Slight Upward Tilt",
                    "height": "Waist / Navel Level (85-95 cm)",
                    "how_to_hold": "Hold phone comfortably at belt level with two hands, elbows braced against your ribs",
                    "why_it_works": f"Balances head-to-toe proportions evenly, preventing the 'large head' effect of high angles while utilizing {spec.main_camera} center sharpness.",
                    "best_for": "3/4 medium fashion shots, leaning against props/walls"
                },
                {
                    "name": "High Angle (25°-30° Downward Tilt)",
                    "angle_degrees": "25° - 30° Downward",
                    "height": "Above Head Height (190-210 cm)",
                    "how_to_hold": "Raise phone above eye line and angle camera downward toward subject",
                    "why_it_works": "Sharpens jawline and facial contours, frames subject elegantly against textured floors, stairs, or seated ledges.",
                    "best_for": "Sitting poses, stairs, resting on edge, artistic overhead shots"
                },
                {
                    "name": "45° Profile Diagonal Angle",
                    "angle_degrees": "45° Oblique Perspective",
                    "height": "Chest Level (120-130 cm)",
                    "how_to_hold": "Step 45 degrees to the side of the subject's gaze direction",
                    "why_it_works": "Highlights facial dimension, rim lighting, and pulls leading lines from the background into the shot.",
                    "best_for": "Side profiles, looking toward light source, candid walking"
                }
            ]

            quality_adjustments = [
                {
                    "setting_name": "Recommended Lens & Zoom",
                    "recommended_value": optimal_lens,
                    "phone_action": f"Select {spec.optical_zoom or '2x'} in camera app. Avoid pinch-to-zoom past {spec.optical_zoom or '2x'} to ensure pure optical glass quality.",
                    "benefit": "Eliminates wide-angle facial distortion and compresses background aesthetically."
                },
                {
                    "setting_name": "Portrait Depth / Aperture Control",
                    "recommended_value": "f/2.0 – f/2.8",
                    "phone_action": "Switch to Portrait Mode, tap Depth/f icon and set to f/2.2 or f/2.8.",
                    "benefit": "Creates smooth optical bokeh without fake edge cutouts around hair or clothing."
                },
                {
                    "setting_name": "Exposure Compensation",
                    "recommended_value": "-0.3 EV to -0.7 EV",
                    "phone_action": exposure_tip,
                    "benefit": "Protects sky highlights from blowing out while keeping skin tones richly saturated."
                },
                {
                    "setting_name": "Image Resolution & Sensor Quality",
                    "recommended_value": f"High-Res ({spec.main_camera})",
                    "phone_action": res_tip,
                    "benefit": "Preserves maximum micro-contrast and textile textures in the clothing and background."
                },
                {
                    "setting_name": "Composition Grid & Level",
                    "recommended_value": "3x3 Grid + Level ON",
                    "phone_action": "Enable 'Grid' and 'Level' in Camera Settings. Place subject on the left or right third intersection.",
                    "benefit": "Guarantees mathematically balanced rule-of-thirds composition and zero tilted horizons."
                },
                {
                    "setting_name": "Color Profile & Tone",
                    "recommended_value": spec.brand + " Color Tuning",
                    "phone_action": color_profile,
                    "benefit": "Enhances skin warmth and scene vibrancy without requiring external editing apps."
                }
            ]

            return CameraCapability(
                phone_id=spec.id,
                brand=spec.brand,
                model=spec.model,
                main_camera=spec.main_camera,
                ultrawide_camera=spec.ultrawide_camera,
                telephoto_camera=spec.telephoto_camera,
                has_ultrawide=has_uw,
                has_telephoto=has_tele,
                has_portrait_mode=spec.portrait_mode,
                has_cinematic_mode=spec.cinematic_mode,
                has_night_mode=spec.night_mode,
                max_optical_zoom=spec.optical_zoom or "2x",
                max_digital_zoom=spec.max_supported_zoom or "10x",
                available_lenses=lenses,
                available_modes=modes,
                recommended_portrait_zoom=portrait_zoom,
                optimal_lens=optimal_lens,
                exposure_tip=exposure_tip,
                color_profile_tip=color_profile,
                quality_resolution_tip=res_tip,
                recommended_angles=angles,
                quality_adjustments=quality_adjustments
            )
            
        # Generic smartphone fallback
        angles = [
            {
                "name": "Low Angle (15°-20° Upward Tilt)",
                "angle_degrees": "15° - 20° Upward",
                "height": "Knee / Lower-Torso (40-60 cm)",
                "how_to_hold": "Flip phone upside-down so the camera lens is close to the ground, tilt screen back ~15°",
                "why_it_works": "Elongates body silhouette and makes background look grand and expansive.",
                "best_for": "Full-body standing and walking poses"
            },
            {
                "name": "Eye-Level (0° Direct)",
                "angle_degrees": "0° Perpendicular",
                "height": "Eye Level (150-170 cm)",
                "how_to_hold": "Hold phone vertical and flat, perpendicular to the floor",
                "why_it_works": "Natural, intimate perspective with zero distortion.",
                "best_for": "Close-up portraits and casual seated poses"
            },
            {
                "name": "Waist-Level (90 cm Height)",
                "angle_degrees": "0° - 5° Slight Upward Tilt",
                "height": "Waist Level (85-95 cm)",
                "how_to_hold": "Hold phone at belt level, elbows braced against your body",
                "why_it_works": "Even proportion balance between upper and lower body.",
                "best_for": "3/4 medium shots and leaning poses"
            },
            {
                "name": "High Angle (25°-30° Downward Tilt)",
                "angle_degrees": "25° - 30° Downward",
                "height": "Above Head (190-210 cm)",
                "how_to_hold": "Hold phone high tilted down towards subject",
                "why_it_works": "Flattering jawline definition and creative framing against ground texture.",
                "best_for": "Sitting poses and stairs"
            }
        ]

        quality_adjustments = [
            {
                "setting_name": "Recommended Lens & Zoom",
                "recommended_value": "2x Optical / Clean Crop",
                "phone_action": "Tap 2x on camera preview instead of 1x to avoid wide-angle facial distortion.",
                "benefit": "Flattens facial perspective and separates subject from background."
            },
            {
                "setting_name": "Portrait Depth / Aperture Control",
                "recommended_value": "f/2.2 – f/2.8",
                "phone_action": "Enable Portrait Mode and set blur depth to medium (f/2.4).",
                "benefit": "Creates realistic bokeh blur without artificial edge cutouts."
            },
            {
                "setting_name": "Exposure Compensation",
                "recommended_value": "-0.3 EV",
                "phone_action": "Tap subject on screen and drag brightness slider slightly down.",
                "benefit": "Avoids blown sky highlights and enriches skin tones."
            },
            {
                "setting_name": "Composition Grid & Level",
                "recommended_value": "3x3 Grid ON",
                "phone_action": "Turn on Grid lines in Camera settings. Align subject eyes with the upper horizontal line.",
                "benefit": "Delivers professional rule-of-thirds composition."
            }
        ]

        return CameraCapability(
            phone_id="generic_smartphone",
            brand="Universal",
            model="Smartphone Pro Camera",
            main_camera="High-Res Sensor",
            ultrawide_camera="0.5x Ultra Wide",
            telephoto_camera="2x Optical / Telephoto",
            has_ultrawide=True,
            has_telephoto=True,
            has_portrait_mode=True,
            has_cinematic_mode=True,
            has_night_mode=True,
            max_optical_zoom="2x",
            max_digital_zoom="10x",
            available_lenses=["Main 1x", "Ultra Wide 0.5x", "Telephoto 2x"],
            available_modes=["Photo", "Portrait", "Night Mode", "Pro / Manual"],
            recommended_portrait_zoom="2x (Move 2 meters away)",
            optimal_lens="2x Optical Crop",
            exposure_tip="Tap subject on screen and adjust exposure slider -0.3 EV.",
            color_profile_tip="Use standard/natural color profile with HDR enabled.",
            quality_resolution_tip="Enable high resolution / HDR setting in camera menu.",
            recommended_angles=angles,
            quality_adjustments=quality_adjustments
        )

    def filter_camera_settings(self, settings: Dict, capabilities: CameraCapability) -> Dict:
        filtered = dict(settings)
        if "Cinematic" in filtered.get("mode", "") and not capabilities.has_cinematic_mode:
            filtered["mode"] = "Video"
        if "Portrait" in filtered.get("mode", "") and not capabilities.has_portrait_mode:
            filtered["mode"] = "Photo"
        if "0.5x" in filtered.get("lens", "") and not capabilities.has_ultrawide:
            filtered["lens"] = "Main 1x"
        if "3x" in filtered.get("lens", "") or "5x" in filtered.get("lens", ""):
            if not capabilities.has_telephoto:
                filtered["lens"] = "Main 1x"
        return filtered

    def get_recommended_modes(self, style: str, capabilities: CameraCapability) -> List[str]:
        modes = ["Photo"]
        style_lower = style.lower()
        if "portrait" in style_lower and capabilities.has_portrait_mode:
            modes.append("Portrait")
        if "video" in style_lower or "cinematic" in style_lower:
            modes.append("Video")
            if capabilities.has_cinematic_mode:
                modes.append("Cinematic")
        if "night" in style_lower or "dark" in style_lower:
            if capabilities.has_night_mode:
                modes.append("Night")
        return modes

    def get_portrait_recommendation(self, capabilities: CameraCapability) -> Dict[str, str]:
        return {
            "mode": "Portrait" if capabilities.has_portrait_mode else "Photo",
            "zoom": capabilities.recommended_portrait_zoom,
            "tip": f"Use {capabilities.optimal_lens} in Portrait mode with f/2.4 aperture for realistic depth separation."
        }
