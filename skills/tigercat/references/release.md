---
name: tigercat-release
description: Tigercat release commands, validation set, and published package smoke test
---

# Release

Tigercat uses Changesets for version planning and package publishing. All package versions are fixed together so `@expcat/tigercat-core`, `@expcat/tigercat-vue`, `@expcat/tigercat-react`, and `@expcat/tigercat-cli` stay aligned.

## Release Readiness

Run the metadata check before the heavier release gate. It verifies fixed package versions, runtime `version` exports, required package exports, Changesets fixed groups, root release scripts, and release documentation entry points.

```bash
pnpm release:check
```

Use the full release gate for release candidates and production releases.

```bash
pnpm quality:release
pnpm build
```

`pnpm quality:release` includes quick API/type checks, size-limit, local publish artifact smoke, test checklist validation, Vue/React example builds, and the Nuxt/Next SSR build matrix. The publish smoke checks installed package ESM entrypoints and keeps Button component subpaths below their release budgets without pulling imperative APIs, charts, editors, or full locale bundles. It also verifies that `defineText` and DatePicker component subpaths do not pull unused DatePicker locale presets, while explicit DatePicker locale imports still include the requested preset.

Run release validation manually on the local machine before publishing or pushing a release tag. Publish workflows are intentionally kept lightweight and must not add `quality:release`, coverage, SSR, publish smoke, or similar pre-publish validation gates, so GitHub Actions minutes are spent only on the publish operation.

For component-batch work, start with the matching group gate before escalating to the full release gate:

```bash
pnpm test:group:form
pnpm test:group -- --group feedback --framework react
TEST_GROUP=form pnpm test:validate
```

Available groups are `basic`, `form`, `feedback`, `layout`, `navigation`, `data`, `charts`, `advanced`, `composite`, and `core`. Pair the group run with `pnpm docs:api:check`, the relevant examples check, and changed-file Prettier check. Use `pnpm quality:release` when package exports, generated references, API baselines, size budgets, publish smoke behavior, or release workflows change.

## API Freeze Checklist

- Run `pnpm release:check`, `pnpm types:check`, and `pnpm api:validate`.
- Confirm root package exports: core `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json` and locale subpaths, plus Vue and React root and component subpath exports.
- Confirm Vue and React public component files have matching props type exports.
- Do not rename props, events, slots, children, or subpath imports after the freeze unless the change is explicitly listed as Breaking.

## Breaking Changes

Breaking changes must be centralized in [docs/MIGRATION.md](../../../docs/MIGRATION.md) and [CHANGELOG.md](../../../CHANGELOG.md). Each entry should include affected package or component, removed API, replacement API, and a minimal diff when possible.

Current v2.0.0-rc.1 freezes the v2.0.0 release-candidate surface: fixed package versions, runtime version exports, ESM-only core / React / Vue packages, explicit component exports, tree-shaking guards, API removals, and migrated docs/examples. Continue to update [docs/MIGRATION.md](../../../docs/MIGRATION.md) and [CHANGELOG.md](../../../CHANGELOG.md) before the final v2.0.0 release. The previous completed breaking-change set remains v1.5.0:

| Area                       | Removed or changed                 | Replacement or action                                                 |
| -------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| React `useControlledState` | 3-tuple return with `isControlled` | 2-tuple return; derive `isControlled` locally                         |
| core                       | `kanbanAddCardClasses` alias       | `taskBoardAddCardClasses`                                             |
| Dropdown                   | in-place menu DOM by default       | default body portal; use `portal: false` to restore old DOM placement |
| ImageViewer React          | `onIndexChange`                    | `onCurrentIndexChange`                                                |
| CommentThread Vue          | `expand-change`                    | `update:expandedKeys` / `v-model:expanded-keys`                       |
| Spotlight Vue              | `close` event                      | `open-change(false)`                                                  |

## SSR And Hydration Matrix

Release candidates must cover both SSR examples:

```bash
pnpm example:ssr:nuxt
pnpm example:ssr:next
```

The aggregate gate is:

```bash
pnpm quality:ssr
```

When auditing hydration risk, focus on DatePicker locale/timezone stability, chart SVG id stability, closed-by-default overlay positioning, and client-only theme bootstrap behavior.

## Theme And Token Stability

Token source remains `packages/core/tokens/tokens.json`. After token-sensitive changes, run:

```bash
pnpm tokens:build
pnpm build
```

Before release, confirm `@expcat/tigercat-core` still exports `./tailwind`, `./tailwind/modern`, `./tokens.css`, and `./figma-variables.json`.

## Release Candidate Flow

1. Refresh generated API docs with `pnpm docs:api`, then review the diff.
2. Run `pnpm release:check`, `pnpm quality:release`, and `pnpm build`.
3. Create a Changesets snapshot with `pnpm release:next` or `pnpm release:canary`.
4. Install the prerelease in clean Vue, React, Nuxt, and Next projects or equivalent examples.
5. Publish the final release after the RC window, then run the npm artifact smoke test.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

Use prerelease channels for preview builds.

```bash
pnpm release:next
pnpm release:canary
```

Before publishing, run the validation set appropriate to the release scope locally. For package releases, prefer `pnpm quality:release` so size-limit, local publish smoke, generated-reference drift, API baseline drift, examples, and SSR checks stay aligned. Do not move this gate into publish workflows.

After publishing, run the published package smoke test when validating npm artifacts.

```bash
pnpm smoke:published
```
