---
name: tigercat-release
description: Tigercat release commands, validation set, and published package smoke test
---

# Release

Tigercat uses Changesets. All package versions are fixed together so `@expcat/tigercat-core`,
`@expcat/tigercat-vue`, `@expcat/tigercat-react`, `@expcat/tigercat-cli`, and `@expcat/tigercat-mcp`
stay aligned. Version history belongs in CHANGELOG, not this page.

## Flow

1. Record the cut with `pnpm changeset`, then cut a Release Candidate or Stable with
   `pnpm sync:version <version>`. Update CHANGELOG and MIGRATION for that version. After the
   cut, move the new `.changeset/*.md` into `.changeset/published/`. Do not delete it. See
   [.changeset/README.md](https://github.com/expcat/Tigercat/blob/main/.changeset/README.md).
2. Metadata: `pnpm release:check` (fixed versions, ESM-only surface, sideEffects, repository
   metadata, Changesets fixed groups, CHANGELOG and MIGRATION version entries).
3. Complete the relevant focused checks and formatting, then commit the prepared release.
4. On that same committed HEAD, run `pnpm quality:release` (includes the package build and four
   tarball consumers) and `pnpm e2e` (includes full Vue/React type checks, workspace example
   builds and production previews). Manually validate the built examples' interactions,
   console errors and failed requests in the browser. Commit any fixes and repeat these checks
   on the resulting HEAD. Keep release validation local; publish workflows install, build and
   publish. For a focused workspace example build without E2E, use `pnpm example:build`.
5. Ensure the validated commit has entered `main`, then create and push `v<version>` at that
   commit. If merging changes the source or commit, validate the resulting HEAD first. Tag
   workflows require ancestry on the default branch: prereleases publish to npm `next`, Stable
   publishes to `latest`, and both deploy Pages. Package publishing belongs to the tag workflow;
   do not run local `npm publish`, `changeset publish`, or the `release` / `release:next` /
   `release:canary` wrappers.
6. After publish: `pnpm smoke:published`.

`pnpm quality:release` is the one heavy gate: static/API/type/docs checks, exports/tokens drift,
example sources and all example module compilation, one package build, full behavior tests
(`pnpm test`, including all fork-only specs), independent axe/ARIA tests (`pnpm test:a11y`),
and local tarball smoke (ESM entries, Button subpath budgets, tree-shaking, no unused DatePicker
locale presets on `defineText` / DatePicker subpaths). `publish:check --skip-build` reuses that
package build and builds each Vue/React/Nuxt/Next tarball consumer once.
SSR HTML/CSS is checked there; hydration runs in the default unit suite. For
component-batch work, start with `pnpm test:group:<group>` (`basic`, `form`, `feedback`, `layout`,
`navigation`, `data`, `charts`, `advanced`, `composite`, `core`) plus `pnpm docs:api:check` before
escalating.

Coverage (`pnpm test:coverage` / `pnpm test:coverage:report`) and full size-limit (`pnpm size`)
are on-demand diagnostics with their existing thresholds and configuration. They do not block
`quality:release`. After a coverage run, use `pnpm test:special` for its four excluded imperative
API specs; the default `pnpm test` already includes them with isolated fork processes.

## API Freeze

- `pnpm release:check`, `pnpm types:check`, `pnpm api:validate`.
- Historical migration scans are retired; API/exports/docs drift each have one owning check.
- Exports: core `.` / `./tailwind` / `./tokens.css` / `./figma-variables.json`
  and locale subpaths; Vue/React root and component subpaths; matching props type exports.
- Do not rename props, events, slots, children, or subpath imports after freeze unless listed as
  Breaking.

## Breaking Changes

Centralize in [docs/MIGRATION.md](https://github.com/expcat/Tigercat/blob/main/docs/MIGRATION.md)
and [CHANGELOG.md](https://github.com/expcat/Tigercat/blob/main/CHANGELOG.md): affected
package/component, removed API, replacement, minimal diff.

`pnpm release:check` requires `## v<version>` in both CHANGELOG.md and docs/MIGRATION.md
(`scripts/check-release-readiness.mjs`).

Token source is `packages/core/tokens/tokens.json`; after token edits `pnpm tokens:build` then
`pnpm build`. Confirm core still exports `./tailwind`, `./tokens.css`, and
`./figma-variables.json`. See [tokens.md](tokens.md).

Hydration audit focus: DatePicker locale/timezone, chart SVG ids, closed overlays, client-only
theme bootstrap. Use `pnpm example:ssr:check` for a focused workspace SSR check.

Next: [tokens.md](tokens.md)
