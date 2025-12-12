@echo off
echo ========================================
echo UPDATE SUPABASE CREDENTIALS
echo ========================================
echo.
echo Please paste your Supabase anon key below
echo (You can get it from: https://supabase.com/dashboard/project/eoyuedfyyimmlqcrkscb/settings/api)
echo.
set /p supabase_key="Enter your Supabase anon key: "

if "%supabase_key%"=="" (
    echo No key entered. Please try again.
    pause
    exit /b 1
)

echo.
echo Updating .env file...
echo VITE_SUPABASE_URL=https://eoyuedfyyimmlqcrkscb.supabase.co > .env
echo VITE_SUPABASE_PUBLISHABLE_KEY=%supabase_key% >> .env
echo VITE_DEV_MODE=false >> .env

echo.
echo ✅ .env file updated successfully!
echo.
echo Your Supabase configuration:
echo URL: https://eoyuedfyyimmlqcrkscb.supabase.co
echo Key: %supabase_key:~0,20%... (truncated for security)
echo.
echo You can now start your app with: npm run dev
echo.
pause