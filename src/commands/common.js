import path from 'node:path';
import pc from 'picocolors';
import { parseFeatureList, selectedFeatureNames } from '../features.js';
import {
  installCommand,
  installDependencies,
  resolvePackageManager,
  runScriptCommand,
} from '../package-manager.js';
import { promptFeatures } from '../prompts.js';
import { logger } from '../utils/logger.js';

export async function resolveFeaturesOption(value) {
  return value === undefined ? promptFeatures() : parseFeatureList(value);
}

export async function resolveInstallOption(targetDir, value) {
  return resolvePackageManager({ targetDir, requested: value });
}

export function printSelection({ targetDir, projectName, features, manager, mode }) {
  const names = selectedFeatureNames(features);
  logger.info('');
  logger.label('Mode', mode);
  logger.label('Directory', targetDir);
  logger.label('Package', projectName);
  logger.label('Features', names.length > 0 ? names.join(', ') : 'None (minimal)');
  logger.label('Install', manager === 'none' ? 'Skip' : manager);
}

export async function finishProject({
  targetDir,
  mode,
  manager,
  result,
}) {
  const installed = await installDependencies(targetDir, manager);
  const commandManager = manager === 'none' ? 'npm' : manager;

  logger.success(`\nDone. ${result.written.length} file${result.written.length === 1 ? '' : 's'} written.`);
  if (result.packageJsonMerged) {
    logger.info(pc.dim('Existing package.json fields were preserved and generated settings were merged.'));
  }
  if (result.skipped.length > 0) {
    logger.warn(`Kept ${result.skipped.length} existing conflicting file${result.skipped.length === 1 ? '' : 's'}.`);
  }

  logger.info('\nNext steps:');
  const relative = path.relative(process.cwd(), targetDir);
  if (mode === 'create' && relative) {
    logger.info(`  ${pc.cyan(`cd ${relative}`)}`);
  }
  if (!installed) {
    logger.info(`  ${pc.cyan(installCommand(commandManager))}`);
  }
  logger.info(`  ${pc.cyan(runScriptCommand(commandManager, 'dev'))}`);
  logger.info('');
}
