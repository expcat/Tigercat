---
name: tigercat
description: Tigercat React/Vue app recipes and component docs: shell, routing, theme, i18n, SSR, props, examples, a11y, CLI.
---

# Tigercat UI Component Library

Tailwind CSS 驱动的 React + Vue 3 组件库。先按任务定位 reference，不要整库读取。

## MCP First

- Prefer `tigercat_route` for natural-language tasks (pass `framework`), then read only returned sources.
- Use `tigercat_component` for exact component imports, props, examples, framework notes, and test group.
- Use `tigercat_search` for fuzzy component/category/topic lookup; `Grid` routes to `Row` + `Col`; Chinese aliases (表单/表格/日期选择 …) route too.
- Use `tigercat_reference` only for direct allow-listed Skill reference reads; sources marked `"inlined": false` are session-level background — read each at most once.
- `notification` is a root command API/topic route, not a public component; `Message` remains both component docs and command API context.
- MCP 默认从 GitHub Pages 远程读取 skills；`--root` 用本地仓库，`--base-url` 可指镜像。

## Routes

- App shell/routing: [recipes/building-apps.md](references/recipes/building-apps.md).
- Setup/CLI/theme/i18n/SSR/a11y/perf: `references/{getting-started,cli,theme,i18n,ssr,accessibility,performance}.md`.
- Component lookup: [component-index.md](references/component-index.md) -> `shared/props/{cat}.md` + `examples/{cat}.md`.
- Vue/React notes: [vue/index.md](references/vue/index.md) / [react/index.md](references/react/index.md).
- Binding differences: [shared/patterns/common.md](references/shared/patterns/common.md); terms: [shared/glossary.md](references/shared/glossary.md).
- Type lookup only: [shared/api-summary.md](references/shared/api-summary.md).
- Table/virtual/toolbar: start from data, advanced, and composite props/examples.

## Use Rules

- Component imports prefer PascalCase subpaths such as `@expcat/tigercat-react/Button` or `@expcat/tigercat-vue/Button`.
- Generated references and `context7.json` are owned by `pnpm docs:api`; change generator/source facts before editing generated docs.
- Component route facts come from `scripts/lib/public-components.mjs`; keep package subpaths, test groups, Skill docs, and MCP inventory in sync.
- Maintainer automation must follow `CONTRIBUTING.md` "根因修复与架构约束": fix cross-component causes in core/shared adapters, migrate every equivalent consumer symmetrically, and delete replaced paths instead of adding component or Modal-specific patches.
- Maintainer-only package work may need [release.md](references/release.md) or [tokens.md](references/tokens.md).
