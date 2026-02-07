Collect-console script

This file documents how to run the `scripts/collect-console.mjs` Playwright script locally and in CI.

Prerequisites
- Node.js 18+ and npm installed

Install dev deps (including Playwright browsers):

```powershell
npm ci
npx playwright install --with-deps
```

Run the script (default URL is the GitHub Pages site):

```powershell
npm run collect-console
# or to test a custom URL
TEST_URL="https://localhost:4200/" npm run collect-console
```

Notes for CI
- Install Playwright browsers in the runner with `npx playwright install --with-deps` before running the script.
- Use `TEST_URL` environment variable to point to the preview build or production site.
