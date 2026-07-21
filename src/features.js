/**
 * Metadata for every optional feature rv can scaffold, in prompt display order.
 * Each entry has key, name, description, and aliases accepted by --features.
 */
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

/** Canonical feature keys in definition order. */
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

/**
 * Builds a feature map with every feature disabled.
 * @returns {object} Map of feature key to false.
 */
export function emptyFeatures() {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, false]));
}

/**
 * Builds a feature map with every feature enabled.
 * @returns {object} Map of feature key to true.
 */
export function allFeatures() {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]));
}

/**
 * Builds a feature map with only the given canonical keys enabled.
 * @param {string[]} keys - Canonical feature keys to enable.
 * @returns {object} Map of feature key to boolean.
 * @throws {Error} When a key is not a known feature.
 */
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

/**
 * Lists the enabled feature keys from a feature map, in definition order.
 * @param {object} features - Map of feature key to boolean.
 * @returns {string[]} Enabled feature keys.
 */
export function selectedFeatureKeys(features) {
  return FEATURE_KEYS.filter((key) => Boolean(features?.[key]));
}

/**
 * Lists the human-readable names of the enabled features, in definition order.
 * @param {object} features - Map of feature key to boolean.
 * @returns {string[]} Display names of enabled features.
 */
export function selectedFeatureNames(features) {
  const selected = new Set(selectedFeatureKeys(features));
  return FEATURE_DEFINITIONS.filter((feature) => selected.has(feature.key)).map(
    (feature) => feature.name,
  );
}

/**
 * Parses a --features value (comma-separated keys/aliases, "all", "none", or "minimal").
 * @param {string} value - Raw option value from the command line.
 * @returns {object} Map of feature key to boolean.
 * @throws {Error} When the list contains unknown feature names.
 */
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
