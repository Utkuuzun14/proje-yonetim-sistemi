# H4-H5 backlog ve müşteri odaklı tasarım değerlendirmesi

30 Ekim 2026 · #34 · Hazırlayan: Ümit adına çalışma çıktısı. Ekip kararı veya tasarım onayı değildir.

## İnceleme kapsamı

Kaynaklar: docs/wireframes.md, docs/kullanici-hikayeleri.md, #96 kararları ve PR #93 (ce1edca). Figma açılmadı; aşağıdaki geri bildirim metin/kod incelemesidir. Kullanıcının Figma hariç çalışma tercihi korunmuştur. Hi-fi onayı hâlâ #36 bağımlılığıdır.

| Ekran | Müşteri ihtiyacı | Kabul kriteri / düzeltme |
|---|---|---|
| Giriş/kayıt | Hatanın nasıl düzeltileceğini anlama | Alan hataları alan yanında; yanlış kimlik bilgisi genel mesaj; gönderimde çift kayıt engeli |
| Dashboard | Sonraki işi seçebilme | Boş durumda proje/görev açma yönlendirmesi; gecikme yalnız renk ile anlatılmaz |
| Proje detayı | Kimin hangi yetkiyle çalıştığını anlama | Üye listesi ve rol görünür; yönetim yalnız Yönetici; erişimsiz proje veri sızdırmaz |
| Kanban | İşin taşındığını güvenle anlama | Sürükleme yanında klavyeyle durum seçimi; ağ hatasında eski durum ve tekrar dene |
| Görev detayı | Açıklama/atama/geçmişe erişme | Başlık, sorumlu, tarihler, durum ve yorumlar; ESC ile kapanış ve odağın açan kontrole dönmesi |
| Takvim | Yaklaşan teslimi görme | Ay/hafta görünümü, seçili tarih, tarihsiz/uzun görev davranışı; haftalık görünüm henüz eksik |
| Rapor | Yüzdenin neyi anlattığını bilme | Done/toplam tanımı; sıfır işte %0; filtre ve dönem açık; burndown henüz eksik |

## Hazır H4 kabul kriterleri (Sprint 3)

H4-01 / FR-01–03 / Must: Geçerli kullanıcı kayıt/giriş yaptığında tek 8 saatlik JWT alır. Parola hatasında 401, süresi dolmuş oturumda yeniden giriş, mükerrer kayıtta 409 beklenir. Refresh token yoktur. Kullanıcı adı tek name alanıdır.

H4-02 / FR-03 / Must: Member proje oluşturma/düzenleme/silme veya rol/üyelik yönetimi istediğinde API 403 döner; yalnız düğme gizlemek yeterli değildir. Üyesi olmadığı projeyi okuduğunda 404 beklenir. Başka kullanıcının detayını okuyamamalıdır (#110 açık yüksek hata).

H4-03 / FR-04 / Must: Admin 1-150 karakter name ile proje oluşturduğunda 201; mevcut değerlerle birleştirilmiş güncellemede bitiş başlangıçtan önceyse 400 ve değişmemiş kayıt beklenir. Açıklama en çok 5000; açıklama/tarihler opsiyoneldir. Sayısal id kullanılır.

H4-04 / FR-05 / Must: Admin kayıtlı kullanıcıyı userId ile eklediğinde üyelik tekildir; üye projeyi görebilir. Üyelik kaldırıldığında erişim kesilir; geçmiş içerikler silinmez. Mükerrer ekleme sözleşmedeki yanıtı vermeli, çift satır üretmemelidir.

## Hazır H5 kabul kriterleri (Sprint 4)

H5-01 / FR-06 / Must: Proje üyesi geçerli başlık ve yalnız proje üyesi bir sorumlu ile görev açtığında To Do oluşur. Başlık boş veya 150 karakter üstüyse, sorumlu proje dışındaysa, tarih tersse kayıt oluşmaz. Görev türü/önceliği/Markdown hedefi korunur; type şema alanı ve API doğrulamaları uygulama bağımlılığıdır.

H5-02 / FR-07–08 / Must: Geçerli durum değişikliğinde görev ve task_status_history tek transaction ile güncellenir. Kayıt task_id, old_status, new_status, changed_by_id, changed_at içerir. Geçmiş yazılamazsa rollback olur. Bilinmeyen durum reddedilir; aynı durum isteği sahte geçiş üretmemelidir (ürün önerisi, ekip teyidi bekliyor).

H5-03 / FR-10 / Must: Kart fareyle veya durum seçimiyle taşındığında aynı API akışı kullanılır; hata halinde eski sütun geri gelir. Sayfa yenilendiğinde durum kalıcıdır ve ikinci yetkili oturumda da görülebilir. Üye olmayan kullanıcı aynı işlemi doğrudan API'den yapamaz.

H5-04 / FR-15 / Must: Yetkili kullanıcı yorum gönderdiğinde yazar/zaman ile kronolojik görünür. Başkasının yorumunu Member değiştiremez/silemez. Script içerikli Markdown çalıştırılmaz; hata halinde yazılan metin kaybolmaz.

Hazır tanımı: Her hikâyenin aktörü, veri/izin önkoşulu, olumlu ve olumsuz beklentisi bellidir. Teknik tahminler ekipçe verilecektir; burada tahmin toplantısı yapılmış sayılmaz. Sprint 4 görev/yorum API'si #51 bağımlılığıdır.

## Kimlik önerisi ve karar kaydı

Önerilen görünen ad: SEK TECH. Açıklama: Proje Yönetim Platformu. Türkçe arayüzde “Proje / Görev / Sorumlu / Yapılacak / Devam ediyor / Tamamlandı” kullanılmalı; API durum değerleri ayrı eşlenmelidir. Mevcut ürün adı korunur; yeni logo veya marka hakkı iddiası yoktur.

Ekipçe kesinleştirme: Bekliyor. Karar verenler, tarih, seçilen ad ve toplantı bağlantısı kayıt edilmeden “onaylandı” yazılmaz. Figma mockup onayı ve ekip kimlik kararı nedeniyle #34 açık kalır; backlog çıktısı incelemeye hazırdır.
