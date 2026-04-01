import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Job, Application } from '../types';
import { Search, MapPin, Briefcase, Award, ShieldCheck, MessageSquare, User, X, Plus, Send, Sparkles, Eye, CheckCircle2, Clock, Filter, Users, ArrowRight, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { JobCard, AntiScamBanner } from './JobCard';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { getOrCreateConversation } from './Messaging';

interface EmployerDashboardProps {
  profile: UserProfile;
}

export function EmployerDashboard({ profile }: EmployerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'candidates' | 'my-jobs' | 'applicants'>('candidates');
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);
  const [postJobBanner, setPostJobBanner] = useState<string | null>(null);

  // Fetch Candidates (Employees)
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCandidates(snapshot.docs.map(doc => doc.data() as UserProfile));
    });
    return () => unsubscribe();
  }, []);

  // Fetch My Jobs
  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('employerId', '==', profile.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setMyJobs(prev => {
        if (JSON.stringify(prev) === JSON.stringify(nextJobs)) return prev;
        return nextJobs;
      });
    });
    return () => unsubscribe();
  }, [profile.uid]);

  // Fetch Applications for My Jobs
  useEffect(() => {
    if (myJobs.length === 0) {
      setApplications([]);
      return;
    }
    const jobIds = myJobs.map(j => j.id);
    const q = query(collection(db, 'applications'), orderBy('appliedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      const filtered = allApps.filter(app => jobIds.includes(app.jobId));
      setApplications(prev => {
        if (JSON.stringify(prev) === JSON.stringify(filtered)) return prev;
        return filtered;
      });
    });
    return () => unsubscribe();
  }, [myJobs.map(j => j.id).join(',')]); // Stable dependency

  const filteredCandidates = candidates.filter(c => 
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.primarySkill?.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const markAsSeen = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status: 'seen' });
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleViewApplication = (app: Application) => {
    setSelectedApplication(app);
    if (app.status === 'pending') {
      markAsSeen(app.id);
    }
  };

  const handleMessageCandidate = async (candidate: UserProfile) => {
    try {
      await getOrCreateConversation(profile, candidate);
      // Switch to messages tab in parent
      // Since EmployerDashboard is inside WorkHub, we might need a way to tell WorkHub to switch tabs.
      // For now, we'll just show a success toast or similar, or assume the user will go to Messages.
      // Better: pass a prop to switch tabs.
      alert(`Conversation started with ${candidate.displayName}. Go to the Messages tab to chat!`);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newJob = {
      employerId: profile.uid,
      employerName: profile.companyName || profile.displayName,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      salaryRange: formData.get('salary') as string,
      cultureTags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      requiredSkills: (formData.get('skills') as string).split(',').map(t => t.trim()),
      bannerUrl: postJobBanner,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'jobs'), newJob);
    setShowPostJob(false);
    setPostJobBanner(null);
  };

  const handlePostJobBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostJobBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="space-y-12">
      {/* Employer Profile Summary */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-white/5">
        <div className="relative group/photo">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <img 
            src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/100/100`} 
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 relative z-10"
            alt={profile.displayName}
            referrerPolicy="no-referrer"
          />
          <label className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer rounded-2xl">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
              <Plus size={20} className="text-white" />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpdateProfilePhoto}
            />
          </label>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl md:text-3xl font-black mb-1">{profile.companyName || profile.displayName}</h2>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Employer Dashboard</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xl font-black text-indigo-400">{myJobs.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Jobs</p>
          </div>
          <div className="text-center px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xl font-black text-green-400">{applications.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Applicants</p>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex flex-wrap gap-3 md:gap-4">
        <button 
          onClick={() => setActiveTab('candidates')}
          className={`glass-card px-4 md:px-8 py-2 md:py-4 font-black transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base ${
            activeTab === 'candidates' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Users size={18} />
          Find Talent
        </button>
        <button 
          onClick={() => setActiveTab('my-jobs')}
          className={`glass-card px-4 md:px-8 py-2 md:py-4 font-black transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base ${
            activeTab === 'my-jobs' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Briefcase size={18} />
          <span className="hidden sm:inline">My Job Postings</span>
          <span className="sm:hidden">My Jobs</span>
        </button>
        <button 
          onClick={() => setActiveTab('applicants')}
          className={`glass-card px-4 md:px-8 py-2 md:py-4 font-black transition-all flex items-center gap-2 md:gap-3 relative text-sm md:text-base ${
            activeTab === 'applicants' ? 'text-indigo-400 bg-indigo-500/10 glow-indigo' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          <Eye size={18} />
          Applicants
          {applications.filter(a => a.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center glow-red">
              {applications.filter(a => a.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'candidates' ? (
          <motion.section 
            key="candidates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                <Sparkles size={28} className="text-indigo-400" />
                Elite Pinoy Talent
              </h2>
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by skill, role, or name..."
                  className="glass-input w-full pl-12"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCandidates.map(candidate => (
                <motion.div
                  key={candidate.uid}
                  layout
                  onClick={() => setSelectedCandidate(candidate)}
                  className="glass-card p-8 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <img 
                        src={candidate.photoURL || `https://picsum.photos/seed/${candidate.uid}/100/100`} 
                        className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                        alt={candidate.displayName}
                        referrerPolicy="no-referrer"
                      />
                      {candidate.isVouched && (
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-1.5 rounded-lg border-2 border-slate-950">
                          <ShieldCheck size={14} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black group-hover:text-indigo-400 transition-colors">{candidate.displayName}</h3>
                      <p className="text-indigo-400 font-bold text-sm uppercase tracking-wider">{candidate.primarySkill}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {candidate.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                        {skill}
                      </span>
                    ))}
                    {(candidate.skills?.length || 0) > 3 && (
                      <span className="px-3 py-1 bg-white/5 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                        +{(candidate.skills?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  <button className="w-full btn-indigo flex items-center justify-center gap-2 py-4">
                    View Profile
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : activeTab === 'my-jobs' ? (
          <motion.section 
            key="my-jobs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">My Job Postings</h2>
              <button 
                onClick={() => setShowPostJob(true)}
                className="btn-indigo px-8 py-4 flex items-center gap-2"
              >
                <Plus size={20} />
                Post New Job
              </button>
            </div>

              <div className="grid grid-cols-1 gap-6">
                {myJobs.length === 0 ? (
                  <div className="glass-card p-20 text-center text-slate-500">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xl font-medium">You haven't posted any jobs yet.</p>
                  </div>
                ) : (
                  myJobs.map(job => (
                    <JobCard 
                      key={job.id}
                      job={job}
                      isScammy={job.description.toLowerCase().includes('telegram') || job.description.toLowerCase().includes('processing fee')}
                      actions={
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setActiveTab('applicants')}
                            className="px-6 py-3 glass-card text-indigo-400 font-bold hover:bg-indigo-500/10 transition-all flex items-center gap-2"
                          >
                            <Users size={18} />
                            View Applicants ({applications.filter(a => a.jobId === job.id).length})
                          </button>
                        </div>
                      }
                    />
                  ))
                )}
              </div>
          </motion.section>
        ) : (
          <motion.section 
            key="applicants"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black">Recent Applications</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {applications.length === 0 ? (
                <div className="glass-card p-20 text-center text-slate-500">
                  <Eye size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xl font-medium">No applications received yet.</p>
                </div>
              ) : (
                applications.map(app => (
                  <div 
                    key={app.id} 
                    onClick={() => handleViewApplication(app)}
                    className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img 
                          src={app.employeePhoto || `https://picsum.photos/seed/${app.employeeId}/100/100`} 
                          className="w-16 h-16 rounded-xl object-cover border border-white/10"
                          alt={app.employeeName}
                          referrerPolicy="no-referrer"
                        />
                        {app.status === 'pending' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-slate-950 glow-indigo" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-black group-hover:text-indigo-400 transition-colors">{app.employeeName}</h3>
                        <p className="text-slate-400 text-sm">Applied for <span className="text-indigo-400 font-bold">{myJobs.find(j => j.id === app.jobId)?.title}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          app.status === 'pending' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          app.status === 'seen' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Applied</p>
                        <p className="text-sm font-bold">{formatDistanceToNow(new Date(app.appliedAt))} ago</p>
                      </div>
                      <ArrowRight size={20} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Candidate Profile Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-4xl p-10 md:p-16 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                    <img 
                      src={selectedCandidate.photoURL || `https://picsum.photos/seed/${selectedCandidate.uid}/200/200`} 
                      className="w-48 h-48 rounded-[3rem] object-cover border-2 border-white/20 relative z-10"
                      alt={selectedCandidate.displayName}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">{selectedCandidate.displayName}</h2>
                    <p className="text-xl md:text-2xl text-indigo-400 font-bold mb-6">{selectedCandidate.primarySkill}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button 
                        onClick={() => handleMessageCandidate(selectedCandidate)}
                        className="btn-indigo px-6 md:px-8 py-3 md:py-4 flex items-center gap-2 text-sm md:text-base"
                      >
                        <MessageSquare size={18} />
                        Message Candidate
                      </button>
                      <button className="glass-card px-6 md:px-8 py-3 md:py-4 font-bold border border-white/10 hover:bg-white/5 transition-all text-sm md:text-base">
                        Save to Shortlist
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                      <User size={20} className="text-indigo-400" />
                      About
                    </h3>
                    <p className="text-slate-400 leading-relaxed">{selectedCandidate.intro || "No introduction provided."}</p>
                  </div>
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                      <Award size={20} className="text-indigo-400" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedCandidate.skills?.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl text-sm font-bold border border-indigo-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-2xl p-10 md:p-16 relative"
            >
              <button 
                onClick={() => setSelectedApplication(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <img 
                    src={selectedApplication.employeePhoto || `https://picsum.photos/seed/${selectedApplication.employeeId}/100/100`} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-white/10"
                    alt={selectedApplication.employeeName}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black">{selectedApplication.employeeName}</h2>
                    <p className="text-slate-400 text-sm md:text-base">Applied for <span className="text-indigo-400 font-bold">{myJobs.find(j => j.id === selectedApplication.jobId)?.title}</span></p>
                  </div>
                </div>

                <div className="glass-card p-8 bg-white/5 border-white/5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cover Message</h4>
                  <p className="text-slate-300 leading-relaxed italic">"{selectedApplication.message}"</p>
                </div>

                <div className="flex flex-col gap-4">
                  <button className="w-full btn-indigo py-5 flex items-center justify-center gap-3">
                    <CheckCircle2 size={24} />
                    Shortlist Candidate
                  </button>
                  <button className="w-full glass-card py-5 font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                    <MessageSquare size={20} />
                    Message to Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-2xl p-10 md:p-16 relative"
            >
              <button 
                onClick={() => setShowPostJob(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black mb-10">Post a New Opportunity</h2>
              
              <form className="space-y-6" onSubmit={handlePostJob}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Job Banner</label>
                    <div className="relative group">
                      {postJobBanner ? (
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-indigo-500/30">
                          <img 
                            src={postJobBanner} 
                            alt="Job Banner" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            type="button"
                            onClick={() => setPostJobBanner(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Sparkles size={20} className="text-indigo-400 mb-1" />
                            <p className="text-[10px] font-bold text-slate-400">Click to upload banner</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handlePostJobBannerUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                  <input name="title" required placeholder="Job Title" className="glass-input w-full" />
                  <textarea name="description" required placeholder="Job Description" rows={4} className="glass-input w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="location" required placeholder="Location (e.g. Remote, Manila)" className="glass-input w-full" />
                    <input name="salary" required placeholder="Salary Range (e.g. ₱50k - ₱80k)" className="glass-input w-full" />
                  </div>
                  <input name="tags" required placeholder="Culture Tags (comma separated: #HMO, #Remote)" className="glass-input w-full" />
                  <input name="skills" required placeholder="Required Skills (comma separated)" className="glass-input w-full" />
                </div>
                <button type="submit" className="w-full btn-indigo py-5 font-black text-xl">
                  Launch Posting
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
