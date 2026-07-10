# 10. Testing

## Rules

- Test behavior through public interfaces, never implementation details, private methods, or mock-call choreography. [Fowler; modern consensus]
- Every test must be able to fail. No tautologies (`expect(true).toBe(true)`), no asserting the mock returned what you told it to return, no re-computing the expectation using the code under test.
- One behavior per test, named for the expected behavior. Every happy path ships with at least one failure or edge case test. [Clean Code ch.9]
- Never delete, skip, or weaken a failing test to get to green. Fix the code, or state explicitly why the test itself is wrong and get agreement. [agent-critical rule]
- Tests are F.I.R.S.T.: fast, independent, repeatable, self-validating, timely. No sleeps for synchronization; await the actual condition. [Clean Code ch.9]
- Write tests in the same change as the code they cover. Test-first is optional; tested-when-merged is not. [Ousterhout-Martin debate, resolved]
- Mock at system boundaries (network, clock, filesystem), not between your own modules.

## Symptoms

- Test files where every dependency is mocked and the assertions only verify mocks were called.
- Snapshot tests covering everything and asserting nothing.
- Tests that encode current buggy behavior because they were generated from the implementation (change-detector tests).
- `test.skip` / `@pytest.mark.skip` added in the same diff that broke the test.
- Sleeps and retries papering over race conditions.

## Treatment

- Rewrite mock-choreography tests to assert observable outputs and state changes.
- Delete tautological and snapshot-noise tests; they are negative-value.
- For change-detector tests, derive the expectation from the spec or the docs, not from running the code.
