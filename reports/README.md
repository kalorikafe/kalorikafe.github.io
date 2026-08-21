# 📑 Kalori Cafe — Kapsamlı Alt Ajan (Subagent) Denetim Raporları Dizini

Bu dizin, 16 Ağustos 2026 tarihinde 7 bağımsız uzman alt ajan (subagent) tarafından 1.006 ürünlük tüm katalog üzerinde gerçekleştirilen derinlemesine makro, alerjen ve görsel denetim raporlarını içerir.

---

## 📂 Raporlar ve Uzman Ajan Dağılımı

| Rapor Dosyası | Sorumlu Uzman Ajan | Kapsam & İncelenen Ürünler | Temel Düzeltmeler |
|---|---|---|---|
| [audit_espresso_hot.md](./audit_espresso_hot.md) | **Espresso Hot Specialist** | 202 Sıcak Kahve & Espresso | Siyah kahvelerdeki 150 kcal süt kalıpları temizlendi; gerçekçi kafein (75–310 mg) ve şurup dengesi kuruldu. |
| [audit_cold_frappe.md](./audit_cold_frappe.md) | **Cold Brew & Frappe Specialist** | 165 Soğuk Kahve, Frappe, Milkshake | 150 kcal kopyala-yapıştır şablonları kaldırıldı; frappe şekerleri (35–65g), soğuk kahve kafeinleri (150–240 mg) optimize edildi. |
| [audit_tea_smoothie.md](./audit_tea_smoothie.md) | **Tea & Smoothie Specialist** | 218 Çay, Bitki Çayı, Smoothie, Meyve Suyu | Sade çaylardaki süt ve kalori şablonları silindi (0–2 kcal); taze meyve suları ve Chai tea latte makroları kalibre edildi. |
| [audit_bakery_dessert.md](./audit_bakery_dessert.md) | **Bakery & Dessert Specialist** | 260+ Tatlı, Pasta, Cheesecake, Kruvasan | Tatlılardaki tuzlu sandviç şablonu (5g şeker, 600mg tuz) tamamen kaldırıldı; gerçekçi şeker (25–55g) ve alerjenler işlendi. |
| [audit_sandwich_fit.md](./audit_sandwich_fit.md) | **Sandwich & Fit Specialist** | 167 Sandviç, Tost, Poğaça, Granola & Bar | 14 yanlış kategorilenmiş ürün taşındı; peynir/et oranları, protein (12–25g) ve sodyum değerleri doğrulandı. |
| [audit_drink_images.md](./audit_drink_images.md) | **Drink Visuals Inspector** | 564 İçecek Görseli | Sıcak fincan atanan 52 soğuk içecek, kertenkele/çiğ çekirdek gibi hatalı aramalar temizlendi; %100 yerel WebP eşleşti. |
| [audit_food_images.md](./audit_food_images.md) | **Food Visuals Inspector** | 442 Yiyecek Görseli | Tatlılardaki sandviç ve UK mimari fotoğrafları kaldırıldı; her tatlı/tuzlu tipine özel gurme yemek fotoğrafları bağlandı. |

---

## 🏆 Kalite Kapıları Doğrulama Karnesi (21 Ağustos 2026 yeniden ölçümü)

- ✅ `npm run catalog:audit` : **2.831 kontrolün tamamı 0 hata ile geçti**
- ✅ `npm run images:audit` : **%98.1 benzersiz hash, 0 eksik görsel**
- ✅ `npm run lint` : **103 dosya, 0 hata / 0 uyarı**
- ✅ `npm run test:unit` : **16 test dosyası, 107 / 107 test geçti (%100)**
- ✅ `npm run test:e2e` : **32 / 32 Chromium E2E testi geçti (%100)**
- ✅ `npm run build` : **1.019 statik SEO sayfası başarıyla derlendi**
