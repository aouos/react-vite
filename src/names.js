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

function sanitizePackageSegment(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^a-z0-9._-]+/gu, '-')
    .replace(/^[._-]+|[._-]+$/gu, '')
    .replace(/-{2,}/gu, '-');
}

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

export function packageNameFromDirectory(directoryName) {
  return sanitizePackageName(directoryName) || 'my-app';
}
