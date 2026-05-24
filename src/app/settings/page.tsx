'use client';

import { useState } from 'react';
import { User as UserIcon, LogOut, Globe, LogIn, Mail, Lock, UserPlus, Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { useTranslation } from '@/context/TranslationContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const { language, setLanguage, t } = useTranslation();

  // Auth form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName && credential.user) {
          await updateProfile(credential.user, { displayName: fullName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let message = 'An error occurred during authentication.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'This sign-in method is not enabled in Firebase Authentication. Enable Email/Password in Firebase Console.';
      } else {
        message = err.message || message;
      }
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      let message = 'Google Login failed.';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled in Firebase Authentication. Enable Google in Firebase Console.';
      } else {
        message = err.message || message;
      }
      setAuthError(message);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in: Show auth forms
  if (!user) {
    return (
      <div className="pt-24 pb-20 px-4 container mx-auto max-w-md">
        <div className="bg-zinc-950/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6 backdrop-blur-md professional-shadow">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-headline font-bold tracking-tight flex items-center justify-center gap-2 text-white">
              <Sparkles className="text-primary w-5 h-5" />
              {isSignUp ? t('Sign Up') : t('Sign In')}
            </h2>
            <p className="text-zinc-500 text-xs">Access settings, booking, and tracking</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5 text-white">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('Your Name')}</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 bg-black/50 border-zinc-900 text-sm rounded-xl pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-white">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('Email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-black/50 border-zinc-900 text-sm rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-white">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-black/50 border-zinc-900 text-sm rounded-xl pl-10"
                />
              </div>
            </div>

            {authError && (
              <p className="text-red-500 text-xs mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{authError}</p>
            )}

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-primary text-black font-black h-11 rounded-full text-sm shadow-xl mt-4"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-black" />
              ) : isSignUp ? (
                <span className="flex items-center justify-center gap-2"><UserPlus size={16} /> Sign Up</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><LogIn size={16} /> Sign In</span>
              )}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-[10px] uppercase font-bold tracking-widest">or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full border-zinc-800 hover:bg-white/5 text-white h-11 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-primary hover:underline font-bold transition-all"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in: Show settings details:
  // profile pic, mail id, name, language change, book dj button, sign out
  const photoURL = user?.photoURL;
  const displayName = user?.displayName || 'Pulse User';

  return (
    <div className="pt-24 pb-20 px-4 container mx-auto max-w-md">
      <h1 className="text-3xl font-headline font-bold mb-8 text-center text-white">{t('Settings')}</h1>

      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-zinc-950/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6 backdrop-blur-md professional-shadow flex flex-col items-center text-center">
          {/* Profile Pic */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-primary flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={44} className="text-zinc-600" />
              )}
            </div>
          </div>

          <div className="space-y-1 w-full">
            {/* Name */}
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{t('Name')}</div>
            <h3 className="text-xl font-bold text-white">{displayName}</h3>
          </div>

          <div className="space-y-1 w-full border-t border-white/5 pt-4">
            {/* Mail ID */}
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{t('Email')}</div>
            <p className="text-sm text-zinc-300 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Translation & Navigation Card */}
        <div className="bg-zinc-950/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6 backdrop-blur-md professional-shadow">
          {/* Language Change */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-primary/20">
                <Globe size={18} className="text-primary" />
              </div>
              <div className="text-sm font-bold text-white">{t('Language')}</div>
            </div>
            <div className="flex bg-black/60 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  language === 'ta' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Book DJ Button */}
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-black font-black h-11 rounded-full text-sm shadow-xl flex items-center justify-center gap-2">
            <Link href="/booking">
              <Music size={16} />
              {t('Book DJ')}
            </Link>
          </Button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full h-11 rounded-full border border-destructive/30 text-destructive font-black uppercase tracking-widest hover:bg-destructive/5 transition-colors flex items-center justify-center text-[10px] gap-2"
          >
            <LogOut size={14} />
            {t('Sign Out')}
          </button>
        </div>
      </div>
    </div>
  );
}
