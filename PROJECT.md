# ☕ Kalori Cafe — Zincir Kahve Makro ve Alerjen Platformu

Kalori Cafe; Türkiye'deki 10 büyük kafe zincirine ait **845 ürünün** kalori,
protein, karbonhidrat, şeker, yağ, kafein ve alerjen bilgilerini tek
platformda karşılaştıran React uygulamasıdır.

- **Canlı adres:** <https://kalorikafe.github.io/>
- **Kaynak:** <https://github.com/kalorikafe/kalorikafe.github.io>
- **Hosting:** GitHub Pages + GitHub Actions (yalnızca; third-party hosting yok)

Çalışma kesiti Ağustos 2026'dır; katalog zincirlerin resmî web
menülerinden derlenmiştir (Starbucks TR menüsü, Espressolab resmî menü
API'si, Arabica/Gloria Jean's/David People/Mackbear/Coffy menü sayfaları).
Her statik ürün `catalogSource`, `imageSource` ve `nutritionSource`
provenance alanları taşır ve `npm run catalog:audit` bunu otomatik denetler.
Tchibo'nun 4 standart espresso bazlı ürünü kendi ürün sayfası olmadığı için
`kind: 'secondary'` ile işaretlidir (`tchibo_espresso`, `tchibo_caff_latte`,
`tchibo_cappuccino`, `tchibo_americano`).

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

Eski 67 senaryoluk kaynak-metin legacy suite'i (tier1–tier4 +
`run-e2e-tests.ts`) **aktif kalite kapısı değildir** ve `tests/legacy/`
altında tarihsel arşivdir; `test:legacy`/`lint:legacy` komutları
kaldırılmıştır, `tsx` bağımlılığı eklenmez. Değer korunan senaryoları
güncel unit/E2E testlere taşınmıştır (bkz. `tests/legacy/README.md`).

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
- Besin değerleri sağlık iddiası değildir; alerjen bilgileri garanti
  edilmez — markanın güncel resmî bilgileri her zaman esas alınmalıdır.

## Kişisel makro hedefleri

`kalori_cafe_goals` altında saklanır; eski sayısal kayıtlar
`normalizeStoredGoals` ile yerinde migrate edilir (değerler korunur,
varsayılan profil eklenir). Modal profili her açılışta yükler, geçersiz
değerlerde (yaş 15–75, kilo 35–250, boy 120–230) Apply kapalıdır ve
satır içi hata gösterir. Kafein metni kullanıcının **belirlediği kişisel
günlük sınır** olarak yazılır (varsayılan 400 mg).

## Dokümanlar

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) — mimari ve geliştirici kılavuzu
- [PROJECT.md](./PROJECT.md) — katalog & kalite kapıları durumu
- [GATE_STATUS.md](./GATE_STATUS.md) — güncel kapı sonuçları
- [DATA_PROVENANCE.md](./DATA_PROVENANCE.md) — besin/katalog/görsel kaynak sözleşmeleri
- [DEEPSEEK_NIGHT_REPORT.md](./DEEPSEEK_NIGHT_REPORT.md) — gece çalışması + yayın raporu
- [tests/legacy/README.md](./tests/legacy/README.md) — arşivlenen legacy suite açıklaması

## Deploy

Statik Vite çıktısı (`dist/`) GitHub Actions'daki `pages.yml` workflow'u ile
GitHub Pages'e yayınlanır (kullanıcı kök sitesi olduğu için `base` yok;
asset yolları `/images/...` kalır). Deploy tetikleyicileri: `master`
push ve manuel `workflow_dispatch`.</think>

<｜DSML｜tool_calls>
<｜DSML｜invoke name="write_file">
<｜DSML｜parameter name="content" string="true"># Project: Kalori Cafe — Katalog & Kalite Kapıları

## Architecture

- **Framework**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **State Management**: Merkezi durum `App.tsx` (`searchQuery`,
  `selectedChainId`, `selectedCategory`, `selectedDietaryTags`,
  `isOnlyDrinks`, `isOnlyFood`, `sortBy`, `userAllergens`, `userGoals`,
  `favoriteIds`, `compareIds`, `basketItems`, `isDarkMode`).
- **Data Flow**: `src/data/catalog/<chain>.ts` → `src/data/items.ts`
  (birleştirici) → `App.tsx` memoized `filteredItems` → UI bileşenleri.
- **Public**: <https://kalorikafe.github.io/> (GitHub Pages +
  Actions; kök site olduğu için Vite `base` değişmez, `/images/*` korunur).

## Feature Inventory

| # | Feature | Durum |
|---|---------|-------|
| 1 | Navbar redesign (light/dark, logo, arama, aksiyonlar) | DONE |
| 2 | Hero & quick filter pills (+ tahminî veri/çapraz bulaşma açıklaması) | DONE |
| 3 | Zincir seçici (10 zincir, yerel logolu) | DONE |
| 4 | Diyet filtresi (vegan, glutensiz, laktozsuz, yüksek protein, düşük kalori) | DONE |
| 5 | İşlevselliğin korunması (arama, karşılaştırma, sepet, favoriler, alerjen) | DONE |
| 6 | Katalog 199 → 845 ürün (resmî menü taramaları; Espressolab resmî API dahil) | DONE |
| 7 | Her üründe provenance (catalogSource, imageSource, nutritionSource, availability) | DONE |
| 8 | Görsel hattı: 845 yerel WebP, %100 benzersiz yol, resmî + lisanslı fallback | DONE |
| 9 | Arama normalizasyonu + öneri paneli (masaüstü + mobil, klavye, ARIA; benzersiz listbox/option ID'leri) | DONE |
| 10 | Sıcak espresso koyu tema (tokenlar, kalıcı tercih, parlamasız ilk boya) | DONE |
| 11 | `npm run catalog:audit` otomatik denetim betiği | DONE |
| 12 | Vitest birim + Playwright E2E + görsel yükleme testi | DONE |
| 13 | Alerjen: peanut ("Yer Fıstığı") seçeneği + çapraz bulaşma disclaimer'ı | DONE |
| 14 | Kişisel makro profili (BMR/TDEE, validasyon, localStorage migrasyonu) | DONE |
| 15 | GitHub Pages CI/CD (pages.yml) + public repo | DONE |
| 16 | SEO: sitemap.xml, robots.txt (+Sitemap), JSON-LD WebSite schema | DONE (Search Console kaydı kullanıcıda) |

## Milestones

| # | Kapsam | Durum |
|---|--------|-------|
| M1 | React 19 + Vite 8 altyapısı, katmanlı veri modeli, modüler katalog | DONE |
| M2 | Katalog taraması ve 845 ürün + provenance + yerel görseller | DONE |
| M3 | Arama UX, koyu tema, test/kalite kapırlar, rapor | DONE |
| M4 | Public yayın: GitHub Actions Pages, ikincil kaynak işaretleme, disclaimer, favicon | DONE |

## Interface Contracts

`MenuItem` (`src/types/cafe.ts`): `{ id, chainId, name, nameEn?, category,
description, image, isDrink, defaultSizeId?, defaultMilkId?,
defaultSyrupPumps?, baseMacros, allergens, dietaryTags, glycemicImpact?,
nutritionSource?, availability?, catalogSource?, imageSource? }`

Ek sözleşmeler: `CatalogSource { url, checkedAt, kind: 'official'|'secondary' }`,
`ImageSource { url, kind, exactProduct }`,
`NutritionSource { status, label?, url?, verifiedAt?, servingBasis?, notes? }`.

Makro profili (`src/types→utils/macroGoals.ts`): `MacroProfile { gender,
age, weightKg, heightCm, activity, goalType }`; `UserMacroGoals`
ona opsiyonel `profile` taşır. Yardımcılar: `DEFAULT_MACRO_PROFILE`,
`DEFAULT_USER_GOALS`, `calculateUserMacroGoals`, `normalizeStoredGoals`
(eski sayısal `kalori_cafe_goals` kaydını veri kaybı olmadan migrate eder).

`Chain` (`src/data/chains.ts`): `{ id, name, logo (yerel yol), color,
badgeColor?, accentBg?, description }` — footer zincir listesi bu sözleşmeden
dinamik üretilir (sabit liste yok).

## Code Layout

- `src/components/`: Navbar, Hero, ChainSelector, DietaryFilterBar,
  SortAndAnalyticsBar, ItemCard, SearchSuggestions, MobileSearchModal,
  CustomizerModal, DailyBasketDrawer, CompareModal, AllergenSettingsModal,
  NutritionLabelModal, SmartSwapModal, MacroTargetCalculatorModal,
  CustomRecipeBuilderModal, MobileBottomNav, MacroDistributionDonut
- `src/utils/macroGoals.ts`: makro profili + hesap + normalize/migrate
- `src/data/catalog/<chain>.ts`: zincir başına MenuItem modülleri
- `src/data/items.ts`: MENU_ITEMS birleştirici
- `scripts/catalog-audit.ts`: `npm run catalog:audit` denetimi
- `scripts/compile_catalog.py`: katalog derleyici (URL önceliği: productUrl →
  araştırma zincir kaynağı → katalog varsayılanı; secondary işaretleme)
- `tests/legacy/`: arşivlenmiş eski tier suite (aktif kapı değil, README'li)
- `.github/workflows/`: `ci.yml` (kalite), `pages.yml` (kalite + Pages deploy)
- `public/sitemap.xml` + `robots.txt`: arama motoru keşfi (canlıda)

## Bekleyen işler (devir)

- (Kullanıcı) Google Search Console → mülk → HTML doğrulama dosyası →
  `sitemap.xml` gönderimi → ilk index isteği.
- P2: ana bundle ~143 kB gzip chunk (code splitting ertelendi).
- HEAD: `ede7715` (master); yayın öncesi tag: `pre-public-2026-08-06`.
