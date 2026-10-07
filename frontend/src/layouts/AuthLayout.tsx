import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Camera className="w-10 h-10 text-accent-500 group-hover:text-accent-400 transition-colors" />
            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-500 to-amber-500">
              PoseAI
            </span>
          </Link>
        </div>
        <div className="bg-zinc-950/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
          <Outlet />
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
