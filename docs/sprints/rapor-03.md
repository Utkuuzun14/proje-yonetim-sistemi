SEK TECH   /   YAZILIM PROJE YÖNETİMİ

# SPRINT RAPORU 3

Sprint 2  ·  UI Tasarımı ve Altyapı Kurulumu

| Alan | Değer |
|---|---|
| Proje | Web Tabanlı Proje Yönetim Platformu |
| Rapor dönemi | 19–25 Ekim 2026 |
| Hazırlayan | Mert Yanık  \|  Raporlama ve Dokümantasyon Sorumlusu |

## 1. Sprint amacı

Yüksek çözünürlüklü arayüz tasarımlarını tamamlamak; veritabanı şemasını, sürekli entegrasyon (CI) hattını ve kullanıcı kimlik doğrulama altyapısını çalışır hale getirmek.

## 2. Çalışmaların genel özeti

Üçüncü haftanın odağı, analiz aşamasında netleştirilen gereksinimlerin uygulanabilir ekranlara ve çalışan teknik altyapıya dönüştürülmesidir. Ekip çalışmaları; Figma tasarım sistemi, giriş/kayıt ekranları, kimlik doğrulama API’si, veritabanı migration’ları ve ilk otomatik testler etrafında planlanmıştır.

## 3. Ekip bazında çalışma alanları ve planlanan çıktılar

### Hakan Koço  —  Proje Yöneticisi

Sprint toplantılarının yürütülmesi ve Pull Request (PR) inceleme kurallarının takibi; vize takvimine göre ekip kapasitesinin planlanması; frontend–backend entegrasyon toplantısıyla API sözleşmesinin v1 olarak netleştirilmesi.

Hedeflenen çıktı: Kapasite planı, dondurulmuş API sözleşmesi v1

### Abdulkahhar Türkoğlu  —  Müşteri Temsilcisi

Yüksek çözünürlüklü mockup’ların müşteri bakış açısıyla değerlendirilmesi ve onaylanması; 4. ve 5. hafta kullanıcı hikâyelerinin kabul kriterlerinin netleştirilmesi; ürün adı ve görsel kimliğinin ekipçe kesinleştirilmesi.

Hedeflenen çıktı: Onaylı mockup’lar, sonraki sprintler için hazır backlog

### Mert Yanık  —  Raporlama Sorumlusu

Sprint 1 raporunun hazırlanması; teknoloji yığını ile mimari tercihlerinin gerekçelerini açıklayan tasarım kararları dokümanı; kullanılan teknoloji ve araçların envanteri.

Hedeflenen çıktı: Rapor #3, tasarım kararları dokümanı, araç envanteri

### Ümit Efe Özkaleli  —  Frontend Geliştirici

Figma üzerinde yüksek çözünürlüklü mockup ve tasarım sisteminin (renk, tipografi, bileşenler) hazırlanması; kenar menü ve üst çubuk içeren ana yerleşimin geliştirilmesi; giriş ve kayıt ekranlarının kodlanması.

Hedeflenen çıktı: Hi-fi mockup’lar, çalışan giriş/kayıt ekranları

### Mustafa Şahin  —  Backend Geliştirici

Kullanıcı kayıt ve giriş işlemleri; parola özetleme (hash) ve token üretimi; kullanıcı modeli ile temel endpoint’lerin geliştirilmesi; Swagger/OpenAPI dokümantasyonunun erişilebilir hale getirilmesi.

Hedeflenen çıktı: Çalışan kimlik doğrulama (auth) API’si ve API dokümanı

### Buğra Durmuş  —  Veri Tabanı Yöneticisi

Veritabanı şemasının migration dosyalarına aktarılması; örnek başlangıç verilerinin (seed) hazırlanması; Docker Compose kullanılarak tüm sistemin tek komutla başlatılabilecek biçimde yapılandırılması.

Hedeflenen çıktı: Migration’lar, seed verisi ve compose dosyası

### Utku Uzun  —  Test Uzmanı

Her Pull Request için otomatik build ve test çalıştıran CI hattının kurulması; frontend ve backend birim test altyapılarının hazırlanması; kayıt/giriş akışına yönelik ilk API testlerinin yazılması.

Hedeflenen çıktı: Çalışan CI hattı ve ilk otomatik testler

## 4. Haftalık teslimat / kilometre taşı

M2 – Tasarım ve altyapı hazır (25 Ekim): Yüksek çözünürlüklü mockup’lar onaylı olmalı; her PR’da CI çalışmalı; kullanıcı kayıt/giriş akışı uçtan uca çalışmalı ve sistem tek komutla kurulabilmelidir. Bunlar yol haritasındaki kabul ölçütleridir; gerçekleşme durumu ayrıca kanıtlarla doğrulanmalıdır.

## 5. Riskler ve takip konuları

Tasarım onayının gecikmesi, API sözleşmesinin netleşmemesi, kimlik doğrulamada güvenlik eksikleri ve Docker/CI ortamında kurulum uyumsuzlukları dördüncü hafta geliştirmesini etkileyebilir. İzlenecek önlemler: kısa entegrasyon toplantıları, PR incelemeleri, testlerin erken çalıştırılması ve kurulum yönergelerinin güncel tutulması.

## 6. Sonraki sprint planı

26 Ekim–1 Kasım tarihli Sprint 3’te kullanıcı/rol yönetimi ve proje yönetimi akışları geliştirilecektir. Rol tabanlı yetkilendirme, yönetici tarafından kullanıcı/rol atama, proje oluşturma–düzenleme, proje üyeliği ve ilgili otomatik testler önceliklidir. 29 Ekim tatili nedeniyle kapasite planı gözden geçirilecektir.

## 7. Raporlama notu

Bu rapor, SEK TECH Proje Yol Haritası ve Görev Dağılımı Raporu (Sürüm 1.0) temel alınarak hazırlanmıştır. Görevler ve çıktılar sprint planını yansıtır; tamamlanma yüzdeleri, test sonuçları ve fiili teslim durumları doğrulanmadığı için kesin gerçekleşme iddiası içermez.

Kaynak: SEK TECH, Proje Yol Haritası ve Görev Dağılımı Raporu, Bölüm 6, s. 13–14.

---

SEK TECH 2026  |  Sprint Raporu 3
