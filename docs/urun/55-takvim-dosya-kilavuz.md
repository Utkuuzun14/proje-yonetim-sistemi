# Takvim/Gantt kabul seti ve kullanıcı kılavuzu akışları

**Güncelleme Tarihi:** 17 Kasım 2026 · **Kart:** #55 · **Kilometre Taşı:** M3 — MVP & Ara Demo (22 Kasım 2026 Pazar)  
**Test ve Kılavuz Sorumlusu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)  
**Kod İnceleme ve Entegrasyon Tabanı:** `develop` (`64def5d`) ve bekleyen PR'lar (`#132` Dosya API, `#134` Dosya Metadata Şeması, `#130` Dosya Güvenlik Testleri, `#57` Takvim/Gantt ve Dosya Ekranları).  
**UAT Kararı:** Bekliyor (20 Kasım Cuma `develop` birleştirmesi sonrası canlı koşu ve onay yapılacak).

---

## Kapsam Kararı ve Sabit Örnek Veri
* **Kapsam Notu (14 Kasım Kararı):** Gantt görünümü sadeleştirilmiş olup mevcut görev tarihlerinden üretilen **salt okunur (read-only) zaman çizelgesi** olarak sunulacaktır; Gantt üzerinden sürükle-bırak tarih düzenleme ve milestone ekleme özellikleri dönem sonrasına bırakılmıştır.
* **Sabit Örnek Veri ("Etkinlik Sitesi" Projesi):**
  * **Görev A:** 18–20 Kasım 2026 (farklı üyeye atanmış; referans saati 21 Kasım alındığında gecikmiş görünür)
  * **Görev B:** 19 Kasım 2026 (tek günlük görev, ikinci üyeye atanmış)
  * **Görev C:** Tarihsiz görev
  * **Görev D:** 15–17 Kasım 2026 (Tamamlandı / `Done`)
  * *Not:* Test saati `21 Kasım 2026 Europe/Istanbul` olarak sabitlenerek gecikmiş (A) ve tamamlanmış (D) durumları doğrulanır.

---

## Takvim, Gantt ve Dosya Kabul Seti (T-01 – T-07 & F-01 – F-03)

| Kod | İşlem | Beklenen / Kabul Kanıtı | Mevcut Kanıt / Engel |
| :--- | :--- | :--- | :--- |
| **T-01** | Takvimde mevcut aydan sonraki aya geç | Çok günlük Görev A her iki aralıkta doğru hizalanır; tek günlük Görev B doğru günde görünür | Aylık görünüm kodda hazır; `#57` birleşimi sonrası canlı UAT bekliyor |
| **T-02** | Takvim üzerindeki görev çubuğuna tıkla | Görev detay çekmecesi açılır; başlık, tarih aralığı ve sorumlu birebir tutarlıdır | Detay akışı `#129` içinde; birleşim sonrası canlı doğrulama bekliyor |
| **T-03** | Haftalık görünüm sekmesini kontrol et | Seçili haftanın 7 günü ve o haftaya düşen görevler listelenir (kapsam dışıysa UI'da pasif/gizlidir) | Haftalık görünüm kapsam/ekran kontrolü UAT sırasında teyit edilecek |
| **T-04** | Salt okunur Gantt (Zaman Çizelgesi) görünümünü aç | Görev A ve B tarih aralıkları doğru çizilir; erişilebilirlik için renk dışında metin etiketi bulunur | `#57` birleşimi sonrası canlı doğrulama bekliyor |
| **T-05** | Tarihsiz görev (C) ve ters tarih (`bitiş < başlangıç`) dene | Tarihsiz iş takvimi bozmadan listede açıklanır; ters tarihli kayıt reddedilir | Entegrasyon ve doğrulama testi birleşim sonrası koşulacak |
| **T-06** | Kapsam sınırı kontrolü (Milestone & Gantt düzenleme) | 14 Kasım kararı gereği salt okunur Gantt sunulur; eksik/dönem sonu özellikler demo kapsamı dışında tutulur | Kapsam kararı netleşti; sunumda şeffaf biçimde belirtilecek |
| **T-07** | Ay değiştir, dar ekran (responsive) ve klavye ile gezin | Başlık ve odak korunur; kontroller klavye ile erişilebilir ve taşma yapmaz | Canlı UI/erişilebilirlik testi bekliyor |
| **F-01** | Yetkili üye 2,5 MB PDF yükler; diğer üye ayrı oturumda indirir | Dosya sunucuda/staging ortamında kalıcıdır; iki kullanıcı aynı dosyaya erişip içeriği doğrular | `#132` (Dosya API) ve `#134` (Metadata DB) birleşimi bekliyor |
| **F-02** | `10 MB + 1 bayt` dosya, sahte MIME ve yasak uzantı (`.exe`/`.sh`) yükle | API `413` / `400` döner; sunucu diski ve veritabanında kayıt oluşmaz | `#132` ve `#130` güvenlik testleri birleşimi bekliyor |
| **F-03** | Proje dışı üye (Member C) dosya indirme uç noktasını dener | Yetkisiz erişim reddedilir (`403` / `404`); dosya içeriği ve `storage_path` sızdırılmaz | `#132` ve `#130` birleşimi sonrası canlı doğrulama bekliyor |

### Dosya Boyutu ve Depolama Sınır Değer Kuralları
* **SRS v1.1 Üst Sınırı:** Dosya başına **10 MB** (proje bazlı kota kuralları API sözleşmesine tabidir). Yerel tarayıcı (IndexedDB) önbelleği çok kullanıcılı paylaşım kanıtı yerine geçmez; kabul testi mutlaka gerçek API ve veritabanı üzerinden yapılır.
* **Sınır Değer Test Seti:** API birleşimi sonrası canlı testlerde `10 MB - 1 bayt` (kabul), `tam 10 MB` (kabul) ve `10 MB + 1 bayt` (`413 Payload Too Large` reddi) dosyalarıyla sınır doğrulaması yapılacaktır.

---

## Kullanıcı Kılavuzu Akışları

### 1. Proje Çalışma Alanı Kurulumu
* **Akış:** `Giriş` $\rightarrow$ `Projeler` $\rightarrow$ `Proje Seç` (veya Yönetici için `Yeni Proje`).
* **Kullanım:** Yönetici (Admin) proje adını ve tarih aralığını girerek projeyi oluşturur ve ekip üyelerini atar. Hatalı tarih veya boş alan girildiğinde ekrandaki alan doğrulama mesajı düzeltilerek yeniden kaydedilir. Standart Ekip Üyesi (Member) proje silme veya rol değiştirme ayarlarını göremez.

### 2. Takvim ve Salt Okunur Zaman Çizelgesi (Gantt)
* **Akış:** `Proje Detayı` $\rightarrow$ `Takvim` / `Zaman Çizelgesi` $\rightarrow$ `Ay Gezinme (< >)` $\rightarrow$ `Görev Çubuğu` $\rightarrow$ `Görev Detayı`.
* **Kullanım:** Kullanıcı aylık takvim ızgarasında veya salt okunur zaman çizelgesi (Gantt) görünümünde görevlerin başlangıç–bitiş sürelerini izler; herhangi bir görev çubuğuna tıkladığında sağ çekmecede görev detayını ve sorumlusunu görüntüler.

### 3. Dosya Paylaşımı ve Yönetimi
* **Akış:** `Proje Detayı` $\rightarrow$ `Dosyalar` (veya `Görev Detayı` $\rightarrow$ `Ekler`) $\rightarrow$ `Dosya Seç ve Yükle` $\rightarrow$ `Listede Ad / Tür / Boyut Kontrolü` $\rightarrow$ `İndir / Sil`.
* **Kullanım:** Yetkili üye geçerli formatta ve 10 MB altındaki belgeyi yükler; aynı projedeki diğer ekip üyeleri listeden dosyayı görüntüleyip indirebilir. Limit aşımı veya yetkisiz işlem durumunda sistemin döndürdüğü uyarı mesajı kullanıcıya gösterilir.

---

## Dosya Listesi Bileşen Desteği
* **İlgili Bileşenler:** `ProjectFiles.tsx` ve `files.ts`.
* **Kabul Kriterleri:** Boş liste durum yönlendirmesi (empty state), dosya adı/türü/boyutu gösterimi, yükleniyor (loading) ve hata durumunda yeniden dene (retry) akışı, silme onayı ve `storage_path` bilgisinin istemciye açık URL olarak sızdırılmaması canlı UAT sırasında doğrulanacaktır.

---

## Çıkış Kapısı (Definition of Done)
* `T-01` – `T-07` ve `F-01` – `F-03` senaryoları 20 Kasım Cuma `develop` birleştirmesi sonrası gerçek iki kullanıcı ve staging ortamı kanıtlarıyla koşulur; Ürün Sahibi (Abdulkahhar Türkoğlu) onayı ve test kanıtları bu dosyaya işlenerek `#55` kapatılır.
