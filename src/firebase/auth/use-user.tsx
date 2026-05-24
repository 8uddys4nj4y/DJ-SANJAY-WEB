'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export type FirebaseUserCompat = User & { uid: string; id: string };

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<FirebaseUserCompat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          ...firebaseUser,
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, [auth]);

  return { user, loading };
}
