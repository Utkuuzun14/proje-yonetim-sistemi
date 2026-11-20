# Test Kapsamı (Coverage) Raporu

| | |
|---|---|
| Kart | #60 · "Test kapsamı (coverage) raporu" |
| Sorumlu | Utku Uzun |
| Ölçüm | 20 Kasım 2026 · develop `453a2dd` (#133 dahil) + #131, #134, #132, #129, #128 ve bu PR'ın yerel entegrasyonu |
| Önceki ölçüm | 15 Kasım 2026 · develop `64def5d` (görev, dosya ve takvim modülleri yokken) |
| Araç | Sunucu: Jest `--coverage` (`npm run test:coverage`, CI her PR'da `coverage-server` artefaktı olarak yükler) · İstemci: Vitest + `@vitest/coverage-v8` (yerel ölçüm, CI'da yok) |

## Özet

| Katman | Test | Satır | Dal | Fonksiyon | 15 Kasım (satır) |
|---|---|---|---|---|---|
| Sunucu (`server/src`) | 215 geçti, 7 todo | **%97,7** | %87,6 | %100 | %97,2 |
| İstemci (`client/src`) | 92 geçti | **%86,7** | %81,6 | %81,6 | %81,8 |
| E2E (Playwright, Docker Compose) | 11 geçti | — | — | — | 7 geçti, 2 `fixme` |

Görev/yorum API'si (#51), dosya API'si (#58) ve gerçek görev, takvim ve dosya ekranları (#129) ölçüme girdi. Yeni modüller eklenmesine rağmen kapsam düşmedi. Önceki raporda konan "sunucu satır kapsamı %90'ın altına düşmesin" hedefi sağlanıyor.

Ölçüm birleştirme öncesi yerel entegrasyon üzerinde yapıldı. Zincirdeki PR'lar develop'a girdikten sonra develop üzerinde tekrarlanıp bu tablo güncellenecek.

## Sunucu

| Modül | Satır | Dal | Kapsanmayan |
|---|---|---|---|
| `modules/tasks` (yeni) | %98,8 | %90,9 | `tasks.repository.js` 20-21, `tasks.service.js` 78, 83-88 (kilit altında görevin kaybolması gibi eşzamanlılık dalları) |
| `modules/files` (yeni) | %97,7 | %88,2 | `files.service.js` 75-76, 91 (disk yazma hatası dalları), `files.controller.js` 29-31 |
| `modules/auth` | %98,1 | %83,3 | `auth.service.js` 37 |
| `modules/projects` | %97,4 | %90,9 | `projects.repository.js` 65-66, `projects.service.js` 62 |
| `modules/users` | %97,2 | %87,0 | `users.service.js` 18-19 |
| `middleware` | %96,4 | %90,2 | `errorHandler.js` 23-24 (beklenmeyen hata dalı) |
| `modules/health` | %88,9 | %100 | `health.routes.js` 12 (VT erişilemezken) |
| `config`, `db`, `utils` | %85,7–100 | | `config/index.js` 28 (üretim ortamı dalı) |

Kapsanmayan satırların çoğu hata, eşzamanlılık ve ortam dallarıdır. İş kuralı açığı yok.

## İstemci

| Klasör | Satır | Not |
|---|---|---|
| `src` (`App.tsx`, `api.ts`) | %92,7 | `main.tsx` giriş noktası, test edilmez |
| `src/live` (gerçek API ekranları) | %98,1 | `Tasks.tsx` %96,8, `Timeline.tsx` %96,5, `ProjectFiles.tsx` %100, `taskApi.ts` / `fileApi.ts` %100 |
| `src/workspace` (önizleme/demo verisi) | %75,6 | En düşükler: `Calendar.tsx` %27,9, `ProjectFiles.tsx` %51,4, `files.ts` %63,6 |

`src/workspace` gerçek API'ye bağlanmayan önizleme ekranlarından oluşuyor, buradaki düşük kapsam teslim için risk değil. Gerçek ekranların (`src/live`) satır kapsamı %98.

## E2E

`auth`, `projects` ve `kanban` senaryoları gerçek API ve Docker Compose ortamında koşuyor. Kanban senaryoları (TS-KNB-01/02) #128'de `fixme`'den çıkarıldı. Kapsadıkları: sürükle-bırak, yenilemeden sonra kartın yerinde kalması, durum geçmişi kaydı, sunucu hatasında kartın geri dönmesi.

## Bulunan ve düzeltilen

- `rateLimit.api.test.js` › *pencere süresi dolunca tekrar denenebilir* testi 300 ms'lik pencere yüzünden yavaş makinede ara sıra düşüyordu (yerelde 3 denemenin 2'sinde). Pencere 2 sn'ye çıkarıldı (#139). Uygulama kodunda hata yok.

## Öneriler

1. Zincir birleşince ölçüm develop'ta tekrarlanacak. Hedef değişmiyor: sunucuda satır kapsamı %90'ın altına düşmesin.
2. İstemci kapsamı CI'a eklenebilir (`@vitest/coverage-v8` ile rapor artefaktı). Şu an yalnız yerelde ölçülüyor.
3. Dosya ve takvim ekranları için E2E senaryoları (TS-DSY, TS-TKV) #67'deki tam regresyon setinde eklenecek.

## Nasıl ölçülür?

```bash
# Sunucu (test VT'si gerekir: docker compose up -d db)
cd server && npm run test:coverage

# İstemci
cd client && npm i --no-save @vitest/coverage-v8 && npx vitest run --coverage --coverage.include='src/**'
```
