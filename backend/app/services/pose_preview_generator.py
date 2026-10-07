import os
import io
import uuid
import logging
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageOps, ImageStat
from collections import deque

logger = logging.getLogger(__name__)

class PosePreviewGenerator:
    """
    Generates photorealistic preview images for recommended poses.
    Composites real human models (or user-uploaded person) directly into the user's
    uploaded background scene with authentic camera angles, optical bokeh depth-of-field,
    lighting harmonization, and grounded contact shadows.
    """

    def __init__(self):
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.static_dir = os.path.join(self.backend_dir, "static")
        self.previews_dir = os.path.join(self.static_dir, "uploads", "previews")
        self.ai_models_dir = os.path.join(self.static_dir, "ai_models")
        self.reference_dir = os.path.join(self.static_dir, "reference_poses")
        os.makedirs(self.previews_dir, exist_ok=True)
        os.makedirs(self.ai_models_dir, exist_ok=True)
        os.makedirs(self.reference_dir, exist_ok=True)

    def _resolve_local_path(self, url_or_path: Optional[str]) -> Optional[str]:
        if not url_or_path:
            return None

        if os.path.exists(url_or_path):
            return url_or_path

        clean = url_or_path
        for prefix in [
            "http://localhost:8000/static/",
            "http://127.0.0.1:8000/static/",
            "/static/",
            "http://localhost:8000/",
            "http://127.0.0.1:8000/",
        ]:
            clean = clean.replace(prefix, "")

        local_path = os.path.join(self.static_dir, clean.replace("/", os.sep))
        if os.path.exists(local_path):
            return local_path

        filename = os.path.basename(clean)
        for root, _, files in os.walk(self.static_dir):
            if filename in files:
                return os.path.join(root, filename)

        # Fallback to the latest uploaded image
        user_uploads = os.path.join(self.static_dir, "uploads", "mock-user-12345")
        if os.path.exists(user_uploads):
            up_files = [
                os.path.join(user_uploads, f)
                for f in os.listdir(user_uploads)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
            ]
            if up_files:
                up_files.sort(key=os.path.getmtime, reverse=True)
                return up_files[0]

        return None

    def _get_ai_model_for_pose(self, pose_type_id: str) -> Optional[Image.Image]:
        """Loads and returns an AI model image matching the pose type."""
        pid = pose_type_id.lower().replace("-", "_")
        
        mapping = {
            "hero_low_angle": "standing_hero.png",
            "lean_wall": "standing_hero.png",
            "standing_lean": "standing_hero.png",
            "center_symmetry": "standing_hero.png",
            "vehicle_lean": "standing_hero.png",
            "walking_forward": "walking_stride.png",
            "walking_stride": "walking_stride.png",
            "seated_ledge": "seated_pose.png",
            "cross_legged": "seated_pose.png",
            "close_portrait": "close_portrait.png",
            "scenic_horizon": "scenic_lookback.png",
            "over_shoulder": "scenic_lookback.png",
            "editorial_turn": "scenic_lookback.png",
            "hands_pockets": "hands_pocket.png",
            "casual_stand": "hands_pocket.png"
        }
        
        filename = mapping.get(pid, "standing_hero.png")
        model_path = os.path.join(self.ai_models_dir, filename)
        
        if os.path.exists(model_path):
            try:
                return Image.open(model_path).convert("RGBA")
            except Exception as e:
                logger.error(f"Failed to load AI model {model_path}: {e}")

        # Fallback to any model in ai_models_dir
        for f in os.listdir(self.ai_models_dir):
            if f.endswith(".png"):
                try:
                    return Image.open(os.path.join(self.ai_models_dir, f)).convert("RGBA")
                except Exception:
                    pass
        return None

    def _prepare_user_person(self, person_path: str) -> Optional[Image.Image]:
        """Prepares a user-uploaded person image, extracting alpha if needed."""
        try:
            im = Image.open(person_path)
            if im.mode == "RGBA":
                # Check if alpha is non-trivial
                alpha = im.split()[-1]
                min_a, max_a = alpha.getextrema()
                if min_a < 200:
                    return im

            # RGB Image: isolate subject using border flood fill
            rgb = im.convert("RGB")
            w, h = rgb.size
            small = rgb.resize((w // 2, h // 2), Image.Resampling.BOX) if w > 1200 else rgb
            sw, sh = small.size

            # Border flood fill for light/studio backgrounds
            visited = set()
            queue = deque()
            for x in range(sw):
                queue.append((x, 0)); queue.append((x, sh - 1))
                visited.add((x, 0)); visited.add((x, sh - 1))
            for y in range(sh):
                queue.append((0, y)); queue.append((sw - 1, y))
                visited.add((0, y)); visited.add((sw - 1, y))

            mask = Image.new("L", (sw, sh), 255)
            mpix = mask.load()
            spix = small.load()

            is_isolated = False
            while queue:
                x, y = queue.popleft()
                r, g, b = spix[x, y]
                if (r > 195 and g > 195 and b > 195 and max(abs(r - g), abs(g - b), abs(r - b)) < 25) or (r > 235 and g > 235 and b > 235):
                    mpix[x, y] = 0
                    is_isolated = True
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < sw and 0 <= ny < sh and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))

            if is_isolated:
                mask = mask.resize((w, h), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(radius=1.5))
                res = rgb.convert("RGBA")
                res.putalpha(mask)
                return res

            # If background is complex, create soft vignette / portrait oval isolation
            res = rgb.convert("RGBA")
            vignette = Image.new("L", (w, h), 0)
            vdraw = ImageDraw.Draw(vignette)
            vdraw.ellipse([int(w * 0.1), int(h * 0.05), int(w * 0.9), int(h * 0.95)], fill=255)
            vignette = vignette.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.06)))
            res.putalpha(vignette)
            return res

        except Exception as e:
            logger.error(f"Error preparing user person: {e}")
            return None

    def generate_pose_preview(
        self,
        person_image_url: Optional[str],
        location_image_url: Optional[str],
        pose: Dict[str, Any],
        style: str = "portrait",
        session_id: Optional[str] = None
    ) -> Optional[str]:
        session_id = session_id or str(uuid.uuid4())
        pose_type_id = (pose.get("pose_type_id") or pose.get("id") or "pose").lower().replace("-", "_")

        preview_filename = f"{session_id}_{pose_type_id}.jpg"
        preview_filepath = os.path.join(self.previews_dir, preview_filename)
        public_url = f"http://localhost:8000/static/uploads/previews/{preview_filename}"

        if os.path.exists(preview_filepath):
            return public_url

        bg_local = self._resolve_local_path(location_image_url)
        person_local = self._resolve_local_path(person_image_url) if person_image_url else None

        # If no background image found, try user uploads
        if not bg_local or not os.path.exists(bg_local):
            user_uploads = os.path.join(self.static_dir, "uploads", "mock-user-12345")
            if os.path.exists(user_uploads):
                candidates = [
                    os.path.join(user_uploads, f) for f in os.listdir(user_uploads)
                    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
                ]
                if candidates:
                    candidates.sort(key=os.path.getmtime, reverse=True)
                    bg_local = candidates[0]

        if not bg_local or not os.path.exists(bg_local):
            # Fallback to reference pose if no background exists
            ref_path = os.path.join(self.reference_dir, f"{pose_type_id}.jpg")
            if os.path.exists(ref_path):
                return f"http://localhost:8000/static/reference_poses/{pose_type_id}.jpg"
            return f"http://localhost:8000/static/reference_poses/standing_lean.jpg"

        # Determine subject model
        model_img = None
        if person_local and os.path.exists(person_local):
            model_img = self._prepare_user_person(person_local)

        if model_img is None:
            model_img = self._get_ai_model_for_pose(pose_type_id)

        if model_img is None:
            # Fallback reference
            return f"http://localhost:8000/static/reference_poses/standing_lean.jpg"

        try:
            success = self._create_angle_composite(
                bg_path=bg_local,
                model_img=model_img,
                pose_type_id=pose_type_id,
                out_path=preview_filepath
            )
            if success:
                return public_url
        except Exception as e:
            logger.error(f"Failed to create angle composite for {pose_type_id}: {e}")

        return f"http://localhost:8000/static/reference_poses/standing_lean.jpg"

    def _create_angle_composite(
        self,
        bg_path: str,
        model_img: Image.Image,
        pose_type_id: str,
        out_path: str
    ) -> bool:
        """
        Creates a distinctive photo with specific camera angle, optical depth of field,
        and lighting harmonization for each pose type.
        """
        target_w, target_h = 768, 1024
        bg = Image.open(bg_path).convert("RGB")
        bg_w, bg_h = bg.size

        # Angle parameters configuration
        # (scale_h, x_pos, y_bottom, bokeh_radius, shot_perspective)
        p_id = pose_type_id.lower()
        if "hero" in p_id or "low_angle" in p_id:
            scale_h = 0.84
            x_pos = 0.50
            y_bottom = 20
            bokeh_r = 2.0
            shot_persp = "low_angle"
        elif "close" in p_id or "portrait" in p_id:
            scale_h = 0.90
            x_pos = 0.50
            y_bottom = -40
            bokeh_r = 15.0
            shot_persp = "portrait_bokeh"
        elif "scenic" in p_id or "horizon" in p_id:
            scale_h = 0.42
            x_pos = 0.32
            y_bottom = 70
            bokeh_r = 0.5
            shot_persp = "wide_scenic"
        elif "walking" in p_id or "stride" in p_id:
            scale_h = 0.76
            x_pos = 0.46
            y_bottom = 30
            bokeh_r = 3.5
            shot_persp = "walking"
        elif "seated" in p_id or "cross" in p_id:
            scale_h = 0.62
            x_pos = 0.48
            y_bottom = 85
            bokeh_r = 4.0
            shot_persp = "seated"
        elif "shoulder" in p_id or "editorial" in p_id:
            scale_h = 0.78
            x_pos = 0.40
            y_bottom = 35
            bokeh_r = 4.5
            shot_persp = "editorial"
        elif "pocket" in p_id or "casual" in p_id:
            scale_h = 0.74
            x_pos = 0.52
            y_bottom = 25
            bokeh_r = 3.0
            shot_persp = "eye_level"
        else:
            scale_h = 0.76
            x_pos = 0.50
            y_bottom = 25
            bokeh_r = 3.0
            shot_persp = "eye_level"

        # 1. Scale background to canvas with angle-specific perspective crop
        ratio = max(target_w / bg_w, target_h / bg_h)
        new_w, new_h = int(bg_w * ratio), int(bg_h * ratio)
        bg_resized = bg.resize((new_w, new_h), Image.Resampling.LANCZOS)

        if shot_persp == "low_angle":
            # Crop lower portion to show ground and towering trees/canopy above
            crop_y = min(new_h - target_h, int((new_h - target_h) * 0.8))
            crop_x = (new_w - target_w) // 2
        elif shot_persp == "portrait_bokeh":
            # Zoom into mid/upper focal area
            crop_y = int((new_h - target_h) * 0.32)
            crop_x = (new_w - target_w) // 2
        elif shot_persp == "wide_scenic":
            crop_y = (new_h - target_h) // 2
            crop_x = (new_w - target_w) // 2
        elif shot_persp == "seated":
            # Crop slightly lower for ground/bench plane
            crop_y = min(new_h - target_h, int((new_h - target_h) * 0.65))
            crop_x = (new_w - target_w) // 2
        else:
            crop_y = (new_h - target_h) // 2
            crop_x = (new_w - target_w) // 2

        bg_frame = bg_resized.crop((crop_x, crop_y, crop_x + target_w, crop_y + target_h))

        # 2. Apply optical bokeh depth-of-field blur
        if bokeh_r > 0:
            bg_bokeh = bg_frame.filter(ImageFilter.GaussianBlur(radius=bokeh_r))
        else:
            bg_bokeh = bg_frame.copy()

        # 3. Model scaling & positioning
        target_mh = int(target_h * scale_h)
        mw = int(target_mh * (model_img.width / model_img.height))
        model_scaled = model_img.resize((mw, target_mh), Image.Resampling.LANCZOS)

        pos_x = int(target_w * x_pos - (mw // 2))
        pos_y = target_h - target_mh - y_bottom

        # 4. Color & Ambient Light Harmonization
        # Sample ambient tone from background
        bg_stat = ImageStat.Stat(bg_frame)
        avg_r, avg_g, avg_b = bg_stat.mean[:3]
        
        # Subtle ambient color tint on model
        tint_overlay = Image.new("RGBA", (mw, target_mh), (int(avg_r), int(avg_g), int(avg_b), 24))
        # Blend tint softly using alpha composite
        m_r, m_g, m_b, m_a = model_scaled.split()
        tint_r, tint_g, tint_b, _ = tint_overlay.split()
        m_r = Image.blend(m_r, tint_r, 0.08)
        m_g = Image.blend(m_g, tint_g, 0.08)
        m_b = Image.blend(m_b, tint_b, 0.08)
        model_harmonized = Image.merge("RGBA", (m_r, m_g, m_b, m_a))

        # 5. Realistic Ground Contact Shadow (unless close portrait)
        if shot_persp != "portrait_bokeh":
            sw = int(mw * 0.65)
            sh = 28 if shot_persp != "seated" else 42
            shadow = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
            sdraw = ImageDraw.Draw(shadow)
            # Match shadow tone to background luminance
            s_alpha = 150 if avg_g > 80 else 130
            sdraw.ellipse([4, 4, sw - 4, sh - 4], fill=(12, 20, 12, s_alpha))
            shadow = shadow.filter(ImageFilter.GaussianBlur(radius=6))

            shadow_x = pos_x + (mw - sw) // 2
            shadow_y = pos_y + target_mh - (14 if shot_persp != "seated" else 36)
            bg_bokeh.paste(shadow, (shadow_x, shadow_y), shadow)

        # 6. Composite harmonized model onto background
        bg_bokeh.paste(model_harmonized, (pos_x, pos_y), model_harmonized)

        # 7. Post-processing: warm vignette for portrait shots
        if shot_persp == "portrait_bokeh":
            enhancer = ImageEnhance.Color(bg_bokeh)
            bg_bokeh = enhancer.enhance(1.04)

        # Save result
        bg_bokeh.save(out_path, "JPEG", quality=94)
        return True
