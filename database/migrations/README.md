# Veri Tabanı Migration Kılavuzu

**Sorumlu:** Buğra Durmuş (Veri Tabanı Yöneticisi / DevOps) — Issue #52, #59

## Genel İlkeler

1. **Yalnızca İleri Yönlü (Forward-only):** `database/init.sql` artık çalışan veriyi silen `DROP TABLE ... CASCADE` amacıyla geliştirme/staging ortamlarında tekrar çalıştırılmaz. Yeni sütunlar, tablolar veya kısıtlar için `database/migrations/` altında sıralı SQL dosyaları oluşturulur.
2. **Tekrar Çalıştırılabilirlik (Idempotence):** Her migration dosyası `ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` ve `DO $$ BEGIN IF NOT EXISTS ... END $$;` blokları ile güvenli ve hata fırlatmadan birden fazla kez çalıştırılabilir olmalıdır.
3. **Transaction ve Bütünlük:** Durum geçişleri (`tasks.status`) ile geçmiş kayıtları (`task_status_history`) atomik olarak aynı transaction içinde kaydedilir.
4. **Dosya Adlandırma Standardı:** `XXX_kisa_aciklama.sql` biçimindedir (ör. `001_baslangic.sql`, `002_gorev_turu.sql`, `003_dosya_gorev_baglantisi.sql`).

## Mevcut Migration Listesi

| Sıra | Dosya | Açıklama | İlgili Issue / Karar |
|---|---|---|---|
| `001` | `001_baslangic.sql` | Başlangıç veri modeli tabloları (roller, kullanıcılar, projeler, üyeler, görevler, geçmiş, yorumlar, dosyalar) | #38, #52 |
| `002` | `002_gorev_turu.sql` | `tasks` tablosuna `type` sütunu (`Task`, `Bug`, `Feature`), tarih sıralama kısıtı `chk_tasks_dates` ve aralık indeksleri | #52, #51 (Karar 11) |
| `003` | `003_dosya_gorev_baglantisi.sql` | `files` tablosuna `task_id` sütunu eklenmesi ve göreve dosya bağlama indeksi | #59, #58 (Karar 11) |
