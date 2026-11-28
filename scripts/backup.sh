#!/usr/bin/env bash
# =============================================================================
# SEK TECH — Veri Tabanı Yedekleme Betiği (Issue #66)
# Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
# Kullanım: ./scripts/backup.sh [yedek_dizini]
# =============================================================================
set -euo pipefail

BACKUP_DIR="${1:-database/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sektech_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

# Varsayılan bağlantı bilgileri (çevre değişkenlerinden veya staging/dev varsayılanı)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-sektech}"

echo "=========================================="
echo "SEK TECH Veri Tabanı Yedekleme Başlatılıyor"
echo "Hedef Dosya: ${BACKUP_FILE}"
echo "Veri Tabanı: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo "=========================================="

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump "${DATABASE_URL}" --clean --if-exists --no-owner --no-privileges -f "${BACKUP_FILE}"
else
  PGPASSWORD="${PGPASSWORD:-password}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean --if-exists --no-owner --no-privileges \
    -f "${BACKUP_FILE}"
fi

FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Yedekleme başarıyla tamamlandı: ${BACKUP_FILE} (${FILESIZE})"
