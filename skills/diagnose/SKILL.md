---
name: diagnose
description: Examine a codebase or diff for AI slop and produce a clinical report with a Slop Score. Use when the user asks to find AI slop, review code quality, clean up AI-generated code, run a health check or checkup on the repo, or audit recent agent-written changes. Combines a deterministic scanner (lab results) with guideline-based judgment (clinical examination).
license: MIT
metadata:
  author: slopmd
  version: "0.1.0"
---

# SlopMD: Diagnose

You are examining code for AI slop: the characteristic defects of AI-generated code. Your output is a clinical examination report. You do not fix anything in this skill; treatment is a separate step the user must ask for (the `treat` skill).

## Step 1: Determine scope

- Default to **diff scope** when the repo has git history and the user said "my changes", "this PR", "recent work", or similar: examine only files changed vs the base (`git diff --name-only <base>`, plus staged and untracked files).
- Use **full scope** only when asked for the whole repo, or when the project is small (under roughly 50 source files).
- In diff scope, pre-existing problems in untouched code are NOT findings. Count them in one line of the Prognosis at most.

## Step 2: Run the labs (deterministic scan)

Run the bundled scanner from this skill's directory:

```
node scripts/labs.js <path> --json            # full scope
node scripts/labs.js <path> --json --diff <base>   # diff scope
```

This returns objective findings (secrets, unpinned dependencies, emoji, typographic punctuation, type suppressions, broad catches, debug leftovers, and more) plus a preliminary Slop Score. These are lab results: report them as facts, do not re-litigate them. If a finding line carries `slopmd-ignore`, the scanner already skipped it.

## Step 3: Clinical examination (judgment)

Read the in-scope files. For large scopes, prioritize: files the labs flagged, recently changed files, entry points, and the largest files. For each area of concern, load the matching reference and evaluate against it:

| Concern | Reference |
|---|---|
| Names, vocabulary drift | references/01-naming.md |
| Function size, nesting, decomposition | references/02-functions.md |
| Comments, docstrings | references/03-comments.md |
| Wrappers, patterns, premature abstraction | references/04-abstraction.md |
| Layering, placement, parallel structures | references/05-architecture.md |
| try/catch habits, silent failures | references/06-errors.md |
| Secrets, injection, authz | references/07-security.md |
| New dependencies, convention violations | references/08-dependencies.md |
| any-typing, magic values, null habits | references/09-types.md |
| Test quality | references/10-testing.md |
| Diff hygiene, prose slop | references/11-diff-discipline.md |
| Loops over queries, N+1, sequential awaits | references/12-performance.md |

Load only the references relevant to the code in scope. For a small diff that touches two functions, three references may be enough; a full-repo exam uses all twelve.

## Step 4: Confidence gate

Score every judgment finding 0-100: "would a senior engineer who knows this project agree without hesitation?" **Report only findings at 80 or above.** Never report:

- Style the project uses consistently and deliberately, even if the guidelines disagree. Local convention wins.
- Anything the project's linter or formatter already governs.
- Speculative improvements ("could be more flexible"). SlopMD removes speculation, it does not add it.
- Duplicate reports of one root cause. Group them.

## Step 5: The examination report

Produce the report in this exact structure, plain ASCII, no emojis:

```
SLOPMD EXAMINATION
Patient: <repo or diff description>   Scope: <diff|full>   Files examined: N

VITAL SIGNS (lab results)
Slop Score: NN/100 (<verdict>)
<counts by severity, one line>
<top lab findings, file:line, max ~10 lines>

SYMPTOMS (clinical findings)
For each finding:
  [category] file:line (confidence NN)
  <one-line defect statement, citing the violated rule>
  <one-line evidence or snippet>

DIAGNOSIS
<2-4 sentences: the root causes behind the symptoms. Which habits or
generation patterns produced this? What is the single biggest risk?>

PRESCRIPTION
<numbered treatment plan, highest value first. Each item is small,
independently applicable, and states the intended diff. Security
criticals always come first.>

PROGNOSIS
<1-3 sentences: expected state if treated vs untreated, and the
projected Slop Score after treatment.>
```

Close by offering to apply the prescription with the `treat` skill. Do not start treating without being asked.
