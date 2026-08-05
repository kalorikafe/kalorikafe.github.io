# Besin Verisi Kaynaklandırma Politikası

Katalog, 5 Ağustos 2026 çalışma kesitinde zincirlerin resmî menü
sayfalarından derlenmiştir ve `src/data/catalog/<chain>.ts` modüllerinde
saklanır. Her statik ürün `availability`, `catalogSource`, `imageSource`
ve `nutritionSource` alanlarını taşır; `npm run catalog:audit` bu
sözleşmeleri otomatik denetler.

## Katalog kaynakları (catalogSource)

- `kind: 'official'` — zincirin resmî Türkiye web sitesi/menü sayfası;
  URL ve `checkedAt` (`YYYY-MM-DD`) birlikte kaydedilir.
- `kind: 'secondary'` — resmî sayfaya doğrudan erişilemediğinde kullanılan
  güvenilir ikincil kaynak; gerekçesi final raporda belirtilir.

## Besin kaydı kuralları

`nutritionSource.status` şu durumlarda `verified` olabilir:

- Markanın resmî besin/menü sayfasına doğrudan HTTPS URL'si
- `YYYY-MM-DD` biçiminde son kontrol tarihi (`verifiedAt`)
- Boyut/gramaj/porsiyon temeli (`servingBasis`)

Resmî ürün başına besin tablosu yayınlanmadığında makrolar standart tarif
ve porsiyon üzerinden tahmin edilir; bu durum `status: 'estimated'` ile
birlikte yöntemi anlatan `notes` alanıyla işaretlenir. URL veya tarih
uydurulmaz.

## Görsel kaynakları (imageSource)

- `kind: 'official', exactProduct: true` — zincirin kendi medya
  sunucusundan ürünün gerçek görseli (ör. Starbucks PIM: `api.mircate.com`).
- `kind: 'licensed_fallback', exactProduct: false` — ürünün sıcak/soğuk
  oluşunu, tipini ve sunumunu doğru temsil eden, kaynak sayfası
  doğrulanabilir lisanslı bir görsel (Wikimedia Commons dosya sayfası veya
  Unsplash foto sayfası).
- Tüm görseller yerel WebP'dir: `/images/menu/<chain>/<slug>.webp`.

## Kalite kapıları

- Kimlikler benzersiz, zincir referansları geçerli olmalı.
- Tüm makrolar sonlu ve negatif olmayan sayılar olmalı.
- `verified` kayıt URL, tarih ve porsiyon temeli olmadan unit testlerden
  geçemez.
- Her statik ürün `availability`, `catalogSource`, `imageSource` ve
  `nutritionSource` taşımalı (denetim hatası: eksik provenance).
- Benzersiz yerel görsel oranı ≥ %60; tek görsel dosyası en fazla 6 üründe;
  tekrar eden dosya yalnızca aynı görsel ailede kullanılabilir.