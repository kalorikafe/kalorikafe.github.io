# GATE_STATUS.md — Kalite Kapıları Durumu

Bu belge sabit bir “her zaman yeşil” iddiası değildir. Sonuçlar her çalışma
ağacında komut çıktısıyla yeniden üretilmelidir. Eski 67 senaryoluk
kaynak-metin suite'i `tests/legacy/` altında tarihsel arşivdir ve aktif kalite
kapısı sayılmaz.

## 11 Ağustos 2026 — Caffè Nero katalog güncellemesi

Güncel katalog ölçümü:

```text
products: 950
seasonal: 15
nutrition: { verified: 0, estimated: 950, unverified: 0 }
images: { uniquePaths: 950, official: 384,
          licensed_fallback: 566, exactProduct: 384 }
caffe_nero: { products: 125, seasonal: 0,
              officialImages: 96, fallbackImages: 29 }
```

`scripts/catalog_sources/caffe_nero.json`, 11 Ağustos 2026'da 7 resmî
Caffè Nero Türkiye menü sayfasından üretilmiş 125 benzersiz ürün satırı
içerir. Katalog denetimi derlenmiş Caffè Nero ürün adları/adedi ile bu
izlenen anlık görüntü arasında eksik veya fazla kayıt bulunmadığını kontrol
eder.

| Denetim | Güncel ölçüm |
|---|---|
| Toplam ve zincir referansları | ✅ 950 ürün · 10 zincir |
| Sezonluk kayıtlar | ✅ 15 toplam · Caffè Nero 0 |
| Caffè Nero kaynak anlık görüntüsü | ✅ 125 kaynak satırı = 125 katalog ürünü |
| Besin provenance | ✅ 950 `estimated` · 0 `verified` · 0 `unverified` |
| Görsel yolları | ✅ 950/950 benzersiz yerel yol |
| Görsel provenance | ✅ 384 resmî/exact · 566 lisanslı fallback |
| Caffè Nero görselleri | ✅ 96 resmî/exact · 29 lisanslı fallback |

Güncel çalışma ağacında yeniden üretilen kapı sonuçları:

| Komut | 11 Ağustos sonucu |
|---|---|
| `npm run catalog:audit` | ✅ 950 ürün · 950 benzersiz yerel yol · 1.089 kontrol · 0 hata |
| `npm run lint` | ✅ 0 hata |
| `npm run build` | ✅ TypeScript + Vite; ana bundle 155,51 kB gzip uyarısıyla tamamlandı |
| `npm run test:unit` | ✅ 54/54 |
| `npm run test:e2e` | ✅ 19/19 |
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

6 Ağustos yayın kanıtları ve 11 Ağustos katalog eki
`DEEPSEEK_NIGHT_REPORT.md` içindedir.
