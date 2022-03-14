import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './src/index.js',
  output: {
    file: './lib/index.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    resolve(),
    uglify(),
    babel({
      exclude: 'node_modules',
    }),
  ],
};
