import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURE_KEYS, featuresFromKeys, normalizeFeatures } from '../src/features.js';
import { buildGeneratedPackageJson } from '../src/package-json.js';
import { getTemplateFiles } from '../src/templates.js';

function featuresForMask(mask) {
  return Object.fromEntries(
    FEATURE_KEYS.map((feature, index) => [feature, Boolean(mask & (1 << index))]),
  );
}

function filesAsMap(features, projectName = 'matrix-app') {
  return new Map(
    getTemplateFiles(features, projectName).map((file) => [file.path, file.contents]),
  );
}

test('every feature combination produces a coherent file set', () => {
  for (let mask = 0; mask < 2 ** FEATURE_KEYS.length; mask += 1) {
    const features = featuresForMask(mask);
    const files = filesAsMap(features);
    const pkg = buildGeneratedPackageJson(features, 'matrix-app');
    const extension = features.typescript ? 'tsx' : 'jsx';
    const configExtension = features.typescript ? 'ts' : 'js';

    assert.ok(files.has(`src/main.${extension}`));
    assert.ok(files.has(`vite.config.${configExtension}`));
    assert.equal(files.has('tsconfig.json'), features.typescript);
    assert.equal(files.has(`src/App.${extension}`), !features.router);
    assert.equal(files.has(`src/router.${extension}`), features.router);
    assert.equal(files.has(`src/pages/Home.${extension}`), features.router);
    assert.equal(files.has(`src/pages/About.${extension}`), features.router);
    assert.equal(
      files.has(`src/store/useCounter.${features.typescript ? 'ts' : 'js'}`),
      features.zustand,
    );
    assert.equal(files.has('eslint.config.js'), features.eslint);
    assert.equal(files.has('.prettierrc.json'), features.eslint);
    assert.equal(
      files.has('.vscode/extensions.json'),
      features.eslint || features.tailwind,
    );

    const css = files.get('src/index.css');
    const viteConfig = files.get(`vite.config.${configExtension}`);
    assert.equal(css.includes("@import 'tailwindcss'"), features.tailwind);
    assert.equal(viteConfig.includes('@tailwindcss/vite'), features.tailwind);
    assert.equal(Boolean(pkg.dependencies['react-router-dom']), features.router);
    assert.equal(Boolean(pkg.dependencies.zustand), features.zustand);
    assert.equal(Boolean(pkg.devDependencies.typescript), features.typescript);
    assert.equal(Boolean(pkg.devDependencies.tailwindcss), features.tailwind);
    assert.equal(Boolean(pkg.devDependencies.eslint), features.eslint);

    for (const [fileName, contents] of files) {
      assert.equal(typeof contents, 'string', fileName);
      assert.ok(contents.endsWith('\n'), `${fileName} must end with a newline`);
      assert.ok(!contents.includes('aouos/react-vite'), `${fileName} has an old repository URL`);
    }

    assert.equal(files.size, getTemplateFiles(features, 'matrix-app').length);
  }
});

test('shadcn feature emits ui scaffolding, aliases, and vendored-code ignores', () => {
  // shadcn implies TypeScript + Tailwind; add ESLint so the vendored-code ignores appear too.
  const features = normalizeFeatures(featuresFromKeys(['shadcn', 'eslint']));
  const files = filesAsMap(features, 'shadcn-app');

  assert.ok(files.has('components.json'));
  assert.ok(files.has('src/lib/utils.ts'));
  assert.ok(files.has('src/components/ui/button.tsx'));

  // @/ alias wired into both Vite and TypeScript.
  assert.match(files.get('vite.config.ts'), /fileURLToPath/);
  assert.match(files.get('vite.config.ts'), /'@': fileURLToPath/);
  assert.match(files.get('tsconfig.app.json'), /"@\/\*": \["\.\/src\/\*"\]/);

  // shadcn theme replaces the plain Tailwind entry CSS.
  assert.match(files.get('src/index.css'), /@theme inline/);
  assert.match(files.get('src/index.css'), /tw-animate-css/);

  // Vendored ui/ is excluded from the generated project's lint + format.
  assert.match(files.get('eslint.config.js'), /'src\/components\/ui'/);
  assert.match(files.get('.prettierignore'), /src\/components\/ui\//);

  // cn() helper and pinned shadcn dependencies are present.
  assert.match(files.get('src/lib/utils.ts'), /export function cn\(/);
  const pkg = buildGeneratedPackageJson(features, 'shadcn-app');
  assert.ok(pkg.dependencies['class-variance-authority']);
  assert.ok(pkg.dependencies.clsx);
  assert.ok(pkg.dependencies['tailwind-merge']);
  assert.ok(pkg.dependencies['@radix-ui/react-slot']);
  assert.ok(pkg.devDependencies['tw-animate-css']);
});

test('generated HTML escapes project names and points to the correct source extension', () => {
  const jsFiles = filesAsMap(
    { typescript: false, tailwind: false, router: false, eslint: false, zustand: false },
    '<demo>',
  );
  const tsFiles = filesAsMap(
    { typescript: true, tailwind: false, router: false, eslint: false, zustand: false },
    'ts-app',
  );

  assert.match(jsFiles.get('index.html'), /src\/main\.jsx/);
  assert.match(jsFiles.get('index.html'), /&lt;demo&gt;/);
  assert.match(tsFiles.get('index.html'), /src\/main\.tsx/);
});
