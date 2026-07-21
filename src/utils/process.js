import { spawn, spawnSync } from 'node:child_process';

/**
 * Checks whether a command is runnable by invoking "<command> --version".
 * @param {string} command - Executable name.
 * @returns {boolean} true when the command exits with status 0.
 */
export function commandExists(command) {
  try {
    const result = spawnSync(command, ['--version'], {
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Runs a command synchronously with output suppressed, never throwing.
 * @param {string} command - Executable name.
 * @param {string[]} args - Command arguments.
 * @param {object} options - Extra spawnSync options (e.g. cwd).
 * @returns {boolean} true when the command exits with status 0.
 */
export function tryCommand(command, args, options = {}) {
  try {
    const result = spawnSync(command, args, {
      stdio: 'ignore',
      shell: process.platform === 'win32',
      ...options,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Runs a command asynchronously with inherited stdio.
 * @param {string} command - Executable name.
 * @param {string[]} args - Command arguments.
 * @param {object} options - Extra spawn options (e.g. cwd).
 * @returns {Promise<void>} Resolves on exit code 0, rejects with a descriptive Error otherwise.
 */
export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      const suffix = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new Error(`${command} ${args.join(' ')} failed with ${suffix}.`));
    });
  });
}
