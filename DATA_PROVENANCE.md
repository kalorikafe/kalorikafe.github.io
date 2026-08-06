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
  güvenilir ikincil kaynak; gerekçesi final raporda belirtilir. Yalnızca
  gerçekten bu kaynaktan araştırılan ürünler `secondary` işaretlenir
  (2026-08-06 itibarıyla tam olarak 4 kayıt: `tchibo_espresso`,
  `tchibo_caff_latte`, `tchibo_cappuccino`, `tchibo_americano`).

### `compile_catalog.py` URL önceliği (derleyici kuralı)

1. Ürünün exact `productUrl` değeri (araştırma JSON'unda `productUrl`)
2. Araştırma zincir kaynağı URL'si (`research.json → sources[].url`)
3. `CATALOG_URLS` katalog varsayılanı

`kind` ürünün `secondary: true` bayrağından veya zincir kaynağının
`kind: 'secondary'` olmasından + ürünün o kaynaktan araştırılmış
olmasından türetilir. URL/besin/kaynak bilgisi uydurulmaz.

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

## Public kaynak hipotezi (GitHub Pages)

- Canlı adres: <https://kalorikafe.github.io/>
- `sitemap.xml`, `robots.txt` (Allow: / + Sitemap yönergesi) ve
  `index.html` içindeki JSON-LD `WebSite` yapılandırılmış verisi yayında;
  Google Search Console'a kayıt bekliyor (kullanıcı aksiyonu).
