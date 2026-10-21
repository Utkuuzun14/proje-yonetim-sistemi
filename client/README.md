# SEK TECH frontend

React + TypeScript + Vite. Node.js 22 ve npm gerekir.

```sh
cd client
npm ci
npm run dev
```

Tarayıcı: http://127.0.0.1:5173. Kontroller: `npm test` ve `npm run build`.

Tüm kontroller: `npm run check` (ESLint, otomatik testler, TypeScript ve üretim derlemesi). GitHub `Frontend` iş akışı client değişikliklerinde aynı kontrolleri Node.js 22 üzerinde çalıştırır. Erişilebilirlik testleri semantik/ARIA denetimleridir; renk kontrastını, gerçek odak davranışını ve görsel düzeni doğrulamaz.

## Ekranlar

- `/giris`, `/kayit`: doğrulama, bekleme, hata ve istek sonucu durumları.
- `/onizleme`: proje ilerlemesi ve görev dağılımı dashboard'u.
- `/onizleme/projeler`: arama, proje oluşturma/düzenleme, ekip seçimi.
- `/onizleme/projeler/:id`: görev oluşturma/düzenleme/atama, Kanban ve liste, yorumlar, yerel dosya alanı.
- `/onizleme/takvim`: aylık takvim ve Gantt; proje ve ay filtreleri.
- `/onizleme/raporlar`: proje ve kişi bazlı raporlar; gün/hafta/ay tamamlanma filtresi, CSV indirme.
- `/onizleme/tasarim`: renkler, tipografi ve bileşen örnekleri.

Önizleme gerçek kullanıcı oturumu veya gerçek proje verisi içermez. Sunucu kurulmadan giriş başarılı gösterilmez. Parola veya token tarayıcı depolamasına yazılmaz.

## Demo kullanım

Üstteki **Demo kullanıcısı** seçicisiyle Ümit Efe (üye), Hakan (yönetici) veya Mustafa (üye) seçilebilir. Bu bir rol simülasyonudur; güvenli kimlik doğrulama değildir. Yönetici proje ve görevleri oluşturup düzenler, üye yalnız kendisine atanmış görevlerin durumunu değiştirir. Proje üyeleri yorum ve dosya ekleyebilir. Backend ekibiyle kesin yetki matrisi onaylanmalıdır.

Proje/görev/yorumlar `localStorage` içinde `sek-tech-demo-v1` anahtarına kaydedilir. Dosyalar IndexedDB içinde `sek-tech-demo-files` veritabanında tutulur (5 MB/dosya, 25 MB/proje). Dosyalar sunucuya gönderilmez ve başka cihazlarla paylaşılmaz. Depolama hataları kullanıcıya gösterilir. Kaydetmeden önce saklanan veri kontrol edilir; başka sekmenin değişikliği fark edilirse yazma engellenir ve sayfayı yenilemen istenir. Bozuk kayıtlar örnek verilerle ezilmez. Bu kontrol aynı anda gerçekleşen yazmaları atomik olarak kilitlemez; demo tek sekmede kullanım içindir. Tarayıcı site verilerini silmek demoyu sıfırlar.

Takvimde örnek görevler **Ekim 2026** içindedir. Kanban'da sürükle-bırak yanında klavye/dokunma için durum seçicisi bulunur. Gantt çubukları seçilen ayla kesişen tarihleri gösterir. Dönem filtresi yalnız tamamlanmış görevlerin tamamlanma tarihine uygulanır; CSV seçilen projelerin tüm görevlerini dışa aktarır.

## API entegrasyonu bekleniyor

`.env.example` dosyasını `.env.local` olarak kopyalayın. Backend ekibiyle sözleşme onaylandıktan sonra `VITE_API_URL` değerini ekleyin. Önerilen uç noktalar: `POST /auth/login` (`email`, `password`) ve `POST /auth/register` (`name`, `email`, `password`). Başarılı yanıt 2xx; hatalar 401/409 veya genel hata olarak ele alınır. İstek zaman aşımı 15 saniyedir.

Bu uç noktalar henüz repoda uygulanmamıştır. İstemci cookie tabanlı oturum önerir (`credentials: include`). Backend tarafında HttpOnly/Secure/SameSite, CSRF ve izin verilen CORS origin ayarlanmalı; oturum sorgusu, çıkış ve rol korumaları sözleşme sonrası eklenmelidir. Mevcut ekran yalnızca istek sonucunu bildirir.

## Yapı

- `src/App.tsx`: sayfalar ve yönlendirme.
- `src/components.tsx`: ortak Button, Field, Card.
- `src/styles.css`: tasarım temelleri ve mobil düzen.
- `src/api.ts`: form doğrulama ve API adaptörü.
- `src/App.test.tsx`: kullanıcı akışları ve hata davranışları.
- `src/workspace/`: veri modeli, yerel demo deposu, proje/görev/takvim/rapor/dosya ekranları ve testleri.

Tasarım ve teslim kapsamı: `docs/frontend/`.
