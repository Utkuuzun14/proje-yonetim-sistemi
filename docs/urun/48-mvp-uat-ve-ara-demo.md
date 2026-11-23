# MVP UAT raporu ve ara demo anlatımı

**Güncelleme Tarihi:** 23 Kasım 2026 · **Kart:** #48 (PR #136) · **Kilometre Taşı:** M3 — MVP & Ara Demo  
**Test ve Sunum Sorumlusu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)  
**UAT Kararı:** **KABUL EDİLDİ (ONAYLANDI)** — `develop` (`d54dd5d`) birleştirmesi sonrası 23 Kasım 2026 canlı kabul koşusunda `M-01` – `M-07` senaryolarının tamamı (7/7) başarıyla geçti; kritik veya yüksek açık hata kalmadı.

---

## Değerlendirilen artış ve bağımlılıklar
* Güncel `develop` (`d54dd5d` — `v0.5`) kimlik doğrulama, RBAC rol/proje yönetimi, görev/yorum/durum geçmişi API'lerini, gerçek Kanban arayüzünü, dosya paylaşımını, takvim/salt okunur Gantt görünümünü ve Sprint 0–5 dokümanlarını eksiksiz içerir.
* Görev/yorum/durum geçmişi ve Kanban arayüzü PR'ları (`#133`, `#134` veritabanı migrationları; `#131`, `#132` görev/yorum/dosya API; `#129` Kanban/takvim/dosya ekranları; `#128`, `#130`, `#140` E2E ve güvenlik testleri) `develop` dalına birleştirilmiştir.
* **Canlı Koşu Ortamı:** PostgreSQL 16 (`init.sql` + `001`..`003` migrationlar + `seed.sql`), Express REST API (`:5000`) ve React/reverse-proxy istemcisi (`:3000`) üzerinde tüm senaryolar canlı olarak koşulmuş ve doğrulanmıştır.

---

## UAT koşu seti (M3 — v0.5 Adayı) — Canlı Koşu Sonuçları
**Test Ortamı:** Canlı test/staging veritabanı (`develop` `d54dd5d`), **Admin A** (`hakan@sektech.com`), aynı projedeki **Member B** (`utku@sektech.com`), dışarıdaki **Member C** (`umitefe@sektech.com`).  
**Senaryo Verisi:** Admin A “Etkinlik Sitesi” projesini oluşturup Member B'yi projeye ekledi.

| Test | Adımlar | Beklenen / kabul kanıtı | Canlı UAT Sonucu (23 Kasım 2026) |
| :--- | :--- | :--- | :--- |
| **M-01** | Admin A projeyi oluşturur; Member B listeler; Member C doğrudan URL açar | A ve B projeye erişir; C veri göremez ve API `403`/`404` döner | **GEÇTİ** — Admin A projeyi oluşturdu (`201`), Member B listeledi ve açtı; Member C hem API'de (`GET /api/projects/:id` $\rightarrow$ `404`) hem de tarayıcıda doğrudan URL açtığında uyarı alarak içeriği göremedi (`TS-ROL-04/05`). |
| **M-02** | Member B görev açar, B'ye atar; sayfa yenileme (F5) ve ikinci oturum açar | Görev `To Do` sütununda kalıcıdır; aynı görev iki oturumda tutarlı görünür | **GEÇTİ** — Member B “Kayıt formu” görevini oluşturdu (`201`); sayfa yenilemesinde (`F5`) ve Admin A'nın ayrı tarayıcı oturumunda görev `To Do (Yapılacak)` sütununda kalıcı olarak görüntülendi (`TS-KNB-01`). |
| **M-03** | Görevi `Done` sütununa taşı; görev detayından durum geçmişini aç | Eski/yeni durum, değiştiren kişi ve zaman damgası tek atomik kayıt olarak görünür | **GEÇTİ** — Görev `Done (Tamamlandı)` durumuna alındığında `PATCH /api/tasks/:id` ve `GET /api/tasks/:id/history` ile detay modalında `Yapılacak → Tamamlandı · Utku Uzun · <tarih/saat>` atomik kaydı doğrulandı (`TS-KNB-01`). |
| **M-04** | Durum güncelleme isteğinde ağ/500 hatası simüle et | Kart eski sütununa geri döner (rollback) ve kullanıcıya anlamlı hata mesajı görünür | **GEÇTİ** — `PATCH /api/tasks/:id` üzerinde `500` hatası simüle edildiğinde kart iyimser taşıma sonrası eski sütununa geri döndü (rollback) ve ekranda `role="alert"` hata bildirimi gösterildi (`TS-KNB-02`). |
| **M-05** | Member B göreve yorum yazar; Member C doğrudan okuma/yazma dener | B yorumu kronolojik akışta görür; C erişemez (`403`/`404`) | **GEÇTİ** — Member B'nin yazdığı yorum yazar adı (`Utku Uzun`) ve zaman damgasıyla kronolojik listede kalıcı oldu; Member C'nin okuma ve yazma istekleri `404` ile reddedildi, ayrıca HTML/script yüklerinin düz metin olarak güvenli render edildiği (`R-YRM-03`) doğrulandı (`TS-YRM-01`). |
| **M-06** | Boş/aşırı uzun görev başlığı, proje dışı sorumlu veya ters tarih gir | Kayıt oluşmaz; doğrulama uyarısı çıkar ve formdaki mevcut girdi korunur | **GEÇTİ** — `150` karakter üstü başlık (`400`), proje dışı kullanıcı ataması (`400`) ve `bitiş < başlangıç` ters tarihi (`Bitiş tarihi başlangıçtan önce olamaz.`) reddedildi; hata sonrası formdaki mevcut metin korundu. |
| **M-07** | `ESC`, `Tab` ve klavye ile görev detay panelini açıp durum seç | Odak panel içinde kalır; `ESC` ile kapanınca tetikleyici karta geri döner | **GEÇTİ** — Kart üzerindeki erişilebilir durum seçicisi (`<Görev> durumu`) klavyeyle durumu güncelledi; `<dialog>` modalı açılıp `Escape` tuşuna basıldığında modal kapandı ve `document.activeElement` odağının tetikleyici görev kartı düğmesine geri döndüğü doğrulandı. |

---

## Geri bildirim ve statik panel desteği
* **Önceki Tur Bulgularının Kapanışı (#110 & #51):** Kullanıcı bilgisi sızıntısı (`#110`) ve görev/yorum sunucu API'si (`#51`) birleştirilen PR'lar (`#131`, `#133`, `#129`) ile tamamen giderilmiş ve regresyon testlerinde (`215` sunucu testi, `92` istemci testi, `20` Playwright E2E testi) doğrulanmıştır.
* **Kapsam ve Güvenlik Doğrulaması:** Görev detayındaki açıklama ve yorum alanlarında XSS/script yüklerinin çalıştırılmadan düz metin olarak gösterildiği (`R-YRM-03`), dosya eklerinin görevlerle ilişkilendirilebildiği (`#58`, `#59`) ve durum geçmişinin (`#52`) satır kilidi (`FOR UPDATE`) ile atomik yazıldığı canlı ortamda teyit edilmiştir.
* **Statik Bileşen Destek Özeti:** Görev düzenleme, detay modalı ve yorum paneli bileşenleri (`client/src/live/Tasks.tsx` ve `client/src/workspace/Modal.tsx`) tek bir tasarım sistemi altında çalışmaktadır. İnceleme kriterlerinin tamamı (erişilebilir başlık `aria-labelledby="dialog-title"`, sorumlu/tarih/durum alanları, boş yorumda gönder düğmesinin devre dışı kalması, hatada girdi koruma, `Escape`/odak dönüşü ve dar ekran uyumu) canlı UAT sırasında doğrulandı.

---

## 8 dakikalık müşteri anlatımı (M3 Ara Demo Senaryosu)
1. **(1 dk) Problem & Hikâye:** *“Ekip, hangi işin kimde ve ne zaman biteceğini tek yerde göremiyordu.”* — “Etkinlik Sitesi” projesi üzerinden ekip içi iş dağılımı ihtiyacını tanıt.
2. **(2 dk) Kurulum & Yetki Sınırı:** Yönetici (Admin A) projeyi kurar, Member B'yi ekler; yetkisiz kullanıcının (Member C) projeye erişemediği rol izolasyonunu canlı göster.
3. **(3 dk) Uçtan Uca Görev & Kanban Akışı:** “Kayıt formu” görevini oluşturup Member B'ye ata; kartı *Devam ediyor (In Progress)* $\rightarrow$ *Tamamlandı (Done)* yap, yorum ekle ve otomatik **Durum Geçmişi** kaydını canlı göster.
4. **(1 dk) İş Değeri & Görünürlük:** Görev sorumluluğu, tarih takibi ve tamamlanma görünürlüğünün proje yöneticisi ve müşteriye sağladığı kontrolü özetle.
5. **(1 dk) Kapanış & UAT Durumu:** Tamamlanan `v0.5` MVP kapsamını, `7/7` geçen UAT sonuçlarını ve sonraki sprint (Raporlama & Analiz) hedeflerini paylaş.

---

## Çıkış kapısı (Definition of Done) — Kapanış Onayı
* **Onaylayan:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)
* **Tarih ve Sürüm:** 23 Kasım 2026 · `develop` (`d54dd5d` — `v0.5` MVP)
* **Kanıt Özeti:** `compose-smoke.mjs` tam sistem doğrulaması (`PASS`), sunucu birim/API testleri (`14/14` paket, `215` geçen test), istemci testleri (`10/10` paket, `92` geçen test), Playwright E2E testleri (`20/20` geçen senaryo) ve `M-01` – `M-07` canlı UAT koşusu (`7/7` başarılı) tamamlanarak `#48` resmi olarak onaylanmıştır.
