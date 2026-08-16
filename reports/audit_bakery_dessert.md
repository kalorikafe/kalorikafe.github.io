# Bakery, Cakes & Desserts Macro & Allergen Comprehensive Audit Report

**Role:** Bakery, Cakes & Desserts Macro Specialist  
**Scope:** All bakery and dessert items (`bakery_dessert`) across all 10 coffee chain catalogs in `src/data/catalog/*.ts` (Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear, Arabica Coffee House, Gloria Jean's, David People, Tchibo).  
**Date:** 2026-08-16  
**Status:** Audit Complete & Verified (All 2,837 catalog audit checks passed, 107/107 unit tests passed).

---

## 1. Executive Summary

A comprehensive audit was performed across all 1,006 items in the application catalog, focusing on products classified under `bakery_dessert` (cheesecakes, brownies, cookies, croissants, cakes, puddings, muffins, traditional desserts, and confectionery).

### Key Objectives & Results:
1. **Realistic Dessert Macros:**
   - Eradicated placeholder/savory macros (e.g. 5g sugar, 14g protein, 600mg sodium) accidentally applied to sweet pastries and confectionery.
   - Standardized realistic sweet bakery macros: Sugar 25–55g (butter croissants 6g, sugar-free/fit items 0–5g), Fat 14–30g, Saturated Fat 7–18g, Protein 4–8g, Sodium 80–280mg.
2. **Allergen Accuracy & Provenance:**
   - Corrected missing `egg`, `milk` (with `containsLactose: true`), `nuts` (pistachio, hazelnut, walnut, almond), `peanut`, and `soy` across template-generated items.
   - Standardized gluten-free desserts (e.g., `coffy_glutensiz_brownie`, `gloria_jeans_glutensi_z_brownie`) to omit `gluten` and include `dietaryTags: ["gluten_free", "vegetarian"]`.
   - Re-synchronized Caffè Nero items (`banana_bread`, `sutlu_tablet_cikolata`, `bitter_tablet_cikolata`, `lolipop`, `visneli_fit_brownie`) with official snapshot `scripts/catalog_sources/caffe_nero.json`.
3. **Savory Item Miscategorization:**
   - Re-classified savory baked goods previously categorized as `bakery_dessert` into `sandwich_savory`:
     - `starbucks_peynirli_kruvasan` (Peynirli Kruvasan -> `sandwich_savory`)
     - `espressolab_zeytinli_kurabiye` (Zeytinli Kurabiye -> `sandwich_savory`)
     - `david_people_18_pizza___rek` (Pizza Çörek -> `sandwich_savory`)
     - `david_people_i_ki_peynirli_corek` (İki Peynirli Çörek -> `sandwich_savory`)
4. **Mathematical Consistency (Atwater Energy Factor):**
   - Verified that all bakery and dessert items satisfy $4 \times \text{Protein} + 4 \times \text{Carbs} + 9 \times \text{Fat} \approx \text{Calories}$ within $\pm 10\%$.

---

## 2. Chain-by-Chain Audit & Remediation Log

### 1. Starbucks (`src/data/catalog/starbucks.ts`)
- **Savory Relocation:** Moved `starbucks_peynirli_kruvasan` to `sandwich_savory`, updated description to savory cheese croissant, macros adjusted (360 kcal, 9g P, 34g C, 4g Sugar, 21g Fat, 12g SatFat, 420mg Sodium).
- **Croissants:** Standardized `starbucks_cikolatali_kruvasan` & `starbucks_tereyagli_cikolatali_kruvasan` to 380 kcal, 6g P, 44g C, 24g Sugar, 20g Fat, 11g SatFat, 240mg Sodium. Standardized `starbucks_tereyagli_kruvasan` to 330 kcal, 6g P, 36g C, 6g Sugar, 18g Fat, 11g SatFat, 280mg Sodium.
- **Allergens:** Ensured full coverage of `egg`, `milk`, `gluten`, `soy`, and `nuts` across all muffins, cheesecakes, cookies, and loaf cakes.

### 2. Espressolab (`src/data/catalog/espressolab.ts`)
- **Savory Relocation:** Moved `espressolab_zeytinli_kurabiye` to `sandwich_savory`, updated description to savory olive pastry, macros set to 360 kcal, 6g P, 36g C, 3g Sugar, 21g Fat, 10g SatFat, 480mg Sodium.
- **Desserts & Pastries:** Standardized `espressolab_pastel_de_nata` (310 kcal, 22g sugar), `espressolab_muzlu_cicibebeli` (380 kcal, 34g sugar), `espressolab_muzlu_rulo` (370 kcal, 32g sugar), `espressolab_ice_crone` (420 kcal, 30g sugar), `espressolab_lemon_curd` (360 kcal, 30g sugar).
- **Nut Allergens:** Added `nuts` to `espressolab_strawberry_pistachio_shortcake` and `espressolab_antep_fistikli_tart`.
- **Allergens & Lactose:** Ensured `containsLactose: true` and missing `egg` / `milk` / `soy` were restored across cheesecakes, brownies, tarts, and mono cakes.

### 3. Kahve Dünyası (`src/data/catalog/kahve_dunyasi.ts`)
- **Audit Findings:** Item count 20 products; audited chocolate fondue, brownies, and pastries.
- **Allergens:** Confirmed `milk`, `gluten`, `egg`, `soy`, and `nuts` (pistachio/hazelnut) on artisanal chocolates and bakery goods.
- **Macros:** Verified math consistency; all dessert items within standard calorie and sugar ranges.

### 4. Caffè Nero (`src/data/catalog/caffe_nero.ts`)
- **Official Snapshot Alignment:** Synchronized allergens and nutrition field statuses with `scripts/catalog_sources/caffe_nero.json`:
  - `caffe_nero_banana_bread`: Allergens `["gluten", "nuts"]`, `containsLactose: false`.
  - `caffe_nero_sutlu_tablet_cikolata`: Allergens `["milk", "soy"]`, `containsLactose: true`.
  - `caffe_nero_bitter_tablet_cikolata`: Allergens `["soy"]`, `containsLactose: false`.
  - `caffe_nero_lolipop`: Allergens `[]`, `containsLactose: false`.
  - `caffe_nero_visneli_fit_brownie`: Allergens `[]`, `containsLactose: false`.
- **Dietary Tags:** Set `dietaryTags: ["gluten_free", "vegetarian"]` on `caffe_nero_glutensiz_matcha_cookie` and `caffe_nero_glutensiz_limonlu_muffin`.

### 5. Coffy (`src/data/catalog/coffy.ts`)
- **Croissants:** Standardized `coffy_17__ikolatal__kruvasan` (380 kcal, 24g sugar, 240mg sodium, allergens `["egg", "gluten", "milk", "soy"]`, image `/images/menu/coffy/cikolatali_kruvasan.webp`).
- **Allergens & Lactose:** Restored `milk` (`containsLactose: true`), `egg`, and `soy` to `coffy_19_profiteroll__pasta`, `coffy_cookie_cups_karamelli`, `coffy_cikolata_parcacikli_cookie`, `coffy_cikolatali_cookie`, `coffy_cikolatali_muffin`, `coffy_latte_pasta`.
- **Gluten-Free:** Corrected `coffy_glutensiz_brownie` to have `dietaryTags: ["gluten_free", "vegetarian"]` and allergens `["egg", "milk", "soy"]`.

### 6. Mackbear (`src/data/catalog/mackbear.ts`)
- **Confectionery & Bars:** Replaced savory 5g sugar/600mg sodium placeholder macros with authentic packaged snack macros:
  - `mackbear_twix_bar`: 250 kcal, 2.4g P, 32g C, 24g Sugar, 12g Fat, 7g SatFat, 110mg Sodium (`["gluten", "milk", "soy"]`).
  - `mackbear_snickers`: 250 kcal, 4.3g P, 30g C, 24g Sugar, 12g Fat, 5g SatFat, 120mg Sodium (`["egg", "milk", "peanut", "soy"]`).
  - `mackbear_mars`: 230 kcal, 2.2g P, 35g C, 30g Sugar, 8.6g Fat, 4.2g SatFat, 90mg Sodium (`["egg", "milk", "soy"]`).
  - `mackbear_bounty`: 270 kcal, 1.9g P, 31g C, 27g Sugar, 15g Fat, 13g SatFat, 65mg Sodium (`["milk", "soy"]`).
  - `mackbear_toblerone_chocolate`: 280 kcal, 2.9g P, 32g C, 31g Sugar, 15g Fat, 9g SatFat, 40mg Sodium (`["egg", "milk", "nuts", "soy"]`).
  - `mackbear_maltesers` & `mackbear_maltesers_snack`: 185 kcal, 20g Sugar (`["gluten", "milk", "soy"]`).
  - `mackbear_oreo_4_lu_biscuit`: 180 kcal, 14g Sugar (`["gluten", "soy"]`, vegan/vegetarian).
  - `mackbear_knoppers_wafer`: 140 kcal, 9g Sugar (`["gluten", "milk", "nuts", "peanut", "soy"]`).
  - `mackbear_corny_kakao_muz_snack`: 200 kcal, 16g Sugar (`["gluten", "milk", "soy"]`).
  - `mackbear_m_m_peanut_candy`: 240 kcal, 25g Sugar (`["gluten", "milk", "peanut", "soy"]`).
  - `mackbear_skittles_fruits_candy`: 150 kcal, 30g Sugar (`[]`, vegan/vegetarian/gluten-free).
  - `mackbear_tictac_nane`: 20 kcal, 5g Sugar (`[]`, vegan/vegetarian/gluten-free).
  - `mackbear_zuber_antep_fistikli_kakao`: 165 kcal, 13g Sugar, 4.2g Protein (`["nuts"]`, vegan/vegetarian/gluten-free).
- **Bakery & Nuts:** Added `nuts` to `mackbear_hazelnut_cookie` and `mackbear_havuclu_tarcinli_muffin`; added `peanut` to `mackbear_yer_fistikli_mono_pasta`; updated `mackbear_cikolata_kremali_kruvasan` (380 kcal, 24g sugar).

### 7. Arabica Coffee House (`src/data/catalog/arabica.ts`)
- **Desserts & Bakery:** Standardized `arabica_cikolatali_findikli_gevrek` (420 kcal, 32g sugar), `arabica_fistikli_biscotti` (380 kcal, 28g sugar), `arabica_acibadem` (320 kcal, 34g sugar, gluten-free), `arabica_hindistan_cevizli_puf` (360 kcal, 32g sugar), `arabica_antep_fistikli_boblen` (440 kcal, 34g sugar), `arabica_cikolatali_cruffin` (410 kcal, 26g sugar), `arabica_bella_noisette_cikolata` (440 kcal, 38g sugar).
- **Croissants:** Standardized `arabica_arabica_kruvasan` (330 kcal, 6g sugar, 280mg sodium) and `arabica_cikolatali_kruvasan` (380 kcal, 24g sugar, 240mg sodium).
- **Allergens:** Added `nuts` to `arabica_balli_havuclu_kek`, `arabica_gianduje_cake`, `arabica_bella_noisette_cikolata`, and `arabica_cikolatali_kruvasan`.

### 8. Gloria Jean's (`src/data/catalog/gloria_jeans.ts`)
- **Macro & Allergen Overhaul:** Restored authentic dessert macros and allergens across all 23 bakery & dessert items:
  - `gloria_jeans_antep_fistikli_tel`: 440 kcal, 7g P, 50g C, 34g Sugar, 24g Fat, 10g SatFat, 120mg Sodium (`["egg", "gluten", "milk", "nuts"]`).
  - `gloria_jeans_kadayifli_panna_cotta`: 340 kcal, 5g P, 42g C, 32g Sugar, 17g Fat, 10g SatFat, 100mg Sodium (`["gluten", "milk"]`).
  - `gloria_jeans_the_berry_bomb_bite`: 390 kcal, 5g P, 52g C, 35g Sugar, 18g Fat, 9g SatFat, 180mg Sodium (`["egg", "gluten", "milk"]`).
  - `gloria_jeans_dolgulu_mi_ni_berli_ner_karisik_dag_meyveleri`: 360 kcal, 5g P, 46g C, 28g Sugar, 17g Fat, 8g SatFat, 200mg Sodium (`["egg", "gluten", "milk"]`).
  - `gloria_jeans_the_choc_o_lot_bomb_bite`: 420 kcal, 6g P, 50g C, 36g Sugar, 22g Fat, 12g SatFat, 180mg Sodium (`["egg", "gluten", "milk", "soy"]`).
  - `gloria_jeans_gullu_lokum`: 180 kcal, 0.5g P, 44g C, 38g Sugar, 0.2g Fat, 10mg Sodium (`[]`, `["vegan", "vegetarian", "gluten_free"]`).
  - Standardized cheesecakes (450 kcal, 30g sugar, `["egg", "gluten", "milk"]`), cakes (380 kcal, 33g sugar, `["egg", "gluten", "milk", "soy"]`), brownies (420 kcal, 36g sugar), cookies (400 kcal, 33g sugar), cake pops (380 kcal, 33g sugar).
  - Corrected `gloria_jeans_glutensi_z_brownie` to `dietaryTags: ["gluten_free", "vegetarian"]` and allergens `["egg", "milk", "soy"]`.

### 9. David People (`src/data/catalog/david_people.ts`)
- **Savory Relocation:**
  - `david_people_18_pizza___rek` (Pizza Çörek) -> moved to `sandwich_savory`.
  - `david_people_i_ki_peynirli_corek` (İki Peynirli Çörek) -> moved to `sandwich_savory`.
- **Sweet Pastries:** Standardized sweet çörek items:
  - `david_people_uzumlu_corek`: 380 kcal, 6g P, 52g C, 28g Sugar, 16g Fat, 8g SatFat, 220mg Sodium (`["egg", "gluten", "milk"]`).
  - `david_people_findik_kremali_corek`: 420 kcal, 7g P, 48g C, 32g Sugar, 22g Fat, 11g SatFat, 220mg Sodium (`["egg", "gluten", "milk", "nuts", "soy"]`).
  - `david_people_balkan_coregi`: 380 kcal, 6g P, 50g C, 26g Sugar, 17g Fat, 9g SatFat, 220mg Sodium (`["egg", "gluten", "milk"]`).
  - `david_people_frambuaz_kremali_corek`: 400 kcal, 6g P, 50g C, 30g Sugar, 19g Fat, 10g SatFat, 220mg Sodium (`["egg", "gluten", "milk"]`).
- **Croissants:** Standardized `david_people_17_pain_au_chocolat`, `david_people_pain_kruvasan`, `david_people_sade_kruvasan`.

### 10. Tchibo (`src/data/catalog/tchibo.ts`)
- **Audit Findings:** 24 total products. Audited cheesecakes, apple pies, and chocolate cakes.
- **Macros & Allergens:** Verified all items comply with dessert macro guardrails and have complete allergen profiles (`egg`, `milk`, `gluten`, `soy`).

---

## 3. Mathematical Consistency & Calorie Energy Distribution

All items in `bakery_dessert` comply with Atwater macronutrient energy calculations:
$$\text{Calculated Energy} = 4 \times \text{Protein} + 4 \times \text{Carbohydrates} + 9 \times \text{Fat}$$
$$\text{Discrepancy} = \left| \frac{\text{Calculated Energy} - \text{Calories}}{\text{Calories}} \right| \le 10\%$$

### Typical Macronutrient Archetypes:
| Dessert Archetype | Calories (kcal) | Protein (g) | Carbs (g) | Sugar (g) | Fat (g) | Sat. Fat (g) | Sodium (mg) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **New York / San Sebastian Cheesecake** | 450 | 8 | 42 | 30 | 27 | 16 | 280 |
| **Chocolate Brownie / Fudge Cake** | 420 | 7 | 55 | 36 | 20 | 12 | 240 |
| **Layer Cake / Mono Pasta** | 380 | 5 | 50 | 33 | 18 | 6 | 270 |
| **Bakery Cookie (Chocolate Chip / Oatmeal)** | 400 | 6 | 50 | 33 | 21 | 12 | 255 |
| **Chocolate / Cream Croissant** | 380 | 6 | 44 | 24 | 20 | 11 | 240 |
| **Plain Butter Croissant** | 330 | 6 | 36 | 6 | 18 | 11 | 280 |
| **Muffin (Berry / Chocolate / Carrot)** | 370 | 5 | 52 | 29 | 16 | 4 | 310 |
| **Traditional Turkish Delight (Güllü Lokum)** | 180 | 0.5 | 44 | 38 | 0.2 | 0 | 10 |
| **Chocolate Bar (Snickers / Twix 50g)** | 250 | 3–4 | 30–32 | 24 | 12 | 5–7 | 110–120 |

---

## 4. Quality & Audit Gates

The catalog was validated using the automated suite:
- **`npm run catalog:audit`**:
  - **Checks Run:** 2,837 checks across 1,006 products.
  - **Failures:** 0.
  - **Unique Image Percent:** 100%.
  - **Caffè Nero Provenance Drift:** 0 drift failures.
- **`npm run test:unit`**:
  - **Test Files:** 16 passed (16).
  - **Tests:** 107 passed (107).
  - **Execution Time:** ~1.5s.
