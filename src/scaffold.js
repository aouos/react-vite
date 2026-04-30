const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getFiles } = require('./templates');
const { build: buildPkg } = require('./packageJson');
const { resolveConflicts } = require('./conflicts');
const { promptAndInstall } = require('./pkgManager');
const logger = require('./util/logger');

async function writeFiles(targetDir, files) {
  for (const f of files) {
    const abs = path.join(targetDir, f.dest);
    await fs.ensureDir(path.dirname(abs));
    if (f.source) {
      await fs.copy(f.source, abs, { overwrite: true });
    } else {
      await fs.writeFile(abs, f.contents, 'utf8');
    }
  }
}

async function run({ targetDir, projectName, features, mode }) {
  await fs.ensureDir(targetDir);

  const fileList = getFiles(features, projectName);
  fileList.push({
    dest: 'package.json',
    contents: JSON.stringify(buildPkg(features, projectName), null, 2) + '\n',
  });

  let toWrite = fileList;
  if (mode === 'init') {
    const result = await resolveConflicts(targetDir, fileList);
    if (result.mode === 'cancel') {
      logger.warn('\nAborted.');
      process.exit(1);
    }
    toWrite = result.files;
  }

  logger.info(`\nScaffolding project in ${targetDir}`);
  await writeFiles(targetDir, toWrite);
  logger.success(`\nCreated ${toWrite.length} files.`);

  const installed = await promptAndInstall(targetDir);

  printDone(targetDir, projectName, mode, installed);
}

function printDone(targetDir, projectName, mode, installed) {
  console.log('\n' + chalk.green('Done!') + ' Next steps:');
  const rel = path.relative(process.cwd(), targetDir);
  if (mode === 'create' && rel) {
    console.log('  ' + chalk.cyan(`cd ${rel}`));
  }
  if (!installed) {
    console.log('  ' + chalk.cyan('npm install'));
  }
  console.log('  ' + chalk.cyan('npm run dev'));
  console.log('');
}

module.exports = { run };
