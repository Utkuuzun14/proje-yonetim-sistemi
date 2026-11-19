-- =============================================================================
-- 003 · Göreve Dosya Bağlama (Karar 11, #47) — Şema v3
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #59
-- Yalnızca ileri gider ve tekrar çalıştırılabilir (idempotent, veri silmez).
-- Görev silinirse dosya projede kalır, task_id NULL olur (ON DELETE SET NULL).
-- =============================================================================

ALTER TABLE files ADD COLUMN IF NOT EXISTS task_id INT REFERENCES tasks(id) ON DELETE SET NULL;

COMMENT ON COLUMN files.task_id IS 'Dosyanın bağlı olduğu görev (isteğe bağlı, aynı projeden olmalı)';
COMMENT ON COLUMN files.storage_path IS 'Depolama anahtarı (UUID); orijinal ad kullanılmaz (FR-13.4)';

-- Göreve bağlı dosyaları hızlı listeleme indeksi (#58, #59)
CREATE INDEX IF NOT EXISTS idx_files_task ON files(task_id);
