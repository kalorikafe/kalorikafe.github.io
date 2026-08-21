const baseUrl = process.env.DEPLOY_URL;
const expectedSha = process.env.EXPECTED_SHA;
const expectedCatalogCount = Number(process.env.EXPECTED_CATALOG_COUNT);
const sampleImage = process.env.SMOKE_IMAGE_PATH;
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 30);
const delayMs = Number(process.env.SMOKE_DELAY_MS ?? 10_000);

if (!baseUrl || !expectedSha || !Number.isInteger(expectedCatalogCount) || expectedCatalogCount <= 0 || !sampleImage) {
  throw new Error('Post-deploy smoke requires DEPLOY_URL, EXPECTED_SHA, EXPECTED_CATALOG_COUNT and SMOKE_IMAGE_PATH');
}
if (!Number.isInteger(attempts) || attempts <= 0 || !Number.isFinite(delayMs) || delayMs < 0 || delayMs > 60_000) {
  throw new Error('SMOKE_ATTEMPTS must be positive and SMOKE_DELAY_MS must be between 0 and 60000');
}

const siteRoot = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const withCacheBust = (path, attempt) => {
  const url = new URL(path.replace(/^\//, ''), siteRoot);
  url.searchParams.set('verify', `${expectedSha}-${attempt}-${Date.now()}`);
  return url;
};

const fetchChecked = async (url, expectedType) => {
  const response = await fetch(url, {
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${url.pathname} returned HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes(expectedType)) {
    throw new Error(`${url.pathname} returned ${contentType || 'no content-type'}, expected ${expectedType}`);
  }
  return response;
};

let lastError;
let passed = false;
for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    const buildResponse = await fetchChecked(withCacheBust('build-info.json', attempt), 'application/json');
    const buildInfo = await buildResponse.json();
    if (buildInfo.sha !== expectedSha) throw new Error(`live SHA ${buildInfo.sha} does not match ${expectedSha}`);
    if (buildInfo.catalogCount !== expectedCatalogCount) {
      throw new Error(`live catalog count ${buildInfo.catalogCount} does not match ${expectedCatalogCount}`);
    }

    const imageResponse = await fetchChecked(withCacheBust(sampleImage, attempt), 'image/webp');
    const image = Buffer.from(await imageResponse.arrayBuffer());
    if (image.byteLength === 0 || image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error(`sample image ${sampleImage} is empty or not a decodable WebP container`);
    }

    const rootResponse = await fetchChecked(withCacheBust('', attempt), 'text/html');
    const html = await rootResponse.text();
    if (!html.includes('Kalori Cafe')) throw new Error('live root HTML does not contain the product name');

    console.log(`Post-deploy smoke passed on attempt ${attempt}: ${expectedSha.slice(0, 12)} · ${expectedCatalogCount} items · ${image.byteLength} image bytes`);
    passed = true;
    break;
  } catch (error) {
    lastError = error;
    console.warn(`Post-deploy smoke attempt ${attempt}/${attempts} failed: ${error instanceof Error ? error.message : error}`);
    if (attempt < attempts) await wait(delayMs);
  }
}

if (!passed) {
  console.error(`Post-deploy smoke FAILED: ${lastError instanceof Error ? lastError.message : lastError}`);
  process.exitCode = 1;
}
