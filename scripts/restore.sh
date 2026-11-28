#!/usr/bin/env bash
# =============================================================================
# SEK TECH — Veri Tabanı Geri Yükleme Betiği (Issue #66)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
# Kullanım: ./scripts/restore.sh <yedek_dosyasi.sql>
# =============================================================================
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Hata: Geri yüklenecek SQL yedek dosyasını belirtiniz."
  echo "Kullanım: $0 <yedek_dosyasi.sql>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Hata: Dosya bulunamadı: ${BACKUP_FILE}"
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-sektech}"

echo "=========================================="
echo "SEK TECH Veri Tabanı Geri Yükleme Başlatılıyor"
echo "Kaynak Dosya: ${BACKUP_FILE}"
echo "Hedef Veri Tabanı: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo "=========================================="

if [ -n "${DATABASE_URL:-}" ]; then
  psql "${DATABASE_URL}" -f "${BACKUP_FILE}"
else
  PGPASSWORD="${PGPASSWORD:-password}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -f "${BACKUP_FILE}"
fi

echo "✅ Geri yükleme başarıyla tamamlandı: ${BACKUP_FILE}"
