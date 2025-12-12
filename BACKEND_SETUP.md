# 🚀 Complete Backend Setup Guide for FitScan App

## 📋 Prerequisites
1. [Supabase Account](https://supabase.com) (Free)
2. [Supabase CLI](https://supabase.com/docs/reference/cli) installed
3. [Node.js](https://nodejs.org) (Already installed since app runs locally)

---

## 🗄️ Step 1: Set Up Supabase Database

### Option A: Use Existing Project (Recommended)
Your app is already configured for project ID: `eoyuedfyyimmlqcrkscb`

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/eoyuedfyyimmlqcrkscb)
2. Navigate to **SQL Editor**
3. Run each migration file manually:

```sql
-- Run: supabase/migrations/20240101000001_create_tables.sql
-- Then run: supabase/migrations/20240101000002_rls_policies.sql
```

### Option B: Create New Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Note your project URL and anon key
4. Update `.env` file with new credentials

---

## 🔐 Step 2: Get Your Supabase Credentials

1. In Supabase Dashboard → Settings → API
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

3. Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

---

## 🏗️ Step 3: Apply Database Migrations

### Using Supabase Dashboard (Easiest):
1. Go to **SQL Editor** in your Supabase project
2. Copy and paste the contents of:
   - `supabase/migrations/20240101000001_create_tables.sql`
   - `supabase/migrations/20240101000002_rls_policies.sql`
3. Run each script separately

### Using Supabase CLI (Advanced):
```bash
# Link your local project to Supabase
supabase link --project-ref eoyuedfyyimmlqcrkscb

# Push migrations
supabase db push
```

---

## 🤖 Step 4: Deploy AI Food Analysis Function

### Using Supabase Dashboard:
1. Go to **Edge Functions** in Supabase
2. Click "Create Function"
3. Function name: `analyze-food`
4. Replace the content with `supabase/functions/analyze-food/index.ts`
5. Click "Deploy"

### Using Supabase CLI:
```bash
# Deploy the function
supabase functions deploy analyze-food
```

---

## 🎯 Step 5: Test Your Backend

1. **Restart your local app:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test Authentication:**
   - Navigate to `http://localhost:8080/auth`
   - Try signing up with email/password
   - Check if user is created in Supabase → Authentication

3. **Test Meal Tracking:**
   - Add a new meal (manual entry)
   - Check if it appears in Supabase → Table Editor → meals

4. **Test AI Analysis:**
   - Try uploading a food photo
   - Check browser console for API responses

---

## 🔧 Step 6: Configure Authentication (Optional)

In Supabase Dashboard → Authentication → Settings:

1. **Site URL:** `http://localhost:8080`
2. **Redirect URLs:** Add `http://localhost:8080/auth/callback`
3. **Enable email signup:** Make sure it's enabled

---

## 🚨 Troubleshooting

### ❌ "Database relation not found"
- Run the migration files in SQL Editor
- Check table names match exactly

### ❌ "Row level security violation"
- Make sure RLS policies are applied
- Check user is authenticated

### ❌ "AI function not working"
- Check Edge Function is deployed
- View function logs in Supabase Dashboard

### ❌ "CORS errors"
- Make sure your domain is in CORS settings
- Check environment variables are correct

---

## 🎉 What's Now Working

Once setup is complete, your FitScan app will have:

✅ **User Authentication**
- Sign up / Login / Logout
- Profile management
- Session persistence

✅ **Meal Tracking**
- Add meals (manual and photo)
- View meal history
- Daily summaries

✅ **AI Food Analysis**
- Photo upload and analysis
- Automatic calorie detection
- Nutritional breakdown

✅ **Data Persistence**
- All data saved in Supabase
- Real-time sync
- User-specific data isolation

✅ **Security**
- Row Level Security (RLS)
- User data isolation
- Secure API access

---

## 🌐 Next: Deploy to Production

Once backend is working locally:
1. Update environment variables for production
2. Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
3. Update Supabase settings with production URLs
4. Deploy Edge Functions to production

Need help with any step? Let me know! 🚀