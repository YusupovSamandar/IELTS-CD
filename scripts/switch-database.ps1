#!/usr/bin/env pwsh

# Database Provider Switcher for IELTS Trek

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "supabase", "production")]
    [string]$Provider,
    
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "🔄 IELTS Trek Database Provider Switcher" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\switch-database.ps1 -Provider <provider> [OPTIONS]"
    Write-Host ""
    Write-Host "Providers:"
    Write-Host "  local       Local Docker PostgreSQL"
    Write-Host "  supabase    Supabase Cloud PostgreSQL" 
    Write-Host "  production  Production PostgreSQL"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Force      Skip confirmation prompt"
    Write-Host "  -Help       Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\switch-database.ps1 -Provider local"
    Write-Host "  .\switch-database.ps1 -Provider supabase -Force"
    exit 0
}

Write-Host "🔄 Switching to $Provider database provider..." -ForegroundColor Green

# Check if environment example exists
$envExample = ".env.$Provider.example"
if (-not (Test-Path $envExample)) {
    Write-Host "❌ Environment example file not found: $envExample" -ForegroundColor Red
    exit 1
}

# Confirmation prompt
if (-not $Force) {
    Write-Host "⚠️  This will:" -ForegroundColor Yellow
    Write-Host "   1. Update your .env.local file" -ForegroundColor White
    Write-Host "   2. Switch DATABASE_PROVIDER to '$Provider'" -ForegroundColor White
    Write-Host "   3. Regenerate Prisma client" -ForegroundColor White
    
    if ($Provider -eq "local") {
        Write-Host "   4. Start Docker PostgreSQL container" -ForegroundColor White
    }
    
    Write-Host ""
    $confirm = Read-Host "Continue? (y/N)"
    
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        exit 0
    }
}

# Backup current .env.local
if (Test-Path ".env.local") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env.local" ".env.local.backup.$timestamp"
    Write-Host "📋 Backed up current .env.local to .env.local.backup.$timestamp" -ForegroundColor Blue
}

# Copy new environment configuration
Copy-Item $envExample ".env.local"
Write-Host "✅ Updated .env.local with $Provider configuration" -ForegroundColor Green

# Start services if needed
switch ($Provider) {
    "local" {
        Write-Host "🐳 Starting Docker PostgreSQL..." -ForegroundColor Blue
        docker-compose up -d postgres
        
        Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Check if database is ready
        $ready = $false
        $attempts = 0
        $maxAttempts = 12
        
        do {
            $attempts++
            try {
                docker-compose exec -T postgres pg_isready -U ieltstrek_user -d ieltstrek
                if ($LASTEXITCODE -eq 0) {
                    $ready = $true
                    break
                }
            } catch {
                # Continue retrying
            }
            
            if ($attempts -lt $maxAttempts) {
                Write-Host "⏳ Database not ready yet... (attempt $attempts/$maxAttempts)" -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        } while ($attempts -lt $maxAttempts)
        
        if (-not $ready) {
            Write-Host "❌ Database failed to start" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Database is ready!" -ForegroundColor Green
    }
    
    "supabase" {
        Write-Host "📝 Please update .env.local with your Supabase credentials:" -ForegroundColor Yellow
        Write-Host "   - SUPABASE_DATABASE_URL" -ForegroundColor White
        Write-Host "   - SUPABASE_DIRECT_URL" -ForegroundColor White
    }
}

# Regenerate Prisma client
Write-Host "🔧 Regenerating Prisma client..." -ForegroundColor Blue
bun prisma generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
bun prisma migrate deploy

# Test connection
Write-Host "🔍 Testing database connection..." -ForegroundColor Blue
try {
    bun prisma db pull --print | Out-Null
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "   Please check your .env.local configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Successfully switched to $Provider database!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   bun dev" -ForegroundColor White
