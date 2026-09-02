---
name: tigercat
description: Tigercat React/Vue app recipes and component docs: shell, routing, theme, i18n, SSR, props, examples, a11y, CLI.
---

# Tigercat UI Component Library

Tailwind CSS 驱动的 React + Vue 3 组件库。先按任务定位 reference，不要整库读取。

## MCP First

- Prefer `tigercat_route` (pass `framework`), then read only returned sources.
- `tigercat_component` for a known name/alias: import subpath, own props section, examples, framework notes, test group.
- `tigercat_search` for fuzzy lookup; `Grid` → `Row` + `Col`; Chinese aliases (表单/表格/日期选择 …) route too.
- `tigercat_reference` only for allow-listed paths; `"inlined": false` is session background — read each at most once.
- `notification` is a command API, not a component. `Message` / `LoadingBar` are both. See [command-apis.md](references/command-apis.md).
- MCP reads skills from GitHub Pages by default; `--root` is local; `--base-url` is a mirror.

## Routes

- App shell: [building-apps.md](references/recipes/building-apps.md)
- Setup/CLI/theme/i18n/SSR/a11y/perf: `references/{getting-started,cli,theme,i18n,ssr,accessibility,performance}.md`
- Components: [component-index.md](references/component-index.md) → `shared/props/{cat}.md` + `examples/{cat}.md`
- Vue/React notes: [vue/index.md](references/vue/index.md) / [react/index.md](references/react/index.md)
- Bindings: [common.md](references/shared/patterns/common.md); terms: [glossary.md](references/shared/glossary.md)
- Types/hooks: [api-summary.md](references/shared/api-summary.md)
- Command APIs: [command-apis.md](references/command-apis.md)
- Maintainer-only: [release.md](references/release.md), [tokens.md](references/tokens.md)

## Use Rules

- Component imports: `@expcat/tigercat-react/Button` or `@expcat/tigercat-vue/Button`.
- Generated refs and `context7.json` are owned by `pnpm docs:api`; change generator/source facts first.
- Component route facts: `scripts/lib/public-components.mjs`.
- Maintainer automation follows CONTRIBUTING.md「根因修复与架构约束」; do not restate it here.
