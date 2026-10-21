# Yerel teslim kontrolü — 21 Ekim 2026

## Doğrulandı

- `npm test`: 6 test dosyası, 37 test başarılı.
- `npm run lint`: sıfır hata ve uyarı. `npm run check` tüm yerel kontrolleri sırayla çalıştırır.
- Giriş/kayıt, proje listesi ve raporlarda axe-core semantik erişilebilirlik denetimleri geçti; renk kontrastı ve görsel kontroller kapsam dışı.
- `npm run build`: TypeScript ve Vite üretim derlemesi başarılı.
- Bozuk kayıt üzerine yazma ve başka sekmede değişen eski kayıtla yazma engellenir.
- Tutarsız tamamlanma tarihi, boş ekip ve geçersiz içerikler depolama okunurken reddedilir.
- Ağ kesintisi, zaman aşımı, 403 ve 429 hataları anlaşılır mesajlara dönüştürülür.
- IndexedDB bağlantısı sürüm değişiminde kapanır; engellenen açma isteği sonradan tamamlanırsa bağlantı açık bırakılmaz.

## Bekleyen kabul adımları

- Figma tasarım dosyası: Figma eklentisi kullanılmadığından üretilmedi.
- Backend: uzak develop ve mevcut uzak dallarda entegrasyona hazır uygulama/API sözleşmesi bulunmadı.
- Görsel doğrulama, gerçek tarayıcı dosya indirme ve modal odak testi: önceki tarayıcı erişim engeli nedeniyle henüz doğrulanmadı.
- Frontend CI tanımı eklendi; ekip onayı, uzak CI sonucu ve kartların tamamlanması ayrıca doğrulanmalıdır.

Bu teslim yerel frontend prototipidir. Gerçek çok kullanıcılı ürün veya tamamlanmış sprint kabulü olarak sunulmamalıdır. Kaynak kod paketi bağımlılıkları içermez; `client` içinde `npm ci`, ardından `npm run dev` çalıştırılır.
