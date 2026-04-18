#!/usr/bin/env node
'use strict';

var require$$0$4 = require('commander');
var require$$3 = require('chalk');
var require$$0$1 = require('path');
var require$$0 = require('inquirer');
var require$$0$2 = require('fs-extra');
var require$$0$3 = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default$4 = /*#__PURE__*/_interopDefaultLegacy(require$$0$4);
var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$0__default$2 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var require$$0__default$3 = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);

var src = {};

var name = "react-vite";
var version = "0.0.5";
var description = "create react app with vite";
var main = "src/index.js";
var bin = {
	rv: "lib/index.js",
	"react-vite": "lib/index.js"
};
var scripts = {
	dev: "rollup -w -c",
	build: "rollup -c",
	preview: "node ./lib/index.js",
	prepare: "husky install",
	commit: "git add . && cz",
	docs: " docsify serve docs"
};
var repository = {
	type: "git",
	url: "https://github.com/aouos/react-vite.git"
};
var keywords = [
	"react+vite",
	"react",
	"vite",
	"cli"
];
var author = "aouos";
var license = "MIT";
var bugs = {
	url: "https://github.com/aouos/react-vite/issues"
};
var homepage = "https://github.com/aouos/react-vite#readme";
var dependencies = {
	chalk: "^4.1.2",
	commander: "^9.0.0",
	"fs-extra": "^10.0.1",
	inquirer: "^8.2.1",
	rollup: "^2.70.0"
};
var files = [
	"lib",
	"templates",
	"README.md",
	"package.json"
];
var devDependencies = {
	"@babel/core": "^7.17.5",
	"@babel/preset-env": "^7.16.11",
	"@commitlint/cli": "^16.2.1",
	"@commitlint/config-conventional": "^16.2.1",
	"@rollup/plugin-babel": "^5.3.1",
	"@rollup/plugin-commonjs": "^22.0.0",
	"@rollup/plugin-node-resolve": "^13.1.3",
	"@rollup/plugin-json": "^4.1.0",
	commitizen: "^4.2.4",
	"cz-conventional-changelog": "^3.3.0",
	"docsify-cli": "^4.4.4",
	eslint: "^8.11.0",
	"eslint-config-prettier": "^8.5.0",
	"eslint-plugin-prettier": "^4.0.0",
	husky: "^7.0.4",
	"lint-staged": "^12.3.5",
	prettier: "^2.5.1",
	"rollup-plugin-uglify": "^6.0.4"
};
var config = {
	commitizen: {
		path: "./node_modules/cz-conventional-changelog"
	}
};
var require$$2 = {
	name: name,
	version: version,
	description: description,
	"private": false,
	main: main,
	bin: bin,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	dependencies: dependencies,
	files: files,
	devDependencies: devDependencies,
	config: config
};

var packageJson;
var hasRequiredPackageJson;

function requirePackageJson() {
  if (hasRequiredPackageJson) return packageJson;
  hasRequiredPackageJson = 1;
  const VERSIONS = {
    react: '^19.1.0',
    'react-dom': '^19.1.0',
    vite: '^6.0.7',
    '@vitejs/plugin-react': '^4.3.4',
    typescript: '^5.7.2',
    '@types/react': '^19.0.7',
    '@types/react-dom': '^19.0.3',
    tailwindcss: '^4.0.0',
    '@tailwindcss/vite': '^4.0.0',
    'react-router-dom': '^7.1.1',
    zustand: '^5.0.2',
    eslint: '^9.17.0',
    '@eslint/js': '^9.17.0',
    globals: '^15.14.0',
    'eslint-plugin-react-hooks': '^5.1.0',
    'eslint-plugin-react-refresh': '^0.4.16',
    prettier: '^3.4.2',
    'eslint-config-prettier': '^9.1.0',
    'typescript-eslint': '^8.19.0'
  };

  function v(name) {
    if (!VERSIONS[name]) throw new Error(`Missing version for ${name}`);
    return VERSIONS[name];
  }

  function sanitizeName(name) {
    const cleaned = String(name || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[-_.]+|[-_.]+$/g, '');
    return cleaned || 'my-app';
  }

  function build(features, projectName) {
    const {
      typescript,
      tailwind,
      router,
      eslint,
      zustand
    } = features;
    const dependencies = {
      react: v('react'),
      'react-dom': v('react-dom')
    };
    if (router) dependencies['react-router-dom'] = v('react-router-dom');
    if (zustand) dependencies.zustand = v('zustand');
    const devDependencies = {
      vite: v('vite'),
      '@vitejs/plugin-react': v('@vitejs/plugin-react')
    };

    if (typescript) {
      devDependencies.typescript = v('typescript');
      devDependencies['@types/react'] = v('@types/react');
      devDependencies['@types/react-dom'] = v('@types/react-dom');
    }

    if (tailwind) {
      devDependencies.tailwindcss = v('tailwindcss');
      devDependencies['@tailwindcss/vite'] = v('@tailwindcss/vite');
    }

    if (eslint) {
      devDependencies.eslint = v('eslint');
      devDependencies['@eslint/js'] = v('@eslint/js');
      devDependencies.globals = v('globals');
      devDependencies['eslint-plugin-react-hooks'] = v('eslint-plugin-react-hooks');
      devDependencies['eslint-plugin-react-refresh'] = v('eslint-plugin-react-refresh');
      devDependencies.prettier = v('prettier');
      devDependencies['eslint-config-prettier'] = v('eslint-config-prettier');

      if (typescript) {
        devDependencies['typescript-eslint'] = v('typescript-eslint');
      }
    }

    const scripts = {
      dev: 'vite',
      build: typescript ? 'tsc && vite build' : 'vite build',
      preview: 'vite preview'
    };

    if (eslint) {
      scripts.lint = 'eslint . --report-unused-disable-directives --max-warnings 0';
      scripts.format = 'prettier --write .';
    }

    return {
      name: sanitizeName(projectName),
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts,
      dependencies,
      devDependencies
    };
  }

  packageJson = {
    build,
    sanitizeName,
    VERSIONS
  };
  return packageJson;
}

var prompts;
var hasRequiredPrompts;

function requirePrompts() {
  if (hasRequiredPrompts) return prompts;
  hasRequiredPrompts = 1;
  const inquirer = require$$0__default["default"];
  const {
    sanitizeName
  } = requirePackageJson();

  async function collectFeatures({
    defaultName
  }) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: defaultName || 'my-app',
      filter: val => sanitizeName(val)
    }, {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: false
    }, {
      type: 'confirm',
      name: 'tailwind',
      message: 'Add Tailwind CSS?',
      default: false
    }, {
      type: 'confirm',
      name: 'router',
      message: 'Add React Router?',
      default: false
    }, {
      type: 'confirm',
      name: 'eslint',
      message: 'Add ESLint + Prettier?',
      default: false
    }, {
      type: 'confirm',
      name: 'zustand',
      message: 'Add Zustand for state management?',
      default: false
    }]);
    const {
      projectName,
      ...features
    } = answers;
    return {
      projectName,
      features
    };
  }

  prompts = {
    collectFeatures
  };
  return prompts;
}

var templates;
var hasRequiredTemplates;

function requireTemplates() {
  if (hasRequiredTemplates) return templates;
  hasRequiredTemplates = 1; // NOTE: rollup outputs CJS; __dirname works at runtime. If this is ever
  // migrated to ESM, switch TEMPLATES_DIR resolution to fileURLToPath(import.meta.url).

  const path = require$$0__default$1["default"];
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
    const imports = [`import { defineConfig } from 'vite';`, `import react from '@vitejs/plugin-react';`];
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
    return JSON.stringify({
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
        noFallthroughCasesInSwitch: true
      },
      include: ['src', 'vite.config.ts']
    }, null, 2) + '\n';
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
    const imports = [`import React from 'react';`, `import ReactDOM from 'react-dom/client';`, `import './index.css';`];
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

ReactDOM.createRoot(document.getElementById('root')${features.typescript ? '!' : ''}).render(
  <React.StrictMode>
    ${root}
  </React.StrictMode>,
);
`;
  }

  function appFile(features) {
    const imports = [];
    if (features.zustand) imports.push(`import { useCounter } from './store/useCounter';`);
    const counterBlock = features.zustand ? features.tailwind ? `      <button
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={increment}
      >
        count is {count}
      </button>` : `      <button onClick={increment} style={{ marginTop: 16 }}>
        count is {count}
      </button>` : '';
    const hook = features.zustand ? `  const count = useCounter((s) => s.count);
  const increment = useCounter((s) => s.increment);
` : '';

    if (features.tailwind) {
      return `${imports.join('\n')}${imports.length ? '\n\n' : ''}function App() {
${hook}  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Hello from rv</h1>
      <p className="mt-2 text-gray-600">Edit <code>src/App.${ext(features)}</code> and save to reload.</p>
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
    const linkClass = features.tailwind ? ' className="text-blue-600 underline"' : '';
    const wrapClass = features.tailwind ? ' className="min-h-screen p-8"' : ' style={{ padding: 32 }}';
    const storeImport = features.zustand ? `import { useCounter } from '../store/useCounter';\n` : '';
    const hook = features.zustand ? `  const count = useCounter((s) => s.count);
  const increment = useCounter((s) => s.increment);
` : '';
    const counterBtn = features.zustand ? features.tailwind ? `\n      <button
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={increment}
      >
        count is {count}
      </button>` : `\n      <button onClick={increment} style={{ marginTop: 16, display: 'block' }}>
        count is {count}
      </button>` : '';
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
    const linkClass = features.tailwind ? ' className="text-blue-600 underline"' : '';
    const wrapClass = features.tailwind ? ' className="min-h-screen p-8"' : ' style={{ padding: 32 }}';
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
    return JSON.stringify({
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100
    }, null, 2) + '\n';
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
    const files = []; // Static files (copied from templates/static)

    files.push({
      dest: '.gitignore',
      source: path.join(STATIC_DIR, '_gitignore')
    });
    files.push({
      dest: 'public/vite.svg',
      source: path.join(STATIC_DIR, 'public/vite.svg')
    }); // Generated files

    files.push({
      dest: 'index.html',
      contents: indexHtml(features, projectName)
    });
    files.push({
      dest: `vite.config.${se}`,
      contents: viteConfig(features)
    });
    files.push({
      dest: `src/main.${e}`,
      contents: mainFile(features)
    });
    files.push({
      dest: `src/index.css`,
      contents: indexCss(features)
    });
    files.push({
      dest: 'README.md',
      contents: readme(projectName)
    });

    if (features.router) {
      files.push({
        dest: `src/router.${e}`,
        contents: routerFile()
      });
      files.push({
        dest: `src/pages/Home.${e}`,
        contents: homePage(features)
      });
      files.push({
        dest: `src/pages/About.${e}`,
        contents: aboutPage(features)
      });
    } else {
      files.push({
        dest: `src/App.${e}`,
        contents: appFile(features)
      });
    }

    if (features.typescript) {
      files.push({
        dest: 'tsconfig.json',
        contents: tsconfig()
      });
      files.push({
        dest: 'src/vite-env.d.ts',
        contents: viteEnvDts()
      });
    } // Tailwind v4 needs no config files by default — the @tailwindcss/vite plugin
    // plus `@import "tailwindcss"` in index.css is enough.


    if (features.zustand) {
      files.push({
        dest: `src/store/useCounter.${se}`,
        contents: zustandStore(features)
      });
    }

    if (features.eslint) {
      files.push({
        dest: 'eslint.config.js',
        contents: eslintFlatConfig(features)
      });
      files.push({
        dest: '.prettierrc',
        contents: prettierrc()
      });
    }

    return files;
  }

  templates = {
    getFiles,
    TEMPLATES_DIR,
    STATIC_DIR
  };
  return templates;
}

var conflicts;
var hasRequiredConflicts;

function requireConflicts() {
  if (hasRequiredConflicts) return conflicts;
  hasRequiredConflicts = 1;
  const fs = require$$0__default$2["default"];
  const path = require$$0__default$1["default"];
  const inquirer = require$$0__default["default"];
  const chalk = require$$3__default["default"];

  async function resolveConflicts(targetDir, fileList) {
    const existing = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
    const meaningful = existing.filter(name => name !== '.git');

    if (meaningful.length === 0) {
      return {
        mode: 'write',
        files: fileList
      };
    }

    const conflicts = fileList.filter(f => fs.existsSync(path.join(targetDir, f.dest)));

    if (conflicts.length === 0) {
      return {
        mode: 'write',
        files: fileList
      };
    }

    console.log(chalk.yellow('\nThe following files already exist in the target directory:'));
    const shown = conflicts.slice(0, 20);
    shown.forEach(f => console.log('  ' + f.dest));

    if (conflicts.length > shown.length) {
      console.log(chalk.gray(`  ...+${conflicts.length - shown.length} more`));
    }

    const {
      action
    } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'How do you want to handle these?',
      choices: [{
        name: 'Overwrite all conflicting files',
        value: 'overwrite'
      }, {
        name: 'Skip conflicting files (keep existing)',
        value: 'skip'
      }, {
        name: 'Cancel',
        value: 'cancel'
      }],
      default: 'skip'
    }]);

    if (action === 'cancel') {
      return {
        mode: 'cancel',
        files: []
      };
    }

    if (action === 'skip') {
      const conflictSet = new Set(conflicts.map(f => f.dest));
      return {
        mode: 'write',
        files: fileList.filter(f => !conflictSet.has(f.dest))
      };
    }

    return {
      mode: 'write',
      files: fileList
    };
  }

  conflicts = {
    resolveConflicts
  };
  return conflicts;
}

var exec;
var hasRequiredExec;

function requireExec() {
  if (hasRequiredExec) return exec;
  hasRequiredExec = 1;
  const {
    spawn
  } = require$$0__default$3["default"];

  function run(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        ...opts
      });
      child.on('close', code => {
        if (code === 0) resolve();else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
      });
      child.on('error', reject);
    });
  }

  exec = {
    run
  };
  return exec;
}

var logger;
var hasRequiredLogger;

function requireLogger() {
  if (hasRequiredLogger) return logger;
  hasRequiredLogger = 1;
  const chalk = require$$3__default["default"];
  logger = {
    info: msg => console.log(chalk.cyan(msg)),
    success: msg => console.log(chalk.green(msg)),
    warn: msg => console.log(chalk.yellow(msg)),
    error: msg => console.log(chalk.red(msg)),
    plain: msg => console.log(msg),
    dim: msg => console.log(chalk.gray(msg))
  };
  return logger;
}

var pkgManager;
var hasRequiredPkgManager;

function requirePkgManager() {
  if (hasRequiredPkgManager) return pkgManager;
  hasRequiredPkgManager = 1;
  const {
    spawnSync
  } = require$$0__default$3["default"];
  const inquirer = require$$0__default["default"];
  const {
    run
  } = requireExec();
  const logger = requireLogger();

  function isAvailable(cmd) {
    try {
      const result = spawnSync(cmd, ['--version'], {
        stdio: 'ignore',
        shell: process.platform === 'win32'
      });
      return result.status === 0;
    } catch (_e) {
      return false;
    }
  }

  function detect() {
    return ['npm', 'yarn', 'pnpm'].filter(isAvailable);
  }

  async function promptAndInstall(targetDir) {
    const {
      doInstall
    } = await inquirer.prompt([{
      type: 'confirm',
      name: 'doInstall',
      message: 'Install dependencies now?',
      default: true
    }]);
    if (!doInstall) return false;
    const available = detect();

    if (available.length === 0) {
      logger.warn('No package manager (npm/yarn/pnpm) found on PATH. Skipping install.');
      return false;
    }

    let pm = available[0];

    if (available.length > 1) {
      const {
        chosen
      } = await inquirer.prompt([{
        type: 'list',
        name: 'chosen',
        message: 'Which package manager?',
        choices: available,
        default: available[0]
      }]);
      pm = chosen;
    }

    logger.info(`\nRunning ${pm} install...`);

    try {
      await run(pm, ['install'], {
        cwd: targetDir
      });
      return true;
    } catch (err) {
      logger.warn(`\n${pm} install failed: ${err.message}`);
      logger.warn(`You can retry manually: cd ${targetDir} && ${pm} install`);
      return false;
    }
  }

  pkgManager = {
    detect,
    promptAndInstall
  };
  return pkgManager;
}

var scaffold;
var hasRequiredScaffold;

function requireScaffold() {
  if (hasRequiredScaffold) return scaffold;
  hasRequiredScaffold = 1;
  const fs = require$$0__default$2["default"];
  const path = require$$0__default$1["default"];
  const chalk = require$$3__default["default"];
  const {
    getFiles
  } = requireTemplates();
  const {
    build: buildPkg
  } = requirePackageJson();
  const {
    resolveConflicts
  } = requireConflicts();
  const {
    promptAndInstall
  } = requirePkgManager();
  const logger = requireLogger();

  async function writeFiles(targetDir, files) {
    for (const f of files) {
      const abs = path.join(targetDir, f.dest);
      await fs.ensureDir(path.dirname(abs));

      if (f.source) {
        await fs.copy(f.source, abs, {
          overwrite: true
        });
      } else {
        await fs.writeFile(abs, f.contents, 'utf8');
      }
    }
  }

  async function run({
    targetDir,
    projectName,
    features,
    mode
  }) {
    await fs.ensureDir(targetDir);
    const fileList = getFiles(features, projectName);
    fileList.push({
      dest: 'package.json',
      contents: JSON.stringify(buildPkg(features, projectName), null, 2) + '\n'
    });
    let toWrite = fileList;

    if (mode === 'init') {
      const result = await resolveConflicts(targetDir, fileList);

      if (result.mode === 'cancel') {
        logger.warn('\nAborted.');
        process.exit(1);
      }

      toWrite = result.files;
    }

    logger.info(`\nScaffolding project in ${targetDir}`);
    await writeFiles(targetDir, toWrite);
    logger.success(`\nCreated ${toWrite.length} files.`);
    const installed = await promptAndInstall(targetDir);
    printDone(targetDir, projectName, mode, installed);
  }

  function printDone(targetDir, projectName, mode, installed) {
    console.log('\n' + chalk.green('Done!') + ' Next steps:');
    const rel = path.relative(process.cwd(), targetDir);

    if (mode === 'create' && rel) {
      console.log('  ' + chalk.cyan(`cd ${rel}`));
    }

    if (!installed) {
      console.log('  ' + chalk.cyan('npm install'));
    }

    console.log('  ' + chalk.cyan('npm run dev'));
    console.log('');
  }

  scaffold = {
    run
  };
  return scaffold;
}

var init;
var hasRequiredInit;

function requireInit() {
  if (hasRequiredInit) return init;
  hasRequiredInit = 1;
  const path = require$$0__default$1["default"];
  const {
    collectFeatures
  } = requirePrompts();
  const scaffold = requireScaffold();

  init = async function init() {
    const targetDir = process.cwd();
    const defaultName = path.basename(targetDir);
    const {
      projectName,
      features
    } = await collectFeatures({
      defaultName
    });
    await scaffold.run({
      targetDir,
      projectName,
      features,
      mode: 'init'
    });
  };

  return init;
}

var create;
var hasRequiredCreate;

function requireCreate() {
  if (hasRequiredCreate) return create;
  hasRequiredCreate = 1;
  const path = require$$0__default$1["default"];
  const fs = require$$0__default$2["default"];
  const {
    collectFeatures
  } = requirePrompts();
  const scaffold = requireScaffold();
  const logger = requireLogger();
  const NAME_RE = /^[a-zA-Z0-9._-]+$/;

  create = async function create(projectName) {
    if (!projectName || !NAME_RE.test(projectName) || projectName === '.' || projectName === '..') {
      logger.error(`Invalid project name: "${projectName}"`);
      logger.plain('Name must match /^[a-zA-Z0-9._-]+$/ and cannot be "." or "..".');
      process.exit(1);
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
      const entries = fs.readdirSync(targetDir).filter(n => n !== '.git');

      if (entries.length > 0) {
        logger.error(`Directory "${projectName}" already exists and is not empty. Aborting.`);
        process.exit(1);
      }
    }

    const {
      projectName: chosenName,
      features
    } = await collectFeatures({
      defaultName: projectName
    });
    await scaffold.run({
      targetDir,
      projectName: chosenName,
      features,
      mode: 'create'
    });
  };

  return create;
}

const {
  program
} = require$$0__default$4["default"];
const chalk = require$$3__default["default"];
const pkg = require$$2;
program.name('rv').description('Scaffold minimal React + Vite projects').version(pkg.version, '-v, --version', 'output the current version');
program.command('init').description('Initialize a React + Vite project in the current directory').action(async () => {
  try {
    await requireInit()();
  } catch (err) {
    console.error(chalk.red(err.stack || err.message));
    process.exit(1);
  }
});
program.command('create <project-name>').description('Create a new React + Vite project in ./<project-name>').action(async projectName => {
  try {
    await requireCreate()(projectName);
  } catch (err) {
    console.error(chalk.red(err.stack || err.message));
    process.exit(1);
  }
});
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

module.exports = src;
