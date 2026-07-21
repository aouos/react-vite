import { sanitizePackageName } from './names.js';

export const TEMPLATE_VERSIONS = Object.freeze({
  react: '19.2.7',
  'react-dom': '19.2.7',
  vite: '8.1.5',
  '@vitejs/plugin-react': '6.0.3',
  typescript: '6.0.3',
  '@types/node': '24.13.2',
  '@types/react': '19.2.17',
  '@types/react-dom': '19.2.3',
  tailwindcss: '4.3.3',
  '@tailwindcss/vite': '4.3.3',
  'react-router-dom': '7.18.1',
  zustand: '5.0.14',
  eslint: '10.7.0',
  '@eslint/js': '10.0.1',
  globals: '17.7.0',
  'eslint-plugin-react-hooks': '7.1.1',
  'eslint-plugin-react-refresh': '0.5.3',
  prettier: '3.9.6',
  'eslint-config-prettier': '10.1.8',
  'typescript-eslint': '8.65.0',
});

export const GENERATED_NODE_ENGINES = '^20.19.0 || ^22.13.0 || >=24.0.0';

function version(packageName) {
  const value = TEMPLATE_VERSIONS[packageName];
  if (!value) throw new Error(`Missing template version for ${packageName}.`);
  return value;
}

function sortObject(value = {}) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function buildGeneratedPackageJson(features, projectName) {
  const dependencies = {
    react: version('react'),
    'react-dom': version('react-dom'),
  };

  if (features.router) {
    dependencies['react-router-dom'] = version('react-router-dom');
  }
  if (features.zustand) {
    dependencies.zustand = version('zustand');
  }

  const devDependencies = {
    '@vitejs/plugin-react': version('@vitejs/plugin-react'),
    vite: version('vite'),
  };

  if (features.typescript) {
    Object.assign(devDependencies, {
      '@types/node': version('@types/node'),
      '@types/react': version('@types/react'),
      '@types/react-dom': version('@types/react-dom'),
      typescript: version('typescript'),
    });
  }

  if (features.tailwind) {
    Object.assign(devDependencies, {
      '@tailwindcss/vite': version('@tailwindcss/vite'),
      tailwindcss: version('tailwindcss'),
    });
  }

  if (features.eslint) {
    Object.assign(devDependencies, {
      '@eslint/js': version('@eslint/js'),
      eslint: version('eslint'),
      'eslint-config-prettier': version('eslint-config-prettier'),
      'eslint-plugin-react-hooks': version('eslint-plugin-react-hooks'),
      'eslint-plugin-react-refresh': version('eslint-plugin-react-refresh'),
      globals: version('globals'),
      prettier: version('prettier'),
    });
    if (features.typescript) {
      devDependencies['typescript-eslint'] = version('typescript-eslint');
    }
  }

  const scripts = {
    dev: 'vite',
    build: features.typescript ? 'tsc -b && vite build' : 'vite build',
  };

  if (features.typescript) {
    scripts.typecheck = 'tsc -b';
  }
  if (features.eslint) {
    scripts.lint = 'eslint . --max-warnings 0';
    scripts['lint:fix'] = 'eslint . --fix';
    scripts.format = 'prettier --write .';
    scripts['format:check'] = 'prettier --check .';
  }
  scripts.preview = 'vite preview';

  return {
    name: sanitizePackageName(projectName) || 'my-app',
    private: true,
    version: '0.0.0',
    type: 'module',
    engines: {
      node: GENERATED_NODE_ENGINES,
    },
    scripts,
    dependencies: sortObject(dependencies),
    devDependencies: sortObject(devDependencies),
  };
}

export function mergePackageJson(existing, generated) {
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
    throw new TypeError('Existing package.json must contain a JSON object.');
  }

  const existingDependencies = { ...(existing.dependencies ?? {}) };
  const existingDevDependencies = { ...(existing.devDependencies ?? {}) };

  for (const packageName of Object.keys(generated.dependencies)) {
    delete existingDevDependencies[packageName];
  }
  for (const packageName of Object.keys(generated.devDependencies)) {
    delete existingDependencies[packageName];
  }

  const knownKeys = new Set([
    'name',
    'private',
    'version',
    'type',
    'engines',
    'scripts',
    'dependencies',
    'devDependencies',
  ]);
  const preserved = Object.fromEntries(
    Object.entries(existing).filter(([key]) => !knownKeys.has(key)),
  );

  return {
    name: generated.name,
    private: true,
    version: existing.version ?? generated.version,
    type: 'module',
    ...preserved,
    engines: {
      ...(existing.engines ?? {}),
      ...generated.engines,
    },
    scripts: {
      ...(existing.scripts ?? {}),
      ...generated.scripts,
    },
    dependencies: sortObject({
      ...existingDependencies,
      ...generated.dependencies,
    }),
    devDependencies: sortObject({
      ...existingDevDependencies,
      ...generated.devDependencies,
    }),
  };
}

export function serializePackageJson(packageJson) {
  return `${JSON.stringify(packageJson, null, 2)}\n`;
}
