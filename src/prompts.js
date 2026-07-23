import { checkbox, input, select } from '@inquirer/prompts';
import { FEATURE_DEFINITIONS, featuresFromKeys } from './features.js';
import {
  sanitizePackageName,
  validateDirectoryName,
  validatePackageName,
} from './names.js';

/**
 * Ensures stdin and stdout are TTYs before showing an interactive prompt.
 * @throws {Error} When the process is not attached to a terminal.
 */
export function assertInteractive() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'Interactive prompts require a terminal. Use --features and --install for non-interactive usage.',
    );
  }
}

/**
 * Prompts for a project directory name with validation.
 * @param {string} defaultValue - Default shown in the prompt.
 * @returns {Promise<string>} The chosen directory name.
 */
export async function promptDirectoryName(defaultValue = 'my-app') {
  assertInteractive();
  return input({
    message: 'Project directory:',
    default: defaultValue,
    validate: validateDirectoryName,
  });
}

/**
 * Prompts for a package name, sanitizing input live and on submit.
 * @param {string} defaultValue - Default name; sanitized before display.
 * @returns {Promise<string>} A sanitized, valid package name.
 */
export async function promptPackageName(defaultValue = 'my-app') {
  assertInteractive();
  return input({
    message: 'Package name:',
    default: sanitizePackageName(defaultValue) || 'my-app',
    validate: (value) => validatePackageName(sanitizePackageName(value)),
    transformer: (value) => sanitizePackageName(value),
  }).then((value) => sanitizePackageName(value));
}

/**
 * Prompts with a checkbox list of optional features.
 * @param {string[]} preselected - Feature keys to check by default.
 * @returns {Promise<Features>} Map of feature key to boolean.
 */
export async function promptFeatures(preselected = []) {
  assertInteractive();
  const selected = await checkbox({
    message: 'Select optional features:',
    choices: FEATURE_DEFINITIONS.map((feature) => ({
      name: feature.name,
      value: feature.key,
      description: feature.description,
      checked: preselected.includes(feature.key),
    })),
    pageSize: FEATURE_DEFINITIONS.length,
    loop: false,
  });
  return featuresFromKeys(selected);
}

/**
 * Prompts for how to handle conflicting files during rv init.
 * @param {string[]} conflicts - Relative paths of conflicting files (first 8 are shown).
 * @returns {Promise<string>} "overwrite", "keep", or "cancel".
 */
export async function promptConflictStrategy(conflicts) {
  assertInteractive();
  const visible = conflicts.slice(0, 8).join(', ');
  const remainder = conflicts.length > 8 ? `, and ${conflicts.length - 8} more` : '';

  return select({
    message: `Existing files conflict (${visible}${remainder}). Choose an action:`,
    choices: [
      {
        name: 'Overwrite generated files',
        value: 'overwrite',
        description: 'Replace conflicting files; unrelated files are preserved',
      },
      {
        name: 'Keep existing files',
        value: 'keep',
        description: 'Only create files that do not already exist',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Leave the directory unchanged',
      },
    ],
    default: 'keep',
    loop: false,
  });
}

/**
 * Prompts for a package manager, listing the preferred one first plus a skip option.
 * @param {string[]} available - Managers found on PATH.
 * @param {string} preferred - Manager detected from the project, listed first.
 * @returns {Promise<string>} Chosen manager name or "none".
 */
export async function promptPackageManager(available, preferred) {
  assertInteractive();
  const ordered = [...available].sort((left, right) => {
    if (left === preferred) return -1;
    if (right === preferred) return 1;
    return left.localeCompare(right);
  });

  const choices = ordered.map((manager) => ({
    name: `Install with ${manager}`,
    value: manager,
    description: manager === preferred ? 'Detected from this project' : undefined,
  }));
  choices.push({
    name: 'Skip dependency installation',
    value: 'none',
    description: 'Generate files only',
  });

  return select({
    message: 'Dependency installation:',
    choices,
    default: ordered[0] ?? 'none',
    loop: false,
  });
}

/**
 * Detects whether an error came from the user canceling an inquirer prompt.
 * @param {{ name?: string, message?: string }} error - Error to inspect.
 * @returns {boolean} true when the error represents a prompt cancellation.
 */
export function isPromptCancellation(error) {
  return (
    error?.name === 'ExitPromptError' ||
    error?.name === 'AbortPromptError' ||
    /force closed|cancelled|canceled/iu.test(error?.message ?? '')
  );
}
