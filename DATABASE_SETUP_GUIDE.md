# DJ SANJAY - Database Setup Guide

## Current Status
✅ Firebase Auth: Configured and working
✅ Supabase URL & Keys: Added to `.env.local`
✅ Build: Passing without errors

## Required Supabase Tables

Your app uses the following Supabase tables. Create them in your Supabase dashboard:

### 1. **reviews** Table
```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **bookings** Table (for future bookings storage)
```sql
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  event_date DATE NOT NULL,
  district VARCHAR(100),
  area VARCHAR(100),
  event_type VARCHAR(100),
  location TEXT,
  package_type VARCHAR(50) NOT NULL,
  selected_items JSONB,
  reference_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **settings** Table (for app settings)
```sql
CREATE TABLE settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Steps

### Step 1: Create Tables in Supabase
1. Go to https://app.supabase.com
2. Select your project: `ktyiecljyleavujahgyl`
3. Go to **SQL Editor**
4. Create a new query and paste each table creation script above
5. Run each query

### Step 2: Set Row-Level Security (RLS)
Enable RLS on all tables for better security:

```sql
-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews"
ON reviews FOR SELECT
USING (true);

-- Allow anonymous insert to reviews
CREATE POLICY "Allow anonymous insert to reviews"
ON reviews FOR INSERT
WITH CHECK (true);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own bookings
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow authenticated users to insert bookings
CREATE POLICY "Authenticated users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid()::text = user_id);
```

### Step 3: Verify .env.local
Your `.env.local` file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL="https://ktyiecljyleavujahgyl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_SITE_URL="http://localhost:9002"
```

### Step 4: Verify Firebase Auth
Firebase Auth is already configured with:
- Project ID: `studio-5817243041-67938`
- Auth Domain: `studio-5817243041-67938.firebaseapp.com`

No additional setup needed!

## Testing the Connection

### Run Development Server
```bash
npm run dev
```

The app should now run at `http://localhost:9002` without errors.

### Test Database Connection
1. Go to Home page
2. Scroll to Reviews section
3. You should see default reviews loading
4. Try adding a new review (requires sign-in)

### Test Authentication
1. Go to `/settings` or click Sign In
2. Sign in with Google (Firebase Auth) ✓
3. Sign up with email/password (Firebase Auth) ✓
4. After signing in, you can book a DJ show ✓

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** 
- Check `.env.local` exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present
- Restart the dev server after making changes

### Issue: Reviews not loading
**Solution:**
- Verify the `reviews` table exists in Supabase
- Check RLS policies allow public read access
- Open browser DevTools > Console to see error messages

### Issue: Firebase Auth not working
**Solution:**
- Firebase config is in `src/firebase/config.ts`
- Verify Firebase project is active
- Check browser console for auth errors

### Issue: "Internal Server Error" on page load
**Solution:**
1. Clear `.next` folder: `rm -r .next`
2. Clear browser cache
3. Restart dev server: `npm run dev`
4. Check browser console (F12) for errors

## Environment Variables Reference

| Variable | Required | Source | Purpose |
|----------|----------|--------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase Dashboard | Database connection |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase Dashboard | Supabase authentication |
| NEXT_PUBLIC_SITE_URL | Optional | Set to localhost | Redirect URLs for auth |

## Need Help?

1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [Firebase Docs](https://firebase.google.com/docs)
3. Review browser console errors (F12)
4. Check `/docs/supabase-setup.md` in this project
