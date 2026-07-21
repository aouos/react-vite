import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildGeneratedPackageJson,
  mergePackageJson,
  serializePackageJson,
} from './package-json.js';
import { promptConflictStrategy } from './prompts.js';
import { getTemplateFiles } from './templates.js';

async function pathStat(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function readExistingPackageJson(targetDir) {
  const packagePath = path.join(targetDir, 'package.json');
  const fileStat = await pathStat(packagePath);
  if (!fileStat) return null;
  if (!fileStat.isFile()) {
    throw new Error('package.json exists but is not a regular file.');
  }

  const raw = await readFile(packagePath, 'utf8');
  try {
    return JSON.parse(raw.replace(/^\uFEFF/u, ''));
  } catch (error) {
    throw new Error(`Cannot parse existing package.json: ${error.message}`);
  }
}

async function isSameFile(targetDir, file) {
  const destination = path.join(targetDir, file.path);
  const fileStat = await pathStat(destination);
  if (!fileStat?.isFile()) return false;
  const current = await readFile(destination, 'utf8');
  return current === file.contents;
}

async function findConflicts(targetDir, files) {
  const conflicts = [];
  for (const file of files) {
    const destination = path.join(targetDir, file.path);
    const fileStat = await pathStat(destination);
    if (!fileStat) continue;
    if (fileStat.isFile() && (await isSameFile(targetDir, file))) continue;
    conflicts.push(file.path);
  }
  return conflicts;
}

function validateConflictStrategy(strategy) {
  if (['overwrite', 'keep', 'cancel'].includes(strategy)) return strategy;
  throw new Error('Conflict strategy must be overwrite, keep, or cancel.');
}

async function assertWritableDestinations(targetDir, files) {
  for (const file of files) {
    const destination = path.join(targetDir, file.path);
    const fileStat = await pathStat(destination);
    if (fileStat && !fileStat.isFile()) {
      throw new Error(
        `Cannot write ${file.path}: the destination is not a regular file.`,
      );
    }
  }
}

async function writeProjectFiles(targetDir, files) {
  await assertWritableDestinations(targetDir, files);

  for (const file of files) {
    const destination = path.join(targetDir, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.contents, 'utf8');
  }
}

export async function buildProjectPlan({ targetDir, projectName, features, mode }) {
  const templateFiles = getTemplateFiles(features, projectName);
  const generatedPackageJson = buildGeneratedPackageJson(features, projectName);
  let packageJson = generatedPackageJson;
  let packageJsonMerged = false;

  if (mode === 'init') {
    const existingPackageJson = await readExistingPackageJson(targetDir);
    if (existingPackageJson) {
      packageJson = mergePackageJson(existingPackageJson, generatedPackageJson);
      packageJsonMerged = true;
    }
  }

  return {
    templateFiles,
    packageFile: {
      path: 'package.json',
      contents: serializePackageJson(packageJson),
    },
    packageJson,
    packageJsonMerged,
  };
}

export async function scaffoldProject({
  targetDir,
  projectName,
  features,
  mode,
  conflictStrategy,
  chooseConflictStrategy = promptConflictStrategy,
}) {
  if (!['create', 'init'].includes(mode)) {
    throw new Error('Scaffold mode must be create or init.');
  }

  await mkdir(targetDir, { recursive: true });
  const plan = await buildProjectPlan({ targetDir, projectName, features, mode });

  if (mode === 'create') {
    const files = [...plan.templateFiles, plan.packageFile];
    await writeProjectFiles(targetDir, files);
    return {
      cancelled: false,
      written: files.map((file) => file.path),
      skipped: [],
      packageJsonMerged: false,
    };
  }

  const conflicts = await findConflicts(targetDir, plan.templateFiles);
  let strategy = conflictStrategy;
  if (conflicts.length > 0 && strategy === undefined) {
    strategy = await chooseConflictStrategy(conflicts);
  }
  strategy = validateConflictStrategy(strategy ?? 'overwrite');

  if (strategy === 'cancel') {
    return {
      cancelled: true,
      written: [],
      skipped: conflicts,
      packageJsonMerged: plan.packageJsonMerged,
    };
  }

  const conflictSet = new Set(conflicts);
  const templateFiles =
    strategy === 'keep'
      ? plan.templateFiles.filter((file) => !conflictSet.has(file.path))
      : plan.templateFiles;

  const files = [...templateFiles, plan.packageFile];
  await writeProjectFiles(targetDir, files);

  return {
    cancelled: false,
    written: files.map((file) => file.path),
    skipped: strategy === 'keep' ? conflicts : [],
    packageJsonMerged: plan.packageJsonMerged,
  };
}
