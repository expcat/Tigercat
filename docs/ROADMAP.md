# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: pending development roadmap and optimization scan plan
verified-date: 2026-06-19
source: current repository audit and planning
-->

本文只记录仍需推进的任务和长期守护规则。已经完成的阶段、组件和发布准备事项不再保留在 Roadmap 中，回溯以 [CHANGELOG.md](../CHANGELOG.md)、发布记录和对应文档为准。

## 文档职责边界

- Roadmap 只记录当前待办、持续守护项和短期发布状态。
- [CHANGELOG.md](../CHANGELOG.md) 记录已交付且影响用户、贡献者或发布流程的变更。
- [scripts/README.md](../scripts/README.md) 维护命令入口和脚本职责。
- 组件 API、示例、主题、i18n、SSR 和发布流程以 `skills/tigercat/references/` 为准。

## 当前基线

| 项目     | 状态                                                             |
| -------- | ---------------------------------------------------------------- |
| 组件库   | Vue 3 + React 双端组件库，核心逻辑沉淀在 `@expcat/tigercat-core` |
| 包管理   | pnpm workspace，统一 catalog 管理核心工具链版本                  |
| 样式体系 | Tailwind CSS v4 + CSS Variables + Tigercat Tailwind plugin       |
| 发布版本 | v1.3.4 发布准备中                                                |
| 质量门禁 | Vitest、Playwright、a11y、size-limit、API/test validate          |

## 当前待办

- [ ] v1.3.4 发布执行：运行 `pnpm quality:release`、`pnpm build`，发布后执行 `pnpm smoke:published`。
  - F-1 体积预算阻塞已解除（size 预算按实测重设并扩展覆盖，`pnpm size` 转绿，详见 [CHANGELOG.md](../CHANGELOG.md)）；`release:check` 仍需在发布时把 `v1.3.4` 写入 CHANGELOG / 迁移指南 / release.md 版本标题（属发布执行动作）。
- [ ] 发布后归档：确认 `CHANGELOG.md`、迁移指南、发布记录和 Roadmap 状态与实际发布结果一致。

## 优化扫描计划

以"先扫描定位、再整改"的方式推进全项目优化。下列任务按结构/模块划定范围，每个任务下挂一份维度检查清单（模块 × 维度矩阵），复用现有工具（`grep`、`validate-api.mjs`、`check-public-types.mjs`、size-limit、Explore agent）完成扫描。本节只负责"扫描什么 / 怎么扫 / 怎么回填"，不承载具体修复过程。

### 公共约定

所有扫描任务共用同一套执行与产出流程（各任务只列差异化的目标路径、维度清单与方法）：

1. **扫描**：按任务的目标路径与维度清单逐项核查，用上述工具定位问题。
2. **归类**：把扫描到的问题与发现的可优化内容按「模块 / 维度」归类，先比对已有条目避免重复。
3. **回填**：将每条发现更新到本文档下方「后续优化任务」小节，作为后续优化任务内容；体量小、可即时处理的也可直接进 `当前待办`。
4. **判定**：某个扫描任务的发现全部回填后，方可勾除该任务复选框——扫描阶段只记录、不修复。

每条「后续优化任务」条目建议写明：所属扫描任务与模块、维度、问题描述、影响范围、建议方案、优先级（P0 阻塞 / P1 重要 / P2 改进）。已交付的优化按惯例移交 [CHANGELOG.md](../CHANGELOG.md)，不在本节保留。

### 任务 A — Core 包扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`packages/core/src/`
- 维度清单：
  - [x] 类型安全：core 实际 `any` 类型用法 0 处、`@ts-ignore` 0 处（详见 A-0），`any` 审计移交任务 B/C。
  - [x] i18n：核对 `utils/locale-utils.ts` 覆盖面，发现 form-validation 不可本地化与标签表分散（A-1、A-2）。
  - [x] SSR：core 已统一 `isBrowser()`，残留 `typeof window/document` 均为合理特性检测（A-0），散落直写移交任务 B/C。
  - [x] token/theme：核对 `tokens/`、`themes/`、`theme/`，发现 `theme/` 与 `themes/` 命名易混淆（A-5）。
  - [x] 死代码 / deprecated：定位 2 处 `@deprecated`——`shouldLoadMore` 仍被使用、`kanbanAddCardClasses` 可清理（A-3、A-4）。
- 方法：`grep` 定位 + `pnpm --filter @expcat/tigercat-core build`、`pnpm test:core` 验证收敛后类型与单测仍通过。
- 产出：见下方「后续优化任务 → 来自任务 A」（A-0 核查结论、A-1～A-5 优化项）。

### 任务 B — Vue 组件包扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`packages/vue/src/`
- 维度清单：
  - [x] 复杂度热点：最大文件 Menu(1278)/DatePicker(989)/TimePicker(980)/Tree(934)/Select(814)；DatePicker/TimePicker/Select 已有 composable 却未接入，Menu/Tree 无任何抽取层（B-6）。
  - [x] 硬编码文案：定位 render 内写死串（B-1）与英文 prop 默认值绕过 ConfigProvider locale（B-2）；`TigerLocaleCommon` 已含 loadingText/emptyText/closeText 槽位待接入。
  - [x] SSR guard：121 处 window/document 访问，抽样核查未见在 SSR setup/render 同步执行者（均在 onMounted/事件处理/守卫内，无崩溃风险），但守卫写法不统一（B-4）。
  - [x] 非空断言：全包仅 21 处 `!`（`Alert.ts:202`、`Select.ts:791` 等），多为 defaulted prop 与受控值模式，可类型收窄（B-5）。
  - [x] composables 复用：10 个 composable 中仅 `useChartInteraction` 被组件使用，7 个仅被自身 barrel 引用＝死代码，并与 React hooks 存在 parity 缺口（B-3）。
  - [x] 类型安全（A-0 移交）：Vue src 类型位 `any` 实际 0 处（唯一是 `Table.ts:160` 的 `Map<string, any>`），`@ts-ignore` 0 处 → Vue 侧基本干净，余项移交任务 C（见 B-0）。
- 方法：`grep` 定位 + 计划用 `pnpm test:vue` 窄范围验证（扫描阶段只记录、未跑修复）。
- 产出：见下方「后续优化任务 → 来自任务 B」（B-0 核查结论、B-1～B-6 优化项）。

### 任务 C — React 组件包扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`packages/react/src/`
- 维度清单：
  - [x] 复杂度热点：`Table` 已拆为 `Table/` 子模块（范式），Menu/Tree/DatePicker/TimePicker/Select 仍单文件巨石（C-5、呼应 B-6）。
  - [x] 硬编码文案：内部搜索框 `"Search..."` 内联硬编码不可定制（C-1）、英文 prop 默认值绕过全局 locale（C-2）——与 B-1/B-2 同源。
  - [x] SSR guard：点名的 FloatButton/Tour/ChartTooltip 均已 `isBrowser()` 守卫（详见 C-0），真正缺显式守卫仅 ImagePreview（C-3）。
  - [x] hooks 复用：`useControlledState` 能力不足、仅 5 处采用，~29 组件手写受控/非受控样板（C-4）。
  - [x] 类型安全（A-0/B-0 移交）：React src 类型位 `any` 仅 1 处、`@ts-ignore` 0 处，非空断言约 17 处（详见 C-0）。
- 方法：`grep` 定位 + 与 `packages/vue/src/` 对照确认跨框架同源问题；扫描阶段未改动代码，不触发 `pnpm test:react`。
- 产出：见下方「后续优化任务 → 来自任务 C」（C-0 核查结论、C-1～C-5 优化项）。

### 任务 D — 跨框架一致性扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`packages/core` + `packages/vue` + `packages/react`
- 维度清单：
  - [x] 重复逻辑下沉：键盘导航是唯一系统性未下沉的重复逻辑——Menu/Tree/DatePicker/TimePicker/Mentions 双端各自内联，`picker-utils` 已是成熟范式却仅 Select/AutoComplete/Spotlight 接入（D-1）；class 生成与过滤已充分沉淀（`get*Classes`/`filter*`，无需再抽）。另有 Message/Notification 命令式 API helper 与 InputNumber 显示/解析双端重复（D-2）。
  - [x] API parity & 命名：`api:validate`/`types:check` 跑通且 0 问题；双端共用 `core/src/types/*.ts` 的 Props 类型，结构性 prop parity 有保证，分歧集中在事件/回调命名（D-3）；validate-api 的 parity 规则覆盖面窄（D-4）。
  - [x] 受控 / 事件对称：`open` 三件套（`open`/`update:open`/`onOpenChange`）全量正确；但 validate-api 仅强校验 `open` 一项，其余受控量与回调命名出现不对称（ImageViewer/CommentThread/Spotlight/DataTableWithToolbar/Signature，详见 D-3）。
- 方法：`pnpm api:validate` + `pnpm types:check` 跑通基线 + 脚本对照双端 emits/回调 + 同名 helper 双端交叉定位（区分「重复实现」与「对 core util 的薄包装」）。
- 产出：见下方「后续优化任务 → 来自任务 D」（D-0 核查结论、D-1～D-4 优化项）。

### 任务 E — CLI 包扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`packages/cli/src/`
- 维度清单：
  - [x] 模板对齐：实际模板位于 `src/templates/`；Tailwind v4 接入与 catalog / example 对齐（E-0），但 package `files` 仍列不存在的 `templates` 目录（E-2）。
  - [x] doctor 诊断覆盖：已覆盖 package/Node/pnpm/Tailwind/peer presence/template deps presence，但未校验 Vue/React/Vite 等 peer/template 版本范围与核心 exports/importability（E-4）。
  - [x] 命令健壮性：发现 `generate` 已存在文件路径运行时崩溃（E-1），以及 `create` / `add` / `playground` 若干边界行为不清晰（E-3）。
  - [x] 版本同步：`CLI_VERSION` 与 `TEMPLATE_VERSIONS.tigercat` 已由 `sync-version.mjs` / `release:check` 守护；其余模板工具链版本仍靠手工同步，覆盖不完整（E-5）。
- 方法：`rg` 定位 + CLI 单测 + `pnpm --filter @expcat/tigercat-cli build` + `pnpm --filter @expcat/tigercat-cli exec tsc --noEmit` + `pnpm --filter @expcat/tigercat-cli pack --pack-destination /tmp` + built CLI 边界路径 smoke。
- 产出：见下方「后续优化任务 → 来自任务 E」（E-0 核查结论、E-1～E-5 优化项）。

### 任务 F — 构建·体积·性能扫描 ✅ 已扫描（2026-06-19）

- 目标路径：构建与产物（各包 `tsup.config.ts`、`.size-limit.json`、`package.json` exports/sideEffects）
- 维度清单：
  - [x] 体积预算：fresh build 下 `.size-limit.json` 5 项预算**全部超限**（`pnpm size` 退出码 1 → CI/`quality:release` 门禁红，F-1）；且仅 5 入口，未覆盖 144 vue + 144 react 组件子路径中的重组件与 38 个 core 子路径（F-2）。
  - [x] 可摇树性：core `./types`/`./theme` 子路径导出指向未产出文件且与主入口重复（F-3）、core `module` 字段指向不存在的 `index.mjs`（F-4）；vue/react `sideEffects` 白名单偏保守、src 无 CSS/副作用导入可评估收敛为 `false`（F-5）。
  - [x] 运行时性能：**Roadmap 原估"无 runtime 基准"已不成立**——`vitest bench` + `benchmarks/`（8 个 `.bench.ts`）+ `bench` 脚本 + `vitest.config.ts` benchmark 段均已就位；残留缺口是未接入 CI/门禁、无基线回归阈值（F-6）。
- 方法：`pnpm build` + `pnpm size` 实测 + 对照各包 `tsup.config.ts` / `package.json`（exports/sideEffects/module）+ `pnpm --filter @expcat/tigercat-core build` 复核子路径产物 + `grep` 核对副作用导入与 benchmark 配置。
- 产出：见下方「后续优化任务 → 来自任务 F」（F-0 核查结论、F-1～F-6 优化项）。

### 任务 G — 质量门禁·文档一致性扫描 ✅ 已扫描（2026-06-19）

- 目标路径：`.github/workflows/` + `scripts/*.mjs` + `skills/tigercat/references/`
- 维度清单：
  - [x] 覆盖率门槛：`test:coverage`=`vitest --coverage`（已装 `@vitest/coverage-v8`），但 `vitest.config.ts` `coverage` 段无 `thresholds`，且覆盖率从未进入 CI/任何 `quality:*`/`release:check`——既无阈值也不在门禁里跑（G-1）。
  - [x] 依赖 / CVE：无 `dependabot.yml`/renovate，CI 与脚本无 `pnpm audit`/CodeQL/Snyk/Trivy/OSV，依赖与代码安全扫描完全缺位（G-2）。
  - [x] breaking-change：`validate-api.mjs`（命名/双端配对/overlay/deprecated/文档覆盖）+ `check-public-types.mjs`（仅查 Props 类型导出存在性）+ `check-release-readiness.mjs`（版本/exports 存在性）皆为「当下一致性」校验，无与上一发布版的 API 快照对比，删除导出/删 prop/改签名不被发现（G-3，与 D-4 互补）。
  - [x] references 漂移：CI `git diff --exit-code` 仅校验 6 类生成物中的 `api-summary.md` 1 类，其余 ~21 个生成文件可静默漂移、且漏 prettier 步骤——`examples/composite.md` 已存在实测漂移（G-4，P1）；手维护指南 `performance.md` 漏基准、`cli.md` 表格损坏（G-5），`ssr.md`/`accessibility.md` 等抽查与源一致。
  - [x] 门禁触发与发布路径（附加发现）：CI/E2E 全部 `workflow_dispatch` 手动触发（无 push/PR 自动跑），publish 路径仅跑 lint+build——全量门禁不绑定任何自动/发布路径，靠本地 `pnpm quality:release`（G-6，确认是否有意）。
- 方法：审阅 `.github/workflows/`（6 个 workflow）+ `scripts/*.mjs` + `vitest.config.ts` + 干净树 `pnpm docs:api` 实测漂移 + `prettier --check` 生成物 + grep 安全/覆盖率/API 基线工具缺位核查。
- 产出：见下方「后续优化任务 → 来自任务 G」（G-0 核查结论、G-1～G-6 优化项）。

### 后续优化任务

由上述扫描任务执行后回填，每条按「公共约定」注明所属任务 / 模块、维度、问题、影响、建议方案与优先级（P0 阻塞 / P1 重要 / P2 改进）。

#### 来自任务 A — Core 包扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原估"core 约 440 处 `any`、散落 `typeof window` 直写"在 core 范围内不成立——该信号集中在 `vue` / `react` 组件层，应由任务 B / C 核查。core 自身类型与 SSR 守卫基本干净（见 A-0）。
>
> **进度（2026-06-19）**：任务 A 全部优化项已交付。非破坏性的 A-1 / A-2 / A-3 先行交付（A-1 表单内置校验消息本地化、A-2 timepicker/upload 默认标签收敛到 `locale-utils`、A-3 撤销 `shouldLoadMore` 的 `@deprecated`）；随后 A-4（移除废弃公共别名 `kanbanAddCardClasses`，改用 `taskBoardAddCardClasses`）与 A-5（core 内部 `theme/` 目录重命名为 `theme-runtime/`，对外导出符号不变）作为破坏性变更随下一个允许破坏的版本一并交付，详见 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 与 [MIGRATION.md](MIGRATION.md)。按惯例已交付项移交 CHANGELOG，本节不再保留 A-1～A-5 细目，仅保留 A-0 核查结论。

- [x] **A-0 已核查、core 范围内无需处理**
  - 类型安全：`packages/core/src` 真实 `any` 类型用法 **0** 处（grep 命中的 24 处均为注释里的英文单词或 `'any'` 字符串字面量），`@ts-ignore` / `@ts-expect-error` **0** 处 → `any` 审计移交任务 B/C。
  - SSR：core 已统一使用 `env.ts` 的 `isBrowser()`；残留 `typeof window/document` 仅为 `matchMedia`（`animation.ts`、`transition.ts`）与 `queryCommandState`（`rich-text-engine.ts`）特性检测，且都在 `isBrowser()` 之后，属合理用法 → 散落直写问题移交任务 B/C。

#### 来自任务 B — Vue 组件包扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原估"组件层散落 `typeof window` 直写 + 大量 `any`"在 Vue 范围内不成立——Vue src 类型位 `any` 实际 0 处，window/document 抽样核查也无 SSR 崩溃风险（见 B-0）。真正的高优问题是 **i18n 未接入**（B-1）与 **约 1,500 LOC 死 composable**（B-3）。

> **进度（2026-06-19）**：B-1（硬编码 UI 文案接入 TigerLocale）与 B-3（删除未使用 composable）已交付，按惯例移交 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`，本节不再保留其细目。B-1 的 core 前置（`TigerLocaleCommon` 新增 `searchPlaceholder` / `clearText`）与 React 镜像 C-1 一并跨端交付；原 B-1 清单中的 `Signature.ts:48` / `InfiniteScroll.ts:32` / `Spotlight.ts:85` 实为带英文默认值的 prop（非 render 硬编码），并入 B-2 处理。
>
> **进度（2026-06-19，续）**：余项 B-2 / B-4 / B-5 / B-6 已全部交付，按惯例移交 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`，本节不再保留 B-2 ～ B-6 细目，仅保留 B-0 核查结论与 B-6 评估结论。**B-2**（英文 prop 默认值回退 ConfigProvider locale，连同 React 镜像 **C-2** 跨端一并交付）；**B-4**（`ConfigProvider`/`Signature`/`ImageAnnotation` 内联 `typeof` 守卫统一为 `isBrowser()`）；**B-5**（收窄 `Image`/`QRCode`/`Mentions`/`Alert` 等冗余断言与 `Tree`/`CommentThread`/`Menu` 的 `node.children!` post-check，React 镜像同批）；**B-6** 见下方评估结论。

- [x] **B-6 复杂度热点评估结论（已交付下沉前置）**
  - 评估：Menu / Tree / Select 的框架无关逻辑（键盘导航 `menu-utils`/`picker-utils`、过滤、`getVisibleTreeItems` flatten）**早已下沉 core**，无可再抽；TimePicker 为列表生成式（`generateHours/Minutes/Seconds`）、无算术可抽。唯一 Vue 端内联且应下沉的是 **DatePicker 的日期算术**——`date-utils` 原缺 `addDays`/`addMonths`/`addYears`，双端各写一份。
  - 已交付：core `date-utils` 新增 `addDays`/`addMonths`/`addYears`（含单测），双端 DatePicker 改用之（移除内联 `addDays` 与手写月/年 wraparound）。更大范围的「键盘导航 composable/hook 跨端包装」仍属 **D-1**（见下方），本项只交付其 `date-utils` 前置。

- [x] **B-0 已核查、Vue 范围内无需处理**
  - 类型安全：`packages/vue/src` 类型位 `any` **0** 处（唯一类型位为 `Table.ts:160` 的 `new Map<string, any>()`，值类型可收窄但风险极低；`CronEditor.ts` 的 `'any'` 为业务字面量非类型），`@ts-ignore`/`@ts-expect-error` **0** 处 → A-0 移交的 `any` 审计在 Vue 侧基本干净，React 侧移交任务 C。
  - SSR：抽样核查 window/document 高密度文件（Affix/Tour/Modal/Drawer/TimePicker/Slider/ImageCropper/ChartTooltip/ConfigProvider 等），未发现会在 SSR setup/render 阶段同步执行的访问 → 无 SSR 崩溃风险，仅守卫写法不统一（详见 B-4）。

#### 来自任务 C — React 组件包扫描（2026-06-19）

> **扫描结论修正**：与任务 B 一致——Roadmap 原列的类型安全（`any`）与 SSR 直写在 React 范围内同样基本不成立：React src 类型位 `any` 仅 1 处、`@ts-ignore` 0 处，window/document 抽样均在事件/`useEffect` 内（见 C-0）。点名的 FloatButton/Tour/ChartTooltip 已正确 `isBrowser()` 守卫，真正缺显式守卫仅 ImagePreview（C-3）。React 与 Vue 共用 `TigerLocale`/`mergeTigerLocale`/ConfigProvider 体系，但仅 10 个组件消费，搜索/空态类仍硬编码（C-1/C-2，与 B-1/B-2 同源）。

> **进度（2026-06-19）**：C-1（内部搜索框 `placeholder` 硬编码）已随 Vue B-1 跨端一并交付——6 个 React 搜索框（Select/Tree/TreeSelect/Transfer/Cascader/FileManager）改读 `mergedLocale.common.searchPlaceholder` 并新增 `locale` prop，共享 core `TigerLocaleCommon.searchPlaceholder`，按惯例移交 [CHANGELOG.md](../CHANGELOG.md)。
>
> **进度（2026-06-19，续）**：**C-2** 已随 Vue B-2 跨端一并交付（`List`/`VirtualTable`/`Tree`/`Transfer`/`TreeSelect` 空态、`InfiniteScroll` 加载、`Signature` 清除、`Spotlight` placeholder/空态、`Cascader` 空态改读 `mergedLocale.common.*`；`Tour` 的 next/prev/finish 回退 `formWizard.*`、`NumberKeyboard` 的 confirm 回退 `common.okText`、`Loading` 的 aria 回退 `common.loadingText`；`Select`/`Cascader`/`TreeSelect` 的主 `placeholder`（'Select an option'/'Please select'）因 `common` 无对应 key 暂不改，留待后续视需要新增 key）；C-0 注记的 React 侧非空断言已随 **B-5** 同批收敛（`Image`/`Tree`/`CommentThread` 等）。均移交 [CHANGELOG.md](../CHANGELOG.md)。余项 C-3 / C-4 / C-5 仍待推进。

- [ ] **C-3 ImagePreview 门户挂载缺显式 SSR 守卫**（P2）
  - 维度：SSR guard｜模块：`ImagePreview.tsx:271`（vs Tour/FloatButton/ChartTooltip/`utils/overlay.ts` 已 `isBrowser()` 守卫）
  - 问题：`createPortal(..., document.body)` 仅由 `if (!isOpen || !images.length) return null`（:267）间接保护，未显式 `isBrowser()`；同类门户组件均已显式守卫，`utils/overlay.ts` 还提供了现成的 `renderBodyPortal`（内含 `isBrowser()`）。其余 window/document 访问（Modal/Drawer/Affix/DatePicker/Select/Slider 等）均在事件处理器或 `useEffect` 内，非渲染期，无 SSR 崩溃；`Descriptions.tsx` 用 `getServerSnapshot` 正确兜底。
  - 影响：当前若 `isOpen` 默认 false 则安全，但隐式依赖状态而非显式守卫，与既有门户模式不一致；属一致性问题（呼应 B-4）。
  - 建议：ImagePreview 改用 `overlay.ts` 的 `renderBodyPortal`，或 portal 前补 `if (!isBrowser()) return null`，统一门户 SSR 守卫。

- [ ] **C-4 `useControlledState` 能力不足、受控样板大面积手写重复**（P2）
  - 维度：hooks 复用｜模块：`hooks/useControlledState.ts` ↔ ~29 个组件
  - 问题：`useControlledState` 返回 `[value, setInternal, isControlled]`，其 setter 只写内部 state、不合并 `onChange`，故需回调透传的组件（`Input.tsx:120/138`、`Checkbox.tsx:80/89`、InputNumber/Slider/Select/Tabs/Collapse/Dropdown/Menu/DatePicker/TimePicker… 约 29 个）仍手写 `const isControlled = value !== undefined` + `if (!isControlled) setInternal(...)` + `onChange?.()`；该 hook 实际仅 5 个低复杂度组件（MarkdownEditor/CheckboxGroup/RichTextEditor/RadioGroup/Textarea）采用。
  - 影响：受控/非受控模式逻辑在数十组件重复，初值同步与边界处理易漂移；hook「已抽取」却覆盖面小。
  - 建议：将 `useControlledState` 升级为带回调透传版（参照 Ant Design `useMergedState` / Radix `useControllableState`：`[value, setValue]`，`setValue` 在非受控写内部并始终触发 `onChange`），再分批迁移手写组件。React `hooks/` 与 Vue `composables/` 的命名/职责对齐及跨端去重归任务 D（呼应 B-3 parity 注）。

- [ ] **C-5 复杂度热点：Menu/Tree/DatePicker/TimePicker 单文件巨石**（P2）
  - 维度：复杂度热点｜模块：`Menu.tsx`(914)、`Tree.tsx`(897)、`DatePicker.tsx`(847)、`TimePicker.tsx`(775)、`Select.tsx`(666)
  - 问题：`Table` 已拆为 `Table/`（`state.ts` + `render-header/body/pagination/summary` + `types/icons`），是 React 端已落地的解耦范式；而上述组件仍单文件，渲染/状态/键盘逻辑耦合。
  - 影响：大文件维护成本高、回归面大，与 Vue 同类逻辑各自内联易漂移（Vue 对应文件更大，见 B-6）。
  - 建议：按 `Table/` 模式拆出 `state.ts` 与 render-\* 子模块；框架无关纯逻辑（键盘导航、日期/时间计算、节点 flatten/过滤）下沉 `core/src/utils/` 经 hooks 包装供双端共享——跨端下沉执行归属任务 D。

- [x] **C-0 已核查、修正与移交回收**
  - 类型安全（A-0/B-0 移交）：`packages/react/src` 类型位 `any` 仅 **1** 处（`Table.tsx:267` `new Map<string, any>()`，与 Vue `Table.ts:160` 镜像，风险极低），`@ts-ignore`/`@ts-expect-error` **0** 处 → React 类型层基本干净。非空断言约 **17** 处（与 Vue B-5 的 21 处镜像，多为 defaulted prop 的 `props.X!`），低优先级，宜随 B-5 同批收敛。
  - SSR：window/document 访问绝大多数位于事件处理器与 `useEffect` 内（仅浏览器执行）；点名的 FloatButton/Tour/ChartTooltip 及 `overlay.ts` 门户均已 `isBrowser()` 守卫，`Descriptions.tsx` 用 `getServerSnapshot` 正确兜底 → 真正缺显式守卫仅 ImagePreview（→C-3）。
  - i18n：React 与 Vue 共用 `TigerLocale`/`mergeTigerLocale`/ConfigProvider，仅 10 组件消费（Pagination/Drawer/DataTableWithToolbar/Upload/Table/TaskBoard/Modal/FormWizard/ConfigProvider/render-pagination）；搜索/空态类未接入（→C-1/C-2）。

#### 来自任务 D — 跨框架一致性扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原维度清单举例的「类名生成、过滤」在双端早已下沉 core（`get*Classes` / `filter*` / `flatten*`），无需再抽；真正系统性的跨端重复只剩 **键盘导航**（D-1）。`api:validate` / `types:check` 全绿、组件文件一一对应、`open` 三件套全部成立——双端共用 `core/src/types/*.ts` 的 Props 类型使结构性 prop parity 有保证，剩余分歧集中在 **事件/回调命名与对称**（D-3），且现有 validate-api 仅强校验 `open` 一项（D-4）。本任务承接 B-3/B-6/C-4/C-5 标注的「跨端去重/下沉执行归属任务 D」。

- [ ] **D-1 键盘导航逻辑双端各自内联、未下沉 core**（P1）
  - 维度：重复逻辑下沉｜模块：`Menu`（vue `Menu.ts:533/996/1050`、react `Menu.tsx:348/687/739`）、`Tree`（vue `Tree.ts:738-774`、react `Tree.tsx:598-634`）、`DatePicker`（vue `DatePicker.ts:350` `addDays`、react `DatePicker.tsx:306`）、`TimePicker`（vue `TimePicker.ts:441/447`、react `TimePicker.tsx:305/311`）、`Mentions`（vue `Mentions.ts:81-87`、react `Mentions.tsx:87-95`）
  - 问题：core 已有 `utils/picker-utils.ts`（`findFirst/Last/NextEnabledIndex` + `getPickerNavigationIndex` + ARIA helper），Select/AutoComplete/Spotlight 已接入证明范式可用；但上述 5 组件均**不** import picker-utils，各自内联实现方向键导航。Tree 仅 flatten（`getVisibleTreeItems`）下沉，导航 index 走查与 ArrowLeft/Right 展开收起语义双端重复；DatePicker/Calendar 的 `addDays`、月/年步进等日期算术 `date-utils` 中**不存在**，双端各写一份；Mentions 取模环绕导航双端各写。
  - 影响：同一交互算法跨 2 框架 × 5 组件各存一份，键盘行为易在单端被改而漂移（a11y 回归面大）。与 B-6/C-5 同源，是其「跨端下沉执行归属任务 D」的落点。
  - 建议：分两类下沉到 `core/src/utils/`——(a) 列表型（Menu/Tree/Mentions）复用/扩展 `picker-utils` 的 enabled-index 走查，Tree 的展开收起语义抽 tree 专用 nav helper；(b) DatePicker/TimePicker 的日期/时间算术（`addDays`、月/年步进、时分秒环绕）抽入 `date-utils`/`time-utils`，双端经 hooks/composable 包装共享。属优化、非缺陷。
  - **前置已交付（2026-06-19，随 B-6）**：`date-utils` 已新增 `addDays`/`addMonths`/`addYears`，双端 DatePicker 的内联 `addDays` 与手写月/年步进已改用之（见 [CHANGELOG.md](../CHANGELOG.md)）。余下 (a) 列表型键盘导航与 TimePicker 时分秒环绕的 composable/hook 跨端包装仍待本任务推进。

- [ ] **D-2 命令式 API 与显示/解析 helper 双端重复**（P2）
  - 维度：重复逻辑下沉｜模块：`Message`/`Notification` 的 `getNextInstanceId`+`normalizeOptions`（vue `Message.ts:61/204`、react `Message.tsx:44/291`，Notification 各一份）、`InputNumber` 的 `toDisplayValue`/`parseValue`（vue/react 各一份，react `InputNumber.tsx:85/95`）
  - 问题：core `message-utils`/`notification-utils` 只沉淀了 class/icon/位置，未含实例自增 id 与 options 归一化；Message 与 Notification 双端各自内联 `getNextInstanceId`（纯计数器）与 `normalizeOptions`（`string | options → config`），共约 4 份近似实现。InputNumber 的 core util 已有 `clampValue`/`stepValue`/`formatPrecision`，但显示格式化与字符串解析仍双端内联。
  - 影响：纯逻辑重复，归一化规则改动需多处同步、易漂移。
  - 建议：`getNextInstanceId`/`normalizeOptions` 抽入 `message-utils`/`notification-utils`（或共用一个 instance-id 计数器工具）；InputNumber `toDisplayValue`/`parseValue` 评估并入 `input-number-utils`（依赖 precision/formatter props，以参数传入）。低风险。

- [ ] **D-3 受控量与事件回调跨端命名/对称不一致**（P2）
  - 维度：API parity & 命名 / 受控事件对称｜模块：`ImageViewer`、`CommentThread`、`Spotlight`、`DataTableWithToolbar`、`Signature`
  - 问题（逐项）：
    - ImageViewer：双端共用 `currentIndex` prop，Vue 发 `update:currentIndex`（可 `v-model:currentIndex`），React 回调却命名 `onIndexChange`（丢了 current）——应为 `onCurrentIndexChange` 才与 prop 名对齐。
    - CommentThread：Vue emit `expand-change`，React 回调 `onExpandedChange`（expand vs expanded 时态不一致），应统一。
    - Spotlight：Vue 同时 emit `open-change` 与冗余 `close`；React 仅 `onOpenChange`（+`onEscape`）。要么 Vue 去掉 `close`，要么 React 补 `onClose`。
    - DataTableWithToolbar：Vue 暴露专门的 `selection-change` 事件（转发内层 Table 选择）；React 无顶层 `onSelectionChange`，需用户自行接 `tableProps.rowSelection.onChange`——选择 API 不对称。
    - Signature：Vue emit 专门的 `clear` 事件；React 仅有 ref 上的命令式 `clear()` 与 `onChange`，无 `onClear` prop。
  - 影响：公共 API 命名/能力跨端不一致，迁移与文档对照成本高；均落在现有 `validate-api` 规则覆盖不到的盲区（见 D-4）。
  - 建议：以「prop 名 → Vue `update:<prop>` / React `on<Prop>Change`」为准则统一上述命名；补齐缺失回调（Signature `onClear`、DataTableWithToolbar `onSelectionChange`，或文档明确改用嵌套回调）；破坏性改名走 [MIGRATION.md](MIGRATION.md)。属一致性打磨、非缺陷。

- [ ] **D-4 validate-api 的 parity/对称规则覆盖面窄**（P2）
  - 维度：API parity & 命名｜模块：`scripts/validate-api.mjs`
  - 问题：现有 overlay 规则只强校验 `open`→`update:open`/`onOpenChange` 一组；对其余受控量（`currentIndex`/`activeKey`/`selectedKeys`/`expandedKeys`/`current`/`query`…）既不校验 Vue `update:X` 与 React 回调是否成对，也不校验两端命名是否一致——D-3 的所有不一致正是从此盲区漏出。
  - 影响：跨端 API 漂移缺自动护栏，靠人工脚本对照（如本次扫描）才能发现。
  - 建议：为 validate-api 增补「受控量 parity 表」：从 core Props 提取候选受控 prop，校验 (a) Vue 存在 `update:<prop>`、(b) React 存在 `on<Prop>Change`（或登记的等价回调）、(c) 两端命名一致；以白名单登记有意的非对称（如 Signature/Spotlight）。属任务 G「breaking-change 自动检测」的近邻，可一并规划。

- [x] **D-0 已核查、双端基线一致**
  - 基线：`pnpm api:validate` 0 问题、`pnpm types:check` 全部公共 Props 类型已导出；cross-framework 组件文件 Vue↔React 一一对应（无 `missing-vue`/`missing-react`），`open`/`update:open`/`onOpenChange` 三件套全量成立。
  - 结构性 parity：双端组件 `extends` 同一份 `core/src/types/*.ts` Props 类型，shared prop 的存在性与类型有保证，无需逐 prop 对照——真正分歧在事件/回调层（→D-3）。
  - 方法论提示：同名 helper 双端并存多为对 core util 的**薄包装**（如 FormWizard `findNextUnskipped`→core `findNextUnskippedStep`、Select `find*EnabledIndex`→`picker-utils`），非重复实现；判定重复须确认「未 import core 且 core 无对应物」，避免误报（D-1/D-2 均已据此确认）。

#### 来自任务 E — CLI 包扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原写 `templates/`，实际模板实现是 `packages/cli/src/templates/vue3.ts` / `react.ts` 的内联文件表；Tailwind v4 模板接入本身已对齐，但 CLI 发布包、doctor 深度与命令边界仍有可优化项。

> **进度（2026-06-19）**：E-1 已交付，按惯例移交 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`，本节不再保留其细目。`generate.ts` 补上 `logWarn` 导入修复已存在文件路径的 `ReferenceError` 崩溃，补 `tests/core/cli.spec.ts`「目标文件已存在 → 跳过且不崩溃」用例（共 60 例通过），并以 `pnpm --filter @expcat/tigercat-cli exec tsc --noEmit` 纳入源级类型校验。余项 E-2 / E-3 / E-4 / E-5 仍待推进。

- [ ] **E-2 CLI 发布包子路径契约与测试预期不一致**（P1）
  - 维度：发布机制/exports｜模块：`packages/cli/package.json`、`tests/core/cli.spec.ts`
  - 问题：测试通过 Vitest alias 直接 import `@expcat/tigercat-cli/templates/vue3`、`commands/create`、`utils/fs`、`constants` 等源内子路径；但 CLI package 未声明 `exports`，`pnpm pack` 产物只包含 `dist/index.js`、`dist/index.d.ts`、`package.json`、`README.md`、`LICENSE`。同时 package `files` 列出 `"templates"`，仓库中却无 `packages/cli/templates/` 目录。
  - 影响：测试环境暗示这些子路径可用，发布包实际只稳定提供 bin/root entry；未来若用户或内部脚本依赖子路径，会在发布后解析失败。`files: ["templates"]` 属过期发布配置，增加维护误导。
  - 建议：明确 CLI 公共 API 边界。若子路径需要公开，调整 tsup 多入口与 package `exports` 并在 pack smoke 中验证；若仅测试内部逻辑，则改用相对源码 import，并从 `files` 中移除不存在的 `templates`。

- [ ] **E-3 `create` / `add` / `playground` 边界输入处理不够明确**（P2）
  - 维度：命令健壮性｜模块：`commands/create.ts`、`commands/add.ts`、`commands/playground.ts`
  - 问题：`create 'Bad Name' --template react --dry-run` 会继续生成 `package.json.name = "Bad Name"`，该名称不是合法 npm package name；`create` 在非空目录提示 "Remove existing files and continue?"，实际只覆盖模板同名文件、不清理旧文件；`add --framework <invalid>` 会静默回退自动检测；`create/playground --template <invalid>` 会进入交互 prompt，在非交互环境不够直观。
  - 影响：生成项目可能安装失败或携带旧文件污染；CI/脚本调用时错误参数反馈不稳定，用户难以判断到底使用了哪个 framework/template。
  - 建议：引入统一参数校验：项目名按 npm package name 规则校验或规范化；无效 framework/template 直接失败并列出可选值；非空目录文案改为「overwrite template files」或真正清理；补充对应 dry-run / 非交互单测。

- [ ] **E-4 `doctor` 版本与 exports 诊断偏浅**（P2）
  - 维度：doctor 诊断覆盖｜模块：`commands/doctor.ts`
  - 问题：doctor 已检查 package 可读、Node/pnpm、Tailwind v4 与 `@tailwindcss/vite`、Tigercat peer presence、模板依赖 presence。但 Vue/React/Vite/TypeScript/Vite plugin 只查存在、不查版本范围；`VERSION_COMPATIBILITY_MATRIX` 是展示信息，不实际校验 React `^19` / Vue `^3` 等范围；也未检测已安装 `@expcat/tigercat-core` 是否可解析 `./tailwind/modern`、`./tokens.css`、locale 等关键 exports。
  - 影响：过旧或不兼容的 framework/toolchain 可能被 doctor 判为 pass；Tailwind plugin/core exports 损坏时，用户要到 build 阶段才发现。
  - 建议：将 compatibility matrix 从静态详情升级为实际检查；对 framework/toolchain 做 semver 范围校验；可选地用 `createRequire(...).resolve()` 检查关键 core exports/importability，并把失败建议指向升级 Tigercat 或修复依赖安装。

- [ ] **E-5 模板工具链版本常量仍需人工同步**（P2）
  - 维度：版本同步｜模块：`constants.ts`、`pnpm-workspace.yaml`、`scripts/sync-version.mjs`、`scripts/check-release-readiness.mjs`
  - 问题：`sync-version.mjs` 与 `release:check` 已守护 `CLI_VERSION` 和 `TEMPLATE_VERSIONS.tigercat`；CLI 单测只强校验 Tailwind v4 两个版本与 workspace catalog 对齐。`TEMPLATE_VERSIONS` 中 Vue/React/TypeScript/Vite/`@vitejs/plugin-vue`/types 等仍是硬编码重复；`@vitejs/plugin-react`、`@vue/tsconfig`、`vue-tsc` 在 example 与 CLI 常量间也靠人工保持一致（部分不在 catalog）。
  - 影响：依赖升级时模板版本容易漂移，生成项目与 example/workspace 基线不一致；doctor 的 template compatibility 也会跟着使用过期基线。
  - 建议：为所有可 catalog 化的模板依赖补 catalog 对齐检查，或让 CLI 模板版本生成自单一清单；把 `@vitejs/plugin-react` 等未入 catalog 的共享模板依赖纳入 catalog 或 release readiness 检查。

- [x] **E-0 已核查、模板主路径与版本主线无需处理**
  - 模板对齐：`src/templates/vue3.ts` 与 `src/templates/react.ts` 均使用 `@tailwindcss/vite`，CSS 使用 `@import "tailwindcss";` + `@plugin "@expcat/tigercat-core/tailwind/modern";`，与持续守护规则一致。
  - 版本主线：`packages/cli/package.json`、root package、`CLI_VERSION`、`TEMPLATE_VERSIONS.tigercat` 均为 `1.3.4`；`scripts/sync-version.mjs` 和 `scripts/check-release-readiness.mjs` 已覆盖该主线。
  - 验证：`pnpm --filter @expcat/tigercat-cli build` 通过；`pnpm vitest run tests/core/cli.spec.ts` 通过（58 tests）；`pnpm pack` 显示 bin/root 发布主路径存在。

#### 来自任务 F — 构建·体积·性能扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原估"目前有 bundle size 无 runtime 基准、评估是否引入 `vitest bench`"已过时——`vitest bench` 体系（`bench` 脚本 + `vitest.config.ts` benchmark 段 + `benchmarks/` 8 个 `.bench.ts`）早已落地（见 F-6）。本次扫描真正的高优发现是 **`pnpm size` 5 项预算全部超限、卡死 CI/发布门禁**（F-1）与 **core `./types`/`./theme` 子路径导出失效**（F-3）。

> **进度（2026-06-19）**：F-1 / F-2 / F-3 / F-4 已交付，按惯例移交 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`，本节不再保留其细目，仅保留 F-0 核查结论与未完成的 F-5 / F-6。**F-1**：已核对 `size` 增量来自 MarkdownEditor、Table 列显隐与多组件 i18n 等新功能源码而非依赖膨胀（运行时依赖仅 `@floating-ui/dom`），按实测 +~10% 余量重设 5 项预算（Core 118 / Vue 284 / React 320 / Vue Button 22 / React Button 20 kB）；**F-2**：新增 Menu/DatePicker/Table/Tree/TimePicker 双端子路径与 core `tailwind/modern`、`locales/zh-CN`、`icons/common` 子路径体积护栏——二者使 `pnpm size` 转绿、解除 v1.3.4 发布阻塞。**F-3**：移除失效且冗余的 `./types`/`./theme` 子路径导出（内容已在主入口、无消费者），同步从 `check-release-readiness.mjs` 必需导出清单移除；**F-4**：`module` 字段修正为实际 ESM 产物 `./dist/index.js`。

- [ ] **F-5 vue/react `sideEffects` 白名单可评估收敛**（P2）
  - 维度：可摇树性/sideEffects｜模块：`packages/vue/package.json`、`packages/react/package.json`（`sideEffects`）
  - 问题：两端将 `dist/chunk-*` 与 `dist/components/*` 标为有副作用（allowlist 形式）。但 vue/react `src` 无任何 `.css`/副作用 import（已 grep 确认），组件为 headless（Tailwind class，无运行时样式注入），allowlist 可能偏保守。
  - 影响：低——可能抑制从 barrel import 时对未用组件/chunk 的剔除；当前 `splitting: true` 产物较多，需实测确认是否真有副作用 chunk。
  - 建议：评估改为 `sideEffects: false`（与 core 一致），用 example build / `pnpm size` 对比 barrel-import 产物体积验证无回归；若某些 splitting chunk 确含副作用则保留精确 allowlist。
- [ ] **F-6 运行时基准已落地但未接入门禁、无回归阈值**（P2）
  - 维度：运行时性能｜模块：`benchmarks/*.bench.ts`、`vitest.config.ts`、root `bench` 脚本、`.github/workflows/`
  - 问题：Roadmap 原估"无 runtime 基准"已不成立——`vitest bench`（`benchmark.include = benchmarks/**/*.bench.ts`）、`bench` 脚本、8 个基准（core-utils/table-large-data/virtual-table/tree-virtualization/chart-svg-generation/descriptions/form-validation/virtual-scroll-fps）均已存在。残留缺口：`bench` 未接入任何 CI/质量门禁（仅手工跑），无基线/回归阈值，结果不留存对比。
  - 影响：性能回归无自动护栏；基准存在但价值未被门禁兑现，易随代码演进腐化。
  - 建议：评估将 `bench` 纳入 CI（非阻塞 job，或带阈值的回归比较，如 `vitest bench --outputJson` + 基线对比），或在 `skills/tigercat/references/` 明确其为手工性能回归工具与运行方式（CI 接入可与任务 G 协同）。

- [x] **F-0 已核查、构建主线无需处理**
  - 体积预算：扫描时 `pnpm size` 5 项均超限，现已按 F-1/F-2 重设预算并扩展覆盖、`pnpm size` 转绿（见上方进度与 [CHANGELOG.md](../CHANGELOG.md)）；`pnpm size:check`（`size-limit --json`）可生成机器可读结果供阈值设定。
  - tsup 配置：core `format:['cjs','esm']` + `type:module` → `.js`(ESM)/`.cjs`(CJS)，与 `exports` 主入口 `import/require` 一致（`module` 字段曾指向不存在的 `.mjs`，已随 F-4 修正为 `./dist/index.js`）；vue/react `splitting:true` + `external` 框架、core `splitting:false` 多入口（locales/icons 等）配置合理；cli `treeshake:true` + shebang banner 正常。
  - 可摇树性：core `sideEffects:false` ✓；core 子路径导出目标文件均存在、`import`+`require` 双条件齐全（原失效冗余的 `./types`、`./theme` 已随 F-3 移除）。
  - 运行时性能：`vitest bench` 体系已落地（见 F-6），非"缺口"。

#### 来自任务 G — 质量门禁·文档一致性扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原维度清单把 references 漂移写作"已有 `git diff` 校验"——实测此闸只覆盖 `shared/api-summary.md` 一个文件，是 `generate-api-docs.mjs` 6 类生成物里的 1 类，其余 ~21 个生成文件无任何漂移护栏，且 `examples/composite.md` 当前已漂移（G-4，本任务唯一 P1）。覆盖率门槛、依赖/CVE、breaking-change 三项均为名副其实的空白（G-1/G-2/G-3）。另发现全量质量门禁不绑定任何自动触发或发布路径（G-6，附加项）。

- [ ] **G-1 无覆盖率门禁、无阈值**（P2）
  - 维度：覆盖率门槛｜模块：`vitest.config.ts`、`.github/workflows/ci.yml`、`package.json`（`test:coverage`）
  - 问题：`test:coverage`=`vitest --coverage`，`@vitest/coverage-v8` 已装，`vitest.config.ts` 的 `coverage` 段只配了 `provider`/`reporter`/`exclude`，**无 `thresholds`**；且覆盖率从未进入 `ci.yml`（无覆盖率步骤）、不在任何 `quality:*` 门禁、不在 `release:check`。即覆盖率既无阈值也根本不在门禁里跑。
  - 影响：测试覆盖回退（删测、加未测代码）无任何护栏，覆盖率纯靠本地手工查看。
  - 建议：先 `pnpm test:coverage` 跑出基线，在 `vitest.config.ts` `coverage.thresholds` 设保守全局阈值（lines/functions/statements/branches，从实测略低处起步避免一上来就红），并把覆盖率接入 CI（可将 `pnpm test` 合并为 `vitest run --coverage`）。

- [ ] **G-2 缺依赖/CVE 安全扫描**（P2）
  - 维度：依赖 / CVE｜模块：`.github/`（无 dependabot/renovate）、`.github/workflows/`、`scripts/`
  - 问题：仓库无 `dependabot.yml`、无 renovate 配置；CI 与所有脚本中无 `pnpm audit`/CodeQL/Snyk/Trivy/OSV 任何依赖或代码安全扫描（已 grep 全量核查）。
  - 影响：直接/传递依赖出现已知 CVE 时无自动告警；依赖升级与安全补丁全靠人工。
  - 建议：低成本择一/组合引入——(a) `.github/dependabot.yml`（npm 周更 + GitHub Actions 版本更新）；(b) CI 增 `pnpm audit --audit-level=high`（必要时配豁免 allowlist）；(c) 启用 GitHub CodeQL。建议至少 dependabot + 一个 audit 门禁。

- [ ] **G-3 无公共 API 基线对比、breaking-change 不被自动发现**（P2）
  - 维度：breaking-change｜模块：`scripts/validate-api.mjs`、`scripts/check-public-types.mjs`、`scripts/check-release-readiness.mjs`
  - 问题：现有三道闸只做「当下一致性」校验——`validate-api.mjs` 查命名/双端文件配对/overlay `open` 三件套/deprecated 用法/LLM 文档覆盖；`check-public-types.mjs` 仅查每个组件 `Props` 类型**是否被导出**（存在性，不查形状）；`check-release-readiness.mjs` 查版本对齐/必需 exports 存在/文档版本号。**无任何与上一发布版的 API 快照对比**（无 `@microsoft/api-extractor`、无提交的 api report、无 publint/attw），删除导出、删 prop、改 prop/签名类型等真正的 breaking change 不会被自动发现，只能靠人工记得写进 [MIGRATION.md](MIGRATION.md)。
  - 影响：破坏性变更漏标会静默发布；与 D-4（扩展 validate-api 受控量 parity，防双端漂移）互补但层次不同，本项防版本间回归。
  - 建议：引入公共 API 基线——(a) 用 `@microsoft/api-extractor` 为各包产出 `.api.md` 报告并提交，CI `git diff` 校验（与 references 漂移同范式，亦修复 G-4 的可复用模板）；或 (b) 轻量方案：扩展 `check-public-types.mjs` 落盘「导出符号 + prop 列表」快照 JSON，CI 比对缺失/改名报警。与 D-4 的 parity 表一并规划。

- [ ] **G-4 references 漂移闸只覆盖 1/6 生成物且漏 prettier 步骤**（P1）
  - 维度：references 漂移｜模块：`.github/workflows/ci.yml:48`、`scripts/generate-api-docs.mjs`
  - 问题：`generate-api-docs.mjs` 实际生成 6 类产物——`shared/api-summary.md`、`component-index.md`、`shared/props/*.md`（9）、`examples/*.md`（9）、`vue/index.md`、`react/index.md`（共 ~21 文件）；但 CI 仅 `git diff --exit-code skills/tigercat/references/shared/api-summary.md` 校验其中 1 个，其余 ~21 个可静默漂移。实测：`git checkout` 干净树后 `pnpm docs:api` 会让 `examples/composite.md` 产生 diff（提交版是 prettier 对齐过的表格，而生成器原始输出对 `composite.md`/`shared/props/basic.md` 并非 prettier-clean）；CI 这条 check 现在没红，仅因 `api-summary.md` 恰好 prettier-stable。
  - 影响：源类型变更后只重生成 `api-summary.md` 即可过闸，其余生成文档（组件路由表、props、examples、双端 index）可与源脱节而 CI 不报；当前 `composite.md` 已存在（表格 padding 级别的）漂移，证明闸门失效。
  - 建议：把 drift 校验扩展到整个生成目录并补 prettier 步骤——CI 改为 `pnpm docs:api && pnpm exec prettier --write skills/tigercat/references && git diff --exit-code skills/tigercat/references`（或在 `generate-api-docs.mjs` 末尾内置 prettier 格式化使生成物即 prettier-clean，再 `git diff` 全目录）；顺带把当前 `composite.md` 漂移重生成并提交归零。

- [ ] **G-5 手维护指南时效：performance.md 漏基准、cli.md 表格损坏**（P2）
  - 维度：references 漂移（手维护指南）｜模块：`skills/tigercat/references/performance.md`、`skills/tigercat/references/cli.md`
  - 问题：
    - `performance.md` frontmatter 自称含「performance validation」，正文却只提 `pnpm build` + `pnpm size`，未提及 F-6 已确认存在的运行时基准设施（`pnpm bench` / `benchmarks/` 8 个 `.bench.ts` / `vitest.config.ts` benchmark 段）。
    - `cli.md` 命令表（行 10–18）多个单元格含**未转义的 `|`**（`--template vue3 | react`、`vue3 | react | both`），导致 Markdown 表格列错位、渲染损坏；该文件为手维护，无 lint/格式检查捕获。
    - 其余手维护指南抽查与源一致——`ssr.md` 的 `isBrowser()` 指南与 B-4/C-3 结论吻合，`accessibility.md`/`theme.md`/`tokens.md`/`i18n.md` 无明显漂移，无需处理。
  - 影响：performance.md 让使用者/agent 不知道有基准工具；cli.md 表格在渲染端错乱，降低文档可信度。
  - 建议：performance.md 补一节基准（`pnpm bench` + `benchmarks/` 说明，呼应 F-6）；cli.md 把选项内 `|` 转义为 `\|` 或改用「vue3 或 react」文字；可选地把 `pnpm exec prettier --check "skills/**/*.md"` 纳入 lint 顺带覆盖手维护指南（与 G-4 的生成物 prettier 一致性协同）。

- [ ] **G-6 质量门禁不绑定自动触发或发布路径**（P2，确认是否有意）
  - 维度：门禁触发（附加发现）｜模块：`.github/workflows/{ci,e2e,publish,publish-on-tag,deploy,create-release-tags}.yml`
  - 问题：`ci.yml`（lint→build→test→test:validate→docs:api+drift→api:validate→test:a11y→size 全量闸）与 `e2e.yml` 均为 `workflow_dispatch` 手动触发，无 `push`/`pull_request`；发布路径 `publish-on-tag.yml` 仅 install+`pnpm release`（=build+changeset publish）、`publish.yml` 仅 lint+build，**都不跑 test/a11y/size/api:validate/release:check**。即全量质量门禁不绑定任何自动事件或发布流程，是否执行完全取决于维护者本地是否跑了 `pnpm quality:release`。
  - 影响：回归可落 main 而无自动验证；发布也不强制经过完整门禁，靠人工纪律兜底。对单维护者可能是有意的 Actions 成本权衡（呼应记忆「Tigercat 发布机制」），但与「质量门禁」目标存在缺口。
  - 建议：确认触发策略意图——若希望护栏自动生效，至少给 `ci.yml` 加 `pull_request`/`push` 触发，或在 `publish-on-tag.yml` 发布前串入 `pnpm quality:release`（或其子集）作为发布前置闸；若确为有意手动，建议在 `scripts/README.md`/release.md 明确「发布前必须本地跑 `pnpm quality:release`」的纪律约定。

- [x] **G-0 已核查、现有门禁覆盖部分无需处理**
  - CI 主闸（`ci.yml`）已串联 lint→build→test→`test:validate`→`docs:api`+api-summary drift→`api:validate`→`test:a11y`→`size` 八步，覆盖 lint/构建/单测/测试质量/API 校验/a11y/体积。
  - `check-release-readiness.mjs` 较完备：4 包+root 版本对齐、源码与 CLI version 常量、必需 core/vue/react exports 存在、repo 元数据、必需 scripts 与 `quality:release` 步骤、changeset fixed group、发布文档（CHANGELOG/MIGRATION/release.md 含当前版本号、example/roadmap 版本号）。
  - `validate-tests.mjs`（`test:validate`）按测试质量指南校验测试文件，已接入 CI 与 `quality:release`。
  - 手维护指南 `ssr.md`/`accessibility.md`/`theme.md`/`tokens.md`/`i18n.md` 抽查与源一致（除 G-5 两处）。

## 持续守护

### Tailwind v4

- workspace catalog、CLI 模板版本、core peer dependency 和 example 依赖继续保持 Tailwind v4 对齐。
- 示例与 CLI 模板继续使用 `@tailwindcss/vite` + CSS `@plugin "@expcat/tigercat-core/tailwind/modern"` 接入。
- core package 必须继续暴露 `./tailwind`、`./tailwind/modern`、`./tokens.css` 和 `./figma-variables.json`。
- Tailwind 相关改动需覆盖 doctor、CLI 模板、example build 和必要 package build。

### 发布门禁

- 公共 API 冻结检查使用 `pnpm release:check`、`pnpm types:check` 和 `pnpm api:validate`。
- SSR 与 hydration 矩阵使用 `pnpm quality:ssr` 覆盖 Nuxt 与 Next.js。
- 主题与 token 变更后运行 `pnpm tokens:build`，并确认生成物只包含预期变化。
- Breaking change 必须同步到 [docs/MIGRATION.md](MIGRATION.md) 和 [CHANGELOG.md](../CHANGELOG.md)。

### 组件 Definition of Done

新增或显著修改组件默认满足：

1. `packages/core/src/types/` 定义共享 Props 类型。
2. `packages/core/src/utils/` 抽取框架无关逻辑。
3. `packages/vue/src/components/` 与 `packages/react/src/components/` 双端实现。
4. `packages/*/src/index.*` 与必要子路径完成导出。
5. 测试覆盖正常路径、边界条件、a11y、键盘交互和 SSR 守卫。
6. `skills/tigercat/references/` 与 Example 同步 API 文档和使用场景。
7. 涉及文案时接入 i18n；涉及动画时响应 `prefers-reduced-motion`。

## 验证策略

按改动范围选择最小验证集：

| 改动类型                   | 推荐验证                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Roadmap / docs only        | `pnpm exec prettier --check docs/ROADMAP.md`                                   |
| CLI 模板 / Tailwind v4     | CLI 模板单测、`pnpm --filter @expcat/tigercat-cli build`、`pnpm example:build` |
| core 工具 / token / plugin | `pnpm --filter @expcat/tigercat-core build`、`pnpm test:core`                  |
| Vue/React 组件             | 对应组件单测、`pnpm test:vue` / `pnpm test:react` 的窄范围                     |
| 复杂交互或移动端           | 相关 Playwright spec，必要时补视觉回归                                         |
| 发布链路                   | `pnpm quality:release`、`pnpm build`、发布后 smoke                             |
