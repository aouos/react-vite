<h1 align="center">
React Vite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/v/react-vite.svg" alt="Version" />
  </a>
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/dw/react-vite.svg" alt="Downloads per week" />
  </a>
  <a href="https://github.com/boltguo/react-vite/actions/workflows/ci.yml">
    <img src="https://github.com/boltguo/react-vite/actions/workflows/ci.yml/badge.svg" alt="CI status" />
  </a>
  <img src="https://img.shields.io/node/v/react-vite.svg" alt="Supported Node versions" />
  <img src="https://img.shields.io/npm/l/react-vite.svg" alt="License" />
</p>

<p align="center">English | <a href="README.zh-CN.md">简体中文</a> | <a href="README.ja.md">日本語</a></p>

> Scaffold a minimal React + Vite project with optional TypeScript, Tailwind
> CSS, React Router, ESLint + Prettier, Zustand, and shadcn/ui — pick only
> what you need, get a project that boots immediately.

## Why `rv` instead of `npm create vite@latest`?

The official Vite scaffold only asks you to pick a framework and a JS/TS
variant. It does not know about Tailwind, Router, state management, or
linting — after generating, you still have to wire those up by hand.

`rv` covers those extras:

| What you get                             | `npm create vite@latest`       | `rv`                            |
| ---------------------------------------- | ------------------------------ | ------------------------------- |
| React + Vite baseline                    | Yes                            | Yes                             |
| TypeScript variant                       | Yes                            | Yes                             |
| **Tailwind v4 (fully wired)**            | No — manual setup              | Yes — plugin + `@import` in CSS |
| **React Router with a working demo**     | No                             | Yes — 2 routes (`/`, `/about`)  |
| **Zustand store + counter demo**         | No                             | Yes                             |
| **shadcn/ui (Tailwind v4) ready**        | No                             | Yes — theme, `cn()`, example `Button` |
| **ESLint flat config + Prettier**        | ESLint only, no Prettier       | Both, TS-aware when TS is on    |
| **`git init` + editor recommendations**  | No                             | Yes — plus `.vscode/extensions.json` |
| **Init into an existing directory**      | No (`create-*` makes new dirs) | Yes — `rv init` with safe merge |
| **Generators after scaffolding**         | No                             | Yes — `rv add page/component/store/hook/layout` |
| **Project health check**                 | No                             | Yes — `rv doctor`               |
| **Runs install for you (npm/pnpm/yarn)** | No                             | Yes — prompts for PM on PATH    |

Every feature is opt-in. Select none and you get the same minimal output as
Vite's own template — no extra files or dependencies.

## Requirements

Node.js `^20.19.0 || ^22.13.0 || >=24.0.0` (same range the generated
projects target).

## Install

```bash
npm install -g react-vite
# or
pnpm add -g react-vite
# or
yarn global add react-vite
```

Two equivalent global commands are installed: `rv` (short) and `react-vite`
(fallback if `rv` ever collides with an alias on your machine). You can also
run it without installing:

```bash
npx react-vite create my-app
```

## Usage

### Create a new project

```bash
rv create my-app
```

Creates `./my-app` (the directory must be empty or missing), asks which
features you want and which package manager should install dependencies,
then scaffolds the project and runs `git init` (skipped with `--no-git`, or
automatically when you are already inside a git repository or git is not
installed — the first commit is always left to you). Omit the directory
argument to be prompted for it.

### Initialize in the current directory

```bash
mkdir my-app && cd my-app
rv init
```

Works in non-empty directories too:

- An existing `package.json` is **merged**, not replaced — your name,
  version, and unrelated fields/scripts are preserved; the generated
  dependencies and scripts are added.
- If generated files would overwrite existing ones, you choose to
  **overwrite** them, **keep** the existing files, or **cancel** (nothing is
  written).

### Generators: add pieces to an existing project

```bash
rv add page blog-post     # lazy-loaded route + nav link (router projects)
rv add page blog/detail   # nested route paths work too
rv add component user-card
rv add store cart         # zustand store (zustand projects)
rv add hook toggle        # src/hooks/useToggle
rv add layout admin       # Outlet layout (router projects)
```

Each generator detects TypeScript and Tailwind from your `package.json` and
writes files in the same style as the rest of the project:

- **`rv add page <name>`** — generates `src/pages/BlogPost.tsx` (or `.jsx`),
  registers a lazy-loaded `/blog-post` route in `src/router` (so every extra
  page becomes its own chunk), and adds a navigation link in
  `src/layouts/RootLayout`. Requires the React Router feature.
- **`rv add component <name>`** — generates `src/components/UserCard.tsx`.
- **`rv add store <name>`** — generates `src/store/useCart.ts` with a typed
  zustand store skeleton. Requires the Zustand feature.
- **`rv add hook <name>`** — generates `src/hooks/useToggle.ts` (or `.js`), a
  small `use`-prefixed React hook to build on.
- **`rv add layout <name>`** — generates `src/layouts/AdminLayout.tsx` with an
  `<Outlet />`, then prints how to nest routes under it. Requires the React
  Router feature.

Route and nav registration rely on the small `// rv:route`-style anchor
comments that scaffolded projects contain. If you have restructured those
files (or the project was created before v0.0.7), the page is still
generated and `rv` prints the exact lines to add manually.

### Check and repair a project's health

```bash
rv doctor            # report only
rv update            # pin drifted dependencies back to the rv versions
rv update --dry-run  # preview what update would change
```

`rv doctor` reports dependency drift (versions that differ from the set `rv`
pins and verifies), whether your Node version is supported, and whether the
rv anchors are still in place so the generators keep working. `rv update`
applies the dependency part of that report to `package.json`; run your
package manager's install afterwards.

### Preview any change first

`create`, `init`, and `add` accept `--dry-run`: the command prints exactly
which files would be written (and, for `init`, which existing files
conflict) without touching the disk.

### Interactive prompts

Both commands ask three things (skipping whatever you already provided as a
flag):

1. **Project directory** (`create`) or **package name** (`init`)
2. **Optional features** — a checkbox list: TypeScript, Tailwind CSS, React
   Router, ESLint + Prettier, Zustand, shadcn/ui. Toggle each on or off; every
   combination is supported and tested (selecting shadcn/ui turns on TypeScript
   and Tailwind automatically).
3. **Dependency installation** — pick any package manager found on your
   `PATH` (npm / pnpm / yarn, with the one matching an existing lockfile
   preselected), or skip installation.

### Non-interactive usage (CI, scripts)

Every prompt has a flag, so the CLI can run without a TTY:

```bash
rv create my-app --features all --install npm
rv create my-app --features typescript,tailwind --install none
rv init --name my-app --features router,zustand --install pnpm --conflicts keep
```

| Option                   | Commands        | Values                                                                                       |
| ------------------------ | --------------- | -------------------------------------------------------------------------------------------- |
| `-f, --features <list>`  | `create` `init` | Comma-separated: `typescript`, `tailwind`, `router`, `eslint`, `zustand`, `shadcn` — or `all` / `none` |
| `--install <manager>`    | `create` `init` | `npm`, `pnpm`, `yarn`, or `none` to skip installation                                        |
| `--name <package-name>`  | `init`          | Package name (defaults to existing `package.json` or the directory name)                     |
| `--conflicts <strategy>` | `init`          | `overwrite`, `keep`, or `cancel`                                                             |
| `--no-git`               | `create`        | Skip the automatic `git init`                                                                |
| `--dry-run`              | `create` `init` `add` `update` | Preview the changes without writing anything                                  |

Feature aliases are accepted: `ts`, `tailwindcss`, `react-router`,
`react-router-dom`, `lint`, `prettier`, `store`, `shadcn-ui`, `ui`.

## What each feature adds

| Feature               | What gets added                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**        | Strict `*.tsx` sources, `tsconfig.json` project references (`app` + `node`), a `typecheck` script, `tsc -b` in the build script                      |
| **Tailwind CSS** (v4) | `@tailwindcss/vite` plugin in `vite.config`, `@import 'tailwindcss'` in `src/index.css` — no `tailwind.config.js` or PostCSS needed                  |
| **React Router** (v7) | `src/router`, a layout with navigation, `Home` and `About` pages; non-index routes are code-split via route-level `lazy`                             |
| **ESLint + Prettier** | `eslint.config.js` (flat config, TS-aware when TypeScript is selected), `.prettierrc.json`, and `lint`, `lint:fix`, `format`, `format:check` scripts |
| **Zustand**           | `src/store/useCounter` plus a working counter component on the start page                                                                            |
| **shadcn/ui**         | `components.json`, `cn()` in `src/lib/utils`, the Tailwind v4 theme (light/dark CSS variables), the `@/` import alias (Vite + tsconfig), and an example `Button` in `src/components/ui`. Implies TypeScript + Tailwind |

Features compose — for example TS + Tailwind + Router + Zustand gives you a
typed router with a Tailwind-styled counter on the home page out of the box.
Add shadcn/ui and `npx shadcn@latest add <component>` works immediately —
`src/components/ui` is treated as vendored code (excluded from lint/format).

## After scaffolding

If you let `rv` run the install, start coding right away; otherwise:

```bash
cd my-app
npm install
npm run dev
```

Generated scripts: `dev`, `build`, `preview`, plus `typecheck` (TypeScript)
and `lint` / `format` (ESLint + Prettier) when selected.

## Dependency versions

Template dependencies are pinned to a known-good set in the CLI itself (see
[`src/package-json.js`](src/package-json.js)), so the project you generate
today is reproducible and independent of transient `latest` tags on npm.
When `rv` updates, the pinned versions move forward in lockstep.

Current defaults:

- React 19 · React DOM 19
- Vite 8 · `@vitejs/plugin-react` 6
- TypeScript 6 (when TS selected)
- Tailwind CSS 4 · `@tailwindcss/vite` 4
- React Router 7 (when Router selected)
- Zustand 5 (when Zustand selected)
- ESLint 10 flat config · `typescript-eslint` 8 · Prettier 3 (when ESLint selected)
- shadcn/ui deps: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `tw-animate-css` (when shadcn/ui selected)

Every release is verified by a smoke test that scaffolds, installs, builds,
type-checks, and lints four project profiles (minimal/complete × JS/TS).

## Development

```bash
pnpm install
pnpm test            # unit tests (node --test)
pnpm smoke           # scaffold + install + build real projects
pnpm verify:release  # tests + smoke + npm pack --dry-run
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the pull-request workflow.

## License

[MIT](LICENSE)
