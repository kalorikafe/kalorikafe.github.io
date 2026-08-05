# ☕ Kalori Cafe — Zincir Kahve Makro ve Alerjen Platformu

Kalori Cafe; Türkiye'deki 10 büyük kafe zincirine ait **845 ürünün** kalori,
protein, karbonhidrat, şeker, yağ, kafein ve alerjen bilgilerini tek
platformda karşılaştıran React uygulamasıdır.

Çalışma kesiti 5 Ağustos 2026'dır; katalog zincirlerin resmî web
menülerinden derlenmiştir (Starbucks TR menüsü, Espressolab resmî menü
API'si, Arabica/Gloria Jean's/David People/Mackbear/Coffy menü sayfaları).
Her statik ürün `catalogSource`, `imageSource` ve `nutritionSource`
provenance alanları taşır ve `npm run catalog:audit` bunu otomatik denetler.

## Hızlı başlangıç

```bash
npm install
npm run dev        # http://localhost:5173
```

## Kalite komutları

```bash
npm run catalog:audit   # katalog sözleşmeleri + görsel kalite denetimi
npm run lint            # oxlint
npm run build           # TypeScript + Vite üretim derlemesi
npm run test:unit       # Vitest unit testleri
npm run test:e2e        # Playwright + Chromium uçtan uca testleri
npm test                # unit + e2e birlikte
npm audit               # bağımlılık güvenlik taraması
```

`npm run test:e2e:install` ilk kurulumda Chromium indirir.
`npm run test:legacy` eski 67 senaryoluk paketi yalnızca geriye dönük
karşılaştırma için çalıştırır; ana kalite kapısı değildir.

## Teknolojiler

- React 19, TypeScript 6, Vite 8
- Tailwind CSS v4 (koyu tema tokenları `src/index.css` içinde merkezli)
- Vitest birim testleri, Playwright + Chromium E2E
- Görsel hattı: `sharp` (WebP), Wikimedia Commons / Unsplash lisanslı
  fallback'ler, zincir resmî görselleri

## Katalog ve veri notları

- Ürün verisi `src/data/catalog/<chain>.ts` modüllerinde tutulur;
  `src/data/items.ts` yalnızca birleştirir (`MENU_ITEMS`).
- Tüm görseller yerel WebP'dir: `/images/menu/<chain>/<slug>.webp`
  (845 benzersiz görsel; çalışma zamanında uzak hotlink yok).
- Makrolar ürün başına resmî besin tablosu yayınlanmadığı için
  `estimated` olarak işaretlenir; tahmin yöntemi her ürünün
  `nutritionSource.notes` alanındadır.

## Dokümanlar

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) — mimari ve geliştirici kılavuzu
- [DATA_PROVENANCE.md](./DATA_PROVENANCE.md) — besin/katalog/görsel kaynak sözleşmeleri
- [DEEPSEEK_NIGHT_REPORT.md](./DEEPSEEK_NIGHT_REPORT.md) — gece çalışması raporu

## Deploy

Statik Vite çıktısı (`dist/`) ile Vercel, Cloudflare Pages, Netlify veya
GitHub Pages üzerinde sıfıra yakın yapılandırma ile yayınlanabilir.
GitHub Pages'te kök altı bir yolda yayınlanacaksa `vite.config.ts` içine
`base` eklenmelidir.