# Proje Yönetim Sistemi

**SEK TECH** ekibinin Yazılım Proje Yönetimi dersi kapsamında geliştirdiği, Azure Boards'tan ilham alan web tabanlı proje yönetim platformu.
Küçük ve orta ölçekli yazılım ekipleri projelerini, görevlerini ve ilerlemesini tek bir web arayüzünden yönetebilir.

- **Dönem:** 5 Ekim – 7 Aralık 2026 · 9 haftalık sprint (Sprint 0–8) + teslim günü
- **Resmi plan:** [docs/yol-haritasi.pdf](docs/yol-haritasi.pdf) — SEK TECH Proje Yol Haritası ve Görev Dağılımı Raporu, Sürüm 1.0
- **Takip panosu:** [SEK TECH – Proje Panosu](https://github.com/users/Utkuuzun14/projects/1) — panoda kartı olmayan iş yapılmamış sayılır

## Ürün modülleri

| Kod | Modül | Kapsam | Hafta |
|---|---|---|---|
| M1 | Proje & Görev Yönetimi | Proje oluşturma (ad, açıklama, başlangıç–bitiş); görev tanımlama, kişiye atama; To Do / In Progress / Done | H4–H5 |
| M2 | Kullanıcı & Rol Yönetimi | Yönetici ve Ekip Üyesi rolleri; role göre yetkiler | H3–H4 |
| M3 | Takvim & Zaman Yönetimi | Görev tarihlerinin takvimde izlenmesi; Kanban panosu ve Gantt şeması | H5–H6 |
| M4 | Dokümantasyon & Dosya Paylaşımı | Projeye doküman yükleme ve ekip erişimi; yorumlarla iletişim | H5–H6 |
| M5 | Raporlama & Analiz | Yüzdelik ilerleme; kişi bazlı tamamlama; günlük/haftalık/aylık raporlar | H6–H7 |

Önceliklendirme (MoSCoW) yol haritasının 2.3 bölümündedir ve Sprint 0'da kesinleşir.

## Ekip

| Ekip üyesi | Birincil rol | İkincil rol (öneri) | GitHub |
|---|---|---|---|
| Hakan Koço | Proje Yöneticisi | Scrum Master | — |
| Abdulkahhar Türkoğlu | Müşteri Temsilcisi | Ürün Sahibi (PO), Wireframe/UX | — |
| Mert Yanık | Raporlama Sorumlusu | Dokümantasyon Sorumlusu | — |
| Ümit Efe Özkaleli | Frontend Geliştirici | UI Tasarım (hi-fi) | — |
| Mustafa Şahin | Backend Geliştirici | API Dokümantasyonu | — |
| Buğra Durmuş | Veri Tabanı Yöneticisi | DevOps, Backend destek | — |
| Utku Uzun | Test Uzmanı (QA) | CI Sorumlusu | [@Utkuuzun14](https://github.com/Utkuuzun14) |

İkincil roller öneridir; Sprint 0'da ekipçe onaylanır.

## Kilometre taşları

| Kod | Tarih | Kilometre taşı | Başarı kriteri | Sorumlu |
|---|---|---|---|---|
| M1 | 18 Ekim | Analiz tamamlandı | SRS v1.0 onaylı; backlog tahminlenmiş; ER diyagramı ve API sözleşmesi taslağı hazır | Hakan, Abdulkahhar |
| M2 | 25 Ekim | Tasarım & altyapı hazır | Hi-fi mockup onaylı; CI her PR'da çalışıyor; giriş/kayıt uçtan uca çalışıyor; tek komutla kurulum | Ümit, Utku, Buğra |
| M3 | 8 Kasım | MVP · ara demo | Rol bazlı giriş, proje ve görev yönetimi, atama ve Kanban uçtan uca; `v0.5` etiketi | Hakan |
| M4 | 22 Kasım | Özellik dondurma | Beş modülün Must özellikleri tamam; yeni özellik eklenmez | Hakan, Abdulkahhar |
| M5 | 29 Kasım | Sürüm adayı (RC) | Kritik/yüksek önemde açık hata yok; yayın ortamında çalışıyor; Test Raporu v1 | Utku, Buğra |
| M6 | 7 Aralık | Teslim & müşteri sunumu | Demo, dokümantasyon, test raporu ve süreç kanıtları teslim edildi | Tüm ekip |

Her kilometre taşı GitHub'da aynı adla bir milestone'dur; haftalık kartlar ilgili milestone'a bağlıdır.

## Teknoloji yığını

> **Teknoloji yığını 8 Ekim karar toplantısında kesinleşecek.**
> Metodoloji, teknoloji yığını, veri tabanı ve takip aracı kararları yol haritasının 11. bölümündeki seçeneklere göre verilir
> ve [karar tutanağına](docs/sablonlar/karar-tutanagi.md) işlenir. Bu bölüm ve kurulum adımları karardan sonra güncellenecektir.

| Karar | Değerlendirilen seçenekler |
|---|---|
| Metodoloji | Scrum (1 haftalık sprint) · Kanban · Scrumban |
| Teknoloji yığını | React + Node.js · Django + React · Spring Boot + Angular |
| Veri tabanı | PostgreSQL · MySQL · MongoDB |
| Takip aracı | GitHub Projects · Jira · Trello |

## Klasör yapısı

```
proje-yonetim-sistemi/
├── client/            # Ön yüz uygulaması
├── server/            # Arka yüz / API
├── docs/              # Dokümantasyon
│   ├── yol-haritasi.pdf
│   ├── sablonlar/     # Haftalık rapor, karar tutanağı, toplantı notu şablonları
│   └── sprints/       # Haftalık sprint raporları
└── .github/           # Issue ve PR şablonları
```

## Kurulum

Kurulum adımları teknoloji yığını kesinleştikten sonra (H2) eklenecektir. Hedef, M2 itibarıyla sistemin tek komutla
(Docker Compose) ayağa kalkmasıdır.

## Çalışma düzeni

Sprint törenleri, dal/commit kuralları ve Tamamlandı Tanımı (DoD) için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.
Haftalık raporlar [docs/sprints](docs/sprints), şablonlar [docs/sablonlar](docs/sablonlar) klasöründedir.
