import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(testDir, '..');
const cropDir = path.join(projectDir, 'public', 'assets', 'terrain', 'mars', 'mola-meg016', 'jezero_crop');

test('Jezero runtime metadata describes the measured MOLA crop', () => {
  const metadata = JSON.parse(readFileSync(path.join(cropDir, 'jezero_256x256_mola.json'), 'utf8'));

  assert.equal(metadata.sourceDataset, 'MGS-M-MOLA-5-MEGDR-L3-V1.0');
  assert.equal(metadata.source, 'MEGT90N000EB.IMG');
  assert.equal(metadata.width, 256);
  assert.equal(metadata.height, 256);
  assert.deepEqual(metadata.bounds, { west: 75.5, east: 79.5, south: 16.4, north: 20.4 });
  assert.equal(metadata.worldCoverageMeters, 240);
  assert.equal(metadata.orientation, 'north-up rows; west-to-east columns');
  assert.ok(metadata.sourceUrl.startsWith('https://'));
});

test('Jezero runtime heightmap has the exact expected dimensions', () => {
  const rawPath = path.join(cropDir, 'jezero_256x256_mola_i16le.raw');
  const metadata = JSON.parse(readFileSync(path.join(cropDir, 'jezero_256x256_mola.json'), 'utf8'));
  assert.equal(statSync(rawPath).size, metadata.width * metadata.height * 2);

  const bytes = readFileSync(rawPath);
  let validMinimum = Number.POSITIVE_INFINITY;
  let validMaximum = Number.NEGATIVE_INFINITY;
  let validCount = 0;
  for (let index = 0; index < bytes.length; index += 2) {
    const value = bytes.readInt16LE(index);
    if (value === metadata.noData) continue;
    validMinimum = Math.min(validMinimum, value);
    validMaximum = Math.max(validMaximum, value);
    validCount++;
  }

  assert.equal(validCount, metadata.width * metadata.height);
  assert.ok(validMinimum >= metadata.sampleMinMeters);
  assert.ok(validMaximum <= metadata.sampleMaxMeters);
  assert.equal(validMinimum, metadata.sampleMinMeters);
  assert.equal(validMaximum, metadata.sampleMaxMeters);
});
