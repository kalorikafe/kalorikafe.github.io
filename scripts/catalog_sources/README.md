# Catalog source contract

This directory is the tracked, clean-clone input boundary for the static menu
catalog. Raw HTML, browser caches and exploratory files stay outside Git.

## Normalized snapshots

| File | Rows | Purpose | SHA-256 |
| --- | ---: | --- | --- |
| `catalog_release.json` | 1006 | Approved normalized `MenuItem` release used by `catalog:build` | `1D36BD5B80A469BFFBD7E84C52B10A90B3E729407152826F8A15328105065FC4` |
| `catalog_baseline.json` | 199 | Exact normalized legacy baseline captured from `tmp_research/items_full.json` | `97D8542DA64FF7D13479256478E79182E19911E3F0B859631AA543211AD73545` |
| `catalog_research.json` | 694 | Exact normalized multi-chain research captured from `tmp_research/research.json` | `DCA46FA19CCBA17C83421999EDA18774F4B99268EBD91952186BD87196614EAD` |
| `catalog_assets.json` | 1006 | Approved local image/provenance map, including labelled Coffy fallback derivatives | `3679BD7C3566E5E09BE3B336D73230707CB74AF7216651266D77A4498EDD101B` |
| `coffy_observations.json` | 78 | Controlled five-branch, three-city Coffy menu snapshot | `FB5F42969607447855644AD0F2E4B78517CBDE928E9E94D5141A192E197FD9A7` |
| `coffy_catalog_publication.json` | 56 + 22 | Approved Coffy additions and stable-ID reconciliations | `1E647160F5E6C1B9D07FF5E1FD813A26B31FB8BAA109F963A05D31B0285D3EF8` |

Chain-specific JSON files are normalized research inputs. The release snapshot
is deliberately separate: a fetch or heuristic change cannot silently rewrite
the public catalog.

## Commands

- `npm run catalog:build` renders the approved release snapshot.
- `npm run catalog:check` renders in memory and requires all 11 generated
  TypeScript files to be byte-equivalent. It does not read `tmp_research`.
- `node scripts/publish-coffy-catalog.mjs` idempotently promotes the reviewed
  Coffy snapshot (22 reconciliations, 56 additions, 8 retained unseen rows).
  Run `npm run images:optimize` after a first promotion to label new licensed
  fallback derivatives, then require `npm run images:audit` to pass.
- `python -B scripts/compile_catalog.py --from-research --check` exposes drift
  from tracked research/inference for review; it is not a promotion command.
- `npm run catalog:fetch:caffe-nero -- --checked-at YYYY-MM-DD` writes an
  ignored candidate and semantic report under `tmp/catalog_drift/`. It never
  overwrites `caffe_nero.json`.
- `npm run test:scripts` verifies duplicate detection, the greater-than
  20% sudden-drop guard, and lifecycle handling.

## Review and lifecycle policy

Fetched products start as `current` (or `seasonal` when the source says so).
A baseline product missing once is retained as `unknown`; after two consecutive
misses it is retained as `retired`. No step deletes a row automatically.
Duplicate identities and a unique-product drop greater than 20% are blocking
drift conditions. The report contains the proposed retained rows and the next
miss state, but promotion remains an explicit human-reviewed change.

The Coffy promotion follows the same non-deletion rule. Its secondary product
surface is brand-directed: Coffy's official homepage points ordering customers
to Yemeksepeti, while five branch pages provide the item observations. No
product is presented as officially sourced, no official nutrition is claimed,
and an empty estimated allergen list is recorded as unavailable rather than
safe.
