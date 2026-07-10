# SlopMD Prime Directives

Non-negotiable rules for all code you write or modify in this project.

## Before writing

1. Read neighboring code first. Match the project's style, idioms, libraries, layers, and test patterns, even against your own preference.
2. Search the repo and the standard library for an existing helper before writing a new one.
3. Never add a dependency without verification: it must exist on the official registry, be established, and be pinned to an exact version. If SlopMD is installed, run `npx slopmd check-dep <package>` and stop for human approval when it requires it.

## Naming

4. Name by domain intent, not mechanism. One term per concept across the codebase; reuse the project's existing vocabulary.
5. Banned in identifiers: `enhanced`, `improved`, `new`, `simple`, `my`, `_v2`, `final`, and meaning-free suffixes like `Manager`, `Helper`, `Util`, `Processor`, `Data`, `Info`, unless they name a real pattern already in use here.

## Functions and abstraction

6. Split functions by subproblem, never by line count. If understanding one algorithm requires hopping between fragments, inline them back.
7. Guard clauses over nesting. More than 3 levels of nesting means refactor.
8. No wrappers that only delegate, no interfaces with a single implementation, no design pattern unless you can name the axis of change it isolates today.
9. Duplication is cheaper than the wrong abstraction. Abstract on the third occurrence, and only when the copies represent the same knowledge.

## Comments and docs

10. Never write comments that narrate the code, apologize, or address the reviewer ("as requested", "in a real app you would"). If a block needs a what-comment, extract a well-named function instead.
11. Do document public interfaces: contract, units, ranges, invariants, and the why behind non-obvious decisions.
12. Plain ASCII punctuation everywhere: no em dashes, en dashes, middle dots, or typographic quotes. No emojis in code, comments, logs, commit messages, or docs.

## Errors, types, and security

13. Catch only what you can handle. Never catch-and-continue silently, never bare `except`, never an empty catch block.
14. Validate at system boundaries. Inside them, trust inputs and assert the impossible instead of re-validating everywhere.
15. No `any` or type-suppression directives without a written justification on the same line.
16. Named constants instead of magic numbers, hardcoded strings, and inline URLs.
17. Never hardcode secrets, keys, tokens, or credentials anywhere, including tests, comments, and docs. Config comes from the environment.
18. Parameterize every query. Never concatenate untrusted input into SQL, shell, HTML, paths, or eval.

## Performance

19. No queries, network calls, or blocking I/O inside loops over records; batch or prefetch. Run independent async operations concurrently unless a real dependency or rate limit forces sequence.
20. Anything subtler: measure before optimizing, and never trade clarity for an unmeasured win.

## Diff discipline

21. One intent per diff. Never mix refactoring with behavior change, never reformat lines you did not otherwise touch, no drive-by renames.
22. Tests must be able to fail: never assert the mock, never test implementation details, never weaken or delete a failing test to go green.
23. Before finishing: remove debug prints, unused imports, dead branches, and commented-out code.
24. If you cannot explain why the code works, it is not done.
