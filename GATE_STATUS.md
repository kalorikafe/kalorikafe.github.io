# GATE_STATUS.md — Kalite Kapıları Durumu

Bu belge sabit bir “her zaman yeşil” iddiası değildir. Sonuçlar her çalışma
ağacında komut çıktısıyla yeniden üretilmelidir. Eski kaynak-metin suite'i
repodan kaldırılmıştır ve aktif kalite kapısı sayılmaz.

## 16 Ağustos 2026 — 1006 Ürün ve Coffy/Nero Genişletme Durumu

Güncel katalog ölçümü:

```text
products: 1006
seasonal: 9
nutrition: { verified: 0, mixed: 83, estimated: 923, unverified: 0 }
images: { uniquePaths: 1006, official: 384,
          licensed_fallback: 622, exactProduct: 384 }
coffy: { products: 86, seasonal: 4 }
caffe_nero: { products: 125, seasonal: 0,
              officialImages: 96, fallbackImages: 29 }
```

| Denetim | Güncel ölçüm |
|---|---|
| Toplam ve zincir referansları | ✅ 1006 ürün · 10 zincir |
| Sezonluk kayıtlar | ✅ 9 toplam · Coffy 4 · Mackbear 3 · David People 2 |
| Caffè Nero & Coffy anlık görüntüsü | ✅ Eksiksiz eşleşme ve mutabakat |
| Besin provenance | ✅ 83 `mixed` · 923 `estimated` · 0 `verified` · 0 `unverified` |
| Görsel yolları | ✅ 1006/1006 benzersiz yerel WebP (%100) |
| Görsel provenance | ✅ 384 resmî/exact · 622 lisanslı fallback |

Güncel çalışma ağacında yeniden üretilen kapı sonuçları:

| Komut | 16 Ağustos sonucu |
|---|---|
| `npm run catalog:audit` | ✅ 1006 ürün · 1006 benzersiz yerel yol · 2.839 kontrol · 0 hata |
| `npm run lint` | ✅ 0 uyarı / 0 hata (90 dosya) |
| `npm run build` | ✅ TypeScript + Vite + 1019 Statik SEO Sayfası + 404 üretimi |
| `npm run test:unit` | ✅ 107/107 passed (16 test suite) |
| `npm run test:e2e` | ✅ 32/32 passed (Chromium WCAG AA + Critical Flows) |
| `npm audit --omit=dev` | ✅ 0 açık |

## Son tam public-release kapısı — 6 Ağustos 2026 (tarihsel)

Aşağıdaki tablo 11 Ağustos katalog genişletmesinden **önceki** public release
ağacına (`ede7715`) aittir; güncel katalog için sonuç iddiası değildir.

| Komut | 6 Ağustos tarihsel sonuç |
|---|---|
| `npm run catalog:audit` | ✅ 845 ürün · 845 benzersiz görsel · 4 secondary kayıt |
| `npm run lint` | ✅ 0 uyarı / 0 hata |
| `npm run build` | ✅ P2 ana bundle ~143 kB gzip uyarısıyla tamamlandı |
| `npm run test:unit` | ✅ 53/53 |
| `npm run test:e2e` | ✅ 19/19 |
| `npm test` | ✅ unit + E2E |
| `npm audit` · `npm audit --omit=dev` | ✅ 0 açık |

## Public / SEO durumu

- GitHub Pages: <https://kalorikafe.github.io/>
- 6 Ağustos public release için CI run `31088623077` ve Pages run
  `31088623962` başarılıydı.
- 11 Ağustos katalog güncellemesinin canlıya çıktığı ancak yeni Pages run'ı
  tamamlandıktan ve canlı ürün sayısı/görseller doğrulandıktan sonra
  kaydedilmelidir.
- Google Search Console kaydı kullanıcı aksiyonu olarak bekler.
