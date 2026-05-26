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

`pnpm quality:release` includes quick API/type checks, size-limit, test checklist validation, Vue/React example builds, and the Nuxt/Next SSR build matrix.

## API Freeze Checklist

- Run `pnpm release:check`, `pnpm types:check`, and `pnpm api:validate`.
- Confirm root package exports: core `.` / `./types` / `./theme` / Tailwind plugin entries / token assets, plus Vue and React root and component subpath exports.
- Confirm Vue and React public component files have matching props type exports.
- Do not rename props, events, slots, children, or subpath imports after the freeze unless the change is explicitly listed as Breaking.

## Breaking Changes

Breaking changes must be centralized in [docs/MIGRATION.md](../../../docs/MIGRATION.md) and [CHANGELOG.md](../../../CHANGELOG.md). Each entry should include affected package or component, removed API, replacement API, and a minimal diff when possible.

Current v1.2.0 breaking changes are the Image preview visibility removals:

| Area         | Removed                  | Replacement           |
| ------------ | ------------------------ | --------------------- |
| ImagePreview | `visible`                | `open`                |
| Image Vue    | `preview-visible-change` | `preview-open-change` |
| Image React  | `onPreviewVisibleChange` | `onPreviewOpenChange` |

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

Before publishing, run the validation set appropriate to the release scope. For package releases, prefer at least `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:validate`, `pnpm api:validate`, and `pnpm size`.

After publishing, run the published package smoke test when validating npm artifacts.

```bash
pnpm smoke:published
```
