import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  analyzeCatalogImages,
  createCleanupReport,
  createProvenanceManifest,
  exitCodeForMode,
  fetchCommonsMetadata,
  preserveCompletedCleanup,
  validateProvenanceManifest,
} from '../../scripts/image-integrity.mjs';

const temporaryDirectories: string[] = [];

function createPublicDirectory() {
  const directory = mkdtempSync(path.join(tmpdir(), 'kalori-cafe-image-integrity-'));
  temporaryDirectories.push(directory);
  return directory;
}

function writeAsset(publicDirectory: string, publicUrl: string, content: string) {
  const filePath = path.join(publicDirectory, publicUrl.replace(/^\//, ''));
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function item(id: string, image: string, sourceUrl = `https://example.com/${id}`) {
  return { id, image, imageSource: { url: sourceUrl } };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('content-based image integrity', () => {
  it('keeps report mode non-blocking while strict mode gates failures', () => {
    expect(exitCodeForMode('report', false)).toBe(0);
    expect(exitCodeForMode('strict', false)).toBe(1);
    expect(exitCodeForMode('strict', true)).toBe(0);
  });

  it('groups different paths by SHA-256 and reports URL reuse and orphan WebP files', () => {
    const publicDirectory = createPublicDirectory();
    writeAsset(publicDirectory, '/images/menu/a/one.webp', 'same-content');
    writeAsset(publicDirectory, '/images/menu/a/two.webp', 'same-content');
    writeAsset(publicDirectory, '/images/menu/a/three.webp', 'different-content');
    writeAsset(publicDirectory, '/images/menu/a/orphan.webp', 'orphan-content');

    const report = analyzeCatalogImages([
      item('one', '/images/menu/a/one.webp', 'https://example.com/reused'),
      item('two', '/images/menu/a/two.webp', 'https://example.com/reused'),
      item('three', '/images/menu/a/three.webp'),
    ], publicDirectory);

    expect(report.summary.uniqueContentHashes).toBe(2);
    expect(report.summary.uniqueContentPercent).toBe(66.7);
    expect(report.duplicateContentGroups[0]).toMatchObject({ productCount: 2, fileCount: 2 });
    expect(report.repeatedImageSourceUrls[0]).toMatchObject({
      url: 'https://example.com/reused',
      productCount: 2,
    });
    expect(report.orphanWebp).toEqual(['/images/menu/a/orphan.webp']);
    expect(report.passed).toBe(true);
  });

  it('gates real content reuse and creates a non-destructive cleanup plan', () => {
    const publicDirectory = createPublicDirectory();
    const items = [];
    for (let index = 0; index < 7; index++) {
      const image = `/images/menu/a/${index}.webp`;
      writeAsset(publicDirectory, image, 'same-content');
      items.push(item(`item-${index}`, image));
    }
    writeAsset(publicDirectory, '/images/legacy.jpg', 'legacy');
    writeAsset(publicDirectory, '/images/menu/starbucks/caffe_latte.webp', 'same-content');

    const report = analyzeCatalogImages(items, publicDirectory);
    const cleanup = createCleanupReport(report, publicDirectory);

    expect(report.gates.uniqueContentPercent.passed).toBe(false);
    expect(report.gates.maxProductsPerContent).toMatchObject({ passed: false, actual: 7 });
    expect(report.passed).toBe(false);
    expect(cleanup.deletionPerformed).toBe(false);
    expect(cleanup.definiteUnused.map(entry => entry.path)).toEqual([
      'public/images/legacy.jpg',
      'public/images/menu/starbucks/caffe_latte.webp',
    ]);
  });

  it('preserves an already executed cleanup audit trail on regeneration', () => {
    const current = { deletionPerformed: false, definiteUnused: [], orphanWebpForReview: ['placeholder.webp'] };
    const previous = {
      deletionPerformed: true,
      removedAt: '2026-08-11T11:42:31.056Z',
      definiteUnused: [{ path: 'public/images/legacy.jpg' }],
    };

    expect(preserveCompletedCleanup(current, previous)).toEqual({
      deletionPerformed: true,
      removedAt: '2026-08-11T11:42:31.056Z',
      definiteUnused: [{ path: 'public/images/legacy.jpg' }],
      orphanWebpForReview: ['placeholder.webp'],
    });
  });
});

describe('image provenance manifest', () => {
  it('blocks stale rows and licensed fallbacks without a verifiable license URL', () => {
    const items = [{
      id: 'fallback',
      image: '/images/fallback.webp',
      imageSource: { url: 'https://example.com/image', kind: 'licensed_fallback', exactProduct: false },
    }];
    const manifest = {
      schemaVersion: 1,
      recordCount: 1,
      sourceSnapshotSha256: 'snapshot-hash',
      issues: [],
      records: {
        fallback: {
          imagePath: '/images/fallback.webp',
          sourceUrl: 'https://example.com/image',
          sourcePageUrl: 'https://example.com/source',
          sourceKind: 'licensed_fallback',
          exactProduct: false,
          author: 'unknown',
          license: 'CC BY 4.0',
          licenseUrl: 'unknown',
          metadataVerification: 'snapshot_only',
        },
      },
    };

    expect(validateProvenanceManifest(manifest, items)).toEqual([
      'Fallback image license URL is not HTTPS for fallback',
      'Fallback image metadata was not license-verified for fallback',
    ]);
  });

  it('rejects assumed Commons authors and upgrades Creative Commons links to HTTPS', async () => {
    const pageUrl = 'https://commons.wikimedia.org/wiki/File%3AExample.jpg';
    const metadata = await fetchCommonsMetadata([{ pageUrl }], async () => ({
      ok: true,
      json: async () => ({
        query: {
          pages: [{
            title: 'File:Example.jpg',
            imageinfo: [{
              extmetadata: {
                Artist: { value: 'No machine-readable author provided. Example assumed.' },
                LicenseShortName: { value: 'CC BY-SA 3.0' },
                LicenseUrl: { value: 'http://creativecommons.org/licenses/by-sa/3.0/' },
              },
            }],
          }],
        },
      }),
    }));

    expect(metadata.get(pageUrl)).toEqual({
      author: 'unknown',
      licenseName: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    });
  });

  it('keeps missing authors unknown and only adds verified/canonical license URLs', () => {
    const items = [
      { id: 'official', image: '/images/official.webp', imageSource: { url: 'https://brand.example/image', kind: 'official', exactProduct: true } },
      { id: 'commons', image: '/images/commons.webp', imageSource: { url: 'https://upload.wikimedia.org/image', kind: 'licensed_fallback', exactProduct: false } },
    ];
    const snapshot = {
      official: { id: 'official', file: '/images/official.webp', sourceUrl: 'https://brand.example/image', pageUrl: 'https://brand.example/product', kind: 'official', exactProduct: true, license: 'official' },
      commons: { id: 'commons', file: '/images/commons.webp', sourceUrl: 'https://upload.wikimedia.org/image', pageUrl: 'https://commons.wikimedia.org/wiki/File%3AExample.jpg', kind: 'licensed_fallback', exactProduct: false, license: 'CC BY-SA 4.0' },
    };
    const commonsMetadata = new Map([
      [snapshot.commons.pageUrl, { author: 'Example Author', licenseName: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }],
    ]);

    const manifest = createProvenanceManifest(snapshot, items, commonsMetadata, 'snapshot-hash');

    expect(manifest.records.official).toMatchObject({
      author: 'unknown',
      license: 'unknown',
      licenseUrl: 'unknown',
      metadataVerification: 'snapshot_only',
    });
    expect(manifest.records.commons).toMatchObject({
      author: 'Example Author',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      metadataVerification: 'wikimedia_commons_api',
    });
    expect(manifest.issues).toEqual([]);
  });
});
