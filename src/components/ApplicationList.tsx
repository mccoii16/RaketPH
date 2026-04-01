import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Application, UserProfile } from '../types';
import { BentoProfile } from './BentoProfile';
import { CheckCheck, Clock, User, ArrowLeft, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationListProps {
  jobId: string;
  onBack: () => void;
  jobRequiredSkills: string[];
}

export function ApplicationList({ jobId, onBack, jobRequiredSkills }: ApplicationListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(apps);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [jobId]);

  const handleViewCandidate = async (app: Application) => {
    // Update status to 'seen' if it's currently 'pending'
    if (app.status === 'pending') {
      try {
        await updateDoc(doc(db, 'applications', app.id), { status: 'seen' });
      } catch (error) {
        console.error('Error updating application status:', error);
      }
    }

    // Fetch candidate profile
    try {
      const userDoc = await getDoc(doc(db, 'users', app.employeeId));
      if (userDoc.exists()) {
        setSelectedCandidate(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    }
  };

  const calculateMatchScore = (candidateSkills: string[] = []) => {
    if (jobRequiredSkills.length === 0) return 100;
    const common = candidateSkills.filter(skill => 
      jobRequiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((common.length / jobRequiredSkills.length) * 100);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading applications...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Job Board
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">Applications ({applications.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map(app => (
          <div 
            key={app.id}
            onClick={() => handleViewCandidate(app)}
            className="group bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={app.employeePhoto || 'https://picsum.photos/seed/candidate/100/100'} 
                alt={app.employeeName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{app.employeeName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  Applied {formatDistanceToNow(new Date(app.appliedAt))} ago
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                {app.status === 'seen' ? (
                  <div className="flex items-center gap-1 text-blue-500 font-bold text-sm">
                    <CheckCheck size={18} />
                    Seen
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 font-bold text-sm">
                    <Clock size={18} />
                    Pending
                  </div>
                )}
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-white/20">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-xl font-medium">No applications yet.</p>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-gray-50 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative">
            <button 
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 p-3 bg-white/80 rounded-full text-gray-500 hover:text-red-500 transition-all z-10 shadow-lg"
            >
              <X size={24} />
            </button>
            <div className="py-12">
              <BentoProfile 
                profile={selectedCandidate} 
                matchScore={calculateMatchScore(selectedCandidate.skills)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
