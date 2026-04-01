import { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Job, Application, UserProfile } from '../types';
import { AntiScamBanner } from './JobCard';
import { MapPin, DollarSign, Calendar, Tag, ArrowLeft, Send, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
  userProfile: UserProfile | null;
}

export function JobDetail({ job, onBack, userProfile }: JobDetailProps) {
  const [hasApplied, setHasApplied] = useState<Application | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(
      collection(db, 'applications'), 
      where('jobId', '==', job.id), 
      where('employeeId', '==', userProfile.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHasApplied({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Application);
      }
    });
    return () => unsubscribe();
  }, [job.id, userProfile]);

  const handleApply = async () => {
    if (!userProfile || applying) return;
    setApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        employeeId: userProfile.uid,
        employeeName: userProfile.displayName,
        employeePhoto: userProfile.photoURL,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error applying for job:', error);
    } finally {
      setApplying(false);
    }
  };

  const isScammy = job.description.toLowerCase().includes('telegram') || 
                   job.description.toLowerCase().includes('processing fee');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </button>

      {isScammy && <AntiScamBanner />}

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="w-full h-64 overflow-hidden bg-slate-100">
          <img 
            src={job.bannerUrl || `https://picsum.photos/seed/${job.id}/1200/600`} 
            alt={job.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{job.title}</h1>
              <p className="text-xl text-blue-600 font-bold">{job.employerName}</p>
            </div>
          
          {userProfile?.role === 'employee' && (
            <button 
              disabled={!!hasApplied || applying}
              onClick={handleApply}
              className={cn(
                "w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-95",
                hasApplied 
                  ? "bg-green-50 text-green-600 border border-green-200 cursor-default" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"
              )}
            >
              {hasApplied ? (
                <>
                  <CheckCheck size={24} />
                  Applied
                </>
              ) : applying ? (
                "Applying..."
              ) : (
                <>
                  <Send size={24} />
                  Apply Now
                </>
              )}
            </button>
          )}
        </div>

        {hasApplied && (
          <div className="mb-12 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                {hasApplied.status === 'seen' ? (
                  <CheckCheck size={24} className="text-blue-500" />
                ) : (
                  <Clock size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">Application Status</p>
                <p className="text-gray-500 text-sm">
                  {hasApplied.status === 'seen' 
                    ? "The employer has viewed your application!" 
                    : "Sent to employer. Waiting for review."}
                </p>
              </div>
            </div>
            {hasApplied.status === 'seen' && (
              <div className="flex items-center gap-1 text-blue-500 font-black animate-bounce">
                <CheckCheck size={24} />
                SEEN
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/40 p-6 rounded-3xl border border-white/20">
            <MapPin className="text-blue-500 mb-2" size={24} />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Location</p>
            <p className="text-gray-900 font-bold">{job.location}</p>
          </div>
          <div className="bg-white/40 p-6 rounded-3xl border border-white/20">
            <DollarSign className="text-green-500 mb-2" size={24} />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Salary</p>
            <p className="text-gray-900 font-bold">{job.salaryRange}</p>
          </div>
          <div className="bg-white/40 p-6 rounded-3xl border border-white/20">
            <Calendar className="text-orange-500 mb-2" size={24} />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Posted</p>
            <p className="text-gray-900 font-bold">{formatDistanceToNow(new Date(job.createdAt))} ago</p>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Culture & Benefits</h3>
          <div className="flex flex-wrap gap-3">
            {job.cultureTags.map(tag => (
              <span key={tag} className="px-5 py-2.5 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold shadow-sm flex items-center gap-2">
                <Tag size={16} className="text-blue-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map(skill => (
              <span key={skill} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {job.description}
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
