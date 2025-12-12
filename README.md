# 🏋️ FitScan Fitness App - Development Guide

A complete AI-powered fitness tracking application with React, TypeScript, and Supabase.

## 🚀 Quick Start (Resume Development)

### **Easiest Method - Use Batch File:**
1. Navigate to: `C:\Users\2006r\Desktop\raindrop\fitscan-diet-main\fitscan-diet-main\`
2. **Double-click `start-app.bat`**
3. App opens at: `http://localhost:8080`

### **Manual Method:**
```bash
cd C:\Users\2006r\Desktop\raindrop\fitscan-diet-main\fitscan-diet-main
npm run dev
```

### **Alternative:**
```bash
bun dev
```

---

## 📁 Project Structure

```
fitscan-diet-main/
├── src/
│   ├── pages/              # App pages (Index, AddMeal, Summary, etc.)
│   ├── components/         # UI components
│   ├── integrations/       # Database connection
│   └── hooks/             # Custom React hooks
├── supabase/
│   ├── migrations/        # Database schema
│   ├── functions/         # Edge functions (AI analysis)
│   └── setup_complete_database.sql
├── .env                   # Environment variables (configured)
├── package.json          # Dependencies
├── BACKEND_SETUP.md      # Detailed backend setup
└── README.md            # This file
```

---

## 🎯 Current Status

✅ **Fully Functional:**
- User Authentication (Signup/Login)
- Meal Tracking (Manual & Photo Upload)
- Daily Nutritional Summaries
- Real-time Database Sync
- Modern UI with shadcn/ui

✅ **Backend Setup:**
- Supabase Database: Connected
- Tables: profiles, meals, daily_summaries
- Row Level Security: Enabled
- AI Function: Ready to deploy

✅ **Environment:**
- Supabase URL: `https://eoyuedfyyimmlqcrkscb.supabase.co`
- Local Dev URL: `http://localhost:8080`
- Node.js: Installed and working

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Install new dependencies
npm install package-name

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Alternative using Bun
bun install
bun dev
bun build
```

---

## 📊 Database Schema

### **Tables:**
- **profiles** - User settings, goals, preferences
- **meals** - Food entries with nutritional data
- **daily_summaries** - Auto-calculated daily totals

### **Key Features:**
- Row Level Security (each user sees only their data)
- Automatic daily summary calculations
- JWT-based authentication
- Real-time data synchronization

---

## 🎨 UI Components & Pages

### **Pages:**
- `Index.tsx` - Dashboard with today's overview
- `AddMeal.tsx` - Add meals (photo/manual)
- `Summary.tsx` - Daily nutritional breakdown
- `Auth.tsx` - Login/Signup
- `Profile.tsx` - User settings
- `ProfileSetup.tsx` - Initial user setup

### **Key Components:**
- `TodaySummary.tsx` - Daily macro progress
- `RecentMeals.tsx` - Meal history display
- UI components from shadcn/ui

---

## 🔧 Common Development Tasks

### **Adding New Pages:**
1. Create new file in `src/pages/`
2. Add route in `src/App.tsx`
3. Create navigation link

### **Adding New Components:**
1. Create in `src/components/`
2. Import and use in pages
3. Follow shadcn/ui patterns

### **Database Changes:**
1. Write SQL in Supabase Dashboard → SQL Editor
2. Or create new migration in `supabase/migrations/`
3. Run: `supabase db push`

### **Adding Dependencies:**
```bash
npm install package-name
# Update imports in components
```

---

## 🤖 AI Food Analysis

### **Current Status:**
- Mock responses implemented (for testing)
- Real Gemini API integration ready

### **To Enable Real AI:**
1. Get Google Gemini API key
2. Update `supabase/functions/analyze-food/index.ts`
3. Redeploy Edge Function
4. Add environment variable to Supabase

---

## 📱 Testing Your App

### **User Flow Testing:**
1. Go to `http://localhost:8080/auth`
2. Sign up with test email
3. Complete profile setup
4. Add meals (manual entry)
5. View daily summary
6. Check meal history

### **Debug Tools:**
- Browser Console (F12) for errors
- Supabase Dashboard for database
- Network tab for API calls

---

## 🌐 Deployment

### **For Production:**
1. Update environment variables for production
2. Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
3. Update Supabase CORS settings
4. Deploy Edge Functions to production

### **Build Process:**
```bash
npm run build
# Upload dist/ folder to hosting provider
```

---

## 🔍 Troubleshooting

### **Common Issues:**

**"Connection refused"**
- Check .env file has correct Supabase credentials
- Ensure Supabase project is active

**"Database relation not found"**
- Run setup script: `supabase/setup_complete_database.sql`
- Check tables exist in Supabase Dashboard

**"Authentication not working"**
- Verify anon key is correct
- Check email settings in Supabase Auth

**"Port already in use"**
- Kill process on port 8080: `taskkill /PID <PID> /F`
- Or use different port in vite.config.ts

### **Getting Help:**
1. Check browser console (F12)
2. Review Supabase logs
3. Verify environment variables
4. Check network connectivity

---

## 🚀 Future Development Ideas

### **Potential Features:**
- Progress charts with recharts
- Social features (share meals)
- Recipe suggestions based on macros
- Workout tracking integration
- Meal planning calendar
- Export data (PDF/CSV)
- Barcode scanning for food items
- Integration with fitness trackers
- Meal reminders and notifications
- Nutrition goals and recommendations

### **Technical Improvements:**
- PWA (Progressive Web App)
- Offline functionality
- Mobile app version
- Advanced analytics dashboard
- Machine learning for meal suggestions

---

## 📞 Quick Reference

### **Important URLs:**
- **Local Development:** `http://localhost:8080`
- **Supabase Dashboard:** `https://supabase.com/dashboard/project/eoyuedfyyimmlqcrkscb`
- **Supabase API:** `https://eoyuedfyyimmlqcrkscb.supabase.co`

### **Key Files:**
- `.env` - Environment variables (already configured)
- `src/App.tsx` - Main routing and layout
- `supabase/setup_complete_database.sql` - Database setup
- `package.json` - Dependencies and scripts

### **Environment Setup:**
- ✅ Node.js installed
- ✅ Supabase configured
- ✅ Database connected
- ✅ Authentication working
- ✅ All dependencies installed

---

## 💾 Save Your Work

### **Git Setup (Optional):**
```bash
git init
git add .
git commit -m "FitScan app ready for development"
git remote add origin https://github.com/yourusername/fitscan-app.git
git push -u origin main
```

### **Or Just Continue:**
- Everything is saved locally
- Just open project folder and run `npm run dev`
- Your database data persists in Supabase

---

## 🎉 You're All Set!

Your FitScan fitness app is **fully functional** and ready for continued development. Just come back to this project folder, run `npm run dev`, and start building new features!

**Happy coding!** 💪🏋️‍♂️

---

*Last updated: Ready for development*
*Backend: Fully configured*
*Database: Connected and working*
*Authentication: Functional*