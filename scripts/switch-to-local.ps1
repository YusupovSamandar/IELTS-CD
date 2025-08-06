#!/usr/bin/env pwsh

# Quick switch to LOCAL database
Write-Host "🔄 Switching to LOCAL Docker PostgreSQL database..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Update DATABASE_PROVIDER in .env file
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'DATABASE_PROVIDER=.*', 'DATABASE_PROVIDER=local'

# Update active DATABASE_URL and DIRECT_URL to local
$localUrl = "postgresql://ieltstrek_user:ieltstrek_local_password@localhost:5433/ieltstrek"
$envContent = $envContent -replace '(?m)^DATABASE_URL="[^"]*"', "DATABASE_URL=`"$localUrl`""
$envContent = $envContent -replace '(?m)^DIRECT_URL="[^"]*"', "DIRECT_URL=`"$localUrl`""

Set-Content ".env" $envContent

Write-Host "✅ Switched to LOCAL database" -ForegroundColor Green
Write-Host "🐳 Starting Docker PostgreSQL container..." -ForegroundColor Blue

# Start Docker container
docker-compose up -d postgres

Write-Host "🔧 Regenerating Prisma client..." -ForegroundColor Blue
bun prisma generate

Write-Host "🗄️  Running migrations..." -ForegroundColor Blue
bun prisma migrate deploy

Write-Host "🎉 Successfully switched to LOCAL database!" -ForegroundColor Green
Write-Host "🎯 Database URL: postgresql://ieltstrek_user:***@localhost:5433/ieltstrek" -ForegroundColor Cyan
