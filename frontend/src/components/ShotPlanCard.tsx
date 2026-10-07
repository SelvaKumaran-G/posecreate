import React from 'react';
import { ShotPlan } from '../types';
import { 
  Camera, 
  Compass, 
  Maximize2, 
  Sun, 
  Smartphone, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import PoseVisualizer from './PoseVisualizer';

interface ShotPlanCardProps {
  plan: ShotPlan;
  index: number;
}

export const ShotPlanCard: React.FC<ShotPlanCardProps> = ({ plan, index }) => {
  // Safe extraction of camera_settings whether it's an object or a JSON string
  let parsedCamera: Record<string, any> = {};
  if (typeof plan.camera_settings === 'object' && plan.camera_settings !== null) {
    parsedCamera = plan.camera_settings;
  } else if (typeof plan.camera_settings === 'string') {
    try {
      parsedCamera = JSON.parse(plan.camera_settings);
    } catch {
      parsedCamera = { raw: plan.camera_settings };
    }
  }

  // Safe extraction of pose string or object
  let poseName = '';
  let poseDetails: Record<string, any> = {};
  if (typeof plan.pose === 'string') {
    // Check if it's a JSON string
    if (plan.pose.trim().startsWith('{')) {
      try {
        poseDetails = JSON.parse(plan.pose);
        poseName = poseDetails.name || poseDetails.pose_name || plan.shot_name || 'Recommended Pose';
      } catch {
        poseName = plan.pose;
      }
    } else {
      poseName = plan.pose;
    }
  } else if (typeof plan.pose === 'object' && plan.pose !== null) {
    poseDetails = plan.pose;
    poseName = poseDetails.name || poseDetails.pose_name || plan.shot_name || 'Recommended Pose';
  } else {
    poseName = plan.shot_name || `Shot ${index + 1}`;
  }

  const cameraAngle = parsedCamera.angle || parsedCamera.camera_angle || 'Waist-Level 90cm';
  const cameraMode = parsedCamera.mode || parsedCamera.camera_mode || 'Portrait Mode';
  const cameraLens = parsedCamera.lens || '2x Optical Lens';
  const cameraZoom = parsedCamera.zoom || '2x';
  const cameraExposure = parsedCamera.exposure || '-0.3 EV';
  const cameraAspect = parsedCamera.aspect_ratio || '4:3';

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-accent-500/30 transition-all duration-300 shadow-xl">
      {/* Step Number Sidebar Badge */}
      <div className="bg-gradient-to-b from-accent-600 to-purple-700 p-4 md:p-5 flex md:flex-col items-center justify-between md:justify-center md:w-20 shrink-0 text-center">
        <span className="text-[11px] font-bold text-accent-200 uppercase tracking-widest">
          STEP
        </span>
        <span className="text-3xl font-black text-white md:my-1">
          {index + 1}
        </span>
        <span className="text-[10px] text-accent-200/80 hidden md:block font-medium">
          SHOT PLAN
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-5 md:p-6 flex-1 space-y-5">
        
        {/* Title and Description */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Photo Sequence Step {index + 1}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {plan.shot_name || poseName}
            </h3>
            {plan.description && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {plan.description}
              </p>
            )}
          </div>

          {/* Quick Angle Badge */}
          <div className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 self-start">
            <Compass className="w-3.5 h-3.5" />
            {cameraAngle}
          </div>
        </div>

        {/* Visual Diagram & Settings Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Real Human Photo Preview Diagram */}
          <div className="lg:col-span-4 flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Real Human Pose
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Photo Reference
              </span>
            </span>
            <div className="h-48 w-full flex-1 rounded-xl overflow-hidden border border-white/10 shadow-lg relative group bg-slate-950">
              <img 
                src={plan.preview_image_url || 'http://localhost:8000/static/reference_poses/standing_lean.jpg'}
                alt={plan.shot_name || 'Shot Preview'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'http://localhost:8000/static/reference_poses/standing_lean.jpg';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent">
                <p className="text-[11px] font-bold text-white truncate drop-shadow">
                  {poseName}
                </p>
              </div>
            </div>
          </div>

          {/* Camera Settings & Pose Cards */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
            
            {/* Camera Setup Badges Grid */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Camera Setup
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {cameraMode}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Lens / Zoom</span>
                  <span className="text-xs font-bold text-white truncate">{cameraLens} ({cameraZoom})</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Angle</span>
                  <span className="text-xs font-bold text-cyan-300 truncate">{cameraAngle}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Exposure</span>
                  <span className="text-xs font-bold text-amber-300 truncate">{cameraExposure}</span>
                </div>
              </div>
            </div>

            {/* Pose & Positioning Details */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Pose & Body Action
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {poseName}
              </p>
              {plan.subject_position && (
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-purple-300">Position: </strong>{plan.subject_position}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Step Instructions Callout */}
        {plan.photographer_instructions && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              !
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Photographer Step Instruction
              </h4>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                {plan.photographer_instructions}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShotPlanCard;
