import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest, authenticate, clearToken, readToken, storeToken, validUser, SESSION_EXPIRED, type ApiUser, type AuthFields } from '../api';
type Session = { user: ApiUser | null; loading: boolean; error: string; login: (mode: 'login' | 'register', fields: AuthFields) => Promise<void>; logout: () => void; retry: () => void };
const Context = createContext<Session | null>(null);
export function SessionProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(!!readToken());
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  useEffect(() => {
    const expire = () => { generation.current++; setUser(null); setError(''); setLoading(false); };
    window.addEventListener(SESSION_EXPIRED, expire);
    return () => window.removeEventListener(SESSION_EXPIRED, expire);
  }, []);
  useEffect(() => {
    if (!readToken()) return;
    const controller = new AbortController();
    const current = ++generation.current;
    apiRequest<ApiUser>('/auth/me', {auth: true, signal: controller.signal}).then(value => {
      if (!validUser(value)) throw new Error('Sunucu kullanıcı bilgisini doğrulayamadı.');
      if (generation.current === current) setUser(value);
    }).catch(e => { if (!controller.signal.aborted && generation.current === current) setError((e as Error).message); })
      .finally(() => { if (generation.current === current && !controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  async function login(mode: 'login' | 'register', fields: AuthFields) {
    const current = ++generation.current;
    const result = await authenticate(mode, fields);
    if (current !== generation.current) return;
    storeToken(result.token);
    setUser(result.user); setError(''); setLoading(false);
  }
  function logout() { generation.current++; clearToken(); setUser(null); setError(''); setLoading(false); }
  function retry() { setError(''); setLoading(true); setAttempt(n => n + 1); }
  return <Context.Provider value={{user, loading, error, login, logout, retry}}>{children}</Context.Provider>;
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error('SessionProvider gerekli.');
  return value;
}
export function Protected({children}: {children: ReactNode}) {
  const {user, loading, error, retry, logout} = useSession();
  if (loading) return <main className="content"><p role="status">Oturum doğrulanıyor…</p></main>;
  if (error) return <main className="content"><p role="alert">{error}</p><button onClick={retry}>Tekrar dene</button><button onClick={logout}>Oturumu kapat</button></main>;
  if (!user) return <Navigate to="/giris" replace />;
  return children;
}
