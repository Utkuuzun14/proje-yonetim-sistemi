import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import App from '../App';
import {SESSION_KEY} from '../api';
import {MAX_FILE_SIZE,projectFile,validateFile} from './fileApi';
const user={id:1,name:'Ümit',email:'test@test.com',role:'Ekip Üyesi'};
const task={id:10,project_id:7,title:'Test görevi',description:null,status:'To Do',priority:'Medium',type:'Task',assignee_id:1,start_date:null,end_date:null};
const meta={id:20,project_id:7,task_id:null as number|null,name:'rapor.pdf',type:'application/pdf',size:8,uploader_id:1,uploaded_at:'2026-11-17T10:00:00Z'};
const pdf=()=>new File(['%PDF-1.4'],'rapor.pdf',{type:'application/pdf'});
function backend({uploadStatus=201,downloadStatus=200,listStatus=200}={}){
 let files:typeof meta[]=[];
 const fetcher=vi.fn(async(url:string,options:RequestInit={})=>{
 const u=new URL(url),path=u.pathname;
 if(path==='/api/projects/7')return Response.json({data:{id:7,name:'Proje adı',members:[user]}});
 if(path==='/api/auth/me')return Response.json({data:user});
 if(path==='/api/projects/7/tasks')return Response.json({data:[task]});
 if(path==='/api/files/20/download')return downloadStatus===200?new Response('%PDF-1.4',{headers:{'Content-Type':'application/pdf'}}):Response.json({}, {status:downloadStatus});
 if(path==='/api/projects/7/files'){
 if(options.method==='POST'){
 if(uploadStatus!==201)return Response.json({error:{message:'Geçersiz dosya',details:[{field:'file',message:'İçerik imzası geçersiz.'}]}},{status:uploadStatus});
 const body=options.body as FormData;const saved={...meta,task_id:body.has('task_id')?Number(body.get('task_id')):null};files=[saved];return Response.json({data:saved},{status:201});
 }
 return listStatus===200?Response.json({data:files.filter(f=>!u.searchParams.has('taskId')||f.task_id===Number(u.searchParams.get('taskId')))}):Response.json({}, {status:listStatus});
 }throw new Error(path);
 });vi.stubGlobal('fetch',fetcher);return fetcher;
}
function page(){render(<MemoryRouter initialEntries={['/uygulama/projeler/7/dosyalar']}><App/></MemoryRouter>);}
async function upload(){await screen.findByText('Henüz dosya eklenmedi.');await userEvent.upload(screen.getByLabelText('Yüklenecek dosya'),pdf());await userEvent.click(screen.getByRole('button',{name:'Dosyayı yükle'}));}
beforeEach(()=>{sessionStorage.setItem(SESSION_KEY,'saved');vi.stubEnv('VITE_API_URL','https://api.test/api');});
afterEach(()=>{sessionStorage.clear();vi.unstubAllGlobals();vi.unstubAllEnvs();vi.restoreAllMocks();});
describe('Dosya sözleşmesi',()=>{
 it('sınırı ve uzantıyı kontrol eder, çift uzantıya güvenmez',()=>{expect(validateFile(pdf())).toBeNull();expect(validateFile(new File(['x'],'rapor.pdf.exe'))).toContain('İzin verilen');const large=pdf();Object.defineProperty(large,'size',{value:MAX_FILE_SIZE+1});expect(validateFile(large)).toContain('10 MB');expect(validateFile(new File([],'bos.pdf'))).toContain('Boş');});
 it('başka projenin dosyasını ve bozuk boyutu reddeder',()=>{expect(()=>projectFile({...meta,project_id:8},7)).toThrow();expect(()=>projectFile({...meta,size:'8'},7)).toThrow();});
});
describe('Gerçek hesap dosya akışı',()=>{
 it('başlıkta API proje adını gösterir',async()=>{backend();page();expect(await screen.findByRole('heading',{name:'Proje adı · Dosyalar'})).toBeVisible();expect(screen.queryByText('Proje #7 dosyaları')).not.toBeInTheDocument();});
 it('multipart file ve task_id gönderir; Authorization kullanır, Content-Type boundary tarayıcıya bırakılır',async()=>{const fetcher=backend();page();await screen.findByText('Henüz dosya eklenmedi.');await userEvent.selectOptions(screen.getByLabelText('Göreve bağla (isteğe bağlı)'),'10');await userEvent.upload(screen.getByLabelText('Yüklenecek dosya'),pdf());await userEvent.click(screen.getByRole('button',{name:'Dosyayı yükle'}));expect(await screen.findByText('Dosya sunucuya yüklendi.')).toBeVisible();await screen.findByRole('button',{name:'rapor.pdf indir'});const [,opts]=fetcher.mock.calls.find(([,o])=>o?.method==='POST')!;expect(opts!.body).toBeInstanceOf(FormData);expect((opts!.body as FormData).get('task_id')).toBe('10');expect((opts!.body as FormData).get('file')).toBeInstanceOf(File);expect(opts!.headers).toEqual({Authorization:'Bearer saved'});await userEvent.selectOptions(screen.getByLabelText('Dosyaları göreve göre filtrele'),'10');await waitFor(()=>expect(fetcher.mock.calls.some(([url])=>url.endsWith('/files?taskId=10'))).toBe(true));});
 it('projeye yüklerken task_id göndermez ve listeyi sunucudan yeniler',async()=>{const fetcher=backend();page();await upload();await screen.findByRole('button',{name:'rapor.pdf indir'});const body=fetcher.mock.calls.find(([,o])=>o?.method==='POST')![1]!.body as FormData;expect(body.has('task_id')).toBe(false);expect(fetcher.mock.calls.filter(([u,o])=>u.endsWith('/files')&&o?.method==='GET').length).toBeGreaterThan(1);});
 it.each([400,413])('%s yükleme hatasında seçili dosyayı korur',async status=>{backend({uploadStatus:status});page();await upload();expect(await screen.findByRole('alert')).toHaveTextContent(status===400?'İçerik imzası':'10 MB');expect((screen.getByLabelText('Yüklenecek dosya') as HTMLInputElement).files?.[0].name).toBe('rapor.pdf');expect(screen.queryByText('Dosya sunucuya yüklendi.')).not.toBeInTheDocument();});
 it('403 liste hatasını boş liste gibi göstermez ve yenilemeyi sunar',async()=>{backend({listStatus:403});page();expect(await screen.findByRole('alert')).toHaveTextContent('erişim iznin yok');expect(screen.queryByText('Henüz dosya eklenmedi.')).not.toBeInTheDocument();backend();await userEvent.click(screen.getByRole('button',{name:'Listeyi yenile'}));expect(await screen.findByText('Henüz dosya eklenmedi.')).toBeVisible();});
 it('indirmede Bearer başlığı gönderir ve yalnız blob adresini kullanır',async()=>{const fetcher=backend();vi.stubGlobal('URL',URL);const object=vi.fn(()=> 'blob:test');URL.createObjectURL=object;URL.revokeObjectURL=vi.fn();const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});page();await upload();await userEvent.click(await screen.findByRole('button',{name:'rapor.pdf indir'}));await screen.findByText('İndirme tarayıcıya iletildi.');expect(object).toHaveBeenCalledWith(expect.objectContaining({size:8,type:'application/pdf'}));expect(click).toHaveBeenCalledOnce();const [url,opts]=fetcher.mock.calls.find(([u])=>u.endsWith('/download'))!;expect(url).not.toContain('saved');expect(opts!.headers).toEqual({Authorization:'Bearer saved'});});
 it('401 indirme yanıtı oturumu kapatır',async()=>{backend({downloadStatus:401});page();await upload();await userEvent.click(await screen.findByRole('button',{name:'rapor.pdf indir'}));await screen.findByRole('button',{name:'Giriş yap'});expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();});
 it('istemci sınırını aşan dosya için POST göndermez',async()=>{const fetcher=backend();page();await screen.findByText('Henüz dosya eklenmedi.');const file=pdf();Object.defineProperty(file,'size',{value:MAX_FILE_SIZE+1});fireEvent.change(screen.getByLabelText('Yüklenecek dosya'),{target:{files:[file]}});await userEvent.click(screen.getByRole('button',{name:'Dosyayı yükle'}));expect(await screen.findByRole('alert')).toHaveTextContent('10 MB');expect(fetcher.mock.calls.some(([,o])=>o?.method==='POST')).toBe(false);});
});
