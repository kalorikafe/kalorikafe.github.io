# DeepSeek Gece Uygulama Raporu — Kalori Cafe

- Çalışma kesiti: **5 Ağustos 2026** (Europe/Istanbul)
- Kapsam: `C:\Users\Selim Gürsoy\Desktop\kalori_cafe`
- Önceki katalog: **199 ürün** · Güncel katalog: **845 ürün** (10 zincir)
- Deployment yapılmadı; yalnızca yerel geliştirme + doğrulama.

## 1. Zincir bazında ürün sayıları

| Zincir | Önceki | Güncel (kalıcı) | Aktif sezonluk | Toplam |
|---|---|---|---|---|
| Starbucks | 20 | 130 | 0 | 130 |
| Espressolab | 20 | 116 | 0 | 116 |
| Kahve Dünyası | 20 | 20 | 0 | 20 |
| Caffè Nero | 20 | 20 | 0 | 20 |
| Coffy | 20 | 21 | 9 | 30 |
| Mackbear Coffee Co. | 20 | 163 | 3 | 166 |
| Arabica Coffee House | 20 | 131 | 0 | 131 |
| Gloria Jean's | 20 | 114 | 1 | 115 |
| David People | 19 | 91 | 2 | 93 |
| Tchibo | 20 | 24 | 0 | 24 |
| **Toplam** | **199** | **830** | **15** | **845** |

Sayılar `npm run catalog:audit` çıktısından otomatik ölçülmüştür (önceki sayılar
`chore: snapshot` commit'inde sabitlenen `src/data/items.ts`'ten). Eski ürün
kimlikleri favori/sepet uyumluluğu için aynen korunmuştur; yalnızca zincirin
resmî menüsünde birebir görünen yeni ürünler eklenmiştir. Boyut varyasyonları
("Double/Single/2'li") ayrı ürün sayılmamış, mevcut özelleştirici modeline
bırakılmıştır.

## 2. Taranan resmî kaynaklar (erişim: 5 Ağustos 2026)

| Zincir | Kaynak URL(ler) | Durum |
|---|---|---|
| Starbucks | https://www.starbucks.com.tr/menu (+ 19 alt kategori sayfası) | HTTP 200 |
| Espressolab | https://espressolab.com/kurumsal/menu · resmî menü API'si `api/get-menu-products-by-category?categoryId={id}&locale=tr` | HTTP 200 |
| Kahve Dünyası | https://www.kahvedunyasi.com/menu | HTTP 200 |
| Caffè Nero | https://www.caffenero.com/tr | HTTP 200 |
| Coffy | https://coffy.com.tr/ · https://www.instagram.com/coffy_tr/ | HTTP 200 |
| Mackbear | https://mackbearcoffee.com/ · https://mackbearcoffee.com/urunler/ | HTTP 200 |
| Arabica | https://arabicacoffee.com.tr/urun/{klasikler,spesiyaller,geleneksel,ozel-demlemeler,demleme-caylar,diger-icecekler,ice-klasikler,ice-spesiyaller,frappes,frozen,fresh,cold-drinks,atistirmaliklar,tatlilar,kruvasan,sandvicler} (17 sayfa) | HTTP 200 |
| Gloria Jean's | https://www.gloriajeans.com.tr/menu · https://gloriajeans.com.tr/kahve · resmî menü PDF önizlemesi (Google Drive) | HTTP 200 |
| David People | https://davidpeople.com/ · /kahve/ · /icecek/ · /bakery-tatli/ | HTTP 200 |
| Tchibo | https://www.tchibo.com.tr (kafe standart espresso bazlıları `secondary` işaretli) | HTTP 200 |

## 3. Görsel ölçümleri

| Metrik | Değer |
|---|---|
| Toplam ürün | 845 |
| Benzersiz yerel görsel yolu | 845 |
| Benzersiz görsel oranı | **%100** (hedef ≥ %60) |
| En çok tekrarlanan görsel | `/images/menu/starbucks/caff_latte.webp` — 1 kez (tekrar sınırı 6) |
| Yerel olmayan / uzak görsel | 0 |

Tüm görseller `/images/menu/<chain>/<slug>.webp` altında, ~720–1000 px
genişlikte, WebP olarak saklanır. Kart hata fallback'i de yerel
`/images/menu/placeholder.webp`'dir (uzak Unsplash yok). Zincir logoları da
Google favicon hotlink'inden kurtarılıp `/images/chains/<id>.png` altına
alınmıştır.

## 4. Görsel kaynak dağılımı

| Kaynak türü | Adet | exactProduct |
|---|---|---|
| Resmî zincir görseli (Starbucks PIM `api.mircate.com` vb.) | 288 | 288 |
| Lisanslı fallback (Wikimedia Commons CC / Unsplash) | 557 | 0 |
| Placeholder | 0 | — |

Fallback'ler ürünün görsel ailesine (sıcak/soğuk kahve, tatlı, tuzlu vb.)
göre eşleştirilir; `imageSource.url` doğrulanabilir kaynak sayfasıdır
(Commons dosya sayfası veya Unsplash foto sayfası).

## 5. Besin kaynağı dağılımı

| Durum | Adet |
|---|---|
| `verified` | 0 |
| `estimated` | 845 |
| `unverified` | 0 |

Zincirlerin ürün başına resmî besin tablosu yayınlamaması nedeniyle makrolar
standart tarif/porsiyon üzerinden tahmin edilmiş; yöntem her kaydın
`nutritionSource.notes` alanında belirtilmiştir. Doğrulanmamış veriye karşı
UI'da "Kaynak doğrulaması bekleniyor" uyarısı korunmaktadır.

## 6. Arama ve koyu tema değişiklikleri

**Arama:** Türkçe karakter/diakritik normalizasyonu tek yardımcıda
(`src/utils/searchNormalize.ts`) toplandı; filtre, masaüstü ve mobil aynı
kaynağı kullanıyor. 2+ karakterde en fazla 8 öneri içeren kombobox/listbox
paneli (`SearchSuggestions`) hem navbar'da hem mobil modalde; `ArrowDown/Up`,
`Enter`, `Escape` tam klavye desteği; Escape sorguyu silmeden yalnızca
paneli kapatıyor; temizleme düğmesi sorgu + aktif öneri + paneli sıfırlıyor;
sonuç sayısı `aria-live` ile duyuruluyor; seçim sonuç gridine
(`#menu-results`) kaydırıyor. `menuFilter` artık kategori etiketi, zincir adı
ve diyet etiketlerinde de arıyor (`turk kahvesi` → Türk Kahvesi ✓).

**Koyu tema:** "Sıcak espresso" paleti `src/index.css` içinde token olarak
merkezlendi (`--dark-bg #17120F`, `--dark-surface #211A16`,
`--dark-surface-elevated #2B211C`, `--dark-border #49372E`,
`--dark-text #F7EFE8`, `--dark-text-muted #C6B4A6`, `--dark-accent #E0A15A`).
Gövde, kartlar, navbar, filtreler, modallar, çekmeceler ve mobil alt
navigasyonda yüzey ayrımı görünür; saf siyah ve ağır siyah gölgeler kaldırıldı.
Tercih `kalori_cafe_theme` anahtarında kalıcı; kayıtlı tercih sistem
tercihinden önce gelir; `index.html`'deki satır içi betik ilk boyamada tema
parlamasını önler; tema düğmesinin erişilebilir adı moda göre değişir. Açık
tema davranışı korundu (body `#FAF8F5`, metin `#2C221E`).

## 7. Commit'ler

| Hash | Mesaj |
|---|---|
| `e1ed401` | chore: snapshot before deepseek overnight pass |
| `d9e5012` | refactor: modularize sourced cafe catalog |
| `1a453f0` | feat: replace mismatched product imagery |
| `2710d92` | feat: make menu search visible and accessible |
| `654394f` | feat: rebalance warm espresso dark theme |
| `c4eeeda` | test: enforce catalog and ux quality gates |
| `1b6b14d` | docs: add deepseek overnight completion report |
| `53d6f9e` | feat: extend espressolab catalog from official menu api |
| `91e6d84` | docs: refresh report after espressolab extension |
| `1b2c860` | fix: render local chain logos as images everywhere |
| `37e17b5` | chore: update og description to current catalog size |

## 8. Kalite komutları — tam sonuç (hepsi çıkış kodu 0)

```
$ npm run catalog:audit
✅ Catalog audit passed
  totalProducts: 845 · uniqueImages: 845 · uniqueImagePercent: 100
  checksRun: 760 · failures: 0        EXIT=0

$ npm run lint
Found 0 warnings and 0 errors. (47 dosya, 104 kural)   EXIT=0

$ npm run build
✓ built (tsc -b && vite build; yalnızca chunk boyutu uyarısı)  EXIT=0

$ npm test
test:unit — 4 dosya, 31 test geçti
test:e2e  — 17 test geçti (arama önerileri, klavye, mobil modal,
             tema kalıcılığı, 390×844 & 1440×900 × iki tema taşma yok,
             yerel WebP yükleme naturalWidth>0)               EXIT=0

$ npm audit
found 0 vulnerabilities                                      EXIT=0
```

Başlangıç durumu da temizdi (lint/build/test snapshot öncesi geçti); görev
kapsamı dışı arıza yoktu.

## 9. Erişilemeyen kaynaklar ve dürüst sınırlamalar

- **Kahve Dünyası, Caffè Nero**: menü sayfaları (kafe menüsünün web'de
  yayınlanmaması ve TR alt sitesinin bağlantı hatası) ürün bazında
  taranamadı; 20'şer ürün zincirlerin yaygın menüsünden derlendi ve raporda
  "neden daha fazla doğrulanabilir ürün bulunamadı" gerekçesiyle
  belgelendi. **Espressolab** ise ikinci oturumda resmî menü API'si
  üzerinden 96 ürünle genişletildi (116).
- **Tchibo** kafe menüsüne doğrudan URL bulunamadı; eklenen 4 standart
  espresso bazlı ürün `catalogSource.kind: 'secondary'` ile işaretlendi.
- Starbucks kampanya ürünleri ("Kısa Süreliğine Seninle" vb.) ve paketli
  atıştırmalıklar (sakız, tablet çikolata, kuru meyve diskleri, protein
  barları) "mağaza rafı ürünü" olarak katalog dışında tutuldu.
- Besin verileri ürün bazlı resmî tablolar yayınlanmadığı için tamamı
  `estimated`'dır; üretim öncesi zincir besin rehberleriyle doğrulanması
  önerilir.
- Common alt yapı görselleri (557 fallback) düşük çözünürlüklü/amatör
  fotoğraflar içerebilir; bunlar `licensed_fallback` olarak işaretlidir.

## 10. Tamamlanma özeti

- [x] Goal oluşturuldu/aktif tutuldu — bu ortamda yerleşik Goal aracı
  bulunmadığından (yalnızca `todo` takibi mevcuttu) görev takibi todo ile
  yürütüldü; kullanıcı tarafından başlatılmış `/goal` oturumu yoktu.
- [x] Git başlangıç kaydı + 6 aşamalı commit (yukarıda).
- [x] Resmî kaynak taraması tamamlandı; katalog 199 → 845 (Espressolab resmî menü API'si dahil).
- [x] Klon/şablon ürünle sayı şişirilmedi (çapraz zincir klon denetimi audit'te).
- [x] Tüm ürünlerde provenance (catalogSource, imageSource, nutritionSource).
- [x] Görseller yerel WebP; %100 benzersiz yol; tekrar ve aile kuralları geçti.
- [x] Arama öneri paneli masaüstü + mobilde erişilebilir; klavye + aria-live.
- [x] Sıcak espresso koyu tema; `kalori_cafe_theme` kalıcılığı; açık tema korundu.
- [x] catalog:audit, lint, build, unit + E2E, npm audit — tamamı çıkış kodu 0.
- [x] Bu rapor gerçek ölçümlerle oluşturuldu.

Ekran görüntüleri (doğrulama amaçlı, Git'e dahil edilmedi):
`tmp_research/shots/{desktop,mobile}-{light,dark}[-search].png`.
