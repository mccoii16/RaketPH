import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, LayoutGrid, Tag, ArrowRight, Sparkles, Globe, Zap, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-lg sm:text-2xl shadow-lg shadow-indigo-500/20">R</div>
            <span className="text-lg sm:text-2xl font-black tracking-tighter">RaketPH</span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-400 text-xs sm:text-base font-bold hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn-indigo px-3 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-base"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-40 pb-12 sm:pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-4 sm:space-y-8 mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] sm:text-sm"
            >
              <Sparkles size={12} className="sm:size-4" />
              The Future of Work is Here
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] sm:leading-[0.9] max-w-4xl mx-auto"
            >
              The Future of Work in the <span className="text-indigo-500">Philippines.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium"
            >
              The first trust-based marketplace for elite Pinoy talent and global employers.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8"
            >
              <button 
                onClick={() => navigate('/register?role=employer')}
                className="w-full sm:w-auto group relative px-8 py-4 sm:py-5 bg-white text-slate-950 font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                Hire Top Talent
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/register?role=employee')}
                className="w-full sm:w-auto group px-8 py-4 sm:py-5 glass-card font-black rounded-2xl transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 border border-white/10 glow-indigo"
              >
                Find Your Dream Job
                <Zap size={20} className="text-indigo-400" />
              </button>
            </motion.div>
          </div>

          {/* Floating Bento Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[400px]">
              <div className="col-span-2 row-span-1 md:row-span-2 glass-card p-6 md:p-8 flex flex-col justify-end border-indigo-500/30">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-500 rounded-xl md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center">
                  <Globe size={24} className="md:size-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2">Global Reach</h3>
                <p className="text-sm md:text-base text-slate-400">Connect with employers worldwide from the comfort of your home.</p>
              </div>
              <div className="col-span-2 glass-card p-4 md:p-6 flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 text-green-400 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="md:size-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm md:text-base">Vouched Profile</h4>
                  <p className="text-xs md:text-sm text-slate-400">100% verified credentials and skills.</p>
                </div>
              </div>
              <div className="glass-card p-4 md:p-6 flex flex-col justify-center items-center text-center">
                <Zap className="text-yellow-400 mb-1 md:mb-2 size-5 md:size-6" />
                <span className="text-xl md:text-2xl font-black">24h</span>
                <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold">Avg. Hire</span>
              </div>
              <div className="glass-card p-4 md:p-6 flex flex-col justify-center items-center text-center">
                <LayoutGrid className="text-indigo-400 mb-1 md:mb-2 size-5 md:size-6" />
                <span className="text-xl md:text-2xl font-black">Bento</span>
                <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold">Profiles</span>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-20 -right-20 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
            <div className="absolute -z-10 -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="py-20 px-6 border-y border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "100% Vouched Talent", color: "text-indigo-400" },
            { icon: Eye, title: "Instant Seen Receipts", color: "text-green-400" },
            { icon: Zap, title: "GCash/Maya Ready", color: "text-yellow-400" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex items-center gap-6 group hover:border-white/20 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-xl font-black">{stat.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Showcase (Bento Style) */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Built for the <span className="text-indigo-500">2026</span> Economy</h2>
            <p className="text-xl text-slate-400 font-medium">Modern features for a modern workforce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-10 group hover:bg-white/5 transition-all duration-500">
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-8 group-hover:glow-green transition-all">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Seen Receipts</h3>
              <p className="text-slate-400 leading-relaxed">No more ghosting. Know exactly when an employer views your application with real-time status indicators.</p>
            </div>

            <div className="glass-card p-10 group hover:bg-white/5 transition-all duration-500">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-8 group-hover:glow-indigo transition-all">
                <LayoutGrid size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Bento Profiles</h3>
              <p className="text-slate-400 leading-relaxed">Ditch the boring resume. Showcase your skills, certificates, and personality in a beautiful, high-conversion bento grid.</p>
            </div>

            <div className="glass-card p-10 group hover:bg-white/5 transition-all duration-500">
              <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-8 group-hover:glow-purple transition-all">
                <Tag size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Culture Tags</h3>
              <p className="text-slate-400 leading-relaxed">Find the perfect fit. Job cards feature neon-outlined pills for HMO, 13th Month, and other essential perks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black text-lg">R</div>
            <span className="text-xl font-black tracking-tighter">RaketPH</span>
          </div>
          <p className="text-slate-500 font-medium">© 2026 RaketPH. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
