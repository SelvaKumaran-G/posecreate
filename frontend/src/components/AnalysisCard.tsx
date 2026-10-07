import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisSession } from '../types';
import { Trash2, Smartphone, Calendar, AlertTriangle } from 'lucide-react';

interface AnalysisCardProps {
  session: AnalysisSession;
  onDelete?: (id: string) => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ session, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const statusColors = {
    processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusClass = statusColors[session.status as keyof typeof statusColors] || statusColors.processing;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirm && onDelete) {
      onDelete(session.id);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(session.created_at));

  return (
    <Link 
      to={`/results/${session.id}`}
      className="group block bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-accent-500/50 hover:bg-slate-800 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row h-full">
        <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative bg-slate-900 border-r border-white/5">
          {session.location_image_url ? (
            <img 
              src={session.location_image_url} 
              alt="Location thumbnail" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-2">
            {session.overall_score !== undefined && (
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white border border-white/10">
                Score: {session.overall_score}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium border backdrop-blur-md ${statusClass} capitalize`}>
              {session.status}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white capitalize">
                {session.photography_style || 'Custom Analysis'}
              </h3>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showConfirm 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Delete Analysis"
                >
                  {showConfirm ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Smartphone className="w-4 h-4" />
                <span>{session.phone_model || 'Generic Smartphone'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm font-medium text-accent-400 group-hover:text-accent-300 transition-colors flex items-center gap-1">
            View Details &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnalysisCard;
