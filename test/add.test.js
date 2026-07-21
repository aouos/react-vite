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
  assert.match(router, /import BlogPost from '\.\/pages\/BlogPost';/);
  assert.match(router, /\{ path: 'blog-post', element: <BlogPost \/> \},/);
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
  assert.match(router, /\{ path: 'blog', element: <Blog \/> \},/);
  assert.match(router, /\{ path: 'contact', element: <Contact \/> \},/);
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
  assert.doesNotMatch(router, /<Blog \/>/);
});
