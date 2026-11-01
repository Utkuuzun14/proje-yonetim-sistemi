// US-06 · TS-KNB-01/02 — ilk Kanban senaryosu (#53). Görev API'si (#51) ve gerçek Kanban ekranı (#50)
// gelene kadar fixme; o PR'lar birleşince bu senaryolar etkinleştirilecek.
const { test } = require('@playwright/test');

test.describe('Kanban (Sprint 4)', () => {
  test.fixme('TS-KNB-01: kart To Do → In Progress sürüklenir; yenilemede yerinde kalır, geçmiş kaydı oluşur', async () => {
    // 1. Yönetici test projesinde görev açar ve Utku'ya atar (POST /api/projects/:id/tasks)
    // 2. Utku Kanban'da kartı "In Progress" sütununa sürükler (fare) — ve klavyeyle durum seçer (erişilebilirlik)
    // 3. Sayfayı yeniler: kart yeni sütunda; ikinci oturumda (Yönetici) da aynı sütunda
    // 4. GET /api/tasks/:id/history (karar #47-12) veya görev detayında geçmiş: To Do → In Progress, Utku
  });

  test.fixme('TS-KNB-02: sunucu hata dönerse kart eski sütuna geri döner ve hata görünür', async () => {
    // page.route('**/api/tasks/*', r => r.fulfill({ status: 500 })) ile PATCH'i düşür; kart eski yerinde, uyarı görünür
  });
});
