# Decimal Phase Calculation

Calculate the next decimal phase number for urgent insertions.

## Using gsd-tools

```bash
# Get next decimal phase after phase 6
node "/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/.cursor/get-shit-done/bin/gsd-tools.cjs" phase next-decimal 6
```

Output:
```json
{
  "found": true,
  "base_phase": "06",
  "next": "06.1",
  "existing": []
}
```

With existing decimals:
```json
{
  "found": true,
  "base_phase": "06",
  "next": "06.3",
  "existing": ["06.1", "06.2"]
}
```

## Extract Values

```bash
DECIMAL_PHASE=$(node "/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/.cursor/get-shit-done/bin/gsd-tools.cjs" phase next-decimal "${AFTER_PHASE}" --pick next)
BASE_PHASE=$(node "/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/.cursor/get-shit-done/bin/gsd-tools.cjs" phase next-decimal "${AFTER_PHASE}" --pick base_phase)
```

Or with --raw flag:
```bash
DECIMAL_PHASE=$(node "/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/.cursor/get-shit-done/bin/gsd-tools.cjs" phase next-decimal "${AFTER_PHASE}" --raw)
# Returns just: 06.1
```

## Examples

| Existing Phases | Next Phase |
|-----------------|------------|
| 06 only | 06.1 |
| 06, 06.1 | 06.2 |
| 06, 06.1, 06.2 | 06.3 |
| 06, 06.1, 06.3 (gap) | 06.4 |

## Directory Naming

Decimal phase directories use the full decimal number:

```bash
SLUG=$(node "/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/.cursor/get-shit-done/bin/gsd-tools.cjs" generate-slug "$DESCRIPTION" --raw)
PHASE_DIR=".planning/phases/${DECIMAL_PHASE}-${SLUG}"
mkdir -p "$PHASE_DIR"
```

Example: `.planning/phases/06.1-fix-critical-auth-bug/`
