'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { TranslationProvider } from '@/context/TranslationContext';
import { Loader2 } from 'lucide-react';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instances, setInstances] = useState<{
    firebaseApp: FirebaseApp;
    firestore: any | null;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    try {
      const { firebaseApp, firestore, auth } = initializeFirebase();
      setInstances({ firebaseApp, firestore, auth });
    } catch (err) {
      console.error("Firebase initialization failed:", err);
    }
  }, []);

  if (!instances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <TranslationProvider>
      <FirebaseProvider
        firebaseApp={instances.firebaseApp}
        firestore={instances.firestore}
        auth={instances.auth}
      >
        {children}
      </FirebaseProvider>
    </TranslationProvider>
  );
};
