import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { updateCommand } from '../src/commands/update.js';
import { featuresFromKeys } from '../src/features.js';
import { TEMPLATE_VERSIONS } from '../src/package-json.js';
import { scaffoldProject } from '../src/scaffold.js';

async function scaffoldDriftedProject() {
  const targetDir = await mkdtemp(path.join(os.tmpdir(), 'rv-update-test-'));
  await scaffoldProject({
    targetDir,
    projectName: 'update-test-app',
    features: featuresFromKeys(['typescript']),
    mode: 'create',
  });

  const packagePath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  packageJson.dependencies.react = '^18.2.0';
  packageJson.devDependencies.typescript = '5.0.0';
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
  return targetDir;
}

test('update pins drifted dependencies back to the rv versions', async () => {
  const targetDir = await scaffoldDriftedProject();
  const report = await updateCommand({ cwd: targetDir });
  assert.equal(report.drift.length, 2);

  const packageJson = JSON.parse(
    await readFile(path.join(targetDir, 'package.json'), 'utf8'),
  );
  assert.equal(packageJson.dependencies.react, TEMPLATE_VERSIONS.react);
  assert.equal(packageJson.devDependencies.typescript, TEMPLATE_VERSIONS.typescript);

  const second = await updateCommand({ cwd: targetDir });
  assert.equal(second.drift.length, 0);
});

test('update --dry-run reports drift without modifying package.json', async () => {
  const targetDir = await scaffoldDriftedProject();
  const before = await readFile(path.join(targetDir, 'package.json'), 'utf8');
  const report = await updateCommand({ cwd: targetDir, dryRun: true });
  assert.equal(report.drift.length, 2);
  const after = await readFile(path.join(targetDir, 'package.json'), 'utf8');
  assert.equal(after, before);
});
