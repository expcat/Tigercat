# Tigercat Scripts

此目录只保留跨平台 Node 脚本；旧的 shell 包装脚本已移除，日常使用优先走根目录 `package.json` scripts。

## 常用入口

| 命令                      | 脚本                                    | 说明                                                                                                       |
| ------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm setup`              | `scripts/setup.mjs`                     | 安装依赖、构建包并运行环境检查                                                                             |
| `pnpm dev:check`          | `scripts/check-env.mjs`                 | 检查 Node、pnpm、依赖安装和构建产物                                                                        |
| `pnpm example:all`        | `scripts/run-examples.mjs`              | 同时运行 Vue3 与 React 示例                                                                                |
| `pnpm quality:quick`      | 根 package scripts                      | 快速门禁：lint、公开类型/API 校验、core 单测                                                               |
| `pnpm quality:size`       | 根 package scripts                      | size-limit 包体积门禁                                                                                      |
| `pnpm quality:examples`   | 根 package scripts                      | 示例构建门禁：React 与 Vue3 example build                                                                  |
| `pnpm quality:ssr`        | 根 package scripts                      | SSR 示例构建门禁：Nuxt 与 Next.js                                                                          |
| `pnpm quality:release`    | 根 package scripts                      | 发布前分层门禁：发布元数据检查、快速门禁、覆盖率、API 基线 / references 漂移闸、size、测试清单、示例与 SSR |
| `pnpm release:check`      | `scripts/check-release-readiness.mjs`   | 检查包版本、公开导出、Changesets fixed group 与发布文档入口                                                |
| `pnpm publish:check`      | `scripts/publish-check.mjs`             | 本地打包发布 tarball，并验证包 smoke 与 example 发布态构建                                                 |
| `pnpm smoke:published`    | `scripts/publish-check.mjs --published` | 使用同一发布检查脚本校验 npm 上已发布版本                                                                  |
| `pnpm test:core`          | 根 package scripts                      | 运行 core 测试集合                                                                                         |
| `pnpm test:group`         | `scripts/run-component-group-tests.mjs` | 按组件组运行 Vitest；支持 `--group`、`--framework`、`--filter` 和 `--list`                                 |
| `pnpm test:validate`      | `scripts/validate-tests.mjs`            | 按 [测试质量指南](../tests/TEST_QUALITY_GUIDELINES.md) 检查测试文件                                        |
| `pnpm example:ssr:check`  | `scripts/check-ssr-examples.mjs`        | 构建 Nuxt/Next.js SSR 示例，并检查 `examples/nextjs/next-env.d.ts` 没有被构建过程改写                      |
| `pnpm docs:api`           | `scripts/generate-api-docs.mjs`         | 生成 skills API 摘要                                                                                       |
| `pnpm api:baseline:check` | 根 package scripts                      | 公共 API 基线漂移闸：生成基线并校验 `api-reports` 无差异                                                   |
| `pnpm docs:api:check`     | 根 package scripts                      | references 漂移闸：生成 LLM API 文档并校验 `skills/tigercat/references` 无差异                             |

## 示例应用

```bash
pnpm example:all
pnpm example:all -- --smoke
pnpm example:all -- --smoke --smoke-ms=2000
```

`run-examples.mjs` 会在需要时安装工作区依赖、检查包构建是否过期，并启动：

- Vue3: http://localhost:5173
- React: http://localhost:5174

## 组件分组测试

R10 之后的组件批次优先运行对应分组测试，再按变更范围补充 API、docs、examples 或发布门禁。分组来自 `scripts/lib/public-components.mjs` 的组件 Category，runner 会同时收集 React/Vue 组件 spec、同组 core utils spec 和必要 cross-cutting spec。

```bash
pnpm test:group -- --group form --list
pnpm test:group:basic
pnpm test:group:feedback -- --framework react
pnpm test:group:form -- --filter primitives
TEST_GROUP=form pnpm test:validate
```

可用分组：`basic`、`form`、`feedback`、`layout`、`navigation`、`data`、`charts`、`advanced`、`composite`、`core`。修改组件文档或示例时，同步运行 `pnpm docs:api:check`、相关 examples 检查和 changed-file Prettier check；发布面变更再升级到 `pnpm quality:release`。

## 内部 helper（仅限仓库脚本）

上面的脚本共享以下 helper 模块。它们**只服务于仓库脚本**：不得被发布包（`packages/*/src`）导入；CLI runtime 有自己的 `packages/cli/src/utils/*`，同样不得反向导入 `scripts/utils/*`。

| 模块                                    | 说明                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `scripts/utils/term.mjs`                | TTY 感知的彩色终端输出（`c()`）                                                                           |
| `scripts/utils/pnpm.mjs`                | 跨平台 pnpm 调用（`runPnpm`、`getPnpmVersion`、`isPnpmAvailable` 等）                                     |
| `scripts/utils/files.mjs`               | 文件/JSON 读写与目录遍历（`readText`、`readJson`、`writeJson`、`readJsonc`、`walkFiles`、`collectFiles`） |
| `scripts/utils/strings.mjs`             | 字符串工具（`escapeRegExp`）                                                                              |
| `scripts/lib/public-components.mjs`     | 公开组件枚举与类型映射的唯一事实源（生成/校验脚本共用）                                                   |
| `scripts/lib/component-test-groups.mjs` | 组件分组测试文件解析：供 `test:group` 和 `test:validate -- --group` 共用                                  |

## 维护规则

新增脚本时同时完成三件事：

1. 使用 `.mjs` 并保持跨平台。
2. 在根 [package.json](../package.json) 中添加需要的 pnpm 入口。
3. 更新本文件的命令表。

需要文件/JSON 读写、目录遍历或正则转义等通用逻辑时，优先复用 `scripts/utils/*` 中的共享 helper，不要在脚本里重复实现。
