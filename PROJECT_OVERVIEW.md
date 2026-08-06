# ☕ Kalori Cafe — Proje Özeti & Geliştirici Kılavuzu

> **Bu doküman, yeni bir sohbet veya yapay zeka ajanı başlatıldığında
> projenin geçmişini, amacını, mimarisini ve güncel durumunu eksiksiz
> aktarmak için hazırlanmıştır.** Son güncelleme: 6 Ağustos 2026
> (public release tamamlandı).

---

## ⏭️ Devir Durumu — önce bunu oku

**Kalori Cafe public yayında. Google'da görünmek için son adımların bazıları kullanıcıda; kod tarafı tamamıyla hazır ve yeşil doğrulandı.

| Durum | Detay |
|---|---|
| Canlı adres | <https://kalorikafe.github.io/> (HTTP 200, tüm asset'ler doğrulandı) |
| Repo | <https://github.com/kalorikafe/kalorikafe.github.io> (PUBLIC, `master`) |
| Branch (fix) | `master` (HEAD `c1142e76`); yayın öncesi güvenlik tag'i `pre-public-2026-08-06` |
| Katalog | 845 ürün · 10 zincir · 4 secondary kayıt (Tchibo) |
| Kalite kapıları | audit ✓ · lint ✓ · build ✓ (P2 bundle uyarısı) · unit 53/53 · E2E 19/19 · npm audit 0 |
| CI/Pages | tüm Actions run'ları success; deploy Pages green |
| SEO altyapısı | `sitemap.xml`, `robots.txt` (+Sitemap), JSON-LD `WebSite` canlıda |

**Sırada ne var?**
1. (Kullanıcı) Google Search Console → mülk ekle → HTML doğrulama dosyası
   adını ver, `public/`'e ekleyip push edelim → `sitemap.xml` gönder →
   ilk URL Indexing isteği. Google'da çıkması günler sürebilir.
2. (Kullanıcı) İsteğe Bağlı: Bing Webmaster Tools (aynı sitemap import).
3. P2 (ertelendi): ana bundle ~143 kB gzip chunk — code splitting yapılabilir.
4. P2 (ertelendi): tek sayfa olduğu için SSR/sitemap ekstra gerekmiyor;
   özel domain ileride eklenebilir.

**Bu sohbette ne yapıldı (özet):** public release uçtan uca — kod
düzeltmeleri (secondary provenance, image E2E), UX/güvenlik (makro profil,
peanut, ARIA, disclaimer'lar), marka ve starter dosyaların temizliği,
legacy test arşivi, doküman yenileme, GitHub Pages workflow, canlı
doğrulama, SEO altyapısı. Tüm detaylar aşağıda ve README.md'de.

---

## 🎯 Projenin Amacı

**Kalori Cafe**, Türkiye'deki popüler zincir kahve mağazalarının
(Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear Coffee
Co., Arabica Coffee House, Gloria Jean's, David People, Tchibo) menülerini
tek platformda toplayan; kalori, protein, karbonhidrat, şeker, yağ, kafein
ve alerjen değerlerini inceleme ve karşılaştırma imkânı veren bir Web
Aggregator uygulamasıdır.

- **Canlı adres:** <https://kalorikafe.github.io/>
- **Repo:** <https://github.com/kalorikafe/kalorikafe.github.io>
- **Stack:** React 19 + Vite 8 + TypeScript + Tailwind v4; GitHub Pages + Actions

### Hedef Kitle

1. Sporcular ve diyet yapanlar: makro hedeflerine göre kahve/yiyecek seçimi.
2. Alerjisi olanlar: laktoz, glüten, yumurta, soya, fındık/fıstık, **yer fıstığı** uyarıları.
3. Kan şekeri takibi yapanlar: şeker ve glisemik etki.
4. Kafein hassasiyeti olanlar: günlük kişisel kafein sınırı takibi.

---

## 🛠️ Güncel Durum (6 Ağustos 2026)

### 1. Katalog: 199 → 845 ürün (10 zincir)

- Zincir başına ürün: Starbucks 130, Espressolab 116, Mackbear 166,
  Arabica 131, Gloria Jean's 115, David People 93, Coffy 30, Tchibo 24,
  Kahve Dünyası 20, Caffè Nero 20.
- Kaynaklar: Starbucks TR resmî menüsü (19 kategori sayfası), Espressolab
  resmî menü API'si, Arabica/Gloria Jean's/David People/Mackbear/Coffy
  resmî sayfaları; Kahve Dünyası kafe menüsü web'de yayınlanmadığı ve
  Caffè Nero TR sayfası ürün bazında erişilemediği için bu iki zincir
  20'şer ürünle kaldı (gerekçe raporda).
- Provenance: `catalogSource.url` önceliği **ürünün exact productUrl** →
  araştırma zincir kaynağı → katalog varsayılanı (derleyici
  `compile_catalog.py`). Tchibo'nun 4 standart espresso bazlı ürünü
  (`tchibo_espresso`, `tchibo_caff_latte`, `tchibo_cappuccino`,
  `tchibo_americano`) `kind: 'secondary'` ile işaretlidir; geri kalan 20
  Tchibo ürünü ve tüm diğer zincirler `official`.
- Kimlikler sabittir (favori/sepet uyumluluğu); boyut varyasyonları
  (Double/Single/2'li) ayrı ürün sayılmaz.
- "URL, besin değeri veya kaynak bilgisi uydurulmaz" ilkesi audit'te
  denetlenir (`npm run catalog:audit`).

### 2. Görseller: 845 yerel WebP

- Tüm görseller `/images/menu/<chain>/<slug>.webp`; %100 benzersiz yol,
  tekrar sınırı 6, görsel ailesi kuralı denetlenir.
- Kaynaklar: zincir resmî görselleri (288 ürün) + lisanslı fallback'ler
  (Wikimedia Commons CC / Unsplash, 557 ürün).
- Zincir logoları yerel: `/images/chains/<id>.png`.
- Kart hata fallback'i yerel `/images/menu/placeholder.webp`; uzak
  hotlink yok. `favicon.svg` kahve temalı (sade kahve/amber) — Vite
  starter favicon kaldırıldı.

### 3. Arama deneyimi

- Tek normalizasyon yardımcısı (`searchNormalize.ts`): Türkçe karakter ve
  diakritik katlama (`turk kahvesi` → Türk Kahvesi), boşluk temizliği.
- Arama alanları: ürün adı, İngilizce ad, zincir adı, açıklama, kategori
  etiketi, diyet etiketleri.
- 2+ karakterde en fazla 8 önerilik panel (masaüstü navbar + mobil modal
  aynı `SearchSuggestions` bileşeni). **Her yüzey benzersiz listbox/option
  ID'si üretir** (`buildSuggestionIds`; `aria-controls` ve
  `aria-activedescendant` doğru bağlanır). `ArrowDown/Up`, `Enter`,
  `Escape` klavye sözleşmesi; Escape sorguyu silmez; sonuç sayısı
  `aria-live` ile duyurulur; seçim `#menu-results` hedefine kayar.

### 4. Sıcak espresso koyu tema

- Tokenlar `src/index.css` içinde merkezli: `--dark-bg #17120F`,
  `--dark-surface #211A16`, `--dark-surface-elevated #2B211C`,
  `--dark-border #49372E`, `--dark-text #F7EFE8`,
  `--dark-text-muted #C6B4A6`, `--dark-accent #E0A15A`.
- Tercih `kalori_cafe_theme` (light|dark); kayıtlı tercih sistem
  tercihinden önce gelir; `index.html` satır içi betiği ilk boyamada tema
  parlamasını önler; tema düğmesi erişilebilir adını günceller.

### 5. Fonksiyonel bileşenler

- Alerjen profili: gluten, laktoz, kuruyemiş, **yer fıstığı (peanut)**,
  soya, yumurta, yulaf; uyarı/gizleme modları; modalde **"Alerjen bilgisi
  garanti değildir"** çapraz bulaşma açıklaması görünür.
- Canlı özelleştirici (boyut, süt, şurup, shot, krema); günlük makro
  sepeti (MyFitnessPal kopyalama); 4'e kadar karşılaştırma; FDA tarzı
  besin etiketi (veri kaynağı notlu); akıllı takas; **BMR/TDEE makro
  hesaplayıcı** (profil kaydı + validasyon + legacy migrasyonu); özel
  tarif oluşturucu.
- **Makro profili:** `MacroProfile { gender, age, weightKg, heightCm,
  activity, goalType }`; validasyon yaş 15–75 · kilo 35–250 · boy
  120–230; geçersizde Apply kapalı + satır içi hata; Apply hedefler +
  profili birlikte kaydeder; modal açılışta kayıtlı profili yükler.
  Kafein metni "belirlediğiniz kişisel günlük sınır" (varsayılan 400 mg).
- **Güvenilirlik:** Hero'da tahminî değer/çapraz bulaşma açıklaması;
  `estimated` ürünlerde kartta "Tahmini değer" rozeti; footer feragat
  metni tutarlı; tıbbi iddia içermez.

### 6. Testler (aktif)

- Unit (Vitest): `searchNormalize`, `menuFilter`, `dataQuality`,
  `macroCalculator`, `macroGoals` (migrasyon), `allergenAndProvenance`
  (peanut + secondary provenance) — **53 test**.
- E2E (Playwright, Chromium): arama/ARIA/klavye, tema kalıcılığı,
  390×844 & 1440×900 × iki tema taşma yok, yerel WebP yükleme, peanut
  seçim/filtre, makro legacy-migrasyon + validasyon — **19 test**.
- Eski legacy tier suite (67 senaryo) aktif değil: `tests/legacy/`
  arşivi + README. Bu depodaki dokümanlar güncel sayılarla tutulur.

### 7. Arama motorları (SEO)

- `public/sitemap.xml` — canlı `/sitemap.xml` (HTTP 200 doğrulandı).
- `public/robots.txt` — `Allow: /` + `Sitemap:` yönergesi.
- `index.html` — JSON-LD `WebSite` schema, `og:*` meta'ları, `lang="tr"`,
  `theme-color`. Title: "Kalori Cafe | Tüm Zincir Kafelerin Makro &
  Alerjen Haritası".
- **Bekleyen (kullanıcı aksiyonu):** Google Search Console'a mülk ekleme,
  HTML doğrulama dosyası, sitemap gönderimi, ilk index isteği.

### 8. Otomasyon araçları

- `scripts/compile_catalog.py`: katalog modülleri ve `items.ts` üretici
  (provenance: ürüne özgü/secondary bilgisi araştırma JSON'larından gelir).
- `scripts/catalog-audit.ts`: tüm katalog sözleşmelerini denetler.
- CI: `.github/workflows/ci.yml` (push/PR kalite kapıları);
  `.github/workflows/pages.yml` (lint/build/test + `dist` Pages'e yayın).

---

## 🏗️ Mimari & Dosya Yapısı

```
kalori_cafe/
├── index.html                  # OG meta, FOUC önleyen tema betiği
├── public/
│   ├── favicon.svg             # kahve temalı (Vite starter favicon değiştirildi)
│   ├── images/menu/<chain>/      # 845 ürün görseli (WebP)
│   ├── images/chains/          # 10 zincir logosu (yerel PNG)
│   └── robots.txt
├── scripts/                       # catalog-audit.ts, compile_catalog.py, build-images.mjs…
├── src/
│   ├── components/            # Navbar, Hero, ItemCard, SearchSuggestions,
│   │                          # MobileSearchModal, modallar, çekmece…
│   ├── data/                   # catalog/<chain>.ts, items.ts, chains.ts, modifiers.ts
│   ├── types/cafe.ts              # MenuItem + provenance sözleşmeleri
│   ├── utils/                  # searchNormalize, searchInteraction, menuFilter,
│   │                          # macroCalculator, macroGoals
│   ├── App.tsx                  # merkezi durum, filtreler, modal yönetimi
│   └── index.css                # Tailwind v4 + koyu tema tokenları
├── tests/
│   ├── unit/                    # 6 dosya, 53 test
│   ├── e2e/                    # critical-flows, image-loading (19 akış)
│   └── legacy/                # eski tier suite arşivi + README (aktif değil)
├── .github/workflows/          # ci.yml + pages.yml
├── README.md, PROJECT.md, PROJECT_OVERVIEW.md, GATE_STATUS.md,
│   DATA_PROVENANCE.md, DEEPSEEK_NIGHT_REPORT.md
```

---

## 🚀 Komutlar

```bash
npm run dev              # geliştirme sunucusu (5173)
npm run catalog:audit     # katalog denetimi
npm test               # unit (53) + E2E (19)
npm run build          # üretim derlemesi
npm run lint           # oxlint
npm audit             # güvenlik taraması
npm audit --omit=dev  # üretim bağımları taraması
```

---

## 💡 Yeni Chat / Ajan İçin Notlar

1. **Veri düzenleme:** `src/data/catalog/<chain>.ts` derleyici ürünüdür;
   araştırma JSON'ları + `compile_catalog.py` ile yeniden üretilir;
   elle düzenleme yapma, `npm run catalog:audit` ile doğrula. Secondary
   işaretleme: research kaynağının `secondary`/ürün `productUrl` alanları.
2. **Koyu tema:** Tokenlar `src/index.css`'te; bileşenlerde
   `dark:bg-[var(--dark-surface)]` gibi referanslar; hex tekrar etme.
3. **Görsel ekleme:** Yeni ürün → `build-images.mjs` manifest'ten otomatik
   WebP üretir; uzak hotlink ekleme; placeholder yereldir.
4. **Arama:** davranış tek kaynak `searchNormalize.ts` +
   `searchInteraction.ts`; her yüzeyde `buildSuggestionIds(prefix)` ile
   benzersiz ARIA ID üret, `aria-controls/aria-activedescendant'ı ona göre bağla.
5. **Makro hedefleri:** hesap/formülü `macroGoals.ts`; migrasyon
   `normalizeStoredGoals`; eski kaydı silme.
6. **Kalite önceliği:** `catalog:audit → lint → build → test → audit
   sırası kapıdır; gerçek sonuçlar GATE_STATUS.md / raporda saklanır.
   Deploy yalnız `pages.yml` (master push veya workflow_dispatch).
7. **SEO:** Yeni içerik eklerken `index.html` meta/JSON-LD'yi ve
   `public/sitemap.xml`'i güncelle; Google Search Console adımı hâlâ
   kullanıcıda bekliyor (HTML doğrulama dosyası).
