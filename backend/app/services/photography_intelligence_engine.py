import random
import uuid
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

class PhotographyIntelligenceEngine:
    def generate_recommendations(
        self,
        scene_context: Dict[str, Any],
        lighting_context: Dict[str, Any], 
        person_context: Optional[Dict[str, Any]],
        vehicle_context: Optional[Dict[str, Any]],
        pose_estimation: Optional[Dict[str, Any]],
        phone_capabilities: Dict[str, Any],
        photography_style: str,
        take_my_photo: bool
    ) -> Dict[str, Any]:
        
        poses = []
        shot_plans = []
        camera_recommendations = []
        
        phone_model = phone_capabilities.get("model", "Smartphone Pro Camera")
        phone_brand = phone_capabilities.get("brand", "Universal")
        optical_lens = phone_capabilities.get("optimal_lens", "2x Optical Lens")
        portrait_mode = phone_capabilities.get("has_portrait_mode", True)
        
        elements = scene_context.get("architecture_elements", ["wall", "stone steps", "pathway", "entryway", "column"])
        if not elements:
            elements = ["architectural background", "curved pathway", "textured wall"]
        
        light_dir = lighting_context.get("primary_light_direction", "45-degree front-left")
        subject_facing = lighting_context.get("subject_facing", "facing toward primary light source")
        
        # Comprehensive Master Pose Catalog
        pose_catalog = [
            {
                "pose_type_id": "lean_wall",
                "name": "The Architectural Casual Lean",
                "category": "Standing",
                "difficulty": "Easy",
                "subject_position": f"Rest upper back casually against the nearest {random.choice(elements)}",
                "body_rotation": "Upper torso 30° toward camera, back resting against surface, rear hip carrying 75% body weight",
                "hand_position": "One hand slipped halfway into pocket (thumb out), other hand resting loose at side",
                "leg_position": "Front leg crossed gently over rear leg at ankle, toe pointed forward to elongate silhouette",
                "head_direction": "Turned 15° toward light with relaxed jawline",
                "expression": "Natural subtle smile, confident and at ease",
                "camera_angle": "Waist-Level (90 cm) Straight On",
                "camera_height": "Waist level (85-95 cm)",
                "camera_distance": "2.8 meters",
                "quality_adjustment": f"Portrait Mode f/2.2 • {optical_lens} • -0.3 EV • 3x3 Grid (Rule of Thirds)",
                "why_this_works": "Leaning against the background creates depth and casual authority while the cross-legged stance visually elongates the legs.",
                "photographer_instructions": [
                    "STEP 1: Crouch slightly to waist height (around your belt buckle) to balance upper and lower body proportions.",
                    f"STEP 2: Align the subject on the right-third vertical grid line so the {elements[0]} leads into the scene.",
                    "STEP 3: Tap subject's face on screen to focus, then slide brightness down slightly for rich contrast.",
                    "STEP 4: Capture 3-4 consecutive frames as subject relaxes their shoulders."
                ],
                "score": 96
            },
            {
                "pose_type_id": "walking_forward",
                "name": "Candid Mid-Stride Street Walk",
                "category": "Walking",
                "difficulty": "Medium",
                "subject_position": "Walking at normal pace along the center depth axis toward the camera",
                "body_rotation": "Forward walking motion with shoulders relaxed, spine tall",
                "hand_position": "Natural relaxed arm swing, fingers loosely cupped (not clenched)",
                "leg_position": "Front heel making contact with the ground, back knee flexing naturally mid-stride",
                "head_direction": "Looking slightly past camera toward horizon (avoids stiff direct eye lock)",
                "expression": "Pleasantly engaged candid expression or soft smile",
                "camera_angle": "Low Angle (15° Upward Tilt)",
                "camera_height": "Knee height (50 cm from ground)",
                "camera_distance": "3.5 meters",
                "quality_adjustment": f"1/250s Fast Shutter • {optical_lens} • Continuous AF / Burst Mode • -0.3 EV",
                "why_this_works": "Captures genuine kinetic movement and natural fabric flow. The low upward angle makes the walk look confident and dynamic.",
                "photographer_instructions": [
                    "STEP 1: Drop down to one knee. Invert or tilt your phone upward approximately 15 degrees.",
                    "STEP 2: Ask subject to take 5 casual steps toward you from 6 meters out.",
                    "STEP 3: Use Burst Mode (swipe shutter button or hold volume key) to capture the exact peak of stride.",
                    "STEP 4: Select the frame where both feet form an open triangle with leading lines."
                ],
                "score": 94
            },
            {
                "pose_type_id": "seated_ledge",
                "name": "Contemplative Seated Edge Pose",
                "category": "Seated",
                "difficulty": "Easy",
                "subject_position": f"Seated on the edge of the {random.choice(elements)}",
                "body_rotation": "Torso turned 45° to camera, leaning slightly forward with straight posture",
                "hand_position": "One elbow resting casually on upper knee, other hand bracing lightly against ledge",
                "leg_position": "One foot flat on ground, other leg extended forward or rested on lower tier",
                "head_direction": "Gazing toward the scenic background or 45° toward natural key light",
                "expression": "Reflective, calm, and effortlessly stylish",
                "camera_angle": "Eye-Level to Subject (110 cm)",
                "camera_height": "Match subject's seated eye level",
                "camera_distance": "2.2 meters",
                "quality_adjustment": f"Portrait Mode f/2.0 • {optical_lens} • Spot Metering on Face • HDR Auto",
                "why_this_works": "Creates triangular geometric balance and isolates the subject against soft out-of-focus background textures.",
                "photographer_instructions": [
                    "STEP 1: Sit or squat so the camera lens is level with the subject's eyes.",
                    "STEP 2: Position the camera so the background horizon does not slice through the subject's neck.",
                    "STEP 3: Ensure shallow depth of field (f/2.0 to f/2.8) to blur busy background elements.",
                    "STEP 4: Have subject look away first, then glance toward camera just before you shoot."
                ],
                "score": 93
            },
            {
                "pose_type_id": "hero_low_angle",
                "name": "Dynamic Low-Angle Hero Stance",
                "category": "Low-Angle",
                "difficulty": "Easy",
                "subject_position": "Standing centered against the grandest backdrop feature",
                "body_rotation": "Facing forward, shoulders squared and chest open with relaxed posture",
                "hand_position": "Thumbs hooked into front pockets, or jacket lapels lightly held",
                "leg_position": "Feet planted firmly shoulder-width apart, weight evenly distributed",
                "head_direction": "Chin lifted 5° up, gazing confidently into lens",
                "expression": "Bold, poised editorial gaze",
                "camera_angle": "Ultra-Low Angle (20° Upward Tilt)",
                "camera_height": "Shin height (30-40 cm from ground)",
                "camera_distance": "2.5 meters",
                "quality_adjustment": f"Main Lens 1x (48MP/50MP Mode) • Horizon Level ON • 0.0 EV • High Dynamic Range",
                "why_this_works": "The upward perspective emphasizes height and commands authority while framing the subject against the expansive sky.",
                "photographer_instructions": [
                    "STEP 1: Hold phone nearly at ground level (flip phone upside down for lowest lens position).",
                    "STEP 2: Tilt phone 20 degrees upward so subject's head is framed against clear sky or upper architecture.",
                    "STEP 3: Ensure the ground plane forms a level base line along the bottom grid line.",
                    "STEP 4: Take the shot as subject exhales to keep shoulders down and relaxed."
                ],
                "score": 97
            },
            {
                "pose_type_id": "over_shoulder",
                "name": "The Over-the-Shoulder Sunset Turn",
                "category": "Standing",
                "difficulty": "Medium",
                "subject_position": f"Positioned 2 meters in front of the {random.choice(elements)}",
                "body_rotation": "Back facing camera at 60° angle, torso gently twisting back toward lens",
                "hand_position": "Trailing hand touching collar, lapel, or sunglasses",
                "leg_position": "Weight settled on the front foot, rear heel lightly lifted",
                "head_direction": "Turned sharply over shoulder toward the camera lens",
                "expression": "Intriguing, cinematic half-smile",
                "camera_angle": "Eye-Level (0° Tilt)",
                "camera_height": "Chest to eye level (145 cm)",
                "camera_distance": "2.0 meters",
                "quality_adjustment": f"Portrait Mode f/2.0 • {optical_lens} • -0.3 EV • Face Priority AF",
                "why_this_works": "Shows off clothing silhouette and back details while creating dynamic twisting lines that flatter the waist.",
                "photographer_instructions": [
                    "STEP 1: Stand directly behind subject's left or right shoulder at 2 meters distance.",
                    "STEP 2: Count down '3, 2, 1' and have subject smoothly turn their head to meet the lens.",
                    "STEP 3: Lock focus directly on the near eye.",
                    "STEP 4: Capture the instant they turn for genuine eye contact and hair movement."
                ],
                "score": 95
            },
            {
                "pose_type_id": "hands_pockets",
                "name": "Relaxed Hands-in-Pockets Stroll",
                "category": "Standing",
                "difficulty": "Easy",
                "subject_position": "Standing at the intersection of foreground and architectural backdrop",
                "body_rotation": "3/4 angle (45°) to camera, hips angled away from lens",
                "hand_position": "Both hands slipped casually into trouser pockets with thumbs resting outside",
                "leg_position": "One leg straight carrying weight, front knee soft and slightly bent",
                "head_direction": "Turned toward the camera with chin relaxed",
                "expression": "Warm, engaging, authentic smile",
                "camera_angle": "Waist-Level (90 cm Height)",
                "camera_height": "Waist level (90 cm)",
                "camera_distance": "2.6 meters",
                "quality_adjustment": f"Portrait Mode f/2.4 • {optical_lens} • -0.3 EV • Warm Color Style",
                "why_this_works": "The 3/4 hip turn creates a slimming S-curve contour, and keeping thumbs outside pockets prevents hands from looking amputated.",
                "photographer_instructions": [
                    "STEP 1: Keep camera at waist height to prevent perspective distortion.",
                    "STEP 2: Ask subject to take a deep breath and let shoulders drop down.",
                    "STEP 3: Check that thumbs are visible outside pockets for natural hand shape.",
                    "STEP 4: Take shot during natural conversation for a candid feel."
                ],
                "score": 92
            },
            {
                "pose_type_id": "center_symmetry",
                "name": "Architectural Vanishing Point Center",
                "category": "Standing",
                "difficulty": "Easy",
                "subject_position": "Dead center along the central symmetrical axis of the location",
                "body_rotation": "Directly facing camera, perfectly upright and balanced posture",
                "hand_position": "Hands loosely clasped in front at waist height, or relaxed parallel at sides",
                "leg_position": "Feet together or shoulder-width parallel",
                "head_direction": "Direct eye contact down center lens axis",
                "expression": "Composed, elegant editorial look",
                "camera_angle": "Eye-Level Dead Center (0° Tilt)",
                "camera_height": "Subject's chest level (135 cm)",
                "camera_distance": "3.2 meters",
                "quality_adjustment": f"High-Res Mode • 3x3 Grid ON • Center Crosshair • Exposure 0.0 EV • HDR Auto",
                "why_this_works": "Uses strong leading lines and one-point perspective of the background architecture to draw all viewer attention directly to the subject.",
                "photographer_instructions": [
                    "STEP 1: Step into the exact physical center of the pathway or building symmetry.",
                    "STEP 2: Turn on 3x3 grid lines. Ensure the center square aligns with the vanishing point behind subject.",
                    "STEP 3: Make sure the phone is 100% level with zero tilt left or right.",
                    "STEP 4: Have subject stand tall and centered within the crosshairs."
                ],
                "score": 98
            },
            {
                "pose_type_id": "close_portrait",
                "name": "Golden Hour Depth Profile Portrait",
                "category": "Portrait",
                "difficulty": "Medium",
                "subject_position": "Positioned where side lighting illuminates cheekbones and jawline",
                "body_rotation": "Upper torso turned 45° to camera",
                "hand_position": "One hand lightly brushing collar, lapel, or sunglasses near jawline",
                "leg_position": "Comfortable standing posture",
                "head_direction": "Turned into the light source at a 3/4 angle",
                "expression": "Gentle, thoughtful gaze with relaxed lips",
                "camera_angle": "Eye-Level (0° Tilt)",
                "camera_height": "Exact eye level (160 cm)",
                "camera_distance": "1.5 meters",
                "quality_adjustment": f"Portrait Mode f/1.8 – f/2.2 • {optical_lens} • Spot Metering • Warm Profile",
                "why_this_works": "Tight portrait framing creates gorgeous bokeh out of background lights/textures and highlights facial structure with Rembrandt lighting.",
                "photographer_instructions": [
                    "STEP 1: Step within 1.5 - 2 meters of subject. Switch camera to 2x or 3x optical telephoto.",
                    "STEP 2: Dial portrait aperture to f/2.0 for buttery background separation.",
                    "STEP 3: Tap specifically on the subject's eye closest to the camera to ensure razor-sharp focus.",
                    "STEP 4: Adjust exposure slider down slightly to enhance skin warmth."
                ],
                "score": 96
            },
            {
                "pose_type_id": "cross_legged",
                "name": "Relaxed Steps & Ledge Lounge",
                "category": "Seated",
                "difficulty": "Easy",
                "subject_position": f"Seated on the steps or raised platform of the {elements[-1]}",
                "body_rotation": "Torso leaning slightly backward supported by one arm behind",
                "hand_position": "Rear hand planted on surface behind for support, front arm draped across knee",
                "leg_position": "Legs casually staggered or crossed at ankles, extended forward",
                "head_direction": "Tilted upward 20° to meet downward camera angle",
                "expression": "Playful, effortless, spontaneous smile",
                "camera_angle": "High Angle (25°-30° Downward Tilt)",
                "camera_height": "Standing height (180 cm)",
                "camera_distance": "2.2 meters",
                "quality_adjustment": f"{optical_lens} • -0.3 EV to protect ground highlights • Rule of Thirds",
                "why_this_works": "The higher downward angle slims the face and jawline while framing the subject against rich geometric textures of steps or ground.",
                "photographer_instructions": [
                    "STEP 1: Stand upright 2 meters in front of the seated subject.",
                    "STEP 2: Tilt phone 25-30 degrees downward toward the subject's face.",
                    "STEP 3: Ask subject to tilt their chin up slightly to catch light from above.",
                    "STEP 4: Tell a light joke or prompt to get a spontaneous natural laugh."
                ],
                "score": 91
            },
            {
                "pose_type_id": "editorial_turn",
                "name": "High-Fashion Angular Turn",
                "category": "Editorial",
                "difficulty": "Medium",
                "subject_position": "Standing open in clean negative space of the background",
                "body_rotation": "Dynamic hip shift to left, torso counter-angled slightly right",
                "hand_position": "One hand raised near temple or running through hair, other hand resting at waist",
                "leg_position": "One leg locked straight, other knee kicked inward with heel lifted",
                "head_direction": "Chin tipped down 10°, looking up with intensity under brow",
                "expression": "High-fashion detachment, focused and dramatic",
                "camera_angle": "Waist-Level Dutch Tilt (10° Angle)",
                "camera_height": "Waist height (90 cm)",
                "camera_distance": "2.8 meters",
                "quality_adjustment": f"ProRAW / 50MP • -0.5 EV Contrast • {optical_lens} • High Dynamic Range",
                "why_this_works": "Creates sharp diagonal geometry and high visual tension that mirrors modern editorial magazine photography.",
                "photographer_instructions": [
                    "STEP 1: Lower camera to waist level and introduce a subtle 10-degree Dutch tilt.",
                    "STEP 2: Have subject shift hips abruptly to one side on the count of three.",
                    "STEP 3: Ensure there is clean negative space behind subject's head.",
                    "STEP 4: Fire multiple frames in rapid succession as subject shifts weight."
                ],
                "score": 94
            }
        ]

        # Vehicle or prop poses if vehicle present
        if vehicle_context or scene_context.get("has_vehicle"):
            v_type = vehicle_context.get("vehicle_type", "vehicle") if vehicle_context else "vehicle"
            pose_catalog.append({
                "pose_type_id": "vehicle_lean",
                "name": f"Dynamic {v_type.capitalize()} Integration Stance",
                "category": "Vehicle",
                "difficulty": "Medium",
                "subject_position": f"Positioned beside the front 3/4 quarter panel of the {v_type}",
                "body_rotation": "Leaning back casually against the vehicle, hips resting on bodyline",
                "hand_position": "One hand resting on vehicle hood/handlebars, other hand resting on hip",
                "leg_position": "Legs crossed at ankles with relaxed outward stance",
                "head_direction": subject_facing,
                "expression": "Cool, confident, charismatic",
                "camera_angle": "Low Angle (20° Upward Tilt)",
                "camera_height": "Knee height (50 cm)",
                "camera_distance": "3.5 meters",
                "quality_adjustment": f"Main 1x Lens • 48MP/50MP Mode • -0.3 EV • Polarizer Simulation",
                "why_this_works": "Balances the lines of the vehicle with human posture, giving epic scale and polished automotive editorial appeal.",
                "photographer_instructions": [
                    "STEP 1: Crouch down to wheel-hub height 3.5 meters away.",
                    "STEP 2: Frame the front 45-degree angle of the vehicle with subject prominently in the upper third.",
                    "STEP 3: Ensure reflections on vehicle glass don't obscure subject's reflection.",
                    "STEP 4: Take the shot with the horizon line aligned to the bottom third."
                ],
                "score": 97
            })

        # Add 12th pose: The Scenic Horizon Look
        pose_catalog.append({
            "pose_type_id": "scenic_horizon",
            "name": "The Scenic Horizon Environmental Silhouette",
            "category": "Standing",
            "difficulty": "Easy",
            "subject_position": "Standing at the edge of the scenic vista or prominent background feature",
            "body_rotation": "Side profile facing the open landscape",
            "hand_position": "Hands loosely relaxed or one hand holding sunglasses/hat",
            "leg_position": "Natural standing posture, feet slightly apart",
            "head_direction": "Gazing out into the scenic horizon",
            "expression": "Serene and immersed in the environment",
            "camera_angle": "Eye-Level (0° Tilt) Wide Environmental",
            "camera_height": "Eye level (160 cm)",
            "camera_distance": "4.0 meters",
            "quality_adjustment": f"Ultra-Wide 0.5x or Main 1x (High-Res) • HDR ON • 0.0 EV • Golden Ratio",
            "why_this_works": "Integrates the subject seamlessly into the landscape, telling an immersive story of travel and exploration.",
            "photographer_instructions": [
                "STEP 1: Step back to 4 meters to capture ample background scenery.",
                "STEP 2: Position subject on the left third looking toward the right two-thirds of empty scenery.",
                "STEP 3: Tap on the sky/horizon and ensure highlights remain textured.",
                "STEP 4: Capture the subject breathing in the open atmosphere."
            ],
            "score": 95
        })

        for p in pose_catalog:
            inst_list = p.get("photographer_instructions", [])
            instructions_str = "\n".join(inst_list) if isinstance(inst_list, list) else str(inst_list)

            pose = {
                "pose_name": p["name"],
                "pose_type_id": p.get("pose_type_id", "casual_stand"),
                "category": p.get("category", "Standing"),
                "difficulty": p["difficulty"],
                "subject_position": p["subject_position"],
                "body_rotation": p["body_rotation"],
                "hand_position": p["hand_position"],
                "leg_position": p["leg_position"],
                "head_direction": p["head_direction"],
                "expression": p["expression"],
                "camera_position": f"{p['camera_angle']} • Height: {p['camera_height']} • Distance: {p['camera_distance']}",
                "camera_angle": p["camera_angle"],
                "camera_height": p["camera_height"],
                "camera_distance": p["camera_distance"],
                "quality_adjustment": p["quality_adjustment"],
                "lens": optical_lens,
                "zoom": phone_capabilities.get("optical_zoom", "2x"),
                "camera_mode": "portrait" if portrait_mode else "photo",
                "aspect_ratio": "4:3",
                "exposure": "-0.3 EV",
                "flash": "off",
                "hdr": "auto",
                "lighting_direction": light_dir,
                "composition": "Rule of Thirds & Leading Lines",
                "photographer_instructions": inst_list if take_my_photo else inst_list[:2],
                "instructions": f"📐 Angle: {p['camera_angle']}\n⚙️ Quality Setup: {p['quality_adjustment']}\n\n{instructions_str}",
                "why_this_works": p["why_this_works"],
                "score": p["score"]
            }
            poses.append(pose)

        # Generate Shot Plans
        for i, pose in enumerate(poses[:8]):
            plan = {
                "shot_number": i + 1,
                "shot_name": pose["pose_name"],
                "description": f"{pose['category']} capture optimized for {phone_model}.",
                "camera_settings": {
                    "mode": pose["camera_mode"],
                    "lens": optical_lens,
                    "zoom": pose["zoom"],
                    "orientation": "portrait",
                    "aspect_ratio": "4:3",
                    "exposure": "-0.3 EV",
                    "angle": pose["camera_angle"]
                },
                "pose": pose["pose_name"],
                "subject_position": pose["subject_position"],
                "photographer_position": pose["camera_position"],
                "instructions": pose["photographer_instructions"][0] if pose["photographer_instructions"] else "Follow guide instructions.",
                "reason": pose["why_this_works"]
            }
            shot_plans.append(plan)

        # Generate Camera Recommendations
        cam_setups = [
            {
                "shot_name": f"{phone_model} — Optimal Portrait Setup",
                "mode": "portrait" if portrait_mode else "photo",
                "lens": optical_lens,
                "zoom": phone_capabilities.get("optical_zoom", "2x"),
                "distance": "2.5 meters",
                "camera_height": "waist level (90 cm)",
                "orientation": "portrait",
                "aspect_ratio": "4:3",
                "exposure": "-0.3 EV",
                "flash": "off",
                "hdr": "auto",
                "instructions": f"📐 Shoot at Waist-Level 90cm. Set Portrait Aperture to f/2.2–f/2.8 on {phone_model}. Tap subject face to lock AE/AF and swipe brightness slider down slightly to protect sky highlights."
            },
            {
                "shot_name": f"{phone_model} — Low-Angle Hero Setup",
                "mode": "photo",
                "lens": f"Main 1x ({phone_capabilities.get('main_camera', 'High-Res')})",
                "zoom": "1x",
                "distance": "2.8 meters",
                "camera_height": "knee level (50 cm)",
                "orientation": "portrait",
                "aspect_ratio": "4:3",
                "exposure": "0.0 EV",
                "flash": "off",
                "hdr": "auto",
                "instructions": f"📐 Flip phone upside-down near ground level. Tilt top back 15-20° upward. Enable 48MP/50MP High-Res Mode in camera app to capture crisp architectural texture and elongated subject height."
            },
            {
                "shot_name": f"{phone_model} — Eye-Level Vanishing Point Setup",
                "mode": "photo",
                "lens": optical_lens,
                "zoom": phone_capabilities.get("optical_zoom", "2x"),
                "distance": "3.2 meters",
                "camera_height": "eye level (160 cm)",
                "orientation": "portrait",
                "aspect_ratio": "4:3",
                "exposure": "-0.3 EV",
                "flash": "off",
                "hdr": "auto",
                "instructions": f"📐 Hold phone vertical at eye level. Turn on 3x3 Grid and Level. Center subject on vanishing point and use {optical_lens} to compress background with zero distortion."
            }
        ]

        for cam in cam_setups:
            camera_recommendations.append(cam)

        intelligence_summary = {
            "chosen_style": photography_style,
            "phone_model": phone_model,
            "phone_brand": phone_brand,
            "total_poses": len(poses),
            "angles_covered": ["Low Angle 15°-20°", "Eye-Level 0°", "Waist-Level 90cm", "High Angle 25°-30°", "Dutch Tilt"],
            "quality_adjustments": ["Optical Lens", "Portrait Aperture f/2.2", "Exposure -0.3 EV", "3x3 Grid", "High-Res Mode"]
        }

        return {
            "poses": poses,
            "shot_plans": shot_plans,
            "camera_recommendations": camera_recommendations,
            "intelligence_summary": intelligence_summary
        }
