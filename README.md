<h1 align="center">
React Vite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/react-vite">
    <img src="https://img.shields.io/npm/v/react-vite.svg" alt="Version" />
  </a>
  <img src="https://img.shields.io/npm/l/react-vite.svg" alt="License" />
</p>

> Scaffold a minimal React + Vite project with optional TypeScript, Tailwind CSS, React Router, ESLint + Prettier and Zustand — pick only what you need.

## Install

```bash
npm install -g react-vite
# or
yarn global add react-vite
# or
pnpm add -g react-vite
```

This installs two equivalent global commands: `rv` (short) and `react-vite`.

## Usage

### Create a new project

```bash
rv create my-app
```

Creates `./my-app`, prompts for feature choices, then scaffolds the project.

### Initialize in an existing directory

```bash
mkdir my-app && cd my-app
rv init
```

If the directory contains files that would be overwritten, you will be asked
whether to overwrite, skip, or cancel.

## Prompts

After picking a project name the CLI asks five yes/no questions:

| Feature           | What gets added when enabled                                 |
| ----------------- | ------------------------------------------------------------ |
| TypeScript        | `tsconfig.json`, `*.tsx` sources, `@types/*`, `tsc` in build |
| Tailwind CSS      | `tailwind.config.js`, `postcss.config.js`, `@tailwind` base  |
| React Router      | `src/router`, `src/pages/Home`, `src/pages/About`            |
| ESLint + Prettier | `.eslintrc.cjs`, `.prettierrc`, `lint` / `format` scripts    |
| Zustand           | `src/store/useCounter` plus a counter demo in the home page  |

Files and dependencies for unchecked options are never added — the output is
the smallest working project for your choices.

## After scaffolding

The CLI will offer to run `npm`, `yarn` or `pnpm` install automatically (it
lists whichever are on `PATH`). If you skip that, just:

```bash
cd my-app
npm install
npm run dev
```

## Notes on the `rv` command

`rv` is not a standard shell command on macOS, Linux or Windows, so
collisions are unlikely. If you do have a local alias named `rv`, fall back
to the full `react-vite` command (both are installed from the same package).
