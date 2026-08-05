# ☕ Kalori Cafe — Proje Özeti & Geliştirici Kılavuzu (Project Overview)

> **Bu doküman, yeni bir sohbet veya yapay zeka ajanı başlatıldığında projenin geçmişini, amacını, mimarisini ve yapılan tüm geliştirmeleri eksiksiz şekilde aktarmak için güncellenmiştir.**

---

## 🎯 Projenin Amacı ve Konsepti

**Kalori Cafe**, Türkiye'deki en popüler zincir kahve mağazalarının (Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear Coffee Co., Arabica Coffee House, Gloria Jean's, David People, Tchibo) tüm menülerini tek bir platformda toplayan, kullanıcıların **kalori, protein, karbonhidrat, şeker, yağ, kafein ve alerjen** değerlerini şeffafça incelemesini sağlayan modern, ultra-hızlı ve yüksek kontrastlı bir Web Aggregator uygulamasıdır.

### Hedef Kitle ve Kullanım Senaryoları
1. **Sporcular & Diyet Yapanlar:** Kalori ve makro (protein/karb/yağ) hedeflerine göre kahve ve yiyecek seçimi yapmak isteyenler.
2. **Alerjisi / Hassasiyeti Olanlar:** Laktoz, glüten, yumurta, soya, fındık/fıstık gibi alerjenlerden kaçınan ve profillerine göre otomatik uyarı almak isteyenler.
3. **Diyabet & Düşük Glisemik Endeks Takibi Yapanlar:** Şeker oranlarını ve glisemik etkiyi izleyen kullanıcılar.
4. **Kafein Hassasiyeti Olanlar:** Günlük kafein limitini (mg) aşmamak için içecek bazlı kafein takibi yapanlar.

---

## 🛠️ Neler Yapıldı? (Geliştirme Geçmişi & En Son Güncellemeler)

### 1. Veri Seti ve Açıklamalar (199 Ürün)
- Türkiye'nin en çok şubesi olan **TOP 10 Kafe Zinciri** sisteme entegre edildi:
  - **Starbucks** (750+ Şube)
  - **Espressolab** (300+ Şube)
  - **Kahve Dünyası** (300+ Şube)
  - **Caffè Nero**
  - **Coffy**
  - **Mackbear Coffee Co.**
  - **Arabica Coffee House**
  - **Gloria Jean's Coffees**
  - **David People**
  - **Tchibo**
- Katalog 10 zincirde toplam **199 ürün** içerir (zincir başına 19–20). Resmi kaynak ve doğrulama tarihi henüz veri modelinde tutulmadığından güncellik iddiası yapılmaz.
- Açıklamalar kullanıcıya ürün içeriği ve hazırlanışı hakkında kısa bilgi verir. Görseller sınırlı bir havuzdan gelir; birebir ürün fotoğrafı garantisi yoktur.

### 2. Orijinal Marka Logoları
- Emojiler yerine Google Favicon API altyapısı kullanılarak tüm zincirlerin **orijinal yüksek çözünürlüklü logoları** (`https://www.google.com/s2/favicons?domain=...&sz=128`) entegre edildi.
- `ChainSelector` ve `ItemCard` bileşenleri hem görsel logoları hem de metin bazlı yedekleri (fallback) destekler.

### 3. Sıcak Lüks Gece Modu & Temiz Hero Alanı
- **Sıcak Mocha & Krem Gece Modu:** İç karartan soğuk siyahlardan vazgeçildi; yumuşak mocha zemin (`#1C1816`), kremsi kartlar (`rgba(36, 30, 26, 0.92)`) ve sıcak kehribar vurgular uygulandı.
- **Profesyonel Hero Banner:** Katalogdaki gerçek ürün sayısını veriden türeten rozetler ve hızlı filtre butonları kullanılır.
- **Tailwind CSS v4 Uyumlu Dark Mode:** `@custom-variant dark (&:where(.dark, .dark *));` tanımı `index.css` içindedir.

### 4. Fonksiyonel Bileşenler & Özellikler
- **Kişisel Alerjen Profili & Uyarı Sistemi:** Kullanıcı kendi alerjenlerini seçer; riski olan ürünler kırmızı rozet alır veya gizlenebilir.
- **Canlı İçecek Özelleştirici (Customizer Modal):** Boyut, süt türü, şurup pompası, ekstra shot ve krema seçimlerinde canlı makro/alerjen hesaplar.
- **Günlük Kalori & Makro Sepeti (Daily Basket Drawer):** Günlük tüketilen ürünleri toplar, hedefleri gösterir, MyFitnessPal formatında panoya kopyalar.
- **Akıllı Karşılaştırma Modülü (Compare Modal):** 4 ürüne kadar yan yana makro ve kafein karşılaştırması.
- **FDA Besin Değerleri Etiketi (Nutrition Label Modal):** Paket gıda etiketi formatında besin tablosu popup'ı.

### 5. Otomatik Test ve Derleme
- **`npm run build`**: TypeScript ve Vite üretim derlemesi
- **`npm run test:unit`**: Vitest ile makro motoru golden sözleşmeleri
- **`npm run test:e2e`**: Playwright ile gerçek Chromium kullanıcı akışları
- **`npm run test:legacy`**: Eski 67 senaryo; ana kalite kapısı değildir

---

## 🏗️ Proje Mimarisi & Dosya Yapısı

```
kalori_cafe/
├── scripts/
│   └── generate_items.mjs       # Mevcut katalog üretim yardımcısı
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Üst navigasyon, arama barı, Gece/Gündüz geçişi, Sepet/Karşılaştırma butonları
│   │   ├── Hero.tsx             # Ana başlık banner'ı, istatistikler ve hızlı diyet filtreleri
│   │   ├── ChainSelector.tsx    # 10 Popüler kafe zincirinin orijinal logolu yatay filtre paneli
│   │   ├── DietaryFilterBar.tsx # Kategori ve diyet etiketleri (Glütensiz, Vegan, Yüksek Protein vb.)
│   │   ├── SortAndAnalyticsBar.tsx # Sıralama (Kalori, Protein, Şeker) ve favoriler
│   │   ├── ItemCard.tsx         # Ürün kartı (Görsel, Makro gridi, Alerjen uyarısı, Özelleştir butonu)
│   │   ├── CustomizerModal.tsx  # Canlı süt/boyut/şurup özelleştirme modalı (onError görsel korumalı)
│   │   ├── DailyBasketDrawer.tsx# Günlük besin takip çekmecesi ve hedef barı
│   │   ├── CompareModal.tsx     # Yan yana ürün karşılaştırma modalı
│   │   ├── AllergenSettingsModal.tsx # Alerjen profil seçim modalı
│   │   ├── NutritionLabelModal.tsx  # FDA tarzı besin etiketi modalı
│   │   ├── SmartSwapModal.tsx   # Akıllı kalori tasarruflu tarif takas rehberi
│   │   └── MacroTargetCalculatorModal.tsx # BMR/TDEE bazlı kişisel hedef hesaplayıcı
│   ├── data/
│   │   ├── chains.ts            # TOP 10 zincirin tanımı, renkleri ve logo URL'leri
│   │   └── items.ts             # 199 ürünün bulunduğu ana katalog
│   ├── types/
│   │   └── cafe.ts              # TypeScript arayüzleri (MenuItem, Chain, Macros, CustomizationState vb.)
│   ├── utils/
│   │   └── macroCalculator.ts   # Boyut, süt ve şurup değişikliklerine göre makro/alerjen hesaplama motoru
│   ├── App.tsx                  # Ana uygulama durumu, filtreleme mantığı ve modal yönetimi
│   ├── index.css                # Tailwind CSS v4 custom variant ve glassmorphism stilleri
│   └── main.tsx                 # React DOM giriş noktası
├── tests/                       # Vitest unit, Playwright E2E ve legacy senaryolar
├── README.md                    # Hızlı başlangıç kılavuzu
└── PROJECT_OVERVIEW.md          # Bu kılavuz (Detaylı proje özeti)
```

---

## 🚀 Çalıştırma & Geliştirme Komutları

- **Geliştirme Sunucusunu Başlatma:**
  ```bash
  npx vite --host
  ```
- **Tüm Ana Testleri Çalıştırma:**
  ```bash
  npm test
  ```
- **Mevcut Ürün Kataloğunu Yeniden Üretme:**
  ```bash
  node scripts/generate_items.mjs
  ```
- **Prodüksiyon Derleme Testi:**
  ```bash
  npm run build
  ```

---

## 💡 Yeni Bir Chat / Yapay Zeka Ajanı İçin Önemli Notlar

1. **Stil Kuralları:** Projede Tailwind CSS v4 ve Vanilla CSS kullanılmaktadır. Renk paletinde sıcak kahve (`#6F4E37`), krem (`#FAF8F5`), sıcak koyu mocha (`#1C1816`) ve yüksek kontrast esas alınmıştır.
2. **Karanlık Mod:** Gece modu `document.documentElement.classList.add('dark')` ile toggled edilir ve `index.css` içindeki `@custom-variant dark (&:where(.dark, .dark *));` ile çalışır.
3. **Veri Değişikliği:** `items.ts` dosyasına el ile müdahale etmek yerine `scripts/generate_items.mjs` scriptini düzenleyip çalıştırarak verileri güncellemek önerilir.
4. **Fotoğraf & Açıklama Standartları:** Yeni ürün eklenirken `getItemImage` fonksiyonundaki kelime eşleştirmeleri kullanılır. Açıklamalar jargondan uzak, malzemeyi ve hazırlanışı belirten net Türkçe olmalıdır.
