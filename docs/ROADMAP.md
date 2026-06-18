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

### 任务 D — 跨框架一致性扫描

- 目标路径：`packages/core` + `packages/vue` + `packages/react`
- 维度清单：
  - [ ] 重复逻辑下沉：Vue / React 组件中可抽到 `core/src/utils/` 的纯逻辑（类名生成、过滤、键盘导航）。
  - [ ] API parity & 命名：在 `validate-api.mjs` 现有规则外补查遗漏项。
  - [ ] 受控 / 事件对称：`open` → Vue `update:open` / React `onOpenChange` 全量核对。
- 方法：`pnpm api:validate` + `pnpm types:check` + 双端组件对照。

### 任务 E — CLI 包扫描

- 目标路径：`packages/cli/src/`
- 维度清单：
  - [ ] 模板对齐：`templates/` 与 Tailwind v4 接入方式同步（呼应"持续守护 / Tailwind v4"）。
  - [ ] doctor 诊断覆盖：`commands/doctor.ts` 检查项是否覆盖当前 peer / exports。
  - [ ] 命令健壮性：`create` / `add` / `generate` 的错误处理与边界。
  - [ ] 版本同步：`constants.ts` 版本与发布机制一致。
- 方法：CLI 单测 + `pnpm --filter @expcat/tigercat-cli build`。

### 任务 F — 构建·体积·性能扫描

- 目标路径：构建与产物（各包 `tsup.config.ts`、`.size-limit.json`）
- 维度清单：
  - [ ] 体积预算：`.size-limit.json` 当前仅 5 入口，评估按组件族扩展预算。
  - [ ] 可摇树性：核对 `package.json` 的 `sideEffects` 标注与子路径导出 tree-shaking。
  - [ ] 运行时性能：补缺口——目前有 bundle size 无 runtime 基准（评估是否引入 `vitest bench`）。
- 方法：`pnpm size` / `pnpm build` / 对照各包 `tsup.config.ts`。

### 任务 G — 质量门禁·文档一致性扫描

- 目标路径：`.github/workflows/` + `scripts/*.mjs` + `skills/tigercat/references/`
- 维度清单：
  - [ ] 覆盖率门槛：评估为 `test:coverage` 设阈值。
  - [ ] 依赖 / CVE：评估引入依赖安全扫描。
  - [ ] breaking-change：评估自动检测（现仅靠 `validate-api.mjs` 命名规则）。
  - [ ] references 漂移：`skills/tigercat/references/` 与源码同步（已有 `git diff` 校验，补查示例 / SSR / a11y 指南时效）。
- 方法：审阅 `.github/workflows/` + `scripts/*.mjs` + `pnpm docs:api`。

### 后续优化任务

由上述扫描任务执行后回填，每条按「公共约定」注明所属任务 / 模块、维度、问题、影响、建议方案与优先级（P0 阻塞 / P1 重要 / P2 改进）。

#### 来自任务 A — Core 包扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原估"core 约 440 处 `any`、散落 `typeof window` 直写"在 core 范围内不成立——该信号集中在 `vue` / `react` 组件层，应由任务 B / C 核查。core 自身类型与 SSR 守卫基本干净（见 A-0）。

- [ ] **A-1 form-validation 内置校验消息无法本地化**（P1）
  - 维度：i18n｜模块：`packages/core/src/utils/form-validation.ts`
  - 问题：`validateType` 等内置规则消息（`'Please enter a valid email address'` 等）为硬编码英文，仅支持每次调用传 `customMessage` 覆盖，无 `locale` 参数、无 ZH_CN 变体。
  - 影响：中文/多语言应用的表单内置校验报错只能显示英文，除非每条规则手动传文案；与 `locale-utils` 的本地化体系脱节。
  - 建议：为校验消息引入 locale 解析（参照 `locale-utils` 的 `DEFAULT_*` / `ZH_CN_*` + getter 模式），消息走 `resolveLocaleText`，保留 `customMessage` 最高优先级。

- [ ] **A-2 i18n 默认文案表分散**（P2）
  - 维度：i18n｜模块：`utils/locale-utils.ts`、`utils/timepicker-utils.ts`、`utils/upload-labels.ts`
  - 问题：`locale-utils` 已集中 pagination/form-wizard/table/task-board 标签，但 timepicker、upload 各自维护独立默认标签表（含各自 ZH_CN），模式不统一。
  - 影响：新增语言或调整文案需多处改动、易遗漏；标签体系认知成本偏高。
  - 建议：将 timepicker/upload 默认标签迁入 `locale-utils` 统一的 `DEFAULT_*` / `ZH_CN_*` + getter 模式，或抽一层公共标签注册。

- [ ] **A-3 InfiniteScroll 仍依赖已废弃的 `shouldLoadMore`**（P2）
  - 维度：死代码/deprecated｜模块：`utils/infinite-scroll-utils.ts` ↔ `vue/react` 的 InfiniteScroll
  - 问题：`shouldLoadMore` 标注 `@deprecated`（建议改用 `createInfiniteScrollObserver`），但 Vue（`InfiniteScroll.ts:66`）与 React（`InfiniteScroll.tsx:61`）组件仍在调用它。
  - 影响：废弃 API 被自身组件持续使用，废弃标记名存实亡；IntersectionObserver 路径未被采用。
  - 建议：将两端 InfiniteScroll 迁移到 `createInfiniteScrollObserver` 后移除 `shouldLoadMore`；若有意保留滚动事件回退路径，则撤销其 `@deprecated`。

- [ ] **A-4 废弃别名 `kanbanAddCardClasses` 可清理**（P2）
  - 维度：死代码/deprecated｜模块：`utils/kanban-utils.ts:43`
  - 问题：`kanbanAddCardClasses = taskBoardAddCardClasses` 仅为向后兼容别名，全仓除自身定义外无任何引用。
  - 影响：冗余公共导出，增大 API 表面。
  - 建议：作为 breaking change 在下一个允许破坏的版本移除，并在 [MIGRATION.md](MIGRATION.md) 注明 `kanban*` → `taskBoard*`。

- [ ] **A-5 `theme/` 与 `themes/` 目录命名易混淆**（P2）
  - 维度：token/theme｜模块：`packages/core/src/theme/`、`packages/core/src/themes/`
  - 问题：`theme/` = CSS 变量运行时助手 + 按组件样式表（colors/checkbox/switch/slider）；`themes/` = 命名预设主题 + `ThemeManager` + modern token 层。职责不同但目录名仅差一个 `s`，两者均经各自 `index.ts` `export *`（目录名非公共 API）。
  - 影响：维护者易混淆两目录用途，定位与改动成本高。
  - 建议：将 `theme/` 重命名为语义更清晰的目录（如 `css-vars/` 或 `theme-runtime/`），对外导出符号不变，风险低。

- [x] **A-0 已核查、core 范围内无需处理**
  - 类型安全：`packages/core/src` 真实 `any` 类型用法 **0** 处（grep 命中的 24 处均为注释里的英文单词或 `'any'` 字符串字面量），`@ts-ignore` / `@ts-expect-error` **0** 处 → `any` 审计移交任务 B/C。
  - SSR：core 已统一使用 `env.ts` 的 `isBrowser()`；残留 `typeof window/document` 仅为 `matchMedia`（`animation.ts`、`transition.ts`）与 `queryCommandState`（`rich-text-engine.ts`）特性检测，且都在 `isBrowser()` 之后，属合理用法 → 散落直写问题移交任务 B/C。

#### 来自任务 B — Vue 组件包扫描（2026-06-19）

> **扫描结论修正**：Roadmap 原估"组件层散落 `typeof window` 直写 + 大量 `any`"在 Vue 范围内不成立——Vue src 类型位 `any` 实际 0 处，window/document 抽样核查也无 SSR 崩溃风险（见 B-0）。真正的高优问题是 **i18n 未接入**（B-1）与 **约 1,500 LOC 死 composable**（B-3）。

- [ ] **B-1 硬编码 UI 文案未接入 TigerLocale**（P1）
  - 维度：硬编码文案/i18n｜模块：`Select.ts:699`、`Tree.ts:891`、`TreeSelect.ts:309`、`Transfer.ts:194`、`Cascader.ts:363`、`FileManager.ts:167/244`、`VirtualTable.ts:219`、`InfiniteScroll.ts:32`、`QRCode.ts:103`、`Timeline.ts:214`、`ImageViewer.ts:288/291`、`Modal.ts:182/464`、`Spotlight.ts:85`、`Loading.ts:230`、`AutoComplete.ts:257`、`Signature.ts:48`
  - 问题：仓库已具备 `TigerLocale` + `mergeTigerLocale` + ConfigProvider `locale` 体系，`TigerLocaleCommon` 已定义 `loadingText/emptyText/closeText/okText/cancelText` 槽位，Modal/Drawer 已正确接入（`mergeTigerLocale(config.value.locale, props.locale)`）。但上述组件把 `'Search...'`/`'Loading...'`/`'No data'`/`'Close'`/`'Clear'` 直接写死在 render 中，既无 `locale` prop 也不读 ConfigProvider，无法本地化。
  - 影响：`<ConfigProvider :locale="ZH_CN">` 下，Select 搜索框、Tree/TreeSelect/Transfer/Cascader 的搜索与空态、各处 Loading/Close 仍显示英文，多语言应用无法整体本地化。
  - 建议：改走 `mergeTigerLocale` 解析（沿用 Modal 模式：组件加 `locale?: Partial<TigerLocale>` prop + 读 ConfigProvider）。`common` 缺 `searchPlaceholder`（仅 `TigerLocaleTable` 有），需在 `TigerLocaleCommon` 补 `searchPlaceholder`（及必要的 `clearText`）供 Select/Tree/TreeSelect/Transfer/Cascader 搜索框使用；与 A-1/A-2 同源，建议一并规划。

- [ ] **B-2 英文 prop 默认值绕过全局 locale**（P2）
  - 维度：i18n｜模块：`Tree.ts:256`(emptyText)、`List.ts:106`、`TreeSelect.ts:102`、`Transfer.ts:79`、`VirtualTable.ts:63`(emptyText)、`InfiniteScroll.ts:32`(loadingText)、`Signature.ts:48`(clearText)、`Spotlight.ts:85`
  - 问题：这些组件把文案做成可覆盖 prop，但默认值为英文（`default: 'No data'`/`'Loading...'`/`'Clear'`），且不回退到 ConfigProvider 的 `TigerLocaleCommon`。可逐实例覆盖，但无法被全局 locale 统一驱动。
  - 影响：即便 app 配了 ZH_CN，这些默认仍是英文，需在每个组件实例手动传文案、易遗漏；与 B-1、A-2 同源。
  - 建议：prop 缺省值改为「未传时回退 `mergedLocale.common.*`」，prop 作为最高优先级覆盖（与 Modal 的 `props.locale` > `config.locale` 优先级一致）。

- [ ] **B-3 composables 大面积未被使用＝死代码**（P1）
  - 维度：composables 复用/死代码｜模块：`packages/vue/src/composables/`
  - 问题：10 个 composable 中仅 `useChartInteraction`（10 个图表组件使用）真正被消费；`useFormController`、`useDrag` 仅经 package `index.ts` 公开导出（公共 API、无组件内部使用，保留）；其余 7 个——`usePopup`、`useDateNavigation`、`useDateSelection`、`useTimeSelection`、`useTimePanelKeyboard`、`useSelectOptions`、`useSelectKeyboard`（合计约 1,500 LOC）——仅被 `composables/index.ts` barrel 引用，无任何组件 import、未从 package 公共入口导出、无单测覆盖，该 barrel 本身亦无人 import。对应组件（`Select.ts` 814、`DatePicker.ts` 989、`TimePicker.ts` 980）各自内联实现，Vue 弹层逻辑改走 `utils/use-floating-popup.ts` + `utils/overlay.ts`，使 `usePopup` 冗余。
  - 影响：约 1,500 LOC 死代码；「逻辑已抽取」实为未接入，造成维护与认知误导。
  - 建议：二选一——(a) 删除这 7 个未用 composable 并精简 `composables/index.ts`（零消费者、非公共 API，风险低，**推荐**）；或 (b) 若计划重构 Select/DatePicker/TimePicker 使用它们，则补齐接入。另确认公共 API `useFormController`/`useDrag` 的文档与测试覆盖。
  - parity 注：React `hooks/` 为 `useChartInteraction`/`useControlledState`/`useDrag`/`useFormController`/`usePopup`。React 有 `useControlledState` 而 Vue 无对应物（Vue 多处内联 `isControlled ? props.x! : internalValue`，亦是 B-5 非空断言来源）；`usePopup` 在 React 在用、在 Vue 已死。跨端去重执行归属任务 D。

- [ ] **B-4 SSR 守卫写法不统一**（P2）
  - 维度：SSR guard｜模块：`ConfigProvider.ts`（内联 `typeof document === 'undefined'`）vs `Descriptions`/`Message`/`Notification`（`isBrowser()`）vs 仅靠生命周期时机（`Affix`/`Tour`/`Modal`/`Drawer`/`TimePicker`/`Slider`/`ImageCropper`/`ChartTooltip`）
  - 问题：121 处 window/document 访问，抽样核查未见在 SSR setup/render 阶段同步执行者（均位于 onMounted/onBeforeUnmount、事件处理、requestAnimationFrame 回调或显式守卫内），无 SSR 崩溃。但守卫写法三套并存：core 推荐的 `isBrowser()`、内联 `typeof … === 'undefined'`、以及无显式守卫仅依赖生命周期时机。
  - 影响：当前无 bug，但隐式依赖生命周期较脆——日后把访问移出 onMounted 会静默破坏 SSR；写法不一致抬高 review 成本。即 A-0 移交的「散落 `typeof window` 直写」核查结论：属一致性问题而非正确性问题。
  - 建议：需显式守卫处统一用 `isBrowser()`（替换 ConfigProvider 的内联 `typeof document`）；生命周期/事件作用域内的访问保持原样（构造上安全），必要处补一行注释说明依赖时机。

- [ ] **B-5 非空断言可类型收窄**（P2）
  - 维度：非空断言｜模块：全包 21 处，含 `Alert.ts:202`(`props.duration!`)、`Select.ts:791`(`creatableOption.value!`)、`Form.ts:497/507`(`props.model![k]`)、`Notification.ts:281/288`(`containerApps[position]!`)、`Image.ts:202`、`QRCode.ts:39`、`Mentions.ts:56/131`、`Tree.ts:860`、`CommentThread.ts:192/198/480` 等
  - 问题：多为 `props.X!`（X 类型可选但运行时有默认：duration/fit/size/prefix/disabled）或受控值模式 `props.value!`/`props.modelValue!`，及 `node.children!`（紧跟长度判断之后）。
  - 影响：低——类型层脆弱；若移除默认或改动守卫，会变成运行时 undefined 而无编译期报错。
  - 建议：defaulted prop 用 `withDefaults`/解析后类型反映默认值以去掉 `!`；children 在判断后用局部 const 收窄。全包仅 21 处，成本低。

- [ ] **B-6 复杂度热点抽取评估**（P2）
  - 维度：复杂度热点｜模块：`Menu.ts`(1278)、`DatePicker.ts`(989)、`TimePicker.ts`(980)、`Tree.ts`(934)、`Select.ts`(814)；React 对应 `Menu.tsx`(914)、`Tree.tsx`(897)、`DatePicker.tsx`(847)、`TimePicker.tsx`(775)、`Select.tsx`(666)
  - 问题：DatePicker/TimePicker/Select 体量大且其专用 composable 已写好却未接入（见 B-3）；Menu/Tree 体量最大却无任何抽取层。
  - 影响：大文件维护成本高，双端同类逻辑各自内联、易漂移。
  - 建议：分两步——(a) DatePicker/TimePicker/Select 的最廉价收敛是接入已有 composable，或按 B-3 删除后将框架无关逻辑沉淀到 `core/src/utils/` 供双端复用；(b) Menu/Tree 评估把键盘导航 + 节点 flatten/过滤逻辑抽到 `core/src/utils/` 与 React Menu/Tree 共享。跨端下沉执行归属任务 D。

- [x] **B-0 已核查、Vue 范围内无需处理**
  - 类型安全：`packages/vue/src` 类型位 `any` **0** 处（唯一类型位为 `Table.ts:160` 的 `new Map<string, any>()`，值类型可收窄但风险极低；`CronEditor.ts` 的 `'any'` 为业务字面量非类型），`@ts-ignore`/`@ts-expect-error` **0** 处 → A-0 移交的 `any` 审计在 Vue 侧基本干净，React 侧移交任务 C。
  - SSR：抽样核查 window/document 高密度文件（Affix/Tour/Modal/Drawer/TimePicker/Slider/ImageCropper/ChartTooltip/ConfigProvider 等），未发现会在 SSR setup/render 阶段同步执行的访问 → 无 SSR 崩溃风险，仅守卫写法不统一（详见 B-4）。

#### 来自任务 C — React 组件包扫描（2026-06-19）

> **扫描结论修正**：与任务 B 一致——Roadmap 原列的类型安全（`any`）与 SSR 直写在 React 范围内同样基本不成立：React src 类型位 `any` 仅 1 处、`@ts-ignore` 0 处，window/document 抽样均在事件/`useEffect` 内（见 C-0）。点名的 FloatButton/Tour/ChartTooltip 已正确 `isBrowser()` 守卫，真正缺显式守卫仅 ImagePreview（C-3）。React 与 Vue 共用 `TigerLocale`/`mergeTigerLocale`/ConfigProvider 体系，但仅 10 个组件消费，搜索/空态类仍硬编码（C-1/C-2，与 B-1/B-2 同源）。

- [ ] **C-1 内部搜索框 `placeholder="Search..."` 硬编码、不可定制**（P1）
  - 维度：硬编码文案/i18n｜模块：`Select.tsx:655`、`Tree.tsx:874`、`TreeSelect.tsx:239`、`Transfer.tsx:168`、`Cascader.tsx:272`、`FileManager.tsx:163`
  - 问题：React 已具备 `mergeTigerLocale(config.locale, props.locale)` + ConfigProvider 体系（`Modal.tsx:130/207` 已正确读 `mergedLocale.common.closeText`），但上述 6 个组件内部搜索 `<input>` 的 placeholder 为 JSX 内联英文字面量 `"Search..."`，既无 prop 覆盖也不读 ConfigProvider。Vue 端同名组件存在逐字一致的硬编码（B-1），属跨框架同源问题。
  - 影响：`<ConfigProvider locale={ZH_CN}>` 下这些搜索框仍显示英文 "Search..."，无任何定制入口。
  - 建议：与 B-1 协同——在 `TigerLocaleCommon` 补 `searchPlaceholder`（现仅 `TigerLocaleTable` 有），双端搜索框改读 `mergedLocale.common.searchPlaceholder`，并补可覆盖的 `searchPlaceholder` prop（最高优先级）；core 标签统一与 A-1/A-2 一并规划。

- [ ] **C-2 英文 prop 默认值绕过全局 locale**（P2）
  - 维度：i18n｜模块：`List.tsx:176`/`VirtualTable.tsx:50`/`Tree.tsx:287`(emptyText='No data')、`Transfer.tsx:58`/`TreeSelect.tsx:58`(notFoundText='No data')、`InfiniteScroll.tsx:32`(loadingText='Loading...')、`Tour.tsx:41-43`(nextText/prevText/finishText)、`Spotlight.tsx:56`(placeholder='Search')、`NumberKeyboard.tsx:37`(confirmText='Done')、`Signature.tsx:61`(clearText='Clear')、`Select.tsx:70`/`Cascader.tsx:63`/`TreeSelect.tsx:52`(placeholder)、`Loading.tsx:143`(aria-label 回退 'Loading')
  - 问题：这些文案做成可覆盖 prop，但默认值为英文，且不回退 ConfigProvider 的 `mergedLocale.common.*`。可逐实例覆盖，无法被全局 locale 统一驱动；与 Vue B-2 同源。
  - 影响：即便 app 配了 ZH_CN，空态/加载/分步/确认等默认仍英文，需逐组件传文案、易遗漏。
  - 建议：prop 缺省改为「未传时回退 `mergedLocale.common.*`」，prop 作最高优先级覆盖（对齐 Modal 的 `props.locale` > `config.locale`）。

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
