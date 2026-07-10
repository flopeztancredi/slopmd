import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CHECK_DEP_SCRIPT_PATH = fileURLToPath(
  new URL('../skills/check-dep/scripts/check-dep.js', import.meta.url),
);
const MISSING_SCRIPT_MESSAGE =
  'slopmd: the check-dep script is missing from this installation; reinstall slopmd (npm install -g slopmd)';
const USAGE_MESSAGE = 'Usage: slopmd check-dep <package> [flags]';
const EXIT_USAGE_ERROR = 3;

/**
 * Run the packaged check-dep script with the given arguments.
 *
 * @param {string[]} args Arguments passed through to check-dep.js.
 * @returns {number} Process exit code.
 */
export function runCheckDep(args) {
  if (args.length === 0) {
    process.stderr.write(USAGE_MESSAGE + '\n');
    return EXIT_USAGE_ERROR;
  }
  if (!existsSync(CHECK_DEP_SCRIPT_PATH)) {
    process.stderr.write(MISSING_SCRIPT_MESSAGE + '\n');
    return EXIT_USAGE_ERROR;
  }
  const result = spawnSync(process.execPath, [CHECK_DEP_SCRIPT_PATH, ...args], {
    stdio: 'inherit',
  });
  return result.status ?? EXIT_USAGE_ERROR;
}
