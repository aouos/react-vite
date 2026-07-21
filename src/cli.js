import { createRequire } from 'node:module';
import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { isPromptCancellation } from './prompts.js';
import { logger } from './utils/logger.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

function addSharedOptions(command) {
  return command
    .option(
      '-f, --features <list>',
      'comma-separated features: typescript,tailwind,router,eslint,zustand; use all or none',
    )
    .option(
      '--install <manager>',
      'install with npm, pnpm, or yarn; use none to skip installation',
    );
}

export function createProgram() {
  const program = new Command();

  program
    .name('rv')
    .description(
      'Create or initialize React + Vite projects with optional, fully configured features.',
    )
    .version(packageJson.version, '-v, --version', 'print the installed rv version')
    .showHelpAfterError()
    .configureHelp({ sortSubcommands: true, sortOptions: true })
    .addHelpText(
      'after',
      `
Examples:
  $ rv create my-app
  $ rv create my-app --features all --install npm
  $ rv init --features typescript,tailwind --install none
`,
    );

  addSharedOptions(
    program
      .command('create')
      .description('create a project in a new directory')
      .argument('[project-directory]', 'directory to create; prompts when omitted'),
  ).action(async (projectDirectory, options) => {
    await createCommand(projectDirectory, options);
  });

  addSharedOptions(
    program
      .command('init')
      .description('initialize or safely merge a project in the current directory')
      .option('--name <package-name>', 'package name; defaults to package.json or directory name')
      .option(
        '--conflicts <strategy>',
        'existing-file strategy: overwrite, keep, or cancel',
      ),
  ).action(async (options) => {
    await initCommand(options);
  });

  return program;
}

export async function runCli(argv = process.argv) {
  try {
    const effectiveArgv = argv.length <= 2 ? [...argv, '--help'] : argv;
    await createProgram().parseAsync(effectiveArgv);
  } catch (error) {
    if (isPromptCancellation(error)) {
      logger.warn('\nCanceled.');
      process.exitCode = 130;
      return;
    }

    logger.error(error?.message ?? String(error));
    if (process.env.RV_DEBUG && error?.stack) {
      logger.error(error.stack);
    }
    process.exitCode = 1;
  }
}
