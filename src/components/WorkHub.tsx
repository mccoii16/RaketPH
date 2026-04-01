import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Job, Application } from '../types';
import { Search, MapPin, DollarSign, Tag, Award, Briefcase, GraduationCap, ShieldCheck, CheckCheck, Clock, ArrowRight, LogOut, User, X, Plus, Send, Sparkles, MessageSquare, Heart, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { logOut } from './Auth';
import { Messaging } from './Messaging';
import { EmployerDashboard } from './EmployerDashboard';

interface WorkHubProps {
  profile: UserProfile;
}

export function WorkHub({ profile }: WorkHubProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'profile' | 'messages' | 'saved'>('marketplace');
  const [savedJobIds, setSavedJobIds] = useState<string[]>(profile.savedJobs || []);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (profile.role !== 'employee') return;
    const q = query(collection(db, 'applications'), where('employeeId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
    });
    return () => unsubscribe();
  }, [profile.uid, profile.role]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', profile.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        const nextSavedJobs = data.savedJobs || [];
        setSavedJobIds(prev => {
          if (JSON.stringify(prev) === JSON.stringify(nextSavedJobs)) return prev;
          return nextSavedJobs;
        });
      }
    });
    return () => unsubscribe();
  }, [profile.uid]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
    });
    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.employerName.toLowerCase().includes(search.toLowerCase())
  );

  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));

  const toggleSaveJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    const isSaved = savedJobIds.includes(jobId);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        savedJobs: isSaved ? arrayRemove(jobId) : arrayUnion(jobId)
      });
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  };

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for "upload"
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          certificates: arrayUnion(base64String)
        });
      } catch (error) {
        console.error('Error uploading certificate:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          photoURL: base64String
        });
      } catch (error) {
        console.error('Error updating profile photo:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen p-4 md:p-12 overflow-x-hidden">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 md:mb-16">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">
            {profile.role === 'employer' ? 'Employer Hub' : 'Work Hub'}
          </h1>
          <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-400" />
            Welcome back, {profile.displayName.split(' ')[0]}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {profile.role === 'employee' && (
            <button 
              onClick={() => setActiveTab(activeTab === 'saved' ? 'marketplace' : 'saved')}
              className={`glass-card px-4 md:px-6 py-2 md:py-3 transition-all font-bold flex items-center gap-2 text-sm md:text-base ${
                activeTab === 'saved' ? 'text-pink-400 bg-pink-500/10 glow-pink' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Heart size={16} className={activeTab === 'saved' ? 'fill-pink-400' : ''} />
              <span className="hidden sm:inline">Saved Jobs</span>
              <span className="sm:hidden">Saved</span>
            </button>
          )}
          <button 
            onClick={() => setActiveTab(activeTab === 'messages' ? 'marketplace' : 'messages')}
            className={`glass-card px-4 md:px-6 py-2 md:py-3 transition-all font-bold flex items-center gap-2 text-sm md:text-base ${
              activeTab === 'messages' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <MessageSquare size={16} />
            Messages
          </button>
          {profile.role === 'employee' && (
            <button 
              onClick={() => setActiveTab(activeTab === 'marketplace' ? 'profile' : 'marketplace')}
              className="glass-card px-4 md:px-6 py-2 md:py-3 text-indigo-400 hover:bg-indigo-500/10 transition-all font-bold flex items-center gap-2 text-sm md:text-base"
            >
              {activeTab === 'marketplace' ? (
                <><User size={16} /> <span className="hidden sm:inline">View Profile</span><span className="sm:hidden">Profile</span></>
              ) : (
                <><Briefcase size={16} /> <span className="hidden sm:inline">View Marketplace</span><span className="sm:hidden">Market</span></>
              )}
            </button>
          )}
          <button 
            onClick={logOut}
            className="glass-card px-4 md:px-6 py-2 md:py-3 text-slate-400 hover:text-red-400 transition-colors font-bold text-sm md:text-base"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'messages' ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Messaging profile={profile} />
            </motion.div>
          ) : profile.role === 'employer' ? (
            <motion.div
              key="employer-dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <EmployerDashboard profile={profile} />
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.section 
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <User size={28} className="text-indigo-400" />
            Your RaketPH Profile
          </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Bento Grid Layout */}
                
                {/* 1. Profile Identity (2x2) */}
                <div className="md:col-span-2 md:row-span-2 glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative mb-8 group/photo">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                    <img 
                      src={profile.photoURL || 'https://picsum.photos/seed/user/200/200'} 
                      alt={profile.displayName}
                      className="w-40 h-40 rounded-[3rem] object-cover border-2 border-white/20 shadow-2xl relative z-10"
                      referrerPolicy="no-referrer"
                    />
                    <label className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer rounded-[3rem]">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        <Plus size={24} className="text-white" />
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUpdateProfilePhoto}
                      />
                    </label>
                    {profile.isVouched && (
                      <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-2xl shadow-lg border-2 border-slate-950 glow-indigo z-20">
                        <ShieldCheck size={24} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-black mb-2 relative z-10">{profile.displayName}</h3>
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-6 relative z-10">{profile.experienceLevel} {profile.primarySkill}</p>
                  <p className="text-slate-400 leading-relaxed max-w-sm mx-auto relative z-10">
                    {profile.intro || "No introduction provided yet."}
                  </p>
                </div>

                {/* 2. Skills Bento (2x1) */}
                <div className="md:col-span-2 glass-card p-8 border-white/5 hover:border-indigo-500/30 transition-all">
                  <h4 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
                    <Award size={20} className="text-indigo-400" />
                    Core Competencies
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills?.map((skill, i) => (
                      <span key={i} className="px-5 py-2 bg-indigo-500/10 text-indigo-300 rounded-2xl text-sm font-bold border border-indigo-500/20 glow-indigo">
                        {skill}
                      </span>
                    )) || <p className="text-slate-500 italic">No skills listed</p>}
                  </div>
                </div>

                {/* 3. Certificate Bento (2x2) - 4 Column Grid Inside */}
                <div className="md:col-span-2 md:row-span-2 glass-card p-8 border-white/5 hover:border-indigo-500/30 transition-all overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                      <Sparkles size={20} className="text-indigo-400" />
                      Verified Certificates
                    </h4>
                    <label className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer">
                      <Plus size={20} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUploadCertificate}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {profile.certificates?.length ? profile.certificates.map((cert, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-2xl aspect-square border border-white/10 glow-indigo">
                        <img 
                          src={cert} 
                          alt={`Certificate ${i+1}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-indigo-950/20 group-hover:bg-indigo-950/40 transition-colors" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={24} className="text-white drop-shadow-lg" />
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-8 text-slate-600 border-2 border-dashed border-white/5 rounded-3xl">
                        <Award size={48} className="opacity-10 mb-4" />
                        <p className="font-medium text-center px-4 mb-4">No certificates pinned yet.</p>
                        <label className="btn-indigo py-2 px-4 text-sm flex items-center gap-2 cursor-pointer">
                          <Plus size={16} />
                          Upload Now
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleUploadCertificate}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Stats Bento (2x1) */}
                <div className="md:col-span-2 glass-card p-6 md:p-8 flex items-center justify-around border-white/5 hover:border-indigo-500/30 transition-all">
                  <div className="text-center flex-1">
                    <p className="text-2xl md:text-3xl font-black text-indigo-400 mb-1">{applications.length}</p>
                    <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Applications</p>
                  </div>
                  <div className="w-px h-10 md:h-12 bg-white/5" />
                  <div className="text-center flex-1">
                    <p className="text-2xl md:text-3xl font-black text-green-400 mb-1">
                      {applications.filter(a => a.status === 'shortlisted').length}
                    </p>
                    <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Interviews</p>
                  </div>
                  <div className="w-px h-10 md:h-12 bg-white/5" />
                  <div className="text-center flex-1">
                    <p className="text-2xl md:text-3xl font-black text-indigo-400 mb-1">
                      {Math.min(99, 85 + (profile.skills?.length || 0) * 2)}%
                    </p>
                    <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Match Rate</p>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : activeTab === 'saved' ? (
            <motion.section 
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Heart size={32} className="text-pink-400 fill-pink-400" />
                  Saved Opportunities
                </h2>
              </div>

              {savedJobs.length === 0 ? (
                <div className="glass-card p-24 text-center text-slate-500 flex flex-col items-center gap-6">
                  <Heart size={64} className="opacity-10" />
                  <p className="text-xl font-medium">You haven't saved any jobs yet. Browse the marketplace to find your next raket!</p>
                  <button 
                    onClick={() => setActiveTab('marketplace')}
                    className="btn-indigo px-8 py-4"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedJobs.map(job => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedJob(job)}
                      className="glass-card p-8 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <p className="text-slate-400 font-bold">{job.employerName}</p>
                        </div>
                        <button 
                          onClick={(e) => toggleSaveJob(e, job.id)}
                          className="p-3 rounded-2xl bg-pink-500/20 text-pink-400 glow-pink transition-all"
                        >
                          <Heart size={20} className="fill-pink-400" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-8">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <MapPin size={14} className="text-indigo-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <DollarSign size={14} className="text-green-400" />
                          {job.salaryRange}
                        </span>
                      </div>

                      <button className="w-full btn-indigo flex items-center justify-center gap-2 py-4">
                        View Details
                        <ArrowRight size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section 
              key="marketplace"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Briefcase size={32} className="text-indigo-400" />
                  RaketPH Marketplace
                </h2>
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search opportunities..."
                    className="glass-input w-full pl-12"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map(job => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedJob(job)}
                      className="glass-card p-8 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <p className="text-slate-400 font-bold">{job.employerName}</p>
                        </div>
                        <button 
                          onClick={(e) => toggleSaveJob(e, job.id)}
                          className={`p-3 rounded-2xl transition-all ${
                            savedJobIds.includes(job.id) 
                              ? 'bg-pink-500/20 text-pink-400 glow-pink' 
                              : 'bg-white/5 text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          <Heart size={20} className={savedJobIds.includes(job.id) ? 'fill-pink-400' : ''} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-8">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <MapPin size={14} className="text-indigo-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <DollarSign size={14} className="text-green-400" />
                          {job.salaryRange}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {job.cultureTags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-indigo-500/5 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button className="w-full btn-indigo flex items-center justify-center gap-2 py-4">
                        View Details
                        <ArrowRight size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-4xl p-6 md:p-16 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <JobDetailView 
                job={selectedJob} 
                profile={profile} 
                onComplete={() => setSelectedJob(null)} 
                isSaved={savedJobIds.includes(selectedJob.id)}
                onToggleSave={(e) => toggleSaveJob(e, selectedJob.id)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JobDetailView({ job, profile, onComplete, isSaved, onToggleSave }: { 
  job: Job, 
  profile: UserProfile, 
  onComplete: () => void,
  isSaved: boolean,
  onToggleSave: (e: React.MouseEvent) => void
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [resumeSource, setResumeSource] = useState<'profile' | 'upload'>('profile');
  const [resumeUrl, setResumeUrl] = useState('');
  const [videoIntroUrl, setVideoIntroUrl] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        employeeId: profile.uid,
        employeeName: profile.displayName,
        employeePhoto: profile.photoURL,
        status: 'pending',
        message,
        resumeUrl: resumeSource === 'profile' ? 'Profile Resume' : resumeUrl,
        videoIntroUrl: job.requiresVideoIntro ? videoIntroUrl : null,
        appliedAt: new Date().toISOString()
      });
      setApplied(true);
      setTimeout(onComplete, 2000);
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setApplying(false);
    }
  };

  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center glow-green">
          <CheckCheck size={48} className="text-green-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black">Application Sent!</h2>
        <p className="text-slate-400 text-lg">Your application for {job.title} has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">{job.title}</h2>
          <p className="text-xl md:text-2xl text-indigo-400 font-bold">{job.employerName}</p>
        </div>
        <button 
          onClick={onToggleSave}
          className={`p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all flex items-center gap-2 md:gap-3 font-bold text-sm md:text-base ${
            isSaved 
              ? 'bg-pink-500/20 text-pink-400 border-pink-500/50 glow-pink' 
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          <Heart size={20} className={isSaved ? 'fill-pink-400' : ''} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/5">
          <MapPin className="text-indigo-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</p>
          <p className="text-lg font-bold">{job.location}</p>
        </div>
        <div className="glass-card p-6 border-white/5">
          <DollarSign className="text-green-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salary</p>
          <p className="text-lg font-bold">{job.salaryRange}</p>
        </div>
        <div className="glass-card p-6 border-white/5">
          <Clock className="text-indigo-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Posted</p>
          <p className="text-lg font-bold">{formatDistanceToNow(new Date(job.createdAt))} ago</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black">About the Role</h3>
        <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black">Culture & Benefits</h3>
        <div className="flex flex-wrap gap-3">
          {job.cultureTags.map(tag => (
            <span key={tag} className="px-6 py-3 bg-indigo-500/5 text-indigo-400 rounded-full font-black uppercase tracking-widest border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-8 md:pt-12 border-t border-white/5">
        <form onSubmit={handleApply} className="space-y-6 md:space-y-8">
          <h3 className="text-2xl md:text-3xl font-black">Apply for this Position</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-2">Why are you applying for this role?</label>
            <textarea 
              required
              rows={4}
              className="glass-input w-full"
              placeholder="Tell the employer why you're a great fit..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 ml-2 block">Resume Attachment</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setResumeSource('profile')}
                className={`flex-1 p-4 rounded-2xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${
                  resumeSource === 'profile' ? 'bg-indigo-600 border-indigo-600 glow-indigo' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <User size={18} /> Use Profile Resume
              </button>
              <button 
                type="button"
                onClick={() => setResumeSource('upload')}
                className={`flex-1 p-4 rounded-2xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${
                  resumeSource === 'upload' ? 'bg-indigo-600 border-indigo-600 glow-indigo' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <Plus size={18} /> Upload New
              </button>
            </div>
            {resumeSource === 'upload' && (
              <input 
                type="text"
                required
                placeholder="Paste Resume URL (or simulate upload)"
                className="glass-input w-full"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
              />
            )}
          </div>

          {job.requiresVideoIntro && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-2 block">
                Video Introduction (Required)
                <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase">Employer Request</span>
              </label>
              <input 
                type="text"
                required
                placeholder="Paste Video Intro URL (e.g. Loom, YouTube, Drive)"
                className="glass-input w-full"
                value={videoIntroUrl}
                onChange={e => setVideoIntroUrl(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={applying}
            className="w-full btn-indigo py-6 text-xl flex items-center justify-center gap-3"
          >
            {applying ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Send size={24} /> Submit Application</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
