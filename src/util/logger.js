const chalk = require('chalk');

module.exports = {
  info: (msg) => console.log(chalk.cyan(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  error: (msg) => console.log(chalk.red(msg)),
  plain: (msg) => console.log(msg),
  dim: (msg) => console.log(chalk.gray(msg)),
};
