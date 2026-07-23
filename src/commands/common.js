import path from 'node:path';
import pc from 'picocolors';
import { normalizeFeatures, parseFeatureList, selectedFeatureNames } from '../features.js';
import {
  installCommand,
  installDependencies,
  resolvePackageManager,
  runScriptCommand,
} from '../package-manager.js';
import { promptFeatures } from '../prompts.js';
import { logger } from '../utils/logger.js';

/**
 * Resolves the --features option: parses it when given, otherwise prompts interactively.
 * @param {string|undefined} value - Raw --features value.
 * @returns {Promise<Features>} Map of feature key to boolean.
 */
export async function resolveFeaturesOption(value) {
  const features = value === undefined ? await promptFeatures() : parseFeatureList(value);
  return normalizeFeatures(features);
}

/**
 * Resolves the --install option into a package manager name or "none".
 * @param {string} targetDir - Project directory used for lockfile detection.
 * @param {string|undefined} value - Raw --install value; prompts when omitted.
 * @returns {Promise<string>} Manager name or "none".
 */
export async function resolveInstallOption(targetDir, value) {
  return resolvePackageManager({ targetDir, requested: value });
}

/**
 * Prints a labeled summary of the chosen mode, directory, package, features, and installer.
 * @param {{ targetDir: string, projectName: string, features: Features, manager: string,
 *   mode: 'create' | 'init' }} options - Selection summary fields.
 */
export function printSelection({ targetDir, projectName, features, manager, mode }) {
  const names = selectedFeatureNames(features);
  logger.info('');
  logger.label('Mode', mode);
  logger.label('Directory', targetDir);
  logger.label('Package', projectName);
  logger.label('Features', names.length > 0 ? names.join(', ') : 'None (minimal)');
  logger.label('Install', manager === 'none' ? 'Skip' : manager);
}

/**
 * Prints the dry-run file list, marking paths that would conflict with existing files.
 * @param {string[]} paths - Relative paths that would be written.
 * @param {string[]} conflicts - Subset of paths that already exist with different contents.
 */
export function printDryRunPlan(paths, conflicts = []) {
  const conflictSet = new Set(conflicts);
  logger.warn('\nDry run — no files were written. Files that would be created:');
  for (const filePath of paths) {
    const marker = conflictSet.has(filePath) ? pc.yellow(' (would overwrite or prompt)') : '';
    logger.info(`  ${filePath}${marker}`);
  }
}

/**
 * Finishes a scaffold: installs dependencies and prints the summary and next steps.
 * @param {{ targetDir: string, mode: 'create' | 'init', manager: string,
 *   result: ScaffoldResult }} options - Where result is the scaffoldProject return value.
 * @returns {Promise<void>}
 */
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

  logger.info(pc.dim('\nGrow the project with rv add page|component|store|hook|layout.'));
  logger.info(pc.dim('Run rv doctor to check dependency health, or rv --help for all commands.'));
  logger.info('');
}
