# Test Raporu — v1 (Sürüm Adayı)

| | |
|---|---|
| Proje | SEK TECH · Proje Yönetim Sistemi |
| Kart | #74 · Sprint 7 ("Tam regresyon ve Test Raporu v1") · M5 |
| Sorumlu | Utku Uzun (Test Uzmanı / CI Sorumlusu) |
| Onay | Hakan Koço (Proje Yöneticisi) |
| Sürüm | RC etiketi ⏳ · `main` @ ⏳ *(RC atılınca doldurulacak)* |
| Önceki sürüm | `v0.5` · `main` @ `edb4118` (22 Kasım 2026, ara demo) |
| Test dönemi | 23 – 29 Kasım 2026 (H8) |
| İlgili | [Test Planı](test-plani.md) · [Test Stratejisi](test-stratejisi.md) · [Regresyon Listesi](regresyon-listesi.md) · [Kapsam Raporu](kapsam-raporu.md) · [Test Turu #1](test-turlari/tur-01.md) |

> **Durum: İSKELET.** Bu belge RC haftası boyunca doldurulur. `⏳` ile işaretli hücreler RC ölçümünü bekler.
> v0.5 sütunları 22 Kasım ölçümüdür ve karşılaştırma için tutulur.

## 1. Özet ve RC kararı

| Çıkış kriteri ([Test Planı §5](test-plani.md)) | Durum | Kanıt |
|---|---|---|
| Kritik ve Yüksek önemde açık hata yok | ⏳ | §6 |
| Orta önemdeki açık hatalar için karar verilmiş | ⏳ | §6.3 |
| Tam regresyon geçti (otomatik + manuel) | ⏳ | §3, §4 |
| Smoke testi yayın ortamında geçti | ⏳ | §5.1 |
| Temel performans ölçüldü | ⏳ | §5.2 |
| Sistem yayın ortamında çalışıyor (Buğra) | ⏳ | §5.1 |

**Karar:** ⏳ *RC uygun / koşullu uygun / uygun değil + gerekçe*

## 2. Kapsam ve ortam

**Test edilen:** M1 Proje & Görev, M2 Kullanıcı & Rol, M3 Takvim & Kanban & Gantt, M4 Dosya & Yorum, M5 Raporlama (#64, #65, #66).
**Test edilmeyen:** WON'T maddeleri; COULD maddeleri ([Test Planı §1](test-plani.md)); yük/stres testi (yalnız temel yanıt süresi).

| Ortam | Sürüm | Ne koşuldu |
|---|---|---|
| CI (GitHub Actions) | ⏳ RC commit | Birim, API, istemci bileşen, Docker Compose smoke, E2E |
| Yerel | ⏳ | Kapsam ölçümü, performans ölçümü |
| Staging (`docker-compose.staging.yml`) | ⏳ | Manuel regresyon (§7 maddeleri), UAT |
| Yayın (production) | ⏳ | Smoke |

**Tarayıcılar:** Chrome ⏳, Firefox ⏳ · **Ekranlar:** 1920×1080 ⏳, 1366×768 ⏳, tablet 768 px ⏳

## 3. Otomatik testler

### 3.1 Koşulan / geçen / başarısız

| Katman | Araç | v0.5 (22 Kasım) | RC: koşulan | Geçen | Başarısız | Atlanan / todo |
|---|---|---|---|---|---|---|
| Sunucu birim + API | Jest + Supertest | 215 geçti, 7 todo | ⏳ | ⏳ | ⏳ | ⏳ |
| ↳ Rapor doğruluğu (`reports.api.test.js`, #144) | Jest + Supertest | — (yazıldı, #65 bekliyor) | ⏳ | ⏳ | ⏳ | ⏳ |
| İstemci bileşen | Vitest + Testing Library | 92 geçti | ⏳ | ⏳ | ⏳ | ⏳ |
| Docker Compose smoke | `scripts/compose-smoke.mjs` | geçti | ⏳ | ⏳ | ⏳ | — |
| E2E | Playwright (Chromium) | 20 geçti, 6 dosya | ⏳ | ⏳ | ⏳ | ⏳ |
| **Toplam** | | **327 + smoke** | ⏳ | ⏳ | ⏳ | ⏳ |

CI çalışması: ⏳ *bağlantı* · Artefaktlar: `coverage-server`, `playwright-report`

### 3.2 Kapsam

| Katman | v0.5 satır | RC satır | RC dal | Hedef |
|---|---|---|---|---|
| Sunucu (`server/src`) | %97,7 | ⏳ | ⏳ | ≥ %90 |
| İstemci (`client/src`) | %86,6 | ⏳ | ⏳ | — (izleniyor) |

Ayrıntı: [Kapsam Raporu](kapsam-raporu.md).

### 3.3 Kararsız (flaky) testler

| Test | Belirti | Kök neden | Çözüm |
|---|---|---|---|
| Giriş rate-limit (R-AUTH-07) | Yavaş makinede ara sıra 429 yerine 401 | Test, sabit zaman penceresine sığmıyordu; uygulama hatası değil | Pencere genişletildi (#139) |
| ⏳ | | | |

## 4. Regresyon sonuçları

Liste: [Regresyon Listesi](regresyon-listesi.md). Sonuç: ✅ geçti · ❌ kaldı (hata no) · ⏸ bloke · — koşulmadı

| Alan | Senaryo sayısı | Otomatik | Manuel | ✅ | ❌ | ⏸ | Not |
|---|---|---|---|---|---|---|---|
| 1. Altyapı ve kurulum | 4 | 4 | 0 | ⏳ | ⏳ | ⏳ | |
| 2. Kimlik doğrulama | 7 | 7 | 0 | ⏳ | ⏳ | ⏳ | |
| 3. Roller ve yetki | 6 | 6 | 0 | ⏳ | ⏳ | ⏳ | |
| 4. Projeler ve üyelik | 4 | 4 | 0 | ⏳ | ⏳ | ⏳ | |
| 5. Görevler, Kanban, yorumlar | 12 | 12 | 0 | ⏳ | ⏳ | ⏳ | R-YRM-03 E2E + manuel |
| 6a. Takvim / Gantt | TS-TKV-01…03, TS-GNT-01 | ✅ | — | ⏳ | ⏳ | ⏳ | |
| 6b. Dosyalar | TS-DSY-01…04 | ✅ | — | ⏳ | ⏳ | ⏳ | |
| 6c. Raporlar | R-01…R-07 | API ✅ (#144), E2E ⏳ (#64) | ⏳ | ⏳ | ⏳ | ⏳ | #143 kabul planı |
| 7. Manuel kontroller | 4 | — | 4 | ⏳ | ⏳ | ⏳ | §4.1 |

### 4.1 Manuel kontroller

| ID | Kontrol | Chrome | Firefox | Not |
|---|---|---|---|---|
| R-M-01 | Görsel tutarlılık, responsive (1366, 1920, tablet 768) | ⏳ | ⏳ | |
| R-M-02 | Klavye ile gezinme, odak görünürlüğü, renk kontrastı | ⏳ | ⏳ | |
| R-M-03 | Boş / yükleniyor / hata durumları (her ekran) | ⏳ | ⏳ | |
| R-M-04 | Sunum senaryosu baştan sona | ⏳ | — | |

### 4.2 Kullanıcı kabul testleri (Abdulkahhar)

| Kapsam | Sonuç | Kaynak |
|---|---|---|
| MVP akışı | ✅ | #136 (`docs/uat/`) |
| Takvim, dosya, kılavuz | ✅ | #137 |
| Raporlama modülü (R-01…R-07) | ⏳ | #143 kabul planı |

## 5. Smoke ve temel performans

### 5.1 Smoke

| # | Kontrol | Yerel / CI | Staging | Yayın |
|---|---|---|---|---|
| S-01 | `docker compose up --build` sonrası VT, API, arayüz sağlıklı | ⏳ | ⏳ | ⏳ |
| S-02 | `/api/health` 200, VT bağlantısı var | ⏳ | ⏳ | ⏳ |
| S-03 | Yönetici girişi → proje listesi | ⏳ | ⏳ | ⏳ |
| S-04 | Görev oluştur → Kanban'da taşı → yenile, kalıcı | ⏳ | ⏳ | ⏳ |
| S-05 | Dosya yükle → indir | ⏳ | ⏳ | ⏳ |
| S-06 | Rapor ekranı açılır, sayılar seed ile tutarlı | ⏳ | ⏳ | ⏳ |
| S-07 | Swagger `/api/docs` açılır | ⏳ | ⏳ | ⏳ |

### 5.2 Temel performans

SRS v1.1 §4.1'e göre 50 kullanıcı / 200 ms hedefleri dönem sonrası kapasite hedefidir. Bu dönem için ölçüt
[Test Stratejisi](test-stratejisi.md)'ndeki "rapor uç noktaları seed verisiyle < 1 sn" ve TS-RPR-05'tir.
Ek olarak SRS'in istediği ölçüm koşulları kayda geçirilir.

Araç: `scripts/perf-smoke.mjs`. Geçici bir proje ve görev veri seti oluşturur, uç noktaları ölçer, sonra projeyi siler.
Çıktısı bu bölüme yapıştırılacak Markdown tablosudur. Ölçüm koşullarını (donanım, veri seti, eşzamanlılık, tekrar) kendisi yazar.
Giriş her zaman sıralı ölçülür (bkz. §6.2, #146).

**Ölçüm koşulları:** ⏳ *(betik çıktısı)*

**Ön ölçüm (23 Kasım, yerel Docker Compose, i7-13700H):** 200 görev ve tek istemciyle tüm uç noktalarda p95 ≤ 66 ms
(en yavaşı bcrypt nedeniyle giriş). 500 görev ve 10 eşzamanlı istemciyle p95 ≤ 84 ms. İstemci paketi gzip ile 114 KB.
Rapor uç noktaları henüz yok (#65).

| Uç nokta | Hedef | p50 | p95 | Maks | Sonuç |
|---|---|---|---|---|---|
| `POST /api/auth/login` | < 1 sn | ⏳ | ⏳ | ⏳ | ⏳ |
| `GET /api/projects` | < 1 sn | ⏳ | ⏳ | ⏳ | ⏳ |
| `GET /api/projects/:id/tasks` (filtreli) | < 1 sn | ⏳ | ⏳ | ⏳ | ⏳ |
| `PATCH /api/tasks/:id` (durum) | < 1 sn | ⏳ | ⏳ | ⏳ | ⏳ |
| `GET /api/projects/:id/reports/progress` | < 1 sn (TS-RPR-05) | ⏳ | ⏳ | ⏳ | ⏳ |
| `GET /api/projects/:id/reports/range` | < 1 sn (TS-RPR-05) | ⏳ | ⏳ | ⏳ | ⏳ |

| İstemci | Hedef | Ölçülen |
|---|---|---|
| Üretim paketi (gzip) | ≤ 2 MB (SRS §4.1) | ⏳ |

## 6. Hata istatistikleri

Kaynak: GitHub Issues, `bug` etiketi ([Test Planı §7](test-plani.md)). Sayım tarihi: 24 Kasım 2026 · RC sayımı ⏳

### 6.1 Önem ve duruma göre

| Önem | Açılan | Kapanan | Açık |
|---|---|---|---|
| Kritik | 0 | 0 | 0 |
| Yüksek | 2 | 2 | 0 |
| Orta | 3 | 2 | 1 (#146) |
| Düşük | 1 | 1 | 0 |
| **Toplam** | **6** | **5** | **1** |

### 6.2 Hata listesi

| # | Başlık | Önem | Modül | Bulan | Açılış | Kapanış | Süre | Düzelten PR | Regresyon testi |
|---|---|---|---|---|---|---|---|---|---|
| #104 | Ekip Üyesi tüm kullanıcı listesini görebiliyor (RBAC eksik) | Yüksek | Kullanıcılar | Tur #1 | 29 Eki | 30 Eki | 1 gün | #109 | R-ROL-04 |
| #110 | `GET /api/users/:id` ile Ekip Üyesi başkasının e-postasını görüyor | Yüksek | Kullanıcılar | #109 incelemesi | 30 Eki | 1 Kas | 2 gün | #124 | R-ROL-04 |
| #102 | `GET /api/users/:id` büyük sayıda 500 dönüyor | Orta | Kullanıcılar | Tur #1 | 29 Eki | 30 Eki | 1 gün | #108 | API |
| #103 | 1 MB üstü gövde 413 yerine 500 dönüyor | Orta | Altyapı | Tur #1 | 29 Eki | 30 Eki | 1 gün | #108 | R-INF-04 |
| #105 | Dizi gövdede doğrulama mesajı İngilizce | Düşük | Altyapı | Tur #1 | 29 Eki | 30 Eki | 1 gün | #108 | API |
| #146 | Aynı IP'den eşzamanlı **başarılı** girişler giriş kilidini tetikliyor: 5'ten fazla eşzamanlı istekte 429, ardından doğru parola da 15 dk 429 | Orta | Kimlik doğrulama | Performans ölçümü | 23 Kas | | | | |
| ⏳ | *RC haftası bulguları* | | | | | | | | |

**Özet:** Ortalama kapanma süresi 1,2 gün. 5 hatanın 5'i için regresyon testi var. Yüksek önemdeki iki hata da
yetki (veri sızıntısı) sınıfında, ikisi de API testleriyle kalıcı olarak korunuyor. ⏳ *RC sonrası güncellenecek.*

### 6.3 Açık hatalar ve kararlar

| # | Önem | Karar (düzelt / ertele / kabul et) | Gerekçe | Karar veren |
|---|---|---|---|---|
| ⏳ | | | | Hakan |

### 6.4 Süreç bulguları (hata dışı)

| Bulgu | Etki | Önlem |
|---|---|---|
| PR dalı eski develop'a dayanınca onaylar "merge-base changed" ile düşüyordu | M3 zinciri 1 gün gecikti | "Update branch" açıldı (22 Kasım). PR sahibi dalını güncelliyor, sonra başkası onaylıyor |
| #137'deki kılavuz, var olmayan bir uç noktayı anlatıyordu | Belge hatası, kodda değil | İncelemede yakalandı, 2abb86a ile düzeltildi |
| ⏳ | | |

## 7. Bilinen sınırlamalar ve riskler

| Konu | Açıklama |
|---|---|
| Tarayıcı | E2E yalnız Chromium'da koşuyor; Firefox manuel (R-M-01) |
| Performans | Yük/stres testi kapsam dışı; yalnız tek kullanıcılı yanıt süresi |
| İstemci kapsamı | CI'da ölçülmüyor, yerel ölçüm |
| ⏳ | |

## 8. Ekler

- CI çalışması (RC): ⏳
- Playwright raporu artefaktı: ⏳
- Kapsam artefaktı: ⏳
- Performans ham çıktısı: ⏳
