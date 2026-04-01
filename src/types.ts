export type UserRole = 'employee' | 'employer';
export type ApplicationStatus = 'pending' | 'seen' | 'shortlisted' | 'rejected';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  isVouched?: boolean;
  skills?: string[];
  intro?: string;
  certificates?: string[];
  
  // Employer specific
  companyName?: string;
  industry?: string;
  
  // Employee specific
  primarySkill?: string;
  experienceLevel?: string;
  
  experience?: {
    company: string;
    position: string;
    duration: string;
  }[];
  education?: {
    school: string;
    degree: string;
    year: string;
  }[];
  savedJobs?: string[];
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  cultureTags: string[];
  requiredSkills: string[];
  requiresVideoIntro?: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  employeeId: string;
  employeeName: string;
  employeePhoto?: string;
  status: ApplicationStatus;
  message?: string;
  resumeUrl?: string;
  videoIntroUrl?: string;
  appliedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  employerId: string;
  employeeId: string;
  employerName?: string;
  employeeName?: string;
  employerPhoto?: string;
  employeePhoto?: string;
  unreadCount?: { [userId: string]: number };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
}
