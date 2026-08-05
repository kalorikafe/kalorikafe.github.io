# Gate Status

Bu dosyadaki önceki “67/67 E2E” sonucu kaynak metni ve kopyalanmış uygulama mantığını denetleyen legacy pakete aitti; gerçek tarayıcı E2E kanıtı değildi.

Güncel kalite kapısı:

- `npm run build`: TypeScript + Vite üretim derlemesi
- `npm run lint`: oxlint
- `npm run test:unit`: Vitest davranış/golden testleri
- `npm run test:e2e`: Playwright ile gerçek Chromium akışları
- `npm test`: unit + Playwright E2E

Son doğrulama sonucu, her çalıştırmadan sonra komut çıktısıyla değerlendirilmelidir; bu belge sabit bir “daima geçer” iddiası taşımaz.
