#!/usr/bin/env bash
# =============================================================================
# SEK TECH — Staging Ortamı Dağıtım ve Doğrulama Betiği — Sprint 5 (Issue #59)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
# =============================================================================

set -euo pipefail

echo "=========================================="
echo "🚀 SEK TECH Staging Ortamı Başlatılıyor..."
echo "=========================================="

# 1. Konteynerleri ayağa kaldır
docker compose -f docker-compose.staging.yml up --build -d --wait --wait-timeout 180

echo "✅ Staging konteynerleri ayakta."

# 2. Sağlık kontrolü
echo "🔍 Sağlık kontrolü yapılıyor..."
curl -fsS http://localhost:5001/api/health > /dev/null
echo "✅ API Sağlık Kontrolü Başarılı (http://localhost:5001/api/health)"

# 3. İstemci HTTP kontrolü
curl -fsS -o /dev/null http://localhost:3001
echo "✅ Frontend Erişilebilir (http://localhost:3001)"

echo "🎉 Staging ortamı başarıyla devreye alındı ve doğrulandı!"
