# Tigercat Skill — Roadmap & Gap Backlog

本文件记录 Tigercat skill 在“帮助 LLM 用 Tigercat 组件快速搭建通用网页应用”这一目标下的**已知能力缺口**与**详细升级需求**，供后续迭代实施。它面向维护者，不在 LLM 建应用的常规读取路径上（仅由 [references/recipes/building-apps.md](references/recipes/building-apps.md) 末尾引用）。

## 现状（本轮已交付）

- skill 仍是“组件查阅”入口（component-index → props/examples + 主题/i18n/SSR/CLI 专题）。
- 新增**建应用配方** [references/recipes/building-apps.md](references/recipes/building-apps.md)：脚手架、app shell 组合、主题/暗色、i18n、4 类应用选型、数据/状态、SSR/a11y。
- 已做 token 优化：component-index 三列化（−69%）、examples 去平凡行、props 样板压缩、vue/react 入口瘦身，references 总量约 −20%。

## 能力缺口与详细需求

按优先级排列。每项给出：**现状 / 需求 / 落点 / 验收**。

### G1. 成品级页面模板（高）

- 现状：配方只给骨架片段并指向 example app，LLM 无法整段照抄出一个可运行页面。
- 需求：为每个 archetype（仪表盘 / CRUD / 多步表单 / 落地页）提供 React + Vue **完整页面**代码，含数据 mock、加载/空/错误态、事件处理。
- 落点：`references/recipes/<archetype>.md`（每文件 ≤120 行，超出则拆分）；或新增生成器从 `examples/example/*/src/pages` 抽取真实页面代码。
- 验收：片段能在模板工程编译通过；引用的组件/属性都存在于 component-index 与 props 文档。

### G2. 路由集成细节（高）

- 现状：仅说明用 `<Outlet/>` / `<router-view/>`，未给路由表、导航↔路由联动、当前菜单高亮。
- 需求：React（react-router）与 Vue（vue-router）的最小路由配置：路由表、`Menu` selectedKeys 与路由同步、面包屑由路由派生。
- 落点：building-apps.md 第 2 节扩展，或独立 `references/recipes/routing.md`。
- 验收：与 `examples/example/*/src/layouts/AppLayout.*` 行为一致。

### G3. 数据获取与异步状态（中）

- 现状：第 6 节只说“受控状态由你的 store 持有”，无异步范式。
- 需求：列表/详情的 fetch→loading(`Skeleton`/`Loading`)→empty(`Empty`)→error(`Result`)→success 流；服务端分页/筛选与 `Table`/`DataTableWithToolbar` 的对接。
- 落点：`references/recipes/data-fetching.md`。
- 验收：覆盖分页、筛选、重试；不引入特定请求库假设。

### G4. 鉴权 / 权限骨架（中）

- 现状：缺登录页、受保护路由、按角色裁剪菜单。
- 需求：登录页（`Form` + 校验）、路由守卫、基于角色的 `Menu`/按钮显隐范式。
- 落点：`references/recipes/auth.md`。

### G5. 组件选型决策表（中）

- 现状：配方 archetype 表是雏形，缺“我要做 X → 用哪个组件”的全量映射。
- 需求：按意图归类（日期输入、多选、通知反馈、覆盖层、数据展示…）给出候选组件与取舍。
- 落点：`references/component-index.md` 顶部加一节，或 `references/recipes/choosing-components.md`。
- 验收：覆盖易混组件（Message/Notification/Alert、Select/Transfer/TreeSelect、Modal/Drawer/Popover 等）。

### G6. CLI 全壳模板（高，跨产品）

- 现状：`tigercat create` 只生成最小 App（见 `packages/cli/src/templates/{react,vue3}.ts`）。
- 需求：新增 `--template admin`（或 `dashboard`）脚手架，产出 AppLayout + `Menu` 导航 + 路由 + 2 个示例页，React/Vue 双版本。
- 落点：`packages/cli/src/templates/`、`packages/cli/src/commands/create.ts`、`tests/core/cli.spec.ts`。
- 验收：`tigercat create x --template admin` 可 `dev`/`build`；配方改为指向该模板。

## Token / 缓存进一步优化（可选）

- api-summary.md 与 component-index 仍有重叠：可去掉低价值的 Exports 计数列，或与 component-index 合并（本轮按“均衡”保留）。
- examples 平凡组件仅以逗号清单出现（满足校验的“被提及”要求）；若未来需要展示某平凡组件的常用属性，扩展点是生成器的 `COMPONENT_SNIPPETS` 映射。
- 评估把 react/vue 入口页合并为单文件（当前各自仅 ~10 行，校验脚本按目录读取，需同步改 `scripts/validate-api.mjs` 与 `context7.json`）。

## 编辑约束（改前必读）

- **生成文件归生成器所有**：component-index、examples/\*、shared/props/\*、shared/api-summary、vue/index、react/index 全部由 `scripts/generate-api-docs.mjs` 产出；改内容要改生成器再跑 `pnpm docs:api`，不要手改 .md（会被覆盖，且 `docs:api:check` 会红）。
- **生成器会清空** `references/examples/` 与 `references/shared/props/`；手写文档放别处（如 `references/recipes/`、本文件）。
- **校验预算**（`scripts/validate-api.mjs`，即 `pnpm api:validate`，可信门禁）：SKILL.md ≤3000 字节；props/\*.md ≤350 行；`references/` 下手写参考 ≤120 行；skill 全部 md ≤6000 行；每个公开组件必须在 props 与 examples 文档中“被提及”（标题或正文）；表格单行竖线 ≤10。
- 每个 `## {Component}` 标题即该组件在 props 文档的锚点；component-index 的路由规则依赖它，勿改标题格式。
- 本机 `docs:api:check` 因 CRLF/prettier 差异为环境性红，不可信；以 `pnpm api:validate` 与人工核对生成内容为准。
