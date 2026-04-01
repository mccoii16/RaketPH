import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Job } from '../types';
import { JobCard } from './JobCard';
import { MapPin, DollarSign, Calendar, Tag, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface JobBoardProps {
  onJobSelect: (job: Job) => void;
  onPostJob: () => void;
  userRole?: string;
}

export function JobBoard({ onJobSelect, onPostJob, userRole }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);

  const cultureTags = [
    '#NoTimeTracker', '#FlexiTime', '#HMOIncluded', '#13thMonthPaid', '#GovernmentBenefitsPaid'
  ];

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
    });
    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                         job.employerName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || job.cultureTags.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search jobs, companies..."
            className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {cultureTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(filter === tag ? null : tag)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                filter === tag 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30" 
                  : "bg-white/60 text-gray-600 border-white/40 hover:bg-white"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {userRole === 'employer' && (
          <button 
            onClick={onPostJob}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-[2rem] font-bold shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            Post Job
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => onJobSelect(job)}
            isScammy={job.description.toLowerCase().includes('telegram') || job.description.toLowerCase().includes('processing fee')}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl font-medium">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
