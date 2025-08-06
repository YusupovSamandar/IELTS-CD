#!/usr/bin/env pwsh

# Enhanced migration script for IELTS Trek database setup

param(
    [string]$Provider = "local",
    [switch]$Force,
    [switch]$WithPgAdmin,
    [switch]$Help
)

if ($Help) {
    Write-Host "🗄️  IELTS Trek Database Setup Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\migrate-to-local.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Provider <provider>  Database provider (local, supabase, production)"
    Write-Host "  -Force               Force recreation of database"
    Write-Host "  -WithPgAdmin         Start PgAdmin for database management"
    Write-Host "  -Help                Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\migrate-to-local.ps1                    # Setup local database"
    Write-Host "  .\migrate-to-local.ps1 -Provider supabase # Switch to Supabase"
    Write-Host "  .\migrate-to-local.ps1 -WithPgAdmin       # Setup with PgAdmin"
    exit 0
}

Write-Host "🚀 Setting up IELTS Trek database with provider: $Provider" -ForegroundColor Green

# Step 1: Setup environment file
Write-Host "📋 Step 1: Setting up environment configuration..." -ForegroundColor Blue

switch ($Provider) {
    "local" {
        if (-not (Test-Path ".env.local")) {
            if (Test-Path ".env.local.example") {
                Copy-Item ".env.local.example" ".env.local"
                Write-Host "✅ Created .env.local from example" -ForegroundColor Green
            } else {
                Write-Host "❌ .env.local.example not found!" -ForegroundColor Red
                exit 1
            }
        }
        
        # Start Docker containers
        Write-Host "🐳 Starting PostgreSQL Docker container..." -ForegroundColor Blue
        
        if ($WithPgAdmin) {
            docker-compose --profile tools up -d
            Write-Host "🎯 PgAdmin available at: http://localhost:5050" -ForegroundColor Cyan
            Write-Host "   Username: admin@ieltstrek.local" -ForegroundColor Yellow
            Write-Host "   Password: admin123" -ForegroundColor Yellow
        } else {
            docker-compose up -d postgres
        }
        
        # Wait for database to be ready
        Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Test connection
        $maxRetries = 12
        $retryCount = 0
        do {
            $retryCount++
            try {
                docker-compose exec -T postgres pg_isready -U ieltstrek_user -d ieltstrek
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Database is ready!" -ForegroundColor Green
                    break
                }
            } catch {
                # Ignore error, will retry
            }
            
            if ($retryCount -eq $maxRetries) {
                Write-Host "❌ Database failed to start after $maxRetries attempts" -ForegroundColor Red
                exit 1
            }
            
            Write-Host "⏳ Waiting for database... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } while ($retryCount -lt $maxRetries)
    }
    
    "supabase" {
        if (-not (Test-Path ".env.supabase.example")) {
            Write-Host "❌ .env.supabase.example not found!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "� Please copy .env.supabase.example to .env.local and configure your Supabase credentials" -ForegroundColor Yellow
        Write-Host "   Then run this script again." -ForegroundColor Yellow
        exit 1
    }
    
    default {
        Write-Host "❌ Unknown provider: $Provider" -ForegroundColor Red
        Write-Host "   Supported providers: local, supabase, production" -ForegroundColor Yellow
        exit 1
    }
}

# Step 2: Install dependencies
Write-Host "📦 Step 2: Installing/updating dependencies..." -ForegroundColor Blue
bun install

# Step 3: Generate Prisma client
Write-Host "🔧 Step 3: Generating Prisma client..." -ForegroundColor Blue
bun prisma generate

# Step 4: Run migrations
Write-Host "🗄️  Step 4: Running database migrations..." -ForegroundColor Blue

if ($Force) {
    Write-Host "⚠️  Force flag detected - resetting database..." -ForegroundColor Yellow
    bun prisma migrate reset --force
} else {
    bun prisma migrate deploy
}

# Step 5: Validate setup
Write-Host "🔍 Step 5: Validating database setup..." -ForegroundColor Blue

try {
    bun prisma db pull --print | Out-Null
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "   Check your .env.local configuration" -ForegroundColor Yellow
    exit 1
}

# Success message
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: bun dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White

if ($Provider -eq "local") {
    Write-Host "  3. Database: postgresql://ieltstrek_user:***@localhost:5432/ieltstrek" -ForegroundColor White
    
    if ($WithPgAdmin) {
        Write-Host "  4. PgAdmin: http://localhost:5050" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🛠️  Useful commands:" -ForegroundColor Cyan
Write-Host "  bun prisma studio          # Open Prisma Studio" -ForegroundColor White
Write-Host "  docker-compose logs        # View database logs" -ForegroundColor White
Write-Host "  docker-compose down        # Stop database" -ForegroundColor White
