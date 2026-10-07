import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Image, Shirt, Bike, Sliders, User, LayoutDashboard, Shield, Smartphone } from 'lucide-react';

export default function Landing() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-accent-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-accent-500" />
            <span className="text-xl font-bold tracking-tight">PoseAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="text-sm font-medium bg-white text-slate-950 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 ease-out">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Your AI <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-amber-500">Personal Photographer</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Analyze your location, outfit, bike and smartphone camera to discover the perfect pose, angle and camera settings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-accent-500/25 transition-all text-lg flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" /> Start Photography Analysis
            </Link>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-medium rounded-full hover:bg-slate-700 transition-colors text-lg border border-white/5">
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for the Perfect Shot</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our AI considers every element of your scene to craft the perfect photography plan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Image, title: 'Scene Analysis', desc: 'Evaluates lighting, composition, and background to find the best spot.' },
              { icon: Shirt, title: 'Outfit Matching', desc: 'Analyzes your clothes to recommend complementary poses and colors.' },
              { icon: Bike, title: 'Vehicle Integration', desc: 'Perfectly positions your motorcycle or car in the frame.' },
              { icon: Sliders, title: 'Smart Camera Settings', desc: 'Specific recommendations tailored to your smartphone model.' },
              { icon: User, title: 'Pose Generation', desc: 'Professional, natural-looking poses that flatter you.' },
              { icon: LayoutDashboard, title: 'Shot Planning', desc: 'A complete step-by-step plan with multiple angles to capture.' }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-accent-500/30 transition-colors animate-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: `${i * 100}ms`, transitionDuration: '700ms' }}>
                <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mb-4 text-accent-500">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Four simple steps to professional-quality photos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-accent-500/0 via-accent-500/50 to-accent-500/0 -z-10"></div>
            {[
              { step: 1, title: 'Upload Photos', desc: 'Share your location, outfit, and vehicle.' },
              { step: 2, title: 'Select Phone', desc: 'Tell us which smartphone you are using.' },
              { step: 3, title: 'AI Analysis', desc: 'Our AI processes billions of parameters.' },
              { step: 4, title: 'Get Guidance', desc: 'Receive your personalized shot plan.' }
            ].map((step, i) => (
              <div key={i} className="text-center animate-on-scroll opacity-0 translate-y-8" style={{ transitionDelay: `${i * 150}ms`, transitionDuration: '700ms' }}>
                <div className="w-16 h-16 bg-slate-900 border-2 border-accent-500 text-accent-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-accent-900/20 border-y border-accent-500/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <Camera className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-1">Professional Results</h3>
            <p className="text-gray-400">Studio-quality guidance</p>
          </div>
          <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
            <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-1">Privacy First</h3>
            <p className="text-gray-400">Photos processed securely</p>
          </div>
          <div className="text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
            <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-1">100+ Phone Models</h3>
            <p className="text-gray-400">Optimized for your device</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-300">PoseAI</span>
        </div>
        <p>© 2026 PoseAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
