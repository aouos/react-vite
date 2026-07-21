import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { allFeatures, emptyFeatures } from '../src/features.js';
import { TEMPLATE_VERSIONS } from '../src/package-json.js';
import { scaffoldProject } from '../src/scaffold.js';

async function temporaryDirectory(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'react-vite-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('create writes a minimal project', async (t) => {
  const root = await temporaryDirectory(t);
  const target = path.join(root, 'minimal');

  const result = await scaffoldProject({
    targetDir: target,
    projectName: 'minimal',
    features: emptyFeatures(),
    mode: 'create',
  });

  assert.ok(result.written.includes('package.json'));
  assert.ok(result.written.includes('src/App.jsx'));
  assert.equal((await stat(path.join(target, 'src/main.jsx'))).isFile(), true);
  const pkg = JSON.parse(await readFile(path.join(target, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies), ['react', 'react-dom']);
});

test('create writes the complete TypeScript project', async (t) => {
  const root = await temporaryDirectory(t);
  const target = path.join(root, 'full');

  await scaffoldProject({
    targetDir: target,
    projectName: 'full',
    features: allFeatures(),
    mode: 'create',
  });

  for (const file of [
    'src/main.tsx',
    'src/router.tsx',
    'src/pages/Home.tsx',
    'src/pages/About.tsx',
    'src/store/useCounter.ts',
    'vite.config.ts',
    'tsconfig.json',
    'eslint.config.js',
  ]) {
    assert.equal((await stat(path.join(target, file))).isFile(), true, file);
  }
});

test('init merges package.json and preserves unrelated project settings', async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(
    path.join(root, 'package.json'),
    `${JSON.stringify(
      {
        name: 'existing-app',
        version: '2.0.0',
        description: 'preserved',
        scripts: { test: 'node --test' },
        dependencies: { existing: '1.0.0' },
      },
      null,
      2,
    )}\n`,
  );

  const result = await scaffoldProject({
    targetDir: root,
    projectName: 'existing-app',
    features: allFeatures(),
    mode: 'init',
    conflictStrategy: 'keep',
  });

  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(result.packageJsonMerged, true);
  assert.equal(pkg.name, 'existing-app');
  assert.equal(pkg.version, '2.0.0');
  assert.equal(pkg.description, 'preserved');
  assert.equal(pkg.scripts.test, 'node --test');
  assert.equal(pkg.scripts.dev, 'vite');
  assert.equal(pkg.dependencies.existing, '1.0.0');
  assert.equal(pkg.dependencies.react, TEMPLATE_VERSIONS.react);
});

test('init can keep or overwrite conflicting files', async (t) => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, 'src'), { recursive: true });
  await writeFile(path.join(root, 'src/App.jsx'), 'keep me\n');

  const kept = await scaffoldProject({
    targetDir: root,
    projectName: 'demo',
    features: emptyFeatures(),
    mode: 'init',
    conflictStrategy: 'keep',
  });
  assert.ok(kept.skipped.includes('src/App.jsx'));
  assert.equal(await readFile(path.join(root, 'src/App.jsx'), 'utf8'), 'keep me\n');

  const overwritten = await scaffoldProject({
    targetDir: root,
    projectName: 'demo',
    features: emptyFeatures(),
    mode: 'init',
    conflictStrategy: 'overwrite',
  });
  assert.ok(overwritten.written.includes('src/App.jsx'));
  assert.match(await readFile(path.join(root, 'src/App.jsx'), 'utf8'), /Your project is ready/);
});

test('cancel leaves all existing files unchanged', async (t) => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, 'src'), { recursive: true });
  await writeFile(path.join(root, 'src/App.jsx'), 'keep me\n');
  await writeFile(path.join(root, 'package.json'), '{"name":"existing","version":"1.0.0"}\n');

  const result = await scaffoldProject({
    targetDir: root,
    projectName: 'changed',
    features: emptyFeatures(),
    mode: 'init',
    conflictStrategy: 'cancel',
  });

  assert.equal(result.cancelled, true);
  assert.equal(await readFile(path.join(root, 'src/App.jsx'), 'utf8'), 'keep me\n');
  assert.equal(
    await readFile(path.join(root, 'package.json'), 'utf8'),
    '{"name":"existing","version":"1.0.0"}\n',
  );
});

test('invalid package.json is rejected before generated files are written', async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, 'package.json'), '{ invalid json');

  await assert.rejects(
    scaffoldProject({
      targetDir: root,
      projectName: 'demo',
      features: emptyFeatures(),
      mode: 'init',
      conflictStrategy: 'overwrite',
    }),
    /Cannot parse existing package.json/,
  );

  await assert.rejects(stat(path.join(root, 'src/main.jsx')), /ENOENT/);
});

test('overwrite preflight rejects non-file destinations before writing anything', async (t) => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, 'index.html'));

  await assert.rejects(
    scaffoldProject({
      targetDir: root,
      projectName: 'demo',
      features: emptyFeatures(),
      mode: 'init',
      conflictStrategy: 'overwrite',
    }),
    /Cannot write index\.html: the destination is not a regular file/,
  );

  await assert.rejects(stat(path.join(root, '.gitignore')), /ENOENT/);
  await assert.rejects(stat(path.join(root, 'package.json')), /ENOENT/);
});
