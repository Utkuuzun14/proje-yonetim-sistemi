# E2E testleri (Playwright)

Kart #53 · Çalışan **tam sisteme** (VT + API + arayüz) karşı tarayıcıda uçtan uca test.

## Çalıştırma

```bash
# 1. Sistemi kaldır (repo kökünde)
docker compose up --build -d

# 2. Testler
cd e2e
npm ci
npx playwright install chromium   # ilk seferde
npm test                          # rapor: npm run report
```

Farklı adres: `E2E_BASE_URL=http://127.0.0.1:5173 npm test` (Vite geliştirme sunucusu).

CI'da "Tek komutla kurulum (Docker Compose)" işi, compose ayağa kalktıktan sonra bu testleri çalıştırır;
hata olursa iz (trace), ekran görüntüsü ve video `playwright-report` artefaktına yüklenir.

## Kapsam

| Dosya | Senaryolar |
|---|---|
| `auth.spec.js` | TS-AUTH-01, 04, 05, 07, 08, 09 |
| `projects.spec.js` | TS-PRJ-01, 02 · TS-ROL-04, 05 · rol geçişi |
| `kanban.spec.js` | TS-KNB-01, 02 — `fixme`, #51 + #50 bekleniyor |

Testler seed kullanıcılarını kullanır (`database/seed.sql`) ve her koşuda benzersiz kayıt/proje adları üretir.
