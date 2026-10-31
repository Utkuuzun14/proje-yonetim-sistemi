> 30 Ekim güncellemesi: #109 ile proje/RBAC uç noktaları develop dalına eklendi ve bu dala alındı. Önceki bağımlılık notları tarihsel durumdur. Güncel Docker ve gerçek API doğrulama kapsamı [teslim kontrolünde](teslim-kontrolu.md).

# Sprint 3 frontend teslimi - #43

Tarih: 26 Ekim 2026. Kapsam: 26 Ekim - 1 Kasım, proje ekranları ve role göre arayüz.

## Hazır frontend davranışı

- `/giris` ve `/kayit`, mevcut backend'in `{data:{user,token}}` yanıtını işler ve `/uygulama/projeler` adresine yönlendirir. Bozuk yanıtla başarılı oturum oluşturulmaz.
- Kayıt doğrulaması backend'deki ad/e-posta/parola kurallarıyla hizalandı; 400 alan hataları ilgili kontrole `aria-describedby` ile bağlanır. Giriş parolasına yeni kayıt karmaşıklık kuralı uygulanmaz.
- Token yalnız `sessionStorage` içinde saklanır; parola ve kullanıcı rolü depolanmaz. Sayfa yenilemede `/auth/me` çağrısıyla kullanıcı/rol yeniden alınır. Oturum doğrulanırken korunan içerik gösterilmez.
- `/uygulama/*` oturum gerektirir. `401` oturumu temizler ve girişe yönlendirir; `403` erişim hatasını gösterir, oturumu bozmaz. Ağ hatasında tekrar deneme vardır. Çıkış tokenı ve ekrandaki kullanıcıyı temizler.
- Gerçek proje listesi, arama, detay, oluşturma ve düzenleme ekranları `/projects` sözleşmesini kullanır. Oluşturma POST, düzenleme PATCH gönderir; başarıdan sonra liste/detay yeniden okunur. Kaydetme hatasında form değerleri korunur.
- Yalnız API'nin `Yönetici` rolündeki kullanıcı için oluşturma/düzenleme düğmeleri gösterilir. Bu kontroller sunucu RBAC denetiminin yerine geçmez.
- Yükleniyor, boş liste, arama sonucu yok, 400/401/403/404, zaman aşımı ve ağ hatası durumları ayrı ele alınır. Eksik proje API'si demo verisine sessizce düşmez.
- `/onizleme/*` mevcut yerel demodur; gerçek çalışma alanı bu depoyu ve demo rol seçicisini kullanmaz.

## API ve kurulum

`client/.env.example` dosyasını `.env.local` olarak kopyalayın. `VITE_API_URL=http://localhost:5000/api`; Vite ortam değişikliği sonrası yeniden başlatılır. Çalıştırma: `server` içinde `npm ci && npm start`, `client` içinde `npm ci && npm run dev` (komutlar terminale ayrı ayrı da yazılabilir). Backend kayıt/giriş için PostgreSQL gerektirir.

| İstek | Kullanım | Backend durumu |
|---|---|---|
| POST `/auth/login`, `/auth/register` | Hesap ve token | Kod mevcut (#37) |
| GET `/auth/me` | Oturum doğrulama | Kod mevcut (#37) |
| GET `/projects` | Liste | Sözleşme mevcut, rota #44 bekliyor |
| GET `/projects/:id` | Detay | Sözleşme mevcut, rota #44 bekliyor |
| POST `/projects` | Oluşturma | Sözleşme mevcut, rota #44 bekliyor |
| PATCH `/projects/:id` | Düzenleme | Sözleşme mevcut, rota #44 bekliyor |

GET yanıtları `{data:...}` biçiminde beklenir. Proje alanları `id`, `name`, `description`, `start_date`, `end_date`, `owner_id`. POST/PATCH için başarılı 2xx yanıt yeterlidir; yanıt gövdesi zorunlu değildir. Tarihler formda zorunlu ve bitiş başlangıçtan önce olamaz. Üyelik yönetimi ve kullanıcı rolü atama backend #44 ile ayrıca tamamlanacak; bu teslimde bunlar yapılmış sayılmaz.

İstekler `Authorization: Bearer` başlığı taşır; cookie gönderilmez. Sözleşmedeki tek JWT kullanılır; refresh token uç noktası yoktur. Çıkış istemci tarafındadır, token sunucuda iptal edilmez. `sessionStorage` JavaScript tarafından okunabilir: XSS karşısında HttpOnly cookie koruması sağlamaz. Üretim yayını öncesi CSP, HTTPS, oturum süresi/yenileme ve iptal stratejisi ekipçe karara bağlanmalıdır.

## Test ve kabul sınırı

`npm run check`: lint, Vitest ve üretim derlemesi. Yeni testler korunan rotayı, token/Authorization başlığını, çıkışı, `/me` ile yeniden doğrulamayı, üye rolünü, 401/403 farkını, POST/PATCH gövdelerini, form hatalarının korunmasını, eksik serviste tekrar denemeyi ve eski 401 yanıtının yeni tokenı silmemesini kapsar.

Proje senaryolarında fetch yanıtları kontrollü test verileridir; bunlar gerçek PostgreSQL ile uçtan uca kabul testi değildir. Yerel backend sağlık kontrolü daha önce veritabanı erişimi olmadığı için 503 döndü. #44 uç noktaları ve yerel veritabanı olmadan gerçek proje oluşturma/güncelleme başarısı kanıtlanamaz.

Tam kabul için backend #44 tamamlanmalı; yönetici ve üye ile gerçek giriş, proje oluşturma/düzenleme, üyelik sınırı ve sunucu 403 yanıtı birlikte test edilmelidir. Figma bu teslim kapsamına alınmadı. #43, bağımlılıklar ve ekip kabulü tamamlanmadan kapatılmaz.
