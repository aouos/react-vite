import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildGeneratedPackageJson,
  mergePackageJson,
  serializePackageJson,
} from './package-json.js';
import { promptConflictStrategy } from './prompts.js';
import { getTemplateFiles } from './templates.js';

// lstat that returns null for missing paths instead of throwing ENOENT.
async function pathStat(/** @type {string} */ filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

// Reads and parses package.json (stripping a UTF-8 BOM); returns null when absent.
async function readExistingPackageJson(/** @type {string} */ targetDir) {
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

async function isSameFile(/** @type {string} */ targetDir, /** @type {TemplateFile} */ file) {
  const destination = path.join(targetDir, file.path);
  const fileStat = await pathStat(destination);
  if (!fileStat?.isFile()) return false;
  const current = await readFile(destination, 'utf8');
  return current === file.contents;
}

/**
 * Finds template files whose destinations already exist with different contents;
 * files that are byte-identical to the template are not conflicts.
 * @param {string} targetDir - Project directory.
 * @param {TemplateFile[]} files - Template files ({ path, contents }).
 * @returns {Promise<string[]>} Relative paths of conflicting files.
 */
export async function findConflicts(targetDir, files) {
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

function validateConflictStrategy(/** @type {string} */ strategy) {
  if (['overwrite', 'keep', 'cancel'].includes(strategy)) return strategy;
  throw new Error('Conflict strategy must be overwrite, keep, or cancel.');
}

async function assertWritableDestinations(/** @type {string} */ targetDir, /** @type {TemplateFile[]} */ files) {
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

async function writeProjectFiles(/** @type {string} */ targetDir, /** @type {TemplateFile[]} */ files) {
  await assertWritableDestinations(targetDir, files);

  for (const file of files) {
    const destination = path.join(targetDir, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.contents, 'utf8');
  }
}

/**
 * Builds the write plan for a project: template files plus a generated (or, in init
 * mode, merged) package.json — without touching the filesystem beyond reading.
 * @param {ProjectContext} options - { targetDir, projectName, features, mode: 'create'|'init' }.
 * @returns {Promise<ProjectPlan>} { templateFiles, packageFile, packageJson, packageJsonMerged }.
 */
export async function buildProjectPlan({ targetDir, projectName, features, mode }) {
  const templateFiles = getTemplateFiles(features, projectName);
  const generatedPackageJson = buildGeneratedPackageJson(features, projectName);
  /** @type {PackageJson} */
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

/**
 * Writes a project to disk. Create mode writes everything; init mode detects
 * conflicts and applies a strategy (overwrite, keep, or cancel), prompting when needed.
 * @param {ProjectContext & { conflictStrategy?: string,
 *   chooseConflictStrategy?: (conflicts: string[]) => Promise<string> }} options - The project
 *   context plus an optional strategy and an injectable prompt used when conflicts exist and
 *   no strategy was given.
 * @returns {Promise<ScaffoldResult>} { cancelled, written: string[], skipped: string[],
 *   packageJsonMerged }.
 * @throws {Error} When mode or the resolved conflict strategy is invalid.
 */
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
