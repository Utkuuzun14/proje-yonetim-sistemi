import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import App from '../App';
import {SESSION_KEY} from '../api';
import {progressReport, rangeReport, validRange} from './reportApi';
const user = {id: 1, name: 'Ümit', email: 'test@test.com', role: 'Ekip Üyesi'};
const report = {total: 10, status_counts: {'To Do': 3, 'In Progress': 3, Done: 4}, overdue: 3, unassigned: 0, completion_rate: 40, members: [
  {user_id: 1, name: 'Ayşe', assigned: 5, todo: 1, in_progress: 2, done: 2, overdue: 2, completion_rate: 40},
  {user_id: 2, name: 'Can', assigned: 5, todo: 2, in_progress: 1, done: 2, overdue: 1, completion_rate: 40}
]};
function backend({data = report, status = 200} = {}) {
  const fetcher = vi.fn(async (url: string) => {
    const u = new URL(url);
    if (u.pathname === '/api/auth/me') return Response.json({data: user});
    if (u.pathname === '/api/projects') return Response.json({data: [{id: 7, name: 'Etkinlik Sitesi'}]});
    if (u.pathname === '/api/projects/7') return Response.json({data: {id: 7, name: 'Etkinlik Sitesi', members: [user]}});
    if (u.pathname.endsWith('/reports/progress')) return status === 200 ? Response.json({data}) : Response.json({}, {status});
    if (u.pathname.endsWith('/reports/range')) return Response.json({data: {from: u.searchParams.get('from'), to: u.searchParams.get('to'), created: 2, completed: 5}});
    throw new Error(url);
  }); vi.stubGlobal('fetch', fetcher); return fetcher;
}
function page(path = '/uygulama/projeler/7/raporlar') { return render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>); }
beforeEach(() => {sessionStorage.setItem(SESSION_KEY, 'saved'); vi.stubEnv('VITE_API_URL', 'https://api.test/api');});
afterEach(() => {sessionStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs();});
describe('Rapor sözleşmesi', () => {
  it('geçersiz sayıları, üyeleri ve farklı tarih yanıtını reddeder', () => {
    expect(() => progressReport({...report, total: '10'})).toThrow();
    expect(() => progressReport({...report, completion_rate: Infinity})).toThrow();
    expect(() => progressReport({...report, members: [{...report.members[0], assigned: -1}]})).toThrow();
    expect(() => rangeReport({from: '2026-11-02', to: '2026-11-30', created: 1, completed: 2}, '2026-11-01', '2026-11-30')).toThrow();
    expect(validRange('2026-02-30', '2026-03-01')).toBe(false);
  });
});
describe('Gerçek hesap rapor ekranı', () => {
  it('R-01 ve R-03: yüzde 40 ilerleme ve kişi sayıları gösterir', async () => {
    backend(); page(); await screen.findByRole('heading', {name: 'Etkinlik Sitesi · Raporlar'});
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '40');
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(within(rows[1]).getAllByRole('cell').map(c => c.textContent)).toEqual(['5', '1', '2', '2', '2', '%40']);
    expect(within(rows[2]).getAllByRole('cell').map(c => c.textContent)).toEqual(['5', '2', '1', '2', '1', '%40']);
  });
  it('R-02: boş projede sıfır oranı ve boş durum gösterir', async () => {
    backend({data: {...report, total: 0, status_counts: {'To Do': 0, 'In Progress': 0, Done: 0}, overdue: 0, completion_rate: 0, members: []}}); page();
    await screen.findByText('Henüz görev yok. Görev eklendikçe rapor burada görünecek.');
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
  it('R-04: atanmamış görevleri kişi satırlarından ayrı gösterir', async () => {
    backend({data: {...report, total: 11, unassigned: 1}}); page();
    expect(await screen.findByText('Atanmamış görev: 1. Bu görevler kişi satırlarına dahil değildir.')).toBeVisible();
  });
  it('R-05/R-06: tarih parametrelerini gönderir; ters aralıkta önceki sonucu korur, yeni istek göndermez', async () => {
    const fetcher = backend(); page(); await screen.findByRole('progressbar');
    fireEvent.change(screen.getByLabelText('Başlangıç tarihi'), {target: {value: '2026-11-01'}});
    fireEvent.change(screen.getByLabelText('Bitiş tarihi'), {target: {value: '2026-11-30'}});
    await userEvent.click(screen.getByRole('button', {name: 'Raporu getir'}));
    const result = await screen.findByRole('region', {name: 'Tarih aralığı sonucu'});
    expect(within(result).getByText('5')).toBeVisible();
    expect(fetcher.mock.calls.some(([url]) => url.endsWith('range?from=2026-11-01&to=2026-11-30'))).toBe(true);
    fireEvent.change(screen.getByLabelText('Bitiş tarihi'), {target: {value: '2026-10-01'}});
    await userEvent.click(screen.getByRole('button', {name: 'Raporu getir'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('bitiş başlangıçtan önce olamaz');
    expect(result).toHaveTextContent('2026-11-01 – 2026-11-30');
    expect(fetcher.mock.calls.filter(([url]) => url.includes('/reports/range'))).toHaveLength(1);
  });
  it.each([403, 404])('R-07: %s durumunu sıfır veri gibi göstermez ve tekrar dener', async status => {
    backend({status}); page(); expect(await screen.findByRole('alert')).toHaveTextContent('erişim iznin yok');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(); backend();
    await userEvent.click(screen.getByRole('button', {name: 'Raporları yenile'})); expect(await screen.findByRole('progressbar')).toHaveAttribute('value', '40');
  });
  it('401 oturumu sonlandırır', async () => {backend({status: 401}); page(); await screen.findByRole('button', {name: 'Giriş yap'}); expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();});
  it('menüden gerçek proje seçimiyle rapora gider', async () => {
    backend(); page('/uygulama/raporlar'); await userEvent.click(await screen.findByRole('link', {name: 'Etkinlik Sitesi'}));
    expect(await screen.findByRole('heading', {name: 'Etkinlik Sitesi · Raporlar'})).toBeVisible();
  });
});
