---
name: check-dep
description: Verify a package is trustworthy before adding it as a dependency, guarding against hallucinated packages and slopsquatting. Use whenever adding, suggesting, or installing any new npm or PyPI dependency, or when the user asks whether a package is safe or trusted. Returns trusted, caution, or requires-approval.
license: MIT
metadata:
  author: slopmd
  version: "0.1.0"
---

# SlopMD: Check-Dep

Run this before adding ANY new dependency, always. Roughly 20 percent of LLM-suggested package names do not exist, and attackers register hallucinated names (slopsquatting). Never install a package you have not verified in this session.

## Procedure

From this skill's directory:

```
node scripts/check-dep.js <package>[@version] [--eco npm|pypi] [--json]
```

The script checks: existence on the official registry, package age, maintenance, weekly downloads, known vulnerabilities (OSV.dev), typosquatting distance against popular packages, and repository linkage.

## Obey the verdict (exit code)

- **0, TRUSTED**: proceed. Pin the exact version (`package@x.y.z`, no `^`, `~`, or `latest`) and commit the lockfile.
- **1, CAUTION**: you may proceed only with justification. State the warning signals to the user in one line, explain why this package is still the right choice over alternatives, and pin the exact version.
- **2, REQUIRES APPROVAL**: **stop.** Do not install, do not add to any manifest, do not suggest a workaround install. Present the failed signals to the user and wait for an explicit human decision. If the package does not exist, say plainly that it may be a hallucinated name and propose the established alternative for the need at hand.

## Also use it when

- Auditing existing manifests: run it over each dependency the user asks about.
- The network is unavailable: the script marks signals as unknown and returns caution. Tell the user verification was incomplete; do not silently treat unknown as safe.
