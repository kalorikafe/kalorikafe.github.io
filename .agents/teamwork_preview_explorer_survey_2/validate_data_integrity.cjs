const fs = require('fs');
const path = require('path');

const itemsFile = fs.readFileSync(path.join(__dirname, '../../src/data/items.ts'), 'utf8');

// Check duplicate IDs
const idMatches = [...itemsFile.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const uniqueIds = new Set(idMatches);
console.log(`Total ID matches: ${idMatches.length}, Unique IDs: ${uniqueIds.size}`);

if (idMatches.length !== uniqueIds.size) {
  console.error("WARNING: Duplicate IDs found!");
} else {
  console.log("SUCCESS: No duplicate item IDs.");
}

// Check size IDs used vs defined in modifiers
const modifiersFile = fs.readFileSync(path.join(__dirname, '../../src/data/modifiers.ts'), 'utf8');
const sizeIds = [...modifiersFile.matchAll(/id:\s*['"](short|tall|grande|venti)['"]/g)].map(m => m[1]);
const milkIds = [...modifiersFile.matchAll(/id:\s*['"](whole_milk|skim_milk|lactose_free_milk|oat_milk|almond_milk|soy_milk|coconut_milk)['"]/g)].map(m => m[1]);

console.log("Defined Size IDs:", sizeIds);
console.log("Defined Milk IDs:", milkIds);

const itemDefaultSizes = [...itemsFile.matchAll(/defaultSizeId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const invalidSizes = itemDefaultSizes.filter(s => !sizeIds.includes(s));
console.log(`Invalid defaultSizeIds: ${invalidSizes.length}`);

const itemDefaultMilks = [...itemsFile.matchAll(/defaultMilkId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const invalidMilks = itemDefaultMilks.filter(m => !milkIds.includes(m));
console.log(`Invalid defaultMilkIds: ${invalidMilks.length}`);
