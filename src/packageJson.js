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
  'typescript-eslint': '^8.19.0',
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
