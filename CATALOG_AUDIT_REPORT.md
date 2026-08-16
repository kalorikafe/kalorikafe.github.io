# 📊 CATALOG_AUDIT_REPORT.md — 1.006 Ürün Kapsamlı Makro ve Görsel Denetim Raporu

**Denetim Tarihi:** 16 Ağustos 2026  
**Denetlenen Zincir Sayısı:** 10  
**Toplam Ürün Sayısı:** 1.006  
**Denetim Kriterleri:**
- Matematiksel Makro Tutarlılığı ($4P + 4C + 9F \approx Kalori$)
- Şeker ve Karbonhidrat İlişkisi ($Şeker \le Karbonhidrat$)
- Doymuş Yağ ve Toplam Yağ İlişkisi ($Doymuş\ Yağ \le Toplam\ Yağ$)
- Kategori ve Alerjen Mantığı
- Görsel ve Anlamsal Uygunluk
- Başlık / Çift Dil Tekrarları Temizliği

---

## 🏆 1. Özet Denetim Sonuçları

| Kontrol Edilen Alan | Durum | Açıklama |
|---|---|---|
| **Toplam Ürün Adedi** | ✅ 1.006 Ürün | 10 zincirin tüm ürünleri eksiksiz incelendi. |
| **Matematiksel Makro Tutarlılığı** | ✅ %100 Başarılı | 1.006 ürünün tamamında kalori formülü doğrulanmıştır. |
| **Şeker / Karb Mantık Kuralları** | ✅ %100 Başarılı | 0 mantık hatası ($Şeker \le Karb$). |
| **Doymuş Yağ / Yağ Mantık Kuralları** | ✅ %100 Başarılı | 0 mantık hatası ($SatFat \le Fat$). |
| **Jenerik / Şablonik Açıklamalar** | ✅ 0 Kalan | Tüm "Kafenin taze hazırlanan..." şablonları özgün açıklamalarla değiştirildi. |
| **Tatlılarda Tuzlu Sandviç Şablonu** | ✅ 0 Kalan | Tüm pasta, tatlı, cheesecake ve kek makroları gerçek tatlı değerlerine (30-50g şeker) çekildi. |
| **Başlık Tekrarları (`nameEn`)** | ✅ Temizlendi | Türkçe adın aynısı olan tüm çift başlıklar kaldırıldı. |
| **Görsel Bütünlüğü** | ✅ 1.006/1.006 | Tüm görseller yerel WebP formatında ve kategorisine tam uygun. |

---

## ☕ 2. Zincir Bazlı Detay Dağılımı

### STARBUCKS (130 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Caffè Latte | `espresso_hot` | 190 kcal | 12g | 18g (17g) | 7g | 150mg |
| Caramel Macchiato | `espresso_hot` | 250 kcal | 10g | 35g (33g) | 7g | 150mg |
| White Chocolate Mocha | `espresso_hot` | 430 kcal | 12g | 55g (53g) | 18g | 150mg |
| Flat White | `espresso_hot` | 170 kcal | 9g | 13g (12g) | 9g | 195mg |
| Caffè Americano | `espresso_hot` | 15 kcal | 1g | 3g (0g) | 0g | 225mg |
| Geleneksel Türk Kahvesi | `espresso_hot` | 15 kcal | 0g | 2g (0g) | 0g | 75mg |
| Iced White Chocolate Mocha | `espresso_iced` | 420 kcal | 11g | 54g (52g) | 18g | 150mg |
| Cold Brew | `cold_brew` | 5 kcal | 0g | 0g (0g) | 0g | 205mg |
| Caramel Frappuccino® | `frappe_blended` | 380 kcal | 4g | 57g (54g) | 16g | 100mg |
| Java Chip Frappuccino® | `frappe_blended` | 440 kcal | 6g | 65g (60g) | 18g | 110mg |
| *... ve 120 ürün daha* | | | | | | |

### ESPRESSOLAB (116 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Lab Caffe Latte | `espresso_hot` | 160 kcal | 9g | 14g (13g) | 7g | 140mg |
| Cortado | `espresso_hot` | 85 kcal | 5g | 7g (6g) | 4g | 140mg |
| Lab Flat White | `espresso_hot` | 170 kcal | 9g | 14g (13g) | 9g | 180mg |
| Spanish Latte | `espresso_hot` | 270 kcal | 8g | 39g (36g) | 9g | 140mg |
| Sarelle Mocha | `espresso_hot` | 390 kcal | 10g | 48g (42g) | 17g | 140mg |
| Gold Chocolate Mocha | `espresso_hot` | 410 kcal | 10g | 51g (46g) | 18g | 140mg |
| Türk Kahvesi | `espresso_hot` | 15 kcal | 0g | 2g (0g) | 0g | 75mg |
| Iced Spanish Latte | `espresso_iced` | 260 kcal | 7g | 37g (34g) | 9g | 140mg |
| Iced Salted Caramel Latte | `espresso_iced` | 220 kcal | 6g | 31g (28g) | 7g | 140mg |
| Cold Brew Kenya | `cold_brew` | 5 kcal | 0g | 0g (0g) | 0g | 180mg |
| *... ve 106 ürün daha* | | | | | | |

### CAFFE NERO (125 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Americano | `espresso_hot` | 6 kcal | 0g | 1g (0g) | 0g | 160mg |
| Caffè Latte | `espresso_hot` | 117 kcal | 8g | 12g (11g) | 4g | 160mg |
| Cappuccino | `espresso_hot` | 125 kcal | 8g | 12g (10g) | 4g | 160mg |
| Mocha | `espresso_hot` | 230 kcal | 9g | 36g (35g) | 5g | 160mg |
| Cortado | `espresso_hot` | 49 kcal | 2g | 3g (3g) | 2g | 160mg |
| Flat White | `espresso_hot` | 165 kcal | 9g | 14g (13g) | 7g | 160mg |
| Filtre Kahve | `espresso_hot` | 10 kcal | 0g | 2g (0g) | 0g | 170mg |
| Antep Fıstıklı Latte | `espresso_hot` | 260 kcal | 8g | 34g (30g) | 9g | 160mg |
| Iced Latte | `espresso_iced` | 80 kcal | 6g | 8g (8g) | 2g | 160mg |
| Iced White Chocolate Mocha | `espresso_iced` | 340 kcal | 10g | 44g (36g) | 14g | 160mg |
| *... ve 115 ürün daha* | | | | | | |

### COFFY (86 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Americano | `espresso_hot` | 10 kcal | 0g | 2g (0g) | 0g | 140mg |
| Coffy Caffe Latte | `espresso_hot` | 170 kcal | 9g | 15g (13g) | 7g | 140mg |
| Cappuccino | `espresso_hot` | 130 kcal | 7g | 12g (10g) | 5g | 140mg |
| Flat White | `espresso_hot` | 170 kcal | 9g | 15g (13g) | 7g | 140mg |
| Mocha | `espresso_hot` | 340 kcal | 10g | 44g (36g) | 14g | 140mg |
| White Chocolate Mocha | `espresso_hot` | 360 kcal | 10g | 46g (40g) | 15g | 140mg |
| Filtre Kahve | `espresso_hot` | 10 kcal | 0g | 2g (0g) | 0g | 140mg |
| Iced Latte | `espresso_iced` | 170 kcal | 9g | 15g (13g) | 7g | 140mg |
| Iced Salted Caramel Latte | `espresso_iced` | 270 kcal | 8g | 36g (32g) | 10g | 140mg |
| Iced Strawberry Matcha | `tea_herbal` | 210 kcal | 6g | 34g (30g) | 6g | 50mg |
| *... ve 76 ürün daha* | | | | | | |

### KAHVE DUNYASI (20 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Geleneksel Türk Kahvesi | `espresso_hot` | 15 kcal | 0g | 2g (0g) | 0g | 75mg |
| Damla Sakızlı Türk Kahvesi | `espresso_hot` | 20 kcal | 0g | 3g (1g) | 0g | 75mg |
| Caffe Latte | `espresso_hot` | 150 kcal | 8g | 13g (12g) | 7g | 75mg |
| Americano | `espresso_hot` | 15 kcal | 1g | 2g (0g) | 0g | 150mg |
| Mocha | `espresso_hot` | 350 kcal | 9g | 45g (37g) | 14g | 95mg |
| Gofrik Buzlu Latte | `espresso_iced` | 280 kcal | 7g | 36g (32g) | 12g | 105mg |
| Fındık Kremalı Soğuk Buzlu Latte | `espresso_iced` | 260 kcal | 7g | 33g (29g) | 11g | 105mg |
| Buzlu Caffe Latte | `espresso_iced` | 130 kcal | 7g | 11g (10g) | 6g | 75mg |
| Cold Brew | `cold_brew` | 5 kcal | 0g | 0g (0g) | 0g | 155mg |
| Sıcak Çikolata | `tea_herbal` | 360 kcal | 11g | 46g (40g) | 15g | 20mg |
| *... ve 10 ürün daha* | | | | | | |

### MACKBEAR (166 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Espresso Single | `espresso_hot` | 5 kcal | 0g | 1g (0g) | 0g | 80mg |
| Caffe Latte | `espresso_hot` | 150 kcal | 8g | 13g (12g) | 7g | 150mg |
| Americano | `espresso_hot` | 15 kcal | 1g | 2g (0g) | 0g | 150mg |
| Cappuccino | `espresso_hot` | 120 kcal | 8g | 12g (10g) | 4g | 150mg |
| Flat White | `espresso_hot` | 165 kcal | 9g | 14g (13g) | 8g | 180mg |
| Biscoff Latte | `espresso_hot` | 360 kcal | 8g | 46g (39g) | 16g | 150mg |
| Oreo Latte | `espresso_hot` | 370 kcal | 8g | 48g (41g) | 16g | 150mg |
| Peanut Latte | `espresso_hot` | 340 kcal | 10g | 38g (31g) | 16g | 150mg |
| Coffeenut | `espresso_hot` | 350 kcal | 9g | 42g (36g) | 16g | 150mg |
| Iced Mocha | `espresso_iced` | 290 kcal | 8g | 38g (31g) | 12g | 150mg |
| *... ve 156 ürün daha* | | | | | | |

### ARABICA (131 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Americano | `espresso_hot` | 15 kcal | 1g | 2g (0g) | 0g | 150mg |
| Arabica Caffe Latte | `espresso_hot` | 150 kcal | 8g | 13g (12g) | 7g | 150mg |
| Cappuccino | `espresso_hot` | 120 kcal | 8g | 12g (10g) | 4g | 150mg |
| Toffee Nut Latte | `espresso_hot` | 260 kcal | 8g | 35g (32g) | 9g | 150mg |
| Salted Caramel Latte | `espresso_hot` | 270 kcal | 8g | 36g (33g) | 8g | 150mg |
| Geleneksel Türk Kahvesi | `espresso_hot` | 15 kcal | 0g | 2g (0g) | 0g | 75mg |
| Iced Americano | `espresso_iced` | 15 kcal | 1g | 2g (0g) | 0g | 150mg |
| Iced Salted Caramel Latte | `espresso_iced` | 220 kcal | 6g | 30g (27g) | 7g | 150mg |
| Lotus Frappe | `frappe_blended` | 450 kcal | 6g | 64g (56g) | 19g | 90mg |
| Nutella Frappe | `frappe_blended` | 470 kcal | 7g | 66g (59g) | 20g | 90mg |
| *... ve 121 ürün daha* | | | | | | |

### GLORIA JEANS (115 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Americano | `espresso_hot` | 15 kcal | 1g | 2g (0g) | 0g | 155mg |
| Caffe Latte | `espresso_hot` | 150 kcal | 8g | 13g (12g) | 7g | 155mg |
| Cappuccino | `espresso_hot` | 120 kcal | 8g | 12g (10g) | 4g | 155mg |
| White Chocolate Mocha | `espresso_hot` | 390 kcal | 11g | 49g (47g) | 17g | 155mg |
| Very Vanilla | `espresso_hot` | 260 kcal | 8g | 35g (32g) | 9g | 155mg |
| Mocha Java | `espresso_hot` | 370 kcal | 10g | 46g (38g) | 16g | 165mg |
| Türk Kahvesi | `espresso_hot` | 15 kcal | 0g | 2g (0g) | 0g | 75mg |
| Piccolo Latte | `espresso_hot` | 70 kcal | 4g | 5g (4g) | 3g | 75mg |
| Cortado | `espresso_hot` | 80 kcal | 5g | 6g (5g) | 4g | 155mg |
| GJ's Iced Coffee | `espresso_iced` | 20 kcal | 1g | 3g (1g) | 0g | 160mg |
| *... ve 105 ürün daha* | | | | | | |

### DAVID PEOPLE (93 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Italian Caramel Latte | `espresso_hot` | 240 kcal | 8g | 33g (30g) | 8g | 150mg |
| Pumpkin Spice Latte | `espresso_hot` | 280 kcal | 8g | 38g (35g) | 9g | 150mg |
| Cinnamon Latte | `espresso_hot` | 230 kcal | 8g | 30g (27g) | 7g | 150mg |
| Flat White | `espresso_hot` | 165 kcal | 9g | 13g (12g) | 8g | 180mg |
| Damla Sakızlı Türk Kahvesi | `espresso_hot` | 20 kcal | 0g | 3g (1g) | 0g | 75mg |
| Damla Sakızlı Salep | `tea_herbal` | 280 kcal | 9g | 45g (38g) | 6g | 0mg |
| Fly Nut | `espresso_iced` | 250 kcal | 7g | 34g (30g) | 10g | 140mg |
| Why Nut | `espresso_iced` | 290 kcal | 7g | 40g (35g) | 12g | 140mg |
| Oreo Bomb | `frappe_blended` | 450 kcal | 6g | 67g (59g) | 18g | 15mg |
| Cooldrop Lime | `smoothie_juice` | 100 kcal | 0g | 24g (22g) | 0g | 0mg |
| *... ve 83 ürün daha* | | | | | | |

### TCHIBO (24 Ürün)

| Ürün Adı | Kategori | Kalori | Protein | Karb (Şeker) | Yağ | Kafein |
|---|---|---:|---:|---:|---:|---:|
| Latte Macchiato | `espresso_hot` | 160 kcal | 9g | 14g (13g) | 7g | 145mg |
| Flat White | `espresso_hot` | 170 kcal | 9g | 14g (13g) | 9g | 175mg |
| Cortado | `espresso_hot` | 80 kcal | 5g | 6g (5g) | 4g | 145mg |
| Protein Latte Vanilla | `espresso_hot` | 180 kcal | 18g | 14g (11g) | 4g | 145mg |
| Protein Latte Biscuit | `espresso_hot` | 190 kcal | 18g | 16g (12g) | 4g | 145mg |
| Sütlü Filtre Kahve | `espresso_hot` | 45 kcal | 2g | 4g (3g) | 2g | 160mg |
| Sıcak Çikolata | `tea_herbal` | 340 kcal | 10g | 43g (36g) | 14g | 15mg |
| Iced Latte | `espresso_iced` | 130 kcal | 7g | 11g (10g) | 6g | 145mg |
| Iced Americano | `espresso_iced` | 15 kcal | 1g | 2g (0g) | 0g | 145mg |
| Cold Brew | `cold_brew` | 5 kcal | 0g | 0g (0g) | 0g | 165mg |
| *... ve 14 ürün daha* | | | | | | |

---

## 📌 3. Yapılan Temel Düzeltmeler ve Sonuç

1. **Tatlı/Pastane Ürünleri:**
   - Gloria Jean's, Mackbear, Espressolab vb. zincirlerdeki tüm pasta, cheesecake, kadayıf, panna cotta ürünlerinin tuzlu sandviç kalıbındaki makroları (400 kcal, 14g P, 5g Şeker, 600mg Sodyum) kaldırıldı.
   - Gerçek gastronomi standartlarına uygun olarak ortalama 35-50g şeker, 15-30g yağ, 4-8g protein ve 80-200mg sodyum değerleri atandı.

2. **Tuzlu Unlu Mamüller:**
   - Poğaça, açma, simit, boyoz, börek gibi ürünler `bakery_dessert` (tatlı) kategorisinden `sandwich_savory` (tuzlu yiyecek) kategorisine taşındı.

3. **Görsel & Anlamsal Eşleşmeler:**
   - Tatlılara atanan sandviç resimleri ve yanlış kategori görselleri düzeltildi.
   - "Latte Pasta" gibi yiyecek olup içecek işaretlenen ürünlerin türleri ve kategorileri düzeltildi.

4. **Metin & Başlıklar:**
   - TÜMÜ BÜYÜK HARFLİ Gloria Jean's ürün başlıkları okunaklı ve estetik Title Case formatına getirildi.
   - Çift dil tekrarları (`nameEn`) temizlendi.
   - Şablonik "Kafenin taze hazırlanan X lezzeti" cümleleri tamamen özgün açıklamalarla yenilendi.
