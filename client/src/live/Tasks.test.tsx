import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import App from '../App';
import {SESSION_KEY} from '../api';
import type {Task} from './taskApi';

const admin={id:1,name:'Yönetici',email:'admin@test.com',role:'Yönetici'};
const member={id:2,name:'Ümit',email:'umit@test.com',role:'Ekip Üyesi'};
const project={id:7,name:'API projesi',members:[admin,member,{id:3,name:'Mert'}]};
const initial:Task={id:10,project_id:7,title:'Kayıt formu',description:'Açıklama',status:'To Do',priority:'Medium',type:'Task',assignee_id:2,start_date:'2026-11-02',end_date:'2026-11-08'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify({data}),{status});
const failure=(status:number)=>new Response(JSON.stringify({error:{message:'Alan geçersiz',details:[{field:'title',message:'Başlık uygun değil'}]}}),{status});
type Init={method?:string;body?:string;headers?:Record<string,string>};
function backend(user=admin,values:Task[]=[{...initial}]){
  const fetcher=vi.fn(async (url:string,options:Init={})=>{
    const p=new URL(url).pathname;
    if(p==='/api/auth/me')return json(user);
    if(p==='/api/projects/7')return json(project);
    if(p==='/api/projects')return json([project]);
    if(p==='/api/projects/7/tasks'&&(!options.method||options.method==='GET'))return json(values);
    if(p==='/api/tasks/10/comments'&&(!options.method||options.method==='GET'))return json([]);
    if(p==='/api/tasks/10/history')return json([{id:1,task_id:10,old_status:null,new_status:'To Do',changed_by_id:1,changed_at:'2026-11-02T10:00:00Z'}]);
    if(p==='/api/tasks/10'&&options.method==='PATCH'){const saved={...values[0],...JSON.parse(options.body!)};values[0]=saved;return json(saved);}
    if(p==='/api/projects/7/tasks'&&options.method==='POST'){const saved={...initial,id:11,...JSON.parse(options.body!)};values.push(saved);return json(saved,201);}
    if(p==='/api/tasks/10/comments'&&options.method==='POST')return json({id:5,task_id:10,author_id:user.id,content:JSON.parse(options.body!).content,created_at:'2026-11-02T11:00:00Z'},201);
    if(p==='/api/tasks/10'&&options.method==='DELETE'){values.splice(0,1);return new Response(null,{status:204});}
    throw new Error(`Unexpected request: ${options.method||'GET'} ${p}`);
  });
  vi.stubGlobal('fetch',fetcher);return fetcher;
}
function page(path='/uygulama/projeler/7/gorevler'){return render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);}
async function open(){await userEvent.click(await screen.findByRole('button',{name:'Kayıt formu'}));await screen.findByRole('heading',{name:'Yorumlar'});}
beforeEach(()=>{sessionStorage.setItem(SESSION_KEY,'saved');vi.stubEnv('VITE_API_URL','https://api.test/api');});
afterEach(()=>{sessionStorage.clear();vi.unstubAllGlobals();vi.unstubAllEnvs();});

describe('Gerçek görev/Kanban sözleşme entegrasyonu',()=>{
  it.each([99,2,null])('yönetici başlığı değiştirirken mevcut atamayı (%s) PATCH ile tekrar göndermez',async assignee=>{
    const values=[{...initial,assignee_id:assignee}];
    const fetcher=backend(admin,values);page();await open();
    await userEvent.click(screen.getByRole('button',{name:'Görevi düzenle'}));
    expect(screen.getByLabelText('Sorumlu kişi')).toHaveValue(assignee===null?'':String(assignee));
    if(assignee===99)expect(screen.getByRole('option',{name:'Kullanıcı #99 (artık proje üyesi değil)'})).toBeDisabled();
    await userEvent.clear(screen.getByLabelText('Görev başlığı'));await userEvent.type(screen.getByLabelText('Görev başlığı'),'Yeni başlık');
    await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    await screen.findByRole('button',{name:'Yeni başlık'});
    expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='PATCH')![1]!.body!)).not.toHaveProperty('assignee_id');
    expect(values[0].assignee_id).toBe(assignee);
  });
  it.each([['',null],['3',3]])('yönetici eski üyeye atamayı açıkça %s seçimine değiştirince gönderir',async (selection,expected)=>{
    const values=[{...initial,assignee_id:99}];
    const fetcher=backend(admin,values);page();await open();
    await userEvent.click(screen.getByRole('button',{name:'Görevi düzenle'}));
    await userEvent.selectOptions(screen.getByLabelText('Sorumlu kişi'),String(selection));
    await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    await screen.findByText('Görev kaydedildi.');
    expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='PATCH')![1]!.body!)).toHaveProperty('assignee_id',expected);
    expect(values[0].assignee_id).toBe(expected);
  });
  it('proje üyelerinden sayısal kişi atar; tür/öncelik ile POST gönderir',async()=>{
    const fetcher=backend();page();await screen.findByRole('button',{name:'Kayıt formu'});
    await userEvent.click(screen.getByRole('button',{name:'Yeni görev'}));
    await userEvent.type(screen.getByLabelText('Görev başlığı'),'Mobil hata');
    await userEvent.selectOptions(screen.getByLabelText('Sorumlu kişi'),'3');
    await userEvent.selectOptions(screen.getByLabelText('Görev türü'),'Bug');
    await userEvent.selectOptions(screen.getByLabelText('Öncelik'),'High');
    await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    expect(await screen.findByRole('button',{name:'Mobil hata'})).toBeInTheDocument();
    const call=fetcher.mock.calls.find(([,o])=>o?.method==='POST')!;
    expect(call[0]).toBe('https://api.test/api/projects/7/tasks');
    expect(JSON.parse(call[1]!.body!)).toMatchObject({title:'Mobil hata',assignee_id:3,type:'Bug',priority:'High',start_date:null,end_date:null});
    expect(call[1]!.headers).toMatchObject({Authorization:'Bearer saved'});
  });
  it('üyenin kendi görevini düzenlemesine izin verir, atamayı PATCH gövdesine eklemez',async()=>{
    const fetcher=backend(member);page();await open();
    await userEvent.click(screen.getByRole('button',{name:'Görevi düzenle'}));
    expect(screen.queryByLabelText('Sorumlu kişi')).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Görev başlığı'));await userEvent.type(screen.getByLabelText('Görev başlığı'),'Düzeltilmiş görev');
    await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    expect(await screen.findByRole('button',{name:'Düzeltilmiş görev'})).toBeInTheDocument();
    expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='PATCH')![1]!.body!)).not.toHaveProperty('assignee_id');
  });
  it('üye başkasının görevini düzenleyemez veya silemez; durumunu değiştirebilir',async()=>{
    const fetcher=backend(member,[{...initial,assignee_id:3}]);page();await open();
    expect(screen.queryByRole('button',{name:'Görevi düzenle'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Görevi sil'})).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button',{name:'Pencereyi kapat'}));
    await userEvent.selectOptions(screen.getByLabelText('Kayıt formu durumu'),'In Progress');
    await waitFor(()=>expect(within(screen.getByRole('region',{name:'In Progress'})).getByRole('button',{name:'Kayıt formu'})).toBeInTheDocument());
    expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='PATCH')![1]!.body!)).toEqual({status:'In Progress'});
  });
  it('üye yeni görevini kendine atar; başka kullanıcı atama seçicisi yoktur',async()=>{
    const fetcher=backend(member);page();await screen.findByRole('button',{name:'Kayıt formu'});await userEvent.click(screen.getByRole('button',{name:'Yeni görev'}));
    expect(screen.queryByLabelText('Sorumlu kişi')).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Görev başlığı'),'Kendi işim');await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    await screen.findByRole('button',{name:'Kendi işim'});expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='POST')![1]!.body!)).toHaveProperty('assignee_id',2);
  });
  it('sürükle-bırak PATCH başarısızsa eski sütuna geri döner; çift değişiklik göndermez',async()=>{
    const fetcher=backend();page();await screen.findByRole('button',{name:'Kayıt formu'});
    let finish!:(r:Response)=>void;fetcher.mockImplementationOnce(()=>new Promise<Response>(r=>{finish=r;}));
    const dataTransfer={getData:()=> '10',setData:vi.fn(),effectAllowed:''};
    fireEvent.dragStart(screen.getByTestId('task-10'),{dataTransfer});fireEvent.drop(screen.getByRole('region',{name:'Done'}),{dataTransfer});
    expect(within(screen.getByRole('region',{name:'Done'})).getByRole('button',{name:'Kayıt formu'})).toBeDisabled();
    fireEvent.drop(screen.getByRole('region',{name:'In Progress'}),{dataTransfer});finish(failure(500));
    await screen.findByRole('alert');expect(within(screen.getByRole('region',{name:'To Do'})).getByRole('button',{name:'Kayıt formu'})).toBeEnabled();
    expect(fetcher.mock.calls.filter(([,o])=>o?.method==='PATCH')).toHaveLength(1);
  });
  it('başarılı değişiklik yenilemede sunucudan tekrar okunur',async()=>{
    backend();page();await screen.findByRole('button',{name:'Kayıt formu'});await userEvent.selectOptions(screen.getByLabelText('Kayıt formu durumu'),'Done');
    await screen.findByText('“Kayıt formu” Tamamlandı durumuna taşındı.');await userEvent.click(screen.getByRole('button',{name:'Görevleri yenile'}));
    await screen.findByRole('button',{name:'Kayıt formu'});expect(within(screen.getByRole('region',{name:'Done'})).getByRole('button',{name:'Kayıt formu'})).toBeInTheDocument();
  });
  it('400 alan hatasında formu ve girilen metni korur',async()=>{
    const fetcher=backend();page();await screen.findByRole('button',{name:'Kayıt formu'});await userEvent.click(screen.getByRole('button',{name:'Yeni görev'}));await userEvent.type(screen.getByLabelText('Görev başlığı'),'Korunacak metin');
    fetcher.mockResolvedValueOnce(failure(400));await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    expect(await screen.findByText('title: Başlık uygun değil')).toBeInTheDocument();expect(screen.getByLabelText('Görev başlığı')).toHaveValue('Korunacak metin');
  });
  it('ters tarihleri sunucuya göndermeden reddeder',async()=>{
    const fetcher=backend();page();await screen.findByRole('button',{name:'Kayıt formu'});await userEvent.click(screen.getByRole('button',{name:'Yeni görev'}));await userEvent.type(screen.getByLabelText('Görev başlığı'),'Tarih testi');
    fireEvent.change(screen.getByLabelText('Başlangıç tarihi'),{target:{value:'2026-11-08'}});fireEvent.change(screen.getByLabelText('Bitiş tarihi'),{target:{value:'2026-11-02'}});await userEvent.click(screen.getByRole('button',{name:'Görevi kaydet'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Bitiş tarihi başlangıçtan önce');expect(fetcher.mock.calls.some(([,o])=>o?.method==='POST')).toBe(false);
  });
  it('yorumda yazar göndermez; HTML içeriğini metin olarak gösterir ve geçmişi okur',async()=>{
    const fetcher=backend(member);page();await open();
    await userEvent.type(screen.getByLabelText('Yorum yaz'),'<script>alert(1)</script>');await userEvent.click(screen.getByRole('button',{name:'Yorum gönder'}));
    expect(await screen.findByText('<script>alert(1)</script>')).toBeInTheDocument();expect(document.querySelector('script')).toBeNull();
    expect(JSON.parse(fetcher.mock.calls.find(([,o])=>o?.method==='POST')![1]!.body!)).toEqual({content:'<script>alert(1)</script>'});expect(screen.getByRole('heading',{name:'Durum geçmişi'})).toBeInTheDocument();
  });
  it('başarısız yorumda metni koruyup yeniden göndermeyi sağlar',async()=>{
    const fetcher=backend(member);page();await open();await userEvent.type(screen.getByLabelText('Yorum yaz'),'Kaybolmasın');fetcher.mockResolvedValueOnce(failure(503));await userEvent.click(screen.getByRole('button',{name:'Yorum gönder'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('kullanılamıyor');expect(screen.getByLabelText('Yorum yaz')).toHaveValue('Kaybolmasın');await userEvent.click(screen.getByRole('button',{name:'Yorum gönder'}));expect(await screen.findByText('Kaybolmasın')).toBeInTheDocument();
  });
  it('görev servisi yoksa boş/demo başarı göstermez ve yeniden dener',async()=>{
    const fetcher=backend();const original=fetcher.getMockImplementation()!;let fail=true;
    fetcher.mockImplementation((url,o)=>url.endsWith('/tasks')&&fail?Promise.resolve(failure(404)):original(url,o));page();
    expect(await screen.findByRole('alert')).toHaveTextContent('görev servisi henüz');expect(screen.queryByText('Henüz görev yok. İlk görevi oluşturarak başla.')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Yeni görev'})).not.toBeInTheDocument();
    fail=false;await userEvent.click(screen.getByRole('button',{name:'Tekrar dene'}));expect(await screen.findByRole('button',{name:'Kayıt formu'})).toBeInTheDocument();
  });
  it('başka projeye ait görev yanıtını ekrana taşımaz',async()=>{
    backend(admin,[{...initial,project_id:999}]);page();expect(await screen.findByRole('alert')).toHaveTextContent('sözleşmesiyle uyuşmuyor');expect(screen.queryByRole('button',{name:'Kayıt formu'})).not.toBeInTheDocument();
  });
  it('yönetici silmeden önce onay ister, 204 sonrası kartı kaldırır',async()=>{
    const fetcher=backend();page();await open();await userEvent.click(screen.getByRole('button',{name:'Görevi sil'}));expect(fetcher.mock.calls.some(([,o])=>o?.method==='DELETE')).toBe(false);
    await userEvent.click(screen.getByRole('button',{name:'Silmeyi onayla'}));await screen.findByText('Görev silindi.');expect(screen.queryByRole('button',{name:'Kayıt formu'})).not.toBeInTheDocument();
  });
  it('401 ile oturumu sonlandırır; eski görevleri göstermez',async()=>{
    const fetcher=backend();const original=fetcher.getMockImplementation()!;
    fetcher.mockImplementation((url,o)=>url.endsWith('/tasks')?Promise.resolve(failure(401)):original(url,o));page();expect(await screen.findByRole('button',{name:'Giriş yap'})).toBeInTheDocument();expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
