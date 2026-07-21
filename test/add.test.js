import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { addCommand } from '../src/commands/add.js';
import { featuresFromKeys } from '../src/features.js';
import { scaffoldProject } from '../src/scaffold.js';

async function scaffoldTestProject(featureKeys) {
  const targetDir = await mkdtemp(path.join(os.tmpdir(), 'rv-add-test-'));
  await scaffoldProject({
    targetDir,
    projectName: 'add-test-app',
    features: featuresFromKeys(featureKeys),
    mode: 'create',
  });
  return targetDir;
}

test('add page wires a TypeScript + Tailwind page into router and navigation', async () => {
  const targetDir = await scaffoldTestProject(['typescript', 'tailwind', 'router']);
  await addCommand('page', 'blog-post', { cwd: targetDir });

  const page = await readFile(path.join(targetDir, 'src/pages/BlogPost.tsx'), 'utf8');
  assert.match(page, /export default function BlogPost\(\)/);
  assert.match(page, /Blog Post/);
  assert.match(page, /max-w-6xl/);

  const router = await readFile(path.join(targetDir, 'src/router.tsx'), 'utf8');
  assert.match(router, /path: 'blog-post',/);
  assert.match(
    router,
    /lazy: async \(\) => \(\{ Component: \(await import\('\.\/pages\/BlogPost'\)\)\.default \}\),/,
  );
  assert.ok(router.includes('// rv:route'), 'anchor is preserved for the next add');

  const layout = await readFile(path.join(targetDir, 'src/layouts/RootLayout.tsx'), 'utf8');
  assert.match(layout, /<NavLink to="\/blog-post" className=\{navClassName\}>/);
  assert.ok(layout.includes('{/* rv:nav */}'), 'nav anchor is preserved');
});

test('add page generates plain-CSS JSX pages and supports repeated adds', async () => {
  const targetDir = await scaffoldTestProject(['router']);
  await addCommand('page', 'blog', { cwd: targetDir });
  await addCommand('page', 'contact', { cwd: targetDir });

  const page = await readFile(path.join(targetDir, 'src/pages/Blog.jsx'), 'utf8');
  assert.match(page, /className="page-card"/);
  assert.doesNotMatch(page, /max-w-6xl/);

  const router = await readFile(path.join(targetDir, 'src/router.jsx'), 'utf8');
  assert.match(router, /path: 'blog',/);
  assert.match(router, /import\('\.\/pages\/Contact'\)/);
});

test('add page requires a router project', async () => {
  const targetDir = await scaffoldTestProject(['typescript']);
  await assert.rejects(
    addCommand('page', 'blog', { cwd: targetDir }),
    /requires React Router/,
  );
});

test('add page rejects duplicates, bad names, and unknown types', async () => {
  const targetDir = await scaffoldTestProject(['router']);
  await addCommand('page', 'blog', { cwd: targetDir });

  await assert.rejects(addCommand('page', 'blog', { cwd: targetDir }), /already exists/);
  await assert.rejects(addCommand('page', '9lives', { cwd: targetDir }), /start with a letter/);
  await assert.rejects(addCommand('widget', 'blog', { cwd: targetDir }), /Unknown add type/);
});

test('add component generates a style-matched component without requiring router', async () => {
  const tailwindDir = await scaffoldTestProject(['typescript', 'tailwind']);
  await addCommand('component', 'user-card', { cwd: tailwindDir });
  const tailwindComponent = await readFile(
    path.join(tailwindDir, 'src/components/UserCard.tsx'),
    'utf8',
  );
  assert.match(tailwindComponent, /export default function UserCard\(\)/);
  assert.match(tailwindComponent, /rounded-2xl/);

  const plainDir = await scaffoldTestProject([]);
  await addCommand('component', 'user-card', { cwd: plainDir });
  const plainComponent = await readFile(
    path.join(plainDir, 'src/components/UserCard.jsx'),
    'utf8',
  );
  assert.match(plainComponent, /User Card/);
  assert.doesNotMatch(plainComponent, /rounded-2xl/);
});

test('add store generates a zustand store and requires the dependency', async () => {
  const targetDir = await scaffoldTestProject(['typescript', 'zustand']);
  await addCommand('store', 'cart', { cwd: targetDir });
  const store = await readFile(path.join(targetDir, 'src/store/useCart.ts'), 'utf8');
  assert.match(store, /type CartState = \{/);
  assert.match(store, /export const useCart = create<CartState>/);

  await addCommand('store', 'use-session', { cwd: targetDir });
  const session = await readFile(path.join(targetDir, 'src/store/useSession.ts'), 'utf8');
  assert.match(session, /export const useSession = create<SessionState>/);

  const withoutZustand = await scaffoldTestProject([]);
  await assert.rejects(
    addCommand('store', 'cart', { cwd: withoutZustand }),
    /requires Zustand/,
  );
});

test('add page supports nested paths', async () => {
  const targetDir = await scaffoldTestProject(['router']);
  await addCommand('page', 'blog/detail', { cwd: targetDir });

  const page = await readFile(path.join(targetDir, 'src/pages/BlogDetail.jsx'), 'utf8');
  assert.match(page, /export default function BlogDetail\(\)/);

  const router = await readFile(path.join(targetDir, 'src/router.jsx'), 'utf8');
  assert.match(router, /path: 'blog\/detail',/);
  assert.match(router, /import\('\.\/pages\/BlogDetail'\)/);

  await assert.rejects(
    addCommand('page', 'a/b/c/d', { cwd: targetDir }),
    /at most three segments/,
  );
});

test('add --dry-run previews without writing', async () => {
  const targetDir = await scaffoldTestProject(['router', 'zustand']);
  const routerBefore = await readFile(path.join(targetDir, 'src/router.jsx'), 'utf8');

  await addCommand('page', 'blog', { cwd: targetDir, dryRun: true });
  await addCommand('component', 'user-card', { cwd: targetDir, dryRun: true });
  await addCommand('store', 'cart', { cwd: targetDir, dryRun: true });

  await assert.rejects(readFile(path.join(targetDir, 'src/pages/Blog.jsx'), 'utf8'));
  await assert.rejects(readFile(path.join(targetDir, 'src/components/UserCard.jsx'), 'utf8'));
  await assert.rejects(readFile(path.join(targetDir, 'src/store/useCart.js'), 'utf8'));
  const routerAfter = await readFile(path.join(targetDir, 'src/router.jsx'), 'utf8');
  assert.equal(routerAfter, routerBefore);
});

test('add page falls back to manual instructions when anchors are missing', async () => {
  const targetDir = await scaffoldTestProject(['router']);
  const routerPath = path.join(targetDir, 'src/router.jsx');
  const withoutAnchors = (await readFile(routerPath, 'utf8'))
    .split('\n')
    .filter((line) => !line.includes('rv:'))
    .join('\n');
  await writeFile(routerPath, withoutAnchors, 'utf8');

  await addCommand('page', 'blog', { cwd: targetDir });

  const page = await readFile(path.join(targetDir, 'src/pages/Blog.jsx'), 'utf8');
  assert.match(page, /export default function Blog\(\)/);
  const router = await readFile(routerPath, 'utf8');
  assert.doesNotMatch(router, /pages\/Blog/);
});
