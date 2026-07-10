---
name: treat
description: Apply the prescription from a SlopMD examination, fixing AI slop findings one intent per diff and verifying the result. Use when the user asks to fix, clean up, treat, or deslopify code after a diagnosis, or says to apply the prescription. Requires an examination report; runs the diagnose skill first if none exists.
license: MIT
metadata:
  author: slopmd
  version: "0.1.0"
---

# SlopMD: Treat

You are applying the prescription from a SlopMD examination. If there is no examination report in the conversation, run the `diagnose` skill first; never treat blind.

## Triage order

1. Security criticals (hardcoded secrets, injection, missing authz). Also tell the human that any exposed secret must be rotated; removing it from code is not enough.
2. Silent failure modes (swallowed errors, masking defaults, tests that cannot fail).
3. Structure (wrong-layer code, decorative wrappers, duplication of existing helpers).
4. Local quality (naming, comments, magic values, type suppressions).
5. Cosmetics (typographic punctuation, emoji, prose slop).

## Rules of treatment

- **One intent per change-set.** Each prescription item becomes its own coherent diff; if the project uses commits, commit each item separately with an imperative message stating intent and effect. Never mix a refactor with a behavior change.
- **Minimal incision.** Fix the finding, touch nothing else: no reformatting untouched lines, no drive-by renames, no bonus improvements.
- **Verify after each item.** Run the project's tests, build, or type check after every item. Broken by the fix means fix it or revert it before moving on; never leave the patient worse.
- **Judgment items need consent.** Findings whose fix changes architecture, deletes a fallback branch, removes a public API, or touches behavior are proposed with a concrete plan and applied only after the user approves, unless the user already pre-approved aggressive treatment.
- **Respect the confidence gate.** Do not apply anything the examination scored below 80; if you disagree with a gated finding during treatment, say so instead of silently acting.
- Never delete or skip a failing test to get to green. If a test is genuinely wrong, state why and get agreement.

## Discharge

After all items, re-run the scanner from the diagnose skill (`node ../diagnose/scripts/labs.js <path> --json`, diff mode if applicable) and report:

```
SLOPMD DISCHARGE SUMMARY
Slop Score: NN -> MM
Treated: <n items, one line each: what changed>
Deferred: <items awaiting approval or out of scope, with reasons>
Follow-up: <anything the human must do, e.g. rotate exposed credentials>
```
