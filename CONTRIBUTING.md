# Katkı Kuralları

## Dal (branch) yapısı
- `main` → her zaman çalışan, demo yapılabilir kod. Doğrudan push yapılmaz.
- `develop` → sprint boyunca biriken, test edilen kod.
- Özellik dalları `develop`'tan açılır:
  - `feature/<issue-no>-kisa-aciklama` → örn. `feature/12-kanban-panosu`
  - `fix/<issue-no>-kisa-aciklama` → örn. `fix/21-giris-hatasi`

## Commit mesajları
Format: `tür: kısa açıklama (#issue-no)`

| Tür | Kullanım |
|---|---|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltme |
| `docs` | Dokümantasyon |
| `style` | Biçim/düzen (mantık değişmez) |
| `refactor` | Kod iyileştirme |
| `test` | Test ekleme/düzenleme |
| `chore` | Bağımlılık, ayar vb. |

Örnek: `feat: görev atama ekranı eklendi (#14)`

## Pull Request süreci
1. Issue'yu kendine ata ve Kanban'da **In Progress**'e taşı.
2. `develop`'tan yeni dal aç, kodunu yaz.
3. `develop`'a PR aç, PR açıklamasına `Closes #issue-no` yaz.
4. En az **1 ekip arkadaşının onayı** olmadan merge edilmez.
5. Merge sonrası dalı sil.

## Sprint düzeni
- Sprint süresi: **1 hafta**
- Sprint başında: planlama (backlog'dan iş seçimi)
- Sprint sonunda: review + retrospektif, rapor `docs/sprints/` altına eklenir.
