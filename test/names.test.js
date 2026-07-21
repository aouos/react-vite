import test from 'node:test';
import assert from 'node:assert/strict';
import {
  packageNameFromDirectory,
  sanitizePackageName,
  validateDirectoryName,
  validatePackageName,
} from '../src/names.js';

test('directory names are portable and intentionally limited to one segment', () => {
  assert.equal(validateDirectoryName('my-app'), true);
  assert.equal(validateDirectoryName('My_App.2'), true);
  assert.match(validateDirectoryName('../app'), /single directory name/);
  assert.match(validateDirectoryName('.'), /rv init/);
  assert.match(validateDirectoryName('CON'), /reserved by Windows/);
});

test('package names are sanitized for npm, including scopes', () => {
  assert.equal(sanitizePackageName('My New App'), 'my-new-app');
  assert.equal(sanitizePackageName('@My Scope/My App'), '@my-scope/my-app');
  assert.equal(sanitizePackageName('---'), '');
  assert.equal(packageNameFromDirectory('My_App'), 'my_app');
});

test('package name validation accepts npm-style scoped and unscoped names', () => {
  assert.equal(validatePackageName('my-app'), true);
  assert.equal(validatePackageName('@scope/my-app'), true);
  assert.match(validatePackageName('@scope'), /@scope\/name/);
  assert.match(validatePackageName('My-App'), /lowercase/);
  assert.match(validatePackageName('scope/name'), /only contain a slash/);
});
