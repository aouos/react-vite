import { lstat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import {
  packageNameFromDirectory,
  validateDirectoryName,
} from '../names.js';
import { promptDirectoryName } from '../prompts.js';
import { scaffoldProject } from '../scaffold.js';
import {
  finishProject,
  printSelection,
  resolveFeaturesOption,
  resolveInstallOption,
} from './common.js';

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
  const manager = await resolveInstallOption(targetDir, options.install);

  printSelection({ targetDir, projectName, features, manager, mode: 'create' });

  try {
    const result = await scaffoldProject({
      targetDir,
      projectName,
      features,
      mode: 'create',
    });
    await finishProject({ targetDir, mode: 'create', manager, result });
  } catch (error) {
    if (!targetState.exists) {
      await rm(targetDir, { recursive: true, force: true }).catch(() => {});
    }
    throw error;
  }
}
