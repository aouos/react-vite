/**
 * Metadata for every optional feature rv can scaffold, in prompt display order.
 * Each entry has key, name, description, and aliases accepted by --features.
 * @type {readonly FeatureDefinition[]}
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
  {
    key: 'shadcn',
    name: 'shadcn/ui',
    description: 'shadcn/ui setup with an example Button (implies TypeScript + Tailwind)',
    aliases: ['shadcn-ui', 'shadcnui', 'ui'],
  },
]);

/**
 * Canonical feature keys in definition order.
 * @type {readonly FeatureKey[]}
 */
export const FEATURE_KEYS = Object.freeze(
  FEATURE_DEFINITIONS.map((feature) => feature.key),
);

/** @type {Map<string, FeatureKey>} */
const FEATURE_LOOKUP = new Map();
for (const feature of FEATURE_DEFINITIONS) {
  FEATURE_LOOKUP.set(feature.key, feature.key);
  for (const alias of feature.aliases) {
    FEATURE_LOOKUP.set(alias, feature.key);
  }
}

/**
 * Builds a feature map with every feature disabled.
 * @returns {Features} Map of feature key to false.
 */
export function emptyFeatures() {
  return /** @type {Features} */ (
    Object.fromEntries(FEATURE_KEYS.map((key) => [key, false]))
  );
}

/**
 * Builds a feature map with every feature enabled.
 * @returns {Features} Map of feature key to true.
 */
export function allFeatures() {
  return /** @type {Features} */ (
    Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]))
  );
}

/**
 * Applies feature implications: shadcn/ui requires TypeScript and Tailwind, so selecting it
 * turns both on. Returns a new map; the input is not mutated.
 * @param {Features} features - Map of feature key to boolean.
 * @returns {Features} Normalized feature map with every canonical key present.
 */
export function normalizeFeatures(features) {
  const result = { ...emptyFeatures(), ...features };
  if (result.shadcn) {
    result.typescript = true;
    result.tailwind = true;
  }
  return result;
}

/**
 * Reports whether shadcn/ui scaffolding should be emitted. shadcn requires both Tailwind
 * and TypeScript, so its files only activate when all three flags are present — this keeps
 * template and package output coherent even for unnormalized feature maps.
 * @param {Features} features - Map of feature key to boolean.
 * @returns {boolean} true when shadcn output is coherent and enabled.
 */
export function shadcnEnabled(features) {
  return Boolean(features?.shadcn && features?.tailwind && features?.typescript);
}

/**
 * Builds a feature map with only the given canonical keys enabled.
 * @param {string[]} keys - Canonical feature keys to enable.
 * @returns {Features} Map of feature key to boolean.
 * @throws {Error} When a key is not a known feature.
 */
export function featuresFromKeys(keys = []) {
  const result = emptyFeatures();
  for (const key of keys) {
    if (!FEATURE_KEYS.includes(/** @type {FeatureKey} */ (key))) {
      throw new Error(`Unknown feature: ${key}`);
    }
    result[/** @type {FeatureKey} */ (key)] = true;
  }
  return result;
}

/**
 * Lists the enabled feature keys from a feature map, in definition order.
 * @param {Features} features - Map of feature key to boolean.
 * @returns {FeatureKey[]} Enabled feature keys.
 */
export function selectedFeatureKeys(features) {
  return FEATURE_KEYS.filter((key) => Boolean(features?.[key]));
}

/**
 * Lists the human-readable names of the enabled features, in definition order.
 * @param {Features} features - Map of feature key to boolean.
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
 * @returns {Features} Map of feature key to boolean.
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

  /** @type {FeatureKey[]} */
  const keys = [];
  /** @type {string[]} */
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
