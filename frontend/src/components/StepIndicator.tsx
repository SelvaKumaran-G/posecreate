import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: { label: string; icon?: React.ReactNode }[];
  currentStep: number; // 0-indexed
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative gap-4 md:gap-0">
        {/* Desktop connecting line */}
        <div className="hidden md:block absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-10" />
        <div 
          className="hidden md:block absolute top-4 left-0 h-0.5 bg-accent-600 transition-all duration-500 ease-in-out -z-10" 
          style={{ width: `${(currentStep / (Math.max(steps.length - 1, 1))) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex md:flex-col items-center gap-3 md:gap-2 relative w-full md:w-auto z-0">
              {/* Mobile connecting line */}
              {index !== steps.length - 1 && (
                <div className="md:hidden absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-800 -z-10" />
              )}
              {index < currentStep && (
                <div className="md:hidden absolute left-4 top-8 bottom-[-16px] w-0.5 bg-accent-600 -z-10" />
              )}
              
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-accent-600 border-accent-600 text-white'
                    : isCurrent
                    ? 'bg-slate-900 border-accent-500 text-accent-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              
              <span 
                className={`text-sm font-medium ${
                  isCurrent 
                    ? 'text-accent-400' 
                    : isCompleted 
                    ? 'text-gray-300' 
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
