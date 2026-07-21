import test from 'node:test';
import assert from 'node:assert/strict';
import { allFeatures, emptyFeatures } from '../src/features.js';
import {
  GENERATED_NODE_ENGINES,
  TEMPLATE_VERSIONS,
  buildGeneratedPackageJson,
  mergePackageJson,
  serializePackageJson,
} from '../src/package-json.js';

test('all generated dependency versions are exact', () => {
  for (const [name, value] of Object.entries(TEMPLATE_VERSIONS)) {
    assert.match(value, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, name);
  }
});

test('minimal package contains only the React and Vite baseline', () => {
  const pkg = buildGeneratedPackageJson(emptyFeatures(), 'My App');
  assert.equal(pkg.name, 'my-app');
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.engines.node, GENERATED_NODE_ENGINES);
  assert.deepEqual(Object.keys(pkg.dependencies), ['react', 'react-dom']);
  assert.deepEqual(Object.keys(pkg.devDependencies), ['@vitejs/plugin-react', 'vite']);
  assert.equal(pkg.scripts.build, 'vite build');
  assert.equal(pkg.scripts.lint, undefined);
});

test('full package includes every selected integration', () => {
  const pkg = buildGeneratedPackageJson(allFeatures(), 'full-app');
  assert.equal(pkg.scripts.build, 'tsc -b && vite build');
  assert.equal(pkg.scripts.typecheck, 'tsc -b');
  assert.ok(pkg.dependencies['react-router-dom']);
  assert.ok(pkg.dependencies.zustand);
  assert.ok(pkg.devDependencies.typescript);
  assert.ok(pkg.devDependencies.tailwindcss);
  assert.ok(pkg.devDependencies.eslint);
  assert.ok(pkg.devDependencies['typescript-eslint']);
  assert.ok(pkg.scripts.lint);
  assert.ok(pkg.scripts.format);
  assert.ok(pkg.scripts['format:check']);
});

test('init merge preserves unrelated fields and replaces generated settings', () => {
  const generated = buildGeneratedPackageJson(allFeatures(), '@scope/new-name');
  const merged = mergePackageJson(
    {
      name: 'existing-name',
      version: '1.2.3',
      description: 'keep me',
      scripts: { test: 'node --test', dev: 'old-dev' },
      dependencies: { existing: '1.0.0', vite: 'old' },
      devDependencies: { react: 'old' },
    },
    generated,
  );

  assert.equal(merged.name, '@scope/new-name');
  assert.equal(merged.version, '1.2.3');
  assert.equal(merged.description, 'keep me');
  assert.equal(merged.scripts.test, 'node --test');
  assert.equal(merged.scripts.dev, 'vite');
  assert.equal(merged.dependencies.existing, '1.0.0');
  assert.equal(merged.dependencies.react, TEMPLATE_VERSIONS.react);
  assert.equal(merged.dependencies.vite, undefined);
  assert.equal(merged.devDependencies.react, undefined);
  assert.equal(merged.devDependencies.vite, TEMPLATE_VERSIONS.vite);
});

test('serialized package.json is stable and ends with a newline', () => {
  const serialized = serializePackageJson(buildGeneratedPackageJson(emptyFeatures(), 'app'));
  assert.ok(serialized.endsWith('\n'));
  assert.deepEqual(JSON.parse(serialized).name, 'app');
});
