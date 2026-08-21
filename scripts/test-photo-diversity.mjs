const URLS_TO_TEST = [
  // Sandwiches & Savory
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
  'https://images.unsplash.com/photo-1509722747041-616f39b57569',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  'https://images.unsplash.com/photo-1550547660-d9450f859349',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff',
  // Coffees & Teas
  'https://images.unsplash.com/photo-1541167760496-1628856ab772',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
  'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
  'https://images.unsplash.com/photo-1610889556528-9a770e32642f',
  'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
  'https://images.unsplash.com/photo-1597481499750-3e6b22637e12',
  'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed',
  // Refreshers & Smoothies
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
  'https://images.unsplash.com/photo-1536935338788-846bb9981813',
  'https://images.unsplash.com/photo-1556881286-fc6915169721',
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
  'https://images.unsplash.com/photo-1546173159-315724a31696',
  'https://images.unsplash.com/photo-1613478223719-2ab802602423',
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
  'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
  'https://images.unsplash.com/photo-1610970881699-44a5587cabec',
  // Bakery
  'https://images.unsplash.com/photo-1533134242443-d4fd215305ad',
  'https://images.unsplash.com/photo-1524351199678-941a58a3df50',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
  'https://images.unsplash.com/photo-1557958114-3d2440207108',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
  'https://images.unsplash.com/photo-1623334044303-241021148842',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
  'https://images.unsplash.com/photo-1621303837174-89787a7d4729',
  'https://images.unsplash.com/photo-1511381939415-e44015466834',
];

async function verifyAll() {
  const verified = [];
  for (const url of URLS_TO_TEST) {
    try {
      const res = await fetch(`${url}?w=400&auto=format&fit=crop&q=80`, {
        method: 'HEAD',
        headers: { 'User-Agent': 'KaloriCafe/1.0' },
      });
      if (res.status === 200) verified.push(url);
      else console.log('Failed:', url, res.status);
    } catch (e) {
      console.log('Error:', url, e.message);
    }
  }
  console.log(`Verified ${verified.length}/${URLS_TO_TEST.length} URLs!`);
}
verifyAll();
