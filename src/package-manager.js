import { access } from 'node:fs/promises';
import path from 'node:path';
import { promptPackageManager } from './prompts.js';
import { logger } from './utils/logger.js';
import { commandExists, runCommand } from './utils/process.js';

/** Package managers rv knows how to detect and run. */
export const PACKAGE_MANAGERS = Object.freeze(['npm', 'pnpm', 'yarn']);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects which supported package managers are available on PATH.
 * @returns {string[]} Available manager names, in PACKAGE_MANAGERS order.
 */
export function detectAvailablePackageManagers() {
  return PACKAGE_MANAGERS.filter(commandExists);
}

/**
 * Picks a preferred manager from the target directory's lockfile, then the npm user agent.
 * @param {string} targetDir - Directory to inspect for lockfiles.
 * @returns {Promise<string>} Manager name; defaults to "npm".
 */
export async function detectPreferredPackageManager(targetDir) {
  const lockFiles = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['yarn', 'yarn.lock'],
    ['npm', 'package-lock.json'],
  ];

  for (const [manager, lockFile] of lockFiles) {
    if (await fileExists(path.join(targetDir, lockFile))) return manager;
  }

  const userAgent = process.env.npm_config_user_agent?.split('/')[0];
  return PACKAGE_MANAGERS.includes(userAgent) ? userAgent : 'npm';
}

/**
 * Normalizes and validates a --install option value.
 * @param {string} value - Requested manager or "none".
 * @returns {string} Lowercased manager name or "none".
 * @throws {Error} When the value is not a supported manager or "none".
 */
export function validateRequestedPackageManager(value) {
  const manager = String(value ?? '').trim().toLowerCase();
  if (manager === 'none' || PACKAGE_MANAGERS.includes(manager)) return manager;
  throw new Error(
    `Unknown package manager: ${value}. Use ${PACKAGE_MANAGERS.join(', ')}, or none.`,
  );
}

/**
 * Resolves the package manager to use: validates an explicit request, or prompts
 * with the detected preference; returns "none" when nothing is available.
 * @param {object} options - { targetDir: string, requested: string|undefined }.
 * @returns {Promise<string>} Manager name or "none".
 * @throws {Error} When a requested manager is unknown or not on PATH.
 */
export async function resolvePackageManager({ targetDir, requested }) {
  const available = detectAvailablePackageManagers();

  if (requested !== undefined) {
    const manager = validateRequestedPackageManager(requested);
    if (manager !== 'none' && !available.includes(manager)) {
      throw new Error(`${manager} was requested but is not available on PATH.`);
    }
    return manager;
  }

  if (available.length === 0) {
    logger.warn('No npm, pnpm, or Yarn executable was found. Skipping installation.');
    return 'none';
  }

  const preferred = await detectPreferredPackageManager(targetDir);
  return promptPackageManager(available, preferred);
}

/**
 * Runs "<manager> install" in the target directory, logging a retry hint on failure.
 * @param {string} targetDir - Project directory.
 * @param {string} manager - Manager name or "none" to skip.
 * @returns {Promise<boolean>} true when installation succeeded.
 */
export async function installDependencies(targetDir, manager) {
  if (manager === 'none') return false;
  logger.info(`\nInstalling dependencies with ${manager}...`);
  try {
    await runCommand(manager, ['install'], { cwd: targetDir });
    return true;
  } catch (error) {
    logger.warn(`\nDependency installation failed: ${error.message}`);
    logger.warn(`Retry manually with: ${installCommand(manager)}`);
    return false;
  }
}

/**
 * Formats the install command for a manager (e.g. "pnpm install").
 * @param {string} manager - Manager name.
 * @returns {string} Shell command string.
 */
export function installCommand(manager = 'npm') {
  return `${manager} install`;
}

/**
 * Formats the command that runs a package.json script with the given manager.
 * @param {string} manager - Manager name.
 * @param {string} script - Script name.
 * @returns {string} Shell command string (npm uses "npm run <script>").
 */
export function runScriptCommand(manager = 'npm', script = 'dev') {
  return manager === 'npm' ? `npm run ${script}` : `${manager} ${script}`;
}
