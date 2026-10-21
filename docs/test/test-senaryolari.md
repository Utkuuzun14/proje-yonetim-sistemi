# Test Senaryoları — v1 (ilk set)

Bu senaryolar yol haritası Bölüm 2.2'deki modül kapsamından ve MUST listesinden türetilmiştir. Abdulkahhar'ın
kullanıcı hikâyeleri (#27) netleştikçe her senaryo ilgili hikâye numarasıyla eşleştirilecek ve genişletilecektir.

**Kolonlar:** Tür → `API` otomatik API testi, `E2E` tarayıcı testi, `M` manuel · Öncelik → Y yüksek / O orta / D düşük ·
Durum → ⏳ yazılmadı / 🟡 yazıldı / ✅ geçti / ❌ kaldı

## M2 · Kullanıcı & Rol Yönetimi

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-AUTH-01 | Geçerli bilgilerle kayıt | — | Ad, e-posta, şifre ile kayıt ol | 201; kullanıcı oluşur, şifre hash'li saklanır | API, E2E | Y | ⏳ |
| TS-AUTH-02 | Aynı e-posta ile ikinci kayıt | TS-AUTH-01 | Aynı e-posta ile tekrar kayıt ol | 409/400; anlaşılır hata mesajı | API | Y | ⏳ |
| TS-AUTH-03 | Geçersiz alanlarla kayıt | — | Boş e-posta, hatalı format, kısa şifre | 400/422; alan bazlı hata mesajları | API | O | ⏳ |
| TS-AUTH-04 | Doğru bilgilerle giriş | Kayıtlı kullanıcı | E-posta + şifre ile giriş | 200; token/oturum döner, panoya yönlenir | API, E2E | Y | ⏳ |
| TS-AUTH-05 | Yanlış şifreyle giriş | Kayıtlı kullanıcı | Hatalı şifre gir | 401; hangi alanın yanlış olduğu belli edilmez | API | Y | ⏳ |
| TS-AUTH-06 | Token olmadan korumalı uç nokta | — | `GET /projects` (token yok) | 401 | API | Y | ⏳ |
| TS-AUTH-07 | Süresi dolmuş / bozuk token | — | Geçersiz token ile istek | 401; kullanıcı giriş ekranına yönlenir | API, E2E | O | ⏳ |
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
| TS-GRV-04 | Geçersiz durum değeri | Görev | Durumu "Bitti123" yap | 400 | API | D | ⏳ |
| TS-KNB-01 | Kanban'da sürükle-bırak | Görevler | Kartı "In Progress" sütununa sürükle | Kart taşınır, sayfa yenilenince yerinde kalır | E2E | Y | ⏳ |

## M3 · Takvim & Zaman

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-TKV-01 | Takvimde görev gösterimi | Tarihli görevler | Takvim görünümünü aç | Görevler doğru günlerde | E2E, M | Y | ⏳ |
| TS-TKV-02 | Ay geçişi | 30 Kasım–2 Aralık görevi | Kasım ve Aralık'a bak | Görev iki ayda da görünür | API, M | O | ⏳ |
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

## M5 · Raporlama

| ID | Senaryo | Ön koşul | Adımlar | Beklenen sonuç | Tür | Öncelik | Durum |
|---|---|---|---|---|---|---|---|
| TS-RPR-01 | Proje ilerleme yüzdesi | Seed: 10 görev, 4 Done | Proje raporunu aç | %40 | API | Y | ⏳ |
| TS-RPR-02 | Görevsiz proje | Boş proje | Raporu aç | %0; sıfıra bölme hatası yok | API | O | ⏳ |
| TS-RPR-03 | Kişi bazlı tamamlama | Seed verisi | Kişi raporunu aç | Her kişinin tamamladığı/toplam görevi doğru | API | Y | ⏳ |
| TS-RPR-04 | Haftalık rapor sınırları | Pazar 23:59 ve Pazartesi 00:00'da kapanan görevler | Haftalık raporu al | Görevler doğru haftaya düşer | API | O | ⏳ |
| TS-RPR-05 | Rapor yanıt süresi | Seed verisi | Rapor uç noktalarını çağır | < 1 sn | API | D | ⏳ |

## Smoke seti (her dağıtım ve sunum sabahı)

TS-AUTH-04 → TS-PRJ-01 → TS-GRV-01 → TS-KNB-01 → TS-RPR-01
