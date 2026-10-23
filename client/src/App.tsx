import { useState, type FormEvent } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers,
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ChartNoAxesCombined,
  Menu,
  X,
  Palette,
} from "lucide-react";
import { Button, Card, Field } from "./components";
import { authenticate, validateAuth } from "./api";
import { DemoProvider, useDemo } from "./workspace/Store";
import { people, type PersonId } from "./workspace/model";
import { Projects, ProjectDetail } from "./workspace/Projects";
import { CalendarPage } from "./workspace/Calendar";
import { ReportsPage } from "./workspace/Reports";

function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-icon">
        <Layers size={22} />
      </span>
      SEK TECH<span className="brand-dot">®</span>
    </Link>
  );
}
function AuthPage({ register = false }: { register?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      ...(register ? { name: String(data.get("name") || "") } : {}),
    };
    const validation = validateAuth(fields, register);
    setSuccess(false);
    setError(validation || "");
    if (validation) return;
    setBusy(true);
    try {
      await authenticate(register ? "register" : "login", fields);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bağlantı kurulamadı. Tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="story-content">
          <p className="eyebrow">BİRLİKTE, DAHA İLERİYE</p>
          <h1>
            İyi fikirler.
            <br />
            Güçlü ekipler.
            <br />
            <span>Tamamlanan işler.</span>
          </h1>
          <p>
            Projeni planla, ekibinle aynı sayfada kal.
            <br />
            İlk fikirden son teslimata kadar tek bir çalışma alanı.
          </p>
          <div className="story-board" aria-hidden="true">
            <div className="board-top">
              <span>Ürün geliştirme</span>
              <span>SPRINT 02</span>
            </div>
            <div className="board-columns">
              <div>
                <small>YAPILACAK</small>
                <div className="mini-card">
                  <i />
                  Ekran tasarımları<span>Tasarım · 3 görev</span>
                </div>
              </div>
              <div>
                <small>DEVAM EDİYOR</small>
                <div className="mini-card">
                  <i />
                  Frontend altyapısı<span>Geliştirme · 2 görev</span>
                  <div className="mini-progress" />
                </div>
              </div>
              <div>
                <small>TAMAMLANDI</small>
                <div className="mini-card">
                  <Check size={16} />
                  Proje planı<span>Planlama · 1 görev</span>
                </div>
              </div>
            </div>
          </div>
          <small className="illustration-note">Örnek çalışma alanı</small>
        </div>
        <footer>
          SEK TECH / Proje Yönetim Sistemi <span>2026</span>
        </footer>
      </section>
      <section className="auth-form-section">
        <div className="auth-switch">
          {register ? "Zaten hesabın var mı?" : "Ekibe yeni mi katıldın?"}{" "}
          <Link to={register ? "/giris" : "/kayit"}>
            {register ? "Giriş yap" : "Hesap oluştur"}{" "}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="auth-form">
          <span className="section-number">01 / ÇALIŞMA ALANIN</span>
          <h2>{register ? "Birlikte başlayalım." : "Tekrar hoş geldin."}</h2>
          <p>
            {register
              ? "Ekibinle çalışmak için hesabını oluştur."
              : "Kaldığın yerden devam etmek için giriş yap."}
          </p>
          <form onSubmit={submit} noValidate aria-busy={busy}>
            {register && (
              <Field
                id="name"
                name="name"
                label="Ad soyad"
                autoComplete="name"
                required
                placeholder="Adın ve soyadın"
                disabled={busy}
              />
            )}
            <Field
              id="email"
              name="email"
              type="email"
              label="E-posta adresi"
              autoComplete="email"
              required
              placeholder="sen@ornek.com"
              disabled={busy}
            />
            <Field
              id="password"
              name="password"
              type="password"
              label="Parola"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={8}
              required
              placeholder="En az 8 karakter"
              disabled={busy}
              aria-describedby="password-hint"
            />
            <small id="password-hint">Parolan en az 8 karakter olmalı.</small>
            {error && (
              <p className="alert" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="success" role="status">
                {register
                  ? "Kayıt isteğin başarıyla tamamlandı."
                  : "Giriş isteğin başarıyla tamamlandı."}{" "}
                Oturum ve yetkilendirme akışı backend entegrasyonunda
                tamamlanacak.
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy
                ? "Lütfen bekle…"
                : register
                  ? "Hesap oluştur"
                  : "Giriş yap"}
              <ArrowRight size={18} />
            </Button>
          </form>
          <div className="preview-link">
            <span>Çalışma alanını keşfet</span>
            <Link to="/onizleme">
              Arayüz önizlemesi <ArrowRight size={16} />
            </Link>
          </div>
          <p className="form-note">
            Bu sürümde sunucu entegrasyonu bekleniyor. Önizleme için hesap
            gerekmez.
          </p>
        </div>
        <footer className="auth-footer">
          DAHA NET PLANLAR. DAHA İYİ BİR EKİP.
        </footer>
      </section>
    </main>
  );
}
const nav = [
  { path: "/onizleme", label: "Genel bakış", icon: LayoutDashboard },
  { path: "/onizleme/projeler", label: "Projeler", icon: FolderKanban },
  { path: "/onizleme/takvim", label: "Takvim", icon: CalendarDays },
  { path: "/onizleme/raporlar", label: "Raporlar", icon: ChartNoAxesCombined },
  { path: "/onizleme/tasarim", label: "Tasarım sistemi", icon: Palette },
];
function Workspace() {
  const [open, setOpen] = useState(false);
  const { user, setUser, notice, noticeKind, clearNotice } = useDemo();
  return (
    <div className="workspace">
      <a className="skip-link" href="#content">
        İçeriğe geç
      </a>
      <aside className={open ? "sidebar open" : "sidebar"}>
        <Brand />
        <div className="workspace-label">ÇALIŞMA ALANI</div>
        <nav aria-label="Ana menü">
          {nav.map(({ path, label, icon: Icon }) => (
            <NavLink
              end={path === "/onizleme"}
              key={path}
              to={path}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">ST</span>
          <div>
            SEK TECH<small>Arayüz önizlemesi</small>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <span>
            Çalışma alanı <span className="slash">/</span> Önizleme
          </span>
          <Link to="/giris">
            Giriş yap <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="content" className="content">
          <div className="preview-banner">
            Önizleme modu · Gösterilen içerikler örnektir; gerçek proje verisi
            kullanılmaz. Değişiklikler yalnız bu tarayıcıda saklanır.
            <label className="demo-role">
              Demo kullanıcısı
              <select
                aria-label="Demo kullanıcısı"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value as PersonId);
                  clearNotice();
                }}
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.role === "admin" ? "Yönetici" : "Ekip üyesi"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {notice && (
            <p
              className={noticeKind === "warning" ? "alert" : "success"}
              role="status"
            >
              {notice}
            </p>
          )}
          <Routes key={user}>
            <Route index element={<ReportsPage overview />} />
            <Route path="tasarim" element={<DesignSystem />} />
            <Route path="projeler" element={<Projects />} />
            <Route path="projeler/:id" element={<ProjectDetail />} />
            <Route path="takvim" element={<CalendarPage />} />
            <Route path="raporlar" element={<ReportsPage />} />
            <Route
              path="*"
              element={
                <EmptyPage
                  title="Sayfa bulunamadı"
                  text="Bu adres çalışma alanında bulunmuyor."
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
function EmptyPage({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h1>{title}</h1>
      <Card>
        <FolderKanban size={36} />
        <h2>Aradığın sayfaya ulaşamadık.</h2>
        <p>{text}</p>
        <Link to="/onizleme">Genel bakışa dön →</Link>
      </Card>
    </>
  );
}
function DesignSystem() {
  return (
    <>
      <p className="eyebrow">SEK TECH / UI TEMELLERİ</p>
      <h1>Tasarım sistemi</h1>
      <p>Net hiyerarşi, sakin yüzeyler, belirgin aksiyonlar.</p>
      <div className="stat-grid">
        {[
          ["Ana renk", "#176B58"],
          ["Koyu yüzey", "#102B29"],
          ["Zemin", "#F5F6F2"],
        ].map(([name, color]) => (
          <Card key={name}>
            <div className="color-sample" style={{ background: color }} />
            <h3>{name}</h3>
            <code>{color}</code>
          </Card>
        ))}
      </div>
      <div className="overview-grid">
        <Card>
          <h2>Tipografi ve boşluk</h2>
          <p>Sistem yazı tipi: Segoe UI / sans-serif</p>
          <h1>Başlık / 36 px</h1>
          <h2>Alt başlık / 24 px</h2>
          <p>Gövde / 16 px · Satır aralığı / 1.6</p>
          <p>Boşluk ölçeği: 4 · 8 · 12 · 16 · 24 · 32 · 48 px</p>
        </Card>
        <Card>
          <h2>Form bileşenleri</h2>
          <Field
            id="sample-email"
            label="E-posta adresi"
            placeholder="sen@ornek.com"
            readOnly
          />
          <Button disabled>Devre dışı buton</Button>
          <p className="alert">Hata: İşlem tamamlanamadı.</p>
          <p className="success">Başarılı: Değişiklik kaydedildi.</p>
          <span className="pill">DEVAM EDİYOR</span>
        </Card>
      </div>
    </>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage key="home" />} />
      <Route path="/giris" element={<AuthPage key="login" />} />
      <Route path="/kayit" element={<AuthPage key="register" register />} />
      <Route
        path="/onizleme/*"
        element={
          <DemoProvider>
            <Workspace />
          </DemoProvider>
        }
      />
      <Route
        path="*"
        element={
          <main className="content">
            <EmptyPage
              title="Sayfa bulunamadı"
              text="Adres değişmiş veya yanlış yazılmış olabilir."
            />
          </main>
        }
      />
    </Routes>
  );
}
