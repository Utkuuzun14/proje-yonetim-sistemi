# Uçtan uca UAT kaydı ve demo senaryosu v1

30 Ekim 2026 · #69 · Sprint 7 hazırlığı. **Kabul kararı: Verilmedi.** RC/staging sürümü ve uçtan uca Must özellikleri bekleniyor.

## Başlama ve çıkış kapıları

Başlama: aday commit/etiket, staging URL, API/DB migration sürümü, veri seti ve test hesapları kayıtlı olmalı; üretim verisi kullanılmamalı. Admin, proje üyesi ve dış üye ayrı oturumlar olmalı. Test kanıtı token/parola içermemeli.

Çıkış: bütün Must senaryoları geçer; kritik/yüksek açık hata yok; kalıcılık, izin, yedekten dönüş ve hata akışları doğrulanır. Her hata düzeltmesi aynı senaryoda tekrar koşulur. Ürün sahibi adı/tarihi ve kabul edilen sürüm yazılır. Bir demo veya CI yeşili tek başına UAT onayı değildir.

| UAT | İş akışı | Beklenen son durum | 30 Ekim durumu |
|---|---|---|---|
| E2E-01 | Kayıt → giriş → reload → çıkış → korumalı sayfa | Oturum doğru, çıkış sonrası erişim yok | Eski PR #93 incelemesinde geçti; RC tekrar bekliyor |
| E2E-02 | Admin proje/üyelik; Member yetkisiz yönetim | Proje kalıcı; Member 403; dış üye 404 | API CI kanıtı var; RC manuel bekliyor |
| E2E-03 | Üye başka kullanıcı detayını ister | Kişisel veri sızıntısı yok | #110 açık yüksek hata |
| E2E-04 | Görev oluştur/ata → Kanban → geçmiş → reload | Atomik geçmiş ve iki oturum kalıcılığı | #51 bekliyor |
| E2E-05 | Yorum → yetkisiz değiştirme → script içeriği | İzin izolasyonu ve güvenli render | #51 bekliyor |
| E2E-06 | Takvim ay/hafta → Gantt → detay | Tarihler ve görev aynı; klavye akışı çalışır | Haftalık/milestone eksik; manuel bekliyor |
| E2E-07 | A dosya yükler → B indirir → C reddedilir | Sunucu paylaşımı ve MIME/boyut doğrulaması | #58 bekliyor |
| E2E-08 | %40 veri seti → kişi raporu → trend/export | Doğru oranlar, dönemler ve dışa aktarım | #65 bekliyor |
| E2E-09 | Ağ hatası/expired JWT/yeniden başlatma | Anlaşılır hata; yetkisiz veri yok; kalıcı veri korunur | RC testi bekliyor |

## Demo senaryosu v1: Etkinlik Sitesi

Örnek veri: Yönetici Selin, üye Can ve dış üye Deniz; bir test projesi. “Kayıt formu”, “Program sayfası”, “Mobil kontrol” görevleri. 10 görevlik rapor setinde 4 Done, 3 In Progress, 3 To Do. 2,5 MB zararsız PDF. Senaryonun tarihlerini demo gününe göre sabitle; gerçek müşteri verisi kullanma.

1. (1 dk) Problem ve hedef: aynı teslim için ekip tek listeyi takip etsin.
2. (1 dk) Selin giriş yapar, proje oluşturur ve Can'ı ekler. Proje kimliğini not al.
3. (1 dk) Can ayrı oturumda yalnız yetkili projeyi görür; yönetim kısıtı açıklanır.
4. (2 dk) Kayıt formunu Can'a ata; To Do → In Progress → Done; yorum ve geçmişi göster. Yenile ve ikinci oturumdan kalıcılığı doğrula.
5. (1 dk) Takvimde son tarihi ve görev detayını göster; tamamlanmış Gantt varsa aynı aralığı karşılaştır.
6. (1 dk) Selin PDF yükler; Can indirir. Yerel önizlemede ikinci kullanıcı paylaşımı gösterilemez.
7. (2 dk) %40 raporu ve geciken işleri anlat; kişi metriklerinin anlamını açıkla.
8. (1 dk) Çıkış; teslim kapsamı, sınırlamalar, sorular. UAT kanıtına bağlan.

Bugün yalnız Auth/Users/Projects gerçek API; kalan ekranlar PR #93 önizlemesidir. RC hazır olana kadar adım 4–7 “hedef akış” veya açık etiketli önizleme olarak anlatılır. Çalışmayan özelliği video/görselle çalışıyormuş gibi sunma.

## Olası müşteri soruları ve dürüst yanıtlar

- Kim neyi görebilir? Yönetici ve proje üyeliği sınırları var; #110 düzeltilip doğrulanmadan tam izolasyon kabulü yok.
- Görevler herkesin ekranında aynı mı? Gerçek görev API'si tamamlanınca ayrı oturum testiyle doğrulanacak; önizleme yerel.
- Dosyalar nerede? Önizlemede IndexedDB; gerçek paylaşım #58 kapsamı. Yedek ve saklama politikası ayrıca doğrulanacak.
- Yüzde ne demek? Done/toplam; iş büyüklüğü ağırlığı yok. Sıfır görev %0.
- Burndown var mı? Durum geçmişi tabanlı gereksinim; henüz tamamlanmış rapor değil.
- Kesintide veri kaybı? Uptime/RPO/RTO hedef; ölçülmüş hizmet taahhüdü değil.
- Mobilde çalışır mı? Duyarlı arayüz var; belirlenen cihaz/klavye/kontrast kontrolleri RC'de kayıt altına alınmalı.

İmza alanları: kabul eden / tarih / sürüm / ortam / kanıtlar / istisnalar. Hepsi bekliyor; bu belge hazırlanmış demo v1 ve UAT çalışma kaydıdır.
