# 11. Diff Discipline, Formatting, and Prose

## Rules

- One intent per diff. Never mix refactoring with behavior change; they go in separate commits. [Fowler, Refactoring ch.2 "two hats"]
- Change the minimum that accomplishes the task: no drive-by renames, no reformatting untouched lines, no deleting code you cannot explain. [Google small-CL practice; Pragmatic Programmer topic 38]
- Boy Scout Rule, scoped: leave the code you touched cleaner, do not rewrite the file. [Clean Code]
- No emojis in code, comments, logs, commit messages, CLI output, or docs, unless the project already uses them deliberately.
- Plain ASCII punctuation in code and docs: no em dashes, en dashes, middle dots, typographic quotes, or ellipsis characters.
<!-- slopmd-ignore: this rule quotes the banned words -->
- No marketing vocabulary in code, docs, or commits: comprehensive, robust, seamless, leverage, delve, cutting-edge, supercharge. State what it does.
- Commit messages state intent and effect in imperative mood ("Fix pagination overflow on empty result"). No process narration, no self-praise. If the project uses a commit convention (Conventional Commits, gitmoji, ticket prefixes), follow it exactly; check `git log` before writing the message.
- Before finishing any change: remove debug prints, unused imports, dead variables, commented-out code, and both-paths-kept feature flags nobody set.
- If you cannot explain why the code works, it is not done. No programming by coincidence. [Pragmatic Programmer topic 38]

## Symptoms

- A bugfix PR that also renames 14 identifiers and reformats 300 lines.
- `console.log("HERE 2")` surviving into the diff.
- Commit messages like "Enhanced error handling for improved robustness" (says nothing).
- README prose with emoji bullets, em-dashes, and rule-of-three marketing sentences.
- Old implementation kept alongside the new one "just in case", gated by a constant that is always true.

## Treatment

- Split mixed diffs: behavior change first, refactor second, formatting never (leave it to the formatter).
- Strip debug leftovers and dead paths; delete the old implementation once the new one is verified.
- Rewrite slop prose in plain declarative sentences with ASCII punctuation.
