# =============================================================================
# SEK TECH — Veri Tabanı Yedekleme Betiği (PowerShell) (Issue #66)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
# Kullanım: .\scripts\backup.ps1 [-BackupDir "database/backups"]
# =============================================================================
param(
    [string]$BackupDir = "database/backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "sektech_backup_${Timestamp}.sql"

$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "admin" }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "sektech" }
$DbPassword = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "password" }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SEK TECH Veri Tabanı Yedekleme Başlatılıyor" -ForegroundColor Cyan
Write-Host "Hedef Dosya: $BackupFile" -ForegroundColor Cyan
Write-Host "Veri Tabanı: ${DbName}@${DbHost}:${DbPort}" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$env:PGPASSWORD = $DbPassword

if ($env:DATABASE_URL) {
    & pg_dump $env:DATABASE_URL --clean --if-exists --no-owner --no-privileges -f $BackupFile
} else {
    & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName --clean --if-exists --no-owner --no-privileges -f $BackupFile
}

if ($LASTEXITCODE -eq 0 -and (Test-Path $BackupFile)) {
    $Size = (Get-Item $BackupFile).Length / 1KB
    Write-Host ("`n[OK] Yedekleme basariyla tamamlandi: {0} ({1:N1} KB)" -f $BackupFile, $Size) -ForegroundColor Green
} else {
    Write-Host "`n[HATA] Yedekleme basarisiz oldu!" -ForegroundColor Red
    exit 1
}
