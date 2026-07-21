import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { GENERATED_NODE_ENGINES, TEMPLATE_VERSIONS } from '../package-json.js';
import { logger } from '../utils/logger.js';

async function fileExists(filePath) {
  try {
    return (await lstat(filePath)).isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

// Mirrors GENERATED_NODE_ENGINES: Node ^20.19, ^22.13, or >=24.
function nodeSupported(version) {
  const [major, minor] = version.split('.').map(Number);
  if (major >= 24) return true;
  if (major === 22 && minor >= 13) return true;
  if (major === 20 && minor >= 19) return true;
  return false;
}

// Strips range operators (^, ~, >=, ...) so declared versions compare against exact pins.
function normalizeVersion(range) {
  return String(range).trim().replace(/^[~^>=<\s]+/u, '');
}

// Finds the first existing candidate file and reports whether it still contains the rv anchor.
async function findAnchorFile(targetDir, candidates, anchor) {
  for (const candidate of candidates) {
    const filePath = path.join(targetDir, candidate);
    if (!(await fileExists(filePath))) continue;
    const contents = await readFile(filePath, 'utf8');
    return { file: candidate, hasAnchor: contents.includes(anchor) };
  }
  return null;
}

/**
 * Gathers project health data: Node support, dependency drift from the rv pins,
 * and whether the router/layout files still contain their rv anchors.
 * @param {string} targetDir - Project directory containing package.json.
 * @returns {Promise<object>} { isReactViteProject, nodeVersion, nodeSupported,
 *   drift: object[], router, layout }.
 * @throws {Error} When package.json is missing or cannot be parsed.
 */
export async function collectDiagnostics(targetDir) {
  const packagePath = path.join(targetDir, 'package.json');
  if (!(await fileExists(packagePath))) {
    throw new Error('No package.json found. Run "rv doctor" inside a project directory.');
  }

  let packageJson;
  try {
    packageJson = JSON.parse((await readFile(packagePath, 'utf8')).replace(/^\uFEFF/u, ''));
  } catch (error) {
    throw new Error(`Cannot parse package.json: ${error.message}`);
  }

  const dependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  const drift = [];
  for (const [packageName, pinned] of Object.entries(TEMPLATE_VERSIONS)) {
    const declared = dependencies[packageName];
    if (declared === undefined) continue;
    if (normalizeVersion(declared) !== pinned) {
      drift.push({ packageName, declared, pinned });
    }
  }

  const router = await findAnchorFile(
    targetDir,
    ['src/router.tsx', 'src/router.jsx'],
    'rv:route',
  );
  const layout = await findAnchorFile(
    targetDir,
    ['src/layouts/RootLayout.tsx', 'src/layouts/RootLayout.jsx'],
    'rv:nav',
  );

  return {
    isReactViteProject: Boolean(dependencies.react && dependencies.vite),
    nodeVersion: process.versions.node,
    nodeSupported: nodeSupported(process.versions.node),
    drift,
    router,
    layout,
  };
}

/**
 * Implements "rv doctor": prints the diagnostics report with pass/warn markers.
 * @param {object} options - { cwd?: string }.
 * @returns {Promise<object>} The collectDiagnostics report.
 */
export async function doctorCommand({ cwd = process.cwd() } = {}) {
  const report = await collectDiagnostics(cwd);
  let warnings = 0;

  logger.info('');
  if (report.nodeSupported) {
    logger.success(`✓ Node ${report.nodeVersion} satisfies ${GENERATED_NODE_ENGINES}`);
  } else {
    warnings += 1;
    logger.warn(`✗ Node ${report.nodeVersion} is outside ${GENERATED_NODE_ENGINES}`);
  }

  if (!report.isReactViteProject) {
    warnings += 1;
    logger.warn('✗ react and vite were not both found — is this a React + Vite project?');
  }

  if (report.drift.length === 0) {
    logger.success('✓ All template-managed dependencies match the versions rv pins');
  } else {
    warnings += report.drift.length;
    logger.warn(`✗ ${report.drift.length} dependency version(s) differ from the rv pins:`);
    for (const { packageName, declared, pinned } of report.drift) {
      logger.warn(`    ${packageName}: project has ${declared}, rv pins ${pinned}`);
    }
    logger.info(pc.dim('  Newer versions are not necessarily wrong — rv pins a verified set.'));
  }

  for (const [entry, command] of [
    [report.router, 'rv add page'],
    [report.layout, 'rv add page'],
  ]) {
    if (!entry) continue;
    if (entry.hasAnchor) {
      logger.success(`✓ ${entry.file} still has its rv anchors (${command} will work)`);
    } else {
      warnings += 1;
      logger.warn(`✗ ${entry.file} lost its rv anchors — ${command} will fall back to manual steps`);
    }
  }

  logger.info('');
  if (warnings === 0) {
    logger.success('Everything looks healthy.');
  } else {
    logger.warn(`${warnings} finding(s) reported above.`);
  }

  return report;
}
