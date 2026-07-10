import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allAgents, detectAgents } from './agents.js';

export const MARKER_BEGIN = '<!-- slopmd:begin -->';
export const MARKER_END = '<!-- slopmd:end -->';
export const INSTALL_HINT =
  'Full examination and treatment run inside your coding agent. Install: npx skills add flopeztancredi/slopmd';

const PRIME_DIRECTIVES_PATH = fileURLToPath(
  new URL('../prevent/prime-directives.md', import.meta.url),
);
const MISSING_DIRECTIVES_MESSAGE =
  'slopmd: packaged file prevent/prime-directives.md is missing; reinstall slopmd (npm install -g slopmd)';

function print(line) {
  process.stdout.write(line + '\n');
}

function upsertBlock(existing, block) {
  const begin = existing.indexOf(MARKER_BEGIN);
  const end = existing.indexOf(MARKER_END);
  if (begin !== -1 && end !== -1 && end >= begin) {
    const content = existing.slice(0, begin) + block + existing.slice(end + MARKER_END.length);
    return { content, action: content === existing ? 'unchanged' : 'replace block in' };
  }
  if (!existing.trim()) return { content: block + '\n', action: 'append to' };
  return { content: existing.replace(/\s+$/, '') + '\n\n' + block + '\n', action: 'append to' };
}

function planTargets(agents) {
  const targets = new Map();
  for (const agent of agents) {
    const entry = targets.get(agent.target) ?? { agentNames: [], frontmatter: agent.frontmatter };
    entry.agentNames.push(agent.name);
    targets.set(agent.target, entry);
  }
  return targets;
}

function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function resolvesOutside(dir, root) {
  const realDir = realpathSync(dir);
  const realRoot = realpathSync(root);
  return realDir !== realRoot && !realDir.startsWith(realRoot + sep);
}

function writeTarget(cwd, rel, entry, block, dryRun) {
  const abs = join(cwd, rel);
  if (isSymlink(abs)) {
    print('skip ' + rel + ' (symlink; refusing to write through it)');
    return;
  }
  let action;
  let content;
  if (existsSync(abs)) {
    ({ content, action } = upsertBlock(readFileSync(abs, 'utf8'), block));
  } else {
    content = (entry.frontmatter ?? '') + block + '\n';
    action = 'create';
  }
  const label = action + ' ' + rel + ' (' + entry.agentNames.join(', ') + ')';
  if (dryRun) {
    print('[dry-run] would ' + label);
    return;
  }
  if (action === 'unchanged') {
    print('unchanged ' + rel + ' (' + entry.agentNames.join(', ') + ')');
    return;
  }
  mkdirSync(dirname(abs), { recursive: true });
  if (resolvesOutside(dirname(abs), cwd)) {
    print('skip ' + rel + ' (resolves outside the project directory)');
    return;
  }
  writeFileSync(abs, content);
  print(label);
}

/**
 * Install the SlopMD prevention block into agent instruction files.
 *
 * @param {object} [options]
 * @param {string} [options.cwd] Project directory; defaults to process.cwd().
 * @param {boolean} [options.dryRun] Print planned writes without touching disk.
 * @param {boolean} [options.all] Target every supported agent, skipping detection.
 * @returns {number} Process exit code.
 */
export function runInit(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  if (!existsSync(PRIME_DIRECTIVES_PATH)) {
    process.stderr.write(MISSING_DIRECTIVES_MESSAGE + '\n');
    return 1;
  }
  const directives = readFileSync(PRIME_DIRECTIVES_PATH, 'utf8').trim();
  const block = [MARKER_BEGIN, directives, MARKER_END].join('\n');
  const agents = options.all ? allAgents() : detectAgents(cwd);
  if (agents.length === 0) {
    print('No coding agents detected in ' + cwd + '. Rerun with --all to install for every agent.');
    return 0;
  }
  print('Detected agents: ' + agents.map((agent) => agent.name).join(', '));
  const targets = planTargets(agents);
  for (const [rel, entry] of targets) {
    writeTarget(cwd, rel, entry, block, options.dryRun === true);
  }
  print('Prevention layer ' + (options.dryRun ? 'planned' : 'installed') + ' for ' + agents.length + ' agent(s).');
  print(INSTALL_HINT);
  return 0;
}
