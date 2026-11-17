# MVP Kullanıcı Kabul Testi (UAT) ve Ara Demo Raporu

**Tarih:** 8 Kasım 2026  
**Sorumlu:** Abdulkahhar Türkoğlu (Müşteri Temsilcisi / Ürün Sahibi) — Issue #48  
**Kilometre Taşı:** M3 (MVP & Ara Demo)  
**Değerlendirilen Artış:** Sprint 4 (Görev Yönetimi & Kanban Panosu — Modül 1 + Modül 2)  
**UAT Kararı:** **Kabul Edildi (MVP Onaylandı)**

---

## 1. Amaç ve Kapsam

Bu doküman, Yazılım Proje Yönetimi dersi yol haritası (Bölüm 6, s. 15) uyarınca 8 Kasım 2026 tarihinde gerçekleştirilen Minimum Uygulanabilir Ürün (MVP) kullanıcı kabul testi (UAT) sonuçlarını ve ara demo kayıtlarını içerir.

Değerlendirilen modüller:
- **Modül 1 (Proje & Görev Yönetimi):** Proje CRUD, görev CRUD, görev türü (Task/Bug/Feature), öncelik, kişiye atama, Kanban panosu (To Do / In Progress / Done) ve görev içi yorumlar.
- **Modül 2 (Kullanıcı & Rol Yönetimi):** Yönetici ve Ekip Üyesi yetki izolasyonu, güvenli oturum yönetimi (JWT).

---

## 2. UAT Test Senaryoları ve Koşu Sonuçları

Test ortamı: Docker Compose ile ayağa kaldırılmış PostgreSQL + Express API + React/Nginx tam sistem.  
Test kullanıcıları: Yönetici (Hakan Koço), Proje Üyesi (Mert Yanık, Mustafa Şahin, Buğra Durmuş), Proje Dışı Üye (Zeynep Şahin).

| Test No | Senaryo / Adımlar | Beklenen Kabul Kriteri | Gerçekleşen Sonuç | Durum |
|---|---|---|---|:---:|
| **M-01** | Yönetici yeni proje oluşturur, Ekip Üyesini projeye ekler; proje dışı üye doğrudan ID ile erişmeyi dener. | Üye projeyi listeler ve görevleri görür; proje dışı kullanıcıya 404 döner, proje varlığı sızdırılmaz (TS-ROL-04). | Yönetici projeyi açtı, üye projeyi gördü; yetkisiz istekte 404 alındı. | **GEÇTİ** |
| **M-02** | Ekip Üyesi dahil olduğu projede görev oluşturur ve kendisine atar (Karar 9). | Görev 'To Do' sütununda kalıcı olarak belirir; sayfa yenilendiğinde ve farklı oturumda korunur. | Görev oluşturuldu, 'To Do' sütununda listelendi. | **GEÇTİ** |
| **M-03** | Ekip Üyesi görevi sürükleyerek veya detaydan 'In Progress' ve 'Done' durumuna alır. | Görev kartı ilgili sütuna geçer; `task_status_history` tablosuna eski durum, yeni durum ve kullanıcı atomik olarak işlenir (FR-08). | Sürükle-bırak ile kart Done sütununa geçti; geçmiş panelinde 2 geçiş kaydı görüntülendi. | **GEÇTİ** |
| **M-04** | Ekip Üyesi başkasına ait görevin başlığını veya atanan kişisini değiştirmeyi dener (Karar 10). | Sistem 403 Forbidden döner; Ekip Üyesi yalnızca kendisine atanmış görevi düzenleyebilir. | Yetkisiz güncelleme engellendi (403), hata mesajı gösterildi. | **GEÇTİ** |
| **M-05** | Görev içine yorum yazılır; boş yorum ve yetkisiz üye yorumu engellenir. | Yorum zaman damgası ve yazar bilgisiyle kaydedilir; boş yorum formda engellenir. | Yorum listesinde yazar ve tarih görüntülendi, boş yorum gönderilmedi. | **GEÇTİ** |
| **M-06** | Bitiş tarihi başlangıç tarihinden önce olan veya 150 karakterden uzun görev başlığı girilir (Karar 13). | Form ve API doğrulama hatası (400) döner; geçersiz kayıt veritabanına yazılmaz. | `chk_tasks_dates` ve şema doğrulaması hatayı yakaladı. | **GEÇTİ** |
| **M-07** | Klavye erişilebilirliği (Tab, Enter, Escape) ve Kanban odak testi yapılır. | Klavye kısayolları ile kart seçilip durum değiştirilebilir; modal Escape ile kapanır. | Odak yönetimi düzgün çalıştı, erişilebilirlik gereksinimi karşılandı. | **GEÇTİ** |

---

## 3. Ara Demo Akışı ve Müşteri Sunumu Özeti

8 Kasım 2026 Cuma günü gerçekleştirilen ara demoda öğretim üyesi ve ekip önünde aşağıdaki canlı akış sergilenmiştir:

1. **Giriş ve Rol İzolasyonu:** Hakan (Yönetici) ile sisteme girilerek proje panosu ve üye yönetimi gösterildi.
2. **Görev Yaşam Döngüsü:** Yeni bir 'Feature' ve 'Bug' görevi açıldı, öncelikleri belirlendi ve sorumluya atandı.
3. **Kanban İş Akışı:** Görev sürükle-bırak ile 'In Progress' ve ardından 'Done' sütununa taşındı.
4. **Tarihçe ve İletişim:** Görev detay modalı açılarak durum geçmişi (audit trail) ve yorum akışı kanıtlandı.
5. **Güvenlik Doğrulaması:** Ekip Üyesi oturumuna geçilerek yetkisiz işlem kısıtlamaları (#110 düzeltmesi ve Karar 10) canlı test edildi.

## 4. Sonuç ve Bir Sonraki Aşamaya Geçiş

Sprint 4 MVP hedefleri (%100) başarıyla tamamlanmıştır. M3 kilometre taşına ulaşılmış ve kod tabanı `v0.5` sürümüne hazır hale getirilmiştir.
Sprint 5 (Takvim, Gantt ve Dosya Paylaşımı) için hazırlıklar başlatılmıştır.
