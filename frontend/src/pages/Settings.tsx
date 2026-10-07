import React from 'react';
import { User, Mail, ShieldAlert, LogOut, Palette } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export default function Settings() {
  const { themeColor, setThemeColor } = useTheme();
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences.</p>
      </div>

      <div className="bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme Preferences</h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">App Color Theme</label>
            <div className="flex gap-4">
              {['violet', 'blue', 'emerald', 'rose', 'amber'].map(color => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color as any)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${themeColor === color ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: color === 'violet' ? '#8b5cf6' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#f59e0b' }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 border-b border-white/5">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <div className="relative max-w-md">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  defaultValue="Alex Parker"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative max-w-md">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  defaultValue="alex@example.com"
                  readOnly
                  className="w-full bg-slate-900/50 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Email address cannot be changed directly.</p>
            </div>

            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-red-950/10">
          <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xl">
            Once you delete your account, there is no going back. All your uploaded images, analyses, and saved plans will be permanently deleted.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors">
              Delete Account
            </button>
            <button className="bg-slate-800 text-gray-300 border border-white/10 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


