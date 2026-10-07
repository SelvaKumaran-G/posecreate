import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Calendar, MapPin, ChevronRight, Trash2 } from 'lucide-react';

export default function History() {
  const analyses = [
    { id: 1, date: 'Oct 12, 2026', location: 'Downtown Alley', score: 85, style: 'Streetwear' },
    { id: 2, date: 'Oct 10, 2026', location: 'Coffee Shop', score: 92, style: 'Moody' },
    { id: 3, date: 'Oct 5, 2026', location: 'Park Bridge', score: 78, style: 'Bright & Airy' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Analyses</h1>
        <p className="text-gray-400">Review past photography plans and recommendations.</p>
      </div>

      <div className="space-y-4">
        {analyses.map(item => (
          <div key={item.id} className="group bg-slate-800/40 border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:border-accent-500/20">
                <Camera className="w-6 h-6 text-gray-500 group-hover:text-accent-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{item.location}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {item.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.style}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
              <div className="bg-slate-900 px-4 py-2 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium">Score</span>
                <span className="font-bold text-accent-400">{item.score}</span>
              </div>
              <Link to={`/results/${item.id}`} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                View <ChevronRight className="w-4 h-4" />
              </Link>
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
