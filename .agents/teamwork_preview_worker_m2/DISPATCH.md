## 2026-08-05T06:58:12Z
<USER_REQUEST>
You are teamwork_preview_worker_m2. Your working directory is c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_worker_m2.
You own EXCLUSIVELY these files:
- `src/data/chains.ts`
- `src/data/items.ts`

Please read `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\ORIGINAL_REQUEST.md` and `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\PROJECT.md`.
Also check survey findings at `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_explorer_survey_2\handoff.md` and `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_explorer_survey_3\handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Objectives:
1. Update `src/data/chains.ts`:
   - Include Turkey's top popular coffee chains: **Starbucks**, **Espressolab**, **Kahve Dünyası**, **Caffè Nero**, **Coffy**, **Mackbear Coffee Co.**, **Arabica Coffee House**, **Gloria Jean's**, **David People**, **Tchibo**.
   - Ensure chain IDs match requirements (specifically `coffy`, `david_people`, `mackbear`, `starbucks`, `espressolab`, `kahve_dunyasi`, `caffe_nero`, `arabica`, `gloria_jeans`, `tchibo`).
2. Update `src/data/items.ts`:
   - Every defined chain MUST have AT LEAST 40 authentic, popular, realistic menu items (drinks and foods) with accurate macro values (`calories`, `protein`, `carbs`, `sugar`, `fat`, `satFat`, `caffeine`, `sodium`).
   - Total items count MUST exceed `number of chains * 40` (e.g. 400+ total items).
   - Eliminate generic template clones: create distinct, authentic menu items for each chain (e.g., Türk Kahvesi, Damla Sakızlı Türk Kahvesi, Sahlep, Fıstıklı Fit Cake for Kahve Dünyası; 3rd wave Cold Brews & Iced Lattes for Espressolab; Italian Paninis & Flat White for Caffè Nero; etc.).
   - Include authentic descriptions and ensure description keywords tested by E2E tests (e.g., `'narenciye'` in a citrus drink/tea description) are present.
3. Verification:
   - Run `npm run build` and `npm test` after updating data.
   - Document changes, chain list, item counts, test results, and write handoff report at `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_worker_m2\handoff.md`.
4. Send a message to parent upon completion with a summary of changes and verification results.
</USER_REQUEST>
