#!/usr/bin/env node

const inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'project-name',
      message: 'Input your project name',
      default: 'react-vite',
    },
  ])
  .then((answers) => {
    console.log(answers);
  })
  .catch((error) => {
    console.log(error);
  });
