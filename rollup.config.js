module.exports = {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
};
