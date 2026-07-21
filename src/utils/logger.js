import pc from 'picocolors';

/**
 * Console logger with picocolors styling: info (plain), success (green), warn (yellow),
 * error (red), and label(label, value) for dimmed "label: value" lines.
 */
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
