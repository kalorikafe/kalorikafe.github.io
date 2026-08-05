# Original User Request

## 2026-08-04T22:44:54Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Kalori Cafe projesinin aydınlık mod (light mode) üst tasarımının (Navbar ve Hero) tamamen yenilenmesi ve Türkiye'nin en çok şubesi olan popüler kahve zincirlerinin (Starbucks, Espressolab, Caffè Nero, Coffy, Kahve Dünyası, Mackbear, Arabica, Gloria Jean's vb.) her biri için en az 40'ar adet popüler içecek/yiyecek verisinin sisteme eklenmesi.

Working directory: c:\Users\Selim Gürsoy\Desktop\kalori_cafe

## Requirements

### R1. Aydınlık Mod (Light Mode) Tasarımının Yenilenmesi
Üst tarafın (Navbar ve Hero bileşenleri) aydınlık mod görünümü baştan aşağı daha temiz, modern ve yüksek kontrastlı hale getirilmeli. Karmaşık gradyanlar yerine sade, "premium" hissettiren beyaz/kırık beyaz tonlar kullanılmalı, okunabilirlik en üst düzeye çıkarılmalı.

### R2. Popüler Zincirlerin Güncellenmesi
Türkiye'de en çok şubesi olan ve en popüler zincirler tespit edilmeli ("saçma sapan isimler" ayıklanıp, Mackbear, David People gibi gerçekte çok şubesi olanlar eklenebilir). Menü veri yapısı bu zincirleri yansıtacak şekilde güncellenmeli.

### R3. Her Zincir İçin En Az 40 Ürün Eklenecek
Belirlenen her popüler kahve zinciri için gerçekçi ve popüler olan (en çok tüketilen) en az 40 farklı içecek ve yiyecek ürünü makro değerleri (kalori, protein, karbonhidrat, yağ vb.) ile birlikte oluşturulup `src/data/items.ts` içerisine eklenmeli.

## Acceptance Criteria

### UI / Tasarım
- [ ] Navbar ve Hero kısımları aydınlık modda (light mode) tamamen temiz, premium bir tasarıma sahip olmalı (karmaşık renk cümbüşü veya soluk yazılar olmamalı).
- [ ] Bileşenler `npm run build` komutu ile hatasız derlenmeli.

### Veri / İçerik
- [ ] Uygulamadaki zincir listesi Türkiye'nin en popüler zincirlerini (örn. Starbucks, Espressolab, Kahve Dünyası, Caffè Nero, Coffy, Mackbear, Arabica) içermeli.
- [ ] `items.ts` dosyasında, tanımlı olan her zincir için minimum 40 adet ürün bulunmalı. Toplam ürün sayısı zincir sayısı * 40 değerini geçmeli.
- [ ] Ürün isimleri ve kategorileri gerçeğe yakın ve Türkiye pazarında en çok tercih edilenler olmalı.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
</USER_REQUEST>

## 2026-08-05T06:56:10Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Execute Hero and entry section redesign

Kalori Cafe web sitesinin ilk giriş alanının (Hero banner, Popüler Aramalar pills ve Kafe Zincirleri seçim alanı) görsel tasarımı, düzeni, renk paleti ve tipografisinin Minimal & Lüks (Süt/Kahve/Siyah tonları, sadeleştirilmiş butonlar ve yüksek kontrast) tarzında yenilenmesi.

Working directory: c:\Users\Selim Gürsoy\Desktop\kalori_cafe

## Requirements

### R1. Hero & Giriş Alanı Görsel Yenilenmesi (Minimal & Lüks)
Giriş kısmındaki devasa banner, "Popüler Aramalar" butonları ve "Kafe Zincirleri" pill bileşeni görsel olarak sadeleştirilmeli. Rengarenk ve göz yoran pill butonları yerine Süt/Kahve/Siyah uyumlu, minimal ve son derece şık butonlar yerleştirilmeli.

### R2. Renk Paleti ve Tipografi Uyumlaştırması
Aydınlık ve Karanlık modların renk paleti lüks ve minimal bir çizgiye çekilmeli. Yüksek okunabilirlik sağlayan tipografi vurguları yapılmalı.

### R3. Fonksiyonellik ve Mobil Uyumluluk Korunacak
Mevcut arama, diyet filtresi ve zincir seçimi işlevsellikleri hiçbir şekilde bozulmadan yeni lüks tasarıma entegre edilmeli.

## Acceptance Criteria

### UI / Tasarım
- [ ] Hero alanındaki Popüler Aramalar ve Kafe Zincirleri renk cümbüşünden arındırılıp minimal & lüks kahve paletine kavuşturulmalı.
- [ ] Hem Aydınlık hem Karanlık modda tipografi dengesi ve estetik mükemmel olmalı.
- [ ] `npm run build` komutu sıfır hatayla derlenmeli.
</USER_REQUEST>
