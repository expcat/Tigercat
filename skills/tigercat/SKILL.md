---
name: tigercat
description: Tigercat React/Vue app recipes and component docs: shell, routing, theme, i18n, SSR, props, examples, a11y, CLI.
---

# Tigercat UI Component Library

Tailwind CSS 驱动的 React + Vue 3 组件库。先按任务定位 reference，不要整库读取。

## Routes

- App shell/routing: [recipes/building-apps.md](references/recipes/building-apps.md).
- Setup/CLI/theme/i18n/SSR/a11y/perf: `references/{getting-started,cli,theme,i18n,ssr,accessibility,performance}.md`.
- Component lookup: [component-index.md](references/component-index.md) -> `shared/props/{cat}.md` + `examples/{cat}.md`.
- Vue/React notes: [vue/index.md](references/vue/index.md) / [react/index.md](references/react/index.md).
- Binding differences: [shared/patterns/common.md](references/shared/patterns/common.md); terms: [shared/glossary.md](references/shared/glossary.md).
- Type lookup only: [shared/api-summary.md](references/shared/api-summary.md).
- Table/virtual/toolbar: start from data, advanced, and composite props/examples.
- MCP routing: LLM clients can use `tigercat-mcp` to route tasks to the minimum needed skill references.

## Use Rules

- Component imports prefer PascalCase subpaths such as `@expcat/tigercat-react/Button` or `@expcat/tigercat-vue/Button`.
- Generated references are owned by `pnpm docs:api`; change `scripts/generate-api-docs.mjs` before editing generated docs.
- Maintainer-only package work may need [release.md](references/release.md) or [tokens.md](references/tokens.md).
