import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import App from '../App';
import {SESSION_KEY} from '../api';
import {dayNumber,intersects,taskRange} from './Timeline';
import type {Task} from './taskApi';
const user={id:1,name:'Ümit',email:'umit@test.com',role:'Yönetici'};
const project={id:7,name:'Plan',members:[user]};
const base:Task={id:1,project_id:7,title:'Aylar arası görev',description:null,status:'To Do',priority:'Medium',type:'Task',assignee_id:1,start_date:'2026-10-30',end_date:'2026-11-02'};
function setup(tasks:Task[]=[base],error=false){
 const fetcher=vi.fn(async(url:string,options:RequestInit={})=>{
 if(options.method && options.method!=='GET')throw new Error('Salt okunur ekran yazma isteği gönderdi');
 const path=new URL(url).pathname;
 if(path==='/api/auth/me')return Response.json({data:user});
 if(path==='/api/projects')return Response.json({data:[project]});
 if(path==='/api/projects/7')return Response.json({data:project});
 if(path==='/api/projects/7/tasks')return error?Response.json({}, {status:503}):Response.json({data:tasks});
 throw new Error(path);
 });vi.stubGlobal('fetch',fetcher);return fetcher;
}
function page(path='/uygulama/projeler/7/takvim'){render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);}
async function month(){await userEvent.selectOptions(await screen.findByLabelText('Görüntülenen ay'),'11');fireEvent.change(screen.getByLabelText('Görüntülenen yıl'),{target:{value:'2026'}});}
beforeEach(()=>{sessionStorage.setItem(SESSION_KEY,'saved');vi.stubEnv('VITE_API_URL','https://api.test/api');});
afterEach(()=>{sessionStorage.clear();vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('Takvim tarihleri',()=>{
 it('gerçek takvim tarihlerini ve artık yılları doğrular',()=>{expect(dayNumber('2026-02-29')).toBeNull();expect(dayNumber('2024-02-29')).not.toBeNull();expect(dayNumber('2026-02-30')).toBeNull();});
 it('ay sınırını kesen ve tek gün süren işleri dahil eder',()=>{expect(intersects(base,dayNumber('2026-11-01')!,dayNumber('2026-11-30')!)).toBe(true);expect(intersects(base,dayNumber('2026-11-03')!,dayNumber('2026-11-30')!)).toBe(false);expect(intersects({...base,start_date:'2026-11-01',end_date:'2026-11-01'},dayNumber('2026-11-01')!,dayNumber('2026-11-30')!)).toBe(true);});
 it('eksik, ters ve bozuk aralıkları yerleştirmez',()=>{expect(taskRange({...base,start_date:null})).toBeNull();expect(taskRange({...base,start_date:'2026-11-03'})).toBeNull();expect(taskRange({...base,end_date:'2026-02-30'})).toBeNull();});
});
describe('Gerçek takvim ekranı',()=>{
 it('API görevlerini iki güne koyar ve Gantt ay sınırında kırpar',async()=>{
 setup();page();await month();
 expect(within(screen.getByRole('region',{name:'2026-11-01'})).getByText(base.title)).toBeVisible();
 expect(within(screen.getByRole('region',{name:'2026-11-02'})).getByText(base.title)).toBeVisible();
 expect(within(screen.getByRole('region',{name:'2026-11-03'})).queryByText(base.title)).not.toBeInTheDocument();
 await userEvent.click(screen.getByRole('button',{name:'Gantt'}));
 expect(screen.getByRole('table')).toBeVisible();expect(screen.getByLabelText(`${base.title}: 2026-10-30 – 2026-11-02`).firstChild).toHaveStyle({marginLeft:'0%',width:`${2/30*100}%`});
 });
 it('ay/yıl seçimi yıl geçişini ve artık yılı destekler',async()=>{setup();page();await month();await userEvent.selectOptions(screen.getByLabelText('Görüntülenen ay'),'12');fireEvent.change(screen.getByLabelText('Görüntülenen yıl'),{target:{value:'2027'}});await userEvent.click(screen.getByRole('button',{name:'Sonraki ay'}));expect(screen.getByLabelText('Görüntülenen yıl')).toHaveValue(2028);expect(screen.getByLabelText('Görüntülenen ay')).toHaveValue('01');await userEvent.selectOptions(screen.getByLabelText('Görüntülenen ay'),'02');expect(screen.getByRole('region',{name:'2028-02-29'})).toBeVisible();fireEvent.change(screen.getByLabelText('Görüntülenen yıl'),{target:{value:''}});expect(screen.getByRole('alert')).toHaveTextContent('Geçerli bir ay seç');expect(screen.getByRole('button',{name:'Sonraki ay'})).toBeDisabled();});
 it('Gantt başlangıç tarihine göre, eşit tarihlerde kimliğe göre sıralanır',async()=>{setup([{...base,id:3,title:'Son iş',start_date:'2026-11-02'},{...base,id:2,title:'İkinci iş'},base]);page();await month();await userEvent.click(screen.getByRole('button',{name:'Gantt'}));const rows=within(screen.getByRole('table')).getAllByRole('row');expect(rows[1]).toHaveTextContent('Aylar arası görev');expect(rows[2]).toHaveTextContent('İkinci iş');expect(rows[3]).toHaveTextContent('Son iş');});
 it('eksik tarihleri ayrı gösterir; arama ve boş durum çalışır',async()=>{setup([{...base,start_date:null}]);page();await month();expect(screen.getByRole('heading',{name:'Tarihleri eksik veya geçersiz görevler'})).toBeVisible();expect(screen.getByText('Bu ay ve arama için tarihli görev yok.')).toBeVisible();await userEvent.type(screen.getByLabelText('Görevlerde ara'),'eşleşmez');expect(screen.queryByRole('heading',{name:'Tarihleri eksik veya geçersiz görevler'})).not.toBeInTheDocument();});
 it('servis hatasında örnek veri göstermez, tekrar deneyebilir',async()=>{setup([],true);page();expect(await screen.findByRole('alert')).toHaveTextContent('Sunucu şu anda kullanılamıyor');setup();await userEvent.click(screen.getByRole('button',{name:'Tekrar dene'}));await month();expect(screen.getByText('1 görev bu ayla kesişiyor.')).toBeVisible();});
 it('başka projenin görev yanıtını reddeder',async()=>{setup([{...base,project_id:8}]);page();expect(await screen.findByRole('alert')).toHaveTextContent('sözleşmesiyle uyuşmuyor');expect(screen.queryByRole('region',{name:'Aylık takvim'})).not.toBeInTheDocument();});
 it('proje seçicisinden takvime gider, proje düzenleme düğmesi göstermez',async()=>{setup();page('/uygulama/takvim');expect(await screen.findByRole('link',{name:'Plan'})).toBeVisible();expect(screen.queryByRole('button',{name:'Yeni proje'})).not.toBeInTheDocument();await userEvent.click(screen.getByRole('link',{name:'Plan'}));expect(await screen.findByRole('heading',{name:'Plan · Takvim ve Gantt'})).toBeVisible();});
 it('hesap menüsünü klavyeyle kapatır ve odağı düğmeye döndürür',async()=>{setup();page();const toggle=await screen.findByRole('button',{name:'Menüyü aç'});await userEvent.click(toggle);expect(toggle).toHaveAttribute('aria-expanded','true');screen.getByRole('link',{name:'Takvim ve Gantt'}).focus();await userEvent.keyboard('{Escape}');expect(toggle).toHaveAttribute('aria-expanded','false');expect(toggle).toHaveFocus();});
});

