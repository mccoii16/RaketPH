import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Tag, Plus, X, ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface PostJobProps {
  userProfile: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

export function PostJob({ userProfile, onBack, onSuccess }: PostJobProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote, Philippines');
  const [salaryRange, setSalaryRange] = useState('₱30,000 - ₱50,000');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cultureTags = [
    '#NoTimeTracker', '#FlexiTime', '#HMOIncluded', '#13thMonthPaid', '#GovernmentBenefitsPaid'
  ];

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    submitJob();
  };

  const submitJob = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        employerId: userProfile.uid,
        employerName: userProfile.displayName,
        title,
        description,
        location,
        salaryRange,
        cultureTags: selectedTags,
        requiredSkills,
        bannerUrl,
        createdAt: new Date().toISOString()
      });
      onSuccess();
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Job Board
      </button>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[3rem] p-8 md:p-12 shadow-2xl">
        <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Post a New Job</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Job Banner (Logo, Team, or Brand Image)</label>
            <div className="relative group">
              {bannerUrl ? (
                <div className="relative w-full h-48 rounded-3xl overflow-hidden border-2 border-blue-500/30">
                  <img 
                    src={bannerUrl} 
                    alt="Job Banner" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    type="button"
                    onClick={() => setBannerUrl(null)}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 bg-white/60 border-2 border-dashed border-white/40 rounded-3xl cursor-pointer hover:bg-white/80 hover:border-blue-500/30 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 mb-3">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-600">Click to upload banner</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Recommended: 1200x400)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Job Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Senior Frontend Developer"
              className="w-full px-6 py-4 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-bold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Salary Range</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Culture Tags</label>
            <div className="flex flex-wrap gap-2">
              {cultureTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                    selectedTags.includes(tag) 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" 
                      : "bg-white/60 text-gray-600 border-white/40 hover:bg-white"
                  )}
                >
                  <Tag size={14} />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Required Skills (Press Enter)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {requiredSkills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Add a skill..."
              className="w-full px-6 py-4 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Job Description</label>
            <textarea 
              required
              rows={8}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full px-6 py-4 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? "Posting..." : (
              <>
                <Send size={24} />
                Publish Job Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
