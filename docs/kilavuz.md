# SEK TECH Proje Yönetim Platformu — Kullanıcı Kılavuzu İskeleti

**Sürüm:** v0.5 (Sprint 5 Çıktısı)  
**Hazırlayan:** Mert Yanık (Raporlama ve Dokümantasyon Sorumlusu) — Issue #56  
**Hedef Kitle:** Proje Yöneticileri ve Ekip Üyeleri

---

## 1. Giriş ve Sisteme Erişim

### 1.1 Kayıt Olma ve Giriş
1. Web tarayıcınızdan `http://localhost:3000` (veya Staging için `http://localhost:3001`) adresine gidin.
2. Hesabınız yoksa **Kayıt Ol** sekmesine geçerek Ad-Soyad, E-posta ve Parolanızı girin. Sistem varsayılan olarak **Ekip Üyesi** rolü atayacaktır.
3. Mevcut hesabınızla **Giriş Yap** butonunu kullanarak sisteme giriş yapın. Başarılı girişte 8 saatlik JWT oturumu başlatılır.

---

## 2. Proje Yönetimi (Modül 1 & Modül 2)

### 2.1 Proje Listeleme ve Oluşturma
- **Yönetici Rolü:** Yeni proje açma yetkisine sahiptir. "Yeni Proje" butonuna tıklayarak Proje Adı, Açıklaması ve Başlangıç-Bitiş tarihlerini girer. Proje oluşturulduğunda yönetici otomatik olarak proje üyesi ve sahibi atanır.
- **Ekip Üyesi Rolü:** Yalnızca dahil olduğu projeleri görür ve detaylarına erişebilir. Proje dışı URL'lere erişmeye çalıştığında sistem güvenlik gereği 404 döner.

### 2.2 Proje Üye Yönetimi
- Yönetici, proje detayında yer alan "Üye Yönetimi" alanından sistemdeki kayıtlı kullanıcıları projeye ekleyebilir veya çıkarabilir.

---

## 3. Görev Yönetimi ve Kanban Panosu (Modül 1)

### 3.1 Görev Oluşturma ve Atama
- Proje üyesi her kullanıcı "Yeni Görev" butonuyla görev oluşturabilir (Karar 9).
- Görev başlığı (en fazla 150 karakter), açıklaması, görev türü (`Task`, `Bug`, `Feature`), öncelik derecesi (`Low`, `Medium`, `High`, `Critical`), başlangıç ve bitiş tarihleri seçilir.
- Ekip Üyesi görevi yalnızca kendisine atayabilir; başkasına atama yapma yetkisi Yönetici rolündedir (Karar 10).

### 3.2 Kanban Panosu İş Akışı
- Görevler üç sütunda listelenir: **To Do (Yapılacak)**, **In Progress (Devam Eden)**, **Done (Tamamlandı)**.
- **Sürükle-Bırak:** Bir görev kartını fareyle tutarak sütunlar arasında taşıyabilirsiniz. Durum anında veri tabanına işlenir.
- **Klavye Erişilebilirliği:** Klavye kullanıcıları kart üzerindeyken durum seçicisini kullanarak fare olmadan durumu güncelleyebilir.
- **Atomik Durum Geçmişi:** Durum her değiştiğinde sistem otomatik olarak kimin, hangi tarihte, hangi durumdan hangi duruma geçtiğini `task_status_history` tablosuna kaydeder.

### 3.3 Görev İçi İletişim (Yorumlar)
- Görev kartına tıklandığında Görev Detay Modalı açılır.
- "Yorumlar" sekmesinden ekip üyeleri anlık notlar ve geri bildirimler yazabilir.

---

## 4. Takvim ve Zaman Çizelgesi (Modül 3)

### 4.1 Aylık ve Haftalık Takvim
- Üst menüden **Takvim** sekmesine tıklayın.
- Görevler başlangıç ve bitiş tarihlerine göre takvim günlerinde renkli bantlar olarak listelenir.
- Önceki ve sonraki aylara geçiş butonlarıyla proje takvimi taranabilir.

### 4.2 Salt Okunur Gantt Şeması
- Takvim görünümünden **Gantt / Zaman Çizelgesi** moduna geçin.
- Görevler başlangıç tarihlerine göre kronolojik sıralanır. Her görevin tamamlanma durumu ve zaman eksenindeki süresi görsel çubuklarla takip edilir.

---

## 5. Dokümantasyon ve Dosya Paylaşımı (Modül 4)

### 5.1 Dosya Yükleme
- Proje detayındaki **Dosyalar** alanına gidin.
- "Dosya Seç" ile bilgisayarınızdan PDF, PNG, JPG, DOCX vb. formatında belge seçin (Azami dosya boyutu: **10 MB**).
- İsteğe bağlı olarak dokümanın ilgili olduğu görevi seçin.
- "Yükle" butonuna basıldığında dosya güvenli depolama alanına UUID adıyla kaydedilir.

### 5.2 Dosya İndirme
- Yüklenen dosyalar liste halinde orijinal dosya adları, boyutları ve yükleyen kişi bilgisiyle listelenir.
- "İndir" butonuna basarak yetkili olduğunuz projenin dosyalarını güvenli şekilde indirebilirsiniz. Proje üyesi olmayanlar dosyalara erişemez.
