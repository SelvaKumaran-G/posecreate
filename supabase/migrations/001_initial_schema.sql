-- PoseAI Database Schema
-- Supabase PostgreSQL Migration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ANALYSIS SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_image_url TEXT NOT NULL,
    person_image_url TEXT,
    vehicle_image_url TEXT,
    phone_model TEXT NOT NULL,
    photography_style TEXT NOT NULL,
    take_my_photo BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX idx_analysis_sessions_created_at ON analysis_sessions(created_at DESC);

CREATE TRIGGER update_analysis_sessions_updated_at
    BEFORE UPDATE ON analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SCENE ANALYSIS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scene_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    scene_type TEXT,
    lighting_description TEXT,
    background_quality TEXT,
    composition_description TEXT,
    best_spot TEXT,
    location_score INTEGER CHECK (location_score >= 0 AND location_score <= 100),
    lighting_score INTEGER CHECK (lighting_score >= 0 AND lighting_score <= 100),
    composition_score INTEGER CHECK (composition_score >= 0 AND composition_score <= 100),
    analysis_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scene_analysis_session_id ON scene_analysis(session_id);

-- ============================================
-- OUTFIT ANALYSIS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outfit_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    clothing_items JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    style TEXT,
    recommended_styles JSONB DEFAULT '[]'::jsonb,
    outfit_score INTEGER CHECK (outfit_score >= 0 AND outfit_score <= 100),
    analysis_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outfit_analysis_session_id ON outfit_analysis(session_id);

-- ============================================
-- VEHICLE ANALYSIS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    vehicle_colors JSONB DEFAULT '[]'::jsonb,
    recommended_angles JSONB DEFAULT '[]'::jsonb,
    recommended_positions JSONB DEFAULT '[]'::jsonb,
    vehicle_score INTEGER CHECK (vehicle_score >= 0 AND vehicle_score <= 100),
    analysis_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_analysis_session_id ON vehicle_analysis(session_id);

-- ============================================
-- CAMERA RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS camera_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    shot_name TEXT NOT NULL,
    mode TEXT,
    lens TEXT,
    zoom TEXT,
    distance TEXT,
    camera_height TEXT,
    orientation TEXT,
    aspect_ratio TEXT,
    exposure TEXT,
    flash TEXT,
    hdr TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_camera_recommendations_session_id ON camera_recommendations(session_id);

-- ============================================
-- POSE RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pose_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    body_position TEXT,
    hand_position TEXT,
    leg_position TEXT,
    head_position TEXT,
    facial_expression TEXT,
    camera_position TEXT,
    instructions TEXT,
    reason TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pose_recommendations_session_id ON pose_recommendations(session_id);

-- ============================================
-- SHOT PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shot_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    shot_number INTEGER NOT NULL,
    shot_name TEXT NOT NULL,
    description TEXT,
    camera_settings JSONB,
    pose TEXT,
    photographer_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shot_plans_session_id ON shot_plans(session_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Analysis Sessions RLS
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
    ON analysis_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
    ON analysis_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON analysis_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON analysis_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Scene Analysis RLS
ALTER TABLE scene_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scene analysis"
    ON scene_analysis FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert scene analysis"
    ON scene_analysis FOR INSERT
    WITH CHECK (true);

-- Outfit Analysis RLS
ALTER TABLE outfit_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfit analysis"
    ON outfit_analysis FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert outfit analysis"
    ON outfit_analysis FOR INSERT
    WITH CHECK (true);

-- Vehicle Analysis RLS
ALTER TABLE vehicle_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicle analysis"
    ON vehicle_analysis FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert vehicle analysis"
    ON vehicle_analysis FOR INSERT
    WITH CHECK (true);

-- Camera Recommendations RLS
ALTER TABLE camera_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own camera recommendations"
    ON camera_recommendations FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert camera recommendations"
    ON camera_recommendations FOR INSERT
    WITH CHECK (true);

-- Pose Recommendations RLS
ALTER TABLE pose_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pose recommendations"
    ON pose_recommendations FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert pose recommendations"
    ON pose_recommendations FOR INSERT
    WITH CHECK (true);

-- Shot Plans RLS
ALTER TABLE shot_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shot plans"
    ON shot_plans FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM analysis_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert shot plans"
    ON shot_plans FOR INSERT
    WITH CHECK (true);
