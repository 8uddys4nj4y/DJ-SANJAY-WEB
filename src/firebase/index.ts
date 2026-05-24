'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let _app: FirebaseApp;
let _auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function initializeFirebase() {
  try {
    const firebaseApp = getFirebaseApp();
    const auth = getFirebaseAuth();
    return {
      firebaseApp,
      firestore: null, // Firestore not configured, only Auth is used
      auth,
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
