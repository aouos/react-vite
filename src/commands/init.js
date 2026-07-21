import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  packageNameFromDirectory,
  sanitizePackageName,
  validatePackageName,
} from '../names.js';
import { promptPackageName } from '../prompts.js';
import { scaffoldProject } from '../scaffold.js';
import { logger } from '../utils/logger.js';
import {
  finishProject,
  printSelection,
  resolveFeaturesOption,
  resolveInstallOption,
} from './common.js';

async function inferPackageName(targetDir) {
  try {
    const raw = await readFile(path.join(targetDir, 'package.json'), 'utf8');
    const existing = JSON.parse(raw.replace(/^\uFEFF/u, ''));
    const existingName = sanitizePackageName(existing?.name);
    if (validatePackageName(existingName) === true) return existingName;
  } catch (error) {
    if (error?.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
  }
  return packageNameFromDirectory(path.basename(targetDir));
}

export async function initCommand(options = {}) {
  const targetDir = process.cwd();
  const inferredName = await inferPackageName(targetDir);
  let projectName = options.name;

  if (projectName !== undefined) {
    projectName = sanitizePackageName(projectName);
    const validation = validatePackageName(projectName);
    if (validation !== true) throw new Error(validation);
  } else if (process.stdin.isTTY && process.stdout.isTTY) {
    projectName = await promptPackageName(inferredName);
  } else {
    projectName = inferredName;
  }

  const features = await resolveFeaturesOption(options.features);
  const manager = await resolveInstallOption(targetDir, options.install);

  printSelection({ targetDir, projectName, features, manager, mode: 'init' });

  const result = await scaffoldProject({
    targetDir,
    projectName,
    features,
    mode: 'init',
    conflictStrategy: options.conflicts,
  });

  if (result.cancelled) {
    logger.warn('\nCanceled. No files were changed.');
    return;
  }

  await finishProject({ targetDir, mode: 'init', manager, result });
}
