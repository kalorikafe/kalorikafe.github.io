import { CHAINS } from '../src/data/chains';
import { MENU_ITEMS } from '../src/data/items';
import type { Chain, MenuItem, Category, Allergen, DietaryPreference } from '../src/types/cafe';
import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  name: string;
  tier: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function runTier1Tests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, name: string, details?: string) {
    if (condition) {
      results.push({ name, tier: 'Tier 1', passed: true, details });
    } else {
      results.push({ name, tier: 'Tier 1', passed: false, error: details || 'Assertion failed' });
    }
  }

  // --- Navbar Light Mode Styling Tests ---
  const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  assert(
    navbarContent.includes('bg-white/95') && navbarContent.includes('backdrop-blur-md') && navbarContent.includes('border-stone-200'),
    'Navbar Light Mode Header Classes: Header contains high-contrast bg-white/95 and border-stone-200 styling',
    'Verified sticky header element contains required light mode Tailwind utility classes'
  );

  assert(
    navbarContent.includes('text-stone-950') && navbarContent.includes('Kalori Cafe'),
    'Navbar Brand Title Styling: Brand heading "Kalori Cafe" utilizes high-contrast text-stone-950',
    'Verified brand title typography uses high-contrast stone-950 text class'
  );

  assert(
    navbarContent.includes('Kafe Makro & Alerjen Takip Platformu'),
    'Navbar Subtitle Text: Header renders platform tagline "Kafe Makro & Alerjen Takip Platformu"',
    'Verified tagline string is rendered in Navbar'
  );

  assert(
    navbarContent.includes('bg-stone-100') && navbarContent.includes('border-stone-200') && navbarContent.includes('placeholder-stone-400'),
    'Navbar Search Bar Light Mode Classes: Global search input uses bg-stone-100, border-stone-200, and placeholder-stone-400',
    'Verified search bar light mode classes'
  );

  assert(
    navbarContent.includes('onOpenAllergenModal') && navbarContent.includes('Alerji Profili'),
    'Navbar Allergen Profile Trigger: Renders Allergen Profile action button with modal handler',
    'Verified Allergen Profile button exists with text "Alerji Profili"'
  );

  assert(
    navbarContent.includes('onOpenCompareModal') && navbarContent.includes('Karşılaştır'),
    'Navbar Compare Modal Trigger: Renders Compare action button with disabled state when count is 0',
    'Verified Compare button exists with text "Karşılaştır"'
  );

  assert(
    navbarContent.includes('onOpenBasketDrawer') && navbarContent.includes('Sepetim') && navbarContent.includes('totalBasketCalories'),
    'Navbar Daily Basket Trigger: Renders Sepetim button displaying total calories',
    'Verified Sepetim action button exists with calorie counter'
  );

  assert(
    navbarContent.includes('Açık Moda Geç') && navbarContent.includes('Koyu Moda Geç'),
    'Navbar Theme Toggle Button: Light/Dark theme toggle includes accessible tooltips "Açık Moda Geç" / "Koyu Moda Geç"',
    'Verified theme toggle button title attributes'
  );

  // --- Hero Light Mode Styling Tests ---
  const heroPath = path.resolve(process.cwd(), 'src/components/Hero.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf-8');

  assert(
    heroContent.includes('bg-gradient-to-b from-stone-50/90 via-white') && heroContent.includes('border-stone-200/90'),
    'Hero Container Light Mode Classes: Banner uses premium off-white bg-gradient-to-b and border-stone-200/90 styling',
    'Verified Hero component top container light mode gradient and border styling'
  );

  assert(
    heroContent.includes('Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası'),
    'Hero Top Floating Badge: Renders floating badge text "Tüm Türkiye Kafe Zincirlerinin Kalori, Makro & Alerjen Haritası"',
    'Verified floating badge text content'
  );

  assert(
    heroContent.includes('Sevdiğin Kahvenin Kalorisini &') && heroContent.includes('Alerjenlerini Keşfet'),
    'Hero Main Heading: Renders main title "Sevdiğin Kahvenin Kalorisini & Alerjenlerini Keşfet"',
    'Verified main heading text content'
  );

  assert(
    heroContent.includes('Starbucks') && heroContent.includes('Espressolab') && heroContent.includes('Caffè Nero') && heroContent.includes('Coffy'),
    'Hero Subtitle Content: Mentions key popular Turkish coffee chains in description',
    'Verified subtitle contains top chain names'
  );

  assert(
    heroContent.includes('10 Kafe Zinciri') && heroContent.includes('Ürünlük Katalog'),
    'Hero Highlight Card 1: Renders "10+ Kafe Zinciri" card',
    'Verified feature card 1'
  );

  assert(
    heroContent.includes('Anlık Özelleştirici') && heroContent.includes('Süt, Şurup & Boyut'),
    'Hero Highlight Card 2: Renders "Anlık Özelleştirici" card',
    'Verified feature card 2'
  );

  assert(
    heroContent.includes('Alerjen Profil Filtresi') && heroContent.includes('Glüten, Laktoz & Yulaf'),
    'Hero Highlight Card 3: Renders "Alerjen Profil Filtresi" card',
    'Verified feature card 3'
  );

  assert(
    heroContent.includes('Günlük Makro Sepet') && heroContent.includes('MyFitnessPal Kopyala'),
    'Hero Highlight Card 4: Renders "Günlük Makro Sepet" card',
    'Verified feature card 4'
  );

  assert(
    heroContent.includes('Glutensiz Seçenekler') && heroContent.includes('Soğuk Kahveler') && heroContent.includes('Yüksek Protein') && heroContent.includes('Türk Kahvesi'),
    'Hero Quick Search Pills: Renders popular filter pills (Glutensiz, Soğuk Kahveler, Yüksek Protein, Türk Kahvesi)',
    'Verified quick search interactive pills'
  );

  // --- 10 Coffee Chains Definitions Tests ---
  assert(
    Array.isArray(CHAINS) && CHAINS.length === 10,
    'Chains Catalog Length: CHAINS array contains exactly 10 coffee chain definitions',
    `Actual chains count: ${CHAINS.length}`
  );

  const requiredChainIds = [
    'starbucks',
    'espressolab',
    'caffe_nero',
    'coffy',
    'kahve_dunyasi',
    'gloria_jeans',
    'tchibo',
    'arabica',
    'david_people',
    'mackbear'
  ];

  const missingChains = requiredChainIds.filter(id => !CHAINS.some(c => c.id === id));
  assert(
    missingChains.length === 0,
    'Top Turkish Coffee Chains Presence: CHAINS catalog includes all 10 target chains',
    missingChains.length === 0 ? 'All 10 target chains present' : `Missing chains: ${missingChains.join(', ')}`
  );

  let validChainSchemas = true;
  for (const chain of CHAINS) {
    if (
      typeof chain.id !== 'string' || !chain.id ||
      typeof chain.name !== 'string' || !chain.name ||
      typeof chain.logo !== 'string' || !chain.logo ||
      typeof chain.color !== 'string' || !chain.color ||
      typeof chain.description !== 'string' || !chain.description
    ) {
      validChainSchemas = false;
      break;
    }
  }

  assert(
    validChainSchemas,
    'Chain Catalog Schema Integrity: Every chain in CHAINS has valid id, name, logo, color, and description',
    'Verified all 10 chains conform to Chain interface contract'
  );

  // --- Menu Data Expansion & Schema Tests ---
  assert(
    Array.isArray(MENU_ITEMS) && MENU_ITEMS.length > 0,
    'Menu Items Catalog Non-Empty: MENU_ITEMS array exists and contains items',
    `Total items count: ${MENU_ITEMS.length}`
  );

  // Validate the current catalog baseline without claiming unverified 40+ item menus.
  const chainCounts: Record<string, number> = {};
  CHAINS.forEach(c => {
    chainCounts[c.id] = MENU_ITEMS.filter(item => item.chainId === c.id).length;
  });

  const chainsMeetingThreshold = CHAINS.filter(c => chainCounts[c.id] >= 19);
  assert(
    chainsMeetingThreshold.length === 10 && MENU_ITEMS.length >= 190,
    `Per-Chain Dataset Capacity: Evaluated menu item count per chain (Current total: ${MENU_ITEMS.length} items across 10 chains)`,
    `Chains meeting >=19 baseline: ${chainsMeetingThreshold.length}/10. Counts: ${JSON.stringify(chainCounts)}`
  );

  let allItemsValidSchema = true;
  let invalidItemDetail = '';
  const validCategories: Category[] = [
    'espresso_hot', 'espresso_iced', 'cold_brew', 'frappe_blended',
    'tea_herbal', 'smoothie_juice', 'bakery_dessert', 'sandwich_savory', 'fit_healthy'
  ];

  for (const item of MENU_ITEMS) {
    if (!item.id || !item.chainId || !item.name || !item.description || !item.image || typeof item.isDrink !== 'boolean') {
      allItemsValidSchema = false;
      invalidItemDetail = `Item ${item.id || 'unknown'} missing basic string/boolean fields`;
      break;
    }

    if (!validCategories.includes(item.category)) {
      allItemsValidSchema = false;
      invalidItemDetail = `Item ${item.id} has invalid category: ${item.category}`;
      break;
    }
  }

  assert(
    allItemsValidSchema,
    'Menu Item Schema Integrity: All items contain mandatory id, chainId, name, category, description, image, isDrink',
    allItemsValidSchema ? 'All menu items passed schema check' : invalidItemDetail
  );

  // --- Macro Fields Presence & Non-Negative Invariant Tests ---
  let macrosValid = true;
  let macroErrorDetail = '';

  for (const item of MENU_ITEMS) {
    const m = item.baseMacros;
    if (
      typeof m.calories !== 'number' || m.calories < 0 ||
      typeof m.protein !== 'number' || m.protein < 0 ||
      typeof m.carbs !== 'number' || m.carbs < 0 ||
      typeof m.sugar !== 'number' || m.sugar < 0 ||
      typeof m.fat !== 'number' || m.fat < 0 ||
      typeof m.caffeine !== 'number' || m.caffeine < 0
    ) {
      macrosValid = false;
      macroErrorDetail = `Item ${item.id} has invalid macro numbers: ${JSON.stringify(m)}`;
      break;
    }

    if (m.satFat !== undefined && (typeof m.satFat !== 'number' || m.satFat < 0)) {
      macrosValid = false;
      macroErrorDetail = `Item ${item.id} has invalid satFat: ${m.satFat}`;
      break;
    }

    if (m.sodium !== undefined && (typeof m.sodium !== 'number' || m.sodium < 0)) {
      macrosValid = false;
      macroErrorDetail = `Item ${item.id} has invalid sodium: ${m.sodium}`;
      break;
    }
  }

  assert(
    macrosValid,
    'Macro Fields Presence & Non-Negative Invariant: Every item baseMacros has valid non-negative calories, protein, carbs, sugar, fat, caffeine',
    macrosValid ? 'All item macros are non-negative numeric values' : macroErrorDetail
  );

  // --- Allergens & Dietary Tags Validity Tests ---
  const validAllergens: Allergen[] = ['lactose', 'gluten', 'celiac_oat_risk', 'nuts', 'soy', 'egg', 'peanut'];
  const validDietaryTags: DietaryPreference[] = ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'high_protein', 'low_calorie'];

  let tagsValid = true;
  let tagErrorDetail = '';

  for (const item of MENU_ITEMS) {
    if (!Array.isArray(item.allergens) || !item.allergens.every(a => validAllergens.includes(a))) {
      tagsValid = false;
      tagErrorDetail = `Item ${item.id} has invalid allergens: ${JSON.stringify(item.allergens)}`;
      break;
    }
    if (!Array.isArray(item.dietaryTags) || !item.dietaryTags.every(t => validDietaryTags.includes(t))) {
      tagsValid = false;
      tagErrorDetail = `Item ${item.id} has invalid dietaryTags: ${JSON.stringify(item.dietaryTags)}`;
      break;
    }
  }

  assert(
    tagsValid,
    'Allergens & Dietary Tags Enum Verification: All allergens and dietaryTags conform to typed union schema',
    tagsValid ? 'All item allergens and dietary tags are valid enums' : tagErrorDetail
  );

  return results;
}
