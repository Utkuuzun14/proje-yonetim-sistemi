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
    "user:read": true,
    "user:create": true,
    "user:assign_role": true,
    "user:manage": true,
    "project:create": true,
    "project:read": true,
    "project:update": true,
    "project:delete": true,
    "project:add_member": true,
    "project:remove_member": true,
    "task:create": true,
    "task:read": true,
    "task:update": true,
    "task:delete": true,
    "task:assign": true,
    "report:view": true
}'::jsonb),
(2, 'Ekip Üyesi', '{
    "user:read": true,
    "project:read": true,
    "task:create": true,
    "task:read": true,
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
-- Parolalar varsayılan test parolası ('Password123!') için bcrypt hash özetidir (cost 10, bcrypt.checkpw ile doğrulandı)
INSERT INTO users (id, role_id, name, email, password_hash) VALUES
(1, 1, 'Hakan Koço',             'hakan@sektech.com',       '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(2, 1, 'Abdulkahhar Türkoğlu',   'abdulkahhar@sektech.com', '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(3, 2, 'Mert Yanık',             'mert@sektech.com',        '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(4, 2, 'Ümit Efe Özkaleli',      'umitefe@sektech.com',     '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(5, 2, 'Mustafa Şahin',          'mustafa@sektech.com',     '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(6, 2, 'Buğra Durmuş',           'bugra@sektech.com',       '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC'),
(7, 2, 'Utku Uzun',              'utku@sektech.com',        '$2b$10$hJWrzXEiJe2OARGwXOgZveduZ9n2aDFHaqOBpcDAbIzOIZCNpFCBC')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- -----------------------------------------------------------------------------
-- 3. PROJELER
-- -----------------------------------------------------------------------------
INSERT INTO projects (id, owner_id, name, description, start_date, end_date) VALUES
(1, 1, 'SEK TECH Proje Yönetim Platformu', 'Azure Boards''tan ilham alan, küçük ve orta ölçekli yazılım ekipleri için web tabanlı proje yönetim sistemi.', '2026-10-05', '2026-12-07'),
(2, 2, 'Mobil Saha Yönetimi', 'Mobil saha ekipleri için görev takip ve koordinasyon uygulaması.', '2026-10-15', '2026-11-30')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- -----------------------------------------------------------------------------
-- 4. PROJE ÜYELİKLERİ
-- -----------------------------------------------------------------------------
-- Proje 1 üyeleri (Tüm Ekip)
INSERT INTO project_members (project_id, user_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Proje 2 üyeleri (Yalnızca Abdulkahhar ve Ümit Efe - TS-ROL-04 yetki izolasyon testi için)
INSERT INTO project_members (project_id, user_id) VALUES
(2, 2),
(2, 4)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. GÖREVLER (Sprint 4 & 5 Gerçekçi Tohum Verisi - Şema v2 / Karar 11)
-- -----------------------------------------------------------------------------
INSERT INTO tasks (id, project_id, title, description, status, priority, type, assignee_id, start_date, end_date) VALUES
(1, 1, 'Veri Tabanı Karşılaştırması ve Varlık Listesi', 'PostgreSQL, MySQL ve MongoDB karşılaştırması ve temel varlıkların listelenmesi.', 'Done', 'High', 'Task', 6, '2026-10-05', '2026-10-11'),
(2, 1, 'ER Diyagramı v1 ve Yerel VT Ortamı', '3NF normalizasyonuna uygun ER diyagramı ve Docker Compose ile yerel veri tabanı ortamının oluşturulması.', 'Done', 'High', 'Task', 6, '2026-10-12', '2026-10-18'),
(3, 1, 'Migration, Seed Verisi ve Tek Komutla Kurulum', 'Tüm veri tabanı şemasının init.sql ile kodlanması, seed.sql betiği ve docker-compose.yml orkestrasyonu.', 'Done', 'Critical', 'Feature', 6, '2026-10-19', '2026-10-25'),
(4, 1, 'GitHub Actions CI Hattı Kurulumu', 'Lint, build ve test otomasyonunu sağlayan CI pipeline yapılandırması.', 'Done', 'High', 'Task', 7, '2026-10-19', '2026-10-25'),
(5, 1, 'Kullanıcı Kimlik Doğrulama API (Auth)', 'JWT tabanlı register ve login uç noktalarının geliştirilmesi.', 'Done', 'High', 'Feature', 5, '2026-10-19', '2026-10-25'),
(6, 1, 'Hi-Fi UI Mockup ve Bileşen Kütüphanesi', 'Tasarım sisteminin ve React ön yüz iskeletinin oluşturulması.', 'Done', 'High', 'Task', 4, '2026-10-19', '2026-10-25'),
(7, 1, 'Rol Tabanlı Yetkilendirme (RBAC) ve Proje API', 'Yönetici ve Ekip Üyesi yetkilerini denetleyen RBAC ara katmanı ve proje CRUD uç noktaları.', 'Done', 'Critical', 'Feature', 5, '2026-10-26', '2026-11-01'),
(8, 1, 'Görev ve Yorum API Uç Noktaları', 'Görev CRUD, durum güncelleme, geçmiş kaydı ve yorum ekleme REST uç noktaları.', 'Done', 'High', 'Feature', 5, '2026-11-02', '2026-11-08'),
(9, 1, 'Kanban Panosu ve Sürükle-Bırak Entegrasyonu', 'To Do, In Progress, Done sütunları arasında sürükle-bırak ve klavye destekli durum yönetimi.', 'Done', 'High', 'Feature', 4, '2026-11-02', '2026-11-08'),
(10, 1, 'Görev Durum Geçmişi ve Transaction Güvencesi', 'Durum her değiştiğinde atomik olarak geçmiş kaydı oluşturulması ve FOR UPDATE satır kilidi.', 'Done', 'High', 'Task', 6, '2026-11-02', '2026-11-08'),
(11, 1, 'Kanban E2E ve Görev API Kabul Testleri', 'Playwright ile Kanban sürükle-bırak ve görev API uç noktalarının otomatik kabul testleri.', 'Done', 'High', 'Task', 7, '2026-11-02', '2026-11-08'),
(12, 1, 'Takvim Görünümü ve Tarih Bazlı Görev Takibi', 'Aylık ve haftalık takvim üzerinde görevlerin başlangıç-bitiş tarihlerine göre konumlanması.', 'In Progress', 'High', 'Feature', 4, '2026-11-09', '2026-11-15'),
(13, 1, 'Salt Okunur Gantt Şeması', 'Görev tarihlerinden dinamik hesaplanan zaman çizelgesi çubukları ve kronolojik sıralama.', 'In Progress', 'Medium', 'Feature', 4, '2026-11-09', '2026-11-15'),
(14, 1, 'Dosya Yükleme ve Güvenli Saklama API', 'Projeye doküman yükleme, 10 MB sınırı, MIME tipi doğrulaması ve UUID anahtarlı saklama.', 'In Progress', 'High', 'Feature', 5, '2026-11-09', '2026-11-15'),
(15, 1, 'Dosya Metadata Tablosu ve Staging Ortamı', 'files tablosuna task_id eklenmesi ve staging Docker Compose ortamının ayağa kaldırılması.', 'In Progress', 'High', 'Task', 6, '2026-11-09', '2026-11-15'),
(16, 1, 'Büyük Dosya Yükleme Hatası (413 Payload Too Large)', '10 MB üzerindeki yüklemelerin sunucuda uygun hata koduyla reddedilmesi doğrulaması.', 'To Do', 'Medium', 'Bug', 7, '2026-11-16', '2026-11-20'),
(17, 1, 'Proje İlerleme Yüzdesi ve Karne Raporları', 'Tamamlanan görev oranı ve kişi bazlı tamamlama istatistiklerinin sorgulanması.', 'To Do', 'Medium', 'Feature', 6, '2026-11-16', '2026-11-22')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    type = EXCLUDED.type,
    assignee_id = EXCLUDED.assignee_id,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date;

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
(3, 'In Progress', 'Done', 6),
(4, NULL, 'To Do', 1),
(4, 'To Do', 'In Progress', 7),
(4, 'In Progress', 'Done', 7),
(5, NULL, 'To Do', 1),
(5, 'To Do', 'In Progress', 5),
(5, 'In Progress', 'Done', 5),
(6, NULL, 'To Do', 1),
(6, 'To Do', 'In Progress', 4),
(6, 'In Progress', 'Done', 4),
(7, NULL, 'To Do', 1),
(7, 'To Do', 'In Progress', 5),
(7, 'In Progress', 'Done', 5),
(8, NULL, 'To Do', 1),
(8, 'To Do', 'In Progress', 5),
(8, 'In Progress', 'Done', 5),
(9, NULL, 'To Do', 1),
(9, 'To Do', 'In Progress', 4),
(9, 'In Progress', 'Done', 4),
(10, NULL, 'To Do', 1),
(10, 'To Do', 'In Progress', 6),
(10, 'In Progress', 'Done', 6),
(11, NULL, 'To Do', 1),
(11, 'To Do', 'In Progress', 7),
(11, 'In Progress', 'Done', 7),
(12, NULL, 'To Do', 1),
(12, 'To Do', 'In Progress', 4),
(13, NULL, 'To Do', 1),
(13, 'To Do', 'In Progress', 4),
(14, NULL, 'To Do', 1),
(14, 'To Do', 'In Progress', 5),
(15, NULL, 'To Do', 1),
(15, 'To Do', 'In Progress', 6),
(16, NULL, 'To Do', 1),
(17, NULL, 'To Do', 1);

-- -----------------------------------------------------------------------------
-- 7. YORUMLAR
-- -----------------------------------------------------------------------------
INSERT INTO comments (task_id, author_id, content) VALUES
(1, 1, 'Raporlama gereksinimleri için PostgreSQL en uygun aday görünüyor.'),
(1, 6, 'Karşılaştırma tamamlandı, PostgreSQL 15 üzerinde karar kılındı.'),
(2, 2, 'Görev durum geçmişi tablosu raporlama için mutlaka şemada yer almalı.'),
(2, 6, 'task_status_history tablosu 3NF yapısına uygun olarak eklendi ve ER diyagramı tamamlandı.'),
(3, 6, 'init.sql ve seed.sql dosyaları hazırlandı. Tek komutla docker compose ayağa kaldırılabilir.'),
(7, 1, 'RBAC middleware testleri yeşil. Yönetici ve Ekip Üyesi yetki ayrımı tamamlandı.'),
(8, 5, 'Görev oluşturma ve durum güncelleme uç noktaları hazır, geçmiş kayıtları tek transaction içinde yazılıyor.'),
(9, 4, 'Kanban arayüzünde sürükle-bırak ve klavye kısayolları entegre edildi. Durum değişimi anında API ile senkronize.'),
(10, 6, 'Durum değişimlerinde FOR UPDATE satır kilidiyle race condition önlendi ve atomik kayıt sağlandı.'),
(11, 7, 'Playwright E2E testleri eklendi, regresyon listesi güncellendi.'),
(12, 4, 'Takvim görünümü görev tarihlerine göre dinamik olarak render ediliyor.'),
(14, 5, '10 MB üst sınırı ve MIME tipi doğrulaması multer ile uygulandı. Depolama UUID anahtarıyla yapılıyor.'),
(15, 6, 'files tablosuna task_id alanı eklendi ve staging docker-compose ortamı kuruldu.');

-- -----------------------------------------------------------------------------
-- 8. DOSYALAR (Doküman Paylaşımı)
-- -----------------------------------------------------------------------------
INSERT INTO files (project_id, uploader_id, name, type, size, storage_path) VALUES
(1, 1, 'yol-haritasi.pdf', 'application/pdf', 1048576, '/uploads/docs/yol-haritasi.pdf'),
(1, 6, 'er-diagram-v1.png', 'image/png', 245760, '/uploads/diagrams/er-diagram-v1.png');
