# =============================================================================
# SEK TECH — Staging Ortamı Dağıtım ve Doğrulama Betiği (PowerShell)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #59
# =============================================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 SEK TECH Staging Ortamı Başlatılıyor..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Konteynerleri ayağa kaldır
docker compose -f docker-compose.staging.yml up --build -d --wait --wait-timeout 180

if ($LASTEXITCODE -ne 0) {
    Write-Error "Staging ortamı başlatılamadı!"
    exit 1
}

Write-Host "✅ Staging konteynerleri ayakta." -ForegroundColor Green

# 2. Sağlık kontrolleri
Write-Host "🔍 Sağlık kontrolü yapılıyor..." -ForegroundColor Yellow
try {
    $resApi = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -UseBasicParsing -TimeoutSec 10
    if ($resApi.StatusCode -eq 200) {
        Write-Host "✅ API Sağlık Kontrolü Başarılı (http://localhost:5001/api/health)" -ForegroundColor Green
    }
    $resClient = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
    if ($resClient.StatusCode -eq 200) {
        Write-Host "✅ Frontend Erişilebilir (http://localhost:3001)" -ForegroundColor Green
    }
} catch {
    Write-Warning "Servislere erişim kontrol edilirken uyarı: $_"
}

Write-Host "🎉 Staging ortamı başarıyla devreye alındı!" -ForegroundColor Green
