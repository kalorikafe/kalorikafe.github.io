const fs = require('fs');
const path = require('path');

// We'll read items.ts and parse the objects using a simple evaluation or regex parsing.
const itemsFile = fs.readFileSync(path.join(__dirname, '../../src/data/items.ts'), 'utf8');

// Let's extract items using regex or ts execution if possible, or simple regex parsing
const itemBlocks = itemsFile.split(/\n\s*\{\s*\n\s*id:\s*'/);
console.log(`Found ${itemBlocks.length - 1} item blocks via regex split.`);

// Let's parse each item block
const items = [];
const categories = new Set();
const chainItemCounts = {};
const chainIsDrinkCounts = {};
const categoryCounts = {};
const macroKeysCount = {};
const allergenCounts = {};
const dietaryTagCounts = {};

itemBlocks.slice(1).forEach(block => {
  const fullBlock = "{ id: '" + block;
  
  const idMatch = fullBlock.match(/id:\s*['"]([^'"]+)['"]/);
  const chainIdMatch = fullBlock.match(/chainId:\s*['"]([^'"]+)['"]/);
  const nameMatch = fullBlock.match(/name:\s*['"]([^'"]+)['"]/);
  const categoryMatch = fullBlock.match(/category:\s*['"]([^'"]+)['"]/);
  const isDrinkMatch = fullBlock.match(/isDrink:\s*(true|false)/);
  const defaultSizeIdMatch = fullBlock.match(/defaultSizeId:\s*['"]([^'"]+)['"]/);
  const defaultMilkIdMatch = fullBlock.match(/defaultMilkId:\s*['"]([^'"]+)['"]/);

  if (chainIdMatch && categoryMatch) {
    const chainId = chainIdMatch[1];
    const category = categoryMatch[1];
    const isDrink = isDrinkMatch ? isDrinkMatch[1] === 'true' : true;

    categories.add(category);
    chainItemCounts[chainId] = (chainItemCounts[chainId] || 0) + 1;
    
    if (!chainIsDrinkCounts[chainId]) chainIsDrinkCounts[chainId] = { drinks: 0, food: 0 };
    if (isDrink) chainIsDrinkCounts[chainId].drinks++;
    else chainIsDrinkCounts[chainId].food++;

    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }
});

console.log("\n=== CATEGORIES ===");
console.log(Array.from(categories));

console.log("\n=== CATEGORY COUNTS ===");
console.log(JSON.stringify(categoryCounts, null, 2));

console.log("\n=== CHAIN ITEM BREAKDOWN (Drinks vs Food) ===");
console.log(JSON.stringify(chainIsDrinkCounts, null, 2));
