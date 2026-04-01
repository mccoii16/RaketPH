import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import HomePage from './HomePage';
import Register from './Register';
import { Auth } from './Auth';
import { WorkHub } from './WorkHub';
import { Signup } from './Signup';
import { Loader2 } from 'lucide-react';

export default function AppRoutes() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/hub" /> : <HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/hub" /> : <Auth />} />
      <Route path="/register" element={user ? <Navigate to="/hub" /> : <Register />} />
      <Route 
        path="/hub" 
        element={
          user ? (
            profile ? (
              <WorkHub profile={profile} />
            ) : (
              <Signup user={user} onComplete={() => fetchProfile(user.uid)} />
            )
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
