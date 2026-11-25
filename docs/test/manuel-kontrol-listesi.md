# Manuel Kontrol Listesi — Firefox ve Sunum Senaryosu (R-M-01…04)

| | |
|---|---|
| Kart | #74 · Test Raporu v1 §4.1 |
| Ortam | `docker compose up --build -d` → http://localhost:3000 (RC'de staging adresi) |
| Kullanıcılar | Seed: `hakan@sektech.com` (Yönetici), `utku@sektech.com` (Ekip Üyesi). Parola `database/seed.sql` açıklamasında |
| Süre | ~25 dk |

Chrome kontrolleri 25 Kasım'da yapıldı (Test Raporu §4.1). Bu liste Firefox'ta tekrar ve sunum provası içindir.
Her maddeye ✅ / ❌ (+ kısa not) yaz. ❌ olanlar için Hata Bildirimi şablonuyla issue açılır.

## A. Firefox: görünüm (R-M-01) — ~8 dk

Pencere genişliği: Firefox'ta `Ctrl+Shift+M` (Duyarlı Tasarım Modu) → 1366×768, 1920×1080, 768×1024.

| # | Kontrol | 1366 | 1920 | 768 |
|---|---|---|---|---|
| A1 | Giriş ekranı: iki sütun düzgün, taşma yok | | | |
| A2 | Projeler: kartlar hizalı, yatay kaydırma çubuğu yok | | | |
| A3 | Görevler → Kanban: 3 sütun okunur, kart başlıkları kesilmiyor | | | |
| A4 | Takvim: ay ızgarası görünür (768'de kendi içinde yatay kayması normal) · Gantt çubukları tarihlerle uyumlu | | | |
| A5 | Dosyalar: yükleme formu ve liste düzgün | | | |
| A6 | Görev detay penceresi: açılır, kapanır, yorum alanı görünür | | | |

## B. Firefox: klavye (R-M-02) — ~6 dk

Fareye dokunmadan, 1366 genişlikte:

| # | Adım | Beklenen | Sonuç |
|---|---|---|---|
| B1 | Girişte `Tab` ile e-posta → parola → "Giriş yap", `Enter` | Giriş olur, projelere gider | |
| B2 | Projelerde ilk `Tab` | "İçeriğe geç" bağlantısı görünür; `Enter` ana içeriğe atlar | |
| B3 | `Tab` ile gezinirken | Odaklanan her öğede belirgin çerçeve var | |
| B4 | Kanban'da bir kartın durum seçicisine `Tab` ile gel, ok tuşlarıyla "Devam ediyor" seç | Kart sütun değiştirir, yenilemede kalır | |
| B5 | Görev detayını `Enter` ile aç, `Esc` ile kapat | Odak açan karta geri döner | |
| B6 | Takvimde `Tab` ile önceki / sonraki ay düğmeleri | Ay değişir | |

## C. Firefox: durumlar (R-M-03) — ~4 dk

| # | Adım | Beklenen | Sonuç |
|---|---|---|---|
| C1 | Görevi olmayan bir projenin Kanban, Takvim ve Dosyalar ekranları | "Henüz görev yok" / "Henüz dosya eklenmedi" gibi açıklayıcı mesaj | |
| C2 | `docker stop sektech-server`, sonra Projeler'i yenile | Önce "yükleniyor", ~10 sn içinde hata mesajı ve "Tekrar dene" | |
| C3 | `docker start sektech-server`, "Tekrar dene"ye bas | Liste geri gelir | |

## D. Sunum senaryosu baştan sona (R-M-04) — ~7 dk

Chrome'da, sunumdaki sırayla ve tam ekranda. Süre tut.

| # | Adım | Sonuç |
|---|---|---|
| D1 | Yönetici girişi | |
| D2 | Yeni proje oluştur, Ekip Üyesini üye ekle | |
| D3 | Görev oluştur, Ekip Üyesine ata, tarih ver | |
| D4 | Ekip Üyesi olarak gir (gizli pencere), görevi Kanban'da sürükle | |
| D5 | Göreve yorum yaz, dosya ekle, dosyayı indir | |
| D6 | Takvim ve Gantt'ta görevi gör | |
| D7 | Rapor ekranı (#64 geldiyse): yüzdeler ve kişi tablosu | |
| D8 | Ekip Üyesi proje düzenleyemiyor (düğme yok) | |
| D9 | Çıkış | |

Toplam süre: ____ dk · Takılan / yavaş hissettiren yer: ____

## Sonuçları rapora işleme

Bu listeyi doldurup bana ver. Test Raporu §4.1'in Firefox sütununu ve R-M-04 satırını ben doldururum.
