# Frontend teslim durumu — 14 Kasım 2026

Kaynak: #50, #57, #64 kartlarındaki 14 Kasım ekip kararı. Öncelik 16–22 Kasım toparlanma haftasında Kanban ve takvim/sade Gantt; raporlar 23–29 Kasım'a, stabilizasyon ve teslim hazırlığı 30 Kasım–6 Aralık'a taşındı. Ara demo 22 Kasım, teslim 7 Aralık. Kart açıklamalarındaki eski tarihler yerine güncel ekip yorumu esas alındı.

## Hazırlanan uygulama

- #50: PR #127; görev CRUD/atama, Kanban, yorum/geçmiş. Başlık düzenlemesinde değişmeyen atama korunur. Gerçek API kabulü #51/#52'yi bekler.
- #57: Hesap menüsü → Takvim ve Gantt → proje seç. Doğrudan adres `/uygulama/projeler/:id/takvim`. GET project detayı ve GET project tasks dışında çağrı yapılmaz. Önizleme deposu kullanılmaz.
- Takvim Pazartesi başlangıçlıdır. Başlangıç/bitiş dahil aralıklar gösterilir; ay sınırını kesen görevler her ilgili günde görünür. Ay gezinmesi ve başlık araması vardır.
- Sade Gantt salt okunurdur; çubuklar görüntülenen ayla kesişen süreye kırpılır. Gerçek tarihler metin olarak da görünür. Eksik, geçersiz veya ters tarihli işler ayrı listelenir; tarih uydurulmaz.
- #71 için erken düzeltme: gerçek hesap mobil menüsüne aç/kapat, Escape ile kapatıp düğmeye odak dönme, içeriğe geç bağlantısı eklendi. Takvim/Gantt bölgesi dar ekranda kendi içinde kayar ve klavyeyle odaklanabilir. Görev/takvim proje seçicilerindeki gereksiz proje oluştur/düzenle düğmeleri kaldırıldı.

## Doğrulama ve sınırlar

`cd client; npm run check`: 78 test / 9 dosya, lint, TypeScript ve üretim derlemesi başarılı. Dokuz yeni test: artık yıl/geçersiz tarih, kapsayıcı aralık, eksik/ters tarih, API takvimi ve Gantt kırpması, filtre/boş durum, servis hatası ve yeniden deneme, yanlış proje yanıtı, proje seçimi, menü klavye odağı.

Testler jsdom ve taklit HTTP yanıtları kullanır. Gerçek görev API, tarayıcı görünümü ve mobil cihaz kabulü yapılmış değildir. #51/#52 hâlâ gerekli; kartlar Done değildir. Kanban'ın mevcut E2E sütun/kart/etiket seçicileri değiştirilmedi.

## Henüz tamamlanamayan işler ve somut bağımlılıklar

| Kart | Kalan iş | Gerekli girdi |
|---|---|---|
| #50 | Gerçek API kabulü, PR #127 onayı/birleşmesi | #51 API + #52 migration, #125 API kabul testleri |
| #57 | Dosya yükleme/indirme, gerçek API takvim kabulü | #58/#59 ve dosya yanıt sözleşmesi; takvim için #51 |
| #64 | Proje/kişi/tarih aralığı rapor ekranlarının gerçek API entegrasyonu | #65/#66: yanıt şemaları ve yeni tarih aralığı parametreleri |
| #71 | Tam responsive/erişilebilirlik ve RC regresyon kabulü | Tam modüller ve staging sürümü |
| #78 | Son sürüm ekran görüntüleri, canlı sunum/prova | RC, demo verisi ve ekip prova oturumu |

Dosya sözleşmesinde adresler ve multipart `file` alanı mevcut; liste yanıtı, yükleme yanıtı ve hata ayrıntıları tanımlı değil. DB sütunları tek başına HTTP sözleşmesi sayılmaz. #58'de `data` listesinin id/project_id/name/type/size/uploaded_at alanlarının tipleri, BIGINT size'ın sayı/metin biçimi, yükleme yanıtı ve indirmede Content-Disposition netleştirilmeli. Boyut ve tür kuralları US-10 ile tutarlı olmalı (10 MB, pdf/png/jpg/docx); esas doğrulama sunucudadır. Token indirme URL'sine yazılmamalı.

Rapor sözleşmesi yalnız `progress` ve `periodic?period=daily|weekly|monthly` taslağını içeriyor. 14 Kasım kararındaki tarih aralıklı raporla uyumlu sorgu adları, kapsayıcı sınırlar/saat dilimi, durum geçmişinin nasıl kullanıldığı ve kişi toplamlarının yanıt şeması #65'te netleştirilmeli. Görev tarihlerini filtrelemek, tarihsel tamamlanma raporu yerine geçirilmemeli.

#128 kod incelemesinde hâlâ açık bulgu: klavyeyle Done seçildikten sonra kart iyimser olarak taşınıyor. Geçmiş GET çağrısından önce ilgili PATCH 200 yanıtı beklenmeli; aksi halde TS-KNB-01 aralıklı hata verebilir. Seçiciler uyumlu olsa da bu bulgu çözülmeden onay verilmedi.

## #78 için hazırlanmış demo akışı (prova yapılmış değildir)

1. Yönetici ve Ekip Üyesi için ayrı tarayıcı oturumları aç; yalnız demo projesini kullan.
2. Projeler → proje → Görevler ve Kanban: görev oluştur, mevcut üyeye ata, başlığı düzenle; atama korunmalı.
3. Ekip Üyesinde görev durumunu taşı; yenile ve Yönetici oturumunda kalıcılığı göster. Detaydan yorum/geçmişi aç.
4. Takvim ve Gantt → aynı projeyi seç; görev tarihinin bulunduğu aya git. Ay sınırını kesen görevi ve bir günlük görevi göster; Gantt'a geç.
5. Tarihsiz işi ayrı listede göster. Başlık filtresiyle boş sonucu ve filtre temizlendiğinde geri gelişini göster.
6. Dar ekran ve klavyede menü, içeriğe geç, ay seçimi ve yatay kaydırma bölgesini kontrol et.
7. API'ler kabul edilince dosya yükle/indir ve üç rapor türünü ekle. Hazır olmayan modülü çalışıyormuş gibi sunma.

Son sürümden alınacak görseller: proje listesi, Kanban, yorum/geçmiş, takvim, Gantt, dosyalar, raporlar ve dar ekran menüsü. Görsellerde kişisel/gerçek ekip verisi yerine izinli demo verisi kullanılmalı. Bu listede görsel üretilmiş veya prova yapılmış sayılmıyor.

## 16 Kasım inceleme düzeltmesi

#129: yerel `type=month` bağımlılığı kaldırıldı; Türkçe ay seçimi ve 1–9999 sınırlarında sayısal yıl alanı kullanılıyor. Ay okları yıl geçişinde iki alanı birlikte güncelliyor; boş/geçersiz yılda çizelge yerine hata gösteriliyor. Görevler başlangıç tarihine, eşit tarihte kimliğe göre sıralanıyor. 80 test / 9 dosya, lint, TypeScript ve build başarılı. Tarayıcılar arası manuel kabul yapılmış değildir.

Tek tarihli görevlerin tek günlük gösterilmesi Hakan'ın kapsam kararını bekliyor. Mevcut davranış korundu, eksik başlangıç/bitiş açıklaması netleştirildi. `from/to` entegrasyonu ve eksik tarih listesinin nasıl korunacağı API kabulünde ele alınacak; şu anda filtreleme istemcide.

#128: 09ccbe0 incelemesinde klavye durum değişiminin PATCH yanıtını beklediği doğrulandı; önceki yarış bulgusu giderilmiş. GitHub'dan test hazırlığına onay verildi. Testler fixme olduğundan gerçek API E2E kabulü değildir; #51/#127 sonrası etkinleştirilmelidir.
