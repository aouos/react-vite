import { checkbox, input, select } from '@inquirer/prompts';
import { FEATURE_DEFINITIONS, featuresFromKeys } from './features.js';
import {
  sanitizePackageName,
  validateDirectoryName,
  validatePackageName,
} from './names.js';

export function assertInteractive() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'Interactive prompts require a terminal. Use --features and --install for non-interactive usage.',
    );
  }
}

export async function promptDirectoryName(defaultValue = 'my-app') {
  assertInteractive();
  return input({
    message: 'Project directory:',
    default: defaultValue,
    validate: validateDirectoryName,
  });
}

export async function promptPackageName(defaultValue = 'my-app') {
  assertInteractive();
  return input({
    message: 'Package name:',
    default: sanitizePackageName(defaultValue) || 'my-app',
    validate: (value) => validatePackageName(sanitizePackageName(value)),
    transformer: (value) => sanitizePackageName(value),
  }).then((value) => sanitizePackageName(value));
}

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

export function isPromptCancellation(error) {
  return (
    error?.name === 'ExitPromptError' ||
    error?.name === 'AbortPromptError' ||
    /force closed|cancelled|canceled/iu.test(error?.message ?? '')
  );
}
