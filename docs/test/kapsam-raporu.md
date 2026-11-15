# Test Kapsamı (Coverage) Raporu

| | |
|---|---|
| Kart | #60 · "Test kapsamı (coverage) raporu" |
| Sorumlu | Utku Uzun |
| Ölçüm | 15 Kasım 2026 · develop `64def5d` |
| Araç | Sunucu: Jest `--coverage` (`npm run test:coverage`, CI her PR'da `coverage-server` artefaktı olarak yükler) · İstemci: Vitest + `@vitest/coverage-v8` (yerel ölçüm, CI'da yok) |

## Özet

| Katman | Test | Satır | Dal | Fonksiyon |
|---|---|---|---|---|
| Sunucu (`server/src`) | 114 geçti, 1 todo | **%97,2** | %85,8 | %100 |
| İstemci (`client/src`) | 50 geçti | **%81,8** | %80,2 | %76,3 |

Ölçüm yalnız develop'ta olan kodu kapsar. Görev/yorum API'si (#51), dosya API'si (#58) ve gerçek görev/takvim ekranları (#127, #129) henüz birleşmediği için bu modüller ölçümde **yok**; birleştiklerinde oranlar düşebilir.

## Sunucu

| Modül | Satır | Kapsanmayan |
|---|---|---|
| `middleware` | %96,4 | `errorHandler.js` 23-24 (beklenmeyen hata dalı) |
| `modules/auth` | %98,1 | `auth.service.js` 37 |
| `modules/health` | %88,9 | `health.routes.js` 12 (VT erişilemezken) |
| `modules/projects` | %97,4 | `projects.repository.js` 65-66, `projects.service.js` 62 |
| `modules/users` | %97,2 | `users.service.js` 18-19 |
| `config`, `db`, `utils` | %83–100 | `config/index.js` 25 (üretim ortamı dalı) |

Kapsanmayan satırların çoğu hata ve ortam dallarıdır; iş kuralı açığı yok.

## İstemci

| Klasör | Satır | Not |
|---|---|---|
| `src` (`App.tsx`, `api.ts`) | %91,4 | `main.tsx` giriş noktası, test edilmez |
| `src/live` (gerçek API ekranları) | %99,0 | Şu an yalnız proje ekranları; görev ve takvim #127/#129 ile gelecek |
| `src/workspace` (önizleme/demo verisi) | %75,8 | En düşükler: `Calendar.tsx` %27,9, `ProjectFiles.tsx` %51,4, `files.ts` %63,6 |

`src/workspace` gerçek API'ye bağlanmayan önizleme ekranlarıdır; düşük kapsam teslim riski değildir. Asıl kapsam hedefi `src/live` ve gelecek görev, takvim ve dosya ekranlarıdır.

## Bekleyen testler

| Test | Durum | Beklediği |
|---|---|---|
| Görev/yorum API kabul testleri (`tasks.api.test.js`) | #125'te, kırmızı | #51 |
| Dosya güvenlik testleri (`files.api.test.js`) | #60 PR'ında, kırmızı | #58 |
| Kanban E2E (`kanban.spec.js`) | #128'de, `fixme` | #51 + #127 |

## Öneriler

1. #51 ve #58 birleşince ölçüm tekrarlanır; hedef sunucuda satır kapsamının %90 altına düşmemesi.
2. İstemci kapsamı CI'a eklenebilir (`@vitest/coverage-v8`, rapor artefaktı); şu an yalnız yerel ölçülüyor.
3. Takvim tarih sınırları (yıl geçişi, artık yıl, ayı kaplayan görev, ters tarih) #129 incelemesinde sahte API ile denendi ve geçti; bu durumlar #129'un kendi testlerine eklenebilir.

## Nasıl ölçülür?

```bash
# Sunucu (test VT'si gerekir: docker compose up -d db)
cd server && npm run test:coverage

# İstemci
cd client && npm i --no-save @vitest/coverage-v8 && npx vitest run --coverage --coverage.include='src/**'
```
