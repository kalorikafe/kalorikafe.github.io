import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getItemImage(name, category, customImage) {
  if (customImage) return customImage;
  const lower = name.toLowerCase();

  // Bakery & Sweets
  if (lower.includes('kruvazan') || lower.includes('croissant') || lower.includes('pain au chocolat')) {
    if (lower.includes('çikolata') || lower.includes('chocolat')) {
      return 'https://images.unsplash.com/photo-1623334044303-241021148842?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('cheesecake') || lower.includes('san sebastian') || lower.includes('panna cotta')) {
    return 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('brownie') || lower.includes('mozaik') || lower.includes('sufle') || lower.includes('profiterol') || lower.includes('marlenka') || lower.includes('red velvet')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('tiramisu')) {
    return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('muffin') || lower.includes('kek') || lower.includes('cake') || lower.includes('cookie') || lower.includes('kuki') || lower.includes('çörek')) {
    return 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('pogaca') || lower.includes('poğaça') || lower.includes('acma') || lower.includes('açma') || lower.includes('simit') || lower.includes('boyoz') || lower.includes('bagel')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80';
  }

  // Savory & Toast
  if (lower.includes('tost') || lower.includes('panini') || lower.includes('panino') || lower.includes('sandviç') || lower.includes('sandwich') || lower.includes('wrap') || lower.includes('baget') || lower.includes('ciabatta') || lower.includes('focaccia') || lower.includes('burger') || lower.includes('bun')) {
    if (lower.includes('panini') || lower.includes('panino')) {
      return 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80';
    }
    if (lower.includes('wrap')) {
      return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('avokado') || lower.includes('avocado')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('chia') || lower.includes('granola') || lower.includes('top') || lower.includes('çikolata') || lower.includes('gofrik') || lower.includes('madlen')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80';
  }

  // Juices, Smoothies & Refreshers
  if (lower.includes('smoothie') || lower.includes('refresha') || lower.includes('cooler') || lower.includes('freeze') || lower.includes('frozen') || lower.includes('hibiscus') || lower.includes('lime')) {
    return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('limonata') || lower.includes('lemonade') || lower.includes('portakal') || lower.includes('detox')) {
    return 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80';
  }

  // Specialty Drinks & Tea
  if (lower.includes('matcha')) {
    return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80';
  }
  if (lower.includes('türk kahvesi') || lower.includes('dibek') || lower.includes('menengiç')) {
    return '/images/turk_kahvesi.jpg';
  }
  if (lower.includes('çay') || lower.includes('tea') || lower.includes('salep') || lower.includes('sahlep')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80';
  }

  // Cold Drinks
  if (lower.includes('cold brew') || lower.includes('nitro') || lower.includes('freddo')) {
    return '/images/iced_americano.jpg';
  }
  if (lower.includes('iced') || lower.includes('soğuk') || lower.includes('buzlu')) {
    if (lower.includes('caramel') || lower.includes('macchiato')) return '/images/iced_caramel_macchiato.jpg';
    if (lower.includes('mocha') || lower.includes('white')) return '/images/white_choc_mocha.jpg';
    return '/images/iced_latte.jpg';
  }
  if (lower.includes('frappuccino') || lower.includes('frappe') || lower.includes('chiller') || lower.includes('esfrappa') || lower.includes('milkshake')) {
    return '/images/caramel_macchiato.jpg';
  }

  // Hot Coffee Default
  return '/images/caffe_latte.jpg';
}

const CHAIN_DATA = {
  starbucks: [
    { name: 'Caffè Latte', category: 'espresso_hot', isDrink: true, desc: 'Zengin espresso ve ısıtılmış süt üzerine hafif süt köpüğü.', macros: { cal: 190, pro: 12, carb: 18, sug: 17, fat: 7, satFat: 4.5, caf: 150, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk' },
    { name: 'Caramel Macchiato', category: 'espresso_hot', isDrink: true, desc: 'Vanilya şurubu, sıcak süt ve süt köpüğü üzerine espresso ve karamel sosu.', macros: { cal: 250, pro: 10, carb: 35, sug: 33, fat: 7, satFat: 4.5, caf: 150, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'White Chocolate Mocha', category: 'espresso_hot', isDrink: true, desc: 'Espresso, zengin beyaz çikolata sosu, sıcak süt ve krema.', macros: { cal: 430, pro: 12, carb: 55, sug: 53, fat: 18, satFat: 12, caf: 150, sod: 240 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 4 },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'Ristretto espresso shotları üzerine mikronize kadifemsi süt köpüğü.', macros: { cal: 170, pro: 9, carb: 13, sug: 12, fat: 9, satFat: 5, caf: 195, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short', defaultMilk: 'whole_milk' },
    { name: 'Caffè Americano', category: 'espresso_hot', isDrink: true, desc: 'Espresso shotları üzerine sıcak su eklenerek hazırlanan sek kahve.', macros: { cal: 15, pro: 1, carb: 3, sug: 0, fat: 0, satFat: 0, caf: 225, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'grande' },
    { name: 'Geleneksel Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Starbucks harmanı Arabica çekirdeklerinden geleneksel pişim Türk kahvesi.', macros: { cal: 15, pro: 0.5, carb: 2, sug: 0, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Iced White Chocolate Mocha', category: 'espresso_iced', isDrink: true, desc: 'Buzlu espresso, beyaz çikolata sosu, soğuk süt ve krema.', macros: { cal: 420, pro: 11, carb: 54, sug: 52, fat: 18, satFat: 12, caf: 150, sod: 200 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 4 },
    { name: 'Cold Brew', category: 'cold_brew', isDrink: true, desc: '20 saat boyunca soğuk suda yavaş demlenmiş pürüzsüz gövdeli kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 205, sod: 20 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'grande' },
    { name: 'Caramel Frappuccino®', category: 'frappe_blended', isDrink: true, desc: 'Kahve, karamel şurubu, süt ve buz çırpıntısı, krema ve karamel gezdirimi.', macros: { cal: 380, pro: 4, carb: 57, sug: 54, fat: 16, satFat: 10, caf: 100, sod: 230 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'Java Chip Frappuccino®', category: 'frappe_blended', isDrink: true, desc: 'Mocha sosu, çikolata tanecikleri, kahve, süt ve buz çırpıntısı.', macros: { cal: 440, pro: 6, carb: 65, sug: 60, fat: 18, satFat: 12, caf: 110, sod: 260 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'Cool Lime Starbucks Refresha®', category: 'smoothie_juice', isDrink: true, desc: 'Misket limonu lezzeti, narenciye & nane aromalı çalkalanmış serinletici.', macros: { cal: 110, pro: 0.2, carb: 26, sug: 24, fat: 0, satFat: 0, caf: 45, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'grande' },
    { name: 'Very Berry Hibiscus Refresha®', category: 'smoothie_juice', isDrink: true, desc: 'Böğürtlen ve hibiskus aromalı buzlu serinletici içecek.', macros: { cal: 120, pro: 0.3, carb: 29, sug: 27, fat: 0, satFat: 0, caf: 45, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'grande' },
    { name: 'Chai Tea Latte', category: 'tea_herbal', isDrink: true, desc: 'Baharatlı siyah çay özü, sıcak süt ve süt köpüğü.', macros: { cal: 240, pro: 8, carb: 45, sug: 42, fat: 4.5, satFat: 2.5, caf: 95, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'grande', defaultMilk: 'whole_milk', pumps: 4 },
    { name: 'Belçika Çikolatalı Pasta', category: 'bakery_dessert', isDrink: false, desc: 'Kat kat Belçika çikolatalı ganaj ve kek katmanları.', macros: { cal: 520, pro: 7, carb: 58, sug: 44, fat: 29, satFat: 17, caf: 20, sod: 280 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Kremalı Havuçlu Kek', category: 'bakery_dessert', isDrink: false, desc: 'Havuçlu, tarçınlı ve cevizli kek üzeri krem peynirli krema.', macros: { cal: 410, pro: 5.5, carb: 51, sug: 34, fat: 21, satFat: 6, caf: 0, sod: 320 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'nuts'] },
    { name: 'Limonlu Kek', category: 'bakery_dessert', isDrink: false, desc: 'Taze limon aromalı ve üzeri limon glazürlü dilim kek.', macros: { cal: 360, pro: 4, carb: 49, sug: 31, fat: 17, satFat: 5, caf: 0, sod: 290 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Very Berry Muffin', category: 'bakery_dessert', isDrink: false, desc: 'Orman meyveleri dolgulu ve taneli yumuşak muffin.', macros: { cal: 370, pro: 5, carb: 52, sug: 29, fat: 16, satFat: 4, caf: 0, sod: 310 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Triple Chocolate Cookie', category: 'bakery_dessert', isDrink: false, desc: 'Üç çeşit çikolata parçası içeren dev yumuşak kurabiye.', macros: { cal: 390, pro: 5, carb: 50, sug: 35, fat: 19, satFat: 11, caf: 15, sod: 250 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Hindi Füme Jambonlu & Peynirli Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Tost ekmeğinde hindi füme jambon ve kaşar peyniri.', macros: { cal: 380, pro: 22, carb: 36, sug: 4, fat: 16, satFat: 8, caf: 0, sod: 920 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Mozzarella Peynirli Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Ciabatta ekmeğinde mozzarella, pesto sos ve domates.', macros: { cal: 440, pro: 17, carb: 46, sug: 3, fat: 20, satFat: 9, caf: 0, sod: 810 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] }
  ],

  espressolab: [
    { name: 'Lab Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Espressolab nitelikli çekirdek espresso ve kadifemsi süt.', macros: { cal: 160, pro: 9, carb: 14, sug: 13, fat: 7, satFat: 4, caf: 140, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cortado', category: 'espresso_hot', isDrink: true, desc: 'Eşit miktarda espresso shot ve buharlanmış sıcak süt.', macros: { cal: 85, pro: 5, carb: 7, sug: 6, fat: 4, satFat: 2.2, caf: 140, sod: 65 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Lab Flat White', category: 'espresso_hot', isDrink: true, desc: 'Çift ristretto shot üzerine mikronize ince süt köpüğü.', macros: { cal: 170, pro: 9, carb: 14, sug: 13, fat: 9, satFat: 5, caf: 180, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Spanish Latte', category: 'espresso_hot', isDrink: true, desc: 'Espresso, sıcak süt ve konsantre tatlı süt harmanı.', macros: { cal: 270, pro: 8, carb: 39, sug: 36, fat: 9.5, satFat: 6, caf: 140, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Sarelle Mocha', category: 'espresso_hot', isDrink: true, desc: 'Yerli Sarelle fındıklı çikolata ezmesi, espresso ve süt.', macros: { cal: 390, pro: 10, carb: 48, sug: 42, fat: 17, satFat: 9, caf: 140, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Gold Chocolate Mocha', category: 'espresso_hot', isDrink: true, desc: 'Karamelize altın sarısı çikolata sosu, espresso ve sıcak süt.', macros: { cal: 410, pro: 10, carb: 51, sug: 46, fat: 18, satFat: 11, caf: 140, sod: 180 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Taze taze kavrulmuş özel Arabica çekirdeklerinden köpüklü Türk kahvesi.', macros: { cal: 15, pro: 0.5, carb: 2, sug: 0, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Iced Spanish Latte', category: 'espresso_iced', isDrink: true, desc: 'Soğuk süt, tatlı süt konsantresi, buz ve taze espresso.', macros: { cal: 260, pro: 7, carb: 37, sug: 34, fat: 9, satFat: 5.5, caf: 140, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Salted Caramel Latte', category: 'espresso_iced', isDrink: true, desc: 'Tuzlu karamel aroması, soğuk süt, buz ve zengin espresso.', macros: { cal: 220, pro: 6, carb: 31, sug: 28, fat: 7, satFat: 4.2, caf: 140, sod: 190 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Cold Brew Kenya', category: 'cold_brew', isDrink: true, desc: 'Tek kökenli Kenya çekirdeklerinden 18 saat soğuk demlenmiş kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 180, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Esfrappa Çikolata', category: 'frappe_blended', isDrink: true, desc: 'Espresso, çikolata sosu, süt ve çırpılmış buzlu ferah içecek.', macros: { cal: 390, pro: 5, carb: 61, sug: 55, fat: 15, satFat: 9, caf: 120, sod: 220 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'V60 Demleme Kahve', category: 'espresso_hot', isDrink: true, desc: 'Single origin çekirdeklerin V60 yöntemiyle elde demlenmiş berrak kahvesi.', macros: { cal: 5, pro: 0.3, carb: 1, sug: 0, fat: 0, satFat: 0, caf: 160, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Chai Tea Latte', category: 'tea_herbal', isDrink: true, desc: 'Doğal baharat özleri ve kremsi sıcak süt.', macros: { cal: 220, pro: 7, carb: 39, sug: 36, fat: 4, satFat: 2.2, caf: 65, sod: 100 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cranberry Hibiscus', category: 'smoothie_juice', isDrink: true, desc: 'Kızılcık ve hibiskus taneli buzlu soğuk bitki çayı.', macros: { cal: 85, pro: 0, carb: 21, sug: 19, fat: 0, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Matcha Latte', category: 'tea_herbal', isDrink: true, desc: 'Japon yeşil çayı tozu (matcha) ve sıcak/soğuk süt harmanı.', macros: { cal: 180, pro: 7, carb: 25, sug: 23, fat: 5.5, satFat: 3.2, caf: 50, sod: 90 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Hindi Fümeli & Kaşar Peynirli Acuka Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Acuka sosu sürülmüş ekmek arasında hindi füme ve kaşar.', macros: { cal: 410, pro: 21, carb: 39, sug: 4, fat: 18, satFat: 8, caf: 0, sod: 980 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: '3 Peynirli Avokadolu Açma Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Açma ekmeğinde ezilmiş avokado ve 3 çeşit peynir.', macros: { cal: 470, pro: 16, carb: 44, sug: 4, fat: 25, satFat: 11, caf: 0, sod: 840 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Frambuazlı & Fıstıklı Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Frambuaz soslu ve Antep fıstığı kaplamalı cheesecake dilimi.', macros: { cal: 460, pro: 8, carb: 43, sug: 31, fat: 28, satFat: 16, caf: 0, sod: 270 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'nuts'] },
    { name: 'Levain Kuki (Cookie)', category: 'bakery_dessert', isDrink: false, desc: 'New York tarzı kalın, içi akışkan çikolatalı kurabiye.', macros: { cal: 420, pro: 6, carb: 54, sug: 38, fat: 21, satFat: 12, caf: 10, sod: 260 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Haşhaşlı Limonlu Kek', category: 'bakery_dessert', isDrink: false, desc: 'Mavi haşhaş tohumlu ferah limonlu baton kek dilimi.', macros: { cal: 350, pro: 4, carb: 47, sug: 28, fat: 16, satFat: 4.5, caf: 0, sod: 260 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] }
  ],

  kahve_dunyasi: [
    { name: 'Geleneksel Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Kahve Dünyası imza kavrumu köpüklü Türk kahvesi.', macros: { cal: 15, pro: 0.5, carb: 2, sug: 0, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Damla Sakızlı Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Hakiki Ege damla sakızı aromalı pişirme Türk kahvesi.', macros: { cal: 20, pro: 0.5, carb: 3, sug: 1, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Taze çekilmiş espresso ve buharla ısıtılmış kremsi süt.', macros: { cal: 150, pro: 8, carb: 13, sug: 12, fat: 7, satFat: 4, caf: 75, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Americano', category: 'espresso_hot', isDrink: true, desc: 'Espresso üzerine eklenen sıcak su ile hazırlanan siyah kahve.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 150, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Mocha', category: 'espresso_hot', isDrink: true, desc: 'Kahve Dünyası öz çikolatası, espresso ve sıcak süt.', macros: { cal: 350, pro: 9, carb: 45, sug: 37, fat: 14, satFat: 9, caf: 95, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Gofrik Buzlu Latte', category: 'espresso_iced', isDrink: true, desc: 'Antep fıstıklı Gofrik çikolata aroması, soğuk süt, buz ve espresso.', macros: { cal: 280, pro: 7, carb: 36, sug: 32, fat: 12, satFat: 6, caf: 105, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Fındık Kremalı Soğuk Buzlu Latte', category: 'espresso_iced', isDrink: true, desc: 'Kahve Dünyası fındık ezmesi aroması, espresso ve soğuk süt.', macros: { cal: 260, pro: 7, carb: 33, sug: 29, fat: 11, satFat: 5, caf: 105, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Buzlu Caffe Latte', category: 'espresso_iced', isDrink: true, desc: 'Buz küpleri, soğuk süt ve taze espresso shot.', macros: { cal: 130, pro: 7, carb: 11, sug: 10, fat: 6, satFat: 3.5, caf: 75, sod: 95 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cold Brew', category: 'cold_brew', isDrink: true, desc: 'Soğuk suda yavaş demlenmiş berrak cold brew kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 155, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Sıcak Çikolata', category: 'tea_herbal', isDrink: true, desc: 'Gerçek eritilmiş Kahve Dünyası çikolatası ve sıcak süt.', macros: { cal: 360, pro: 11, carb: 46, sug: 40, fat: 15, satFat: 9.5, caf: 20, sod: 170 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Salep', category: 'tea_herbal', isDrink: true, desc: 'Geleneksel salep ve üzerine bol tarçın süslemesi.', macros: { cal: 270, pro: 9, carb: 44, sug: 37, fat: 6, satFat: 3.8, caf: 0, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Ev Yapımı Limonata', category: 'smoothie_juice', isDrink: true, desc: 'Taze limon kabuğu rendeli ev yapımı soğuk limonata.', macros: { cal: 125, pro: 0.3, carb: 31, sug: 29, fat: 0.1, satFat: 0, caf: 0, sod: 8 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Çikolatalı Milkshake', category: 'frappe_blended', isDrink: true, desc: 'Özel çikolatalı dondurma, süt ve buz çırpması.', macros: { cal: 420, pro: 8, carb: 58, sug: 52, fat: 17, satFat: 11, caf: 10, sod: 230 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Mozaik Pasta', category: 'bakery_dessert', isDrink: false, desc: 'Bisküvili ve yoğun kakaolu dondurulmuş mozaik pasta dilimi.', macros: { cal: 340, pro: 5, carb: 41, sug: 25, fat: 18, satFat: 10, caf: 10, sod: 180 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Limonlu Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Ferah limon pelteli kremamsı cheesecake dilimi.', macros: { cal: 430, pro: 7, carb: 44, sug: 31, fat: 25, satFat: 15, caf: 0, sod: 260 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Kahve Dünyası Gofrik (Antep Fıstıklı)', category: 'fit_healthy', isDrink: false, desc: '%23 Antep fıstığı içeren çıtır çikolatalı gofret.', macros: { cal: 185, pro: 3.5, carb: 17, sug: 12, fat: 11, satFat: 5.5, caf: 0, sod: 45 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'nuts', 'soy'] },
    { name: 'Madlen Çikolata Kutusu', category: 'fit_healthy', isDrink: false, desc: 'Sütlü ve bitter kare madlen çikolata çeşitleri.', macros: { cal: 220, pro: 3, carb: 22, sug: 20, fat: 13, satFat: 8, caf: 15, sod: 35 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'] },
    { name: 'Mozzarellalı Pesto Soslu Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Taze mozzarella, fesleğenli pesto ve domatesli sandviç.', macros: { cal: 430, pro: 16, carb: 44, sug: 3, fat: 21, satFat: 9, caf: 0, sod: 790 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Hindi Füme Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Kepekli ekmekte hindi füme dilimleri ve hafif sos.', macros: { cal: 350, pro: 23, carb: 38, sug: 3, fat: 12, satFat: 5, caf: 0, sod: 890 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Fındık Kremalı Kruvasan Sandviç', category: 'bakery_dessert', isDrink: false, desc: 'Sıcak kruvasan arası Kahve Dünyası fındık kreması.', macros: { cal: 420, pro: 7, carb: 46, sug: 24, fat: 23, satFat: 12, caf: 0, sod: 340 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'nuts', 'egg'] }
  ],

  caffe_nero: [
    { name: 'Caffè Americano', category: 'espresso_hot', isDrink: true, desc: 'Nero Classico espresso shotları ve sıcak su.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 160, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Caffè Latte', category: 'espresso_hot', isDrink: true, desc: 'Nero özel kavrum espresso ve kadifemsi sıcak süt.', macros: { cal: 155, pro: 8.5, carb: 13, sug: 12, fat: 7, satFat: 4, caf: 160, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cappuccino', category: 'espresso_hot', isDrink: true, desc: 'Espresso, sıcak süt ve yoğun kadifemsi süt köpüğü.', macros: { cal: 125, pro: 8, carb: 12, sug: 10, fat: 4.5, satFat: 2.5, caf: 160, sod: 100 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Caffè Mocha', category: 'espresso_hot', isDrink: true, desc: 'İtalyan kakao sosu, espresso, sıcak süt ve çırpılmış krema.', macros: { cal: 370, pro: 10, carb: 45, sug: 36, fat: 16, satFat: 10, caf: 170, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cortado', category: 'espresso_hot', isDrink: true, desc: 'Yoğun çift shot espresso ve eşit oranda sıcak süt.', macros: { cal: 80, pro: 5, carb: 6, sug: 5, fat: 4, satFat: 2, caf: 160, sod: 60 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'İki shot ristretto espresso ve mikronize ince süt köpüğü.', macros: { cal: 165, pro: 9, carb: 13, sug: 12, fat: 8.5, satFat: 5, caf: 175, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Filtre Kahve', category: 'espresso_hot', isDrink: true, desc: 'Günün taze demlenmiş Nero harmanı filtre kahvesi.', macros: { cal: 5, pro: 0.3, carb: 1, sug: 0, fat: 0, satFat: 0, caf: 170, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Antep Fıstıklı Latte', category: 'espresso_hot', isDrink: true, desc: 'Antep fıstığı aromalı şurup, espresso ve kremsi süt.', macros: { cal: 250, pro: 8, carb: 32, sug: 29, fat: 9, satFat: 5, caf: 160, sod: 130 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Latte', category: 'espresso_iced', isDrink: true, desc: 'Buz küpleri, soğuk süt ve taze Nero espresso.', macros: { cal: 135, pro: 7, carb: 11, sug: 10, fat: 6, satFat: 3.5, caf: 160, sod: 95 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced White Chocolate Mocha', category: 'espresso_iced', isDrink: true, desc: 'Beyaz çikolata sosu, buz, soğuk süt ve espresso.', macros: { cal: 330, pro: 9, carb: 43, sug: 40, fat: 14, satFat: 9, caf: 160, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Caramelatte', category: 'espresso_iced', isDrink: true, desc: 'Karamel aromalı soğuk süt, buz ve espresso shot.', macros: { cal: 210, pro: 6, carb: 28, sug: 25, fat: 8, satFat: 4.8, caf: 160, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Freddo Espresso', category: 'espresso_iced', isDrink: true, desc: 'Buz ile çalkalanıp köpürtülmüş sek İtalyan espressosu.', macros: { cal: 10, pro: 0.5, carb: 1, sug: 0, fat: 0, satFat: 0, caf: 160, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Cold Brew', category: 'cold_brew', isDrink: true, desc: 'Nero harmanından 16 saat soğuk demleme kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 170, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Milano Sıcak Çikolata', category: 'tea_herbal', isDrink: true, desc: 'Yoğun Milano usulü İtalyan sıcak çikolatalı süt.', macros: { cal: 380, pro: 10, carb: 48, sug: 42, fat: 16, satFat: 10, caf: 15, sod: 180 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Chai Tea Latte', category: 'tea_herbal', isDrink: true, desc: 'Baharatlı chai aroması ve sıcak buharlanmış süt.', macros: { cal: 230, pro: 7.5, carb: 41, sug: 38, fat: 4.5, satFat: 2.5, caf: 60, sod: 105 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Mozzarella & Domatesli Panino', category: 'sandwich_savory', isDrink: false, desc: 'Sıcak basılmış ciabatta ekmeğinde taze mozzarella ve pesto.', macros: { cal: 450, pro: 18, carb: 47, sug: 3, fat: 21, satFat: 10, caf: 0, sod: 830 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Tavuklu Sezar Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Izgara tavuk, sezar sos ve parmesanlı tost sandviç.', macros: { cal: 490, pro: 27, carb: 46, sug: 4, fat: 21, satFat: 6, caf: 0, sod: 1050 }, tags: ['high_protein'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Üç Peynirli Tost', category: 'sandwich_savory', isDrink: false, desc: 'Cheddar, kaşar ve gravyer peynirli sıcak fırın tostu.', macros: { cal: 430, pro: 20, carb: 38, sug: 2, fat: 22, satFat: 12, caf: 0, sod: 890 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Çikolatalı Kruvasan', category: 'bakery_dessert', isDrink: false, desc: 'Çıtır tereyağlı hamur içinde erimiş çikolata.', macros: { cal: 360, pro: 6, carb: 39, sug: 13, fat: 20, satFat: 12, caf: 5, sod: 360 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Nero Premium San Sebastian Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Nero özel yapımı yanık yüzeyli İspanyol cheesecake.', macros: { cal: 490, pro: 9, carb: 39, sug: 29, fat: 33, satFat: 20, caf: 0, sod: 300 }, tags: ['vegetarian', 'gluten_free'], allergens: ['lactose', 'egg'] }
  ],

  coffy: [
    { name: 'Americano', category: 'espresso_hot', isDrink: true, desc: 'Coffy özel harman espresso ve sıcak su.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 140, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Coffy Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Klasik Coffy harman espresso ve kremsi süt.', macros: { cal: 145, pro: 8, carb: 12, sug: 11, fat: 6.5, satFat: 3.8, caf: 140, sod: 110 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cappuccino', category: 'espresso_hot', isDrink: true, desc: 'Espresso, sıcak süt ve köpük dengesi.', macros: { cal: 120, pro: 8, carb: 11, sug: 10, fat: 4, satFat: 2.2, caf: 140, sod: 95 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'Yoğun espresso shotları ve ince süt köpüğü.', macros: { cal: 160, pro: 8.5, carb: 13, sug: 12, fat: 8, satFat: 4.8, caf: 160, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Mocha', category: 'espresso_hot', isDrink: true, desc: 'Kakaolu espresso ve sıcak süt.', macros: { cal: 330, pro: 9, carb: 41, sug: 33, fat: 14, satFat: 8.5, caf: 140, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'White Chocolate Mocha', category: 'espresso_hot', isDrink: true, desc: 'Beyaz çikolata aroması, espresso ve süt.', macros: { cal: 370, pro: 10, carb: 47, sug: 44, fat: 16, satFat: 10, caf: 140, sod: 190 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Filtre Kahve', category: 'espresso_hot', isDrink: true, desc: 'Demleme sıcak Coffy filtre kahve.', macros: { cal: 5, pro: 0.3, carb: 1, sug: 0, fat: 0, satFat: 0, caf: 150, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Iced Latte', category: 'espresso_iced', isDrink: true, desc: 'Buzlu soğuk süt ve espresso dökümü.', macros: { cal: 125, pro: 7, carb: 10, sug: 9, fat: 5.5, satFat: 3.2, caf: 140, sod: 90 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Salted Caramel Latte', category: 'espresso_iced', isDrink: true, desc: 'Tuzlu karamel şurubu, soğuk süt, buz ve espresso.', macros: { cal: 210, pro: 6, carb: 29, sug: 26, fat: 7, satFat: 4, caf: 140, sod: 180 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Strawberry Matcha', category: 'tea_herbal', isDrink: true, desc: 'Çilek pürüzlü taban, buzlu süt ve yeşil matcha çayı.', macros: { cal: 220, pro: 6, carb: 34, sug: 31, fat: 6, satFat: 3.5, caf: 45, sod: 90 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Cherry Brownie Latte', category: 'espresso_iced', isDrink: true, desc: 'Vişne aroması, brownie şurubu, soğuk süt ve espresso.', macros: { cal: 270, pro: 7, carb: 41, sug: 37, fat: 8, satFat: 4.8, caf: 140, sod: 130 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Chocolate Cookie Frappe', category: 'frappe_blended', isDrink: true, desc: 'Çikolatalı bisküvi parçaları, kahve ve buzlu krema çırpması.', macros: { cal: 430, pro: 6, carb: 64, sug: 57, fat: 17, satFat: 10, caf: 90, sod: 280 }, tags: ['vegetarian'], allergens: ['lactose', 'gluten', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Ezine Peynirli Focaccia Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Focaccia ekmeğinde Ezine peyniri ve zeytin yağı marinesi.', macros: { cal: 420, pro: 14, carb: 46, sug: 3, fat: 20, satFat: 9, caf: 0, sod: 870 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
    { name: 'Füme Etli Peynirli Bagel', category: 'sandwich_savory', isDrink: false, desc: 'Bagel içinde füme et ve krem peynir.', macros: { cal: 410, pro: 21, carb: 42, sug: 4, fat: 17, satFat: 8, caf: 0, sod: 940 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'İsli Peynir & Hindi Fümeli Baget', category: 'sandwich_savory', isDrink: false, desc: 'Çıtır baget ekmeğinde isli peynir ve hindi füme.', macros: { cal: 430, pro: 23, carb: 45, sug: 3, fat: 18, satFat: 9, caf: 0, sod: 990 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Karışık Sıcak Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Sucuk, kaşar ve salamlı sıcak tost sandviç.', macros: { cal: 460, pro: 20, carb: 43, sug: 3, fat: 23, satFat: 11, caf: 0, sod: 1080 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Çikolatalı Kruvasan', category: 'bakery_dessert', isDrink: false, desc: 'Fırınlanmış çıtır kakaolu kruvasan.', macros: { cal: 340, pro: 5, carb: 37, sug: 11, fat: 19, satFat: 11, caf: 5, sod: 340 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Boyoz', category: 'bakery_dessert', isDrink: false, desc: 'İzmir usulü geleneksel yağlı kat kat boyoz.', macros: { cal: 310, pro: 5, carb: 32, sug: 2, fat: 18, satFat: 9, caf: 0, sod: 390 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Profiterollü Pasta', category: 'bakery_dessert', isDrink: false, desc: 'Üzeri profiterol topları kaplı çikolatalı yaş pasta.', macros: { cal: 450, pro: 7, carb: 53, sug: 38, fat: 23, satFat: 14, caf: 10, sod: 240 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Tiramisu', category: 'bakery_dessert', isDrink: false, desc: 'Kahveli kedi dili bisküvili klasik İtalyan tatlısı.', macros: { cal: 370, pro: 6, carb: 39, sug: 27, fat: 21, satFat: 13, caf: 35, sod: 130 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] }
  ],

  mackbear: [
    { name: 'Espresso Single', category: 'espresso_hot', isDrink: true, desc: 'Mackbear harmanı sek espresso shot.', macros: { cal: 5, pro: 0.3, carb: 1, sug: 0, fat: 0, satFat: 0, caf: 80, sod: 2 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Mackbear espresso ve sıcak süt köpüğü.', macros: { cal: 150, pro: 8, carb: 13, sug: 12, fat: 7, satFat: 4, caf: 150, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Americano', category: 'espresso_hot', isDrink: true, desc: 'Espresso shot ve sıcak su.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 150, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Cappuccino', category: 'espresso_hot', isDrink: true, desc: 'Köpüklü sıcak espresso süt harmanı.', macros: { cal: 120, pro: 8, carb: 12, sug: 10, fat: 4, satFat: 2.2, caf: 150, sod: 100 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'Çift shot espresso ve mikronize süt.', macros: { cal: 165, pro: 9, carb: 14, sug: 13, fat: 8.5, satFat: 5, caf: 180, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Biscoff Latte', category: 'espresso_hot', isDrink: true, desc: 'Lotus Biscoff bisküvi ezmesi, espresso ve sıcak süt.', macros: { cal: 360, pro: 8, carb: 46, sug: 39, fat: 16, satFat: 9, caf: 150, sod: 180 }, tags: ['vegetarian'], allergens: ['lactose', 'gluten', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Oreo Latte', category: 'espresso_hot', isDrink: true, desc: 'Oreo bisküvi aroması, espresso ve süt.', macros: { cal: 370, pro: 8, carb: 48, sug: 41, fat: 16.5, satFat: 9.5, caf: 150, sod: 210 }, tags: ['vegetarian'], allergens: ['lactose', 'gluten', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Peanut Latte', category: 'espresso_hot', isDrink: true, desc: 'Yer fıstığı ezmesi aroması, espresso ve sıcak süt.', macros: { cal: 340, pro: 10, carb: 38, sug: 31, fat: 16, satFat: 7, caf: 150, sod: 190 }, tags: ['vegetarian'], allergens: ['lactose', 'peanut'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Coffeenut', category: 'espresso_hot', isDrink: true, desc: 'Fındık & çikolata soslu Mackbear spesiyal sıcak kahve.', macros: { cal: 350, pro: 9, carb: 42, sug: 36, fat: 16, satFat: 8.5, caf: 150, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Iced Mocha', category: 'espresso_iced', isDrink: true, desc: 'Buzlu kakao soslu espresso ve soğuk süt.', macros: { cal: 290, pro: 8, carb: 38, sug: 31, fat: 12, satFat: 7, caf: 150, sod: 130 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cold Brew', category: 'cold_brew', isDrink: true, desc: 'Soğuk demlenmiş gövdeli sert filtre kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 185, sod: 15 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Strawberry Matcha Latte', category: 'tea_herbal', isDrink: true, desc: 'Çilek sosu, soğuk süt ve yeşil matcha katmanı.', macros: { cal: 210, pro: 6, carb: 32, sug: 29, fat: 6, satFat: 3.5, caf: 50, sod: 90 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Mango Frozen', category: 'smoothie_juice', isDrink: true, desc: 'Buzla çırpılmış karlı mango püre içeceği.', macros: { cal: 190, pro: 1, carb: 46, sug: 42, fat: 0.5, satFat: 0, caf: 0, sod: 25 }, tags: ['vegan', 'vegetarian', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Chai Tea Latte', category: 'tea_herbal', isDrink: true, desc: 'Baharatlı chai şurubu ve sıcak süt.', macros: { cal: 230, pro: 8, carb: 41, sug: 38, fat: 4.5, satFat: 2.5, caf: 70, sod: 110 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Lotus Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Lotus Biscoff bisküvisi ve sosu kaplı cheesecake.', macros: { cal: 480, pro: 8, carb: 46, sug: 33, fat: 29, satFat: 16, caf: 0, sod: 290 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Marlenka', category: 'bakery_dessert', isDrink: false, desc: 'Geleneksel ballı ve cevizli kat kat Çek tatlısı.', macros: { cal: 410, pro: 6, carb: 53, sug: 36, fat: 19, satFat: 9, caf: 0, sod: 190 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'nuts'] },
    { name: 'Red Velvet Pasta', category: 'bakery_dessert', isDrink: false, desc: 'Kırmızı kadife kek katmanları ve peynir kreması.', macros: { cal: 430, pro: 6, carb: 51, sug: 37, fat: 22, satFat: 12, caf: 0, sod: 310 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Linzer Tatlısı', category: 'bakery_dessert', isDrink: false, desc: 'Bademli hamur ve marmelat dolgulu Avusturya kurabiyesi.', macros: { cal: 320, pro: 5, carb: 42, sug: 22, fat: 15, satFat: 6, caf: 0, sod: 150 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'nuts', 'egg'] },
    { name: 'Mavi Haşhaşlı Üç Peynirli Bagel', category: 'sandwich_savory', isDrink: false, desc: 'Haşhaşlı bagel içinde 3 peynir dolgusu.', macros: { cal: 420, pro: 17, carb: 45, sug: 3, fat: 19, satFat: 9, caf: 0, sod: 860 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Izgara Tavuk Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Çabatta ekmeğinde ızgara tavuk ve özel sos.', macros: { cal: 450, pro: 29, carb: 42, sug: 3, fat: 17, satFat: 5, caf: 0, sod: 980 }, tags: ['high_protein'], allergens: ['gluten', 'lactose', 'egg'] }
  ],

  arabica: [
    { name: 'Americano', category: 'espresso_hot', isDrink: true, desc: '%100 Arabica çekirdek espresso ve sıcak su.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 150, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Arabica Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Klasik Arabica harman espresso ve kadifemsi süt.', macros: { cal: 150, pro: 8, carb: 13, sug: 12, fat: 7, satFat: 4, caf: 150, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cappuccino', category: 'espresso_hot', isDrink: true, desc: 'Espresso, sıcak süt ve bol süt köpüğü.', macros: { cal: 120, pro: 8, carb: 12, sug: 10, fat: 4, satFat: 2.2, caf: 150, sod: 100 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Toffee Nut Latte', category: 'espresso_hot', isDrink: true, desc: 'Karamelize fındık aroması, espresso ve sıcak süt.', macros: { cal: 260, pro: 8, carb: 35, sug: 32, fat: 9, satFat: 5, caf: 150, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Salted Caramel Latte', category: 'espresso_hot', isDrink: true, desc: 'Tuzlu karamel sosu, espresso ve sıcak süt.', macros: { cal: 270, pro: 8, carb: 36, sug: 33, fat: 8.5, satFat: 5, caf: 150, sod: 190 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Geleneksel Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Taze çekilmiş taze kavrum Türk kahvesi.', macros: { cal: 15, pro: 0.5, carb: 2, sug: 0, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Iced Americano', category: 'espresso_iced', isDrink: true, desc: 'Buzlu soğuk su ve taze espresso.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 150, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Iced Salted Caramel Latte', category: 'espresso_iced', isDrink: true, desc: 'Tuzlu karamel şurubu, soğuk süt, buz ve espresso.', macros: { cal: 220, pro: 6, carb: 30, sug: 27, fat: 7, satFat: 4.2, caf: 150, sod: 180 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Lotus Frappe', category: 'frappe_blended', isDrink: true, desc: 'Lotus Biscoff ezmesi, dondurma bazı, buz ve espresso çırpıntısı.', macros: { cal: 450, pro: 6, carb: 64, sug: 56, fat: 19, satFat: 11, caf: 90, sod: 270 }, tags: ['vegetarian'], allergens: ['lactose', 'gluten', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Nutella Frappe', category: 'frappe_blended', isDrink: true, desc: 'Gerçek Nutella kakaolu fındık kreması, espresso ve soğuk buz çırpması.', macros: { cal: 470, pro: 7, carb: 66, sug: 59, fat: 20, satFat: 12, caf: 90, sod: 250 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Tavuklu Gobit Bun', category: 'sandwich_savory', isDrink: false, desc: 'Gobit ekmeğinde baharatlı tavuk ve yeşillik.', macros: { cal: 420, pro: 26, carb: 41, sug: 3, fat: 16, satFat: 4, caf: 0, sod: 890 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: '4 Peynirli Bagel Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Bagel ekmeğinde 4 çeşit erimiş peynir lezzeti.', macros: { cal: 460, pro: 19, carb: 43, sug: 3, fat: 23, satFat: 12, caf: 0, sod: 910 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Ballı Hardallı Mantarlı Bagel Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Fırınlanmış mantar, bal-hardal sosu ve peynirli bagel.', macros: { cal: 390, pro: 14, carb: 46, sug: 7, fat: 17, satFat: 7, caf: 0, sod: 780 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
    { name: 'Dana Salamlı Focaccia Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Zeytinyağlı focaccia ekmeğinde dana salam ve kaşar.', macros: { cal: 440, pro: 20, carb: 45, sug: 3, fat: 20, satFat: 9, caf: 0, sod: 1020 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Hindi Fümeli Ciabatta', category: 'sandwich_savory', isDrink: false, desc: 'Ciabatta ekmeğinde hindi füme ve krem peynir.', macros: { cal: 370, pro: 22, carb: 39, sug: 3, fat: 13, satFat: 6, caf: 0, sod: 930 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Susamlı Kıymalı Sandviç XXL', category: 'sandwich_savory', isDrink: false, desc: 'Büyük boy ekmekte baharatlı kıyma ve erimiş peynir.', macros: { cal: 560, pro: 31, carb: 51, sug: 4, fat: 26, satFat: 11, caf: 0, sod: 1200 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Frambuazlı Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Taze frambuaz soslu kremsi cheesecake.', macros: { cal: 440, pro: 7, carb: 42, sug: 30, fat: 26, satFat: 15, caf: 0, sod: 260 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Honey Carrot Cake (Ballı Havuçlu Kek)', category: 'bakery_dessert', isDrink: false, desc: 'Doğal bal, havuç ve tarçınlı nemli dilim kek.', macros: { cal: 380, pro: 5, carb: 49, sug: 32, fat: 18, satFat: 4, caf: 0, sod: 270 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'nuts'] },
    { name: 'Mozaik Pasta', category: 'bakery_dessert', isDrink: false, desc: 'Bisküvili geleneksel kakaolu mozaik pasta.', macros: { cal: 340, pro: 5, carb: 41, sug: 25, fat: 18, satFat: 10, caf: 10, sod: 180 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Ballı Fıstık Topları', category: 'fit_healthy', isDrink: false, desc: 'Çiğ fıstık, bal ve yulaf ezmeli sağlıklı enerji topları.', macros: { cal: 210, pro: 6, carb: 24, sug: 14, fat: 10, satFat: 2, caf: 0, sod: 30 }, tags: ['vegetarian', 'lactose_free'], allergens: ['nuts', 'gluten'] }
  ],

  gloria_jeans: [
    { name: 'Americano', category: 'espresso_hot', isDrink: true, desc: 'Gloria Jean\'s özel harman espresso ve sıcak su.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 155, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Caffe Latte', category: 'espresso_hot', isDrink: true, desc: 'Gloria Jean\'s espresso ve ısıtılmış süt.', macros: { cal: 150, pro: 8, carb: 13, sug: 12, fat: 7, satFat: 4, caf: 155, sod: 115 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cappuccino', category: 'espresso_hot', isDrink: true, desc: 'Espresso, sıcak süt ve bol süt köpüğü.', macros: { cal: 120, pro: 8, carb: 12, sug: 10, fat: 4, satFat: 2.2, caf: 155, sod: 100 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'White Chocolate Mocha', category: 'espresso_hot', isDrink: true, desc: 'Beyaz çikolata sosu, espresso ve sıcak süt.', macros: { cal: 390, pro: 11, carb: 49, sug: 47, fat: 17, satFat: 11, caf: 155, sod: 200 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'Very Vanilla', category: 'espresso_hot', isDrink: true, desc: 'Doğal vanilya aromalı Gloria Jean\'s imza sıcak espresso içeceği.', macros: { cal: 260, pro: 8, carb: 35, sug: 32, fat: 9, satFat: 5, caf: 155, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'Mocha Java', category: 'espresso_hot', isDrink: true, desc: 'Gloria Jean\'s imza çikolata ve espresso harmanı.', macros: { cal: 370, pro: 10, carb: 46, sug: 38, fat: 16, satFat: 10, caf: 165, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Geleneksel usulle pişirilmiş köpüklü Türk kahvesi.', macros: { cal: 15, pro: 0.5, carb: 2, sug: 0, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Piccolo Latte', category: 'espresso_hot', isDrink: true, desc: 'Küçük boyutta servis edilen yoğun tek shot espresso latte.', macros: { cal: 70, pro: 4, carb: 5, sug: 4.5, fat: 3.5, caf: 75, sod: 50 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Cortado', category: 'espresso_hot', isDrink: true, desc: 'Eşit miktarda espresso ve buharlanmış sıcak süt.', macros: { cal: 80, pro: 5, carb: 6, sug: 5, fat: 4, satFat: 2, caf: 155, sod: 60 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'GJ\'s Iced Coffee', category: 'espresso_iced', isDrink: true, desc: 'Gloria Jean\'s özel soğuk demlenmiş buzlu kahvesi.', macros: { cal: 20, pro: 1, carb: 3, sug: 1, fat: 0.2, satFat: 0, caf: 160, sod: 15 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'White Chocolate Mocha Chiller', category: 'frappe_blended', isDrink: true, desc: 'Buzlu, beyaz çikolatalı ve kremalı soğuk imza Chiller içecek.', macros: { cal: 420, pro: 6, carb: 62, sug: 56, fat: 17, satFat: 11, caf: 110, sod: 240 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Lime Cooler', category: 'smoothie_juice', isDrink: true, desc: 'Misket limonlu buzlu ferahlatıcı soğuk içecek.', macros: { cal: 105, pro: 0.2, carb: 25, sug: 23, fat: 0, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Berry Cooler', category: 'smoothie_juice', isDrink: true, desc: 'Orman meyveli ferahlatıcı soğuk yaz içeceği.', macros: { cal: 115, pro: 0.3, carb: 28, sug: 26, fat: 0, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Pink Strawberry Matcha', category: 'tea_herbal', isDrink: true, desc: 'Çilek püre tabanlı, sütlü yeşil çay (matcha) katmanlı içecek.', macros: { cal: 210, pro: 6, carb: 32, sug: 29, fat: 6, satFat: 3.5, caf: 50, sod: 90 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Passionate Lemonade', category: 'smoothie_juice', isDrink: true, desc: 'Tutku meyveli (passionate) taze ev yapımı limonata.', macros: { cal: 130, pro: 0.4, carb: 33, sug: 30, fat: 0.1, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Soslu Ayvalık Tostu', category: 'sandwich_savory', isDrink: false, desc: 'Özel domates soslu, sucuk ve eritilmiş kaşarlı Ayvalık tostu.', macros: { cal: 480, pro: 22, carb: 45, sug: 4, fat: 24, satFat: 12, caf: 0, sod: 1100 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Artisan Jambon Cheddarlı Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Artisan ekmekte dana jambon ve cheddar peyniri.', macros: { cal: 420, pro: 23, carb: 39, sug: 3, fat: 19, satFat: 9, caf: 0, sod: 960 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Üç Peynirli Bagel', category: 'sandwich_savory', isDrink: false, desc: 'Cheddar, kaşar ve labne dolu sıcak bagel.', macros: { cal: 410, pro: 16, carb: 43, sug: 3, fat: 19, satFat: 10, caf: 0, sod: 830 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
    { name: 'Kremalı Havuçlu Kek (Creamy Carrot Cake)', category: 'bakery_dessert', isDrink: false, desc: 'Havuçlu, cevizli ve kremalı kek dilimi.', macros: { cal: 390, pro: 5, carb: 48, sug: 32, fat: 20, satFat: 6, caf: 0, sod: 300 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'nuts'] },
    { name: 'Antep Fıstıklı Kadayıflı Panna Cotta', category: 'bakery_dessert', isDrink: false, desc: 'Çıtır kadayıf ve Antep fıstıklı İtalyan sütlü tatlısı.', macros: { cal: 360, pro: 6, carb: 38, sug: 27, fat: 20, satFat: 12, caf: 0, sod: 140 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'nuts'] }
  ],

  david_people: [
    { name: 'Italian Caramel Latte', category: 'espresso_hot', isDrink: true, desc: 'Karamel şurubu, İtalyan usulü espresso ve sıcak süt.', macros: { cal: 240, pro: 8, carb: 33, sug: 30, fat: 8, satFat: 4.8, caf: 150, sod: 130 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Pumpkin Spice Latte', category: 'espresso_hot', isDrink: true, desc: 'Balkabağı ve zencefil-tarçın baharatlı sıcak espresso.', macros: { cal: 280, pro: 8, carb: 38, sug: 35, fat: 9, satFat: 5.5, caf: 150, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 3 },
    { name: 'Cinnamon Latte', category: 'espresso_hot', isDrink: true, desc: 'Tarçın aromalı sıcak süt ve espresso dökümü.', macros: { cal: 230, pro: 8, carb: 30, sug: 27, fat: 7.5, satFat: 4.5, caf: 150, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk', pumps: 2 },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'Çift shot espresso ve pürüzsüz süt köpüğü.', macros: { cal: 165, pro: 9, carb: 13, sug: 12, fat: 8.5, satFat: 5, caf: 180, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Damla Sakızlı Türk Kahvesi', category: 'espresso_hot', isDrink: true, desc: 'Sakız aromalı özel geleneksel Türk kahvesi.', macros: { cal: 20, pro: 0.5, carb: 3, sug: 1, fat: 0.4, satFat: 0.1, caf: 75, sod: 5 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'short' },
    { name: 'Damla Sakızlı Salep', category: 'tea_herbal', isDrink: true, desc: 'Geleneksel sıcak salep, damla sakızı dokunuşu ile.', macros: { cal: 280, pro: 9, carb: 45, sug: 38, fat: 6, satFat: 3.8, caf: 0, sod: 130 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Fly Nut', category: 'espresso_iced', isDrink: true, desc: 'David People imza fındık aromalı soğuk kahve spesiyali.', macros: { cal: 250, pro: 7, carb: 34, sug: 30, fat: 10, satFat: 5.5, caf: 140, sod: 140 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Why Nut', category: 'espresso_iced', isDrink: true, desc: 'Özel fındık ve çikolata soslu David People soğuk spesiyali.', macros: { cal: 290, pro: 7, carb: 40, sug: 35, fat: 12, satFat: 7, caf: 140, sod: 150 }, tags: ['vegetarian'], allergens: ['lactose', 'nuts', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Oreo Bomb', category: 'frappe_blended', isDrink: true, desc: 'Oreo bisküvi parçalı dondurmalı soğuk frappe.', macros: { cal: 450, pro: 6, carb: 67, sug: 59, fat: 18, satFat: 11, caf: 15, sod: 310 }, tags: ['vegetarian'], allergens: ['lactose', 'gluten', 'soy'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Cooldrop Lime', category: 'smoothie_juice', isDrink: true, desc: 'Lime (misket limonu) aromalı soğuk ferahlatıcı içecek.', macros: { cal: 100, pro: 0.2, carb: 24, sug: 22, fat: 0, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Blueberry Hibiscus Refresher', category: 'smoothie_juice', isDrink: true, desc: 'Yaban mersini ve hibiskus aromalı soğuk çay.', macros: { cal: 110, pro: 0.3, carb: 27, sug: 25, fat: 0, satFat: 0, caf: 0, sod: 10 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Dragon Freeze', category: 'smoothie_juice', isDrink: true, desc: 'Ejder meyveli karlı ferahlatıcı buzlu içecek.', macros: { cal: 130, pro: 0.4, carb: 32, sug: 29, fat: 0.1, satFat: 0, caf: 0, sod: 12 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free'], allergens: [], defaultSize: 'tall' },
    { name: 'Ice Chai Tea Latte', category: 'tea_herbal', isDrink: true, desc: 'Baharatlı chai çayı özü, buz ve soğuk süt.', macros: { cal: 210, pro: 6, carb: 38, sug: 36, fat: 4, satFat: 2.2, caf: 60, sod: 95 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Bazlama Tost', category: 'sandwich_savory', isDrink: false, desc: 'Köy bazlamasında kaşar peyniri ve sucuklu tost.', macros: { cal: 470, pro: 20, carb: 48, sug: 3, fat: 22, satFat: 11, caf: 0, sod: 1020 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Dana Jambonlu Panini', category: 'sandwich_savory', isDrink: false, desc: 'Dana jambon ve eritilmiş kaşar peynirli sıcak panini.', macros: { cal: 440, pro: 22, carb: 43, sug: 3, fat: 19, satFat: 9, caf: 0, sod: 980 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Fritto Burger', category: 'sandwich_savory', isDrink: false, desc: 'Çıtır kaplamalı burger köftesi ve patates kızartması porsiyonu.', macros: { cal: 680, pro: 28, carb: 65, sug: 6, fat: 34, satFat: 12, caf: 0, sod: 1250 }, tags: ['high_protein'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Pain au Chocolat', category: 'bakery_dessert', isDrink: false, desc: 'Çikolatalı Fransız usulü kruvasan çörek.', macros: { cal: 350, pro: 6, carb: 38, sug: 12, fat: 20, satFat: 13, caf: 5, sod: 350 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg', 'soy'] },
    { name: 'Pizza Çörek', category: 'bakery_dessert', isDrink: false, desc: 'Sucuk, zeytin ve kaşarlı tuzlu fırın çöreği.', macros: { cal: 360, pro: 11, carb: 39, sug: 4, fat: 18, satFat: 8, caf: 0, sod: 780 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'San Sebastian Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Akışkan merkezli İspanyol usulü fırınlanmış cheesecake.', macros: { cal: 480, pro: 9, carb: 38, sug: 28, fat: 32, satFat: 19, caf: 0, sod: 290 }, tags: ['vegetarian', 'gluten_free'], allergens: ['lactose', 'egg'] }
  ],

  tchibo: [
    { name: 'Latte Macchiato', category: 'espresso_hot', isDrink: true, desc: 'Katmanlı sıcak süt, süt köpüğü ve Tchibo espresso.', macros: { cal: 160, pro: 9, carb: 14, sug: 13, fat: 7, satFat: 4.2, caf: 145, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Flat White', category: 'espresso_hot', isDrink: true, desc: 'Çift shot espresso ve ince kremsi süt köpüğü.', macros: { cal: 170, pro: 9, carb: 14, sug: 13, fat: 9, satFat: 5, caf: 175, sod: 120 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Cortado', category: 'espresso_hot', isDrink: true, desc: 'Espresso ve eşit oranda buharlanmış sıcak süt.', macros: { cal: 80, pro: 5, carb: 6, sug: 5, fat: 4, satFat: 2, caf: 145, sod: 60 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'short' },
    { name: 'Protein Latte Vanilla', category: 'espresso_hot', isDrink: true, desc: 'Vanilya aromalı, yüksek proteinli sıcak latte kahvesi.', macros: { cal: 180, pro: 18, carb: 14, sug: 11, fat: 4, satFat: 2, caf: 145, sod: 160 }, tags: ['vegetarian', 'high_protein'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Protein Latte Biscuit', category: 'espresso_hot', isDrink: true, desc: 'Bisküvi aromalı, yüksek proteinli sıcak latte kahvesi.', macros: { cal: 190, pro: 18, carb: 16, sug: 12, fat: 4.5, satFat: 2.2, caf: 145, sod: 170 }, tags: ['vegetarian', 'high_protein'], allergens: ['lactose', 'gluten'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Sütlü Filtre Kahve', category: 'espresso_hot', isDrink: true, desc: 'Tchibo taze demlenmiş filtre kahve ve sıcak süt.', macros: { cal: 45, pro: 2.5, carb: 4, sug: 3.5, fat: 2, satFat: 1.2, caf: 160, sod: 40 }, tags: ['vegetarian', 'low_calorie'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Sıcak Çikolata', category: 'tea_herbal', isDrink: true, desc: 'Yoğun kıvamlı kremalı sıcak çikolata içeceği.', macros: { cal: 340, pro: 10, carb: 43, sug: 36, fat: 14, satFat: 9, caf: 15, sod: 160 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Latte', category: 'espresso_iced', isDrink: true, desc: 'Espresso, soğuk süt ve buz küpleri.', macros: { cal: 130, pro: 7, carb: 11, sug: 10, fat: 6, satFat: 3.5, caf: 145, sod: 95 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Iced Americano', category: 'espresso_iced', isDrink: true, desc: 'Espresso, soğuk su ve buz.', macros: { cal: 15, pro: 1, carb: 2, sug: 0, fat: 0, satFat: 0, caf: 145, sod: 10 }, tags: ['vegan', 'vegetarian', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Cold Brew', category: 'cold_brew', isDrink: true, desc: 'Uzun süreli soğuk demleme pürüzsüz filtre kahve.', macros: { cal: 5, pro: 0, carb: 0, sug: 0, fat: 0, satFat: 0, caf: 165, sod: 15 }, tags: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'low_calorie'], allergens: [], defaultSize: 'tall' },
    { name: 'Iced Protein Latte', category: 'espresso_iced', isDrink: true, desc: 'Soğuk servis edilen yüksek proteinli espresso latte.', macros: { cal: 175, pro: 18, carb: 13, sug: 10, fat: 3.8, satFat: 1.8, caf: 145, sod: 150 }, tags: ['vegetarian', 'high_protein'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Matcha Latte', category: 'tea_herbal', isDrink: true, desc: 'İnce öğütülmüş yeşil çay (matcha) ve sıcak/soğuk süt.', macros: { cal: 190, pro: 7, carb: 26, sug: 24, fat: 6, satFat: 3.5, caf: 50, sod: 95 }, tags: ['vegetarian'], allergens: ['lactose'], defaultSize: 'tall', defaultMilk: 'whole_milk' },
    { name: 'Dana Fümeli Cheddarlı Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Haşhaşlı tahıl ekmeğinde dana füme ve cheddar peyniri.', macros: { cal: 430, pro: 23, carb: 39, sug: 3, fat: 20, satFat: 10, caf: 0, sod: 960 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Hindi Fümeli & Cheddarlı Ciabatta', category: 'sandwich_savory', isDrink: false, desc: 'Ekşi mayalı ciabatta ekmeğinde hindi füme ve cheddar peyniri.', macros: { cal: 400, pro: 22, carb: 41, sug: 3, fat: 16, satFat: 8, caf: 0, sod: 920 }, tags: ['high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Fırın Sebzeli Peynirli Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Tam buğday ekmeğinde pesto sos, fırınlanmış sebzeler ve peynir.', macros: { cal: 370, pro: 13, carb: 46, sug: 5, fat: 15, satFat: 6, caf: 0, sod: 680 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
    { name: 'Mozzarellalı Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Ekşi mayalı ciabatta ekmeğinde mozzarella ve kurutulmuş domates.', macros: { cal: 420, pro: 16, carb: 44, sug: 3, fat: 20, satFat: 9, caf: 0, sod: 810 }, tags: ['vegetarian', 'high_protein'], allergens: ['gluten', 'lactose'] },
    { name: 'Zeytin Ezmeli & Peynirli Simit Sandviç', category: 'sandwich_savory', isDrink: false, desc: 'Susamlı simit bagel içinde zeytin ezmesi ve peynir.', macros: { cal: 390, pro: 13, carb: 48, sug: 3, fat: 16, satFat: 7, caf: 0, sod: 790 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose'] },
    { name: 'Raspberry Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Ahududu soslu klasik cheesecake dilimi.', macros: { cal: 440, pro: 7, carb: 43, sug: 31, fat: 26, satFat: 15, caf: 0, sod: 270 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Lemon Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Ferah limon soslu cheesecake.', macros: { cal: 420, pro: 7, carb: 45, sug: 32, fat: 24, satFat: 14, caf: 0, sod: 260 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] },
    { name: 'Apple Crumble Cheesecake', category: 'bakery_dessert', isDrink: false, desc: 'Elma ve kıtır hamur parçacıklı fırın cheesecake.', macros: { cal: 450, pro: 6, carb: 51, sug: 34, fat: 25, satFat: 14, caf: 0, sod: 280 }, tags: ['vegetarian'], allergens: ['gluten', 'lactose', 'egg'] }
  ]
};

let itemsData = "import type { MenuItem } from '../types/cafe';\n\nexport const MENU_ITEMS: MenuItem[] = [\n";

let totalGenerated = 0;

Object.keys(CHAIN_DATA).forEach((chainId) => {
  const chainItems = CHAIN_DATA[chainId];
  itemsData += "  // =========================================================================\n";
  itemsData += "  // " + chainId.toUpperCase() + " (" + chainItems.length + " Authentic Items)\n";
  itemsData += "  // =========================================================================\n";
  
  chainItems.forEach((item, index) => {
    const cal = item.macros.cal;
    const pro = item.macros.pro;
    const carb = item.macros.carb;
    const sug = item.macros.sug;
    const fat = item.macros.fat;
    const satFat = item.macros.satFat;
    const caf = item.macros.caf;
    const sod = item.macros.sod;

    let glycemic = 'Orta';
    if (sug > 30 || carb > 45) glycemic = 'Yüksek';
    else if (sug < 15 && carb < 20) glycemic = 'Düşük';

    const image = getItemImage(item.name, item.category, item.image);

    itemsData += "  {\n";
    itemsData += "    id: '" + chainId + "_" + (index + 1) + "_" + item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + "',\n";
    itemsData += "    chainId: '" + chainId + "',\n";
    itemsData += "    name: " + JSON.stringify(item.name) + ",\n";
    itemsData += "    category: '" + item.category + "',\n";
    itemsData += "    description: " + JSON.stringify(item.desc) + ",\n";
    itemsData += "    image: '" + image + "',\n";
    itemsData += "    isDrink: " + item.isDrink + ",\n";

    if (item.defaultSize) itemsData += "    defaultSizeId: '" + item.defaultSize + "',\n";
    if (item.defaultMilk) itemsData += "    defaultMilkId: '" + item.defaultMilk + "',\n";
    if (item.pumps) itemsData += "    defaultSyrupPumps: " + item.pumps + ",\n";

    itemsData += "    baseMacros: { calories: " + cal + ", protein: " + pro + ", carbs: " + carb + ", sugar: " + sug + ", fat: " + fat + ", satFat: " + satFat + ", caffeine: " + caf + ", sodium: " + sod + " },\n";
    itemsData += "    allergens: " + JSON.stringify(item.allergens) + ",\n";
    itemsData += "    dietaryTags: " + JSON.stringify(item.tags) + ",\n";
    itemsData += "    glycemicImpact: '" + glycemic + "'\n";
    itemsData += "  },\n";
    
    totalGenerated++;
  });
});

itemsData += "];\n";

fs.writeFileSync(path.join(__dirname, '../src/data/items.ts'), itemsData, 'utf-8');

console.log("Successfully generated " + totalGenerated + " authentic chain items in src/data/items.ts");
