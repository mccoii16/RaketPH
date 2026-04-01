import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Signup } from './Signup';
import { HiringHub } from './HiringHub';
import { WorkHub } from './WorkHub';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardWrapperProps {
  user: any;
}

export function DashboardWrapper({ user }: DashboardWrapperProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSignup, setNeedsSignup] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
        setNeedsSignup(false);
      } else {
        setNeedsSignup(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin glow-indigo" />
          <p className="text-indigo-400 font-black tracking-widest uppercase text-sm animate-pulse">Authenticating Obsidian...</p>
        </div>
      </div>
    );
  }

  if (needsSignup) {
    return <Signup user={user} onComplete={fetchProfile} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={profile?.role}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {profile?.role === 'employer' ? (
          <HiringHub profile={profile} />
        ) : (
          <WorkHub profile={profile!} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
