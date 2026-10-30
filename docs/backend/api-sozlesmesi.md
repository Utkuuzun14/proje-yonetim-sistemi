# API Sözleşmesi — v0.5

| | |
|---|---|
| Kart | #30 (iskelet + sözleşme) · #37 (auth API) · #44 (RBAC + proje API) |
| Makine tarafından okunur hali | `server/src/docs/openapi.yaml` · çalışırken **http://localhost:5000/api/docs** |
| Dondurma | Sprint 2 sonunda Hakan tarafından (#33). Sonraki değişiklikler PR açıklamasında belirtilir. |

## 1. Ortak yanıt formatı

Başarılı:

```json
{ "data": { "id": 1, "name": "Hakan Koço" } }
```

Hata:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Gönderilen veriler geçersiz.",
    "details": [{ "field": "email", "message": "Geçerli bir e-posta adresi girin." }]
  }
}
```

| HTTP | `code` | Ne zaman |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Girdi doğrulaması başarısız (`details` alan bazlı) |
| 400 | `INVALID_JSON` | İstek gövdesi bozuk JSON |
| 401 | `UNAUTHORIZED` | Token yok, geçersiz, süresi dolmuş; yanlış e-posta/şifre |
| 403 | `FORBIDDEN` | Giriş yapılmış ama rolün bu işlem için izni yok (RBAC, #44) |
| 404 | `NOT_FOUND` | Kayıt veya uç nokta yok |
| 409 | `CONFLICT` | Tekil alan çakışması (ör. kayıtlı e-posta) |
| 413 | `PAYLOAD_TOO_LARGE` | İstek gövdesi 1 MB sınırını aşıyor |
| 429 | `TOO_MANY_REQUESTS` | Aynı IP'den 15 dk içinde 5 başarısız giriş (SRS 4.2); `Retry-After` başlığı |
| 500 | `INTERNAL_ERROR` | Beklenmeyen hata — ayrıntı istemciye gönderilmez, sunucu loguna yazılır |
| 503 | `SERVICE_UNAVAILABLE` | Veri tabanına ulaşılamıyor (`/api/health`) |

**Backend'de kullanım:** hatalar `throw AppError.badRequest(...)`, `AppError.notFound(...)` vb. ile fırlatılır;
`errorHandler` middleware'i bunları yukarıdaki formata çevirir. Controller'larda `res.status(4xx)` yazılmaz.

**Frontend'de kullanım:** `response.error.code` ile dallanılır, `message` kullanıcıya gösterilir, `details` form
alanlarının altına yazılır.

## 2. Kimlik doğrulama

- `POST /api/auth/login` → `{ data: { user, token } }`
- Sonraki isteklerde: `Authorization: Bearer <token>` (JWT, 8 saat)
- Token içeriği: `sub` (kullanıcı id), `role` (`Yönetici` | `Ekip Üyesi`)
- Parola kuralı (SRS FR-01): en az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter. Özet: bcrypt, maliyet 12.
- Giriş deneme sınırı (SRS 4.2): IP başına 15 dakikada 5 başarısız deneme → 429.
- **Açık karar (SRS FR-02):** SRS 1 saatlik access + 7 günlük refresh token istiyor; şu an 8 saatlik tek token var. Ön yüzle birlikte karar verilecek.

## 3. Yetkilendirme (RBAC, #44)

- `authorize('izin')` middleware'i rolün izinlerini **her istekte** `roles.permissions` (JSONB) alanından okur.
  Rol değişikliği kullanıcının mevcut token'ıyla hemen geçerli olur; silinmiş kullanıcının token'ı 401 alır.
- Kullanılan izinler (seed): `user:manage` (kullanıcı listesi/ekleme/rol), `project:create`, `project:update`
  (güncelleme ve üye ekleme/çıkarma), `project:delete`.
- Görünürlük: `project:update` iznine sahip rol (Yönetici) tüm projeleri görür; diğerleri yalnız üyesi olduklarını.
  Üye olmayan kullanıcı proje detayında **404** alır (projenin varlığı sızdırılmaz).
- Projeyi oluşturan, projenin sahibi (`owner_id`) ve üyesi olur.
- Tarihler `YYYY-AA-GG` metni olarak döner (saat dilimi kayması yok); istekteki boş metin `null` sayılır.

## 4. Uç noktalar

✅ uygulandı · 📝 sözleşme taslağı (uygulanacağı kart)

| Yöntem | Yol | Açıklama | Durum |
|---|---|---|---|
| GET | `/api/health` | Servis + VT durumu | ✅ |
| POST | `/api/auth/register` | Kayıt (varsayılan rol: Ekip Üyesi) | ✅ #37 |
| POST | `/api/auth/login` | Giriş | ✅ #37 |
| GET | `/api/auth/me` | Oturumdaki kullanıcı | ✅ #37 |
| GET | `/api/users` | Kullanıcı listesi (Yönetici) | ✅ #37, #44 |
| POST | `/api/users` | Kullanıcı ekle, rol verilebilir (Yönetici) | ✅ #44 |
| GET | `/api/users/:id` | Kullanıcı detayı | ✅ #37 |
| PATCH | `/api/users/:id/role` | Rol ata (Yönetici; kendi rolü değiştirilemez) | ✅ #44 |
| GET/POST | `/api/projects` | Projeler (Yönetici tümü, Ekip Üyesi üyesi olduğu) / proje oluştur (Yönetici) | ✅ #44 |
| GET/PATCH/DELETE | `/api/projects/:id` | Proje detay + üyeler / güncelle / sil (Yönetici) | ✅ #44 |
| POST | `/api/projects/:id/members` | Üye ekle (Yönetici) | ✅ #44 |
| DELETE | `/api/projects/:id/members/:userId` | Üye çıkar (Yönetici) | ✅ #44 |
| GET/POST | `/api/projects/:id/tasks` | Görevler (durum/kişi/tarih filtresi) / oluştur | 📝 #51 |
| PATCH/DELETE | `/api/tasks/:id` | Görev güncelle (durum → geçmiş kaydı) / sil | 📝 #51 |
| GET/POST | `/api/tasks/:id/comments` | Yorumlar | 📝 #51 |
| GET/POST | `/api/projects/:id/files` | Dosyalar / yükle | 📝 #58 |
| GET | `/api/files/:id/download` | İndir | 📝 #58 |
| GET | `/api/projects/:id/reports/progress` | İlerleme % ve kişi bazlı | 📝 #65 |
| GET | `/api/projects/:id/reports/periodic?period=` | Günlük/haftalık/aylık | 📝 #65 |

İstek/yanıt örnekleri ve şemalar için Swagger UI'a bakın.

## 5. Örnek istekler

```bash
# Giriş
curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"hakan@sektech.com","password":"Password123!"}'

# Oturumdaki kullanıcı
curl -s http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
```
