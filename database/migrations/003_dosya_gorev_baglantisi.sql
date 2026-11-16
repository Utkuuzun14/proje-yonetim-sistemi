-- =============================================================================
-- 003 · Göreve dosya bağlama (Karar 11, #47) — #58 için
-- Yalnızca ileri gider ve tekrar çalıştırılabilir (veri silmez).
-- Görev silinirse dosya projede kalır, bağlantısı kalkar.
-- =============================================================================

ALTER TABLE files ADD COLUMN IF NOT EXISTS task_id INT REFERENCES tasks(id) ON DELETE SET NULL;

COMMENT ON COLUMN files.task_id IS 'Dosyanın bağlı olduğu görev (isteğe bağlı, aynı projeden olmalı)';
COMMENT ON COLUMN files.storage_path IS 'Depolama anahtarı (UUID); orijinal ad kullanılmaz (FR-13.4)';

CREATE INDEX IF NOT EXISTS idx_files_task ON files(task_id);
