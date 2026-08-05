import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allSrcFiles = getAllFiles(srcDir);
console.log(`Scanning ${allSrcFiles.length} files in src/...`);

const suspiciousTerms = [
  'process.env.TEST',
  'process.env.NODE_ENV === \'test\'',
  'window.__MOCK__',
  '__MOCK__',
  'isTesting',
  'mockData',
  'dummyData',
  'fakeData',
  'hardcoded',
  'bypass'
];

let flagsCount = 0;

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(process.cwd(), file);

  // Check for suspicious terms
  suspiciousTerms.forEach(term => {
    if (content.includes(term)) {
      console.warn(`[FLAG] File ${relPath} contains suspicious term: "${term}"`);
      flagsCount++;
    }
  });

  // Check for empty/stub components (less than 10 lines excluding data/assets)
  if (!relPath.includes('assets') && !relPath.includes('types') && content.split('\n').length < 10) {
    console.warn(`[FLAG] File ${relPath} is suspiciously short (<10 lines)`);
    flagsCount++;
  }
});

console.log(`Scan completed. Total integrity flags raised: ${flagsCount}`);
