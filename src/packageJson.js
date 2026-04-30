const VERSIONS = {
  react: '^19.2.5',
  'react-dom': '^19.2.5',
  vite: '^8.0.8',
  '@vitejs/plugin-react': '^6.0.1',

  // typescript-eslint 8.x requires TS < 6.1, so pin to the 6.0.x line.
  typescript: '~6.0.3',
  '@types/react': '^19.2.14',
  '@types/react-dom': '^19.2.3',

  tailwindcss: '^4.2.2',
  '@tailwindcss/vite': '^4.2.2',

  'react-router-dom': '^7.14.1',

  zustand: '^5.0.12',

  eslint: '^10.2.1',
  '@eslint/js': '^10.0.1',
  globals: '^17.5.0',
  'eslint-plugin-react-hooks': '^7.1.1',
  'eslint-plugin-react-refresh': '^0.5.2',
  prettier: '^3.8.3',
  'eslint-config-prettier': '^10.1.8',
  'typescript-eslint': '^8.58.2',
};

function v(name) {
  if (!VERSIONS[name]) throw new Error(`Missing version for ${name}`);
  return VERSIONS[name];
}

function sanitizeName(name) {
  const cleaned = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '');
  return cleaned || 'my-app';
}

function build(features, projectName) {
  const { typescript, tailwind, router, eslint, zustand } = features;

  const dependencies = {
    react: v('react'),
    'react-dom': v('react-dom'),
  };
  if (router) dependencies['react-router-dom'] = v('react-router-dom');
  if (zustand) dependencies.zustand = v('zustand');

  const devDependencies = {
    vite: v('vite'),
    '@vitejs/plugin-react': v('@vitejs/plugin-react'),
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
    devDependencies['eslint-plugin-react-hooks'] = v(
      'eslint-plugin-react-hooks'
    );
    devDependencies['eslint-plugin-react-refresh'] = v(
      'eslint-plugin-react-refresh'
    );
    devDependencies.prettier = v('prettier');
    devDependencies['eslint-config-prettier'] = v('eslint-config-prettier');
    if (typescript) {
      devDependencies['typescript-eslint'] = v('typescript-eslint');
    }
  }

  const scripts = {
    dev: 'vite',
    build: typescript ? 'tsc && vite build' : 'vite build',
    preview: 'vite preview',
  };
  if (eslint) {
    scripts.lint =
      'eslint . --report-unused-disable-directives --max-warnings 0';
    scripts.format = 'prettier --write .';
  }

  return {
    name: sanitizeName(projectName),
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts,
    dependencies,
    devDependencies,
  };
}

module.exports = { build, sanitizeName, VERSIONS };
