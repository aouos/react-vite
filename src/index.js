const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

program
  .name('rv')
  .description('Scaffold minimal React + Vite projects')
  .version(pkg.version, '-v, --version', 'output the current version');

program
  .command('init')
  .description('Initialize a React + Vite project in the current directory')
  .action(async () => {
    try {
      await require('./commands/init')();
    } catch (err) {
      console.error(chalk.red(err.stack || err.message));
      process.exit(1);
    }
  });

program
  .command('create <project-name>')
  .description('Create a new React + Vite project in ./<project-name>')
  .action(async (projectName) => {
    try {
      await require('./commands/create')(projectName);
    } catch (err) {
      console.error(chalk.red(err.stack || err.message));
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
