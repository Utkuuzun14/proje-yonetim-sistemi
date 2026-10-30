# Karar Tutanağı — Sprint 3 Kararları

#21 kapsamında, karar tutanağı şablonunun üst bilgi, karar tabloları ve aksiyon yapısı kullanılmış; konu başlıkları Sprint 3 kararlarına uyarlanmıştır. Bu belge Sprint 0 toplantısının gerçekleştiğine ilişkin bir kayıt değildir.

**Kaynak:** [Hakan Koço’nun #96 yorumundaki “Kararlar (29 Ekim 2026)” tablosu](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/96#issuecomment-6497201808). Issue gövdesindeki yedi öneri yerine, yorumdaki sekiz nihai karar esas alınmıştır.

| Alan | Değer |
|---|---|
| Karar tarihi / toplantı saati | 29 Ekim 2026 / Toplantı saati belirtilmemiş. |
| Yer / kanal | Karar kaydı GitHub #96 yorumunda; toplantı yeri veya kanalı belirtilmemiş. |
| Toplantıyı yöneten | Belirtilmemiş. Kararları yayımlayan: Hakan Koço. |
| Tutanağı yazan | #21 sorumlusu Mert Yanık (mrtynk) adına GitHub kaydından derlenmiştir. |
| Katılımcılar | Kaynakta belirtilmemiş; katılım doğrulanamadı. |
| Karar yöntemi | Kaynakta belirtilmemiş; oylama sonucu doğrulanamadı. |

---

## Karar 1 · Takvim

**Seçenekler:** PDF’in asıl takvimi veya kaydırılmış takvim.

| Alan | Değer |
|---|---|
| Seçilen | A — PDF’in asıl takvimi. 26 Ekim – 1 Kasım 2026 haftası Sprint 3 (#40–#46). |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

## Karar 2 · API sözleşmesi

**Seçenekler:** v0.5’i dondurmak veya dondurmamak.

| Alan | Değer |
|---|---|
| Seçilen | A — v0.5 donduruldu (`server/src/docs/openapi.yaml`). Değişiklik gerekirse PR’da gerekçesiyle yapılır. |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

## Karar 3 · Oturum modeli

**Seçenekler:** Tek 8 saatlik JWT veya 1 saat access + 7 gün refresh token.

| Alan | Değer |
|---|---|
| Seçilen | A — Tek 8 saatlik JWT, refresh token yok. SRS FR-02 buna göre güncellenecek (#97). |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

## Karar 4 · Veri modelinde tek kaynak

**Seçenekler:** Veritabanı şeması veya SRS 5. bölüm.

| Alan | Değer |
|---|---|
| Seçilen | A — `database/init.sql` esas. SRS 5. bölüm buna göre güncellenecek (#97). |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

## Karar 5 · Hi-fi mockup

**Seçenekler:** Figma’da ayrı mockup veya çalışan arayüzün ekran görüntüleri + tasarım sistemi sayfası.

| Alan | Değer |
|---|---|
| Seçilen | Ümit ana ekranları Figma’da çizecek (#36). Issue gövdesindeki B önerisi nihai karar olarak alınmamıştır. |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |
| Hocaya teyit gerekiyor mu? | Nihai karar yorumunda belirtilmemiş; gövdedeki öneri teyit sonucu sayılmamıştır. |

## Karar 6 · #44 iş paylaşımı

**Seçenekler:** Mustafa’da kalması + Buğra desteği veya işin bölünmesi.

| Alan | Değer |
|---|---|
| Seçilen | Mustafa’da kalıyor, Buğra destek veriyor. Gövdedeki Çarşamba akşamı koşulu nihai yorumda tekrarlanmamıştır. |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

## Karar 7 · Ekip fotoğrafları

**Seçenekler:** Reponun private yapılması veya fotoğrafların PDF’ten çıkarılması; nihai karar mevcut durumu korumaktır.

| Alan | Değer |
|---|---|
| Seçilen | Olduğu gibi kalıyor; repo açık, PDF değişmiyor (#83). |
| Gerekçe | Kaynakta ayrıca belirtilmemiş. |
| Oylama sonucu | Kaynakta belirtilmemiş; oy sayıları doğrulanamadı. |

## Karar 8 · Ekip Üyesi proje düzenleyebilir mi?

**Konu:** #101’deki proje düzenleme yetkisi.

| Alan | Değer |
|---|---|
| Seçilen | Hayır. Proje düzenleme, silme ve üye ekleme yalnızca Yönetici’de. SRS yetki tablosu v1.1’de düzeltilecek (#97). |
| Gerekçe | API sözleşmesi ve FR-04 geçerli. |
| Oylama sonucu | Kaynakta belirtilmemiş. |

---

## Diğer kararlar

Kaynak yorumda bu sekiz karar dışında ek karar bulunmuyor. Sprint 0 şablonundaki metodoloji, teknoloji yığını, veritabanı ürünü ve takip aracı seçimleri bu yorumdan doğrulanamadığından geçmiş toplantının kararları gibi doldurulmamıştır.

## Aksiyonlar

| Aksiyon | Sorumlu | Son tarih | Kart |
|---|---|---|---|
| FR-02’yi JWT kararına, SRS 5. bölümü veritabanı şemasına ve yetki tablosunu Yönetici yetkilerine göre güncellemek | Abdulkahhar Türkoğlu (#97 ataması) | Karar yorumunda belirtilmemiş | [#97](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/97) |
| Ana ekranları Figma’da çizmek | Ümit Efe Özkaleli | Karar yorumunda belirtilmemiş | [#36](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/36) |
| #44’ü Mustafa sorumluluğunda, Buğra desteğiyle yürütmek | Mustafa Şahin; destek: Buğra Durmuş | Karar yorumunda belirtilmemiş | [#44](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/44) |
| Kararları WhatsApp grubunda duyurmak | Hakan Koço (#96 sorumlusu) | Karar yorumunda belirtilmemiş | [#96](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/96) |
| Kararları tutanağa işlemek | Mert Yanık | 1 Kasım 2026 (#21 takip yorumu) | [#21](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/21) |

**Açık bilgi / kapsam notları:**

- Kararın kayda geçmesi, ilgili aksiyonun tamamlandığı anlamına gelmez. WhatsApp duyurusunun yapıldığı doğrulanmadı; kaynakta yapılacağı belirtiliyor.
- Toplantı saati, katılımcılar, karar yöntemi ve oy sayıları kaynakta yoktur.
- #21’de ayrıca istenen Haftalık Rapor #1 bu tutanağın kapsamı dışındadır; kartın tüm çıktılarının tamamlandığı iddia edilmez.
- #21’in eksik çıktı ve son tarih kaydı: [Utku’nun takip yorumu](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/21#issuecomment-6496367323).
