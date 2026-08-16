#!/usr/bin/env python3
"""Catalog compiler for Kalori Cafe.

Inputs:
  scripts/catalog_sources/catalog_release.json approved normalized release
  scripts/catalog_sources/*.json tracked normalized research snapshots
  tmp_research/*.json            optional scratch overlay, review-only

Outputs:
  src/data/catalog/<chain>.ts    per-chain MenuItem modules
  src/data/items.ts              merged MENU_ITEMS export
  tmp_research/manifest.json     image manifest for build-images.mjs

Release rules (see scripts/catalog_sources/README.md):
- existing product IDs preserved (favorites/basket stability)
- new products come only from researched official/approved menu snapshots
- sizes never counted as separate products
- nutrition marked estimated unless a verified figure is provided
- catalog + image provenance recorded on every static item
"""
import json
import argparse
import difflib
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = os.path.join(ROOT, "tmp_research")
OUT = os.path.join(ROOT, "src", "data", "catalog")
TRACKED_SOURCE_DIR = os.path.join(ROOT, "scripts", "catalog_sources")
TRACKED_BASELINE = os.path.join(TRACKED_SOURCE_DIR, "catalog_baseline.json")
TRACKED_ASSETS = os.path.join(TRACKED_SOURCE_DIR, "catalog_assets.json")
TRACKED_RELEASE = os.path.join(TRACKED_SOURCE_DIR, "catalog_release.json")
CHECKED_AT = "2026-08-05"

CHAIN_KEYS = {
    "starbucks": ("starbucks", "CHAIN_STARBUCKS_ITEMS"),
    "espressolab": ("espressolab", "CHAIN_ESPRESSOLAB_ITEMS"),
    "kahve_dunyasi": ("kahve_dunyasi", "CHAIN_KAHVE_DUNYASI_ITEMS"),
    "caffe_nero": ("caffe_nero", "CHAIN_CAFFE_NERO_ITEMS"),
    "coffy": ("coffy", "CHAIN_COFFY_ITEMS"),
    "mackbear": ("mackbear", "CHAIN_MACKBEAR_ITEMS"),
    "arabica": ("arabica", "CHAIN_ARABICA_ITEMS"),
    "gloria_jeans": ("gloria_jeans", "CHAIN_GLORIA_JEANS_ITEMS"),
    "david_people": ("david_people", "CHAIN_DAVID_PEOPLE_ITEMS"),
    "tchibo": ("tchibo", "CHAIN_TCHIBO_ITEMS"),
}

CATALOG_URLS = {
    "starbucks": "https://www.starbucks.com.tr/menu",
    "espressolab": "https://www.espressolab.com/kurumsal/menu",
    "kahve_dunyasi": "https://www.kahvedunyasi.com/menu",
    "caffe_nero": "https://www.caffenero.com/tr",
    "coffy": "https://coffy.com.tr",
    "mackbear": "https://mackbearcoffee.com",
    "arabica": "https://www.arabicacoffee.com.tr",
    "gloria_jeans": "https://www.gloriajeans.com.tr/menu",
    "david_people": "https://davidpeople.com",
    "tchibo": "https://www.tchibo.com.tr",
}

FOOD_CATEGORIES = {"bakery_dessert", "sandwich_savory", "fit_healthy"}
DRINK_CATEGORIES = {
    "espresso_hot", "espresso_iced", "cold_brew", "frappe_blended",
    "tea_herbal", "smoothie_juice",
}
NUTRITION_FIELDS = (
    "calories", "protein", "carbs", "sugar", "fat", "satFat", "caffeine", "sodium",
)
OFFICIAL_ALLERGENS = {
    "gluten", "crustaceans", "egg", "fish", "peanut", "soy", "milk",
    "nuts", "celery", "mustard", "sesame", "sulphites", "lupin", "molluscs",
}
CATEGORY_OVERRIDES = {
    "portakalli kakaolu kek": "bakery_dessert",
}


def load_research(include_scratch: bool = False) -> dict:
    """Load committed chain snapshots, optionally overlay scratch research.

    A JSON file in ``scripts/catalog_sources`` may contain either one chain
    object or a ``{\"chains\": [...]}`` wrapper. Baseline, asset and provenance
    metadata in the same directory are ignored by this loader. Scratch data is
    opt-in and wins only for local research work.
    """
    merged = []
    positions = {}

    def put(chain: dict) -> None:
        chain_id = chain.get("chainId")
        if not chain_id:
            raise ValueError("Research chain is missing chainId")
        if chain_id in positions:
            merged[positions[chain_id]] = chain
        else:
            positions[chain_id] = len(merged)
            merged.append(chain)

    if os.path.isdir(TRACKED_SOURCE_DIR):
        for filename in sorted(os.listdir(TRACKED_SOURCE_DIR)):
            if not filename.endswith(".json"):
                continue
            path = os.path.join(TRACKED_SOURCE_DIR, filename)
            with open(path, encoding="utf-8") as f:
                payload = json.load(f)
            if isinstance(payload, dict) and isinstance(payload.get("chains"), list):
                chains = payload["chains"]
            elif isinstance(payload, dict) and payload.get("chainId"):
                chains = [payload]
            else:
                chains = []
            for chain in chains:
                put(chain)

    if include_scratch:
        research_file = os.path.join(TMP, "research.json")
        if os.path.exists(research_file):
            with open(research_file, encoding="utf-8") as f:
                scratch = json.load(f)
            for chain in scratch.get("chains", []):
                put(chain)

    return {"chains": merged}


def norm(name: str) -> str:
    """Turkish-aware normalization: case fold + diacritic strip."""
    s = unicodedata.normalize("NFKD", name.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ı", "i")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def canonical_category(name: str, fallback: str) -> str:
    """Apply narrowly reviewed corrections before deriving product kind."""
    return CATEGORY_OVERRIDES.get(norm(name), fallback)


def canonical_product_kind(name: str, category: str, product: dict | None = None) -> str:
    """Derive the canonical kind from category, never from a truthy default.

    ``isDrink`` remains an output compatibility mirror. Historical research
    marked entire food sections as drinks, so a recognized category wins over
    that legacy boolean. An explicit productKind, when supplied, must agree.
    """
    product = product or {}
    explicit = product.get("productKind")
    if category in FOOD_CATEGORIES:
        derived = "food"
    elif category in DRINK_CATEGORIES:
        derived = "drink"
    else:
        raise ValueError(f"Unknown category for {name!r}: {category!r}")
    if explicit is not None and explicit != derived:
        raise ValueError(
            f"productKind/category conflict for {name!r}: {explicit!r} vs {category!r}"
        )
    return derived


def slugify(name: str) -> str:
    s = name.lower()
    for a, b in (("ü", "u"), ("ö", "o"), ("ş", "s"), ("ç", "c"), ("ğ", "g"), ("ı", "i")):
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "item"


def ts_str(v) -> str:
    return json.dumps(str(v), ensure_ascii=False)


def ts_item(item: dict) -> str:
    """Render one MenuItem record as a TypeScript object literal."""
    lines = ["  {"]
    lines.append(f"    id: {ts_str(item['id'])},")
    lines.append(f"    chainId: {ts_str(item['chainId'])},")
    lines.append(f"    name: {ts_str(item['name'])},")
    if item.get("nameEn"):
        lines.append(f"    nameEn: {ts_str(item['nameEn'])},")
    lines.append(f"    category: {ts_str(item['category'])},")
    lines.append(f"    productKind: {ts_str(item['productKind'])},")
    lines.append(f"    description: {ts_str(item['description'])},")
    lines.append(f"    image: {ts_str(item.get('image') or '/images/menu/placeholder.webp')},")
    lines.append(f"    isDrink: {'true' if item['productKind'] == 'drink' else 'false'},")
    if item["productKind"] == "drink" and item.get("defaultSizeId"):
        lines.append(f"    defaultSizeId: {ts_str(item['defaultSizeId'])},")
    if item["productKind"] == "drink" and item.get("defaultMilkId"):
        lines.append(f"    defaultMilkId: {ts_str(item['defaultMilkId'])},")
    if item["productKind"] == "drink" and item.get("defaultSyrupPumps") is not None:
        lines.append(f"    defaultSyrupPumps: {int(item['defaultSyrupPumps'])},")
    m = item["baseMacros"]
    lines.append(
        "    baseMacros: { calories: %s, protein: %s, carbs: %s, sugar: %s, fat: %s, satFat: %s, caffeine: %s, sodium: %s },"
        % (m["calories"], m["protein"], m["carbs"], m["sugar"], m["fat"], m["satFat"], m["caffeine"], m["sodium"])
    )
    lines.append(f"    allergens: {json.dumps(item.get('allergens', []), ensure_ascii=False)},")
    if item.get("containsLactose") is not None:
        lines.append(f"    containsLactose: {'true' if item['containsLactose'] else 'false'},")
    if item.get("crossContactRisks"):
        lines.append(f"    crossContactRisks: {json.dumps(item['crossContactRisks'], ensure_ascii=False)},")
    allergen_source = item.get("allergenSource") or {"status": "estimated"}
    lines.append("    allergenSource: {")
    lines.append(f"      status: {ts_str(allergen_source['status'])},")
    if allergen_source.get("url"):
        lines.append(f"      url: {ts_str(allergen_source['url'])},")
    if allergen_source.get("checkedAt"):
        lines.append(f"      checkedAt: {ts_str(allergen_source['checkedAt'])},")
    if allergen_source.get("notes"):
        lines.append(f"      notes: {ts_str(allergen_source['notes'])},")
    lines.append("    },")
    lines.append(f"    dietaryTags: {json.dumps(item.get('dietaryTags', []), ensure_ascii=False)},")
    if item.get("glycemicImpact"):
        lines.append(f"    glycemicImpact: {ts_str(item['glycemicImpact'])},")
    lines.append(f"    availability: {ts_str(item.get('availability', 'current'))},")
    cs = item["catalogSource"]
    lines.append("    catalogSource: {")
    lines.append(f"      url: {ts_str(cs['url'])}, checkedAt: {ts_str(cs['checkedAt'])}, kind: {ts_str(cs['kind'])},")
    lines.append("    },")
    ns = item["nutritionSource"]
    lines.append("    nutritionSource: {")
    lines.append(f"      status: {ts_str(ns['status'])}, label: {ts_str(ns.get('label', ''))},")
    if ns.get("url"):
        lines.append(f"      url: {ts_str(ns['url'])},")
    if ns.get("verifiedAt"):
        lines.append(f"      verifiedAt: {ts_str(ns['verifiedAt'])},")
    if ns.get("servingBasis"):
        lines.append(f"      servingBasis: {ts_str(ns['servingBasis'])},")
    if ns.get("notes"):
        lines.append(f"      notes: {ts_str(ns['notes'])},")
    if ns.get("fieldStatus"):
        lines.append(f"      fieldStatus: {json.dumps(ns['fieldStatus'], ensure_ascii=False)},")
    lines.append("    },")
    img_src = item.get("imageSource") or {"url": "", "kind": "licensed_fallback", "exactProduct": False}
    lines.append("    imageSource: {")
    lines.append(f"      url: {ts_str(img_src.get('url', ''))}, kind: {ts_str(img_src.get('kind', 'licensed_fallback'))}, exactProduct: {'true' if img_src.get('exactProduct') else 'false'},")
    lines.append("    },")
    lines.append("  },")
    return "\n".join(lines)


def estimate_macros(name: str, category: str, is_drink: bool) -> dict:
    n = norm(name)
    if not is_drink:
        if "cheesecake" in n or "san sebastian" in n:
            return {"calories": 450, "protein": 8, "carbs": 42, "sugar": 30, "fat": 27, "satFat": 16, "caffeine": 0, "sodium": 280}
        if "croissant" in n or "kruvasan" in n or "pain au chocolat" in n:
            return {"calories": 355, "protein": 6, "carbs": 38, "sugar": 12, "fat": 20, "satFat": 12, "caffeine": 0, "sodium": 350}
        if "muffin" in n:
            return {"calories": 370, "protein": 5, "carbs": 52, "sugar": 29, "fat": 16, "satFat": 4, "caffeine": 0, "sodium": 310}
        if "cookie" in n or "kurabiye" in n or "kuki" in n or "levain" in n:
            return {"calories": 400, "protein": 6, "carbs": 50, "sugar": 33, "fat": 21, "satFat": 12, "caffeine": 10, "sodium": 255}
        if any(k in n for k in ("brownie", "mozaik", "sufle", "profiterol", "marlenka", "red velvet", "truf")):
            return {"calories": 420, "protein": 7, "carbs": 55, "sugar": 36, "fat": 20, "satFat": 12, "caffeine": 10, "sodium": 240}
        if "tiramisu" in n:
            return {"calories": 370, "protein": 6, "carbs": 39, "sugar": 27, "fat": 21, "satFat": 13, "caffeine": 35, "sodium": 130}
        if any(k in n for k in ("kek", "cake", "pasta")):
            return {"calories": 380, "protein": 5, "carbs": 50, "sugar": 33, "fat": 18, "satFat": 6, "caffeine": 0, "sodium": 270}
        if any(k in n for k in ("simit", "boyoz", "pogaca", "acma")):
            return {"calories": 310, "protein": 9, "carbs": 40, "sugar": 4, "fat": 14, "satFat": 6, "caffeine": 0, "sodium": 380}
        if any(k in n for k in ("gofrik", "waffle", "gofret", "madlen")):
            return {"calories": 260, "protein": 4, "carbs": 31, "sugar": 16, "fat": 13, "satFat": 7, "caffeine": 0, "sodium": 120}
        if any(k in n for k in ("sandvic", "sandwich", "panini", "ciabatta", "baget", "tost", "wrap", "gobit", "bagel", "bun")):
            return {"calories": 420, "protein": 20, "carbs": 44, "sugar": 3, "fat": 17, "satFat": 8, "caffeine": 0, "sodium": 820}
        if "burger" in n:
            return {"calories": 550, "protein": 26, "carbs": 52, "sugar": 5, "fat": 28, "satFat": 11, "caffeine": 0, "sodium": 1100}
        if any(k in n for k in ("salat", "salad", "parfe", "parfait", "yulaf")):
            return {"calories": 320, "protein": 12, "carbs": 36, "sugar": 22, "fat": 8, "satFat": 1.5, "caffeine": 10, "sodium": 220}
        if any(k in n for k in ("top", "balls")):
            return {"calories": 210, "protein": 6, "carbs": 24, "sugar": 14, "fat": 10, "satFat": 2, "caffeine": 0, "sodium": 30}
        return {"calories": 400, "protein": 14, "carbs": 42, "sugar": 5, "fat": 16, "satFat": 7, "caffeine": 0, "sodium": 600}
    # drinks
    if "con panna" in n:
        return {"calories": 45, "protein": 1, "carbs": 2, "sugar": 1, "fat": 4, "satFat": 2.5, "caffeine": 80, "sodium": 15}
    if any(k in n for k in ("americano", "espresso", "filtre", "v60", "long black", "turk", "dibek", "menengic", "freddo")):
        return {"calories": 10, "protein": 0.5, "carbs": 2, "sugar": 0, "fat": 0, "satFat": 0, "caffeine": 140, "sodium": 12}
    if category == "cold_brew" and "latte" in n:
        return {"calories": 120, "protein": 6, "carbs": 10, "sugar": 9, "fat": 5, "satFat": 3, "caffeine": 170, "sodium": 80}
    if category == "cold_brew":
        return {"calories": 5, "protein": 0, "carbs": 0, "sugar": 0, "fat": 0, "satFat": 0, "caffeine": 165, "sodium": 15}
    if "cortado" in n or "piccolo" in n or ("macchiato" in n and "caramel" not in n and "iced" not in n):
        return {"calories": 80, "protein": 5, "carbs": 6, "sugar": 5, "fat": 4, "satFat": 2, "caffeine": 150, "sodium": 60}
    if "cappuccino" in n or "capuccin" in n or "kapuc" in n:
        return {"calories": 125, "protein": 8, "carbs": 12, "sugar": 10, "fat": 4.5, "satFat": 2.5, "caffeine": 150, "sodium": 100}
    if "flat white" in n:
        return {"calories": 165, "protein": 9, "carbs": 14, "sugar": 13, "fat": 7, "satFat": 4, "caffeine": 160, "sodium": 115}
    if "latte" in n and category == "espresso_hot":
        if any(k in n for k in ("caramel", "vanilla", "vanilya", "findik", "fistik", "biscoff", "oreo", "nut", "pumpkin", "balkabagi")):
            return {"calories": 260, "protein": 8, "carbs": 34, "sugar": 30, "fat": 9, "satFat": 5.5, "caffeine": 150, "sodium": 150}
        return {"calories": 160, "protein": 9, "carbs": 14, "sugar": 13, "fat": 7, "satFat": 4, "caffeine": 150, "sodium": 115}
    if "mocha" in n or ("cikolata" in n and "kahve" in n):
        return {"calories": 340, "protein": 10, "carbs": 44, "sugar": 36, "fat": 14, "satFat": 9, "caffeine": 150, "sodium": 140}
    if "white" in n or "beyaz" in n:
        return {"calories": 360, "protein": 10, "carbs": 46, "sugar": 40, "fat": 15, "satFat": 9.5, "caffeine": 20, "sodium": 170}
    if "sicak" in n or "hot chocolate" in n or "milano" in n:
        return {"calories": 360, "protein": 10, "carbs": 46, "sugar": 40, "fat": 15, "satFat": 9.5, "caffeine": 15, "sodium": 170}
    if "matcha" in n:
        return {"calories": 190, "protein": 8, "carbs": 26, "sugar": 24, "fat": 6, "satFat": 3.5, "caffeine": 50, "sodium": 95}
    if "chai" in n:
        return {"calories": 230, "protein": 7.5, "carbs": 41, "sugar": 38, "fat": 4.5, "satFat": 2.5, "caffeine": 60, "sodium": 105}
    if "salep" in n or "sahlep" in n:
        return {"calories": 270, "protein": 9, "carbs": 44, "sugar": 37, "fat": 6, "satFat": 3.8, "caffeine": 0, "sodium": 120}
    if any(k in n for k in ("esfrappa", "frappe", "frappuccino", "chiller", "milkshake")):
        return {"calories": 400, "protein": 5, "carbs": 60, "sugar": 55, "fat": 15, "satFat": 10, "caffeine": 100, "sodium": 230}
    if any(k in n for k in ("iced", "buzlu", "soguk", "cold")):
        if "americano" in n:
            return {"calories": 15, "protein": 1, "carbs": 2, "sugar": 0, "fat": 0, "satFat": 0, "caffeine": 150, "sodium": 10}
        return {"calories": 190, "protein": 7, "carbs": 24, "sugar": 21, "fat": 6, "satFat": 3.5, "caffeine": 140, "sodium": 115}
    if any(k in n for k in ("smoothie", "refresha", "cooler", "freeze", "dragon")):
        return {"calories": 130, "protein": 0.8, "carbs": 30, "sugar": 27, "fat": 0.4, "satFat": 0, "caffeine": 15, "sodium": 12}
    if any(k in n for k in ("limonata", "lemonade", "portakal", "orange", "detox")):
        return {"calories": 125, "protein": 0.4, "carbs": 31, "sugar": 28, "fat": 0.1, "satFat": 0, "caffeine": 0, "sodium": 8}
    if "cay" in n or "tea" in n or "chamomile" in n or "papatya" in n:
        return {"calories": 5, "protein": 0.2, "carbs": 1, "sugar": 0, "fat": 0, "satFat": 0, "caffeine": 25, "sodium": 5}
    return {"calories": 150, "protein": 8, "carbs": 13, "sugar": 12, "fat": 6, "satFat": 3.5, "caffeine": 0, "sodium": 90}


def estimate_allergens(name: str, category: str, is_drink: bool) -> list:
    n = norm(name)
    out = set()
    if is_drink:
        black = "latte" not in n and any(k in n for k in ("americano", "espresso", "filtre", "long black", "turk", "cold brew", "v60", "freddo", "cay", "tea", "limonata", "lemonade", "portakal", "orange", "refresha", "cooler", "smoothie", "dragon", "freeze"))
        if not black:
            out.add("milk")
        if any(k in n for k in ("mocha", "cikolata", "choc", "white")):
            out.add("soy")
        if "yer fistigi" in n or "peanut" in n:
            out.add("peanut")
        elif any(k in n for k in ("findik", "fistik", "ceviz", "badem", "pistachio", "hazelnut", "almond", "walnut")):
            out.add("nuts")
    else:
        out.add("gluten")
        if category == "bakery_dessert" or any(k in n for k in ("peynir", "kasar", "ches", "mozzarella", "krema", "tereyagi")):
            out.add("milk")
        if category == "bakery_dessert" or any(k in n for k in ("yumurta", "egg", "mayo")):
            out.add("egg")
        if "yer fistigi" in n or "peanut" in n:
            out.add("peanut")
        elif any(k in n for k in ("findik", "ceviz", "badem", "fistik")):
            out.add("nuts")
        if "ton balik" in n or "tuna" in n:
            out.add("fish")
        if "hardal" in n or "mustard" in n:
            out.add("mustard")
        if "susam" in n or "simit" in n:
            out.add("sesame")
    return sorted(out)


def normalize_allergen_values(values) -> tuple[list, list]:
    """Split regulated allergens from legacy sensitivity/advisory values."""
    allergens = set()
    cross_contact = set()
    for value in values or []:
        if value == "lactose":
            allergens.add("milk")
        elif value == "celiac_oat_risk":
            cross_contact.add("celiac_oat_risk")
        elif value in OFFICIAL_ALLERGENS:
            allergens.add(value)
        else:
            raise ValueError(f"Unknown allergen value: {value!r}")
    return sorted(allergens), sorted(cross_contact)


def estimate_tags(name: str, macros: dict, allergens: list, is_drink: bool) -> list:
    n = norm(name)
    tags = set()
    if macros["calories"] < 40:
        tags.add("low_calorie")
    if macros["protein"] >= 15 and macros["calories"] >= 150:
        tags.add("high_protein")
    if macros["sugar"] <= 1:
        tags.add("sugar_free")
    if macros["calories"] < 40 and "milk" not in allergens:
        tags.add("vegan")
    if not is_drink and "gluten" not in allergens and "gluten_free" in n:
        tags.add("gluten_free")
    if is_drink and any(k in n for k in ("latte", "cappuccino", "macchiato", "mocha", "chai", "matcha", "cortado", "flat")):
        tags.add("vegetarian")
    if not is_drink and any(k in n for k in ("sandvic", "sandwich", "tost", "baget", "bagel", "burger", "panini", "tavuk", "hindi", "jambon", "sucuk", "pizza")):
        tags.add("high_protein")
    return sorted(tags)


def glycemic(sugar: float, carbs: float) -> str:
    if sugar > 30 or carbs > 45:
        return "Yüksek"
    if sugar < 15 and carbs < 20:
        return "Düşük"
    return "Orta"


def catalog_source(chain_id: str, research_product=None, sources=None) -> dict:
    """Catalog provenance with honest kind + URL priority.

    URL priority:
      1. the researched product's exact ``productUrl``
      2. the chain's research source URL
      3. the catalog default menu URL

    A product without a normalized research match is always
    ``legacy_unverified``; a generic brand URL is not product evidence.
    """
    srcs = sources or []
    secondary = bool(research_product) and (
        bool(research_product.get("secondary"))
        or any(isinstance(s, dict) and s.get("kind") == "secondary" for s in srcs)
    )
    url = None
    checked_at = CHECKED_AT
    for s in srcs:
        if not isinstance(s, dict):
            continue
        if url is None and s.get("url"):
            url = s["url"]
        if s.get("checkedAt"):
            checked_at = s["checkedAt"]
    if research_product and research_product.get("productUrl"):
        url = research_product["productUrl"]
    if url is None:
        url = CATALOG_URLS.get(chain_id, f"https://{chain_id}.tr")
    if not research_product:
        kind = "legacy_unverified"
    else:
        kind = "secondary" if secondary else "official"
    return {"url": url, "checkedAt": checked_at, "kind": kind}


def nutrition_estimated(is_new: bool) -> dict:
    return {
        "status": "estimated",
        "label": "Standart tarif/porsiyon bazlı tahmin",
        "notes": (
            "Resmî ürün sayfasında ürün başına besin tablosu yayınlanmıyor; makrolar standart tarif ve porsiyon üzerinden tahmin edildi."
            if is_new
            else "Resmî besin verisi ürün bazlı yayınlanmadığı için makrolar standart tarif/porsiyon üzerinden tahmin."
        ),
        "fieldStatus": {field: "estimated" for field in NUTRITION_FIELDS},
    }


def product_macros(product: dict, name: str, category: str, is_drink: bool) -> dict:
    """Use researched macro fields where present and estimate only gaps."""
    result = estimate_macros(name, category, is_drink)
    provided = product.get("baseMacros")
    if isinstance(provided, dict):
        for key in result:
            value = provided.get(key)
            if isinstance(value, (int, float)) and value >= 0:
                result[key] = value
    result["sugar"] = min(result["sugar"], result["carbs"])
    result["satFat"] = min(result["satFat"], result["fat"])
    return result


def product_allergens(product: dict, name: str, category: str, is_drink: bool) -> list:
    """Keep official empty allergen lists distinct from unavailable data."""
    if product.get("allergenSourceAvailable"):
        values = product.get("allergens", [])
    elif product.get("allergensEstimated"):
        values = product.get("allergens", [])
    else:
        values = estimate_allergens(name, category, is_drink)
    allergens, _ = normalize_allergen_values(values)
    return allergens


def product_allergen_metadata(product: dict | None, allergens: list) -> dict:
    product = product or {}
    raw_values = product.get("allergens", [])
    _, legacy_risks = normalize_allergen_values(raw_values)
    risks = sorted(set(legacy_risks) | set(product.get("crossContactRisks", [])))
    explicit_lactose = product.get("containsLactose")
    if isinstance(explicit_lactose, bool):
        contains_lactose = explicit_lactose
    elif product.get("allergenSourceAvailable"):
        contains_lactose = "milk" in allergens
    else:
        # A milk hit supports a positive intolerance warning. Absence from an
        # estimated allergen list is not evidence that lactose is absent.
        contains_lactose = True if "milk" in allergens else None

    explicit_source = product.get("allergenSource")
    if isinstance(explicit_source, dict):
        source = dict(explicit_source)
    elif product.get("allergenSourceAvailable"):
        nutrition_source = product.get("nutritionSource") or {}
        source = {
            "status": "mixed" if product.get("allergenNotes") else "official",
            "url": product.get("productUrl") or nutrition_source.get("url"),
            "checkedAt": nutrition_source.get("verifiedAt") or CHECKED_AT,
        }
        if product.get("allergenNotes"):
            source["notes"] = product["allergenNotes"]
    else:
        source = {
            "status": "estimated",
            "notes": "Alerjenler ürün adı, kategori ve standart tarif üzerinden ihtiyatlı olarak tahmin edildi.",
        }
    source = {key: value for key, value in source.items() if value is not None}
    return {
        "containsLactose": contains_lactose,
        "crossContactRisks": risks,
        "allergenSource": source,
    }


def product_nutrition_source(product: dict | None, is_new: bool) -> dict:
    if not product or not isinstance(product.get("nutritionSource"), dict):
        return nutrition_estimated(is_new)

    source = dict(product["nutritionSource"])
    official = set(product.get("officialNutritionFields", []))
    derived = set(product.get("derivedNutritionFields", []))
    # Existing Nero snapshots identify sodium among official fields even
    # though the notes state it was derived from official salt (salt × 400).
    if "sodium" in official and "tuzdan" in source.get("notes", "").lower():
        official.remove("sodium")
        derived.add("sodium")
    if source.get("status") == "verified" and not official and not derived:
        official.update(NUTRITION_FIELDS)

    original_status = source.get("status")
    if original_status == "unverified" and not official and not derived:
        field_status = {field: "unknown" for field in NUTRITION_FIELDS}
    else:
        field_status = {
            field: "derived" if field in derived else "official" if field in official else "estimated"
            for field in NUTRITION_FIELDS
        }
    statuses = set(field_status.values())
    if statuses <= {"official", "derived"}:
        source["status"] = "verified"
    elif statuses & {"official", "derived"}:
        source["status"] = "mixed"
    elif statuses == {"estimated"}:
        source["status"] = "estimated"
    else:
        source["status"] = "unverified"
    source["fieldStatus"] = field_status
    return source


def refresh_item_from_research(item: dict, product: dict) -> None:
    """Refresh mutable catalog facts while preserving a legacy product ID."""
    name = product.get("name") or item["name"]
    category = canonical_category(name, product.get("category") or item["category"])
    product_kind = canonical_product_kind(name, category, product)
    is_drink = product_kind == "drink"
    category = refine_category(name, category, is_drink)
    macros = product_macros(product, name, category, is_drink)
    allergens = product_allergens(product, name, category, is_drink)

    item["name"] = name
    if product.get("nameEn"):
        item["nameEn"] = product["nameEn"]
    item["category"] = category
    item["productKind"] = product_kind
    item["isDrink"] = is_drink
    if product.get("description"):
        item["description"] = product["description"]
    item["baseMacros"] = macros
    item["allergens"] = allergens
    item.update(product_allergen_metadata(product, allergens))
    item["dietaryTags"] = list(product.get("dietaryTags") or estimate_tags(name, macros, allergens, is_drink))
    item["glycemicImpact"] = glycemic(macros["sugar"], macros["carbs"])
    item["availability"] = "seasonal" if product.get("seasonal") else "current"
    if is_drink:
        for key in ("defaultSizeId", "defaultMilkId", "defaultSyrupPumps"):
            if key in product:
                item[key] = product[key]
    else:
        for key in ("defaultSizeId", "defaultMilkId", "defaultSyrupPumps", "baseCustomization"):
            item.pop(key, None)


def normalize_catalog_item(item: dict, product: dict | None = None) -> None:
    """Enforce static catalog shape and repair historical food-as-drink rows."""
    product = product or {}
    name = product.get("name") or item["name"]
    original_category = item["category"]
    category = canonical_category(name, product.get("category") or original_category)
    product_kind = canonical_product_kind(name, category, product or item)
    is_drink = product_kind == "drink"
    was_drink = bool(item.get("isDrink"))
    category = refine_category(name, category, is_drink)

    item["category"] = category
    item["productKind"] = product_kind
    item["isDrink"] = is_drink

    if not is_drink:
        for key in ("defaultSizeId", "defaultMilkId", "defaultSyrupPumps", "baseCustomization"):
            item.pop(key, None)
        if was_drink or category != original_category:
            macros = product_macros(product, name, category, False)
            allergens = product_allergens(product, name, category, False)
            item["baseMacros"] = macros
            item["allergens"] = allergens
            item["dietaryTags"] = list(
                product.get("dietaryTags") or estimate_tags(name, macros, allergens, False)
            )
            item["glycemicImpact"] = glycemic(macros["sugar"], macros["carbs"])
            description = item.get("description", "")
            if description.endswith(" kafe içeceği.") or "taze meyve ve buzla" in description:
                item["description"] = default_description(name, category, False)

    normalized_allergens, legacy_risks = normalize_allergen_values(item.get("allergens", []))
    item["allergens"] = normalized_allergens
    metadata_input = product if product else item
    metadata = product_allergen_metadata(metadata_input, normalized_allergens)
    metadata["crossContactRisks"] = sorted(
        set(metadata["crossContactRisks"]) | set(legacy_risks) | set(item.get("crossContactRisks", []))
    )
    if item.get("containsLactose") is not None and not product:
        metadata["containsLactose"] = bool(item["containsLactose"])
    item.update(metadata)


def default_description(name: str, category: str, is_drink: bool) -> str:
    if not is_drink:
        if category in ("bakery_dessert", "fit_healthy"):
            return f"Kafenin taze hazırlanan {name} lezzeti."
        return f"Kafenin güncel menüsünden {name}."
    if category == "espresso_hot":
        return f"Kafenin imza sıcak içeceği: {name}."
    if category == "espresso_iced":
        return f"Buzlu servis edilen ferah espresso içeceği: {name}."
    if category == "cold_brew":
        return f"Uzun süre soğuk demlenen, yumuşak gövdeli kahve: {name}."
    if category == "frappe_blended":
        return f"Buzla çırpılmış kremalı soğuk içecek: {name}."
    if category == "tea_herbal":
        return f"{name}; sıcak veya soğuk servis edilen çay içeceği."
    if category == "smoothie_juice":
        return f"{name} - taze meyve ve buzla hazırlanan serinleten içecek."
    return f"{name} kafe içeceği."


def slot_of(item: dict, research_product=None) -> dict:
    """Visual slot + optional official image URL for the image manifest."""
    n = norm(item["name"])
    cat = item["category"]
    slot = "latte"
    if not item["isDrink"]:
        if any(k in n for k in ("cheesecake", "san sebastian")):
            slot = "cheesecake" if "san sebastian" not in n else "baked-cheesecake"
        elif any(k in n for k in ("croissant", "kruvasan", "pain")):
            slot = "chocolat-croissant" if any(k in n for k in ("cikolata", "chocolat", "choc")) else "croissant"
        elif "muffin" in n:
            slot = "muffin"
        elif any(k in n for k in ("cookie", "kurabiye", "kuki", "levain")):
            slot = "cookie"
        elif any(k in n for k in ("brownie", "mozaik", "sufle", "marlenka", "red velvet", "truf")):
            slot = "brownie"
        elif "tiramisu" in n:
            slot = "tiramisu"
        elif any(k in n for k in ("kek", "cake", "pasta")):
            slot = "carrot-cake" if "havuc" in n else "cake"
        elif any(k in n for k in ("simit", "boyoz", "pogaca", "acma")):
            slot = "simit" if "simit" in n else "boyoz" if "boyoz" in n else "pogaca"
        elif any(k in n for k in ("gofrik", "waffle", "gofret", "madlen")):
            slot = "gofrik"
        elif any(k in n for k in ("sandvic", "sandwich", "baget", "tost", "bun", "gobit", "bagel")):
            slot = "bagel" if "bagel" in n else "panini" if "panini" in n or "ciabatta" in n else "sandwich"
        elif "burger" in n:
            slot = "burger"
        elif any(k in n for k in ("salat", "salad", "parfe", "yulaf")):
            slot = "salad-bowl"
        elif "top" in n or "balls" in n:
            slot = "energy-balls"
        else:
            slot = "sandwich"
    else:
        if any(k in n for k in ("americano", "v60", "filtre", "long black", "freddo", "dibek", "menengic")):
            slot = "iced-americano" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "americano"
        elif any(k in n for k in ("turk", "türk")):
            slot = "turkish"
        elif any(k in n for k in ("cold brew", "cold_brew", "soğuk demleme")):
            slot = "cold-brew"
        elif "cortado" in n or "piccolo" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "cortado"
        elif "cappuccino" in n or "kapuc" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "cappuccino"
        elif "macchiato" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "macchiato"
        elif "latte" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "latte"
        elif "flat white" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else "flat-white"
        elif "espresso" in n:
            slot = "espresso"
        elif "mocha" in n:
            slot = "iced-latte" if any(k in n for k in ("iced", "buzlu", "soguk", "cold")) else ("white-mocha" if "white" in n else "mocha")
        elif any(k in n for k in ("sicak cikolata", "hot chocolate", "milano")):
            slot = "hot-chocolate"
        elif "salep" in n:
            slot = "salep"
        elif any(k in n for k in ("frappe", "esfrappa", "chiller", "milkshake")):
            slot = "frappe"
        elif "matcha" in n:
            slot = "matcha"
        elif "chai" in n:
            slot = "chai"
        elif any(k in n for k in ("iced", "buzlu", "soguk", "cold")):
            slot = "iced-latte"
        elif any(k in n for k in ("smoothie", "freeze", "dragon", "muz", "cilek")):
            slot = "smoothie"
        elif any(k in n for k in ("limonata", "lemonade", "portakal", "orange")):
            slot = "lemonade" if "limon" in n or "lemon" in n else "orange-juice"
        elif any(k in n for k in ("refresha", "cooler", "berry", "hibiscus")):
            slot = "refresher"
        elif any(k in n for k in ("cay", "tea", "papatya", "chamomile")):
            slot = "tea" if "latte" not in n else "chai"
        else:
            slot = "latte"

    if research_product and research_product.get("visualSlot"):
        slot = research_product["visualSlot"]

    official = None
    page = None
    if research_product:
        if research_product.get("imageUrl"):
            official = research_product["imageUrl"]
        if research_product.get("productUrl"):
            page = research_product["productUrl"]
    return {"slot": slot, "officialUrl": official, "pageUrl": page}


def refine_category(name: str, fallback: str, is_drink: bool) -> str:
    """Reclassify from the product name when the researched page placed a
    drink in a misleading section (e.g. iced drinks under hot espresso)."""
    if not is_drink:
        return fallback
    n = norm(name)
    if "cold brew" in n:
        return "cold_brew"
    if "frappuccino" in n or "frappe" in n or "milkshake" in n or "chiller" in n:
        return "frappe_blended"
    if "refresha" in n or "cooler" in n:
        return "smoothie_juice"
    if any(k in n for k in ("hot chocolate", "sican", "salep", "chai")):
        return "tea_herbal"
    if any(k in n for k in ("matcha", "cay", "tea", "papatya", "earl grey", "jasmin", "hibiscus", "earl")):
        return "tea_herbal"
    if any(k in n for k in ("limonata", "lemonade", "portakal", "orange", "suyu", "smoothie", "frozen", "detox")):
        return "smoothie_juice"
    if any(k in n for k in ("latte", "mocha", "macchiato", "cappuccino", "cappucino", "espresso", "americano", "flat white", "cortado", "ristretto", "dolmaca", "misto", "duble")):
        if any(k in n for k in ("iced", "buzlu", "soguk", "cold", "freddo")):
            return "espresso_iced"
        return "espresso_hot"
    return fallback


def main() -> None:
    parser = argparse.ArgumentParser(description="Compile the tracked Kalori Cafe catalog")
    parser.add_argument(
        "--include-scratch",
        action="store_true",
        help="overlay ignored tmp_research inputs for local research work",
    )
    parser.add_argument(
        "--from-research",
        action="store_true",
        help="re-assemble tracked baseline/research inputs for review instead of the approved release snapshot",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="compare rendered output with committed files without writing",
    )
    parser.add_argument(
        "--show-diff",
        action="store_true",
        help="with --check, print a bounded unified diff for drifted files",
    )
    args = parser.parse_args()

    research_mode = args.from_research or args.include_scratch
    if research_mode and not args.check:
        parser.error("research assembly is review-only; add --check and promote an approved release explicitly")
    if args.show_diff and not args.check:
        parser.error("--show-diff requires --check")
    scratch_baseline = os.path.join(TMP, "items_full.json")
    if research_mode:
        baseline_file = scratch_baseline if args.include_scratch and os.path.exists(scratch_baseline) else TRACKED_BASELINE
    else:
        baseline_file = TRACKED_RELEASE
    if not os.path.exists(baseline_file):
        raise FileNotFoundError(f"Tracked catalog baseline missing: {baseline_file}")
    with open(baseline_file, encoding="utf-8") as f:
        baseline_payload = json.load(f)
    if research_mode:
        existing = baseline_payload
    else:
        if baseline_payload.get("schemaVersion") != 1 or not isinstance(baseline_payload.get("items"), list):
            raise ValueError("catalog_release.json must use schemaVersion 1 and contain an items array")
        existing = baseline_payload["items"]

    research = load_research(include_scratch=args.include_scratch) if research_mode else {"chains": []}

    assets = {}
    scratch_assets = os.path.join(TMP, "assets.json")
    assets_file = scratch_assets if args.include_scratch and os.path.exists(scratch_assets) else TRACKED_ASSETS
    if research_mode and os.path.exists(assets_file):
        with open(assets_file, encoding="utf-8") as f:
            assets = json.load(f)
    has_assets = bool(assets)

    research_by_chain = {}
    research_sources = {}
    research_options = {}
    for chain in research.get("chains", []):
        m = {}
        for p in chain.get("products", []):
            if p.get("name"):
                lookup_names = [p["name"], *p.get("aliases", [])]
                for lookup_name in lookup_names:
                    key = norm(lookup_name)
                    prior = m.get(key)
                    if prior is not None and prior is not p:
                        raise ValueError(f"Research alias collision for {chain.get('chainId')}: {lookup_name}")
                    m[key] = p
        research_by_chain[chain.get("chainId")] = m
        research_sources[chain.get("chainId")] = chain.get("sources", [])
        research_options[chain.get("chainId")] = chain

    chain_items = {cid: [] for cid in CHAIN_KEYS}
    for item in existing:
        if item["chainId"] in chain_items:
            chain_items[item["chainId"]].append(item)

    # A tracked snapshot may explicitly reconcile a legacy display name to
    # the current official name while preserving the stable catalog ID.
    for cid, items in chain_items.items():
        if not research_options.get(cid, {}).get("canonicalizeExisting"):
            continue
        rmap = research_by_chain.get(cid, {})
        for item in items:
            product = rmap.get(norm(item["name"]))
            if product:
                item["name"] = product["name"]

    existing_ids = {i["id"] for i in existing}

    # merge research additions (only genuinely new products)
    for chain in research.get("chains", []):
        cid = chain.get("chainId")
        if cid not in CHAIN_KEYS:
            continue
        seen = set(norm(i["name"]) for i in chain_items[cid])
        for p in chain.get("products", []):
            name = (p.get("name") or "").strip()
            lookup_names = [name, *p.get("aliases", [])]
            if not name or any(norm(lookup_name) in seen for lookup_name in lookup_names):
                continue
            if p.get("exclude", False):
                continue
            category = canonical_category(name, p.get("category") or "")
            product_kind = canonical_product_kind(name, category, p)
            is_drink = product_kind == "drink"
            category = refine_category(name, category, is_drink)
            macros = product_macros(p, name, category, is_drink)
            allergens = product_allergens(p, name, category, is_drink)
            allergen_metadata = product_allergen_metadata(p, allergens)
            tags = list(p.get("dietaryTags") or estimate_tags(name, macros, allergens, is_drink))
            inferred_milk = (
                "whole_milk"
                if is_drink
                and not any(
                    k in norm(name)
                    for k in ("americano", "cay", "tea", "limonata", "portakal", "sade", "espresso", "filtre", "cold brew", "turk", "cold_brew", "v60", "freddo", "dibek", "menengic", "refresha", "cooler", "smoothie", "freeze", "dragon")
                )
                else None
            )
            item = {
                "id": f"{cid}_{slugify(name)}",
                "chainId": cid,
                "name": name,
                "nameEn": p.get("nameEn"),
                "category": category,
                "productKind": product_kind,
                "description": p.get("description") or default_description(name, category, is_drink),
                "image": "",
                "isDrink": is_drink,
                "defaultSizeId": p.get("defaultSizeId", "grande" if cid == "starbucks" else ("tall" if is_drink else None)),
                "defaultMilkId": p.get("defaultMilkId", inferred_milk),
                "defaultSyrupPumps": p.get("defaultSyrupPumps"),
                "baseMacros": macros,
                "allergens": allergens,
                **allergen_metadata,
                "dietaryTags": tags,
                "glycemicImpact": glycemic(macros["sugar"], macros["carbs"]),
                "availability": "seasonal" if p.get("seasonal") else "current",
            }
            chain_items[cid].append(item)
            seen.add(norm(name))

    # provenance + image manifest
    manifest_products = []
    for cid, items in chain_items.items():
        rmap = research_by_chain.get(cid, {})
        for item in items:
            if not research_mode:
                expected_kind = canonical_product_kind(item["name"], item["category"], item)
                if item.get("isDrink") != (expected_kind == "drink"):
                    raise ValueError(f"productKind/isDrink conflict in release snapshot: {item['id']}")
                if expected_kind == "food" and any(
                    key in item for key in ("defaultSizeId", "defaultMilkId", "defaultSyrupPumps", "baseCustomization")
                ):
                    raise ValueError(f"Food item carries drink customization in release snapshot: {item['id']}")
                sl = slot_of(item, None)
                manifest_products.append({
                    "id": item["id"],
                    "chain": cid,
                    "slug": slugify(item["name"]),
                    "slot": sl["slot"],
                    "officialUrl": sl["officialUrl"],
                    "pageUrl": sl["pageUrl"],
                })
                continue
            research_product = rmap.get(norm(item["name"]))
            if research_product and research_options.get(cid, {}).get("refreshExisting"):
                refresh_item_from_research(item, research_product)
                research_product = rmap.get(norm(item["name"]), research_product)
            normalize_catalog_item(item, research_product)
            sl = slot_of(item, research_product)
            manifest_products.append({
                "id": item["id"],
                "chain": cid,
                "slug": slugify(item["name"]),
                "slot": sl["slot"],
                "officialUrl": sl["officialUrl"],
                "pageUrl": sl["pageUrl"],
            })
            item["catalogSource"] = catalog_source(cid, research_product, research_sources.get(cid))
            item["nutritionSource"] = product_nutrition_source(
                research_product,
                item["id"] not in existing_ids,
            )
            item.setdefault("availability", "current")
            if has_assets and item["id"] in assets:
                a = assets[item["id"]]
                if a.get("file"):
                    item["image"] = a["file"]
                    item["imageSource"] = {
                        "url": a.get("sourceUrl") or a.get("pageUrl") or "",
                        "kind": "official" if a.get("kind") == "official" else "licensed_fallback",
                        "exactProduct": bool(a.get("exactProduct")),
                    }
            if not item.get("imageSource"):
                item["imageSource"] = {"url": "", "kind": "licensed_fallback", "exactProduct": False}

    # emit per-chain modules + merged items.ts
    rendered_outputs = {}
    merged = ["import type { MenuItem } from '../types/cafe';", ""]
    for cid, (fname, export_name) in CHAIN_KEYS.items():
        lines = [
                    "import type { MenuItem } from '../../types/cafe';",
                    "",
                    f"export const {export_name}: MenuItem[] = [",
                ]
        for item in chain_items[cid]:
            lines.append(ts_item(item))
        lines.append("];")
        lines.append("")
        rendered_outputs[os.path.join(OUT, f"{fname}.ts")] = "\n".join(lines)
        merged.append(f"import {{ {export_name} }} from './catalog/{fname}.ts';")
        merged.append("")
    merged.append("export const MENU_ITEMS: MenuItem[] = [")
    for _, export_name in CHAIN_KEYS.values():
        merged.append(f"  ...{export_name},")
    merged.append("];")
    merged.append("")
    rendered_outputs[os.path.join(ROOT, "src", "data", "items.ts")] = "\n".join(merged)

    if args.check:
        mismatches = []
        for output_path, rendered in rendered_outputs.items():
            if not os.path.exists(output_path):
                mismatches.append(f"missing {os.path.relpath(output_path, ROOT)}")
                continue
            with open(output_path, encoding="utf-8", newline="") as f:
                committed = f.read()
            if committed != rendered:
                mismatches.append(os.path.relpath(output_path, ROOT))
                if args.show_diff:
                    diff = difflib.unified_diff(
                        committed.splitlines(),
                        rendered.splitlines(),
                        fromfile="committed",
                        tofile="tracked-source build",
                        lineterm="",
                    )
                    print("\n".join(list(diff)[:80]))
        if mismatches:
            raise SystemExit("Tracked-source catalog drift: " + ", ".join(mismatches))
        print(f"Tracked-source check passed: {len(rendered_outputs)} generated files are byte-equivalent")
    else:
        os.makedirs(OUT, exist_ok=True)
        for output_path, rendered in rendered_outputs.items():
            with open(output_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(rendered)
        os.makedirs(TMP, exist_ok=True)
        with open(os.path.join(TMP, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump({"products": manifest_products}, f, ensure_ascii=False, indent=1)

    total = sum(len(v) for v in chain_items.values())
    print(f"Compiled catalog: {total} products across {len(CHAIN_KEYS)} chains")
    for cid in CHAIN_KEYS:
        print(f"  {cid}: {len(chain_items[cid])}")


if __name__ == "__main__":
    main()
