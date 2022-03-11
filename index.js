#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const chalk = require('chalk');

program
  .version(require('./package.json').version)
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
    const { name, typescript, template } = answers;
    const destUrl = path.join(__dirname, 'templates', template);

    const cwdUrl = process.cwd();

    try {
      fs.copySync(destUrl, cwdUrl);
    } catch (error) {
      console.log(error);
    }

    console.log(chalk.green('success'));
  })
  .catch((error) => {
    console.log(error);
  });
