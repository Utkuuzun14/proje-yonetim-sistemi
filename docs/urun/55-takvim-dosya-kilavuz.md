# Takvim/Gantt kabul seti ve kullanıcı kılavuzu akışları

30 Ekim 2026 · #55 · Sprint 5 hazırlığı. Kod inceleme tabanı: PR #93 ce1edca. Manuel kabul koşulmadı.

## Sabit örnek veri

Etkinlik Sitesi projesi: A görevi 30 Ekim–2 Kasım, B görevi 1 Kasım tek gün, C tarihsiz, D 5–7 Kasım tamamlandı. A ve B farklı üyelere atanır. Test saati 3 Kasım 2026 Europe/Istanbul olarak sabitlenir; A gecikmiş, D tamamlanmış olmalıdır.

| Kod | İşlem | Beklenen | Mevcut kanıt / engel |
|---|---|---|---|
| T-01 | Ekim'den Kasım'a geç | A her iki ayda doğru aralıkta; B tek gün | Aylık önizleme var; manuel bekliyor |
| T-02 | Görev çubuğunu aç | Aynı görev başlığı/tarih/sorumlu | Kodda detay akışı; manuel bekliyor |
| T-03 | Haftalık görünümü seç | Seçili haftanın 7 günü, doğru görevler | Haftalık görünüm eksik |
| T-04 | Gantt'ı aç | A/B aralıkları doğru; renk dışında metin | Önizleme var; manuel bekliyor |
| T-05 | Tarihsiz/ters tarih ver | Tarihsiz iş kaybolmadan açıklanır; ters tarih reddedilir | Entegrasyon kabulü bekliyor |
| T-06 | Milestone ekle/göster | Tek tarih işareti; görevle karışmaz | Milestone modeli/UI eksik; Gantt kapsamı hocaya sorulacak |
| T-07 | Ay değiştir, dar ekran ve klavye kullan | Başlık/odak korunur; kontroller erişilir | Manuel bekliyor |
| F-01 | Yetkili üye 2,5 MB PDF yükler; diğer üye indirir | Sunucuda kalıcı, iki kullanıcı aynı dosyaya erişir | Files API #58 bekliyor |
| F-02 | 10 MB üstü dosya, sahte MIME ve yasak uzantı | 413/400; dosya/DB kaydı yok | Sunucu doğrulaması bekliyor |
| F-03 | Proje dışı üye indirme URL'sini dener | Yetkisiz erişim reddedilir | API bekliyor |

SRS üst sınırı 10 MB'dır; mevcut önizleme sınırları 5 MB/dosya ve 25 MB/projedir. IndexedDB yalnız aynı tarayıcıda saklar; ekipçe dosya paylaşımı testinden geçer sayılmaz. Sınır değer testleri API uygulanınca 10 MB−1 bayt, tam 10 MB, 10 MB+1 bayt ile yapılır; “MB” birimi sözleşmede netleştirilir.

## Kullanıcı kılavuzu akışları

### Gerçek proje çalışma alanı

Giriş → Projeler → Proje seç. Yönetici Yeni proje ile adını girer; tarih aralığını kontrol eder ve kaydeder. Hata varsa alan mesajını düzeltip yeniden dener. Ekip Üyesi yönetim işlemlerini kullanamaz. Kullanıcı/üyelik yönetimi ekranlarının tamamlandığı iddia edilmez.

### Önizleme takvim ve Gantt

Önizleme → Takvim → ay gezinme → görev çubuğu → görev detayı. Gantt sekmesinde görev tarih aralığını izle. Bu alan örnek/yerel veridir. Haftalık takvim ve milestone için tamamlanmış ekran yönergesi verilmez.

### Önizleme dosya listesi

Önizleme → Projeler → proje detayı → Dosyalar → dosya seç → listede ad/tür/boyut bilgisi → İndir. Silmeden önce doğru dosyayı seç. Boyut sınırı, depolama hatası veya izin hatasında mesajı oku; başka bir tarayıcıda dosyanın görünmesini bekleme.

### Gerçek dosya paylaşımı (API sonrası hedef akış)

Üye A giriş → proje Dosyalar → yükle → başarı; üye B ayrı tarayıcıda aynı projeye girer → indir → dosya boyutu/içerik doğrula. Proje dışı üye aynı bağlantıyla erişemez. Bu akışın çalıştığı henüz doğrulanmadı.

## Dosya listesi desteği

Mevcut bileşenler: client/src/workspace/ProjectFiles.tsx ve files.ts (PR #93). Liste için kabul: boş durum yönlendirmesi, ad/tür/boyut, indirme, silme geri bildirimi, limit ve depolama hatası. API entegrasyonunda yükleniyor/yeniden dene durumu ve erişim kontrolü korunmalı; storage_path istemciye açık dosya URL'si olarak verilmemeli.

Kapanış için T/F senaryoları sürüm ve kanıtla yürütülmeli; gerçek iki kullanıcı paylaşımı/staging kanıtı, ürün sahibi kararı eklenmeli. Şimdiki çıktı test notları ve kılavuz akışlarıdır.
