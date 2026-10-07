import React from 'react';

interface PoseVisualizerProps {
  poseType?: string;
  className?: string;
}

export const PoseVisualizer: React.FC<PoseVisualizerProps> = ({ 
  poseType = 'casual_stand',
  className = 'w-full h-48' 
}) => {
  const normalized = (poseType || '').toLowerCase();

  // Render stylized visual SVG silhouettes with key posture lines and camera angle indicators
  const renderSVGContent = () => {
    if (normalized.includes('lean') || normalized.includes('wall')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Background wall indicator */}
          <line x1="140" y1="20" x2="140" y2="230" stroke="#334155" strokeWidth="4" strokeDasharray="6 6" />
          <text x="148" y="40" fill="#64748b" fontSize="10" fontFamily="sans-serif">WALL</text>
          
          {/* Head */}
          <circle cx="120" cy="50" r="14" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="2.5" />
          {/* Torso leaning */}
          <line x1="120" y1="64" x2="114" y2="130" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Upper back touching wall */}
          <circle cx="138" cy="85" r="4" fill="#38bdf8" />
          <line x1="120" y1="78" x2="138" y2="85" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
          {/* Arm one in pocket */}
          <path d="M 118 78 L 102 105 L 110 125" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arm two relaxed */}
          <path d="M 122 78 L 132 110 L 134 135" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Rear straight leg taking weight */}
          <line x1="114" y1="130" x2="128" y2="215" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          {/* Front leg crossed over at ankle */}
          <path d="M 114 130 L 98 170 L 136 215" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Camera angle indicator */}
          <g transform="translate(25, 120)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="38" y1="12" x2="85" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="-4" y="38" fill="#38bdf8" fontSize="9" fontWeight="bold">WAIST 0°</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('walk') || normalized.includes('stride')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Floor grid / movement trail */}
          <line x1="40" y1="215" x2="170" y2="215" stroke="#334155" strokeWidth="2" />
          <path d="M 70 215 L 100 190 M 110 215 L 140 190" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Head */}
          <circle cx="100" cy="45" r="14" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="2.5" />
          {/* Torso tall */}
          <line x1="100" y1="59" x2="100" y2="125" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Arms swinging in motion */}
          <path d="M 100 75 L 80 100 L 70 120" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M 100 75 L 122 98 L 132 118" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
          {/* Stride legs: front leg extended */}
          <path d="M 100 125 L 82 170 L 68 215" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Back leg flexing */}
          <path d="M 100 125 L 124 165 L 138 210" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Low camera angle indicator */}
          <g transform="translate(18, 175)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#a855f7" fillOpacity="0.4" stroke="#a855f7" strokeWidth="1.5" />
            <line x1="36" y1="8" x2="80" y2="-40" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="-6" y="38" fill="#a855f7" fontSize="9" fontWeight="bold">LOW 15° ▲</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('seat') || normalized.includes('bench') || normalized.includes('cross_legged')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Ledge / Seat platform */}
          <rect x="75" y="130" width="105" height="15" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <line x1="85" y1="145" x2="85" y2="215" stroke="#334155" strokeWidth="3" />
          <line x1="165" y1="145" x2="165" y2="215" stroke="#334155" strokeWidth="3" />
          
          {/* Head */}
          <circle cx="115" cy="55" r="14" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="2.5" />
          {/* Torso seated leaning slightly */}
          <line x1="115" y1="69" x2="110" y2="130" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Arms resting on knees/edge */}
          <path d="M 113 85 L 90 115 L 82 140" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
          <path d="M 115 85 L 138 115 L 145 130" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          {/* Seated thighs */}
          <line x1="110" y1="130" x2="80" y2="145" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Lower legs dropping down */}
          <path d="M 80 145 L 75 210" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 95 145 L 98 210" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Camera eye-level indicator */}
          <g transform="translate(18, 65)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="38" y1="12" x2="90" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="-4" y="38" fill="#38bdf8" fontSize="9" fontWeight="bold">EYE 0°</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('hero') || normalized.includes('low_angle')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Grand perspective vanishing lines */}
          <line x1="100" y1="40" x2="20" y2="225" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="100" y1="40" x2="180" y2="225" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Head looking high */}
          <circle cx="100" cy="48" r="14" fill="#a855f7" fillOpacity="0.3" stroke="#a855f7" strokeWidth="2.5" />
          {/* Broad Torso */}
          <line x1="100" y1="62" x2="100" y2="125" stroke="#c084fc" strokeWidth="4.5" strokeLinecap="round" />
          {/* Thumbs in belt loops / elbows out */}
          <path d="M 98 75 L 72 95 L 88 122" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 102 75 L 128 95 L 112 122" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Solid rooted stance */}
          <line x1="100" y1="125" x2="75" y2="215" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="125" x2="125" y2="215" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          
          {/* Ultra-low camera upward indicator */}
          <g transform="translate(18, 190)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#f43f5e" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="36" y1="8" x2="85" y2="-90" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="-4" y="38" fill="#f43f5e" fontSize="9" fontWeight="bold">HERO 20° ▲</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('shoulder') || normalized.includes('turn')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Head turned sharply over shoulder */}
          <circle cx="95" cy="50" r="14" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="2.5" />
          {/* Eye line arrow */}
          <line x1="95" y1="50" x2="55" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="55" cy="65" r="3" fill="#38bdf8" />
          
          {/* Torso back 60 degrees */}
          <line x1="105" y1="64" x2="115" y2="128" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Trailing hand touching jacket */}
          <path d="M 103 76 L 85 95 L 94 115" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M 112 76 L 126 100 L 122 125" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
          {/* Weight on front leg */}
          <line x1="115" y1="128" x2="105" y2="215" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 115 128 L 130 170 L 138 215" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Camera eye level */}
          <g transform="translate(18, 80)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="38" y1="12" x2="85" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="-2" y="38" fill="#38bdf8" fontSize="9" fontWeight="bold">TURN 0°</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('portrait') || normalized.includes('close')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Soft bokeh circles in background */}
          <circle cx="45" cy="45" r="22" fill="#38bdf8" fillOpacity="0.08" />
          <circle cx="160" cy="65" r="30" fill="#a855f7" fillOpacity="0.08" />
          <circle cx="140" cy="160" r="18" fill="#38bdf8" fillOpacity="0.08" />
          
          {/* Close Head framing */}
          <circle cx="100" cy="85" r="28" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="3" />
          {/* Eye landmarks */}
          <circle cx="92" cy="82" r="2" fill="#38bdf8" />
          <circle cx="110" cy="82" r="2" fill="#38bdf8" />
          {/* Subtle smile */}
          <path d="M 94 98 Q 101 104 108 98" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          
          {/* Shoulders & Lapel framing */}
          <path d="M 72 113 L 55 185 M 128 113 L 145 185" stroke="#c084fc" strokeWidth="4.5" strokeLinecap="round" />
          {/* Hand framing collar */}
          <path d="M 68 185 L 75 140 L 92 135" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Camera bokeh portrait indicator */}
          <g transform="translate(18, 160)">
            <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#a855f7" fillOpacity="0.4" stroke="#a855f7" strokeWidth="1.5" />
            <text x="-4" y="38" fill="#a855f7" fontSize="9" fontWeight="bold">f/2.0 BOKEH</text>
          </g>
        </svg>
      );
    }

    if (normalized.includes('symmetry') || normalized.includes('center')) {
      return (
        <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
          {/* Vanishing point lines */}
          <line x1="100" y1="20" x2="100" y2="230" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20" y1="230" x2="100" y2="100" stroke="#334155" strokeWidth="1.5" />
          <line x1="180" y1="230" x2="100" y2="100" stroke="#334155" strokeWidth="1.5" />
          <line x1="30" y1="40" x2="100" y2="100" stroke="#334155" strokeWidth="1.5" />
          <line x1="170" y1="40" x2="100" y2="100" stroke="#334155" strokeWidth="1.5" />
          
          {/* Symmetrical Head */}
          <circle cx="100" cy="55" r="14" fill="#a855f7" fillOpacity="0.3" stroke="#a855f7" strokeWidth="2.5" />
          {/* Torso centered */}
          <line x1="100" y1="69" x2="100" y2="130" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
          {/* Symmetrical arms */}
          <path d="M 100 80 L 80 105 L 94 125" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 100 80 L 120 105 L 106 125" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Symmetrical legs */}
          <line x1="100" y1="130" x2="88" y2="215" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="100" y1="130" x2="112" y2="215" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Crosshairs */}
          <circle cx="100" cy="100" r="8" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    }

    // Default: Standing relaxed posture
    return (
      <svg viewBox="0 0 200 240" className="w-full h-full" fill="none" stroke="currentColor">
        {/* Head */}
        <circle cx="100" cy="48" r="14" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="2.5" />
        {/* Torso */}
        <line x1="100" y1="62" x2="98" y2="128" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
        {/* Relaxed hands */}
        <path d="M 98 78 L 78 105 L 72 135" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 78 L 122 105 L 126 135" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
        {/* Natural relaxed stance */}
        <line x1="98" y1="128" x2="88" y2="215" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 98 128 L 115 170 L 118 215" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Camera guide */}
        <g transform="translate(18, 120)">
          <rect x="0" y="0" width="34" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="17" cy="12" r="5" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="38" y1="12" x2="80" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="-4" y="38" fill="#38bdf8" fontSize="9" fontWeight="bold">LEVEL 0°</text>
        </g>
      </svg>
    );
  };

  return (
    <div className={`relative bg-slate-900/80 rounded-2xl border border-white/10 flex items-center justify-center p-3 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      {renderSVGContent()}
    </div>
  );
};

export default PoseVisualizer;
