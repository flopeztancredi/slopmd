# 6. Error Handling

## Rules

- One error strategy per project (propagate, result types, error middleware, crash). Discover it from existing code and follow it; never invent per-call-site policies. [Code Complete ch.8]
- Validate at the barricade: check external input where it enters the system. Inside the barricade, trust data and assert the impossible instead of re-validating at every layer. [Code Complete ch.8; Pragmatic Programmer topic 25]
- Catch only what you can handle meaningfully. Otherwise let it propagate: a crash is better than a corrupted limp. [Pragmatic Programmer topic 26]
- Never catch-and-continue silently. Never bare `except`, never `catch (Exception)` without rethrow or real handling, never an empty catch block, never returning a default that masks failure. [Google style]
- Handle or log, never both at every level. Double reporting turns one failure into five log entries. When wrapping an error, add context; if you have no context to add, do not wrap. [Go code review comments]
- Prefer designs that define errors out of existence over designs that throw: make the empty case a no-op, make the API total. [Ousterhout, APoSD ch.10]
- Delete dead fallback branches. If a state "should never happen", assert it; do not write a handler for it. [Code Complete ch.8]

## Symptoms

- try/catch wrapped around every call as a reflex, each swallowing or vaguely re-throwing.
- `catch (e) { console.log(e) }` and execution continues as if nothing happened.
- `else: return None  # should never happen`.
- The same input validated in the controller, the service, and the repository.
- Error messages that lose the original cause (`throw new Error("something went wrong")`).

## Treatment

- Remove reflex try/catch; keep only handlers that recover, translate at a boundary, or add context.
- Replace silent defaults with propagation or an explicit result type, following the project's strategy.
- Convert impossible-state handlers into assertions; delete unreachable branches.
- Consolidate validation at the entry point; strip inner re-validation.
