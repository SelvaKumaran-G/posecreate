import React, { useEffect, useState } from 'react';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  animated?: boolean;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
  score, 
  size = 'md', 
  label, 
  animated = true 
}) => {
  const [currentScore, setCurrentScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentScore(score);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentScore(score);
    }
  }, [score, animated]);

  let colorClass = 'text-red-500';
  if (score >= 81) colorClass = 'text-emerald-500';
  else if (score >= 61) colorClass = 'text-accent-500';
  else if (score >= 41) colorClass = 'text-amber-500';

  const sizeMap = {
    sm: { width: 80, stroke: 4, text: 'text-xl' },
    md: { width: 120, stroke: 6, text: 'text-3xl' },
    lg: { width: 160, stroke: 8, text: 'text-5xl' },
  };

  const { width, stroke, text } = sizeMap[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative flex items-center justify-center" 
        style={{ width, height: width }}
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            className="text-slate-800"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-bold ${text} text-white`}>
            {Math.round(currentScore)}
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreCircle;
