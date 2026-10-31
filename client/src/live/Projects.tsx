import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ApiError, apiRequest } from '../api';
import { Button, Card, Field } from '../components';
import { Modal } from '../workspace/Modal';
import { useSession } from './Session';

type Project = { id: number; name: string; description?: string | null; start_date?: string | null; end_date?: string | null; owner_id?: number | null };
function project(value: unknown): Project {
  if (!value || typeof value !== 'object') throw new Error('Proje yanıtı beklenen biçimde değil.');
  const p = value as Project;
  if (!Number.isInteger(p.id) || p.id <= 0 || typeof p.name !== 'string' ||
    ['description', 'start_date', 'end_date'].some(key => { const v = p[key as keyof Project]; return v != null && typeof v !== 'string'; })) throw new Error('Proje yanıtı beklenen biçimde değil.');
  return p;
}
function message(error: unknown, detail = false) {
  if (error instanceof ApiError && error.status === 404) return detail
    ? 'Proje bulunamadı veya bu projeye erişim iznin yok. Proje listesine dönerek erişebildiğin projeleri görebilirsin.'
    : 'Proje servisi bulunamadı. Lütfen daha sonra tekrar dene.';
  return error instanceof Error ? error.message : 'İşlem tamamlanamadı.';
}
function useProjects(id?: string) {
  const [items, setItems] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const path = id ? `/projects/${encodeURIComponent(id)}` : '/projects';
    apiRequest<unknown>(path, {auth: true, signal: controller.signal}).then(data => {
      if (controller.signal.aborted) return;
      if (!id && !Array.isArray(data)) throw new Error('Proje listesi beklenen biçimde değil.');
      setItems(id ? [project(data)] : (data as unknown[]).map(project));
    }).catch(e => { if (!controller.signal.aborted) setError(message(e, !!id)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, version]);
  function reload() { setError(''); setLoading(true); setItems([]); setVersion(v => v + 1); }
  return {items, error, loading, reload};
}
function ProjectEditor({value, onClose, onSaved}: {value?: Project; onClose: () => void; onSaved: () => void}) {
  const {user} = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || user?.role !== 'Yönetici') return;
    const form = new FormData(e.currentTarget);
    const body = { name: String(form.get('name') || '').trim(), description: String(form.get('description') || '').trim(), start_date: String(form.get('start_date') || ''), end_date: String(form.get('end_date') || '') };
    setError(''); setFieldErrors({});
    if (!body.name || body.name.length > 150) { setError('Proje adı 1-150 karakter olmalı.'); return; }
    if (!body.start_date || !body.end_date || body.start_date > body.end_date) { setError('Geçerli başlangıç/bitiş tarihleri gir; bitiş başlangıçtan önce olamaz.'); return; }
    setBusy(true);
    try {
      await apiRequest(value ? `/projects/${value.id}` : '/projects', {auth: true, method: value ? 'PATCH' : 'POST', body, expectData: false});
      onSaved();
    } catch (err) {
      setError(message(err, !!value));
      if (err instanceof ApiError) setFieldErrors(Object.fromEntries(err.details.map(d => [d.field, d.message])));
    } finally { setBusy(false); }
  }
  const errorProps = (name: string) => ({'aria-invalid': !!fieldErrors[name], 'aria-describedby': fieldErrors[name] ? `err-${name}` : undefined});
  return <Modal title={value ? 'Projeyi düzenle' : 'Yeni proje'} onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={submit} aria-busy={busy}>
      <Field id="api-project-name" name="name" label="Proje adı" required maxLength={150} disabled={busy} defaultValue={value?.name} {...errorProps('name')} />
      <label className="field"><span>Açıklama</span><textarea name="description" rows={3} disabled={busy} defaultValue={value?.description || ''} {...errorProps('description')} /></label>
      <div className="form-grid">
        <Field id="api-project-start" name="start_date" label="Başlangıç tarihi" type="date" required disabled={busy} defaultValue={value?.start_date?.slice(0,10) || ''} {...errorProps('start_date')} />
        <Field id="api-project-end" name="end_date" label="Bitiş tarihi" type="date" required disabled={busy} defaultValue={value?.end_date?.slice(0,10) || ''} {...errorProps('end_date')} />
      </div>
      {error && <p role="alert" className="alert">{error}</p>}
      {Object.entries(fieldErrors).map(([key, text]) => <p id={`err-${key}`} key={key} className="alert">{text}</p>)}
      <div className="form-actions"><Button type="button" disabled={busy} className="secondary" onClick={onClose}>Vazgeç</Button><Button disabled={busy} type="submit">{busy ? 'Kaydediliyor…' : 'Projeyi kaydet'}</Button></div>
    </form>
  </Modal>;
}
function ProjectList() {
  const {user} = useSession();
  const {items, error, loading, reload} = useProjects();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<Project | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const admin = user?.role === 'Yönetici';
  const filtered = items.filter(p => `${p.name} ${p.description || ''}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')));
  return <>
    <div className="page-heading"><div><h1>Projeler</h1><p>Hesabının erişebildiği projeler.</p></div>{admin && <Button onClick={() => setEditor('new')}>Yeni proje</Button>}</div>
    <Field id="api-search" label="Projelerde ara" value={query} onChange={e => setQuery(e.target.value)} />
    {notice && <p role="status" className="success">{notice}</p>}
    {loading && <p role="status">Projeler yükleniyor…</p>}
    {error && <div><p role="alert" className="alert">{error}</p><Button onClick={reload}>Tekrar dene</Button></div>}
    {!loading && !error && !filtered.length && <Card><p>{items.length ? 'Aramana uygun proje yok.' : 'Henüz erişebildiğin proje yok.'}</p></Card>}
    {!loading && !error && <div className="project-grid">{filtered.map(p => <Card key={p.id}><h2><Link to={`/uygulama/projeler/${p.id}`}>{p.name}</Link></h2><p>{p.description || 'Açıklama eklenmemiş.'}</p><p>{p.start_date?.slice(0,10) || '—'} → {p.end_date?.slice(0,10) || '—'}</p>{admin && <Button onClick={() => setEditor(p)}>Düzenle</Button>}</Card>)}</div>}
    {admin && editor && <ProjectEditor value={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSaved={() => {setEditor(null); setNotice('Proje kaydedildi.'); reload();}} />}
  </>;
}
function ProjectDetail({id}: {id: string}) {
  const {user} = useSession();
  const {items, loading, error, reload} = useProjects(id);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const p = items[0];
  return <><Link to="/uygulama/projeler">← Projelere dön</Link>
    {notice && <p role="status" className="success">{notice}</p>}
    {loading && <p role="status">Proje yükleniyor…</p>}
    {error && <><p role="alert" className="alert">{error}</p><Button onClick={reload}>Tekrar dene</Button></>}
    {!loading && !error && p && <><h1>{p.name}</h1><Card><p>{p.description || 'Açıklama eklenmemiş.'}</p><dl><dt>Başlangıç</dt><dd>{p.start_date?.slice(0,10) || 'Belirtilmedi'}</dd><dt>Bitiş</dt><dd>{p.end_date?.slice(0,10) || 'Belirtilmedi'}</dd></dl>{user?.role === 'Yönetici' && <Button onClick={() => setEditing(true)}>Projeyi düzenle</Button>}</Card>{editing && user?.role === 'Yönetici' && <ProjectEditor value={p} onClose={() => setEditing(false)} onSaved={() => {setEditing(false);setNotice('Proje kaydedildi.');reload();}} />}</>}
  </>;
}
function DetailRoute() {
  const {id} = useParams();
  if (!id || !/^[1-9]\d*$/.test(id)) return <p role="alert">Geçersiz proje adresi.</p>;
  return <ProjectDetail key={id} id={id} />;
}
export function LiveWorkspace() {
  const {user, logout} = useSession();
  return <div className="workspace"><aside className="sidebar"><Link className="brand" to="/uygulama/projeler">SEK TECH</Link><nav aria-label="Hesap menüsü"><Link to="/uygulama/projeler">Projeler</Link></nav><p>{user?.name}<br />{user?.role || 'Rol atanmamış'}</p></aside><div className="workspace-main"><header className="topbar"><Link to="/uygulama/projeler">Projeler</Link><span>{user?.name}</span><Button onClick={logout}>Çıkış yap</Button></header><main className="content"><Routes><Route index element={<Navigate to="projeler" replace />} /><Route path="projeler" element={<ProjectList />} /><Route path="projeler/:id" element={<DetailRoute />} /><Route path="*" element={<><h1>Sayfa bulunamadı</h1><Link to="/uygulama/projeler">Projelere dön</Link></>} /></Routes></main></div></div>;
}
