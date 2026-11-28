-- =============================================================================
-- SEK TECH — Proje Yönetim Platformu
-- Raporlama ve Analitik SQL Sorguları Kütüphanesi — Sprint 6 (Issue #66)
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
-- İlgili: #65 (Mustafa — Rapor API), #62 (Abdulkahhar — Kabul Kriterleri R-01..R-07)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROJE İLERLEME YÜZDESİ VE DURUM DAĞILIMI (R-01, R-02)
-- Projedeki toplam görev, To Do / In Progress / Done sayıları, geciken görevler,
-- atanmamış görevler ve tamamlanma yüzdesi (Done / Total * 100).
-- Sıfır görevli projede sıfıra bölme hatası önlenerek %0 döndürülür.
-- Parametre: $1 -> project_id (INT)
-- -----------------------------------------------------------------------------
SELECT
    COUNT(*)::int                                              AS total,
    COUNT(*) FILTER (WHERE t.status = 'To Do')::int            AS todo,
    COUNT(*) FILTER (WHERE t.status = 'In Progress')::int      AS in_progress,
    COUNT(*) FILTER (WHERE t.status = 'Done')::int             AS done,
    COUNT(*) FILTER (WHERE t.end_date < CURRENT_DATE
                       AND t.status <> 'Done')::int            AS overdue,
    COUNT(*) FILTER (WHERE t.assignee_id IS NULL)::int         AS unassigned,
    CASE
        WHEN COUNT(*) = 0 THEN 0.0
        ELSE ROUND((COUNT(*) FILTER (WHERE t.status = 'Done')::numeric / COUNT(*)::numeric) * 100.0, 1)
    END                                                        AS completion_rate
FROM tasks t
WHERE t.project_id = $1;

-- -----------------------------------------------------------------------------
-- 2. KİŞİ BAZLI TAMAMLAMA VE İŞ YÜKÜ DAĞILIMI (R-03, R-04)
-- Proje üyeleri ve projede görevi bulunan kullanıcıların görev dağılımı.
-- Görevi olmayan üyeler de 0 değerleriyle listelenir.
-- Parametre: $1 -> project_id (INT)
-- -----------------------------------------------------------------------------
WITH people AS (
    SELECT user_id FROM project_members WHERE project_id = $1
    UNION
    SELECT assignee_id FROM tasks WHERE project_id = $1 AND assignee_id IS NOT NULL
)
SELECT
    u.id                                                       AS user_id,
    u.name                                                     AS name,
    COUNT(t.id)::int                                           AS assigned,
    COUNT(t.id) FILTER (WHERE t.status = 'To Do')::int         AS todo,
    COUNT(t.id) FILTER (WHERE t.status = 'In Progress')::int   AS in_progress,
    COUNT(t.id) FILTER (WHERE t.status = 'Done')::int          AS done,
    COUNT(t.id) FILTER (WHERE t.end_date < CURRENT_DATE
                           AND t.status <> 'Done')::int        AS overdue,
    CASE
        WHEN COUNT(t.id) = 0 THEN 0.0
        ELSE ROUND((COUNT(t.id) FILTER (WHERE t.status = 'Done')::numeric / COUNT(t.id)::numeric) * 100.0, 1)
    END                                                        AS completion_rate
FROM people p
JOIN users u ON u.id = p.user_id
LEFT JOIN tasks t ON t.project_id = $1 AND t.assignee_id = u.id
GROUP BY u.id, u.name
ORDER BY u.name ASC, u.id ASC;

-- -----------------------------------------------------------------------------
-- 3. TARİH ARALIKLI İLERLEME RAPORU (R-05, R-06)
-- Belirtilen iki tarih arasında (iki sınır dahil, gün bazında):
--  - created: oluşturulma tarihi bu aralıkta olan görevler
--  - completed: task_status_history üzerinden aralıkta Done'a geçen farklı görevler
-- Parametreler: $1 -> project_id (INT), $2 -> from (DATE), $3 -> to (DATE)
-- -----------------------------------------------------------------------------
SELECT
    (SELECT COUNT(*)::int
       FROM tasks t
      WHERE t.project_id = $1
        AND t.created_at::date BETWEEN $2::date AND $3::date) AS created,
    (SELECT COUNT(DISTINCT h.task_id)::int
       FROM task_status_history h
       JOIN tasks t ON t.id = h.task_id
      WHERE t.project_id = $1
        AND h.new_status = 'Done'
        AND h.changed_at::date BETWEEN $2::date AND $3::date) AS completed;
