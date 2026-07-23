/**
 * All generated project files come from the string template functions in this module.
 * Generated output must stay stable under the generated projects' own Prettier config
 * (printWidth 100): running "prettier --write" on a fresh project must be a no-op.
 * That is why some templates (e.g. addedPageSource) use const title/source indirection
 * instead of long inline JSX strings, and why featureArray switches to multi-line form.
 *
 * Router and layout templates embed anchor comments — "// rv:route" in src/router.*,
 * "{/* rv:nav *\/}" in RootLayout — that "rv add page" uses to insert new routes and
 * navigation links. Removing the anchors downgrades rv add to printing manual steps.
 */
import { selectedFeatureNames, shadcnEnabled } from './features.js';

function withNewline(/** @type {string} */ value) {
  return `${value.trim()}\n`;
}

function sourceExtension(/** @type {Features} */ features) {
  return features.typescript ? 'tsx' : 'jsx';
}

function configExtension(/** @type {Features} */ features) {
  return features.typescript ? 'ts' : 'js';
}

function escapeHtml(/** @type {string} */ value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Renders the selected-features array literal, breaking onto multiple lines exactly
// when Prettier (printWidth 100) would, so generated files stay format-stable.
function featureArray(/** @type {Features} */ features) {
  const names = selectedFeatureNames(features);
  const values = names.length > 0 ? names : ['Minimal React + Vite'];
  const quoted = values.map((name) => `'${name.replaceAll("'", "\\'")}'`);
  const singleLine = `[${quoted.join(', ')}]`;

  if (`const selectedFeatures = ${singleLine};`.length <= 100) {
    return singleLine;
  }

  return `[\n${quoted.map((value) => `  ${value},`).join('\n')}\n]`;
}

function indexHtml(/** @type {Features} */ features, /** @type {string} */ projectName) {
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

function viteConfig(/** @type {Features} */ features) {
  const shadcn = shadcnEnabled(features);
  const imports = [
    "import { defineConfig } from 'vite';",
    "import react from '@vitejs/plugin-react';",
  ];
  const plugins = ['react()'];

  if (features.tailwind) {
    imports.push("import tailwindcss from '@tailwindcss/vite';");
    plugins.push('tailwindcss()');
  }
  if (shadcn) {
    imports.unshift("import { fileURLToPath } from 'node:url';");
  }

  const resolve = shadcn
    ? `
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },`
    : '';

  return withNewline(`
${imports.join('\n')}

export default defineConfig({
  plugins: [${plugins.join(', ')}],${resolve}
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

function tsconfigApp(/** @type {Features} */ features) {
  // paths without baseUrl (resolved relative to this file) — baseUrl is deprecated in TS 6.
  const paths = shadcnEnabled(features)
    ? `,
    "paths": {
      "@/*": ["./src/*"]
    }`
    : '';
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
    "erasableSyntaxOnly": true${paths}
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

function indexCss(/** @type {Features} */ features) {
  if (shadcnEnabled(features)) {
    return shadcnIndexCss();
  }

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

// The standard shadcn/ui (Tailwind v4, "new-york", neutral base) theme: design tokens as
// CSS variables for light and dark, mapped into Tailwind via @theme inline. Kept byte-stable
// under the generated project's Prettier config so format:check on a fresh project is a no-op.
function shadcnIndexCss() {
  return withNewline(`
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`);
}

function mainSource(/** @type {Features} */ features) {
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

function featurePills(/** @type {Features} */ features, /** @type {boolean} */ tailwind) {
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

function appSource(/** @type {Features} */ features) {
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

function storeSource(/** @type {Features} */ features) {
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

function counterSource(/** @type {Features} */ features) {
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
import Home from './pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'about',
        lazy: async () => ({ Component: (await import('./pages/About')).default }),
      },
      // rv:route
    ],
  },
]);
`);
}

function rootLayoutSource(/** @type {Features} */ features) {
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

function homeSource(/** @type {Features} */ features) {
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

function aboutSource(/** @type {Features} */ features) {
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

function eslintConfig(/** @type {Features} */ features) {
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

  const ignores = shadcnEnabled(features)
    ? "['dist', 'node_modules', 'src/components/ui']"
    : "['dist', 'node_modules']";

  return withNewline(`
${imports.join('\n')}

export default defineConfig([
  globalIgnores(${ignores}),
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

function vscodeExtensions(/** @type {Features} */ features) {
  const recommendations = [];
  if (features.eslint) {
    recommendations.push('dbaeumer.vscode-eslint', 'esbenp.prettier-vscode');
  }
  if (features.tailwind) {
    recommendations.push('bradlc.vscode-tailwindcss');
  }
  const quoted = recommendations.map((extension) => `"${extension}"`);
  const singleLine = `[${quoted.join(', ')}]`;
  // Match Prettier's printWidth-100 decision so the generated file is format-stable.
  const list =
    `  "recommendations": ${singleLine}`.length <= 100
      ? singleLine
      : `[\n${quoted.map((value) => `    ${value}`).join(',\n')}\n  ]`;
  return withNewline(`
{
  "recommendations": ${list}
}
`);
}

function prettierIgnore(/** @type {Features} */ features) {
  const lines = ['node_modules/', 'dist/', 'coverage/'];
  if (shadcnEnabled(features)) {
    lines.push('src/components/ui/');
  }
  return withNewline(`\n${lines.join('\n')}\n`);
}

/**
 * Renders the source for a page created by "rv add page". Uses const title/source
 * indirection so long paths never push JSX lines past Prettier's printWidth.
 * @param {Features} features - Detected feature map (typescript, tailwind, ...).
 * @param {string} componentName - PascalCase page component name.
 * @returns {string} Page module source code.
 */
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

/**
 * Renders the source for a component created by "rv add component".
 * @param {Features} features - Detected feature map (typescript, tailwind, ...).
 * @param {string} componentName - PascalCase component name.
 * @returns {string} Component module source code.
 */
export function addedComponentSource(features, componentName) {
  const title = componentName.replace(/(?<!^)([A-Z])/gu, ' $1');
  const extension = sourceExtension(features);
  const constants = [
    `const title = '${title}';`,
    `const source = 'src/components/${componentName}.${extension}';`,
  ].join('\n');

  if (features.tailwind) {
    return withNewline(`
${constants}

export default function ${componentName}() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        This component was generated by rv add component. Build it out in{' '}
        <code className="rounded bg-slate-100 px-2 py-1">{source}</code>.
      </p>
    </section>
  );
}
`);
  }

  return withNewline(`
${constants}

export default function ${componentName}() {
  return (
    <section>
      <h2>{title}</h2>
      <p>
        This component was generated by rv add component. Build it out in <code>{source}</code>.
      </p>
    </section>
  );
}
`);
}

/**
 * Renders the source for a Zustand store created by "rv add store".
 * @param {Features} features - Detected feature map; typescript switches to a typed store.
 * @param {string} hookName - Hook name such as useCart.
 * @param {string} typeName - State type name used in the TypeScript variant.
 * @returns {string} Store module source code.
 */
export function addedStoreSource(features, hookName, typeName) {
  if (features.typescript) {
    return withNewline(`
import { create } from 'zustand';

type ${typeName} = {
  items: string[];
  add: (item: string) => void;
  clear: () => void;
};

export const ${hookName} = create<${typeName}>((set) => ({
  items: [],
  add: (item) => set((state) => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] }),
}));
`);
  }

  return withNewline(`
import { create } from 'zustand';

export const ${hookName} = create((set) => ({
  items: [],
  add: (item) => set((state) => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] }),
}));
`);
}

/**
 * Renders the source for a React hook created by "rv add hook". The example holds a
 * single value with a reset helper; the state shape is name-agnostic on purpose.
 * @param {Features} features - Detected feature map; typescript adds a generic value type.
 * @param {string} hookName - Hook name such as useCart.
 * @returns {string} Hook module source code.
 */
export function addedHookSource(features, hookName) {
  const doc =
    '/**\n * Example hook generated by rv add hook. Replace the state and return value with your own.\n */';

  if (features.typescript) {
    return withNewline(`
import { useCallback, useState } from 'react';

${doc}
export function ${hookName}<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  return { value, setValue, reset };
}
`);
  }

  return withNewline(`
import { useCallback, useState } from 'react';

${doc}
export function ${hookName}(initialValue) {
  const [value, setValue] = useState(initialValue);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  return { value, setValue, reset };
}
`);
}

/**
 * Renders the source for a layout created by "rv add layout". Uses const title
 * indirection so long names never push the JSX past Prettier's printWidth, and renders
 * an <Outlet /> so the layout can wrap a group of nested routes.
 * @param {Features} features - Detected feature map (typescript, tailwind, ...).
 * @param {string} componentName - PascalCase layout name ending in "Layout".
 * @returns {string} Layout module source code.
 */
export function addedLayoutSource(features, componentName) {
  const title = componentName.replace(/(?<!^)([A-Z])/gu, ' $1');
  const constant = `const title = '${title}';`;

  if (features.tailwind) {
    return withNewline(`
import { Outlet } from 'react-router-dom';

${constant}

export default function ${componentName}() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <p className="text-sm font-bold tracking-tight text-slate-700">{title}</p>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
`);
  }

  return withNewline(`
import { Outlet } from 'react-router-dom';

${constant}

export default function ${componentName}() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <p className="brand">{title}</p>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
`);
}

// The shadcn/ui config file that "npx shadcn add <component>" reads. Points at the project's
// @/ aliases and the Tailwind-v4 CSS-variables theme in src/index.css.
function shadcnComponentsJson() {
  return withNewline(`
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
`);
}

// The cn() helper every shadcn component imports from @/lib/utils: clsx for conditional
// classes, tailwind-merge to resolve conflicting Tailwind utilities.
function shadcnUtils() {
  return withNewline(`
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`);
}

// The canonical shadcn/ui Button (new-york), emitted verbatim into src/components/ui so it is
// byte-identical to what "npx shadcn add button" produces and can be upgraded in place. That
// directory is excluded from the generated project's ESLint and Prettier runs (vendored code),
// so this source only has to satisfy TypeScript, not the project's lint/format rules.
function shadcnButton() {
  return withNewline(`
import { type ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
`);
}

/**
 * Builds the full list of template files for the selected features (package.json excluded).
 * @param {Features} features - Map of feature key to boolean.
 * @param {string} projectName - Project name used in index.html.
 * @returns {TemplateFile[]} Files as { path, contents }, sorted by path.
 */
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
      { path: `src/router.${extension}`, contents: routerSource() },
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
      { path: 'tsconfig.app.json', contents: tsconfigApp(features) },
      { path: 'tsconfig.node.json', contents: tsconfigNode() },
    );
  }

  if (features.eslint) {
    files.push(
      { path: 'eslint.config.js', contents: eslintConfig(features) },
      { path: '.prettierrc.json', contents: prettierConfig() },
      { path: '.prettierignore', contents: prettierIgnore(features) },
    );
  }

  if (shadcnEnabled(features)) {
    files.push(
      { path: 'components.json', contents: shadcnComponentsJson() },
      { path: 'src/lib/utils.ts', contents: shadcnUtils() },
      { path: 'src/components/ui/button.tsx', contents: shadcnButton() },
    );
  }

  if (features.eslint || features.tailwind) {
    files.push({
      path: '.vscode/extensions.json',
      contents: vscodeExtensions(features),
    });
  }

  return files.sort((left, right) => left.path.localeCompare(right.path));
}
