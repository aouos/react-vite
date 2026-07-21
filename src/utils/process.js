import { spawn, spawnSync } from 'node:child_process';

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
