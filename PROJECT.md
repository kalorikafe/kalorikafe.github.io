# Project: Kalori Cafe — Katalog ve Kalite Kapıları

Son güncelleme: **21 Ağustos 2026**. Bu belge çalışma ağacındaki güncel
katalog durumunu anlatır; canlı GitHub Pages sürümü ancak ilgili değişiklikler
`master` üzerinden yayınlandıktan sonra aynı duruma gelir.

## Amaç ve kapsam

Kalori Cafe, Türkiye'deki 10 büyük kafe zincirinin ürünlerini kalori,
protein, karbonhidrat, şeker, yağ, kafein ve alerjen bilgileriyle tek React
uygulamasında karşılaştırır.

- Canlı adres: <https://kalorikafe.github.io/>
- Kaynak: <https://github.com/kalorikafe/kalorikafe.github.io>
- Hosting: GitHub Pages + GitHub Actions
- Güncel katalog: **1006 ürün** (İçecekler: 564, Yiyecekler: 442), 10 zincir, 10 sezonluk ürün
- Besin kaydı: 83 `mixed`, 923 `estimated`, 0 `verified`, 0 `unverified`
- Görseller: 1006 benzersiz yerel WebP yolu; 384 resmî/exact, 622 lisanslı
  fallback (%98.1 benzersiz hash, maks 3 tekrar)
- Alt Ajan Denetimleri: 7 bağımsız uzman subagent raporu `reports/` altında

## Katalog dağılımı (16 Ağustos 2026)

| Zincir | Ürün | Sezonluk |
|---|---:|---:|
| Starbucks | 130 | 0 |
| Espressolab | 116 | 0 |
| Kahve Dünyası | 20 | 0 |
| Caffè Nero | 125 | 0 |
| Coffy | 86 | 4 |
| Mackbear Coffee Co. | 166 | 3 |
| Arabica Coffee House | 131 | 0 |
| Gloria Jean's Coffees | 115 | 1 |
| David People | 93 | 2 |
| Tchibo | 24 | 0 |
| **Toplam** | **1006** | **10** |

### Caffè Nero güncellemesi

Caffè Nero Türkiye kataloğu 11 Ağustos 2026'da 7 resmî menü sayfasından
yeniden derlendi. Önceki 20 kayıt güncel resmî adlarla eşleştirildi ve
kimlikleri korundu; 105 yeni ürünle zincir toplamı 125'e çıktı. Kaynak anlık
görüntüsü `scripts/catalog_sources/caffe_nero.json` içinde izlenir ve katalog
audit'i bu dosyadaki 125 ürünle derlenmiş katalog arasında eksik/fazla ad
olmadığını denetler.

Caffè Nero görsellerinin 96'sı markanın resmî ürün görseli, 29'u lisanslı
fallback'tir. Resmî menüdeki kullanılabilir değerler tarif girdisi olarak
alınsa da uygulamanın tam makro şeması — özellikle kafein — her ürün için
resmî ve eksiksiz yayınlanmadığından 125 kaydın tamamı dürüstçe `estimated`
kalır.

## Mimari

- Framework: React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4
- Durum yönetimi: merkezi UI durumu `src/App.tsx` içinde tutulur.
- Veri akışı: `scripts/catalog_sources/*` ve araştırma verileri →
  `scripts/compile_catalog.py` → `src/data/catalog/<chain>.ts` →
  `src/data/items.ts` → filtrelenmiş UI listeleri.
- Görsel akışı: `scripts/build-images.mjs` ürün manifestini işler, resmî
  kaynakları tercih eder ve bütün çıktıları yerel WebP olarak üretir.
- Dağıtım: `.github/workflows/pages.yml`; kök GitHub Pages sitesi olduğu
  için Vite `base` değeri değiştirilmez ve `/images/*` yolları korunur.

## Temel sözleşmeler

`MenuItem` (`src/types/cafe.ts`) her statik üründe kimlik, zincir, ad,
kategori, açıklama, yerel görsel yolu, temel makrolar, alerjenler, diyet
etiketleri ve aşağıdaki provenance kayıtlarını taşır:

- `CatalogSource { url, checkedAt, kind: 'official' | 'secondary' }`
- `ImageSource { url, kind, exactProduct }`
- `NutritionSource { status, label?, url?, verifiedAt?, servingBasis?, notes? }`
- `availability: 'current' | 'seasonal'`

Tchibo'nun ürün sayfası bulunmayan dört standart espresso bazlı kaydı
(`tchibo_espresso`, `tchibo_caff_latte`, `tchibo_cappuccino`,
`tchibo_americano`) `catalogSource.kind: 'secondary'` taşır. Diğer kayıtlar
resmî katalog kaynağına bağlıdır. URL, besin değeri veya kaynak bilgisi
uydurulmaz.

Desteklenen alerjen profili gluten, laktoz, kuruyemiş, yer fıstığı, soya,
yumurta, yulaf, balık, hardal, susam ve sülfitleri kapsar. Uygulamadaki
alerjen uyarıları garanti değildir; güncel marka açıklaması ve çapraz
bulaşma riski her zaman ayrıca değerlendirilmelidir.

## Öne çıkan özellikler

- Türkçe karakter/diakritik katlamalı arama ve klavye/ARIA uyumlu öneriler
- Zincir, kategori, içecek/yiyecek ve diyet etiketi filtreleri
- Boyut, süt, şurup, shot ve krema özelleştirmesi
- Favoriler, günlük makro sepeti ve dört ürüne kadar karşılaştırma
- Besin etiketi, akıllı takas, özel tarif oluşturucu
- Profil tabanlı BMR/TDEE makro hedefleri ve eski localStorage kaydı migrasyonu
- Kalıcı açık/koyu tema ve ilk boyamada tema parlamasını önleyen başlangıç
  betiği
- Tahminî değer, tıbbi tavsiye ve çapraz bulaşma açıklamaları

## Dosya düzeni

- `src/components/`: uygulama bileşenleri ve modallar
- `src/data/catalog/<chain>.ts`: derlenmiş zincir katalogları
- `src/data/items.ts`: `MENU_ITEMS` birleştiricisi
- `src/types/cafe.ts`: ürün ve provenance tipleri
- `src/utils/`: arama, filtre, makro ve hedef yardımcıları
- `scripts/fetch-caffe-nero.mjs`: 7 resmî Caffè Nero sayfasını kaynak anlık
  görüntüsüne dönüştüren tarayıcı
- `scripts/catalog_sources/caffe_nero.json`: izlenen 125 satırlık Caffè Nero
  kaynak anlık görüntüsü
- `scripts/compile_catalog.py`: katalog derleyici
- `scripts/build-images.mjs`: yerel WebP üretim hattı
- `scripts/catalog-audit.ts`: katalog/provenance/görsel sözleşmesi denetimi
- `tests/unit/` ve `tests/e2e/`: aktif testler

## Kalite kapıları

```bash
npm run catalog:audit
npm run images:audit
npm run lint
npm run build
npm run test:unit
npm run verify:build
npm run budget:check
npm run test:e2e
npm audit
```

`catalog:audit` komutu benzersiz kimlikleri, zincir referanslarını, sonlu ve
negatif olmayan makroları, provenance alanlarını, sezonluk sayıları, yerel
görsel kurallarını ve Caffè Nero kaynak anlık görüntüsü eşleşmesini denetler.
Gerçek son çalıştırma sonuçları `GATE_STATUS.md` içinde tutulur; eski 67
senaryoluk kaynak-metin suite'i güncel kapı sayılmaz.

## Bekleyen işler

- Google Search Console mülk doğrulaması, sitemap gönderimi ve ilk indeks
  isteği kullanıcı aksiyonudur.
- Kahve Dünyası, Coffy ve Tchibo için görülen daha geniş listeler şube bazlı
  ikincil teslimat yüzeylerindedir. Bunlar resmî, zincir-geneli katalog gibi
  eklenmeden önce birden fazla şubede doğrulanmalı ve provenance/görsel
  lisansı ayrı bir araştırma geçişinde tamamlanmalıdır.
- Ana bundle için yaklaşık 143 kB gzip uyarısı P2 code-splitting işi olarak
  ertelenmiştir.

## İlgili belgeler

- `README.md`: hızlı başlangıç ve kısa proje özeti
- `GATE_STATUS.md`: gerçek kalite kapısı sonuçları
- `DATA_PROVENANCE.md`: kaynaklandırma politikası
