import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { Button, Field } from '../components';
import { Modal } from '../workspace/Modal';
import { useSession } from './Session';
import { comment, history, list, priorities, statuses, task, taskError, taskProject, taskRequest, taskTypes, type Comment, type History, type Member, type Status, type Task, type TaskProject } from './taskApi';

const labels: Record<Status,string> = {'To Do':'Yapılacak','In Progress':'Devam ediyor',Done:'Tamamlandı'};
const person = (members: Member[], id: number | null) => id === null ? 'Atanmamış' : members.find(m=>m.id===id)?.name || `Kullanıcı #${id}`;
const time = (value: string) => new Date(value).toLocaleString('tr-TR');

function TaskEditor({project, value, onClose, onSaved}: {project: TaskProject; value?: Task; onClose:()=>void; onSaved:(t:Task)=>void}) {
  const {user}=useSession();
  const admin=user?.role==='Yönetici';
  const [assigneeSelection,setAssigneeSelection]=useState(String(value?.assignee_id??''));
  const formerAssignee=value?.assignee_id!=null && !project.members.some(m=>m.id===value.assignee_id);
  const [busy,setBusy]=useState(false);
  const saving=useRef(false);
  const [error,setError]=useState('');
  const [details,setDetails]=useState<{field:string;message:string}[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(saving.current || !user) return;
    const data=new FormData(event.currentTarget);
    const title=String(data.get('title')||'').trim();
    const start=String(data.get('start_date')||''); const end=String(data.get('end_date')||'');
    if(!title || title.length>150) {setError('Görev başlığı 1-150 karakter olmalı.');return;}
    if(start && end && start>end) {setError('Bitiş tarihi başlangıçtan önce olamaz.');return;}
    const assignee=assigneeSelection===''?null:Number(assigneeSelection);
    const assignmentChanged=!value || assignee!==value.assignee_id;
    if(admin && assignmentChanged && assignee !== null && !project.members.some(m=>m.id===assignee)) {setError('Sorumlu kişi proje üyesi olmalı.');return;}
    const body={title,description:String(data.get('description')||''),type:String(data.get('type')),priority:String(data.get('priority')),
      start_date:start||null,end_date:end||null,
      ...(admin ? (assignmentChanged ? {assignee_id:assignee} : {}) : !value ? {assignee_id:user.id} : {}),
    };
    saving.current=true;setBusy(true);setError('');setDetails([]);
    try {
      const result=await taskRequest(value ? `/tasks/${value.id}` : `/projects/${project.id}/tasks`,{method:value?'PATCH':'POST',body});
      const saved=task(result,project.id);
      if(value && saved.id!==value.id)throw new Error('Güncellenen görev kimliği uyuşmuyor.');
      onSaved(saved);
    }catch(e){setError(taskError(e));if(e instanceof ApiError) setDetails(e.details);}
    finally{saving.current=false;setBusy(false);}
  }
  return <Modal title={value?'Görevi düzenle':'Yeni görev'} onClose={()=>{if(!saving.current) onClose();}}>
    <form onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy} className="task-fields">
        <Field id="task-title" name="title" label="Görev başlığı" required maxLength={150} defaultValue={value?.title} />
        <label className="field"><span>Açıklama</span><textarea name="description" rows={4} defaultValue={value?.description||''}/></label>
        <div className="form-grid">
          <label className="field"><span>Görev türü</span><select name="type" defaultValue={value?.type||'Task'}>{taskTypes.map(t=><option key={t}>{t}</option>)}</select></label>
          <label className="field"><span>Öncelik</span><select name="priority" defaultValue={value?.priority||'Medium'}>{priorities.map(p=><option key={p}>{p}</option>)}</select></label>
        </div>
        {admin ? <label className="field"><span>Sorumlu kişi</span><select name="assignee_id" value={assigneeSelection} onChange={e=>setAssigneeSelection(e.target.value)}><option value="">Atanmamış</option>{formerAssignee&&<option value={value.assignee_id!} disabled>Kullanıcı #{value.assignee_id} (artık proje üyesi değil)</option>}{project.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          : <p>Sorumlu: {value?person(project.members,value.assignee_id):user?.name}. Atamayı yönetici değiştirebilir.</p>}
        <div className="form-grid"><Field id="task-start" name="start_date" type="date" label="Başlangıç tarihi" defaultValue={value?.start_date||''}/><Field id="task-end" name="end_date" type="date" label="Bitiş tarihi" defaultValue={value?.end_date||''}/></div>
        {error && <p role="alert" className="alert">{error}</p>}
        {details.length>0 && <ul aria-label="Alan hataları">{details.map((d,i)=><li key={i}>{d.field}: {d.message}</li>)}</ul>}
        <div className="form-actions"><Button type="button" className="secondary" onClick={onClose}>Vazgeç</Button><Button type="submit">{busy?'Kaydediliyor…':'Görevi kaydet'}</Button></div>
      </fieldset>
    </form>
  </Modal>;
}

function Discussion({value,members}: {value:Task;members:Member[]}) {
  const [comments,setComments]=useState<Comment[]>([]);
  const [changes,setChanges]=useState<History[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [sendError,setSendError]=useState('');
  const [version,setVersion]=useState(0);
  const [content,setContent]=useState('');
  const [busy,setBusy]=useState(false);
  const saving=useRef(false);
  const active=useRef(true);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  useEffect(()=>{
    const controller=new AbortController();
    Promise.all([taskRequest(`/tasks/${value.id}/comments`,{signal:controller.signal}),taskRequest(`/tasks/${value.id}/history`,{signal:controller.signal})])
      .then(([c,h])=>{
        const cs=list(c,v=>comment(v,value.id));const hs=list(h,v=>history(v,value.id));
        if(controller.signal.aborted) return;
        setComments(cs.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||a.id-b.id));
        setChanges(hs.sort((a,b)=>Date.parse(a.changed_at)-Date.parse(b.changed_at)||a.id-b.id));
      }).catch(e=>{if(!controller.signal.aborted)setError(taskError(e));})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[value.id,version]);
  async function send(event:FormEvent) {
    event.preventDefault();if(saving.current || !content.trim())return;
    saving.current=true;setBusy(true);setSendError('');
    try{
      const c=comment(await taskRequest(`/tasks/${value.id}/comments`,{method:'POST',body:{content:content.trim()}}),value.id);
      if(active.current){setComments(old=>[...old.filter(item=>item.id!==c.id),c]);setContent('');}
    }catch(e){if(active.current)setSendError(taskError(e));}
    finally{saving.current=false;if(active.current)setBusy(false);}
  }
  return <>
    {loading && <p role="status">Yorumlar ve geçmiş yükleniyor…</p>}
    {error && <><p role="alert" className="alert">{error}</p><Button onClick={()=>{setError('');setLoading(true);setVersion(v=>v+1);}}>Yorumları ve geçmişi tekrar yükle</Button></>}
    {!loading && !error && <>
      <h3>Yorumlar</h3>{!comments.length && <p>Henüz yorum yok.</p>}
      <ol className="task-comments">{comments.map(c=><li key={c.id}><strong>{c.author_id===null?'Silinmiş kullanıcı':person(members,c.author_id)}</strong> <time dateTime={c.created_at}>{time(c.created_at)}</time><p className="task-text">{c.content}</p></li>)}</ol>
      <form onSubmit={send}><label className="field"><span>Yorum yaz</span><textarea value={content} onChange={e=>setContent(e.target.value)} rows={3} disabled={busy} required/></label>{sendError && <p role="alert" className="alert">{sendError}</p>}<Button type="submit" disabled={busy||!content.trim()}>{busy?'Gönderiliyor…':'Yorum gönder'}</Button></form>
      <h3>Durum geçmişi</h3>{!changes.length && <p>Henüz durum değişikliği yok.</p>}
      <ol>{changes.map(h=><li key={h.id}>{h.old_status?labels[h.old_status]:'Oluşturuldu'} → {labels[h.new_status]} · {h.changed_by_id===null?'Silinmiş kullanıcı':person(members,h.changed_by_id)} · <time dateTime={h.changed_at}>{time(h.changed_at)}</time></li>)}</ol>
    </>}
  </>;
}

function Board({projectId}:{projectId:number}) {
  const {user}=useSession();
  const [project,setProject]=useState<TaskProject|null>(null);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [actionError,setActionError]=useState('');
  const [notice,setNotice]=useState('');
  const [version,setVersion]=useState(0);
  const [busy,setBusy]=useState(false);
  const writing=useRef(false);
  const alive=useRef(true);
  const [selected,setSelected]=useState<number|null>(null);
  const [editor,setEditor]=useState<Task|'new'|null>(null);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [query,setQuery]=useState('');
  const [assignee,setAssignee]=useState('');
  const [view,setView]=useState<'board'|'list'>('board');
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    const controller=new AbortController();
    Promise.all([taskRequest(`/projects/${projectId}`,{signal:controller.signal}),taskRequest(`/projects/${projectId}/tasks`,{signal:controller.signal})])
      .then(([p,ts])=>{
        const parsedProject=taskProject(p,projectId);const parsedTasks=list(ts,v=>task(v,projectId));
        if(!controller.signal.aborted){setProject(parsedProject);setTasks(parsedTasks);}
      }).catch(e=>{if(!controller.signal.aborted)setError(taskError(e));})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[projectId,version]);
  function reload(){if(writing.current)return;setLoading(true);setError('');setActionError('');setSelected(null);setTasks([]);setProject(null);setVersion(v=>v+1);}
  async function move(value:Task,status:Status) {
    if(writing.current || value.status===status)return;
    writing.current=true;setBusy(true);setActionError('');setNotice('');
    setTasks(old=>old.map(t=>t.id===value.id?{...t,status}:t));
    try{
      const saved=task(await taskRequest(`/tasks/${value.id}`,{method:'PATCH',body:{status}}),projectId);
      if(saved.id!==value.id)throw new Error('Güncellenen görev kimliği uyuşmuyor.');
      if(alive.current){setTasks(old=>old.map(t=>t.id===value.id?saved:t));setNotice(`“${saved.title}” ${labels[saved.status]} durumuna taşındı.`);}
    }catch(e){if(alive.current){setTasks(old=>old.map(t=>t.id===value.id?value:t));setActionError(taskError(e));}}
    finally{writing.current=false;if(alive.current)setBusy(false);}
  }
  async function remove(value:Task){
    if(writing.current || user?.role!=='Yönetici')return;
    writing.current=true;setBusy(true);setActionError('');
    try{await taskRequest(`/tasks/${value.id}`,{method:'DELETE',expectData:false});if(alive.current){setTasks(old=>old.filter(t=>t.id!==value.id));setSelected(null);setConfirmDelete(false);setNotice('Görev silindi.');}}
    catch(e){if(alive.current)setActionError(taskError(e));}
    finally{writing.current=false;if(alive.current)setBusy(false);}
  }
  const current=tasks.find(t=>t.id===selected);
  const filtered=tasks.filter(t=>t.title.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))&&(!assignee||String(t.assignee_id)===assignee));
  const canEdit=(t:Task)=>user?.role==='Yönetici'||(user?.role==='Ekip Üyesi'&&t.assignee_id===user.id);
  const canCreate=user?.role==='Yönetici'||user?.role==='Ekip Üyesi';
  function card(t:Task){return <article className="task-card" key={t.id} data-testid={`task-${t.id}`} draggable={!busy} onDragStart={e=>{e.dataTransfer.setData('text/plain',String(t.id));e.dataTransfer.effectAllowed='move';}}>
    <span className="task-code">#{t.id} · {t.type} · {t.priority}</span>
    <h3><button className="task-title" disabled={busy} onClick={()=>{setActionError('');setConfirmDelete(false);setSelected(t.id);}}>{t.title}</button></h3>
    <p>{person(project!.members,t.assignee_id)} · {t.end_date||'Teslim tarihi yok'}</p>
    <label className="field"><span>{t.title} durumu</span><select value={t.status} disabled={busy} onChange={e=>void move(t,e.target.value as Status)}>{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label>
  </article>;}
  return <>
    <Link to={`/uygulama/projeler/${projectId}`}>← Projeye dön</Link>
    <div className="page-heading"><div><h1>{project?.name||'Proje'} · Görevler</h1><p>Görevleri listele, sorumlularını ve durumlarını takip et.</p></div>{project&&!error&&canCreate&&<Button disabled={busy} onClick={()=>setEditor('new')}>Yeni görev</Button>}</div>
    {loading&&<p role="status">Görevler yükleniyor…</p>}
    {error&&<><p role="alert" className="alert">{error}</p><Button onClick={reload}>Tekrar dene</Button></>}
    {actionError&&!current&&<p role="alert" className="alert">{actionError}</p>}
    {notice&&<p role="status" className="success">{notice}</p>}
    {project&&!loading&&!error&&<>
      <div className="toolbar"><Field id="task-search" label="Görevlerde ara" value={query} onChange={e=>setQuery(e.target.value)}/><label className="field"><span>Sorumluya göre filtrele</span><select value={assignee} onChange={e=>setAssignee(e.target.value)}><option value="">Herkes</option>{project.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        <Button className="secondary" aria-pressed={view==='board'} onClick={()=>setView('board')}>Kanban</Button><Button className="secondary" aria-pressed={view==='list'} onClick={()=>setView('list')}>Liste</Button><Button className="secondary" disabled={busy} onClick={reload}>Görevleri yenile</Button>
      </div>
      {!tasks.length&&<p>Henüz görev yok. İlk görevi oluşturarak başla.</p>}{tasks.length>0&&!filtered.length&&<p>Filtreye uygun görev yok.</p>}
      {view==='board'?<div className="kanban" aria-label="Kanban panosu">{statuses.map(s=><section key={s} className="kanban-column" aria-label={s} data-testid={`column-${s.replaceAll(' ','-')}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const t=tasks.find(t=>t.id===Number(e.dataTransfer.getData('text/plain')));if(t)void move(t,s);}}><h2>{labels[s]} <small>({filtered.filter(t=>t.status===s).length})</small></h2>{filtered.filter(t=>t.status===s).map(card)}</section>)}</div>:<div aria-label="Görev listesi">{filtered.map(card)}</div>}
    </>}
    {project&&editor&&<TaskEditor project={project} value={editor==='new'?undefined:editor} onClose={()=>setEditor(null)} onSaved={saved=>{setTasks(old=>old.some(t=>t.id===saved.id)?old.map(t=>t.id===saved.id?saved:t):[...old,saved]);setEditor(null);setNotice('Görev kaydedildi.');}}/>}
    {project&&current&&!editor&&<Modal title={current.title} onClose={()=>{if(!writing.current)setSelected(null);}}>
      <p>{current.type} · {current.priority} · {labels[current.status]}</p><p>Sorumlu: {person(project.members,current.assignee_id)}</p><p>{current.start_date||'Başlangıç yok'} → {current.end_date||'Bitiş yok'}</p><p className="task-text">{current.description||'Açıklama eklenmemiş.'}</p>
      <div className="form-actions">{canEdit(current)&&<Button disabled={busy} onClick={()=>{setSelected(null);setEditor(current);}}>Görevi düzenle</Button>}{user?.role==='Yönetici'&&<Button className="secondary" disabled={busy} onClick={()=>setConfirmDelete(true)}>Görevi sil</Button>}</div>
      {confirmDelete&&<div><p>Bu görev ve ilişkili yorumlar silinecek. Emin misin?</p><Button disabled={busy} onClick={()=>void remove(current)}>Silmeyi onayla</Button><Button disabled={busy} className="secondary" onClick={()=>setConfirmDelete(false)}>Vazgeç</Button></div>}
      {actionError&&<p role="alert" className="alert">{actionError}</p>}
      <Discussion key={current.id} value={current} members={project.members}/>
    </Modal>}
  </>;
}
export function LiveTasks(){const {id}=useParams();if(!id||!/^[1-9]\d*$/.test(id)||!Number.isSafeInteger(Number(id)))return <p role="alert">Geçersiz proje adresi.</p>;return <Board key={id} projectId={Number(id)}/>;}
