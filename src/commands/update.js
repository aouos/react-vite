import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';
import { collectDiagnostics } from './doctor.js';

/**
 * Implements "rv update": rewrites drifted template-managed dependency versions in
 * package.json back to the exact versions rv pins.
 * @param {{ cwd?: string, dryRun?: boolean }} options - Working directory and dry-run flag.
 * @returns {Promise<Diagnostics>} The diagnostics report used to compute the drift.
 */
export async function updateCommand({ cwd = process.cwd(), dryRun = false } = {}) {
  const report = await collectDiagnostics(cwd);

  if (report.drift.length === 0) {
    logger.success('All template-managed dependencies already match the versions rv pins.');
    return report;
  }

  logger.info('');
  for (const { packageName, declared, pinned } of report.drift) {
    logger.info(`  ${packageName}: ${declared} ${pc.dim('->')} ${pinned}`);
  }

  if (dryRun) {
    logger.warn('\nDry run — package.json was not modified.');
    return report;
  }

  const packagePath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse((await readFile(packagePath, 'utf8')).replace(/^\uFEFF/u, ''));
  for (const { packageName, pinned } of report.drift) {
    for (const section of ['dependencies', 'devDependencies']) {
      if (packageJson[section]?.[packageName] !== undefined) {
        packageJson[section][packageName] = pinned;
      }
    }
  }
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

  logger.success(`\nPinned ${report.drift.length} dependency version(s) in package.json.`);
  logger.info('Run your package manager\'s install to apply the changes.');
  return report;
}
