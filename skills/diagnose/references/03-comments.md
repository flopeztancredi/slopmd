# 3. Comments and Documentation

## Rules

- Never write comments that restate the code. Delete any comment a competent reader could regenerate from the line below it. [Ousterhout, APoSD ch.13; Clean Code ch.4]
- Never write process comments: changelogs, apologies, notes to the reviewer ("as requested", "updated to use new API", "in a real app you would..."). Code is not a chat transcript.
- If a block needs a comment to explain WHAT it does, refactor first: extract a well-named function. A needed what-comment marks a missing abstraction. [Fowler, Refactoring ch.3]
- Do comment what code cannot express: units, valid ranges, ownership, invariants, thread-safety, and WHY this approach (rejected alternatives, workaround links, gotchas). [APoSD ch.13; Code Complete ch.32]
- Every non-obvious public interface gets a contract comment in the project's documentation convention (JSDoc, docstring, godoc): what it does, parameters, return, errors. Written at the abstraction level, not a prose copy of the implementation. [APoSD ch.15; Google style guides]
- Obvious accessors and trivial functions need no doc comment. [Google style]
- TODOs carry an owner or ticket reference, or they do not get written.
- Never leave commented-out code. Version control remembers. [Pragmatic Programmer]
- No section-banner comments (`===== HELPERS =====`) in files short enough to scan.

## Symptoms

- Narration: `// increment counter`, `# loop over users`, `// call the API`.
- Filler and hedging: `// This is a simple implementation`, `// adjust as needed`, `// for demonstration purposes`.
- Docstrings that restate the signature in prose and document nothing about the contract.
- Dense comment coverage over trivial code next to zero documentation on the one genuinely tricky function.

## Treatment

- Delete narration, process, and filler comments outright; no replacement needed.
- Convert each what-comment into a function or variable name, then delete it.
- Add contract docs to undocumented public interfaces; add why-comments where the diagnosis found surprising code.
