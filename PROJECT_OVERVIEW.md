# ☕ Kalori Cafe — Proje Özeti & Geliştirici Kılavuzu

> **Bu doküman, yeni bir sohbet veya yapay zeka ajanı başlatıldığında
> projenin geçmişini, amacını, mimarisini ve güncel durumunu eksiksiz
> aktarmak için hazırlanmıştır.** Son güncelleme: 5 Ağustos 2026.

---

## 🎯 Projenin Amacı

**Kalori Cafe**, Türkiye'deki popüler zincir kahve mağazalarının
(Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear Coffee
Co., Arabica Coffee House, Gloria Jean's, David People, Tchibo) menülerini
tek platformda toplayan; kalori, protein, karbonhidrat, şeker, yağ, kafein
ve alerjen değerlerini inceleme ve karşılaştırma imkânı veren bir Web
Aggregator uygulamasıdır.

### Hedef Kitle

1. Sporcular ve diyet yapanlar: makro hedeflerine göre kahve/yiyecek seçimi.
2. Alerjisi olanlar: laktoz, glüten, yumurta, soya, fındık/fıstık uyarıları.
3. Kan şekeri takibi yapanlar: şeker ve glisemik etki.
4. Kafein hassasiyeti olanlar: günlük kafein limiti takibi.

---

## 🛠️ Güncel Durum (5 Ağustos 2026)

### 1. Katalog: 199 → 845 ürün

- Zincir başına ürün: Starbucks 130, Espressolab 116, Mackbear 166,
  Arabica 131, Gloria Jean's 115, David People 93, Coffy 30, Tchibo 24,
  Kahve Dünyası 20, Caffè Nero 20.
- Kaynaklar: Starbucks TR resmî menüsü (19 kategori sayfası), Espressolab
  resmî menü API'si, Arabica/Gloria Jean's/David People/Mackbear/Coffy
  resmî sayfaları; Kahve Dünyası kafe menüsü web'de yayınlanmadığı ve
  Caffè Nero TR sayfası ürün bazında erişilemediği için bu iki zincir
  20'şer ürünle kaldı (gerekçe raporda).
- Her ürün `availability` + `catalogSource` + `imageSource` +
  `nutritionSource` taşır; kimlikler eski favorileri koruyacak şekilde
  sabittir. Boyut varyasyonları (Double/Single/2'li) ayrı ürün sayılmaz.

### 2. Görseller: 845 yerel WebP

- Tüm görseller `/images/menu/<chain>/<slug>.webp` altında; %100 benzersiz
  yol, tekrar sınırı 6, aile kuralı denetlenir.
- Kaynaklar: zincir resmî görselleri (Starbucks PIM, 288 ürün) +
  lisanslı fallback'ler (Wikimedia Commons CC / Unsplash, 557 ürün).
- Zincir logoları yereldir: `/images/chains/<id>.png` (Google favicon
  hotlink'i kullanılmaz).
- Kart hata fallback'i yerel `/images/menu/placeholder.webp`'dir.

### 3. Arama deneyimi

- Tek normalizasyon yardımcısı (`searchNormalize.ts`): Türkçe karakter ve
  diakritik katlama (`turk kahvesi` → Türk Kahvesi), boşluk temizliği.
- Arama alanları: ürün adı, İngilizce ad, zincir adı, açıklama, kategori
  etiketi, diyet etiketleri.
- 2+ karakterde en fazla 8 önerilik panel (masaüstü navbar + mobil modal
  aynı bileşen); `ArrowDown/Up`, `Enter`, `Escape` klavye sözleşmesi;
  Escape sorguyu silmez; temizleme düğmesi sorgu + aktif öneri + paneli
  sıfırlar; sonuç sayısı `aria-live`; seçim `#menu-results` hedefine kayar.

### 4. Sıcak espresso koyu tema

- Tokenlar `src/index.css` içinde merkezli:
  `--dark-bg #17120F`, `--dark-surface #211A16`,
  `--dark-surface-elevated #2B211C`, `--dark-border #49372E`,
  `--dark-text #F7EFE8`, `--dark-text-muted #C6B4A6`,
  `--dark-accent #E0A15A`.
- Tercih `kalori_cafe_theme` (light|dark) anahtarında kalıcı; kayıtlı
  tercih sistem tercihinden önce gelir; `index.html` satır içi betiği ilk
  boyamada tema parlamasını önler; tema düğmesi erişilebilir adını
  günceller. Açık tema davranışı korunur.

### 5. Fonksiyonel bileşenler

- Alerjen profili + uyarı/gizleme, canlı özelleştirici (boyut, süt, şurup,
  shot, krema), günlük makro sepeti (MyFitnessPal kopyalama), 4'e kadar
  karşılaştırma, FDA tarzı besin etiketi, akıllı takas, BMR/TDEE hedef
  hesaplayıcı, özel tarif oluşturucu.

### 6. Otomasyon araçları

- `scripts/assemble_research.py`, `scripts/add_espressolab.py`: araştırma
  verisini birleştirir.
- `scripts/compile_catalog.py`: katalog modüllerini ve `items.ts`'i üretir.
- `scripts/build-images.mjs`: görselleri indirir/WebP'ler (incremental).
- `scripts/catalog-audit.ts`: tüm katalog sözleşmelerini denetler.
- Eski `scripts/generate_items.mjs` şablon üretici
  `scripts/archive/generate_items.mjs` altına arşivlenmiştir; kataloğu
  ezemez.

---

## 🏗️ Mimari & Dosya Yapısı

```
kalori_cafe/
├── index.html                  # OG meta, FOUC önleyici tema betiği
├── public/
│   ├── images/menu/<chain>/    # 845 ürün görseli (WebP)
│   ├── images/chains/          # 10 zincir logosu (yerel PNG)
│   └── robots.txt
├── scripts/
│   ├── catalog-audit.ts        # npm run catalog:audit
│   ├── compile_catalog.py      # katalog modül üretici
│   ├── assemble_research.py    # araştırma birleştirici
│   ├── add_espressolab.py      # Espressolab API ekleyici
│   ├── build-images.mjs        # görsel üretim hattı (sharp)
│   └── archive/generate_items.mjs  # eski şablon üretici (arşiv)
├── src/
│   ├── components/             # Navbar, Hero, ChainSelector, ItemCard,
│   │                           # SearchSuggestions, MobileSearchModal,
│   │                           # modallar, çekmece, alt navigasyon
│   ├── data/
│   │   ├── catalog/<chain>.ts  # zincir başına MenuItem modülleri
│   │   ├── items.ts            # MENU_ITEMS birleştirici
│   │   ├── chains.ts           # 10 zincir (yerel logolar)
│   │   └── modifiers.ts        # süt/boyut/ekstra makro deltaları
│   ├── types/cafe.ts           # MenuItem + provenance sözleşmeleri
│   ├── utils/
│   │   ├── searchNormalize.ts  # arama normalizasyonu + sıralama
│   │   ├── searchInteraction.ts# klavye sözleşmesi
│   │   ├── menuFilter.ts       # filtre + sıralama (testlerle paylaşılan)
│   │   └── macroCalculator.ts  # makro/alerjen hesaplama motoru
│   ├── App.tsx                 # merkezi durum, filtre, modal yönetimi
│   └── index.css               # Tailwind v4 + koyu tema tokenları
├── tests/
│   ├── unit/                   # searchNormalize, menuFilter, dataQuality,
│   │                           # macroCalculator (31 test)
│   └── e2e/                    # critical-flows, image-loading (17 akış)
├── tmp_research/               # araştırma/üretim ara dosyaları (git dışı)
├── README.md, PROJECT.md, PROJECT_OVERVIEW.md, GATE_STATUS.md,
│   DATA_PROVENANCE.md, DEEPSEEK_NIGHT_REPORT.md, DEEPSEEK_NIGHT_GOAL.md
```

---

## 🚀 Komutlar

```bash
npm run dev             # geliştirme sunucusu (5173)
npm run catalog:audit   # katalog denetimi
npm test                # unit (31) + E2E (17)
npm run build           # üretim derlemesi
npm run lint            # oxlint
npm audit               # güvenlik taraması
```

---

## 💡 Yeni Chat / Ajan İçin Notlar

1. **Veri düzenleme:** `src/data/catalog/<chain>.ts` derleyici tarafından
   üretilir; elle düzenlemek yerine araştırma JSON'larını ve
   `compile_catalog.py`'yi kullan. Denetim `npm run catalog:audit`.
2. **Koyu tema:** Tokenlar `src/index.css`'te; bileşenlerde
   `dark:bg-[var(--dark-surface)]` gibi referanslar kullanılır; hex değer
   tekrarı yapma.
3. **Görsel ekleme:** Yeni ürün → `build-images.mjs` manifest üzerinden
   otomatik WebP üretir; uzak hotlink ekleme, placeholder yereldir.
4. **Arama:** Arama davranışı tek kaynak `searchNormalize.ts` +
   `searchInteraction.ts`; masaüstü ve mobil aynı mantığı kullanır.
5. **Kalite:** `catalog:audit` → `lint` → `build` → `test` → `audit`
   sırası hedef kapılardır; rapor `DEEPSEEK_NIGHT_REPORT.md`'de gerçek
   ölçümlerle saklanır.