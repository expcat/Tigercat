# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: next-phase implementation plan based on the 2026-06-27 full-repo scan
verified-date: 2026-06-27
source: current repository state; v1.4.0 has been released; all 202 A-G scan findings registered into T01-T14 (P3/observations under T13)
-->

本文只记录下一阶段要实施的任务。已完成扫描的详细取证不再单独保留；后续执行入口以本文件的 T01-T14 为准。

## 后续计划

### 下一阶段实施任务队列

本计划来自 2026-06-27 全代码扫描结果。扫描覆盖版本库跟踪的源码、测试、示例、脚本、文档与 skill references；不包括 `node_modules`、`dist`、coverage、Playwright 报告等生成或依赖产物。扫描中的 A、B、C01-C32、F、G 只作为来源编号引用，不作为实施清单直接分配。

#### 执行原则

- 实施入口以 T01-T14 为准；每个任务都必须遵守本节的允许修改、不得修改、依赖和验证边界。
- 公开 API 删除、收窄或降级必须走 `@deprecated`、MIGRATION、changeset、`api:baseline:check`；no-op/ghost 项默认优先实现承诺能力。
- 生成产物只能通过修改生成器或源码事实源后重生成；不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 来掩盖漂移。
- 有依赖或文件边界重叠的任务串行实施；无依赖且文件族不重叠的任务可以并行。
- 文档整理任务不启动组件源码修复；执行 T01-T14 时再按各任务的验证命令运行目标门禁。

#### 批次与依赖

| 批次 | 任务                    | 并行规则                                                                    |
| ---- | ----------------------- | --------------------------------------------------------------------------- |
| 1    | T01、T02、T03、T04      | 最高优先级；T01 与其他三项可并行，T03 与 T06 不能同时改同一 locale 类型     |
| 2    | T05                     | 先统一生成器事实源；完成后其他 generated refs 相关任务不得另起生成器改动    |
| 3    | T06、T07、T08、T10、T11 | 可并行，但各自只改本任务声明的文件族                                        |
| 4    | T09、T12、T13、T14      | T09/T14 逐项实施；T12/T13 与源码组件任务隔离；T14 与 T07/T08/T09 同组件串行 |

#### T01 release/api baseline gate

**状态**：已完成（2026-06-27）。依据提交 `df9a76a4`，并在本轮补齐 API baseline
heritage 解析与 `api-reports/public-api-baseline.json` 快照更新；验证已运行
`npx -y pnpm@11.9.0 release:check` 与 `npx -y pnpm@11.9.0 api:baseline`。

**目标**：修复 A-4 与 G-1 两条会阻断 `quality:release` 的门禁漂移：API baseline 生成格式必须与提交格式一致，release check 不再依赖旧版 ROADMAP 发布结构。

**来源**：A-4、G-1。

**允许修改**：`scripts/generate-api-baseline.mjs`、`scripts/check-release-readiness.mjs`、相关脚本测试或 fixture、`api-reports/public-api-baseline.json`、必要的 release 文档断言事实源。

**不得修改**：组件源码、React/Vue 公共类型、旧发布表结构、`skills/tigercat/references/*`。

**依赖/阻塞**：无；优先于所有需要 `quality:release` 或 `api:baseline:check` 的任务。

**完成验证**：`pnpm api:baseline`、`pnpm api:baseline:check`、`pnpm release:check`；若时间允许再跑 `pnpm quality:release`。

**冲突规避**：T01 是唯一允许改 `api-reports/public-api-baseline.json` 与 release-readiness 逻辑的任务；其他任务如需 baseline 变化，必须基于 T01 完成后的结果追加。

#### T02 MarkdownEditor security

**状态**：已完成（2026-06-27）。依据提交 `94e079cf`；目标 React/Vue
MarkdownEditor spec 已在本轮验证通过。

**目标**：修复 C31-1 的安全问题，确保 MarkdownEditor 空 preview 不把 `placeholder` 直写进 `innerHTML`。

**来源**：C31-1。

**允许修改**：MarkdownEditor 的 React/Vue 实现、共享 Markdown/RichText 安全 helper、对应 React/Vue 测试。

**不得修改**：其他编辑器公开 API、generated references、全局 sanitizer 契约以外的文档生成链路。

**依赖/阻塞**：无；可与 T01/T03/T04 并行。

**完成验证**：目标 MarkdownEditor React/Vue spec、`pnpm api:validate`、`pnpm types:check`。

**冲突规避**：只处理 placeholder 安全渲染；C31-2/C31-3/C31-5 分别归 T09/T05，不在本任务中扩展。

#### T03 critical i18n parity

**状态**：已完成（2026-06-27）。依据提交 `a08340c0`，并在本轮补齐新增
`TigerLocaleQRCode`/`TigerLocaleTimeline` 的 API baseline 快照；QRCode/Timeline
目标 spec、`api:validate` 与 `types:check` 已验证通过。

**目标**：修复 P1 级 i18n 不对称：React QRCode 接入 ConfigProvider locale 并补 `qrcode` locale key；React Timeline 接入已有 Timeline locale。

**来源**：C02-2、C04-1。

**允许修改**：`TigerLocale` 中 QRCode/Timeline 所需字段、core locale presets、React QRCode/Timeline 实现、对应 React/core 测试。

**不得修改**：DatePicker/Select/Upload/Table 等其他 locale 命名空间；不得展开到 T06 的全量 locale rollout。

**依赖/阻塞**：无；但与 T06 不能同时改同一 locale 类型或 preset 文件。若 T06 已开始，T03 作为 T06 的首批子任务合并执行。

**完成验证**：QRCode/Timeline 目标 spec、`pnpm api:validate`、`pnpm types:check`、必要时 `pnpm api:baseline:check`。

**冲突规避**：T03 只处理 P1 parity；C02-5/C04-4 等非 P1 locale 文案留给 T06。

#### T04 Vue reactive lifecycle fixes

**状态**：已完成（2026-06-27）。依据提交 `bfb96d7c`；Vue Anchor、Avatar、
Breadcrumb、DatePicker、Dropdown 目标 spec 已在本轮验证通过。

**目标**：修复 Vue 侧 reactive/lifecycle 类缺陷，不改变公共类型形状。

**来源**：C02-1、C05-2、C05-3、C08-1、C16-7。

**允许修改**：Vue AvatarGroup、Anchor/AnchorLink/ScrollSpy、Overlay 触发器、DatePicker shortcut/生命周期相关实现与 Vue 测试。

**不得修改**：React 对应实现、core 公共类型、locale rollout、生成器。

**依赖/阻塞**：无；可与 T01/T02/T03 并行。

**完成验证**：相关 Vue spec、`pnpm api:validate`、`pnpm types:check`。

**冲突规避**：本任务只做 Vue reactive/lifecycle 修复；同一组件的 a11y、locale、公共 API no-op 分别归 T07/T06/T09。

#### T05 generator and generated refs

**状态**：已完成（2026-06-27）。本轮新增 `scripts/lib/public-components.mjs`
统一公开组件枚举，并让 `docs:api`、`api:validate`、`types:check` 与 API baseline
生成复用同一事实源；generated references 已重生成，component-index 修正为 148 个公开组件
（补 `MessageContainer`、`NotificationContainer`、`PrintPageBreak`、`StepsItem`，移除
`Drag`、`Notification`、`TableToolbar` 组件路由）。验证已运行 `npx -y pnpm@11.9.0
docs:api`、`npx -y pnpm@11.9.0 api:validate`、`npx -y pnpm@11.9.0 types:check`
与 `npx -y pnpm@11.9.0 api:baseline:check`；`docs:api:check` 的生成阶段通过，
diff gate 显示本任务的 generated references 预期变更。

**目标**：统一公开组件枚举与 generated references 事实源，修复 component-index 误列/漏列、props 类型映射与高级能力覆盖不足。

**来源**：A-5、A-6、A-7、C03-1、C06-4、C22-4、C24-4、C25-1、C28-5、C30-3、C31-5、C32-4、C12-2。

**允许修改**：`scripts/generate-api-docs.mjs`、新增脚本层 helper（如 `scripts/lib/public-components.mjs`）、消费同一 helper 的 `validate-api`/baseline 脚本、生成后的 `skills/tigercat/references/*`。

**不得修改**：组件运行时实现、core runtime helper、公共 API 语义；不得手写 generated references 内容。

**依赖/阻塞**：建议在 T01 后执行，避免 baseline/generator 事实源同时漂移。

**完成验证**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`、`pnpm types:check`。

**冲突规避**：T05 是唯一允许修改 generated references 生成链路的任务；T09 若需要更新 docs，必须等 T05 合并后再通过同一生成器重跑。

#### T06 locale namespace rollout

**状态**：已完成（2026-06-27）。本轮扩展 `TigerLocale` 的 empty、tour、
calendar、fileManager、imageViewer、imageEditor、table、taskBoard、status 等命名空间，
并将 DatePicker locale labels 收敛到 `datepicker-locales/*` preset；React/Vue
DatePicker、Calendar、Empty、List、Loading、Tour、AutoComplete、Select、FileManager、
ImageViewer/ImagePreview/CropUpload/ImageCropper/ImageAnnotation、Table/VirtualTable、
TaskBoard/Kanban 等目标组件已接入 ConfigProvider merged locale，显式 prop/labels
仍保持最高优先级。验证已运行目标 core 与 React/Vue 组件 spec、`corepack pnpm api:validate`、
`corepack pnpm types:check`、`corepack pnpm api:baseline` 与 API baseline diff 检查。

**目标**：按统一规则完成非 P1 的 locale/i18n 扩展：组件接 ConfigProvider merged locale，显式 prop 最高优先级，默认文案沉 core，preset 作为 labels 单一来源。

**来源**：B-1、B-2、C01-4、C02-5、C04-4、C09-3、C09-6、C14-3、C14-6、C16-3、C16-5、C18-3、C19-3、C20-6、C21-5、C23-4、C30-2，及 Calendar locale。

**允许修改**：core locale 类型与 presets、React/Vue 组件 locale 接入、locale utils、i18n 测试、组件目标测试、必要的 API baseline/changeset。

**不得修改**：a11y 键盘行为、no-op props 实现、generated references 生成器、发布门禁脚本。

**依赖/阻塞**：若 T03 未完成，先把 T03 内容纳入本任务首批；否则基于 T03 的 locale key 继续扩展。

**完成验证**：core i18n/date picker locale spec、相关组件 React/Vue spec、`pnpm api:validate`、`pnpm types:check`、涉及公共类型时跑 `pnpm api:baseline:check`。

**冲突规避**：T06 独占 locale 类型和 preset 文件；T03/T07/T09 不得同时修改同一 locale 字段。

#### T07 a11y keyboard aria

**状态**：已完成（2026-06-27）。本轮补齐 T07 全部 16 项来源覆盖：
C06-2/C06-3 Tabs、C07-8 菜单底层测试、C09-4 Tour overlay 生命周期、C13-1
Rate/Segmented、C14-5 Select clear、C16-2 Calendar、C18-6 FileManager、C20-3
ImageAnnotation、C21 Table 行交互、C23-3 VirtualTable、C25-3 ChartLegend、C26-2
Line/Area 点交互门控、C26-4 BarChart、C27-4 径向图表、C32-2 Resizable。关键决策：
Rate 统一改为单个可聚焦 `role="slider"`；Resizable 键盘 helper 进入 core 公共导出并已更新
`api-reports/public-api-baseline.json`。验证已运行 `corepack pnpm vitest run $(git diff
--name-only | rg '^tests/.*\\.(spec|test)\\.')`、`corepack pnpm test:a11y`、
`corepack pnpm api:validate`、`corepack pnpm types:check`、`corepack pnpm api:baseline`，并审阅
`api-reports/public-api-baseline.json` diff 确认仅新增 Resizable helper 导出。

**目标**：统一修复可访问性、键盘交互、ARIA 与 focus 行为，DOM/focus 保持框架层，纯索引/规则 helper 可沉 core。

**来源**：C06-3、C07-8、C13-1、C14-5、C16-2、C18-6、C20-3、C21 行交互、C23-3、C25-3、C26-2、C26-4、C27-4、C32-2、C06-2、C09-4。

**允许修改**：相关 React/Vue 组件的 ARIA/focus/key handling、必要的 core 纯规则 helper、a11y/keyboard 测试。

**不得修改**：locale 文案、公开 no-op props 契约、generated references、发布脚本。

**依赖/阻塞**：可与 T06/T08 并行，但同一组件同一文件需串行合并；菜单键盘底层 helper 若与 T08 重叠，以 T08 先抽 helper、T07 再接入行为测试。

**完成验证**：相关组件 React/Vue spec、a11y 断言、`pnpm api:validate`、`pnpm types:check`。

**冲突规避**：T07 只处理交互/a11y；同组件 locale 和 API no-op 分别归 T06/T09。

#### T08 core pure-logic consolidation

**状态**：已完成（2026-06-27）。本轮将 ThemeConfig 运行时 CSS var 映射、List
静态 grid class、DatePicker cell 规则、Select option aria、Slider/Stepper 数值归一化、
Table select-all/selection-column、VirtualTable range、文件大小/扩展名、ChartTooltip 定位、
Gauge/Funnel/Heatmap/Gantt/TreeMap/Sunburst 防御性归一化与 chart downsampling helper
收口到 core，并接入对应 React/Vue 调用点；DOM focus、portal、scroll-lock 与 a11y 行为仍留在框架层。
验证已运行 `npx -y pnpm@11.9.0 vitest run tests/core/date-utils.spec.ts
tests/core/list-utils.spec.ts tests/core/slider-utils.spec.ts tests/core/stepper-utils.spec.ts
tests/core/table-utils.spec.ts tests/core/virtual-table-utils.spec.ts
tests/core/gauge-chart-utils.spec.ts tests/core/funnel-chart-utils.spec.ts
tests/core/heatmap-chart-utils.spec.ts tests/core/gantt-utils.spec.ts
tests/core/treemap-chart-utils.spec.ts tests/core/sunburst-chart-utils.spec.ts
tests/core/chart-shared.spec.ts tests/core/file-manager-utils.spec.ts tests/core/upload-utils.spec.ts
tests/core/themes-manager.spec.ts`、`npx -y pnpm@11.9.0 vitest run
tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts tests/core/picker-utils.spec.ts
tests/react/Select.spec.tsx tests/vue/Select.spec.ts tests/react/Slider.spec.tsx
tests/vue/Slider.spec.ts tests/react/Stepper.spec.tsx tests/vue/Stepper.spec.ts
tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts tests/react/Table.spec.tsx
tests/vue/Table.spec.ts`、`npx -y pnpm@11.9.0 vitest run tests/react/ChartSubComponents.spec.tsx
tests/vue/ChartSubComponents.spec.ts tests/react/GaugeChart.spec.tsx tests/vue/GaugeChart.spec.ts
tests/react/FunnelChart.spec.tsx tests/vue/FunnelChart.spec.ts tests/react/HeatmapChart.spec.tsx
tests/vue/HeatmapChart.spec.ts tests/react/TreeMapChart.spec.tsx tests/vue/TreeMapChart.spec.ts
tests/react/SunburstChart.spec.tsx tests/vue/SunburstChart.spec.ts`、`npx -y pnpm@11.9.0
types:check`、`npx -y pnpm@11.9.0 api:validate`、`npx -y pnpm@11.9.0
--filter @expcat/tigercat-react --filter @expcat/tigercat-vue build`，并在 DatePicker
locale 类型窄化后复跑 `npx -y pnpm@11.9.0 vitest run tests/react/DatePicker.spec.tsx
tests/vue/DatePicker.spec.ts`。`npx -y pnpm@11.9.0
api:baseline:check` 已运行并生成预期 `api-reports/public-api-baseline.json` 公共导出 diff；
该脚本因存在未提交 baseline diff 返回 1，baseline 文件已随本任务更新。

**目标**：把双端重复且框架无关的纯逻辑收口到 core，降低 React/Vue 漂移风险。

**来源**：C07-2、C10-2、C16-1、C19-1、C19-2、C25-4、C21-3、C23-5、C27-3、C28-1、C28-2、C28-3、C14-4、C18-5、C15-5、C26-3、C04-2、B-3、C13-3、C16-4、C21-4。

**允许修改**：`packages/core/src/utils`、相关 core 类型、React/Vue 调用点、目标组件测试、必要的 API baseline/changeset。

**不得修改**：locale preset、a11y DOM 行为、generated references 生成器、CLI/scripts。

**依赖/阻塞**：ThemeConfig helper 与 T10 token 工作可能接触相邻文件，需先约定边界：T08 管运行时 `ThemeConfig → CSS vars`，T10 管 token/Tailwind 默认值和 `bg-opacity-*` 迁移。

**完成验证**：目标 core tests、相关 React/Vue spec、`pnpm api:validate`、`pnpm types:check`、涉及公开导出时跑 `pnpm api:baseline:check`。

**冲突规避**：每个 helper 子项独立 PR/提交更稳；不得在同一次修改中顺手处理 T09 no-op props 或 T07 a11y。

#### T09 public API no-op and ghost props

**目标**：逐项处理公开 no-op、ghost 类型、受控名漂移与死公共 helper；默认实现能力，确需移除时走废弃流程。

**状态**：已完成（2026-06-27）。本轮按“全量实现优先”处理 T09 全部 34 个子项：Select/Table/VirtualTable/VirtualList/Kanban/RichTextEditor 等大型 no-op 能力已接入真实运行路径；Transfer/FileManager/DataTableWithToolbar/Calendar/InputNumber/CommentThread/VirtualList 等 ghost 类型与双端声明已对齐；`getResultHttpLabel` 标记废弃并新增 `isHttpResultStatus`；NotificationCenter、Transfer 等纯死代码已删除或合并到 core helper。已补目标 core/React/Vue specs，运行 `npx -y pnpm@11.9.0 run types:check`、`npx -y pnpm@11.9.0 run api:validate`；generated references/API baseline 在本任务收尾通过生成器刷新。

**来源**：C31-2、C29-1、C27-2、C14-2、C14-1、C20-2、C18-2、C18-4、C16-6、C23-1、C27-1、C32-1、C15-1、C15-2、C31-3、C22-2、C02-4、C19-2、C06-6、C06-5、C10-5、C15-5、C05-1、C13-2、C21-1、C21-2、C26-1、C29-2、C30-1；另含 C06-1、C12-3、C22-1、C24-1、C24-3 的类型对齐项。

**允许修改**：对应组件 core 类型、React/Vue 实现、tests、MIGRATION、changeset、API baseline、必要的 generated references（通过 T05 的生成器）。

**不得修改**：与目标子项无关的组件、release scripts、locale rollout、Tailwind token 迁移。

**依赖/阻塞**：建议在 T01 后执行；涉及 generated references 的子项应等 T05 完成。每个 no-op/ghost 子项应独立拆分，避免一个 Agent 同时跨越多个组件域。

**完成验证**：目标组件 spec、`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`；涉及文档时追加 `pnpm docs:api:check`。

**冲突规避**：T09 是公开 API 契约任务；T06/T07/T08 不得借机删除或降级公开 prop。

#### T10 Tailwind/token cleanup

**目标**：收敛 Tailwind v4 token 化与透明度写法，降低 token、plugin、theme preset 多源维护风险。

**来源**：B-4、C02-3、C04-3、C18-1、C18-7。

**状态**：已完成（2026-06-27）。本轮为 token 生成器新增非写入 `--check`
模式与 `tokens:check` 脚本；Tailwind plugin 默认 `tigercatTheme` /
`tigercatDarkTheme` 改为经 `THEME_CSS_VARS` 从 default theme colors 派生；
ActivityFeed、CommentThread、Upload 的残留 `bg-opacity-*` class 已迁移为
Tailwind v4 透明度写法，并补齐双端断言。完成验证已运行
`npx -y pnpm@11.9.0 tokens:build`、`npx -y pnpm@11.9.0 tokens:check`、
`npx -y pnpm@11.9.0 vitest run tests/core/design-tokens.spec.ts tests/core/modern-theme.spec.ts`、
`npx -y pnpm@11.9.0 vitest run tests/react/ActivityFeed.spec.tsx tests/vue/ActivityFeed.spec.ts tests/react/CommentThread.spec.tsx tests/vue/CommentThread.spec.ts tests/react/Upload.spec.tsx tests/vue/Upload.spec.ts`、
`npx -y pnpm@11.9.0 types:check`、`npx -y pnpm@11.9.0 api:validate`、
`npx -y pnpm@11.9.0 build`、`npx -y pnpm@11.9.0 size`。其中 T10 相关
`Core tailwind/modern subpath` size 通过；当前仓库仍有未触碰的 React
DatePicker/Tree/TimePicker 与 core zh-CN locale size budget 超限。

**允许修改**：token 生成链路、Tailwind plugin 默认变量、theme preset 默认值同步护栏、相关组件 class/token 引用、token/Tailwind 测试。

**不得修改**：ThemeManager 运行时非 colors 应用（归 T08）、locale、a11y、generated references。

**依赖/阻塞**：与 T08 的 ThemeConfig 子项可能接触主题文件；先完成 T08 的运行时边界或在同一分支协调。

**完成验证**：token 生成/校验命令、相关 core tests、`pnpm api:validate`、`pnpm types:check`、必要时 `pnpm size`。

**冲突规避**：T10 只处理 token/Tailwind 默认值和 class 迁移；不得改组件行为契约。

#### T11 test/e2e/benchmark maintenance

**目标**：增强测试质量门禁、E2E 入口、SSR 示例生成副作用检查与 benchmark 覆盖说明。

**来源**：F-1、F-2、F-3、F-4。

**允许修改**：`scripts/validate-tests.mjs`、根 `package.json` scripts、CI/E2E workflow、PR 模板、`examples/nextjs/next-env.d.ts` 或 SSR build 流程、benchmark coverage map。

**不得修改**：组件源码行为、公共 API、locale、generated references。

**依赖/阻塞**：无；可与组件源码任务并行。

**完成验证**：`pnpm test:validate`、`pnpm example:ssr:build` 后目标 diff 检查、E2E script dry run 或 Playwright smoke、`pnpm bench`（如改 benchmark）。

**冲突规避**：T11 只改测试/示例/CI 维护层；不得把组件修复混入门禁增强。

#### T12 CLI/scripts maintenance

**目标**：收敛 CLI 命令执行、维护脚本 helper 与文档发现性，保持 CLI runtime 与 repo-only scripts 边界清晰。

**来源**：G-2、G-3、G-4。

**允许修改**：`packages/cli/src` 局部 command runner、CLI tests、`scripts/utils/*`、维护脚本 helper、CLI README、scripts README。

**不得修改**：组件 runtime、generated references 官方生成器行为、release-readiness 旧 ROADMAP 断言（已归 T01）。

**依赖/阻塞**：T01 先恢复 release gate；T12 再做脚本 helper 机械合并。

**完成验证**：CLI 目标 vitest、受影响脚本目标命令、`pnpm api:validate`、`pnpm types:check`。

**冲突规避**：CLI command runner 不得直接导入 `scripts/utils/*`；repo-only scripts helper 不进入发布包。

#### T13 deferred classification

**目标**：对暂缓项补分类、护栏或文档说明，不抢占前置任务的源码范围。

**分组入口**：

| 分组              | 来源                                                                                                                                                                                                                                 | 处理目标                                                                                  | 允许动作                                                                                 | 禁止动作                                                                                  | 升级条件                                                                                                    | 最小验证                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 分类/文档护栏     | B-5、A-2、C29-3、F-4、C07-5、C01-5                                                                                                                                                                                                   | 补充分类说明、coverage map 或后续 backlog，避免低优先观察在后续任务中被误当成立即修复项。 | 分类文档、只读审计记录、低风险 guard test、benchmark coverage map、命名/语义说明。       | 不删除公开 API；不改组件运行时；不改 generated references、release gate、locale rollout。 | 审计发现真实功能缺陷、用户可见回归、公共契约不一致，或需要改源码才能建立护栏时，拆成新的 Txx 子任务。       | `corepack pnpm prettier --check docs/ROADMAP.md`、`git diff --check -- docs/ROADMAP.md`。                       |
| 低风险清理候选    | A-3、B-6、C01-1/2/3/6/7、C03-2、C04-5/6/7/8、C05-5、C07-1/3/4/6、C08-2/3/4/5/6/7、C09-2/5/7、C10-3/4/6/7、C11-4/5、C12-4/5/6、C13-4、C14-7、C15-3/4、C17-2、C19-4/5、C20-4/5、C21-6、C22-3、C25-5、C27-5、C28-4、C29-4、C30-4、C32-3 | 分批处理不急迫的重复实现、helper 归属、轻微 parity、文档发现性或低概率边界问题。          | 小范围 helper 合并、局部测试补强、JSDoc/说明修正、低风险行为对齐；每次只认领一个组件族。 | 不跨组件大重构；不把 P2/P1 行为修复混入；不借机收窄公开 prop。                            | 子项需要公共类型变更、破坏兼容、涉及安全/SSR/a11y 主路径，或与 T06/T07/T08/T09/T14 重叠时，升级并重新归类。 | 目标组件/core spec；`corepack pnpm api:validate`、`corepack pnpm types:check`；文档项追加 prettier/diff check。 |
| 观察/健康，无动作 | A-1、C01-8、C07-7、C11-6、C14-8、C16-8、C17-3、C18-8、C19-6、C24-5、C32-5、F-5、G-5                                                                                                                                                  | 保留为后续回归背景，不作为实施任务；执行相邻组件修复时用来确认健康路径不被误改。          | 只读复核、回归说明、测试备注；必要时把健康路径加入受影响任务的验收清单。                 | 不主动改源码；不把“健康面”改写成待修复缺陷。                                              | 后续取证证明观察项已变成真实缺陷，或产品策略决定改变既有行为时，单独建任务。                                | 文档检查；若相邻源码任务引用该健康面，则跑该任务自己的目标 spec。                                               |

**允许修改**：分类文档、低风险 guard test、coverage map、后续 backlog 条目；必要时只做只读审计报告。

**不得修改**：公开 API 删除、组件大重构、generated references、release gate、locale rollout。

**依赖/阻塞**：排在 T01-T12 后；只有当前置任务完成或明确不覆盖该区域时才实施。

**完成验证**：文档/护栏对应的最小命令，至少 `pnpm prettier --check` 与 `git diff --check`。

**冲突规避**：T13 不做功能修复；若发现必须改源码，应拆成新的后续任务，不在 T13 中直接实施。

#### T14 残留 P2 组件行为/契约修复

**目标**：逐项修复随取证删除而失去归属的 P2 行为/契约类缺陷，默认实现承诺能力；需改公共契约时走废弃流程。

**子项入口**：

| 来源  | 组件/区域      | 问题                                                                              | 建议修复方向                                                                                                              | 主要修改边界                                                                                         | 目标验证命令                                                                                                                                                                                                                                                                                      |
| ----- | -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C05-4 | BackTop        | render 阶段访问默认 `window`，存在 SSR 风险。                                     | 在框架层延迟读取 `window`，SSR 下保持可渲染；core 的 visibility controller、scroll helper 与 class 常量继续复用。         | React/Vue BackTop 实现和目标测试；不改 core public API。                                             | `corepack pnpm vitest run tests/react/BackTop.spec.tsx tests/vue/BackTop.spec.ts tests/core/back-top-utils.spec.ts tests/core/ssr-frameworks.spec.ts`、`corepack pnpm quality:ssr`、`corepack pnpm api:validate`。                                                                                |
| C09-1 | React Modal    | `onOpenChange`/`onClose` 被当作 prop observer，初始挂载或父级 prop 变化也会触发。 | 推荐改为 action-only 语义：只在内部关闭/确认动作或有效 open-to-closed 过渡触发；若保留 observer，必须文档化。             | React Modal 与测试；Vue 仅作对照，不主动改。涉及兼容语义时补 migration/changeset。                   | `corepack pnpm vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                                                                                        |
| C10-1 | Message        | imperative API 接收 `position` 但双端静默忽略，和 Notification 不对称。           | 二选一：真正按 position 分容器渲染；或将 `position` 标为 deprecated 并同步类型/文档。默认优先实现承诺能力。               | React/Vue Message 实现、测试、必要的 core 类型；public type 变更必须跑 baseline。                    | `corepack pnpm vitest run tests/react/Message.spec.tsx tests/vue/Message.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`，涉及类型追加 `corepack pnpm api:baseline:check`。                                                                                                   |
| C11-1 | Form           | React 维护无人读取的 `formValues` 影子状态与 `updateValue`，Vue 没有同等契约。    | 先统一 Form 数据所有权：推荐以外部 `model` 为单一数据源，移除或正式文档化写入口；双端契约必须一致。                       | Form React/Vue、FormContext 类型、useFormContext 消费端、测试；涉及公开类型需 changeset/baseline。   | `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`，涉及类型追加 `corepack pnpm api:baseline:check`。                                                                                                         |
| C11-2 | Form           | `resetFields` 只清校验错误，不重置字段值，且双端实现不一致。                      | 二选一：明确仅清校验并文档化；或存初始快照并真正重置字段值。与 C11-1 的数据所有权决策一起落地。                           | Form 实现、useFormController 对照测试、文档/类型说明；不混入无关 FormItem 样式调整。                 | `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm types:check`。                                                                                                                                                                                        |
| C11-3 | Form           | `addField`/`removeField`/`undo`/`redo` 受控数据流双端契约不一致。                 | 与 C11-1 合并决策：统一为单一数据源 + 一致变更事件，确保命令后值、校验与历史栈一致。                                      | Form 命令方法、core form history helper 调用点、双端测试；不重写表单校验系统。                       | `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                                                                                          |
| C12-1 | InputGroup     | `size` 说明为应用到全部子控件，但当前只影响 Addon。                               | 二选一：收窄说明为只影响 Addon；或让 Input/Textarea/InputNumber 在未显式传 size 时继承 group size。默认优先实现承诺能力。 | InputGroup context、Input/Textarea/InputNumber 双端实现和测试；不改输入解析/格式化逻辑。             | `corepack pnpm vitest run tests/react/InputGroup.spec.tsx tests/react/Input.spec.tsx tests/react/Textarea.spec.tsx tests/react/InputNumber.spec.tsx tests/vue/InputGroup.spec.ts tests/vue/Input.spec.ts tests/vue/Textarea.spec.ts tests/vue/InputNumber.spec.ts`、`corepack pnpm types:check`。 |
| C17-1 | TimePicker     | `minTime`/`maxTime` 只按分钟比较，`showSeconds` 秒级边界无效。                    | 将 core range helper 收敛为总秒比较，并让秒列/移动端 option 复用同一禁用规则；若不支持秒级需收窄文档。                    | core time utils、React/Vue TimePicker 渲染与测试、props 文档；不改 locale rollout。                  | `corepack pnpm vitest run tests/core/time-utils.spec.ts tests/react/TimePicker.spec.tsx tests/vue/TimePicker.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                                                |
| C20-1 | ImageCropper   | SVG mask 固定 `crop-mask` id，多实例同屏会冲突。                                  | 双端生成实例级 mask id 并同步 `url(#id)` 引用；不改 public API。                                                          | React/Vue ImageCropper 实现和多实例测试；不改裁剪算法。                                              | `corepack pnpm vitest run tests/react/ImageCropper.spec.tsx tests/vue/ImageCropper.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                                                                          |
| C23-2 | VirtualTable   | 固定列未复用 Table 的 `border-separate` 与 colgroup 钉宽策略。                    | 提取/复用 table base class、colgroup descriptor 或固定列宽度策略，保持 VirtualTable 虚拟窗口逻辑独立。                    | VirtualTable、必要的 Table shared helper、固定列测试；不得重写 Table 状态机。                        | `corepack pnpm vitest run tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts tests/react/Table.spec.tsx tests/vue/Table.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                       |
| C24-2 | InfiniteScroll | observer 路径未感知 `inverse`，与 scroll fallback 触发边界不一致。                | 扩展 core observer helper 支持 `inverse`，生成 top/left rootMargin；React/Vue 同步传入。                                  | core infinite-scroll utils、React/Vue InfiniteScroll 传参和测试；不改 public prop。                  | `corepack pnpm vitest run tests/core/infinite-scroll-utils.spec.ts tests/react/InfiniteScroll.spec.tsx tests/vue/InfiniteScroll.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                             |
| C25-2 | ChartLegend    | `gap` prop 双端行为分歧，label 上还有冗余 `marginRight`。                         | 统一 `gap` 为容器 flex 行间距，移除 label 冗余尾边距；可抽小型 layout style helper 防漂移。                               | React/Vue ChartLegend、必要 core chart helper、双端断言；不改 chart scale/path 逻辑。                | `corepack pnpm vitest run tests/react/ChartSubComponents.spec.tsx tests/vue/ChartSubComponents.spec.ts tests/core/chart-utils.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                               |
| C31-4 | RichTextEditor | 自定义 toolbar action 绕过 engine change 同步。                                   | 让自定义 action 统一走 engine 执行，或组件执行后显式走同一 notifyChange/sanitize/active-format 路径。                     | React/Vue RichTextEditor、rich-text engine、custom toolbar action 测试；不改 MarkdownEditor 安全项。 | `corepack pnpm vitest run tests/react/RichTextEditor.spec.tsx tests/vue/RichTextEditor.spec.ts tests/core/rich-text-engine.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`。                                                                                                  |

**允许修改**：上列组件的 React/Vue 运行时实现、目标组件测试、必要的 core 纯 helper/类型、涉及公共类型时的 changeset/API baseline。

**不得修改**：locale rollout（T06）、generated references 生成器（T05）、release gate（T01）、Tailwind/token（T10）；不借机删除/降级公开 prop（T09）。

**依赖/阻塞**：排在 T01 之后；每子项独立 PR；与 T07/T08/T09 触及同组件文件时串行（Table 类：C23-2 与 T08 的 C21-4、T09 的 C21-1/C21-2 不得并发改同文件）。

**完成验证**：目标组件 React/Vue spec、`pnpm api:validate`、`pnpm types:check`；涉及公共类型时 `pnpm api:baseline:check`。

**冲突规避**：T14 只做行为/契约修复；同组件 no-op/ghost、a11y、纯逻辑、locale 分别归 T09/T07/T08/T06。

#### 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --write docs/ROADMAP.md` 与 `corepack pnpm prettier --check docs/ROADMAP.md`。
- 删除旧扫描记录后确认文件不存在，并确认仓库内没有旧扫描记录引用或行首冲突标记。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`。
