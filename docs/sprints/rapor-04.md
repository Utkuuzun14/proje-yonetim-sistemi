# Haftalık Rapor #4 — Sprint 3

**Tarih:** 26 Ekim – 1 Kasım 2026 · **Hazırlayan:** Mert Yanık · **Kilometre taşı:** M3

**Durum tarihi:** 30 Ekim 2026 (Türkiye saati). Bu belge hafta içi ara ilerleme raporu taslağıdır; 31 Ekim ve 1 Kasım henüz gerçekleşmemiştir. Aşağıdaki kayıtlar haftanın nihai kapanışı veya müşteri kabulü anlamına gelmez.

**Sprint hedefi:** Rol tabanlı yetkilendirmeyi ve proje oluşturma–düzenleme akışını uçtan uca çalıştırmak (Modül 2 + Modül 1’in proje kısmı). Kaynak: [proje yol haritası](../yol-haritasi.pdf), Bölüm 6, s. 14 ve [#42](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/42). Tatil nedeniyle yaklaşık %80 kapasite, yol haritasındaki plan varsayımıdır; ölçülmüş gerçekleşme değildir.

## Bu hafta yapılanlar

Birleşen teslimatlar ile yalnızca hazırlanmış/incelemedeki çıktılar açıkça ayrılmıştır. Karttaki işaretli kutular tek başına onay veya teslim kanıtı sayılmamıştır.

| Kişi | Yapılan iş | Kart / PR |
|---|---|---|
| Hakan Koço | **Karar kaydı yayımlandı:** 29 Ekim’de sekiz karar #96 yorumuna yazıldı; asıl takvim, API v0.5, tek 8 saatlik JWT, şemanın esas alınması ve Yönetici proje yetkileri netleştirildi. #40’ta kapsam daraltma ve burndown başlatma işaretli; burndown ölçümü bu raporda bağımsız doğrulanmadı. | [#96 karar yorumu](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/96#issuecomment-6497201808), #40 |
| Abdulkahhar Türkoğlu | **İncelemede:** SRS v1.1 ve rol/proje kabul–MVP taslakları ürün sorumluluğundaki kartlar için hazırlandı; PR yazarı Ümit Efe’dir. Manuel UAT, müşteri kabulü veya canlı prova tamamlanmış sayılmaz. | #97 → [PR #111](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/111), #41 → [PR #113](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/113) |
| Mert Yanık | **İncelemede:** Sekiz kararın tutanağı ve orijinal Word raporlarının Markdown aktarımları ayrı PR’lara gönderildi. Bunlar henüz develop teslimatı değildir; geçmiş raporlar sprint planını anlatır, yeni gerçekleşme kanıtı sayılmaz. | #21 → [PR #119](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/119), [PR #120](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/120); #28 → [PR #121](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/121); #35 → [PR #122](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/122) |
| Ümit Efe Özkaleli | **İncelemede:** JWT oturumu, proje ekranları ve API entegrasyonu frontend PR’ında bulunuyor. Ürün belgeleri için de PR’lar açılmış; frontend’in develop’a birleştiği veya Figma onayı alındığı doğrulanmadı. | #43 → [PR #93](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/93); PR #111–#113 |
| Mustafa Şahin | **Birleşti (30 Ekim):** RBAC, Yönetici kullanıcı ekleme/rol atama, proje CRUD ve üyelik API’leri develop’a alındı. Büyük kimlik, büyük gövde ve Türkçe doğrulama hataları düzeltildi. PR #109’da onay ve başarılı CI var; bu durum tüm yetki açıklarının kapandığı anlamına gelmez (#110 açık). | #44 → [PR #109](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/109), commit `ca71984`; #102/#103/#105 → [PR #108](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/108), `cbf522b` |
| Buğra Durmuş | **Birleşti (30 Ekim):** Rol/yetki ve proje üyeliği şeması, tarih bütünlüğü kısıtı, indeksler, yetki/üyelik örnek verisi ve repository desteği develop’a alındı. #45 kapalı; PR’da inceleme onayı var. | #45 → [PR #107](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/107), merge commit `9eb2eb3` |
| Utku Uzun | **Birleşti (30 Ekim):** Test Turu #1 belgesi ve sadeleştirilmiş rapor şablonu/README güncellemesi. Tur kaydı: 26/29 Ekim’de 20 deneme, 15 geçen, 4 hata ve 1 bloke. Bunlar düzeltme sonrası yeniden test sonucu değildir. **İncelemede:** ayrı RBAC/proje kabul testi PR’ı; #46 hâlâ açık. | [PR #106](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/106), `7fbe9c8`; [PR #95](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/95), `f92d362`; [PR #101](https://github.com/Utkuuzun14/proje-yonetim-sistemi/pull/101); #46 |

**Ara ilerleme değerlendirmesi:** Backend ve veritabanı artışı develop’ta mevcut; açık frontend ve kabul testi PR’ları nedeniyle sprint hedefinin uçtan uca ve müşteri kabulüyle tamamlandığı söylenemez. Tamamlanma yüzdesi ve burndown sonucu için doğrulanmış ölçüm sunulmadığından oran hesaplanmamıştır.

**Proje dokümanına API bağlantıları:** [API sözleşmesi](../backend/api-sozlesmesi.md), [OpenAPI v0.5 kaynağı](../../server/src/docs/openapi.yaml), [backend çalıştırma ve Swagger yönergesi](../../server/README.md). Bunlar kaynak/yönerge bağlantılarıdır; bu rapor hazırlanırken yeni bir canlı API testi yapılmamıştır.

## Haftaya yapılacaklar

**Plan dönemi:** 2–8 Kasım 2026, Sprint 4 — Görev Yönetimi & Kanban Panosu. Kaynak: yol haritası Bölüm 6, s. 15 ve #47–#53. Aşağıdakiler planlanan işlerdir; tamamlandıkları veya ekipçe yeniden taahhüt edildikleri iddia edilmez.

| Kişi | Yapılacak iş | Kart |
|---|---|---|
| Hakan Koço | MVP ara demo ve sprint review organizasyonu; geride kalan MoSCoW maddelerinin yeniden planlanması; onaylı sürüm süreci kapsamında v0.5 hazırlığı. | [#47](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/47) |
| Abdulkahhar Türkoğlu | MVP kullanıcı kabul testi ve geri bildirim listesi; müşteri sunumu; görev detay paneli gibi statik bileşenlerde frontend desteği. | [#48](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/48) |
| Mert Yanık | Sprint 3 raporu (Rapor #5), doğrulanmış kanıtlarla MVP ara raporu ve ara demo toplantı notları. Yüzde ve burndown verisi ancak ölçüm doğrulanırsa kullanılacak. | [#49](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/49) |
| Ümit Efe Özkaleli | Görev listesi/oluşturma/düzenleme, kişi atama seçici, sürükle-bırak Kanban, görev detay paneli ve yorum alanı. | [#50](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/50) |
| Mustafa Şahin | Görev CRUD, atama ve durum güncelleme; yorum endpoint’leri; durum/kişi/tarih filtreleri. | [#51](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/51) |
| Buğra Durmuş | Görev, yorum ve durum geçmişi tabloları; her durum değişiminde geçmiş kaydı; gerçekçi demo seed verisi. | [#52](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/52) |
| Utku Uzun | Görev/yorum API testleri, E2E altyapısı ve ilk Kanban senaryosu; regresyon test listesi. | [#53](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/53) |

**Not / engel:** [#110](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/110) yüksek önem dereceli kullanıcı detayı yetki açığı açık. 31 Ekim–1 Kasım için gerçekleşme kaydı yok; bu günlerdeki teslimat ve test sonuçları, onaylar ve açık PR durumları hafta kapanışında yeniden doğrulanmalı. Bu rapor ara ilerleme taslağıdır; hocaya gönderim, nihai kabul veya #42’nin tüm süreç adımlarının tamamlandığı iddia edilmez.

**Raporlama kaynağı ve sınırı:** 30 Ekim 2026’da okunan açık/kapalı Issue ve PR kayıtları ile develop commit geçmişi kullanılmıştır. [Test Turu #1](../test/test-turlari/tur-01.md) tarihsel sonuçları korunmuştur. Önceki raporların plan/gerçekleşme ayrımı sürdürülmüş; bu belge şablondaki kişi bazlı iki tablo düzeniyle hazırlanmıştır.
