# Kalori Cafe — DeepSeek Gece Uygulama Görevi

Bu dosya bir fikir/plan üretme isteği değildir. Bu projeyi doğrudan incele, araştır, değiştir, test et ve tamamla. Kullanıcı gece boyunca erişilemez kabul edilmelidir; aşağıdaki kararlar kesindir ve sıradan uygulama ayrıntıları için kullanıcıya soru sorma.

## 1. Çalışma bağlamı

- Çalışma dizini: `C:\Users\Selim Gürsoy\Desktop\kalori_cafe`
- Teknoloji: React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Vitest ve Playwright.
- Yayınlama/deployment yapma. Yalnızca yerel projeyi geliştir ve doğrula.
- Mevcut özellikleri, kullanıcı tariflerini ve localStorage verileriyle geriye dönük uyumluluğu koru.
- Tarih ve katalog kesiti: **5 Ağustos 2026, Europe/Istanbul**.

### Doğrulanmış başlangıç durumu

- 10 zincirde toplam 199 ürün var.
- Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear, Arabica, Gloria Jean's ve Tchibo 20; David People 19 ürün içeriyor.
- 199 ürün yalnızca 20 farklı görsel yolu kullanıyor.
- `/images/caffe_latte.jpg` 64 farklı üründe kullanılıyor ve çoğu ürünle anlamsal olarak uyuşmuyor.
- Arama motoru veri setini teknik olarak filtreliyor; örneğin `Sarelle Mocha` sorgusu tek ürüne düşüyor. Fakat kullanıcı hero ve filtrelerin üstünde kaldığı için sonucu göremiyor ve aramayı bozuk sanıyor.
- Koyu temada gövde yaklaşık `#0C0A09`, kartlar `#171412`; yüzeyler birbirinden yeterince ayrılmıyor ve tema kasvetli görünüyor.
- Geçmişte katalog 400/420 ürüne çıkarılmış, fakat zincirler arasında şablon ürünler kopyalanarak sayı yapay biçimde şişirilmiş. Bu yaklaşımı kesinlikle tekrarlama.

## 2. İlk zorunlu işlemler

### 2.1 Goal oluştur

Önce `/goal status` eşdeğeriyle bu oturumun zaten aktif bir Hermes Goal'u tarafından başlatılıp başlatılmadığını değerlendir. Kullanıcı bu dosyayı `/goal ...` komutuyla başlattıysa mevcut Goal'u aynen kullan; ikinci/nested Goal oluşturmaya çalışma. Aktif Goal yoksa ilk araç çağrın Hermes'in yerleşik **Goal/create_goal** komutu olsun. Şu hedefi aynen kullan:

> Kalori Cafe kataloğunu güncel resmî ürünlerle genişlet, doğru görsellerle eşleştir, aramayı görünür ve erişilebilir hale getir, sıcak espresso koyu temasını uygula ve bütün kalite kapılarını geçir.

- Kullanıcı bir token bütçesi vermedi; Goal için kendiliğinden token bütçesi belirleme.
- Goal'u yalnızca tüm zorunlu kontroller geçip rapor tamamlandığında `complete` yap.
- Zorluk, uzun süren araştırma veya tek bir engellenmiş site Goal'u bırakmak için gerekçe değildir. Güvenli alternatif kaynaklara geç ve diğer iş kalemlerini sürdür.

### 2.2 Güvenli geri dönüş noktası oluştur

Bu klasörde başlangıçta Git deposu yoktur. Kaynak kodu değiştirmeden önce:

1. `.gitignore` dosyasını incele ve en az şunların dışlandığını doğrula: `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, geçici dosyalar ve ortam sırrı dosyaları.
2. `git init` çalıştır.
3. Git kullanıcı bilgisi yoksa yalnızca bu depo için şu yerel bilgileri ayarla:
   - `user.name = DeepSeek Hermes`
   - `user.email = deepseek-hermes@local.invalid`
4. Mevcut hâli `chore: snapshot before deepseek overnight pass` mesajıyla ilk commit olarak kaydet.
5. Kullanıcının mevcut dosyalarını silme, hard reset uygulama veya kayıtsız değişiklikleri yok etme.

### 2.3 Başlangıç denetimi

- `npm run lint`, `npm run build`, `npm test` komutlarını değişiklik öncesi çalıştır.
- Başlangıçta başarısız kontrol varsa çıktıyı rapora kaydet; görev kapsamındaki sorunları düzelt, ilgisiz bir sorun varsa açıkça belgele.
- `src/types/cafe.ts`, `src/data/items.ts`, `src/data/chains.ts`, `scripts/generate_items.mjs`, arama bileşenleri, tema stilleri ve testleri oku.
- `.agents/` altındaki eski raporları yalnızca tarihçe olarak gör; onların başarı iddialarını kaynak kabul etme. Gerçek kodu ve kendi ölçümlerini esas al.

## 3. Uygulama sırası ve commit sınırları

Aşağıdaki sırayla ilerle. Her bölümün kontrolleri geçince küçük bir commit oluştur:

1. `refactor: modularize sourced cafe catalog`
2. `feat: replace mismatched product imagery`
3. `feat: make menu search visible and accessible`
4. `feat: rebalance warm espresso dark theme`
5. `test: enforce catalog and ux quality gates`
6. `docs: add deepseek overnight completion report`

Bir bölüm diğerinden bağımsız ilerleyebiliyorsa engellenmiş araştırma yüzünden tüm görevi durdurma.

## 4. Katalog ve kaynak doğruluğu

### 4.1 Kapsam

Şu 10 zinciri koru:

- Starbucks
- Espressolab
- Kahve Dünyası
- Caffè Nero
- Coffy
- Mackbear Coffee Co.
- Arabica Coffee House
- Gloria Jean's
- David People
- Tchibo

Yalnızca 5 Ağustos 2026 tarihinde resmî menüde görünen:

- güncel kalıcı ürünleri,
- o tarihte aktif sezonluk ürünleri

dahil et. Arşivden kaldırılmış, söylenti niteliğindeki veya yalnızca eski üçüncü taraf listelerinde bulunan ürünleri ekleme.

### 4.2 Ürün sayısı ilkesi

- Zincir başına 20/40/50 gibi sabit ve yapay bir kota kullanma.
- Her zincirin erişilebilen resmî web menüsü, resmî PDF/besin rehberi, resmî sipariş yüzeyi ve resmî sosyal duyurularını tarayarak güncel kataloğu olabildiğince eksiksiz çıkar.
- Toplam ürün sayısı **199'un üzerine çıkmalıdır**.
- Bir zincir 20 veya daha az üründe kalırsa final raporda taranan resmî kaynakları ve neden daha fazla doğrulanabilir ürün bulunamadığını yaz.
- Ürün adı, açıklama, makro veya görseli başka zincirden kopyalayıp yalnızca zincir adını değiştirerek sayı artırma.
- Aynı zincir içindeki boyut varyasyonlarını ayrı ürün gibi sayma; boyutlar mevcut özelleştirici modeli üzerinden yönetilsin.

### 4.3 Kaynak önceliği

Kaynakları şu sırada kullan:

1. Zincirin resmî Türkiye web sitesi veya resmî menü/PDF dosyası.
2. Zincirin resmî sipariş sayfası veya resmî uygulama yüzeyi.
3. Zincirin doğrulanabilir resmî sosyal medya duyurusu.
4. Resmî kaynak erişilemiyorsa güvenilir ikincil kaynak; bunu `secondary` olarak işaretle ve nedenini raporla.

Kaynakta olmayan bir değeri varmış gibi gösterme. Resmî besin bilgisi bulunamazsa makroyu makul tarif/standart porsiyon üzerinden tahmin et, `nutritionSource.status = 'estimated'` yap ve yöntemi `notes` alanında belirt. `verified` yalnızca doğrudan kaynak URL'si, kontrol tarihi ve porsiyon temeli varsa kullanılabilir.

### 4.4 Veri modeli ve modüler yapı

`MenuItem` modelini geriye dönük uyumlu şekilde genişlet:

```ts
availability?: 'current' | 'seasonal';
catalogSource?: {
  url: string;
  checkedAt: string; // YYYY-MM-DD
  kind: 'official' | 'secondary';
};
imageSource?: {
  url: string;
  kind: 'official' | 'licensed_fallback';
  exactProduct: boolean;
};
```

- Bu alanlar tip seviyesinde opsiyonel kalabilir; çünkü localStorage'dan gelen kullanıcı tarifleri katalog kaynağı taşımaz.
- Buna karşılık otomatik katalog denetimi, `MENU_ITEMS` içindeki her statik ürün için `availability`, `catalogSource`, `imageSource` ve eksiksiz `nutritionSource` bulunmasını zorunlu kılsın.
- Katalog kaynak dosyalarını zincir başına `src/data/catalog/<chain>.ts` biçiminde ayır.
- `src/data/items.ts` yalnızca zincir listelerini birleştirip `MENU_ITEMS` olarak dışa aktarsın.
- `scripts/generate_items.mjs` mevcut kataloğu şablonlarla yeniden ezememeli. Güvenle kaldır, arşivle veya sadece doğrulanmış modüllerden çıktı üreten bir araca dönüştür; final raporda kararı açıkla.
- Ürün kimlikleri kararlı ve benzersiz olsun. Mevcut ürün mümkün olduğunca mevcut ID'sini korusun; favoriler ve sepet verileri gereksiz yere bozulmasın.

## 5. Ürün görselleri

### 5.1 Eşleştirme politikası

Her ürün için sırasıyla:

1. Gerçek ürünün zincire ait resmî görselini ara.
2. Resmî görsel yoksa ürünün sıcak/soğuk oluşunu, ürün tipini, aromasını ve sunumunu doğru temsil eden, kaynak sayfası doğrulanabilir lisanslı bir fallback seç.
3. Rastgele kahve fotoğrafını uyumsuz ürüne atama.
4. Lisans bilgisini uydurma; fallback kaynağının sayfa URL'sini `imageSource.url` içine kaydet.

Örnek kesin kural:

- İki zincirin Iced Americano ürünü, her ikisinin de resmî görseli bulunamadıysa aynı doğru Iced Americano fallback görselini kullanabilir.
- Iced Americano; Iced Latte, sıcak Latte, Cold Brew veya Frappé görseli kullanamaz.
- Çikolatalı pasta sade cheesecake, sandviç kruvasan, limonata smoothie görseli kullanamaz.

### 5.2 Yerel varlıklar

- Çalışma zamanında Unsplash, Pexels, Google Favicon veya başka görsel hotlink'i ürün kartlarında kullanma.
- Görselleri `public/images/menu/<chain>/<slug>.webp` altında yerel WebP olarak sakla.
- Kart görünümü için uygun kırpma kullan; görüntüyü gereksiz büyütme. Tercihen yaklaşık 800–1200 px genişlikte ve görsel kaliteyi koruyarak sıkıştır.
- Dosya adı ürün slug'ıyla anlamlı olsun.
- `ItemCard` hata fallback'i de uzaktaki rastgele Unsplash URL'si yerine yerel, nötr ve açıkça genel bir placeholder kullansın.

### 5.3 Ölçülebilir kalite kapıları

- Benzersiz yerel ürün görseli yolu / toplam ürün oranı en az `%60` olmalı.
- Tek bir fallback dosyası en fazla 6 üründe kullanılabilir.
- Tekrar edilen dosya yalnızca aynı normalleştirilmiş görsel ailesindeki ürünler için kullanılabilir.
- Tüm `MENU_ITEMS.image` değerleri `/images/menu/` altında yerel dosyalara işaret etmeli.
- Her dosya mevcut, okunabilir, sıfırdan büyük ve tarayıcıda yüklenebilir olmalı.
- Otomatik denetim şu hatalarda başarısız olsun: eksik dosya, uzak URL, bozuk WebP, sınırı aşan tekrar ve kaynak metadatası eksikliği.

## 6. Arama deneyimi

### 6.1 Arama motoru

Arama normalizasyonunu tek bir yardımcıda merkezileştir:

- Türkçe büyük/küçük harf dönüşümleri (`İ/i`, `I/ı`) doğru çalışsın.
- Kullanıcı aksan/diakritik kullanmadan yazdığında makul eşleşmeler bulunsun (`turk kahvesi` → `Türk Kahvesi`).
- Birden fazla boşluk tek boşluğa indirgensin, baş/son boşluklar temizlensin.
- Arama şu alanlarda yapılsın: ürün adı, İngilizce ad, zincir adı, açıklama, insan tarafından okunabilir kategori ve diyet etiketleri.
- Arama mantığı hem masaüstü hem mobil için aynı kaynak fonksiyon/bileşeni kullansın.

### 6.2 Görünür öneri paneli

- Kullanıcı 2 veya daha fazla karakter yazınca arama alanının altında en fazla 8 öneri göster.
- Her öneride küçük ürün görseli, ürün adı ve zincir adı bulunsun.
- Liste sorguyla canlı filtrelenmeye devam etsin.
- Enter'a basmak en uygun sonucu seçsin veya sonuç bölümüne yumuşak şekilde kaydırsın.
- Öneriye tıklamak sorguyu uygulasın, ürünün görünür olmasını sağlasın ve sonuç alanına kaydırsın.
- `ArrowDown`, `ArrowUp`, `Enter` ve `Escape` tam klavye desteği sunsun.
- Escape yalnızca öneri panelini kapatsın; sorguyu silmesin.
- Temizle düğmesi sorguyu, aktif öneriyi ve paneli sıfırlasın.
- Sonuç sayısı `aria-live` ile duyurulsun; panel uygun combobox/listbox semantiği kullansın.
- Mobil arama modalı aynı öneri ve klavye davranışını kullansın.
- Sonuç gridine kararlı bir hedef (`id`/`ref`) ekle; arama navigasyonu bu hedefe kaydırsın.

### 6.3 Test uyumluluğu

- Zincir başına sabit `20` kart bekleyen mevcut E2E testlerini yeni gerçek katalog sayılarına uyumlu ve dinamik hale getir.
- Testleri zayıflatma; zincir filtresinin yalnızca doğru zincirin kartlarını gösterdiğini doğrulamaya devam et.

## 7. Sıcak espresso koyu tema

### 7.1 Palet

Açık temanın mevcut karakterini koru. Koyu temada aşağıdaki ana tokenları kullan:

```css
--dark-bg: #17120F;
--dark-surface: #211A16;
--dark-surface-elevated: #2B211C;
--dark-border: #49372E;
--dark-text: #F7EFE8;
--dark-text-muted: #C6B4A6;
--dark-accent: #E0A15A;
```

- Tokenları `src/index.css` içinde merkezileştir; aynı rengi onlarca bileşende rastgele tekrar etme.
- Hero, navbar, ürün kartları, filtreler, modallar, çekmeceler ve mobil alt navigasyonda arka plan/yükseltilmiş yüzey ayrımı görünür olsun.
- Saf siyah geniş alanları, griye çalan cansız yüzeyleri ve ağır siyah gölgeleri kaldır.
- Amber vurguyu seçili/etkileşimli durumlarda ölçülü kullan; her yüzeyi turuncuya boyama.
- Ana metin, ikincil metin, sınır ve odak halkaları WCAG AA kontrastını karşılasın.
- Light mode davranışını ve görsel kalitesini geriletme.

### 7.2 Tema kalıcılığı

- Tema tercihini `kalori_cafe_theme` anahtarında `light` veya `dark` olarak sakla.
- Kayıtlı tercih varsa sistem tercihinden önce onu uygula.
- Kayıt yoksa `prefers-color-scheme` değerini kullan.
- Tema düğmesinin erişilebilir adı mevcut moda göre doğru değişsin.
- Mümkünse ilk boyamada tema parlamasını azalt; fakat gereksiz yeni bağımlılık ekleme.

## 8. Testler ve otomatik denetimler

### 8.1 Yeni katalog denetimi

Tekrarlanabilir bir `npm run catalog:audit` komutu ekle. En az şunları denetlesin:

- benzersiz ürün ID'leri,
- geçerli zincir referansları,
- sonlu ve negatif olmayan besin değerleri,
- her statik üründe katalog, görsel ve besin kaynağı,
- `verified` kaynakların URL/tarih/porsiyon zorunlulukları,
- yalnızca `current` veya `seasonal` durumu,
- yerel görsel dosyasının varlığı ve WebP olması,
- `%60` benzersiz görsel oranı,
- en fazla 6 tekrar sınırı,
- zincirler arasında birebir klon ürün blokları,
- toplam ürün sayısının 199'dan büyük olması.

### 8.2 Unit testleri

Şunları kapsa:

- Türkçe karakter ve diakritik normalizasyonu.
- Zincir, kategori ve etiket üzerinden arama.
- Kaynak/provenance sözleşmeleri.
- Görsel yolu ve tekrar kuralları.
- Mevcut makro hesaplama davranışının korunması.

### 8.3 E2E testleri

Şunları gerçek kullanıcı akışıyla doğrula:

- Masaüstünde 2 karakter sonrası öneri paneli.
- Öneri seçimi ve Enter ile sonuç alanına kaydırma.
- Ok tuşları, Escape ve temizleme davranışı.
- Mobil arama modalında aynı sorgu sonucu.
- Tema değişimi ve sayfa yenilendiğinde tercihin korunması.
- 390×844 ve 1440×900 boyutlarında yatay taşma olmaması.
- Her iki temada temel butonların, kartların ve metinlerin görünür olması.
- En az bir ayrı görsel testi, ürün görsellerini ağda engellemeden yerel dosyaların gerçekten yüklendiğini ve `naturalWidth > 0` olduğunu doğrulasın. Mevcut genel E2E `beforeEach` görselleri engelliyorsa bu testi ayrı dosyada veya ayrı fixture'da çalıştır.

### 8.4 Son kalite kapıları

Şu komutların tamamı sıfır çıkış koduyla bitmeden Goal'u tamamlanmış sayma:

```powershell
npm run catalog:audit
npm run lint
npm run build
npm test
npm audit
```

- Test silme, `skip`, `only`, anlamsız assertion veya uygulama mantığını testlere özel koşulla geçirme yasaktır.
- Hata varsa kök nedeni düzelt ve bütün komutları yeniden çalıştır.
- `npm audit` bağımlılık değişikliği gerektiriyorsa güvenli, uyumlu güncellemeyi yap; kırıcı büyük sürüm yükseltmesini sırf audit için zorlamadan raporla.

## 9. Görsel doğrulama

- Uygulamayı yerel olarak çalıştır.
- 1440×900 masaüstü ile 390×844 mobil görünümü hem açık hem koyu temada incele.
- Hero, navbar, arama önerileri, zincir filtresi, ürün kartları, modal ve mobil alt navigasyonu kontrol et.
- Yatay taşma, kesilen metin, görünmeyen odak halkası, düşük kontrast, yanlış ürün fotoğrafı veya tema yüzeylerinin birbirine karışması kalmamalı.
- Doğrulama ekran görüntülerini geçici test çıktısında sakla; gereksiz büyük binary dosyaları Git'e ekleme.

## 10. Final rapor

Proje kökünde `DEEPSEEK_NIGHT_REPORT.md` oluştur. Şunları somut tablolarla raporla:

1. Her zincir için önceki ürün sayısı, güncel ürün sayısı, aktif sezonluk ürün sayısı ve toplam.
2. Zincir başına taranan resmî kaynak URL'leri ve erişim tarihi.
3. Toplam ürün, benzersiz görsel, benzersiz görsel yüzdesi, en çok tekrarlanan görsel ve tekrar sayısı.
4. Resmî görsel / lisanslı fallback sayıları ile `exactProduct` dağılımı.
5. `verified`, `estimated` ve `unverified` besin kaynağı sayıları.
6. Arama ve koyu tema değişikliklerinin kısa açıklaması.
7. Oluşturulan commit hash'leri ve mesajları.
8. Çalıştırılan bütün kalite komutlarının tam sonucu.
9. Erişilemeyen kaynaklar, kalan belirsizlikler ve dürüstçe belirtilmiş sınırlamalar.

Raporu oluşturmadan ve son kontrolleri geçmeden başarı iddiasında bulunma. Sayıları tahmin ederek yazma; çalışan koddan otomatik ölç.

## 11. Tamamlanma tanımı

Görev ancak aşağıdakilerin tamamı gerçekleştiğinde bitmiştir:

- Goal oluşturuldu ve çalışma boyunca aktif tutuldu.
- Git başlangıç kaydı ve aşamalı commitler mevcut.
- Güncel/aktif sezonluk resmî ürün araştırması tamamlandı ve toplam katalog 199'u geçti.
- Şablon/klon ürünlerle sayı şişirilmedi.
- Bütün katalog ürünleri kaynak ve görsel provenance bilgisi taşıyor.
- Ürün görselleri yerel, anlamlı, yüklenebilir ve tekrar kalite kapılarını geçiyor.
- Arama öneri paneli masaüstü ve mobilde erişilebilir biçimde çalışıyor; Enter sonuçlara götürüyor.
- Sıcak espresso koyu tema uygulanmış, tercih kalıcı ve açık tema bozulmamış.
- `catalog:audit`, lint, build, unit/E2E testler ve audit tamamlanmış.
- `DEEPSEEK_NIGHT_REPORT.md` gerçek ölçümler ve komut çıktılarıyla yazılmış.
- Ancak bundan sonra Goal `complete` olarak işaretlenmiş.

Şimdi plan anlatma. İlk olarak Goal'u oluştur, ardından güvenli başlangıç kaydını al ve görevi uygulamaya başla.
