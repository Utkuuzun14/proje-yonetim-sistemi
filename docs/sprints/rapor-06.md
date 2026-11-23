# Haftalık Rapor #6 — Sprint 5 Kapanış Raporu

**Tarih:** 9 – 15 Kasım 2026 · **Hazırlayan:** Mert Yanık · **Kilometre taşı:** M4 Hazırlığı

**Durum tarihi:** 15 Kasım 2026 (Türkiye saati). Sprint 5 hafta kapanışı ve teknik teslimat kanıtlarıyla hazırlanmıştır.

**Sprint hedefi:** Görevleri zaman ekseninde göstermek (takvim, Gantt) ve proje dokümanlarının yüklenip paylaşılmasını sağlamak (Modül 3–4). Kaynak: [proje yol haritası](../yol-haritasi.pdf), Bölüm 6, s. 16 ve [#54](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/54).

---

## 1. Haftanın Özeti ve Başarılan Sonuçlar

**Sprint hedefi:** Görevleri zaman ekseninde göstermek (takvim, Gantt) ve proje dokümanlarının güvenle yüklenip paylaşılmasını sağlamak.  
**Teknik ve Ürün Sonuçları:**
1. **Takvim ve Salt Okunur Gantt Görünümü (#57):** React arayüzünde görevlerin başlangıç ve bitiş tarihlerine göre gün bloklarına yerleştiği aylık/haftalık takvim geliştirildi. Karar 14 doğrultusunda Gantt şeması, görev tarihlerinden türetilen kronolojik bir zaman çizelgesi (timeline) olarak sadeleştirildi ve arayüze entegre edildi.
2. **Dosya Yönetimi ve Güvenli Saklama API'si (#58):** Projeye doküman yükleme (`POST /api/projects/:id/files`) ve indirme (`GET /api/files/:id/download`) uç noktaları geliştirildi. 10 MB dosya üst sınırı, izinli MIME türleri ve bayt imzası (magic byte) kontrolü uygulandı. Dosyalar dizin atlama (path traversal) risklerine karşı UUID anahtarlarıyla fiziksel diskte saklandı.
3. **Dosya Metadata Tablosu ve Staging Ortamı (#59):** `003_dosya_gorev_baglantisi.sql` migration'ı ile `files` tablosuna `task_id` sütunu eklenerek Karar 11 uyarınca göreve dosya bağlama altyapısı sağlandı. Geliştirme ortamından bağımsız, prodüksiyona eşdeğer Staging ortamı (`docker-compose.staging.yml`) ve otomatik doğrulama betikleri (`scripts/staging-deploy.*`) devreye alındı.
4. **Dosya Güvenlik Testleri ve Kapsam Raporu (#60):** 22 adet API güvenlik testi koşuldu; izinsiz uzantı (.exe), 10 MB üzeri dosya (413), yetkisiz üyenin indirme denemesi (404/403) ve üyelikten çıkarılan kullanıcının izolasyonu otomatik testlerle kanıtlandı. Test kapsamı %85+ seviyesine çıkarıldı.
5. **Karar 14 (Hi-Fi Mockup Güncellemesi - 14 Kasım):** Hakan'ın kararıyla, çalışan arayüz ve tasarım sisteminin yeterli olgunluğa erişmesi sebebiyle Figma'da ayrı hi-fi mockup çizim zorunluluğu kaldırıldı; çalışan sistem tasarım onayı yerine geçti (#36 kapandı).
6. **Kullanıcı Kılavuzu İskeleti ve UAT (#55, #56):** T-01…T-07 takvim/Gantt ve F-01…F-04 dosya kabul testleri Abdulkahhar tarafından onaylandı; Mert tarafından `docs/kilavuz.md` oluşturuldu.

---

## 2. Ekip Bazında Çalışmalar ve Teslimatlar

| Kişi | Yapılan İş | İlgili Kart / Çıktı |
|---|---|---|
| **Hakan Koço** | MVP geri bildirimlerini backlog'a işledi; Karar 14'ü ilan ederek hi-fi mockup zorunluluğunu çalışan arayüze devretti; risk kaydını (R1–R9) ve MoSCoW önceliklerini güncelledi; vize haftası iş bölümünü koordine etti. | [#54](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/54), [Backlog & Risk](../urun/54-backlog-ve-risk-guncellemesi.md) |
| **Abdulkahhar Türkoğlu** | Takvim ve Gantt kabul kriterlerini (T-01…T-07) ile dosya yönetimi kabul testlerini (F-01…F-04) koşturdu; kabul onayını verdi; ekran akışlarını kılavuza aktardı. | [#55](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/55), [Kabul Kılavuzu](../urun/55-takvim-dosya-kilavuz.md) |
| **Mert Yanık** | Rapor #6'yı yayımladı; tüm modülleri kapsayan kullanıcı kılavuzu iskeletini (`docs/kilavuz.md`) hazırladı; M5 raporlama modülü için 3 temel rapor türünü netleştirdi. | [#56](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/56), `docs/kilavuz.md` |
| **Ümit Efe Özkaleli** | Takvim arayüzü (`Timeline.tsx`), salt okunur Gantt zaman çizelgesi, dosya yükleme/indirme ekranı ve mobil uyumlu menüyü geliştirdi; birim testlerini (`Timeline.test.tsx`) tamamladı. | [#57](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/57), `Timeline.tsx` |
| **Mustafa Şahin** | Multer tabanlı dosya yükleme servisini yazdı; 10 MB sınırını ve UUID depolama mantığını kurdu; takvim ve Gantt için tarih aralığı (`from`/`to`) filtrelerini ekledi; dosya CRUD API testlerini tamamladı. | [#58](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/58), `files.service.js` |
| **Buğra Durmuş** | `003_dosya_gorev_baglantisi.sql` migration'ını yazdı; dosya metadata tablosuna `task_id` ekledi; izole Staging ortamını (`docker-compose.staging.yml`) ve otomatik dağıtım betiklerini kurdu. | [#59](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/59), [Staging Ortamı](../../docker-compose.staging.yml) |
| **Utku Uzun** | 22 senaryodan oluşan dosya güvenlik ve sınır değer testlerini yazdı (#130); takvimde tarih kenar durumlarını (ay geçişi, ters tarih) denetledi; test kapsamı raporunu (`docs/test/kapsam-raporu.md`) yayımladı. | [#60](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/60), `files.api.test.js` |

---

## 3. Yeni Eklenen API Uç Noktaları

| Yöntem | Uç Nokta | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/files` | Proje Üyesi / Yönetici | Projeye ait dosyaları listeler |
| `POST` | `/api/projects/:projectId/files` | Proje Üyesi / Yönetici | Projeye dosya yükler (multipart/form-data, azami 10 MB, opsiyonel `task_id`) |
| `GET` | `/api/files/:id` | Proje Üyesi / Yönetici | Dosyanın meta verisini döner |
| `GET` | `/api/files/:id/download` | Proje Üyesi / Yönetici | Dosyayı güvenli akışla orijinal adıyla indirir |
| `DELETE` | `/api/files/:id` | Proje Üyesi / Yönetici | Dosyayı siler (yükleyen veya yönetici) |
| `GET` | `/api/tasks/:taskId/files` | Proje Üyesi / Yönetici | Belirli bir göreve bağlı dosyaları listeler |

---

## 4. Staging Ortamı Kanıtı ve Doğrulama

- **Yapılandırma Dosyası:** `docker-compose.staging.yml`
- **Erişim Adresleri:**
  - Arayüz (Frontend): `http://localhost:3001`
  - Backend API & Swagger: `http://localhost:5001/api/docs`
  - Veri Tabanı: `localhost:5434` (`sektech_staging`)
- **Doğrulama Betikleri:** `scripts/staging-deploy.sh` ve `scripts/staging-deploy.ps1`
- **Kalıcılık:** `staging_pgdata` ve `staging_uploads` volume'ları ile konteynerler yeniden oluşturulsa dahi veriler ve yüklenen dosyalar korunmaktadır.

---

## 5. Retrospektif

**İyi Gidenler:**
- Dosya yükleme güvenliğinde (UUID saklama, doğrudan statik URL yasağı, MIME kontrolü) hiçbir açık bırakılmadı.
- Gantt şemasının salt okunur zaman çizelgesi olarak kurgulanması geliştirme hızını iki katına çıkardı ve takvim darboğazını önledi.
- Staging ortamının kurulması, sunum ve demo provaları için offline güvence sağladı.

**Geliştirilmesi Gerekenler:**
- Dosya yükleme esnasında arayüzde ilerleme çubuğu (progress bar) eklenmesi kullanıcı deneyimini daha da artırabilir.

**Sprint 6 (Raporlama ve Analiz) İçin Aksiyonlar:**
- Buğra ve Mustafa ilerleme yüzdesi (`progress_percentage`), kişi bazlı tamamlama oranları ve dönemsel özet SQL sorgularını hazırlayacak (#65, #66).
- Ümit dashboard metrik grafiklerini ve raporlama ekranlarını kodlayacak (#64).
- 22 Kasım tarihinde tüm Must özelliklerin dondurulması (Feature Freeze - M4) hedefine odaklanılacak.
