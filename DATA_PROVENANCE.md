# Besin Verisi Kaynaklandırma Politikası

Katalogda şu anda 199 ürün vardır. Mevcut kayıtların kaynak URL’si, doğrulama tarihi ve porsiyon temeli bulunmadığı için ürünler resmi/güncel olarak sunulmaz.

## Bir kaydı doğrulanmış sayma

`MenuItem.nutritionSource` alanı yalnız şu bilgiler birlikte mevcutsa `verified` olabilir:

- Markanın resmi besin veya menü sayfasına doğrudan HTTPS URL’si
- `YYYY-MM-DD` biçiminde son kontrol tarihi
- Boyut, gramaj veya porsiyon gibi açık `servingBasis`
- Karttaki makroların aynı porsiyonla eşleştiğinin manuel kontrolü

Örnek:

```ts
nutritionSource: {
  status: 'verified',
  label: 'Marka besin tablosu',
  url: 'https://marka.example/besin-degerleri',
  verifiedAt: '2026-08-05',
  servingBasis: 'Grande, 473 ml',
}
```

Tahmini veya üçüncü taraf veriler `estimated`; kaydı olmayan ürünler `unverified` kalır. URL veya tarih uydurulmaz. Kaynak değiştiğinde eski doğrulama tarihi korunmaz; kayıt yeniden kontrol edilir.

## Kalite kapıları

- Kimlikler benzersiz ve zincir referansları geçerli olmalı.
- Tüm makrolar sonlu ve negatif olmayan sayılar olmalı.
- `verified` kayıt URL, tarih ve porsiyon temeli olmadan unit testten geçmemeli.
- Kaynak doğrulaması olmayan ürün için UI açık uyarı göstermeli.
