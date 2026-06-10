---
name: tigercat
description: Tigercat React/Vue component guidance: props, APIs, patterns, tokens, i18n, SSR, a11y, CLI, release, and cross-framework mappings.
---

# Tigercat UI Component Library

Tailwind CSS 驱动的跨框架组件库。先定位组件或主题，再只打开对应 reference。

## How To Use

- 查组件：打开 [component-index.md](references/component-index.md)，按组件名找到分类、props、examples 和类型源码。
- 写组件：打开对应 [examples](references/examples/) 分类文档，再按需要打开同分类 [shared/props](references/shared/props/)。
- 查类型：打开 [shared/api-summary.md](references/shared/api-summary.md)，再回到类型源码或 props reference。
- 做跨框架迁移：先读 [shared/patterns/common.md](references/shared/patterns/common.md) 和 [shared/glossary.md](references/shared/glossary.md)，再打开目标组件 examples。
- 表格实现：固定列、锁列、虚拟表格优先看 [shared/props/data.md](references/shared/props/data.md)、[shared/props/advanced.md](references/shared/props/advanced.md) 与 [examples/data.md](references/examples/data.md) / [examples/advanced.md](references/examples/advanced.md)。

## Core References

| Need                    | Read                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| Component route map     | [component-index.md](references/component-index.md)               |
| Vue usage routes        | [vue/index.md](references/vue/index.md)                           |
| React usage routes      | [react/index.md](references/react/index.md)                       |
| Shared props            | [shared/props/](references/shared/props/)                         |
| Generated API summary   | [shared/api-summary.md](references/shared/api-summary.md)         |
| Cross-framework terms   | [shared/glossary.md](references/shared/glossary.md)               |
| Common binding patterns | [shared/patterns/common.md](references/shared/patterns/common.md) |

## Topic References

| Need          | Read                                                |
| ------------- | --------------------------------------------------- |
| Setup         | [getting-started.md](references/getting-started.md) |
| CLI           | [cli.md](references/cli.md)                         |
| Theme         | [theme.md](references/theme.md)                     |
| Tokens        | [tokens.md](references/tokens.md)                   |
| i18n          | [i18n.md](references/i18n.md)                       |
| SSR           | [ssr.md](references/ssr.md)                         |
| Accessibility | [accessibility.md](references/accessibility.md)     |
| Performance   | [performance.md](references/performance.md)         |
| Release       | [release.md](references/release.md)                 |
