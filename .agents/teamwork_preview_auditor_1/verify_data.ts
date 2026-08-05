import { CHAINS } from '../../src/data/chains';
import { MENU_ITEMS } from '../../src/data/items';

console.log('Total chains:', CHAINS.length);
console.log('Total items:', MENU_ITEMS.length);

const itemIds = new Set<string>();
const duplicateIds: string[] = [];

MENU_ITEMS.forEach(item => {
  if (itemIds.has(item.id)) {
    duplicateIds.push(item.id);
  } else {
    itemIds.add(item.id);
  }
});

console.log('Duplicate IDs count:', duplicateIds.length);

// Check uniqueness of item names per chain
const namesPerChain: Record<string, Set<string>> = {};
let duplicateNamesCount = 0;

MENU_ITEMS.forEach(item => {
  if (!namesPerChain[item.chainId]) {
    namesPerChain[item.chainId] = new Set();
  }
  if (namesPerChain[item.chainId].has(item.name)) {
    console.error(`Duplicate name in chain ${item.chainId}: ${item.name}`);
    duplicateNamesCount++;
  } else {
    namesPerChain[item.chainId].add(item.name);
  }
});

console.log('Duplicate item names within chain count:', duplicateNamesCount);

// Check macro distributions and variety
const caloriesList = MENU_ITEMS.map(i => i.baseMacros.calories);
const minCal = Math.min(...caloriesList);
const maxCal = Math.max(...caloriesList);
const avgCal = caloriesList.reduce((a, b) => a + b, 0) / caloriesList.length;

console.log(`Calorie stats -> Min: ${minCal}, Max: ${maxCal}, Avg: ${avgCal.toFixed(1)}`);

// Check description keywords check requirement (e.g. narenciye)
const narenciyeItems = MENU_ITEMS.filter(i => i.description && i.description.toLowerCase().includes('narenciye'));
console.log(`Items with 'narenciye' in description: ${narenciyeItems.length}`);

if (duplicateIds.length === 0 && duplicateNamesCount === 0 && minCal >= 0 && maxCal > 100) {
  console.log('ADVANCED DATA INTEGRITY AUDIT PASSED!');
} else {
  console.error('ADVANCED DATA INTEGRITY AUDIT FAILED!');
  process.exit(1);
}
