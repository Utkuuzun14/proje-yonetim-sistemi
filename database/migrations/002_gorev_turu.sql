-- =============================================================================
-- 002 · Görev türü ve Kısıtlar (Karar 11, #47) — Şema v2
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #52
-- Yalnızca ileri gider ve tekrar çalıştırılabilir (idempotent, veri silmez).
-- =============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'Task';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tasks_type') THEN
        ALTER TABLE tasks ADD CONSTRAINT chk_tasks_type CHECK (type IN ('Task', 'Bug', 'Feature'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tasks_dates') THEN
        ALTER TABLE tasks ADD CONSTRAINT chk_tasks_dates
            CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date) NOT VALID;
    END IF;
END $$;

COMMENT ON COLUMN tasks.type IS 'Görev türü: Task, Bug, Feature (Karar 11)';

-- Takvim, Gantt ve filtreleme performans indeksleri (#51, #57, #58)
CREATE INDEX IF NOT EXISTS idx_tasks_project_dates ON tasks(project_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
