# ☕ Kalori Cafe — Zincir Kahve Makro ve Alerjen Platformu

Kalori Cafe; Türkiye'deki 10 büyük kafe zincirine ait **845 ürünün** kalori,
protein, karbonhidrat, şeker, yağ, kafein ve alerjen bilgilerini tek
platformda karşılaştıran React uygulamasıdır.

- **Canlı adres:** <https://selimgrsoy0-commits.github.io/>
- **Kaynak:** <https://github.com/selimgrsoy0-commits/selimgrsoy0-commits.github.io>
- **Hosting:** GitHub Pages + Actions (yalnızca bu; Vercel/Cloudflare/Netlify kullanılmaz)

Çalışma kesiti Ağustos 2026; katalog zincirlerin resmî web menülerinden
derlendi (Starbucks TR menüsü, Espressolab resmî menü API'si,
Arabica/Gloria Jean's/David People/Mackbear/Coffy sayfaları). Her statik
ürün `catalogSource`, `imageSource` ve `nutritionSource` provenance
alanlarını taşır; `npm run catalog:audit` bunu otomatik denetler.
Tchibo'nun 4 standart espresso bazlı ürünü kendi ürün sayfası olmadığı
için `kind: 'secondary'` ile işaretlidir (`tchibo_espresso`,
`tchibo_caff_latte`, `tchibo_cappuccino`, `tchibo_americano`).

## Hızlı başlangıç

```bash
npm install
npm run dev        # http://localhost:5173
```

## Kalite komutları

```bash
npm run catalog:audit   # katalog sözleşmeleri + görsel kalite denetimi
npm run lint            # oxlint (src + tests/unit + tests/e2e)
npm run build           # TypeScript + Vite üretim derlemesi
npm run test:unit       # Vitest unit testleri
npm run test:e2e        # Playwright + Chromium uçtan uca testleri
npm test                # unit + E2E birlikte
npm audit               # bağımlılık güvenlik taraması
```

`npm run test:e2e:install` ilk kurulumda Chromium indirir.

Eski 67 senaryoluk kaynak-metin legacy suite'i (tier1–tier4 + eski
runner) **aktif kalite kapısı değildir** — `tests/legacy/` altında
tarihsel arşivdir; `test:legacy` / `lint:legacy` komutları kaldırılmıştır
ve `tsx` bağımlılığı eklenmez. Değer korunan senaryoları (boyut sınırı,
süt farkı, şurup/shot, peanut, localStorage migrasyonu) güncel unit/E2E
testlere taşınmıştır (bkz. `tests/legacy/README.md`).

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
  `nutritionSource.notes` alanındadır. Kartlarda **"Tahmini değer"**
  rozeti ve hero/footer'da tahminî veri + çapraz bulaşma açıklaması
  görünür; uygulama tıbbi tavsiye vermez.
- Alerjen bilgileri garanti değildir; markanın güncel resmî bilgileri
  esas alınmalıdır (çapraz bulaşma riski).

## Kişisel makro hedefleri

`kalori_cafe_goals` altında saklanır; eski sayısal kayıtlar
`normalizeStoredGoals` ile yerinde migrate edilir (değerler korunur,
varsayılan profil eklenir). Modal profili her açılışta yükler; geçersiz
değerlerde (yaş 15–75, kilo 35–250 kg, boy 120–230 cm) Apply kapalıdır
ve satır içi hata gösterir. Kafein metni kullanıcının **belirlediği
kişisel günlük sınır** olarak yazılır (varsayılan 400 mg).

## Dokümanlar

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) — mimari ve geliştirici kılavuzu
- [PROJECT.md](./PROJECT.md) — katalog & kalite kapıları
- [GATE_STATUS.md](./GATE_STATUS.md) — güncel kapı sonuçları
- [DATA_PROVENANCE.md](./DATA_PROVENANCE.md) — kaynak sözleşmeleri
- [DEEPSEEK_NIGHT_REPORT.md](./DEEPSEEK_NIGHT_REPORT.md) — gece çalışması + yayın raporu

## Deploy

Statik Vite çıktısı (`dist/`) `.github/workflows/pages.yml` ile GitHub
Pages'e yayınlanır (kullanıcı kök sitesi olduğu için Vite `base` değişmez;
asset yolları `/images/...` kalır). Tetikleyiciler: `master` push ve manuel
`workflow_dispatch`.