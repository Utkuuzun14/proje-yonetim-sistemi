# MVP UAT raporu ve ara demo anlatımı

30 Ekim 2026 · #48 · Sprint 4 hazırlığı. **UAT kararı: Bekliyor / kabul verilmedi.**

## Değerlendirilen artış

develop ca71984 kimlik/rol/proje API'lerini içerir. PR #93 ce1edca önizleme görev detay/yorum/Kanban arayüzünü içerir; henüz birleşmemiştir. Tasks ve Comments sunucu API'si planlıdır (#51). Test planı aşağıdadır; manuel test sonucu üretilmemiştir.

## UAT koşu seti

Ortam: ayrı staging/test DB, Admin A, aynı projedeki Member B, dışarıdaki Member C. A “Etkinlik Sitesi” projesini oluşturup B'yi ekler. Test başında sürüm ve veri seti kaydedilir.

| Test | Adımlar | Beklenen / kabul kanıtı | Durum |
|---|---|---|---|
| M-01 | A oluşturur; B listeler; C doğrudan URL açar | A/B erişir; C veri göremez; API 404 | API smoke kanıtı var; UI bekliyor |
| M-02 | B görev açar, B'ye atar; reload ve ikinci oturum | To Do kalıcı; aynı görev iki oturumda | #51 bekliyor |
| M-03 | Görevi Done yap; geçmişi aç | Eski/yeni durum, kişi/zaman; tek atomik kayıt | #51 bekliyor |
| M-04 | Durum isteğinde ağ/500 hatası oluştur | Kart eski sütuna döner, hata görünür | Entegrasyon bekliyor |
| M-05 | B yorum yazar; C doğrudan okuma/yazma dener | B yorumu görür; C erişemez | #51 bekliyor |
| M-06 | Boş/uzun görev, proje dışı sorumlu, ters tarih | Kayıt oluşmaz; form değeri korunur | Entegrasyon bekliyor |
| M-07 | ESC, Tab ve durum seçimiyle görev panelini kullan | Odak panelde; kapanınca tetikleyiciye döner | Manuel bekliyor |

## Geri bildirim ve statik panel desteği

- Yüksek: #110 kullanıcı bilgisi erişimi; rol izolasyonu kabulünü engeller.
- Yüksek: Gerçek görev/yorum/geçmiş uçtan uca akışı yok; önizleme başarısı MVP sunucu kabulü sayılamaz.
- Orta: Görev detayında Markdown, görev eki ve sunucu geçmişi henüz yok; SRS kapsamı ile karşılaştırılmalı.
- Destek çıktısı: PR #93 client/src/workspace/Tasks.tsx ve Modal.tsx görev düzenleme/detay/yorum panelini zaten içerir. Yeni bir kopya bileşen eklenmedi. İnceleme kriterleri: erişilebilir başlık; sorumlu/tarih/durum; boş yorum önleme; hatada giriş koruma; Escape/odak dönüşü; dar ekran taşmaması.

Her bulgu için tekrar adımı, beklenen/gerçek davranış, sürüm, önem ve kanıt kaydedilir. Bileşenin kodda bulunması manuel erişilebilirlik onayı değildir.

## 8 dakikalık müşteri anlatımı

1. (1 dk) “Ekip, hangi işin kimde ve ne zaman biteceğini tek yerde göremiyordu.” Etkinlik sitesi hikâyesini tanıt.
2. (2 dk) Yönetici proje kurar; üye erişimini ve yetki sınırını göster. Gerçek API kısmını açıkla.
3. (3 dk) “Kayıt formu” görevini B'ye ata, Devam ediyor → Tamamlandı yap, yorum ekle. API yoksa bu kısmı belirgin biçimde önizleme diye sun.
4. (1 dk) Görev sorumluluğu ve tamamlanma görünürlüğünün müşteriye etkisini anlat.
5. (1 dk) Eksikler, UAT durumu ve sorular. Sunum sırasında onay istenirse yalnız gösterilen kapsam üzerinden kayıt al.

Çıkış kapısı: seçilen v0.5 adayı üzerinde bütün Must senaryoları geçer, kritik/yüksek hata kalmaz, PR'lar birleşir, kabul eden kişi/tarih/kanıt yazılır. Şu an demo metni hazır; canlı sunum ve UAT onayı yapılmadı.
