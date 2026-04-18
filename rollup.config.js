import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

export default {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
    exports: 'auto',
  },
  external: [
    'commander',
    'inquirer',
    'chalk',
    'fs-extra',
    'fs',
    'path',
    'child_process',
    'os',
    'url',
    'util',
    'stream',
    'events',
    'assert',
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
  ],
};
