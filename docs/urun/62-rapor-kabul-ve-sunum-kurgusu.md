# Rapor ekranları kabul testi (UAT) ve final sunum kurgusu

**Güncelleme Tarihi:** 23 Kasım 2026 · **Kart:** #62 · **Sprint:** Sprint 6 (Raporlama ve Analiz Haftası: 23–29 Kasım 2026)  
**Test ve Sunum Sorumlusu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)  
**İlgili Bağımlılıklar:** `#65` (Raporlama API), `#66` (Raporlama SQL & İndeksler), `#64` (Raporlama Arayüzü), `#67` (Raporlama Kabul & Regresyon Testleri)  
**UAT Kararı:** **Beklemede** — `#64`, `#65` ve `#66` PR'ları `develop` dalına birleştirildikten sonra canlı koşu yapılacak ve sonuçlar bu tabloya işlenecektir.

---

## 1. Güncel Takvim ve Kapsam Sınırları (14 Kasım Kararı)

### Güncel Teslim Takvimi
* **23 – 29 Kasım 2026:** Raporlama ve Analiz Haftası (Sprint 6 — `#61`..`#67`)
* **29 Kasım 2026 Pazar:** **M4 — Özellik Dondurma (Feature Freeze)** (Tüm Must özelliklerin `develop` üzerinde tamamlanması)
* **3 Aralık 2026 Perşembe:** **M5 — Sürüm Adayı (Release Candidate / RC `v1.0-rc1`) & Uçtan Uca UAT (`#69`)**
* **7 Aralık 2026 Pazartesi:** **M6 — Final Teslim (`v1.0`) ve Müşteri Sunumu**

### Raporlama Kapsamı (Sadece 3 Temel Rapor Türü)
14 Kasım ekip kararı uyarınca raporlama modülü müşteriye doğrudan karar desteği sağlayan **3 temel rapor türü** ile sınırlandırılmıştır:
1. **Proje İlerleme Yüzdesi Raporu:** Seçili projedeki toplam görev sayısı, durum dağılımı (`To Do`, `In Progress`, `Done`), geciken görev sayısı ve tamamlanma yüzdesi (`Done / Toplam * 100`).
2. **Kişi Bazlı Tamamlama Raporu:** Proje üyelerinin her birine atanan toplam görev, tamamlanan (`Done`), devam eden (`In Progress`), yapılacak (`To Do`) ve son tarihi geçmiş bitmemiş (`Geciken`) görev sayıları ile tamamlanma oranı. *(Not: Görev sayıları iş yükü dengeleme verisidir; personel performans puanı olarak sunulmaz.)*
3. **Tarih Aralıklı İlerleme Raporu:** Kullanıcının seçtiği başlangıç ve bitiş tarihleri (`from` – `to`, kapsayıcı sınırlar) arasında `task_status_history` ve görev kayıtlarına göre oluşturulan/tamamlanan görev özeti.

> **Kapsam Dışı (Dönem Sonrasına Bırakılanlar):**
> * Günlük, haftalık ve aylık olarak ayrıştırılmış karmaşık periyodik trend/burndown grafikleri,
> * Gantt şeması üzerinden sürükle-bırak tarih düzenleme ve milestone yönetimi,
> * PDF/CSV dışa aktarımında gelişmiş şablonlama (temel görünüm dışında kalanlar).

---

## 2. Sabit Kabul Veri Seti ve UAT Koşu Tablosu (`R-01` – `R-07`)

### Hesabı Belli Kabul Veri Seti ("Etkinlik Sitesi" Projesi)
* **Toplam Görev:** `10` görev $\rightarrow$ `4 Done`, `3 In Progress`, `3 To Do` $\rightarrow$ **Proje İlerleme Yüzdesi: `%40`**.
* **Üye 1 (Ayşe / Utku):** `5` atanan görev $\rightarrow$ `2 Done`, `2 In Progress`, `1 To Do`. Bitmemiş görevlerden `2` tanesinin bitiş tarihi geçmiş $\rightarrow$ **`2 Geciken`** (`%40` tamamlama).
* **Üye 2 (Can / Ümit):** `5` atanan görev $\rightarrow$ `2 Done`, `1 In Progress`, `2 To Do`. Bitmemiş görevlerden `1` tanesinin bitiş tarihi geçmiş $\rightarrow$ **`1 Geciken`** (`%40` tamamlama).
* **Kural:** Durumu `Done` olan bir görevin bitiş tarihi geçmiş olsa dahi **geciken** sayısına dahil edilmez. Proje toplam geciken görev sayısı **`3`** olmalıdır.

### Rapor Kabul Testi (UAT) Senaryoları

| Kod | Rapor Türü / Kapsam | Test Adımları | Beklenen / Kabul Kanıtı | Canlı UAT Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **1. Proje İlerleme Yüzdesi** | 10 görevlik örnek projenin rapor ekranını aç (`GET /api/projects/:id/reports/progress`) | İlerleme **`%40`**, durum dağılımı **`4 Done / 3 In Progress / 3 To Do`**, toplam **`10`**, geciken **`3`** olarak görünür | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-02** | **1. Proje İlerleme Yüzdesi (Sınır Durum)** | Hiç görevi olmayan (`0` görevli) yeni bir projenin rapor ekranını aç | Tamamlanma **`%0`** ve anlaşılır boş durum mesajı görünür; arayüzde veya API'de `NaN`, `null%` ya da `Infinity` hatası oluşmaz | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-03** | **2. Kişi Bazlı Tamamlama** | Aynı projede Kişi Bazlı Tamamlama tablosunu/kartlarını aç | Üye 1 için **`5 atanan / 2 biten / 2 geciken (%40)`**; Üye 2 için **`5 atanan / 2 biten / 1 geciken (%40)`** değerleri doğru listelenir | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-04** | **2. Kişi Bazlı Tamamlama (Atanmamış & Tamamlanmış)** | `assignee_id = null` görev ekle ve tarihi geçmiş bir görevi `Done` yap | Atanmamış görev kişi satırlarını bozmaz (`Atanmamış` kaleminde veya toplamda açıkça gösterilir); `Done` yapılan iş geciken sayısından düşer | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-05** | **3. Tarih Aralıklı İlerleme** | Başlangıç (`from`) ve bitiş (`to`) tarihi seçerek tarih aralıklı raporu sorgula | Seçilen tarih sınırları (başlangıç ve bitiş günleri dahil) içindeki tamamlanan/değişen görev sayıları `task_status_history` ile tutarlı döner | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-06** | **3. Tarih Aralıklı İlerleme (Doğrulama)** | Ters tarih aralığı (`to < from`) veya geçersiz tarih formatı gir | İstemci ve API `400 Bad Request` ile anlamlı doğrulama uyarısı verir; ekran çökmez ve önceki geçerli rapor verisi korunur | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |
| **R-07** | **Yetki ve Veri İzolasyonu (RBAC)** | Proje üyesi olmayan kullanıcı (Member C) başka projenin rapor URL'sini veya API uç noktasını çağırır | Veri sızıntısı olmaz; API `403`/`404` döner ve arayüzde erişim engeli uyarısı gösterilir | **Beklemede** — `#64`/`#65`/`#66` birleşimi sonrası koşulacak |

---

## 3. Final Müşteri Sunumu Kurgusu Taslağı (`Problem → Çözüm → Canlı Demo`)

**Toplam Süre:** 10 Dakika · **Hedef:** Teknik terim listesi yerine müşterinin iş problemini çalışan yazılım ve ölçülebilir raporlarla nasıl çözdüğümüzü göstermek.

| Bölüm & Süre | Başlık | Ekran / Materyal | Anlatıcı / Rol | Ana Mesaj ve İçerik |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 – 01:30** *(1,5 dk)* | **1. Problem Tanımı** | Sunum Giriş / "Etkinlik Sitesi" Senaryo Özeti | **Abdulkahhar Türkoğlu** *(Ürün Sahibi / Müşteri Temsilcisi)* | *“Ekip içinde hangi işin kimde olduğu, ne zaman biteceği ve hangi dokümanın güncel olduğu farklı mesajlaşma kanallarında kayboluyordu; durum toplantıları bilgi toplama mesaisine dönüşüyordu.”* |
| **01:30 – 02:30** *(1 dk)* | **2. Çözüm ve Mimari Yaklaşım** | Sistem Özeti & Rol Matrisi (`Yönetici` / `Ekip Üyesi`) | **Hakan Koço** *(Proje Yöneticisi)* | Rol tabanlı proje izolasyonu, atomik durum geçmişine sahip Kanban panosu, salt okunur zaman çizelgesi (Takvim/Gantt), güvenli dosya paylaşımı ve 3 temel karar raporundan oluşan entegre çözüm. |
| **02:30 – 06:30** *(4 dk)* | **3. Canlı Demo (Bölüm A: Operasyonel Akış — `v0.5`)** | Canlı Sistem (`Proje → Kanban → Yorum/Geçmiş → Takvim/Gantt → Dosya`) | **Ümit Efe Özkaleli & Mustafa Şahin** *(FE / BE Gösterimi)* | Yönetici ve Ekip Üyesi oturumlarında uçtan uca görev açma, Kanban'da durum taşıma, geçmiş kaydı, takvim/Gantt kontrolü ve 10 MB/MIME korumalı dosya paylaşımı. |
| **06:30 – 08:30** *(2 dk)* | **4. Canlı Demo (Bölüm B: Raporlama & Karar Desteği — `Sprint 6`)** | Canlı Sistem (`Raporlar: Proje İlerlemesi, Kişi Bazlı, Tarih Aralıklı`) | **Abdulkahhar Türkoğlu & Buğra Durmuş** | *“10 işin 4'ü tamamlandı (%40), 3 iş gecikti.”* Kişi bazlı iş yükü dağılımını ve seçilen tarih aralığındaki ilerlemeyi göstererek yöneticinin darboğazı nasıl tespit ettiğini vurgulama. |
| **08:30 – 10:00** *(1,5 dk)* | **5. Kalite Kanıtları, Kapsam ve Kapanış** | CI / Test Kapsamı (`%90+`), Staging & UAT Onay Özeti | **Utku Uzun & Mert Yanık** *(QA & Dokümantasyon)* | Otomatik birim/API/E2E test ağı, staging ortamı, bilinçli kapsam kararları (Karar 14) ve soru-cevap. |

---

## 4. Uçtan Uca Final Demo Senaryosu (`v0.5` Mevcut Akışlar + Yeni 3 Rapor Ekranı)

Final demoda sunucu üzerinde önceden yüklenmiş **"Etkinlik Sitesi"** projesi ve iki ayrı tarayıcı penceresi (**Pencere 1 — Yönetici:** `hakan@sektech.com`, **Pencere 2 — Ekip Üyesi:** `utku@sektech.com`, ayrıca yetkisiz kontrol için **Proje Dışı Üye:** `umitefe@sektech.com`) kullanılır:

1. **Adım 1 — Giriş, Proje Oluşturma ve Rol İzolasyonu (`v0.5`):**
   * Yönetici giriş yapar, **"Etkinlik Sitesi"** projesini ve atanmış üyeleri gösterir.
   * Proje dışı üyenin (`umitefe@sektech.com`) doğrudan proje URL'sine gittiğinde `404` / erişim engeli aldığı, Ekip Üyesinin (`utku@sektech.com`) ise projeyi görüntüleyip yönetim düğmelerini görmediği canlı gösterilir.
2. **Adım 2 — Görev Oluşturma, Kanban Sürükle-Bırak, Yorum ve Atomik Geçmiş (`v0.5`):**
   * Ekip Üyesi `/uygulama/projeler/:id/gorevler` ekranında **"Kayıt formu doğrulaması"** görevini oluşturur.
   * Görev kartı `To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Done` sütununa taşınır; sayfa yenilenerek (`F5`) ve Yönetici penceresinden bakılarak kalıcılık doğrulanır.
   * Görev kartına tıklanarak detay modalı açılır; yeni yorum eklenir ve **Durum geçmişi** altında `Yapılacak → Devam ediyor → Tamamlandı` geçişlerinin kişi ve zaman damgasıyla atomik kaydedildiği gösterilir.
3. **Adım 3 — Aylık Takvim ve Salt Okunur Gantt Zaman Çizelgesi (`v0.5`):**
   * `/uygulama/projeler/:id/takvim` ekranına geçilir; aylık takvimde çok günlük, ay sınırını aşan ve tek günlük görevlerin yerleşimi gösterilir.
   * **Gantt** düğmesine tıklanarak salt okunur zaman çizelgesine geçilir; görev çubukları, metin tarih etiketleri ve alttaki *"Tarihleri eksik veya geçersiz görevler"* listesi gösterilir.
4. **Adım 4 — Güvenli Dosya Yükleme, Göreve Bağlama ve İndirme (`v0.5`):**
   * `/uygulama/projeler/:id/dosyalar` ekranında Yönetici geçerli bir PDF şartnamesini göreve bağlayarak yükler (`201`).
   * Ekip Üyesi kendi oturumunda göreve göre filtreleme yapar ve dosyayı güvenli blob akışıyla indirir. Ardından `.exe` veya `10 MB` üstü dosya seçildiğinde sistemin anında reddettiği gösterilir.
5. **Adım 5 — Yeni Rapor Ekranları ile Yönetici Karar Desteği (`Sprint 6` — `#64`/`#65`/`#66`):**
   * **5.1 Proje İlerleme Yüzdesi:** Yönetici proje rapor ekranını açar; 10 görevlik veri setinde **`%40` tamamlanma** oranını, `4 Done / 3 In Progress / 3 To Do` dağılımını ve `3 geciken` görev uyarısını tek bakışta inceler.
   * **5.2 Kişi Bazlı Tamamlama:** Ekip üyelerinin üzerindeki aktif, tamamlanan ve geciken iş yükü tablosu açılır; geciken 2 işi olan üyeden diğer üyeye iş kaydırma kararının bu veriye dayanarak nasıl alındığı anlatılır.
   * **5.3 Tarih Aralıklı İlerleme:** Tarih filtresinden son sprint aralığı (`from` – `to`) seçilerek o dönemde tamamlanan görevlerin özeti filtrelenir; ardından bir görevin durumu Kanban'da `Done` yapılıp rapor ekranına dönülerek ilerleme yüzdesinin canlı güncellendiği (`%40` $\rightarrow$ `%50`) gösterilerek demo kapatılır.

---

## 5. Çıkış Kapısı (Definition of Done)
* [x] 14 Kasım kapsam kararına uygun 3 rapor türü için `R-01` – `R-07` kabul testi planı ve sabit doğrulama veri seti hazırlandı.
* [x] `Problem → Çözüm → Canlı Demo` akışına sahip 10 dakikalık final müşteri sunumu kurgusu ve konuşmacı dağılımı oluşturuldu.
* [x] `v0.5` modülleriyle yeni 3 rapor ekranını birleştiren uçtan uca final demo senaryosu yazıldı.
* [ ] `#64`, `#65` ve `#66` PR'ları `develop` dalına birleştirildikten sonra `R-01` – `R-07` canlı ortamda koşulacak ve gerçek test sonuçları/kanıtları bu dosyaya işlenecektir.
