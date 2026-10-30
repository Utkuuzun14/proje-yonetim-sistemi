# Frontend teslim kontrolü - 30 Ekim 2026

## Güncel durum

- Frontend: JWT oturumu, korunan proje ekranları ve yerel demo hazır; 49 otomatik test bulunur.
- Backend auth ve proje/RBAC API kodu develop dalından alındı (#91, #109).
- Utku 26 Ekim tarihli PR #93 incelemesinde gerçek PostgreSQL ve Chromium ile kayıt/giriş, yenileme, çıkış, yanlış parola ve yönetici görünümünü test ettiğini bildirdi ve onay verdi. Bu ekip kanıtıdır; bu oturumda yapılmış tarayıcı testi olarak sunulmaz.
- client/Dockerfile Vite build -> nginx kullanır. API tabanı /api; nginx server:5000 servisine proxy yapar. SPA yenilemeleri desteklenir; eksik asset 404 döner.
- docker compose up --build -d artık db + server + client başlatır. Arayüz localhost:3000 adresindedir.
- Ayrı frontend.yml kaldırıldı; ana CI Node (client) işi Node 22 ile lint/test/build çalıştırır. Zorunlu CI sonucu adı korunur.
- scripts/compose-smoke.mjs: derlenmiş HTML/JS, SPA, nginx API proxy, JWT, gerçek proje oluşturma/düzenleme, üyelik, 401/403/404 kontrolleri. Geçici CI veritabanında oluşturduğu projeyi siler. Tarayıcı görsel/klavye testi değildir.

## Kabul sınırları

Bu bilgisayarda Docker bulunmadı; tam sistem doğrulaması GitHub Actions sonucuyla raporlanır. Figma kullanıcı talebiyle bu çalışmanın dışında. Abdulkahhar kabulü ve PR birleştirmesi henüz doğrulanmadı. #96 üzerinde Hakan 29 Ekim tarihinde Figma çizimi kararı vermiştir; kullanıcı bu çalışmada Figma istemediği için #36 açık kalır.

PR #93 incelemelerindeki adres/JWT/CORS/parola/alan hatası notları karşılandı. Gerçek alanda backend rol adları kullanılır; demo durum ve rol kodları ayrı kalır. Demo görevleri gerçek API'ye bağlanmadan durum dönüşümü tamamlanmış sayılmaz.

Araştırma/iskelet kartları #22 ve #29, repo sahibinin incelemede tamam kabul ettiği çıktılardır. Kapanış referansları PR açıklamasına eklenir. Sonraki özellikler kart başına küçük PR ile gönderilecektir; ileriki sprint kartları otomatik kapatılmaz.
