# Demo ekran akışı — #78 hazırlığı

Bu akış frontend prototipinin demosudur; canlı ürün teslimi veya gerçekleştirilmiş prova değildir.

1. `/giris`: görsel hiyerarşi, etiketler ve boş form doğrulamasını göster. Gerçek giriş için backend beklendiğini belirt.
2. **Arayüz önizlemesi**: toplam proje/görev sayısını ve tamamlanma yüzdesini göster. Verilerin örnek ve tarayıcıya özel olduğunu söyle.
3. Demo kullanıcısını **Hakan · Yönetici** yap. **Projeler → Yeni proje** ile bir proje oluştur; tarih ve ekip alanlarını göster.
4. Örnek projeyi aç. **Yeni görev** ile görev oluştur, Ümit Efe'ye ata; görev tarihlerini proje aralığında tut.
5. Ümit Efe rolüne geç. Yönetici butonlarının kaybolduğunu göster. Kendi görevini **Devam ediyor**, ardından **Tamamlandı** yap. Başkasının durum seçicisinin kapalı olduğunu göster.
6. Görev başlığını aç, yorum yaz; Escape ile kapat. Liste ve pano arasında geç.
7. Küçük bir örnek metin dosyası ekleyip indir. Dosyanın yalnız bu tarayıcıda kaldığını belirt.
8. **Takvim** ekranında Ekim 2026'yı seç. **Gantt** görünümüne geç; tarih aralığının nasıl ölçeklendiğini göster.
9. **Raporlar** ekranında tamamlanma yüzdesini ve kişi tablosunu göster. Gün/hafta/ay filtrelerini dene, CSV indir.
10. **Tasarım sistemi** ile ortak renkleri ve form durumlarını göster. Bekleyen Figma, backend ve ekip kabul adımlarını açıklayarak bitir.

## Manuel kontrol ve ekran görüntüsü listesi

- Giriş ve kayıt: 1440 px ve 390 px genişlik.
- Proje listesi ve dolu Kanban: masaüstü ve mobil.
- Modal: ilk odak, Tab/Shift+Tab sınırı, Escape ve odak dönüşü.
- Dokunmatik kullanım: durum seçicisi, menü aç/kapat, tarih kontrolleri.
- Dosya: gerçek tarayıcıda ekleme, sayfa yenileme sonrası aynı dosyayı indirme.
- Takvim/Gantt: ay geçişi, yatay kaydırma ve boş ay.
- Rapor: proje filtresi, dönem sınırları, CSV'nin ofis uygulamasında Türkçe açılması.

Tarayıcı otomasyonu bu turda URL politikası tarafından engellendi; yukarıdaki manuel kontroller ve görüntüler henüz yapılmış olarak işaretlenmez.
