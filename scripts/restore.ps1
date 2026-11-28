# =============================================================================
# SEK TECH — Veri Tabanı Geri Yükleme Betiği (PowerShell) (Issue #66)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
# Kullanım: .\scripts\restore.ps1 -BackupFile "database/backups/sektech_backup_xyz.sql"
# =============================================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Host "[HATA] Yedek dosyasi bulunamadi: $BackupFile" -ForegroundColor Red
    exit 1
}

$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "admin" }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "sektech" }
$DbPassword = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "password" }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SEK TECH Veri Tabanı Geri Yükleme Başlatılıyor" -ForegroundColor Cyan
Write-Host "Kaynak Dosya: $BackupFile" -ForegroundColor Cyan
Write-Host "Hedef Veri Tabanı: ${DbName}@${DbHost}:${DbPort}" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$env:PGPASSWORD = $DbPassword

if ($env:DATABASE_URL) {
    & psql $env:DATABASE_URL -f $BackupFile
} else {
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BackupFile
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Geri yukleme basariyla tamamlandi: $BackupFile" -ForegroundColor Green
} else {
    Write-Host "`n[HATA] Geri yukleme basarisiz oldu!" -ForegroundColor Red
    exit 1
}
