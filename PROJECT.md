# Project: Kalori Cafe — Katalog & Kalite Kapıları

## Architecture

- **Framework**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **State Management**: Merkezi durum `App.tsx` (`searchQuery`,
  `selectedChainId`, `selectedCategory`, `selectedDietaryTags`,
  `isOnlyDrinks`, `isOnlyFood`, `sortBy`, `userAllergens`, `favoriteIds`,
  `compareIds`, `basketItems`, `isDarkMode`).
- **Data Flow**:
  `src/data/catalog/<chain>.ts` → `src/data/items.ts` (birleştirici) →
  `App.tsx` memoized `filteredItems` → UI bileşenleri (`Navbar`, `Hero`,
  `ChainSelector`, `DietaryFilterBar`, `SortAndAnalyticsBar`, `ItemCard`).

## Feature Inventory

| # | Feature | Durum |
|---|---------|-------|
| 1 | Navbar redesign (light/dark, logo, arama, aksiyonlar) | DONE |
| 2 | Hero & quick filter pills | DONE |
| 3 | Zincir seçici (10 zincir, yerel logolu) | DONE |
| 4 | Diyet filtresi (vegan, glutensiz, laktozsuz, yüksek protein, düşük kalori) | DONE |
| 5 | İşlevselliğin korunması (arama, karşılaştırma, sepet, favoriler, alerjen) | DONE |
| 6 | Katalog 199 → 845 ürün (resmî menü taramaları; Espressolab resmî API dahil) | DONE |
| 7 | Her üründe provenance (catalogSource, imageSource, nutritionSource, availability) | DONE |
| 8 | Görsel hattı: 845 yerel WebP, %100 benzersiz yol, resmî + lisanslı fallback | DONE |
| 9 | Arama normalizasyonu + öneri paneli (masaüstü + mobil, klavye, aria) | DONE |
| 10 | Sıcak espresso koyu tema (tokenlar, kalıcı tercih, parlamasız ilk boya) | DONE |
| 11 | `npm run catalog:audit` otomatik denetim betiği | DONE |
| 12 | Vitest birim + Playwright E2E (17 akış) + görsel yükleme testi | DONE |

## Milestones

| # | Kapsam | Durum |
|---|--------|-------|
| M1 | React 19 + Vite 8 altyapısı, katmanlı veri modeli, modüler katalog | DONE |
| M2 | Katalog taraması ve 845 ürün + provenance + yerel görseller | DONE |
| M3 | Arama UX, koyu tema, test/kalite kapıları, rapor | DONE |

## Interface Contracts

`MenuItem` (`src/types/cafe.ts`): `{ id, chainId, name, nameEn?, category,
description, image, isDrink, defaultSizeId?, defaultMilkId?,
defaultSyrupPumps?, baseMacros, allergens, dietaryTags, glycemicImpact?,
nutritionSource?, availability?, catalogSource?, imageSource? }`

Ek sözleşmeler: `CatalogSource { url, checkedAt, kind }`,
`ImageSource { url, kind, exactProduct }`,
`NutritionSource { status, label?, url?, verifiedAt?, servingBasis?, notes? }`.

`Chain` (`src/data/chains.ts`): `{ id, name, logo (yerel yol), color,
badgeColor?, accentBg?, description }`.

## Code Layout

- `src/components/`: Navbar, Hero, ChainSelector, DietaryFilterBar,
  SortAndAnalyticsBar, ItemCard, SearchSuggestions, MobileSearchModal,
  CustomizerModal, DailyBasketDrawer, CompareModal, AllergenSettingsModal,
  NutritionLabelModal, SmartSwapModal, MacroTargetCalculatorModal,
  CustomRecipeBuilderModal, MobileBottomNav, MacroDistributionDonut
- `src/data/catalog/<chain>.ts`: zincir başına MenuItem modülleri
- `src/data/items.ts`: MENU_ITEMS birleştirici
- `src/utils/searchNormalize.ts`, `searchInteraction.ts`: arama ortak mantığı
- `scripts/catalog-audit.ts`: `npm run catalog:audit` denetimi
- `scripts/compile_catalog.py`, `assemble_research.py`,
  `add_espressolab.py`, `build-images.mjs`: katalog/görsel üretim araçları