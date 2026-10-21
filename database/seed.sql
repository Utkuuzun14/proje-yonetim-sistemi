-- =============================================================================
-- SEK TECH — Proje Yönetim Platformu
-- Örnek (Seed) Veri Betiği (seed.sql) — Sprint 2 (Issue #38)
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ROLLER
-- -----------------------------------------------------------------------------
INSERT INTO roles (id, name, permissions) VALUES
(1, 'Yönetici', '{
    "project:create": true,
    "project:update": true,
    "project:delete": true,
    "user:manage": true,
    "task:create": true,
    "task:update": true,
    "task:delete": true,
    "task:assign": true,
    "report:view": true
}'::jsonb),
(2, 'Ekip Üyesi', '{
    "project:view": true,
    "task:view": true,
    "task:update_status": true,
    "comment:create": true,
    "file:upload": true,
    "report:view_self": true
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET permissions = EXCLUDED.permissions;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- -----------------------------------------------------------------------------
-- 2. KULLANICILAR (SEK TECH Ekip Üyeleri)
-- -----------------------------------------------------------------------------
-- Parolalar varsayılan test parolası ('Password123!') için bcrypt hash özetidir
INSERT INTO users (id, role_id, name, email, password_hash) VALUES
(1, 1, 'Hakan Koço',             'hakan@sektech.com',       '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(2, 1, 'Abdulkahhar Türkoğlu',   'abdulkahhar@sektech.com', '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(3, 2, 'Mert Yanık',             'mert@sektech.com',        '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(4, 2, 'Ümit Efe Özkaleli',      'umitefe@sektech.com',     '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(5, 2, 'Mustafa Şahin',          'mustafa@sektech.com',     '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(6, 2, 'Buğra Durmuş',           'bugra@sektech.com',       '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3'),
(7, 2, 'Utku Uzun',              'utku@sektech.com',        '$2b$10$wT37tV.r3JtUv/k4L8v25.m7GgH1jK2l3n4o5p6q7r8s9t0u1v2w3')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- -----------------------------------------------------------------------------
-- 3. PROJELER
-- -----------------------------------------------------------------------------
INSERT INTO projects (id, owner_id, name, description, start_date, end_date) VALUES
(1, 1, 'SEK TECH Proje Yönetim Platformu', 'Azure Boards''tan ilham alan, küçük ve orta ölçekli yazılım ekipleri için web tabanlı proje yönetim sistemi.', '2026-10-05', '2026-12-07')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- -----------------------------------------------------------------------------
-- 4. PROJE ÜYELİKLERİ (Tüm Ekip)
-- -----------------------------------------------------------------------------
INSERT INTO project_members (project_id, user_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. GÖREVLER
-- -----------------------------------------------------------------------------
INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, start_date, end_date) VALUES
(1, 1, 'Veri Tabanı Karşılaştırması ve Varlık Listesi', 'PostgreSQL, MySQL ve MongoDB karşılaştırması ve temel varlıkların listelenmesi.', 'Done', 'High', 6, '2026-10-05', '2026-10-11'),
(2, 1, 'ER Diyagramı v1 ve Yerel VT Ortamı', '3NF normalizasyonuna uygun ER diyagramı ve Docker Compose ile yerel veri tabanı ortamının oluşturulması.', 'Done', 'High', 6, '2026-10-12', '2026-10-18'),
(3, 1, 'Migration, Seed Verisi ve Tek Komutla Kurulum', 'Tüm veri tabanı şemasının init.sql ile kodlanması, seed.sql betiği ve docker-compose.yml orkestrasyonu.', 'In Progress', 'Critical', 6, '2026-10-19', '2026-10-25'),
(4, 1, 'GitHub Actions CI Hattı Kurulumu', 'Lint, build ve test otomasyonunu sağlayan CI pipeline yapılandırması.', 'Done', 'High', 7, '2026-10-19', '2026-10-25'),
(5, 1, 'Kullanıcı Kimlik Doğrulama API (Auth)', 'JWT tabanlı register ve login uç noktalarının geliştirilmesi.', 'In Progress', 'High', 5, '2026-10-19', '2026-10-25'),
(6, 1, 'Hi-Fi UI Mockup ve Bileşen Kütüphanesi', 'Tasarım sisteminin ve React ön yüz iskeletinin oluşturulması.', 'In Progress', 'High', 4, '2026-10-19', '2026-10-25')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- -----------------------------------------------------------------------------
-- 6. GÖREV DURUM GEÇMİŞİ (Raporlama Modülü için)
-- -----------------------------------------------------------------------------
INSERT INTO task_status_history (task_id, old_status, new_status, changed_by_id) VALUES
(1, NULL, 'To Do', 1),
(1, 'To Do', 'In Progress', 6),
(1, 'In Progress', 'Done', 6),
(2, NULL, 'To Do', 1),
(2, 'To Do', 'In Progress', 6),
(2, 'In Progress', 'Done', 6),
(3, NULL, 'To Do', 1),
(3, 'To Do', 'In Progress', 6),
(4, NULL, 'To Do', 1),
(4, 'To Do', 'In Progress', 7),
(4, 'In Progress', 'Done', 7);

-- -----------------------------------------------------------------------------
-- 7. YORUMLAR
-- -----------------------------------------------------------------------------
INSERT INTO comments (task_id, author_id, content) VALUES
(1, 1, 'Raporlama gereksinimleri için PostgreSQL en uygun aday görünüyor.'),
(1, 6, 'Karşılaştırma tamamlandı, PostgreSQL 15 üzerinde karar kılındı.'),
(2, 2, 'Görev durum geçmişi tablosu raporlama için mutlaka şemada yer almalı.'),
(2, 6, 'task_status_history tablosu 3NF yapısına uygun olarak eklendi ve ER diyagramı tamamlandı.'),
(3, 6, 'init.sql ve seed.sql dosyaları hazırlandı. Tek komutla docker compose ayağa kaldırılabilir.');

-- -----------------------------------------------------------------------------
-- 8. DOSYALAR (Doküman Paylaşımı)
-- -----------------------------------------------------------------------------
INSERT INTO files (project_id, uploader_id, name, type, size, storage_path) VALUES
(1, 1, 'yol-haritasi.pdf', 'application/pdf', 1048576, '/uploads/docs/yol-haritasi.pdf'),
(1, 6, 'er-diagram-v1.png', 'image/png', 245760, '/uploads/diagrams/er-diagram-v1.png');
