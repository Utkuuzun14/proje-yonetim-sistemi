# İlk hafta frontend teslimi — #22

Sorumlu: Ümit Efe Özkaleli. Planlanan dönem: H1, 5–11 Ekim 2026 (Sprint 0). Bu ek belgenin hazırlanma tarihi: 22 Ekim 2026; ilk hafta içinde teslim edilmiş veya sunulmuş olduğu iddia edilmez.

## Görev ve kanıt

| Karttaki görev | Hazır çıktı | Kalan iş |
|---|---|---|
| React / Angular karşılaştırması ve 10 dk sunum | [Teknoloji notu](teknoloji-notu.md), aşağıdaki konuşma ve demo akışı | Ümit'in ekibe sunması; tarih ve geri bildirimin kaydedilmesi |
| UI bileşen kütüphanelerini araştırmak | Teknoloji notu ve aşağıdaki seçim matrisi | Ekibin tercihinin tutanağa geçirilmesi |
| Rakip arayüzlerin UX incelemesi, Abdulkahhar ile | Üç ürünün resmî dokümantasyon karşılaştırması ve ortak inceleme formu | İki kişinin canlı akışları birlikte denemesi ve bulguları kaydetmesi |

Bu belge hazırlık çıktısıdır; ortak inceleme, ekip onayı ve toplantı tutanağı yerine geçmez. #22 bunlar tamamlanmadan kapatılmamalıdır. Figma çalışması #36 kapsamındadır; ilk hafta araştırmasının tamamlanması için Figma dosyası gerekmez.

## Teknoloji kararı için öneri

React + TypeScript + Vite ile devam edilmesi önerilir. Gerekçe: depodaki mevcut frontend bu yapıyı kullanıyor; bu aşamada Angular'a geçiş mevcut ekranları yeniden kurmayı gerektirir. Bu, React'in her projede daha iyi olduğu anlamına gelmez. React yaklaşımında yönlendirme ve veri erişimi gibi kararları ekip ayrıca yönetir; Angular daha bütünleşik bir çerçeve sunar. Ekip deneyimi ölçülmediği için geliştirme hızı veya öğrenme süresi hakkında sayısal üstünlük iddiası yoktur. [React kurulumu](https://react.dev/learn/build-a-react-app-from-scratch), [Angular genel bakış](https://angular.dev/overview).

| Seçenek | Projeye katkısı | Üstlenilecek iş / karar |
|---|---|---|
| Material UI | Hazır, özelleştirilebilir React bileşenleri | Var olan görünümle uyum ve bileşen geçişi değerlendirilmeli |
| Radix Primitives | Özelleştirilebilir, erişilebilir davranış temelleri | Görsel stiller ve ortak bileşen sarmalayıcıları ekipte kalır |
| Yerel HTML + ortak CSS (mevcut) | Mevcut Button/Field/Card ve tasarımla devam | İleri etkileşimlerde klavye, odak ve yardımcı teknoloji kontrollerini ekip yapar |

Kaynaklar: [Material UI](https://mui.com/material-ui/getting-started/), [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction). Tablo bakım değerlendirmesidir; paket boyutu veya performans ölçümü değildir.

Önerilen karar: mevcut temel bileşenleri korumak; karmaşık menü/seçici ihtiyacı doğduğunda Radix'i bir bileşen üzerinde denemek. Hazır kapsamlı bileşen seti öncelik kazanırsa MUI yeniden değerlendirilebilir. 26 Ekim uygulama güncellemesi: Radix Label ortak Field bileşenine bağlandı; kademeli kullanım başladı. Ekip onayı bekleniyor. Bireysel UX bulguları ve ekran bazlı fizibilite [geri bildirim belgesinde](ux-ve-wireframe-geri-bildirimi.md).

## Rakip UX karşılaştırması

Yöntem: 22 Ekim 2026 tarihinde ürünlerin resmî yardım sayfalarının incelenmesi. Ürün hesaplarında canlı görev testi yapılmadı; aşağıdaki çıkarımlar kullanıcı testi sonucu değildir.

| Ürün / kaynak | Belgelenen davranış | SEK TECH için çıkarım | Canlı incelemede doğrulanacak |
|---|---|---|---|
| [Trello: kart ve liste taşıma](https://support.atlassian.com/trello/docs/moving-cards-or-lists/) | Kartlar listeler arasında taşınabilir; kart menüsünde taşıma işlemi bulunur | Durum değiştirme yalnızca sürüklemeye bağlı olmamalı; görünür bir durum seçicisi de sunulmalı | Sürükleme kullanmadan hedef durum seçilebilir mi; işlem sonucu anlaşılır mı? |
| [Asana: pano görünümü](https://help.asana.com/s/article/board-view?language=en-US) | Panodaki kartların boyutu ve gösterilen bilgileri özelleştirilebilir | İlk görünümde başlık, sorumlu ve tarih; ayrıntılar görev detayında tutulmalı | Uzun başlıklar ve çok kart olduğunda okunabilirlik nasıl değişiyor? |
| [Azure Boards: Kanban](https://learn.microsoft.com/en-gb/azure/devops/boards/boards/kanban-overview?view=azure-devops) | Kartlar iş öğelerini, sütunlar aşamaları temsil eder; WIP sınırları yapılandırılabilir | İlk sürümde üç açık durum yeterli; WIP ayrıca gereksinim kararı olmalı | Durum ve sütun anlamı yeni kullanıcı için açık mı; yoğun iş görünür mü? |

Proje için önerilen kabul kontrolleri: durum metinle de gösterilmeli; boş listede görev ekleme yolu bulunmalı; hata halinde girilen değerler korunmalı; mobilde temel işlem erişilebilir olmalı; durum değişiminin kaydedildiği veya başarısız olduğu anlaşılmalı. Bunlar rakiplerin başarısız olduğu iddiaları değil, kendi uygulamamız için değerlendirme ölçütleridir.

## 10 dakikalık sunum: konuşma ve gösterim akışı

Bu akış zaman kutulu bir prova rehberidir. Toplam 10 dakika; anlatım, demo ve ekip soruları birlikte planlanmıştır. Sunum yapılmış değildir.

### 0:00–1:00 — İhtiyaç ve sınır

“Bu hafta frontend tarafında teknoloji ve bileşen seçeneklerini değerlendirdim. Ürünümüz proje, görev, Kanban, takvim ve rapor ekranları içeriyor. Seçimi mevcut kod, ortak bakım ve erişilebilirlik ihtiyaçlarıyla gerekçelendirdim. Bugün göstereceğim ekranlar tarayıcıda çalışan demo; gerçek oturum ve sunucu yetkilendirmesi tamamlanmış değil.”

Göster: teknoloji notundaki React/Angular tablosu. Ekipten mevcut React/Angular deneyimini belirtmesini iste; bilinmeyen deneyimi varsayma.

### 1:00–3:00 — React / Angular

“React bileşen odaklı bir yapı sağlıyor; yönlendirme ve veri akışı için ortak kurallar koymamız gerekiyor. Angular daha bütünleşik bir çerçeve sunuyor. Bizde React/TypeScript/Vite iskeleti ve ekranlar bulunduğu için mevcut yönü sürdürmeyi öneriyorum. Daha sonra sunucu tarafı render ihtiyacı ortaya çıkarsa mimariyi yeniden değerlendirmeliyiz.”

Tartış: mevcut tercihi değiştirmeyi gerektiren somut bir ekip ihtiyacı var mı? Kararı bir kişinin aşinalığı yerine proje ihtiyaçlarıyla ilişkilendir.

### 3:00–5:00 — UI bileşen seçenekleri

Yukarıdaki seçim matrisini göster. “MUI hazır bileşen kapsamına; Radix davranış ve özelleştirmeye odaklanıyor. Mevcut temel bileşenlerimiz yerel HTML ve CSS kullanıyor. Bileşen kütüphanesi kullanmak uygulama genelindeki erişilebilirliği kendiliğinden kanıtlamaz; akışları yine test edeceğiz.”

Göster: `/onizleme/tasarim` adresindeki bileşenler. Tartış: mevcut tasarımın korunması mı, daha geniş hazır bileşen kapsamı mı öncelikli?

### 5:00–7:00 — Rakiplerden çıkarımlar

Üç ürünün UX tablosunu göster. “Trello'dan alternatif taşıma yolunu, Asana'dan kart bilgi yoğunluğunu, Azure Boards'tan iş aşamalarının görünürlüğünü inceleme başlığı olarak aldım. Bu aşama dokümantasyon araştırması; Abdulkahhar ile birlikte canlı akışları ayrıca değerlendireceğiz.”

Karar önerisi: üç durumlu pano, kısa kart özeti, ayrıntı ekranı ve sürüklemeye alternatif durum seçimi. WIP sınırını yeni kapsam olarak kendiliğinden ekleme.

### 7:00–9:00 — Kısa demo

Ön hazırlık: `client` içinde `npm ci` ve `npm run dev`; terminalin verdiği yerel adresi aç. Gösterim sırasında yalnız demo verisi kullan.

1. `/giris`: alan etiketlerini ve boş alan doğrulamasını göster; gerçek oturum açıldığını iddia etme.
2. `/onizleme/tasarim`: ortak buton, alan ve kart görünümlerini göster.
3. `/onizleme/projeler`: örnek projeyi aç; görev panosundaki bir kartın durumunu seçiciyle değiştir. Bunun yerel demo verisi olduğunu belirt.

Demo açılamazsa kaynak dosyaları ve bu belgedeki akışı anlat; gösterilmeyen ekran için başarılı demo yapıldı yazma.

### 9:00–10:00 — Karar ve sonraki adım

“Ekibin React/TypeScript yönünü ve UI yaklaşımını onaylamasını istiyorum. Abdulkahhar ile ortak UX incelemesinde görev ekleme, durum değiştirme ve mobil kullanım adımlarını aynı formda kaydedeceğiz. Sunum tarihini, kararları ve kalan aksiyonları toplantı notuna ekleyeceğiz.”

## Abdulkahhar ile ortak UX inceleme formu

Önerilen oturum: 20–30 dakika. Katılım ve tarih henüz belli değil. Önceden ürün erişimleri kontrol edilmeli; ücretli veya erişilemeyen özellik “incelenemedi” olarak kaydedilmeli.

Her erişilebilen üründe aynı senaryoyu dene: bir görev oluştur, sorumlu/tarih belirle, durumunu değiştir, ayrıntısını bul. Sonra klavye ve dar ekran görünümünde temel işlemleri kontrol et. Adım ve süreyi ancak gerçekten ölçülmüşse yaz. Sonuç seçenekleri: geçti / sorun bulundu / incelenemedi.

| Ürün | Senaryo / ekran genişliği | Adım ve süre (ölçüldüyse) | Sonuç ve somut bulgu | Kanıt bağlantısı | Projeye etkisi |
|---|---|---|---|---|---|
| Trello | Doldurulacak | Ölçülmedi | İncelenmedi | — | — |
| Asana | Doldurulacak | Ölçülmedi | İncelenmedi | — | — |
| Azure Boards | Doldurulacak | Ölçülmedi | İncelenmedi | — | — |

Katılanlar: doldurulacak. Tarih/süre: doldurulacak. Uzlaşılan bulgular: doldurulacak. Ayrışan görüşler: doldurulacak.

Oturum sonrası [toplantı notu şablonunu](../sablonlar/toplanti-notu.md) kullanarak gerçek kararları ve sorumluları kaydet; gereken yeni işleri ilgili kartlara bağla. İlk hafta araştırmasının beklenen çıktısı teknoloji notudur; sunum ve ortak incelemenin kanıt bağlantıları da #22 üzerinden erişilebilir olmalıdır.

## Tamamlama kontrolü

- [x] React / Angular değerlendirmesi ve kaynakları hazır.
- [x] UI seçenekleri ve karar gerekçesi hazır.
- [x] Üç rakip için dokümantasyon araştırması hazır.
- [x] 10 dakikalık sunum rehberi ve ortak inceleme formu hazır.
- [ ] Ekibe sunum yapıldı; tarih ve geri bildirim kaydedildi.
- [ ] Abdulkahhar ile ortak UX incelemesi yapıldı; kanıtlar kaydedildi.
- [ ] Teknik tercih ekipçe onaylandı ve tutanağa geçti.
- [ ] Çıktılar ekipçe incelendi; #22 kabulü doğrulandı.
