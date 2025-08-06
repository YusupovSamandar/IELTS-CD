@echo off
echo 🚀 Quick Local Database Setup
echo.

echo 📋 Step 1: Copy environment file
copy .env.local.example .env.local
echo ✅ Please edit .env.local with your PostgreSQL credentials

echo.
echo 📦 Step 2: Generate Prisma client
call bun prisma generate

echo.
echo 🗄️ Step 3: Run migrations  
call bun prisma migrate deploy

echo.
echo 🎯 Step 4: Start the application
call bun dev

echo.
echo ✅ Setup complete! Your app should be running on http://localhost:3000
