# PoseAI — AI Photography & Pose Assistant

> **"Tell PoseAI what you have, and PoseAI tells you exactly how to photograph it."**

PoseAI is an AI-powered personal photography assistant that analyzes your location, outfit, vehicle, lighting, composition, and smartphone capabilities, then provides professional pose, camera, and shot recommendations.

## Features

- **Scene Analysis** — Evaluates lighting, composition, background, leading lines, and symmetry
- **Outfit Analysis** — Identifies visible clothing style and recommends photography approaches
- **Vehicle Integration** — Positions motorcycles/cars in the frame with optimal angles
- **Smart Camera Settings** — Recommendations tailored to your specific smartphone model
- **Pose Generation** — 5-10 professional poses with body positions, instructions, and difficulty levels
- **Shot Planning** — Complete step-by-step photographer instructions
- **Take My Photo Mode** — Detailed beginner-friendly instructions you can hand to anyone
- **Privacy First** — No facial recognition, no personal identification

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router, Axios, Lucide React |
| Backend | Python, FastAPI, Pydantic v2, Uvicorn |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Provider-agnostic (with mock mode for development) |

## Architecture

```
poseai/
├── frontend/          # React + TypeScript + Tailwind
│   └── src/
│       ├── components/  # 13 reusable UI components
│       ├── pages/       # 9 route pages
│       ├── layouts/     # Main + Auth layouts
│       ├── hooks/       # useAuth, useAnalysis
│       ├── services/    # API, auth, upload, analysis, phones
│       ├── lib/         # Supabase client
│       └── types/       # TypeScript interfaces
├── backend/           # FastAPI + Python
│   └── app/
│       ├── api/routes/  # analysis, upload, phones, health
│       ├── core/        # config, security
│       ├── db/          # Supabase client
│       ├── models/      # Phone database (17 models)
│       ├── schemas/     # Pydantic request/response models
│       └── services/    # AI service, analyzers, generators
├── supabase/          # Database migrations + storage
└── docker-compose.yml
```

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Run the storage setup in `supabase/migrations/002_storage_buckets.sql`
4. Copy your project URL and keys from Settings > API

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `analysis_sessions` | Photography analysis sessions |
| `scene_analysis` | Location/lighting/composition analysis |
| `outfit_analysis` | Clothing and style analysis |
| `vehicle_analysis` | Vehicle positioning analysis |
| `camera_recommendations` | Phone-specific camera settings |
| `pose_recommendations` | AI-generated poses |
| `shot_plans` | Complete shot-by-shot plans |

### Storage Buckets

| Bucket | Content |
|--------|---------|
| `location-images` | Location/scene photos |
| `person-images` | Person/outfit photos |
| `vehicle-images` | Vehicle/bike photos |
| `analysis-results` | Generated analysis artifacts |

All buckets are private with Row Level Security.

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_API_KEY=your-ai-api-key
ALLOWED_ORIGINS=http://localhost:5173
MOCK_AI=true
```

> **Security**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the frontend. The frontend only uses the anon key.

## Installation

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

## Running

### Start Backend

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8000`.

## Mock Mode

Set `MOCK_AI=true` in the backend `.env` to enable mock mode. This returns realistic sample analysis data without requiring an AI API key — perfect for frontend development.

When ready for production, set `MOCK_AI=false` and provide an `AI_API_KEY`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analysis` | Create new analysis |
| `GET` | `/api/analysis/{id}` | Get analysis results |
| `GET` | `/api/analysis/history` | Get user's analysis history |
| `DELETE` | `/api/analysis/{id}` | Delete an analysis |
| `POST` | `/api/upload` | Upload an image |
| `GET` | `/api/phones` | List supported phones |
| `GET` | `/api/phones/{id}` | Get phone details |
| `GET` | `/api/health` | Health check |

## Supported Phones

17 models with real camera specifications:

- **Apple**: iPhone 16 Pro Max, 16 Pro, 16, 15 Pro Max, 15 Pro, 15, 14 Pro
- **Samsung**: Galaxy S25 Ultra, S25+, S25, S24 Ultra
- **Google**: Pixel 9 Pro, 9, 8 Pro, 8
- **OnePlus**: 13, 12

## Security

- Row Level Security (RLS) on all database tables
- Users can only access their own data
- JWT authentication via Supabase Auth
- Service-role key only used on backend
- No facial recognition or personal identification
- Images stored in private storage buckets

## User Flow

```
Login → Upload Location → Upload Person (optional) → Upload Vehicle (optional)
→ Select Phone → Choose Style → Enable/Disable "Take My Photo"
→ AI Analysis → Scene + Outfit + Vehicle + Camera + Pose + Shot Plan
→ Professional Photography Results
```

## Future Improvements

- Real-time camera assistant via WebSocket/WebRTC
- AR overlay for pose guidance
- Social sharing of results
- More phone models
- Multiple AI provider support (Gemini, GPT-4V, Claude)
- Photo comparison before/after
