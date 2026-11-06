# Sprint 4 görev/Kanban entegrasyonu - #50

2 Kasım 2026. Kaynak: develop `2d6cd30`, `server/src/docs/openapi.yaml`, #47 Karar 9-13 ve #125 kabul testleri. Bu çıktı gerçek API çağrılarını yapan frontend'dir; #51 henüz birleşmediği için uçtan uca kabul verilmemiştir. Önizleme deposuna veya örnek verilere geri düşmez.

## Ekranlar ve yetkiler

- Giriş sonrası menü: Görevler → proje seç → `/uygulama/projeler/:id/gorevler`. Proje detayında da Görevler ve Kanban bağlantısı vardır.
- Liste/Kanban, başlık ve sorumlu filtresi; görev oluşturma/düzenleme, tür, öncelik, tarih ve kişi seçimi.
- Yönetici tüm görevleri düzenler/atar/siler. Ekip Üyesi kendi projesinde oluşturur (kendisine atar), yalnız kendisine atanmış görevi düzenler; atama alanı gönderilmez. Projedeki görevlerin durumunu değiştirebilir. Son yetki kararı her zaman API'dedir.
- Fareyle taşıma ve klavyeyle durum seçimi aynı PATCH çağrısını kullanır. İstek sürerken ikinci durum işlemi engellenir; hatada eski kart geri gelir. Başarı mesajı ve sunucudan yeniden yükleme vardır.
- Detayda açıklama, yorum ve kronolojik durum geçmişi. HTML içerikleri React metin düğümü olarak gösterilir, HTML çalıştırılmaz. Markdown biçimlendirme bu PR'da eklenmemiştir.
- Yorum hatasında girilen metin korunur. Silme yöneticide ve açık kullanıcı onayıyla yapılır.
- Modal Escape olayının varsayılan kapanışı engellenir; kaydetme sürerken formun görünmez biçimde kapanması önlenir.

## Sözleşme eşlemesi

| İşlem | Uç nokta | Gövde / yanıt |
|---|---|---|
| Üyeler | GET `/api/projects/:id` | data.members; yalnız bu listedeki kişilere atama |
| Görev listesi | GET `/api/projects/:id/tasks` | data dizisi |
| Oluştur | POST `/api/projects/:id/tasks` | title, description, type, priority, assignee_id, start_date, end_date |
| Düzenle | PATCH `/api/tasks/:id` | Değiştirilebilir form alanları; Yönetici assignee_id alanını yalnız atama değiştiyse gönderir, Ekip Üyesi göndermez |
| Durum | PATCH `/api/tasks/:id` | Yalnız `{status}`; ayrı /status adresi kullanılmaz |
| Sil | DELETE `/api/tasks/:id` | 204 |
| Yorum | GET/POST `/api/tasks/:id/comments` | POST yalnız `{content}`; yazar sunucuda belirlenir |
| Geçmiş | GET `/api/tasks/:id/history` | Karar 12; data dizisi |

Kimlikler sayısaldır. Status `To Do / In Progress / Done`, priority `Low / Medium / High / Critical`, type `Task / Bug / Feature`; görünen durum metinleri Türkçedir. Başlık Karar 13 gereği en fazla 150 karakterdir. API yanıtları tip/kimlik/proje kapsamı açısından doğrulanır; bozuk veya başka projeye ait kayıt gösterilmez.

## #51 ile tamamlanması gereken sözleşme ayrıntıları

Mevcut develop OpenAPI dosyasında hâlâ başlık 200, type/history ve görev/yorum/geçmiş yanıt şemaları eksik. Bu PR sözleşmeyi tek başına değiştirmez: Karar 9-13 ve #125 testlerindeki alan adları esas alınmıştır.

- Task: id, project_id, title, description, status, priority, type, assignee_id, start_date, end_date. Tarihler `YYYY-MM-DD`; boş tarih/atama null kabulü #51 sözleşmesinde açıkça yazılmalıdır. Bu arayüz boş alanları null gönderir; boş form alanı kabulü gerçek API ile tekrar denenmelidir.
- Comment: id, task_id, author_id, content, created_at.
- History: id, task_id, old_status (ilk kayıtta null olabilir), new_status, changed_by_id, changed_at.
- Silinmiş kullanıcının author_id/changed_by_id alanı null olabilir. Zaman damgaları parse edilebilir ISO tarih/saat olarak beklenir.
- Görev türü migration'ı #52'de; init.sql mevcut veri üzerinde tekrar çalıştırılmayacaktır.

Bu alanlar #125'teki test/şema varsayımlarıyla uyumludur; yanıtların tam şekli ve nullable alanlar kesinleştirilmeden PR uçtan uca tamamlandı sayılamaz. Backend eksikliğinde kullanıcıya görünür hata ve tekrar deneme gösterilir.

## Doğrulama

`cd client && npm run check`: lint, 69 test / 8 dosya, TypeScript ve üretim build başarılı. 19 yeni test; admin sayısal atama, üye kendi işi/başkasının işi, yalnız status PATCH, sürükle-bırak rollback, çift istek engeli, reload, 400 form koruma, tarih doğrulama, yorum XSS/metin koruma, 404/401, yanlış proje yanıtı, silme onayı.

Bunlar React arayüzünü HTTP yanıtları taklit edilerek doğrular. Gerçek PostgreSQL/görev API'siyle veya tarayıcıda bu sprint akışı henüz doğrulanmadı. #51 ve #52 birleşince #125 API testleri ve #126 Kanban E2E senaryoları koşulmalı; iki ayrı kullanıcı oturumunda kalıcılık ve üyelik kaybı sınanmalıdır.

## #126 E2E seçici incelemesi

Auth ve project testlerinin kullandığı mevcut alan/düğme adları korunur. Kanban testleri PR'da hâlâ `fixme`; çalışmış sayılmaz.

- Kanban adresi: `/uygulama/projeler/{id}/gorevler`.
- Sütun: `getByRole('region', {name: 'To Do' | 'In Progress' | 'Done'})`.
- Kart: `getByTestId('task-{id}')`; sütun test kimlikleri `column-To-Do`, `column-In-Progress`, `column-Done`.
- Görev açma: `getByRole('button', {name: görevBaşlığı, exact: true})`.
- Klavye alternatifi: `getByLabel(görevBaşlığı + ' durumu')`, selectOption API enum değeridir.
- Düzenleme alanları: Görev başlığı, Görev türü, Öncelik, Sorumlu kişi (yalnız Yönetici), Başlangıç tarihi, Bitiş tarihi.
- Detay: Yorumlar / Durum geçmişi başlıkları; Yorum yaz alanı ve Yorum gönder düğmesi.

E2E kod incelemesi notu: #126 `TS-ROL-04` yalnız `main` içinde yasak açıklamanın bulunmadığını denetliyor; istek tamamlanmadan geçebilir. API 404 yanıtı ve görünür erişim hata mesajı da beklenmeli. Test verileri yalnız ayrı test ortamında oluşturulmalı. Bu not bir çalıştırma veya PR onayı değildir.

## Diğer kartlar

#43 ve #98'in kodu PR #93 ile 1 Kasım'da develop'a girdi. #36'nın layout/kayıt/giriş kısmı tamam; Figma kullanıcı tercihi gereği hariç. #57 (Sprint 5), #64 (Sprint 6), #71 (Sprint 7), #78 (Sprint 8) ilgili API, sürüm veya sunum faaliyetlerini bekler. Önceden hazırlanan yerel takvim/rapor önizlemesi bu kartların gerçek API kabulü değildir.

## 6 Kasım inceleme düzeltmesi — #127 / #128

Projeden çıkarılmış kişiye atanmış görev düzenlenirken mevcut kişi ayrı, devre dışı bir seçenek olarak görünür. Başlık gibi başka bir alan değiştiğinde assignee_id gönderilmez; mevcut atama korunur. Yönetici açıkça atamayı kaldırırsa null, yeni bir proje üyesi seçerse onun sayısal kimliği gönderilir. Beş regresyon senaryosu eski üye, mevcut üye, atanmamış görev ve açık kaldırma/yeniden atamayı kapsar.

#128 seçicileriyle uyum korunur: sütun adları, task-{id} ve görev başlığı + “ durumu” etiketi değişmedi. Kod incelemesinde TS-KNB-01 klavye adımının, geçmiş sorgusundan önce PATCH yanıtını beklemesi gerektiği görüldü: kart iyimser olarak taşındığı için yalnız Done görünürlüğü sunucu kaydını garanti etmez. Bu inceleme gerçek API E2E çalıştırması değildir. #126 TS-ROL-04 için önceki not ekip tarafından düzeltildi.
