# SEK TECH - Yazılım Gereksinim Spesifikasyonu v1.1

30 Ekim 2026 | Kart #97 | İncelemeye sunulan sürüm; müşteri kabulü verilmiş değildir.

## 1. Amaç, kapsam ve değişiklik kaydı

Yazılım proje yönetimi dersi için ekiplerin projeleri, görevleri, zaman planını, dosyaları ve ilerlemeyi tek uygulamadan takip etmesi hedeflenir. Kaynak kod barındırma, CI ürünü ve kapsamlı test yönetim ürünü geliştirmek kapsam dışıdır.

v1.0'daki FR-01-FR-19 kimlikleri ve MoSCoW öncelikleri korunmuştur. Bu sürüm #96 kararları doğrultusunda tek 8 saatlik JWT, yöneticiye özel proje yönetimi, sayısal kimlikler ve database/init.sql veri sözlüğünü esas alır. Kopyalama işaretleri temizlenmiştir. Performans ve operasyon hedefleri ölçüm/onay gerektiren hedeflerden ayrılmıştır. Bu belge tamamlanma raporu değildir.

Kaynak sırası: #96 ekip kararları; database/init.sql; server/src/docs/openapi.yaml v0.5; SRS v1.0. İş gereksinimleri ile mevcut şema arasındaki açıklar bölüm 5'te saklanır; uygulanmayan gereksinimler sessizce kapsamdan çıkarılmaz. Eski rakip karşılaştırması v1.0'da tarihsel analiz olarak korunur; güncel ürün iddiası olarak yeniden yayımlanmaz.

## 2. Kullanıcılar ve mimari

Yönetici Selin projeyi ve ekibi yönetir, iş yükünü ve ilerlemeyi izler. Ekip Üyesi Can kendisine açık projelerde görev, yorum ve dosyalarla çalışır. RBAC rol tabanlı yetkilendirme, UAT kullanıcı kabul testi, DoD tamamlandı tanımıdır.

React istemci, Node/Express API ve PostgreSQL kullanılır. Kimlik doğrulama Bearer JWT ile yapılır. API başarılı yanıtları data, hataları error.code/message/details zarfındadır. Auth, Users ve Projects uygulanmıştır; Tasks, Comments, Files ve Reports sözleşmede planlanmıştır. Önizleme arayüzündeki yerel veriler sunucuda ekipçe paylaşılan veri değildir.

## 3. Fonksiyonel Gereksinimler

Aşağıda numaralandırılan fonksiyonel gereksinimler, MoSCoW önceliklendirme standardına göre tasnif edilmiş ve doğrudan doğrulanabilir kabul kriterleri (Acceptance Criteria) ile donatılmıştır.
## 3.1 Modül 1: Kullanıcı ve Rol Yönetimi (RBAC)
### FR-01: Kullanıcı Kayıt ve Hesap Yönetimi


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem; kullanıcıların e-posta, parola ve tek name alanında ad soyad bilgileri ile yeni hesap oluşturabilmelerini ve profil bilgilerini güncelleyebilmelerini sağlamalıdır.


-  Kabul Kriterleri:

1. E-posta adresi formatı RFC 5322 standardına uygun olmalı ve sistem genelinde benzersiz (unique) olmalıdır.

2. Parola güvenliği için en az 8 karakter uzunluğu, en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içerme şartı zorunlu tutulmalıdır.

3. Yeni kaydedilen her kullanıcı varsayılan olarak sistem düzeyinde Member rolüyle başlatılmalı ve HTTP 201 Created durum kodu ile yanıt dönülmelidir.
### FR-02: Güvenli Kimlik Doğrulama ve Durumsuz Token Tahsisi


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Kullanıcılar kayıtlı e-posta ve parola ikilisiyle sisteme giriş yapabilmeli; başarılı doğrulamada sistem istemciye JWT tabanlı erişim belirteçleri tahsis etmelidir.


-  Kabul Kriterleri:

1. Parolalar veri tabanında hiçbir koşulda açık metin olarak tutulmamalı; bcrypt algoritması kullanılarak minimum 12 tuzlama (salt rounds) maliyetiyle özetlenmelidir.

2. Başarılı doğrulamada sunucu tek bir 8 saatlik JWT üretir; refresh token yoktur. Yanıt data.token ve data.user alanlarını içerir. Süre dolunca yeniden giriş gerekir (#96, Karar 3).

3. Geçersiz kimlik bilgisi girişlerinde sistem kullanıcı adı veya parola ayrımı belirtmeksizin jenerik "Kimlik doğrulama başarısız" mesajıyla HTTP 401 Unauthorized dönmelidir.
### FR-03: Rol Tabanlı Erişim Denetimi ve Yetki İzolasyonu


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Platform; Admin ve Member sistem rollerini desteklemeli, API ara katmanlarında (middleware) yetki kontrolü uygulayarak yetkisiz istekleri engellemelidir.


-  Kabul Kriterleri:

1. Member rolüne sahip bir kullanıcının doğrudan proje silme (DELETE /api/projects/:id) veya kullanıcı rolünü yükseltme yönündeki tüm istekleri sunucu tarafında HTTP 403 Forbidden durum koduyla reddedilmelidir.

2. Yalnızca Admin kullanıcılar sistem düzeyinde yeni proje oluşturma, proje silme ve kullanıcıların yetki seviyelerini güncelleme hakkına sahip olmalıdır.

3. Proje bazlı veri işlemlerinde, kullanıcının o projenin aktif bir üyesi olup olmadığı kontrol edilmeli; proje üyesi olmayan Member için proje okuması 404, yönetim işlemleri 403 döner. Diğer modüllerin yanıtları dondurulmuş API sözleşmesinden izlenir.

Yetki özeti (#96, Karar 8): Yönetici proje oluşturur, düzenler, siler ve üyelikleri yönetir; kullanıcı rolünü değiştirir. Ekip Üyesi bunları yapamaz. Üye yalnızca dahil olduğu projenin verisini okur; görev, dosya ve yorum işlemlerinde proje üyeliği denetlenir. Arşivleme henüz uygulanmış bir uç nokta değildir.
## 3.2 Modül 2: Proje ve Görev Yönetimi
### FR-04: Proje Yaşam Döngüsü Yönetimi (CRUD)


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem; yöneticilerin proje oluşturmasına, güncellemesine, listelemesine ve ilişkisel bütünlüğü koruyarak silmesine olanak tanımalıdır.


-  Kabul Kriterleri:

1. Proje oluşturulurken Proje adı name alanında 1-150 karakter olmalıdır. Açıklama en fazla 5000 karakter; açıklama ve YYYY-MM-DD tarih alanları isteğe bağlı veya null olabilir.

2. Bitiş tarihi, başlangıç tarihinden kronolojik olarak önce seçilememeli; geçersiz seçimlerde HTTP 400 Bad Request dönülmelidir.

3. Proje silindiğinde projeye bağlı görevler, dosya meta verileri ve durum logları kaskad (CASCADE) silme mantığıyla veya mantıksal silme (soft-delete) bayrağıyla tutarlı biçimde yönetilmelidir.
### FR-05: Çoktan-Çoka Proje Üye Atama Mekanizması


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem; kullanıcılar ile projeler arasında çoktan-çoka (M:N) ilişki tesis edebilmeli, bir kullanıcının birden çok projede yer almasına izin vermelidir.


-  Kabul Kriterleri:

1. Admin kullanıcısı, kayıtlı kullanıcılar havuzundan seçilen hesapları projeye üye olarak ekleyebilmelidir.

2. Aynı kullanıcı aynı projeye birden fazla kez üye olarak eklenemez (Composite Unique Index denetimi).

3. Projeden çıkarılan bir kullanıcının geçmişte tamamladığı görevlerdeki atama kayıtları ve denetim logları sistem bütünlüğü açısından silinmemeli, arşivlenmiş olarak korunmalıdır.
### FR-06: Görev (Task/Issue) Oluşturma ve Detay Yönetimi


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Proje üyeleri ilgili projeye bağlı yeni görevler açabilmeli, ayrıntılı öznitelikler tanımlayabilmeli ve işleri kişilere atayabilmelidir.


-  Kabul Kriterleri:

1. Her görev kartı; Başlık (en fazla 150 karakter), Tür (Task, Bug, Feature), Öncelik (Düşük, Orta, Yüksek, Kritik), Son Teslim Tarihi, Açıklama ve Atanan Kullanıcı alanlarını barındırmalıdır.

2. Görev açıklama alanı Markdown biçimlendirmesini desteklemeli; kod blokları, kalın metinler ve listeler arayüzde standartlara uygun olarak render edilmelidir.

3. Bir göreve atanacak kullanıcı, yalnızca o projenin onaylı üyeleri arasından seçilebilmelidir.
### FR-07: Görev Durum Akışı ve Doğrulama Kuralları


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Görevler tanımlı bir durum makinesi (state machine) üzerinden ilerlemeli; sistem varsayılan olarak To Do, In Progress ve Done durumlarını işletmelidir.


-  Kabul Kriterleri:

1. Yeni oluşturulan her görev varsayılan olarak To Do durumunda başlatılmalıdır.

2. Durum güncellemelerinde yalnızca izin verilen durum kodları kabul edilmeli; tanımsız değer içeren istekler HTTP 400 Bad Request ile reddedilmelidir.

3. Bir görev Done durumuna geçirildiğinde sistem kapanış zaman damgasını otomatik olarak kaydetmelidir.
### FR-08: Otomatik Görev Durum Geçmişi Günlüğü (State History Log Engine)


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Bir görevin durumu her değiştiğinde; sistem arka planda hiçbir kullanıcı müdahalesine gerek duymaksızın denetim ve raporlama amaçlı durum geçmişi kaydı oluşturmalıdır.


-  Kabul Kriterleri:

1. Durum değişikliği esnasında task_status_history tablosuna; task_id, old_status, new_status, changed_by_id (kullanıcı kimliği) ve PostgreSQL timestamptz hassasiyetinde changed_at (UTC ISO 8601) bilgileri otomatik olarak yazılmalıdır.

2. Durum güncellemesi ile geçmiş kaydının oluşturulması aynı veri tabanı işlemi (transaction) içinde yürütülmeli; log oluşturulamadığı takdirde durum değişikliği de geri alınmalıdır (Rollback).

3. Kaydedilen durum geçmişi verileri değiştirilemez (immutable) yapıda olmalı; API üzerinden güncelleme veya tekil silme işlemlerine kapalı tutulmalıdır.
### FR-09: Arama ve Çok Kriterli Görev Filtreleme


-  Öncelik: [SHOULD]



-  Gereksinim Tanımı: Kullanıcılar görev havuzunda metin tabanlı arama yapabilmeli; duruma, önceliğe ve atanan kişiye göre filtreler uygulayabilmelidir.


-  Kabul Kriterleri:

1. Başlık ve açıklama üzerinde büyük/küçük harf duyarsız (case-insensitive) arama yapılabilmelidir.

2. Birden fazla filtrenin birlikte uygulanması (örneğin: Öncelik = Kritik VE Durum = In Progress) durumunda sonuç kümesi 200 milisaniye altında istemciye ulaştırılmalıdır.
## 3.3 Modül 3: Takvim ve Zaman Yönetimi
### FR-10: Etkileşimli Kanban Panosu (Sürükle-Bırak)


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Projedeki görevler To Do, In Progress ve Done sütunlarından meydana gelen görsel bir panoda listelenmeli; kullanıcılar kartları fare veya dokunmatik etkileşimle sütunlar arasında taşıyabilmelidir.


-  Kabul Kriterleri:

1. Görev kartı üzerinde görev başlığı, öncelik rozeti, atanan kişinin avatarı ve son teslim tarihi açıkça görünmelidir.

2. Kart bir sütundan diğerine bırakıldığında arka planda PATCH /api/tasks/:id/status çağrısı yapılmalı; ağ hatası durumunda kart otomatik olarak eski konumuna geri dönmelidir (Optimistic UI with Rollback).

3. Teslim tarihi geçmiş ve henüz Done sütununa geçmemiş kartlar arayüzde kırmızı uyarı çerçevesi veya rozetiyle vurgulanmalıdır.
### FR-11: Aylık ve Haftalık İnteraktif Takvim Görünümü


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Görevlerin başlangıç ve son teslim tarihleri aylık ve haftalık takvim ızgarası üzerinde bloklar halinde listelenmeli ve yönetilebilmelidir.


-  Kabul Kriterleri:

1. Görevler başlangıç ve bitiş tarihlerine göre ilgili gün kutucuklarına yatay zaman çubukları şeklinde yerleşmelidir.

2. Takvim üzerindeki görev bloğuna tıklandığında görevin detay modalı veya çekmecesi (drawer) açılmalıdır.

3. Kullanıcı arayüzden tek tıkla haftalık ve aylık görünümler arasında geçiş yapabilmelidir.
### FR-12: Proje Zaman Çizelgesi ve Gantt Şeması Görünümü


-  Öncelik: [SHOULD]



-  Gereksinim Tanımı: Proje genelindeki görevlerin zaman eksenindeki sıralanışını, örtüşen iş paketlerini ve kritik aşamaları görselleştiren Gantt şeması sunulmalıdır.


-  Kabul Kriterleri:

1. Görevler dikey eksende hiyerarşik listelenirken, yatay eksende takvimsel sürelere göre renklendirilmiş barlar halinde gösterilmelidir.

2. Proje kilometre taşları (Milestones) Gantt çizelgesinde elmas simgesiyle tekil tarih noktası olarak konumlandırılmalıdır.
## 3.4 Modül 4: Dokümantasyon, Dosya Paylaşımı ve İletişim
### FR-13: Güvenli Dosya Yükleme ve Tür/Boyut Denetimi


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Kullanıcılar projelere ve doğrudan spesifik görevlere dosya yükleyebilmeli; sistem dosya boyutu ve uzantı kontrollerini sunucu tarafında doğrulamalıdır.


-  Kabul Kriterleri:

1. Yüklenen tekil dosya boyutu azami 10 MB ile sınırlandırılmalıdır; sınırı aşan dosyalarda sunucu HTTP 413 Payload Too Large yanıtı dönmelidir.

2. İzin verilen dosya uzantıları .pdf, .png, .jpg, .jpeg, .docx, .xlsx ve .zip ile sınırlandırılmalıdır.

3. Sunucu tarafında yalnızca uzantı kontrolü ile yetinilmemeli; dosyanın bayt imzasından (Magic Bytes) gerçek MIME türü doğrulanmalıdır.

4. Yüklenen dosyalar yerel dosya sisteminde veya nesne deposunda doğrudan orijinal isimleriyle değil, üretilen UUID formatındaki tekil anahtarlarla saklanmalıdır.
### FR-14: Yetkilendirilmiş Dosya İndirme ve İzolasyon


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Projeye yüklenmiş dosyalar yetkili üyeler tarafından güvenli biçimde indirilebilmelidir.


-  Kabul Kriterleri:

1. Doğrudan statik dizin erişimi (direct file URL) kapatılmalı; indirme talepleri GET /api/files/:id/download uç noktası üzerinden yetki kontrolü yapılarak aktarılmalıdır.

2. Kullanıcının dosyanın ait olduğu projeye üyeliği yoksa sunucu HTTP 403 Forbidden dönmelidir.
### FR-15: Görev Yorum Zinciri ve Ekip İletişimi


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Görev detay ekranlarında kullanıcıların zamana göre sıralanmış yorum zincirleri oluşturabilmesi sağlanmalıdır.


-  Kabul Kriterleri:

1. Yorumlar kronolojik sırada eskiden yeniye doğru alt alta listelenmeli; yazarın adı, avatarı ve işlem zaman damgası görünmelidir.

2. Yorum metinleri temel Markdown formatlamasını desteklemelidir.

3. Kullanıcılar yalnızca kendi yazdıkları yorumları güncelleyebilmeli veya silebilmeli; Admin rolündeki kullanıcılar uygunsuz içerikleri sistem adına kaldırabilmelidir.
## 3.5 Modül 5: Raporlama ve Analiz
### FR-16: Proje Genel İlerleme Yüzdesi ve Durum Dağılımı


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem, seçilen bir projedeki işlerin genel tamamlanma oranını ve durum bazlı oransal dağılımını hesaplayarak sunmalıdır.


-  Kabul Kriterleri:

1. Proje ilerleme yüzdesi 100 × Done görev sayısı / toplam görev sayısı olarak hesaplanmalıdır:


2. Projede henüz hiçbir görev tanımlanmamışsa sıfıra bölme hatası engellenmeli ve oran doğrudan %0 olarak döndürülmelidir.

3. Durum dağılımı kullanıcı arayüzünde pasta grafik ve sayısal göstergelerle görselleştirilmelidir.
### FR-17: Kişi Bazlı Görev Tamamlama ve Gecikme Metrikleri


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem, proje paydaşlarının her biri için tamamlanan, devam eden ve geciken görev hacmini metrikleştirmelidir.


-  Kabul Kriterleri:

1. Her üye için Atanan Toplam Görev, Tamamlanan Görev Sayısı ve Geciken Görev Sayısı ayrı ayrı hesaplanmalıdır.

2. Bir görevin gecikmiş sayılması için son teslim tarihinin (due date) sistemin anlık saatinden geride olması ve görevin durumunun Done haricinde bir değer taşıması zorunludur.
### FR-18: Durum Geçmişi Loglarından Türetilen Trend ve Sprint Burndown Raporu


-  Öncelik: [MUST]



-  Gereksinim Tanımı: Sistem, task_status_history tablosunu zamana bağlı sorgulayarak günlük, haftalık ve aylık akış trendlerini ve sprint burndown verisini üretmelidir.


-  Kabul Kriterleri:

1. Günlük trend analizinde, her takvim günü için To Do durumundan çıkarılan işler ile Done durumuna çekilen işlerin hacmi net değişim olarak listelenmelidir.

2. Sprint burndown eğrisi; sprint başlangıcındaki toplam iş miktarından her gün Done durumuna geçen işlerin düşülmesiyle hesaplanmalı, ideal kılavuz çizgi ile fiili çizgi eşzamanlı gösterilmelidir.

3. Bu analitik sorgular durum geçmişi tablosundaki zaman damgası indeksleri üzerinden koşulmalı ve yanıt süresi 500 milisaniyeyi aşmamalıdır.
### FR-19: Analitik Raporların Dışa Aktarımı (Export Engine)


-  Öncelik: [COULD]



-  Gereksinim Tanımı: Raporlama panellerinde görüntülenen metrik tabloları ve görev dökümleri dosya formatında dışa aktarılabilmelidir.


-  Kabul Kriterleri:


1. Filtrelenmiş görev listesi RFC 4180 uyumlu CSV formatında indirilebilmelidir.

2. Proje özet performans karnesi tek sayfalık biçimlendirilmiş PDF raporu olarak üretilebilmelidir.

## 4. İşlevsel olmayan gereksinimler

### 4.1 Performans

Ölçüm planı: sabit staging donanımı, veri seti, eşzamanlı kullanıcı sayısı, süre ve p95 değerleri test raporunda kaydedilir. v1.0'daki 50 kullanıcıda 200 ms okuma/500 ms yazma, 100 oturum ve 1,5 saniye ilk boyama hedefleri henüz ölçülmemiştir; dönem sonrası kapasite hedefidir. FR-09/FR-18 içindeki 200/500 ms eşikleri de bu sınıfa dahildir; mevcut başarı taahhüdü değildir. Dönem teslimi için performans bütçesi Utku ve öğretim üyesiyle kesinleştirilecektir. Sıkıştırılmış istemci paketi için 2 MB üst sınır hedefi korunur ve üretim derlemesinde ölçülür.

### 4.2 Güvenlik ve bütünlük

Parametreli SQL kullanılmalıdır; ORM zorunlu değildir. Kullanıcı girdisinin SQL metnine birleştirilmesi yasaktır. bcrypt maliyeti en az 12 olmalı; parola açık metin tutulmamalıdır. Markdown uygulanırken HTML/URL temizliği ve XSS testleri yapılmalıdır. Login için aynı IP'den 15 dakikada 5 başarısız deneme sonrası 429 beklenir.

Tek 8 saatlik JWT Authorization: Bearer başlığıyla taşınır; refresh uç noktası yoktur. Mevcut istemci sessionStorage kullanır; XSS'e karşı HttpOnly koruması sağlamaz. Token loglanmaz; çıkış istemci oturumunu temizler. Sunucu geçerli token ve güncel veritabanı rol/üyeliklerini kontrol eder. Anlık token iptali uygulandığı iddia edilmez.

Yerel geliştirme HTTP olabilir. İnternete açık yayın öncesi HTTPS ve güvenli secret yönetimi gerekir. Yalnız TLS 1.3 zorunluluğu dönem sonrası altyapı hedefidir; canlı ortamın TLS sürümü ayrıca ölçülmelidir.

### 4.3 Kullanılabilirlik ve erişilebilirlik

768x1024 ve 1920x1080 ekranlarda form/içerik taşması kontrol edilir. Görev açma ve durum değiştirmede üç tıklama hedefi, başlangıç ekranı belirtilerek kullanıcıyla ölçülür. Klavyeyle erişim, görünür odak, metinle durum açıklaması ve metin kontrastı hedefleri korunur. Otomatik erişilebilirlik testi manuel kontrast/odak kabulünün yerine geçmez.

### 4.4 İşletim ve yedekleme

Aylık %99,5 çalışma süresi, gece otomatik pg_dump/7 günlük şifreli saklama, RPO 24 saat ve RTO 30 dakika dönem sonrası işletim hedefleridir; mevcut hizmet taahhüdü değildir. Dönem tesliminde yedek alma ve ayrı boş veritabanına geri yükleme provası kayıt altına alınmalıdır. Docker yeniden başlatma politikası ve sağlık kontrolleri test edilmelidir; 10 saniyede iyileşme garantisi ölçülmeden verilmez. init.sql tabloları siler; canlı veri üzerinde yeniden çalıştırılmaz.

## 5. Veri modeli ve API sözleşmesi

Yetkili şema database/init.sql dosyasıdır. Aşağıdaki alan tanımları bu dosyadan alınmıştır. SERIAL sayısal birincil anahtar üretir; UUID kayıt kimliği değildir. Varsayılan zaman alanları timestamptz'dir. Dosya depolama anahtarının rastgele UUID olması, veritabanı kimliğinin sayısal olmasıyla çelişmez.

### 5 - roles

- id          SERIAL PRIMARY KEY

- name        VARCHAR(50) NOT NULL UNIQUE

- permissions JSONB NOT NULL DEFAULT '{}'::jsonb

### 5 - users

- id            SERIAL PRIMARY KEY

- role_id       INT REFERENCES roles(id) ON DELETE SET NULL

- name          VARCHAR(100) NOT NULL

- email         VARCHAR(100) NOT NULL UNIQUE

- password_hash VARCHAR(255) NOT NULL

- created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 5 - projects

- id          SERIAL PRIMARY KEY

- owner_id    INT REFERENCES users(id) ON DELETE SET NULL

- name        VARCHAR(150) NOT NULL

- description TEXT

- start_date  DATE

- end_date    DATE

- created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 5 - project_members

- project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE

- user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE

- joined_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

- PRIMARY KEY (project_id, user_id)

### 5 - tasks

- id          SERIAL PRIMARY KEY

- project_id  INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE

- title       VARCHAR(200) NOT NULL

- description TEXT

- status      VARCHAR(50) NOT NULL DEFAULT 'To Do'

- priority    VARCHAR(20) NOT NULL DEFAULT 'Medium'

- assignee_id INT REFERENCES users(id) ON DELETE SET NULL

- start_date  DATE

- end_date    DATE

- created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

- updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 5 - task_status_history

- id            SERIAL PRIMARY KEY

- task_id       INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE

- old_status    VARCHAR(50)

- new_status    VARCHAR(50) NOT NULL

- changed_by_id INT REFERENCES users(id) ON DELETE SET NULL

- changed_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 5 - comments

- id         SERIAL PRIMARY KEY

- task_id    INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE

- author_id  INT REFERENCES users(id) ON DELETE SET NULL

- content    TEXT NOT NULL

- created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 5 - files

- id           SERIAL PRIMARY KEY

- project_id   INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE

- uploader_id  INT REFERENCES users(id) ON DELETE SET NULL

- name         VARCHAR(255) NOT NULL

- type         VARCHAR(100)

- size         BIGINT

- storage_path VARCHAR(500) NOT NULL

- uploaded_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP


### 5.1 Şema ile hedefler arasındaki açıklar

users tek name alanı taşır; first_name/last_name yoktur. project_members birleşik anahtarı mükerrer üyeliği engeller. tasks başlığı veritabanında 200, FR-06 ürün sınırı 150 karakterdir; API ürün sınırını doğrulamalıdır. tasks tablosunda type, completed_at ve sprint alanları; files tablosunda task_id; milestones tablosu yoktur. Bunlar FR-06/07/12/13/18 için uygulama/migration kararı bekler. Done zamanı task_status_history üzerinden türetilebilir; yeniden açılan işin rapor kuralı ayrıca kararlaştırılmalıdır.

Status ve priority metin alanlarıdır; şema izinli değer CHECK kısıtı içermez. Üyelik, tarih sırası ve durum değerleri servis katmanında doğrulanmalıdır. Durum değişikliği ve geçmiş ekleme aynı transaction'da olmalıdır. Tekil geçmiş güncelleme/silme API'si açılmaz; proje silinmesindeki CASCADE davranışı ayrı tutulur. FK SET NULL davranışları silinen kullanıcıların ilişkili içeriklerini korur.

### 5.2 API eşlemesi

Tam uç nokta ve yanıt sözleşmesi server/src/docs/openapi.yaml v0.5 dosyasındadır; bu PDF ikinci bir API sözleşmesi oluşturmaz. Kayıt name/email/password; giriş email/password alır. Yanıt data.user ve data.token içerir. Proje yazma alanları name, description, start_date, end_date; üye ekleme userId sayısıdır. Başarılı kayıt/proje oluşturma 201; doğrulama 400; oturumsuz istek 401; yetkisiz yönetim 403; görünmeyen proje 404; mükerrer e-posta 409'dur. Planlı task/file/report uç noktası belgede bulunması, uygulanmış olduğu anlamına gelmez.

## 6. Kullanıcı kabul ve doğrulama

UAT-01: Member giriş yapar, sayısal kimliği bilinen projeye DELETE gönderir; 403 ve değişmemiş proje beklenir. Üyesi olmadığı projenin GET yanıtı 404'tür. Yönetici aynı yetkili işlemi yapabilir. API otomasyonu ile manuel UI kabulü ayrı raporlanır.

UAT-02: Üye sayısal task_id olan In Progress görevini Done yapar; tasks.status ve task_status_history eski/yeni durum, changed_by_id, changed_at kaydı tek transaction ile güncellenir. Geçmiş ekleme başarısızsa görev değişmez. Ağ hatasında kart eski sütuna döner. Görev servisi uygulanmadan bu senaryo geçmiş sayılmaz.

UAT-03: 14 MB EXE reddedilir; 2,5 MB geçerli PDF sunucuda imza/boyut doğrulamasından geçer, rastgele depolama anahtarıyla saklanır ve files kaydı oluşur. Başka bir yetkili üye indirir, yetkisiz kullanıcı indiremez. 10 MB sınırı ve dosyaya görev bağı ürün hedefidir; yerel 5 MB önizleme bu kabulü karşılamaz.

Her kabul kaydı sürüm, ortam, tarih, test eden, önkoşul, adımlar, beklenen/gerçek sonuç, kanıt ve hata bağlantısı içerir. Kritik/yüksek açık hata ve uygulanmamış Must gereksinim varken nihai kabul verilmez. Bir test planı, koşulmuş test veya müşteri onayı değildir.

## 7. Hocaya sorulacak sorular

- FR-12 Gantt SHOULD olarak mı kalmalı, teslimde zorunlu mu? Milestone gösterimi bekleniyor mu?
- Hi-fi mockup için Figma bağlantısı ve hangi ekran/etkileşimler zorunlu? Çalışan arayüz tek başına yeterli mi? #96 kararı Figma istiyor; bu çalışma Figma onayı sağlamaz.
- Haftalık takvim, görev eki, Markdown ve burndown için asgari teslim kapsamı nedir? Mevcut şema açıkları nasıl önceliklendirilmeli?
- Performans ölçümü için donanım/veri/kullanıcı bütçesi nedir? Dönem sonrası olarak ayrılan NFR'ler kabul ediliyor mu?
- UAT'yi kim imzalayacak ve hangi sürüm etiketi/ortam teslim kanıtı sayılacak?

Yanıtlar alınmamıştır; toplantı tarihi, yanıtlayan ve karar bağlantısı sonradan eklenmelidir.

## 8. İzlenebilirlik ve kaynaklar

SRS v1.0 (arşiv): docs/SEK_TECH_SRS_v1.0.pdf. Süreç: CONTRIBUTING.md ve docs/yol-haritasi.pdf. Şema: database/init.sql. API: server/src/docs/openapi.yaml. Güncelleme kartı: #97. Ekip kararları: https://github.com/Utkuuzun14/proje-yonetim-sistemi/issues/96#issuecomment-6497201808. Bu revizyon ürün sahibi/ekip incelemesine sunulur; Utku/Buğra ortak onayı henüz kaydedilmemiştir.
