# Besin Verisi Kaynaklandırma Politikası

Katalog, 16 Ağustos 2026 çalışma kesitinde zincirlerin resmî menü
sayfalarından ve çoklu-şube canlı gözlemlerinden derlenmiştir ve
`src/data/catalog/<chain>.ts` modüllerinde saklanır. Her statik ürün
`availability`, `catalogSource`, `imageSource` ve `nutritionSource` alanlarını
taşır; `npm run catalog:audit` bu sözleşmeleri otomatik denetler.

## Katalog kaynakları (catalogSource)

- `kind: 'official'` — zincirin resmî Türkiye web sitesi/menü sayfası;
  URL ve `checkedAt` (`YYYY-MM-DD`) birlikte kaydedilir.
- `kind: 'secondary'` — resmî sayfaya doğrudan erişilemediğinde kullanılan
  güvenilir ikincil kaynak; gerekçesi final raporda belirtilir. Yalnızca
  gerçekten bu kaynaktan araştırılan ürünler `secondary` işaretlenir
  (Tchibo standart espresso bazlı 4 kayıt: `tchibo_espresso`,
  `tchibo_caff_latte`, `tchibo_cappuccino`, `tchibo_americano` ve Coffy
  çoklu-şube sipariş yüzeyi gözlemleri).

### Caffè Nero & Coffy izlenen kaynak anlık görüntüleri

1. **Caffè Nero**: `scripts/catalog_sources/caffe_nero.json`, Caffè Nero
   Türkiye'nin 7 resmî menü sayfasından üretilmiştir. Dosyada **125 benzersiz
   ürün satırı** vardır; derlenmiş Caffè Nero kataloğu 125 üründür.
2. **Coffy**: `scripts/catalog_sources/coffy_observations.json` ve
   `coffy_catalog_publication.json`, 5 farklı şubeden toplanan kontrollü
   gözlemleri içerir. Toplam **86 ürün** (56 yeni ekleme, 22 mutabakat, 8
   korunmuş) yayındadır.

Taranan resmî Caffè Nero sayfaları:

- <https://www.caffenero.com/tr/menu/kahveler/sicak-kahveler>
- <https://www.caffenero.com/tr/menu/kahveler/soguk-kahveler>
- <https://www.caffenero.com/tr/menu/icecekler/sicak-icecekler>
- <https://www.caffenero.com/tr/menu/icecekler/soguk-icecekler>
- <https://www.caffenero.com/tr/menu/yiyecekler/deli-to-go>
- <https://www.caffenero.com/tr/menu/yiyecekler/bakery>
- <https://www.caffenero.com/tr/menu/yiyecekler/atistirmalik>

Kaynak anlık görüntüsünü güncellemek için `npm run catalog:fetch:caffe-nero`
(`scripts/fetch-caffe-nero.mjs`) kullanılır. Bir ürünün yalnızca boyut
varyasyonları ayrı katalog ürünü sayılmaz.

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
ve porsiyon üzerinden tahmin edilir; bu durum `status: 'estimated'` veya
kısmi resmî girdilerde `status: 'mixed'` ile birlikte yöntemi anlatan
`notes` alanıyla işaretlenir. URL veya tarih uydurulmaz.

16 Ağustos 2026 ölçümünde 1006 ürünün dağılımı:
- `mixed`: 83 ürün
- `estimated`: 923 ürün
- `verified`: 0 (tam makro tablosu yayınlanmadıkça dürüstçe verified yapılmaz)
- `unverified`: 0

## Görsel kaynakları (imageSource)

- `kind: 'official', exactProduct: true` — zincirin kendi medya
  sunucusundan ürünün gerçek görseli (ör. Starbucks PIM: `api.mircate.com`,
  Caffè Nero resmî CDN).
- `kind: 'licensed_fallback', exactProduct: false` — ürünün sıcak/soğuk
  oluşunu, tipini ve sunumunu doğru temsil eden, kaynak sayfası
  doğrulanabilir lisanslı bir görsel (Wikimedia Commons dosya sayfası veya
  Unsplash foto sayfası).
- Tüm görseller yerel WebP'dir: `/images/menu/<chain>/<slug>.webp`.

16 Ağustos 2026 ölçümü: **1.006 ürün için 1.006 benzersiz yerel WebP dosya yolu** (%100);
384 `official` ve `exactProduct: true`, 622 `licensed_fallback` kayıt.

## Kalite kapıları

- Kimlikler benzersiz, zincir referansları geçerli olmalı.
- Tüm makrolar sonlu ve negatif olmayan sayılar olmalı.
- `verified` kayıt URL, tarih ve porsiyon temeli olmadan unit testlerden
  geçemez.
- Her statik ürün `availability`, `catalogSource`, `imageSource` ve
  `nutritionSource` taşımalı (denetim hatası: eksik provenance).
- Benzersiz yerel görsel oranı %100 (1006/1006).
- İzlenen Caffè Nero ve Coffy kaynak anlık görüntüleri derlenmiş katalogla
  ad/adet bakımından birebir eşleşmeli.

## Public kaynak hipotezi (GitHub Pages)

- Canlı adres: <https://kalorikafe.github.io/>
- `sitemap.xml`, `robots.txt` (Allow: / + Sitemap yönergesi) ve
  `index.html` içindeki JSON-LD `WebSite` yapılandırılmış verisi yayında;
  Google Search Console'a kayıt bekliyor (kullanıcı aksiyonu).
