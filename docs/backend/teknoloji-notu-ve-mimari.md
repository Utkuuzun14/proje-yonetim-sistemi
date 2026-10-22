# Backend Teknoloji Notu ve Mimari Taslak

| | |
|---|---|
| Proje | SEK TECH · Proje Yönetim Sistemi |
| Kart | #23 · Sprint 0 (Mustafa Şahin – Backend) |
| Durum | v1 — seçim: **Node.js 20 + Express 4 + PostgreSQL 15** (Buğra'nın VT kararı #24 ile uyumlu) |
| İlgili | Yol haritası Bölüm 2.2 ve 11 · `database/` (#88) · `server/` iskeleti (#30) |

> Karar tutanağı (docs/sablonlar/karar-tutanagi.md) henüz doldurulmadığı için bu not, ekibin fiilen
> ilerlediği yığını (Express API + React istemci + PostgreSQL) esas alır. Tutanakta farklı bir karar
> çıkarsa bu not güncellenir.

## 1. Backend seçeneklerinin karşılaştırması

Değerlendirme kriterleri yol haritası Bölüm 11'den: ekibin mevcut deneyimi (tek kişilik BE kadrosu), 9 haftalık
takvime uyum, frontend ile uyum ve test/CI kolaylığı.

| Kriter | Node.js + Express | Django (+ DRF) | Spring Boot |
|---|---|---|---|
| Dil | JavaScript (FE ile aynı) | Python | Java |
| Öğrenme eğrisi | **Düşük** | Orta | Yüksek |
| Proje başlangıç hızı | **Çok hızlı**, az kalıp kod | Hızlı (admin paneli hazır) | Yavaş, çok yapılandırma |
| Hazır gelenler | Az (kütüphane seçilir) | ORM, admin, auth, migration | ORM (JPA), güvenlik, DI |
| PostgreSQL desteği | `pg` sürücüsü, ham SQL veya ORM | Birinci sınıf | Birinci sınıf |
| Test araçları | Jest + Supertest | pytest + APIClient | JUnit + MockMvc |
| FE ile kod/bilgi paylaşımı | **Evet** (ortak dil, ortak doğrulama şemaları) | Hayır | Hayır |
| Docker imaj boyutu / açılış | Küçük / hızlı | Orta | Büyük / yavaş |
| Risk | Yapı disiplini ekibe kalır | Ekipte Python deneyimi sınırlı | 9 haftada öğrenme süresi takvimden yer |

**Öneri ve seçim: Node.js + Express.**
Frontend React ile aynı dil olduğu için Ümit Efe ve Mustafa birbirinin koduna destek verebilir; kurulum ve
CI en hızlısı. "Hazır gelenler azdır" riskini §2'deki katmanlı yapı ve ortak hata standardıyla kapatıyoruz.

## 2. Yüksek seviye mimari

```
 React (client/)                         Express API (server/)                         PostgreSQL 15
┌──────────────┐  HTTPS/JSON   ┌───────────────────────────────────────────┐   pg   ┌──────────────┐
│ Sayfalar     │ ────────────► │ routes → middleware → controller          │ ─────► │ database/    │
│ API istemcisi│  Bearer JWT   │                         ↓                 │        │ init.sql     │
└──────────────┘ ◄──────────── │                      service (iş kuralı)  │        │ seed.sql     │
                  { data } /   │                         ↓                 │        └──────────────┘
                  { error }    │                      repository (SQL)     │
                               └───────────────────────────────────────────┘
                                 /api/docs → Swagger UI (OpenAPI 3)
```

### Katmanlar

| Katman | Sorumluluk | Kural |
|---|---|---|
| **routes** | URL ↔ controller eşlemesi, middleware zinciri | İş mantığı yok |
| **middleware** | Kimlik doğrulama (JWT), yetki (RBAC, #44), girdi doğrulama, hata yakalama | Tekrar kullanılabilir |
| **controller** | HTTP isteğini okur, servisi çağırır, yanıtı `{ data }` olarak döner | SQL yok, iş kuralı yok |
| **service** | İş kuralları (ör. e-posta tekil mi, şifre doğru mu, ilerleme % hesabı) | HTTP bilmez → kolay birim testi |
| **repository** | Parametreli SQL sorguları (`pg`) | Yalnızca veri erişimi |

### Modüller (yol haritası Bölüm 2.2 ile eşleşme)

| Backend modülü | Ürün modülü | Sprint |
|---|---|---|
| `auth`, `users` | M2 Kullanıcı & Rol | S2 (#37), S3 (#44) |
| `projects` (+ üyelik) | M1 Proje | S3 (#44) |
| `tasks`, `comments` | M1 Görev, M4 Yorum | S4 (#51) |
| `files`, takvim sorguları | M3, M4 | S5 (#58) |
| `reports` | M5 Raporlama | S6 (#65) |

### Klasör yapısı

```
server/
├── src/
│   ├── app.js                 # Express uygulaması (test edilebilir, listen yok)
│   ├── server.js              # Giriş noktası (listen)
│   ├── config/                # Ortam değişkenleri
│   ├── db/                    # pg bağlantı havuzu
│   ├── middleware/            # authenticate, validate, errorHandler, notFound
│   ├── utils/                 # AppError, yardımcılar
│   ├── docs/openapi.yaml      # API sözleşmesi (Swagger UI: /api/docs)
│   └── modules/<modül>/       # *.routes.js · *.controller.js · *.service.js · *.repository.js
└── tests/                     # unit/ (servisler) · api/ (Supertest + gerçek PostgreSQL)
```

## 3. Kimlik doğrulama yaklaşımı

| Yaklaşım | Artı | Eksi |
|---|---|---|
| Sunucu oturumu (session + cookie) | Oturum anında iptal edilebilir | Sunucuda oturum deposu gerekir; ayrı FE/BE portlarında CORS + cookie ayarı zahmetli |
| **JWT (Bearer token)** | Durumsuz, ölçeklenmesi kolay; React'ten `Authorization` başlığıyla basit kullanım; test etmesi kolay | Süresi dolmadan iptal zor → kısa süre (ör. 8 saat) ile sınırlanır |
| OAuth / harici sağlayıcı | Şifre saklanmaz | Kapsam dışı, kurulum maliyeti yüksek |

**Seçim: JWT (HS256); şifreler bcrypt (maliyet 12, SRS FR-02) ile özetlenir.** Şu an 8 saatlik tek token
kullanılıyor; SRS'teki 1 saatlik access + 7 günlük refresh token modeli ön yüzle birlikte değerlendirilecek.
Giriş uç noktasında IP başına 15 dakikada 5 başarısız deneme sınırı uygulanır (SRS 4.2).
Token içeriği: `sub` (kullanıcı id), `role`. Rol bazlı yetki (RBAC) Sprint 3'te (#44) `authorize(...)`
middleware'i ile eklenecek; roller ve izinler `roles.permissions` (JSONB) alanından okunur.

## 4. Ortak standartlar

- **Başarılı yanıt:** `{ "data": … }`
- **Hata yanıtı:** `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [ … ] } }`
- **Durum kodları:** 200/201 başarı · 400 doğrulama · 401 kimlik yok/geçersiz · 403 yetki yok · 404 bulunamadı ·
  409 çakışma · 500 sunucu hatası (ayrıntı istemciye sızdırılmaz)
- Ayrıntılar ve uç nokta listesi: [API sözleşmesi](api-sozlesmesi.md) ve `server/src/docs/openapi.yaml`.
