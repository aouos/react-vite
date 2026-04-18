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

## Why rv instead of `npm create vite@latest`?

The official Vite scaffold only asks you to pick a framework and a JS/TS
variant. It does not know about Tailwind, Router, state management, or
linting — after generating, you still have to wire those up by hand, which
for Tailwind v4 alone is three steps (install, add the Vite plugin, add the
`@import` directive).

`rv` covers those extras:

| What you get                           | `npm create vite@latest`       | `rv`                              |
| -------------------------------------- | ------------------------------ | --------------------------------- |
| React + Vite baseline                  | Yes                            | Yes                               |
| TypeScript variant                     | Yes                            | Yes                               |
| **Tailwind v4 (fully wired)**          | No — manual setup              | Yes — plugin + `@import` in CSS   |
| **React Router with a working demo**   | No                             | Yes — 2 routes (`/`, `/about`)    |
| **Zustand store + counter demo**       | No                             | Yes                               |
| **ESLint flat config + Prettier**      | ESLint only, no Prettier       | Both, TS-aware when TS is on      |
| **Init into an existing directory**    | No (`create-*` makes new dirs) | Yes — `rv init` with safe merge   |
| **Runs install for you (npm/yarn/pnpm)** | No                           | Yes — prompts for PM on PATH      |

Every feature is opt-in. Answer No to all and you get the same minimal output
as Vite's own template — no extra files or dependencies.

## Install

```bash
npm install -g react-vite
# or
yarn global add react-vite
# or
pnpm add -g react-vite
```

Two equivalent global commands get installed: `rv` (short) and `react-vite`
(fallback if `rv` ever collides with a local alias on your machine).

## Usage

### Create a new project

```bash
rv create my-app
```

Creates `./my-app`, runs the feature prompts, then scaffolds the project.

### Initialize in the current directory

```bash
mkdir my-app && cd my-app
rv init
```

If the directory already has files that would be overwritten, you are asked
whether to **overwrite**, **skip** (keep existing files as-is), or **cancel**.

## Prompts

After picking a name, the CLI asks five yes/no questions. Each one only adds
files and dependencies when you answer Yes:

| Feature               | What gets added                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **TypeScript**        | `tsconfig.json`, `*.tsx` sources, `vite-env.d.ts`, `@types/*`, `tsc` in the build script                                             |
| **Tailwind CSS** (v4) | `@tailwindcss/vite` plugin added to `vite.config`, `@import "tailwindcss"` in `src/index.css` — no `tailwind.config.js` or PostCSS needed |
| **React Router** (v7) | `src/router`, `src/pages/Home`, `src/pages/About`; `main` renders `<RouterProvider>` instead of `<App />`                            |
| **ESLint + Prettier** | `eslint.config.js` (flat config, TS-aware), `.prettierrc`, `lint` and `format` scripts                                               |
| **Zustand**           | `src/store/useCounter`; the home page gets a working counter button                                                                  |

All combinations are supported — for example, TS + Tailwind + Router +
Zustand gives you a typed router with a Tailwind-styled counter on the home
page out of the box.

## After scaffolding

`rv` will offer to run `npm install`, `yarn install`, or `pnpm install` using
whichever package managers are on your `PATH`. If you skip that step, just
run it yourself:

```bash
cd my-app
npm install
npm run dev
```

## Dependency versions

Template dependencies are pinned to a known-good set in the CLI itself (see
`src/packageJson.js`). That means the project you generate today is
reproducible and independent of transient "latest" tags on npm — when `rv`
itself updates, the pinned versions move forward in lockstep.

Current defaults (as of the latest `rv` release):

- React 19 · React DOM 19
- Vite 8 · `@vitejs/plugin-react` 6
- TypeScript 6 (when TS selected)
- Tailwind CSS 4 · `@tailwindcss/vite` 4
- React Router 7 (when Router selected)
- Zustand 5 (when Zustand selected)
- ESLint 10 flat config · `typescript-eslint` 8 · Prettier 3 (when ESLint selected)

All versions are verified to install and build together.

## Notes on the `rv` command

`rv` is not a standard shell command on macOS, Linux, or Windows, so
collisions are unlikely. If you do have a local alias named `rv`, fall back
to the full `react-vite` command (both are installed from the same package).
