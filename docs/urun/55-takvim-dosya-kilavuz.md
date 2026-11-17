# Takvim/Gantt Kabul Seti ve Dosya Yönetimi Kılavuzu

**Tarih:** 15 Kasım 2026  
**Sorumlu:** Abdulkahhar Türkoğlu (Müşteri Temsilcisi / Ürün Sahibi) — Issue #55  
**Kilometre Taşı:** M4 Hazırlığı (Takvim, Gantt & Dosya Paylaşımı)  
**Değerlendirilen Artış:** Sprint 5 (Modül 3 + Modül 4)

---

## 1. Takvim ve Gantt Kabul Testleri (T-01…T-07)

Testler canlı API ve React ön yüzü üzerinde koşturulmuş ve doğrulanmıştır:

| Kod | Test Senaryosu | Beklenen Davranış | Gerçekleşen Sonuç | Durum |
|---|---|---|---|:---:|
| **T-01** | Ekim ayından Kasım ayına geçiş (ay değişimi) | Başlangıç ve bitişi aylara yayılan görev her iki ayda da doğru gün aralığında gösterilir. | Ay değiştirme butonlarıyla Kasım seçildiğinde görev tarih çubuğu kesintisiz uzandı. | **GEÇTİ** |
| **T-02** | Görev çubuğuna tıklama / detay açma | Takvimdeki görev bandına tıklandığında görev detay modalı açılır, başlık, sorumlu ve tarih görünür. | Tıklama ile detay modalı açıldı, durum geçmişi ve yorumlar listelendi. | **GEÇTİ** |
| **T-03** | Haftalık görünüm seçimi | Seçili haftanın 7 günü listelenir, o haftaya denk gelen görevler gün bloklarında hizalanır. | Haftalık filtre düzgün listelendi. | **GEÇTİ** |
| **T-04** | Salt Okunur Gantt görünümü (Karar 14) | Görevler başlangıç tarihine göre kronolojik sıralanır; süre çubukları zaman ekseninde orantılı çizilir. | Gantt görünümünde görevler kronolojik listelendi, durum rozetleri ve süre çubukları gösterildi. | **GEÇTİ** |
| **T-05** | Tarihsiz görev veya ters tarih kısıtı | Tarihsiz işler zaman çizelgesinde hata vermez; ters tarihli görev oluşturma formda ve API'de engellenir. | `chk_tasks_dates` kısıtı ters tarihi reddetti (400), tarihsiz işler takvimde çökme yapmadı. | **GEÇTİ** |
| **T-06** | Dar ekran (responsive) ve mobil menü | Mobil ve dar çözünürlüklerde takvim tablosu taşmaz; hamburger menü ile geçiş yapılabilir. | 375px mobil genişlikte mobil menü açıldı, takvim daraltılmış görünümde çalıştı. | **GEÇTİ** |
| **T-07** | Klavye ile ay ve görünüm değiştirme | Yön tuşları veya buton odaklarıyla klavye üzerinden ay geçişi yapılabilir. | Odak yönetimi erişilebilir bulundu. | **GEÇTİ** |

---

## 2. Dokümantasyon ve Dosya Paylaşımı Kabul Testleri (F-01…F-03)

| Kod | Test Senaryosu | Beklenen Davranış | Gerçekleşen Sonuç | Durum |
|---|---|---|---|:---:|
| **F-01** | Yetkili proje üyesi 2.5 MB PDF yükler, aynı projedeki diğer üye indirir. | Dosya sunucuda UUID ile saklanır; veritabanında meta veri oluşur; diğer üye orijinal adla indirir. | PDF başarıyla yüklendi, liste güncellendi, ikinci kullanıcı dosyayı eksiksiz indirdi. | **GEÇTİ** |
| **F-02** | 10 MB üzeri dosya veya geçersiz uzantı (.exe) yüklenmesi | Sunucu ve arayüz 10 MB üzeri dosyayı 413, yasaklı uzantıyı 400 hatası ile reddeder; dosya kaydedilmez. | Multer ve validasyon kuralları büyük dosyayı ve yetkisiz uzantıyı engelledi. | **GEÇTİ** |
| **F-03** | Proje dışı üyenin dosya indirme URL'sini çağırması | Sistem 404/403 döner; dosya içeriği veya meta verisi yetkisiz kullanıcıya sızdırılmaz. | Yetkisiz kullanıcıya 404 dönüldü, dosya izolasyonu doğrulandı (TS-DSY-04). | **GEÇTİ** |
| **F-04** | Göreve dosya bağlama (Karar 11) | Dosya yüklenirken görev seçilir; görev detayında bağlı dosyalar listelenir. Görev silindiğinde dosya projede kalır. | `task_id` bağlantısı kuruldu, görev silinince dosyanın `task_id`'si NULL oldu, dosya silinmedi. | **GEÇTİ** |

---

## 3. Ekran Akışları ve Kullanım Kılavuzu Notları

1. **Takvim & Zaman Çizelgesi Erişimi:** Proje detayında üst sekmeden "Takvim & Gantt" seçilir. Kullanıcı sağ üstteki görünüm seçici ile Aylık Takvim veya Gantt Zaman Çizelgesi arasında geçiş yapar.
2. **Dosya Yükleme Akışı:** Proje ekranında "Dosyalar" paneline gidilir; "Dosya Yükle" butonuna tıklanarak yerel bilgisayardan belge seçilir (azami 10 MB). İsteğe bağlı olarak ilgili görev seçilip "Yükle"ye basılır.
3. **Dosya İndirme:** Dosya satırındaki "İndir" butonuna tıklanarak güvenli akış üzerinden orijinal adıyla bilgisayara kaydedilir.
