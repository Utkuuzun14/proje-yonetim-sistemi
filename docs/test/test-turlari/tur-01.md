# Test Turu #1 — Kimlik doğrulama (uçtan uca + API keşif testi)

| | |
|---|---|
| Kart | #46 · Sprint 3 ("İlk manuel test turu ve hata kayıtları") |
| Test eden | Utku Uzun |
| Tarih | 26 Ekim 2026 (arayüz, uçtan uca) · 29 Ekim 2026 (API keşif testi) |
| Sürüm | `develop` @ `819966f` · arayüz: PR #93 (`feature/36-frontend-temeli`) |
| Ortam | Yerel: PostgreSQL 16 (init + seed), API (Node 22), Vite geliştirme sunucusu, Chromium (Playwright) |
| Kapsam | US-01 kayıt/giriş · SRS FR-01/02, 4.2 · test planı giriş kriterleri sağlandı (CI yeşil, seed yüklü) |

## 1. Uçtan uca arayüz turu (26 Ekim)

| # | Senaryo | İlgili | Sonuç |
|---|---|---|---|
| 1 | Zayıf şifreyle kayıt | TS-AUTH-09 | ✅ Kayıt sayfasında kalır, kural mesajı görünür |
| 2 | Geçerli kayıt → çalışma alanı | TS-AUTH-01 | ✅ `POST /auth/register` 201, `/uygulama/projeler` |
| 3 | Sayfa yenileme → oturum korunur | TS-AUTH-04 | ✅ `GET /auth/me` 200 |
| 4 | Çıkış → korumalı sayfaya erişim | TS-AUTH-08 | ✅ `/giris`'e yönlenir |
| 5 | Yanlış şifre | TS-AUTH-05 | ✅ 401, "E-posta veya parola hatalı." |
| 6 | Yönetici girişi → rol görünürlüğü | TS-ROL-05 | ✅ "Yeni proje" yalnız Yönetici'de |
| 7 | Proje listesi | TS-PRJ-01 | ⏸ Bloke — `GET /api/projects` 404 (uç noktalar #44'te) |

## 2. API keşif testi (29 Ekim)

| # | Deneme | Beklenen | Gerçekleşen | Sonuç |
|---|---|---|---|---|
| 1 | Ekip Üyesi `GET /api/users` | 403 (FR-03) | 200, tüm kullanıcılar + e-postalar | ❌ **#104** |
| 2 | `GET /api/users/99999999999` | 400/404 | 500 (integer taşması) | ❌ **#102** |
| 3 | `GET /api/users/1e3` | 400/404 | 404 | ✅ |
| 4 | Kayıt gövdesi `[]` | 400, Türkçe mesaj | 400, İngilizce mesaj | ❌ **#105** |
| 5 | Kayıt `text/plain` gövde | 400 | 400, alan hataları | ✅ |
| 6 | Ad yalnız boşluk | 400 | 400 | ✅ |
| 7 | Ad `<script>alert(1)</script>` | Kaydedilir, arayüzde çalışmaz | 201, ham metin saklanır | ✅ ⚠ not 1 |
| 8 | 73 karakter şifre (bcrypt sınırı) | 400 | 400 | ✅ |
| 9 | 101 karakter e-posta | 400 | 400 | ✅ |
| 10 | Kayıtta `"role":"Yönetici"` göndermek | Yok sayılır | Rol "Ekip Üyesi" | ✅ |
| 11 | `Authorization: Bearer ` (boş) | 401 | 401 | ✅ |
| 12 | 1 MB üstü gövde | 413 | 500 | ❌ **#103** |
| 13 | CORS ön kontrolü | — | `Access-Control-Allow-Origin: *` | ✅ ⚠ not 2 |

**Notlar**
1. API metni olduğu gibi saklıyor; React metni kaçışladığı için arayüzde çalışmaz. Görev açıklamalarında Markdown
   render edilirken (US-04) temizleme şart — TS-GRV-09 ile test edilecek.
2. Bearer token kullanıldığı için `*` geliştirme ortamında sorun değil; yayın ortamında `CORS_ORIGIN` arayüz adresine
   kısıtlanmalı (#73 yayın kartına not).

## 3. Özet

| | |
|---|---|
| Koşulan | 20 (7 arayüz + 13 API) |
| Geçen | 15 |
| Kalan (hata) | 4 → #102 (orta), #103 (orta), #104 (yüksek), #105 (düşük) |
| Bloke | 1 (proje listesi → #44) |
| Kritik açık hata | 0 → çıkış kriteri "Sprint sonu: Kritik açık hata yok" sağlandı |

Hatalar backend sahibine (Mustafa) atandı. #104, RBAC ile (#44) kapanacak. Düzeltmeler birleşince ilgili denemeler
tekrar koşulup bu tabloya işlenecek.

## 4. Sonraki tur

#44 birleşince: `projects.rbac.api.test.js` (#101) yeşil mi, arayüzden proje oluşturma/düzenleme ve Ekip Üyesi
403 (TS-ROL-01…05, TS-PRJ-01…04) uçtan uca.
