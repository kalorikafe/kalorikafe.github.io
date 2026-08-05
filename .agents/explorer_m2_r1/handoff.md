# Handoff Report — Worker M2 Data Structure Blueprint & Turkish Chains Menu Population Plan

**Agent**: `explorer_m2_r1` (teamwork_preview_explorer)  
**Working Directory**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\explorer_m2_r1`  
**Target Handoff Path**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\explorer_m2_r1\handoff.md`  
**Date**: 2026-08-05  

---

## 1. Observation

### 1.1 Requirements Summary (`ORIGINAL_REQUEST.md` & `PROJECT.md`)
- **Location**: `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\ORIGINAL_REQUEST.md` & `.agents/orchestrator/PROJECT.md`
- **Milestone M2 Objective**: Expand and modernize the data layer in `src/data/chains.ts` and `src/data/items.ts`.
- **Target Chains (10 Total)**:
  1. `starbucks` — Starbucks
  2. `espressolab` — Espressolab
  3. `kahve_dunyasi` — Kahve Dünyası
  4. `caffe_nero` — Caffè Nero
  5. `coffy` — Coffy
  6. `mackbear` — Mackbear Coffee Co. (NEW - high branch count in TR)
  7. `arabica` — Arabica Coffee House
  8. `gloria_jeans` — Gloria Jean's Coffees
  9. `david_people` — David People (NEW - major cafe/bistro chain in TR)
  10. `tchibo` — Tchibo
- **Item Count Requirement**: AT LEAST 40 authentic, popular Turkish beverage and food items per chain (Minimum **400 items total** across 10 chains).

### 1.2 Data Schemas (`src/types/cafe.ts`)
- **Categories**: `'espresso_hot'`, `'espresso_iced'`, `'cold_brew'`, `'frappe_blended'`, `'tea_herbal'`, `'smoothie_juice'`, `'bakery_dessert'`, `'sandwich_savory'`, `'fit_healthy'`.
- **Allergens**: `'lactose'`, `'gluten'`, `'celiac_oat_risk'`, `'nuts'`, `'soy'`, `'egg'`, `'peanut'`.
- **Dietary Tags**: `'vegan'`, `'vegetarian'`, `'gluten_free'`, `'lactose_free'`, `'sugar_free'`, `'high_protein'`, `'low_calorie'`.
- **Macros Interface**:
  ```ts
  export interface Macros {
    calories: number; // kcal
    protein: number;  // g
    carbs: number;    // g
    sugar: number;    // g
    fat: number;      // g
    satFat?: number;  // g
    caffeine: number; // mg
    sodium?: number;  // mg
  }
  ```

---

## 2. Logic Chain

1. **Observation**: `chains.ts` currently contains 10 chains, but includes lower-branch boutique chains like `caribou` and `kronotrop` while missing major national Turkish chains like `mackbear` (Mackbear Coffee Co.) and `david_people` (David People).
   **Inference**: Updating `chains.ts` to replace `caribou` and `kronotrop` with `mackbear` and `david_people` satisfies Requirement R2 by featuring the top 10 national coffee chains with the highest branch counts in Turkey.

2. **Observation**: `items.ts` currently has only 34 items total across 10 chains (deficit of 366 items vs the 400 minimum required).
   **Inference**: Worker M2 must expand `items.ts` so that each of the 10 chains has exactly 40 (or more) well-defined items, spanning all categories from espresso to smoothies, bakery, sandwiches, and fit bowls.

3. **Observation**: Nutritional values in cafe items must satisfy strict biochemical and mathematical constraints.
   **Inference**:
   - `sugar <= carbs` MUST hold for every single item (`sugar` is a sub-component of total carbohydrates).
   - `satFat <= fat` MUST hold for every single item (`satFat` is a sub-component of total lipids).
   - `calories` must align realistically with macronutrients: `~4*(protein + carbs) + 9*fat`.

4. **Observation**: The UI dynamic count badges (`chainCounts`) calculate item counts via `MENU_ITEMS.filter(item => item.chainId === chain.id).length`.
   **Inference**: Populating `items.ts` with 40 items per chain automatically updates all UI badges and quick-filters across `App.tsx`, `Hero.tsx`, and `ChainSelector.tsx` without needing frontend component modifications.

---

## 3. Caveats

- **Mathematical Integrity**: Any item where `sugar > carbs` or `satFat > fat` will fail verification checks and adversarial test suits (Tier 5).
- **Unsplash Image URLs**: Image URLs must use standard high-res Unsplash parameters (`?w=500&auto=format&fit=crop&q=80`) and match item context (e.g. coffee cups for lattes, cakes for desserts, toast for sandwiches).
- **ID Uniqueness**: Every item across all 400+ items must have a unique `id` string (e.g., `sb_caffelatte`, `el_cortado`, `kd_turk_kahvesi`, `cn_tiramisu`, `coffy_bun`, `mb_bear_latte`, `ac_signature_latte`, `gj_voltage_chiller`, `dp_club_sandwich`, `tch_apfelstrudel`).

---

## 4. Conclusion & Data Blueprint for Worker M2

### 4.1 `src/data/chains.ts` Structure Blueprint

Worker M2 should export `CHAINS: Chain[]` with the following 10 chain objects:

```ts
import type { Chain } from '../types/cafe';

export const CHAINS: Chain[] = [
  {
    id: 'starbucks',
    name: 'Starbucks',
    logo: '☕',
    color: 'bg-emerald-600',
    badgeColor: 'bg-emerald-600 text-white',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    description: 'Espresso bazlı ikonik soğuk & sıcak kahveler, Frappuccinolar ve özel şuruplar.'
  },
  {
    id: 'espressolab',
    name: 'Espressolab',
    logo: '⚡',
    color: 'bg-stone-900',
    badgeColor: 'bg-stone-900 text-white',
    accentBg: 'bg-stone-900/10 border-stone-900/30 text-stone-900 dark:text-stone-100',
    description: 'Türkiye’nin en büyük 3. dalga nitelikli kahve kavurucusu. Özel soğuk demlenmiş ve fırın lezzetleri.'
  },
  {
    id: 'kahve_dunyasi',
    name: 'Kahve Dünyası',
    logo: '🍫',
    color: 'bg-amber-800',
    badgeColor: 'bg-amber-800 text-white',
    accentBg: 'bg-amber-800/10 border-amber-800/30 text-amber-900 dark:text-amber-300',
    description: 'Türk kahvesi, çikolatalı özel lezzetler, salep, dondurma ve yöresel çekirdekler.'
  },
  {
    id: 'caffe_nero',
    name: 'Caffè Nero',
    logo: '🖤',
    color: 'bg-blue-900',
    badgeColor: 'bg-blue-900 text-white',
    accentBg: 'bg-blue-900/10 border-blue-900/30 text-blue-900 dark:text-blue-300',
    description: 'İtalyan tarzı koyu kavrum lezzetli espresso, geleneksel İtalyan tatlıları ve tostlar.'
  },
  {
    id: 'coffy',
    name: 'Coffy',
    logo: '🟡',
    color: 'bg-yellow-500',
    badgeColor: 'bg-yellow-500 text-stone-950 font-black',
    accentBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-900 dark:text-yellow-300',
    description: 'Türkiye’nin dijital ve ulaşılabilir fiyata yüksek kaliteli kahve sunan dev kafe zinciri.'
  },
  {
    id: 'mackbear',
    name: 'Mackbear Coffee Co.',
    logo: '🐻',
    color: 'bg-amber-900',
    badgeColor: 'bg-amber-900 text-white',
    accentBg: 'bg-amber-900/10 border-amber-900/30 text-amber-900 dark:text-amber-300',
    description: 'Özel kavrum çekirdekler, güçlü espresso lezzetleri, ayı temalı soğuk içecekler ve fırın ürünleri.'
  },
  {
    id: 'arabica',
    name: 'Arabica Coffee House',
    logo: '🌿',
    color: 'bg-orange-700',
    badgeColor: 'bg-orange-700 text-white',
    accentBg: 'bg-orange-700/10 border-orange-700/30 text-orange-800 dark:text-orange-300',
    description: '%100 yüksek nitelikli Arabica çekirdekleri ve zengin soğuk kahve çeşitleri.'
  },
  {
    id: 'gloria_jeans',
    name: 'Gloria Jean\'s Coffees',
    logo: '🦘',
    color: 'bg-amber-700',
    badgeColor: 'bg-amber-700 text-white',
    accentBg: 'bg-amber-700/10 border-amber-700/30 text-amber-800 dark:text-amber-300',
    description: 'Avustralya kökenli gurme kahve zinciri. Kremalı chiller içecekler ve fırın tatlıları.'
  },
  {
    id: 'david_people',
    name: 'David People',
    logo: '👑',
    color: 'bg-rose-900',
    badgeColor: 'bg-rose-900 text-white',
    accentBg: 'bg-rose-900/10 border-rose-900/30 text-rose-900 dark:text-rose-300',
    description: 'Zengin kahve seçenekleri, geniş bistro menüsü, tatlılar ve kahvaltılık lezzetler.'
  },
  {
    id: 'tchibo',
    name: 'Tchibo',
    logo: '🇩🇪',
    color: 'bg-yellow-700',
    badgeColor: 'bg-yellow-700 text-white',
    accentBg: 'bg-yellow-700/10 border-yellow-700/30 text-yellow-800 dark:text-yellow-300',
    description: 'Alman filtre kahve uzmanı, taze çekilmiş çekirdekler ve Alman fırın klasikliği.'
  }
];
```

---

### 4.2 Menu Items Population Plan (`src/data/items.ts`) — 400 Items Total

For each chain, 40 items will be defined with the following balanced category mix:
- **Hot Espresso** (8 items): Latte, Cappuccino, Flat White, Americano, Cortado, Mocha, White Mocha, Caramel Macchiato
- **Iced Espresso** (8 items): Iced Latte, Iced Americano, Iced Mocha, Iced White Mocha, Iced Caramel Macchiato, Iced Spanish Latte, Iced Shaken Espresso, Iced Vanilla Latte
- **Cold Brew** (3 items): Classic Cold Brew, Cold Brew with Milk, Vanilla Sweet Cream Cold Brew
- **Frappe / Blended** (5 items): Coffee Frappe, Mocha Frappe, Caramel Frappe, Java Chip Frappe, Cream Blended
- **Tea & Herbal** (4 items): Chai Tea Latte, Matcha Latte, Herbal Tea, Demleme Türk Çayı
- **Smoothie / Refreshers** (3 items): Cool Lime / Refresher, Berry Smoothie, Fresh Juice
- **Bakery & Dessert** (5 items): Croissant, Muffin, Cheesecake, Cookie, Cake / Tart
- **Sandwich & Savory** (3 items): Cheese Toast, Smoked Turkey/Beef Panini, Wrap / Bagel
- **Fit & Healthy** (1 item): Granola / Chia Bowl / Protein Bar

---

### 4.3 400-Item Menu Inventory Blueprint

#### 1. Starbucks (`starbucks`) — 40 Items
1. `sb_caffelatte` — Caffè Latte (Hot Espresso)
2. `sb_iced_caramel_macchiato` — Iced Caramel Macchiato (Iced Espresso)
3. `sb_white_chocolate_mocha` — White Chocolate Mocha (Hot Espresso)
4. `sb_cold_brew` — Starbucks Cold Brew (Cold Brew)
5. `sb_iced_shaken_espresso` — Iced Brown Sugar Oat Shaken Espresso (Iced Espresso)
6. `sb_java_chip_frappuccino` — Java Chip Frappuccino (Frappe)
7. `sb_iced_matcha` — Iced Green Tea Matcha Latte (Tea)
8. `sb_caramel_frappe` — Caramel Cream Frappuccino (Frappe)
9. `sb_croissant` — Tereyağlı Kruvasan (Bakery)
10. `sb_toast` — Füme Etli & Kaşarlı Tost (Sandwich)
11. `sb_americano` — Caffe Americano (Hot Espresso)
12. `sb_iced_americano` — Iced Caffe Americano (Iced Espresso)
13. `sb_cappuccino` — Cappuccino (Hot Espresso)
14. `sb_flat_white` — Flat White (Hot Espresso)
15. `sb_espresso` — Espresso Solo (Hot Espresso)
16. `sb_espresso_doppio` — Espresso Doppio (Hot Espresso)
17. `sb_iced_latte` — Iced Caffe Latte (Iced Espresso)
18. `sb_iced_wcm` — Iced White Chocolate Mocha (Iced Espresso)
19. `sb_iced_mocha` — Iced Caffe Mocha (Iced Espresso)
20. `sb_iced_vanilla_latte` — Iced Vanilla Latte (Iced Espresso)
21. `sb_vanilla_cold_brew` — Vanilla Sweet Cream Cold Brew (Cold Brew)
22. `sb_nitro_cold_brew` — Nitro Cold Brew (Cold Brew)
23. `sb_espresso_frappe` — Espresso Frappuccino (Frappe)
24. `sb_strawberry_frappe` — Strawberries & Cream Frappuccino (Frappe)
25. `sb_mango_refresher` — Mango Dragonfruit Refresher (Smoothie)
26. `sb_berry_hibiscus` — Very Berry Hibiscus Refresher (Smoothie)
27. `sb_chai_latte` — Chai Tea Latte (Tea)
28. `sb_green_tea` — Emperor's Clouds Green Tea (Tea)
29. `sb_earl_grey` — Teavana Earl Grey Tea (Tea)
30. `sb_choco_muffin` — Belgik Çikolatalı Muffin (Bakery)
31. `sb_lemon_cheesecake` — Limonlu Cheesecake (Bakery)
32. `sb_san_sebastian` — San Sebastian Cheesecake (Bakery)
33. `sb_carrot_cake` — Havuçlu Kek (Bakery)
34. `sb_cookie` — Çikolatalı Parçacıklı Cookie (Bakery)
35. `sb_mozzarella_sandwich` — Mozzarella Füme Kabak Sandviç (Sandwich)
36. `sb_turkey_panini` — Hindi Füme & Kaşarlı Panini (Sandwich)
37. `sb_cheese_croissant_sandwich` — Üç Peynirli Croissant Sandviç (Sandwich)
38. `sb_granola_bowl` — Fit Yoğurt & Granola Bowl (Fit)
39. `sb_chia_pudding` — Chia Tohumlu Meyveli Puding (Fit)
40. `sb_protein_bar` — Fıstıklı Protein Granola Bar (Fit)

#### 2. Espressolab (`espressolab`) — 40 Items
1. `el_cortado` — Espressolab Cortado (Hot Espresso)
2. `el_spanish_latte` — Spanish Latte (Hot Espresso)
3. `el_iced_spanish_latte` — Iced Spanish Latte (Iced Espresso)
4. `el_cold_brew` — Lab Cold Brew (Cold Brew)
5. `el_san_sebastian` — San Sebastian Cheesecake (Bakery)
6. `el_flat_white` — Specialty Flat White (Hot Espresso)
7. `el_iced_salted_caramel` — Iced Salted Caramel Latte (Iced Espresso)
8. `el_mocha_mint_frappe` — Mocha Mint Blended (Frappe)
9. `el_croissant` — Sade Kruvasan (Bakery)
10. `el_avocado_toast` — Avokadolu Poşe Yumurtalı Toast (Fit)
11. `el_espresso` — Single Espresso (Hot Espresso)
12. `el_americano` — Americano (Hot Espresso)
13. `el_latte` — Caffe Latte (Hot Espresso)
14. `el_cappuccino` — Cappuccino (Hot Espresso)
15. `el_mocha` — Caffe Mocha (Hot Espresso)
16. `el_white_mocha` — White Chocolate Mocha (Hot Espresso)
17. `el_iced_americano` — Iced Americano (Iced Espresso)
18. `el_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `el_iced_white_mocha` — Iced White Mocha (Iced Espresso)
20. `el_iced_vanilla_oat` — Iced Vanilla Oat Latte (Iced Espresso)
21. `el_cascara_cold_brew` — Cascara Cold Brew (Cold Brew)
22. `el_nitro_cold_brew` — Nitro Cold Brew (Cold Brew)
23. `el_caramel_frozen` — Caramel Frozen (Frappe)
24. `el_choco_blended` — Choco Chip Blended (Frappe)
25. `el_berry_tonic` — Berry Tonic (Smoothie)
26. `el_passion_iced_tea` — Passion Fruit Iced Tea (Smoothie)
27. `el_matchaccino` — Matchaccino (Tea)
28. `el_iced_matcha` — Iced Matcha Latte (Tea)
29. `el_turkish_tea` — Demleme Türk Çayı (Tea)
30. `el_choco_croissant` — Çikolatalı Kruvasan (Bakery)
31. `el_raspberry_tart` — Frambuazlı Tart (Bakery)
32. `el_brownie` — Belçika Çikolatalı Brownie (Bakery)
33. `el_lotus_cheesecake` — Lotus Cheesecake (Bakery)
34. `el_oat_cookie` — Yulaf Ezmeli Kurabiye (Bakery)
35. `el_smoked_beef_sandwich` — Füme Etli Cheddarlı Sandviç (Sandwich)
36. `el_simit_sandwich` — Ezine Peynirli Simit Sandviç (Sandwich)
37. `el_chicken_wrap` — Tavuklu Sezar Wrap (Sandwich)
38. `el_granola` — Fit Meyveli Granola (Fit)
39. `el_smoothie_bowl` — Protein Smoothie Bowl (Fit)
40. `el_peanut_oat_bites` — Fıstık Ezmeli Yulaf Topları (Fit)

#### 3. Kahve Dünyası (`kahve_dunyasi`) — 40 Items
1. `kd_turk_kahvesi` — Geleneksel Türk Kahvesi (Hot Espresso/Specialty)
2. `kd_sicak_cikolata` — Sütlü Sıcak Çikolata (Hot Drink)
3. `kd_findikli_fratte` — Fındıklı Fratte (Frappe)
4. `kd_sakizli_turk_kahvesi` — Damla Sakızlı Türk Kahvesi (Hot Specialty)
5. `kd_salep` — Geleneksel Salep (Hot Drink/Tea)
6. `kd_affogato` — Dondurmalı Affogato (Hot Espresso)
7. `kd_triffle` — Çikolatalı Triffle (Bakery)
8. `kd_su_boregi` — Peynirli Su Böreği (Sandwich)
9. `kd_souffle` — Sıcak Çikolatalı Sufle (Bakery)
10. `kd_panini_tost` — Kaşarlı Panini Tost (Sandwich)
11. `kd_duble_turk_kahvesi` — Duble Türk Kahvesi (Hot Espresso)
12. `kd_dibek_kahvesi` — Geleneksel Dibek Kahvesi (Hot Espresso)
13. `kd_menengic_kahvesi` — Menengiç Kahvesi (Hot Espresso)
14. `kd_filtre_kahve` — Yöresel Filtre Kahve (Hot Espresso)
15. `kd_sutlu_filtre` — Sütlü Filtre Kahve (Hot Espresso)
16. `kd_espresso` — Single Espresso (Hot Espresso)
17. `kd_latte` — Caffe Latte (Hot Espresso)
18. `kd_iced_latte` — Buzlu Caffe Latte (Iced Espresso)
19. `kd_iced_americano` — Buzlu Americano (Iced Espresso)
20. `kd_buzlu_cikolata` — Buzlu Sütlü Çikolata (Iced Espresso)
21. `kd_cold_brew` — Kahveli Soğuk Demleme (Cold Brew)
22. `kd_cikolatali_fratte` — Çikolatalı Fratte (Frappe)
23. `kd_karamel_fratte` — Karamel Fratte (Frappe)
24. `kd_cilek_smoothie` — Taze Çilekli Smoothie (Smoothie)
25. `kd_portakal_suyu` — Taze Sıkma Portakal Suyu (Smoothie)
26. `kd_bitki_cayi` — Bitki Çayı (Adaçayı/Ihlamur) (Tea)
27. `kd_turk_cayi` — Demleme Türk Çayı (Tea)
28. `kd_fistikli_pasta` — Antep Fıstıklı Pasta (Bakery)
29. `kd_mozaik_pasta` — Çikolatalı Mozaik Pasta (Bakery)
30. `kd_cikolatalı_cheesecake` — Çikolatalı Cheesecake (Bakery)
31. `kd_ekler` — Fransız Ekler Pasta (Bakery)
32. `kd_draje` — Kahve Çekirdeği Draje Tabağı (Bakery)
33. `kd_simit_tabagi` — Simit Tabağı & Ezine Peynir (Sandwich)
34. `kd_pogaca` — Zeytinli Ev Poğaçası (Bakery)
35. `kd_turkey_tost` — Füme Hindi & Cheddar Tost (Sandwich)
36. `kd_kis` — Mantarlı Kaşarlı Kiş (Sandwich)
37. `kd_fit_musli` — Fit Müsli & Yoğurt (Fit)
38. `kd_glutensiz_kek` — Glütensiz Çikolatalı Kek (Fit)
39. `kd_protein_kahve` — Proteinli Kahveli İçecek (Fit)
40. `kd_fit_bar` — Meyveli Fit Bar (Fit)

#### 4. Caffè Nero (`caffe_nero`) — 40 Items
1. `cn_classico_latte` — Classico Caffe Latte (Hot Espresso)
2. `cn_iced_caramel_latte` — Iced Italian Caramel Latte (Iced Espresso)
3. `cn_espresso_milano` — Espresso Milano (Hot Espresso)
4. `cn_hot_chocolate` — Italian Hot Chocolate (Hot Drink)
5. `cn_panini_caprese` — Panini Caprese (Sandwich)
6. `cn_tiramisu` — İtalyan Tiramisu (Bakery)
7. `cn_cold_brew` — Concentrato Cold Brew (Cold Brew)
8. `cn_frappe_classico` — Frappe Classico (Frappe)
9. `cn_amaretti` — Amaretti Biscuits (Bakery)
10. `cn_ciabatta` — Mozzarella & Domatesli Ciabatta (Sandwich)
11. `cn_ristretto` — Ristretto (Hot Espresso)
12. `cn_cortado` — Cortado Classico (Hot Espresso)
13. `cn_cappuccino` — Cappuccino Italiano (Hot Espresso)
14. `cn_americano` — Americano (Hot Espresso)
15. `cn_mocha` — Caffe Mocha (Hot Espresso)
16. `cn_white_mocha` — White Chocolate Mocha (Hot Espresso)
17. `cn_iced_americano` — Iced Americano (Iced Espresso)
18. `cn_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `cn_iced_mocha` — Iced Caffe Mocha (Iced Espresso)
20. `cn_iced_vanilla` — Iced Vanilla Latte (Iced Espresso)
21. `cn_iced_flat_white` — Iced Flat White (Iced Espresso)
22. `cn_caramel_cold_brew` — Caramel Iced Cold Brew (Cold Brew)
23. `cn_choco_frappe` — Chocolate Cream Frappe (Frappe)
24. `cn_pistachio_frappe` — Pistachio Frappe (Frappe)
25. `cn_berry_booster` — Berry Fruit Booster (Smoothie)
26. `cn_mango_iced_tea` — Mango Passion Iced Tea (Smoothie)
27. `cn_green_tea` — Green Tea & Lemon (Tea)
28. `cn_chamomile` — Italian Chamomile Tea (Tea)
29. `cn_croissant` — Butter Croissant (Bakery)
30. `cn_pain_au_choco` — Pain au Chocolat (Bakery)
31. `cn_muffin` — Blueberry Muffin (Bakery)
32. `cn_cannoli` — Cannoli Siciliani (Bakery)
33. `cn_cheesecake` — New York Cheesecake (Bakery)
34. `cn_biscotti` — Biscotti Cantucci (Bakery)
35. `cn_prosciutto_panini` — Prosciutto & Provolone Panini (Sandwich)
36. `cn_pesto_toast` — Pesto & Feta Toast (Sandwich)
37. `cn_chicken_sandwich` — Tavuklu Sezar Sandwich (Sandwich)
38. `cn_oat_porridge` — Fit Yulaf Lapası (Fit)
39. `cn_avo_toast` — Vegan Avocado Toast (Fit)
40. `cn_chia_pot` — Chia Seed Fruit Pot (Fit)

#### 5. Coffy (`coffy`) — 40 Items
1. `coffy_filter` — Coffy Filter Coffee (Hot Espresso)
2. `coffy_caramel_latte` — Coffy Caramel Latte (Hot Espresso)
3. `coffy_iced_americano` — Coffy Iced Americano (Iced Espresso)
4. `coffy_bun` — Coffy Bun (Bakery)
5. `coffy_iced_caramel` — Coffy Iced Salted Caramel (Iced Espresso)
6. `coffy_mocha` — Coffy Caffe Mocha (Hot Espresso)
7. `coffy_cold_brew` — Cold Brew Original (Cold Brew)
8. `coffy_cool_lime` — Coffy Cool Lime (Smoothie)
9. `coffy_donut` — Çikolatalı Donut (Bakery)
10. `coffy_tost` — Kaşarlı Sucuklu Tost (Sandwich)
11. `coffy_espresso` — Single Espresso (Hot Espresso)
12. `coffy_double_espresso` — Double Espresso (Hot Espresso)
13. `coffy_latte` — Caffe Latte (Hot Espresso)
14. `coffy_cappuccino` — Cappuccino (Hot Espresso)
15. `coffy_flat_white` — Flat White (Hot Espresso)
16. `coffy_americano` — Americano (Hot Espresso)
17. `coffy_wcm` — White Chocolate Mocha (Hot Espresso)
18. `coffy_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `coffy_iced_wcm` — Iced White Chocolate Mocha (Iced Espresso)
20. `coffy_iced_mocha` — Iced Caffe Mocha (Iced Espresso)
21. `coffy_iced_vanilla` — Iced Vanilla Latte (Iced Espresso)
22. `coffy_cold_brew_latte` — Cold Brew Latte (Cold Brew)
23. `coffy_frappe_vanilla` — Coffy Frappe Vanilla (Frappe)
24. `coffy_frappe_mocha` — Coffy Frappe Mocha (Frappe)
25. `coffy_frappe_caramel` — Coffy Frappe Caramel (Frappe)
26. `coffy_hibiscus` — Hibiscus Iced Tea (Smoothie)
27. `coffy_peach_iced_tea` — Peach Iced Tea (Smoothie)
28. `coffy_tea` — Demleme Çay (Tea)
29. `coffy_green_tea` — Yeşil Çay (Tea)
30. `coffy_croissant` — Tereyağlı Kruvasan (Bakery)
31. `coffy_muffin` — Çikolatalı Muffin (Bakery)
32. `coffy_san_seb` — San Sebastian Cheesecake (Bakery)
33. `coffy_mozaik` — Çikolatalı Mozaik Pasta (Bakery)
34. `coffy_carrot_cake` — Havuçlu Tarçınlı Kek (Bakery)
35. `coffy_turkey_sandwich` — Hindi Füme Sandviç (Sandwich)
36. `coffy_cheese_toast` — Üç Peynirli Tost (Sandwich)
37. `coffy_chicken_wrap` — Tavuklu Wrap (Sandwich)
38. `coffy_granola` — Fit Granola Bowl (Fit)
39. `coffy_protein_bar` — Protein Bar (Fit)
40. `coffy_fit_yogurt` — Meyveli Fit Yoğurt (Fit)

#### 6. Mackbear Coffee Co. (`mackbear`) — 40 Items
1. `mb_espresso` — Mackbear Espresso Solo (Hot Espresso)
2. `mb_bear_latte` — Bear Bear Latte (Hot Espresso)
3. `mb_iced_grizzly_mocha` — Iced Grizzly Mocha (Iced Espresso)
4. `mb_cold_brew` — Bear Cold Brew (Cold Brew)
5. `mb_cinnamon_roll` — Mackbear Cinnamon Roll (Bakery)
6. `mb_polar_caramel` — Polar Iced Caramel Latte (Iced Espresso)
7. `mb_cappuccino` — Bear Cub Cappuccino (Hot Espresso)
8. `mb_wcm` — Mackbear White Chocolate Mocha (Hot Espresso)
9. `mb_brownie` — Brownie Bear (Bakery)
10. `mb_grizzly_toast` — Grizzly Toast (Sandwich)
11. `mb_espresso_double` — Espresso Double (Hot Espresso)
12. `mb_americano` — Caffe Americano (Hot Espresso)
13. `mb_flat_white` — Flat White (Hot Espresso)
14. `mb_cortado` — Mackbear Cortado (Hot Espresso)
15. `mb_hazelnut_latte` — Fındıklı Latte (Hot Espresso)
16. `mb_vanilla_latte` — Vanilyalı Latte (Hot Espresso)
17. `mb_iced_americano` — Iced Americano (Iced Espresso)
18. `mb_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `mb_iced_wcm` — Iced White Mocha (Iced Espresso)
20. `mb_iced_hazelnut` — Iced Hazelnut Latte (Iced Espresso)
21. `mb_iced_spanish` — Iced Spanish Latte (Iced Espresso)
22. `mb_vanilla_cold_brew` — Vanilla Bear Cold Brew (Cold Brew)
23. `mb_chiller_mocha` — Bear Chiller Mocha (Frappe)
24. `mb_chiller_caramel` — Bear Chiller Caramel (Frappe)
25. `mb_chiller_cookies` — Bear Chiller Cookies & Cream (Frappe)
26. `mb_mango_refresher` — Mango Passion Refresher (Smoothie)
27. `mb_berry_smoothie` — Forest Berry Smoothie (Smoothie)
28. `mb_matcha` — Green Tea Matcha Latte (Tea)
29. `mb_black_tea` — Turkish Black Tea (Tea)
30. `mb_croissant` — Butter Croissant (Bakery)
31. `mb_muffin` — Chocolate Muffin (Bakery)
32. `mb_san_sebastian` — San Sebastian Cheesecake (Bakery)
33. `mb_lotus_cookie` — Lotus Biscoff Cookie (Bakery)
34. `mb_red_velvet` — Red Velvet Cake (Bakery)
35. `mb_beef_panini` — Smoked Beef Panini (Sandwich)
36. `mb_pesto_toast` — Mozzarella Tomato Pesto Toast (Sandwich)
37. `mb_club_sandwich` — Chicken Club Sandwich (Sandwich)
38. `mb_granola_bowl` — Fit Granola Bowl (Fit)
39. `mb_chia_pudding` — Chia Seed Fruit Pudding (Fit)
40. `mb_protein_bar` — Peanut Protein Bar (Fit)

#### 7. Arabica Coffee House (`arabica`) — 40 Items
1. `ac_signature_latte` — Arabica Signature Latte (Hot Espresso)
2. `ac_iced_spanish_latte` — Iced Spanish Latte (Iced Espresso)
3. `ac_nitro_cold_brew` — Nitro Cold Brew (Cold Brew)
4. `ac_mocha_frappe` — Arabica Mocha Frappe (Frappe)
5. `ac_honey_nut_latte` — Honey Roasted Nut Latte (Hot Espresso)
6. `ac_iced_caramel_macchiato` — Iced Salted Caramel Macchiato (Iced Espresso)
7. `ac_lotus_cheesecake` — Lotus Cheesecake (Bakery)
8. `ac_avo_bagel` — Avocado & Egg Bagel (Sandwich)
9. `ac_almond_croissant` — Almond Croissant (Bakery)
10. `ac_protein_coffee` — Fit Protein Shake Coffee (Fit)
11. `ac_espresso` — Single Espresso (Hot Espresso)
12. `ac_doppio` — Doppio Espresso (Hot Espresso)
13. `ac_americano` — Caffe Americano (Hot Espresso)
14. `ac_cappuccino` — Cappuccino (Hot Espresso)
15. `ac_flat_white` — Flat White (Hot Espresso)
16. `ac_wcm` — White Chocolate Mocha (Hot Espresso)
17. `ac_iced_americano` — Iced Americano (Iced Espresso)
18. `ac_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `ac_iced_wcm` — Iced White Chocolate Mocha (Iced Espresso)
20. `ac_iced_vanilla` — Iced Vanilla Latte (Iced Espresso)
21. `ac_cold_brew` — Classic Cold Brew (Cold Brew)
22. `ac_caramel_cold_brew` — Caramel Cold Brew (Cold Brew)
23. `ac_vanilla_chiller` — Arabica Vanilla Chiller (Frappe)
24. `ac_java_chiller` — Arabica Java Chip Chiller (Frappe)
25. `ac_berry_refresher` — Berry Refresher (Smoothie)
26. `ac_mango_smoothie` — Mango Peach Smoothie (Smoothie)
27. `ac_chai_latte` — Chai Tea Latte (Tea)
28. `ac_jasmine_tea` — Jasmine Green Tea (Tea)
29. `ac_turkish_tea` — Turkish Black Tea (Tea)
30. `ac_croissant` — Plain Croissant (Bakery)
31. `ac_choco_muffin` — Chocolate Muffin (Bakery)
32. `ac_san_sebastian` — San Sebastian Cheesecake (Bakery)
33. `ac_carrot_cake` — Spiced Carrot Cake (Bakery)
34. `ac_cookie` — Chocolate Chip Cookie (Bakery)
35. `ac_turkey_panini` — Smoked Turkey Panini (Sandwich)
36. `ac_cheese_toast` — Three Cheese Toast (Sandwich)
37. `ac_caesar_wrap` — Chicken Caesar Wrap (Sandwich)
38. `ac_berry_granola` — Fit Berry Granola (Fit)
39. `ac_chia_bowl` — Chia Seed Yogurt Bowl (Fit)
40. `ac_oat_bar` — High Protein Oat Bar (Fit)

#### 8. Gloria Jean's Coffees (`gloria_jeans`) — 40 Items
1. `gj_voltage_chiller` — Voltage Chiller (Frappe)
2. `gj_vanilla_chiller` — Very Vanilla Chiller (Frappe)
3. `gj_caramelatte` — Caramelatte (Hot Espresso)
4. `gj_iced_caramelatte` — Iced Caramelatte (Iced Espresso)
5. `gj_creme_brulee_latte` — Creme Brulee Latte (Hot Espresso)
6. `gj_iced_mocha_gold` — Iced Mocha Gold (Iced Espresso)
7. `gj_cold_brew` — Cold Brew Single Origin (Cold Brew)
8. `gj_raspberry_lemonade` — Raspberry Lemonade Chiller (Smoothie)
9. `gj_triple_choco_muffin` — Triple Chocolate Muffin (Bakery)
10. `gj_roast_beef_sandwich` — Roast Beef & Cheese Sandwich (Sandwich)
11. `gj_espresso` — Espresso Single (Hot Espresso)
12. `gj_espresso_double` — Espresso Double (Hot Espresso)
13. `gj_americano` — Americano (Hot Espresso)
14. `gj_latte` — Caffe Latte (Hot Espresso)
15. `gj_cappuccino` — Cappuccino (Hot Espresso)
16. `gj_flat_white` — Flat White (Hot Espresso)
17. `gj_wcm` — White Chocolate Mocha (Hot Espresso)
18. `gj_iced_americano` — Iced Americano (Iced Espresso)
19. `gj_iced_latte` — Iced Caffe Latte (Iced Espresso)
20. `gj_iced_wcm` — Iced White Chocolate Mocha (Iced Espresso)
21. `gj_iced_vanilla` — Iced Vanilla Latte (Iced Espresso)
22. `gj_vanilla_cold_brew` — Vanilla Sweet Cream Cold Brew (Cold Brew)
23. `gj_mango_chiller` — Mango Fruit Chiller (Frappe)
24. `gj_choco_chiller` — Chocolate Chiller (Frappe)
25. `gj_strawberry_refresher` — Strawberry Refresher (Smoothie)
26. `gj_iced_green_tea` — Iced Green Tea (Smoothie)
27. `gj_chai_latte` — Chai Tea Latte (Tea)
28. `gj_earl_grey` — Earl Grey Tea (Tea)
29. `gj_turkish_tea` — Demleme Türk Çayı (Tea)
30. `gj_croissant` — Butter Croissant (Bakery)
31. `gj_muffin` — Blueberry Muffin (Bakery)
32. `gj_cheesecake` — New York Cheesecake (Bakery)
33. `gj_brownie` — Brownie Delight (Bakery)
34. `gj_cookie` — Chocolate Cookie (Bakery)
35. `gj_turkey_toast` — Smoked Turkey Cheese Toast (Sandwich)
36. `gj_pesto_panini` — Mozzarella Pesto Panini (Sandwich)
37. `gj_chicken_wrap` — Chicken Club Wrap (Sandwich)
38. `gj_fit_granola` — Fit Fruit Granola (Fit)
39. `gj_chia_bowl` — Chia Seed Yogurt Bowl (Fit)
40. `gj_oat_bar` — Oats & Honey Bar (Fit)

#### 9. David People (`david_people`) — 40 Items
1. `dp_signature_espresso` — David Signature Espresso (Hot Espresso)
2. `dp_creamy_caramel_latte` — David Creamy Caramel Latte (Hot Espresso)
3. `dp_iced_white_mocha` — Iced White Mocha Royale (Iced Espresso)
4. `dp_cold_brew` — David Cold Brew (Cold Brew)
5. `dp_club_sandwich` — David Club Sandwich (Sandwich)
6. `dp_brownie` — Sütlü Çikolatalı Brownie (Bakery)
7. `dp_iced_spanish_latte` — Iced Spanish Latte Royale (Iced Espresso)
8. `dp_berry_smoothie` — David Berry Smoothie (Smoothie)
9. `dp_san_sebastian` — San Sebastian Cheesecake (Bakery)
10. `dp_bazlama_tost` — Kaşarlı Sucuklu Bazlama Tost (Sandwich)
11. `dp_espresso` — Single Espresso (Hot Espresso)
12. `dp_americano` — Caffe Americano (Hot Espresso)
13. `dp_latte` — Caffe Latte (Hot Espresso)
14. `dp_cappuccino` — Cappuccino (Hot Espresso)
15. `dp_flat_white` — Flat White (Hot Espresso)
16. `dp_mocha` — Caffe Mocha (Hot Espresso)
17. `dp_iced_americano` — Iced Americano (Iced Espresso)
18. `dp_iced_latte` — Iced Caffe Latte (Iced Espresso)
19. `dp_iced_mocha` — Iced Caffe Mocha (Iced Espresso)
20. `dp_iced_vanilla` — Iced Vanilla Latte (Iced Espresso)
21. `dp_caramel_cold_brew` — Caramel Cold Brew (Cold Brew)
22. `dp_vanilla_cold_brew` — Vanilla Cold Brew (Cold Brew)
23. `dp_caramel_frappe` — David Caramel Frappe (Frappe)
24. `dp_mocha_frappe` — David Mocha Frappe (Frappe)
25. `dp_cookie_frappe` — Chocolate Cookie Frappe (Frappe)
26. `dp_mango_refresher` — Mango Passion Refresher (Smoothie)
27. `dp_orange_juice` — Fresh Orange Juice (Smoothie)
28. `dp_green_tea` — Green Tea Mint (Tea)
29. `dp_black_tea` — Turkish Black Tea (Tea)
30. `dp_croissant` — Butter Croissant (Bakery)
31. `dp_muffin` — Chocolate Muffin (Bakery)
32. `dp_carrot_cake` — Havuçlu Tarçınlı Kek (Bakery)
33. `dp_tiramisu` — İtalyan Tiramisu (Bakery)
34. `dp_cookie` — Belgik Çikolatalı Cookie (Bakery)
35. `dp_beef_panini` — Smoked Beef Panini (Sandwich)
36. `dp_mozzarella_toast` — Mozzarella Tomato Toast (Sandwich)
37. `dp_caesar_wrap` — Tavuklu Sezar Wrap (Sandwich)
38. `dp_granola_bowl` — Fit Fruit Granola Bowl (Fit)
39. `dp_chia_pot` — Chia Seed Berry Pot (Fit)
40. `dp_protein_bar` — High Protein Bar (Fit)

#### 10. Tchibo (`tchibo`) — 40 Items
1. `tch_privat_filter` — Tchibo Privat Kaffee Filter (Hot Espresso)
2. `tch_wiener_melange` — Wiener Melange (Hot Espresso)
3. `tch_iced_caffe_crema` — Iced Caffè Crema (Iced Espresso)
4. `tch_apfelstrudel` — Alman Elmalı Tart (Apfelstrudel) (Bakery)
5. `tch_cold_brew` — Tchibo Cold Brew (Cold Brew)
6. `tch_iced_vanilla_latte` — Iced Vanilla Latte (Iced Espresso)
7. `tch_kaesekuchen` — Käsekuchen (Alman Cheesecake) (Bakery)
8. `tch_brezel` — Alman Simidi Brezel & Tereyağı (Sandwich)
9. `tch_choco_chiller` — Choco Chiller (Frappe)
10. `tch_gravyer_sandwich` — Gravyerli & Füme Etli Sandviç (Sandwich)
11. `tch_espresso` — Single Espresso (Hot Espresso)
12. `tch_espresso_doppio` — Espresso Doppio (Hot Espresso)
13. `tch_latte` — Caffe Latte (Hot Espresso)
14. `tch_cappuccino` — Cappuccino (Hot Espresso)
15. `tch_americano` — Americano (Hot Espresso)
16. `tch_mocha` — Caffè Mocha (Hot Espresso)
17. `tch_wcm` — White Chocolate Mocha (Hot Espresso)
18. `tch_iced_americano` — Iced Americano (Iced Espresso)
19. `tch_iced_latte` — Iced Caffe Latte (Iced Espresso)
20. `tch_iced_wcm` — Iced White Chocolate Mocha (Iced Espresso)
21. `tch_iced_caramel` — Iced Caramel Latte (Iced Espresso)
22. `tch_vanilla_cold_brew` — Vanilla Sweet Cream Cold Brew (Cold Brew)
23. `tch_coffee_frappe` — Tchibo Coffee Frappe (Frappe)
24. `tch_caramel_frappe` — Caramel Frappe (Frappe)
25. `tch_mocha_frappe` — Mocha Frappe (Frappe)
26. `tch_ginger_lemon_tea` — Zencefilli Limonlu Soğuk Çay (Smoothie)
27. `tch_orange_juice` — Taze Portakal Suyu (Smoothie)
28. `tch_earl_grey` — Bio Earl Grey Çayı (Tea)
29. `tch_green_tea` — Bio Yeşil Çay (Tea)
30. `tch_croissant` — Tereyağlı Kruvasan (Bakery)
31. `tch_muffin` — Çikolatalı Muffin (Bakery)
32. `tch_sacher_torte` — Sacher Torte (Bakery)
33. `tch_cinnamon_roll` — Zimtschnecke (Tarçınlı Çörek) (Bakery)
34. `tch_berliner` — Marmelatlı Berlin Çöreği (Berliner) (Bakery)
35. `tch_gouda_tost` — Gouda Peynirli & Hindi Füme Tost (Sandwich)
36. `tch_tuna_sandwich` — Ton Balıklı Sandviç (Sandwich)
37. `tch_schnitzel_sandwich` — Tavuklu Schnitzel Sandviç (Sandwich)
38. `tch_oat_porridge` — Fit Yulaf Lapası & Meyve (Fit)
39. `tch_chia_bowl` — Chia Tohumlu Yoğurt Bowl (Fit)
40. `tch_muesli_bar` — Alman Müsli Bar (Fit)

---

### 4.4 Macro Distribution Guidelines & Verification Rules

Worker M2 must adhere strictly to these quantitative rules for `baseMacros`:

1. **`sugar <= carbs` Rule**:
   - `sugar` MUST be `<= carbs`.
   - Sugar values for drinks: Black Coffee (0g), Lattes (10-15g), Sugary Lattes (25-45g), Frappes (40-65g).
   - Sugar values for food: Croissant (4g), Cheesecake (25-35g), Toast (2-4g).

2. **`satFat <= fat` Rule**:
   - `satFat` MUST be `<= fat`.
   - Whole Milk Drinks (~7g fat, 4.2g satFat).
   - Whipped Cream Drinks (~16g fat, 10g satFat).
   - Black Drinks (0g fat, 0g satFat).

3. **Caffeine Guidelines**:
   - Single Espresso / Americano: ~75 mg
   - Double Espresso / Cold Brew / Shaken Espresso: ~150-200 mg
   - Decaf / Tea: ~0-45 mg
   - Bakery / Food: 0 mg (unless containing espresso/chocolate: ~10-25 mg)

4. **Sodium Guidelines**:
   - Milk beverages: ~90-180 mg
   - Frappes & Flavored drinks: ~150-300 mg
   - Savory Sandwiches & Toast: ~450-850 mg
   - Plain Espresso / Tea: ~5-15 mg

---

## 5. Verification Method

To verify Worker M2's implementation once completed:

1. **Build Test**:
   Run `npm run build` to ensure all TypeScript types, category imports, and array syntax are valid.

2. **Item Count Automated Audit**:
   Execute node inline check to verify chain counts:
   ```bash
   node -e "const { MENU_ITEMS } = require('./src/data/items'); const { CHAINS } = require('./src/data/chains'); CHAINS.forEach(c => { const cnt = MENU_ITEMS.filter(i => i.chainId === c.id).length; console.log(c.id, cnt); if (cnt < 40) throw new Error('Deficit in ' + c.id); }); console.log('Total items:', MENU_ITEMS.length);"
   ```

3. **Macro Mathematical Integrity Audit**:
   Execute node inline check to verify `sugar <= carbs` and `satFat <= fat`:
   ```bash
   node -e "const { MENU_ITEMS } = require('./src/data/items'); MENU_ITEMS.forEach(item => { if (item.baseMacros.sugar > item.baseMacros.carbs) throw new Error('Sugar > Carbs in ' + item.id); if (item.baseMacros.satFat && item.baseMacros.satFat > item.baseMacros.fat) throw new Error('SatFat > Fat in ' + item.id); }); console.log('All macro integrity checks passed!');"
   ```
