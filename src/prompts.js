const inquirer = require('inquirer');
const { sanitizeName } = require('./packageJson');

async function collectFeatures({ defaultName }) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: defaultName || 'my-app',
      filter: (val) => sanitizeName(val),
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Add Tailwind CSS?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'router',
      message: 'Add React Router?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Add ESLint + Prettier?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'zustand',
      message: 'Add Zustand for state management?',
      default: false,
    },
  ]);

  const { projectName, ...features } = answers;
  return { projectName, features };
}

module.exports = { collectFeatures };
