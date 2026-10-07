import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Lightbulb, Camera, Sliders, 
  CheckCircle2, Sparkles, Maximize2, X, Eye, EyeOff, 
  Download, Compass, Layers 
} from 'lucide-react';
import { PoseRecommendation } from '../types';
import PoseVisualizer from './PoseVisualizer';

interface PoseCardProps {
  pose: PoseRecommendation & {
    camera_angle?: string;
    quality_adjustment?: string;
    pose_type_id?: string;
    category?: string;
    preview_image_url?: string;
  };
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

const PoseCard: React.FC<PoseCardProps> = ({ 
  pose, 
  index, 
  expanded = false, 
  onToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggle = () => {
    if (onToggle) onToggle();
    else setIsExpanded(!isExpanded);
  };

  const openState = onToggle !== undefined ? expanded : isExpanded;

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const difficultyClass = difficultyColors[pose.difficulty as keyof typeof difficultyColors] || difficultyColors.Medium;

  // Extract camera angle and quality if embedded in text or direct fields
  const cameraAngle = pose.camera_angle || 
    (pose.instructions?.includes('📐 Angle:') ? pose.instructions.split('📐 Angle:')[1].split('\n')[0].trim() : pose.camera_position);

  const qualitySetup = pose.quality_adjustment || 
    (pose.instructions?.includes('⚙️ Quality Setup:') ? pose.instructions.split('⚙️ Quality Setup:')[1].split('\n')[0].trim() : 'Portrait Mode • 2x Lens • -0.3 EV');

  const cleanInstructions = pose.instructions
    ?.replace(/📐 Angle:.*?\n/g, '')
    .replace(/⚙️ Quality Setup:.*?\n/g, '')
    .trim() || pose.instructions;

  // Real human preview image URL (fallback to backend reference if not direct)
  const previewUrl = pose.preview_image_url || 
    (pose.pose_type_id ? `http://localhost:8000/static/reference_poses/${pose.pose_type_id}.jpg` : 'http://localhost:8000/static/reference_poses/standing_lean.jpg');

  return (
    <>
      <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 shadow-xl">
        {/* Header Bar */}
        <div 
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors"
          onClick={toggle}
        >
          <div className="flex items-center gap-4">
            {/* Index Number */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/30 to-purple-600/30 text-accent-300 font-bold border border-accent-500/30 shadow-inner shrink-0">
              {index + 1}
            </div>

            {/* Thumbnail Preview (Real Human Photo) */}
            {previewUrl && !imageError && (
              <div className="hidden xs:block relative w-12 h-14 rounded-lg overflow-hidden border border-white/10 shadow-sm shrink-0 bg-slate-950">
                <img 
                  src={previewUrl} 
                  alt={pose.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-white py-0.5 font-medium uppercase tracking-tighter">
                  Real
                </span>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{pose.name}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyClass}`}>
                  {pose.difficulty}
                </span>
                {pose.category && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-white/5">
                    {pose.category}
                  </span>
                )}
              </div>
              
              {/* Quick Angle Badge on collapsed view */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  {cameraAngle}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Real Human Photo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-base font-bold bg-gradient-to-r from-accent-400 to-amber-400 bg-clip-text text-transparent">
                {pose.score || 92}%
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Match</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-gray-400">
              {openState ? (
                <ChevronUp className="w-5 h-5 text-accent-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content Drawer */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openState ? 'max-h-[2200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 border-t border-white/10 space-y-6 bg-slate-950/50">
            
            {/* Visual Real Human Photo & Quick Settings Hero Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Column: Real Human Photo Preview */}
              <div className="md:col-span-5 flex flex-col">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Real Human Image in Background
                  </span>
                  
                  {/* Subtle wireframe toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWireframe(!showWireframe);
                    }}
                    className="text-[11px] text-accent-400 hover:text-accent-300 font-medium transition-colors flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10"
                    title="Toggle Technical Posture Silhouette"
                  >
                    <Layers className="w-3 h-3" />
                    {showWireframe ? 'Show Real Human' : 'Wireframe'}
                  </button>
                </div>

                {/* Primary Visual Area */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl flex-1 min-h-[300px] max-h-[420px] flex items-center justify-center group">
                  {showWireframe ? (
                    /* Optional Secondary 2D Silhouette Wireframe */
                    <PoseVisualizer 
                      poseType={pose.pose_type_id || pose.name} 
                      className="h-full w-full p-4"
                    />
                  ) : (
                    /* PRIMARY REAL HUMAN PHOTO PREVIEW */
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <img 
                        src={previewUrl} 
                        alt={`${pose.name} Real Human Preview`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        onError={(e) => {
                          // Fallback to default real human photo
                          const target = e.target as HTMLImageElement;
                          target.src = 'http://localhost:8000/static/reference_poses/standing_lean.jpg';
                        }}
                      />
                      
                      {/* Gradient overlay on bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/90 text-white backdrop-blur-md shadow-md flex items-center gap-1.5 border border-emerald-400/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          Authentic Real Human
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLightbox(true);
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md hover:scale-105 border border-white/20"
                          title="Enlarge Full Screen"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom Caption Inside Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div>
                          <p className="text-white text-xs font-bold drop-shadow-md">
                            {pose.name}
                          </p>
                          <p className="text-[11px] text-gray-300 drop-shadow-md">
                            Photorealistic 85mm f/1.4 Perspective
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLightbox(true);
                          }}
                          className="pointer-events-auto px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold backdrop-blur-md transition-colors border border-white/20"
                        >
                          Inspect Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Quick Angle & Quality Pill Box */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                {/* Camera Angle Card */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 shadow-inner">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1.5">
                    <Camera className="w-4 h-4" />
                    Recommended Camera Angle & Height
                  </div>
                  <p className="text-white text-base font-bold">
                    {cameraAngle}
                  </p>
                  <p className="text-xs text-cyan-200/80 mt-1.5 leading-relaxed">
                    Align your phone with the indicated camera elevation and angle for optimal proportions and vanishing point perspective.
                  </p>
                </div>

                {/* Quality Adjustment Card */}
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 shadow-inner">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Mobile Quality Adjustment & Settings
                  </div>
                  <p className="text-white text-sm font-semibold">
                    {qualitySetup}
                  </p>
                  <p className="text-xs text-purple-200/80 mt-1.5 leading-relaxed">
                    Tap the subject's face to lock AE/AF, dial exposure slider down -0.3 EV to retain background highlight textures.
                  </p>
                </div>

                {/* Real Human Guide Highlights */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Natural Human Posing Note
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                    This pose is calibrated with natural human weight distribution, relaxed facial muscles, and organic posture lines to create effortless, authentic lifestyle photography.
                  </p>
                </div>
              </div>
            </div>

            {/* Positioning Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10">
                <span className="text-[11px] font-bold text-accent-400 uppercase tracking-wider block mb-1">
                  Body Posture
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {pose.body_position}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Hand Placement
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {pose.hand_position}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Leg Stance
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {pose.leg_position}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/10">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Head & Expression
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {pose.head_position || 'Facing light'} • {pose.facial_expression}
                </p>
              </div>
            </div>

            {/* Step by Step Guidance */}
            {cleanInstructions && (
              <div className="p-4 rounded-xl bg-slate-800/70 border border-white/10 space-y-2 shadow-inner">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Step-by-Step Photographer Guide
                </h4>
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line space-y-1.5 pl-1">
                  {cleanInstructions}
                </div>
              </div>
            )}

            {/* Why This Works */}
            {pose.reason && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Why This Works For This Background
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {pose.reason}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* High-Resolution Photo Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLightbox(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Big Photo Container */}
            <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[350px] max-h-[70vh]">
              <img 
                src={previewUrl} 
                alt={`${pose.name} Full Preview`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Details Sidebar */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-slate-900/95 space-y-4">
              <div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-2">
                  ✨ Real Human Reference Photo
                </span>
                <h3 className="text-xl font-bold text-white mb-1">
                  {pose.name}
                </h3>
                <p className="text-xs text-cyan-400 font-semibold mb-4">
                  {cameraAngle}
                </p>

                <div className="space-y-3 text-xs text-gray-300">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-white/5">
                    <span className="text-gray-400 font-semibold block mb-0.5">Posture Tip:</span>
                    {pose.body_position}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-white/5">
                    <span className="text-gray-400 font-semibold block mb-0.5">Camera Settings:</span>
                    {qualitySetup}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  View Full Resolution
                </a>
                <button
                  type="button"
                  onClick={() => setShowLightbox(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoseCard;
