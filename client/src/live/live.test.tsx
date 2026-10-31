import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { apiRequest, SESSION_KEY } from '../api';
const admin = {id: 1, name: 'Hakan', email: 'hakan@test.com', role: 'Yönetici'};
const member = {...admin, id: 2, name: 'Ümit', role: 'Ekip Üyesi'};
const project = {id: 7, name: 'Gerçek proje', description: 'API kaydı', start_date: '2026-10-26', end_date: '2026-11-01'};
function reply(data: unknown, status = 200) { return new Response(JSON.stringify({data}), {status, headers: {'Content-Type':'application/json'}}); }
function error(status: number, details: unknown[] = []) { return new Response(JSON.stringify({error:{message:'Geçersiz alan',details}}), {status}); }
function page(path = '/uygulama/projeler') {render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);}
beforeEach(() => {sessionStorage.clear(); vi.stubEnv('VITE_API_URL', 'https://api.test/api');});
afterEach(() => {sessionStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs();});
describe('Gerçek oturum ve projeler', () => {
  it('bozuk başarılı giriş yanıtından oturum üretmez', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(reply({user:admin})));
    page('/giris');
    await userEvent.type(screen.getByLabelText('E-posta adresi'),'hakan@test.com');
    await userEvent.type(screen.getByLabelText('Parola'),'Password123!');
    await userEvent.click(screen.getByRole('button',{name:'Giriş yap'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('geçerli bir oturum alınamadı');
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
  it('oturum doğrulamasında ağ hatasında projeyi açmaz; tekrar doğruladıktan sonra açar', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    vi.stubGlobal('fetch',vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(reply(member)).mockResolvedValueOnce(reply([project])));
    page();
    expect(await screen.findByRole('alert')).toHaveTextContent('Sunucuya ulaşılamadı');
    expect(screen.queryByRole('heading',{name:'Projeler'})).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button',{name:'Tekrar dene'}));
    expect(await screen.findByRole('link',{name:'Gerçek proje'})).toBeInTheDocument();
  });
  it('oturum olmadan doğrudan proje adresini girişe yönlendirir', async () => {
    const fetcher = vi.fn();vi.stubGlobal('fetch',fetcher);page('/uygulama/projeler/7');
    expect(await screen.findByRole('button',{name:'Giriş yap'})).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('giriş tokenını saklar, gerçek projeye geçer ve Bearer başlığını gönderir', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(reply({user:admin,token:'test-token'})).mockResolvedValueOnce(reply([project]));
    vi.stubGlobal('fetch',fetcher);page('/giris');
    await userEvent.type(screen.getByLabelText('E-posta adresi'),'hakan@test.com');
    await userEvent.type(screen.getByLabelText('Parola'),'Password123!');
    await userEvent.click(screen.getByRole('button',{name:'Giriş yap'}));
    expect(await screen.findByRole('link',{name:'Gerçek proje'})).toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('test-token');
    expect(fetcher).toHaveBeenLastCalledWith('https://api.test/api/projects',expect.objectContaining({headers:{Authorization:'Bearer test-token'}}));
    await userEvent.click(screen.getByRole('button',{name:'Çıkış yap'}));
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(await screen.findByRole('button',{name:'Giriş yap'})).toBeInTheDocument();
  });
  it('yenilemede kullanıcıyı /me ile doğrular; üyeye yönetici işlemleri göstermez', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    const fetcher=vi.fn().mockResolvedValueOnce(reply(member)).mockResolvedValueOnce(reply([project]));
    vi.stubGlobal('fetch',fetcher);page();
    expect(await screen.findByRole('link',{name:'Gerçek proje'})).toBeInTheDocument();
    expect(fetcher.mock.calls[0][0]).toBe('https://api.test/api/auth/me');
    expect(screen.queryByRole('button',{name:'Yeni proje'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Düzenle'})).not.toBeInTheDocument();
  });
  it('korumalı istekte 401 alınca tokenı temizleyip girişe döner', async () => {
    sessionStorage.setItem(SESSION_KEY,'expired');
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(reply(admin)).mockResolvedValueOnce(error(401)));
    page();expect(await screen.findByRole('button',{name:'Giriş yap'})).toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
  it('403 yanıtını erişim hatası olarak gösterir, oturumu kapatmaz', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(reply(member)).mockResolvedValueOnce(error(403)));
    page('/uygulama/projeler/7');
    expect(await screen.findByRole('alert')).toHaveTextContent('erişim iznin yok');
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('saved');
  });
  it('yönetici formunu POST ile kaydeder ve listeyi yeniden yükler', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    const fetcher=vi.fn().mockResolvedValueOnce(reply(admin)).mockResolvedValueOnce(reply([])).mockResolvedValueOnce(new Response(null,{status:201})).mockResolvedValueOnce(reply([project]));
    vi.stubGlobal('fetch',fetcher);page();
    await screen.findByText('Henüz erişebildiğin proje yok.');
    await userEvent.click(screen.getByRole('button',{name:'Yeni proje'}));
    await userEvent.type(screen.getByLabelText('Proje adı'),'Gerçek proje');
    fireEvent.change(screen.getByLabelText('Başlangıç tarihi'),{target:{value:'2026-10-26'}});
    fireEvent.change(screen.getByLabelText('Bitiş tarihi'),{target:{value:'2026-11-01'}});
    await userEvent.click(screen.getByRole('button',{name:'Projeyi kaydet'}));
    expect(await screen.findByRole('link',{name:'Gerçek proje'})).toBeInTheDocument();
    const request=fetcher.mock.calls.find(([,init])=>init.method==='POST');
    expect(JSON.parse(request![1].body)).toEqual({name:'Gerçek proje',description:'',start_date:'2026-10-26',end_date:'2026-11-01'});
  });
  it('güncelleme hatasında form verisini korur ve alan hatasını ilişkilendirir', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    const fetcher=vi.fn().mockResolvedValueOnce(reply(admin)).mockResolvedValueOnce(reply(project)).mockResolvedValueOnce(error(400,[{field:'name',message:'Ad uygun değil.'}]));
    vi.stubGlobal('fetch',fetcher);page('/uygulama/projeler/7');
    await userEvent.click(await screen.findByRole('button',{name:'Projeyi düzenle'}));
    await userEvent.click(screen.getByRole('button',{name:'Projeyi kaydet'}));
    expect(await screen.findByText('Ad uygun değil.')).toBeInTheDocument();
    expect(screen.getByLabelText('Proje adı')).toHaveValue('Gerçek proje');
    expect(screen.getByLabelText('Proje adı')).toHaveAttribute('aria-invalid','true');
    expect(fetcher.mock.calls[2][1].method).toBe('PATCH');
  });
  it('404 proje servisi yanıtında demo veri göstermez; tekrar denemeyle toparlanır', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(reply(member)).mockResolvedValueOnce(error(404)).mockResolvedValueOnce(reply([project])));
    page();expect(await screen.findByRole('alert')).toHaveTextContent('Proje servisi bulunamadı');
    await userEvent.click(screen.getByRole('button',{name:'Tekrar dene'}));
    expect(await screen.findByRole('link',{name:'Gerçek proje'})).toBeInTheDocument();
  });
  it('erişilemeyen proje için varlık bilgisini açığa çıkarmadan geri dönüş sunar', async () => {
    sessionStorage.setItem(SESSION_KEY,'saved');
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(reply(member)).mockResolvedValueOnce(error(404)));
    page('/uygulama/projeler/7');
    expect(await screen.findByRole('alert')).toHaveTextContent('Proje bulunamadı veya bu projeye erişim iznin yok');
    expect(screen.getByRole('link',{name:'← Projelere dön'})).toHaveAttribute('href','/uygulama/projeler');
    expect(screen.queryByRole('button',{name:'Projeyi düzenle'})).not.toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('saved');
  });
  it('eski isteğin 401 yanıtı yeni oturum tokenını silmez', async () => {
    sessionStorage.setItem(SESSION_KEY,'old');
    let finish!: (value:Response)=>void;
    vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>new Promise<Response>(resolve=>{finish=resolve;})));
    const pending=apiRequest('/projects',{auth:true});
    sessionStorage.setItem(SESSION_KEY,'new');finish(error(401));
    await expect(pending).rejects.toThrow('Oturumun sona erdi');
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('new');
  });
  it('kayıtta zayıf parolayı sunucuya göndermeden reddeder', async () => {
    const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);page('/kayit');
    await userEvent.type(screen.getByLabelText('Ad soyad'),'Test User');
    await userEvent.type(screen.getByLabelText('E-posta adresi'),'test@example.com');
    await userEvent.type(screen.getByLabelText('Parola'),'password123');
    await userEvent.click(screen.getByRole('button',{name:'Hesap oluştur'}));
    await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('özel karakter'));
    expect(fetcher).not.toHaveBeenCalled();
  });
});
