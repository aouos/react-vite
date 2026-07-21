import { lstat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import {
  packageNameFromDirectory,
  validateDirectoryName,
} from '../names.js';
import { promptDirectoryName } from '../prompts.js';
import { buildProjectPlan, scaffoldProject } from '../scaffold.js';
import { logger } from '../utils/logger.js';
import { commandExists, tryCommand } from '../utils/process.js';
import {
  finishProject,
  printDryRunPlan,
  printSelection,
  resolveFeaturesOption,
  resolveInstallOption,
} from './common.js';

// Reports whether the target exists and is empty; a lone .git entry still counts as empty.
async function getTargetState(targetDir) {
  try {
    const targetStat = await lstat(targetDir);
    if (!targetStat.isDirectory()) {
      throw new Error(`Target path exists and is not a directory: ${targetDir}`);
    }
    const entries = (await readdir(targetDir)).filter((entry) => entry !== '.git');
    return { exists: true, empty: entries.length === 0 };
  } catch (error) {
    if (error?.code === 'ENOENT') return { exists: false, empty: true };
    throw error;
  }
}

// Runs git init unless git is missing or the directory is already inside a work tree.
function initializeGitRepository(targetDir) {
  if (!commandExists('git')) return false;
  if (tryCommand('git', ['rev-parse', '--is-inside-work-tree'], { cwd: targetDir })) {
    return false;
  }
  return tryCommand('git', ['init'], { cwd: targetDir });
}

/**
 * Implements "rv create": scaffolds a project into a new (or empty) directory,
 * optionally initializing git and installing dependencies; cleans up on failure
 * when the directory did not previously exist.
 * @param {string|undefined} projectDirectory - Target directory; prompts when omitted.
 * @param {object} options - { features?: string, install?: string, dryRun?: boolean,
 *   git?: boolean }.
 * @returns {Promise<void>}
 * @throws {Error} When the name is invalid or the directory exists and is not empty.
 */
export async function createCommand(projectDirectory, options = {}) {
  let directoryName = projectDirectory;
  if (!directoryName) {
    directoryName = await promptDirectoryName();
  }
  directoryName = String(directoryName).trim();

  const validation = validateDirectoryName(directoryName);
  if (validation !== true) throw new Error(validation);

  const targetDir = path.resolve(process.cwd(), directoryName);
  const targetState = await getTargetState(targetDir);
  if (!targetState.empty) {
    throw new Error(`Directory "${directoryName}" already exists and is not empty.`);
  }

  const projectName = packageNameFromDirectory(directoryName);
  const features = await resolveFeaturesOption(options.features);

  if (options.dryRun) {
    printSelection({ targetDir, projectName, features, manager: 'none', mode: 'create' });
    const plan = await buildProjectPlan({ targetDir, projectName, features, mode: 'create' });
    printDryRunPlan([...plan.templateFiles, plan.packageFile].map((file) => file.path));
    return;
  }

  const manager = await resolveInstallOption(targetDir, options.install);

  printSelection({ targetDir, projectName, features, manager, mode: 'create' });

  try {
    const result = await scaffoldProject({
      targetDir,
      projectName,
      features,
      mode: 'create',
    });
    if (options.git !== false && initializeGitRepository(targetDir)) {
      logger.info('Initialized a git repository.');
    }
    await finishProject({ targetDir, mode: 'create', manager, result });
  } catch (error) {
    if (!targetState.exists) {
      await rm(targetDir, { recursive: true, force: true }).catch(() => {});
    }
    throw error;
  }
}
