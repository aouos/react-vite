export const FEATURE_DEFINITIONS = Object.freeze([
  {
    key: 'typescript',
    name: 'TypeScript',
    description: 'Strict .tsx sources and project references',
    aliases: ['ts'],
  },
  {
    key: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Tailwind CSS v4 with the official Vite plugin',
    aliases: ['tailwindcss'],
  },
  {
    key: 'router',
    name: 'React Router',
    description: 'A working two-page router and navigation',
    aliases: ['react-router', 'react-router-dom'],
  },
  {
    key: 'eslint',
    name: 'ESLint + Prettier',
    description: 'ESLint flat config, lint scripts, and formatting',
    aliases: ['lint', 'prettier'],
  },
  {
    key: 'zustand',
    name: 'Zustand',
    description: 'A small typed counter store and example component',
    aliases: ['store'],
  },
]);

export const FEATURE_KEYS = Object.freeze(
  FEATURE_DEFINITIONS.map((feature) => feature.key),
);

const FEATURE_LOOKUP = new Map();
for (const feature of FEATURE_DEFINITIONS) {
  FEATURE_LOOKUP.set(feature.key, feature.key);
  for (const alias of feature.aliases) {
    FEATURE_LOOKUP.set(alias, feature.key);
  }
}

export function emptyFeatures() {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, false]));
}

export function allFeatures() {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]));
}

export function featuresFromKeys(keys = []) {
  const result = emptyFeatures();
  for (const key of keys) {
    if (!FEATURE_KEYS.includes(key)) {
      throw new Error(`Unknown feature: ${key}`);
    }
    result[key] = true;
  }
  return result;
}

export function selectedFeatureKeys(features) {
  return FEATURE_KEYS.filter((key) => Boolean(features?.[key]));
}

export function selectedFeatureNames(features) {
  const selected = new Set(selectedFeatureKeys(features));
  return FEATURE_DEFINITIONS.filter((feature) => selected.has(feature.key)).map(
    (feature) => feature.name,
  );
}

export function parseFeatureList(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized || normalized === 'none' || normalized === 'minimal') {
    return emptyFeatures();
  }
  if (normalized === 'all') return allFeatures();

  const rawKeys = normalized
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  const keys = [];
  const unknown = [];
  for (const rawKey of rawKeys) {
    const key = FEATURE_LOOKUP.get(rawKey);
    if (!key) {
      unknown.push(rawKey);
      continue;
    }
    if (!keys.includes(key)) keys.push(key);
  }

  if (unknown.length > 0) {
    throw new Error(
      `Unknown feature${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. ` +
        `Available values: ${FEATURE_KEYS.join(', ')}, all, or none.`,
    );
  }

  return featuresFromKeys(keys);
}
