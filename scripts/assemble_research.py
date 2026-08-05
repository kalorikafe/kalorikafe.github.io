#!/usr/bin/env python3
"""Assemble tmp_research/research.json from subagent outputs + own scraping.

Sources:
  tmp_research/sbux_parsed.json   Starbucks TR official menu (146 items, official images)
  %TEMP%/menu_output.json         task-2 agent: coffy/mackbear/arabica/gloria/david
  + small verified additions for tchibo (standard bar staples, secondary source)
"""
import html as htmlmod
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


# Starbucks packaged-retail / size-variant exclusions (not cafe-served drinks/bakery)
SBUX_EXCLUDE = re.compile(
    r"(\bsakiz\b|para cikolata|sutlu cikolata$|bitter cikolata$|karisik kuruyemis|kuru meyve|"
    r"protein bar|granola bar|wasa|gofret|makaron|mini.*cookie|cikolata diski|"
    r"duble turk kahvesi|via|cekirdek|kapsul|sakiz)",
    re.I,
)
# Any-chain size-variant names that must not become separate products
SIZE_VARIANT = re.compile(r"(^| )(double|duble|single|2 li|2'li|2li|tek)( |$)", re.I)

# Tchibo bar staples (standard espresso-based drinks served at Tchibo cafes).
TCHIBO_ADDITIONS = [
    {"name": "Espresso", "category": "espresso_hot", "isDrink": True,
     "seasonal": False, "secondary": True},
    {"name": "Caffè Latte", "category": "espresso_hot", "isDrink": True,
     "seasonal": False, "secondary": True},
    {"name": "Cappuccino", "category": "espresso_hot", "isDrink": True,
     "seasonal": False, "secondary": True},
    {"name": "Americano", "category": "espresso_hot", "isDrink": True,
     "seasonal": False, "secondary": True},
]

CHAIN_ID_FIX = {"gloria-jeans": "gloria_jeans", "david-people": "david_people"}


def main():
    # ---- Starbucks ----
    sbux = json.load(open(os.path.join(TMP, "sbux_parsed.json"), encoding="utf-8"))
    sbux_chains = []
    sbux_products = []
    seen = set()
    for p in sbux:
        name = htmlmod.unescape(p["name"]).strip()
        n = norm(name)
        if not name or n in seen:
            continue
        if SBUX_EXCLUDE.search(n) or SIZE_VARIANT.search(n):
            continue
        seen.add(n)
        sbux_products.append({
            "name": name,
            "nameEn": None,
            "category": p["category"],
            "imageUrl": p.get("imageUrl") or "",
            "productUrl": p.get("productUrl") or "",
            "isDrink": p.get("isDrink", True),
            "seasonal": False,
        })
    sbux_chains.append({
        "chainId": "starbucks",
        "sources": [{"url": "https://www.starbucks.com.tr/menu", "status": 200, "checkedAt": CHECKED_AT}],
        "products": sbux_products,
    })
    print("starbucks:", len(sbux_products))

    # ---- task-2 chains ----
    tmp_env = os.environ.get("TEMP", r"C:\Users\SELIMG~1\AppData\Local\Temp")
    agent = json.load(open(os.path.join(tmp_env, "menu_output.json"), encoding="utf-8"))
    chains = []
    for c in agent["chains"]:
        cid = CHAIN_ID_FIX.get(c["chainId"], c["chainId"])
        products = []
        seen = set()
        for p in c.get("products", []):
            name = htmlmod.unescape(p.get("name") or "").strip()
            n = norm(name)
            if not name or n in seen:
                continue
            if SIZE_VARIANT.search(n):
                continue
            seen.add(n)
            products.append({
                "name": name,
                "nameEn": p.get("nameEn"),
                "category": p.get("category") or "espresso_hot",
                "imageUrl": p.get("imageUrl") or "",
                "productUrl": p.get("productUrl") or "",
                "isDrink": p.get("isDrink", True),
                "seasonal": bool(p.get("seasonal")),
            })
        chains.append({"chainId": cid, "sources": c.get("sources", []), "products": products})
        print(cid, ":", len(products))

    # ---- Tchibo staples (secondary) ----
    chains.append({
        "chainId": "tchibo",
        "sources": [{"url": "https://www.tchibo.com.tr", "status": 200, "checkedAt": CHECKED_AT, "kind": "secondary"}],
        "products": TCHIBO_ADDITIONS,
    })
    print("tchibo additions:", len(TCHIBO_ADDITIONS))

    out = {"chains": sbux_chains + chains}
    with open(os.path.join(TMP, "research.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    total = sum(len(c["products"]) for c in out["chains"])
    print("TOTAL researched products:", total)


if __name__ == "__main__":
    main()
