import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ApiError, apiRequest} from '../api';
import {Button, Card, Field} from '../components';
import {taskProject} from './taskApi';
import {progressReport, rangeReport, validRange, type ProgressReport, type RangeReport} from './reportApi';
import './reports.css';

function errorMessage(error: unknown) {
  if (error instanceof ApiError && [403, 404].includes(error.status)) return 'Proje bulunamadı veya raporlarına erişim iznin yok.';
  return error instanceof Error ? error.message : 'Rapor yüklenemedi.';
}
const percentage = (value: number) => `%${value.toLocaleString('tr-TR', {maximumFractionDigits: 1})}`;

function DateRange({projectId}: {projectId: number}) {
  const [from, setFrom] = useState(''), [to, setTo] = useState('');
  const [result, setResult] = useState<RangeReport | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!validRange(from, to)) { setError('Geçerli başlangıç ve bitiş tarihleri seç; bitiş başlangıçtan önce olamaz.'); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true);
    try {
      const data = await apiRequest(`/projects/${projectId}/reports/range?${new URLSearchParams({from, to})}`, {auth: true, signal: controller.signal});
      const parsed = rangeReport(data, from, to);
      if (!controller.signal.aborted) setResult(parsed);
    } catch (e) { if (!controller.signal.aborted) setError(errorMessage(e)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  return <Card><h2>Tarih aralıklı ilerleme</h2>
    <p>Başlangıç ve bitiş günleri dahildir. Tamamlanan sayısı, bu aralıkta en az bir kez Done durumuna geçen farklı görevleri gösterir; sonradan yeniden açılan görevler de dahildir.</p>
    <form onSubmit={submit} aria-busy={busy} noValidate><div className="form-grid">
      <Field id="report-from" label="Başlangıç tarihi" type="date" required value={from} disabled={busy} onChange={e => setFrom(e.target.value)} />
      <Field id="report-to" label="Bitiş tarihi" type="date" required value={to} disabled={busy} onChange={e => setTo(e.target.value)} />
    </div><Button type="submit" disabled={busy}>{busy ? 'Sorgulanıyor…' : 'Raporu getir'}</Button></form>
    {error && <p role="alert" className="alert">{error}</p>}
    {result && <section aria-label="Tarih aralığı sonucu" aria-live="polite"><h3>{result.from} – {result.to}</h3><dl className="report-summary"><div><dt>Oluşturulan görev</dt><dd>{result.created}</dd></div><div><dt>Tamamlanan görev</dt><dd>{result.completed}</dd></div></dl>
      {!result.created && !result.completed && <p>Bu aralıkta oluşturulan veya tamamlanan görev yok.</p>}
      <p>Önceden oluşturulan görevler de bu dönemde tamamlanabilir. Bu sayılar güncel durum dağılımından farklıdır.</p>
    </section>}
  </Card>;
}
function Reports({projectId}: {projectId: number}) {
  const [data, setData] = useState<{name: string; report: ProgressReport} | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiRequest(`/projects/${projectId}`, {auth: true, signal: controller.signal}),
      apiRequest(`/projects/${projectId}/reports/progress`, {auth: true, signal: controller.signal})
    ]).then(([project, progress]) => {
      const parsed = {name: taskProject(project, projectId).name, report: progressReport(progress)};
      if (!controller.signal.aborted) setData(parsed);
    }).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, version]);
  function reload() { setError(''); setData(null); setLoading(true); setVersion(v => v + 1); }
  const r = data?.report;
  return <><Link to="/uygulama/raporlar">← Rapor projelerine dön</Link>
    <div className="page-heading"><h1>{data ? `${data.name} · Raporlar` : 'Raporlar'}</h1><Button disabled={loading} onClick={reload}>Raporları yenile</Button></div>
    {loading && <p role="status">Raporlar yükleniyor…</p>}
    {error && <p role="alert" className="alert">{error}</p>}
    {!loading && !error && r && <div className="report-sections">
      <Card><h2>Proje ilerlemesi</h2><p>Görevlerin şu anki durumuna göre tamamlanma: <strong>{percentage(r.completion_rate)}</strong></p>
        <progress className="report-progress" aria-label="Proje tamamlanma oranı" max={100} value={r.completion_rate}>{percentage(r.completion_rate)}</progress>
        <dl className="report-summary">{[['Toplam görev', r.total], ['Yapılacak (To Do)', r.status_counts['To Do']], ['Devam eden (In Progress)', r.status_counts['In Progress']], ['Tamamlanan (Done)', r.status_counts.Done], ['Geciken', r.overdue], ['Atanmamış', r.unassigned]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {!r.total && <p>Henüz görev yok. Görev eklendikçe rapor burada görünecek.</p>}
        <p>Geciken: sunucunun bugünkü tarihinden önce bitmesi gereken, henüz tamamlanmamış görevler.</p>
      </Card>
      <Card><h2>Kişi bazlı tamamlama</h2><p>Görev sayıları iş yükü dağılımını gösterir; performans puanı değildir. Projeden ayrılmış ancak atanmış görevi bulunan kişiler de listelenir.</p>
        {r.members.length ? <div className="report-table-scroll" role="region" aria-label="Kişi bazlı görev tablosu" tabIndex={0}><table className="report-table"><caption>Proje üyelerinin görev dağılımı</caption><thead><tr>{['Kişi', 'Atanan', 'Yapılacak', 'Devam eden', 'Tamamlanan', 'Geciken', 'Tamamlama'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{r.members.map(m => <tr key={m.user_id}><th scope="row">{m.name}</th><td>{m.assigned}</td><td>{m.todo}</td><td>{m.in_progress}</td><td>{m.done}</td><td>{m.overdue}</td><td>{percentage(m.completion_rate)}</td></tr>)}</tbody></table></div> : <p>Listelenecek kişi bulunmuyor.</p>}
        <p>Atanmamış görev: {r.unassigned}. Bu görevler kişi satırlarına dahil değildir.</p>
      </Card>
      <DateRange projectId={projectId}/>
    </div>}
  </>;
}
export function LiveReports() {
  const {id} = useParams(), numeric = Number(id);
  if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(numeric)) return <p role="alert">Geçersiz proje adresi.</p>;
  return <Reports key={id} projectId={numeric}/>;
}
