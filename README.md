<h1 align="center">
React Vite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/v/react-vite.svg" alt="Version" />
  </a>
  <img src="https://img.shields.io/npm/l/react-vite.svg" alt="License" />
</p>

> Scaffold a minimal React + Vite project with optional TypeScript, Tailwind
> CSS, React Router, ESLint + Prettier, and Zustand — pick only what you
> need, get a project that boots immediately.

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
| **ESLint flat config + Prettier**        | ESLint only, no Prettier       | Both, TS-aware when TS is on    |
| **Init into an existing directory**      | No (`create-*` makes new dirs) | Yes — `rv init` with safe merge |
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
then scaffolds the project. Omit the directory argument to be prompted
for it.

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

### Interactive prompts

Both commands ask three things (skipping whatever you already provided as a
flag):

1. **Project directory** (`create`) or **package name** (`init`)
2. **Optional features** — a checkbox list: TypeScript, Tailwind CSS, React
   Router, ESLint + Prettier, Zustand. Toggle each on or off; all 32
   combinations are supported and tested.
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

| Option                  | Commands       | Values                                                                                       |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `-f, --features <list>` | `create` `init` | Comma-separated: `typescript`, `tailwind`, `router`, `eslint`, `zustand` — or `all` / `none` |
| `--install <manager>`   | `create` `init` | `npm`, `pnpm`, `yarn`, or `none` to skip installation                                        |
| `--name <package-name>` | `init`         | Package name (defaults to existing `package.json` or the directory name)                     |
| `--conflicts <strategy>`| `init`         | `overwrite`, `keep`, or `cancel`                                                             |

Feature aliases are accepted: `ts`, `tailwindcss`, `react-router`,
`react-router-dom`, `lint`, `prettier`, `store`.

## What each feature adds

| Feature               | What gets added                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**        | Strict `*.tsx` sources, `tsconfig.json` project references (`app` + `node`), a `typecheck` script, `tsc -b` in the build script           |
| **Tailwind CSS** (v4) | `@tailwindcss/vite` plugin in `vite.config`, `@import 'tailwindcss'` in `src/index.css` — no `tailwind.config.js` or PostCSS needed        |
| **React Router** (v7) | `src/router`, a layout with navigation, `Home` and `About` pages; `main` renders `<RouterProvider>` instead of `<App />`                  |
| **ESLint + Prettier** | `eslint.config.js` (flat config, TS-aware when TypeScript is selected), `.prettierrc.json`, and `lint`, `lint:fix`, `format`, `format:check` scripts |
| **Zustand**           | `src/store/useCounter` plus a working counter component on the start page                                                                 |

Features compose — for example TS + Tailwind + Router + Zustand gives you a
typed router with a Tailwind-styled counter on the home page out of the box.

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
