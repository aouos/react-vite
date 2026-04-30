const path = require('path');
const fs = require('fs-extra');
const { collectFeatures } = require('../prompts');
const scaffold = require('../scaffold');
const logger = require('../util/logger');

const NAME_RE = /^[a-zA-Z0-9._-]+$/;

module.exports = async function create(projectName) {
  if (!projectName || !NAME_RE.test(projectName) || projectName === '.' || projectName === '..') {
    logger.error(`Invalid project name: "${projectName}"`);
    logger.plain('Name must match /^[a-zA-Z0-9._-]+$/ and cannot be "." or "..".');
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    const entries = fs.readdirSync(targetDir).filter((n) => n !== '.git');
    if (entries.length > 0) {
      logger.error(`Directory "${projectName}" already exists and is not empty. Aborting.`);
      process.exit(1);
    }
  }

  const { projectName: chosenName, features } = await collectFeatures({ defaultName: projectName });
  await scaffold.run({ targetDir, projectName: chosenName, features, mode: 'create' });
};
