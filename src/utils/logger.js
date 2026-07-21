import pc from 'picocolors';

export const logger = Object.freeze({
  info(message = '') {
    console.log(message);
  },
  success(message) {
    console.log(pc.green(message));
  },
  warn(message) {
    console.warn(pc.yellow(message));
  },
  error(message) {
    console.error(pc.red(message));
  },
  label(label, value) {
    console.log(`${pc.dim(`${label}:`)} ${value}`);
  },
});
