#!/usr/bin/env python3
"""Merge the Espressolab official API product list into research.json.

Product names come from tmp_research/espressolab_api_products.json, which is
an exact extraction of the live official menu API
  https://espressolab.com/api/get-menu-products-by-category?categoryId={catId}&locale=tr
(HTTP 200, checked 2026-08-05). This script:
 - replaces the espressolab chain entry in research.json,
 - skips products already present in the current catalog (by normalized
   name, including the "Lab " prefix variant) so no in-chain duplicates,
   size variants or double entries are introduced.
"""
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = os.path.join(ROOT, "tmp_research")
CHECKED_AT = "2026-08-05"


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ı", "i")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def main():
    research_file = os.path.join(TMP, "research.json")
    research = json.load(open(research_file, encoding="utf-8"))

    with open(os.path.join(TMP, "espressolab_api_products.json"), encoding="utf-8") as f:
        api_products = json.load(f)

    existing = json.load(open(os.path.join(TMP, "items_full.json"), encoding="utf-8"))
    es_existing = set()
    for item in existing:
        if item.get("chainId") == "espressolab":
            n = norm(item["name"])
            es_existing.add(n)
            es_existing.add(n.replace("lab ", "").strip())
            es_existing.add(n.replace("lab ", ""))

    products = []
    seen = set()
    for p in api_products:
        name = (p.get("name") or "").strip()
        n = norm(name)
        if not name or n in seen:
            continue
        seen.add(n)
        # skip products that duplicate existing catalog entries
        if n in es_existing or n.replace("lab ", "").strip() in es_existing:
            continue
        # skip near-duplicate names (e.g. API "V60" vs catalog "V60 Demleme Kahve")
        if len(n) >= 3 and any(
            len(e) >= 3 and (e.startswith(n) or n.startswith(e)) for e in es_existing
        ):
            continue
        products.append({
            "name": name,
            "nameEn": None,
            "category": p["category"],
            "imageUrl": "",
            "productUrl": "https://espressolab.com/kurumsal/menu",
            "isDrink": p["isDrink"],
            "seasonal": bool(p.get("seasonal")),
        })

    new_chains = [c for c in research["chains"] if c["chainId"] != "espressolab"]
    new_chains.append({
        "chainId": "espressolab",
        "sources": [
            {"url": "https://espressolab.com/kurumsal/menu", "status": 200, "checkedAt": CHECKED_AT},
            {"url": "https://espressolab.com/api/get-menu-products-by-category?categoryId={catId}&locale=tr", "status": 200, "checkedAt": CHECKED_AT},
        ],
        "products": products,
    })
    research["chains"] = new_chains
    with open(research_file, "w", encoding="utf-8") as f:
        json.dump(research, f, ensure_ascii=False, indent=1)
    print("espressolab new products:", len(products))
    for p in products[:15]:
        print("  ", p["name"], "|", p["category"])


if __name__ == "__main__":
    main()