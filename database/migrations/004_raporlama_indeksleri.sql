-- =============================================================================
-- Migration 004: Raporlama ve Analitik Sorgu İndeksleri
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #66
-- İlgili: #65, #66 (Sprint 6 — M4 Özellik Dondurma)
-- =============================================================================

-- 1. Görev durumu, bitiş tarihi ve gecikme filtreleme indeksi
-- Proje genelinde ve kişi bazlı filtrelemede (To Do, In Progress, Done, Overdue)
-- t.project_id = $1 AND (t.status = ... OR (t.end_date < CURRENT_DATE AND t.status <> 'Done'))
CREATE INDEX IF NOT EXISTS idx_tasks_project_status_end_date
    ON tasks(project_id, status, end_date);

-- 2. Kişi bazlı görev dağılımı ve iş yükü dengeleme indeksi
-- Proje üyelerine göre gruplama ve atanmamış görev sorguları
CREATE INDEX IF NOT EXISTS idx_tasks_project_assignee
    ON tasks(project_id, assignee_id);

-- 3. Tarih aralıklı raporlama için oluşturulma tarihi indeksi
-- t.project_id = $1 AND t.created_at::date BETWEEN $2::date AND $3::date
CREATE INDEX IF NOT EXISTS idx_tasks_project_created_at
    ON tasks(project_id, created_at);

-- 4. Durum geçmişi üzerinden tamamlanan görev analizi indeksi
-- task_status_history tablosunda yeni durum 'Done' ve tarih aralığı filtreleme
CREATE INDEX IF NOT EXISTS idx_task_status_history_done_changed
    ON task_status_history(task_id, new_status, changed_at);

-- 5. Proje üyeleri sorgulama indeksi (bütünlük doğrulaması)
CREATE INDEX IF NOT EXISTS idx_project_members_project_user
    ON project_members(project_id, user_id);
