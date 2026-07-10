# 7. Security and Secrets

## Rules

- Never hardcode secrets, API keys, tokens, passwords, or connection strings anywhere: source, tests, comments, docs, or examples. Read them from the environment or a secret manager. Anything ever committed is compromised: rotate it, do not just delete it. [OWASP A02/A05; 12-factor III]
- Parameterize every query. Never concatenate or interpolate untrusted input into SQL, shell commands, HTML, file paths, or eval. [OWASP A03]
- Enforce authorization server-side on every request, deny by default. Never trust client-supplied object IDs without an ownership check. [OWASP A01]
- Use platform crypto only: argon2 or bcrypt for passwords, the platform CSPRNG for tokens. Never MD5 or plain SHA for passwords, never `Math.random()` for anything secret. [OWASP A02]
- Never log secrets, tokens, session IDs, or PII. Never return stack traces or debug detail to clients. [OWASP A09/A05]
- Allowlist any URL the server will fetch or redirect to. [OWASP A10]
- No default credentials, no debug mode in production paths, no `CORS: *` on authenticated APIs, no disabled TLS verification. [OWASP A05]

## Symptoms

- `apiKey = "sk-..."` inline "temporarily"; real credentials in test fixtures or README examples.
- Template literals building SQL; ``exec(`command ${userInput}`)``.
- Endpoints that fetch a record by ID from the request with no ownership check.
- `verify=False`, `rejectUnauthorized: false`, homemade token generators.
- Full request bodies or user objects dumped to logs.

## Treatment

- Move secrets to environment config now, tell the human the exposed value must be rotated, and add the pattern to the project's secret scanning ignore-proofing.
- Replace string-built queries with parameterized calls of the project's existing DB layer.
- Route direct object access through the project's authorization check.
- These findings are always reported at critical severity and treated first.
