# SEK TECH frontend

React + TypeScript + Vite. Node.js 22 ve npm gerekir. UI temeli Radix Primitives ile kademeli kurulur: ortak Field bileşeni @radix-ui/react-label kullanır; Button/Card, native dialog ve semantik tablolar mevcut yapıda korunur.

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

Önizleme gerçek kullanıcı oturumu veya gerçek proje verisi içermez. Sunucu kurulmadan giriş başarılı gösterilmez. Parola depolanmaz. Gerçek oturum tokenı yalnız sessionStorage içinde tutulur; önizleme oturum gerektirmez.

## Demo kullanım

Üstteki **Demo kullanıcısı** seçicisiyle Ümit Efe (üye), Hakan (yönetici) veya Mustafa (üye) seçilebilir. Bu bir rol simülasyonudur; güvenli kimlik doğrulama değildir. Yönetici proje ve görevleri oluşturup düzenler, üye yalnız kendisine atanmış görevlerin durumunu değiştirir. Proje üyeleri yorum ve dosya ekleyebilir. Backend ekibiyle kesin yetki matrisi onaylanmalıdır.

Proje/görev/yorumlar `localStorage` içinde `sek-tech-demo-v1` anahtarına kaydedilir. Dosyalar IndexedDB içinde `sek-tech-demo-files` veritabanında tutulur (5 MB/dosya, 25 MB/proje). Dosyalar sunucuya gönderilmez ve başka cihazlarla paylaşılmaz. Depolama hataları kullanıcıya gösterilir. Kaydetmeden önce saklanan veri kontrol edilir; başka sekmenin değişikliği fark edilirse yazma engellenir ve sayfayı yenilemen istenir. Bozuk kayıtlar örnek verilerle ezilmez. Bu kontrol aynı anda gerçekleşen yazmaları atomik olarak kilitlemez; demo tek sekmede kullanım içindir. Tarayıcı site verilerini silmek demoyu sıfırlar.

Takvimde örnek görevler **Ekim 2026** içindedir. Kanban'da sürükle-bırak yanında klavye/dokunma için durum seçicisi bulunur. Gantt çubukları seçilen ayla kesişen tarihleri gösterir. Dönem filtresi yalnız tamamlanmış görevlerin tamamlanma tarihine uygulanır; CSV seçilen projelerin tüm görevlerini dışa aktarır.

## Gerçek API çalışma alanı (#43)

`.env.example` dosyasını `.env.local` olarak kopyalayıp Vite'ı yeniden başlatın. API tabanı `http://localhost:5000/api` olarak ayarlanır. Backend'in kendi PostgreSQL kurulumu gerekir.

- Giriş/kayıt `{data:{user,token}}` yanıtıyla gerçek çalışma alanına yönlendirir.
- `/uygulama/projeler` ve `/uygulama/projeler/:id` korunan proje ekranlarıdır.
- JWT sessionStorage içinde tutulur, isteklerde Bearer başlığıyla iletilir. Cookie kullanılmaz.
- Yenilemede `/auth/me` doğrulaması; 401'de girişe yönlendirme; 403'te erişim hatası; çıkışta yerel oturum temizliği vardır.
- Proje listesi/detay/POST/PATCH mevcut OpenAPI sözleşmesine bağlıdır. Proje rotalarının backend #44 kapsamında uygulanması bekleniyor; testler bu yanıtları taklit eder. Eksik servis gerçek başarı olarak gösterilmez.
- Yalnız Yönetici rolünde proje oluşturma/düzenleme kontrolleri görünür. Sunucu RBAC denetimi ayrıca gereklidir.

Ayrıntılı teslim ve sınırlar: [Sprint 3 entegrasyon notu](../docs/frontend/sprint-3-entegrasyon.md).

## Yapı

- `src/App.tsx`: sayfalar ve yönlendirme.
- `src/components.tsx`: ortak Button, Field, Card.
- `src/styles.css`: tasarım temelleri ve mobil düzen.
- `src/api.ts`: form doğrulama ve API adaptörü.
- `src/App.test.tsx`: kullanıcı akışları ve hata davranışları.
- `src/workspace/`: veri modeli, yerel demo deposu, proje/görev/takvim/rapor/dosya ekranları ve testleri.

Tasarım ve teslim kapsamı: `docs/frontend/`.
