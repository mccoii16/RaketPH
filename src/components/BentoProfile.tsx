import { CheckCircle2, Award, Briefcase, GraduationCap } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface BentoProfileProps {
  profile: UserProfile;
  matchScore?: number;
}

export function BentoProfile({ profile, matchScore }: BentoProfileProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 max-w-6xl mx-auto">
      {/* Top-Left: Profile Pic & Intro (2x2) */}
      <div className="md:col-span-2 md:row-span-2 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
        <div className="relative">
          <img 
            src={profile.photoURL || 'https://picsum.photos/seed/user/200/200'} 
            alt={profile.displayName}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            referrerPolicy="no-referrer"
          />
          {profile.isVouched && (
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
              <CheckCircle2 size={20} />
            </div>
          )}
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">{profile.displayName}</h2>
        <p className="text-blue-600 font-medium uppercase tracking-wider text-sm mt-1">{profile.role}</p>
        <p className="mt-4 text-gray-600 leading-relaxed max-w-sm">
          {profile.intro || "No introduction provided yet."}
        </p>
        
        {matchScore !== undefined && (
          <div className="mt-8 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
            <span className="text-blue-600 font-bold text-xl">{matchScore}%</span>
            <span className="text-blue-400 ml-2 font-medium">Match Score</span>
          </div>
        )}
      </div>

      {/* Top-Right: Top 3 Skills (2x1) */}
      <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} className="text-blue-500" />
          Top Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills?.slice(0, 5).map((skill, i) => (
            <span 
              key={i} 
              className="px-4 py-2 bg-blue-500/10 text-blue-700 rounded-xl text-sm font-semibold border border-blue-200"
            >
              {skill}
            </span>
          )) || <p className="text-gray-400 italic">No skills listed</p>}
        </div>
      </div>

      {/* Middle: Micro-Portfolio (2x2) */}
      <div className="md:col-span-2 md:row-span-2 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} className="text-orange-500" />
          Micro-Portfolio
        </h3>
        <div className="grid grid-cols-1 gap-3 h-[calc(100%-2rem)]">
          {profile.certificates?.slice(0, 3).map((cert, i) => (
            <div key={i} className="relative group overflow-hidden rounded-2xl aspect-[16/9] border border-white/40">
              <img 
                src={cert} 
                alt={`Certificate ${i+1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            </div>
          )) || (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <Award size={48} className="opacity-20 mb-2" />
              <p>No certificates pinned</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Work Experience & Education (Full Width) */}
      <div className="md:col-span-4 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Experience */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Briefcase size={24} className="text-blue-500" />
              Work Experience
            </h3>
            <div className="space-y-6">
              {profile.experience?.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-blue-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                  <h4 className="font-bold text-gray-900">{exp.position}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-400 mt-1">{exp.duration}</p>
                </div>
              )) || <p className="text-gray-400 italic">No experience added</p>}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <GraduationCap size={24} className="text-green-500" />
              Education
            </h3>
            <div className="space-y-6">
              {profile.education?.map((edu, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-green-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                  <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-400 mt-1">{edu.year}</p>
                </div>
              )) || <p className="text-gray-400 italic">No education added</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
