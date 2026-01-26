## 2025-05-18 - Repository Quirks
**Learning:** This repository uses `package-lock.json` but I am using `pnpm`. Running `pnpm install` generates `pnpm-lock.yaml` which must NOT be committed. Also, `dist/` artifacts are tracked in git and should be restored if accidentally modified by build.
**Action:** Always check `git status` for unexpected artifacts (`pnpm-lock.yaml`, `dist/`, logs) before submitting.
