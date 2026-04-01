import React from 'react';
import { MapPin, DollarSign, Calendar, Tag, ShieldAlert, Heart } from 'lucide-react';
import { Job } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isScammy?: boolean;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  actions?: React.ReactNode;
  key?: string;
}

export function JobCard({ job, onClick, isScammy, isSaved, onToggleSave, actions }: JobCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative glass-card overflow-hidden hover:border-indigo-500/50 transition-all duration-500 cursor-pointer flex flex-col",
        isScammy && "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="w-full h-40 overflow-hidden bg-slate-900 relative">
        <img 
          src={job.bannerUrl || `https://picsum.photos/seed/${job.id}/800/400`} 
          alt={job.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        {onToggleSave && (
          <button 
            onClick={onToggleSave}
            className={cn(
              "absolute top-4 right-4 p-3 rounded-2xl transition-all z-20 backdrop-blur-md border",
              isSaved 
                ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20" 
                : "bg-slate-950/40 text-white/70 border-white/10 hover:bg-slate-950/60 hover:text-white"
            )}
          >
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      
      <div className="p-8 relative flex-1 flex flex-col">
        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-colors" />
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{job.title}</h3>
            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-1">{job.employerName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isScammy && (
              <div className="bg-red-500/20 text-red-500 p-2 rounded-xl animate-pulse border border-red-500/30">
                <ShieldAlert size={20} />
              </div>
            )}
            {actions}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-6 relative z-10">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <MapPin size={14} className="text-indigo-400" />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <DollarSign size={14} className="text-green-400" />
            {job.salaryRange}
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Calendar size={14} className="text-orange-400" />
            {formatDistanceToNow(new Date(job.createdAt))} ago
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
          {job.cultureTags.map((tag, i) => (
            <span 
              key={i} 
              className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <Tag size={10} className="text-indigo-400" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
          {job.requiredSkills.slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-white/5 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="px-2 py-1 bg-white/5 text-slate-500 rounded-lg text-[10px] font-bold">
              +{job.requiredSkills.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AntiScamBanner() {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 flex items-start gap-6 mb-12 relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full" />
      <div className="bg-red-500/20 p-4 rounded-2xl text-red-500 relative z-10 group-hover:scale-110 transition-transform">
        <ShieldAlert size={32} />
      </div>
      <div className="relative z-10">
        <h4 className="font-black text-red-500 text-2xl tracking-tight mb-2 uppercase">RaketPH Safety Warning</h4>
        <p className="text-red-400/80 leading-relaxed font-medium">
          This job description mentions <span className="font-bold text-red-400 underline decoration-red-500/50 underline-offset-4">processing fees</span> or <span className="font-bold text-red-400 underline decoration-red-500/50 underline-offset-4">Telegram-only</span> communication. 
          Legitimate employers will never ask for payment during the application process. Proceed with extreme caution.
        </p>
      </div>
    </div>
  );
}
