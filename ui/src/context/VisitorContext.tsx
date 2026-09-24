import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiUrl } from '../config/api';

export interface VisitorProfile {
  name: string;
  email?: string;
  phone?: string;
  is_subscribed?: boolean;
}

interface VisitorContextType {
  visitor: VisitorProfile | null;
  saveVisitor: (profile: VisitorProfile) => void;
  clearVisitor: () => void;
  requireVisitor: (onSuccess?: (profile: VisitorProfile) => void) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  welcomeToast: string | null;
  dismissToast: () => void;
}

const VISITOR_STORAGE_KEY = 'visitor_profile';
const VISITOR_PROMPT_KEY = 'visitor_prompt_shown';

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<((profile: VisitorProfile) => void) | null>(null);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  const isAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path.startsWith('/admin') || hash.includes('/admin');
  };

  // Initialize from localStorage on boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VisitorProfile;
        if (parsed && parsed.name) {
          setVisitor(parsed);
          // Trigger welcome toast for returning visitor if not on admin route
          if (!isAdminRoute()) {
            triggerWelcomeToast(parsed.name);
          }
          return;
        }
      }

      // If no visitor profile exists and prompt has not been shown yet, prompt after 2.5s (except on admin page)
      const promptShown = localStorage.getItem(VISITOR_PROMPT_KEY);
      if (!promptShown && !isAdminRoute()) {
        const timer = setTimeout(() => {
          if (!isAdminRoute()) {
            setIsModalOpen(true);
            localStorage.setItem(VISITOR_PROMPT_KEY, 'true');
          }
        }, 2500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error('Failed to parse visitor profile from localStorage', e);
    }
  }, []);

  const triggerWelcomeToast = (name: string, isReturning: boolean = true) => {
    if (isAdminRoute()) return;
    const msg = isReturning 
      ? `Hey ${name}, We remember you. Welcome back. How are you doing ? :)`
      : `Hi ${name}, welcome! How are you doing today? 👋`;
    setWelcomeToast(msg);
    setTimeout(() => {
      setWelcomeToast(null);
    }, 5000);
  };

  const saveVisitor = async (profile: VisitorProfile) => {
    setVisitor(profile);
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(VISITOR_PROMPT_KEY, 'true');
    setIsModalOpen(false);

    // Save to backend database asynchronously
    try {
      const res = await fetch(apiUrl('/visitors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email || '',
          phone: profile.phone || '',
          is_subscribed: profile.is_subscribed !== false ? 1 : 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.is_existing) {
          triggerWelcomeToast(profile.name, true);
        } else {
          triggerWelcomeToast(profile.name, false);
        }
      } else {
        triggerWelcomeToast(profile.name, false);
      }
    } catch (err) {
      console.error('Failed to sync visitor profile with backend', err);
      triggerWelcomeToast(profile.name, false);
    }

    if (pendingCallback) {
      pendingCallback(profile);
      setPendingCallback(null);
    }
  };

  const clearVisitor = () => {
    setVisitor(null);
    localStorage.removeItem(VISITOR_STORAGE_KEY);
  };

  const requireVisitor = (onSuccess?: (profile: VisitorProfile) => void) => {
    if (visitor && visitor.name) {
      if (onSuccess) onSuccess(visitor);
    } else {
      if (onSuccess) setPendingCallback(() => onSuccess);
      setIsModalOpen(true);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setPendingCallback(null);
  };

  const dismissToast = () => setWelcomeToast(null);

  return (
    <VisitorContext.Provider
      value={{
        visitor,
        saveVisitor,
        clearVisitor,
        requireVisitor,
        isModalOpen,
        openModal,
        closeModal,
        welcomeToast,
        dismissToast,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
}
