const path = require('path');
const { collectFeatures } = require('../prompts');
const scaffold = require('../scaffold');

module.exports = async function init() {
  const targetDir = process.cwd();
  const defaultName = path.basename(targetDir);
  const { projectName, features } = await collectFeatures({ defaultName });
  await scaffold.run({ targetDir, projectName, features, mode: 'init' });
};
