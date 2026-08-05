# Kalori Cafe — Zincir Kahve Makro ve Alerjen Platformu

Kalori Cafe; 10 kafe zincirinden mevcut **199 ürünün** kalori, makro, kafein ve alerjen bilgilerini karşılaştıran React uygulamasıdır. Katalog şu anda zincir başına 19–20 ürün içerir. Veriler resmi ve güncel olarak kaynaklandırılana kadar uygulama bu yönde bir iddiada bulunmaz.

## Hızlı başlangıç

```bash
npm install
npm run dev
```

## Kalite komutları

```bash
npm run build
npm run lint
npm run test:unit
npm run test:e2e:install   # ilk Playwright kurulumunda
npm run test:e2e
npm test                   # unit + gerçek Chromium E2E
```

`npm run test:legacy`, eski 67 senaryolu mantık/kaynak kontrol paketini yalnız geriye dönük karşılaştırma için çalıştırır; ana kalite kapısı değildir.

## Teknolojiler

- React 19, TypeScript, Vite 8
- Tailwind CSS v4
- Vitest unit testleri
- Playwright Chromium davranış testleri

Ayrıntılı mimari ve geliştirme notları için [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) dosyasına bakın.
Besin verisi doğrulama kuralları ve `NutritionSource` sözleşmesi [DATA_PROVENANCE.md](./DATA_PROVENANCE.md) içindedir. Aynı kalite komutları GitHub Actions CI üzerinde de çalışır.
