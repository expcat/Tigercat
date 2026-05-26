# Tigercat Scripts

此目录只保留跨平台 Node 脚本；旧的 shell 包装脚本已移除，日常使用优先走根目录 `package.json` scripts。

## 常用入口

| 命令                    | 脚本                                  | 说明                                                                 |
| ----------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `pnpm setup`            | `scripts/setup.mjs`                   | 安装依赖、构建包并运行环境检查                                       |
| `pnpm dev:check`        | `scripts/check-env.mjs`               | 检查 Node、pnpm、依赖安装和构建产物                                  |
| `pnpm example:all`      | `scripts/run-examples.mjs`            | 同时运行 Vue3 与 React 示例                                          |
| `pnpm quality:quick`    | 根 package scripts                    | 快速门禁：lint、公开类型/API 校验、core 单测                         |
| `pnpm quality:size`     | 根 package scripts                    | size-limit 包体积门禁                                                |
| `pnpm quality:examples` | 根 package scripts                    | 示例构建门禁：React 与 Vue3 example build                            |
| `pnpm quality:ssr`      | 根 package scripts                    | SSR 示例构建门禁：Nuxt 与 Next.js                                    |
| `pnpm quality:release`  | 根 package scripts                    | 发布前分层门禁：发布元数据检查、快速门禁、size、测试清单、示例与 SSR |
| `pnpm release:check`    | `scripts/check-release-readiness.mjs` | 检查包版本、公开导出、Changesets fixed group 与发布文档入口          |
| `pnpm test:core`        | 根 package scripts                    | 运行 core 测试集合                                                   |
| `pnpm test:validate`    | `scripts/validate-tests.mjs`          | 按 [测试质量指南](../tests/TEST_QUALITY_GUIDELINES.md) 检查测试文件  |
| `pnpm docs:api`         | `scripts/generate-api-docs.mjs`       | 生成 skills API 摘要                                                 |

## 示例应用

```bash
pnpm example:all
pnpm example:all -- --smoke
pnpm example:all -- --smoke --smoke-ms=2000
```

`run-examples.mjs` 会在需要时安装工作区依赖、检查包构建是否过期，并启动：

- Vue3: http://localhost:5173
- React: http://localhost:5174

## 维护规则

新增脚本时同时完成三件事：

1. 使用 `.mjs` 并保持跨平台。
2. 在根 [package.json](../package.json) 中添加需要的 pnpm 入口。
3. 更新本文件的命令表。
