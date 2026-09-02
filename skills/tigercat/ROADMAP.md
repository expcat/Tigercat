# Tigercat Skill Maintainer Note

本文件只给维护者说明 Skill 文档的边界；普通建应用或查组件路径不得链接到这里。

## Canonical Sources

- 当前执行计划：<https://github.com/expcat/Tigercat/blob/main/docs/ROADMAP.md>
- 版本与完成记录：<https://github.com/expcat/Tigercat/blob/main/CHANGELOG.md>
- breaking change：<https://github.com/expcat/Tigercat/blob/main/docs/MIGRATION.md>
- 生成器：<https://github.com/expcat/Tigercat/blob/main/scripts/generate-api-docs.mjs>
- Skill 护栏：<https://github.com/expcat/Tigercat/blob/main/scripts/validate-api.mjs>

## Rules

- 生成物：`references/component-index.md`、`examples/*`、`shared/props/*`、`shared/api-summary.md`、`vue/index.md`、`react/index.md` 由 `pnpm docs:api` 生成。
- 手写参考含 `command-apis.md`（命令式 Message / notification / LoadingBar）；只保留用户搭应用、查组件、查绑定差异需要的内容。当前可执行任务写入 `docs/ROADMAP.md`。
- `pnpm api:validate` 检查入口大小、手写 reference 行数、generated summary 体积、普通 references 的 Roadmap 链接和 context7 路径有效性。
