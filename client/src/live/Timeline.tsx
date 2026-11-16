import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Button, Card, Field} from '../components';
import {list, task, taskError, taskProject, taskRequest, type Task, type TaskProject} from './taskApi';
import './timeline.css';

const DAY = 86400000;
export function dayNumber(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0,10) === value ? stamp / DAY : null;
}
export function taskRange(value: Task): [number, number] | null {
  const start = dayNumber(value.start_date), end = dayNumber(value.end_date);
  return start !== null && end !== null && start <= end ? [start,end] : null;
}
export function intersects(value: Task, start: number, end: number) {
  const range = taskRange(value);
  return !!range && range[0] <= end && range[1] >= start;
}
function iso(day: number) { return new Date(day * DAY).toISOString().slice(0,10); }
function monthBounds(month: string): [number,number] | null {
  const start = dayNumber(`${month}-01`);
  if (start === null) return null;
  const next = new Date(start * DAY); next.setUTCMonth(next.getUTCMonth()+1);
  return [start,next.getTime()/DAY-1];
}
const statusLabel = {'To Do':'Yapılacak','In Progress':'Devam ediyor',Done:'Tamamlandı'};
function Timeline({projectId}: {projectId: number}) {
  const [data,setData] = useState<{project:TaskProject;tasks:Task[]} | null>(null);
  const [error,setError] = useState('');
  const [version,setVersion] = useState(0);
  const [mode,setMode] = useState<'calendar'|'gantt'>('calendar');
  const [year,setYear] = useState(()=>String(new Date().getFullYear()));
  const [monthPart,setMonthPart] = useState(()=>String(new Date().getMonth()+1).padStart(2,'0'));
  const month = `${year.padStart(4,'0')}-${monthPart}`;
  const [query,setQuery] = useState('');
  useEffect(()=>{
    const controller = new AbortController();
    Promise.all([taskRequest(`/projects/${projectId}`,{signal:controller.signal}),taskRequest(`/projects/${projectId}/tasks`,{signal:controller.signal})])
      .then(([p,t])=>{const result={project:taskProject(p,projectId),tasks:list(t,v=>task(v,projectId))};if(!controller.signal.aborted)setData(result);})
      .catch(e=>{if(!controller.signal.aborted)setError(taskError(e));});
    return ()=>controller.abort();
  },[projectId,version]);
  const bounds=/^\d{1,4}$/.test(year) && Number(year)>=1 && Number(year)<=9999 ? monthBounds(month) : null;
  const filtered=data?.tasks.filter(t=>t.title.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))) || [];
  const visible=bounds ? filtered.filter(t=>intersects(t,...bounds)).sort((a,b)=>dayNumber(a.start_date)!-dayNumber(b.start_date)! || a.id-b.id) : [];
  const unscheduled=filtered.filter(t=>!taskRange(t));
  const days=bounds ? Array.from({length:bounds[1]-bounds[0]+1},(_,i)=>bounds[0]+i) : [];
  function retry(){setError('');setData(null);setVersion(v=>v+1);}
  function changeMonth(delta: number) {
    if(!bounds)return;
    const date=new Date(bounds[0]*DAY);date.setUTCMonth(date.getUTCMonth()+delta);
    setYear(String(date.getUTCFullYear()));setMonthPart(String(date.getUTCMonth()+1).padStart(2,'0'));
  }
  return <>
    <Link to="/uygulama/takvim">← Takvim için proje seç</Link>
    <h1>{data ? `${data.project.name} · Takvim ve Gantt` : 'Takvim ve Gantt'}</h1>
    <p>Görevlerin başlangıç ve bitiş tarihleri. Tarihleri değiştirmek için <Link to={`/uygulama/projeler/${projectId}/gorevler`}>Görevler ve Kanban</Link> ekranını kullan.</p>
    {error ? <><p role="alert" className="alert">{error}</p><Button onClick={retry}>Tekrar dene</Button></> : !data ? <p role="status">Görev tarihleri yükleniyor…</p> : <>
      <div className="timeline-controls">
        <Button aria-pressed={mode==='calendar'} onClick={()=>setMode('calendar')}>Takvim</Button>
        <Button aria-pressed={mode==='gantt'} onClick={()=>setMode('gantt')}>Gantt</Button>
        <Button aria-label="Önceki ay" disabled={!bounds || month<='0001-01'} onClick={()=>changeMonth(-1)}>←</Button>
        <label className="field"><span>Görüntülenen ay</span><select value={monthPart} onChange={e=>setMonthPart(e.target.value)}>{['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'].map((name,i)=><option key={name} value={String(i+1).padStart(2,'0')}>{name}</option>)}</select></label>
        <Field id="timeline-year" label="Görüntülenen yıl" type="number" min={1} max={9999} step={1} value={year} onChange={e=>setYear(e.target.value)}/>
        <Button aria-label="Sonraki ay" disabled={!bounds || month>='9999-12'} onClick={()=>changeMonth(1)}>→</Button>
      </div>
      <Field id="timeline-search" label="Görevlerde ara" value={query} onChange={e=>setQuery(e.target.value)}/>
      {!bounds ? <p role="alert">Geçerli bir ay seç.</p> : <>
        <p role="status">{visible.length} görev bu ayla kesişiyor.</p>
        {!visible.length && <Card><p>Bu ay ve arama için tarihli görev yok.</p></Card>}
        {mode==='calendar' ? <div className="timeline-scroll" role="region" aria-label="Aylık takvim" tabIndex={0}>
          <div className="live-calendar">
            {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d=><strong key={d}>{d}</strong>)}
            {Array.from({length:(new Date(bounds[0]*DAY).getUTCDay()+6)%7},(_,i)=><div key={`blank-${i}`} aria-hidden="true"/>)}
            {days.map(day=><section key={day} aria-label={iso(day)}><time dateTime={iso(day)}>{new Date(day*DAY).getUTCDate()}</time>
              {visible.filter(t=>intersects(t,day,day)).map(t=><Link key={t.id} className="calendar-task" to={`/uygulama/projeler/${projectId}/gorevler`} title={`${t.title} · ${statusLabel[t.status]}`}>{t.title}<small>{statusLabel[t.status]}</small></Link>)}
            </section>)}
          </div>
        </div> : <div className="timeline-scroll" role="region" aria-label="Salt okunur Gantt" tabIndex={0}>
          <table className="live-gantt"><caption>{month} · Görev zaman çizelgesi (başlangıç ve bitiş dahil)</caption><thead><tr><th scope="col">Görev / tarihler</th><th scope="col">Ay içindeki süre</th></tr></thead>
          <tbody>{visible.map(t=>{const range=taskRange(t)!;const length=days.length;return <tr key={t.id}><th scope="row"><Link to={`/uygulama/projeler/${projectId}/gorevler`}>{t.title}</Link><small>{t.start_date} → {t.end_date} · {statusLabel[t.status]}</small></th><td><div className="gantt-track" aria-label={`${t.title}: ${t.start_date} – ${t.end_date}`}><span style={{marginLeft:`${(Math.max(range[0],bounds[0])-bounds[0])/length*100}%`,width:`${(Math.min(range[1],bounds[1])-Math.max(range[0],bounds[0])+1)/length*100}%`}}/></div></td></tr>;})}</tbody></table>
        </div>}
      </>}
      {!!unscheduled.length && <Card><h2>Tarihleri eksik veya geçersiz görevler</h2><p>Başlangıç veya bitiş tarihi eksik ya da tarih aralığı geçersiz. Takvimde görünmesi için her iki tarih de geçerli olmalı ve bitiş başlangıçtan önce olmamalı.</p><ul>{unscheduled.map(t=><li key={t.id}>{t.title} · {t.start_date || 'Başlangıç yok'} → {t.end_date || 'Bitiş yok'}</li>)}</ul></Card>}
    </>}
  </>;
}
export function LiveTimeline(){
  const {id}=useParams();const numeric=Number(id);
  if(!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(numeric))return <p role="alert">Geçersiz proje adresi.</p>;
  return <Timeline key={id} projectId={numeric}/>;
}
