# ☕ Kalori Cafe — Zincir Kahve Makro ve Alerjen Platformu

Kalori Cafe; Türkiye'deki 10 büyük kafe zincirine ait **1.006 ürünün** kalori,
protein, karbonhidrat, şeker, yağ, kafein ve alerjen bilgilerini tek
platformda karşılaştıran React uygulamasıdır.

- **Canlı adres:** <https://kalorikafe.github.io/>
- **Kaynak:** <https://github.com/kalorikafe/kalorikafe.github.io>
- **Hosting:** GitHub Pages + Actions (yalnızca bu; Vercel/Cloudflare/Netlify kullanılmaz)

Çalışma kesiti 16 Ağustos 2026; katalog zincirlerin resmî web menülerinden ve
kontrollü şube anlık görüntülerinden derlendi (Starbucks TR menüsü, Espressolab
resmî menü API'si, Arabica/Gloria Jean's/David People/Mackbear sayfaları, Caffè
Nero Türkiye'nin 7 resmî menü sayfası ve Coffy 5-şube canlı menü anlık
görüntüsü). Her statik ürün `catalogSource`, `imageSource` ve `nutritionSource`
provenance alanlarını taşır; `npm run catalog:audit` bunu otomatik denetler.
Tchibo'nun 4 standart espresso bazlı ürünü kendi ürün sayfası olmadığı
için `kind: 'secondary'` ile işaretlidir (`tchibo_espresso`,
`tchibo_caff_latte`, `tchibo_cappuccino`, `tchibo_americano`).

## Hızlı başlangıç

```bash
npm install
npm run dev        # http://localhost:5173
```

## Kalite komutları

```bash
npm run catalog:audit   # katalog sözleşmeleri + görsel kalite denetimi (1006 ürün, 0 hata)
npm run lint            # oxlint (src + tests/unit + tests/e2e - 90 dosya, 0 hata)
npm run build           # TypeScript + Vite + 1019 Statik SEO Sayfası + 404
npm run test:unit       # Vitest unit testleri (107/107 passed)
npm run test:e2e        # Playwright + Chromium E2E (32/32 passed, WCAG AA uyumlu)
npm test                # unit + E2E birlikte
npm audit               # bağımlılık güvenlik taraması
```

`npm run test:e2e:install` ilk kurulumda Chromium indirir.

Eski kaynak-metin legacy suite'i aktif kalite kapısı değildir ve repodan
kaldırılmıştır. Değer korunan senaryolar (boyut sınırı, süt farkı,
şurup/shot, peanut, localStorage migrasyonu, WCAG AA erişilebilirlik) güncel
unit/E2E testlerindedir.

## Teknolojiler

- React 19, TypeScript 6, Vite 8
- Tailwind CSS v4 (koyu tema tokenları `src/index.css` içinde merkezli)
- Vitest birim testleri (107 test), Playwright + Chromium E2E (32 test)
- Görsel hattı: `sharp` (WebP), Wikimedia Commons / Unsplash lisanslı
  fallback'ler, zincir resmî görselleri

## Katalog ve veri notları

- Ürün verisi `src/data/catalog/<chain>.ts` modüllerinde tutulur;
  `src/data/items.ts` yalnızca birleştirir (`MENU_ITEMS`).
- Tüm görseller yerel WebP'dir: `/images/menu/<chain>/<slug>.webp`
  (1006 benzersiz dosya yolu; 384 resmî/exact ürün görseli, 622 lisanslı
  fallback; çalışma zamanında uzak hotlink yok).
- Caffè Nero kataloğu 125 ürün (96 resmî ürün görseli, 29 lisanslı fallback),
  Coffy kataloğu 86 üründür (56 yeni ekleme, 22 mutabakat, 8 korunmuş).
  İzlenen kaynak anlık görüntüleri `scripts/catalog_sources/` altındadır.
- Uygulamanın tam makro şemasını her üründe karşılayan resmî tablolar
  bulunmadığı için 83 kayıt `mixed`, 923 kayıt `estimated` olarak işaretlenir;
  tahmin yöntemi her ürünün `nutritionSource.notes` alanındadır. Kartlarda
  **"Tahmini değer"** veya **"Karma veri"** rozeti ve hero/footer'da
  tahminî veri + çapraz bulaşma açıklaması görünür; uygulama tıbbi tavsiye vermez.
- Alerjen bilgileri garanti değildir; markanın güncel resmî bilgileri
  esas alınmalıdır (çapraz bulaşma riski).

Zincir dağılımı: Starbucks 130, Espressolab 116, Kahve Dünyası 20,
Caffè Nero 125, Coffy 86, Mackbear 166, Arabica 131, Gloria Jean's 115,
David People 93 ve Tchibo 24 (**Toplam: 1.006 ürün**). Toplam 9 sezonluk
ürün vardır (Coffy 4, Mackbear 3, David People 2).

## Kişisel makro hedefleri

`kalori_cafe_goals` altında saklanır; eski sayısal kayıtlar
`normalizeStoredGoals` ile yerinde migrate edilir (değerler korunur,
varsayılan profil eklenir). Modal profili her açılışta yükler; geçersiz
değerlerde (yaş 15–75, kilo 35–250 kg, boy 120–230 cm) Apply kapalıdır
ve satır içi hata gösterir. Kafein metni kullanıcının **belirlediği
kişisel günlük sınır** olarak yazılır (varsayılan 400 mg).

## Dokümanlar

- [PROJECT.md](./PROJECT.md) — proje özeti, katalog ve kalite kapıları
- [GATE_STATUS.md](./GATE_STATUS.md) — güncel kapı sonuçları
- [DATA_PROVENANCE.md](./DATA_PROVENANCE.md) — kaynak sözleşmeleri

## Deploy

Statik Vite çıktısı (`dist/`) `.github/workflows/pages.yml` ile GitHub
Pages'e yayınlanır (kullanıcı kök sitesi olduğu için Vite `base` değişmez;
asset yolları `/images/...` kalır). Tetikleyiciler: `master` push ve manuel
`workflow_dispatch`.

## Arama motorları (SEO)

- `public/sitemap.xml` (canlı `/sitemap.xml`) ve `public/robots.txt`
  (`Allow: /` + `Sitemap:` yönergesi) yayında.
- `index.html` içinde JSON-LD `WebSite` yapılandırılmış verisi, `og:*`
  meta'ları ve `lang="tr"` mevcut.
- **Bekleyen (kullanıcı):** Google Search Console'da mülk ekle
  (`https://kalorikafe.github.io/`), HTML doğrulama dosyasını
  bize ver → `public/`'e koyup push edelim, sonra `sitemap.xml` gönder ve
  ilk "URL Indexing isteği"ni başlat. Yeni sitenin Google'da çıkması
  günler sürebilir.
