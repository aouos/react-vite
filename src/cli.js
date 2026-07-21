import { createRequire } from 'node:module';
import { Command } from 'commander';
import { addCommand } from './commands/add.js';
import { createCommand } from './commands/create.js';
import { doctorCommand } from './commands/doctor.js';
import { updateCommand } from './commands/update.js';
import { initCommand } from './commands/init.js';
import { isPromptCancellation } from './prompts.js';
import { logger } from './utils/logger.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

// Attaches the --features/--install/--dry-run options shared by create and init.
function addSharedOptions(command) {
  return command
    .option(
      '-f, --features <list>',
      'comma-separated features: typescript,tailwind,router,eslint,zustand; use all or none',
    )
    .option(
      '--install <manager>',
      'install with npm, pnpm, or yarn; use none to skip installation',
    )
    .option('--dry-run', 'preview the files that would be written without writing them');
}

/**
 * Builds the fully configured commander program with all rv subcommands.
 * @returns {object} A commander Command instance ready to parse argv.
 */
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
  $ rv add page blog
`,
    );

  program
    .command('add')
    .description('add pieces to an existing rv project')
    .argument('<type>', 'what to add: page, component, or store')
    .argument('<name>', 'name for the new piece, e.g. blog, blog/detail, or user-card')
    .option('--dry-run', 'preview what would be created without writing')
    .action(async (type, name, options) => {
      await addCommand(type, name, { dryRun: options.dryRun });
    });

  program
    .command('doctor')
    .description('check the current project for dependency drift and rv health')
    .action(async () => {
      await doctorCommand();
    });

  program
    .command('update')
    .description('pin template-managed dependencies back to the versions rv verifies')
    .option('--dry-run', 'report what would change without touching package.json')
    .action(async (options) => {
      await updateCommand({ dryRun: options.dryRun });
    });

  addSharedOptions(
    program
      .command('create')
      .description('create a project in a new directory')
      .argument('[project-directory]', 'directory to create; prompts when omitted')
      .option('--no-git', 'skip initializing a git repository'),
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

/**
 * Runs the CLI, translating prompt cancellations and errors into exit codes.
 * @param {string[]} argv - Process argument vector; defaults to process.argv.
 * @returns {Promise<void>} Resolves when parsing finishes; sets process.exitCode on failure.
 */
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
