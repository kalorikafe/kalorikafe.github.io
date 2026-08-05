# Kalori Cafe — Gece Çalışması + Public Yayın Raporu

- Çalışma kesiti: **6 Ağustos 2026** (Europe/Istanbul), branch
  `codex/release-public-v1` → `master` (fast-forward)
- Önceki katalog: **199 ürün** · Güncel katalog: **845 ürün** (10 zincir)
- Public repo: <https://github.com/selimgrsoy0-commits/selimgrsoy0-commits.github.io>
- Canlı adres: <https://selimgrsoy0-commits.github.io/>

Bu rapor yalnızca gerçek ölçümleri içerir ("67/67", "always green" gibi
üretilemeyen iddialar raporda yoktur).

## 1. Zincir bazında ürün sayıları

| Zincir | Toplam | Aktif sezonluk |
|---|---|---|
| Starbucks | 130 | 0 |
| Espressolab | 116 | 0 |
| Mackbear Coffee Co. | 166 | 3 |
| Arabica Coffee House | 131 | 0 |
| Gloria Jean's | 115 | 1 |
| David People | 93 | 2 |
| Coffy | 30 | 9 |
| Tchibo | 24 | 0 |
| Kahve Dünyası | 20 | 0 |
| Caffè Nero | 20 | 0 |
| **Toplam** | **845** | **17** |

Sayılar `npm run catalog:audit` çıktısından ölçülmüştür. Kimlikler sabittir
(favori/sepet uyumluluğu); boyut varyasyonları ayrı ürün sayılmaz.

## 2. Katalog kaynakları (6 Ağustos 2026 çalışma kesiti)

| Zincir | Kaynak | Durum |
|---|---|---|
| Starbucks | https://www.starbucks.com.tr/menu (+ ürün sayfaları) | official |
| Espressolab | https://espressolab.com/kurumsal/menu · resmî menü API'si | official |
| Kahve Dünyası | https://www.kahvedunyasi.com/menu | official |
| Caffè Nero | https://www.caffenero.com/tr | official |
| Coffy | https://coffy.com.tr/ | official |
| Mackbear | https://mackbearcoffee.com/ | official |
| Arabica | https://www.arabicacoffee.com.tr | official |
| Gloria Jean's | https://www.gloriajeans.com.tr/menu | official |
| David People | https://davidpeople.com | official |
| Tchibo | https://www.tchibo.com.tr (4 espresso bazlı ürün ürün sayfası bulunmadığından) | secondary (4 ürün) |

Derleyici (`compile_catalog.py`) provenance üretirken URL önceliğini
uygular: **ürünün exact `productUrl` → araştırma zincir kaynağı → katalog
varsayılanı**; `kind: 'secondary'` yalnızca ürün gerçekten secondary bir
kaynaktan araştırıldıysa yazılır. Bu kuralla **tam olarak 4 kayıt**
secondary'dır: `tchibo_espresso`, `tchibo_caff_latte`, `tchibo_cappuccino`,
`tchibo_americano`. URL/besin/kaynak bilgisi uydurulmaz.

## 3. Görsel ölçümleri (audit, gerçek)

| Metrik | Değer |
|---|---|
| Toplam ürün | 845 |
| Benzersiz yerel görsel yolu | 845 |
| Benzersiz görsel oranı | %100 (hedef ≥ %60) |
| Tekrar rekoru | 1 (limit 6) |
| Uzak / yerel olmayan görsel | 0 |
| Resmî zincir görseli (exactProduct) | 288 |
| Lisanslı fallback (Commons/Unsplash) | 557 |

Besin kaynak dağılımı: 845 kaydın tamamı `estimated` (resmî ürün başına besin
tablosu yayınlanmıyor) · `verified: 0`.

Tüm görseller `/images/menu/<chain>/<slug>.webp` (WebP, yerel); zincir
logoları `/images/chains/<id>.png` (yerel); hata fallback'i
`/images/menu/placeholder.webp` (yerel). Favicon kahve temalı SVG.

## 4. Yayın hazırlığında yapılan değişiklikler

1. **Katalog doğruluğu:** `compile_catalog.py` artık her ürünü
   `official` yapmaz; URL önceliği ürün sayfası → zincir kaynağı →
   varsayılan; secondary üretimi ürüne özgü. 4 Tchibo secondary kaydı
   gerçekleşti (öncesi yanlışlıkla `official` idi, rapor bunu düzeltti).
2. **E2E görsel testi:** `image-loading.spec.ts` selector'ları yalnız
   `img[src^="/images/menu/"]` kapsar; zincir logoları test dışındadır —
   suite tamamen geçti (19/19).
3. **Alerjen:** `AllergenSettingsModal`'e `peanut` ("Yer Fıstığı")
   opsiyonu; filtreleme/seçim/localStorage davranışı test edildi;
   modalde **"Alerjen bilgisi garanti değildir"** çapraz bulaşma
   açıklaması görünür.
4. **Makro hedefleri:** `MacroProfile` + `UserMacroGoals.profile`;
   `DEFAULT_MACRO_PROFILE`, `DEFAULT_USER_GOALS`,
   `calculateUserMacroGoals` (eski Harris-Benedict mantığı aynen),
   `normalizeStoredGoals` (eski sayısal `kalori_cafe_goals` kaydını veri
   kaybı olmadan geçirir — değerler korunur, varsayılan profil eklenir).
   Modal açılışta profil yükler; Apply hedeflerin + profil kapatır;
   validasyon yaş 15–75 / kilo 35–250 / boy 120–230, geçersizde Apply
   pasif + satır içi hata. Kafein metni "belirlediğiniz kişisel günlük
   sınır" (varsayın 400 mg).
5. **Arama/footer:** `SearchSuggestions`'taki bozuk
   `dark:text-[var(--dark-text)]0` düzeltildi; her arama yüzeyi benzersiz
   listbox/option ID üretir (`buildSuggestionIds`), `aria-controls` ve
   `aria-activedescendant` doğru bağlanır; klavye/Escape davranışı korunur.
   Footer'daki sabit/eski marka listesi kaldırıldı; 10 zincir `CHAINS`
   verisinden dinamik gösterilir.
6. **Public güvenilirlik:** Hero'da ve footer'da tahminî veri + çapraz
   bulaşma açıklaması; `estimated` kayıtlarda kartlarda **"Tahmini
   değer"** rozeti; tıbbi iddia yok.
7. **Marka/temizlik:** Kahve temalı `favicon.svg`; `rg` taraması ile
   kullanılmayan starter dosyaları silindi (`public/icons.svg`,
   `src/assets/{hero.png,react.svg,vite.svg}`, `src/App.css`). Bundle
   mimarisine dokunulmadı; ~143 kB gzip ana chunk uyarısı **P2** olarak
   kabul edildi.
8. **Legacy test arşivi:** Eski runner + tier1–tier4 dosyaları
   `tests/legacy/`e taşındı (tarihsel; aktif kapı değil; README
   mevcut). `test:legacy`/`lint:legacy` script'leri kaldırıldı; `tsx`
   eklenmedi. Değer korunan senaryolar (boyut sınırı, süt farkı,
   şurup/shot, peanut, localStorage migrasyonu) güncel testlere taşındı.

## 5. Kalite kapıları — 6 Ağustos 2026 gerçek sonuçlar

```
$ npm run catalog:audit
✅ Catalog audit passed
  totalProducts: 845 · uniqueImages: 845 · uniqueImagePercent: 100
  nutrition: { verified: 0, estimated: 845, unverified: 0 }
  images: { official: 288, licensed_fallback: 557, exactProduct: 288 }
  checksRun: 856 · failures: 0                     EXIT=0

$ npm run lint
Found 0 warnings and 0 errors. (50 dosya, 104 kural)   EXIT=0

$ npm run build
✓ built (tsc -b && vite build; P2: ana chunk ~143 kB gzip uyarısı)  EXIT=0

$ npm run test:unit
6 test dosyası, 53 test geçti                            EXIT=0

$ npm run test:e2e
19 test geçti (arama/ARIA, klavye, mobil modal, tema
kalıcılığı, 390×844 & 1440×900 × iki tema taşma yok, yerel
WebP naturalWidth>0, peanut, makro modal)                EXIT=0

$ npm audit · npm audit --omit=dev
found 0 vulnerabilities                                  EXIT=0
```

Her kapı bu rapordan önce yeniden çalıştırıldı ve çıkış 0 alındı.

## 6. Commit'ler (yayın hazırlığı)

| Hash | Mesaj | Grup |
|---|---|---|
| `9441e59` | fix: honest secondary provenance in compiled catalog + scoped image E2E | correctness/tests |
| `e14a724` | feat: macro profile, peanut allergen, search ARIA, safety branding | UX/safety/branding |
| `fe93ae7` | docs: refresh project docs to release state with real measurements | provenance/docs |
| `9de4f70` | ci: add GitHub Pages build+deploy workflow | deployment |
| (yayın sonrası) | docs: record live verification results | provenance/docs |

## 7. Legacy suite arşiv bilgisi

Eski 67 senaryoluk paket `tests/legacy/` altında; README içinde paketin
tarihsel (aktif kalite kapısı olmayan) olduğu ve güncel kapıların nasıl
çalıştırılacağı yazıyor. `package.json`'da `test:legacy` ve `lint:legacy`
yok; `tsx` bağımlılığı eklenmedi.

## 8. Kalan P2 işler

- Ana bundle ~143 kB gzip chunk boyutu uyarısı (code-splitting / lazy
  chunk mimarisi bu gece kapsam dışı; yayın öncesi kabul edildi).
- Sitemap/SSR gerekmiyor (tek sayfa); özel domain ileride eklenebilir.

## 9. Erişilemeyen kaynaklar ve dürüst sınırlamalar

- Kahve Dünyası / Caffè Nero web'de ürün bazlı menü yayınlamıyor;
  20'şer ürün ortak menüden derlendi (gerekçe yukarıda).
- Tchibo kafe menüsünün 4 standart espresso bazlı ürününde ürün sayfası
  yok → `secondary` (4 kayıt; bu raporda gerçekleşti).
- Besin verileri ürün bazlı resmî tablolar yayınlanmadığı için tamamı
  `estimated` (845); UI'da tahminî olduğu açıkça görünür.
- 557 fallback görsel orijinal Commons/Unsplash alt çözünürlükte olabilir;
  her biri `imageSource.kind: 'licensed_fallback'` ve kaynak sayfası
  doğrulanabilir.

## 10. Public yayın (GitHub Pages)

- Repo: `selimgrsoy0-commits/selimgrsoy0-commits.github.io` (user site)
- Workflow: `.github/workflows/pages.yml` — tetikleyiciler `master` push
  ve `workflow_dispatch`; `permissions: contents: read, pages: write,
  id-token: write`; Node 22; Playwright Chromium kurulumu; kalite kapıları
  (audit → lint → build → test → npm audit) ardından `dist` artifact'ı
  `actions/upload-pages-artifact` + `actions/deploy-pages` ile yayınlanır.
- Vite `base` kök site olduğu için değiştirilmedi; `/images/...` yolları
  korunur.
- Workflow run `31049494024` (`Deploy static content to Pages`): **success**
  — kalite kapıları + artifact upload + deploy adımlarının tamamı geçti.

### Canlı doğrulama (6 Ağustos 2026, yayın sonrası)

| Kontrol | Sonuç |
|---|---|
| `https://selimgrsoy0-commits.github.io/` | HTTP 200 · `text/html` · başlık "Kalori Cafe \| Tüm Zincir Kafelerin Makro & Alerjen Haritası" |
| `/favicon.svg` | HTTP 200 · `image/svg+xml` (kahve temalı favicon) |
| `/images/menu/starbucks/caff_latte.webp` | HTTP 200 · `image/webp` · RIFF/VP8 720×720 · 13.042 bayt |
| Sayfa içeriği | Hero + 10 zincir (gerçek sayaçlar: Tüm Kafeler 845) + "Tahmini değer" rozetli kartlar |
| Arama | "sarelle" → 1 kart; listbox `desktop-search-suggestions-listbox`; option id `desktop-search-suggestion-option-0`; `aria-activedescendant` klavye ile doğru güncelleniyor |
| Ürün modalı | Açılıyor; "Kaynak doğrulaması bekleniyor" + alerjen listesi; Escape kapatıyor |
| Tema | dark → light geçişi ve `kalori_cafe_theme=light` yazımı doğrulandı |
| Footer | 10 zincir dinamik listeleniyor; çapraz bulaşma feragat metni görünür |
| Konsol | 0 hata |
| Mobil/desktop taşma (390×844 & 1440×900 × iki tema) | Playwright E2E 19/19 (aynı commit ağacında) |

## 11. Güvenlik & gizlilik notu

- Bu raporda yer alan tüm ölçümler bu makinedeki yürütme kayıtlarından
  aktarılmıştır; yayına alınmadan hemen önce kapılar yeniden çalıştırıldı.