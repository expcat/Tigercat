# Tigercat Scripts

此目录只保留跨平台 Node 脚本；旧的 shell 包装脚本已移除，日常使用优先走根目录 `package.json` scripts。

## 常用入口

| 命令                                        | 脚本                                    | 说明                                                                                            |
| ------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm setup`                                | `scripts/setup.mjs`                     | 安装依赖、构建包并运行环境检查                                                                  |
| `pnpm dev:check`                            | `scripts/check-env.mjs`                 | 检查 Node、pnpm、依赖安装和构建产物                                                             |
| `pnpm example:all`                          | `scripts/run-examples.mjs`              | 同时运行 Vue3 与 React 示例                                                                     |
| `pnpm quality:static`                       | 根 package scripts                      | 静态门禁：lint、公开类型与 API 校验、文档链接校验                                               |
| `pnpm quality:quick`                        | 根 package scripts                      | 快速门禁：lint、公开类型/API 校验、文档链接校验、core 单测                                      |
| `pnpm quality:size`                         | 根 package scripts                      | size-limit 包体积门禁                                                                           |
| `pnpm quality:examples`                     | 根 package scripts                      | 示例门禁：校验 DemoBlock code 来源，再构建 React 与 Vue3 example                                |
| `pnpm quality:ssr`                          | 根 package scripts                      | SSR 示例构建门禁：Nuxt 与 Next.js                                                               |
| `pnpm quality:release`                      | 根 package scripts                      | 发布前分层门禁：发布元数据、静态检查、覆盖率与 special tests、API/docs 漂移闸、size、示例与 SSR |
| `pnpm release:check`                        | `scripts/check-release-readiness.mjs`   | 检查包版本、公开导出、Changesets fixed group 与发布文档入口                                     |
| `pnpm publish:check`                        | `scripts/publish-check.mjs`             | 本地打包发布 tarball，并验证包 smoke 与 example 发布态构建                                      |
| `pnpm smoke:published`                      | `scripts/publish-check.mjs --published` | 使用同一发布检查脚本校验 npm 上已发布版本                                                       |
| `pnpm test:core`                            | 根 package scripts                      | 运行 core 测试集合                                                                              |
| `pnpm test:special`                         | 根 package scripts                      | 运行 coverage 排除的 4 个副作用/命令式 API specs                                                |
| `pnpm test:a11y`                            | 根 package scripts                      | 本地 axe / ARIA 回归（不进默认 `pnpm test`，不进 CI）                                           |
| `pnpm test:coverage:report`                 | 根 package scripts                      | 按需生成 text、JSON 与 HTML coverage 报告                                                       |
| `pnpm test:group`                           | `scripts/run-component-group-tests.mjs` | 按组件组运行 Vitest；支持 `--group`、`--framework`、`--filter` 和 `--list`                      |
| `pnpm test:validate`                        | `scripts/validate-tests.mjs`            | 按 [测试指南](../tests/README.md) 检查测试文件                                                  |
| `pnpm e2e`                                  | Playwright                              | 本地 E2E：Chromium + mobile-chromium（不进 CI）                                                 |
| `pnpm e2e:full`                             | Playwright                              | 本地 E2E：全部浏览器引擎，发版前抽查                                                            |
| `pnpm e2e:smoke`                            | Playwright                              | 仅 Chromium 跑 example shell 烟雾                                                               |
| `pnpm example:ssr:check`                    | `scripts/check-ssr-examples.mjs`        | 构建 Nuxt/Next.js SSR 示例，校验产物 HTML、主题 CSS、`next-env.d.ts` 未改写，并跑 hydrate 测    |
| `pnpm example:sources:check`                | `scripts/validate-example-sources.mjs`  | 校验 React/Vue 独立模块的元数据、入口、导入白名单、数量和 DemoBlock 契约                        |
| `node ./scripts/generate-example-index.mjs` | `scripts/generate-example-index.mjs`    | 从 `DEMO_NAV_GROUPS` 生成 `examples/index.html`；`--check` 校验未漂移                           |
| `pnpm docs:api`                             | `scripts/generate-api-docs.mjs`         | 生成 skills API 摘要                                                                            |
| `pnpm docs:links`                           | `scripts/check-doc-links.mjs`           | 校验全部 Markdown 的相对链接目标与 `#anchor` 片段（外部 http 链接不发请求）                     |
| `pnpm api:baseline:check`                   | 根 package scripts                      | 公共 API 基线漂移闸：生成基线并校验 `api-reports` 无差异                                        |
| `pnpm docs:api:check`                       | 根 package scripts                      | references 漂移闸：生成 LLM API 文档并校验 `skills/tigercat/references` 无差异                  |
| `pnpm mcp:build`                            | `packages/mcp`                          | 构建 `@expcat/tigercat-mcp` 本地 stdio MCP 服务                                                 |
| `pnpm mcp:serve`                            | `packages/mcp/dist/index.js`            | 从当前仓库根目录启动 MCP 服务，供 LLM 客户端路由 skill references                               |

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

组件改动优先运行对应分组测试，再按变更范围补充 API、docs、examples 或发布门禁。分组来自 `scripts/lib/public-components.mjs` 的组件 Category，runner 会同时收集 React/Vue 组件 spec、同组 core utils spec 和必要 cross-cutting spec。`--framework react|vue` 只缩窄 React/Vue 组件 spec，仍会保留同组 shared core spec。

```bash
pnpm test:group -- --group form --list
pnpm test:group:basic
pnpm test:group:feedback -- --framework react
pnpm test:group:form -- --filter primitives
TEST_GROUP=form pnpm test:validate
```

可用分组：`basic`、`form`、`feedback`、`layout`、`navigation`、`data`、`charts`、`advanced`、`composite`、`core`。`pnpm test:group` 支持 `--group` / `TEST_GROUP`、`--framework` / `TEST_FRAMEWORK`、`--filter` / `TEST_FILTER` 和 `--list`；`pnpm test:validate` 支持同一组参数用于只扫描目标组测试质量。当前 `form` 支持 `primitives` 与 `composite` filter alias。

改动范围 → 验证命令的映射见 [tests/README.md](../tests/README.md)「按改动范围验证」，本文不重复维护。

## MCP 服务

`@expcat/tigercat-mcp` 是只读的 stdio MCP 服务。默认从 GitHub Pages 的
`https://expcat.github.io/Tigercat/mcp/` 远程读取 `context7.json` 和
`skills/tigercat/**`（随 Pages 部署发布，见 `.github/workflows/deploy.yml`）；
`--root` 切换为读取本地仓库 checkout。服务只做组件/任务到最小 skill references
的路由，不运行 `docs:api` 也不修改生成文档。

```bash
pnpm mcp:build
pnpm mcp:serve          # 等价于 --root .（本地模式）
```

客户端接入方式与 `--root` / `--base-url` / `--doctor` 标志见
[README.md](../README.md)「MCP 接入（AI Agent）」。

维护者需要知道的额外约束：远程 allow-list 由 `context7.json` 的 `skill_files`
清单驱动，`pnpm docs:api` 生成、`pnpm api:validate` 与磁盘双向校验。改动 skill
文件集合后必须重跑 `pnpm docs:api`，否则远程模式会读不到新文件。

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
