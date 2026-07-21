import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repositoryRoot, 'bin/rv.js');
const root = await mkdtemp(path.join(os.tmpdir(), 'react-vite-smoke-'));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const keepWorkspace = process.env.RV_KEEP_SMOKE === '1';
const childEnvironment = {
  ...process.env,
  CI: '1',
  NO_COLOR: '1',
  FORCE_COLOR: '0',
  npm_config_audit: 'false',
  npm_config_fund: 'false',
  npm_config_update_notifier: 'false',
};

const projectCases = [
  {
    directory: 'minimal-js',
    features: 'none',
    scripts: ['build'],
  },
  {
    directory: 'complete-js',
    features: 'tailwind,router,eslint,zustand',
    scripts: ['build', 'lint', 'format:check'],
  },
  {
    directory: 'minimal-ts',
    features: 'typescript',
    scripts: ['typecheck', 'build'],
  },
  {
    directory: 'complete-ts',
    features: 'all',
    scripts: ['typecheck', 'build', 'lint', 'format:check'],
  },
];

function run(command, args, cwd, label) {
  console.log(`\n[smoke] ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    env: childEnvironment,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed${result.signal ? ` with ${result.signal}` : ''}.`,
  );
}

function runCli(args, cwd = root) {
  run(process.execPath, [cliPath, ...args], cwd, `rv ${args.join(' ')}`);
}

function runNpm(projectDirectory, args, label) {
  run(npmCommand, args, projectDirectory, label);
}

async function validateProject(testCase) {
  const projectDirectory = path.join(root, testCase.directory);
  runNpm(
    projectDirectory,
    ['install', '--no-audit', '--no-fund', '--prefer-offline'],
    `${testCase.directory}: install`,
  );
  for (const script of testCase.scripts) {
    runNpm(projectDirectory, ['run', script], `${testCase.directory}: ${script}`);
  }
}

try {
  for (const testCase of projectCases) {
    runCli([
      'create',
      testCase.directory,
      '--features',
      testCase.features,
      '--install',
      'none',
    ]);
  }

  const minimalPackage = JSON.parse(
    await readFile(path.join(root, 'minimal-js/package.json'), 'utf8'),
  );
  const completePackage = JSON.parse(
    await readFile(path.join(root, 'complete-ts/package.json'), 'utf8'),
  );

  assert.deepEqual(Object.keys(minimalPackage.dependencies), ['react', 'react-dom']);
  assert.equal(completePackage.devDependencies.typescript, '6.0.3');
  assert.equal(completePackage.devDependencies.vite, '8.1.5');
  assert.equal(completePackage.dependencies['react-router-dom'], '7.18.1');
  assert.equal(completePackage.dependencies.zustand, '5.0.14');

  for (const testCase of projectCases) {
    await validateProject(testCase);
  }

  const existing = path.join(root, 'existing');
  await mkdir(path.join(existing, 'src'), { recursive: true });
  await writeFile(
    path.join(existing, 'package.json'),
    '{"name":"existing-app","version":"1.2.3","description":"preserve me"}\n',
  );
  await writeFile(path.join(existing, 'src/App.jsx'), 'preserve me\n');

  runCli(
    [
      'init',
      '--features',
      'tailwind,zustand',
      '--install',
      'none',
      '--conflicts',
      'keep',
    ],
    existing,
  );

  const initializedPackage = JSON.parse(
    await readFile(path.join(existing, 'package.json'), 'utf8'),
  );
  assert.equal(initializedPackage.version, '1.2.3');
  assert.equal(initializedPackage.description, 'preserve me');
  assert.equal(initializedPackage.dependencies.zustand, '5.0.14');
  assert.equal(await readFile(path.join(existing, 'src/App.jsx'), 'utf8'), 'preserve me\n');

  console.log(
    '\nSmoke test passed: four JavaScript/TypeScript project profiles and safe init.',
  );
} finally {
  if (keepWorkspace) {
    console.log(`Smoke workspace kept at: ${root}`);
  } else {
    await rm(root, { recursive: true, force: true });
  }
}
