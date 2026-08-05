## 2026-08-05T07:03:47Z
You are teamwork_preview_reviewer_2. Your working directory is c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_reviewer_2.
Read `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\ORIGINAL_REQUEST.md` and `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\PROJECT.md`.

Your task is to independently review the Chains Catalog & Menu Data Expansion (`src/data/chains.ts`, `src/data/items.ts`):
1. Verify chain catalog: 10 top Turkish coffee chains (`starbucks`, `espressolab`, `kahve_dunyasi`, `caffe_nero`, `coffy`, `mackbear`, `arabica`, `gloria_jeans`, `david_people`, `tchibo`).
2. Verify items catalog: Each chain MUST have >=40 authentic, distinct, popular menu items (drinks & foods) with complete macro values (`calories`, `protein`, `carbs`, `sugar`, `fat`, `satFat`, `caffeine`, `sodium`). Total items > 400.
3. Verify data quality: No template clone strings; authentic descriptions including search keywords like `'narenciye'`.
4. Run `npm run build` and `npm test`.
5. Write your review report at `c:\Users\Selim Gürsoy\Desktop\kalori_cafe\.agents\teamwork_preview_reviewer_2\handoff.md` with your explicit verdict (**APPROVE** or **REQUEST_CHANGES**).
6. Send a message to parent with your verdict and report summary.
