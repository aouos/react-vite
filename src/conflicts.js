const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

async function resolveConflicts(targetDir, fileList) {
  const existing = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
  const meaningful = existing.filter((name) => name !== '.git');
  if (meaningful.length === 0) {
    return { mode: 'write', files: fileList };
  }

  const conflicts = fileList.filter((f) =>
    fs.existsSync(path.join(targetDir, f.dest))
  );
  if (conflicts.length === 0) {
    return { mode: 'write', files: fileList };
  }

  console.log(
    chalk.yellow('\nThe following files already exist in the target directory:')
  );
  const shown = conflicts.slice(0, 20);
  shown.forEach((f) => console.log('  ' + f.dest));
  if (conflicts.length > shown.length) {
    console.log(chalk.gray(`  ...+${conflicts.length - shown.length} more`));
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'How do you want to handle these?',
      choices: [
        { name: 'Overwrite all conflicting files', value: 'overwrite' },
        { name: 'Skip conflicting files (keep existing)', value: 'skip' },
        { name: 'Cancel', value: 'cancel' },
      ],
      default: 'skip',
    },
  ]);

  if (action === 'cancel') {
    return { mode: 'cancel', files: [] };
  }
  if (action === 'skip') {
    const conflictSet = new Set(conflicts.map((f) => f.dest));
    return {
      mode: 'write',
      files: fileList.filter((f) => !conflictSet.has(f.dest)),
    };
  }
  return { mode: 'write', files: fileList };
}

module.exports = { resolveConflicts };
