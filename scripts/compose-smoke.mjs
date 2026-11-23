// Run against the disposable Compose CI database. Creates and removes one test project.
import assert from 'node:assert/strict';
const base = 'http://localhost:3000';
async function request(path, {token, method = 'GET', body, status = 200, origin = base, headers = {}} = {}) {
  const response = await fetch(origin + path, {method, headers: {
    ...headers,
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
    ...(body ? {'Content-Type': 'application/json'} : {}),
  }, ...(body ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(15000)});
  assert.equal(response.status, status, `${method} ${path}: expected ${status}, got ${response.status}`);
  return response;
}
for (const path of ['/', '/giris', '/uygulama/projeler', '/onizleme/tasarim']) {
  const html = await (await request(path)).text();
  assert.match(html, /id="root"/);
  const asset = html.match(/src="(\/assets\/[^\"]+\.js)"/);
  assert.ok(asset, 'Built JS asset missing');
  const js = await (await request(asset[1])).text();
  assert.doesNotMatch(js, /localhost:5000/, 'Docker frontend must use same-origin /api');
}
await request('/assets/does-not-exist.js', {status:404});
await request('/api/health');
await request('/api/auth/me', {status:401});
await request('/api/auth/register', {method:'POST',body:{},status:400});
const login = async email => (await (await request('/api/auth/login', {method:'POST', body:{email,password:'Password123!'}})).json()).data;
const admin = await login('hakan@sektech.com');
const member = await login('utku@sektech.com');
assert.equal(admin.user.role, 'Yönetici');
assert.equal(member.user.role, 'Ekip Üyesi');
await request('/api/auth/me', {token:admin.token});
let id;
try {
  const input = {name:'CI Compose proje akışı',description:'Geçici smoke testi',start_date:'2026-10-26',end_date:'2026-11-01'};
  const created = await (await request('/api/projects', {method:'POST',token:admin.token,body:input,status:201})).json();
  id = created.data.id;
  assert.ok(Number.isInteger(id));
  await request(`/api/projects/${id}`, {token:member.token,status:404});
  await request(`/api/projects/${id}`, {method:'PATCH',token:admin.token,body:{name:'CI düzenlenmiş proje'}});
  const detail = await (await request(`/api/projects/${id}`,{token:admin.token})).json();
  assert.equal(detail.data.name,'CI düzenlenmiş proje');
  await request(`/api/projects/${id}/members`, {method:'POST',token:admin.token,body:{userId:member.user.id},status:201});
  await request(`/api/projects/${id}`, {token:member.token});
  const list = await (await request('/api/projects',{token:member.token})).json();
  assert.ok(list.data.some(p=>p.id===id));
  await request('/api/projects', {method:'POST',token:member.token,body:input,status:403});
  await request(`/api/projects/${id}`, {method:'PATCH',token:member.token,body:{name:'Yetkisiz değişiklik'},status:403});
  console.log('PASS: built frontend + SPA routes + nginx API proxy + JWT + project CRUD + membership + 401/403/404');
} finally {
  if (id) await request(`/api/projects/${id}`,{method:'DELETE',token:admin.token,status:204});
}

// Simulate one trusted proxy forwarding two different clients to Express.
// These direct API requests exercise the Compose TRUST_PROXY configuration.
const proxyLogin = (ip, password, status) => request('/api/auth/login', {
  origin:'http://localhost:5000', method:'POST', status,
  headers:{'X-Forwarded-For':ip}, body:{email:'hakan@sektech.com',password},
});
for (let attempt = 0; attempt < 5; attempt++) {
  await proxyLogin('192.0.2.10', 'WrongPassword123!', 401);
}
await proxyLogin('192.0.2.10', 'Password123!', 429);
await proxyLogin('192.0.2.11', 'Password123!', 200);
// nginx appends the actual peer: a supplied header must not select the blocked IP.
await request('/api/auth/login', {method:'POST',
  headers:{'X-Forwarded-For':'192.0.2.10'},
  body:{email:'hakan@sektech.com',password:'Password123!'},
});
console.log('PASS: login rate limit isolates forwarded clients and nginx uses the actual peer');
