
import { CHAINS } from '../../src/data/chains';
import { MENU_ITEMS } from '../../src/data/items';

console.log('=== DETAILED DATASET ANALYSIS ===');

// Check 1: Chain IDs
const targetChains = [
  'starbucks', 'espressolab', 'kahve_dunyasi', 'caffe_nero', 'coffy',
  'mackbear', 'arabica', 'gloria_jeans', 'david_people', 'tchibo'
];

const chainIds = CHAINS.map(c => c.id);
console.log('Chain IDs count:', chainIds.length);
const missingChains = targetChains.filter(id => !chainIds.includes(id));
console.log('Missing target chains:', missingChains);

// Check 2: Total Items and Per Chain
console.log('\nTotal MENU_ITEMS:', MENU_ITEMS.length);
const perChainCounts = {};
targetChains.forEach(id => {
  perChainCounts[id] = MENU_ITEMS.filter(item => item.chainId === id).length;
});
console.log('Per chain counts:', perChainCounts);

// Check 3: Macro Completeness & Invariants
let macroDefects = 0;
const macroKeys = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'caffeine', 'sodium'];
const defectiveItems = [];

MENU_ITEMS.forEach((item, index) => {
  const m = item.baseMacros;
  if (!m) {
    macroDefects++;
    defectiveItems.push({ id: item.id, reason: 'missing baseMacros' });
    return;
  }
  
  macroKeys.forEach(k => {
    if (typeof m[k] !== 'number' || isNaN(m[k]) || m[k] < 0) {
      macroDefects++;
      defectiveItems.push({ id: item.id, field: k, val: m[k] });
    }
  });
});

console.log('\nMacro Defects Count:', macroDefects);
if (defectiveItems.length > 0) {
  console.log('First 5 defective items:', defectiveItems.slice(0, 5));
}

// Check 4: ID Uniqueness
const idSet = new Set();
const duplicateIds = [];
MENU_ITEMS.forEach(item => {
  if (idSet.has(item.id)) {
    duplicateIds.push(item.id);
  }
  idSet.add(item.id);
});
console.log('\nDuplicate IDs:', duplicateIds);

// Check 5: Description & Name Analysis (Template Clones check)
const descSet = new Set();
const duplicateDescs = [];
const shortDescs = [];

MENU_ITEMS.forEach(item => {
  if (!item.description || item.description.length < 10) {
    shortDescs.push({ id: item.id, desc: item.description });
  }
  if (descSet.has(item.description)) {
    duplicateDescs.push({ id: item.id, desc: item.description });
  }
  descSet.add(item.description);
});

console.log('\nUnique Descriptions:', descSet.size, '/', MENU_ITEMS.length);
console.log('Duplicate Descriptions Count:', duplicateDescs.length);
if (duplicateDescs.length > 0) {
  console.log('Sample duplicates:', duplicateDescs.slice(0, 5));
}
console.log('Short Descriptions (<10 chars):', shortDescs.length);

// Check 6: Food vs Drink ratio per chain
console.log('\nFood vs Drink per Chain:');
targetChains.forEach(id => {
  const items = MENU_ITEMS.filter(i => i.chainId === id);
  const drinks = items.filter(i => i.isDrink).length;
  const food = items.filter(i => !i.isDrink).length;
  console.log(`  ${id}: ${drinks} drinks, ${food} food (total ${items.length})`);
});

// Check 7: Specific search keywords
const narenciyeItems = MENU_ITEMS.filter(i => i.description.toLowerCase().includes('narenciye'));
console.log('\nItems with keyword "narenciye":', narenciyeItems.length);
narenciyeItems.forEach(i => console.log(`  - ${i.name} (${i.chainId}): ${i.description}`));

// Check 8: Check for generic template strings like "Item 1", "Placeholder", "Menu Item", "Lorem"
const genericRegex = /placeholder|lorem|item \d+|test item|sample item/i;
const genericItems = MENU_ITEMS.filter(i => genericRegex.test(i.name) || genericRegex.test(i.description));
console.log('\nGeneric/Placeholder Items Count:', genericItems.length);
