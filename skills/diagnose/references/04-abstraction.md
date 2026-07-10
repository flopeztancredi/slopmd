# 4. Abstraction and Modularity

The highest-value category, and the one no linter can check.

## Rules

- Modules should be deep: a small interface hiding substantial functionality. Add a class or interface only when it hides a nontrivial decision behind something simpler than what it hides. [Ousterhout, APoSD ch.4]
- Classitis is a disease: many shallow classes and functions add interface overhead without hiding anything. Depth, not length, is the metric. [APoSD ch.4]
- No wrappers that only delegate. No interfaces with a single implementation. No factories for things a constructor can build. [APoSD ch.7; Fowler, Speculative Generality]
- Apply a design pattern only to isolate an axis of change that exists today. Name the axis or do not apply the pattern. [GoF ch.1: encapsulate what varies]
- Rule of Three: copy once, tolerate twice, abstract on the third occurrence. [Fowler, Refactoring ch.3]
- DRY governs knowledge, not text. Never merge code that is coincidentally similar but represents independent decisions; duplication is far cheaper than the wrong abstraction. [Pragmatic Programmer topic 9; Sandi Metz]
- Favor composition over inheritance; prefer plain functions over pattern ceremony where the language allows. Strategy, Command, and Template Method usually collapse to a function value. [GoF ch.1; modern consensus]
- Pull complexity downward: solve hard cases once inside the module instead of exporting config knobs and edge cases to every caller. [APoSD ch.8]
- Information should not leak: if a format, protocol, or algorithm decision appears in more than one module, the abstraction failed. [APoSD ch.5]
- For any non-trivial design, sketch two alternatives before committing. [APoSD ch.11]

## Symptoms

- A `Service`, `Manager`, or `Helper` class wrapping a single function.
- Abstract base classes with one subclass; interfaces born together with their only implementation.
- Singleton globals; Builder for three fields; Strategy for two branches an `if` would handle.
- Speculative hooks, config parameters, and generics nobody asked for.
- A 20-line task delivered as 200 lines across 4 new files.
- Pass-through methods: layers whose interface is nearly identical to the layer below.

## Treatment

- Inline decorative wrappers and single-implementation interfaces; reintroduce them only when a second implementation actually arrives.
- Collapse pattern ceremony to plain functions or direct calls.
- Merge shallow fragments into deeper modules with smaller interfaces.
- For wrong abstractions serving divergent callers: inline into each caller first, then re-extract what is genuinely shared. [Metz]
