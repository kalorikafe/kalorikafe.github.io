# ☕ Kalori Cafe — Proje Özeti ve Geliştirici Kılavuzu

> Yeni bir sohbet veya ajan için başlangıç belgesidir. Son güncelleme:
> **11 Ağustos 2026** (Caffè Nero resmî katalog genişletmesi).

## Devir durumu — önce bunu oku

Kalori Cafe, GitHub Pages üzerinde public bir React uygulamasıdır. 6 Ağustos
2026 public release'i yayındadır. Çalışma ağacındaki en yeni katalog **950
ürün** içerir; canlı sitenin bu sayıyı göstermesi için değişikliklerin
`master` üzerinden Pages workflow'u ile yayınlanmış olması gerekir.

| Konu | Güncel durum |
|---|---|
| Canlı adres | <https://kalorikafe.github.io/> |
| Repo | <https://github.com/kalorikafe/kalorikafe.github.io> |
| Katalog | 950 ürün · 10 zincir · 15 sezonluk ürün |
| Caffè Nero | 125 ürün · 0 sezonluk · 96 resmî + 29 fallback görsel |
| Besin kaydı | 950 `estimated` · 0 `verified` · 0 `unverified` |
| Görseller | 950 benzersiz yerel yol · 384 resmî/exact · 566 lisanslı fallback |
| Provenance | Her üründe katalog, görsel, besin ve bulunurluk kaydı |
| Hosting | Yalnızca GitHub Pages + GitHub Actions |

### Sıradaki işler

1. Güncel çalışma ağacında bütün kalite kapılarını çalıştır; gerçek sonuçları
   `GATE_STATUS.md` ile eşleştir.
2. Kullanıcı isterse değişiklikleri commit/push et ve Pages yayını sonrası
   canlı ürün sayısı ile görselleri doğrula.
3. Google Search Console mülk doğrulaması, sitemap gönderimi ve ilk indeks
   isteği kullanıcı aksiyonudur.
4. Kahve Dünyası, Coffy ve Tchibo'nun şube bazlı ikincil teslimat listelerini
   zincir-geneli resmî katalog gibi ekleme. Birden fazla şube, provenance ve
   görsel lisansı doğrulamasıyla ayrı bir araştırma geçişi gerekir.

## Projenin amacı

Kalori Cafe; Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy,
Mackbear Coffee Co., Arabica Coffee House, Gloria Jean's, David People ve
Tchibo ürünlerini tek yerde toplar. Kullanıcılar kalori/makro/kafein
değerlerini karşılaştırabilir, alerjen ve diyet filtreleri uygulayabilir,
ürünleri özelleştirebilir ve kişisel hedeflerini takip edebilir.

Uygulamadaki besin değerleri tıbbi tavsiye değildir. Eksiksiz resmî ürün
tabloları bulunmadığı için bütün kayıtlar `estimated` olarak gösterilir;
alerjenlerde güncel marka beyanı ve çapraz bulaşma riski esas alınmalıdır.

## Güncel katalog

| Zincir | Ürün | Sezonluk |
|---|---:|---:|
| Starbucks | 130 | 0 |
| Espressolab | 116 | 0 |
| Kahve Dünyası | 20 | 0 |
| Caffè Nero | 125 | 0 |
| Coffy | 30 | 9 |
| Mackbear Coffee Co. | 166 | 3 |
| Arabica Coffee House | 131 | 0 |
| Gloria Jean's Coffees | 115 | 1 |
| David People | 93 | 2 |
| Tchibo | 24 | 0 |
| **Toplam** | **950** | **15** |

### Caffè Nero — 11 Ağustos 2026

- 7 resmî Caffè Nero Türkiye menü sayfası tarandı.
- İzlenen kaynak anlık görüntüsünde 125 benzersiz ürün satırı vardır:
  `scripts/catalog_sources/caffe_nero.json`.
- Eski 20 ürün güncel resmî kayıtlara eşlendi; kimlikleri korunarak net 105
  ürün eklendi.
- Audit, derlenmiş Caffè Nero kataloğunun kaynak anlık görüntüsüyle ad/adet
  bakımından birebir eşleşmesini denetler.
- 96 ürünün resmî exact görseli, 29 ürünün lisanslı fallback görseli vardır.
- Resmî menüdeki kullanılabilir değerler hesaba katılsa da tüm şemayı her
  üründe doğrulayacak eksiksiz bilgi bulunmadığı için 125 kayıt `estimated`
  kalır.

Boyut varyasyonları ayrı ürün sayılmaz. Kimliklerin sabit tutulması favori,
sepet ve localStorage uyumluluğunu korur. Tchibo'nun ürün sayfası olmayan
dört standart espresso bazlı kaydı `secondary`; diğer kayıtlar resmî katalog
kaynağına bağlıdır.

## Mimari ve veri akışı

```text
resmî/ikincil araştırma kaynakları
        ↓
scripts/catalog_sources/* + geçici araştırma çıktıları
        ↓
scripts/compile_catalog.py
        ↓
src/data/catalog/<chain>.ts
        ↓
src/data/items.ts (MENU_ITEMS)
        ↓
App.tsx filtreleri ve UI bileşenleri
```

- Stack: React 19, TypeScript 6, Vite 8, Tailwind CSS v4
- Durum: arama, filtre, tema, alerjen, hedef, favori, sepet ve karşılaştırma
  durumu `src/App.tsx` çevresinde yönetilir.
- Görsel hattı: `scripts/build-images.mjs`; resmî kaynakları tercih eder,
  lisanslı fallback kullanır ve bütün ürün görsellerini yerel WebP'ye çevirir.
- Katalog denetimi: `scripts/catalog-audit.ts`; provenance, sayısal makro,
  kimlik, zincir, sezonluk ve görsel sözleşmelerini denetler.
- Caffè Nero tarayıcısı: `scripts/fetch-caffe-nero.mjs`; 7 resmî sayfadan
  tekrar üretilebilir kaynak anlık görüntüsü oluşturur.

## Ürün ve provenance sözleşmesi

Her `MenuItem`; sabit `id`, `chainId`, ad, kategori, açıklama, yerel görsel,
temel makrolar, alerjenler, diyet etiketleri ve şu kayıtları taşır:

- `catalogSource`: URL, kontrol tarihi ve `official|secondary` türü
- `imageSource`: kaynak URL'si, `official|licensed_fallback` ve exact bayrağı
- `nutritionSource`: `verified|estimated|unverified`, yöntem ve porsiyon notu
- `availability`: sezonluk durumu ve açıklaması

Desteklenen alerjenler gluten, laktoz, kuruyemiş, yer fıstığı, soya,
yumurta, yulaf, balık, hardal, susam ve sülfitlerdir.

## Kullanıcı özellikleri

- Türkçe karakter/diakritik katlamalı arama ve erişilebilir öneriler
- Zincir, kategori, yiyecek/içecek ve diyet filtreleri
- Boyut, süt, şurup, shot ve krema özelleştirmesi
- Favoriler, günlük makro sepeti, karşılaştırma ve besin etiketi
- Akıllı takas, özel tarif oluşturucu ve BMR/TDEE hedef hesaplayıcı
- Eski `kalori_cafe_goals` kayıtlarını veri kaybı olmadan migrate eden profil
  saklama
- Kalıcı açık/koyu tema
- Tahminî veri, tıbbi tavsiye ve çapraz bulaşma açıklamaları

## Dosya yapısı

```text
kalori_cafe/
├── index.html
├── public/
│   ├── images/menu/<chain>/
│   ├── images/chains/
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   ├── catalog_sources/caffe_nero.json
│   ├── fetch-caffe-nero.mjs
│   ├── compile_catalog.py
│   ├── build-images.mjs
│   └── catalog-audit.ts
├── src/
│   ├── components/
│   ├── data/catalog/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── tests/unit/
├── tests/e2e/
├── tests/legacy/
└── .github/workflows/
```

`src/data/catalog/<chain>.ts` derleyici ürünüdür; elle düzenlemek yerine
kaynak anlık görüntüsünü/derleyiciyi güncelle. `tests/legacy/` tarihsel
arşivdir ve aktif kalite kapısı değildir.

## Komutlar

```bash
npm install
npm run dev
npm run catalog:audit
npm run lint
npm run build
npm run test:unit
npm run test:e2e
npm test
npm audit
```

İlk E2E kurulumunda `npm run test:e2e:install` Chromium indirir. Kalite
sonuçlarını sabit varsayma; her çalışma ağacında yeniden üret ve gerçek
çıktıyı `GATE_STATUS.md` içine yaz.

## Deploy ve SEO

`.github/workflows/pages.yml`, `master` push veya manuel
`workflow_dispatch` ile kalite kapılarından sonra `dist/` çıktısını GitHub
Pages'e yayınlar. Kök site olduğu için Vite `base` değişmez. `sitemap.xml`,
`robots.txt` ve JSON-LD `WebSite` verisi mevcuttur; Search Console kaydı
kullanıcı tarafında bekler.
