> 26 Ekim 2026: Bu belge önceki öneridir. Uygulanan JWT/Bearer sözleşmesi, sessionStorage kararı ve proje API bağımlılıkları için [Sprint 3 entegrasyon notuna](sprint-3-entegrasyon.md) bakın. Cookie önerisi uygulanmadı.

# Frontend–backend entegrasyon taslağı

Bu belge onaylanmış API sözleşmesi değildir. Backend ekibiyle alan adları, roller, hata biçimi ve kimlik doğrulama yaklaşımı netleştirilmeli.

| İşlem | Önerilen uç nokta | Veri |
|---|---|---|
| Oturum | GET /auth/me, POST /auth/logout | kullanıcı id, ad ve rol |
| Proje listesi/oluşturma | GET/POST /projects | id, name, description, start, end, members |
| Proje düzenleme | PATCH /projects/:id | değişen alanlar, sürüm/ETag |
| Görevler | GET/POST /projects/:id/tasks | title, description, assignee, start, end |
| Görev düzenleme | PATCH /tasks/:id | başlık, açıklama, sorumlu, tarihler |
| Durum | PATCH /tasks/:id/status | todo / doing / done |
| Yorum | POST /tasks/:id/comments | text; author ve created sunucuda belirlenir |
| Dosya listesi/ekleme | GET/POST /projects/:id/files | multipart upload; ad, boyut, ekleyen, tarih |
| Dosya indirme | GET /files/:id/download | erişim kontrolünden sonra içerik |

Demo veri sınırı `workspace/model.ts` ve `workspace/Store.tsx` içindedir. Gerçek adaptörde yerel eşzamanlı mutasyonlar, bekleme ve hata durumları olan API çağrılarıyla değiştirilecek. Kanban başarısız istekte önceki durumu korumalı; tekrarlanan istekler idempotent olmalı. Sunucu doğrulanmış yanıtları çalışma alanına vermeli.

Yetki önerisi: yönetici proje/görev oluşturur ve düzenler; üye yalnız atandığı görevlerin durumunu değiştirir; proje üyeleri yorum ve dosya ekler. Bu matris ekipçe onaylanmalı ve her istekte sunucuda uygulanmalı. Ön yüz buton gizlemesi güvenlik sınırı değildir.

Sunucu kimliği, tamamlanma zamanı, yorum yazarı ve dosya metaverisinin otoritesidir. İsteklerdeki kullanıcı/rol alanlarına güvenilmez. Tarih hataları 422, yetkisiz oturum 401, yetersiz yetki 403, çakışma 409 olarak önerilir. 401 oturumu temizleyip girişe yönlendirmeli; 403 açıklama göstermeli. Liste sayfalaması ve eşzamanlı düzenleme için sürüm alanı eklenmeli.

Token yaklaşımı kesinleşmemiştir. Mevcut giriş adaptörü cookie kullanır, tokenı localStorage'a yazmaz. HttpOnly/Secure/SameSite, CSRF ve CORS ayarları backend tarafından yapılmalıdır. Kullanıcı oturumu ve sunucu yetkileri olmadan demo rol seçicisi üretime taşınmaz.
