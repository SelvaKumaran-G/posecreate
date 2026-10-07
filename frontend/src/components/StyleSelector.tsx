import React from 'react';
import { 
  User, 
  Film, 
  Camera, 
  Map, 
  Bike, 
  Coffee, 
  Briefcase 
} from 'lucide-react';

interface StyleSelectorProps {
  value?: string;
  onChange: (style: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => {
  const styles = [
    { id: 'portrait', label: 'Portrait', icon: User, desc: 'Flattering subject focus' },
    { id: 'cinematic', label: 'Cinematic', icon: Film, desc: 'Dramatic lighting & depth' },
    { id: 'instagram', label: 'Instagram', icon: Camera, desc: 'Trendy, social-ready' },
    { id: 'street', label: 'Street', icon: Map, desc: 'Urban & candid' },
    { id: 'bike', label: 'Bike', icon: Bike, desc: 'Action & automotive' },
    { id: 'casual', label: 'Casual', icon: Coffee, desc: 'Natural everyday' },
    { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Clean & formal' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {styles.map(style => {
        const Icon = style.icon;
        const isSelected = value === style.id;
        
        return (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border ${
              isSelected
                ? 'bg-accent-500/10 border-accent-500 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-white/20'
            }`}
          >
            <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-accent-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-semibold mb-1 ${isSelected ? 'text-accent-300' : 'text-gray-300'}`}>
              {style.label}
            </span>
            <span className="text-[10px] text-gray-500 text-center leading-tight">
              {style.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StyleSelector;
