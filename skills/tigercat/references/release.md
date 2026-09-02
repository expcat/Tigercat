---
name: tigercat-release
description: Tigercat release commands, validation set, and published package smoke test
---

# Release

Tigercat uses Changesets. All package versions are fixed together so `@expcat/tigercat-core`,
`@expcat/tigercat-vue`, `@expcat/tigercat-react`, `@expcat/tigercat-cli`, and `@expcat/tigercat-mcp`
stay aligned. Version history belongs in CHANGELOG, not this page.

## Flow

1. Metadata: `pnpm release:check` (fixed versions, runtime `version` exports, required exports,
   Changesets fixed groups, root scripts, docs entry points).
2. Full local gate for RC and production: `pnpm quality:release` then `pnpm build`. Do **not** add
   this (or coverage / SSR / publish smoke) to publish workflows.
3. Release Candidate: `pnpm release:next` or `pnpm release:canary`; install the prerelease in clean Vue, React,
   Nuxt, and Next projects.
4. Stable: write the target with `node scripts/sync-version.mjs <version>`, update CHANGELOG and
   MIGRATION by hand, remove consumed `.changeset/*.md` so a future `changeset version` cannot
   mis-bump, run `pnpm quality:release` and `pnpm e2e`, commit `chore: 发布 v<version>`, tag
   `v<version>`. Pushing the tag publishes (`changeset publish` uses versions already in
   package.json) and deploys Pages.
5. After publish: `pnpm smoke:published`.

`pnpm quality:release` is the one heavy gate: API/type checks, size-limit, local tarball smoke
(ESM entries, Button subpath budgets, no unused DatePicker locale presets on `defineText` /
DatePicker subpaths), test checklist, Vue/React examples, and the Nuxt/Next SSR matrix. For
component-batch work, start with `pnpm test:group:<group>` (`basic`, `form`, `feedback`, `layout`,
`navigation`, `data`, `charts`, `advanced`, `composite`, `core`) plus `pnpm docs:api:check` before
escalating.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

Stable and RC releases are cut manually, not by `changeset version`.

## API Freeze

- `pnpm release:check`, `pnpm types:check`, `pnpm api:validate`.
- Exports: core `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json`
  and locale subpaths; Vue/React root and component subpaths; matching props type exports.
- Do not rename props, events, slots, children, or subpath imports after freeze unless listed as
  Breaking.

## Breaking Changes

Centralize in [docs/MIGRATION.md](https://github.com/expcat/Tigercat/blob/main/docs/MIGRATION.md)
and [CHANGELOG.md](https://github.com/expcat/Tigercat/blob/main/CHANGELOG.md): affected
package/component, removed API, replacement, minimal diff.

v2.0.19 is a historical patch that still changed `@expcat/tigercat-mcp` (no-arg calls default to
remote skill loading; long references are session pointers). Component packages were unaffected.
This is why `pnpm release:check` requires `## v<version>` in CHANGELOG and MIGRATION — a patch
number is not evidence that nothing user-visible changed.

Token source is `packages/core/tokens/tokens.json`; after token edits `pnpm tokens:build` then
`pnpm build`. Confirm core still exports `./tailwind`, `./tailwind/modern`, `./tokens.css`, and
`./figma-variables.json`. See [tokens.md](tokens.md).

Hydration audit focus: DatePicker locale/timezone, chart SVG ids, closed overlays, client-only
theme bootstrap. SSR commands are inside `quality:release` (`pnpm quality:ssr`).

Next: [tokens.md](tokens.md)
