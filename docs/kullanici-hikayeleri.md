# SEK TECH 2026 — Kullanıcı Hikâyeleri ve Kabul Kriterleri (Sprint 1)

**Sorumlu:** Abdulkahhar Türkoğlu (Ürün Sahibi / Müşteri Temsilcisi)
**Kilometre Taşı:** M1 - Analiz Tamamlandı
**Kaynak:** SRS v1.0, docs/yol-haritasi.pdf

---

> 30 Ekim 2026: Oturum ve şema terimleri #96 kararlarına göre düzeltildi. H4-H5 güncel kabul kriterleri ve uygulama açıkları [#34 çıktısında](urun/34-backlog-ve-tasarim-kabul.md) bulunur. Aşağıdaki gelecek özellikler tamamlanmış ürün davranışı değildir.

## MODÜL 1: KULLANICI VE ROL YÖNETİMİ (RBAC)

### US-01: Güvenli Kullanıcı Kaydı ve Giriş
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 3 SP
* **Kullanıcı Hikâyesi:**  
  Bir **ziyaretçi/yazılım geliştirici** olarak, sisteme e-posta ve güçlü bir parola ile kaydolup giriş yapabilmek istiyorum, böylece projelerime ve görevlerime güvenli bir ortamda erişebileyim.
* **Kabul Kriterleri:**
  1. **Given:** Kullanıcı kayıt formundadır.  
     **When:** Tek name alanında geçerli ad soyad, benzersiz e-posta ve en az 8 karakterli (büyük, küçük harf, rakam ve özel karakter içeren) parola girip kaydolur.  
     **Then:** Hesap varsayılan `Member` rolüyle oluşturulur (HTTP 201) ve şifre bcrypt ile tuzlanarak veri tabanına işlenir.
  2. **Given:** Kayıtlı kullanıcı giriş formundadır.  
     **When:** Doğru e-posta ve parola kombinasyonunu gönderir.  
     **Then:** Sunucu tek 8 saatlik JWT döner (HTTP 200; data.token ve data.user); refresh token yoktur. Kullanıcı proje listesine yönlendirilir.
  3. **Given:** Hatalı kimlik bilgisi girilmiştir.  
     **When:** Giriş isteği tetiklenir.  
     **Then:** Sistem kullanıcı adı veya şifre ayrımı yapmaksızın jenerik hata mesajı gösterir (HTTP 401).

---

### US-02: Rol Tabanlı Erişim Kısıtlaması (RBAC)
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 3 SP
* **Kullanıcı Hikâyesi:**  
  Bir **Proje Yöneticisi (Admin)** olarak, proje ve sistem yetkilerini yönetebilmek ve **Ekip Üyelerinin (Member)** yetkisiz kritik işlemleri yapmasını engellemek istiyorum, böylece proje bütünlüğü ve veri güvenliği korunsun.
* **Kabul Kriterleri:**
  1. **Given:** Kullanıcı `Member` rolüne sahiptir.  
     **When:** Proje silme veya kullanıcı rolünü değiştirme isteği atar.  
     **Then:** Sunucu işlemi reddeder, veri silinmez ve HTTP 403 Forbidden durum kodu döner.
  2. **Given:** Kullanıcı `Admin` rolüne sahiptir.  
     **When:** Proje ayarları ekranına girer.  
     **Then:** Projeyi silme, arşivleme ve üye ekleme/çıkarma butonları aktif olarak görüntülenir ve çalıştırılabilir.

---

## MODÜL 2: PROJE VE GÖREV YÖNETİMİ

### US-03: Proje Oluşturma ve Üye Atama
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **Proje Yöneticisi (Admin)** olarak, başlangıç ve bitiş tarihleri olan yeni bir proje açmak ve ekip üyelerini bu projeye atamak istiyorum, böylece çalışmaları tek bir çatı altında organize edebileyim.
* **Kabul Kriterleri:**
  1. **Given:** Admin yeni proje modalını açmıştır.  
     **When:** Proje başlığı, açıklaması, başlangıç ve bitiş tarihlerini girip onaylar.  
     **Then:** Bitiş tarihi başlangıçtan önce değilse proje oluşturulur (HTTP 201).
  2. **Given:** Oluşturulmuş aktif bir proje mevcuttur.  
     **When:** Admin kullanıcı listesinden seçim yaparak projeye üye ekler.  
     **Then:** `project_members` tablosuna çoktan-çoka ilişki kaydedilir; mükerrer üyelik engellenir.

---

### US-04: Görev Açma, Markdown Açıklaması ve Atama
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **proje üyesi** olarak, projeye bağlı yeni bir görev kartı oluşturmak, Markdown ile biçimlendirilmiş açıklama girmek, öncelik belirlemek ve işi bir ekip arkadaşıma atamak istiyorum, böylece yapılacak işin sınırları netleşsin.
* **Kabul Kriterleri:**
  1. **Given:** Kullanıcı ilgili projenin yetkili üyesidir.  
     **When:** Görev başlığı, türü (`Task`, `Bug`, `Feature`), önceliği (`Düşük`, `Orta`, `Yüksek`, `Kritik`), son teslim tarihi ve atanacak kişiyi seçer.  
     **Then:** Görev varsayılan olarak `To Do` durumunda başlatılır ve başarıyla listeye eklenir.
  2. **Given:** Görev detayında Markdown formatında kod blokları veya listeler yazılmıştır.  
     **When:** Görev kaydedilir ve detay paneli açılır.  
     **Then:** Arayüz XSS sterilizasyonundan geçmiş Markdown içeriğini biçimli olarak render eder.

---

### US-05: Görev Durum Güncellemesi ve Otomatik Geçmiş Logu (Kritik)
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **ekip üyesi** olarak, üzerinde çalıştığım görevin durumunu (`To Do` -> `In Progress` -> `Done`) değiştirmek istiyorum, böylece sistem bu değişimi zaman damgasıyla arka planda denetim günlüğüne kaydetsin ve raporlar beslensin.
* **Kabul Kriterleri:**
  1. **Given:** Görev `To Do` durumundadır.  
     **When:** Kullanıcı görevi `In Progress` durumuna geçirir.  
     **Then:** Tek bir veri tabanı transaction'ı içinde `tasks.status` güncellenir ve `task_status_history` tablosuna `task_id`, `old_status`, `new_status`, `changed_by_id` ve UTC `changed_at` yazılır.
  2. **Given:** Görev durumu değişimi esnasında log tablosuna yazma hatası oluşmuştur.  
     **When:** İşlem tetiklenir.  
     **Then:** Transaction iptal edilir (Rollback), görev eski durumunda kalır ve hata istemciye bildirilir.
  3. **Given:** Görev detay panelindeki "Geçmiş" sekmesi açılmıştır.  
     **When:** Kullanıcı listeyi inceler.  
     **Then:** Tüm durum geçişleri kronolojik olarak "Kim, ne zaman, hangi durumdan hangi duruma geçirdi" şeklinde listelenir.

---

## MODÜL 3: TAKVİM VE ZAMAN YÖNETİMİ

### US-06: Kanban Panosunda Sürükle-Bırak ile İş Takibi
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **yazılım geliştirici** olarak, görev kartlarını Kanban panosundaki sütunlar arasında fareyle sürükleyip bırakarak taşımak istiyorum, böylece anlık sprint durumunu görsel olarak hızlıca yönetebileyim.
* **Kabul Kriterleri:**
  1. **Given:** Kanban panosunda `To Do`, `In Progress` ve `Done` sütunları yer almaktadır.  
     **When:** Kullanıcı bir kartı sürükleyip başka bir sütuna bırakır.  
     **Then:** Arka planda `PATCH /api/tasks/:id/status` isteği atılır; başarılı olduğunda kart yeni sütuna yerleşir.
  2. **Given:** Kart taşınırken ağ bağlantısı kesilir veya sunucu hata döner.  
     **When:** İstek başarısız olur.  
     **Then:** İyimser arayüz (Optimistic UI) kartı otomatik olarak eski sütununa geri fırlatır ve hata bildirimi çıkar.
  3. **Given:** Bir görevin teslim tarihi geçmiş ve durumu `Done` değildir.  
     **When:** Kart panoda görüntülenir.  
     **Then:** Kart üzerinde kırmızı gecikme rozeti belirir.

---

### US-07: Takvim Görünümü Üzerinde İş Planlaması
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 3 SP
* **Kullanıcı Hikâyesi:**  
  Bir **ekip üyesi** olarak, görevlerimi haftalık ve aylık takvim ızgarasında son teslim tarihlerine göre zaman blokları halinde görmek istiyorum, böylece yaklaşan teslim tarihlerini kaçırmayayım.
* **Kabul Kriterleri:**
  1. **Given:** Kullanıcı projenin takvim sekmesine geçer.  
     **When:** Aylık görünüm seçilidir.  
     **Then:** Görevler ilgili gün kutularına yatay renkli barlar olarak yerleşir; bara tıklandığında görev detay modalı açılır.
  2. **Given:** Kullanıcı haftalık görünüme geçmek ister.  
     **When:** "Haftalık" filtre butonuna basar.  
     **Then:** Takvim yalnızca mevcut haftanın 7 gününü detaylı saat/gün kırılımıyla listeler.

---

### US-08: Gantt Şeması ve Kilometre Taşları
* **Öncelik:** `[SHOULD]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **Proje Yöneticisi** olarak, proje görevlerinin ardışık zaman çizelgesini ve kritik teslim noktalarını (Milestones) bir Gantt şeması üzerinde görmek istiyorum, böylece proje takvimindeki sapmaları erkenden öngörebileyim.
* **Kabul Kriterleri:**
  1. **Given:** Gantt görünümü açılmıştır.  
     **When:** Projedeki görevler incelenir.  
     **Then:** Görevler dikey eksende listelenirken, yatay eksende takvimsel sürelere göre renklendirilmiş barlar halinde gösterilir; kilometre taşları tekil tarih noktası olarak konumlandırılır.

---

## MODÜL 4: DOKÜMANTASYON, DOSYA PAYLAŞIMI VE İLETİŞİM

### US-09: Görev Detayında Yorum Zinciri ile İletişim
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 2 SP
* **Kullanıcı Hikâyesi:**  
  Bir **geliştirici** olarak, bir görevin altına teknik soru, güncelleme veya bulgularımı yorum olarak yazabilmek istiyorum, böylece iletişim görev bağlamından kopmadan kayıt altına alınsın.
* **Kabul Kriterleri:**
  1. **Given:** Görev detay paneli açıktır.  
     **When:** Kullanıcı yorum kutusuna metin yazıp "Gönder" butonuna tıklar.  
     **Then:** Yorum yazarın adı, avatarı ve zaman damgasıyla yorum akışının en altına eklenir (HTTP 201).
  2. **Given:** Bir kullanıcı başkasının yorumunu silmeye çalışır.  
     **When:** Kullanıcı `Member` rolündedir.  
     **Then:** Arayüzde silme butonu görünmez; API'ye doğrudan istek atılırsa HTTP 403 döner.

---

### US-10: Güvenli Dosya Ekleme ve İndirme
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 3 SP
* **Kullanıcı Hikâyesi:**  
  Bir **ekip üyesi** olarak, bir göreve veya projeye doküman/ekran görüntüsü yükleyebilmek ve yüklenen dosyaları indirebilmek istiyorum, böylece dokümantasyonel paylaşımları platform üzerinden yapabileyim.
* **Kabul Kriterleri:**
  1. **Given:** Kullanıcı dosya yükleme alanına 10 MB'den küçük izinli uzantıda (`.pdf`, `.png`, `.jpg`, `.docx`) bir dosya bırakır.  
     **When:** Yükleme işlemi tetiklenir.  
     **Then:** Dosya depolama alanına UUID adıyla kaydedilir, veri tabanına meta verisi işlenir (HTTP 201).
  2. **Given:** Kullanıcı 10 MB'den büyük veya yasaklı uzantıda dosya yüklemeye çalışır.  
     **When:** İstek gönderilir.  
     **Then:** Sunucu HTTP 413 veya 400 döner; dosya diske kaydedilmez.
  3. **Given:** Projeye üye olmayan bir kullanıcı indirme bağlantısına doğrudan erişmeye çalışır.  
     **When:** `GET /api/files/:id/download` çağrılır.  
     **Then:** Sunucu yetki kontrolü yapar ve HTTP 403 Forbidden ile erişimi engeller.

---

## MODÜL 5: RAPORLAMA VE ANALİZ

### US-11: Proje İlerleme Yüzdesi ve Durum Göstergesi
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 2 SP
* **Kullanıcı Hikâyesi:**  
  Bir **Proje Yöneticisi** olarak, dashboard üzerinde projenin anlık tamamlanma oranını (`Done` / Toplam Görev) yüzde olarak görmek istiyorum, böylece projenin genel gidişatını tek bakışta değerlendirebileyim.
* **Kabul Kriterleri:**
  1. **Given:** Projede 10 görev vardır; 4 tanesi `Done`, 3 tanesi `In Progress`, 3 tanesi `To Do` durumundadır.  
     **When:** Raporlama sekmesi açılır.  
     **Then:** İlerleme yüzdesi `%40` olarak dinamik hesaplanır ve gösterge çubuğunda gösterilir.
  2. **Given:** Projede henüz hiç görev açılmamıştır.  
     **When:** Rapor ekranı sorgulanır.  
     **Then:** Sıfıra bölme hatası engellenir; yüzde `%0` döner.

---

### US-12: Kişi Bazlı Tamamlama ve Gecikme Karnesi
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 3 SP
* **Kullanıcı Hikâyesi:**  
  Bir **ekip lideri** olarak, hangi üyenin kaç görev bitirdiğini, kaç görevinin devam ettiğini ve kaçının geciktiğini görmek istiyorum, böylece iş yükü dağılımını dengeli tutabileyim.
* **Kabul Kriterleri:**
  1. **Given:** Raporlama ekranı açıktır.  
     **When:** "Kişi Bazlı Performans" sekmesi seçilir.  
     **Then:** Her üye için `Toplam Atanan`, `Tamamlanan` ve son teslim tarihi geçmesine rağmen `Done` olmamış `Geciken` iş sayıları listelenir.

---

### US-13: Durum Geçmişi Tabanlı Sprint Burndown Trendi
* **Öncelik:** `[MUST]` | **Tahmini Puan:** 5 SP
* **Kullanıcı Hikâyesi:**  
  Bir **Proje Yöneticisi ve Scrum Ekibi** olarak, `task_status_history` verilerinden beslenen günlük sprint burndown grafiğini izlemek istiyorum, böylece sprint hedefine zamanında ulaşıp ulaşamayacağımızı teşhis edebilelim.
* **Kabul Kriterleri:**
  1. **Given:** Sprint başlangıç ve bitiş tarihleri bellidir.  
     **When:** Burndown raporu çağrılır.  
     **Then:** Sistem durum loglarından her gün `Done` durumuna geçen işleri hesaplayarak kalan iş eğrisini çizer; ideal tükeniş çizgisi ile fiili durum birlikte gösterilir.