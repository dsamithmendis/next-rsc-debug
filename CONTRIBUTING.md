# Contributing

Thanks for taking the time to contribute.

## Getting started

This is a pnpm + Turborepo monorepo. Node 20.9+ and pnpm 11 are required;
the exact pnpm version is pinned in `package.json` via `packageManager`.

```bash
pnpm install
pnpm dev        # run all dev servers
pnpm build      # build packages, apps, and examples
```

## Before opening a pull request

```bash
pnpm check      # typecheck + lint + unit tests
pnpm test:e2e   # optional; needs `pnpm exec playwright install chromium`
```

CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and a packaging
check on every push and pull request, so all of these need to pass.

## Repository layout

| Path            | Contents                                          |
| --------------- | ------------------------------------------------- |
| `packages/core` | Event protocol, ring buffer, analyzer, collector  |
| `packages/next` | Next.js integration and fetch instrumentation     |
| `packages/devtools` | React DevTools UI (Client Component)          |
| `apps/playground`   | Demo scenarios for manual testing              |
| `apps/docs`         | Documentation site (deployed to GitHub Pages) |
| `examples/*`        | Standalone minimal apps, one per scenario    |
| `tests/unit`        | Root integration tests                       |
| `tests/e2e`         | Playwright tests                              |

## Working on the packages

- Relative imports inside `packages/*/src` must carry an explicit `.js`
  extension, because the packages are published as ESM and Node's resolver
  requires the extension.
- The apps and examples consume the built `dist/` output rather than `src/`, so
  run `pnpm build` before testing a change to a package in an app.
- Add a note to `CHANGELOG.md` under `[Unreleased]` for user-visible changes.

## Publishing

Publish with `npm publish --access public` from inside each package directory,
in dependency order (`core` → `next` → `devtools`). Do **not** use
`pnpm publish`: the packages depend on each other by concrete version, and
`pnpm publish` does not rewrite the dependency string the way `npm publish`
does.

`node .github/scripts/verify-pack.mjs` verifies that every entry point each
package advertises exists and is included in the tarball.
