# tests/legacy — Tarihsel (Arşiv) Test Paketi

Bu dizin, Kalori Cafe'nin **eski 67 senaryolu legacy test paketini** içerir
(`tier1`–`tier4` kaynak-denetim dosyaları + `run-e2e-tests.ts` çalıştırıcısı).

## ÖNEMLİ: Bu paket artık aktif bir kalite kapısı değildir

- **Çalıştırmayın / canlandırmayın.** Eski `test:legacy` / `lint:legacy`
  komutları `package.json`'dan kaldırılmıştır; `tsx` bağımlılığı eklenmez.
- Bu dosyalar yalnızca **tarihsel kayıt** olarak saklanır: 2026-08-06
  yayın hazırlığında güncel tarayıcı tabanlı Playwright suite'i ile
  değiştirildi.
- Legacy paket, çalışma zamanı tarayıcı davranışını değil **kaynak
  metinleri** denetler (ör. `fs.readFileSync` ile string araması) ve güncel
  uygulamayla uyumlu değildir; içindeki "67/67" vb. iddialar tarihseldir.
- Aktif kalite kapıları için:

  ```bash
  npm run catalog:audit   # katalog sözleşmeleri
  npm run lint            # oxlint (src + tests/unit + tests/e2e)
  npm test                # Vitest unit + Playwright (Chromium) E2E
  npm run build
  npm audit               # bağımlılık güvenlik taraması
  ```

Legacy paketin değer korunan senaryoları güncel testlere taşındı:

| Eski senaryo alanı | Güncel karşılığı |
|---|---|
| Boyut sınırı / süt farkı / şurup / shot | `tests/unit/macroCalculator.test.ts` |
| Alerjen peek & filtre (peanut dahil) | `tests/unit/allergenAndProvenance.test.ts` + `tests/e2e/critical-flows.spec.ts` |
| localStorage migrasyonu (makro hedefleri) | `tests/unit/macroGoals.test.ts` + E2E migrazor testi |
| Katalog sayıları / provenance | `scripts/catalog-audit.ts` + `tests/unit/dataQuality.test.ts` |