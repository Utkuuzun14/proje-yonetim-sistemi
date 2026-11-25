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
> v0.5 sütunları 22 Kasım ölçümüdür ve karşılaştırma için tutulur. "RC öncesi" sütunları 25 Kasım'da develop `cfb6e0c` üzerinde
> koşulan tam otomatik regresyondur (rapor modülü hariç). RC'de yalnız rapor modülü eklenip kısa tekrar koşulacak.

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
| Yerel (Docker Compose, Windows 11) | develop `cfb6e0c` (25 Kasım, RC öncesi) · RC ⏳ | Tüm otomatik katmanlar, kapsam, performans |
| Staging (`docker-compose.staging.yml`) | ⏳ | Manuel regresyon (§7 maddeleri), UAT |
| Yayın (production) | ⏳ | Smoke |

**Tarayıcılar:** Chrome ⏳, Firefox ⏳ · **Ekranlar:** 1920×1080 ⏳, 1366×768 ⏳, tablet 768 px ⏳

## 3. Otomatik testler

### 3.1 Koşulan / geçen / başarısız

| Katman | Araç | v0.5 (22 Kasım) | RC öncesi (25 Kasım) | RC: koşulan | Geçen | Başarısız | Atlanan / todo |
|---|---|---|---|---|---|---|---|
| Sunucu birim + API | Jest + Supertest | 215 geçti, 7 todo | 215/215 geçti, 7 todo (14 dosya) | ⏳ | ⏳ | ⏳ | ⏳ |
| ↳ Rapor doğruluğu (`reports.api.test.js`, #144) | Jest + Supertest | — (yazıldı, #65 bekliyor) | — (#65 yok) | ⏳ | ⏳ | ⏳ | ⏳ |
| İstemci bileşen | Vitest + Testing Library | 92 geçti | 92/92 geçti (10 dosya) | ⏳ | ⏳ | ⏳ | ⏳ |
| Docker Compose smoke | `scripts/compose-smoke.mjs` | geçti | 2/2 adım geçti | ⏳ | ⏳ | ⏳ | — |
| E2E | Playwright (Chromium) | 20 geçti, 6 dosya | 18/20 → düzeltmeyle 20/20 (#147, §3.3) | ⏳ | ⏳ | ⏳ | ⏳ |
| **Toplam** | | **327 + smoke** | **327/327 + smoke** (2 test düzeltmesiyle) | ⏳ | ⏳ | ⏳ | ⏳ |

CI çalışması (RC): ⏳ *bağlantı* · Artefaktlar: `coverage-server`, `playwright-report`

### 3.2 Kapsam

| Katman | v0.5 satır | RC öncesi satır / dal | RC satır | RC dal | Hedef |
|---|---|---|---|---|---|
| Sunucu (`server/src`) | %97,7 | %97,7 / %87,6 | ⏳ | ⏳ | ≥ %90 |
| İstemci (`client/src`) | %86,6 | %86,7 / %81,6 | ⏳ | ⏳ | — (izleniyor) |

Ayrıntı: [Kapsam Raporu](kapsam-raporu.md).

### 3.3 Kararsız (flaky) testler

| Test | Belirti | Kök neden | Çözüm |
|---|---|---|---|
| Giriş rate-limit (R-AUTH-07) | Yavaş makinede ara sıra 429 yerine 401 | Test, sabit zaman penceresine sığmıyordu; uygulama hatası değil | Pencere genişletildi (#139) |
| Kanban sürükle-bırak (TS-KNB-01/02) | Yerelde (Windows) her seferinde zaman aşımı, PATCH gitmiyor. CI'da (Linux) geçiyor | `dragTo` sütunun ortasına bırakıyor. Windows yazı tiplerinde sütun 720 px görünümden uzun, orta nokta ekran dışında kalıyor. Uygulama hatası değil (1400 px görünümde değişikliksiz geçti) | Sütunun üst kısmına bırakılıyor (#147). 3 tekrarda 6/6, tüm E2E 20/20 |
| ⏳ | | | |

## 4. Regresyon sonuçları

Liste: [Regresyon Listesi](regresyon-listesi.md). Sonuç: ✅ geçti · ❌ kaldı (hata no) · ⏸ bloke · — koşulmadı

| Alan | Senaryo sayısı | Otomatik | Manuel | ✅ | ❌ | ⏸ | Not |
|---|---|---|---|---|---|---|---|
| 1. Altyapı ve kurulum | 4 | 4 | 0 | 4 | 0 | 0 | RC öncesi |
| 2. Kimlik doğrulama | 7 | 7 | 0 | 7 | 0 | 0 | RC öncesi · eşzamanlı giriş bulgusu #146 listede yoktu, R-AUTH-08 olarak eklenecek |
| 3. Roller ve yetki | 6 | 6 | 0 | 6 | 0 | 0 | RC öncesi |
| 4. Projeler ve üyelik | 4 | 4 | 0 | 4 | 0 | 0 | RC öncesi |
| 5. Görevler, Kanban, yorumlar | 12 | 12 | 0 | 12 | 0 | 0 | RC öncesi · R-KNB-01/02 #147 ile · R-YRM-03 manuel kısmı ⏳ |
| 6a. Takvim / Gantt | TS-TKV-01…03, TS-GNT-01 | ✅ | — | 4 | 0 | 0 | RC öncesi |
| 6b. Dosyalar | TS-DSY-01…04 | ✅ | — | 4 | 0 | 0 | RC öncesi |
| 6c. Raporlar | R-01…R-07 | API ✅ (#144), E2E ⏳ (#64) | ⏳ | — | — | 7 | #65 bekleniyor · #143 kabul planı |
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
| S-01 | `docker compose up --build` sonrası VT, API, arayüz sağlıklı | ✅ | ⏳ | ⏳ |
| S-02 | `/api/health` 200, VT bağlantısı var | ✅ | ⏳ | ⏳ |
| S-03 | Yönetici girişi → proje listesi | ✅ | ⏳ | ⏳ |
| S-04 | Görev oluştur → Kanban'da taşı → yenile, kalıcı | ✅ (E2E) | ⏳ | ⏳ |
| S-05 | Dosya yükle → indir | ✅ (E2E) | ⏳ | ⏳ |
| S-06 | Rapor ekranı açılır, sayılar seed ile tutarlı | ⏸ #64 | ⏳ | ⏳ |
| S-07 | Swagger `/api/docs` açılır | ✅ | ⏳ | ⏳ |

### 5.2 Temel performans

SRS v1.1 §4.1'e göre 50 kullanıcı / 200 ms hedefleri dönem sonrası kapasite hedefidir. Bu dönem için ölçüt
[Test Stratejisi](test-stratejisi.md)'ndeki "rapor uç noktaları seed verisiyle < 1 sn" ve TS-RPR-05'tir.
Ek olarak SRS'in istediği ölçüm koşulları kayda geçirilir.

Araç: `scripts/perf-smoke.mjs`. Geçici bir proje ve görev veri seti oluşturur, uç noktaları ölçer, sonra projeyi siler.
Çıktısı bu bölüme yapıştırılacak Markdown tablosudur. Ölçüm koşullarını (donanım, veri seti, eşzamanlılık, tekrar) kendisi yazar.
Giriş her zaman sıralı ölçülür (bkz. §6.2, #146).

#### RC öncesi ölçüm (25 Kasım, develop `cfb6e0c`, yerel Docker Compose)

**Ölçüm koşulları:** 2026-11-25 15:41 UTC · http://localhost:5000 · Windows_NT 10.0.26200 · 20 × 13th Gen Intel(R) Core(TM) i7-13700H · 15.6 GB RAM · Node v24.21.0
· veri seti: 200 görevli geçici proje + seed verisi · 50 ölçüm/uç nokta, 5 ısınma · eşzamanlı istemci: 1 · araç: `scripts/perf-smoke.mjs`

| Uç nokta | Hedef | p50 (ms) | p95 (ms) | Maks (ms) | İstek/sn | Sonuç |
|---|---|---|---|---|---|---|
| `POST /api/auth/login (sıralı)` | < 1 sn | 118 | 134.4 | 146.9 | 8.4 | ✅ |
| `GET /api/auth/me` | < 1 sn | 7 | 9.7 | 14.4 | 135.5 | ✅ |
| `GET /api/projects` | < 1 sn | 7.5 | 9.3 | 9.7 | 131.3 | ✅ |
| `GET /api/projects/:id` | < 1 sn | 8.8 | 10.9 | 15.2 | 110.1 | ✅ |
| `GET /api/projects/:id/tasks (200 görev)` | < 1 sn | 11.2 | 17.1 | 19 | 80.9 | ✅ |
| `GET /api/projects/:id/tasks (durum + kişi + tarih filtresi)` | < 1 sn (FR-09) | 5.6 | 9.2 | 11.1 | 164.6 | ✅ |
| `PATCH /api/tasks/:id (durum)` | < 1 sn | 10.2 | 12.6 | 13 | 99.8 | ✅ |
| `GET /api/tasks/:id/history` | < 1 sn | 4.3 | 8 | 14.3 | 204.5 | ✅ |

| İstemci | Hedef | Ölçülen |
|---|---|---|
| Üretim paketi (4 dosya, gzip) | ≤ 2 MB (SRS §4.1) | 114.1 KB (ham 373.8 KB) ✅ |

- GET /api/projects/:id/reports/progress: uç nokta yok (404), ölçülmedi — #65 birleşince tekrar koşulacak.
- GET /api/projects/:id/reports/range: uç nokta yok (404), ölçülmedi — #65 birleşince tekrar koşulacak.

Ek ölçüm (23 Kasım): 500 görev ve 10 eşzamanlı istemciyle girişler hariç tüm uç noktalarda p95 ≤ 84 ms.

#### RC ölçümü

⏳ *staging'de, rapor uç noktaları dahil, betik çıktısı buraya*

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
