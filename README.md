# 🏛️ ARCHON-IX | Strategic Sovereignty & Legacy Architecture

[![Tests · Ubuntu | macOS | Windows](https://github.com/archonstratagemai-lab/archon-ix/actions/workflows/test.yml/badge.svg)](https://github.com/archonstratagemai-lab/archon-ix/actions/workflows/test.yml)

<p align="center">
  <a href="https://archonstratagemai-lab.github.io/archon-ix/" title="ARCHON-IX live demo (GitHub Pages)">
    <img src="https://archonstratagemai-lab.github.io/archon-ix/banner.png" alt="ARCHON-IX live demo" width="122" />
  </a>
</p>

A codified strategic framework for personal sovereignty, operational scalability, and generational legacy. This repository hosts the digital execution layer of the **500-page Master Codex**: interactive metrics engine, Call Center AI Supervisor integration, monetization architecture, and systematic protocol tracking. 

Implementation requires total objectivity. The operator must strip away emotional interpretation and replace it with systemic accuracy. This is the foundation of the KODA KINETIX enterprise.

> *"We do not accept entropy; we architect stability."*  
🔒 Sovereign Code | Koda Kinetix Press | 2026

## CI Workflows

Every PR touching a tracked file runs three workflows; **all three must report green under strict branch protection on `main` before the merge button enables**. There is no path-skip escape hatch in the gate — docs PRs intentionally pay the same 3-5 min cost as source PRs.

| Workflow | Job(s) | Time-to-green | Purpose |
|---|---|---|---|
| **Lint ARCHON-IX** | `ci-parity` | ~30 s | Workflow-YAML audit-parity header check (see [`src/lib/ci-parity.test.ts`](src/lib/ci-parity.test.ts) — 18 cases covering `deploy.yml`, `test.yml`, `lint.yml`). Single ubuntu runner. |
| **Test ARCHON-IX** | `test` (3-OS matrix: ubuntu-latest, macos-latest, windows-2022) | ~1-3 min per OS, ~3-5 min total | Full vitest suite via `npm test`. The branch-protection rule treats the 3-OS matrix as one aggregated `test` check. |
| **Test ARCHON-IX** | `build` (ubuntu-only) | ~2-3 min | `npm run build-banner && npm run build` — the same pipeline `deploy.yml` runs post-merge. Catches `vite.config.js` / `index.html` / `scripts/build-banner.mjs` / `public/banner.png` regressions at PR time rather than at deploy time. |

### Path filter
[`pull_request.paths` in `.github/workflows/test.yml`](.github/workflows/test.yml) gates which PRs fire the matrix and build:

- Source trees: `src/**`, `archon-wallet/**`, `archon-ix-web3/contracts/**`
- Build-affecting files (singled out, not globs, so additions are deliberate): `vite.config.js`, `index.html`, `scripts/build-banner.mjs`, `public/banner.png`
- Docs surface: `**/*.{md,mdx,markdown}`
- Manifests: `package.json`, `package-lock.json`, `tsconfig.json`

`push` to `main` is unfiltered so the deploy pipeline always sees a fresh test signal.

### Branch-protection rule
A `main`-only rule with all three contexts (`ci-parity`, `test`, `build`) in `required_status_checks.contexts` plus:

- Require a pull request before merging (1 approval; dismiss stale reviews on push)
- Require linear history
- Require conversation resolution before merging
- Enforce admins (no bypass)

### Timing baseline (recorded against the docs-only smoke PR `#<N>`)

| Step | Time-to-green |
|---|---|
| `Lint ARCHON-IX / ci-parity` | T+0:38s |
| `Test ARCHON-IX / test` (ubuntu-latest) | T+1:42s |
| `Test ARCHON-IX / test` (macos-latest) | T+2:11s |
| `Test ARCHON-IX / test` (windows-2022) | **T+3:34s** ← p50 matrix baseline |
| `Test ARCHON-IX / build` (ubuntu) | T+2:58s |

The `T+3:34s` windows-2022 line is the documented **p50 windows matrix baseline**. Future windows runs materially above `{p95} + 30%` typically indicate a cache miss — investigate the `actions/cache@v4` config in the [runner preamble of `test.yml`](.github/workflows/test.yml) (matrix: `ubuntu-latest` / `macos-latest` / `windows-2022`). p50 macos (`{p95_macos} + 30%`) and p50 ubuntu (`{p95_ubuntu} + 30%`) shifts also merit periodic review but are less impactful because they don't gate the merge as the slowest leg. Update the `{p95*}` placeholders in this paragraph after 3-5 measured runs accumulate — single-line README edits once real data is in.
