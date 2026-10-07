-- Photo Evaluations Table
-- Stores AI evaluation of user-taken photos

CREATE TABLE IF NOT EXISTS photo_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE SET NULL,
    photo_url TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    good_points JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    retake_instructions JSONB DEFAULT '[]'::jsonb,
    evaluation_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photo_evaluations_user_id ON photo_evaluations(user_id);
CREATE INDEX idx_photo_evaluations_session_id ON photo_evaluations(session_id);

ALTER TABLE photo_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations"
    ON photo_evaluations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own evaluations"
    ON photo_evaluations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert evaluations"
    ON photo_evaluations FOR INSERT
    WITH CHECK (true);
