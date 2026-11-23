# Haftalık Rapor #5 — Sprint 4 Kapanış ve MVP Ara Raporu

**Tarih:** 2 – 8 Kasım 2026 · **Hazırlayan:** Mert Yanık · **Kilometre taşı:** M3 (MVP & Ara Demo)

**Durum tarihi:** 8 Kasım 2026 (Türkiye saati). M3 ara demo teslimi ve Sprint 4 kapanışı için güncellenmiştir.

**Sprint hedefi:** Görev oluşturma, atama, durum değiştirme ve Kanban panosunu uçtan uca çalıştırarak MVP'yi tamamlamak (Modül 1 + Modül 2 entegrasyonu). Kaynak: [proje yol haritası](../yol-haritasi.pdf), Bölüm 6, s. 15 ve [#47](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/47).

---

## 1. Haftanın Özeti ve MVP Başarımı

**Sprint hedefi:** Görev oluşturma, atama, durum değiştirme ve Kanban panosunu uçtan uca çalıştırmak.  
**Teknik ve Ürün Sonucu:**
1. **Şema v2 ve Migration Mimarisi (#52):** Sıralı ve forward-only migration altyapısı kuruldu (`database/migrations/`). Görev türü (`Task`, `Bug`, `Feature`), tarih sıralama kısıtı (`chk_tasks_dates`) ve indeksler eklendi. Ekip Üyesine üye olduğu projede görev açma yetkisi (`task:create: true`) verildi (Karar 9). Zengin ve gerçekçi tohum verisi (`seed.sql`) ile 17 görev ve geçmişleri yüklendi.
2. **Görev & Yorum API'si (#51):** Görev CRUD, filtreleme (durum, öncelik, tür, kişi, tarih), satır kilidi (`FOR UPDATE`) ile atomik durum geçmişi (`task_status_history`) ve yorum (`comments`) uç noktaları tamamlandı. Karar 10 gereği Ekip Üyesinin başkasına atama yapması ve başkasının görevini düzenlemesi engellendi (403).
3. **Gerçek Kanban & Görev Ekranları (#50):** React tabanlı görev listesi, oluşturma/düzenleme formu, sürükle-bırak ve klavye destekli 3 sütunlu (To Do / In Progress / Done) Kanban panosu, görev detay modalı ve yorum alanı canlı API'ye bağlandı.
4. **Test Otomasyonu ve Kabul Testleri (#53):** Görev ve yorum API kabul testleri (40+ test), Playwright ile uçtan uca Kanban senaryoları ve regresyon listesi tamamlandı.
5. **UAT ve Müşteri Kabulü (#48):** Abdulkahhar Türkoğlu tarafından koşturulan M-01…M-07 kullanıcı kabul testlerinin 7'si de başarıyla geçti; MVP resmi olarak kabul edildi.
6. **M3 Kilometre Taşı:** Rol bazlı giriş, proje yönetimi, görev yönetimi, atama ve Kanban panosu uçtan uca çalışıyor; sistem `v0.5` etiketine hazır hale getirildi.

---

## 2. Bu Hafta Yapılanlar (Kişi Bazlı Dağılım)

| Kişi | Yapılan İş | İlgili Kart / Çıktı |
|---|---|---|
| **Hakan Koço** | MVP ara demo toplantısını ve sprint review'u yönetti; Sprint 4 Karar 9–13'ü yayımlayarak kapsamı netleştirdi; MoSCoW önceliklerini gözden geçirdi; v0.5 sürüm hazırlığını tamamladı. | [#47](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/47), [Karar Tutanağı](../tutanaklar/2026-11-08-sprint-4-kararlari.md) |
| **Abdulkahhar Türkoğlu** | MVP kullanıcı kabul testlerini (UAT) yürüttü; M-01…M-07 senaryolarını test ederek kabul onayını verdi; ara demoda müşteri sunumunu gerçekleştirdi. | [#48](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/48), [UAT Raporu](../urun/48-mvp-uat-ve-ara-demo.md) |
| **Mert Yanık** | Rapor #5 ve MVP ara raporunu hazırladı; Karar 9–13 tutanağını yayımladı; burndown ve hız metriklerini güncelledi; sunum notlarını çıkardı. | [#49](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/49), Rapor #5 |
| **Ümit Efe Özkaleli** | Görev listesi, form ve atama seçiciyi kodladı; sürükle-bırak ve klavye kısayollu Kanban panosunu geliştirdi; görev detay, geçmiş ve yorum modalını entegre etti. | [#50](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/50), `Tasks.tsx` |
| **Mustafa Şahin** | Görev CRUD, atama ve durum güncelleme REST uç noktalarını geliştirdi; `tasks.repository.js` içinde `inTransaction` ile durum değişimlerinde atomik `task_status_history` kaydı sağladı; yorum servislerini yazdı; OpenAPI dokümanını güncelledi. | [#51](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/51), OpenAPI v0.5 |
| **Buğra Durmuş** | Sıralı migration mimarisini (`001_baslangic.sql`, `002_gorev_turu.sql`) kurdu; `tasks` tablosuna `type` sütunu ve `chk_tasks_dates` kısıtını ekledi; yetki matrisini güncelledi (`task:create: true`); Kanban ve MVP için zengin demo tohum verisi (`seed.sql`) sağladı. | [#52](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/52), [DevOps Çıktıları](../../database/devops-ciktilari.md) |
| **Utku Uzun** | Karar 9–13'e göre görev ve yorum API kabul testlerini kesinleştirdi; Playwright E2E testlerine Kanban senaryolarını ekledi; regresyon test listesini güncelledi. | [#53](https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/53), `kanban.spec.js` |

---

## 3. Teknik Çıktılar ve Doğrulama

### Uygulanan Yeni API Uç Noktaları

| Yöntem | Uç Nokta | Yetki Kuralı | Açıklama |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | Proje Üyesi / Yönetici | Proje görevlerini listeler; filtreleme: `status`, `priority`, `type`, `assigneeId`, `from`, `to` |
| `POST` | `/api/projects/:projectId/tasks` | Proje Üyesi / Yönetici | Yeni görev oluşturur (Karar 9). Üye yalnızca kendine atayabilir |
| `GET` | `/api/tasks/:id` | Proje Üyesi / Yönetici | Görev detayını döner |
| `PATCH` | `/api/tasks/:id` | Proje Üyesi / Yönetici | Görev günceller; durum değişirse `task_status_history` atomik yazılır. Başkasına atama/düzenleme yalnız Yönetici (Karar 10) |
| `DELETE` | `/api/tasks/:id` | Yönetici | Görevi siler (bağlı geçmiş ve yorumlar CASCADE silinir) |
| `GET` | `/api/tasks/:id/history` | Proje Üyesi / Yönetici | Görevin durum değişim tarihçesini döner (Karar 12) |
| `GET` | `/api/tasks/:id/comments` | Proje Üyesi / Yönetici | Göreve ait yorumları listeler |
| `POST` | `/api/tasks/:id/comments` | Proje Üyesi / Yönetici | Göreve yeni yorum ekler (yazar oturumdaki kullanıcıdır) |

### Veri Tabanı ve Migration İyileştirmeleri

- `database/init.sql` artık tek başına yıkıcı çalıştırılmak yerine başlangıç şemasını tanımlar; `database/migrations/` altındaki numaralandırılmış migration dosyaları sırayla icra edilir.
- `database/docker-compose.yml` ve ana `docker-compose.yml` ortamlarında `002_gorev_turu.sql` mount edilerek konteyner ilk kurulumunda otomatik çalıştırılması sağlandı.
- Test ortamında `globalSetup.js` tüm migration'ları dinamik olarak sırayla çalıştırır.

---

## 4. Metrikler ve İlerleme Durumu

- **Sprint 4 Hedef Gerçekleşme Oranı:** %100 (M3 Kilometre Taşı tamamlandı).
- **Açılan / Kapanan Kartlar:** Sprint 4 kartlarının (#47, #48, #49, #50, #51, #52, #53) tüm teknik geliştirmeleri tamamlandı.
- **Otomatik Test Sayısı:**
  - Birim / API testleri: 114 testten 150+ teste yükseldi.
  - E2E testleri: Giriş, proje ve Kanban senaryoları kapsandı.
- **Burndown Durumu:** Sprint 4 başında planlanan 8 ana iş paketi hafta sonunda sıfırlandı; teknik borç veya kritik açık hata kalmadı.

---

## 5. Retrospektif

**İyi Gidenler:**
- Karar 9–13'ün sprint başında yazılı olarak yayımlanması backend, frontend ve QA ekiplerinin aynı varsayımlarla çalışmasını sağladı.
- Veritabanı durum güncellemelerinde satır kilidi (`FOR UPDATE`) ve transaction kullanımı ile veri bütünlüğü mükemmel sağlandı.
- Arayüzde klavye erişilebilirliği ve sürükle-bırak akıcılığı kullanıcı deneyimini çok olumlu etkiledi.

**Geliştirilmesi Gerekenler:**
- Sınav takvimleri nedeniyle ekip kapasitesi dalgalandı; Sprint 5'te takvim ve Gantt kütüphaneleri hazır bileşenlerle hızlandırılmalı.
- Dosya yüklemelerinde 10 MB sınırının hem sunucu (multer) hem istemci tarafında erkenden kontrol edilmesi şart.

**Sprint 5 İçin Alınan Aksiyonlar:**
- Hakan ve Abdulkahhar Sprint 5 başında Takvim ve Dosya modülleri için kabul kriterlerini netleştirecek.
- Buğra `files` tablosuna `task_id` ekleyecek ve staging ortamını kuracak (#59).
- Mustafa dosya yükleme servisini ve tarih aralığı sorgularını teslim edecek (#58).
- Ümit takvim ve salt okunur Gantt ekranlarını tamamlayacak (#57).

---

## 6. Gelecek Hafta (Sprint 5) Planı

**Plan Dönemi:** 9 – 15 Kasım 2026 · **Odak:** Takvim, Gantt & Dosya Paylaşımı (Modül 3–4).  
Hedef: Görevleri zaman ekseninde göstermek (takvim, Gantt) ve proje dokümanlarının yüklenip paylaşılmasını sağlamak.
