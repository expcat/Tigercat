# Tigercat Skill Maintainer Note

本文件只给维护者说明 Skill 文档的边界；普通建应用或查组件路径不得链接到这里。

## Canonical Sources

- 当前执行计划：`../../docs/ROADMAP.md`
- 版本与完成记录：`../../CHANGELOG.md`
- breaking change：`../../docs/MIGRATION.md`
- 生成器：`../../scripts/generate-api-docs.mjs`
- Skill 护栏：`../../scripts/validate-api.mjs`

## Rules

- `references/component-index.md`、`references/examples/*`、`references/shared/props/*`、`references/shared/api-summary.md`、`references/vue/index.md`、`references/react/index.md` 都由 `pnpm docs:api` 生成。
- 手写参考只保留用户搭应用、查组件、查绑定差异需要的内容；维护者只把当前可执行任务写入 `docs/ROADMAP.md`，完成历史进入 changelog 或 Git 历史。
- `pnpm api:validate` 负责检查入口大小、手写 reference 行数、generated summary 体积、普通 references 的 Roadmap 链接和 context7 路径有效性。
