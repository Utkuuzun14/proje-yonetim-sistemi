# Regresyon Test Listesi

| | |
|---|---|
| Kart | #53 · Sprint 4 ("Regresyon test listesi") |
| Sorumlu | Utku Uzun |
| Güncelleme | Her sprint sonunda; yeni özellik birleşince satır eklenir, hata düzeltilince ilgili senaryo eklenir |
| Kullanım | Sürüm adayı (RC, H8) ve sunum öncesi **tam liste**; her PR'da **otomatik** olanlar CI'da kendiliğinden koşar |

**Seviye:** `API` Jest + Supertest (`server/tests`) · `E2E` Playwright (`e2e/tests`) · `SMK` compose smoke (`scripts/compose-smoke.mjs`) · `M` manuel
**Öncelik:** **Y** her sürümde koşulur · O RC'de koşulur · D zaman kalırsa

## 1. Altyapı ve kurulum

| ID | Senaryo | Seviye | Öncelik | Otomatik? | Kaynak |
|---|---|---|---|---|---|
| R-INF-01 | `docker compose up --build` VT + API + arayüzü kaldırır, sağlık kontrolleri geçer | SMK | Y | ✅ CI | #93, #98 |
| R-INF-02 | Arayüz `/api`'yi aynı origin üzerinden nginx ile backend'e iletir; SPA adresleri yenilenebilir | SMK | Y | ✅ CI | #93 |
| R-INF-03 | Swagger `/api/docs` açılıyor, `openapi.json` geçerli | API | O | ✅ CI | #91 |
| R-INF-04 | 1 MB üstü gövde → 413 | API | O | ✅ CI | #103 |

## 2. Kimlik doğrulama (US-01)

| ID | Senaryo | Seviye | Öncelik | Otomatik? | Kaynak |
|---|---|---|---|---|---|
| R-AUTH-01 | Geçerli kayıt → çalışma alanı, varsayılan rol Ekip Üyesi | API + E2E | Y | ✅ CI | TS-AUTH-01 |
| R-AUTH-02 | Zayıf parola (büyük/küçük/rakam/özel eksik) reddedilir | API + E2E | Y | ✅ CI | TS-AUTH-09 |
| R-AUTH-03 | Doğru giriş; yenilemede oturum korunur | API + E2E | Y | ✅ CI | TS-AUTH-04 |
| R-AUTH-04 | Yanlış parola / olmayan kullanıcı → aynı genel mesaj | API + E2E | Y | ✅ CI | TS-AUTH-05 |
| R-AUTH-05 | Bozuk / süresi dolmuş token → giriş ekranı | API + E2E | Y | ✅ CI | TS-AUTH-07 |
| R-AUTH-06 | Çıkıştan sonra korumalı sayfa açılmaz | E2E | Y | ✅ CI | TS-AUTH-08 |
| R-AUTH-07 | 5 hatalı girişten sonra 429; **nginx arkasında farklı istemciler birbirini kilitlemez** | API + SMK | Y | ✅ CI | TS-AUTH-10, #93 |

## 3. Roller ve yetki (US-02)

| ID | Senaryo | Seviye | Öncelik | Otomatik? | Kaynak |
|---|---|---|---|---|---|
| R-ROL-01 | Ekip Üyesi proje oluşturamaz / düzenleyemez / silemez / üye ekleyemez → 403 | API + SMK | Y | ✅ CI | TS-ROL-01/02, #101 |
| R-ROL-02 | Üye olmayan projeyi listede görmez, adresle açamaz (404, veri sızmaz) | API + E2E | Y | ✅ CI | TS-ROL-04 |
| R-ROL-03 | Arayüz yönetim düğmelerini role göre gizler | E2E | Y | ✅ CI | TS-ROL-05 |
| R-ROL-04 | Ekip Üyesi kullanıcı listesini ve **başkasının detayını** göremez (403) | API | Y | ✅ CI | #104, #110 |
| R-ROL-05 | Yönetici kullanıcı ekler, rol atar; yeni yetki eski token'la hemen geçerli | API | Y | ✅ CI | #109 |
| R-ROL-06 | Yönetici kendi rolünü düşüremez | API | O | ✅ CI | #109 |

## 4. Projeler ve üyelik (US-03)

| ID | Senaryo | Seviye | Öncelik | Otomatik? | Kaynak |
|---|---|---|---|---|---|
| R-PRJ-01 | Yönetici proje oluşturur, kalıcıdır | API + E2E | Y | ✅ CI | TS-PRJ-01 |
| R-PRJ-02 | Bitiş < başlangıç → 400 (API, VT kısıtı ve form) | API + E2E | Y | ✅ CI | TS-PRJ-02, #107 |
| R-PRJ-03 | Üye ekle → görür; tekrar ekleme 409; çıkar → artık göremez | API + SMK | Y | ✅ CI | TS-PRJ-03 |
| R-PRJ-04 | Proje silinince görevleri de silinir | API | O | ✅ CI | TS-PRJ-04 |

## 5. Görevler, Kanban ve yorumlar (US-04/05/06/09) — Sprint 4

| ID | Senaryo | Seviye | Öncelik | Otomatik? | Kaynak |
|---|---|---|---|---|---|
| R-GRV-01 | Görev oluşturma, atama, doğrulama (başlık, durum, öncelik, tarih, proje üyesi) | API | Y | 🟡 test yazıldı (#125), #51 bekleniyor | TS-GRV-01/02/04 |
| R-GRV-02 | Durum değişimi `task_status_history`'ye kim/eski/yeni yazar; geçersiz durumda değişmez | API | Y | 🟡 #125 | TS-GRV-03/05 |
| R-GRV-03 | Filtreler: durum, kişi, tarih aralığı | API | O | 🟡 #125 | #51 |
| R-GRV-04 | Ekip Üyesi görev silemez; silmede yorum + geçmiş kaskad | API | Y | 🟡 #125 | #51 |
| R-KNB-01 | Kanban'da sürükle-bırak; yenilemede kalıcı | E2E | Y | ⏸ fixme, #51 + #50 | TS-KNB-01 |
| R-KNB-02 | Sunucu hatasında kart eski sütuna döner | E2E | O | ⏸ fixme | TS-KNB-02 |
| R-YRM-01 | Yorum ekleme; yazar sunucuda belirlenir; kronolojik | API | Y | 🟡 #125 | TS-YRM-01 |
| R-YRM-02 | Boş yorum 400; üye olmayan yorum yazamaz/okuyamaz | API | Y | 🟡 #125 | TS-YRM-02 |
| R-YRM-03 | Script içeren açıklama/yorum arayüzde çalışmaz | E2E + M | Y | ⏳ #50 | TS-GRV-09 |

## 6. Sonraki sprintler (yer tutucu)

| Alan | Sprint | Senaryolar | Kart |
|---|---|---|---|
| Takvim / Gantt | 5 | TS-TKV-01…03, TS-GNT-01 | #57, #58 |
| Dosyalar | 5 | TS-DSY-01…04 (tür, boyut, yetkisiz indirme) | #58, #59, #60 |
| Raporlar | 6 | TS-RPR-01…07 (bilinen seed ile beklenen değerler) | #65, #66, #67 |

## 7. Manuel kontroller (RC ve sunum öncesi)

| ID | Kontrol | Not |
|---|---|---|
| R-M-01 | Görsel tutarlılık, responsive (1366, 1920, tablet 768) | Chrome + Firefox |
| R-M-02 | Klavye ile gezinme, odak görünürlüğü, renk kontrastı | axe-core otomatik kontrolü kontrastı kapsamaz |
| R-M-03 | Boş / yükleniyor / hata durumları | Her ekran için |
| R-M-04 | Sunum senaryosu (#113 MVP demo taslağı) baştan sona | Sunum sabahı smoke |

**Özet (1 Kasım):** 25 senaryonun 20'si her PR'da CI'da otomatik koşuyor; görev/yorum testleri #51'i bekliyor, Kanban E2E'si #51 + #50'yi bekliyor.
