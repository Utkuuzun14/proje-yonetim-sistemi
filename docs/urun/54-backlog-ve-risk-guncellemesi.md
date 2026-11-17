# Sprint 5 Backlog ve Risk Matrisi Güncellemesi

**Tarih:** 14–15 Kasım 2026  
**Sorumlu:** Hakan Koço (Proje Yöneticisi) — Issue #54  
**Kilometre Taşı:** M4 Hazırlığı (Takvim, Gantt & Dosya Paylaşımı)

---

## 1. MVP Geri Bildirimlerinin Değerlendirilmesi

8 Kasım 2026 MVP ara demosunda öğretim üyesi ve müşteri temsilcisinden alınan geri bildirimler doğrultusunda backlog öncelikleri yeniden değerlendirilmiştir:

1. **Kanban Akışı:** Sürükle-bırak akışı ve görev durumu geçmişi tam not aldı; durum geçişlerinin raporlamada kullanılmak üzere geçmiş tablosunda toplanması memnuniyetle karşılandı.
2. **Gantt Şeması Kapsam Sadeleştirmesi (Karar 14):** Ders yönergesinde yer alan “Gantt şeması veya Kanban panosu” şartında Kanban zaten tamamlandığından, Gantt şeması düzenlenebilir karmaşık bir araç yerine görev başlangıç–bitiş tarihlerinden beslenen **salt okunur bir zaman çizelgesi (timeline)** olarak sınırlandırılmıştır. Çift yönlü düzenleme veya bağımlılık ilişkileri dönem sonrasına bırakılmıştır.
3. **Hi-Fi Mockup Yerine Çalışan Sistem Kabulü (Karar 14 - 14 Kasım):** Sınav haftası yoğunluğu nedeniyle Ümit'in Figma'da ayrı hi-fi mockup çizmek yerine doğrudan çalışan React arayüzü ve tasarım sistemi sayfası üzerinden teslimat yapması kararlaştırıldı (#36 kapatıldı).
4. **Dosya Güvenliği:** Doküman paylaşımında 10 MB sınırı, sahte MIME koruması ve UUID tabanlı güvenli saklama şart koşuldu (#58, #60).

---

## 2. Güncellenmiş MoSCoW Backlog Tablosu

| Öncelik | Özellik / İş Paketi | Durum | Hafta / Sprint |
|---|---|---|:---:|
| **MUST** | Giriş/kayıt ve JWT oturum yönetimi | Tamamlandı | Sprint 2 |
| **MUST** | Rol bazlı yetki matrisi (Yönetici, Ekip Üyesi) | Tamamlandı | Sprint 3 |
| **MUST** | Proje CRUD ve üyelik yönetimi | Tamamlandı | Sprint 3 |
| **MUST** | Görev CRUD, öncelik ve kişiye atama | Tamamlandı | Sprint 4 |
| **MUST** | 3 sütunlu Kanban panosu (sürükle-bırak + klavye) | Tamamlandı | Sprint 4 |
| **MUST** | Görev durum geçmişi (audit trail) ve yorumlar | Tamamlandı | Sprint 4 |
| **MUST** | Takvim görünümü (aylık/haftalık görev takibi) | Tamamlandı | Sprint 5 |
| **MUST** | Projeye doküman yükleme/indirme ve güvenli saklama | Tamamlandı | Sprint 5 |
| **SHOULD** | Salt okunur Gantt şeması (zaman çizelgesi) | Tamamlandı | Sprint 5 |
| **MUST** | İlerleme yüzdesi ve kişi bazlı tamamlama raporu | Planlandı | Sprint 6 |
| **COULD** | Çoklu etiketleme ve gelişmiş filtreler | Planlandı | Sprint 6 |
| **WON'T** | Kod deposu (Repos) ve CI/CD pipeline motoru | Kapsam Dışı | — |

---

## 3. Güncellenmiş Risk Kaydı (R1–R9)

| Risk No | Risk Tanımı | O | E | Alınan Önlem / Mevcut Durum | Sorumlu |
|---|---|:---:|:---:|---|---|
| **R1** | Frontend/Backend tek kişiye bağlı olması darboğazı | Y | Y | Abdulkahhar statik ekranlara, Buğra repository ve staging desteğine devam etti; iş yükü dengelendi. | Hakan |
| **R2** | Kapsamın Azure DevOps ölçeğinde aşırı büyümesi | O | Y | MoSCoW sıkı uygulandı; Gantt sadeleştirildi, hi-fi mockup çalışan sisteme devredildi (Karar 14). Risk kontrol altında. | Abdulkahhar |
| **R3** | Sınav haftalarının sprint takvimiyle çakışması | Y | O | 9–15 Kasım vize haftasında kapsam hafifletildi; toparlanma haftası (16–22 Kasım) planlandı. | Hakan |
| **R4** | FE-BE API entegrasyon uyumsuzluğu | D | Y | OpenAPI v0.5 donduruldu, DTO ve şemalar birebir eşlendi. PR'lar yeşil. | Mustafa |
| **R5** | Test otomasyonunun son haftaya kalması | D | Y | Utku her sprint başında kabul testlerini yazdı (#101, #125, #130); CI sürekli yeşil tutuldu. | Utku |
| **R6** | Süreç kanıtlarının eksik kalması | D | Y | Mert her hafta düzenli raporları, tutanakları ve burndown verilerini Markdown olarak arşive işledi. | Mert |
| **R7** | Bir üyenin uzun süreli devre dışı kalması | D | O | Rol eşleşmeleri (RACI matrisi) ve dokümante kod sayesinde yedeklilik korundu. | Hakan |
| **R8** | Demo günü teknik aksaklık (sunucu/ağ) | D | Y | Buğra yerel Docker Compose ve Staging ortamını kurdu (`docker-compose.staging.yml`); offline demo hazır. | Buğra |
| **R9** | Merge çakışması ve kod kaybı | D | O | Feature branch modeli ve PR şablonu disiplinle işletildi; doğrudan develop/main push'u engellendi. | Hakan |
