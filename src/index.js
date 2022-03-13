const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

program
  .version(require('../package.json').version)
  .option('-v, --version', 'react-vite version');

program.parse(process.argv);

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Input your project name',
      default: 'react-vite',
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use typescript template',
      default: false,
    },
    {
      type: 'list',
      name: 'template',
      choices: ['react', 'react-ts', 'react-antd'],
      message: 'Choice the template',
      default: 'react',
    },
  ])
  .then((answers) => {
    console.log(answers);
    console.log(chalk.green(`\nIn development`));
  })
  .catch((error) => {
    console.log(error);
  });
