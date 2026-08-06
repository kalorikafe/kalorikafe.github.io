# GATE_STATUS.md — Kalite Kapıları Durumu

Bu dosya, 6 Ağustos 2026 yayın (public release) hazırlığındaki gerçek
kapı sonuçlarını gösterir; her sonuç bu çalışmada komutlarla **son
commit'ten** (HEAD `c1142e76`) yeniden üretildi. "67/67" gibi eski legacy
paket iddiaları geçersizdir — eski kaynak-metin suite'i `tests/legacy/`
altına arşivlenmiştir ve aktif kalite kapısı değildir.

## Güncel kalite kapıları (6 Ağustos 2026, HEAD c1142e7)

| Komut | Görev | Son sonuç |
|---|---|---|
| `npm run catalog:audit` | Katalog sözleşmeleri: benzersiz ID, zincir, makro, provenance, görsel kuralları, klon denetimi, >199 ürün | ✅ 845 ürün · 845 benzersiz görsel · 0 hata · 4 secondary kayıt (Tchibo) |
| `npm run lint` | oxlint (src + tests/unit + tests/e2e) | ✅ 0 uyarı / 0 hata (50 dosya, 104 kural) |
| `npm run build` | TypeScript + Vite üretim derlemesi | ✅ (P2: ana bundle ~143 kB gzip chunk uyarısı — kabul edildi) |
| `npm run test:unit` | Vitest (normalizasyon, filtre, provenance, makro motoru, makro hedefleri/migrasyon, peanut) | ✅ 53/53 |
| `npm run test:e2e` | Playwright + Chromium (arama/ARIA, klavye, tema, 390/1440 × iki tema, görsel yükleme, peanut, makro modal/gates) | ✅ 19/19 |
| `npm test` | unit + E2E birlikte | ✅ |
| `npm audit` · `npm audit --omit=dev` | Bağımlılık güvenlik taraması | ✅ 0 açık |

## Public / SEO durumu

- GitHub Pages canlı: <https://kalorikafe.github.io/> (HTTP 200;
  `/favicon.svg`, `/sitemap.xml`, `/images/menu/starbucks/caff_latte.webp`
  doğrulandı).
- GitHub Actions: CI (master) + Pages deploy run'ları **success**.
- Google Search Console kaydı bekliyor (kullanıcı aksiyonu).

Her çalıştırmada sonuçlar komut çıktısıyla yeniden üretilmelidir; bu
belge sabit bir "her zaman yeşil" iddiası taşımaz. Detaylı çıktılar
[DEEPSEEK_NIGHT_REPORT.md](./DEEPSEEK_NIGHT_REPORT.md) bölüm 5'dedir.
