# Test Senaryoları — v1 (ilk set)

Bu senaryolar yol haritası Bölüm 2.2'deki modül kapsamından türetilmiş, ardından Abdulkahhar'ın **kullanıcı
hikâyeleri (US-01…US-13, #27 / PR #92)** ve **SRS v1.0 (#20 / PR #89)** ile eşleştirilmiştir. Her senaryonun hangi
hikâyeyi doğruladığı aşağıdaki [izlenebilirlik matrisinde](#izlenebilirlik-matrisi-hikâye--senaryo) görülür.

**v1.1 değişiklikleri (22 Ekim):** hikâye/SRS eşlemesi eklendi; SRS'ten gelen yeni senaryolar (parola kuralı, giriş
deneme sınırı, durum geçmişi, görev türü, Markdown/XSS, gecikme rozeti, burndown) eklendi; #91 ile otomatikleşen
kimlik doğrulama senaryoları ✅ işaretlendi.

**Kolonlar:** Tür → `API` otomatik API testi, `E2E` tarayıcı testi, `M` manuel · Öncelik → Y yüksek / O orta / D düşük ·
Durum → ⏳ yazılmadı / 🟡 yazıldı / ✅ geçti / ❌ kaldı

## M2 · Kullanıcı & Rol Yönetimi

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-AUTH-01 | Geçerli bilgilerle kayıt | — | Ad, e-posta, şifre ile kayıt ol | 201; varsayılan rol Ekip Üyesi, şifre bcrypt ile saklanır | API, E2E | Y | ✅ API |
| TS-AUTH-02 | Aynı e-posta ile ikinci kayıt | TS-AUTH-01 | Aynı e-posta (büyük/küçük harf farkıyla) tekrar kayıt ol | 409; anlaşılır hata mesajı | API | Y | ✅ |
| TS-AUTH-03 | Geçersiz alanlarla kayıt | — | Boş ad, hatalı e-posta, kısa şifre | 400; alan bazlı hata mesajları | API | O | ✅ |
| TS-AUTH-09 | Parola kuralı (SRS FR-01) | — | Büyük harf / küçük harf / rakam / özel karakter eksik şifrelerle kayıt ol | Her biri 400; kurala uyan şifre kabul edilir | API | Y | ✅ |
| TS-AUTH-04 | Doğru bilgilerle giriş | Kayıtlı kullanıcı | E-posta + şifre ile giriş | 200; token döner (API ✅), panoya yönlenir (E2E ⏳) | API, E2E | Y | 🟡 |
| TS-AUTH-05 | Yanlış şifreyle giriş | Kayıtlı kullanıcı | Hatalı şifre / olmayan e-posta gir | 401; ikisinde aynı jenerik mesaj | API | Y | ✅ |
| TS-AUTH-10 | Kaba kuvvet sınırı (SRS 4.2) | — | Aynı IP'den 5 kez hatalı şifre, sonra 6. deneme | 6. istek 429 + `Retry-After`; başarılı girişler sayılmaz; süre dolunca tekrar denenebilir | API | Y | ✅ |
| TS-AUTH-06 | Token olmadan korumalı uç nokta | — | `GET /api/auth/me` (token yok) | 401 | API | Y | ✅ |
| TS-AUTH-07 | Süresi dolmuş / bozuk token | — | Bozuk, yanlış imzalı, süresi dolmuş token ile istek | 401 (API ✅); kullanıcı giriş ekranına yönlenir (E2E ⏳) | API, E2E | O | 🟡 |
| TS-AUTH-08 | Çıkış | Giriş yapılmış | Çıkış yap, geri tuşuna bas | Korumalı sayfalar açılmaz | E2E | O | ⏳ |
| TS-ROL-01 | Yönetici proje oluşturabilir | Yönetici girişi | Proje oluştur | 201 | API | Y | ⏳ |
| TS-ROL-02 | Ekip Üyesi proje silemez | Ekip Üyesi girişi | `DELETE /projects/:id` | 403; proje silinmez | API | Y | ⏳ |
| TS-ROL-03 | Ekip Üyesi başkasına görev atayamaz | Ekip Üyesi girişi | Görevi başka kullanıcıya ata | 403 | API | Y | ⏳ |
| TS-ROL-04 | Üye olmadığı projeyi göremez | `uye2` girişi | Başka projenin görevlerini iste | 403/404; veri sızmaz | API | Y | ⏳ |
| TS-ROL-05 | Arayüz role göre gizler | Ekip Üyesi girişi | Proje sayfasını aç | "Sil", "Üye ekle" butonları görünmez | E2E, M | O | ⏳ |

## M1 · Proje & Görev Yönetimi

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-PRJ-01 | Proje oluşturma | Yönetici | Ad, açıklama, başlangıç–bitiş gir | Proje listede görünür | API, E2E | Y | ⏳ |
| TS-PRJ-02 | Bitiş tarihi başlangıçtan önce | Yönetici | Bitiş < başlangıç ile kaydet | 400; hata mesajı | API | O | ⏳ |
| TS-PRJ-03 | Projeye üye ekleme/çıkarma | Yönetici, proje | Üye ekle, sonra çıkar | Üye listesi güncellenir; çıkarılan üye projeyi göremez | API | Y | ⏳ |
| TS-PRJ-04 | Proje düzenleme ve silme | Yönetici, proje | Adı değiştir, sonra sil | Değişiklik kaydedilir; silinen proje ve görevleri listelenmez | API | O | ⏳ |
| TS-GRV-01 | Görev oluşturma ve atama | Proje + üye | Başlık, açıklama, tarih, atanan kişi gir | Görev "To Do"da, atanan kişide görünür | API, E2E | Y | ⏳ |
| TS-GRV-02 | Proje üyesi olmayan kişiye atama | Proje | `uye2`'ye görev ata | 400/403 | API | O | ⏳ |
| TS-GRV-03 | Durum geçişi | Görev | To Do → In Progress → Done | Her geçiş kaydedilir, ilerleme yüzdesi güncellenir | API | Y | ⏳ |
| TS-GRV-04 | Geçersiz durum değeri | Görev | Durumu "Bitti123" yap | 400 (SRS FR-07) | API | O | ⏳ |
| TS-GRV-05 | Durum geçmişi kaydı | Görev | Durumu değiştir, `GET /api/tasks/:id/history` | Kim, ne zaman, eski → yeni durum kaydı oluşur; kayıt API'den değiştirilemez/silinemez | API | Y | ⏳ |
| TS-GRV-06 | Geçmiş yazılamazsa geri alma | Görev, geçmiş tablosu yazılamaz (test ortamında) | Durumu değiştir | İşlem geri alınır, görev eski durumda kalır, hata döner (SRS FR-08 transaction) | API | O | ⏳ |
| TS-GRV-07 | Görev türü ve öncelik | Proje üyesi | Tür = Bug, öncelik = Kritik ile görev aç | Kaydedilir; tanımsız tür/öncelik 400 | API | O | ⏳ |
| TS-GRV-08 | Done olunca kapanış zamanı | Görev | Durumu Done yap | Kapanış zaman damgası otomatik yazılır (SRS FR-07) | API | O | ⏳ |
| TS-GRV-09 | Markdown açıklama ve XSS | Proje üyesi | Açıklamaya `**kalın**`, kod bloğu ve `<script>alert(1)</script>` yaz | Markdown biçimli görünür, script çalışmaz (temizlenir) | E2E, M | Y | ⏳ |
| TS-KNB-01 | Kanban'da sürükle-bırak | Görevler | Kartı "In Progress" sütununa sürükle | Kart taşınır, sayfa yenilenince yerinde kalır | E2E | Y | ⏳ |
| TS-KNB-02 | Sürükleme sırasında sunucu hatası | Görevler, API hata döndürür | Kartı taşı | Kart eski sütuna geri döner, hata bildirimi çıkar (optimistic UI geri alma) | E2E | O | ⏳ |
| TS-KNB-03 | Gecikme rozeti | Son tarihi geçmiş, Done olmayan görev | Panoyu aç | Kartta kırmızı gecikme rozeti görünür | E2E, M | D | ⏳ |

## M3 · Takvim & Zaman

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-TKV-01 | Takvimde görev gösterimi | Tarihli görevler | Takvim görünümünü aç | Görevler doğru günlerde | E2E, M | Y | ⏳ |
| TS-TKV-02 | Ay geçişi | 30 Kasım–2 Aralık görevi | Kasım ve Aralık'a bak | Görev iki ayda da görünür | API, M | O | ⏳ |
| TS-TKV-03 | Haftalık / aylık görünüm geçişi | Tarihli görevler | "Haftalık" ve "Aylık" arasında geç | Haftalıkta yalnızca o haftanın 7 günü listelenir | E2E | D | ⏳ |
| TS-GNT-01 | Gantt çubukları (Should) | Tarihli görevler | Gantt'ı aç | Çubuk uzunlukları tarih aralığıyla uyumlu | M | D | ⏳ |

## M4 · Dosya & Yorum

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-DSY-01 | Dosya yükleme/indirme | Proje üyesi | PDF yükle, indir | Aynı dosya iner | API, E2E | Y | ⏳ |
| TS-DSY-02 | İzinsiz dosya türü | Proje üyesi | `.exe` yükle | 400; yüklenmez | API | Y | ⏳ |
| TS-DSY-03 | Boyut sınırı aşımı | Proje üyesi | Sınırın üstünde dosya yükle | 413/400 | API | O | ⏳ |
| TS-DSY-04 | Yetkisiz indirme | `uye2` | Başka projenin dosyasını indir | 403 | API | Y | ⏳ |
| TS-YRM-01 | Göreve yorum ekleme | Proje üyesi | Yorum yaz | Yorum yazar ve tarihle görünür | API, E2E | Y | ⏳ |
| TS-YRM-02 | Boş yorum | Proje üyesi | Boş yorum gönder | 400; gönderilmez | API | D | ⏳ |
| TS-YRM-03 | Başkasının yorumunu silme | Ekip Üyesi | Başka kullanıcının yorumunu sil | Arayüzde buton yok; API'ye doğrudan istek 403 | API, E2E | O | ⏳ |

## M5 · Raporlama

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-RPR-01 | Proje ilerleme yüzdesi | Seed: 10 görev, 4 Done | Proje raporunu aç | %40 | API | Y | ⏳ |
| TS-RPR-02 | Görevsiz proje | Boş proje | Raporu aç | %0; sıfıra bölme hatası yok | API | O | ⏳ |
| TS-RPR-03 | Kişi bazlı tamamlama | Seed verisi | Kişi raporunu aç | Her kişinin tamamladığı/toplam görevi doğru | API | Y | ⏳ |
| TS-RPR-04 | Haftalık rapor sınırları | Pazar 23:59 ve Pazartesi 00:00'da kapanan görevler | Haftalık raporu al | Görevler doğru haftaya düşer | API | O | ⏳ |
| TS-RPR-05 | Rapor yanıt süresi | Seed verisi | Rapor uç noktalarını çağır | < 1 sn | API | D | ⏳ |
| TS-RPR-06 | Gecikme karnesi | Son tarihi geçmiş, Done olmayan görevler | Kişi raporunu aç | Her üye için Toplam / Tamamlanan / Geciken doğru | API | O | ⏳ |
| TS-RPR-07 | Burndown | Bilinen durum geçmişi | Sprint aralığı için burndown iste | Günlük kalan iş = beklenen değerler; ideal çizgi doğru | API | O | ⏳ |

## İzlenebilirlik matrisi (hikâye ↔ senaryo)

| Hikâye | Konu | Senaryolar | Kapsam |
|---|---|---|---|
| US-01 | Kayıt ve giriş | TS-AUTH-01…10 | 🟢 API otomatik (#91), E2E bekliyor |
| US-02 | RBAC | TS-ROL-01…05 | ⏳ Sprint 3 (#44, #46) |
| US-03 | Proje ve üye atama | TS-PRJ-01…04 | ⏳ Sprint 3 |
| US-04 | Görev, Markdown, atama | TS-GRV-01, 02, 07, 09 | ⏳ Sprint 4 |
| US-05 | Durum + geçmiş logu | TS-GRV-03, 04, 05, 06, 08 | ⏳ Sprint 4 |
| US-06 | Kanban sürükle-bırak | TS-KNB-01…03 | ⏳ Sprint 4 (E2E) |
| US-07 | Takvim | TS-TKV-01…03 | ⏳ Sprint 5 |
| US-08 | Gantt (Should) | TS-GNT-01 | ⏳ Sprint 5 |
| US-09 | Yorumlar | TS-YRM-01…03 | ⏳ Sprint 4 |
| US-10 | Dosyalar | TS-DSY-01…04 | ⏳ Sprint 5 |
| US-11 | İlerleme yüzdesi | TS-RPR-01, 02 | ⏳ Sprint 6 |
| US-12 | Kişi bazlı karne | TS-RPR-03, 06 | ⏳ Sprint 6 |
| US-13 | Burndown | TS-RPR-07 | ⏳ Sprint 6 |
| *(önerildi)* US-14 | Günlük/haftalık/aylık rapor (ders yönergesi MUST, SRS'te var) | TS-RPR-04 | ⏳ Hikâye eklenince |

**Açık noktalar (SRS ↔ kod uyumu, #89 incelemesi):** rol adları (Admin/Member ↔ Yönetici/Ekip Üyesi), ad/soyad alanı,
görev türü ve kapanış zamanı alanları, durum geçmişi tablo adı, refresh token. Kararlar netleşince ilgili senaryolar
güncellenir.

## Smoke seti (her dağıtım ve sunum sabahı)

TS-AUTH-04 → TS-PRJ-01 → TS-GRV-01 → TS-KNB-01 → TS-RPR-01
