import React from 'react';
import { CameraRecommendation } from '../types';
import { 
  Aperture, 
  Maximize, 
  Ruler, 
  ArrowUpDown, 
  Smartphone, 
  Image as ImageIcon, 
  Sun, 
  Zap, 
  Layers 
} from 'lucide-react';

interface CameraSetupCardProps {
  recommendation: CameraRecommendation;
}

const CameraSetupCard: React.FC<CameraSetupCardProps> = ({ recommendation }) => {
  const settings = [
    { label: 'Mode', value: recommendation.mode, icon: <Aperture className="w-4 h-4" /> },
    { label: 'Lens', value: recommendation.lens, icon: <Aperture className="w-4 h-4" /> },
    { label: 'Zoom', value: recommendation.zoom, icon: <Maximize className="w-4 h-4" /> },
    { label: 'Distance', value: recommendation.distance, icon: <Ruler className="w-4 h-4" /> },
    { label: 'Height', value: recommendation.camera_height, icon: <ArrowUpDown className="w-4 h-4" /> },
    { label: 'Orientation', value: recommendation.orientation, icon: <Smartphone className="w-4 h-4" /> },
    { label: 'Aspect Ratio', value: recommendation.aspect_ratio, icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Exposure', value: recommendation.exposure, icon: <Sun className="w-4 h-4" /> },
    { label: 'Flash', value: recommendation.flash, icon: <Zap className="w-4 h-4" /> },
    { label: 'HDR', value: recommendation.hdr ? 'On' : 'Off', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-slate-800/80">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Aperture className="w-5 h-5 text-accent-500" />
          Camera Setup
        </h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {settings.map((setting, idx) => (
            <div key={idx} className="flex flex-col p-3 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1">
                {setting.icon}
                {setting.label}
              </span>
              <span className="text-sm font-semibold text-white">
                {setting.value}
              </span>
            </div>
          ))}
        </div>

        {recommendation.instructions && (
          <div className="mt-4 p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
            <h4 className="text-sm font-medium text-accent-400 mb-1">Expert Tips</h4>
            <p className="text-sm text-gray-300">
              {recommendation.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraSetupCard;
