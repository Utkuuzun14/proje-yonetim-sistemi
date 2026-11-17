# MVP UAT raporu ve ara demo anlatımı

**Güncelleme Tarihi:** 17 Kasım 2026 · **Kart:** #48 · **Kilometre Taşı:** M3 — MVP & Ara Demo (22 Kasım 2026 Pazar)  
**Test ve Sunum Sorumlusu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)  
**UAT Kararı:** Bekliyor (20 Kasım Cuma `develop` birleştirmesi sonrası canlı koşu ve onay yapılacak).

---

## Değerlendirilen artış ve bağımlılıklar
* Güncel `develop` (`64def5d`) kimlik, rol, proje API'lerini ve Sprint 0–3 dokümanlarını içerir.
* Görev/yorum/durum geçmişi ve Kanban arayüzü geliştirmeleri aktif PR'larda (`#133`, `#134` veritabanı; `#131`, `#132` görev/dosya API; `#129` Kanban arayüzü) inceleme aşamasındadır.
* **Plan:** PR'lar 20 Kasım Cuma günü sırayla `develop` dalına birleştirildikten sonra canlı UAT koşusu tamamlanacak, 21 Kasım Cumartesi demo provası yapılacak ve 22 Kasım Pazar M3 ara demosu sunulacaktır.

---

## UAT koşu seti (M3 — v0.5 Adayı)
**Test Ortamı:** Ayrı staging/test veritabanı (`develop` birleşimi sonrası), **Admin A**, aynı projedeki **Member B**, dışarıdaki **Member C**.  
**Senaryo Verisi:** Admin A “Etkinlik Sitesi” projesini oluşturup Member B'yi projeye ekler. Test başında sürüm etiketi ve veri seti kaydedilir.

| Test | Adımlar | Beklenen / kabul kanıtı | Durum |
| :--- | :--- | :--- | :--- |
| **M-01** | Admin A projeyi oluşturur; Member B listeler; Member C doğrudan URL açar | A ve B projeye erişir; C veri göremez ve API `403`/`404` döner | API smoke kanıtı var; birleşim sonrası UI doğrulaması bekliyor |
| **M-02** | Member B görev açar, B'ye atar; sayfa yenileme (F5) ve ikinci oturum açar | Görev `To Do` sütununda kalıcıdır; aynı görev iki oturumda tutarlı görünür | `#131` ve `#129` birleşimi bekliyor |
| **M-03** | Görevi `Done` sütununa taşı; görev detayından durum geçmişini aç | Eski/yeni durum, değiştiren kişi ve zaman damgası tek atomik kayıt olarak görünür | `#133` ve `#131` birleşimi bekliyor |
| **M-04** | Durum güncelleme isteğinde ağ/500 hatası simüle et | Kart eski sütununa geri döner (rollback) ve kullanıcıya anlamlı hata mesajı görünür | `#129` birleşimi sonrası canlı doğrulama bekliyor |
| **M-05** | Member B göreve yorum yazar; Member C doğrudan okuma/yazma dener | B yorumu kronolojik akışta görür; C erişemez (`403`/`404`) | `#131` ve `#129` birleşimi bekliyor |
| **M-06** | Boş/aşırı uzun görev başlığı, proje dışı sorumlu veya ters tarih gir | Kayıt oluşmaz; doğrulama uyarısı çıkar ve formdaki mevcut girdi korunur | `#129` birleşimi sonrası canlı doğrulama bekliyor |
| **M-07** | `ESC`, `Tab` ve klavye ile görev detay panelini açıp durum seç | Odak panel içinde kalır; `ESC` ile kapanınca tetikleyici karta geri döner | Canlı erişilebilirlik testi bekliyor |

---

## Geri bildirim ve statik panel desteği
* **Önceki Tur Bulguları (#110 & #51):** Kullanıcı bilgisi sızıntısı (`#110`) ve eksik görev/yorum sunucu API'si (`#51`) toparlanma haftası PR'ları (`#131`, `#133`, `#129`) ile çözüme bağlanmıştır. Birleşim sonrası regresyon kontrolü yapılacaktır.
* **Kapsam Notu:** Görev detayındaki Markdown formatı, dosya ekleri (`#58`, `#59`) ve durum geçmişi (`#52`) SRS v1.1 kapsamıyla birebir karşılaştırılarak UAT sırasında doğrulanacaktır.
* **Statik Bileşen Destek Özeti:** Görev düzenleme, detay çekmecesi ve yorum paneli bileşenleri (`Tasks.tsx` ve `Modal.tsx`) tek bir tasarım sistemi altında birleştirilmiş olup yeni kopya bileşen üretilmemiştir. İnceleme kriterleri (erişilebilir başlık, sorumlu/tarih/durum alanları, boş yorum engelleme, hatada girdi koruma, `Escape`/odak dönüşü ve dar ekran uyumu) canlı UAT sırasında işaretlenecektir.

*Her yeni bulgu için tekrar adımı, beklenen/gerçek davranış, sürüm, önem derecesi ve ekran görüntüsü/log kanıtı kaydedilir.*

---

## 8 dakikalık müşteri anlatımı (M3 Ara Demo Senaryosu)
1. **(1 dk) Problem & Hikâye:** *“Ekip, hangi işin kimde ve ne zaman biteceğini tek yerde göremiyordu.”* — “Etkinlik Sitesi” projesi üzerinden ekip içi iş dağılımı ihtiyacını tanıt.
2. **(2 dk) Kurulum & Yetki Sınırı:** Yönetici (Admin A) projeyi kurar, Member B'yi ekler; yetkisiz kullanıcının (Member C) projeye erişemediği rol izolasyonunu canlı göster.
3. **(3 dk) Uçtan Uca Görev & Kanban Akışı:** “Kayıt formu” görevini oluşturup Member B'ye ata; kartı *Devam ediyor (In Progress)* $\rightarrow$ *Tamamlandı (Done)* yap, yorum ekle ve otomatik **Durum Geçmişi** kaydını canlı göster. *(Birleşmemiş/önizleme kalan bir uç nokta varsa sunumda şeffaf biçimde belirt.)*
4. **(1 dk) İş Değeri & Görünürlük:** Görev sorumluluğu, tarih takibi ve tamamlanma görünürlüğünün proje yöneticisi ve müşteriye sağladığı kontrolü özetle.
5. **(1 dk) Kapanış & UAT Durumu:** Tamamlanan kapsamı, UAT sonuçlarını ve kalan sprint hedeflerini paylaş; yalnızca canlı gösterilen kapsam üzerinden müşteri onayı al.

---

## Çıkış kapısı (Definition of Done)
* Seçilen `v0.5` adayı üzerinde `M-01` – `M-07` senaryolarının tamamı geçer, kritik/yüksek açık hata kalmaz, ilgili PR'lar `develop` dalına birleşir ve kabul eden kişi (Abdulkahhar Türkoğlu), tarih ve test kanıtları bu dosyaya işlenerek `#48` kapatılır.
