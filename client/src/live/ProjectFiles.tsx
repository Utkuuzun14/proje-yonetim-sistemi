import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link,useParams} from 'react-router-dom';
import {apiRequest,ApiError} from '../api';
import {Button,Card} from '../components';
import {list,task,taskProject,type Task} from './taskApi';
import {downloadFile,FILE_ACCEPT,projectFile,uploadFile,validateFile,type ProjectFile} from './fileApi';
function message(e:unknown){return e instanceof ApiError ? [e.message,...e.details.map(d=>d.message)].join(' ') : e instanceof Error ? e.message : 'Dosya işlemi tamamlanamadı.';}
export function ProjectFiles({projectId}:{projectId:number}){
 const [projectName,setProjectName]=useState('');
 const [files,setFiles]=useState<ProjectFile[]>([]),[tasks,setTasks]=useState<Task[]>([]);
 const [filter,setFilter]=useState(''),[attachment,setAttachment]=useState('');
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[actionError,setActionError]=useState(''),[notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false),[version,setVersion]=useState(0);
 const input=useRef<HTMLInputElement>(null),working=useRef(false),lifetime=useRef<AbortController|null>(null);
 useEffect(()=>{const c=new AbortController();lifetime.current=c;return()=>c.abort();},[]);
 useEffect(()=>{
  const c=new AbortController();
  Promise.all([apiRequest<unknown>(`/projects/${projectId}`,{auth:true,signal:c.signal}),apiRequest<unknown>(`/projects/${projectId}/files${filter?`?taskId=${filter}`:''}`,{auth:true,signal:c.signal}),apiRequest<unknown>(`/projects/${projectId}/tasks`,{auth:true,signal:c.signal})])
  .then(([p,f,t])=>{const project=taskProject(p,projectId);const parsed=list(f,v=>projectFile(v,projectId));if(filter&&parsed.some(v=>v.task_id!==Number(filter)))throw new Error('Dosya filtre yanıtı geçersiz.');const allTasks=list(t,v=>task(v,projectId));if(!c.signal.aborted){setProjectName(project.name);setFiles(parsed);setTasks(allTasks);}})
  .catch(e=>{if(!c.signal.aborted)setError(message(e));})
  .finally(()=>{if(!c.signal.aborted)setLoading(false);});
  return()=>c.abort();
 },[projectId,filter,version]);
 function refresh(){setError('');setFiles([]);setLoading(true);setVersion(v=>v+1);}
 async function upload(e:FormEvent){
  e.preventDefault();if(working.current)return;
  const file=input.current?.files?.[0];const validation=file?validateFile(file):'Önce bir dosya seç.';
  if(validation){setActionError(validation);return;}
  const taskId=attachment?Number(attachment):null;
  if(taskId!==null&&!tasks.some(t=>t.id===taskId)){setActionError('Bu projeden geçerli bir görev seç.');return;}
  const c=lifetime.current!;working.current=true;setBusy(true);setActionError('');setNotice('');
  try{await uploadFile(projectId,file!,taskId,c.signal);if(!c.signal.aborted){if(input.current)input.current.value='';setNotice('Dosya sunucuya yüklendi.');refresh();}}
  catch(e){if(!c.signal.aborted)setActionError(`${message(e)} Bağlantı kesildiyse yeniden yüklemeden önce listeyi yenileyip dosyanın kaydedilip kaydedilmediğini kontrol et.`);}
  finally{working.current=false;if(!c.signal.aborted)setBusy(false);}
 }
 async function download(file:ProjectFile){if(working.current)return;const c=lifetime.current!;working.current=true;setBusy(true);setActionError('');setNotice('');try{await downloadFile(file,c.signal);if(!c.signal.aborted)setNotice('İndirme tarayıcıya iletildi.');}catch(e){if(!c.signal.aborted)setActionError(message(e));}finally{working.current=false;if(!c.signal.aborted)setBusy(false);}}
 return <section className="files-section" aria-label="Proje dosyaları"><h1>{projectName ? `${projectName} · Dosyalar` : 'Dosyalar'}</h1><Card>
  <p>En fazla 10 MB. PDF, PNG, JPG, JPEG, DOCX, XLSX veya ZIP. İçerik ve erişim sunucuda doğrulanır.</p>
  <form onSubmit={upload} aria-busy={busy}><fieldset disabled={busy||loading||!!error}>
   <label className="field"><span>Yüklenecek dosya</span><input type="file" ref={input} accept={FILE_ACCEPT}/></label>
   <label className="field"><span>Göreve bağla (isteğe bağlı)</span><select value={attachment} onChange={e=>setAttachment(e.target.value)}><option value="">Yalnız projeye</option>{tasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
   <Button type="submit">{busy?'İşlem sürüyor…':'Dosyayı yükle'}</Button>
  </fieldset></form>
  <label className="field"><span>Dosyaları göreve göre filtrele</span><select disabled={busy||loading||!!error} value={filter} onChange={e=>{setFilter(e.target.value);setFiles([]);setLoading(true);setError('');setNotice('');}}><option value="">Tüm proje dosyaları</option>{tasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
  <Button className="secondary" disabled={busy||loading} onClick={refresh}>Listeyi yenile</Button>
  {notice&&<p role="status" className="success">{notice}</p>}{actionError&&<p role="alert" className="alert">{actionError}</p>}
  {error?<p role="alert" className="alert">{error}</p>:loading?<p role="status">Dosyalar yükleniyor…</p>:files.length?<ul className="file-list">{files.map(f=><li key={f.id}><div><strong>{f.name}</strong><small>{f.size===null?'Boyut bilinmiyor':`${(f.size/1024).toFixed(1)} KB`} · {new Date(f.uploaded_at).toLocaleString('tr-TR')} · {f.task_id===null?'Proje dosyası':tasks.find(t=>t.id===f.task_id)?.title||`Görev #${f.task_id}`}</small></div><Button disabled={busy} onClick={()=>download(f)} aria-label={`${f.name} indir`}>İndir</Button></li>)}</ul>:<p>{filter?'Bu göreve bağlı dosya yok.':'Henüz dosya eklenmedi.'}</p>}
 </Card></section>;
}
export function LiveFiles(){const {id}=useParams();if(!id||!/^[1-9]\d*$/.test(id)||!Number.isSafeInteger(Number(id)))return <p role="alert">Geçersiz proje adresi.</p>;return <><Link to="/uygulama/dosyalar">← Dosyalar için proje seç</Link><ProjectFiles key={id} projectId={Number(id)}/></>;}
