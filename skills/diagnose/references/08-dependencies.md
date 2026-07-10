# 8. Dependencies and Project Conventions

## Rules

- Read neighboring code first. Match the project's style, idioms, test patterns, and libraries, even against your own preference. Local convention beats global best practice. [Google style meta-rule]
- Reuse before writing: search the repo and the standard library for an existing helper before creating one. Duplicated helpers per call site are slop.
- Add a dependency only when the code you would write instead is clearly worse. A little copying is better than a little dependency. [Go proverbs]
- Verify every new dependency before adding it: it exists on the official registry, is established and maintained, and is not a lookalike of a popular name. Roughly 20 percent of LLM-suggested package names do not exist, and attackers register them (slopsquatting). Run the check-dep script when available; a requires-approval verdict stops the work until a human approves. [USENIX Security 2025; OWASP A06]
- Pin dependencies to exact versions. No `^`, `~`, `*`, or `latest` for newly added packages; lockfiles committed. [12-factor II]
- Use the project's existing config mechanism, formatter, and linter; never introduce a second one, never hand-format against the formatter.
- Never use an API from memory when the project's installed version may differ: check the version in the manifest and the current docs for that version.

## Symptoms

- A new utility function duplicating something in the same repo or the standard library.
- A dependency added for 5 lines of code (left-pad syndrome).
- Version ranges on fresh dependencies; a mix of API styles from different library versions in one file.
- Imports of packages that do not exist or methods that do not exist on the real library (hallucination).
- A second HTTP client, date library, or state manager appearing beside the established one.

## Treatment

- Replace duplicated helpers with the existing one; if the new version is better, improve the original in place instead.
- Remove trivial dependencies by inlining the needed lines (with attribution if copied).
- Pin unpinned versions; verify suspicious packages with check-dep before anything else.
