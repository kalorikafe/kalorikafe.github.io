# HANDOFF.md — Ajan El Değiştirme Dokümanı

> **Bu dosyayı ilk oku.** Bir sonraki oturuma geçen her ajan buradan tüm bağlama
> hakim olur. Son güncelleme: **22 Ağustos 2026** (commit `735b07a` sonrası).

## 1. Proje kimliği

- **Kalori Cafe**: Türkiye'deki 10 kafe zincirinin 1006 ürününü kalori/makro/
  kafein/alerjen yönünden karşılaştıran React SPA'sı.
- Canlı: <https://kalorikafe.github.io/> · Repo: `kalorikafe/kalorikafe.github.io`
- Deploy: `master` push → `.github/workflows/pages.yml` → GitHub Pages (kök site, `base` sabit).
- Stack: React 19 + TS + Vite 8 + Tailwind v4 · Test: Vitest (107) + Playwright Chromium (32).

## 2. Mimari / veri akışı

```
scripts/catalog_sources/*.json   ← zincir kaynak anlık görüntüleri (caffe_nero.json audit'e tabi)
        ↓ npm run catalog:build (compile_catalog.py)
src/data/catalog/<chain>.ts      ← TEK GERÇEK KAYNAK (MENU_ITEMS; elle düzenlenen veri)
        ↓ npm run catalog:export (export-catalog.mjs)
public/data/catalog.<sha12>.json + catalog-manifest.json
        ↓ npm run build (tsc -b && vite build && generate-static-pages.mjs)
dist/  (1019 statik SEO sayfası + 404 + sitemap.xml)
```

- Görseller: `public/images/menu/<chain>/<slug>.webp` (1006 benzersiz yol).
  Üretim hattı `npm run images:build` (build-images.mjs), doğrulama
  `npm run images:audit` (image-integrity.mjs → tmp/image-integrity.json).
- Provenance sözleşmesi: `scripts/catalog_sources/image-provenance.json`
  `records[id]` ↔ items.ts `imageSource.url` **birebir** eşleşmek zorunda;
  export-catalog uyuşmazlıkta **throw eder**. Görsel değiştirirken üçünü birlikte
  güncelle: webp (sharp, 1000px/q82) + provenance + TS.

## 3. Doğrulanmış taban değerler (22 Ağustos, tam süit yeşil)

| Kapı | Değer |
|---|---|
| catalog:audit | checksRun **2831**, failures **0**, legacyUnverifiedSources **116** |
| images:audit | uniqueContentPercent **%98.1** (987/1006), maxRepeatPerHash **3**, 0 eksik, 0 provenance hatası |
| lint | oxlint **99 dosya**, 0 uyarı / 0 hata |
| test:unit | **107/107** (16 dosya) |
| test:e2e | **32/32** (chromium) |
| build | **1019** canonical URL + 404 |
| verify:build / budget:check | ✅ / ✅ |

- Kategori dağılımı: espresso_hot **182**, espresso_iced **88**, cold_brew 14,
  frappe_blended 62, tea_herbal 111, smoothie_juice 107, bakery_dessert **270**,
  sandwich_savory **149**, fit_healthy **23**. Drinks/Food: 564/442. Sezonluk **10**
  (Coffy 4, Mackbear 3, Gloria Jean's 1, David People 2). Zincir dağılımı README'de.
- Besin: 83 `mixed` (tamamı Caffè Nero) + 923 `estimated`.

## 4. Sözleşmeler ve tuzaklar (kritik!)

1. **`containsLactose=true` ⇄ `allergens` içinde `"milk"`** — catalog-audit zorunlu tutar; tekini tek değiştirme.
2. **Kaynak-sadakat:** ürün adları `scripts/catalog_sources/*.json` anlık görüntüsüyle birebir eşleşmeli (ör. Caffè Nero "Cıabatta" resmî yazım — "düzeltme" audit kırmıştır). Yazım değiştireceksen önce snapshot'ın o kaydı için kaynak sayfayı doğrula.
3. **Provenance üçlüsü** (bkz. §2): webp + image-provenance.json + chain .ts aynı commit'te; sonra `catalog:export`.
4. **Raporlar tarihî anlıktır** (`reports/*.md`, kök `CATALOG_AUDIT_REPORT.md`): iddiaları canlıya uygulama kararı verirken rapora **uzlaşma notu** düş (örnekler: audit_cold_frappe.md, CATALOG_AUDIT_REPORT.md başındaki notlar).
5. `tmp/`, `tmp_research/`, `test-results/` gitignored yerel çalışma alanlarıdır; repoya girmez.
6. Lint dosya sayısı scope'taki dosyaya bağlıdır (99); script ekleyip çıkarınca GATE_STATUS/README'deki sayıyı tazele.
7. Windows CRLF: string-replace scriptlerinde `\r?\n` kullan.

## 5. Komutlar

```bash
npm test                 # TÜM kapılar: audit + images:audit + lint + unit + build + verify + budget + e2e
npm run catalog:export   # src/data -> public/data (+ manifest)
npm run test:scripts     # tests/scripts node --test paketi (3 dosya)
npm run images:build     # build-images.mjs görsel üretim hattı
npm run images:audit     # görüntü bütünlüğü (strict)
```

## 6. Klasör rehberi

| Yol | İçerik |
|---|---|
| `src/data/catalog/*.ts` | Ürün verisi (tek gerçek kaynak) |
| `src/utils/` | searchNormalize (arama indeksi + kategori takma adları + alerjen adları), menuFilter, slugs… |
| `scripts/` | Kalıcı kapı/pipeline script'leri (12 adet) |
| `scripts/oneoff/` | 2026-08 görsel göçü tek seferlik hatları (10) + post-deploy-smoke — silinmeye hazır arşiv |
| `scripts/catalog_sources/` | Kaynak anlık görüntüleri + image-provenance.json + README |
| `reports/` | 2026-08-16 alt ajan denetim raporları (tarihî; uzlaşma notlarına bak) |
| `tmp_research/` | ~26 MB ignored ham kazıma verisi (önceki oturum; gerekiirse silinebilir) |

## 7. Son değişiklik günlüğü (özet)

**21–22 Ağustos 2026** (`d2a25c8`, `d952c33`, `735b07a`):
1. Kapı rakamları 4 dokümanda tazelendi; sezonluk 9→10; GATE_STATUS'a tarihli bölüm.
2. 11 ürünün sınıf-arası görsel uyumsuzluğu düzeltildi + tüm 1006 webp yeniden pişti (önceki oturum hattıyla), 622 fallback URL'i güncellendi.
3. 21 kahveye kafein tahmini; 9 sütlü içeceğe milk alerjeni; 63 containsLactose.
4. 26 kategori taşıması (20 Ice→espresso_iced, chia_puding→fit_healthy, boyoz/poğaça→sandwich_savory).
5. nameEn alanı kaldırıldı (436 satır; arama skoru + ItemCard uyumu).
6. Site: mükerrer JSON-LD giderildi, sugar_free filtre pill'i, 404 canonical/noindex,
   ProductPage onError guard, og:image gerçek boyutlar, PNG favicon fallback +
   apple-touch-icon, aramada alerjen/kategori-takma-ad kapsamı, bayat public/sitemap.xml kaldırıldı.
7. Kod hijyeni: test:scripts yeniden adlandırma + yetim test bağlandı, oneoff arşivi,
   ölü exportlar silindi, images:build eklendi.

Daha erken (aynı hafta): 4 ana dokümandaki sapmış kapı rakamlarının düzeltilmesi
(README.md planı) — bkz. GATE_STATUS 21 Ağustos bölümü.

## 8. Açık işler (öncelik sırasına göre)

1. **Şablonik açıklamalar:** 191 üründe "Kafenin taze hazırlanan X lezzeti."
   geri döndü (mackbear 62, gloria_jeans 35, espressolab 32, arabica 31,
   starbucks 23, david_people 6, coffy 2). Özgün metin yazımı = içerik işi.
2. **Gloria Jean's BÜYÜK HARF adlar:** 44/115 hâlâ caps ("KEK TOPLARI BEYAZ").
   Title Case'e çevirme içerik işi.
3. **Vision doğrulaması:** 246 ürün curated-olmayan Unsplash fotosu kullanıyor;
   3 grup sınıf-karışık (photo-1556881286: 20 ürün 4 kategoride vb.). Görüntü
   destekli model (`modelRoles.vision`) yapılandırılınca inspect_image ile tek tek
   bakılmalı. Liste üretimi: provenance sourceUrl'lerini UNSPLASH_CURATED
   (build-images.mjs:102-150) ile eşleştirip curated-dışı olanları süz.
4. **Vegan-etiket şüpheleri:** örn. "Buzla çırpılmış kremalı" Espresso Frappuccino'da
   `vegan` tag; Espresso Machiato'da vegan tag. dietaryTags doğruluk taraması.
5. **Google Search Console:** kullanıcı aksiyonu bekliyor (README "Bekleyen" bölümü).
6. `mackbear_melograno` = `redbull_energy_drink` bytes ikilemesi ve iki mocha
   paylaşımı — sınıf-tutarlı, düşük öncelik.
