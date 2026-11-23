# Rol/proje kabul notları ve MVP demo taslağı

30 Ekim 2026 · #41 · Kapsam: develop ca71984 ve PR #93 ce1edca. Sonuç: **koşullu inceleme, manuel kabul verilmedi**.

## Kanıtların sınırı

- PR #93 CI [41076567320](https://github.com/Utkuuzun14/proje-yonetim-sistemi/actions/runs/41076567320): Compose üzerinden gerçek PostgreSQL/API/nginx smoke başarılı. Bu bir tarayıcı UAT sonucu değildir.
- Utku'nun PR #93 d5567d7 incelemesi: kayıt, giriş, yenileme, çıkış ve rol düğmesi akışlarını Chromium üzerinde geçtiğini bildiriyor. Bu eski sürüme ait gözlem, yeni proje ekranlarının manuel kabulü değildir.
- #110: Member, başka kullanıcının e-postasını users/:id ile görebiliyor; yüksek önemde açık kabul engeli.
- Bu çalışmada tarayıcı manuel testi yürütülmedi. Aşağıdaki gerçek sonuç sütunu yalnız eldeki kanıtı gösterir.

| ID | Önkoşul ve adımlar | Beklenen | Eldeki sonuç |
|---|---|---|---|
| RP-01 | Hakan/admin giriş; proje oluştur; adını değiştir; yeniden oku | 201, PATCH 200, kalıcı yeni ad | CI smoke geçti; UI bekliyor |
| RP-02 | Üye olmayan Utku ile projeyi oku/listele | Detay 404, listede yok | CI smoke geçti |
| RP-03 | Admin Utku'yu projeye ekler; Utku listeler/okur | 201; üyenin erişimi açılır | CI smoke geçti |
| RP-04 | Utku proje oluşturur/düzenler | 403, değişmeyen veri | CI smoke geçti |
| RP-05 | Oturumsuz /auth/me; geçersiz kayıt | 401; 400 | CI smoke geçti |
| RP-06 | Admin rol değiştirir; eski oturumla izinli/izinsiz işlemler | Güncel DB rolüne göre karar | Manuel tekrar bekliyor |
| RP-07 | Üye başka kullanıcının sayısal id'sini okur | 403/404; kişisel veri yok | #110 nedeniyle başarısız raporlanmış |
| RP-08 | Ters tarih/boş ad; form hatası; düzeltip tekrar gönder | 400, anlaşılır alan hatası, başarılı düzeltme | UI bekliyor |
| RP-09 | Üyeyi çıkar; eski sekmeden tekrar oku | Erişim yok; tarihçe korunur | Manuel/API tekrar bekliyor |

Test koşusu formu: tarih/sürüm/ortam, test eden, RP kodu, gerçek yanıt, ekran veya test çıktısı bağlantısı, hata numarası. Gerçek parola/token kanıta eklenmez. Ayrı test projesi kullanılır; üretim verisi silinmez.

## H5 geliştirmeye hazır hikâyeler

1. Görev oluşturma: Yetkili üye başlık (1-150), açıklama, proje üyesi sorumlu ve geçerli tarihler gönderir; To Do görev oluşur. Boş/uzun başlık, proje dışı sorumlu ve ters tarih reddedilir. FR-06; #51 API bağımlılığı.
2. Durum/geçmiş: To Do → In Progress → Done; her gerçek geçişte tek transaction ile task_status_history yazılır. Log hatasında eski durum kalır. Yeniden açma ve aynı durum isteği davranışı ekipçe teyit edilir. FR-07/08.
3. Kanban: Fare ve klavye aynı durum güncellemesini yapar. API başarısızsa eski sütun, görünür hata ve yeniden deneme; reload ve ikinci oturum kalıcılığı doğrular. FR-10.
4. Yorum: Yetkili üye gönderir, yazar/zaman görünür; başkasının yorumuna Member müdahalesi reddedilir; XSS çalışmaz. FR-15.

Her hikâyede proje dışı üye ve oturumsuz erişim olumsuz testi zorunludur. task türü/Markdown ve geçmiş arayüzü mevcut önizleme ile tam karşılanmaz. Sayısal API id ile önizleme UUID'leri karıştırılmaz. Tahminler geliştirme ekibi tarafından planlama sırasında verilir.

## 6 dakikalık MVP taslağı

0:00–0:45 Problem: görev sorumluluğu ve teslim tarihleri farklı yerlerde kayboluyor. “Bir okul kulübünün etkinlik sitesi teslimini birlikte takip edeceğiz.”

0:45–2:00 Gerçek API: Yönetici giriş yapar, “Etkinlik Sitesi - Demo” projesini oluşturur; üyeye erişim verir. Üye rolünde yönetim kısıtını gösterir. Üyelik UI'si yoksa desteklenen API adımını açıkça anlatır; ekranda varmış gibi göstermez.

2:00–4:30 Önizleme etiketiyle görev atama → Kanban → yorum. Bu bölüm yerel veridir; ekipçe senkronizasyon ve durum geçmişi API'si henüz tamam değildir.

4:30–6:00 Ne çalışıyor/ne bekliyor; #110, görev API'si, proje yönetim UI kapsamı ve kabul kaydı. İzleyiciden “Görevin sorumlusunu ve geciken işi kolayca bulabildiniz mi?” geri bildirimi alınır.

Kapanış koşulu: RP testleri seçilen sürümde elle yürütülür, #110 düzeltilip tekrar test edilir ve ürün sahibi kabulü kaydedilir. Demo taslağı sunumun yapılmış olduğu anlamına gelmez.
