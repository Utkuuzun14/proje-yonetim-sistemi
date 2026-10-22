# Frontend teknoloji değerlendirmesi — #22

Bu belge değerlendirme taslağıdır; ekip onayı veya yapılmış toplantı tutanağı değildir.

İlk hafta teslim takibi, ayrıntılı sunum akışı ve ortak UX inceleme formu: [İlk hafta teslim paketi](ilk-hafta-teslimi.md). Kaynaklar 22 Ekim 2026 tarihinde tekrar kontrol edildi.

## Resmî kaynaklara dayalı değerlendirme — 21 Ekim 2026

React'in resmî kılavuzu Vite ile TypeScript uygulaması kurmayı destekler; ancak yönlendirme, veri getirme ve olası sunucu tarafı render gereksinimlerini ekibin yönetmesi gerektiğini belirtir. Bu repo için React + Vite önerisi, mevcut client README tercihi ve ayrı backend planına dayanır; tüm projeler için genel bir üstünlük iddiası değildir. [React kılavuzu](https://react.dev/learn/build-a-react-app-from-scratch)

Angular bileşenler, Signals ve sunucu tarafı render gibi olanakları çatı altında toplar. Bunun ekip standardizasyonuna katkı sağlayabileceği değerlendirmedir; ekip deneyimi bilinmediğinden öğrenme süresi için sayısal tahmin verilmez. [Angular genel bakış](https://angular.dev/overview)

Material UI hazır ve özelleştirilebilir React bileşenleri sunar. Radix Primitives daha düşük seviyeli, erişilebilir davranış ve özelleştirmeye odaklanan parçalar sağlar; odak ve klavye yönetimi gibi ayrıntıları ele alır. Mevcut prototipin yerel HTML/CSS tercihi bu kütüphanelerin kurulduğu anlamına gelmez. [Material UI](https://mui.com/material-ui/getting-started/), [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)

## Dokümantasyon üzerinden UX incelemesi

Azure Boards, kartları iş öğelerine ve sütunları işin aşamalarına karşılık getirir; kart taşıma durum değiştirir. WIP sınırları devam eden işi sınırlamak için ayrıca sunulur. Prototipte üç durumlu pano ve durum seçicisi uygulandı; WIP sınırı mevcut görev kapsamına eklenmedi. Bu sonuç resmî dokümantasyon incelemesidir; canlı hesap üzerinde kullanılabilirlik testi veya Abdulkahhar ile yapılmış ortak inceleme değildir. [Azure Boards Kanban](https://learn.microsoft.com/en-us/azure/devops/boards/boards/kanban-overview?view=azure-devops)

| Ölçüt | React | Angular |
|---|---|---|
| Yapı | Bileşen odaklı; araçlar seçilir | Bütünleşik, daha kurallı yapı |
| Bu proje | Küçük ekip için esnek | Ortak Angular deneyimi varsa tutarlı seçenek |
| Maliyet | Araç standartları ayrıca belirlenmeli | Kavram ve kurulum kapsamı daha geniş |

Öneri: client README'sindeki React + Vite yönünü sürdürmek; TypeScript kullanmak. Nihai seçim ekipçe onaylanmalıdır.

## UI seçenekleri

- MUI: hazır form, tablo ve dialog kapsamı; görünümü uyarlamak gerekir.
- Radix UI: erişilebilir davranış temelleri; görsel tasarım ayrıca geliştirilir.
- Özel CSS + yerel HTML: küçük form kapsamı için düşük karmaşıklık; ileri bileşenlerde test yükü artar.

Bu teslimde yerel form elemanları, ortak CSS ve Lucide ikonları kullanıldı. MUI/Radix kurulmadı; UI davranış kütüphanesi seçimi ekip kararı olarak açık tutuluyor.

## Ortak UX incelemesi için plan

Azure Boards, Trello ve Asana üzerinde Abdulkahhar ile: görev ekleme adım sayısı, kart bilgi yoğunluğu, klavye kullanımı, durumların yalnız renkle anlatılmaması, boş ekranlar ve mobil navigasyon incelenmeli. Canlı ürün incelemesi ve ortak değerlendirme henüz yapılmadı.

## 10 dakikalık sunum taslağı

1. 0–2 dk: ürün modülleri ve ekip kapasitesi.
2. 2–5 dk: React / Angular karşılaştırması.
3. 5–7 dk: UI seçenekleri ve bakım maliyeti.
4. 7–9 dk: çalışan giriş/kayıt ve yerleşim önizlemesi.
5. 9–10 dk: teknoloji, UI kütüphanesi ve API kararları.

Sunumun gerçekleştirildiği iddia edilmez.
