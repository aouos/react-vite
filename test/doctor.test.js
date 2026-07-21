import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { collectDiagnostics } from '../src/commands/doctor.js';
import { featuresFromKeys } from '../src/features.js';
import { scaffoldProject } from '../src/scaffold.js';

async function scaffoldTestProject(featureKeys) {
  const targetDir = await mkdtemp(path.join(os.tmpdir(), 'rv-doctor-test-'));
  await scaffoldProject({
    targetDir,
    projectName: 'doctor-test-app',
    features: featuresFromKeys(featureKeys),
    mode: 'create',
  });
  return targetDir;
}

test('doctor reports a fresh scaffold as drift-free with intact anchors', async () => {
  const targetDir = await scaffoldTestProject(['typescript', 'router']);
  const report = await collectDiagnostics(targetDir);

  assert.equal(report.isReactViteProject, true);
  assert.deepEqual(report.drift, []);
  assert.equal(report.router?.hasAnchor, true);
  assert.equal(report.layout?.hasAnchor, true);
});

test('doctor detects dependency drift and lost anchors', async () => {
  const targetDir = await scaffoldTestProject(['router']);

  const packagePath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  packageJson.dependencies.react = '^18.0.0';
  await writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');

  const routerPath = path.join(targetDir, 'src/router.jsx');
  const withoutAnchors = (await readFile(routerPath, 'utf8'))
    .split('\n')
    .filter((line) => !line.includes('rv:'))
    .join('\n');
  await writeFile(routerPath, withoutAnchors, 'utf8');

  const report = await collectDiagnostics(targetDir);
  assert.equal(report.drift.length, 1);
  assert.equal(report.drift[0].packageName, 'react');
  assert.equal(report.drift[0].pinned, report.drift[0].pinned.trim());
  assert.equal(report.router?.hasAnchor, false);
});

test('doctor requires a package.json', async () => {
  const emptyDir = await mkdtemp(path.join(os.tmpdir(), 'rv-doctor-empty-'));
  await assert.rejects(collectDiagnostics(emptyDir), /No package\.json found/);
});
