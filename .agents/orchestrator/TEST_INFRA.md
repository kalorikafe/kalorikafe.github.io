# E2E Test Infra: Kalori Cafe

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Light Mode Navbar Redesign | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Light Mode Hero Redesign | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Popular Turkish Coffee Chains List | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | >=40 Items Per Chain Dataset | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 5 | Build & Lint Execution | ORIGINAL_REQUEST Acceptance | 5 | 5 | ✓ |

## Test Architecture
- Test runner: automated execution script (`node` / `vitest` / custom script) executing build, lint, data integrity, and UI validation tests.
- Minimum threshold:
  - Tier 1 (Feature Coverage): >=25 test cases
  - Tier 2 (Boundary & Corner Cases): >=25 test cases
  - Tier 3 (Cross-Feature Combinations): >=10 test cases
  - Tier 4 (Real-World Application Scenarios): >=5 test cases
  - Total minimum: >=65 test cases
