# Gerçek ürün sunum ekran akışı — #78 hazırlığı

**Güncelleme:** 27 Kasım 2026. Bu belge prova planıdır; yapılmış prova veya ürün sahibi kabulü değildir. Ortak 10 dakikalık sunumun görev dağılımı `docs/urun/62-rapor-kabul-ve-sunum-kurgusu.md` içindedir. Ümit/Mustafa operasyonel bölümü 02:30–06:30 arasında yürütür.

## Hazırlık

- Yönetici ve proje üyesi test hesaplarını ayrı tarayıcı oturumlarında hazırla. Kişisel hesap/parola/token görüntüleme.
- Demo için ayrılmış projede görevler, üyelikler ve örnek dosya hazır olsun; gerçek ekip verisini değiştirme.
- Kullanılacak RC sürümünü/commit'ini kaydet. #129 develop'a birleşti; #138 arayüz düzeltmeleri incelemede. Rapor bölümü için backend #150 ve frontend #151 aynı ortamda bulunmalı.
- Gerçek giriş `/giris`, çalışma alanı `/uygulama/projeler`. `/onizleme` örnek veridir; gerçek ürün kabulü için kullanılmaz.
- API/veritabanı erişimini, hesap yetkisini ve dosya indirmeyi kontrol et. Kurulum bilgisi README'dedir. Var olan veritabanında `init.sql` çalıştırma.

## Dört dakikalık operasyonel akış

| Süre | Ekran ve eylem | Görünen kanıt |
| --- | --- | --- |
| 00:00–00:30 | Yönetici oturumunda Projeler → demo proje | Gerçek proje adı ve çalışma alanı |
| 00:30–01:20 | Görevler ve Kanban → Yeni görev; başlık, tür, öncelik, atanan kişi ve tarih seç | Kaydedilmiş görev, liste ve Kanban kartı |
| 01:20–02:10 | Üye oturumunda kendi görevinin durumunu Devam ediyor yap; yenile | Kalıcı durum ve görev ayrıntısında geçmiş kaydı |
| 02:10–02:40 | Göreve yorum ekle; ayrıntıyı kapat | Kaydedilen yorum, klavyeyle odak dönüşü |
| 02:40–03:15 | Takvim ve Gantt → görevin tarihindeki ay → Gantt | Tarih yerleşimi; tek tarihi olan görev aynı günde |
| 03:15–04:00 | Dosyalar → küçük dosyayı göreve bağlayarak yükle → yenile → indir | Kalıcı dosya, görev filtresi ve indirme |

Klavyede/dokunmatik kullanımda kartın “… durumu” seçimi kullanılabilir. Gantt salt okunurdur. Dosya sınırı 10 MB; izin verilen türleri ekran gösterir.

## Rapor bölümüne geçiş

Raporlar → aynı proje. Abdulkahhar/Buğra'ya ekranı devret. Sabit kabul verisinde 10 görev / 4 Done / %40 ve 3 geciken gösterilir. Sonra kişi tablosu ve iki ucu dahil tarih aralığı sorgusu açılır. Görev sayıları performans puanı değildir. Tarih aralığında tamamlanan sayısı geçmiş kaydından gelir; güncel Done sayısıyla aynı olmak zorunda değildir.

Günlük/haftalık/aylık trend, CSV/PDF dışa aktarım ve milestone bu kapsamda değildir. API yanıtı gelmezse örnek veriyi gerçek sonuç olarak sunma; hatayı gösterip hazır kanıt ekranına geç.

## Ekran görüntüsü teslim listesi

RC üzerinde 1440 px masaüstü ve 390 px mobil genişlikte, kişisel bilgi içermeyen demo verisi kullan. Her dosyanın yanına sürüm, tarih, genişlik ve rolü kaydet. Bu turda görüntü alınmadı.

| Dosya adı önerisi | Görünüm | Durum |
| --- | --- | --- |
| `01-giris-desktop.png` / `01-giris-mobile.png` | Giriş etiketleri ve doğrulama | Bekliyor |
| `02-projeler-desktop.png` | Gerçek proje listesi | Bekliyor |
| `03-kanban-desktop.png` / `03-kanban-mobile.png` | Dolu pano, durum seçimi | Bekliyor |
| `04-gorev-gecmisi.png` | Görev, yorum ve geçmiş | Bekliyor |
| `05-takvim.png` / `06-gantt.png` | Tarihli görev ve çizelge | Bekliyor |
| `07-dosyalar.png` | Proje adı, kalıcı dosya ve görev ilişkisi | Bekliyor |
| `08-raporlar-desktop.png` / `08-raporlar-mobile.png` | Üç rapor, kişi tablosu, tarih sonucu | #150/#151 sonrası |

## Prova ve manuel kabul kaydı

İki tam prova ekipçe yapılacak. Otomatik test sonucu prova yerine geçmez:

| Koşu | Tarih / RC commit | Süre | Ekran sorumlusu | Hata / takip kartı | Sonuç |
| --- | --- | --- | --- | --- | --- |
| Prova 1 | Bekliyor | — | Ümit / Mustafa | — | Yapılmadı |
| Prova 2 | Bekliyor | — | Ümit / Mustafa | — | Yapılmadı |

Manuel kontrol: mobil menü açılış odağı/Escape, modal Tab/Shift+Tab sınırı ve odak dönüşü, yatay tablo kaydırma, boş/yükleniyor/hata durumları, yetkisiz proje adresi, dosyanın yenilemeden sonra indirilmesi. #71 stabilizasyon ve #78 final teslimi, bu kontroller ve ekip kabulü tamamlanmadan Done sayılmaz.
