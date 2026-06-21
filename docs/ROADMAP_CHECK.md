# Tigercat 路线图审查

<!-- LLM-INDEX
type: roadmap-audit
scope: review of ROADMAP.md completed scan tasks — 任务 A (Core 包扫描, A-0~A-5) + 任务 B (Vue 组件包扫描, B-0~B-6) + 任务 C (React 组件包扫描, C-0~C-5 全部完成) + 任务 D (跨框架一致性扫描, D-0~D-4 全部完成) + 任务 E (CLI 包扫描, E-0~E-5 全部完成)
verified-date: 2026-06-21
source: code/CHANGELOG/MIGRATION/scripts/git cross-check against packages/core/src, packages/vue/src, packages/react/src, packages/cli/src, scripts/validate-api.mjs, tests/core/cli.spec.ts, pnpm-workspace.yaml
-->

> 本文是对 [ROADMAP.md](ROADMAP.md) 已勾选完成项的独立审查记录，**不修改 ROADMAP 原文、不改组件代码**，结论与建议供维护者取舍。当前覆盖：任务 A（Core 包扫描）、任务 B（Vue 组件包扫描）、任务 C（React 组件包扫描，已完成的 C-0～C-5 全部审毕——C-5 见 §6 补审）、任务 D（跨框架一致性扫描，D-0～D-4 全部审毕）、任务 E（CLI 包扫描，E-0～E-5 全部审毕）。

## 任务 A — Core 包扫描

> 本节是对 [ROADMAP.md](ROADMAP.md) 「任务 A — Core 包扫描」已勾选完成项的独立审查记录。

### 1. 审查范围与方法

- **范围**：ROADMAP「任务 A — Core 包扫描」的核查结论 A-0 与优化项 A-1～A-5。
- **方法**：逐条把 ROADMAP 声称项对照
  - `packages/core/src/` 源码（`grep` 定位 + 直接读取关键文件）；
  - [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`、[MIGRATION.md](MIGRATION.md)、`.changeset/`；
  - 对 SSR 维度用 `grep` 量化 `document.`/`window.` 直接成员访问面，再核对是否经 `isBrowser()` 守卫。

### 2. 逐条核验结果

| 项  | 声称                                                        | 核验                                | 证据                                                                                                                                                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-1 | 表单内置校验消息可本地化                                    | ✅ 属实                             | `utils/form-validation.ts` 各校验函数（`validateType`/`validateRange`/`validateRule`/`validateField`/`validateForm`）均接 `messages` 形参；`utils/locale-utils.ts` 有 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS` + `getFormValidationLabels()`；接入 `TigerLocale.formValidation`，en-US/zh-CN locale 文件均含该区块 |
| A-2 | TimePicker/Upload 默认标签收敛到 `locale-utils`             | ✅ 就声称范围属实                   | `utils/locale-utils.ts` 含 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` 与 `DEFAULT_UPLOAD_LABELS`，无散落重复硬编码（见 §4 旁注）                                                                                                                                                                                             |
| A-3 | 撤销 `shouldLoadMore` 的 `@deprecated`                      | ✅ 属实                             | `utils/infinite-scroll-utils.ts:30` 函数定义无 `@deprecated` 标签，仍经 `utils/index.ts` 导出且被消费                                                                                                                                                                                                                                       |
| A-4 | 移除 `kanbanAddCardClasses`，改用 `taskBoardAddCardClasses` | ✅ 属实                             | 全仓源码 0 处残留 `kanbanAddCardClasses`（仅 CHANGELOG/MIGRATION/changeset 历史提及）；`utils/task-board-utils.ts:51` 定义新符号，`utils/index.ts` 导出，Vue/React `TaskBoard` 双端消费；CHANGELOG `## Unreleased` + MIGRATION.md + `.changeset/kanban-alias-removal-and-theme-dir-rename.md` 均记录为破坏性变更                            |
| A-5 | `theme/` → `theme-runtime/`，公共符号不变                   | ✅ 属实                             | `src/theme/` 已不存在，`src/theme-runtime/` 就位（`colors/checkbox/switch/slider/index`）；`src/index.ts:31` `export * from './theme-runtime'`，`THEME_CSS_VARS`/`setThemeColors`/`getThemeColor` 等公共符号不变；CHANGELOG/MIGRATION 注明不影响公共 API                                                                                    |
| A-0 | 核查结论（0 `any` / 0 `@ts-ignore` / SSR 干净）             | ⚠️ 类型层属实；**SSR 子结论不精确** | 见 §3                                                                                                                                                                                                                                                                                                                                       |

**结论**：A-1～A-5 全部属实、文档齐全，无需返工。唯一缺陷在 A-0 的 SSR 核查结论。

### 3. 唯一缺陷：A-0 的 SSR 结论不精确

A-0 原文：

> SSR：core 已统一使用 `env.ts` 的 `isBrowser()`；残留 `typeof window/document` 仅为 `matchMedia`（`animation.ts`、`transition.ts`）与 `queryCommandState`（`rich-text-engine.ts`）特性检测，且都在 `isBrowser()` 之后，属合理用法 → 散落直写问题移交任务 B/C。

核验：

- **窄表述属实**：以 `typeof window/document` 形式做特性检测的，确实仅 `matchMedia`（`animation.ts`/`transition.ts`）与 `queryCommandState`（`rich-text-engine.ts`），且都在 `isBrowser()` 之后。
- **但范围被低估**：`packages/core/src` 全量有 **97 处直接 `document.`/`window.` 成员访问，分布 22 个文件**。其中若干**导出的浏览器端命令式助手未加 `isBrowser()` 守卫**：
  - `utils/a11y-utils.ts`（8 处）——`createFocusTrap`（`document.activeElement`/`addEventListener`）、`announceToScreenReader` / live-region（`document.getElementById`/`createElement`/`body.appendChild`）；
  - `utils/anchor-utils.ts`（5 处）——`getAnchorTargetElement`/`getContainerScrollTop`/`getContainerHeight`/`getElementOffsetTop`；
  - `utils/chart-export-utils.ts`（4）、`utils/table-export-utils.ts`（6）、`utils/focus-utils.ts`、`utils/image-utils.ts`、`utils/rich-text-editor-utils.ts`。
- **风险判定**：这些助手只在浏览器运行时（事件处理 / 挂载后 / 用户触发的导出动作）被调用，**不会在 SSR 渲染期同步执行 → 无崩溃风险**（与任务 B-0/C-0 对 vue/react 直写的判定同理）。
- **两点不准确**：
  1. "core 已统一 `isBrowser()`" 是**过度表述**——core 自身仍有大量未经 `isBrowser()` 守卫的直接 DOM 访问，只是靠"仅浏览器调用"的调用约定保证安全，守卫写法并不统一。
  2. "散落直写问题移交任务 B/C" **无效**——任务 B/C 的目标路径分别是 `packages/vue/src/` 与 `packages/react/src/`，**不含 `packages/core/src`**；这部分 core 残留被移交给了不会扫描它的任务，实则无人接管。

### 4. 旁注（超出 A 声称范围，不计为 A 的缺陷）

A-2 仅声称"默认标签收敛到 `locale-utils`"，该点已达成。审查中另观察到两处更深层的 i18n 集成缺口（属后续可选优化，非 A-2 失败）：

- **TimePicker 标签未并入 `TigerLocale` 类型**：`types/locale.ts` 的 `TigerLocale` 接口无 `timePicker` 区块，TimePicker 标签经 `getTimePickerLabels()`（locale 串 + overrides）单独解析，未走主 locale 配置体系。
- **Upload 在 `locale-utils` 无 zh-CN 默认值**：仅有 `DEFAULT_UPLOAD_LABELS`（英文），无 `ZH_CN_UPLOAD_LABELS`（FormValidation/TimePicker/Pagination/Table/TaskBoard 均有 zh-CN 变体）；en-US/zh-CN locale 文件也未含 `upload` 区块。

### 5. 建议

供 ROADMAP 维护者取舍，本审查文档不代改 ROADMAP / 代码：

1. **修正 A-0 SSR 结论文字**：如实写明 core 仍有 browser-only 命令式助手的直接 DOM 访问（无 SSR 崩溃风险、但写法不统一），删除"已统一 `isBrowser()`"的过度表述与"移交任务 B/C"的无效移交。
2. **回填一条 core 范围跟踪项（建议 P3）**：在「后续优化任务 → 来自任务 A」登记上述未守卫助手（`a11y-utils`/`anchor-utils`/`chart-export-utils`/`table-export-utils`/`focus-utils`/`image-utils`/`rich-text-editor-utils`），整改方案为统一 `isBrowser()` 早退守卫或显式 browser-only 标注——因 B/C 不覆盖 core，需在 A 范围内自行承接。
3. §4 两条 i18n 旁注可视需要另立条目，与 A-2 解耦。

## 任务 B — Vue 组件包扫描

> 本节是对 [ROADMAP.md](ROADMAP.md) 「任务 B — Vue 组件包扫描」已勾选完成项（B-0 ～ B-6，ROADMAP 标注全部「已交付」）的独立审查记录。结论与建议供维护者取舍，**不修改 ROADMAP 原文，也不改组件代码**。

### 1. 审查范围与方法

- **范围**：ROADMAP「任务 B — Vue 组件包扫描」的核查结论 B-0 与优化项 B-1 ～ B-6。
- **方法**：逐条把 ROADMAP / CHANGELOG 声称项对照
  - `packages/vue/src/` 源码（`grep` 定位 + 直接读取关键组件文件），必要时交叉对照 `packages/react/src/`、`packages/core/src/`；
  - [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 的逐条落地说明；
  - 对 i18n 维度，核验 `core/src/utils/locale-utils.ts` 的 `resolveLocaleText` 取值语义（返回**首个非空候选**），据此判断「回退 locale」是否真正生效（生效前提是 prop 默认值为 `undefined`）。

### 2. 逐条核验结果

| 项  | 声称                                                               | 核验                          | 证据                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-1 | 硬编码 UI 文案接入 TigerLocale                                     | ✅ 属实                       | `core/src/types/locale.ts` `TigerLocaleCommon` 新增 `searchPlaceholder`/`clearText`；`utils/i18n/locales/en-US.ts:16-17`、`zh-CN.ts:16-17` 均补值；Vue `Select`/`Tree`/`TreeSelect`/`Transfer`/`Cascader`/`FileManager` 搜索框改读 `mergedLocale.value?.common?.searchPlaceholder`，并新增可选 `locale` prop；CHANGELOG `## Unreleased` 第 14 行完整记录          |
| B-2 | 英文 prop 默认值回退 ConfigProvider locale                         | ⚠️ **大体属实，1 处确凿缺陷** | 见 §3。已正确转换者（List/Tree/TreeSelect/Transfer/VirtualTable 等）默认值均为 `undefined`、渲染走 `resolveLocaleText(...)` 兜底，生效无误；唯 **Vue Cascader 空态漏改**，另有若干未声称范围的残留（§4）                                                                                                                                                          |
| B-3 | 删除未使用 composable（约 1,500 LOC 死码）                         | ✅ 属实（文档更精确）         | CHANGELOG 第 58 行点名删除 7 个死 composable（`usePopup`/`useDateNavigation`/`useDateSelection`/`useTimeSelection`/`useTimePanelKeyboard`/`useSelectOptions`/`useSelectKeyboard`，约 1,529 LOC）+ barrel；`packages/vue/src/composables/` 现存仅 3 个——`useChartInteraction`（被 10 个 chart 组件消费）、`useDrag`/`useFormController`（公共 API 导出，正确保留） |
| B-4 | ConfigProvider/Signature/ImageAnnotation 内联 typeof → isBrowser() | ✅ 属实                       | `ConfigProvider.ts:143/157`、`Signature.ts:76` 改用 `isBrowser()`；`ImageAnnotation.ts:109` 用 `isBrowser()` 守卫、保留 `typeof window.Image` 特性检测（CHANGELOG 第 28 行明确声明保留）。全 Vue src 内联 `typeof` 守卫仅此 1 处遗留，非疏漏                                                                                                                      |
| B-5 | 收窄冗余非空断言（`!`）                                            | ✅ 属实                       | 扫描期「21 处」是**整改前**计数、非交付后承诺；CHANGELOG 第 29 行所列 `QRCode`/`Mentions`/`Alert`/`Tree`/`CommentThread`/`Menu` 断言现已为 0。残留约 6 处（`Form.ts:522/532`、`Select.ts:808`、`Table.ts:575`、`Table/render-summary.ts:16`、`TreeSelect.ts:163`）与 `Image.ts:274` 的 `props.src!` 均非 B-5 声称的「带默认值 prop 断言」范围                     |
| B-6 | date-utils 新增 addDays/addMonths/addYears、双端 DatePicker 接入   | ✅ 属实                       | `core/src/utils/date-utils.ts:116/130/147` 导出三函数；Vue `DatePicker.ts:405/434/573` 与 React `DatePicker.tsx:318/340/505` 均改调，无内联日期算术 / 手写月年 wraparound 残留；CHANGELOG 第 16/26 行记录                                                                                                                                                         |
| B-0 | 核查结论（0 `any` / 0 `@ts-ignore`；SSR 无崩溃、仅守卫不统一）     | ✅ 属实（陈述严谨）           | 见 §3 末段                                                                                                                                                                                                                                                                                                                                                        |

**结论**：B-0 与 B-1 / B-3 / B-4 / B-5 / B-6 全部属实、CHANGELOG 记录齐全，无需返工。唯一缺陷在 B-2——**Vue Cascader 空态本地化漏改**，且与已发布的 CHANGELOG 说明矛盾。

### 3. 唯一缺陷：B-2 的 Vue Cascader 空态未本地化（与 CHANGELOG 矛盾）

`resolveLocaleText(fallback, ...candidates)`（`core/src/utils/locale-utils.ts:1`）按顺序返回**首个非空候选**，全空才返回 `fallback`。因此「未传 prop 时回退 locale」生效的前提是 **prop 默认值为 `undefined`**——否则 `props.X` 永远是那个硬编码默认串，会先于 locale 候选命中，locale 兜底成为死代码。

- **正确范式（对照组，均生效 ✓）**：
  - Vue `List.ts`/`Tree.ts`/`TreeSelect.ts`/`Transfer.ts`/`VirtualTable.ts` 的 `emptyText`/`notFoundText` 默认值均为 `default: undefined`，渲染走 `resolveLocaleText('No data', props.X, mergedLocale.value?.common?.emptyText)`；
  - Vue `InfiniteScroll.ts` 的 `loadingText` 默认 `undefined`（`:37`），渲染走 `resolveLocaleText('Loading...', props.loadingText, mergedLocale.value?.common?.loadingText)`（`:140-143`）；
  - React `Cascader.tsx` 的 `notFoundText` 解构无默认值（`:78`），空态 `resolveLocaleText('No results found', notFoundText, mergedLocale?.common?.emptyText)`（`:297-300`）。
- **Vue Cascader（缺陷）**：空态**直接渲染 `props.notFoundText`**（`Cascader.ts:391`），未经 `resolveLocaleText`、无 locale 候选；且 `notFoundText` 默认值仍硬编码 `'No results found'`（`Cascader.ts:116`）。两重成因叠加 → Vue Cascader 空态**完全不本地化**，`<ConfigProvider :locale="zhCN">` 下仍渲染英文。（其搜索框 placeholder `Cascader.ts:377` 已正确接入 B-1，唯独空态遗漏。）
- **与文档矛盾**：CHANGELOG `## Unreleased` 第 15 行明确写「双端 …`Cascader`（`notFoundText`）… 默认值改为未传时回退 `common.*`」，ROADMAP 任务 C 的 C-2 进度注亦称 `Cascader 空态改读 mergedLocale.common.*`「跨端一并交付」。实测 **React 已交付、Vue 漏掉** → 属跨端不对称的漏改，且与已发布说明（CHANGELOG）不一致。

**B-0 SSR 子结论核验（对比任务 A 的同类缺陷）**：B-0 称「抽样核查未发现 SSR setup/render 阶段同步执行的 window/document 访问 → 无 SSR 崩溃风险，仅守卫写法不统一（详见 B-4）」。实测 `packages/vue/src/` 有 **102 处直接 `window.`/`document.` 成员访问、分布 29 个文件**（扫描期估「121」，差异系 B-3/B-4 清理后自然回落），抽查均位于生命周期/事件作用域内、不会在 SSR 同步执行 → 判定成立。**与 A-0 不同的是**：B-0 未过度表述「已统一 isBrowser()」，「守卫不统一」也明确归口任务内的 B-4（而非移交不覆盖本范围的他任务）——结论严谨，无 A-0 那类「无效移交」问题。

### 4. 旁注（B-2 未声称范围内的未本地化残留，不计为 B-2 缺陷）

下列英文默认值仍被直接渲染、绕过 locale，但**不在** B-2 / C-2 或 CHANGELOG 第 15 行声称的转换清单内，故不计为破约，仅属可选后续优化：

- `Select.ts:822` 的 `noOptionsText`/`noDataText`（默认 `'No options found'`/`'No options available'`，`props.options.length === 0 ? props.noDataText : props.noOptionsText` 直接渲染）；
- `FileManager.ts:252` 的 `emptyText`（默认 `'Empty folder'`，直接渲染）；
- `InfiniteScroll.ts:150` 的 `endText`（默认 `'No more data'`，`slots.end?.() ?? props.endText` 直渲；CHANGELOG 仅声称转换其 `loadingText`，该项已正确生效）；
- `Select`/`Cascader`/`TreeSelect` 的主 `placeholder`（`'Select an option'`/`'Please select'`）—— C-2 进度注**已显式说明**「因 `common` 无对应 key 暂不改，留待后续视需要新增 key」，属已知刻意延后，非遗漏。

### 5. 建议

供 ROADMAP 维护者取舍，本审查文档不代改 ROADMAP / 代码：

1. **修复 Vue Cascader 空态本地化（唯一确凿缺陷）**：将 `Cascader.ts:391` 改为 `resolveLocaleText('No results found', props.notFoundText, mergedLocale.value?.common?.emptyText)`，并把 `notFoundText` 默认值（`:116`）改为 `undefined`，与 React Cascader 对齐、兑现 CHANGELOG 第 15 行「双端」承诺；补一条 `<ConfigProvider :locale="zhCN">` 下空态渲染中文的断言用例。
2. **回填一条跟踪项（建议 P2）**：在「后续优化任务 → 来自任务 B」登记 §4 未本地化残留（`Select` 的 `noOptionsText`/`noDataText`、`FileManager` 的 `emptyText`、`InfiniteScroll` 的 `endText`），整改方案为统一接入 `resolveLocaleText(... , mergedLocale.common.*)` 并把默认值改为 `undefined`。
3. **（可选，陈述精度）**：B-0 维度清单的「121 处 window/document 访问」可标注为扫描期估值（现 102 处 / 29 文件），属陈述精度而非缺陷。

## 任务 C — React 组件包扫描

> 本节是对 [ROADMAP.md](ROADMAP.md) 「任务 C — React 组件包扫描」**已勾选完成项**的独立审查记录。§1 ～ §5 审查 C-0 ～ C-4（首轮，2026-06-21）；**C-5（React 巨石拆分）随后交付，补审见 §6**——至此任务 C 全部六项审毕。结论与建议供维护者取舍，**不修改 ROADMAP 原文，也不改组件代码**。

### 1. 审查范围与方法

- **范围**：本节（§1 ～ §5）审查核查结论 C-0 与已交付优化项 C-1 ～ C-4；C-5 当时尚未交付，其补审独立列于 §6。
- **方法**：逐条把 ROADMAP / CHANGELOG / MIGRATION 声称项对照
  - `packages/react/src/` 源码（`grep` 定位 + 直接读取关键组件与 hook），必要时交叉对照 `packages/vue/src/`、`packages/core/src/`；
  - [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 与 [MIGRATION.md](MIGRATION.md) 的逐条落地说明；
  - 对 SSR 维度，特别核查**所有 `createPortal` / `renderBodyPortal` 的渲染期守卫**（门户在 render 阶段执行，是真正的 SSR 崩溃面），并量化直接 `window.`/`document.` 成员访问面、确认是否仅落在 `useEffect` / 事件处理器内；
  - 对 C-4，核验 `useControlledState` 的签名（返回元数）、11 个 adopter 是否真接入、单测覆盖面、以及破坏性变更的文档齐备性。

### 2. 逐条核验结果

| 项  | 声称                                                                         | 核验              | 证据                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | 6 个内部搜索框接入 `common.searchPlaceholder` + 新增 `locale` prop           | ✅ 属实           | `Select.tsx:668`、`Tree.tsx:822`、`TreeSelect.tsx:255`、`Transfer.tsx:184`、`Cascader.tsx:286`、`FileManager.tsx:174` 均 `resolveLocaleText('Search...', mergedLocale?.common?.searchPlaceholder)`；六者均含 `locale?: Partial<TigerLocale>`（`:51`/`:268`/`:40`/`:42`/`:43`/`:55`）；core `TigerLocaleCommon.searchPlaceholder` 与 CHANGELOG 记录齐备                                                                                                                                                                 |
| C-2 | 英文 prop 默认值回退 ConfigProvider locale；主 placeholder 暂缓              | ✅ 属实           | 空态 `List`/`Tree`/`Transfer:218`/`TreeSelect:302`/`Cascader:297-300` 均走 `resolveLocaleText(..., mergedLocale?.common?.emptyText)`；`Tour.tsx:61-63`→`formWizard.*`、`NumberKeyboard.tsx:58`→`common.okText`、`Loading.tsx:146`→`common.loadingText`、`InfiniteScroll.tsx:117`→`common.loadingText`；主 placeholder 仍硬编码（`Select:76`/`Cascader:70`/`TreeSelect:61`）属 C-2 明示的刻意延后。**React Cascader 空态正确**（与 Vue B-2 漏改相反，见 §3）                                                            |
| C-3 | ImagePreview 门户改 `renderBodyPortal`（含 `isBrowser()` 守卫）              | ✅ 属实           | `ImagePreview.tsx:270` 返回 `renderBodyPortal(...)`；`utils/overlay.ts:88-91` 内 `if (!isBrowser()) return null` 后才 `createPortal(node, document.body)`，与 Tour/FloatButton/ChartTooltip 门户写法统一                                                                                                                                                                                                                                                                                                               |
| C-4 | `useControlledState` 升级回调透传版、11 组件接入、破坏性 3→2 tuple、新增单测 | ✅ 属实           | `hooks/useControlledState.ts:37-65`：合并 `onChange`、`useCallback([])`+ref 稳定 setter、支持 updater、返回 `[value, setValue]`（第三位 `isControlled` 已移除）；11 个 adopter 全部命中 grep（`Checkbox`/`Input`/`InputNumber`/`Radio`/`RadioGroup`/`CheckboxGroup`/`Textarea`/`MarkdownEditor`/`RichTextEditor`/`Upload`/`Spotlight`）；`tests/react/useControlledState.spec.tsx` 覆盖 受控/非受控/prop 反映/updater/extra-args/稳定 identity/无 onChange；CHANGELOG `:33-34` + MIGRATION `:42-67` 双处记录破坏性变更 |
| C-0 | 类型层干净 / SSR 仅 ImagePreview 缺守卫 / i18n 10 消费者                     | ✅ 属实且陈述严谨 | 见 §3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**结论**：C-0 ～ C-4 全部属实、CHANGELOG / MIGRATION 记录齐全，**无需返工**——是比任务 A（A-0 的 SSR 过度表述 + 无效移交）、任务 B（B-2 的 Vue Cascader 空态漏改 bug）都更干净的结果。

### 3. 无可返工缺陷；C-0 的 SSR 结论严谨（与 A-0 的正向对照）

任务 C 的已完成项未发现 A/B 那类缺陷。最值得记录的是 **C-0 的 SSR 子结论没有重蹈 A-0 的两处覆辙**。

C-0 原文（节选）：

> SSR：window/document 访问绝大多数位于事件处理器与 `useEffect` 内（仅浏览器执行）；点名的 FloatButton/Tour/ChartTooltip 及 `overlay.ts` 门户均已 `isBrowser()` 守卫，`Descriptions.tsx` 用 `getServerSnapshot` 正确兜底 → 真正缺显式守卫仅 ImagePreview（→C-3）。

核验：

- **类型层属实**：`packages/react/src` 类型位 `any` 仅 **1** 处（`Table.tsx:267` 的 `new Map<string, any>()`，与 Vue `Table.ts:160` 镜像），`@ts-ignore`/`@ts-expect-error` **0** 处。
- **「真正缺显式守卫仅 ImagePreview」属实**：渲染期 DOM 访问的真正风险面是门户（`createPortal` 在 render 阶段执行）。实测全 React 共 **15 处门户**全部已守卫——`Dropdown`/`Drawer`/`Image`/`ImagePreview`/`Loading`/`Menu`/`Modal`/`Popconfirm`/`Popover`/`Spotlight`/`Tooltip` 经 `renderBodyPortal`（内含 `isBrowser()`），`ChartTooltip.tsx:93` 经 `if (isBrowser())`，`FloatButton.tsx:125` / `Tour.tsx:226` 的裸 `createPortal` 前置 `if (!isBrowser()) return null`（`:112` / `:149`）早退。C-3 之前 ImagePreview 确是唯一裸用 `createPortal(…, document.body)` 的渲染期门户，现已改 `renderBodyPortal`。
- **其余访问确在浏览器作用域**：`packages/react/src` 共 **103 处直接 `window.`/`document.` 成员访问、分布 31 个文件**，抽查均落在 `useEffect` / 事件处理器内；实测**无任何 `useState`/`useMemo`/`useRef` 初始化器内的渲染期 DOM 访问**。需要视口尺寸的 `Descriptions.tsx:106-107` 用 `useSyncExternalStore` + `getServerSnapshot` 正确兜底。
- **与 A-0 的两点对照（C-0 更严谨）**：
  1. C-0 未作「core 已统一 `isBrowser()`」式过度表述，而是如实写「绝大多数位于事件处理器与 `useEffect` 内（仅浏览器执行）」——与实测相符；
  2. C-0 未做「无效移交」——它把唯一缺口（ImagePreview）路由给**范围内**的 C-3（现已交付），而非甩给不覆盖本包的他任务。

**C-4 文档与延后判断可核实**：破坏性变更（3-tuple → 2-tuple）在 [CHANGELOG.md](../CHANGELOG.md) `:33-34` 与 [MIGRATION.md](MIGRATION.md) `:42-67` 双处齐备；声称「有意不迁移」的两组件理由经核实成立——`ScrollSpy.tsx:78` 的 `isControlled` 兼作 effect 模式开关、`NumberKeyboard.tsx:61` 在受控值读取时归一化，均非纯样板，留存合理。

**佐证 B-2**：React `Cascader` 空态经 `resolveLocaleText('No results found', notFoundText, mergedLocale?.common?.emptyText)`（`Cascader.tsx:297-300`）正确本地化——直接印证 B 审查 §3 的诊断：该处的跨端漏改是 **Vue 独有**，C-2 的 React 侧已如实交付。

### 4. 旁注（不计为缺陷）

- **同批未本地化残留在 React 侧同样存在且与 Vue 对称**：`Select.tsx:79-80` 的 `noOptionsText`/`noDataText`、`FileManager` 的 `emptyText`，以及三组件主 `placeholder`（`'Select an option'`/`'Please select'`）。后者 C-2 进度注已显式说明「`common` 无对应 key 暂不改，留待后续视需要新增 key」，属跨端对称的已知刻意延后，非破约——与 Vue 审查 §4 同源。
- **非空断言**：由扫描期「约 17 处」收敛至 **~6 处残留**（`FileManager.tsx:120/121/123`、`ImageCropper.tsx:165/216`、`RichTextEditor.tsx:84`），均非 C-0 所指「带默认值 prop」型，与 Vue B-5 残留 ~6 处镜像，符合 C-0「宜随 B-5 同批收敛」的说法。
- **C-0 的扫描期计数**（i18n「10 组件消费」、断言「约 17 处」）现已被 C-1/C-2/B-5 推进，属陈述精度（可标注为扫描期基线），非缺陷。

### 5. 建议

供 ROADMAP 维护者取舍，本审查文档不代改 ROADMAP / 代码：

1. **已完成的 C-0 ～ C-4 无需返工**（与任务 A / B 各有一处需修不同）。
2. **（可选 P2）回填一条跨端跟踪项**：把 §4 的未本地化残留（`Select` 的 `noOptionsText`/`noDataText`、`FileManager` 的 `emptyText`）登记到「后续优化任务」——因与 Vue 同源，可与任务 B 审查 §5 第 2 条合并为单条跨端条目（统一接入 `resolveLocaleText(..., mergedLocale.common.*)` 并把默认值改为 `undefined`）。
3. **（可选，陈述精度）**：C-0 的扫描期计数（i18n「10 组件消费」、断言「约 17 处」）可标注为「扫描期基线，现经 C-1/C-2/B-5 推进」。
4. **C-5（React 巨石拆分）已于 2026-06-21 交付并勾除**，补审见下方 §6（结论：无需返工）。

## 任务 C 补充 — C-5（React 巨石拆分）补审

> 首轮（§1 ～ §5）审查时 C-5 尚未交付。其后 ROADMAP「进度（2026-06-21）」两批交付并把 C-5 勾除（Picker 三件套 + Menu/Tree），本节据 ROADMAP C-5 条目与 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 对源码、git 提交范围与质量门禁逐项补审。

### 6. C-5 逐条核验结果

- **声称**：`Select`/`DatePicker`/`TimePicker`/`Menu`/`Tree` 五个单文件巨石按 `Table/` 范式拆为 `<Comp>/`（`state.ts` 状态 hook + `render-*` + `icons` + `types`），wrapper 瘦身、公共导出 / props 类型 / 渲染 / a11y 不变；DatePicker/TimePicker 受控值接入 `useControlledState`（C-4 遗留），Select 全受控仅结构拆分；纯逻辑续调 core、**无新增 core 抽取**；**公共 API 基线（`api-reports`）无变化**；React 全量单测（2872）绿。
- **方法**：`wc -l` 核对 wrapper / 子模块行数；读 5 个 wrapper 确认 re-export 面；`grep` 核对 `useControlledState` 接入；`git show --stat` 核对两提交（`8170fb0e` Picker、`8ef183f6` Menu/Tree）是否触及 `packages/core/src` 与 `api-reports`；实跑 `pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline`、`pnpm test:react`。

| 子项                           | 核验    | 证据                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Picker 三件套结构拆分          | ✅ 属实 | `8170fb0e` 仅新增 `Select/`(state 514 + render-option 87 + icons 38 + types 102)、`DatePicker/`(state 557 + render-calendar 166 + render-mobile 81 + icons + types)、`TimePicker/`(state 476 + render-desktop 137 + render-mobile 60 + icons + types)；wrapper 瘦身至 DatePicker 71 / TimePicker 116（与声称一致）、Select 86（声称 82，微差） |
| Picker 受控迁移（C-4 遗留）    | ✅ 属实 | `DatePicker/state.ts:22/87/95` 与 `TimePicker/state.ts:22/80/86` 接入 `useControlledState`，在 hook 边界把值解析对齐 `onChange` 值空间（注释明引 C-4 "aligned" 判断）；`Select/state.ts` 的 `useSelectState` 无 `useControlledState`（本即全受控，仅结构拆分）——兑现 C-4「Select/DatePicker/TimePicker 受控迁移并入 C-5」承诺                  |
| Menu 拆分 + 导出面保全         | ✅ 属实 | `8ef183f6` `Menu.tsx` −901→88 行；`Menu/`(context 10 + state 157 `useMenuRootState` + menu-item 143 + submenu 421 + menu-item-group 43 + icons + types 118)；`Menu.tsx:15-25` 原样 re-export `useMenuContext`/`MenuItem`/`SubMenu`/`MenuItemGroup` + 5 个类型；包入口 `index.tsx:156-166` 同样齐备                                             |
| Tree 拆分                      | ✅ 属实 | `Tree.tsx` −834→65 行；`Tree/`(state 437 `useTreeState` + render-row 142 + render-node 33 + icons 45 + types 258)；wrapper 用 `useTreeState` + `renderTreeNode`/`renderTreeRow`，re-export `TreeProps` + 默认导出，保留 `role="tree"`/`aria-multiselectable` 等 a11y 面                                                                        |
| 无新增 core 抽取               | ✅ 属实 | `git show --stat 8170fb0e` 与 `8ef183f6` 均**未触及 `packages/core/src`**（两提交也不在 `git log -- packages/core/src` 命中列表内），纯逻辑续调既有 core util                                                                                                                                                                                  |
| 公共 API 基线无变化            | ✅ 属实 | 两提交均未改 `api-reports`；`pnpm api:baseline` 重生成仅得 **1 行 CRLF 行尾差异**（`'pagination'\n>`→`'pagination'\r\n>`，本机 Windows 检出噪声，非语义变更）；`pnpm types:check`（公共 props 类型齐备）+ `pnpm api:validate`（一致性 0 问题）双绿                                                                                             |
| 行为 / 渲染 / a11y 不变 + 单测 | ✅ 属实 | 实跑 `pnpm test:react`：**129 文件 / 2872 测试全过**，与声称的 2872 完全一致；wrapper 保留 `role=menu/tree/listbox`、`aria-haspopup/expanded/controls/activedescendant`、data-attr 等 a11y 面                                                                                                                                                  |

**结论**：C-5 全部子项属实——一次干净的结构性拆分：公共导出 / props 类型 / a11y 面不变，行为由全量单测（2872 全过）与 `types:check` / `api:validate` / API 基线护栏共同背书，且**未引入任何 core 改动或 API 基线变更**。与 C-0 ～ C-4 一致，**无需返工**。**至此任务 C（C-0 ～ C-5）全部审毕，结论：零返工缺陷。**

**旁注（陈述精度，不计为缺陷）**：

- Select wrapper 实测 **86** 行（ROADMAP 交付注写 82），DatePicker 71 / TimePicker 116 与交付注一致；差异微小、不影响结论。
- 交付注的「拆前」行数（679 / 835 / 754）与 C-5 问题陈述的扫描期计数（Select 666 / DatePicker 847 / TimePicker 775，2026-06-19）取自不同时点（前者为 C-1 ～ C-4 落地后、拆分前的实测，后者为扫描期），属陈述精度。

## 任务 D — 跨框架一致性扫描

> 本节是对 [ROADMAP.md](ROADMAP.md) 「任务 D — 跨框架一致性扫描」**已勾选完成项**（D-0 ～ D-4，ROADMAP 标注全部「已交付 2026-06-20」）的独立审查记录。结论与建议供维护者取舍，**不修改 ROADMAP 原文，也不改组件代码**。

### 1. 审查范围与方法

- **范围**：ROADMAP「任务 D — 跨框架一致性扫描」的核查结论 D-0 与优化项 D-1 ～ D-4（目标路径 `packages/core` + `packages/vue` + `packages/react`）。
- **方法**：逐条把 ROADMAP / CHANGELOG / MIGRATION 声称项对照
  - 三端源码（`grep` 定位下沉的 core util 与双端 import/调用点 + 直接读取关键文件）；
  - [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 与 [MIGRATION.md](MIGRATION.md) 的逐条落地说明；
  - `scripts/validate-api.mjs` 的 `CONTROLLED_PARITY` 受控量护栏实现（D-4）；
  - 实跑两个只读门禁坐实 D-0/D-4 的「跑通基线」「护栏在岗」：`pnpm api:validate`（✅ 0 问题）、`pnpm types:check`（✅ 全部公共 props 类型已导出）。

### 2. 逐条核验结果

| 项  | 声称                                                                                          | 核验              | 证据                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1 | 跨端键盘导航纯逻辑下沉 core，双端 Tree/Mentions/TimePicker/Menu 改调                          | ✅ 属实           | core 新增 `tree-utils.ts:124/51` `getTreeKeyboardAction`/`getFirstVisibleChildKey`、`picker-utils.ts:96` `getCyclicIndex`、`timepicker-utils.ts:179` `focusTimePickerOption`、`menu-utils.ts:493` `getMenuNavigationKeys`；双端 **直接 import 调用**（Vue `Tree.ts:734`/`Mentions.ts:84`/`TimePicker.ts:399`/`Menu.ts:533`；React `Tree/state.ts:346`/`Mentions.tsx:90`/`TimePicker/state.ts:206`/`Menu/{menu-item,submenu}.tsx`）——无 hooks/composable 包装层，符合实现判断 1；CHANGELOG 行 16/26/27 记录                                                                                                                                                                                               |
| D-2 | 命令式实例计数器 + InputNumber 显示/解析下沉 core，双端改调                                   | ✅ 属实           | core 新增 `imperative-api.ts:29` `createInstanceCounter`、`input-number-utils.ts:195/212` `formatInputNumberDisplay`/`parseInputNumberValue`；双端 Message/Notification 的 `getNextInstanceId`（原 4 份内联：Vue `Message.ts:61`/`Notification.ts:86`、React `Message.tsx:44`/`Notification.tsx:68`）+ InputNumber `toDisplay/parse`（Vue `InputNumber.ts:129/136`、React `InputNumber.tsx:89/93`）均改调；`normalizeOptions` 修正成立（双端 `Message` 仅 `import normalizeStringOption` 薄包装，未改）；CHANGELOG 行 18/30                                                                                                                                                                              |
| D-3 | 跨端受控量/回调命名对称（硬改名 + 迁移）                                                      | ✅ 属实           | ImageViewer React `onCurrentIndexChange`（`ImageViewer.tsx:40`，Vue `ImageViewer.ts:115` `update:currentIndex` 对称）；CommentThread Vue `update:expandedKeys`（`CommentThread.ts:117`，原 `expand-change` 已除）；Spotlight Vue 移除 `close`（`Spotlight.ts:148` emits 仅 `open-change`/`update:open`）；Signature React 新增 `onClear`（`Signature.tsx:46`）；hiddenColumnKeys 双端拉齐（React `DataTableWithToolbar.tsx:104` `onHiddenColumnKeysChange`、Vue `DataTableWithToolbar.ts:263` `hidden-column-keys-change`）；DataTableWithToolbar React `extends Omit<TableProps>`（`:53-54`）继承 + `{...remainingTableProps}`（`:551`）转发，修正成立；CHANGELOG 行 17/38-41 + MIGRATION 行 11-37 齐备 |
| D-4 | `validate-api` 受控量 parity 护栏（表 + 白名单）                                              | ✅ 属实           | `scripts/validate-api.mjs:262` `CONTROLLED_PARITY` 登记 4 项（`currentIndex`/`expandedKeys`/`query`/`hiddenColumnKeys`）；`readComponentSource`（`:278`）读主文件 + `<Comp>/` 子目录兼容拆分组件（Table）；per-entry `reactCallback`/`vueEvent` 覆盖（`:293-294`）+ 空 `PARITY_WHITELIST`（`:271`）；`pnpm api:validate` 实跑通过，护栏在岗                                                                                                                                                                                                                                                                                                                                                              |
| D-0 | 双端基线一致（`api:validate`/`types:check` 跑通、`open` 三件套、结构性 parity、薄包装方法论） | ✅ 属实且陈述严谨 | `pnpm api:validate` 0 问题、`pnpm types:check` 全部公共 props 类型已导出（实跑双绿）；`open`/`update:open`/`onOpenChange` 三件套全量成立；双端 `extends` 同一份 `core/src/types/*.ts` Props 类型保证结构性 parity；薄包装判定成立（如 `normalizeStringOption`），D-1/D-2 据此区分「重复实现」与「对 core util 的薄包装」                                                                                                                                                                                                                                                                                                                                                                                 |

**结论**：D-0 ～ D-4 全部属实、CHANGELOG / MIGRATION 记录齐全、`api:validate` 受控量护栏在岗且通过 —— **无需返工**。与任务 C 同属**零返工缺陷**的干净结果，无任务 A（A-0 的 SSR 过度表述 + 无效移交）、任务 B（B-2 的 Vue Cascader 空态漏改 bug）那类缺陷。

### 3. 无可返工缺陷；护栏在岗（与任务 A / B 的正向对照）

任务 D 的已完成项未发现 A/B 那类缺陷，三点佐证其干净：

- **下沉真落地、双端真接入**：D-1/D-2 声称的 6 个 core util 全部存在，且 Vue / React 双端**均直接 import 调用同一份实现**（非仅 core 抽了壳、组件仍内联）；实现判断「不引入 hooks/composable 包装层」与实际范式（如 Select 消费 `picker-utils`）一致。
- **改名有据、文档齐备、对称可核**：D-3 五处改动均在源码落地，破坏性项（ImageViewer / CommentThread / Spotlight）在 CHANGELOG `## Unreleased`（行 38-41）与 MIGRATION（行 11-37，含前后代码对照）双处登记；ImageViewer 双端**完全对称**（Vue `update:currentIndex` ↔ React `onCurrentIndexChange`），CommentThread 达成**受控量对称**（`update:expandedKeys` 可 `v-model:expanded-keys`）。
- **护栏是活的、不是描述性的**：D-4 把 `open` overlay 规则推广为 `CONTROLLED_PARITY` 表并实跑 `api:validate` 通过；其逻辑（派生 `update:<prop>` ↔ `on<Prop>Change`、读主文件 + `<Comp>/` 子目录、per-entry 覆盖）经读源确认无误，能对登记的 4 项受控量做双端配对校验。
- **与 A-0 的正向对照**：D-0 未作「已统一/已穷尽」式过度表述，也未把问题移交不覆盖本范围的他任务 —— 它对结构性 parity 给出**有据的收窄判断**（双端 `extends` 同一份 core Props 类型，故无需逐 prop 对照），并把真正分歧明确归口到本任务内的 D-3（事件/回调层）。

### 4. 旁注（不计为缺陷，均为有意为之且已记录）

- **CommentThread 跨端回调命名残留非对称**：Vue `update:expandedKeys`（按 prop 名派生应为 `onExpandedKeysChange`）↔ React 实际为 `onExpandedChange`（`CommentThread.tsx:45`）。`validate-api.mjs:265` 以 `reactCallback: 'onExpandedChange'` **显式登记**并注明「React 端历史回调名」，CHANGELOG 行 40 亦如实写「与 React `onExpandedChange` 对齐」—— 系刻意不二次破坏 React 公共 API 的取舍。故 D-3「统一受控量/回调命名」对 ImageViewer **完全达成**（双端均 `currentIndex` 派生），对 CommentThread 仅达成「受控量对称」而非「名字逐字一致」。属已文档化的有意非对称，非缺陷。
- **D-4 parity 表覆盖面有意收窄**：护栏仅纳入 4 项受控量（`currentIndex`/`expandedKeys`/`query`/`hiddenColumnKeys`）+ 既有 `open` overlay 规则；其余受控量（`value`/`checked`/`activeKey`/分页 `current` 等）**不在守卫内**。这是 D-4 自陈「朴素全派生致 ~81 误报、故显式登记 + 可逐步扩充」的设计取舍（注释 `validate-api.mjs:256-258` 已声明）。代价：后续新增受控组件须手工补登 `CONTROLLED_PARITY`，否则其双端不对称会静默逃逸校验。
- **D-1 submenu 展开/收起状态机仍双端内联**：D-1 实现判断 3 明示本次只补方向键映射（`getMenuNavigationKeys`），submenu 展开/收起状态机（「风险高、价值低」）保持双端内联。故键盘导航下沉是**部分**下沉，此残留跨端重复为显式 scope-out，非遗漏。

### 5. 建议

供 ROADMAP 维护者取舍，本审查文档不代改 ROADMAP / 代码：

1. **D-0 ～ D-4 无需返工**（与任务 A / B 各有一处需修不同，D 同任务 C 为零缺陷）。
2. **（可选，陈述精度）CommentThread 命名非对称的可见性**：该非对称已被 `validate-api.mjs:264-265` 注释 + CHANGELOG 行 40 记录；若希望对组件消费者更显眼，可在 skill reference / MIGRATION 补一句「CommentThread 的 React 回调为 `onExpandedChange`（对应 Vue `update:expandedKeys`）」。属可选优化，非必须。
3. **（可选，陈述精度）`CONTROLLED_PARITY` 仅守卫登记项**：护栏注释（`validate-api.mjs:258`）已声明「可随新增受控组件扩充」；可在「持续守护 → 发布门禁」或贡献指南补一行提示「新增受控量须同步登记 `CONTROLLED_PARITY`」，把「记得手工登记」固化为约定，降低未来受控量静默逃逸 parity 校验的概率。

## 任务 E — CLI 包扫描

> 本节是对 [ROADMAP.md](ROADMAP.md) 「任务 E — CLI 包扫描」**已勾选完成项**（E-0 ～ E-5，ROADMAP 标注全部「已交付/已核查」，分批于 2026-06-19 / 06-20 / 06-21 交付）的独立审查记录。结论与建议供维护者取舍，**不修改 ROADMAP 原文，也不改 CLI 代码**。

### 1. 审查范围与方法

- **范围**：ROADMAP「任务 E — CLI 包扫描」的核查结论 E-0 与优化项 E-1 ～ E-5（目标路径 `packages/cli/src/`）。
- **方法**：逐条把 ROADMAP / CHANGELOG 声称项对照
  - `packages/cli/src/` 源码（`grep` 定位 + 直接精读 `constants.ts` / `commands/*.ts` / `utils/validate.ts` / `templates/*.ts`）；
  - 测试 `tests/core/cli.spec.ts`（核验每条声称是否有对应红线护栏）、`pnpm-workspace.yaml` 与 example `package.json`（E-5 catalog 对齐）；
  - [CHANGELOG.md](../CHANGELOG.md) `## Unreleased` 的逐条落地说明；
  - **git 提交交叉核对**：`5f58a48a`（“修复 CLI 生成崩溃” = E-1）、`05cf5ce2`（“Tighten CLI validation and doctor checks” = E-3/E-4/E-5 一批，`tests/core/cli.spec.ts` +219 行 / +12 例 `it`）。

### 2. 逐条核验结果

| 项  | 声称                                                                 | 核验    | 证据                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E-0 | 模板主路径（Tailwind v4 接入）+ 版本主线（1.3.4）已对齐、受脚本守护  | ✅ 属实 | `templates/vue3.ts:81/84` 与 `templates/react.ts:102/105` 均 `@tailwindcss/vite`，CSS `@import "tailwindcss";` + `@plugin "@expcat/tigercat-core/tailwind/modern";`（`vue3.ts:193-194` / `react.ts:199-200`）；`constants.ts:2` `CLI_VERSION='1.3.4'`、`:15` `TEMPLATE_VERSIONS.tigercat='^1.3.4'`、CLI/root `package.json` 均 `1.3.4`；`sync-version.mjs` / `check-release-readiness.mjs` 覆盖该主线                                                                      |
| E-1 | `generate` 已存在文件路径不再 `ReferenceError` 崩溃 + 回归测试       | ✅ 属实 | `commands/generate.ts:5` 已 `import { …, logWarn }`，已存在路径走 `logWarn('… already exists, skipping')`（test 用 `:234-236`、doc-template `:260-262`）后 `continue`/`return` 不崩溃；测试 `cli.spec.ts:792`（spec 已存在不覆盖不崩溃）、`:802`（doc-template 同）双覆盖                                                                                                                                                                                                  |
| E-2 | package `files` 移除不存在的 `templates`                             | ✅ 属实 | `packages/cli/package.json:30-32` `files: ["dist"]`，无 `templates`；模板实为 `src/templates/*.ts`，经 tsup 内联进 `dist/index.js`（`bin`/`main`/`module`/`types` 均指向 `./dist/index.js`）                                                                                                                                                                                                                                                                               |
| E-3 | 命令参数校验：`create`/`add`/`playground` 非法输入快速失败           | ✅ 属实 | `utils/validate.ts` 导出四件套 `validateProjectName(:16)`/`suggestProjectName(:28)`/`isFramework(:45)`/`resolveTemplateOption(:55)`；`create.ts:24-28` 非法名 fail + 建议名、`:30` 非法 `--template` fail（不落入 prompt）、`:38` 确认文案「Overwrite conflicting template files? (other files are kept)」；`playground.ts` 复用 `resolveTemplateOption`；`add.ts:112-115` 非法 `--framework` 在自动检测**之前**快速失败；测试 `cli.spec.ts:533-551`（3）+ `:580-599`（3） |
| E-4 | doctor 深度诊断：framework peer 兼容矩阵 + 注入式 `Core exports`     | ✅ 属实 | `doctor.ts:46` `FRAMEWORK_PEER_RANGES`（vue ^3 / react+react-dom ^19），`:408` `createCompatibilityMatrixCheck` 经 `getRangeMajor(:555)`/`isOlderMajor(:563)` 过旧即 `fail`；`:23-29` `DoctorOptions.readCorePackageJson` DI、`:55` `REQUIRED_CORE_EXPORTS`（5 子路径）、`:449` `createCoreExportsCheck` 缺失 `fail`、不可解析返回 `null` 跳过；测试 `cli.spec.ts:626-708`（矩阵 fail / 缺子路径 fail / 全齐 pass / 不可解析 skip 四例）                                   |
| E-5 | 模板工具链版本单一来源：catalog 补项 + example 改 catalog + 红测护栏 | ✅ 属实 | `pnpm-workspace.yaml:24/32/33` 补 `@vitejs/plugin-react`/`@vue/tsconfig`/`vue-tsc`；example vue3 `package.json` `@vue/tsconfig`/`vue-tsc` 改 `catalog:`、react 改 `@vitejs/plugin-react` `catalog:`；`cli.spec.ts:129` 13 项 `TEMPLATE_VERSIONS↔catalog` 对齐表 + `:155` example catalog 断言，把版本漂移转成红测                                                                                                                                                          |

**结论**：E-0 ～ E-5 全部属实、CHANGELOG 记录齐全、相应红线护栏（参数校验 / doctor 深度 / catalog 对齐）均在岗且有测试背书 —— **无需返工**。与任务 C / D 同属**零返工缺陷**的干净交付，无任务 A（A-0 的 SSR 过度表述 + 无效移交）、任务 B（B-2 的 Vue Cascader 空态漏改 bug）那类缺陷。

### 3. 无可返工缺陷；护栏在岗（与任务 A / B 的正向对照）

任务 E 的已完成项未发现 A/B 那类缺陷，三点佐证其干净：

- **崩溃修复有回归测试兜底**：E-1 不仅补 `logWarn` 导入消除 `ReferenceError`，还以 `cli.spec.ts:792/802` 两条「目标文件已存在 → 跳过且不崩溃」用例锁死行为，避免回退。
- **doctor 深度诊断用依赖注入做成可测**：E-4 的 `Core exports` 检查经 `DoctorOptions.readCorePackageJson` 注入读取器（与既有 `cwd`/`nodeVersion`/`env` 同范式），使「core 缺导出 → fail」「core 未安装 → skip」「全齐 → pass」三条分支无需真实安装即可在单测中覆盖（`cli.spec.ts:656-708`），是比纯描述更可靠的护栏。
- **与 A-0 的正向对照**：E-0 给出的是**有据的窄结论**（模板主路径 + 版本主线对齐、受 `sync-version`/`release:check` 守护），未作「已穷尽」式过度表述，也未把任何问题移交不覆盖本范围的他任务；E-2 在判定「CLI 公共 API 边界为 bin/root」后采**最小修复**（仅删 `files` 中不存在的 `templates`），未过度扩面。

**E-4 边界语义经读源确认合理**：兼容矩阵 `getRangeMajor`（`doctor.ts:555-561`）对 `workspace:`/`catalog:`/`file:`/`link:` 协议与缺失依赖返回 `null` → `isOlderMajor` 判 `false` 不误报（无法从协议推主版本，合理）；framework peer 的**存在性**由独立的 `createPeerDepsCheck`（`:326`）兜底，二者职责不重叠。`Core exports` 为「键存在性」检查（`:466` `subpath in exportsMap`），不验证目标文件真实可解析——代码注释 `:461` 已诚实声明「a real build would surface broken exports」，与声称口径一致。

### 4. 旁注（陈述精度，不计为缺陷）

- **E-5「单一来源」措辞偏理想化**：实为**两套并行权威**——`TEMPLATE_VERSIONS`（CLI 模板发布时内联，`constants.ts:13`）与 catalog（workspace/example 解析，`pnpm-workspace.yaml`），版本字符串仍双份存在，靠 `cli.spec.ts:129` 的对齐测试**锁步**。测试自带注释（`:130-131`「TEMPLATE_VERSIONS is the single source for CLI templates; the catalog is the single source for example/workspace deps」）比 ROADMAP 的「catalog 成为单一来源」更准确。锁步护栏可靠，结论不受影响。
- **E-3「+12 例单测」归属**：12 例是 `05cf5ce2` 整批（E-3/E-4/E-5）新增总数（3 validate + 3 argument + 4 doctor 深度 + 2 catalog 对齐 = 12）；E-3 自身实为 6 例（validate + argument），E-3 条目把 12 全记在自己名下属批次口径，批次总数无误。
- **E-3 `add` 的 `normalizeFramework` 现部分冗余**：`add.ts:112-115` 已对非法 `--framework` 在 `normalizeFramework(:46)`／自动检测**之前**快速失败，故 `normalizeFramework` 的「非法 → `null`」分支对非法值已不可达，仅余「合法 → 透传 / `undefined` → `null`」语义。无害的轻微冗余，非缺陷。
- **E-3 `validateProjectName` 为 npm 名规则的明示子集**：`validate.ts:7-13` 注释已声明「Subset of the npm package name rules」，足以拦截会令生成 `package.json` 安装失败的名字，未覆盖 npm 全部保留名/核心模块名等边角 —— 系刻意收窄，非遗漏。

### 5. 建议

供 ROADMAP 维护者取舍，本审查文档不代改 ROADMAP / 代码：

1. **E-0 ～ E-5 无需返工**（与任务 A / B 各有一处需修不同，E 同任务 C / D 为零缺陷）。
2. **（可选，陈述精度）E-5「单一来源」措辞**：可在 ROADMAP E-5 条目把「使 catalog 成为单一来源」改述为「`TEMPLATE_VERSIONS` 与 catalog 双份、由 `cli.spec.ts` 对齐测试锁步防漂移」，与代码注释（`cli.spec.ts:130-131`）口径一致；纯措辞，无需动代码/测试。
3. **（可选，陈述精度）E-3「12 例」批次口径**：如需逐项精确，可在 ROADMAP 注明该 12 例覆盖 E-3/E-4/E-5 三项（E-3 自身 6 例）。
4. **（可选，护栏可见性）catalog 锁步约定固化**：可在「持续守护 → Tailwind v4 / 发布门禁」或贡献指南补一行「新增模板工具链依赖须同步登记 `TEMPLATE_VERSIONS` 与 catalog」，把 E-5 的「记得双写」固化为约定（现已有红测拦截漂移，此为锦上添花）。
