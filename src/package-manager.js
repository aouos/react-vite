import { access } from 'node:fs/promises';
import path from 'node:path';
import { promptPackageManager } from './prompts.js';
import { logger } from './utils/logger.js';
import { commandExists, runCommand } from './utils/process.js';

export const PACKAGE_MANAGERS = Object.freeze(['npm', 'pnpm', 'yarn']);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function detectAvailablePackageManagers() {
  return PACKAGE_MANAGERS.filter(commandExists);
}

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

export function validateRequestedPackageManager(value) {
  const manager = String(value ?? '').trim().toLowerCase();
  if (manager === 'none' || PACKAGE_MANAGERS.includes(manager)) return manager;
  throw new Error(
    `Unknown package manager: ${value}. Use ${PACKAGE_MANAGERS.join(', ')}, or none.`,
  );
}

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

export function installCommand(manager = 'npm') {
  return `${manager} install`;
}

export function runScriptCommand(manager = 'npm', script = 'dev') {
  return manager === 'npm' ? `npm run ${script}` : `${manager} ${script}`;
}
