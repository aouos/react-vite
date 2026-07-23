import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEATURE_KEYS,
  allFeatures,
  emptyFeatures,
  normalizeFeatures,
  parseFeatureList,
  selectedFeatureKeys,
  shadcnEnabled,
} from '../src/features.js';

test('emptyFeatures and allFeatures cover every supported feature', () => {
  assert.deepEqual(Object.keys(emptyFeatures()), FEATURE_KEYS);
  assert.deepEqual(Object.keys(allFeatures()), FEATURE_KEYS);
  assert.deepEqual(selectedFeatureKeys(emptyFeatures()), []);
  assert.deepEqual(selectedFeatureKeys(allFeatures()), FEATURE_KEYS);
});

test('parseFeatureList supports aliases, all, and none', () => {
  assert.deepEqual(selectedFeatureKeys(parseFeatureList('none')), []);
  assert.deepEqual(selectedFeatureKeys(parseFeatureList('all')), FEATURE_KEYS);
  assert.deepEqual(
    selectedFeatureKeys(parseFeatureList('ts,tailwindcss,react-router,lint,store,ui')),
    FEATURE_KEYS,
  );
  assert.deepEqual(selectedFeatureKeys(parseFeatureList('typescript,typescript,zustand')), [
    'typescript',
    'zustand',
  ]);
});

test('parseFeatureList reports unknown values', () => {
  assert.throws(() => parseFeatureList('typescript,unknown'), /Unknown feature: unknown/);
});

test('normalizeFeatures makes shadcn imply typescript and tailwind', () => {
  const normalized = normalizeFeatures(parseFeatureList('shadcn'));
  assert.equal(normalized.shadcn, true);
  assert.equal(normalized.typescript, true);
  assert.equal(normalized.tailwind, true);
  assert.equal(shadcnEnabled(normalized), true);

  // The raw map (before normalization) lacks the required deps, so shadcn output stays off.
  assert.equal(shadcnEnabled(parseFeatureList('shadcn')), false);
  // Non-shadcn selections are returned unchanged.
  assert.deepEqual(normalizeFeatures(parseFeatureList('zustand')), parseFeatureList('zustand'));
});
