# 12. Performance

Judgment territory: what counts as slow depends on data size and call frequency. Flag only waste that is obvious at any scale, and never prescribe micro-optimization, which is its own slop (see category 4, speculative generality).

## Rules

- Never issue a query or network call inside a loop over records (N+1); batch, join, or prefetch. [SQL antipatterns consensus]
- Do not load unbounded data into memory; paginate, stream, or limit at the source. What fits today will not fit in production.
- No nested iteration over the same large collection when a keyed lookup works: build a map or set once, turning O(n^2) into O(n). Membership tests on lists inside loops are the same defect.
- Hoist invariants out of loops: recomputed regexes, re-parsed constants, repeated deep copies, and per-iteration allocations that never change.
- Run independent async operations concurrently (Promise.all, asyncio.gather); sequential awaits are justified only by a real data dependency or an explicit rate limit.
- No synchronous blocking I/O on request-serving paths (readFileSync in a handler, blocking sleeps); startup and CLI code are exempt.
- When adding a query that filters or sorts on a column, confirm an index covers it or say so in the change.
- Everything subtler than the above: measure before optimizing, and do not optimize at the cost of clarity without a measurement. [Knuth; Code Complete ch.25]

## Symptoms

- `for (const user of users) { await db.query(...) }` and its ORM equivalents (lazy relations touched per row).
- `SELECT *` fetching whole tables to filter in application code.
- `items.filter(x => otherList.includes(x.id))` over large collections.
- Five independent fetches awaited one by one.
- A regex compiled inside the loop that uses it; JSON.parse of the same config per call.
- Caches, memoization, and worker pools sprinkled speculatively over code with no measured hot path (the opposite failure: report it under category 4).

## Treatment

- Replace per-row queries with one batched query or a join; verify the result shape with a test.
- Convert list-membership loops to set or map lookups; hoist loop invariants.
- Parallelize independent awaits; state the dependency when keeping them sequential.
- For anything justified by scale claims, ask for or produce a measurement before restructuring.
