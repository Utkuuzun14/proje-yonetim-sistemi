# Karar Tutanağı — Sprint 4 Kararları (Karar 9–13) ve MVP Değerlendirmesi

**Tarih:** 1–8 Kasım 2026  
**Hazırlayan:** Mert Yanık (Raporlama Sorumlusu) / Hakan Koço (Proje Yöneticisi)  
**İlgili Kartlar:** #47, #48, #49, #50, #51, #52, #53  
**Kilometre Taşı:** M3 (MVP & Ara Demo)

---

## 1. Toplantı / Karar Özeti

Sprint 4 başında Utku'nun (#47) teknik netleştirme talebi üzerine Proje Yöneticisi Hakan Koço tarafından Karar 9–13 ilan edilmiştir. Bu kararlar görev modeli, yetki matrisi, veri tabanı şeması ve test beklentilerini bağlayıcı şekilde belirlemiştir. 8 Kasım 2026 tarihinde yapılan ara demo değerlendirmesiyle MVP artışı incelenmiş ve v0.5 sürüm kararı alınmıştır.

| Alan | Değer |
|---|---|
| Karar tarihi | 1 Kasım 2026 (Karar 9–13); 8 Kasım 2026 (MVP Kararları) |
| Kararları veren / yöneten | Hakan Koço (Proje Yöneticisi) |
| Teknik danışılanlar | Mustafa Şahin (Backend), Buğra Durmuş (VT/DevOps), Ümit Efe Özkaleli (Frontend), Utku Uzun (QA) |
| Ürün kabulü | Abdulkahhar Türkoğlu (Müşteri Temsilcisi / Ürün Sahibi) |

---

## 2. Alınan Kararlar (Karar 9–13)

### Karar 9 · Ekip Üyesi Görev Açma Yetkisi
- **Konu:** Ekip Üyesi yeni görev oluşturabilir mi?
- **Karar:** **Evet.** Ekip Üyesi yalnızca üyesi olduğu projelerde görev oluşturabilir (SRS FR-03).
- **Teknik Etki:** `roles` tablosundaki `Ekip Üyesi` rolünün permissions JSONB alanına `"task:create": true` yetkisi eklenmiştir (#52).

### Karar 10 · Görev Atama ve Düzenleme İzolasyonu
- **Konu:** Ekip Üyesi başkasına görev atayabilir mi veya başkasının görevini düzenleyebilir mi?
- **Karar:** **Hayır.** Ekip Üyesi yalnızca kendisine atanmış görevleri düzenleyebilir; başkasına görev atama ve başkasının görevini düzenleme yetkisi yalnızca Yönetici'dedir (TS-ROL-03). Ancak görev durumunu değiştirme (`task:update_status`) yetkisi her proje üyesine açıktır.
- **Teknik Etki:** Backend `tasks.service.js` katmanında `canAssign` ve `managesTasks` kontrolleri uygulanmıştır (#51).

### Karar 11 · Görev Türü, Milestone ve Göreve Dosya Bağlama Kapsamı
- **Konu:** Görev türü (Task/Bug/Feature), milestone ve göreve dosya bağlama bu dönem kapsamda mı?
- **Karar:** **Üçü de bu dönem kapsamdadır.**
  - Görev türü (`Task`, `Bug`, `Feature`): Sprint 4'te görev modeliyle birlikte sisteme dahil edilmiştir (Şema v2).
  - Milestone ve göreve dosya bağlama: Yol haritasına uygun olarak Sprint 5'te (Takvim, Gantt ve Dosya sprinti) uygulanacaktır.
- **Teknik Etki:** `002_gorev_turu.sql` migration'ı ile `type` sütunu ve `chk_tasks_type` kısıtı eklenmiştir (#52).

### Karar 12 · Durum Geçmişi Okuma Uç Noktası (`GET /api/tasks/:id/history`)
- **Konu:** Durum geçmişi okuma uç noktası sözleşmeye ve API'ye eklensin mi?
- **Karar:** **Evet, eklensin.** FR-08 ve US-05 gereksinimleri uyarınca gerekçeli olarak sözleşmeye eklenmiştir.
- **Teknik Etki:** `task_status_history` tablosunu okuyan servis ve uç nokta tamamlanmıştır (#51).

### Karar 13 · Görev Başlığı Üst Sınırı
- **Konu:** Görev başlığı karakter üst sınırı 150 mi, 200 mü?
- **Karar:** SRS FR-06 gereğince API seviyesinde **150 karakter** denetlenecektir; veri tabanında VARCHAR(200) esnekliği korunacaktır.
- **Teknik Etki:** `tasks.schemas.js` içinde `maxLength(150)` kuralı konulmuştur.

---

## 3. M3 MVP & Ara Demo Değerlendirmesi (8 Kasım 2026)

1. **Uçtan Uca MVP Doğrulaması:** Rol bazlı giriş, proje oluşturma, görev oluşturma, kullanıcıya atama, Kanban panosu (To Do, In Progress, Done) üzerinde sürükle-bırak ve durum geçmişi takibi çalışan yazılım üzerinde başarıyla gösterilmiştir.
2. **Definition of Done Uyumu:** Tüm API uç noktaları için otomatik kabul testleri yazılmış (#53, #125), E2E altyapısı Playwright ile kurulmuştur (#126).
3. **Sürüm Durumu:** MVP gereksinimlerinin karşılandığı onaylanmış ve `v0.5` sürüm hazırlığı tamamlanmıştır.
