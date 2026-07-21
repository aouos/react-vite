import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repositoryRoot, 'bin/rv.js');

function runCli(args, cwd = repositoryRoot) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1',
      FORCE_COLOR: '0',
    },
  });
}

async function temporaryDirectory(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'react-vite-cli-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('CLI exposes version and both supported commands', () => {
  const version = runCli(['--version']);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), '0.0.6');

  const help = runCli(['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /create \[options\]/);
  assert.match(help.stdout, /init \[options\]/);
});

test('create supports fully non-interactive generation', async (t) => {
  const root = await temporaryDirectory(t);
  const result = runCli(
    ['create', 'full-app', '--features', 'all', '--install', 'none'],
    root,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Done\./);
  const pkg = JSON.parse(await readFile(path.join(root, 'full-app/package.json'), 'utf8'));
  assert.equal(pkg.name, 'full-app');
  assert.ok(pkg.dependencies.zustand);
  assert.ok(pkg.devDependencies.typescript);
});

test('create refuses to overwrite a non-empty directory', async (t) => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, 'existing'));
  await writeFile(path.join(root, 'existing/keep.txt'), 'keep\n');

  const result = runCli(
    ['create', 'existing', '--features', 'none', '--install', 'none'],
    root,
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already exists and is not empty/);
  assert.equal(await readFile(path.join(root, 'existing/keep.txt'), 'utf8'), 'keep\n');
});

test('init merges the current directory without prompts when flags are supplied', async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(
    path.join(root, 'package.json'),
    '{"name":"@scope/existing","version":"1.0.0","description":"keep"}\n',
  );

  const result = runCli(
    [
      'init',
      '--features',
      'typescript,router',
      '--install',
      'none',
      '--conflicts',
      'keep',
    ],
    root,
  );

  assert.equal(result.status, 0, result.stderr);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@scope/existing');
  assert.equal(pkg.version, '1.0.0');
  assert.equal(pkg.description, 'keep');
  assert.ok(pkg.dependencies['react-router-dom']);
  assert.ok(pkg.devDependencies.typescript);
});
