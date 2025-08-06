#!/usr/bin/env pwsh

# Quick switch to SUPABASE database
Write-Host "🔄 Switching to SUPABASE Cloud database..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Update DATABASE_PROVIDER in .env file
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'DATABASE_PROVIDER=.*', 'DATABASE_PROVIDER=supabase'

# Update active DATABASE_URL and DIRECT_URL to supabase
$supabaseUrl = ($envContent | Select-String 'SUPABASE_DATABASE_URL="([^"]*)"').Matches[0].Groups[1].Value
$supabaseDirectUrl = ($envContent | Select-String 'SUPABASE_DIRECT_URL="([^"]*)"').Matches[0].Groups[1].Value

if ($supabaseUrl -and $supabaseDirectUrl) {
    $envContent = $envContent -replace '(?m)^DATABASE_URL="[^"]*"', "DATABASE_URL=`"$supabaseUrl`""
    $envContent = $envContent -replace '(?m)^DIRECT_URL="[^"]*"', "DIRECT_URL=`"$supabaseDirectUrl`""
    
    Set-Content ".env" $envContent

    Write-Host "✅ Switched to SUPABASE database" -ForegroundColor Green
    
    Write-Host "🔧 Regenerating Prisma client..." -ForegroundColor Blue
    bun prisma generate

    Write-Host "🗄️  Running migrations..." -ForegroundColor Blue
    bun prisma migrate deploy

    Write-Host "🎉 Successfully switched to SUPABASE database!" -ForegroundColor Green
    Write-Host "🎯 Database URL: $($supabaseUrl -replace '://[^:]+:[^@]+@', '://***:***@')" -ForegroundColor Cyan
} else {
    Write-Host "❌ SUPABASE_DATABASE_URL or SUPABASE_DIRECT_URL not found in .env file!" -ForegroundColor Red
    Write-Host "Please make sure these variables are set:" -ForegroundColor Yellow
    Write-Host "  SUPABASE_DATABASE_URL=..." -ForegroundColor White
    Write-Host "  SUPABASE_DIRECT_URL=..." -ForegroundColor White
}
