# Worker M1 Handoff & Implementation Plan Report

- **Agent ID**: explorer_m1_r1
- **Working Directory**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\explorer_m1_r1`
- **Target Project**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe`
- **Target Worker**: Worker M1
- **Timestamp**: 2026-08-05T01:47:00Z

---

## 1. Observation

### 1.1 Current Codebase & Build Verification
- **Build Status**: Running `npm run build` (`tsc -b && vite build`) completes with **Exit Code 0** (0 errors).
- **Linter Status**: Running `npm run lint` (`oxlint`) fails with **Exit Code 1** with **14 react-hooks errors** across 3 modal components.

### 1.2 Verbatim Oxlint Findings (14 React-Hooks Errors)
1. `src/components/CustomRecipeBuilderModal.tsx`:
   - Line 20: `if (!isOpen) return null;` precedes 7 `useState` hook calls:
     - Line 22: `recipeName` (`useState<string>('Benim Özel Kahvem')`)
     - Line 24: `sizeId` (`useState<string>('tall')`)
     - Line 25: `milkId` (`useState<string>('almond_milk')`)
     - Line 26: `syrupPumps` (`useState<number>(1)`)
     - Line 27: `hasWhippedCream` (`useState<boolean>(false)`)
     - Line 28: `hasColdFoam` (`useState<boolean>(false)`)
     - Line 29: `extraEspressoShots` (`useState<number>(1)`)
   - *Total in CustomRecipeBuilderModal*: **7 errors**.

2. `src/components/MacroTargetCalculatorModal.tsx`:
   - Line 25: `if (!isOpen) return null;` precedes 6 `useState` hook calls:
     - Line 27: `gender` (`useState<'male' | 'female'>('male')`)
     - Line 28: `age` (`useState<number>(25)`)
     - Line 29: `weightKg` (`useState<number>(70)`)
     - Line 30: `heightCm` (`useState<number>(175)`)
     - Line 31: `activity` (`useState<number>(1.375)`)
     - Line 32: `goalType` (`useState<'lose' | 'maintain' | 'gain'>('lose')`)
   - *Total in MacroTargetCalculatorModal*: **6 errors**.

3. `src/components/CustomizerModal.tsx`:
   - Line 18: `if (!item) return null;` precedes 1 `useState` hook call:
     - Line 20: `customization` (`useState<CustomizationState>(...)`)
   - *Total in CustomizerModal*: **1 error**.

### 1.3 Light Mode Aesthetics Assessment
1. `src/components/Navbar.tsx`:
   - Current header uses `bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm`.
   - Global search input relies on `bg-stone-100` without sharp border definition or focus state contrast.
   - Action buttons and theme toggle use plain `bg-stone-100` without premium depth or elevated borders.

2. `src/components/Hero.tsx`:
   - Outer card container uses `bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/15 border border-amber-500/30`.
   - In Light Mode, this orange/amber gradient tint creates a muddy yellowish background behind white cards, violating Requirement R1.
   - Top floating badge uses low-contrast `bg-amber-500/20 text-amber-900`.
   - 4 Feature highlight cards lack refined card border/shadow depth in Light Mode.

---

## 2. Logic Chain

1. **React Rules of Hooks**:
   - In React, Hooks must be called unconditionally on every render in the exact same order.
   - In `CustomRecipeBuilderModal.tsx`, `MacroTargetCalculatorModal.tsx`, and `CustomizerModal.tsx`, placing conditional early returns (`if (!isOpen) return null;` or `if (!item) return null;`) before `useState` causes hooks to be conditionally skipped when closed.
   - Moving all `useState` calls above the early return statements ensures 100% compliance with `react-hooks/rules-of-hooks` and resolves all 14 oxlint errors.
   - For `CustomizerModal.tsx`, moving `useState` above `if (!item) return null;` requires using optional chaining (`item?.defaultSizeId`) in state initialization and syncing state via `useEffect` when `item` changes.

2. **Navbar & Hero Light Mode Redesign (Requirement R1)**:
   - Replacing the muddy `from-amber-500/15` hero gradient with a crisp, premium white/off-white background card (`bg-gradient-to-b from-stone-50/90 via-white to-white` with `border-stone-200/90` and `shadow-xl shadow-stone-200/50`) delivers an elevated, high-contrast aesthetic.
   - Upgrading `Navbar.tsx` background, search input, button hover states, badges, and dark mode toggle improves typography contrast, focus accessibility, and visual polish.

---

## 3. Caveats

- **Read-Only Scope**: This report is an investigation and implementation specification. No edits have been made to `src/` by this explorer agent.
- **Worker Ownership**: Worker M1 will execute the changes in `src/components/Navbar.tsx`, `src/components/Hero.tsx`, `src/components/CustomRecipeBuilderModal.tsx`, `src/components/MacroTargetCalculatorModal.tsx`, and `src/components/CustomizerModal.tsx`.

---

## 4. Conclusion & Line-by-Line Implementation Plan for Worker M1

### Task 1: Fix 14 Oxlint React-Hooks Errors

#### 1.1 Update `src/components/CustomRecipeBuilderModal.tsx`
Move lines 22-29 above line 20 (`if (!isOpen) return null;`):

**Target Code Modification**:
```tsx
// BEFORE (Lines 19-30):
export const CustomRecipeBuilderModal: React.FC<CustomRecipeBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomRecipe,
}) => {
  if (!isOpen) return null;

  const [recipeName, setRecipeName] = useState<string>('Benim Özel Kahvem');
  const baseCategory: Category = 'espresso_iced';
  const [sizeId, setSizeId] = useState<string>('tall');
  const [milkId, setMilkId] = useState<string>('almond_milk');
  const [syrupPumps, setSyrupPumps] = useState<number>(1);
  const [hasWhippedCream, setHasWhippedCream] = useState<boolean>(false);
  const [hasColdFoam, setHasColdFoam] = useState<boolean>(false);
  const [extraEspressoShots, setExtraEspressoShots] = useState<number>(1);

// AFTER:
export const CustomRecipeBuilderModal: React.FC<CustomRecipeBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomRecipe,
}) => {
  const [recipeName, setRecipeName] = useState<string>('Benim Özel Kahvem');
  const [sizeId, setSizeId] = useState<string>('tall');
  const [milkId, setMilkId] = useState<string>('almond_milk');
  const [syrupPumps, setSyrupPumps] = useState<number>(1);
  const [hasWhippedCream, setHasWhippedCream] = useState<boolean>(false);
  const [hasColdFoam, setHasColdFoam] = useState<boolean>(false);
  const [extraEspressoShots, setExtraEspressoShots] = useState<number>(1);

  if (!isOpen) return null;

  const baseCategory: Category = 'espresso_iced';
```

#### 1.2 Update `src/components/MacroTargetCalculatorModal.tsx`
Move lines 27-32 above line 25 (`if (!isOpen) return null;`):

**Target Code Modification**:
```tsx
// BEFORE (Lines 19-33):
export const MacroTargetCalculatorModal: React.FC<MacroTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  userGoals: _userGoals,
  onSaveGoals,
}) => {
  if (!isOpen) return null;

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [activity, setActivity] = useState<number>(1.375); // 1-3 days sport
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('lose');

// AFTER:
export const MacroTargetCalculatorModal: React.FC<MacroTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  userGoals: _userGoals,
  onSaveGoals,
}) => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [activity, setActivity] = useState<number>(1.375); // 1-3 days sport
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('lose');

  if (!isOpen) return null;
```

#### 1.3 Update `src/components/CustomizerModal.tsx`
Move state declaration above line 18 (`if (!item) return null;`), add optional chaining for initialization, and sync state via `useEffect` when `item` changes:

**Target Code Modification**:
```tsx
// BEFORE (Lines 13-28):
export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  item,
  onClose,
  onAddToBasket,
}) => {
  if (!item) return null;

  const [customization, setCustomization] = useState<CustomizationState>({
    sizeId: item.defaultSizeId || 'tall',
    milkId: item.defaultMilkId || 'whole_milk',
    syrupPumps: item.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  });

// AFTER:
export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  item,
  onClose,
  onAddToBasket,
}) => {
  const [customization, setCustomization] = useState<CustomizationState>({
    sizeId: item?.defaultSizeId || 'tall',
    milkId: item?.defaultMilkId || 'whole_milk',
    syrupPumps: item?.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  });

  React.useEffect(() => {
    if (item) {
      setCustomization({
        sizeId: item.defaultSizeId || 'tall',
        milkId: item.defaultMilkId || 'whole_milk',
        syrupPumps: item.defaultSyrupPumps || 0,
        hasWhippedCream: false,
        hasColdFoam: false,
        extraEspressoShots: 0
      });
    }
  }, [item]);

  if (!item) return null;
```

---

### Task 2: Redesign `src/components/Navbar.tsx` for Light Mode

Update `src/components/Navbar.tsx` with high contrast light mode palette, elevated header container shadow, polished search box, and high-visibility action buttons and theme toggle.

**Full Replacement Specification for `src/components/Navbar.tsx`**:
```tsx
import React from 'react';
import type { Allergen } from '../types/cafe';
import { Coffee, Search, ShieldAlert, Scale, ShoppingBag, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userAllergens: Allergen[];
  hideAllergens: boolean;
  onOpenAllergenModal: () => void;
  compareCount: number;
  onOpenCompareModal: () => void;
  basketCount?: number;
  totalBasketCalories: number;
  onOpenBasketDrawer: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  userAllergens,
  hideAllergens,
  onOpenAllergenModal,
  compareCount,
  onOpenCompareModal,
  basketCount: _basketCount,
  totalBasketCalories,
  onOpenBasketDrawer,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-stone-950 dark:text-stone-50 tracking-tight">
                Kalori Cafe
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-extrabold text-[10px] uppercase border border-amber-300/60 dark:border-amber-800/60">
                Zincir Rehberi
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold hidden sm:block">
              Kafe Makro & Alerjen Takip Platformu
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kahve, yiyecek, kafe adı veya filtre ara... (örn: Latte, Glutensiz)"
              className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/90 border border-stone-300/70 dark:border-stone-700 text-stone-950 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 text-xs font-bold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 transition-all shadow-inner-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-black p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Header Action Buttons Right */}
        <div className="flex items-center gap-2">
          
          {/* Allergen Profile Button */}
          <button
            onClick={onOpenAllergenModal}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              userAllergens.length > 0
                ? hideAllergens
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-md shadow-red-500/20'
                  : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300/80 dark:border-stone-700 shadow-xs'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline">Alerji Profili</span>
            {userAllergens.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black min-w-[18px] text-center">
                {userAllergens.length}
              </span>
            )}
          </button>

          {/* Compare Modal Trigger */}
          <button
            onClick={onOpenCompareModal}
            disabled={compareCount === 0}
            className={`relative hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              compareCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-500/20'
                : 'bg-stone-50 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500 border-stone-200/80 dark:border-stone-700/50 cursor-not-allowed opacity-60 font-semibold'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Karşılaştır</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-600 text-[10px] font-black">
                {compareCount}
              </span>
            )}
          </button>

          {/* Daily Basket Trigger */}
          <button
            onClick={onOpenBasketDrawer}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs shadow-md shadow-amber-600/25 border border-amber-600/30 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sepetim</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/25 text-amber-100 text-[11px] font-extrabold">
              {totalBasketCalories} kcal
            </span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-300/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 transition-all shadow-xs"
            title={isDarkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 font-bold" /> : <Moon className="w-4 h-4 text-stone-800 font-bold" />}
          </button>

        </div>

      </div>
    </header>
  );
};
```

---

### Task 3: Redesign `src/components/Hero.tsx` for Light Mode

Replace the muddy amber gradient outer container with a pure, crisp white base card (`bg-white` in Light Mode, `bg-stone-900` in Dark Mode) with elevated ambient shadow (`shadow-xl shadow-stone-200/50`), clean subtle stone top gradient tint, high-contrast floating badge, elevated 4 feature highlight cards, and high-visibility quick search filter pills.

**Full Replacement Specification for `src/components/Hero.tsx`**:
```tsx
import React from 'react';
import { Sparkles, Zap, ShieldCheck, HeartPulse, Flame } from 'lucide-react';

interface HeroProps {
  onSelectQuickFilter: (filter: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectQuickFilter }) => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-50/90 via-white to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-stone-200/90 dark:border-stone-800 p-6 md:p-10 text-center space-y-6 shadow-xl shadow-stone-200/50 dark:shadow-none transition-all duration-300">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-300 text-xs font-black tracking-wide shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
          <span>Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-950 dark:text-stone-50 tracking-tight leading-tight max-w-4xl mx-auto">
          Sevdiğin Kahvenin Kalorisini & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:to-orange-400">Alerjenlerini Keşfet</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-stone-600 dark:text-stone-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Starbucks, Espressolab, Caffè Nero, Coffy, Kahve Dünyası ve daha fazlası... Süt türü, boyut ve şuruba göre anlık makro hesabı yapın, glüten ve laktoz risklerini önceden görün.
        </p>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all shadow-xs hover:shadow-md flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-stone-100">10+ Kafe Zinciri</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">Resmi Güncel Menüler</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all shadow-xs hover:shadow-md flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-stone-100">Anlık Özelleştirici</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">Süt, Şurup & Boyut</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all shadow-xs hover:shadow-md flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-stone-100">Alerjen Profil Filtresi</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">Glüten, Laktoz & Yulaf</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all shadow-xs hover:shadow-md flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-stone-950 dark:text-stone-100">Günlük Makro Sepet</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">MyFitnessPal Kopyala</div>
            </div>
          </div>

        </div>

        {/* Popular Quick Searches */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-black text-stone-800 dark:text-stone-200 text-xs mr-1">Popüler Aramalar:</span>
          
          {[
            { label: 'Starbucks', filter: 'Starbucks', color: 'bg-emerald-700 text-white hover:bg-emerald-800' },
            { label: 'Espressolab', filter: 'Espressolab', color: 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 hover:bg-stone-800' },
            { label: 'Caffè Nero', filter: 'Nero', color: 'bg-blue-900 text-white hover:bg-blue-950' },
            { label: 'Coffy', filter: 'Coffy', color: 'bg-yellow-400 text-stone-950 font-black hover:bg-yellow-500' },
            { label: '🌾 Glutensiz Seçenekler', filter: 'Glutensiz', color: 'bg-amber-600 text-white hover:bg-amber-700' },
            { label: '🧊 Soğuk Kahveler', filter: 'Soğuk Kahve', color: 'bg-cyan-700 text-white hover:bg-cyan-800' },
            { label: '💪 Yüksek Protein', filter: 'High Protein', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
            { label: '☕ Türk Kahvesi', filter: 'Türk Kahvesi', color: 'bg-amber-900 text-white hover:bg-amber-950' },
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuickFilter(pill.filter)}
              className={`px-3 py-1.5 rounded-full font-black shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all text-[11px] ${pill.color}`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
```

---

## 5. Verification Method

Worker M1 and Parent Orchestrator should run the following commands to verify implementation:

1. **Build Check**:
   ```bash
   npm run build
   ```
   *Expected Output*: Exit code 0, clean Vite production build into `dist/`.

2. **Lint Check**:
   ```bash
   npm run lint
   ```
   *Expected Output*: Exit code 0, **0 react-hooks errors** (previously 14 errors).

3. **Visual UI Inspection**:
   - Run `npm run dev` and test Light Mode (`isDarkMode = false`).
   - Verify Navbar has clean white backdrop, crisp search input, elevated action buttons, and clear dark mode toggle.
   - Verify Hero component is rendered on clean white card container (`bg-white` / `stone-50`), replacing muddy amber tint, with high contrast typography and 4 feature cards.
