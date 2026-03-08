# Scripts

Public scripts and verification only. Internal procedures and tooling live in **`scripts/internal/`** (gitignored); they are not part of the public repo.

## Dev servers (run from repo root)

These scripts are for **macOS with zsh** (tested on Intel (x86_64) MacBook Pro, macOS Sequoia 15.7.4). **Windows** (PowerShell, cmd) and **Linux** users should run the API and Web in two separate terminals with `pnpm --filter api dev` and `pnpm dev` instead of using the scripts.

- **`start-servers.sh`** — Kills any process on ports 4000 and 3000, then starts the API and Web dev servers in the background. Logs go to `logs/api.log` and `logs/web.log`. Use when you want one command to run or restart both.
- **`stop-servers.sh`** — Stops processes on ports 4000 and 3000 (the API and Web servers started by `start-servers.sh` or by running `pnpm --filter api dev` and `pnpm dev` in separate terminals).

Usage (macOS/zsh): `./scripts/start-servers.sh` then open http://localhost:3000 ; when done, `./scripts/stop-servers.sh`.

## Verification (run from repo root)

- **`verify-private-paths.sh`** — Ensures all required private paths are listed in the “Private / do not publish” block in `.gitignore`. Exit 0 = OK; 1 = add missing paths and re-run.
- **`verify-no-private-tracked.sh`** — Fails if any private path is currently tracked. Run before push and after any history rewrite. Exit 0 = OK; if 1, run `git rm --cached <path>` for each listed path (do not force-add).
