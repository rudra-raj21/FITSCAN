@echo off
echo ========================================
echo FITSCAN APP - BACKEND SETUP
echo ========================================
echo.
echo This script will guide you through setting up the complete backend.
echo.
echo BEFORE YOU START:
echo 1. Create a free Supabase account at https://supabase.com
echo 2. Your project is already configured for: eoyuedfyyimmlqcrkscb
echo 3. Go to: https://supabase.com/dashboard/project/eoyuedfyyimmlqcrkscb
echo.
echo SETUP STEPS:
echo.
echo 1. In Supabase Dashboard, go to SQL Editor
echo 2. Copy and paste the entire contents of: supabase\setup_complete_database.sql
echo 3. Click "Run" to execute the database setup
echo.
echo 4. Go to Settings -> API in Supabase Dashboard
echo 5. Copy your Project URL and anon key
echo 6. Update the .env file with your credentials
echo.
echo 7. Go to Edge Functions in Supabase Dashboard
echo 8. Create new function named "analyze-food"
echo 9. Copy contents from: supabase\functions\analyze-food\index.ts
echo 10. Deploy the function
echo.
echo After setup:
echo - Restart your app: npm run dev
echo - Test authentication at: http://localhost:8080/auth
echo - Test meal tracking and AI analysis
echo.
echo For detailed guide, read: BACKEND_SETUP.md
echo.
pause