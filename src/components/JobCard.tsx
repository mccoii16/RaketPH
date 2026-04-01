import { MapPin, DollarSign, Calendar, Tag, ShieldAlert } from 'lucide-react';
import { Job } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isScammy?: boolean;
  key?: string;
}

export function JobCard({ job, onClick, isScammy }: JobCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden",
        isScammy && "border-red-200 bg-red-50/30"
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-400/10 blur-3xl rounded-full group-hover:bg-blue-400/20 transition-colors" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
          <p className="text-gray-500 font-medium">{job.employerName}</p>
        </div>
        {isScammy && (
          <div className="bg-red-100 text-red-600 p-2 rounded-2xl animate-pulse">
            <ShieldAlert size={20} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-xl">
          <MapPin size={16} className="text-blue-500" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-xl">
          <DollarSign size={16} className="text-green-500" />
          {job.salaryRange}
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-xl">
          <Calendar size={16} className="text-orange-500" />
          {formatDistanceToNow(new Date(job.createdAt))} ago
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.cultureTags.map((tag, i) => (
          <span 
            key={i} 
            className="px-3 py-1 bg-white border border-gray-100 text-gray-600 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1"
          >
            <Tag size={10} className="text-blue-400" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 3).map((skill, i) => (
          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 3 && (
          <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold">
            +{job.requiredSkills.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

export function AntiScamBanner() {
  return (
    <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-start gap-4 mb-8">
      <div className="bg-red-100 p-3 rounded-2xl text-red-600">
        <ShieldAlert size={24} />
      </div>
      <div>
        <h4 className="font-bold text-red-900 text-lg">RaketPH Safety Warning</h4>
        <p className="text-red-700 mt-1 leading-relaxed">
          This job description mentions <span className="font-bold underline">processing fees</span> or <span className="font-bold underline">Telegram-only</span> communication. 
          Legitimate employers will never ask for payment during the application process. Proceed with extreme caution.
        </p>
      </div>
    </div>
  );
}
