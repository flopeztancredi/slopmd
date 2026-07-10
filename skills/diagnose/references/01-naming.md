# 1. Naming

## Rules

- Name by domain intent, not mechanism: `approveInvoice`, not `updateStatusFlag`. [Evans, DDD ch.10]
- One word per concept per codebase. Before naming anything, grep for the project's existing term and reuse it; never let `fetchUser`, `getUser`, and `retrieveUser` coexist. [Martin, Clean Code ch.2; DDD ubiquitous language]
- Procedures get strong verb plus object (`sendReceipt`); functions are named for what they return (`totalDue`); booleans read as predicates (`isExpired`, `hasAccess`). [McConnell, Code Complete ch.7]
- Name length scales with scope: `i` in a 3-line loop is fine; abbreviations in a public API are not. [Code Complete ch.11]
- Banned decorative modifiers: `enhanced`, `improved`, `new`, `simple`, `better`, `my`, `_v2`, `final`, `real`, `actual`.
- Banned meaning-free suffixes unless they name a pattern genuinely in use: `Manager`, `Processor`, `Handler`, `Helper`, `Util`, `Service`, `Data`, `Info`. [Clean Code ch.2]
- A name that needs a comment to explain it is the wrong name. [Clean Code ch.2]
- Do not lie: `accountList` that is not a list, `getX` that mutates, `tmp` that persists. [Clean Code ch.2]

## Symptoms

- Grandiose names for trivial things (`IntelligentCacheOrchestrator` wrapping a dict).
- Synonym drift within one file or one diff: the same entity called `client`, `customer`, and `user`.
- Single-letter or cryptic names (`v`, `d2`, `res2`) outside tight loop scope.
- Names that describe history or the author's process (`newParser`, `fixedHandler`, `finalVersion`).

## Treatment

- Rename to the domain term the project already uses; update all references in the same change.
- When two names cover one concept, keep the more widely used one and remove the other everywhere.
- If you cannot find a truthful short name, the function is doing more than one thing: split it first, then name the parts.
