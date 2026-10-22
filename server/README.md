# Server — SEK TECH REST API

Node.js 20 · Express 4 · PostgreSQL 15 · JWT · Swagger (OpenAPI 3)

## Çalıştırma

```bash
# 1. Veri tabanını başlat (repo kökünde)
docker compose up -d db

# 2. API'yi yerelde çalıştır
cd server
cp .env.example .env
npm install
npm run dev
```

- API: http://localhost:5000
- **Swagger UI: http://localhost:5000/api/docs**
- Seed kullanıcıları: `hakan@sektech.com` (Yönetici), `utku@sektech.com` (Ekip Üyesi) … parola `Password123!`

Docker ile tüm backend: repo kökünde `docker compose up --build -d` (db + server).

## Testler

```bash
npm test               # birim + API testleri (gerçek PostgreSQL)
npm run test:unit      # yalnızca birim testleri (VT gerekmez)
npm run test:coverage  # kapsam raporu → coverage/
```

API testleri `TEST_DATABASE_URL` (varsayılan `sektech_test`) veri tabanını kullanır; yoksa oluşturur ve her koşuda
`database/init.sql` + `seed.sql` yükler. Geliştirme VT'sine (`sektech`) dokunmaz. CI'da aynı testler her PR'da koşar.

## Yapı

```
src/
├── app.js / server.js
├── config/            ortam değişkenleri
├── db/pool.js         pg bağlantı havuzu
├── middleware/        authenticate · validate · errorHandler · notFound
├── utils/             AppError · asyncHandler
├── docs/openapi.yaml  API sözleşmesi v0.5
└── modules/
    ├── auth/          routes · controller · service · schemas
    ├── users/         routes · controller · repository
    └── health/
```

Katman kuralları, hata formatı ve uç nokta listesi: [`docs/backend/api-sozlesmesi.md`](../docs/backend/api-sozlesmesi.md)
