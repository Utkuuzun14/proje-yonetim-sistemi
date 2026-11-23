# Frontend tasarım ve teslim notu — #29, #36, #43, #50, #57, #64

## Hazırlananlar

- React/TypeScript/Vite iskeleti, yönlendirme, kurulum ve testler.
- Giriş/kayıt ekranları, kenar menü, üst çubuk, mobil menü.
- Çalışan HTML önizlemesi ve `/onizleme/tasarim` bileşen kataloğu.
- Hata, bekleme ve devre dışı durumları; görünür etiketler, klavye odağı, içeriğe geç bağlantısı.
- Proje listesi/detayı/oluşturma/düzenleme ve ekip atama.
- Rol simülasyonuna göre kontroller, görev listesi ve sürükle-bırak Kanban, görev detayında yorumlar.
- Aylık takvim, Gantt ve tarayıcıda saklanan dosyaları ekleme/indirme.
- Veriden hesaplanan dashboard, kişi bazlı raporlar ve CSV.

## Tasarım temelleri

Ana renk #176B58, koyu yüzey #102B29, zemin #F5F6F2. Font Segoe UI/sans-serif; gövde 16 px, açıklama 12 px, başlık 36 px. Boşluk: 4/8/12/16/24/32/48 px. Kart yarıçapı 12 px, form elemanları 7 px. Mobil kırılım 760 px.

| Ortak bileşen | Durum |
|---|---|
| Button, Field, Card | Uygulandı |
| Tablo | Görev listesi ve raporda uygulandı; semantik başlıklar, yatay taşma |
| Modal | Yerel HTML dialog; odak yönetimi, Escape, odak dönüşü |

## Figma aktarım planı

Figma dosyası henüz oluşturulmadı. Ekranlar referans alınabilir. Sayfalar: Foundations, Components, Auth, Workspace. Frame: 1440×1000 masaüstü, 390×844 mobil. Button/Field normal, focus, disabled, error varyantları; Card ve Navigation auto-layout olarak hazırlanmalı. Giriş → kayıt ve çalışma alanı prototip bağlantıları eklenmeli. Ekip dosyası erişimi ve tasarım onayı bekleniyor.

## Fizibilite geri bildirimi

26 Ekim güncellemesi: repodaki yedi ekranın metinsel wireframe açıklaması incelendi. Ekran bazlı teknik geri bildirim, kapsam farkları ve bireysel UX değerlendirmesi [UX ve wireframe geri bildirimi](ux-ve-wireframe-geri-bildirimi.md) belgesinde. Figma görselleri incelenmedi; görsel tasarım onayı verilmedi.

## Açık bağımlılıklar

- #22: ortak UX incelemesi, ekip kararı ve sunum bekleniyor.
- #29: Radix Label kuruldu ve ortak Field içinde kullanıldı; bileşen envanteri ve metinsel wireframe geri bildirimi tamamlandı. Ekip incelemesi ve kabulü bekleniyor.
- #36: Figma dosyası ve backend uçtan uca entegrasyonu bekleniyor.
- #43/#50/#57/#64: frontend demo akışları uygulandı; sunucu yetkileri, gerçek veri ve ekipler arası paylaşım için API entegrasyonu bekleniyor. Bu kartlar tamamlanmış sayılmaz.
- #71: otomatik kontroller eklendi; gerçek backend, üretim ortamı ve kapsamlı erişilebilirlik testi bekleniyor.
- #78: demo ekran akışı `sunum-akisi.md` içinde hazırlandı; canlı prova ve ekran görüntüleri henüz tamamlanmadı.
- Ekip incelemesi, CI, kabul kontrolü ve PR birleştirmesi tamamlanmadan kartlar Done yapılmaz.

## Doğrulama kapsamı

Otomatik testler: rol sınırları, proje/görev tarihleri, durum geçişleri ve tamamlanma tarihi, yorumlar, kayıt okuma/yazma hataları, takvim/Gantt sınırları, CSV kaçışları ve dosya saklama. Tarayıcı aracı URL politikası erişimi engellediği için bu turdaki ekranların görsel doğrulaması tamamlanamadı; mobil düzen, native dialog odağı ve gerçek tarayıcıdaki dosya indirme manuel kontrol bekliyor.

Tasarım kararları: modal için native dialog, tablo için semantik HTML, ikonlar için Lucide kullanıldı. Büyük listelerde sayfalama, sunucu dosya taraması ve çok kullanıcılı çakışma çözümü API aşamasına bırakıldı.
