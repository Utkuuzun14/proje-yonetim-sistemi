import {apiRequest} from '../api';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const FILE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.zip';
export type ProjectFile = {id:number;project_id:number;task_id:number|null;name:string;type:string|null;size:number|null;uploader_id:number|null;uploaded_at:string};
const id=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0;
export function projectFile(value:unknown,projectId:number):ProjectFile {
 if(!value || typeof value!=='object')throw new Error('Dosya yanıtı geçersiz.');
 const f=value as ProjectFile;
 if(!id(f.id)||f.project_id!==projectId||!(f.task_id===null||id(f.task_id))||typeof f.name!=='string'||!f.name.trim()||!(f.type===null||typeof f.type==='string')||!(f.size===null||(Number.isSafeInteger(f.size)&&f.size>=0))||!(f.uploader_id===null||id(f.uploader_id))||typeof f.uploaded_at!=='string'||!Number.isFinite(Date.parse(f.uploaded_at)))throw new Error('Dosya yanıtı API sözleşmesiyle uyuşmuyor.');
 return f;
}
export function validateFile(file:File) {
 if(file.size===0)return 'Boş dosya yüklenemez.';
 if(file.size>MAX_FILE_SIZE)return 'Dosya en fazla 10 MB olabilir.';
 if(!/\.(pdf|png|jpe?g|docx|xlsx|zip)$/i.test(file.name))return 'İzin verilen dosya türleri: PDF, PNG, JPG, JPEG, DOCX, XLSX ve ZIP.';
 return null;
}
export async function uploadFile(projectId:number,file:File,taskId:number|null,signal:AbortSignal){
 const error=validateFile(file);if(error)throw new Error(error);
 const body=new FormData();body.append('file',file);if(taskId!==null)body.append('task_id',String(taskId));
 const saved=projectFile(await apiRequest<unknown>(`/projects/${projectId}/files`,{method:'POST',auth:true,body,signal,timeoutMs:120000}),projectId);
 if(saved.task_id!==taskId)throw new Error('Yüklenen dosyanın görev bağlantısı beklenenle uyuşmuyor.');
 return saved;
}
export async function downloadFile(file:ProjectFile,signal:AbortSignal){
 const blob=await apiRequest<Blob>(`/files/${file.id}/download`,{auth:true,responseType:'blob',signal,timeoutMs:120000});
 const url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download=[...file.name].map(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127||c==='/'||c==='\\'?'_':c).join('');
 document.body.appendChild(anchor);
 try{anchor.click();}finally{anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
