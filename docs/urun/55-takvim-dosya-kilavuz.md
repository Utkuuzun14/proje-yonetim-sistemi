# Takvim/Gantt kabul seti ve kullanıcı kılavuzu akışları

**Güncelleme Tarihi:** 23 Kasım 2026 · **Kart:** #55 (PR #137) · **Kilometre Taşı:** M3 — MVP & Ara Demo / Sprint 5 Kapanışı  
**Test ve Kılavuz Sorumlusu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)  
**Kod İnceleme ve Entegrasyon Tabanı:** `develop` (`d54dd5d`) — birleştirilen PR'lar: `#133` ve `#134` (Veritabanı Migration & Dosya Metadata Şeması), `#131` ve `#132` (Görev/Yorum ve Dosya API), `#129` (Takvim/Gantt ve Dosya Ekranları), `#128`, `#130` ve `#140` (Güvenlik, Kapsam ve E2E Regresyon Seti).  
**UAT Kararı:** **KABUL EDİLDİ (ONAYLANDI)** — 23 Kasım 2026 canlı kabul koşusunda `T-01` – `T-07` ve `F-01` – `F-03` senaryolarının tamamı (10/10) ve sınır değer analizleri eksiksiz geçti.

---

## Kapsam Kararı ve Sabit Örnek Veri
* **Kapsam Notu (14 Kasım Kararı / Karar 14):** Gantt görünümü sadeleştirilmiş olup mevcut görev tarihlerinden üretilen **salt okunur (read-only) zaman çizelgesi** olarak sunulmuştur; Gantt üzerinden sürükle-bırak tarih düzenleme, haftalık takvim sekmesi ve milestone ekleme özellikleri dönem sonrasına bırakılmıştır.
* **Sabit Örnek Veri ("Etkinlik Sitesi" Projesi):**
  * **Görev A:** Çok günlük ve ay sınırını kesen görev (`18–20 Kasım 2026` ve ay geçişi testi için `29 Kasım – 2 Aralık 2026`, Yöneticiye atanmış)
  * **Görev B:** `19 Kasım 2026` (tek günlük görev, Ekip Üyesine atanmış)
  * **Görev C:** Tarihsiz görev (`start_date: null`, `end_date: null`)
  * **Görev D:** `15–17 Kasım 2026` (Tamamlandı / `Done`)
  * *Not:* Canlı koşuda hem mevcut ay içi görünüm hem de Kasım $\rightarrow$ Aralık ay geçişi ve tamamlanmış/tarihsiz iş ayrımları doğrulanmıştır.

---

## Takvim, Gantt ve Dosya Kabul Seti (T-01 – T-07 & F-01 – F-03) — Canlı Koşu Sonuçları

| Kod | İşlem | Beklenen / Kabul Kanıtı | Canlı UAT Sonucu (23 Kasım 2026) |
| :--- | :--- | :--- | :--- |
| **T-01** | Takvimde mevcut aydan sonraki aya geç | Çok günlük Görev A her iki aralıkta doğru hizalanır; tek günlük Görev B doğru günde görünür | **GEÇTİ** — Kasım ve Aralık ayları arasında geçişte Görev A her iki ayda ilgili gün hücrelerinde, Görev B yalnızca `2026-11-19` hücresinde doğrulandı (`TS-TKV-01/02/03`). |
| **T-02** | Takvim üzerindeki görev çubuğuna tıkla | Görev bağlantısı ilgili projenin görev/detay ekranına yönlendirir; başlık, tarih aralığı ve durum tutarlıdır | **GEÇTİ** — Takvim ve Gantt üzerindeki görev bağlantıları `/uygulama/projeler/:id/gorevler` panosuna yönlendiriyor; görev kartından detay modalı açıldığında tüm veriler birebir tutarlı. |
| **T-03** | Haftalık görünüm sekmesini kontrol et | Seçili haftanın 7 günü listelenir (kapsam dışıysa UI'da pasif/gizlidir) | **GEÇTİ** — Kapsam kararı doğrultusunda arayüzde yalnızca `Takvim` (Aylık) ve `Gantt` geçiş düğmeleri yer almakta; yanıltıcı/boş haftalık sekme bulunmamaktadır. |
| **T-04** | Salt okunur Gantt (Zaman Çizelgesi) görünümünü aç | Görev A, B ve D tarih aralıkları doğru çizilir; erişilebilirlik için renk dışında metin etiketi bulunur | **GEÇTİ** — `Salt okunur Gantt` tablosunda çubuk genişlikleri yanında `YYYY-AA-GG → YYYY-AA-GG · Durum` ve tek tarihli işlerde `(tek tarih)` metin etiketleri doğrulandı (`TS-GNT-01`). |
| **T-05** | Tarihsiz görev (C) ve ters tarih (`bitiş < başlangıç`) dene | Tarihsiz iş takvimi bozmadan ayrı listede açıklanır; ters tarihli kayıt reddedilir | **GEÇTİ** — Görev C takvim ızgarasını bozmadan alttaki *"Tarihleri eksik veya geçersiz görevler"* kartında `Başlangıç yok → Bitiş yok` olarak listelendi; ters tarih hem formda hem API'de (`400`) reddedildi. |
| **T-06** | Kapsam sınırı kontrolü (Milestone & Gantt düzenleme) | 14 Kasım kararı gereği salt okunur Gantt sunulur; Gantt içinde düzenleme alanı bulunmaz | **GEÇTİ** — Gantt tablosu içinde hiçbir `input`, `select` veya `textarea` bulunmadığı (`0` form alanı) ve tarih değişimi için Görevler ekranına yönlendirme yapıldığı doğrulandı. |
| **T-07** | Ay değiştir, dar ekran (responsive) ve klavye ile gezin | Başlık ve odak korunur; kontroller klavye ile erişilebilir ve taşma yapmaz | **GEÇTİ** — `375x667` mobil görünümde `.timeline-scroll` (`tabIndex=0`) yatay kaydırma bölgesi taşmayı önlüyor; ay/yıl seçicileri ve önceki/sonraki ay düğmeleri klavyeyle tam erişilebilir. |
| **F-01** | Yetkili üye 2,5 MB PDF yükler; diğer üye ayrı oturumda indirir | Dosya sunucuda kalıcıdır; iki kullanıcı aynı dosyaya erişip içeriği doğrular | **GEÇTİ** — Yönetici `2,5 MB` PDF yükledi (`201 Created`); Ekip Üyesi ayrı oturumda dosyayı listede gördü, indirdi ve indirilen akışın yüklenen PDF ile bayt bazında (`2.621.440 B`) birebir eşleştiği doğrulandı (`TS-DSY-01`). |
| **F-02** | `10 MB + 1 bayt` dosya, sahte MIME ve yasak uzantı (`.exe`/`.sh`) yükle | API `413` / `400` döner; sunucu diski ve veritabanında kayıt oluşmaz | **GEÇTİ** — `.exe` uzantısı istemcide ve sunucuda (`400`), HTML içerikli sahte `.pdf` bayt imzası (magic byte) kontrolüyle sunucuda (`400`), `10 MB + 1 bayt` dosya ise `413 Payload Too Large` ile reddedildi (`TS-DSY-02/03`). |
| **F-03** | Proje dışı üye (Member C) dosya indirme uç noktasını dener | Yetkisiz erişim reddedilir (`403` / `404`); dosya içeriği ve `storage_path` sızdırılmaz | **GEÇTİ** — Proje dışı üye (`umitefe@sektech.com`) dosya listeleme ve indirme isteklerinde `403 Forbidden`, oturumsuz isteklerde `401 Unauthorized` aldı; yanıt JSON'larında `storage_path` yer almıyor (`TS-DSY-04`). |

### Dosya Boyutu ve Depolama Sınır Değer Doğrulama Sonuçları
* **Canlı Sınır Değer Testleri (23 Kasım 2026):**
  * `10 MB - 1 bayt` (`10.485.759 B` geçerli PDF) $\rightarrow$ **`201 Created`** (Kabul edildi)
  * `Tam 10 MB` (`10.485.760 B` geçerli PDF) $\rightarrow$ **`201 Created`** (Kabul edildi)
  * `10 MB + 1 bayt` (`10.485.761 B` geçerli PDF) $\rightarrow$ **`413 Payload Too Large`** (Reddedildi, diskte ve VT'de kayıt oluşmadı)

---

## Kullanıcı Kılavuzu Akışları (Canlı Sistemle Doğrulandı)

### 1. Proje Çalışma Alanı Kurulumu
* **Akış:** `Giriş (/giris)` $\rightarrow$ `Projeler (/uygulama/projeler)` $\rightarrow$ `Proje Seç` (veya Yönetici için `Yeni Proje`).
* **Kullanım:** Yönetici (Admin) proje adını ve tarih aralığını girerek projeyi oluşturur ve ekip üyelerini atar. Hatalı tarih veya boş alan girildiğinde ekrandaki alan doğrulama mesajı düzeltilerek yeniden kaydedilir. Standart Ekip Üyesi (Member) proje oluşturma/silme veya rol değiştirme kontrollerini göremez.

### 2. Takvim ve Salt Okunur Zaman Çizelgesi (Gantt)
* **Akış:** `Proje Detayı` $\rightarrow$ `Takvim ve Gantt (/uygulama/projeler/:id/takvim)` $\rightarrow$ `Takvim / Gantt Görünüm Seçimi` $\rightarrow$ `Ay/Yıl Gezinme (← / →)` $\rightarrow$ `Görev Bağlantısı`.
* **Kullanım:** Kullanıcı aylık takvim ızgarasında veya salt okunur zaman çizelgesi (Gantt) görünümünde görevlerin başlangıç–bitiş sürelerini izler; görev adına tıkladığında Görevler ve Kanban ekranına geçerek görev detay modalını ve sorumlusunu görüntüler.

### 3. Dosya Paylaşımı ve Yönetimi
* **Akış:** `Proje Detayı` $\rightarrow$ `Dosyalar (/uygulama/projeler/:id/dosyalar)` $\rightarrow$ `Dosya Seç + Göreve Bağla (İsteğe Bağlı) + Dosyayı Yükle` $\rightarrow$ `Göreve Göre Filtrele` $\rightarrow$ `İndir`.
* **Kullanım:** Yetkili üye geçerli formatta (`PDF, PNG, JPG, JPEG, DOCX, XLSX, ZIP`) ve 10 MB altındaki belgeyi doğrudan projeye veya belirli bir göreve bağlayarak yükler; aynı projedeki diğer ekip üyeleri listeden dosyayı filtreleyip indirebilir. Limit aşımı, sahte içerik imzası veya yetkisiz işlem durumunda sistemin döndürdüğü uyarı mesajı (`role="alert"`) kullanıcıya gösterilir.

---

## Dosya Listesi Bileşen Desteği ve Gözlemler
* **İlgili Bileşenler:** `client/src/live/ProjectFiles.tsx` ve `client/src/live/fileApi.ts` (önizleme için `client/src/workspace/ProjectFiles.tsx`).
* **Doğrulanan Kriterler:** Boş liste durum yönlendirmesi (*"Henüz dosya eklenmedi."* / *"Bu göreve bağlı dosya yok."*), dosya adı/boyutu (`KB`)/yüklenme tarihi/bağlı görev adı gösterimi, yükleniyor (`Dosyalar yükleniyor…`) ve hata durumunda `Listeyi yenile` akışı ile `storage_path` bilgisinin istemciye sızdırılmaması canlı sistemde doğrulandı.
* **Küçük Gözlem (Not):** Kodda henüz dosya silme uç noktası (`DELETE /api/files/:id`) bulunmamaktadır, kapsam dışı / sonraki aşama olarak değerlendirilebilir; canlı arayüzde (`live/ProjectFiles.tsx`) yükleme, görev filtreleme ve güvenli blob indirme işlemleri eksiksiz çalışmaktadır.

---

## Çıkış Kapısı (Definition of Done) — Kapanış Onayı
* **Onaylayan:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)
* **Tarih ve Sürüm:** 23 Kasım 2026 · `develop` (`d54dd5d` — `v0.5` / Sprint 5 Kapanışı)
* **Kanıt Özeti:** Sunucu test seti (`14/14` test paketi, `215` geçen test), istemci test seti (`10/10` test paketi, `92` geçen test, `vite build` başarılı), Playwright E2E regresyon seti (`20/20` geçen senaryo) ve `#55` canlı UAT koşusu (`T-01` – `T-07`, `F-01` – `F-03` + `10 MB ± 1 bayt` sınır değer testleri) hatasız tamamlanarak `#55` kabul edilmiştir.
