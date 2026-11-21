-- =============================================================================
-- 001 · Başlangıç Şeması — SEK TECH Proje Yönetim Platformu
-- Sorumlu: Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #38, #52
-- Yalnızca ileri gider ve idempotenttir (CREATE TABLE IF NOT EXISTS).
-- =============================================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE roles IS 'Sistem rolleri ve JSONB tabanlı yetki tanımları';
COMMENT ON COLUMN roles.name IS 'Rol adı (ör. Yönetici, Ekip Üyesi)';
COMMENT ON COLUMN roles.permissions IS 'Rolün sahip olduğu izin ve yetkiler';

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    role_id       INT REFERENCES roles(id) ON DELETE SET NULL,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Kayıtlı sistem kullanıcıları';
COMMENT ON COLUMN users.password_hash IS 'bcrypt veya argon2 ile şifrelenmiş parola özeti';

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    owner_id    INT REFERENCES users(id) ON DELETE SET NULL,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_projects_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE projects IS 'Yönetilen yazılım projeleri';
COMMENT ON COLUMN projects.owner_id IS 'Projeyi oluşturan/yöneten proje yöneticisi';

-- 4. PROJECT_MEMBERS
CREATE TABLE IF NOT EXISTS project_members (
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

COMMENT ON TABLE project_members IS 'Projelere atanmış ekip üyeleri ara tablosu';

-- 5. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    project_id  INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    status      VARCHAR(50) NOT NULL DEFAULT 'To Do',
    priority    VARCHAR(20) NOT NULL DEFAULT 'Medium',
    assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tasks IS 'Proje kapsamındaki görevler (To Do / In Progress / Done)';
COMMENT ON COLUMN tasks.status IS 'Görev durumu (To Do, In Progress, In Review, Done vb.)';
COMMENT ON COLUMN tasks.priority IS 'Öncelik düzeyi (Low, Medium, High, Critical)';

-- 6. TASK_STATUS_HISTORY
CREATE TABLE IF NOT EXISTS task_status_history (
    id            SERIAL PRIMARY KEY,
    task_id       INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    old_status    VARCHAR(50),
    new_status    VARCHAR(50) NOT NULL,
    changed_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    changed_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE task_status_history IS 'Raporlama ve ilerleme takibi için durum değişim tarihçesi';

-- 7. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
    id         SERIAL PRIMARY KEY,
    task_id    INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id  INT REFERENCES users(id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comments IS 'Görev detaylarında ekip üyelerinin iletişim kurduğu yorumlar';

-- 8. FILES
CREATE TABLE IF NOT EXISTS files (
    id           SERIAL PRIMARY KEY,
    project_id   INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploader_id  INT REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    type         VARCHAR(100),
    size         BIGINT,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE files IS 'Projeye yüklenen dokümanlar ve ekler';

-- İNDEKSLER
CREATE INDEX IF NOT EXISTS idx_roles_permissions ON roles USING GIN (permissions);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_changed_at ON task_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
