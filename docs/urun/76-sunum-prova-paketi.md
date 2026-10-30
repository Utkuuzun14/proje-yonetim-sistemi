# Müşteri sunumu akışı ve iki prova paketi

30 Ekim 2026 · #76 · Sprint 8 hazırlığı. Anlatım ve soru-cevap hazır; **provalar yapılmadı**. Ana anlatıcı Ümit, Abdulkahhar görevlerini üstlenme isteği doğrultusunda önerilir; ekip sunum rol dağılımı ayrıca kaydedilmelidir.

## 12 dakikalık anlatıcı metni

0:00–1:30 / “Etkinlik sitesi geliştiren ekibin görevleri ve belgeleri farklı yerlerde. Kim sorumlu, hangi iş gecikti, teslim ne kadar ilerledi? SEK TECH bu sorulara aynı proje içinden yanıt vermeyi hedefliyor.”

1:30–3:00 / “Yönetici projeyi oluşturuyor ve üyeleri belirliyor. Ekip üyesinin yönetim yetkileri sınırlı.” Gerçek giriş/proje akışını göster; test hesabı kullan, parolayı ekranda açma.

3:00–5:00 / “Kayıt formu Can'a atandı; işi başlatıp tamamlıyor. Durum geçmişi kimin ne zaman değiştirdiğini göstermeli.” Görev API'si tamamlanmadıysa “Bu bölüm yerel önizleme; kalıcı ekip senkronizasyonu bekliyor” de ve o kapsamda göster.

5:00–6:30 / “Takvim teslim tarihini görünür kılıyor. İlgili belgeyi görev bağlamında bulmak istiyoruz.” Sadece tamamlanmış ekranı göster; yerel dosyayı ortak depolama diye anlatma.

6:30–8:00 / “10 görevden 4'ü tamamlandı: %40. Geciken iş sayısı, iş yükünü yeniden planlamaya yardımcı olur; tek başına çalışan performans notu değildir.”

8:00–9:00 / “Teslim sürümümüz ve kabul kanıtlarımız bunlar.” Sürüm etiketini, CI/test raporunu, açık sınırlamaları göster. Ölçülmemiş güvenlik, uptime veya hız taahhüdü verme.

9:00–12:00 / Sorular. Soru bilinmiyorsa “Bunu doğrulayıp karar kaydına ekleyelim” de; varsayım üretme. Bir sorumlu ve takip tarihi kaydet.

## Canlı demo hazırlık sırası

1. Son kabul edilen commit/etiketi belirle; 3 Aralık kod dondurma kararını kontrol et.
2. README'deki kurulumla ayrı demo ortamını aç; sağlık, login ve seed hesaplarını doğrula. Mevcut veriyi silen init.sql'yi gerçek ortamda çalıştırma.
3. Etkinlik Sitesi örnek veri setini yalnız demo ortamında hazırla; demo tarihlerini güncelle.
4. Yönetici ve üye için ayrı tarayıcı oturumları aç; bildirimleri kapat, yazı boyutunu salon için ayarla.
5. Ağ kesintisi için yerel demo ve açık etiketli ekran görüntüsü/önizleme yedeği hazırla. Hazır video bulunduğu iddia edilmez.
6. Projeksiyon/ses, görünürlük ve tıklama sırasını kontrol et; süre tutucuyu belirle.

## İki tam prova kayıt formu

| Alan | Prova 1 | Prova 2 |
|---|---|---|
| Tarih / katılımcılar | Yapılmadı | Yapılmadı |
| Sürüm / ortam | Bekliyor | Bekliyor |
| Toplam süre / aşan bölüm | Ölçülmedi | Ölçülmedi |
| Login → proje → görev → rapor | Koşulmadı | Koşulmadı |
| Ağ kesintisi yedeği denemesi | Koşulmadı | Koşulmadı |
| Hata ve düzeltme kanıtı | Bekliyor | Bekliyor |
| Anlatıcı / süre tutucu onayı | Bekliyor | Bekliyor |

Prova 1 sonunda en çok üç somut iyileştirme seç: örneğin yavaş veri hazırlığı, okunmayan metin, belirsiz önizleme etiketi. Prova 2'de aynı noktaları yeniden ölç; kritik demo engeli varsa kapanmış sayma. Kod dondurma sonrası yalnız demo engelleyen kritik hata süreci uygulanır.

## Soru-cevap kartları

“Neden bu ürün?” → Küçük ekibin proje, iş ve teslim görünürlüğünü tek akışta toplamak için.

“Jira'dan daha mı iyi?” → Genel üstünlük iddiası yok; ders kapsamındaki seçili akışlara odaklanıyoruz.

“Yetkiler güvenli mi?” → API rol ve üyelik kontrolü yapıyor; açık güvenlik bulguları ve kabul testi sonucu ayrıca sunulmalı. #110 kapanmadan tam kabul iddiası yok.

“Tüm ekranlar backend'e bağlı mı?” → 30 Ekim itibarıyla Auth/Users/Projects API var; görev/dosya/rapor bölümleri henüz planlı. Sunum gününde sürüme göre doğrulanıp bu yanıt güncellenir.

“Veriler kaybolur mu?” → Önizleme tarayıcıya yerel; gerçek ortamın DB/yedek geri dönüş kanıtı ayrıca gerekir. %99,5 gibi hedefler SLA değildir.

“Bir sonraki adım?” → Açık Must özellikler, RC uçtan uca kabul ve belgelenmiş iki prova.

Kapanış kanıtı: iki tarihli/süreli tam prova, canlı demo yürütme kaydı, açık sorunların sonucu ve ekip teyidi. Bu belge bu faaliyetlerin yerine geçmez.
