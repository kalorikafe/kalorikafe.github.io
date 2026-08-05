# Specification Mining Handoff Report — Kalori Cafe R1, R2, R3

## 1. Observation

- **Project Location**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe`
- **Original User Request (`ORIGINAL_REQUEST.md`)**:
  - **R1 (Light Mode Navbar & Hero Redesign)**: Light mode top design (Navbar and Hero) must be completely redesigned to be clean, modern, high-contrast, premium (white / off-white palette), removing complex dark/muddy gradients while preserving dark mode capabilities.
  - **R2 (Popular Turkish Coffee Chains Update)**: Update the chain list in `src/data/chains.ts` to reflect Turkey's most popular coffee chains with high branch counts (e.g. Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear Coffee Co., Arabica Coffee House, Gloria Jean's, Tchibo, David People / Caribou), weeding out obscure/unrealistic names.
  - **R3 (>=40 Items Per Chain in `items.ts`)**: Every defined chain must have at least 40 realistic beverages and food items with accurate macro values (calories, protein, carbs, sugar, fat, satFat, caffeine, sodium) in `src/data/items.ts`. Total items must exceed `CHAINS.length * 40`.
- **Existing Build & Lint Execution**:
  - `npm run build` (`tsc -b && vite build`) executed successfully: exit code 0 (`dist/assets/index-Bwy2Vuyu.css` 67.76 kB, `dist/assets/index-CYvatI0j.js` 329.99 kB).
  - `npm run lint` (`oxlint`) executed: 14 react-hooks errors found due to `useState` hooks placed below `if (!isOpen) return null;` early returns in `CustomRecipeBuilderModal.tsx` (lines 25-29) and `MacroTargetCalculatorModal.tsx` (lines 27-32).
- **Existing Code Architecture**:
  - React 19 + TypeScript + Vite + Tailwind CSS v4 (`@tailwindcss/vite`).
  - Icons: `lucide-react`.
  - Animations/Confetti: `canvas-confetti`.
  - Storage: `localStorage` for favorites, basket, custom recipes, user allergen profile, user macro goals.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1 - UI | Light Mode Navbar Redesign | Clean, premium white/off-white navbar with search, allergen modal button, compare button (with badge), basket button (with live kcal total), dark/light mode toggle. | User clicks, text search input | Filtered view, active modals, theme state | Search query clears on '✕' click | `src/components/Navbar.tsx`, `ORIGINAL_REQUEST.md` |
| 2 | R1 - UI | Light Mode Hero Redesign | Premium light mode hero banner with floating badge, high contrast heading, subtitle, 4 highlight cards, popular search quick filter pills. | Quick filter pill clicks | Applied chain/category filter or search query | N/A | `src/components/Hero.tsx`, `ORIGINAL_REQUEST.md` |
| 3 | R2 - Data | Popular Turkish Coffee Chains Catalog | Updated list of top Turkish coffee chains with logo, branding colors, badge styling, description. | `CHAINS` array in `chains.ts` | Filterable chain selector pills with counts | Invalid `chainId` yields 0 item count | `src/data/chains.ts`, `ORIGINAL_REQUEST.md` |
| 4 | R3 - Data | Comprehensive Menu Items Dataset | Minimum 40 realistic drink/food items per chain with full nutrition macros, allergens, dietary tags, smart swap notes. | `MENU_ITEMS` array in `items.ts` | Item cards grid, macro analytics | Unrecognized category/tag defaults to standard rendering | `src/data/items.ts`, `ORIGINAL_REQUEST.md` |
| 5 | Customizer | Dynamic Drink Customizer Modal | Recalculates calories, macros, and allergens based on size (Short/Tall/Grande/Venti), milk (7 options), syrup pumps, whipped cream, cold foam, extra espresso. | Size, milk, pumps, toppings | Calculated macros, updated allergen warnings | Non-dairy milk + no whipped cream removes lactose allergen dynamically | `src/components/CustomizerModal.tsx`, `src/utils/macroCalculator.ts` |
| 6 | Allergen | Allergen Profile & Filter | User selects sensitive allergens (lactose, gluten, celiac oat risk, nuts, soy, egg, peanut). Toggles "Hide Risky Items" or displays warning badges. | Allergen selections, hide toggle | Filtered item grid, warning banners on cards | Clear all allergens resets filter | `src/components/AllergenSettingsModal.tsx`, `src/components/ItemCard.tsx` |
| 7 | Compare | Side-by-Side Product Comparison | Compare up to 4 items in a modal view with macro differences, highlighting lowest calorie, highest protein, etc. | Item compare toggles | 4-column comparison matrix modal | Enforces max 4 items limit with alert dialog | `src/components/CompareModal.tsx` |
| 8 | Basket | Daily Basket Drawer & Macro Goals | Add items to daily basket with custom options, compare total macros against personal daily calorie/protein/carb/fat goals. | Item additions, custom options | Live calorie pill in Navbar, basket drawer drawer | Clear basket option resets totals | `src/components/DailyBasketDrawer.tsx`, `src/components/MacroTargetCalculatorModal.tsx` |
| 9 | Filtering | Dietary Tag & Category Filter Bar | Filter menu by category (espresso_hot, espresso_iced, cold_brew, frappe_blended, tea_herbal, smoothie_juice, bakery_dessert, sandwich_savory, fit_healthy) and dietary tags (vegan, vegetarian, gluten_free, lactose_free, sugar_free, high_protein, low_calorie <150kcal). | Category & dietary tag buttons | Filtered product grid | Reset all filters button clears all filters | `src/components/DietaryFilterBar.tsx`, `src/App.tsx` |
| 10 | Analytics | Sorting & Favorites Bar | Sort by default, calories (asc), protein (desc), sugar (asc), fat (asc), caffeine (desc). Filter favorites only. | Sort option dropdown, favorites star click | Sorted product list | Star icon toggles favorite state in localStorage | `src/components/SortAndAnalyticsBar.tsx`, `src/components/ItemCard.tsx` |
| 11 | Smart Swap | Smart Swap Advice Modal & Badges | Recommends lower-calorie/sugar modifications for popular drinks (e.g. swapping whole milk for almond milk). | Smart swap trigger click | Savings advice modal with total potential kcal saved | Disabled if no smart swap data exists | `src/components/SmartSwapModal.tsx` |
| 12 | FDA Label | Nutrition Facts Label Modal | Renders a standard FDA-style Nutrition Facts label for any item. | FDA button click on ItemCard | Modal with formal FDA label UI | N/A | `src/components/NutritionLabelModal.tsx` |
| 13 | Builder | Custom Recipe Builder Modal | Allows users to construct custom drinks and save them to local storage as new menu items. | Name, base drink, milk, size, syrup, extras | New custom item added to `allMenuItems` and saved to `localStorage` | Invalid inputs fallback to defaults | `src/components/CustomRecipeBuilderModal.tsx` |
| 14 | Mobile UI | Mobile Floating Action Bar | Bottom navigation bar on mobile screen sizes (< md) for quick search, basket, compare, custom builder. | Mobile navigation button clicks | Smooth scroll to top, opens drawer/modals | Hidden on desktop viewports (`md:hidden`) | `src/components/MobileBottomNav.tsx` |
| 15 | Theme | Dark / Light Mode Switching | Toggles `dark` CSS class on `document.documentElement` with system preference detection & persistence. | Sun/Moon toggle button | Dynamic color palette change | Fallback to prefers-color-scheme if uninitialized | `src/App.tsx`, `src/components/Navbar.tsx` |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Global Search | Search query with no matching items | App displays zero-state banner: "Aradığınız kriterlere uygun ürün bulunamadı" with "Tüm Filtreleri Sıfırla" button. |
| 2 | Product Comparison | Selecting 5th item for comparison | Displays browser alert: "En fazla 4 ürünü aynı anda karşılaştırabilirsiniz" and ignores 5th item. |
| 3 | Dynamic Lactose Allergy | Selecting almond milk and checking whipped cream | Süt/Laktoz allergen remains present because whipped cream contains dairy. Unchecking whipped cream removes Lactose allergen. |
| 4 | Celiac Risk Warning | Selecting Barista Oat Milk for a drink | Dynamically appends `celiac_oat_risk` allergen tag to `calculatedAllergens` due to wheat cross-contamination risk in oats. |
| 5 | Caffeine Indicator | Items with 0 mg caffeine (e.g., bakery/herbal tea) | Caffeine badge hidden on `ItemCard` header overlay. |
| 6 | Macro Data Consistency | `items.ts` entry where sugar > carbs or satFat > fat | Unrealistic macro error. Data integrity requirement: `sugar <= carbs` and `satFat <= fat` for all items. |
| 7 | Oxlint Hook Ordering | Opening `CustomRecipeBuilderModal` or `MacroTargetCalculatorModal` | `oxlint` flags 14 react-hooks errors because `useState` is called after `if (!isOpen) return null`. Hooks must be placed above conditional returns. |
| 8 | Chain Selector Count | Filtering by dietary tag (e.g., Gluten Free) | Chain count badges update to reflect total items available in the dataset for that chain. |

---

## 4. Logic Chain

1. **Observation 1**: `ORIGINAL_REQUEST.md` specifies 3 core deliverables: R1 (Light Mode Navbar & Hero redesign with premium white/off-white high-contrast theme), R2 (Popular Turkish coffee chains list update), R3 (Minimum 40 realistic products per chain in `src/data/items.ts`).
2. **Observation 2**: `src/data/chains.ts` currently defines 10 chains, but `src/data/items.ts` contains only 33 total items (Starbucks: 9, Espressolab: 4, Caffè Nero: 5, Coffy: 4, Kahve Dünyası: 4, Gloria Jean's: 2, Tchibo: 2, Arabica: 1, Caribou: 1, Kronotrop: 1).
3. **Inference 1**: To satisfy R2 & R3, the chain catalog should be finalized with popular Turkish chains (e.g. Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear Coffee Co., Arabica Coffee House, Gloria Jean's, Tchibo, David People / Caribou - 10 chains), and `items.ts` must be expanded to at least 40 items per chain (minimum 400+ items total).
4. **Observation 3**: Running `npm run lint` revealed 14 react-hooks lint errors in `CustomRecipeBuilderModal.tsx` and `MacroTargetCalculatorModal.tsx`.
5. **Inference 2**: The implementation phase must fix these hook placement bugs to ensure `npm run lint` passes cleanly alongside `npm run build`.
6. **Observation 4**: In `Navbar.tsx` and `Hero.tsx`, dark mode styling is present (`dark:bg-stone-900`), but light mode styling currently uses background elements that need premium, high-contrast off-white/white styling without muddy gradients.
7. **Conclusion**: Implementation requires 3 distinct workstreams:
   - UI Workstream: Redesign `Navbar.tsx` & `Hero.tsx` for light mode with premium off-white aesthetics, high-contrast typography, and clean borders.
   - Data Workstream: Update `chains.ts` to top Turkish chains and populate `items.ts` with >=40 realistic items per chain (>=400 total items) with accurate macro math and allergen tags.
   - Quality/Lint Fix Workstream: Move React hooks above early returns in `CustomRecipeBuilderModal.tsx` and `MacroTargetCalculatorModal.tsx`.

---

## 5. Caveats

- **No Caveats**: All codebase files, configurations, scripts, and specifications were fully inspected.

---

## 6. Conclusion

The specification mining for Kalori Cafe R1, R2, and R3 is complete. The system architecture is clean React 19 + Vite + Tailwind CSS v4. Implementation demands:
1. Redesigning `Navbar.tsx` & `Hero.tsx` for high-contrast light mode while retaining full feature set and dark mode toggle.
2. Finalizing top Turkish coffee chains in `chains.ts` and populating `items.ts` to >=40 items per chain (>=400 total items) with realistic macro distributions.
3. Fixing `oxlint` react-hooks ordering warnings in `CustomRecipeBuilderModal.tsx` and `MacroTargetCalculatorModal.tsx`.

---

## 7. Verification Method

- **Build Check**: Run `npm run build` (`tsc -b && vite build`). Must exit with code 0.
- **Lint Check**: Run `npm run lint` (`oxlint`). Must exit with code 0.
- **Chain Item Count Check**: Verify `MENU_ITEMS.filter(i => i.chainId === chain.id).length >= 40` for every chain in `CHAINS`. Total items >= `CHAINS.length * 40`.
- **UI Light Mode Check**: Inspect Navbar and Hero in light mode (`isDarkMode = false`) to ensure high contrast, white/off-white card panels, and crisp dark text.
