import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CURSOR_RULE_FRONTMATTER = [
  '---',
  'description: SlopMD anti-slop prime directives',
  'alwaysApply: true',
  '---',
  '',
  '',
].join('\n');

const WINDSURF_RULE_FRONTMATTER = [
  '---',
  'trigger: always_on',
  '---',
  '',
  '',
].join('\n');

const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    markers: ['.claude', 'CLAUDE.md'],
    target: 'CLAUDE.md',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    markers: ['.cursor'],
    target: '.cursor/rules/slopmd.mdc',
    frontmatter: CURSOR_RULE_FRONTMATTER,
  },
  {
    id: 'codex',
    name: 'Codex',
    markers: ['AGENTS.md'],
    homeMarkers: ['.codex'],
    target: 'AGENTS.md',
  },
  {
    id: 'copilot',
    name: 'Copilot',
    markers: ['.github'],
    target: '.github/copilot-instructions.md',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    markers: ['.windsurf'],
    target: '.windsurf/rules/slopmd.md',
    frontmatter: WINDSURF_RULE_FRONTMATTER,
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    markers: ['GEMINI.md', '.gemini'],
    target: 'GEMINI.md',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    markers: ['opencode.json', '.opencode'],
    target: 'AGENTS.md',
  },
];

/**
 * List every supported agent definition.
 *
 * @returns {object[]} Agent definitions with id, name, markers, and target.
 */
export function allAgents() {
  return AGENTS;
}

/**
 * Detect which coding agents are present for a project directory.
 *
 * @param {string} cwd Project directory to inspect.
 * @returns {object[]} Detected agent definitions.
 */
export function detectAgents(cwd) {
  return AGENTS.filter((agent) => {
    if (agent.markers.some((marker) => existsSync(join(cwd, marker)))) return true;
    return (agent.homeMarkers ?? []).some((marker) => existsSync(join(homedir(), marker)));
  });
}
