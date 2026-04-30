const { spawnSync } = require('child_process');
const inquirer = require('inquirer');
const { run } = require('./util/exec');
const logger = require('./util/logger');

function isAvailable(cmd) {
  try {
    const result = spawnSync(cmd, ['--version'], {
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });
    return result.status === 0;
  } catch (_e) {
    return false;
  }
}

function detect() {
  return ['npm', 'yarn', 'pnpm'].filter(isAvailable);
}

async function promptAndInstall(targetDir) {
  const { doInstall } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'doInstall',
      message: 'Install dependencies now?',
      default: true,
    },
  ]);
  if (!doInstall) return false;

  const available = detect();
  if (available.length === 0) {
    logger.warn(
      'No package manager (npm/yarn/pnpm) found on PATH. Skipping install.'
    );
    return false;
  }

  let pm = available[0];
  if (available.length > 1) {
    const { chosen } = await inquirer.prompt([
      {
        type: 'list',
        name: 'chosen',
        message: 'Which package manager?',
        choices: available,
        default: available[0],
      },
    ]);
    pm = chosen;
  }

  logger.info(`\nRunning ${pm} install...`);
  try {
    await run(pm, ['install'], { cwd: targetDir });
    return true;
  } catch (err) {
    logger.warn(`\n${pm} install failed: ${err.message}`);
    logger.warn(`You can retry manually: cd ${targetDir} && ${pm} install`);
    return false;
  }
}

module.exports = { detect, promptAndInstall };
