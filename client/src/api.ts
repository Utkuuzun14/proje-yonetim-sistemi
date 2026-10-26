export type AuthFields = { name?: string; email: string; password: string };
export type ApiUser = { id: number; name: string; email: string; role: string | null };
export const SESSION_KEY = 'sek-tech-session-token';
export const SESSION_EXPIRED = 'sek-tech-session-expired';
export function readToken() {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}
export function clearToken() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage may be unavailable. */ }
}
export function storeToken(token: string) {
  try { sessionStorage.setItem(SESSION_KEY, token); }
  catch { throw new Error('Oturum saklanamadı. Tarayıcının site depolama iznini kontrol et.'); }
}
export class ApiError extends Error {
  constructor(message: string, public status: number, public details: {field: string; message: string}[] = []) { super(message); }
}
export function validateAuth(fields: AuthFields, register: boolean): string | null {
  if (register && !fields.name?.trim()) return 'Adını ve soyadını gir.';
  if (register && (fields.name!.trim().length < 2 || fields.name!.trim().length > 100)) return 'Ad soyad 2-100 karakter olmalı.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) || fields.email.trim().length > 100) return 'Geçerli bir e-posta adresi gir.';
  if (!fields.password) return 'Parolanı gir.';
  if (register && (fields.password.length < 8 || fields.password.length > 72)) return 'Parolan 8-72 karakter olmalı.';
  if (register && (!/[A-ZÇĞİÖŞÜ]/.test(fields.password) || !/[a-zçğıöşü]/.test(fields.password) || !/[0-9]/.test(fields.password) || !/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü\s]/.test(fields.password))) return 'Parolan büyük harf, küçük harf, rakam ve özel karakter içermeli.';
  return null;
}
export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean; signal?: AbortSignal; expectData?: boolean } = {}): Promise<T> {
  const base = import.meta.env.VITE_API_URL;
  if (!base) throw new Error('Sunucu bağlantısı henüz yapılandırılmadı. Şimdilik arayüz önizlemesini inceleyebilirsin.');
  const token = options.auth ? readToken() : null;
  if (options.auth && !token) {
    window.dispatchEvent(new Event(SESSION_EXPIRED));
    throw new ApiError('Oturumun sona erdi. Lütfen tekrar giriş yap.', 401);
  }
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
      method: options.method || 'GET', credentials: 'omit',
      headers: { ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error && typeof error === 'object' && 'name' in error && ['TimeoutError', 'AbortError'].includes(String(error.name))) throw new Error('Sunucu zamanında yanıt vermedi. Biraz sonra tekrar dene.', {cause: error});
    throw new Error('Sunucuya ulaşılamadı. Sunucu bağlantısını kontrol edip tekrar dene.', {cause: error});
  }
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    if (response.status === 401 && options.auth && token === readToken()) { clearToken(); window.dispatchEvent(new Event(SESSION_EXPIRED)); }
    const messages: Record<number, string> = {
      401: options.auth ? 'Oturumun sona erdi. Lütfen tekrar giriş yap.' : 'E-posta veya parola hatalı.',
      403: 'Bu işlem için erişim iznin yok.', 404: 'İstenen kayıt veya API uç noktası bulunamadı.',
      409: 'Bu kayıt zaten var veya başka bir işlemle çakışıyor.', 429: 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.',
      503: 'Sunucu şu anda kullanılamıyor. Biraz sonra tekrar dene.',
    };
    const details = Array.isArray(payload?.error?.details) ? payload.error.details.filter((d: {field?: unknown; message?: unknown}) => typeof d?.field === 'string' && typeof d?.message === 'string') : [];
    throw new ApiError(response.status === 400 && typeof payload?.error?.message === 'string' ? payload.error.message : messages[response.status] || 'İşlem tamamlanamadı. Lütfen tekrar dene.', response.status, details);
  }
  if (response.status === 204 || options.expectData === false) return undefined as T;
  if (!payload || typeof payload !== 'object' || !('data' in payload)) throw new Error('Sunucudan beklenmeyen bir yanıt alındı.');
  return payload.data as T;
}
export function validUser(value: unknown): value is ApiUser {
  if (!value || typeof value !== 'object') return false;
  const u = value as ApiUser;
  return Number.isInteger(u.id) && u.id > 0 && typeof u.name === 'string' && typeof u.email === 'string' && (typeof u.role === 'string' || u.role === null);
}
export async function authenticate(mode: 'login' | 'register', fields: AuthFields) {
  const result = await apiRequest<{user: ApiUser; token: string}>(`/auth/${mode}`, {
    method: 'POST', body: {...fields, email: fields.email.trim(), ...(fields.name ? {name: fields.name.trim()} : {})},
  });
  if (!validUser(result?.user) || typeof result?.token !== 'string' || !result.token.trim()) throw new Error('Sunucudan geçerli bir oturum alınamadı.');
  return result;
}
