# Raporların müşteri kabulü ve final sunumu taslağı

30 Ekim 2026 · #62 · Sprint 6 hazırlığı. Rapor API'si #65 planlı; PR #93 ce1edca yerel önizleme içerir. **Manuel kabul sonucu yok.**

## Raporu anlamlı kılan sorular

“Projenin ne kadarı bitti?”, “Kimde geciken iş var?”, “Son hafta biten işler hangileri?” Her gösterge proje/filtre/dönem ve hesaplama açıklamasını taşımalı. Görev sayısı bir insanın verimlilik puanı değildir; iş boyutları eşit olmayabilir. İş yükü konuşmasına yardımcı veri olarak sunulur.

## Hesabı belli kabul veri seti

10 görev: 4 Done, 3 In Progress, 3 To Do → %40 tamamlanma. Ayşe'nin 5 işi: 2 Done, 2 devam, 1 yapılacak; bitmemiş işlerden 2'sinin tarihi geçmiş → 2 geciken. Can'ın 5 işi: 2 Done, 1 devam, 2 yapılacak; 1 geciken. Proje toplamı 3 geciken. Test tarihi/dönemi sabitlenir; Done iş tarihi geçmiş olsa da gecikene dahil edilmez.

| Kod | Adım | Beklenen | Durum |
|---|---|---|---|
| R-01 | Örnek projenin raporunu aç | %40, dağılım 4/3/3, toplam 10 | Önizleme kodu var; manuel/API bekliyor |
| R-02 | Sıfır görevli proje aç | %0, boş durum; NaN/Infinity yok | Manuel/API bekliyor |
| R-03 | Kişi metriklerini aç | Ayşe 5/2/2, Can 5/2/1 (atanan/biten/geciken) | Manuel/API bekliyor |
| R-04 | Gün/hafta/ay filtresi; sınır gece yarısı | Dönem etiketi ve dahil/haric sınırlar tutarlı | Manuel/API bekliyor |
| R-05 | Done işi yeniden aç; geçmişten trend hesapla | Yeniden açma raporda açıklanan kurala uyar | Geçmiş API/burndown eksik |
| R-06 | Filtreli CSV indir; virgül, tırnak, satır ve = ile başlayan ad | Aynı seçili veri, düzgün CSV, formül çalışmaz | Mevcut export tüm proje; filtre kapsam farkı |
| R-07 | Üye başka projenin raporunu ister | Veri sızmaz; sözleşmeye uygun erişim reddi | API bekliyor |

FR-18 trend ile burndown ayrı kabul edilir: tamamlanan iş grafiği burndown değildir. Sprint sınırı, kapsam artışı ve yeniden açma kuralı ürün/teknik ekip tarafından kararlaştırılmalı. FR-19 PDF dışa aktarımı da henüz uygulanmış sayılmaz.

## Problem → çözüm → demo (10 dakika)

0–2 dk / Problem: “Etkinlik sitesi ekibinde işin sahibi, son tarihi ve bitişi farklı listelerde kaldı. Toplantılar bilgi toplamaya dönüşüyor.” Dağınıklığın sonucunu anlat; ölçülmemiş tasarruf yüzdesi verme.

2–3 dk / Çözüm: Rol kontrollü projeler, görev/Kanban, takvim/dosya ve anlaşılır ilerleme. Üç katmanı kısa anlat; teknoloji listesini müşteri akışının önüne koyma.

3–7 dk / Demo: Yönetici proje oluşturur → üye görev alır → durumu değiştirir → takvim/dosya → rapor. API'si eksik ekranları “önizleme” olarak ayır; sunucu kalıcılığı gösterilemiyorsa tamamlanmış gibi sunma.

7–9 dk / Rapor: “10 işin 4'ü bitti, üç iş gecikti. İş yükünü yeniden konuşabiliriz.” Kişi sayımlarını performans sıralaması diye yorumlama. Sıfır görev davranışını göster.

9–10 dk / Kapanış: Gerçek teslim kapsamı, açık riskler, müşteri soruları. Rapor anlamlılığı için “Bu ekranla hangi planlama kararını verirdiniz?” sorusunun yanıtını kaydet.

Demo güncellemesi: MVP akışına veri seti/rapor adımı eklendi. Sunum icra edilmedi; kabul kaydı test eden, tarih, sürüm, gerçek değerler ve ekran kanıtıyla tamamlanacaktır.
