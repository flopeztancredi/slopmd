#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { runLabs } from '../skills/diagnose/scripts/labs.js';
import { INSTALL_HINT, runInit } from '../lib/init.js';
import { runCheckDep } from '../lib/check-dep.js';

const HELP_TEXT = [
  'SlopMD - the markdown doctor for AI-written code',
  '',
  'Usage:',
  '  slopmd [path] [options]          Run the slop scan (lab work)',
  '  slopmd init [--dry-run] [--all]  Install the prevention layer for detected agents',
  '  slopmd check-dep <package>       Vet a dependency before adding it',
  '  slopmd help                      Show this help',
  '  slopmd --version                 Print version',
  '',
  'Scan options:',
  '  --json                  emit { score, verdict, stats, findings } as JSON',
  '  --diff [gitref]         scan only files changed since gitref (default HEAD)',
  '  --min-severity <level>  low | medium | high | critical',
  '  --fail-under <n>        exit 1 if the slop score is below n',
].join('\n');

function readVersion() {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return pkg.version;
}

function runInitCommand(args) {
  const options = { dryRun: false, all: false };
  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all') {
      options.all = true;
    } else {
      console.error('slopmd init: unknown argument: ' + arg);
      return 2;
    }
  }
  return runInit(options);
}

const SCAN_ERROR_EXIT_CODE = 2;

function runScanCommand(args) {
  const code = runLabs(args);
  if (!args.includes('--json') && code !== SCAN_ERROR_EXIT_CODE) console.log('\n' + INSTALL_HINT);
  return code;
}

function main(argv) {
  const [command, ...rest] = argv;
  if (command === '--version' || command === '-v') {
    console.log(readVersion());
    return 0;
  }
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP_TEXT);
    return 0;
  }
  if (command === 'init') return runInitCommand(rest);
  if (command === 'check-dep') return runCheckDep(rest);
  return runScanCommand(argv);
}

process.exit(main(process.argv.slice(2)));
