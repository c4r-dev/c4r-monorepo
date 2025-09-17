# Repository Guidelines

## Project Structure & Module Organization
- `activities/` — domain folders (`causality/`, `randomization/`, `coding-practices/`, `collaboration/`, `tools/`); each activity is a kebab-case folder (e.g., `jhu-flu-dag-v1`).
- `server/` — unified dev server (`seamless-activity-server.js`, `unified-dev-server.js`).
- `packages/` — shared modules (`database/`, `ui/`, etc.).
- `templates/` — activity templates (`activity-template-v0`, `activity-template-v1`).
- `scripts/`, root `test-*.js` — utilities and test runners.
- `activity-browser.html`, `public/` — local tooling and assets.

## Build, Test, and Development
- `npm install` — install shared deps once (Node >= 18).
- `npm run dev` — start unified server at `http://localhost:3333` (uses `server/seamless-activity-server.js`).
- `npm run dev:unified` — alternate unified server.
- `npm run browse` — open the activity browser.
- `npm run build` — Turbo build across workspaces.
- `npm test` — Turbo test task (aggregates package-level tests).
- `npm run lint` / `npm run type-check` / `npm run clean` — lint, TS checks, clean.
- Maintenance: `npm run deps:analyze`, `npm run deps:sync`, `npm run pkg:validate`, `npm run pkg:test`, `npm run pkg:backup`.

## Coding Style & Naming
- Use Prettier + ESLint (Next config). Defaults: 2-space indent, semicolons, trailing commas where sensible.
- Naming: kebab-case for folders and files; `camelCase` for vars/functions; `PascalCase` for React components.
- Place activity code under its domain; prefer Next.js `app/` or `pages/` when applicable; keep imports from shared code in `packages/`.

## Testing Guidelines
- Unified server must be running: `npm run dev`.
- Run scripted checks: `node test-all-activities.js` or `node test-single-activity.js`.
- Screenshot/diagnostics: `node test-all-activities-with-screenshots.js`, `node test-activities-error-detection.js`.
- Aim for no console errors and fast load; save failing routes and logs in PRs.

## Commit & PR Guidelines
- Commits: imperative, concise, scoped (e.g., "Fix Next.js static asset routing").
- PRs: include summary, related issue, affected routes (e.g., `/causality/jhu-flu-dag-v1`), steps to test, before/after screenshots for UI.
- Keep changes minimal; avoid adding per-activity `node_modules` or local package.json files.

## Security & Configuration
- Environment: `.env` with `PORT=3333`, `NODE_ENV`, optional `BUILD_CACHE=true`.
- Do not commit secrets; rely on `dotenv` and local env files ignored by Git.

## Agent-Specific Notes
- Prefer small, focused patches; preserve existing structure.
- Add dependencies only to root `package.json`; reuse `packages/` for shared code.
- When adding activities, use `activities/<domain>/<kebab-name>` and verify via the browser and tests.
