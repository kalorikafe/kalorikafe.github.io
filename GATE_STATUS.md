# GATE_STATUS.md — Kalite Kapıları Durumu

Bu dosya, 5 Ağustos 2026 gece çalışması sonrası kalite kapılarını gösterir.
Dokümandaki "67/67 E2E" ibaresi, kaynak metni denetleyen eski legacy paket
içindi; gerçek tarayıcı E2E kanıtı değildir.

## Güncel kalite kapıları

| Komut | Görev | Son sonuç |
|---|---|---|
| `npm run catalog:audit` | Katalog sözleşmeleri: benzersiz ID, zincir, makro, provenance, görsel kuralları, klon denetimi, >199 ürün | ✅ 845 ürün · 845 benzersiz görsel · 0 hata |
| `npm run lint` | oxlint (src + testler) | ✅ 0 uyarı / 0 hata |
| `npm run build` | TypeScript + Vite üretim derlemesi | ✅ |
| `npm run test:unit` | Vitest (normalizasyon, filtre, provenance, makro motoru) | ✅ 31/31 |
| `npm run test:e2e` | Playwright + Chromium (arama önerileri, klavye, tema kalıcılığı, 390/1440 × iki tema, görsel yükleme) | ✅ 17/17 |
| `npm test` | unit + E2E | ✅ |
| `npm audit` | Bağımlılık güvenlik taraması | ✅ 0 açık |

Son doğrulama, her çalıştırmada komut çıktısıyla yeniden üretilmelidir; bu
belge sabit bir "her zaman yeşil" iddiası taşımaz. Detaylı çıktılar
[DEEPSEEK_NIGHT_REPORT.md](./DEEPSEEK_NIGHT_REPORT.md) bölüm 8'dedir.