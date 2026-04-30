// NOTE: rollup outputs CJS; __dirname works at runtime. If this is ever
// migrated to ESM, switch TEMPLATES_DIR resolution to fileURLToPath(import.meta.url).
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const STATIC_DIR = path.join(TEMPLATES_DIR, 'static');

function ext(features) {
  return features.typescript ? 'tsx' : 'jsx';
}

function scriptExt(features) {
  return features.typescript ? 'ts' : 'js';
}

function indexHtml(features, projectName) {
  const mainExt = ext(features);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${mainExt}"></script>
  </body>
</html>
`;
}

function viteConfig(features) {
  const imports = [
    `import { defineConfig } from 'vite';`,
    `import react from '@vitejs/plugin-react';`,
  ];
  const plugins = ['react()'];
  if (features.tailwind) {
    imports.push(`import tailwindcss from '@tailwindcss/vite';`);
    plugins.push('tailwindcss()');
  }
  return `${imports.join('\n')}

export default defineConfig({
  plugins: [${plugins.join(', ')}],
});
`;
}

function tsconfig() {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src', 'vite.config.ts'],
      },
      null,
      2
    ) + '\n'
  );
}

function viteEnvDts() {
  return `/// <reference types="vite/client" />
`;
}

function indexCss(features) {
  if (features.tailwind) {
    return `@import "tailwindcss";
`;
  }
  return `body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
`;
}

function mainFile(features) {
  const imports = [
    `import React from 'react';`,
    `import ReactDOM from 'react-dom/client';`,
    `import './index.css';`,
  ];
  let root;
  if (features.router) {
    imports.push(`import { RouterProvider } from 'react-router-dom';`);
    imports.push(`import { router } from './router';`);
    root = `<RouterProvider router={router} />`;
  } else {
    imports.push(`import App from './App';`);
    root = `<App />`;
  }
  return `${imports.join('\n')}

ReactDOM.createRoot(document.getElementById('root')${
    features.typescript ? '!' : ''
  }).render(
  <React.StrictMode>
    ${root}
  </React.StrictMode>,
);
`;
}

function appFile(features) {
  const imports = [];
  if (features.zustand)
    imports.push(`import { useCounter } from './store/useCounter';`);
  const counterBlock = features.zustand
    ? features.tailwind
      ? `      <button
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={increment}
      >
        count is {count}
      </button>`
      : `      <button onClick={increment} style={{ marginTop: 16 }}>
        count is {count}
      </button>`
    : '';

  const hook = features.zustand
    ? `  const count = useCounter((s) => s.count);
  const increment = useCounter((s) => s.increment);
`
    : '';

  if (features.tailwind) {
    return `${imports.join('\n')}${imports.length ? '\n\n' : ''}function App() {
${hook}  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Hello from rv</h1>
      <p className="mt-2 text-gray-600">Edit <code>src/App.${ext(
        features
      )}</code> and save to reload.</p>
${counterBlock}
    </div>
  );
}

export default App;
`;
  }

  return `${imports.join('\n')}${imports.length ? '\n\n' : ''}function App() {
${hook}  return (
    <div style={{ padding: 32, fontFamily: 'system-ui' }}>
      <h1>Hello from rv</h1>
      <p>Edit <code>src/App.${ext(features)}</code> and save to reload.</p>
${counterBlock}
    </div>
  );
}

export default App;
`;
}

function routerFile() {
  return `import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
]);
`;
}

function homePage(features) {
  const linkClass = features.tailwind
    ? ' className="text-blue-600 underline"'
    : '';
  const wrapClass = features.tailwind
    ? ' className="min-h-screen p-8"'
    : ' style={{ padding: 32 }}';
  const storeImport = features.zustand
    ? `import { useCounter } from '../store/useCounter';\n`
    : '';
  const hook = features.zustand
    ? `  const count = useCounter((s) => s.count);
  const increment = useCounter((s) => s.increment);
`
    : '';
  const counterBtn = features.zustand
    ? features.tailwind
      ? `\n      <button
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={increment}
      >
        count is {count}
      </button>`
      : `\n      <button onClick={increment} style={{ marginTop: 16, display: 'block' }}>
        count is {count}
      </button>`
    : '';
  return `import { Link } from 'react-router-dom';
${storeImport}
export default function Home() {
${hook}  return (
    <div${wrapClass}>
      <h1>Home</h1>
      <Link to="/about"${linkClass}>Go to About</Link>${counterBtn}
    </div>
  );
}
`;
}

function aboutPage(features) {
  const linkClass = features.tailwind
    ? ' className="text-blue-600 underline"'
    : '';
  const wrapClass = features.tailwind
    ? ' className="min-h-screen p-8"'
    : ' style={{ padding: 32 }}';
  return `import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div${wrapClass}>
      <h1>About</h1>
      <Link to="/"${linkClass}>Back home</Link>
    </div>
  );
}
`;
}

function zustandStore(features) {
  if (features.typescript) {
    return `import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounter = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
`;
  }
  return `import { create } from 'zustand';

export const useCounter = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
`;
}

function eslintFlatConfig(features) {
  if (features.typescript) {
    return `import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
`;
  }
  return `import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist'] },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  prettier,
];
`;
}

function prettierrc() {
  return (
    JSON.stringify(
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 100,
      },
      null,
      2
    ) + '\n'
  );
}

function readme(projectName) {
  return `# ${projectName}

Scaffolded with [rv](https://github.com/aouos/react-vite).

## Scripts

- \`npm run dev\` — start dev server
- \`npm run build\` — production build
- \`npm run preview\` — preview built output
`;
}

function getFiles(features, projectName) {
  const e = ext(features);
  const se = scriptExt(features);
  const files = [];

  // Static files (copied from templates/static)
  files.push({
    dest: '.gitignore',
    source: path.join(STATIC_DIR, '_gitignore'),
  });
  files.push({
    dest: 'public/vite.svg',
    source: path.join(STATIC_DIR, 'public/vite.svg'),
  });

  // Generated files
  files.push({
    dest: 'index.html',
    contents: indexHtml(features, projectName),
  });
  files.push({ dest: `vite.config.${se}`, contents: viteConfig(features) });
  files.push({ dest: `src/main.${e}`, contents: mainFile(features) });
  files.push({ dest: `src/index.css`, contents: indexCss(features) });
  files.push({ dest: 'README.md', contents: readme(projectName) });

  if (features.router) {
    files.push({ dest: `src/router.${e}`, contents: routerFile() });
    files.push({ dest: `src/pages/Home.${e}`, contents: homePage(features) });
    files.push({ dest: `src/pages/About.${e}`, contents: aboutPage(features) });
  } else {
    files.push({ dest: `src/App.${e}`, contents: appFile(features) });
  }

  if (features.typescript) {
    files.push({ dest: 'tsconfig.json', contents: tsconfig() });
    files.push({ dest: 'src/vite-env.d.ts', contents: viteEnvDts() });
  }

  // Tailwind v4 needs no config files by default — the @tailwindcss/vite plugin
  // plus `@import "tailwindcss"` in index.css is enough.

  if (features.zustand) {
    files.push({
      dest: `src/store/useCounter.${se}`,
      contents: zustandStore(features),
    });
  }

  if (features.eslint) {
    files.push({
      dest: 'eslint.config.js',
      contents: eslintFlatConfig(features),
    });
    files.push({ dest: '.prettierrc', contents: prettierrc() });
  }

  return files;
}

module.exports = { getFiles, TEMPLATES_DIR, STATIC_DIR };
