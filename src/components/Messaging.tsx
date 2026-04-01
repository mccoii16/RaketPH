import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, limit, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Conversation, Message } from '../types';
import { Send, User, Clock, MessageSquare, Search, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface MessagingProps {
  profile: UserProfile;
}

export function Messaging({ profile }: MessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', profile.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(prev => {
        if (JSON.stringify(prev) === JSON.stringify(convs)) return prev;
        return convs;
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.uid]);

  useEffect(() => {
    if (!selectedConv) return;

    const q = query(
      collection(db, 'conversations', selectedConv.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(msgs)) return prev;
        return msgs;
      });
    });

    return () => unsubscribe();
  }, [selectedConv?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConv || !profile.uid) return;

    // Reset unread count for current user if it's > 0
    if (selectedConv.unreadCount?.[profile.uid] > 0) {
      const resetUnread = async () => {
        try {
          await updateDoc(doc(db, 'conversations', selectedConv.id), {
            [`unreadCount.${profile.uid}`]: 0
          });
        } catch (error) {
          console.error('Error resetting unread count:', error);
        }
      };
      resetUnread();
    }

    // Mark messages from other participant as read
    const markAsRead = async () => {
      try {
        const q = query(
          collection(db, 'conversations', selectedConv.id, 'messages'),
          where('senderId', '!=', profile.uid),
          where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          snapshot.docs.forEach(msgDoc => {
            updateDoc(msgDoc.ref, { isRead: true });
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    markAsRead();
  }, [selectedConv?.id, profile.uid, selectedConv?.unreadCount?.[profile.uid]]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const otherId = selectedConv.participants.find(id => id !== profile.uid);
      
      await addDoc(collection(db, 'conversations', selectedConv.id, 'messages'), {
        conversationId: selectedConv.id,
        senderId: profile.uid,
        text,
        createdAt: new Date().toISOString(),
        isRead: false
      });

      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        [`unreadCount.${otherId}`]: increment(1)
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipantName = (conv: Conversation) => {
    return profile.role === 'employer' ? conv.employeeName : conv.employerName;
  };

  const getOtherParticipantPhoto = (conv: Conversation) => {
    return profile.role === 'employer' ? conv.employeePhoto : conv.employerPhoto;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card h-[700px] flex overflow-hidden max-w-full">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-400" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full p-4 flex items-center gap-4 transition-all border-b border-white/5 hover:bg-white/5 ${
                  selectedConv?.id === conv.id ? 'bg-indigo-500/10' : ''
                }`}
              >
                <img 
                  src={getOtherParticipantPhoto(conv) || 'https://picsum.photos/seed/user/100/100'} 
                  alt={getOtherParticipantName(conv)}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                />
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-bold truncate">{getOtherParticipantName(conv)}</h3>
                  <p className={`text-sm truncate ${conv.unreadCount?.[profile.uid] ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {conv.lastMessageAt && (
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                    </span>
                  )}
                  {conv.unreadCount?.[profile.uid] ? (
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg glow-indigo">
                      {conv.unreadCount[profile.uid]}
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4">
              <button 
                onClick={() => setSelectedConv(null)}
                className="md:hidden p-2 text-slate-400"
              >
                <ArrowLeft size={20} />
              </button>
              <img 
                src={getOtherParticipantPhoto(selectedConv) || 'https://picsum.photos/seed/user/100/100'} 
                alt={getOtherParticipantName(selectedConv)}
                className="w-10 h-10 rounded-xl object-cover border border-white/10"
              />
              <div>
                <h3 className="font-bold">{getOtherParticipantName(selectedConv)}</h3>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30"
            >
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === profile.uid;
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-2 opacity-50 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-[10px] font-bold uppercase">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                        {isMe && (
                          msg.isRead ? (
                            <CheckCheck size={12} className="text-white" />
                          ) : (
                            <Check size={12} className="text-white" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-4">
              <input 
                type="text"
                placeholder="Type your message..."
                className="glass-input flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn-indigo p-4 rounded-2xl">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 text-center">
            <MessageSquare size={64} className="opacity-10 mb-6" />
            <h3 className="text-xl font-bold mb-2">Select a conversation</h3>
            <p className="max-w-xs">Pick a chat from the sidebar to start messaging with your team or candidates.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getOrCreateConversation(
  employer: UserProfile, 
  employee: UserProfile
): Promise<string> {
  const participants = [employer.uid, employee.uid].sort();
  const q = query(
    collection(db, 'conversations'),
    where('participants', '==', participants),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const docRef = await addDoc(collection(db, 'conversations'), {
    participants,
    employerId: employer.uid,
    employeeId: employee.uid,
    employerName: employer.companyName || employer.displayName,
    employeeName: employee.displayName,
    employerPhoto: employer.photoURL || '',
    employeePhoto: employee.photoURL || '',
    lastMessageAt: new Date().toISOString(),
    unreadCount: {
      [employer.uid]: 0,
      [employee.uid]: 0
    }
  });

  return docRef.id;
}
