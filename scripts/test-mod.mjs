import sharp from 'sharp';

async function testModulation() {
  const buf = await fetch('https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=640&auto=format&fit=crop&q=80')
    .then(r => r.arrayBuffer())
    .then(b => Buffer.from(b));

  const out1 = await sharp(buf).modulate({ brightness: 1.0001 }).webp({ quality: 78 }).toBuffer();
  const out2 = await sharp(buf).modulate({ brightness: 1.0005 }).webp({ quality: 78 }).toBuffer();

  console.log('Out 1 length:', out1.length);
  console.log('Out 2 length:', out2.length);
  console.log('Equal?', out1.equals(out2));
}

testModulation();
