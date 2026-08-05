# Data Structure & Menu Items Analysis Report — Kalori Cafe

## Executive Summary
This report presents a read-only investigation of the data structure, types, coffee chain landscape, item counts, and nutrition data accuracy in **Kalori Cafe**. 

Key Discovery: While `src/data/items.ts` currently contains 400 total items across 10 chains (exactly 40 items per chain), **100% of the menu items are identical template clones** duplicated across all 10 chains with generic placeholder descriptions (`"<CHAIN_NAME> özel tarifiyle hazırlanmış..."`). Furthermore, major high-growth coffee chains in Turkey such as **Coffy**, **Mackbear Coffee Co.**, and **David People** are currently missing from `src/data/chains.ts`.

---

## 1. Current Data Schema & Architecture Analysis

The data model for Kalori Cafe is defined in `src/types/cafe.ts` and supported by static data files `src/data/chains.ts`, `src/data/items.ts`, and `src/data/modifiers.ts`.

### 1.1 Core Interfaces

#### `Chain` (`src/types/cafe.ts:30-38`)
```typescript
export interface Chain {
  id: string;
  name: string;
  logo: string;
  color: string;
  badgeColor?: string;
  accentBg?: string;
  description: string;
}
```

#### `Macros` (`src/types/cafe.ts:40-49`)
```typescript
export interface Macros {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  sugar: number;    // g
  fat: number;      // g
  satFat?: number;   // g
  caffeine: number; // mg
  sodium?: number;   // mg
}
```

#### `MenuItem` (`src/types/cafe.ts:74-92`)
```typescript
export interface MenuItem {
  id: string;
  chainId: string;
  name: string;
  nameEn?: string;
  category: Category;
  description: string;
  image: string;
  isDrink: boolean;
  defaultSizeId?: string;
  defaultMilkId?: string;
  defaultSyrupPumps?: number;
  baseMacros: Macros;
  allergens: Allergen[];
  dietaryTags: DietaryPreference[];
  glycemicImpact?: 'Düşük' | 'Orta' | 'Yüksek';
  smartSwapNote?: string;
  smartSwapSaveKcal?: number;
}
```

### 1.2 Taxonomy Breakdown

#### Categories (`Category`)
- `espresso_hot`: Sıcak Espresso İçecekleri
- `espresso_iced`: Soğuk Espresso İçecekleri
- `cold_brew`: Cold Brew & Demleme Kahveler
- `frappe_blended`: Frappe & Buzlu Karışımlar
- `tea_herbal`: Çay & Bitki Çayları
- `smoothie_juice`: Smoothie & Taze Meyve Suları
- `bakery_dessert`: Fırın Ürünleri & Tatlılar
- `sandwich_savory`: Sandviç & Tuzlu Atıştırmalıklar
- `fit_healthy`: Fit & Sağlıklı Yaşam Ürünleri

#### Allergens (`Allergen`)
- `lactose`, `gluten`, `celiac_oat_risk`, `nuts`, `soy`, `egg`, `peanut`

#### Dietary Preferences (`DietaryPreference`)
- `vegan`, `vegetarian`, `gluten_free`, `lactose_free`, `sugar_free`, `high_protein`, `low_calorie`

---

## 2. Current Coffee Chains & Item Distribution Audit

### 2.1 Current Chain List (`src/data/chains.ts`)
The project currently defines **10 coffee chains**:

| # | Chain ID | Chain Name | Current Logo Domain | Accent Theme | Status in TR Market |
|---|---|---|---|---|---|
| 1 | `starbucks` | Starbucks | starbucks.com.tr | Emerald Green | #1 Market Share |
| 2 | `kahve_dunyasi` | Kahve Dünyası | kahvedunyasi.com | Pink / Maroon | Top Turkish Chain |
| 3 | `espressolab` | Espressolab | espressolab.com | Red | Fast Growing TR Chain |
| 4 | `caffe_nero` | Caffè Nero | caffenero.com | Blue | Major International |
| 5 | `gloria_jeans` | Gloria Jean's | gloriajeans.com.tr | Orange | Established Chain |
| 6 | `caribou` | Caribou Coffee | cariboucoffee.com.tr | Cyan | US Origin Chain |
| 7 | `arabica` | Arabica | arabicacoffee.com.tr | Stone/Dark | Anatolia & TR Chain |
| 8 | `tchibo` | Tchibo | tchibo.com.tr | Dark Blue | German Retail/Coffee |
| 9 | `kahve_diyari` | Kahve Diyarı | kahvediyari.com.tr | Amber | Regional Local Chain |
| 10 | `coffeemania` | Coffeemania | coffeemania.com.tr | Red | Franchise Chain |

### 2.2 Current Item Audit (`src/data/items.ts`)
- **Total Item Count**: 400 items
- **Items Per Chain**: Exactly 40 items per chain across all 10 chains
- **Beverage vs. Food Ratio**: 30 Drinks (75%) / 10 Foods (25%) per chain

#### Category Breakdown Across Workspace:
- `espresso_hot`: 100 items (25.0%)
- `espresso_iced`: 80 items (20.0%)
- `frappe_blended`: 50 items (12.5%)
- `bakery_dessert`: 50 items (12.5%)
- `sandwich_savory`: 40 items (10.0%)
- `tea_herbal`: 30 items (7.5%)
- `cold_brew`: 20 items (5.0%)
- `smoothie_juice`: 20 items (5.0%)
- `fit_healthy`: 10 items (2.5%)

---

## 3. Data Quality & Authenticity Findings

### 3.1 Identical Item Duplication Across All Chains
Our analysis revealed that items 1 through 40 in `src/data/items.ts` have **identical item names** across all 10 chains. For instance:
- Item #1 for Starbucks: `Caffè Latte`
- Item #1 for Kahve Dünyası: `Caffè Latte`
- Item #1 for Espressolab: `Caffè Latte`
- Item #29 for ALL chains: `Strawberry Refresher`
- Item #35 for ALL chains: `Turkey & Cheese Toast`
- Item #37 for ALL chains: `Avocado Egg Toast`

This means Turkish specialty brands like **Kahve Dünyası** currently feature American Starbucks items (e.g. *Mango Dragonfruit Refresher*, *Avocado Egg Toast*, *Vanilla Sweet Cream Cold Brew*) instead of authentic Turkish items like *Türk Kahvesi*, *Dibek Kahvesi*, *Damla Sakızlı Türk Kahvesi*, *Sahlep*, *El Yapımı Çikolata*, *Frutero*, *Dondurmalı Pasta*.

### 3.2 Automated Description Strings
All 400 items currently use an automated description template:
`"<CHAIN_NAME> özel tarifiyle hazırlanmış <item name>."`
(e.g., `"KAHVE_DUNYASI özel tarifiyle hazırlanmış cappuccino."`)

---

## 4. Coffee Chains Landscape in Turkey & Update Assessment

### 4.1 Evaluation of Turkish Coffee Chains

| Chain Name | TR Branch Count & Popularity | Status in Project | Recommended Action |
|---|---|---|---|
| **Starbucks** | ~700+ branches (Largest in TR) | Present (40 items) | **Retain & Update Items** (Use authentic Starbucks menu) |
| **Kahve Dünyası** | ~300+ branches (Top local TR brand) | Present (40 items) | **Retain & Overhaul Items** (Add Türk Kahvesi, Sahlep, Çikolata, etc.) |
| **Espressolab** | ~200+ branches (Fastest growing local 3rd wave) | Present (40 items) | **Retain & Overhaul Items** (Add 3rd wave cold brews, special pastries) |
| **Caffè Nero** | ~90+ branches (Italian style popularity) | Present (40 items) | **Retain & Overhaul Items** (Add Italian roasts, Panini, Cannoli) |
| **Coffy** | ~100+ branches (High-growth budget chain) | **MISSING** | **ADD** (Must-have modern TR chain) |
| **Mackbear Coffee Co.** | ~100+ branches (Huge youth/student popularity) | **MISSING** | **ADD** (Must-have modern TR chain) |
| **David People** | ~70+ branches (Widespread lounge/cafe chain) | **MISSING** | **ADD** (Popular TR chain) |
| **Arabica Coffee House** | ~100+ branches (Anatolia & major cities) | Present (40 items) | **Retain & Update Items** |
| **Gloria Jean's Coffees** | ~90+ branches | Present (40 items) | **Retain & Update Items** (Add Voltage, Chillers) |
| **Tchibo** | ~70+ branches | Present (40 items) | **Retain & Update Items** (Add German pastries, Filter coffees) |
| **Caribou Coffee** | ~50+ branches | Present (40 items) | **Retain / Optional** |
| **Kahve Diyarı** | Regional focus | Present (40 items) | **Replace or Retain** |
| **Coffeemania** | Niche franchise | Present (40 items) | **Replace or Retain** |

### 4.2 Proposed Chain Target Architecture
To reflect Turkey's actual coffee chain market with high accuracy, we recommend defining **10 to 12 top popular coffee chains**:
1. **Starbucks**
2. **Kahve Dünyası**
3. **Espressolab**
4. **Caffè Nero**
5. **Coffy** *(New)*
6. **Mackbear Coffee Co.** *(New)*
7. **David People** *(New)*
8. **Arabica Coffee House**
9. **Gloria Jean's Coffees**
10. **Tchibo**
11. *(Optional)* **Caribou Coffee**
12. *(Optional)* **Kahve Diyarı**

---

## 5. Data Update Strategy & Action Plan

To fulfill the requirements (R2 & R3) where each chain has at least **40 authentic, realistic items** with complete macro values:

### 5.1 Item Curation Principles
1. **Unique Signature Menus**: Each chain must have items corresponding to its actual menu offered in Turkey.
   - *Kahve Dünyası*: Türk Kahvesi, Sütlü Türk Kahvesi, Dibek, Sahlep, Sıcak Çikolata, Fondü, Gofret, El Yapımı Çikolatalar.
   - *Espressolab*: Espressolab Special Cold Brew, Iced White Mocha, San Sebastian Cheesecake, Protein Bars, Gluten-Free Cookie.
   - *Coffy*: Coffy Espresso, Iced Coffy Latte, Berry Cold Brew, Coffy Cookie, Croissant Toast.
   - *Mackbear*: Bear Cub Iced Frappes, Mackbear Special Brews, Mackbear Toast.
   - *David People*: Signature Roasts, Club Sandwiches, Special Cheesecakes.
2. **Balanced Category Ratios per Chain**:
   - **Drinks (28–30 items)**: Hot Espresso, Iced Espresso, Cold Brew, Frappes, Tea & Herbal, Smoothies/Juices.
   - **Food (10–12 items)**: Bakery/Desserts (Croissants, Cakes, Muffins), Savory Sandwiches (Paninis, Toasts, Wraps), Fit/Healthy (Protein Bowls, Granola, Nuts).
3. **Realistic Macro & Allergen Data**:
   - Calories, Protein, Carbs, Sugar, Fat, Saturated Fat, Caffeine (mg), Sodium (mg).
   - Accurately tag `allergens` (`lactose`, `gluten`, `nuts`, `soy`, `egg`, etc.) and `dietaryTags` (`vegan`, `vegetarian`, `sugar_free`, `high_protein`, etc.).
4. **Descriptive & Rich Turkish Copy**:
   - Replace generic string templates with specific ingredient descriptions highlighting coffee origin, milk texture, syrup notes, or baked goods composition.

---

## 6. Verification & Derivation Commands

- **DERIVATION COMMAND**:
  `node .agents/teamwork_preview_explorer_survey_2/count_items.cjs`
  Returns item counts and chain lists.
- **BUILD VERIFICATION**:
  `npm run build`
  Confirms TypeScript compilation and Vite build succeeded.

---
*Report prepared by `teamwork_preview_explorer_survey_2` for Kalori Cafe.*
