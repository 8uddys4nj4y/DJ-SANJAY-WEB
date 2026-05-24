# Connecting Next.js to Supabase and Setting up Authentication

This guide outlines how to integrate Supabase into your Next.js project and handle user authentication (Sign In, Sign Up, Sign Out, and Session Tracking).

## 1. Environment Setup

Create or update your `.env.local` file at the root of the project with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Note: You can find these in the Supabase Dashboard under **Project Settings > API**.*

---

## 2. Initialize the Supabase Client

Create a file named `src/lib/supabase.ts` (or `src/app/utils/supabase.ts`) to initialize the Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 3. Implement Auth Functions

Here are the basic authentication helpers you can use throughout your components:

### A. Sign Up (Email & Password)
```typescript
import { supabase } from '@/lib/supabase';

export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`, // Callback redirect for verification
    },
  });
  return { data, error };
}
```

### B. Sign In (Email & Password)
```typescript
import { supabase } from '@/lib/supabase';

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}
```

### C. Sign Out
```typescript
import { supabase } from '@/lib/supabase';

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
```

### D. Sign In with OAuth (Google)
```typescript
import { supabase } from '@/lib/supabase';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}
```

---

## 4. Track Authentication State (React Context / Custom Hook)

To make the logged-in user available across the app, implement an Auth Context Provider. 

Create `src/context/AuthContext.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Wrap your `src/app/layout.tsx` with the `AuthProvider`:

```tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 5. Protecting Routes / Middleware (Server Side)

If you are using Next.js Server Components or Middleware to protect admin pages, configure `src/middleware.ts` to intercept requests:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin or booking routes
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*'],
};
```

*Note: For the Middleware to work, make sure to install the SSR helper package:*
`npm install @supabase/ssr`
