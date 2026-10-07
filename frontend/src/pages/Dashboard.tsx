import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Activity, Star, Zap, Plus, History, MapPin } from 'lucide-react';

export default function Dashboard() {
  const userName = "User";
  const analyses: any[] = [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userName}</h1>
          <p className="text-gray-400">Ready to plan your next photoshoot?</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Analyses</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Best Score</p>
            <p className="text-2xl font-bold">94/100</p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-500/10 text-accent-500 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Recent Style</p>
            <p className="text-2xl font-bold">Streetwear</p>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/create" className="group block relative overflow-hidden bg-slate-800/80 border border-accent-500/30 rounded-3xl p-8 transition-all hover:border-accent-500/60 hover:shadow-xl hover:shadow-accent-500/10">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-accent-600/20 rounded-full blur-[60px] group-hover:bg-accent-500/30 transition-all"></div>
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg text-white shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Image Analysis</h2>
              <p className="text-gray-400 mb-4">Upload your location & gear to get AI-powered photography guidance.</p>
              <div className="inline-flex items-center gap-2 text-accent-400 font-medium group-hover:text-accent-300">
                Start Photo Analysis <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/photospots" className="group block relative overflow-hidden bg-slate-800/80 border border-emerald-500/30 rounded-3xl p-8 transition-all hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-600/20 rounded-full blur-[60px] group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg text-white shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Photo Spots</h2>
              <p className="text-gray-400 mb-4">Discover amazing photography locations near you or search for spots anywhere.</p>
              <div className="inline-flex items-center gap-2 text-emerald-400 font-medium group-hover:text-emerald-300">
                Explore Spots <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" /> Recent Analyses
          </h2>
          <Link to="/history" className="text-sm text-accent-400 hover:text-accent-300 font-medium">View All</Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No analyses yet</h3>
            <p className="text-gray-500 mb-6">Start your first photography analysis to see results here.</p>
            <Link to="/create" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-full hover:bg-slate-700 transition-colors border border-white/10">
              <Plus className="w-4 h-4" /> Create Analysis
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            <p className="text-gray-500">History will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
