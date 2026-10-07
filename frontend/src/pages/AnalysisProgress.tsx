import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Camera, CheckCircle2, Circle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { analysisService } from '../services/analysis';

export default function AnalysisProgress() {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'processing' | 'failed'>('processing');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const hasPerson = searchParams.get('person') === 'true';
  const hasVehicle = searchParams.get('vehicle') === 'true';

  const baseSteps = [
    { id: 'scene', label: "Phase 1: Analyzing your location..." },
    { id: 'lighting', label: "Phase 2: Reading the lighting..." },
  ];
  
  if (hasPerson) {
    baseSteps.push({ id: 'outfit', label: "Phase 3: Analyzing your outfit..." });
  }
  
  if (hasVehicle) {
    baseSteps.push({ id: 'vehicle', label: "Phase 4: Analyzing the vehicle..." });
  }

  baseSteps.push(
    { id: 'phone', label: "Phase 5: Checking phone capabilities..." },
    { id: 'poses', label: "Phase 6: Generating poses..." },
    { id: 'settings', label: "Phase 7: Building camera settings..." },
    { id: 'plan', label: "Phase 8: Creating your photoshoot plan..." },
    { id: 'final', label: "Phase 9: Finalizing recommendations..." }
  );

  const steps = baseSteps;
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const pollStatus = async () => {
    if (!id) return;
    try {
      const response = await analysisService.getAnalysis(id);
      const sessionStatus = response.session.status;
      
      if (sessionStatus === 'completed') {
        setCurrentStep(steps.length);
        setTimeout(() => navigate(`/results/${id}`), 1000);
      } else if (sessionStatus === 'failed') {
        setStatus('failed');
        setError('Analysis failed. Please try again.');
      } else {
        // Increment visual progress while processing
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
        
        pollTimerRef.current = setTimeout(pollStatus, 2000);
      }
    } catch (err: any) {
      // If still processing but polling failed (e.g. network issue), we retry
      console.error(err);
      pollTimerRef.current = setTimeout(pollStatus, 2000);
    }
  };

  useEffect(() => {
    pollStatus();
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [id, navigate]);

  const handleRetry = () => {
    setStatus('processing');
    setError(null);
    setCurrentStep(0);
    pollStatus();
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-xl mx-auto px-4">
      <div className="relative mb-12">
        <div className={`w-32 h-32 bg-slate-900 border-4 rounded-full flex items-center justify-center relative z-10 overflow-hidden ${
          status === 'failed' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-accent-500 shadow-[0_0_30px_rgba(139,92,246,0.3)]'
        }`}>
          {status === 'failed' ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : (
            <>
              <Camera className="w-12 h-12 text-accent-500 animate-pulse" />
              <div className="absolute inset-0 border-[6px] border-t-transparent border-accent-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            </>
          )}
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-2xl -z-10 ${
          status === 'failed' ? 'bg-red-600/20' : 'bg-accent-600/20'
        }`}></div>
      </div>

      <h2 className={`text-2xl font-bold mb-8 text-center bg-clip-text text-transparent ${
        status === 'failed' ? 'bg-gradient-to-r from-red-400 to-rose-400' : 'bg-gradient-to-r from-accent-400 to-amber-400'
      }`}>
        {status === 'failed' ? 'Analysis Failed' : 'AI is processing your scene'}
      </h2>

      {error && (
        <div className="mb-6 w-full text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors font-medium border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Analysis
          </button>
        </div>
      )}

      <div className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl backdrop-blur-sm">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            {index < currentStep ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : index === currentStep && status !== 'failed' ? (
              <Loader2 className="w-6 h-6 text-accent-500 animate-spin shrink-0" />
            ) : status === 'failed' && index === currentStep ? (
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-slate-700 shrink-0" />
            )}
            
            <span className={`text-lg transition-colors duration-300 ${
              index < currentStep ? 'text-gray-400' : 
              index === currentStep && status !== 'failed' ? 'text-white font-medium' : 
              status === 'failed' && index === currentStep ? 'text-red-400 font-medium' :
              'text-slate-600'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

