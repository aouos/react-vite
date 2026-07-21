import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import { pageComponentName, pageRoutePath, validatePageName } from '../names.js';
import { addedPageSource } from '../templates.js';
import { logger } from '../utils/logger.js';

const ADD_TYPES = Object.freeze(['page']);

async function fileExists(filePath) {
  try {
    return (await lstat(filePath)).isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

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

async function addPage(name, targetDir) {
  const validation = validatePageName(name);
  if (validation !== true) throw new Error(validation);

  const features = await detectProject(targetDir);
  if (!features.router) {
    throw new Error(
      'rv add page requires React Router (react-router-dom was not found in package.json). ' +
        'Scaffold with the router feature enabled, or wire the page up manually.',
    );
  }

  const extension = features.typescript ? 'tsx' : 'jsx';
  const componentName = pageComponentName(name);
  const routePath = pageRoutePath(name);
  const pageFile = `src/pages/${componentName}.${extension}`;

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

  const importLine = `import ${componentName} from './pages/${componentName}';`;
  const routeLine = `{ path: '${routePath}', element: <${componentName} /> },`;
  const navLines = `<NavLink to="/${routePath}" className={navClassName}>\n  ${componentName}\n</NavLink>`;
  const manual = [];

  if (
    routerFile &&
    (await insertAtAnchor(targetDir, routerFile, '// rv:import', importLine)) &&
    (await insertAtAnchor(targetDir, routerFile, '// rv:route', routeLine))
  ) {
    logger.success(`Registered route /${routePath} in ${routerFile}`);
  } else {
    manual.push(
      `Add to ${routerFile ?? 'your router file'}:\n  ${importLine}\n  ${routeLine}`,
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

export async function addCommand(type, name, { cwd = process.cwd() } = {}) {
  if (!ADD_TYPES.includes(type)) {
    throw new Error(`Unknown add type: ${type}. Supported: ${ADD_TYPES.join(', ')}.`);
  }
  await addPage(name, cwd);
}
