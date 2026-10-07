export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  phone_model_id?: string;
  preferred_style?: PhotographyStyle;
  created_at: string;
  updated_at: string;
}

export type PhotographyStyle = 'portrait' | 'cinematic' | 'instagram' | 'street' | 'bike' | 'casual' | 'professional';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisSession {
  id: string;
  user_id: string;
  location_image_url: string;
  person_image_url?: string;
  vehicle_image_url?: string;
  phone_model: string;
  photography_style: PhotographyStyle;
  take_my_photo: boolean;
  status: AnalysisStatus;
  overall_score?: number;
  created_at: string;
  updated_at: string;
}

export interface SceneAnalysis {
  id: string;
  session_id: string;
  scene_type: string;
  lighting_description: string;
  background_quality: string;
  composition_description: string;
  best_spot: string;
  location_score: number;
  lighting_score: number;
  composition_score: number;
  analysis_json: any;
  created_at: string;
}

export interface OutfitAnalysis {
  id: string;
  session_id: string;
  clothing_items: string[];
  colors: string[];
  style: string;
  recommended_styles: string[];
  outfit_score: number;
  analysis_json: any;
  created_at: string;
}

export interface VehicleAnalysis {
  id: string;
  session_id: string;
  vehicle_type: string;
  vehicle_colors: string[];
  recommended_angles: string[];
  recommended_positions: string[];
  vehicle_score: number;
  analysis_json: any;
  created_at: string;
}

export interface CameraRecommendation {
  id: string;
  session_id: string;
  shot_name: string;
  mode: string;
  lens: string;
  zoom: string;
  distance: string;
  camera_height: string;
  orientation: string;
  aspect_ratio: string;
  exposure: string;
  flash: string;
  hdr: boolean;
  instructions: string;
  created_at: string;
}

export interface PoseRecommendation {
  id: string;
  session_id: string;
  name: string;
  difficulty: string;
  body_position: string;
  hand_position: string;
  leg_position: string;
  head_position: string;
  facial_expression: string;
  camera_position: string;
  instructions: string;
  reason: string;
  score: number;
  created_at: string;
  preview_image_url?: string;
  camera_angle?: string;
  quality_adjustment?: string;
  pose_type_id?: string;
  category?: string;
}

export interface ShotPlan {
  id: string;
  session_id: string;
  shot_number: number;
  shot_name: string;
  description: string;
  camera_settings: any;
  pose: any;
  subject_position?: string;
  photographer_instructions?: string;
  preview_image_url?: string;
  created_at: string;
}

export interface PhoneModel {
  id: string;
  brand: string;
  model: string;
  main_camera: string;
  ultrawide_camera?: string;
  telephoto_camera?: string;
  portrait_mode: boolean;
  cinematic_mode: boolean;
  night_mode: boolean;
  optical_zoom?: string;
  max_supported_zoom?: string;
}

export interface FullAnalysisResult {
  session: AnalysisSession;
  scene?: SceneAnalysis;
  outfit?: OutfitAnalysis;
  vehicle?: VehicleAnalysis;
  camera_recommendations: CameraRecommendation[];
  poses: PoseRecommendation[];
  shot_plans: ShotPlan[];
}

export interface CreateAnalysisRequest {
  location_image: File;
  person_image?: File;
  vehicle_image?: File;
  phone_model: string;
  photography_style: PhotographyStyle;
  take_my_photo: boolean;
}

export interface PhotoEvaluation {
  score: number;
  grade: string;
  composition_score: number;
  lighting_score: number;
  pose_score: number;
  background_score: number;
  overall_score: number;
  good_points: string[];
  improvements: string[];
  retake_instructions: string[];
  next_improvement_priority: string;
  detailed_feedback: any;
}
