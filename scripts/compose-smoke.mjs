// Run against the disposable Compose CI database. Creates and removes one test project.
import assert from 'node:assert/strict';
const base = 'http://localhost:3000';
async function request(path, {token, method = 'GET', body, status = 200} = {}) {
  const response = await fetch(base + path, {method, headers: {
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
