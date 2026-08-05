# Project: Kalori Cafe Minimal & Lüks Redesign & Data Expansion

## Architecture
- **Framework**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **State Management**: Centralized state in `App.tsx` (`searchQuery`, `selectedChainId`, `selectedCategory`, `selectedDietaryTags`, `isOnlyDrinks`, `isOnlyFood`, `sortBy`, `userAllergens`, `favoriteIds`, `compareIds`, `basketItems`, `isDarkMode`).
- **Data Flow**: `chains.ts` & `items.ts` → `App.tsx` memoized `filteredItems` → UI components (`Navbar`, `Hero`, `ChainSelector`, `DietaryFilterBar`, `SortAndAnalyticsBar`, `ItemCard`).

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Navbar Redesign | Minimal & Lüks light/dark mode header, logo, search, action buttons | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 2 | Hero & Entry Section Redesign | Porcelain milk/espresso/coffee palette, high contrast, clean typography | M1 | ORIGINAL_REQUEST §R1 (2026-08-05) | DONE |
| 3 | Popular Searches Pills Redesign | Replace rainbow colors with minimal Milk/Coffee/Black buttons | M1 | ORIGINAL_REQUEST §R1 (2026-08-05) | DONE |
| 4 | Chain Selector & Filter Redesign | Minimal luxury styling for chain pills | M1 | ORIGINAL_REQUEST §R1 (2026-08-05) | DONE |
| 5 | Functionality Preservation | Retain search, diet filter, chain selection, allergens, compare, basket | M1 | ORIGINAL_REQUEST §R3 (2026-08-05) | DONE |
| 6 | Popular Chains Update | Add Coffy, Mackbear, David People; refine Turkish chain catalog | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 7 | Menu Items Catalog | 199 mevcut ürün (zincir başına 19–20); kaynaklı genişletme bekliyor | M2 | ORIGINAL_REQUEST §R3 | PARTIAL |
| 8 | Description Search Keywords | Add authentic descriptions including keywords like 'narenciye' | M2 | E2E Test Requirement | DONE |
| 9 | Build & Test Suite | TypeScript build, Vitest unit ve gerçek Playwright Chromium akışları | M3 | Acceptance Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Minimal & Lüks UI Redesign | Redesign Navbar, Hero, Popular Search Pills, Chain Selector, Dietary Filter Bar with Milk/Espresso/Coffee palette in Light & Dark modes while preserving all functionality. | None | DONE |
| 2 | M2: Chains Catalog & Menu Items Expansion | 10 zincir ve 199 ürün mevcut; doğrulanmış kaynak/provenance eklenmeden yapay genişletme yapılmayacak. | None | PARTIAL |
| 3 | M3: E2E Integration & Verification | Vitest golden macro testleri, Playwright Chromium kritik akışları, lint ve build. Eski 67 test yalnız legacy. | M1 | DONE |

## Interface Contracts
### Data ↔ UI Component Contract
- `Chain` object in `chains.ts`: `{ id, name, logo, color, banner, popular, branchCount, description }`
- `MenuItem` object in `items.ts`: `{ id, name, chainId, category, price, macros: { calories, protein, carbs, sugar, fat, satFat, caffeine, sodium }, dietaryTags, allergens, description, isDrink, popular }`

## Code Layout
- `src/index.css`: Global Tailwind CSS v4 import, custom variants, glass panels
- `src/components/Navbar.tsx`: Top header navigation bar
- `src/components/Hero.tsx`: Hero section & popular quick search pills
- `src/components/ChainSelector.tsx`: Horizontal chain selection bar
- `src/components/DietaryFilterBar.tsx`: Category tabs & dietary preference pills
- `src/components/SortAndAnalyticsBar.tsx`: Sorting & view toggle
- `src/components/ItemCard.tsx`: Individual item display card
- `src/data/chains.ts`: Coffee chain definitions
- `src/data/items.ts`: Menu item dataset
