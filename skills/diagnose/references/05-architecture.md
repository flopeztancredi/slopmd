# 5. Architecture and Layering

## Rules

- Match the repository's existing structure: put logic where its siblings live. Never invent a parallel structure beside an established one (a second config mechanism, a second API client, a second state store). [Google eng practice: consistency]
- Each layer changes the abstraction. Adjacent layers with near-identical interfaces mean one of them should die. [Ousterhout, APoSD ch.7]
- Keep unrelated things orthogonal: if changing X breaks unrelated Y, that is a design defect, not bad luck. [Pragmatic Programmer topic 10]
- Backend: keep transport, business logic, and persistence separable. Route handlers stay thin; domain logic does not import the web framework; data access is confined to its layer. [layered architecture consensus; DDD]
- Frontend: separate rendering from state and from data fetching. Components render; hooks/stores hold logic; API modules talk to the network.
- Put behavior with its data. A data class plus a Service holding all its logic is procedural code in OO costume. [Fowler, Anemic Domain Model]
- One meaning per word per bounded context; do not force one god-model across unrelated modules. [Evans, DDD ch.14]
- Backing services are attached resources: no hardcoded hosts, ports, or URLs; config comes from the environment. [12-factor III, IV]
- Build tracer bullets: a thin end-to-end slice first, thickened after it works, instead of finishing one layer in speculative isolation. [Pragmatic Programmer topic 12]

## Symptoms

- Business rules inline in a route handler while the repo has a service layer three directories away.
- SQL or ORM calls inside UI components or controllers.
- A new file tree (`utils2/`, `helpers/`, `lib/new/`) growing beside the established one.
- Configuration read three different ways in one codebase.
- Cyclic imports between layers; lower layers importing upward.

## Treatment

- Move misplaced logic to the layer where its siblings live; leave a thin call behind.
- Collapse duplicate mechanisms onto the established one, oldest and most used wins unless the project says otherwise.
- Extract hardcoded endpoints and connection strings to the project's config mechanism.
