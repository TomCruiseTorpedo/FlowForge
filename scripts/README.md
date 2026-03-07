# Scripts

Public scripts and verification only. Internal procedures and tooling live in **`scripts/internal/`** (gitignored); they are not part of the public repo.

## Verification (run from repo root)

- **`verify-private-paths.sh`** — Ensures all required private paths are listed in the “Private / do not publish” block in `.gitignore`. Exit 0 = OK; 1 = add missing paths and re-run.
- **`verify-no-private-tracked.sh`** — Fails if any private path is currently tracked. Run before push and after any history rewrite. Exit 0 = OK; if 1, run `git rm --cached <path>` for each listed path (do not force-add).
