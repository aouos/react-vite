import path from 'node:path';

const WINDOWS_RESERVED_NAMES = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9',
]);

const PACKAGE_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9._-]*$/u;

// Lowercases and collapses invalid characters into hyphens to form a valid name segment.
function sanitizePackageSegment(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^a-z0-9._-]+/gu, '-')
    .replace(/^[._-]+|[._-]+$/gu, '')
    .replace(/-{2,}/gu, '-');
}

/**
 * Validates a project directory name for rv create.
 * @param {string} value - Candidate directory name.
 * @returns {true|string} true when valid, otherwise a human-readable error message.
 */
export function validateDirectoryName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Project directory name is required.';
  if (name === '.' || name === '..') return 'Use rv init for the current directory.';
  if (name.length > 120) return 'Project directory name must be 120 characters or fewer.';
  if (name !== path.basename(name) || /[\\/]/u.test(name)) {
    return 'Use a single directory name without path separators.';
  }
  if (!/^[A-Za-z0-9._-]+$/u.test(name)) {
    return 'Use only letters, numbers, dots, underscores, and hyphens.';
  }
  if (/^[._-]+$/u.test(name)) return 'Project directory name must contain a letter or number.';
  if (WINDOWS_RESERVED_NAMES.has(name.toLowerCase())) {
    return `"${name}" is reserved by Windows.`;
  }
  if (/[. ]$/u.test(name)) return 'Project directory name cannot end with a dot or space.';
  return true;
}

/**
 * Normalizes arbitrary input into a valid npm package name, preserving @scope/name form.
 * @param {string} value - Raw name input.
 * @returns {string} Sanitized package name, possibly empty when nothing usable remains.
 */
export function sanitizePackageName(value) {
  const raw = String(value ?? '').trim();

  if (raw.startsWith('@')) {
    const slashIndex = raw.indexOf('/');
    if (slashIndex > 1 && slashIndex === raw.lastIndexOf('/')) {
      const scope = sanitizePackageSegment(raw.slice(1, slashIndex));
      const name = sanitizePackageSegment(raw.slice(slashIndex + 1));
      if (scope && name) return `@${scope}/${name}`.slice(0, 214);
    }
  }

  return sanitizePackageSegment(raw).slice(0, 214);
}

/**
 * Validates an npm package name, including scoped names and Windows-reserved words.
 * @param {string} value - Candidate package name.
 * @returns {true|string} true when valid, otherwise a human-readable error message.
 */
export function validatePackageName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Package name is required.';
  if (name.length > 214) return 'Package name must be 214 characters or fewer.';
  if (name !== name.toLowerCase()) return 'Package name must be lowercase.';

  let scope;
  let packageName = name;
  if (name.startsWith('@')) {
    const parts = name.slice(1).split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return 'Scoped package names must use the form @scope/name.';
    }
    [scope, packageName] = parts;
  } else if (name.includes('/')) {
    return 'Package names may only contain a slash when using @scope/name.';
  }

  if (scope && !PACKAGE_SEGMENT_PATTERN.test(scope)) {
    return 'Package scope must use lowercase letters, numbers, dots, underscores, and hyphens.';
  }
  if (!PACKAGE_SEGMENT_PATTERN.test(packageName)) {
    return 'Package name must use lowercase letters, numbers, dots, underscores, and hyphens.';
  }
  if (WINDOWS_RESERVED_NAMES.has(packageName)) {
    return `"${packageName}" is reserved by Windows.`;
  }
  return true;
}

/**
 * Derives a package name from a directory name, falling back to "my-app".
 * @param {string} directoryName - Directory name to sanitize.
 * @returns {string} A non-empty package name.
 */
export function packageNameFromDirectory(directoryName) {
  return sanitizePackageName(directoryName) || 'my-app';
}

/**
 * Validates a page/component/store name segment for rv add.
 * @param {string} value - Candidate name (letters, numbers, single hyphens).
 * @returns {true|string} true when valid, otherwise a human-readable error message.
 */
export function validatePageName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Page name is required.';
  if (name.length > 40) return 'Page name must be 40 characters or fewer.';
  if (!/^[A-Za-z][A-Za-z0-9-]*$/u.test(name)) {
    return 'Page names must start with a letter and use only letters, numbers, and hyphens.';
  }
  if (/-$/u.test(name) || /--/u.test(name)) {
    return 'Page names cannot end with a hyphen or contain consecutive hyphens.';
  }
  return true;
}

/**
 * Converts a hyphenated name to a PascalCase React component name (e.g. user-card -> UserCard).
 * @param {string} value - Hyphenated name.
 * @returns {string} PascalCase component name.
 */
export function pageComponentName(value) {
  return String(value)
    .split('-')
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('');
}

/**
 * Normalizes a page name into a lowercase route path segment.
 * @param {string} value - Page name.
 * @returns {string} Lowercased, trimmed route segment.
 */
export function pageRoutePath(value) {
  return String(value).trim().toLowerCase();
}

/**
 * Builds a Zustand hook name from a store name, avoiding a doubled "use" prefix.
 * @param {string} value - Store name (e.g. cart or use-cart).
 * @returns {string} Hook name such as useCart.
 */
export function storeHookName(value) {
  const base = String(value).replace(/^use-?/iu, '');
  return `use${pageComponentName(base)}`;
}
