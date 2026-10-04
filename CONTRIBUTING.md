# Katkı Kuralları

Bu kurallar [yol haritasının](docs/yol-haritasi.pdf) 4. bölümüne (Çalışma Modeli) dayanır.

> **Panoda kartı olmayan iş yapılmamış sayılır.** Her iş [SEK TECH – Proje Panosu](https://github.com/users/Utkuuzun14/projects/1)
> üzerinde bir karta (issue) bağlıdır ve her kartın tek sahibi vardır.

## 1. Haftalık sprint döngüsü (Bölüm 4.1)

Sprintler bir haftalıktır (Pazartesi–Pazar). Her hafta aşağıdaki törenler tekrarlanır:

| Tören | Gün | Süre | Yöneten | Katılımcılar | Çıktı |
|---|---|---|---|---|---|
| Sprint Planlama | Pazartesi | 45 dk | Hakan | Tüm ekip | Sprint hedefi ve sprint backlog'u |
| Asenkron stand-up | Sal–Cmt, 21:00 | — | Hakan takip eder | Tüm ekip | Güncel pano, görünür engeller |
| Backlog İyileştirme | Perşembe | 30 dk | Abdulkahhar | Hakan + teknik ekip | Netleşmiş, tahminlenmiş hikâyeler |
| Sprint Review (demo) | Cuma | 30 dk | Hakan | Tüm ekip | Çalışan artış, geri bildirim |
| Retrospektif | Cuma | 20 dk | Hakan | Tüm ekip | 1–2 somut iyileştirme aksiyonu |
| Haftalık Rapor | Pazar | — | Mert | Hoca + ekip | Haftalık İlerleme Raporu |

Ders saatindeki haftalık sprint değerlendirmesinde Mert'in son haftalık raporu ve Cuma günkü demo kullanılır.
Toplantı notları [toplantı notu şablonuyla](docs/sablonlar/toplanti-notu.md), haftalık raporlar
[haftalık rapor şablonuyla](docs/sablonlar/haftalik-rapor.md) yazılır.

## 2. İletişim kuralları (Bölüm 4.2)

- WhatsApp grubunda alınan kararlar **aynı gün** panoya veya toplantı notuna işlenir.
- `main` ve `develop` korumalıdır; doğrudan push yapılmaz, her değişiklik Pull Request ile gelir.
- Ortak doküman alanında Mert'in kurduğu klasör yapısına ve şablonlara uyulur.
- Wireframe sahibi Abdulkahhar, hi-fi mockup sahibi Ümit'tir (Figma).

## 3. Dal ve commit kuralları (Bölüm 4.3)

### Dal modeli

- `main` → teslim edilebilir sürümler (`v0.5`, `v1.0` etiketleri). Yalnızca `develop`'tan PR ile güncellenir.
- `develop` → varsayılan dal; sprint boyunca biriken, test edilen kod.
- Çalışma dalları `develop`'tan açılır ve `develop`'a PR ile döner.

### Dal adı

```
feature/<kart-no>-kisa-aciklama
```

Örnek: `feature/45-rol-yetki-tablolari`. `<kart-no>` panodaki issue numarasıdır; açıklama küçük harf, tireli ve kısadır.

### Dalı issue sayfasından açma

1. Panodaki kartı (issue) aç; kendine ata ve kartı **In Progress** sütununa taşı.
2. Sağ kenardaki **Development** bölümünde **Create a branch**'e tıkla.
3. Dal adını `feature/<kart-no>-kisa-aciklama` biçiminde düzelt; **Change branch source** ile kaynağın `develop` olduğundan emin ol.
4. **Checkout locally** seçip verilen komutlarla dalı yerelde aç:
   ```bash
   git fetch origin
   git checkout feature/<kart-no>-kisa-aciklama
   ```

Bu yolla açılan dal issue'ya otomatik bağlanır; commit ve PR geçmişi kartta görünür.

### Commit mesajları

Format: `<tür>: kısa açıklama (#kart-no)`

| Tür | Kullanım |
|---|---|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltme |
| `docs` | Dokümantasyon |
| `test` | Test ekleme/düzenleme |
| `refactor` | Davranışı değiştirmeyen kod iyileştirme |
| `chore` | Bağımlılık, ayar, altyapı işleri |

Örnek: `feat: proje oluşturma formu eklendi (#43)`

### Pull Request

1. PR'ı `develop`'a aç; küçük tut (ideal olarak tek kart).
2. PR açıklamasına **`Closes #<kart-no>`** yaz; birleştirildiğinde kart otomatik kapanır.
3. Kartı **Review** sütununa taşı.
4. En az **bir onay** almadan ve **CI yeşil** olmadan birleştirilmez.
5. Birleştirme sonrası dalı sil.

## 4. Tamamlandı Tanımı — Definition of Done (Bölüm 4.4)

Bir kart ancak aşağıdaki maddelerin **tamamı** sağlandığında **Done** sütununa taşınabilir:

- [ ] Kod bir feature dalında geliştirildi ve Pull Request ile `develop` dalına birleştirildi.
- [ ] En az bir ekip üyesi kodu inceledi ve onayladı.
- [ ] CI hattı yeşil: build ve otomatik testler geçiyor.
- [ ] Yeni işlev için en az bir otomatik test (birim veya API) yazıldı.
- [ ] Kabul kriterleri Abdulkahhar tarafından kontrol edildi.
- [ ] API değiştiyse OpenAPI/Swagger dokümanı güncellendi.
- [ ] Panodaki kart "Done" sütununda ve ilgili PR'a bağlantılı.

Kod içermeyen kartlarda (rapor, tutanak, plan vb.) koda özgü maddeler uygulanmaz; çıktı repoya veya ortak doküman alanına
eklenmiş ve kartta bağlantısı verilmiş olmalıdır.

## 5. Pano düzeni

| Alan | Değerler |
|---|---|
| Status | Todo → In Progress → Review → Done |
| Sprint | Sprint 0 … Sprint 8 (1 haftalık iterasyonlar, 5 Ekim'den itibaren) |
| Milestone | M1 … M6 (kilometre taşları) |
| Etiketler | `yönetim`, `tasarım`, `doküman`, `frontend`, `backend`, `veritabanı`, `devops`, `test`, `bug`, `chore`, `acil` |
