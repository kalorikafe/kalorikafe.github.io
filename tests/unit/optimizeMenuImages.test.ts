import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {
  createFallbackOverlaySvg,
  escapeXml,
  optimizeCatalogImages,
} from '../../scripts/optimize-menu-images.mjs';

const temporaryDirectories: string[] = [];

function temporaryWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), 'kalori-cafe-optimize-images-'));
  temporaryDirectories.push(root);
  return {
    publicDir: path.join(root, 'public'),
    manifestPath: path.join(root, 'image-derivatives.json'),
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('menu image optimizer', () => {
  it('escapes product labels before embedding them in SVG', () => {
    expect(escapeXml('Latte & <Kakao> "Özel"')).toBe('Latte &amp; &lt;Kakao&gt; &quot;Özel&quot;');
    expect(createFallbackOverlaySvg(320, 240, 'Latte & <Kakao>', 'Kafe').toString())
      .toContain('Latte &amp; &lt;Kakao&gt;');
  });

  it('labels licensed fallbacks once and skips an unchanged derivative on rerun', async () => {
    const { publicDir, manifestPath } = temporaryWorkspace();
    const imagePath = '/images/menu/test/product.webp';
    const absoluteImagePath = path.join(publicDir, imagePath.replace(/^\//, ''));
    mkdirSync(path.dirname(absoluteImagePath), { recursive: true });
    const original = await sharp({
      create: { width: 900, height: 700, channels: 3, background: '#b98c63' },
    }).webp({ quality: 90 }).toBuffer();
    writeFileSync(absoluteImagePath, original);

    const items = [{
      id: 'test-product',
      chainId: 'test-chain',
      name: 'Kakao & Latte',
      image: imagePath,
    }];
    const provenanceManifest = {
      records: {
        'test-product': {
          sourceUrl: 'https://example.com/image',
          sourceKind: 'licensed_fallback',
          exactProduct: false,
        },
      },
    };
    const options = {
      items,
      chains: [{ id: 'test-chain', name: 'Test Kafe' }],
      provenanceManifest,
      publicDir,
      manifestPath,
      concurrency: 1,
    };

    const first = await optimizeCatalogImages(options);
    const firstOutput = readFileSync(absoluteImagePath);
    const metadata = await sharp(firstOutput).metadata();
    const second = await optimizeCatalogImages(options);
    const secondOutput = readFileSync(absoluteImagePath);

    expect(first.summary).toMatchObject({ processed: 1, skipped: 0, overlaysApplied: 0 });
    expect(metadata.width).toBeLessThanOrEqual(800);
    expect(metadata.height).toBeLessThanOrEqual(600);
    expect(second.summary).toMatchObject({ processed: 0, skipped: 1, overlaysApplied: 0 });
    expect(secondOutput.equals(firstOutput)).toBe(true);
    expect(JSON.parse(readFileSync(manifestPath, 'utf8')).records['test-product']).toMatchObject({
      transform: { quality: 78, overlayApplied: false, productLabel: null, chainLabel: null },
      output: { format: 'webp' },
    });
  });
});
