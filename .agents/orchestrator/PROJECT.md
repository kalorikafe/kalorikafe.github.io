# Project: Kalori Cafe Light Mode Redesign & Popular Turkish Chains Menu Expansion

## Architecture
- React 19 + TypeScript + Vite + Tailwind CSS v4
- UI Components: `Navbar.tsx`, `Hero.tsx`, `ChainSelector.tsx`, `ItemCard.tsx`, `DietaryFilterBar.tsx`, `SortAndAnalyticsBar.tsx`, `App.tsx`
- Modals & Drawers: `CustomizerModal.tsx`, `CompareModal.tsx`, `DailyBasketDrawer.tsx`, `AllergenSettingsModal.tsx`, `SmartSwapModal.tsx`, `NutritionLabelModal.tsx`, `CustomRecipeBuilderModal.tsx`, `MacroTargetCalculatorModal.tsx`
- Data Layer: `src/data/chains.ts` (`CHAINS`), `src/data/items.ts` (`MENU_ITEMS`), `src/types/cafe.ts`
- Utility: `src/utils/macroCalculator.ts`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1 - Light Mode Navbar Redesign | Premium white/off-white header with high contrast text, refined search input, action buttons, theme toggle | M1 | R1 |
| 2 | R1 - Light Mode Hero Redesign | Premium white/off-white hero banner container, elevated typography, floating badge, 4 feature highlight cards, quick search pills | M1 | R1 |
| 3 | Quality - React Hooks Lint Fix | Move useState hooks above early returns in CustomRecipeBuilderModal, MacroTargetCalculatorModal, CustomizerModal | M1 | Code Survey |
| 4 | R2 - Top Turkish Coffee Chains | Updated CHAINS catalog with 10 popular chains (Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear, Arabica, Gloria Jean's, David People, Tchibo) | M2 | R2 |
| 5 | R3 - items.ts Expansion (>=40 items/chain) | Comprehensive menu dataset with >=40 realistic items per chain (>=400 total items) with complete macros, allergens, dietary tags | M2 | R3 |
| 6 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite for UI rendering, chain filtering, items schema, macro values accuracy, and build/lint verification | M3 | Project Spec |
| 7 | Adversarial Hardening (Tier 5) | White-box adversarial testing, edge case verification, macro integrity, data validation | M4 | Project Spec |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI Redesign & Lint Cleanup | Redesign Navbar & Hero for Light Mode; Fix React hook ordering in modals | None | PLANNED |
| M2 | Turkish Coffee Chains & Menu Data Expansion | Update `chains.ts` with top 10 chains; populate `items.ts` with >=40 items per chain (400+ total items) | None | PLANNED |
| M3 | E2E Testing Track | Build test runner and test cases (Tiers 1-4) for full feature coverage | None | PLANNED |
| M4 | Final Integration & Tier 5 Hardening | Verify 100% E2E test pass + adversarial coverage hardening | M1, M2, M3 | PLANNED |

## Interface Contracts
### Data Layer ↔ UI Components
- `CHAINS`: Array of `Chain` items (`id`, `name`, `logo`, `color`, `badgeColor`, `accentBg`, `description`).
- `MENU_ITEMS`: Array of `MenuItem` items (`id`, `chainId`, `name`, `category`, `description`, `image`, `isDrink`, `baseMacros`, `allergens`, `dietaryTags`, `smartSwapNote`, `smartSwapSaveKcal`).
- `chainCounts`: `Record<string, number>` dynamically computed from `MENU_ITEMS` where `MENU_ITEMS.filter(item => item.chainId === chain.id).length >= 40`.

## Code Layout
- `src/components/Navbar.tsx` — Owned by M1 Worker
- `src/components/Hero.tsx` — Owned by M1 Worker
- `src/components/CustomRecipeBuilderModal.tsx` — Owned by M1 Worker
- `src/components/MacroTargetCalculatorModal.tsx` — Owned by M1 Worker
- `src/components/CustomizerModal.tsx` — Owned by M1 Worker
- `src/data/chains.ts` — Owned by M2 Worker
- `src/data/items.ts` — Owned by M2 Worker
