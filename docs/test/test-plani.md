# Test Planı — v1

| | |
|---|---|
| Proje | SEK TECH · Proje Yönetim Sistemi |
| Sorumlu | Utku Uzun (Test Uzmanı / CI Sorumlusu) |
| Onay | Hakan Koço (Proje Yöneticisi) |
| Kart | #32 · Sprint 1 |
| İlgili | [Test Stratejisi](test-stratejisi.md) · [Test Senaryoları](test-senaryolari.md) · `docs/yol-haritasi.pdf` |

## 1. Kapsam

### Test edilecekler (MUST + SHOULD)

| Modül | Özellikler |
|---|---|
| M2 Kullanıcı & Rol | Kayıt, giriş/çıkış, JWT/oturum süresi, Yönetici ve Ekip Üyesi rolleri, role göre yetkiler |
| M1 Proje & Görev | Proje CRUD (ad, açıklama, başlangıç–bitiş), proje üyeliği, görev CRUD, kişiye atama, To Do / In Progress / Done |
| M3 Takvim & Zaman | Takvim görünümü, Kanban panosu (sürükle-bırak), Gantt (Should) |
| M4 Dosya & Yorum | Dosya yükleme/indirme, ekip erişimi, görev yorumları |
| M5 Raporlama | Yüzdelik ilerleme, kişi bazlı tamamlama, günlük/haftalık/aylık rapor, dashboard grafikleri (Should) |
| Çapraz | Doğrulama mesajları, boş/yükleniyor/hata durumları, responsive (masaüstü + tablet), temel güvenlik |

### Test edilmeyecekler

- WON'T maddeleri: kod deposu, pipeline, Test Plans modülü, mobil uygulama, gerçek zamanlı ortak düzenleme.
- COULD maddeleri yalnızca geliştirilirse test edilir (e-posta bildirimi, CSV/PDF dışa aktarma, karanlık tema).
- Yük/stres testi (yalnızca temel yanıt süresi ölçülür), tarayıcı uyumluluğu Chrome + Firefox güncel sürümleriyle sınırlı.

## 2. Test yaklaşımı

Seviyeler, araçlar ve sorumlular [Test Stratejisi §3–4](test-stratejisi.md)'tedir. Özet: birim ve API testleri her PR'da
CI'da, E2E kısa set PR'da / tam set sprint sonunda, manuel tur her Cuma staging'de, UAT Sprint Review öncesinde.

## 3. Test ortamları

| Ortam | Ne için | Veri | Sorumlu | Hazır olma |
|---|---|---|---|---|
| Yerel | Geliştirme, hızlı test | Seed verisi | Her geliştirici | H3 (tek komutla kurulum) |
| CI (GitHub Actions) | Her PR'da otomatik build + test | Her koşuda sıfırdan test VT'si | Utku | H3 ✅ |
| Staging | Manuel test, E2E tam set, UAT, demo provası | Seed + demo verisi | Buğra | H6 |
| Yayın (production) | Final demo | Demo verisi | Buğra | H8 |

**Tarayıcılar:** Chrome (birincil), Firefox. **Ekran:** 1920×1080, 1366×768, tablet 768 px.

**Test kullanıcıları (seed):**

| Kullanıcı | Rol | Amaç |
|---|---|---|
| `yonetici@test.local` | Yönetici | Proje/üye/görev yönetimi |
| `uye1@test.local` | Ekip Üyesi (proje üyesi) | Atanan görevler, yorum, dosya |
| `uye2@test.local` | Ekip Üyesi (proje üyesi değil) | Yetkisiz erişim testleri |

## 4. Giriş kriterleri (test turu başlar)

- Özellik `develop`'a birleşmiş, CI yeşil.
- Kart kabul kriterleri yazılı (Abdulkahhar).
- API değiştiyse Swagger/OpenAPI güncel.
- Test ortamı ayakta ve seed verisi yüklü.
- Önceki turdan kalan **Kritik** hata yok (varsa tur ertelenir).

## 5. Çıkış kriterleri

| Kontrol noktası | Kriter |
|---|---|
| **Sprint sonu (her Cuma)** | Sprint kartlarının senaryoları koşuldu; Kritik açık hata yok; bulunan hatalar Issues'a girildi |
| **M3 · MVP (8 Kasım)** | Rol/yetki ve proje API testleri yeşil; MVP akışında Kritik/Yüksek açık hata yok |
| **M4 · Özellik dondurma (22 Kasım)** | Tüm MUST senaryoları en az bir kez koşuldu; regresyon listesi hazır; backend kapsamı ≥ %50 |
| **M5 · RC (29 Kasım)** | Kritik ve Yüksek açık hata yok; Orta hatalar için karar verilmiş; tam regresyon geçti; Test Raporu v1 |
| **M6 · Teslim (7 Aralık)** | Sunum sabahı smoke testi geçti; Final Test Raporu teslim paketinde |

**Askıya alma:** Ortam çalışmıyorsa veya giriş akışı kırıksa (Kritik hata) tur durdurulur, hata düzelince yeniden
başlar. **Yeniden başlama:** Düzeltme `develop`'a birleşip CI yeşil olduğunda.

## 6. Roller ve sorumluluklar

| Kişi | Test sorumluluğu |
|---|---|
| Utku Uzun | Plan, API/E2E testleri, manuel turlar, CI, hata triyajı, Test Raporu |
| Ümit Efe Özkaleli | Frontend birim/bileşen testleri; UI hatalarının düzeltilmesi |
| Mustafa Şahin | Backend birim testleri, yeni uç noktada en az bir API testi; backend hatalarının düzeltilmesi |
| Buğra Durmuş | Test VT'si, seed verisi, staging ortamı |
| Abdulkahhar Türkoğlu | Kabul kriterleri, UAT, kabul testi notları |
| Hakan Koço | Hata önceliklendirme (triyaj), RC kararı, plan onayı |
| Mert Yanık | Test sonuçlarının haftalık rapora ve final dokümana işlenmesi |

## 7. Hata yönetimi

### 7.1 Hata kaydı

Her hata GitHub Issues'ta **Hata Bildirimi** şablonuyla açılır; `bug` + bir **önem** etiketi alır, panoya düşer.
Hata, ilgili özelliğin geliştiricisine atanır; Utku düzeltmeyi doğrulayıp kartı kapatır.

### 7.2 Önem seviyeleri

| Önem | Etiket | Tanım | Örnek | Hedef süre |
|---|---|---|---|---|
| **Kritik** | `onem: kritik` | Sistem veya ana akış çalışmıyor, veri kaybı, güvenlik açığı; çözümü yok | Giriş yapılamıyor; Ekip Üyesi başkasının projesini silebiliyor | Aynı gün, sprint'i durdurur |
| **Yüksek** | `onem: yüksek` | MUST bir özellik çalışmıyor veya yanlış sonuç veriyor; zahmetli bir geçici çözüm var | Görev atanamıyor; ilerleme yüzdesi yanlış hesaplanıyor | Aynı sprint içinde |
| **Orta** | `onem: orta` | Özellik çalışıyor ama kısmen hatalı; kolay geçici çözüm var | Tarih filtresi ay sonunu kaçırıyor; hata mesajı yanlış | Sonraki sprint |
| **Düşük** | `onem: düşük` | Kozmetik, yazım, hizalama; işlevi etkilemiyor | Buton hizası kaymış; yazım hatası | Zaman kalırsa |

### 7.3 Hata yaşam döngüsü

```
Açık (Todo) → Düzeltiliyor (In Progress) → Doğrulamada (Review: PR açık) → Kapalı (Done: Utku doğruladı)
                                   ↑                                      │
                                   └────────── Yeniden açıldı ◄───────────┘
```

Düzeltme PR'ı hatayı yeniden üreten bir regresyon testi içerir ve açıklamasında `Closes #<hata-no>` yazar.

## 8. Teslim edilecek test çıktıları

| Çıktı | Hafta | Konum |
|---|---|---|
| Test stratejisi v0.5 | H1 | `docs/test/test-stratejisi.md` |
| Test planı v1, ilk senaryolar, hata şablonu | H2 | `docs/test/`, `.github/ISSUE_TEMPLATE/` |
| CI hattı, ilk otomatik testler | H3 | `.github/workflows/ci.yml`, `client/`, `server/` |
| Test seti ve hata kayıtları | H4–H7 | Kod + GitHub Issues |
| Regresyon listesi | H5 | `docs/test/regresyon-listesi.md` |
| Coverage raporu | H6 | CI çıktısı |
| Test Raporu v1 | H8 | `docs/test/test-raporu.md` |
| Final Test Raporu | H9 | Teslim paketi |

## 9. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Teknoloji kararı gecikti, test araçları kesinleşmedi | Otomasyon geç başlar | CI yığından bağımsız kuruldu; karar gelince sadeleşir |
| Kod geç gelir, testler H8'e yığılır (yol haritası "Test zirvesi") | Stabilizasyon haftası taşar | H3'ten itibaren her PR'da test zorunlu (DoD) |
| Staging ortamı geç hazır olur | UAT ve E2E gecikir | E2E önce CI'da Docker Compose ile koşar |
| Kabul kriterleri belirsiz | Yanlış şey test edilir | Senaryolar Abdulkahhar'ın hikâyeleriyle eşleştirilir, belirsizlik Refinement'ta çözülür |
