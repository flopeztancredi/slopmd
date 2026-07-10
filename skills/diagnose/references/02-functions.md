# 2. Functions and Decomposition

## Rules

- Split on separable subproblems, never on line count. A 60-line function implementing one coherent algorithm beats six 10-line fragments the reader must mentally reassemble. [Ousterhout, APoSD ch.9, contra Martin; 2025 Ousterhout-Martin debate]
- Each function does one thing at one level of abstraction. A boolean flag argument is a confession that it does two: split it or expose two names. [Clean Code ch.3]
- Prefer 3 or fewer parameters. A recurring clump of parameters is a missing type: introduce a parameter object. [Clean Code ch.3; Fowler, Refactoring]
- Separate commands from queries: a function mutates state or answers a question, never both. [Meyer; Clean Code ch.3]
- Use guard clauses and early returns. Nesting deeper than 3 levels is a refactor trigger. [Code Complete ch.19]
- Extract a function when its body would otherwise need a comment naming its intent; the function name replaces the comment. [Fowler, Refactoring ch.6]
- Keep variables in their smallest scope, declared at first use, one purpose each; never reuse `temp` for a second meaning. [Code Complete ch.10]
- Files read like a newspaper: high-level functions first, details below. [Clean Code ch.5]

## Symptoms

- Giant do-everything functions mixing parsing, business logic, and I/O (the classic shape of first-draft generated code).
- The opposite failure: conjoined fragments, five tiny private functions only ever called in sequence by one caller, each useless alone.
- Boolean flags steering deeply divergent branches inside one function.
- Arrow-shaped code: staircases of nested ifs where guard clauses would flatten everything.

## Treatment

- For the giant function: identify subproblems a reader would name (parse, validate, persist), extract those, keep the orchestration readable top to bottom.
- For conjoined fragments: inline them back into one honest function.
- Replace flag arguments with two named functions or a strategy value at the call site.
- Invert conditions into guard clauses before any deeper restructuring.
