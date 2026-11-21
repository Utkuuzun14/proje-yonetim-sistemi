# Frontend UX değerlendirmesi ve wireframe geri bildirimi

Hazırlayan rol: Ümit Efe Özkaleli / frontend. Tarih: 26 Ekim 2026. İlgili kartlar: #22, #29; yerleşim ve giriş ekranları için #36.

## Kapsam ve yöntem

Bu belge frontend tarafının bireysel teknik değerlendirmesidir. Kaynaklar: [wireframe ekran açıklamaları](../wireframes.md), mevcut `client/src/` kodu ve [rakip ürünlerin kaynaklı karşılaştırması](ilk-hafta-teslimi.md#rakip-ux-karşılaştırması). Figma dosyası açılmadı; görsel konum, piksel uyumu veya Figma prototipi onaylanmadı. Ortak kullanıcı testi yapılmadı; süre/adım ölçümü uydurulmadı. Aşağıdaki öncelikler frontend önerisidir, ürün sahibinin onayı değildir.

## 1. Yedi ekran için teknik fizibilite

| Wireframe ekranı | Mevcut uygulama / fark | Frontend geri bildirimi ve kabul önerisi |
|---|---|---|
| 01 Login/Register | Ayrı `/giris` ve `/kayit` rotaları; wireframe sekmeli yapı tarif ediyor | Her iki yaklaşım uygulanabilir. Ayrı rotalar doğrudan bağlantıyı korur. Sekme görünümü istenirse aktif sekme ve klavye davranışı belirlenmeli. Hata alanı okunmalı, parola görünür loglara yazılmamalı. Ürün sahibinden sekme/rota tercihi alınmalı. |
| 02 Dashboard | İlerleme ve görev dağılımı mevcut; wireframe'deki genel üst arama ve acil görev tablosuyla birebir eşleşme doğrulanmadı | Genel aramanın hangi varlıkları kapsadığı belirlenmeli. Öncelik ve gecikme ayrı kavramlar olmalı. Görevi olmayan projenin ilerleme hesabı ve boş durum metni açık olmalı. |
| 03 Project Detail | Proje detayı ve ekip bilgisi var; kilometre taşı veri modeli yok | M1/M2/M3 görünümü için ad, hedef tarih, durum ve proje ilişkisi gerekir. Sadece görsel etiket eklemek veri modelini tamamlamaz. Proje üyesi olmayan kişinin doğrudan URL erişimi backend tarafından reddedilmeli. |
| 04 Kanban | Üç sütun, kişi atama ve alternatif durum seçicisi mevcut | Sürükleme tek işlem yolu olmamalı. Boş sütun açıklaması ve filtre sonucu ayrılmalı. Kaydetme başarısızlığında kart eski duruma dönmeli; gerçek API entegrasyonunda doğrulanmalı. |
| 05 Task Drawer | Mevcut görev detayı ortak modal; 500 px sağ çekmeceyle aynı düzen değil. Açıklama düz metin; dosyalar proje düzeyinde | Dar ekranda 500 px sabit genişlik taşma oluşturabilir; en fazla ekran genişliği kullanılmalı. Drawer açılışında odak içeri, kapanışta açan kontrole dönmeli. Markdown gerekiyorsa güvenli renderer ve izin verilen içerik politikası gerekir. Göreve özel ek dosya için ilişki modeli kararı alınmalı. |
| 06 Calendar | Aylık takvim ve Gantt var; ayrı haftalık takvim yok | Haftalık görünüm ayrıca kapsamlandırılmalı. Çok günlük görev ay sınırında kesilmeli; görev adı ve tarihleri metin olarak da okunmalı. Tarih-only değerler saat dilimi dönüşümüyle bir gün kaymamalı. |
| 07 Reports | Yüzde, görev durumları, kişi raporu ve dönem filtresi var; burndown yok | Burndown için tarihsel kalan iş / kapsam değişikliği kaydı gerekir; yalnız güncel görev durumundan geçmiş eğri üretilemez. Başlıklar ölçümün neyi saydığını söylemeli; kişi çıktısı yalnız adet üzerinden performans hükmüne dönüştürülmemeli. |

Sonuç: iskelet ve temel ekranlar uygulanabilir ve demo karşılıkları vardır. Kilometre taşı, görev eki, haftalık takvim ve burndown mevcut özellik kabul edilmemelidir. Bunları #29 kapsamında sessizce eklemek yerine ürün sahibi ilgili sonraki sprint kartlarında önceliklendirmelidir.

## 2. Ümit'in bireysel UX bulguları

| ID / öncelik | Kanıt ve kullanıcı etkisi | Frontend önerisi | Doğrulama ölçütü |
|---|---|---|---|
| UX-01 / yüksek | `src/api.ts` istek sonucunu bildiriyor; gerçek oturum/rol bağlantısı yok. Demo rol seçimi yetkilendirme değil | Demo ve gerçek oturum ayrımı korunmalı; JWT oturumu, korunan rotalar ve 401 yönlendirmesi #43'te tamamlanmalı | Oturum yokken korunan ekran açılmaz; yetkisiz işlemi sunucu da reddeder |
| UX-02 / yüksek | `workspace/Store.tsx` ve dosya deposu tarayıcıda yerel veri tutuyor; başka ekip üyesi aynı değişikliği görmez | Demo açıklaması görünür kalmalı; gerçek senkronizasyon tamamlanmadan ekip paylaşımı vaat edilmemeli | İki gerçek kullanıcı aynı proje verisini API üzerinden görür; bu henüz test edilmedi |
| UX-03 / orta | `workspace/Tasks.tsx` durum seçicisi ve boş sütun metni içeriyor | Alternatif durum seçimi korunmalı; sadece sürüklemeye bağlı akıştan kaçınılmalı | Klavyeyle görev seçme ve durum değiştirme gerçek tarayıcıda denenir; kaydetme sonucu duyurulur |
| UX-04 / orta | Wireframe görev panelini 500 px olarak tarif ediyor | Genişlik ekranla sınırlandırılmalı; uzun başlık, açıklama ve hata mesajı test edilmeli | 390 px genişlikte ana işlem yatay kaydırma gerektirmez; modal kapanışı klavyeyle erişilir |
| UX-05 / orta | Wireframe Markdown/PDF kartı; mevcut açıklama düz metin, dosya alanı proje düzeyinde | İlk sürüm düz metin davranışı açıkça kabul edilmeli veya Markdown/görev eki kapsamı netleştirilmeli | Kullanıcıya desteklenmeyen biçimlendirme veya görev eki varmış gibi gösterilmez |
| UX-06 / orta | `workspace/Reports.tsx`: dönem filtresi tamamlanma tarihini kullanır; CSV tüm seçili proje görevlerini içerir | Ekran ve CSV kapsamının farkı kullanıcı metninde açık tutulmalı | Aynı filtreyle gösterilen rapor ve indirilen dosyanın kapsamı kullanıcı tarafından anlaşılır |
| UX-07 / orta | Burndown çizgisi wireframe'de var; tarihsel iş kaydı mevcut modelde yok | Veri sözleşmesi belirlenmeden örnek eğri gerçek rapor gibi sunulmamalı | Grafik varsa kaynak tarihçesi ve kapsam değişiklikleri açıklanabilir |

Bu bulgular kod/doküman incelemesidir; canlı kullanıcı gözlemi veya erişilebilirlik sertifikası değildir. Renk kontrastı, gerçek odak davranışı ve ekran okuyucu deneyimi manuel kontrol bekler.

## 3. Rakip incelemesinden kendi ürünümüze aktarım

[İlk hafta araştırmasında](ilk-hafta-teslimi.md) verilen resmî Trello, Asana ve Azure Boards kaynaklarına göre bireysel öneriler:

- Trello'nun alternatif kart taşıma akışı: bizde durum seçicisini sürüklemeye eşlik eden kalıcı yol olarak korumak.
- Asana'nın kart bilgi düzeni: başlık, sorumlu ve tarihi kartta tutmak; uzun açıklama ve yorumları detayda göstermek.
- Azure Boards'un aşama ve WIP yaklaşımı: ilk kapsamda üç anlaşılır durum; WIP sınırını ayrıca ürün kararı olarak değerlendirmek.

Öneriler rakiplerin canlı kullanımda daha başarılı olduğuna ilişkin ölçüm içermez. Ortak oturumda her ürün için aynı görevi oluşturma, atama, durum değiştirme ve detayını bulma senaryosu kullanılmalı. Sonuçlar [hazır inceleme formuna](ilk-hafta-teslimi.md#abdulkahhar-ile-ortak-ux-inceleme-formu) yazılmalı.

## 4. UI yaklaşımı ve ortak bileşen envanteri (#29)

Teknik tercih: mevcut görünümü koruyarak Radix Primitives'i kademeli kullanmak. İlk entegrasyon `@radix-ui/react-label` paketidir; ortak `Field` bileşeni `Label.Root` kullanır. Paket yalnız kurulmuş değil, uygulamadaki giriş/kayıt ve diğer Field alanlarında kullanımdadır. Bu seçim UI kütüphanesi temelini kurar; tüm ekranların Radix'e geçirildiği anlamına gelmez. Native dialog ve semantik tablo korunur.

[Radix Label dokümanı](https://www.radix-ui.com/primitives/docs/components/label): yerel label temeli, `htmlFor` ve iç içe kontrol desteği. Bu tercih kendi tasarımımızı korumak içindir; standart HTML etiketinin erişilemez olduğu iddia edilmez. Ekip onayı ayrıca kaydedilmeli.

| Ortak parça | Kod / sorumluluk | Durumlar ve kullanım kuralı |
|---|---|---|
| Button | `src/components.tsx` | normal, disabled, focus; form dışı işlemde `type=button` |
| Field | `src/components.tsx`, Radix Label | benzersiz id/etiket; required, disabled ve hata bağlantısı kullanan formun sorumluluğu |
| Card | `src/components.tsx` | ortak bölüm görünümü; anlamlı başlık kullanan sayfada verilir |
| Modal | `workspace/Modal.tsx` | native dialog, başlık, kapatma, Escape ve odak dönüşü; gerçek tarayıcı kontrolü bekler |
| Tablo | `workspace/Tasks.tsx`, `Reports.tsx` | semantik table/thead, başlıklar, taşma kapsayıcısı; ortak React Table bileşeni henüz yok |
| Durum seçicisi | `workspace/Tasks.tsx` | rol kısıtı, üç durum; sürüklemenin alternatifi |
| Hata/boş durum | ilgili sayfalar ve depo | hata metni, boş sütun/filtre mesajı; gerçek API yükleme durumları entegrasyonda genişletilecek |

## 5. Ürün sahibine sunulacak karar listesi

1. Giriş/kayıtta ayrı rota mı, sekmeli görünüm mü?
2. Görev detayı modal olarak kabul ediliyor mu, sağ çekmece zorunlu mu?
3. Markdown ve görev bazlı ek dosya hangi sprintin kapsamı?
4. Kilometre taşı, haftalık takvim ve burndown için öncelik ve veri sözleşmesi nedir?
5. Radix'in kademeli kullanımı ve mevcut temel bileşenlerin korunması uygun mu?

Bu liste gönderilmiş mesaj veya alınmış onay değildir. Ümit'in teknik hazırlığı teslim edilmiştir; sunum, ortak UX oturumu ve Abdulkahhar'ın kabulü bekler. Sunum için [10 dakikalık rehber](ilk-hafta-teslimi.md#10-dakikalık-sunum-konuşma-ve-gösterim-akışı) hazırdır. Figma bu çalışmanın dışında tutuldu.
