import { MENU_ITEMS } from '../src/data/items.ts';
import { CHAINS } from '../src/data/chains.ts';

const chainNames = CHAINS.map(c => ({ id: c.id, name: c.name.toLowerCase(), tokens: c.name.toLowerCase().split(/\s+/) }));

const issues = [];

for (const item of MENU_ITEMS) {
  const url = (item.imageSource?.url || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();

  for (const otherChain of chainNames) {
    if (otherChain.id === item.chainId) continue;
    
    // Check if other chain's explicit brand name is in the url or desc
    if (otherChain.id === 'starbucks' && (url.includes('starbucks') || desc.includes('starbucks'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'caffe_nero' && (url.includes('caffenero') || desc.includes('caffè nero') || desc.includes('caffe nero'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'kahve_dunyasi' && (url.includes('kahvedunyasi') || desc.includes('kahve dünyası') || desc.includes('kahve dunyasi'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'espressolab' && (url.includes('espressolab') || desc.includes('espressolab'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'tchibo' && (url.includes('tchibo') || desc.includes('tchibo'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'gloria_jeans' && (url.includes('gloriajeans') || desc.includes("gloria jean's") || desc.includes('gloria jeans'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'mackbear' && (url.includes('mackbear') || desc.includes('mackbear'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'arabica' && (url.includes('arabicacoffee') || desc.includes('arabica coffee house'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
    if (otherChain.id === 'david_people' && (url.includes('davidpeople') || desc.includes('david people'))) {
      issues.push({ id: item.id, chain: item.chainId, other: otherChain.id, name: item.name, url, desc });
    }
  }
}

console.log('Cross chain checks finished. Total cross issues:', issues.length);
if (issues.length > 0) {
  console.log(JSON.stringify(issues, null, 2));
}
