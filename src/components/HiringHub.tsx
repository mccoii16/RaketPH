import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Job, Application } from '../types';
import { Plus, Users, Briefcase, CheckCircle2, Clock, MapPin, DollarSign, Tag, Send, ArrowLeft, X, ShieldCheck, ArrowRight, Sparkles, Search, MessageSquare, Building2 as Building2Icon, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { logOut } from './Auth';
import { Messaging, getOrCreateConversation } from './Messaging';
import { getDocs, query as firestoreQuery } from 'firebase/firestore';

interface HiringHubProps {
  profile: UserProfile;
}

export function HiringHub({ profile }: HiringHubProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'candidates' | 'messages'>('listings');

  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('employerId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile.uid]);

  useEffect(() => {
    if (activeTab === 'candidates') {
      const q = query(collection(db, 'users'), where('role', '==', 'employee'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setCandidates(users);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedJob) {
      setApplications([]);
      return;
    }
    const q = query(collection(db, 'applications'), where('jobId', '==', selectedJob.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(apps);
    });
    return () => unsubscribe();
  }, [selectedJob]);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const handleViewApplication = async (app: Application) => {
    setSelectedApp(app);
    if (app.status === 'pending') {
      await updateDoc(doc(db, 'applications', app.id), { status: 'seen' });
    }
  };

  const handleStartChat = async (employee: UserProfile | { uid: string, displayName: string, photoURL?: string }) => {
    // We need the full employee profile for the helper, but we can mock it if we only have partial data from application
    const fullEmployee: UserProfile = 'role' in employee 
      ? employee as UserProfile 
      : { ...employee, role: 'employee', email: '' } as UserProfile;
    
    await getOrCreateConversation(profile, fullEmployee);
    setActiveTab('messages');
  };

  const filteredCandidates = candidates.filter(c => 
    c.displayName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.primarySkill?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.skills?.some(s => s.toLowerCase().includes(candidateSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">Hiring Hub</h1>
          <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
            <Building2 size={20} className="text-indigo-400" />
            {profile.companyName} • {profile.industry}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab(activeTab === 'messages' ? 'listings' : 'messages')}
            className={`glass-card px-6 py-3 transition-all font-bold flex items-center gap-2 ${
              activeTab === 'messages' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <MessageSquare size={18} />
            Messages
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === 'candidates' ? 'listings' : 'candidates')}
            className={`glass-card px-6 py-3 transition-all font-bold flex items-center gap-2 ${
              activeTab === 'candidates' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <Users size={18} />
            Candidates
          </button>
          <button 
            onClick={() => setIsPosting(true)}
            className="btn-indigo flex items-center gap-2"
          >
            <Plus size={20} />
            Post Job
          </button>
          <button 
            onClick={logOut}
            className="glass-card px-6 py-3 text-slate-400 hover:text-red-400 transition-colors font-bold"
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
          ) : activeTab === 'candidates' ? (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Users size={32} className="text-indigo-400" />
                  Candidate Marketplace
                </h2>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by name, skill, or role..."
                    className="glass-input w-full pl-12"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map(candidate => (
                  <div key={candidate.uid} className="glass-card p-8 flex flex-col group hover:border-indigo-500/50 transition-all">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="relative">
                        <img 
                          src={candidate.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                          alt={candidate.displayName}
                          className="w-20 h-20 rounded-3xl object-cover border-2 border-white/10"
                        />
                        {candidate.isVouched && (
                          <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-xl border-2 border-slate-950 glow-indigo">
                            <ShieldCheck size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black mb-1 group-hover:text-indigo-400 transition-colors">{candidate.displayName}</h3>
                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{candidate.experienceLevel} {candidate.primarySkill}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {candidate.skills?.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 border border-white/5">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 italic">
                      "{candidate.intro || 'No introduction provided.'}"
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleStartChat(candidate)}
                        className="flex-1 btn-indigo py-3 text-sm flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>
                      <button 
                        onClick={() => setViewingCandidate(candidate)}
                        className="glass-card px-4 py-3 text-slate-400 hover:text-white transition-colors"
                      >
                        <User size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
          {/* Job Listings */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
              <Briefcase size={24} className="text-indigo-400" />
              Your Listings
            </h2>
            {loading ? (
              <div className="text-slate-500 animate-pulse">Loading listings...</div>
            ) : jobs.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500 border-dashed border-2 border-white/5">
                No jobs posted yet.
              </div>
            ) : (
              jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left glass-card p-6 transition-all border-2 ${
                    selectedJob?.id === job.id ? 'border-indigo-500 glow-indigo' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {job.salaryRange}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Applicants */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
              <Users size={24} className="text-indigo-400" />
              {selectedJob ? `Applicants for ${selectedJob.title}` : 'Select a job to see applicants'}
            </h2>
            
            {!selectedJob ? (
              <div className="glass-card p-24 text-center text-slate-500 flex flex-col items-center gap-6">
                <Users size={64} className="opacity-10" />
                <p className="text-xl font-medium">Select a job listing from the left to manage applicants.</p>
              </div>
            ) : selectedApp ? (
              <div className="space-y-8">
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                >
                  <ArrowLeft size={20} /> Back to Applicant List
                </button>
                
                <div className="glass-card p-10 space-y-10">
                  <div className="flex items-center gap-8 border-b border-white/5 pb-10">
                    <img 
                      src={selectedApp.employeePhoto || 'https://picsum.photos/seed/user/200/200'} 
                      alt={selectedApp.employeeName}
                      className="w-24 h-24 rounded-3xl object-cover border-2 border-white/10 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-4xl font-black mb-2">{selectedApp.employeeName}</h3>
                      <p className="text-slate-400 font-bold flex items-center gap-2">
                        <Clock size={18} className="text-indigo-400" />
                        Applied {formatDistanceToNow(new Date(selectedApp.appliedAt))} ago
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-indigo-400 uppercase tracking-widest text-sm">Application Message</h4>
                    <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5">
                      {selectedApp.message || "No message provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-indigo-400 uppercase tracking-widest text-sm">Resume</h4>
                      <a 
                        href={selectedApp.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all group"
                      >
                        <span className="font-bold flex items-center gap-3">
                          <Briefcase size={20} className="text-indigo-400" />
                          View Resume
                        </span>
                        <ArrowRight size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </a>
                    </div>

                    {selectedApp.videoIntroUrl && (
                      <div className="space-y-4">
                        <h4 className="text-xl font-black text-indigo-400 uppercase tracking-widest text-sm">Video Introduction</h4>
                        <a 
                          href={selectedApp.videoIntroUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 hover:border-indigo-400 transition-all group glow-indigo"
                        >
                          <span className="font-bold flex items-center gap-3">
                            <Sparkles size={20} className="text-indigo-400" />
                            Watch Video Intro
                          </span>
                          <ArrowRight size={20} className="text-indigo-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => handleStartChat({ uid: selectedApp.employeeId, displayName: selectedApp.employeeName, photoURL: selectedApp.employeePhoto })}
                      className="flex-1 btn-indigo py-4 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={20} />
                      Message Candidate
                    </button>
                    <button className="flex-1 bg-white/5 text-slate-400 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">Shortlist</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {applications.length === 0 ? (
                    <div className="col-span-full glass-card p-24 text-center text-slate-500">
                      No applications received yet.
                    </div>
                  ) : (
                    applications.map(app => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => handleViewApplication(app)}
                        className="glass-card p-6 flex items-center gap-6 cursor-pointer hover:border-white/20 transition-all group"
                      >
                        <div className="relative">
                          <img 
                            src={app.employeePhoto || 'https://picsum.photos/seed/user/100/100'} 
                            alt={app.employeeName}
                            className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          {app.status === 'seen' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950 glow-green" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{app.employeeName}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(app.appliedAt))} ago
                          </p>
                        </div>
                        {app.status === 'seen' ? (
                          <CheckCircle2 size={24} className="text-green-500 glow-green" />
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                            <Clock size={16} />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </main>

      {/* Post Job Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-3xl p-10 md:p-16 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsPosting(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <PostJobForm profile={profile} onComplete={() => setIsPosting(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Profile Modal */}
      <AnimatePresence>
        {viewingCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-4xl p-10 md:p-16 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setViewingCandidate(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="relative shrink-0">
                  <img 
                    src={viewingCandidate.photoURL || 'https://picsum.photos/seed/user/200/200'} 
                    alt={viewingCandidate.displayName}
                    className="w-48 h-48 rounded-[40px] object-cover border-4 border-white/10 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {viewingCandidate.isVouched && (
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-3 rounded-2xl border-4 border-slate-950 glow-indigo">
                      <ShieldCheck size={24} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-5xl font-black mb-2 tracking-tight">{viewingCandidate.displayName}</h2>
                    <p className="text-2xl font-bold text-indigo-400 uppercase tracking-widest">{viewingCandidate.experienceLevel} {viewingCandidate.primarySkill}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {viewingCandidate.skills?.map(skill => (
                      <span key={skill} className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold text-slate-300 border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">About Candidate</h4>
                    <p className="text-slate-300 text-lg leading-relaxed italic">
                      "{viewingCandidate.intro || 'No introduction provided.'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="glass-card p-6 border-white/5 bg-white/2">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Location</h4>
                      <p className="font-bold flex items-center gap-2">
                        <MapPin size={18} className="text-indigo-400" />
                        {viewingCandidate.location || 'Remote'}
                      </p>
                    </div>
                    <div className="glass-card p-6 border-white/5 bg-white/2">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Availability</h4>
                      <p className="font-bold flex items-center gap-2">
                        <Clock size={18} className="text-indigo-400" />
                        Available for Raket
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button 
                      onClick={() => {
                        handleStartChat(viewingCandidate);
                        setViewingCandidate(null);
                      }}
                      className="flex-1 btn-indigo py-5 text-lg flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={24} />
                      Message Candidate
                    </button>
                    {viewingCandidate.resumeUrl && (
                      <a 
                        href={viewingCandidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 glass-card py-5 text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold"
                      >
                        <Briefcase size={24} />
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostJobForm({ profile, onComplete }: { profile: UserProfile, onComplete: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote, Philippines');
  const [salaryRange, setSalaryRange] = useState('₱30,000 - ₱50,000');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [requiresVideoIntro, setRequiresVideoIntro] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cultureTags = ['#HMO', '#13thMonth', '#FlexiTime', '#NoTimeTracker', '#GovernmentBenefits'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        employerId: profile.uid,
        employerName: profile.companyName,
        title,
        description,
        location,
        salaryRange,
        cultureTags: selectedTags,
        requiredSkills: [],
        requiresVideoIntro,
        createdAt: new Date().toISOString()
      });
      onComplete();
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-3xl font-black mb-8">Post RaketPH Opportunity</h2>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-400 ml-2">Job Title</label>
        <input required className="glass-input w-full" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 ml-2">Location</label>
          <input required className="glass-input w-full" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 ml-2">Salary Range</label>
          <input required className="glass-input w-full" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} />
        </div>
      </div>
      
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-400 ml-2 block">Application Requirements</label>
        <button 
          type="button"
          onClick={() => setRequiresVideoIntro(!requiresVideoIntro)}
          className={`w-full p-4 rounded-2xl border transition-all text-sm font-bold flex items-center justify-between ${
            requiresVideoIntro ? 'bg-indigo-600 border-indigo-600 glow-indigo' : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} />
            Require Video Introduction
          </div>
          {requiresVideoIntro && <CheckCircle2 size={20} />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-400 ml-2">Culture Tags</label>
        <div className="flex flex-wrap gap-2">
          {cultureTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedTags.includes(tag) ? 'bg-indigo-600 border-indigo-600 glow-indigo' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-400 ml-2">Description</label>
        <textarea required rows={5} className="glass-input w-full" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button disabled={submitting} className="btn-indigo w-full flex items-center justify-center gap-3">
        {submitting ? 'Publishing...' : <><Send size={20} /> Publish Job</>}
      </button>
    </form>
  );
}

function Building2({ size, className }: { size: number, className?: string }) {
  return <Building2Icon size={size} className={className} />;
}
