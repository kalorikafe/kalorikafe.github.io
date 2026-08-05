# Kalori Cafe — UI Architecture & Component Survey Analysis

**Agent ID**: `teamwork_preview_explorer_survey_1`  
**Date**: 2026-08-05  
**Target Repository**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe`  
**Investigation Focus**: UI Architecture, Component Mapping, State Flow, Redesign Target Audit (Minimal & Lüks)

---

## Executive Summary

Kalori Cafe is a React 19 + TypeScript + Vite application utilizing Tailwind CSS v4 (`@tailwindcss/vite` 4.3.3) for styling. The application allows users to explore nutritional macros (calories, protein, carbs, sugar, fat, caffeine) and allergen risks across major Turkish coffee chains (Starbucks, Espressolab, Caffè Nero, Coffy, Kahve Dünyası, Gloria Jean's, Caribou, Arabica, Tchibo, etc.).

This report provides a detailed read-only audit of:
1. Directory structure and global style architecture.
2. Component mappings for **Navbar**, **Hero Banner**, **Popular Searches Pills**, and **Chain Selector**.
3. State management flow and prop-drilling pathways for search, chain filtering, dietary preferences, category selection, and allergen profiling.
4. Comprehensive file & component audit for the **Minimal & Lüks** redesign (Milk/Coffee/Black color palette, high contrast, clean typography, light and dark mode support).
5. Component dependency graph and recommended redesign strategy.

---

## 1. Directory Structure & Style Architecture

```
src/
├── App.css                     # Custom component styles & keyframes (legacy + layout helpers)
├── App.tsx                     # Top-level state orchestrator & layout container
├── assets/                     # Hero images and Vite/React SVGs
├── components/
│   ├── AllergenSettingsModal.tsx
│   ├── ChainSelector.tsx       # Cafe Chains horizontal scrollable selector
│   ├── CompareModal.tsx
│   ├── CustomRecipeBuilderModal.tsx
│   ├── CustomizerModal.tsx
│   ├── DailyBasketDrawer.tsx
│   ├── DietaryFilterBar.tsx    # Category tabs & dietary preference pills
│   ├── Hero.tsx                # Hero banner & Popular Searches pills
│   ├── ItemCard.tsx            # Product grid card display
│   ├── MacroDistributionDonut.tsx
│   ├── MacroTargetCalculatorModal.tsx
│   ├── MobileBottomNav.tsx     # Mobile floating action navigation bar
│   ├── Navbar.tsx              # Sticky top header navigation
│   ├── NutritionLabelModal.tsx
│   ├── SmartSwapModal.tsx
│   └── SortAndAnalyticsBar.tsx # Sorting dropdown, smart swap, favorites
├── data/
│   ├── chains.ts               # Chain metadata definitions
│   ├── items.ts                # Base menu item catalog
│   └── modifiers.ts            # Customization modifiers (milk, size, syrups)
├── index.css                   # Tailwind v4 entrypoint (@import "tailwindcss"; custom variants & glass-panel)
├── main.tsx                    # App mount point
├── types/
│   └── cafe.ts                 # TypeScript domain types (MenuItem, Chain, Macros, Category, Allergen, etc.)
└── utils/
    └── macroCalculator.ts      # Customization macro calculation logic
```

### Style System Observations
- **Tailwind CSS Version**: v4.3.3 via `@tailwindcss/vite`. `@import "tailwindcss";` in `src/index.css`.
- **Custom Dark Variant**: Configured in `src/index.css` as `@custom-variant dark (&:where(.dark, .dark *));`.
- **Theme Mode State**: Managed at root `App.tsx` (`isDarkMode` boolean state). Toggles the `.dark` class on `document.documentElement`.
- **Custom Glassmorphism Utilities**: `.glass-panel` class defined in `src/index.css`:
  - Light mode: `background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(16px);`
  - Dark mode: `background: rgba(28, 25, 23, 0.96); backdrop-filter: blur(16px);`

---

## 2. Component Mapping & Current Implementation

### 2.1 Navbar (`src/components/Navbar.tsx`)
- **Structure**: Sticky container (`sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800`). Height: `h-20`.
- **Left Section**:
  - Logo icon: `Coffee` icon inside a rounded square with `bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400`.
  - Brand Title: "Kalori Cafe" (`text-xl font-black text-stone-950 dark:text-stone-50`).
  - Badge: "Zincir Rehberi" (`bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300`).
  - Subtitle Tagline: "Kafe Makro & Alerjen Takip Platformu".
- **Center Section**:
  - Global Search Input (`input` with `Search` icon on left, clear button `✕` on right when active). Bound to `searchQuery` and `setSearchQuery`. Light mode styles: `bg-stone-50 border-stone-300/70 text-stone-950 placeholder-stone-400`.
- **Right Section**:
  - **Alerji Profili** button: Triggers `onOpenAllergenModal`. Shows allergen count badge if active.
  - **Karşılaştır** button: Triggers `onOpenCompareModal`. Displays count badge (`compareCount`). Disabled if 0.
  - **Sepetim** button: Triggers `onOpenBasketDrawer`. Gradient `from-amber-600 to-amber-500`. Shows total calories (`totalBasketCalories` kcal).
  - **Theme Toggle** button: Switches `isDarkMode` state with tooltips "Açık Moda Geç" / "Koyu Moda Geç".

### 2.2 Hero Section (`src/components/Hero.tsx`)
- **Structure**: Top container inside `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2`.
- **Banner Card**: `rounded-3xl bg-gradient-to-b from-stone-50/90 via-white to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-stone-200/90 dark:border-stone-800`.
- **Top Badge**: `Sparkles` icon + "Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası".
- **Main Heading**: "Sevdiğin Kahvenin Kalorisini & Alerjenlerini Keşfet" with gradient highlight on second line (`from-amber-600 via-orange-600 to-amber-700`).
- **Subtitle**: "Starbucks, Espressolab, Caffè Nero, Coffy, Kahve Dünyası ve daha fazlası... Süt türü, boyut ve şuruba göre anlık makro hesabı yapın, glüten ve laktoz risklerini önceden görün."
- **4 Feature Highlight Cards**:
  1. `10+ Kafe Zinciri` (`Zap` icon, amber tint)
  2. `Anlık Özelleştirici` (`Flame` icon, blue tint)
  3. `Alerjen Profil Filtresi` (`ShieldCheck` icon, red tint)
  4. `Günlük Makro Sepet` (`HeartPulse` icon, emerald tint)

### 2.3 Popular Searches Pills (Inside `Hero.tsx`)
- **Current Rendering**: 8 quick action pill buttons located at the bottom of `Hero.tsx`.
- **Current Color Palette (Need Redesign)**:
  - Starbucks: `bg-emerald-700 text-white`
  - Espressolab: `bg-stone-950 text-white`
  - Caffè Nero: `bg-blue-900 text-white`
  - Coffy: `bg-yellow-400 text-stone-950`
  - 🌾 Glutensiz Seçenekler: `bg-amber-600 text-white`
  - 🧊 Soğuk Kahveler: `bg-cyan-700 text-white`
  - 💪 Yüksek Protein: `bg-indigo-600 text-white`
  - ☕ Türk Kahvesi: `bg-amber-900 text-white`
- **Current Defect / Redesign Need**: High visual clutter due to inconsistent, bright rainbow colors (emerald, deep blue, bright yellow, cyan, indigo). Needs a cohesive **Milk / Coffee / Espresso / Black** theme palette with subtle border outlines and high-contrast typography.

### 2.4 Cafe Chains Selection Component (`src/components/ChainSelector.tsx`)
- **Header**: `Layers` icon + Title "Kafe Zincirleri (10 Popüler Marka)" + "Tüm Zincirleri Göster" link button when a chain filter is active.
- **Horizontal Scrollable List**: `flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none`.
- **Items**:
  - `☕ Tüm Kafeler` pill (`selectedChainId === null`). Count badge showing total item count.
  - Chain Pills mapped from `CHAINS`:
    - Displays logo (favicons or text logo), chain name, and item count badge for that specific chain.
    - Active state: `bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100`.
    - Inactive state: `bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200`.

---

## 3. State Management & Prop Drilling Flow

All state is centrally managed in `src/App.tsx`.

```
                        [App.tsx (Root Orchestrator State)]
                                        │
     ┌──────────────────┬───────────────┼───────────────┬────────────────┐
     ▼                  ▼               ▼               ▼                ▼
[Navbar]             [Hero]     [ChainSelector] [DietaryFilterBar] [SortAndAnalyticsBar]
- searchQuery        - quick    - selectedChainId - selectedCategory - sortBy
- userAllergens        filters  - chainCounts   - selectedDietaryTags - showOnlyFavorites
- hideAllergens                 - totalCount    - isOnlyDrinks   - favoriteCount
- compareCount                                  - isOnlyFood
- totalBasketCalories                           - resetAllFilters
- isDarkMode
```

### State Variables & Handlers Summary
1. `searchQuery` (`string`): Filters menu items by name, English name, chain name, description, or dietary tag strings.
2. `selectedChainId` (`string | null`): Filters items by `item.chainId`.
3. `selectedCategory` (`Category | 'all'`): Filters items by item category (`espresso_hot`, `espresso_iced`, `cold_brew`, etc.).
4. `selectedDietaryTags` (`DietaryPreference[]`): Filters items matching all selected dietary preferences (e.g. `vegan`, `gluten_free`, `high_protein`, `low_calorie`).
5. `isOnlyDrinks` / `isOnlyFood` (`boolean`): Filters items by `item.isDrink`.
6. `sortBy` (`SortOption`): Sorts filtered results by `cal_asc`, `protein_desc`, `sugar_asc`, `fat_asc`, or `caffeine_desc`.
7. `showOnlyFavorites` (`boolean`): Filters menu items present in `favorites` array.
8. `userAllergens` (`Allergen[]`) & `hideAllergens` (`boolean`): Hides items containing user specified allergens when hide mode is active.
9. `filteredItems` (`useMemo`): Central derived list computed on any filter state change. Passed down to `<ItemCard />` grid.

---

## 4. Redesign Target Audit — Minimal & Lüks Redesign

### 4.1 Design Vision: Minimal & Lüks (Süt / Kahve / Siyah)
- **Primary Aesthetic**: Warm porcelain milk tones, deep espresso obsidian blacks, refined mocha browns, subtle cream borders, clean typography, high contrast readability.
- **Color Tokens Strategy for Tailwind CSS v4**:
  - **Milk / Cream (Süt / Kırık Beyaz)**:
    - Backgrounds: `bg-[#FAF8F5]` / `bg-[#FDFBF7]` (Milk porcelain), `bg-white`.
    - Borders: `border-[#E8E2D9]` / `border-stone-200/70`.
  - **Coffee / Mocha (Kahve / Vizon)**:
    - Primary Accents: `bg-[#5C4033]` (Espresso), `bg-[#795548]` (Roasted Coffee), `text-[#8C6239]` (Warm Mocha).
    - Light Accents: `bg-[#F4EFEA]` (Latte Foam), `bg-[#EFE6DC]`.
  - **Black / Obsidian (Siyah / Koyu Odun)**:
    - Dark mode backgrounds: `dark:bg-[#12100E]` (Obsidian), `dark:bg-[#1A1714]` (Dark Roasted Bean).
    - High-contrast text: `text-[#1C1917]` (Light mode primary text), `dark:text-[#F5F2EB]` (Dark mode primary text).

### 4.2 File Modification Checklist

| Component File | Role / Elements Needing Modification | Minimal & Lüks Redesign Specifics |
|---|---|---|
| `src/index.css` | Global styles, Tailwind v4 imports, `.glass-panel` | Define custom color CSS variables / custom utilities for Milk (`#FAF8F5`), Espresso (`#2C221E`), and Coffee (`#6F4E37`). Refine scrollbars & glass panel backdrops. |
| `src/components/Navbar.tsx` | Header container, Logo badge, Search bar, Action buttons | Replace bright orange/amber logo gradient (`bg-gradient-to-tr from-amber-600...`) with refined espresso/coffee gradient (`from-[#2C221E] via-[#4A3525] to-[#6F4E37]`). Update logo tag badge to warm cream/milk styling. Redesign search input with sleek warm stone border and crisp text contrast. Refine action buttons (`Alerji Profili`, `Karşılaştır`, `Sepetim`) to minimal monochrome/coffee tone styling. |
| `src/components/Hero.tsx` | Hero banner container, Main heading, Feature cards, Popular Searches pills | 1. Replace multi-colored rainbow search pills (green, blue, yellow, cyan, indigo) with elegant Milk/Coffee/Espresso minimalist pills with crisp borders (`border-[#E5DEC9]`, `bg-[#F5F0EB] hover:bg-[#2C221E] hover:text-white`).<br>2. Update main container background to soft porcelain cream gradient (`from-[#FAF8F5] via-white to-white dark:from-[#141210] dark:to-[#1A1714]`).<br>3. Refine 4 feature highlight cards with unified coffee/mocha icon badges instead of rainbow colors. |
| `src/components/ChainSelector.tsx` | Cafe chain pills & active selection states | Update active chain pill style to sleek espresso black (`bg-[#2C221E] text-white dark:bg-[#F5F0EB] dark:text-[#1A1714]`). Refine inactive chain pills with soft porcelain background and warm stone hover borders. |
| `src/components/DietaryFilterBar.tsx` | Category tabs, drink/food switcher, dietary preference pills | Update active category tab from bright orange `bg-amber-500` to sophisticated coffee brown (`bg-[#5C4033]` or `bg-[#2C221E]`). Update dietary preference pills (`Glutensiz`, `Laktozsuz`, `Vegan`, etc.) to clean minimalist coffee-tinted badges. |
| `src/components/SortAndAnalyticsBar.tsx` | Sort select box, Smart swap button, Favorites button | Replace bright emerald `Smart Swap` button with refined espresso/gold accent button. Refine sort select input styling. |
| `src/components/ItemCard.tsx` | Product cards grid, macro badge container, action buttons | Align macro pill backgrounds (Kalori, Protein, Karb, Yağ) with clean high-contrast neutral milk & mocha styling. Refine action buttons (`Özelleştir`, `Sepete Ekle`, `Karşılaştır`). |

---

## 5. Component Dependency Graph

```
[main.tsx]
   └── [App.tsx]
        ├── [Navbar.tsx]
        │    ├── (Lucide Icons: Coffee, Search, ShieldAlert, Scale, ShoppingBag, Sun, Moon)
        │    └── (Types: Allergen)
        │
        ├── [Hero.tsx]
        │    └── (Lucide Icons: Sparkles, Zap, Flame, ShieldCheck, HeartPulse)
        │
        ├── [ChainSelector.tsx]
        │    ├── (Lucide Icons: Layers)
        │    ├── (Data: CHAINS)
        │    └── (Types: Chain)
        │
        ├── [DietaryFilterBar.tsx]
        │    ├── (Lucide Icons: Filter, RotateCcw)
        │    └── (Types: Category, DietaryPreference)
        │
        ├── [SortAndAnalyticsBar.tsx]
        │    └── (Lucide Icons: ArrowUpDown, Star, Lightbulb)
        │
        ├── [ItemCard.tsx]
        │    ├── (Lucide Icons: SlidersHorizontal, Scale, Plus, ShieldAlert, Check, Flame, Zap, Star, FileText)
        │    ├── (Data: CHAINS)
        │    ├── (Utils: ALLERGEN_MAP)
        │    └── (Types: MenuItem, Allergen)
        │
        ├── [MobileBottomNav.tsx]
        │    └── (Lucide Icons: Search, Scale, ShoppingBag, Wand2)
        │
        └── [Modals & Drawers]
             ├── AllergenSettingsModal.tsx
             ├── CompareModal.tsx
             ├── CustomizerModal.tsx
             ├── CustomRecipeBuilderModal.tsx
             ├── DailyBasketDrawer.tsx
             ├── MacroTargetCalculatorModal.tsx
             ├── NutritionLabelModal.tsx
             └── SmartSwapModal.tsx
```

---

## 6. Test Suite & E2E Assertion Safeguards

During read-only inspection of `tests/tier1-feature-coverage.ts`, we verified exact string & class assertions that **must be preserved or updated** during redesign to keep test suites passing:

1. **Navbar String Requirements**:
   - Must contain text `"Kalori Cafe"`
   - Must contain text `"Kafe Makro & Alerjen Takip Platformu"`
   - Must contain text `"Alerji Profili"`
   - Must contain text `"Karşılaştır"`
   - Must contain text `"Sepetim"`
   - Theme toggle title tooltips `"Açık Moda Geç"` / `"Koyu Moda Geç"`

2. **Hero String Requirements**:
   - Must contain text `"Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası"`
   - Must contain title `"Sevdiğin Kahvenin Kalorisini &"` and `"Alerjenlerini Keşfet"`
   - Must contain key chain names `"Starbucks"`, `"Espressolab"`, `"Caffè Nero"`, `"Coffy"`
   - Must contain feature card titles `"10+ Kafe Zinciri"`, `"Anlık Özelleştirici"`, `"Alerjen Profil Filtresi"`, `"Günlük Makro Sepet"`
   - Quick search pills text `"Glutensiz Seçenekler"`, `"Soğuk Kahveler"`, `"Yüksek Protein"`, `"Türk Kahvesi"`

3. **Build & Lint Commands**:
   - `npm run build` (`tsc -b && vite build`) must succeed with zero errors.
   - `npm run lint` (`oxlint`) must succeed cleanly.

---

## 7. Recommended Redesign Implementation Strategy

1. **Phase 1 — Color System & CSS Setup**:
   - Update `src/index.css` with clean milk/espresso/black color classes and refined glassmorphism styles.
2. **Phase 2 — Navbar Minimal Redesign**:
   - Upgrade logo, search input, and action buttons to high-contrast monochrome & espresso styling while preserving required test strings.
3. **Phase 3 — Hero Banner & Popular Search Pills Redesign**:
   - Strip multi-color background clutter from search pills (`emerald`, `blue`, `yellow`, `cyan`, `indigo`) and unify under a sleek Milk/Espresso palette (`bg-[#F7F4EF]`, `text-[#2C221E]`, `hover:bg-[#2C221E]`, `hover:text-white`).
4. **Phase 4 — Chain Selector & Dietary Bar Harmonization**:
   - Upgrade chain pills and category tab highlights to matching espresso/coffee active states.
5. **Phase 5 — Build & Test Verification**:
   - Run `npm run build` and `npm run test` to verify zero regressions.

---

**Report Authored By**: `teamwork_preview_explorer_survey_1`  
**Status**: Read-only Investigation Complete  
