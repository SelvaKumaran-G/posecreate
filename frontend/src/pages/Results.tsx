import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Sun, Target, Layers, 
  Tag, Palette, Shirt, Car, ChevronDown, 
  ChevronUp, Loader2, AlertCircle, RefreshCw, Info,
  Camera, Map, Maximize, Crosshair, User, Upload,
  CheckCircle2, XCircle, Star, TrendingUp, RotateCcw,
  Aperture, Eye, Move, Hand, Footprints, Smartphone,
  Sliders, Sparkles, Compass, ShieldCheck, Check,
  ChevronRight, ArrowUpDown, CornerDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { 
  AnalysisSession, SceneAnalysis, OutfitAnalysis, 
  VehicleAnalysis, CameraRecommendation, PoseRecommendation, ShotPlan 
} from '../types';
import ScoreCircle from '../components/ScoreCircle';
import PoseCard from '../components/PoseCard';
import CameraSetupCard from '../components/CameraSetupCard';
import ShotPlanCard from '../components/ShotPlanCard';

interface FullAnalysisResponse {
  session: AnalysisSession;
  scene: SceneAnalysis | null;
  outfit: OutfitAnalysis | null;
  vehicle: VehicleAnalysis | null;
  camera_recommendations: CameraRecommendation[];
  poses: PoseRecommendation[];
  shot_plans: ShotPlan[];
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPoses, setExpandedPoses] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Photo evaluation state
  const [evalFile, setEvalFile] = useState<File | null>(null);
  const [evalPreview, setEvalPreview] = useState<string | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const evalInputRef = useRef<HTMLInputElement>(null);

  const fetchAnalysis = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/analysis/${id}`);
      const analysisData = response.data as FullAnalysisResponse;
      
      if (analysisData.session.status === 'processing' || analysisData.session.status === 'pending') {
        navigate(`/analyze/${id}`);
        return;
      }
      
      setData(analysisData);
    } catch (err: any) {
      console.error('Failed to fetch analysis:', err);
      setError(err.response?.data?.error || 'Failed to load analysis results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id, navigate]);

  const togglePose = (poseId: string) => {
    setExpandedPoses(prev => ({
      ...prev,
      [poseId]: !prev[poseId]
    }));
  };

  const handleEvalFileSelect = (file: File) => {
    setEvalFile(file);
    setEvalPreview(URL.createObjectURL(file));
    setEvalResult(null);
    setEvalError(null);
  };

  const handleEvaluatePhoto = async () => {
    if (!evalFile || !id) return;
    try {
      setEvalLoading(true);
      setEvalError(null);
      const formData = new FormData();
      formData.append('file', evalFile);
      formData.append('bucket', 'photo-evaluations');
      const uploadRes = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const photoUrl = uploadRes.data?.url || uploadRes.data?.public_url || `local://${evalFile.name}`;
      
      const evalRes = await api.post('/api/analysis/evaluate-photo', {
        photo_url: photoUrl,
        session_id: id,
        original_pose: data?.poses?.[0] || null
      });
      setEvalResult(evalRes.data);
    } catch (err: any) {
      setEvalError(err?.response?.data?.detail || 'Evaluation failed. Please try again.');
    } finally {
      setEvalLoading(false);
    }
  };

  // ── All hooks MUST be called before any early returns ──
  const poses = data?.poses || [];
  const camera_recommendations = data?.camera_recommendations || [];

  // Sorting poses by score
  const sortedPoses = useMemo(() => {
    return [...poses].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [poses]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    sortedPoses.forEach((p: any) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [sortedPoses]);

  // Filtered poses
  const filteredPoses = useMemo(() => {
    if (selectedCategory === 'all') return sortedPoses;
    return sortedPoses.filter((p: any) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [sortedPoses, selectedCategory]);

  // ── Early returns AFTER all hooks ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-accent-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Photos & Crafting Poses</h2>
        <p className="text-gray-400 text-center max-w-md">
          Our AI is finalizing the perfect poses, camera angles, and mobile quality settings tailored for your scene.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900/80 border border-red-500/30 p-8 rounded-2xl backdrop-blur-sm max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Analysis Failed</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button 
              onClick={fetchAnalysis}
              className="flex items-center justify-center px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Safe to destructure data after null check ──
  const { session, scene, outfit, vehicle, shot_plans } = data;
  const overallScore = session.overall_score || 0;
  
  let scoreLabel = 'Fair';
  let scoreColor = 'text-gray-400';
  if (overallScore >= 90) { scoreLabel = 'Exceptional'; scoreColor = 'text-emerald-400'; }
  else if (overallScore >= 80) { scoreLabel = 'Excellent'; scoreColor = 'text-emerald-500'; }
  else if (overallScore >= 70) { scoreLabel = 'Great'; scoreColor = 'text-lime-400'; }
  else if (overallScore >= 60) { scoreLabel = 'Good'; scoreColor = 'text-amber-400'; }

  const sceneLocationScore = scene?.location_score || 90;
  const sceneLightingScore = scene?.lighting_score || 92;
  const sceneCompositionScore = scene?.composition_score || 88;

  // Phone optimization details from backend
  const phoneOpt = scene?.analysis_json?.phone_optimization || {
    model: session.phone_model && session.phone_model !== 'default' ? session.phone_model : 'Universal Smartphone Pro',
    brand: 'Smartphone',
    main_camera: 'High-Res Sensor',
    optical_zoom: '2x',
    recommended_angles: [
      {
        name: "Low Angle (15°-20° Upward Tilt)",
        angle_degrees: "15° - 20° Upward",
        height: "Knee / Lower-Torso (40-60 cm)",
        how_to_hold: "Flip phone upside-down so camera lens is closer to the ground, tilt screen back ~15°",
        why_it_works: "Elongates posture and captures grand background perspective.",
        best_for: "Full-body standing and walking poses"
      },
      {
        name: "Eye-Level (0° Direct)",
        angle_degrees: "0° Perpendicular",
        height: "Eye Level (150-170 cm)",
        how_to_hold: "Hold phone vertical and flat, perpendicular to the floor with grid line aligned to horizon",
        why_it_works: "Natural, intimate perspective with zero distortion.",
        best_for: "Portraits, seated poses, candid looks"
      },
      {
        name: "Waist-Level (90 cm Height)",
        angle_degrees: "0° - 5° Slight Upward Tilt",
        height: "Waist / Navel Level (85-95 cm)",
        how_to_hold: "Hold phone at belt level with two hands, elbows braced against your ribs",
        why_it_works: "Balances head-to-toe proportions, avoiding large-head distortion.",
        best_for: "3/4 medium shots, leaning against props/walls"
      },
      {
        name: "High Angle (25°-30° Downward Tilt)",
        angle_degrees: "25° - 30° Downward",
        height: "Above Head (190-210 cm)",
        how_to_hold: "Raise phone high tilted downward toward subject",
        why_it_works: "Sharpens jawline definition and frames subject against textured ground or steps.",
        best_for: "Sitting poses, stairs, resting on ledge"
      }
    ],
    quality_adjustments: [
      {
        setting_name: "Recommended Lens & Zoom",
        recommended_value: "2x Optical Lens",
        phone_action: "Select 2x / optical telephoto in camera app to eliminate wide-angle facial distortion.",
        benefit: "Flattens facial perspective and creates creamy background compression."
      },
      {
        setting_name: "Portrait Depth / Aperture",
        recommended_value: "f/2.2 – f/2.8",
        phone_action: "Switch to Portrait Mode and dial aperture to f/2.2 or f/2.8.",
        benefit: "Produces realistic optical bokeh without fake edge cutout around hair."
      },
      {
        setting_name: "Exposure Compensation",
        recommended_value: "-0.3 EV to -0.7 EV",
        phone_action: "Tap subject on screen and drag brightness slider slightly down.",
        benefit: "Protects sky highlights from blowing out while keeping skin tones richly saturated."
      },
      {
        setting_name: "Composition Grid & Level",
        recommended_value: "3x3 Grid + Level ON",
        phone_action: "Enable 'Grid' and 'Level' in Camera Settings. Align subject on the rule-of-thirds line.",
        benefit: "Guarantees mathematically balanced composition and zero tilted horizons."
      }
    ]
  };

  const isVirtualModel = !session.person_image_url || Boolean(outfit?.analysis_json?.is_virtual_model);

  const bestPose = sortedPoses[0];
  const bestCamera = camera_recommendations[0];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-300 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link 
            to="/create" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analyze Another Photo
          </Link>

          <Link 
            to="/dashboard"
            className="inline-flex items-center text-xs text-gray-400 hover:text-accent-400 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* 1. Master Hero Score Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="flex-shrink-0">
              <ScoreCircle score={overallScore} size="lg" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-500/15 border border-accent-500/30 text-xs font-semibold text-accent-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {poses.length} AI-Generated Poses & Camera Angle Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                <span className={scoreColor}>{scoreLabel}</span> Photography Scene
              </h1>
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl">
                We analyzed your location's lighting, geometry, and depth. Below you'll find custom camera tilt angles, mobile quality adjustments, and {poses.length} tailored poses designed to make your photos look professionally shot.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Uploaded Photos & Model Mode Badge */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Scene Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
              {session.location_image_url ? (
                <img 
                  src={session.location_image_url} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500"><MapPin className="w-8 h-8" /></div>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-accent-400 uppercase tracking-wider block">
                Analyzed Location Scene
              </span>
              <h3 className="text-base font-bold text-white capitalize">{scene?.scene_type || 'Outdoor Environment'}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{scene?.lighting_description || 'Natural balanced illumination with architectural leading lines.'}</p>
            </div>
          </div>

          {/* Model Status Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
              {session.person_image_url ? (
                <img 
                  src={session.person_image_url} 
                  alt="Subject Person" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-cyan-900/60 flex flex-col items-center justify-center text-center p-2">
                  <User className="w-8 h-8 text-cyan-300 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-200">AI Model</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                {isVirtualModel ? 'AI Virtual Model Engaged' : 'Custom Subject Photo'}
              </span>
              <h3 className="text-base font-bold text-white">
                {isVirtualModel ? 'Alex (Universal Model Persona)' : 'Personalized to Uploaded Subject'}
              </h3>
              <p className="text-xs text-gray-400">
                {isVirtualModel 
                  ? 'No personal photo was uploaded. PoseAI crafted 10+ poses using our AI Virtual Model calibrated for this scene.'
                  : 'Poses and colors are specifically coordinated with your subject outfit and framing.'}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Score Breakdown Cards */}
        {scene && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
              <ScoreCircle score={sceneLocationScore} size="sm" />
              <h3 className="mt-3 font-semibold text-white text-sm">Location Environment</h3>
              <p className="text-xs text-gray-400 mt-1">Spatial depth & geometry</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
              <ScoreCircle score={sceneLightingScore} size="sm" />
              <h3 className="mt-3 font-semibold text-white text-sm">Lighting & Shadows</h3>
              <p className="text-xs text-gray-400 mt-1">Illumination angle & contrast</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center">
              <ScoreCircle score={sceneCompositionScore} size="sm" />
              <h3 className="mt-3 font-semibold text-white text-sm">Visual Composition</h3>
              <p className="text-xs text-gray-400 mt-1">Leading lines & balance</p>
            </div>
          </section>
        )}

        {/* 4. MASTER SMARTPHONE CAMERA ANGLE & QUALITY ADJUSTMENT GUIDE */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-accent-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Smartphone className="w-4 h-4" /> Smartphone Optimization Guide
              </div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Camera Angles & Quality Settings for {phoneOpt.brand} {phoneOpt.model}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold border border-accent-500/30 w-fit">
              Customized for {phoneOpt.model}
            </span>
          </div>

          {/* Camera Angles Showcase Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Recommended Camera Angles for This Scene
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phoneOpt.recommended_angles?.map((ang: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {ang.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                      {ang.height}
                    </span>
                  </div>

                  <div className="text-xs text-gray-300 space-y-1 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <p>
                      <strong className="text-cyan-300">How to hold phone: </strong> 
                      {ang.how_to_hold}
                    </p>
                    <p>
                      <strong className="text-gray-400">Why it works: </strong> 
                      {ang.why_it_works}
                    </p>
                  </div>

                  {ang.best_for && (
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-300">Best for:</span> {ang.best_for}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quality Adjustments Showcase Grid */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Mobile Quality Adjustments & In-Camera Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {phoneOpt.quality_adjustments?.map((adj: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                      {adj.setting_name}
                    </span>
                    <span className="font-bold text-white text-sm block">
                      {adj.recommended_value}
                    </span>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                      {adj.phone_action}
                    </p>
                  </div>
                  <div className="text-[11px] text-purple-200/70 border-t border-white/5 pt-2">
                    ✓ {adj.benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Subject & Outfit Analysis */}
        {outfit && (
          <section className="space-y-4 bg-slate-900/40 border border-white/5 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-accent-400" />
                {isVirtualModel ? 'AI Virtual Model Outfit & Color Harmony' : 'Detected Outfit & Styling Guide'}
              </h2>
              {outfit.outfit_score && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  Compatibility Score: {outfit.outfit_score}/100
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {isVirtualModel ? 'Virtual Model Ensemble' : 'Detected Garments'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.clothing_items?.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs border border-white/5 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Color Harmony with Scene
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.colors?.map((col, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-gray-200 text-xs border border-white/5 font-medium capitalize">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Styling Tips */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Styling & Posture Advice
                </h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  {outfit.recommended_styles?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-accent-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* 6. TOP RECOMMENDED POSE */}
        {bestPose && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Top Recommended Pose For This Background
              </h2>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-accent-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                Highest Match ({bestPose.score}%)
              </span>
            </div>
            <PoseCard pose={bestPose} index={0} expanded={true} />
          </section>
        )}

        {/* 7. ALL GENERATED POSES CATALOG (10+ Poses) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Camera className="w-6 h-6 text-accent-400" />
                Complete Pose Collection ({sortedPoses.length} Poses)
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Explore every generated pose with visual silhouettes, exact tilt angles, and photographer guides.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-accent-600 text-white shadow-md shadow-accent-600/30' 
                      : 'bg-slate-900/80 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat === 'all' ? `All (${sortedPoses.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPoses.map((pose, idx) => (
              <PoseCard 
                key={pose.id || idx} 
                pose={pose} 
                index={idx} 
                expanded={expandedPoses[pose.id] || (idx === 0 && selectedCategory !== 'all')}
                onToggle={() => togglePose(pose.id)}
              />
            ))}
          </div>
        </section>

        {/* 8. Photographer Execution Guide */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-accent-400" />
            Execution Guide
          </h2>

          <div className="bg-gradient-to-br from-accent-950/30 via-slate-900 to-slate-900 border border-accent-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Hand-Your-Phone Step-by-Step Instructions
              </h3>
              <p className="text-sm text-accent-200/90 leading-relaxed">
                Hand your phone to a friend or passerby and ask them to follow these 4 quick instructions to get the shot:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-accent-500/20 text-accent-300 font-bold flex items-center justify-center text-xs">1</div>
                <h4 className="text-sm font-bold text-white">Positioning & Distance</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Stand ~2.5 to 3 meters away. Hold phone at waist or knee level as indicated on the pose card.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">2</div>
                <h4 className="text-sm font-bold text-white">Framing & Thirds</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Align subject on the vertical third lines. Keep horizon level to avoid tilted lines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">3</div>
                <h4 className="text-sm font-bold text-white">Focus & Exposure</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tap subject's face on screen to focus. Slide brightness slightly down to preserve background colors.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">4</div>
                <h4 className="text-sm font-bold text-white">Capture Burst</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Take multiple shots in rapid sequence while the subject shifts weight and expression naturally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Complete Shot List */}
        {shot_plans && shot_plans.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Complete Shot Plan Sequence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shot_plans.map((shot, idx) => (
                <ShotPlanCard key={shot.id || idx} plan={shot} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* 10. Photo Evaluation Section */}
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-accent-500/20 rounded-xl"><Camera className="w-5 h-5 text-accent-400" /></div>
            Evaluate Your Captured Photo
          </h2>
          <p className="text-gray-400 text-sm">
            After taking photos following the guides above, upload your photo here to see your AI score and retake feedback.
          </p>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 md:p-8">
            {!evalResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <div
                    onClick={() => evalInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      evalPreview ? 'border-accent-500/50' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {evalPreview ? (
                      <img src={evalPreview} alt="Your photo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-500 mb-3" />
                        <p className="text-gray-300 font-medium">Upload photo you took</p>
                        <p className="text-gray-500 text-xs mt-1">JPG, PNG — Max 10MB</p>
                      </>
                    )}
                  </div>
                  <input ref={evalInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleEvalFileSelect(e.target.files[0])} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-white">How it works</h3>
                  {[
                    { icon: <Camera className="w-4 h-4" />, text: 'Take photo using recommended angle & settings' },
                    { icon: <Upload className="w-4 h-4" />, text: 'Upload your photo for instant AI analysis' },
                    { icon: <Star className="w-4 h-4" />, text: 'Score composition, posture, lighting & angle' },
                    { icon: <TrendingUp className="w-4 h-4" />, text: 'Receive actionable retake adjustments' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300">
                      <div className="p-2 bg-slate-800 rounded-lg text-accent-400">{item.icon}</div>
                      <span className="text-xs sm:text-sm">{item.text}</span>
                    </div>
                  ))}
                  {evalError && <p className="text-red-400 text-sm mt-2">{evalError}</p>}
                  <button
                    onClick={handleEvaluatePhoto}
                    disabled={!evalFile || evalLoading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-500/25 cursor-pointer"
                  >
                    {evalLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Photo...</> : <><Star className="w-5 h-5" /> Evaluate My Photo</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {evalPreview && <img src={evalPreview} alt="Evaluated" className="w-40 h-40 object-cover rounded-2xl border border-white/10" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-6xl font-black ${
                        evalResult.score >= 80 ? 'text-emerald-400' : evalResult.score >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>{evalResult.score}</div>
                      <div>
                        <div className="text-white font-bold text-xl">{evalResult.grade}</div>
                        <div className="text-gray-400 text-sm">out of 100</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[['Composition', evalResult.composition_score], ['Lighting', evalResult.lighting_score], ['Pose', evalResult.pose_score], ['Background', evalResult.background_score]].map(([label, score]) => (
                        <div key={label as string} className="bg-slate-800/50 rounded-xl p-3 text-center">
                          <div className={`text-2xl font-bold ${(score as number) >= 80 ? 'text-emerald-400' : (score as number) >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{score}</div>
                          <div className="text-gray-400 text-xs mt-1">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> What Worked</h4>
                    <ul className="space-y-2">{(evalResult.good_points || []).map((p: string, i: number) => <li key={i} className="text-gray-300 text-sm flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span>{p}</li>)}</ul>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Improvements</h4>
                    <ul className="space-y-2">{(evalResult.improvements || []).map((p: string, i: number) => <li key={i} className="text-gray-300 text-sm flex items-start gap-2"><span className="text-amber-400 mt-0.5">→</span>{p}</li>)}</ul>
                  </div>
                  <div className="bg-accent-500/10 border border-accent-500/20 rounded-2xl p-4">
                    <h4 className="text-accent-400 font-semibold mb-3 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Retake Instructions</h4>
                    <ul className="space-y-2">{(evalResult.retake_instructions || []).map((p: string, i: number) => <li key={i} className="text-gray-300 text-sm flex items-start gap-2"><span className="text-accent-400 font-bold">{i+1}.</span>{p}</li>)}</ul>
                  </div>
                </div>

                <button onClick={() => { setEvalResult(null); setEvalFile(null); setEvalPreview(null); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">
                  <RotateCcw className="w-4 h-4" /> Evaluate Another Photo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 11. Footer navigation */}
        <div className="flex justify-center border-t border-white/10 pt-8">
          <Link 
            to="/create"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-purple-600 text-white font-semibold hover:from-accent-500 hover:to-purple-500 transition-all flex items-center shadow-lg shadow-accent-600/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Another Photo
          </Link>
        </div>

      </div>
    </div>
  );
}
