# Test Stratejisi — v0.5

| | |
|---|---|
| Proje | SEK TECH · Proje Yönetim Sistemi |
| Sorumlu | Utku Uzun (Test Uzmanı / CI Sorumlusu) |
| Kart | #25 · Sprint 0 |
| Durum | Taslak (v0.5) — teknoloji yığını kesinleşince araç seçimleri v1.0'da sabitlenecek |
| Kaynak | `docs/yol-haritasi.pdf` Bölüm 1 (Sürekli test), 2.2 (Modüller), 4.4 (DoD), 6 (Haftalık plan) |

## 1. Amaç

Testi son haftaya bırakmamak. Yol haritasındaki 3. kritik başarı faktörüne göre **3. haftadan (Sprint 2) itibaren
her Pull Request otomatik testten geçer**. Bu doküman hangi seviyede neyin, kim tarafından, hangi araçla test
edileceğini tanımlar. Ayrıntılı kapsam, ortamlar ve giriş/çıkış kriterleri [Test Planı](test-plani.md)'ndadır.

## 2. Kalite hedefleri

| Hedef | Ölçüt | Ne zaman |
|---|---|---|
| Her PR otomatik testten geçer | CI "CI sonucu" kontrolü zorunlu | M2 (25 Ekim) |
| Yetki kuralları testlerle doğrulanır | Her rol × her kritik işlem için en az bir API testi | M3 (8 Kasım) |
| Kritik akışlar uçtan uca çalışır | Giriş → proje → görev → Kanban E2E senaryosu yeşil | M4 (22 Kasım) |
| Backend birim + API test kapsamı | Satır kapsamı ≥ %60 (hedef), ≥ %50 (alt sınır) | M4 |
| Yayın kalitesi | Kritik/Yüksek önemde açık hata yok | M5 (29 Kasım) |

## 3. Test seviyeleri

Test piramidi uygulanır: çok sayıda hızlı birim testi, orta sayıda API testi, az sayıda ama kritik akışları kapsayan
E2E testi, ve bunların yakalayamadığı kullanılabilirlik konuları için manuel test.

```
          ┌─────────┐   Manuel + UAT  (Utku, Abdulkahhar) — her sprint sonu
          │  E2E    │   Az sayıda, kritik akışlar — H5'ten itibaren
        ┌─┴─────────┴─┐
        │   API       │ Her uç nokta için mutlu yol + hata + yetki — H3'ten itibaren
      ┌─┴─────────────┴─┐
      │     Birim        │ İş kuralları, yardımcı fonksiyonlar, bileşenler — H3'ten itibaren
      └─────────────────┘
```

| Seviye | Neyi test eder | Kim yazar | Ne zaman koşar | Araç (aday) |
|---|---|---|---|---|
| **Birim (unit)** | Tek fonksiyon/sınıf/bileşen; iş kuralları (ör. ilerleme yüzdesi hesabı, tarih doğrulama), UI bileşenlerinin render'ı | Kodu yazan geliştirici (Ümit Efe, Mustafa); Utku gözden geçirir | Her PR'da CI | §4 tablosu |
| **API / entegrasyon** | HTTP uç noktası + veritabanı birlikte: durum kodu, yanıt gövdesi, yetki, doğrulama hataları | Utku (sahibi), Mustafa (yeni uç noktada en az 1 test) | Her PR'da CI, test VT'si ile | §4 tablosu |
| **Uçtan uca (E2E)** | Gerçek tarayıcıda kullanıcı akışı: giriş, proje oluşturma, görev sürükle-bırak | Utku | H5'ten itibaren PR'da (kısa set) + gece/sprint sonu (tam set) | Playwright |
| **Manuel / keşif** | Görsel tutarlılık, responsive, hata mesajlarının anlaşılırlığı, otomasyona değmeyen kenar durumlar | Utku | Her sprint sonu (Cuma), staging'de | Test senaryoları dokümanı |
| **Kullanıcı kabul (UAT)** | Kabul kriterlerinin müşteri gözüyle doğrulanması | Abdulkahhar | Sprint Review öncesi; MVP (H5) ve RC (H8) | Kabul kriterleri |
| **Smoke** | Uygulama ayağa kalkıyor mu, giriş ve ana sayfa açılıyor mu | Utku | Her dağıtımdan sonra, sunum sabahı | E2E setinden 3–5 senaryo |
| **Performans (temel)** | Rapor uç noktalarının makul sürede dönmesi (< 1 sn, seed verisiyle) | Utku, Buğra | H7–H8 | k6 veya basit zamanlama testi |
| **Güvenlik (temel)** | Yetkisiz erişim, dosya türü/boyut sınırı, JWT süresi, SQL/NoSQL enjeksiyonu | Utku | H6 (dosya), H8 (tam tur) | API testleri + manuel |

### Öncelikli test alanları (modüllere göre risk)

| Modül | Risk | Odak |
|---|---|---|
| M2 Kullanıcı & Rol | **Yüksek** — yetki hatası tüm sistemi etkiler | Her rol × işlem matrisi API testleri ("Ekip Üyesi proje silememeli") |
| M1 Proje & Görev | **Yüksek** — ana iş akışı | CRUD, atama, durum geçişleri, Kanban E2E |
| M5 Raporlama | Orta — hesaplama hatası sessiz kalır | Bilinen seed verisiyle beklenen sonuç testleri |
| M4 Dosya & Yorum | Orta — güvenlik | Dosya türü/boyut, yetkisiz indirme |
| M3 Takvim & Gantt | Orta — tarih kenar durumları | Ay geçişi, bitiş < başlangıç, saat dilimi |

## 4. Araçlar — aday teknoloji yığınlarına göre

8 Ekim karar toplantısında seçilen yığına göre ilgili satır geçerli olur; diğerleri v1.0'da silinir.

| Katman | React + Node.js | Django + React | Spring Boot + Angular |
|---|---|---|---|
| Backend birim | **Jest** veya Vitest | **pytest** + pytest-django | **JUnit 5** + Mockito |
| API / entegrasyon | **Supertest** + Jest | **pytest** + DRF `APIClient` | **Spring Boot Test** + MockMvc / REST Assured |
| Test veritabanı | Docker'da ayrı PostgreSQL/MySQL veya Testcontainers; MongoDB için mongodb-memory-server | Django test DB (otomatik oluşturulur) | Testcontainers veya H2 |
| Frontend birim/bileşen | **Vitest** + React Testing Library | **Vitest** + React Testing Library | **Jasmine/Karma** veya Jest (Angular) |
| E2E | **Playwright** | **Playwright** | **Playwright** |
| Kapsam (coverage) | Jest/Vitest `--coverage` | coverage.py | JaCoCo |
| API dokümanı doğrulama | Swagger UI / OpenAPI şeması | drf-spectacular | springdoc-openapi |
| Manuel test / hata takibi | GitHub Issues (`bug` + önem etiketi) | ← aynı | ← aynı |

**Neden Playwright?** Üç yığından bağımsız çalışır, GitHub Actions'ta kurulumu tek adımdır, hata anında ekran
görüntüsü ve video kaydeder (hata raporuna doğrudan eklenir).

## 5. Test verisi ve ortamlar

- **Yerel:** Geliştirici makinesi, Docker Compose ile VT (Buğra, H3).
- **CI:** Her PR'da sıfırdan kurulan geçici VT; testler birbirinden bağımsız, her test kendi verisini oluşturur.
- **Staging:** H6'da Buğra'nın kurduğu ortam; manuel test, UAT ve E2E tam seti burada koşar.
- **Seed verisi:** Buğra'nın H3 seed'i test için de kullanılır: en az 1 Yönetici, 2 Ekip Üyesi, 2 proje, her durumda
  görevler. Rapor testleri bu bilinen veriye göre beklenen sonucu doğrular.

## 6. Hata yönetimi (özet)

Hatalar GitHub Issues'ta **Hata Bildirimi** şablonuyla açılır, `bug` etiketi ve bir önem etiketi alır
(Kritik / Yüksek / Orta / Düşük). Ayrıntılar ve tanımlar [Test Planı §7](test-plani.md#7-hata-yönetimi)'ndedir.

## 7. Definition of Done önerisi

Yol haritası Bölüm 4.4'teki DoD (CONTRIBUTING.md) korunur. Test açısından şu **netleştirmeler** önerilir;
ekip onaylarsa CONTRIBUTING.md'ye eklenir:

1. **"En az bir otomatik test"** → yeni API uç noktası için en az: 1 başarılı istek, 1 doğrulama hatası (400/422),
   1 yetki testi (401/403). Yeni UI bileşeni için en az 1 render/etkileşim testi.
2. **Hata düzeltmesi** içeren PR, hatayı yeniden üreten bir regresyon testi içerir (`fix:` commit'leri).
3. **Testler CI'da koşar**: yalnızca yerelde geçen test sayılmaz; "CI sonucu" kontrolü yeşil olmalı.
4. **Atlanmış test yok**: `skip`/`only`/`xit` ile devre dışı bırakılan test, PR açıklamasında gerekçesiyle belirtilir.
5. **Kapsam düşmez**: H5'ten itibaren PR, backend kapsamını 2 puandan fazla düşürmez (CI'da raporlanır).
6. **Kod içermeyen kartlar** (rapor, tutanak, plan): çıktı repoya eklenmiş, en az bir ekip üyesi PR'ı onaylamış olmalı.

## 8. Takvim (yol haritası Bölüm 6'dan)

| Hafta | Test işi | Çıktı |
|---|---|---|
| H1 · Sprint 0 | Test stratejisi, DoD önerisi | Bu doküman (v0.5) |
| H2 · Sprint 1 | Test planı, ilk senaryolar, hata şablonu | Test planı v1 |
| H3 · Sprint 2 | CI hattı, FE/BE birim test altyapısı, auth API testleri | Çalışan CI · ilk testler |
| H4 · Sprint 3 | Rol, yetki ve proje API testleri; ilk manuel tur | Test seti · hata kayıtları |
| H5 · Sprint 4 | Görev/yorum API testleri, E2E altyapısı, Kanban senaryosu | E2E altyapısı · regresyon listesi |
| H6 · Sprint 5 | Dosya güvenlik testleri, takvim kenar durumları, coverage | Güvenlik testleri · coverage raporu |
| H7 · Sprint 6 | Rapor doğruluk testleri, tam regresyon E2E seti | Regresyon seti · hata listesi |
| H8 · Sprint 7 | Tam regresyon, smoke, temel performans | Test Raporu v1 |
| H9 · Sprint 8 | Final Test Raporu, sunum sabahı smoke | Final Test Raporu |

## 9. Açık konular

- [ ] Teknoloji yığını ve VT kararı → §4'teki araçlar sabitlenecek (v1.0).
- [ ] Kapsam hedefi (%60) ekip ve Hakan tarafından onaylanmalı.
- [ ] DoD netleştirmeleri (§7) Sprint Review'da oylanmalı.
