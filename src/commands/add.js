import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import {
  pageComponentName,
  pageRoutePath,
  storeHookName,
  validatePageName,
} from '../names.js';
import {
  addedComponentSource,
  addedPageSource,
  addedStoreSource,
} from '../templates.js';
import { logger } from '../utils/logger.js';

const ADD_TYPES = Object.freeze(['page', 'component', 'store']);

async function fileExists(filePath) {
  try {
    return (await lstat(filePath)).isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

// Infers enabled features from package.json dependencies (BOM-stripped before parsing).
async function detectProject(targetDir) {
  const packagePath = path.join(targetDir, 'package.json');
  if (!(await fileExists(packagePath))) {
    throw new Error('No package.json found. Run "rv add" inside a project directory.');
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

  return {
    typescript: Boolean(dependencies.typescript),
    tailwind: Boolean(dependencies.tailwindcss),
    router: Boolean(dependencies['react-router-dom']),
    zustand: Boolean(dependencies.zustand),
    eslint: Boolean(dependencies.eslint),
  };
}

async function findSourceFile(targetDir, candidates) {
  for (const candidate of candidates) {
    if (await fileExists(path.join(targetDir, candidate))) return candidate;
  }
  return null;
}

// Anchor-insertion contract: inserts `line` immediately BEFORE the first occurrence of
// the anchor comment (e.g. "// rv:route" or "{/* rv:nav */}"), preserving the anchor
// line itself so future insertions still work, and re-indenting every inserted line to
// match the anchor's leading whitespace. Returns false when the anchor is missing so
// callers can fall back to printing manual instructions.
async function insertAtAnchor(targetDir, relativePath, anchor, line) {
  const filePath = path.join(targetDir, relativePath);
  const contents = await readFile(filePath, 'utf8');
  const pattern = new RegExp(
    `([ \\t]*)${anchor.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}`,
    'u',
  );
  const match = contents.match(pattern);
  if (!match) return false;

  const indent = match[1];
  const insertion = line
    .split('\n')
    .map((part) => `${indent}${part}`)
    .join('\n');
  await writeFile(
    filePath,
    contents.replace(pattern, `${insertion}\n${match[0]}`),
    'utf8',
  );
  return true;
}

async function addPage(name, targetDir, dryRun) {
  const segments = String(name ?? '').split('/').filter(Boolean);
  if (segments.length === 0) throw new Error('Page name is required.');
  if (segments.length > 3) {
    throw new Error('Page paths support at most three segments, e.g. blog/detail.');
  }
  for (const segment of segments) {
    const validation = validatePageName(segment);
    if (validation !== true) throw new Error(validation);
  }

  const features = await detectProject(targetDir);
  if (!features.router) {
    throw new Error(
      'rv add page requires React Router (react-router-dom was not found in package.json). ' +
        'Scaffold with the router feature enabled, or wire the page up manually.',
    );
  }

  const extension = features.typescript ? 'tsx' : 'jsx';
  const componentName = segments.map(pageComponentName).join('');
  if (componentName.length > 21) {
    throw new Error('Page name must be 21 characters or fewer.');
  }
  const routePath = segments.map(pageRoutePath).join('/');
  const pageFile = `src/pages/${componentName}.${extension}`;

  if (dryRun) {
    logger.warn('Dry run — nothing was written.');
    logger.info(`  Would create ${pageFile}`);
    logger.info(`  Would register the /${routePath} route and a navigation link`);
    return;
  }

  if (await fileExists(path.join(targetDir, pageFile))) {
    throw new Error(`${pageFile} already exists.`);
  }

  const routerFile = await findSourceFile(targetDir, [
    `src/router.${extension}`,
    'src/router.tsx',
    'src/router.jsx',
  ]);
  const layoutFile = await findSourceFile(targetDir, [
    `src/layouts/RootLayout.${extension}`,
    'src/layouts/RootLayout.tsx',
    'src/layouts/RootLayout.jsx',
  ]);

  await mkdir(path.join(targetDir, 'src/pages'), { recursive: true });
  await writeFile(
    path.join(targetDir, pageFile),
    addedPageSource(features, componentName),
    'utf8',
  );
  logger.success(`Created ${pageFile}`);

  const routeLines = [
    '{',
    `  path: '${routePath}',`,
    `  lazy: async () => ({ Component: (await import('./pages/${componentName}')).default }),`,
    '},',
  ].join('\n');
  const navLines = `<NavLink to="/${routePath}" className={navClassName}>\n  ${componentName}\n</NavLink>`;
  const manual = [];

  if (routerFile && (await insertAtAnchor(targetDir, routerFile, '// rv:route', routeLines))) {
    logger.success(`Registered route /${routePath} in ${routerFile}`);
  } else {
    manual.push(
      `Add to the children of ${routerFile ?? 'your router file'}:\n${routeLines}`,
    );
  }

  if (layoutFile && (await insertAtAnchor(targetDir, layoutFile, '{/* rv:nav */}', navLines))) {
    logger.success(`Added a navigation link in ${layoutFile}`);
  } else {
    manual.push(`Add a link in ${layoutFile ?? 'your layout'}:\n  <NavLink to="/${routePath}">${componentName}</NavLink>`);
  }

  if (manual.length > 0) {
    logger.warn('\nSome files could not be updated automatically (no rv anchor comments found):');
    for (const step of manual) logger.warn(`\n${step}`);
  }

  logger.info(`\nOpen ${pc.cyan(`/${routePath}`)} in the dev server to see the page.`);
}

async function writeGeneratedFile(targetDir, relativePath, contents) {
  if (await fileExists(path.join(targetDir, relativePath))) {
    throw new Error(`${relativePath} already exists.`);
  }
  await mkdir(path.dirname(path.join(targetDir, relativePath)), { recursive: true });
  await writeFile(path.join(targetDir, relativePath), contents, 'utf8');
  logger.success(`Created ${relativePath}`);
}

async function addComponent(name, targetDir, dryRun) {
  const validation = validatePageName(name);
  if (validation !== true) throw new Error(validation);

  const features = await detectProject(targetDir);
  const componentName = pageComponentName(name);
  const extension = features.typescript ? 'tsx' : 'jsx';
  const componentFile = `src/components/${componentName}.${extension}`;

  if (dryRun) {
    logger.warn('Dry run — nothing was written.');
    logger.info(`  Would create ${componentFile}`);
    return;
  }

  await writeGeneratedFile(
    targetDir,
    componentFile,
    addedComponentSource(features, componentName),
  );
  logger.info(`\nImport it with ${pc.cyan(`import ${componentName} from './components/${componentName}';`)}`);
}

async function addStore(name, targetDir, dryRun) {
  const validation = validatePageName(name);
  if (validation !== true) throw new Error(validation);
  if (name.length > 24) {
    throw new Error('Store name must be 24 characters or fewer.');
  }

  const features = await detectProject(targetDir);
  if (!features.zustand) {
    throw new Error(
      'rv add store requires Zustand (zustand was not found in package.json). ' +
        'Scaffold with the zustand feature enabled, or install zustand first.',
    );
  }

  const hookName = storeHookName(name);
  const typeName = `${hookName.slice(3)}State`;
  const extension = features.typescript ? 'ts' : 'js';
  const storeFile = `src/store/${hookName}.${extension}`;

  if (dryRun) {
    logger.warn('Dry run — nothing was written.');
    logger.info(`  Would create ${storeFile}`);
    return;
  }

  await writeGeneratedFile(
    targetDir,
    storeFile,
    addedStoreSource(features, hookName, typeName),
  );
  logger.info(`\nUse it with ${pc.cyan(`import { ${hookName} } from './store/${hookName}';`)}`);
}

/**
 * Implements "rv add": generates a page, component, or store in an existing project.
 * Pages are also wired into the router/layout via the rv:route and rv:nav anchors.
 * @param {string} type - "page", "component", or "store".
 * @param {string} name - Name of the new piece (pages may use up to three "/" segments).
 * @param {object} options - { cwd?: string, dryRun?: boolean }.
 * @returns {Promise<void>}
 * @throws {Error} On unknown type, invalid names, missing prerequisites, or existing files.
 */
export async function addCommand(type, name, { cwd = process.cwd(), dryRun = false } = {}) {
  if (!ADD_TYPES.includes(type)) {
    throw new Error(`Unknown add type: ${type}. Supported: ${ADD_TYPES.join(', ')}.`);
  }
  if (type === 'component') {
    await addComponent(name, cwd, dryRun);
    return;
  }
  if (type === 'store') {
    await addStore(name, cwd, dryRun);
    return;
  }
  await addPage(name, cwd, dryRun);
}
