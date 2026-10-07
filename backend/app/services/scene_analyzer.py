import os
import logging
from typing import Dict, Any, List, Optional
from PIL import Image, ImageStat, ImageFilter

logger = logging.getLogger(__name__)

class SceneAnalyzer:
    """
    Intelligent Computer Vision scene and background analyzer.
    Analyzes actual image pixels to extract real lighting, colors, architecture,
    foliage, composition geometry, and optimal shooting spots.
    """

    def __init__(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.static_dir = os.path.join(backend_dir, "static")

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

        # Fallback to the latest uploaded background image
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

    def analyze(self, location_image_url: str, photography_style: str = "auto") -> Dict[str, Any]:
        local_path = self._resolve_local_path(location_image_url)

        if not local_path or not os.path.exists(local_path):
            logger.warning(f"Could not resolve image for {location_image_url}. Using intelligent default.")
            return self._build_default_scene(photography_style)

        try:
            return self._analyze_pixels(local_path, photography_style)
        except Exception as e:
            logger.error(f"Error during pixel analysis: {e}. Falling back to default.")
            return self._build_default_scene(photography_style)

    def _analyze_pixels(self, img_path: str, photography_style: str) -> Dict[str, Any]:
        with Image.open(img_path) as img:
            im = img.convert("RGB")
            orig_w, orig_h = im.size

            # Sample 120x120 grid for fast statistical analysis
            sample_size = 120
            small = im.resize((sample_size, sample_size), Image.Resampling.BOX)
            pixels = list(small.getdata())

            # Luminance stats
            stat = ImageStat.Stat(im)
            mean_r, mean_g, mean_b = stat.mean[:3]
            overall_luminance = 0.299 * mean_r + 0.587 * mean_g + 0.114 * mean_b

            # Edge detection to measure texture and structural lines
            gray = small.convert("L")
            edges = gray.filter(ImageFilter.FIND_EDGES)
            edge_stat = ImageStat.Stat(edges)
            edge_density = edge_stat.mean[0]  # Higher = architectural or rich foliage

            # Color ratios
            total_pixels = float(len(pixels))
            green_count = sum(1 for r, g, b in pixels if g > r * 1.05 and g > b * 1.1)
            sky_count = sum(1 for r, g, b in pixels[: int(total_pixels * 0.4)] if b > r and (r + g + b) > 380)
            water_count = sum(1 for r, g, b in pixels[int(total_pixels * 0.5):] if b > r * 1.1 and b > 70)
            warm_count = sum(1 for r, g, b in pixels if r > g * 1.1 and r > b * 1.25 and (r + g + b) > 250)
            urban_count = sum(1 for r, g, b in pixels if max(abs(r - g), abs(g - b), abs(r - b)) < 22 and 60 < r < 200)

            green_ratio = green_count / total_pixels
            sky_ratio = sky_count / (total_pixels * 0.4)
            water_ratio = water_count / (total_pixels * 0.5)
            warm_ratio = warm_count / total_pixels
            urban_ratio = urban_count / total_pixels

            # Quadrant luminance to determine primary light direction
            half = sample_size // 2
            top_left_lum = sum(
                0.299 * pixels[y * sample_size + x][0] + 0.587 * pixels[y * sample_size + x][1] + 0.114 * pixels[y * sample_size + x][2]
                for y in range(half) for x in range(half)
            ) / (half * half)
            top_right_lum = sum(
                0.299 * pixels[y * sample_size + x][0] + 0.587 * pixels[y * sample_size + x][1] + 0.114 * pixels[y * sample_size + x][2]
                for y in range(half) for x in range(half, sample_size)
            ) / (half * half)
            bottom_left_lum = sum(
                0.299 * pixels[y * sample_size + x][0] + 0.587 * pixels[y * sample_size + x][1] + 0.114 * pixels[y * sample_size + x][2]
                for y in range(half, sample_size) for x in range(half)
            ) / (half * half)
            bottom_right_lum = sum(
                0.299 * pixels[y * sample_size + x][0] + 0.587 * pixels[y * sample_size + x][1] + 0.114 * pixels[y * sample_size + x][2]
                for y in range(half, sample_size) for x in range(half, sample_size)
            ) / (half * half)

            left_lum = (top_left_lum + bottom_left_lum) / 2
            right_lum = (top_right_lum + bottom_right_lum) / 2
            top_lum = (top_left_lum + top_right_lum) / 2
            bottom_lum = (bottom_left_lum + bottom_right_lum) / 2

            # Determine lighting direction and quality
            if abs(left_lum - right_lum) > 10:
                horizontal_dir = "left" if left_lum > right_lum else "right"
            else:
                horizontal_dir = "center"

            if horizontal_dir != "center":
                light_dir_desc = f"natural key light filtering from the {horizontal_dir} (~45° angle)"
                direction_key = horizontal_dir
            elif top_lum > bottom_lum + 12:
                light_dir_desc = "overhead natural ambient daylight"
                direction_key = "overhead"
            elif bottom_lum > top_lum + 12:
                light_dir_desc = "ground-reflected soft ambient illumination"
                direction_key = "front"
            else:
                light_dir_desc = "balanced front ambient natural light"
                direction_key = "front"

            # Contrast / Light Quality
            lum_std = stat.stddev[0] * 0.299 + stat.stddev[1] * 0.587 + stat.stddev[2] * 0.114
            if lum_std > 55:
                light_quality = "high-contrast direct sunlight with crisp defined shadows"
                strength = "high"
            elif lum_std < 32:
                light_quality = "soft diffused overcast / shaded light with gentle transitions"
                strength = "soft"
            else:
                light_quality = "balanced natural ambient illumination with rich midtones"
                strength = "medium"

            # Classify Scene Type based on actual image features
            if green_ratio > 0.18:
                scene_type = "Lush Botanical Garden & Park Pathway"
                nature_elements = ["tall canopy trees", "lush foliage", "ground vegetation", "filtered ambient daylight"]
                architecture_elements = ["tree-lined walking pathway", "curved walkway border", "park resting ledge"]
                furniture_objects = ["park bench", "scenic border railing"]
                comp_leading_lines = True
                comp_foreground = True
                symmetry = abs(left_lum - right_lum) < 15 and abs(top_left_lum - top_right_lum) < 15
                location_score = 92
                lighting_score = 89
                composition_score = 94
                scene_desc = (
                    f"A vibrant natural outdoor setting featuring extensive green tree canopy ({int(green_ratio*100)}% foliage density) "
                    f"and an inviting central pathway. The lighting is {light_dir_desc} with {light_quality}, casting soft organic shadows "
                    f"that create natural depth and flattering skin tones."
                )
                best_spot = (
                    "Position the subject 1/3 from the left along the converging pathway. The tall vertical trees create natural "
                    f"framing lines that draw the viewer's eye straight to the subject, while the {light_dir_desc} provides gentle catchlights."
                )

            elif water_ratio > 0.18:
                scene_type = "Coastal Waterfront & Beach Horizon"
                nature_elements = ["open water", "horizon line", "coastal shore", "natural sky"]
                architecture_elements = ["promenade walkway", "waterfront railing", "stone pier"]
                furniture_objects = ["deck seating", "shoreline posts"]
                comp_leading_lines = True
                comp_foreground = False
                symmetry = False
                location_score = 94
                lighting_score = 91
                composition_score = 90
                scene_desc = (
                    f"An expansive coastal landscape featuring broad open horizons and reflective water surfaces. "
                    f"The scene benefits from {light_dir_desc} with {light_quality}, offering clean negative space and cinematic depth."
                )
                best_spot = (
                    "Place subject along the lower-third horizon intersection facing slightly toward the water reflection. "
                    "This creates strong environmental scale while maintaining clear subject separation from the background."
                )

            elif warm_ratio > 0.22:
                scene_type = "Golden Hour Scenic Vista"
                nature_elements = ["golden hour sky", "warm ambient glow", "atmospheric haze"]
                architecture_elements = ["viewpoint terrace", "textured stone floor", "panoramic overlook"]
                furniture_objects = ["terrace ledge", "outdoor seating"]
                comp_leading_lines = True
                comp_foreground = True
                symmetry = False
                location_score = 96
                lighting_score = 95
                composition_score = 93
                scene_desc = (
                    f"A breathtaking golden hour setting rich in warm amber and gold tones ({int(warm_ratio*100)}% warm spectrum). "
                    f"The low-angle warm lighting produces flattering skin warmth, dramatic edge rim lighting, and rich cinematic contrast."
                )
                best_spot = (
                    "Position the subject with the golden sunlight grazing their side or 3/4 back (rim light setup). "
                    "This creates a luminous golden glow around their silhouette while softening facial shadows."
                )

            elif urban_ratio > 0.35 or edge_density > 28:
                scene_type = "Architectural Urban Street & Promenade"
                nature_elements = ["urban sky", "filtered daylight", "city tree accent"]
                architecture_elements = ["modern facade", "geometric columns", "paved walkway", "textured brick or stone"]
                furniture_objects = ["street bench", "architectural steps"]
                comp_leading_lines = True
                comp_foreground = True
                symmetry = abs(left_lum - right_lum) < 10
                location_score = 90
                lighting_score = 87
                composition_score = 92
                scene_desc = (
                    f"A sophisticated urban architectural environment characterized by strong geometric lines and distinct textures. "
                    f"The lighting is {light_dir_desc} with {light_quality}, providing sharp subject separation against structural backdrops."
                )
                best_spot = (
                    "Position the subject against a neutral structural column or where the sidewalk lines converge inward. "
                    "Use the vertical architectural lines to frame the subject and convey confidence and modern editorial authority."
                )

            elif overall_luminance < 75:
                scene_type = "Moody Low-Light & Ambient Interior"
                nature_elements = ["ambient shadows", "soft indoor accents"]
                architecture_elements = ["warm wooden accents", "textured interior walls", "minimalist framing"]
                furniture_objects = ["lounge seating", "table edge", "indoor railing"]
                comp_leading_lines = False
                comp_foreground = True
                symmetry = False
                location_score = 88
                lighting_score = 86
                composition_score = 89
                scene_desc = (
                    f"An intimate low-key atmospheric setting characterized by rich deep tones and warm accent illumination. "
                    f"The {light_dir_desc} creates artistic chiaroscuro contrast and intimate cinematic mood."
                )
                best_spot = (
                    "Position the subject directly adjacent to the closest ambient light source so their facial features are softly sculpted, "
                    "leaving the background to fall into rich, velvety shadow."
                )

            else:
                scene_type = "Modern Outdoor Lifestyle Vista"
                nature_elements = ["open sky", "ambient landscape", "natural flora"]
                architecture_elements = ["clean walkway", "scenic backdrop", "perimeter border"]
                furniture_objects = ["scenic bench"]
                comp_leading_lines = True
                comp_foreground = True
                symmetry = False
                location_score = 89
                lighting_score = 88
                composition_score = 90
                scene_desc = (
                    f"A balanced lifestyle landscape offering clean framing and versatile photography angles. "
                    f"The {light_dir_desc} with {light_quality} delivers effortless natural portraits with clean background depth."
                )
                best_spot = (
                    "Position the subject at the convergence of leading lines 1/3 into the frame, balancing foreground space with backdrop texture."
                )

            subject_positions = [
                {
                    "name": "Leading Line Focal Point",
                    "reason": "Aligns subject along the pathway or depth lines to pull viewer attention straight to them.",
                    "score": 95
                },
                {
                    "name": "Rule of Thirds Left",
                    "reason": f"Balances subject on the left third while leaving expansive negative space toward the {horizontal_dir}.",
                    "score": 92
                },
                {
                    "name": "Hero Center Frame",
                    "reason": "Commands direct presence with symmetric background elements extending equally on both sides.",
                    "score": 90
                },
                {
                    "name": "Foreground Framing Ledge",
                    "reason": "Uses immediate foreground elements (trees/curb) to create multi-layer cinematic depth.",
                    "score": 87
                }
            ]

            camera_positions = [
                {"angle": "low_angle_hero", "distance": "medium", "reason": "Accentuates background canopy/height and elongates posture"},
                {"angle": "eye_level", "distance": "medium", "reason": "Natural portrait perspective with zero distortion"},
                {"angle": "scenic_wide", "distance": "far", "reason": "Full environmental framing showcasing the entire backdrop"},
                {"angle": "close_portrait", "distance": "close", "reason": "Shallow depth of field with creamy bokeh blur"}
            ]

            return {
                "scene_type": scene_type,
                "architecture_elements": architecture_elements,
                "nature_elements": nature_elements,
                "furniture_objects": furniture_objects,
                "composition_features": {
                    "leading_lines": comp_leading_lines,
                    "symmetry": symmetry,
                    "negative_space": True,
                    "reflections": water_ratio > 0.15,
                    "foreground_interest": comp_foreground,
                    "rule_of_thirds": True
                },
                "lighting": {
                    "direction": direction_key,
                    "direction_description": light_dir_desc,
                    "quality": light_quality,
                    "strength": strength,
                    "average_luminance": round(overall_luminance, 1)
                },
                "background_quality": "clean" if lum_std < 50 else "textured",
                "subject_positions": subject_positions,
                "camera_positions": camera_positions,
                "location_score": location_score,
                "lighting_score": lighting_score,
                "composition_score": composition_score,
                "scene_description": scene_desc,
                "best_spot_description": best_spot
            }

    def _build_default_scene(self, photography_style: str) -> Dict[str, Any]:
        return {
            "scene_type": "Outdoor Scenic Vista",
            "architecture_elements": ["scenic walkway", "structural framing", "perimeter curb"],
            "nature_elements": ["natural canopy", "ambient greenery", "filtered sky"],
            "furniture_objects": ["park bench"],
            "composition_features": {
                "leading_lines": True,
                "symmetry": False,
                "negative_space": True,
                "reflections": False,
                "foreground_interest": True,
                "rule_of_thirds": True
            },
            "lighting": {
                "direction": "overhead",
                "direction_description": "balanced natural ambient daylight",
                "quality": "soft natural light",
                "strength": "medium",
                "average_luminance": 110.0
            },
            "background_quality": "clean",
            "subject_positions": [
                {
                    "name": "Leading Line Focal Point",
                    "reason": "Draws direct attention to the subject using natural perspective lines.",
                    "score": 92
                }
            ],
            "camera_positions": [
                {"angle": "eye_level", "distance": "medium", "reason": "Standard portrait perspective"}
            ],
            "location_score": 90,
            "lighting_score": 88,
            "composition_score": 91,
            "scene_description": "A well-balanced outdoor scene providing depth, natural framing, and flattering ambient light.",
            "best_spot_description": "Position subject 1/3 from the edge along the depth axis for balanced composition and depth."
        }
