import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { Briefcase, User, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SignupProps {
  user: any;
  onComplete: () => void;
}

export function Signup({ user, onComplete }: SignupProps) {
  const [role, setRole] = useState<UserRole>('employee');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [primarySkill, setPrimarySkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Junior');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role,
      isVouched: false,
      intro: role === 'employee' ? `I am a ${experienceLevel} ${primarySkill} specialist.` : `Hiring for ${companyName} in ${industry}.`,
      ...(role === 'employer' ? { companyName, industry } : { primarySkill, experienceLevel }),
      skills: role === 'employee' ? [primarySkill] : [],
      certificates: [],
      experience: [],
      education: []
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl p-10 md:p-16"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-4">Welcome to RaketPH</h1>
          <p className="text-slate-400 text-lg">Let's set up your RaketPH profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Role Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-500 text-center">Who are you?</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                  role === 'employee' 
                    ? 'border-indigo-500 bg-indigo-500/10 glow-indigo' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
              >
                <User size={32} className={role === 'employee' ? 'text-indigo-400' : 'text-slate-400'} />
                <span className={`font-bold ${role === 'employee' ? 'text-white' : 'text-slate-400'}`}>Aspiring Employee</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                  role === 'employer' 
                    ? 'border-indigo-500 bg-indigo-500/10 glow-indigo' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Building2 size={32} className={role === 'employer' ? 'text-indigo-400' : 'text-slate-400'} />
                <span className={`font-bold ${role === 'employer' ? 'text-white' : 'text-slate-400'}`}>Employer</span>
              </button>
            </div>
          </div>

          {/* Conditional Fields */}
          <motion.div 
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {role === 'employer' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-2">Company Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. TechFlow PH"
                    className="glass-input w-full"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-2">Industry</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Software Development"
                    className="glass-input w-full"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-2">Primary Skill</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. UI/UX Design, React, Writing"
                    className="glass-input w-full"
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-2">Experience Level</label>
                  <select 
                    className="glass-input w-full appearance-none"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="Junior">Junior (0-2 years)</option>
                    <option value="Mid-Level">Mid-Level (2-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                    <option value="Expert">Expert / Lead</option>
                  </select>
                </div>
              </>
            )}
          </motion.div>

          <button 
            type="submit"
            disabled={submitting}
            className="btn-indigo w-full flex items-center justify-center gap-3 text-lg"
          >
            {submitting ? 'Creating Profile...' : (
              <>
                Complete Setup
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
