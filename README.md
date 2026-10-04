# Proje Yönetim Sistemi

Scrum/Kanban metodolojisini destekleyen, web tabanlı bir yazılım proje yönetim uygulaması.
Kullanıcılar proje oluşturabilir, ekip üyelerini davet edebilir, görevleri Kanban panosunda takip edebilir ve sprint planlayabilir.

## Teknolojiler

| Katman | Teknoloji |
|---|---|
| Ön yüz | React (Vite) |
| Arka yüz | Node.js + Express |
| Veritabanı | PostgreSQL |
| Kimlik doğrulama | JWT |

## Klasör Yapısı

```
proje-yonetim-sistemi/
├── client/          # React ön yüz
├── server/          # Node.js / Express API
├── docs/            # Dokümantasyon
│   └── sprints/     # Haftalık sprint raporları
└── .github/         # Issue ve PR şablonları
```

## Kurulum

### Gereksinimler
- Node.js 20+
- PostgreSQL 15+

### Arka yüz
```bash
cd server
cp .env.example .env   # değerleri kendi ortamına göre doldur
npm install
npm run dev
```

### Ön yüz
```bash
cd client
npm install
npm run dev
```

## Temel Özellikler (MVP)
- [ ] Kullanıcı kaydı / girişi ve roller (yönetici, üye)
- [ ] Proje oluşturma ve üye davet etme
- [ ] Görev oluşturma, atama, öncelik ve durum yönetimi
- [ ] Sürükle-bırak Kanban panosu
- [ ] Backlog ve sprint yönetimi
- [ ] Görevlere yorum ekleme
- [ ] Burndown grafiği

## Çalışma Düzeni
Katkı kuralları için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.
Sprint raporları [docs/sprints](docs/sprints) klasöründedir.

## Ekip
| İsim | Rol |
|---|---|
| (Senin adın) | Proje Yöneticisi / Scrum Master |
| | Geliştirici |
| | Geliştirici |
