import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEATURE_KEYS,
  allFeatures,
  emptyFeatures,
  parseFeatureList,
  selectedFeatureKeys,
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
  assert.deepEqual(selectedFeatureKeys(parseFeatureList('ts,tailwindcss,react-router,lint,store')), FEATURE_KEYS);
  assert.deepEqual(selectedFeatureKeys(parseFeatureList('typescript,typescript,zustand')), [
    'typescript',
    'zustand',
  ]);
});

test('parseFeatureList reports unknown values', () => {
  assert.throws(() => parseFeatureList('typescript,unknown'), /Unknown feature: unknown/);
});
