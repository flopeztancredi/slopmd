# 9. Types and Data

## Rules

- No `any`, `Any`, `as any`, `@ts-ignore`, `@ts-nocheck`, or `# type: ignore` without a written justification on the same line. Suppressing the checker is borrowing against correctness. [TS/Python community consensus]
- Replace magic numbers and strings with named constants; the only bare literals in logic are 0 and 1. [Code Complete ch.12]
- Make illegal states unrepresentable where the type system allows: enums or unions over stringly-typed values, narrow types over primitives at boundaries. [typed-FP consensus; DDD value objects]
- Prefer immutable values. Give identity only to entities whose identity matters; everything else is a value object. [Evans, DDD ch.5]
- Do not pass or return null where the language offers optionals or result types; never return null from collections-returning functions, return empty. [Clean Code ch.7]
- No mutable default arguments (Python). No float arithmetic for money. Timezone-aware datetimes always. UTC in storage.
- Parse, do not validate: convert raw input into a typed structure once at the boundary, then pass the typed value around. [Alexis King]

## Symptoms

- `data: any` parameter bags; `as any` chains to silence errors introduced two lines earlier.
- Status fields as raw strings compared against inline literals in five places.
- `def f(items=[])`; `0.1 + 0.2` money math; `datetime.now()` without timezone.
- The same dict shape re-checked field by field in every function that touches it.

## Treatment

- Trace each `any` to the real type and write it; if truly unknowable, use `unknown` plus narrowing.
- Extract repeated literals into a constant or enum at the module the domain suggests.
- Introduce a typed boundary (schema parse, dataclass, zod, pydantic) at the outermost point where the raw data enters, then delete inner re-checks.
