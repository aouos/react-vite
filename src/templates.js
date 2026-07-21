import { selectedFeatureNames } from './features.js';

function withNewline(value) {
  return `${value.trim()}\n`;
}

function sourceExtension(features) {
  return features.typescript ? 'tsx' : 'jsx';
}

function configExtension(features) {
  return features.typescript ? 'ts' : 'js';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function featureArray(features) {
  const names = selectedFeatureNames(features);
  const values = names.length > 0 ? names : ['Minimal React + Vite'];
  const quoted = values.map((name) => `'${name.replaceAll("'", "\\'")}'`);
  const singleLine = `[${quoted.join(', ')}]`;

  if (`const selectedFeatures = ${singleLine};`.length <= 100) {
    return singleLine;
  }

  return `[\n${quoted.map((value) => `  ${value},`).join('\n')}\n]`;
}

function indexHtml(features, projectName) {
  const extension = sourceExtension(features);
  const title = escapeHtml(projectName);
  return withNewline(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${title}, created with rv" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${extension}"></script>
  </body>
</html>
`);
}

function viteConfig(features) {
  const imports = [
    "import { defineConfig } from 'vite';",
    "import react from '@vitejs/plugin-react';",
  ];
  const plugins = ['react()'];

  if (features.tailwind) {
    imports.push("import tailwindcss from '@tailwindcss/vite';");
    plugins.push('tailwindcss()');
  }

  return withNewline(`
${imports.join('\n')}

export default defineConfig({
  plugins: [${plugins.join(', ')}],
});
`);
}

function gitignore() {
  return withNewline(`
node_modules/
dist/
*.local
.env
.env.*
!.env.example
.DS_Store
.vscode/*
!.vscode/extensions.json
.idea/
*.log
`);
}

function tsconfigRoot() {
  return withNewline(`
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
`);
}

function tsconfigApp() {
  return withNewline(`
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "erasableSyntaxOnly": true
  },
  "include": ["src"]
}
`);
}

function tsconfigNode() {
  return withNewline(`
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "NodeNext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "erasableSyntaxOnly": true
  },
  "include": ["vite.config.ts"]
}
`);
}

function indexCss(features) {
  if (features.tailwind) {
    return withNewline(`
@import 'tailwindcss';
`);
  }

  return withNewline(`
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #172033;
  background: #f4f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
a {
  font: inherit;
}

a {
  color: inherit;
}

button {
  cursor: pointer;
}

#root {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  padding: 72px 24px;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.14), transparent 30%),
    #f4f7fb;
}

.card {
  width: min(760px, 100%);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(16px);
}

.eyebrow {
  margin: 0 0 10px;
  color: #4f46e5;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 7vw, 4.7rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

h2 {
  margin: 0;
  color: #0f172a;
}

.lead {
  max-width: 620px;
  margin: 22px 0 0;
  color: #526078;
  font-size: 1.08rem;
  line-height: 1.75;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.feature-pill {
  padding: 8px 12px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  color: #334155;
  background: #f8fafc;
  font-size: 0.9rem;
  font-weight: 650;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 17px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #1e293b;
  background: #fff;
  font-weight: 700;
  text-decoration: none;
}

.button:hover {
  border-color: #818cf8;
  color: #4338ca;
}

.counter {
  margin-top: 34px;
  padding: 22px;
  border: 1px solid #dbe4f0;
  border-radius: 18px;
  background: #f8fafc;
}

.counter-label {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.counter-button {
  width: 42px;
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #312e81;
  background: #fff;
  font-size: 1.25rem;
  font-weight: 800;
}

.counter-button:hover {
  border-color: #6366f1;
}

.counter-value {
  min-width: 48px;
  color: #0f172a;
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  text-align: center;
}

.site-shell {
  min-height: 100vh;
  background: #f4f7fb;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px max(24px, calc((100vw - 1080px) / 2));
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
}

.brand {
  color: #312e81;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 12px;
  border-radius: 10px;
  color: #64748b;
  font-weight: 700;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.active {
  color: #3730a3;
  background: #eef2ff;
}

.page {
  width: min(1080px, calc(100% - 48px));
  margin: 0 auto;
  padding: 72px 0;
}

.page-card {
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

@media (max-width: 640px) {
  .app-shell,
  .page {
    padding-top: 36px;
    padding-bottom: 36px;
  }

  .site-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
`);
}

function mainSource(features) {
  const extension = sourceExtension(features);
  const targetAssertion = features.typescript ? '!' : '';
  const appImport = features.router
    ? "import { RouterProvider } from 'react-router-dom';\nimport { router } from './router';"
    : "import App from './App';";
  const root = features.router ? '<RouterProvider router={router} />' : '<App />';

  return withNewline(`
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
${appImport}

createRoot(document.getElementById('root')${targetAssertion}).render(
  <StrictMode>
    ${root}
  </StrictMode>,
);
`);
}

function featurePills(features, tailwind) {
  const list = featureArray(features);
  if (tailwind) {
    return `
const selectedFeatures = ${list};

function FeatureList() {
  return (
    <ul className="mt-8 flex flex-wrap gap-2" aria-label="Selected features">
      {selectedFeatures.map((feature) => (
        <li
          key={feature}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          {feature}
        </li>
      ))}
    </ul>
  );
}`;
  }

  return `
const selectedFeatures = ${list};

function FeatureList() {
  return (
    <ul className="feature-list" aria-label="Selected features">
      {selectedFeatures.map((feature) => (
        <li key={feature} className="feature-pill">
          {feature}
        </li>
      ))}
    </ul>
  );
}`;
}

function appSource(features) {
  const counterImport = features.zustand
    ? "import Counter from './components/Counter';\n"
    : '';
  const pills = featurePills(features, features.tailwind);
  const counter = features.zustand ? '\n        <Counter />' : '';

  if (features.tailwind) {
    return withNewline(`
${counterImport}${pills}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-14">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
          React + Vite
        </p>
        <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Your project is ready.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Start in <code className="rounded bg-slate-100 px-2 py-1">src/App.${sourceExtension(features)}</code>,
          then run your project with <code className="rounded bg-slate-100 px-2 py-1">npm run dev</code>.
        </p>
        <FeatureList />${counter}
      </section>
    </main>
  );
}
`);
  }

  return withNewline(`
${counterImport}${pills}

export default function App() {
  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">React + Vite</p>
        <h1>Your project is ready.</h1>
        <p className="lead">
          Start in <code>src/App.${sourceExtension(features)}</code>, then run your project with{' '}
          <code>npm run dev</code>.
        </p>
        <FeatureList />${counter}
      </section>
    </main>
  );
}
`);
}

function storeSource(features) {
  if (features.typescript) {
    return withNewline(`
import { create } from 'zustand';

type CounterState = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useCounter = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`);
  }

  return withNewline(`
import { create } from 'zustand';

export const useCounter = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`);
}

function counterSource(features) {
  if (features.tailwind) {
    return withNewline(`
import { useCounter } from '../store/useCounter';

export default function Counter() {
  const count = useCounter((state) => state.count);
  const increment = useCounter((state) => state.increment);
  const decrement = useCounter((state) => state.decrement);
  const reset = useCounter((state) => state.reset);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
        Zustand counter
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-xl font-bold hover:border-indigo-500"
          onClick={decrement}
          aria-label="Decrease counter"
        >
          −
        </button>
        <output className="min-w-12 text-center text-2xl font-black tabular-nums">{count}</output>
        <button
          type="button"
          className="h-11 w-11 rounded-xl border border-slate-300 bg-white text-xl font-bold hover:border-indigo-500"
          onClick={increment}
          aria-label="Increase counter"
        >
          +
        </button>
        <button
          type="button"
          className="ml-1 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
`);
  }

  return withNewline(`
import { useCounter } from '../store/useCounter';

export default function Counter() {
  const count = useCounter((state) => state.count);
  const increment = useCounter((state) => state.increment);
  const decrement = useCounter((state) => state.decrement);
  const reset = useCounter((state) => state.reset);

  return (
    <section className="counter">
      <p className="counter-label">Zustand counter</p>
      <div className="counter-controls">
        <button
          type="button"
          className="counter-button"
          onClick={decrement}
          aria-label="Decrease counter"
        >
          −
        </button>
        <output className="counter-value">{count}</output>
        <button
          type="button"
          className="counter-button"
          onClick={increment}
          aria-label="Increase counter"
        >
          +
        </button>
        <button type="button" className="button" onClick={reset}>
          Reset
        </button>
      </div>
    </section>
  );
}
`);
}

function routerSource() {
  return withNewline(`
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import About from './pages/About';
import Home from './pages/Home';
// rv:import

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      // rv:route
    ],
  },
]);
`);
}

function rootLayoutSource(features) {
  const navParameter = features.typescript
    ? '{ isActive }: { isActive: boolean }'
    : '{ isActive }';

  if (features.tailwind) {
    return withNewline(`
import { NavLink, Outlet } from 'react-router-dom';

function navClassName(${navParameter}) {
  return [
    'rounded-xl px-3 py-2 text-sm font-bold transition',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="text-xl font-black tracking-tight text-indigo-800">
            rv
          </NavLink>
          <nav className="flex gap-1" aria-label="Primary navigation">
            <NavLink to="/" end className={navClassName}>
              Home
            </NavLink>
            <NavLink to="/about" className={navClassName}>
              About
            </NavLink>
            {/* rv:nav */}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
`);
  }

  return withNewline(`
import { NavLink, Outlet } from 'react-router-dom';

function navClassName(${navParameter}) {
  return isActive ? 'nav-link active' : 'nav-link';
}

export default function RootLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          rv
        </NavLink>
        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/" end className={navClassName}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            About
          </NavLink>
          {/* rv:nav */}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
`);
}

function homeSource(features) {
  const counterImport = features.zustand
    ? "import Counter from '../components/Counter';\n"
    : '';
  const pills = featurePills(features, features.tailwind);
  const counter = features.zustand ? '\n        <Counter />' : '';

  if (features.tailwind) {
    return withNewline(`
import { Link } from 'react-router-dom';
${counterImport}${pills}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-14">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
          React Router
        </p>
        <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Your project is ready.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          This route is rendered by React Router. Open the About page to verify navigation, then
          begin building your application.
        </p>
        <FeatureList />${counter}
        <div className="mt-8">
          <Link
            to="/about"
            className="inline-flex rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700"
          >
            Open About
          </Link>
        </div>
      </section>
    </main>
  );
}
`);
  }

  return withNewline(`
import { Link } from 'react-router-dom';
${counterImport}${pills}

export default function Home() {
  return (
    <main className="page">
      <section className="page-card">
        <p className="eyebrow">React Router</p>
        <h1>Your project is ready.</h1>
        <p className="lead">
          This route is rendered by React Router. Open the About page to verify navigation, then
          begin building your application.
        </p>
        <FeatureList />${counter}
        <div className="actions">
          <Link to="/about" className="button">
            Open About
          </Link>
        </div>
      </section>
    </main>
  );
}
`);
}

function aboutSource(features) {
  if (features.tailwind) {
    return withNewline(`
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-14">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
          About this starter
        </p>
        <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Small by default.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          rv only adds the features selected during setup, so the generated project stays easy to
          understand and extend.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 hover:border-indigo-500 hover:text-indigo-700"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
`);
  }

  return withNewline(`
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="page">
      <section className="page-card">
        <p className="eyebrow">About this starter</p>
        <h1>Small by default.</h1>
        <p className="lead">
          rv only adds the features selected during setup, so the generated project stays easy to
          understand and extend.
        </p>
        <div className="actions">
          <Link to="/" className="button">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
`);
}

function eslintConfig(features) {
  const extensions = features.typescript ? 'ts,tsx' : 'js,jsx';
  const imports = [
    "import eslint from '@eslint/js';",
    "import eslintConfigPrettier from 'eslint-config-prettier';",
    "import globals from 'globals';",
    "import reactHooks from 'eslint-plugin-react-hooks';",
    "import reactRefresh from 'eslint-plugin-react-refresh';",
    "import { defineConfig, globalIgnores } from 'eslint/config';",
  ];
  const configItems = [
    'eslint.configs.recommended',
    ...(features.typescript ? ['...typescriptEslint.configs.recommended'] : []),
    'reactHooks.configs.flat.recommended',
    'reactRefresh.configs.vite',
    'eslintConfigPrettier',
  ];

  if (features.typescript) {
    imports.splice(5, 0, "import typescriptEslint from 'typescript-eslint';");
  }

  return withNewline(`
${imports.join('\n')}

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{${extensions}}'],
    extends: [
      ${configItems.join(',\n      ')},
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
  },
]);
`);
}

function prettierConfig() {
  return withNewline(`
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
`);
}

function prettierIgnore() {
  return withNewline(`
node_modules/
dist/
coverage/
`);
}

export function addedPageSource(features, componentName) {
  const title = componentName.replace(/(?<!^)([A-Z])/gu, ' $1');
  const extension = sourceExtension(features);
  const constants = [
    `const title = '${title}';`,
    `const source = 'src/pages/${componentName}.${extension}';`,
  ].join('\n');

  if (features.tailwind) {
    return withNewline(`
${constants}

export default function ${componentName}() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          This page was generated by rv add page. Build it out in{' '}
          <code className="rounded bg-slate-100 px-2 py-1">{source}</code>.
        </p>
      </section>
    </main>
  );
}
`);
  }

  return withNewline(`
${constants}

export default function ${componentName}() {
  return (
    <main className="page">
      <section className="page-card">
        <p className="eyebrow">{title}</p>
        <h1>{title}</h1>
        <p className="lead">
          This page was generated by rv add page. Build it out in <code>{source}</code>.
        </p>
      </section>
    </main>
  );
}
`);
}

export function getTemplateFiles(features, projectName) {
  const extension = sourceExtension(features);
  const configExt = configExtension(features);
  const files = [
    { path: '.gitignore', contents: gitignore() },
    { path: 'index.html', contents: indexHtml(features, projectName) },
    { path: `vite.config.${configExt}`, contents: viteConfig(features) },
    { path: `src/main.${extension}`, contents: mainSource(features) },
    { path: 'src/index.css', contents: indexCss(features) },
  ];

  if (features.router) {
    files.push(
      { path: `src/router.${extension}`, contents: routerSource(features) },
      {
        path: `src/layouts/RootLayout.${extension}`,
        contents: rootLayoutSource(features),
      },
      { path: `src/pages/Home.${extension}`, contents: homeSource(features) },
      { path: `src/pages/About.${extension}`, contents: aboutSource(features) },
    );
  } else {
    files.push({ path: `src/App.${extension}`, contents: appSource(features) });
  }

  if (features.zustand) {
    files.push(
      {
        path: `src/store/useCounter.${configExt}`,
        contents: storeSource(features),
      },
      {
        path: `src/components/Counter.${extension}`,
        contents: counterSource(features),
      },
    );
  }

  if (features.typescript) {
    files.push(
      { path: 'tsconfig.json', contents: tsconfigRoot() },
      { path: 'tsconfig.app.json', contents: tsconfigApp() },
      { path: 'tsconfig.node.json', contents: tsconfigNode() },
    );
  }

  if (features.eslint) {
    files.push(
      { path: 'eslint.config.js', contents: eslintConfig(features) },
      { path: '.prettierrc.json', contents: prettierConfig() },
      { path: '.prettierignore', contents: prettierIgnore() },
    );
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}
