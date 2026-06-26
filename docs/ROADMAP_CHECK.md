# Tigercat 路线图扫描记录

<!-- LLM-INDEX
type: roadmap-scan
scope: ROADMAP「最新一轮全代码扫描」任务 A-B；任务 C 组件分组扫描 C01「基础动作与文本」（C01-1~C01-8）、C06「Steps/Tabs」（C06-1~C06-6）、C07「Menu 单组」（C07-1~C07-8）
verified-date: 2026-06-26
source: 任务 A：实读 packages/{core,react,vue,cli}/src/index* 与 package.json；scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs；根 package.json scripts；api-reports/public-api-baseline.json（含 git show HEAD 对照）；skills/tigercat/references/component-index.md；.prettierignore/.prettierrc.json。实跑 pnpm api:validate / types:check（均通过）、pnpm api:baseline / docs:api（生成后 git diff 取证再 git checkout 还原）。Grep packages/*/src 的 @deprecated（0 命中）。任务 B：实读 packages/core/src/{types,utils,themes,theme-runtime,tokens}、tailwind entry/plugin、packages/core/tokens、packages/core/package.json、packages/core/tsup.config.ts、React/Vue DatePicker 与 ConfigProvider、相关 tests/core；实跑 pnpm types:check / api:validate / 目标 vitest（均通过）。任务 C/C01：实读 8 组件（Button/ButtonGroup/Link/Text/Code/Icon/Tag/Badge）的 core 类型 types/{button,link,tag,badge,icon,text,code}.ts、core 工具 utils/{button,badge,tag,text,link,icon,group}-utils.ts 与 class-names/compose-classes/coerce-class-value/svg-attrs/dev-warn/common-icons、theme-runtime/colors.ts，packages/{react,vue}/src/components 的 8 组件实现，tests/{react,vue} 对应 spec，component-index.md；静态实读取证（含 grep 取证 role/label/helper 用法），C01 为仅文档变更未跑门禁命令。任务 C/C06：实读 Steps/StepsItem/Tabs/TabPane 的 core 类型 types/{steps,tabs}.ts、core 工具 utils/{steps,tabs}-utils.ts、packages/{react,vue}/src/components/{Steps,StepsItem,Tabs,TabPane}、tests/{react,vue}/{Steps,Tabs}.spec 与 tests/core/tabs-utils.spec.ts、skills/tigercat/references/{component-index.md,shared/props/navigation.md,examples/navigation.md}；实跑 C06 目标 vitest、pnpm api:validate、pnpm types:check（均通过）。任务 C/C07：实读 Menu/MenuItem/MenuItemGroup/SubMenu 的 core 类型 types/menu.ts、core 工具 utils/menu-utils.ts（并对照 utils/focus-utils.ts）、packages/react/src/components/Menu.tsx 与 Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}、packages/vue/src/components/Menu.ts 单文件与 {MenuItem,MenuItemGroup,SubMenu}.ts re-export、tests/{react,vue}/Menu.spec.ts* 与 tests/core/menu-utils.spec.ts、skills/tigercat/references/component-index.md；grep 取证 focus-utils 菜单函数消费者仅 Dropdown、React Menu 子组件无 displayName、Vue {class,style,...rest} 透传样板（7 处）；实跑 C07 目标 vitest（tests/react/Menu.spec.tsx + tests/vue/Menu.spec.ts + tests/core/menu-utils.spec.ts，3 文件 119 测试通过）、pnpm api:validate、pnpm types:check（均通过）。
note: 本文仅记录可验证发现与修复建议；扫描阶段不改组件代码、不改公共 API、不运行会重写生成产物的命令。结论与建议供维护者取舍。
-->

> 本文是对 [ROADMAP.md](ROADMAP.md)「最新一轮全代码扫描」按任务顺序执行的扫描结果记录。**不改组件代码、不改公共 API**；每条发现给出 `发现问题 / 公共内容决策 / 建议修复顺序 / 目标验证命令`。优先级：P1 影响发布门禁/正确性；P2 影响文档准确性与可维护性；P3 清理项。

---

## 任务 A — 公共 API、导出面与文档生成链路扫描

**扫描范围**：`packages/*/src/index*`、`packages/*/package.json`、`api-reports/`、`scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs`、`skills/tigercat/references`。

**结论速览**：双端组件值导出对称、`api:validate` / `types:check` 通过、源码 `@deprecated` 零残留（基础面健康）。但发现 **3 条需处理项**：① 公共 API 基线既滞后于源码、其校验门禁又因格式不匹配在所有平台恒失败（P1）；② 生成的「权威组件索引」用错了数据源，误列/漏列组件（P2）；③ 「从 index 枚举公开组件」逻辑在三个脚本里各写一份且口径不一（P2，亦是 ② 的根因）。其余为低优先清理与刻意的框架差异。

---

### A-1 导出完整性与双端对称

**发现问题**

- ✅ 组件值导出双端对称：`validate-api.mjs` 的 `missing-react` / `missing-vue` 跨框架检查 0 命中；`api:baseline` 报告 `148 vue / 148 react components`。无单端缺失组件。
- ✅ Props 类型导出齐全：`types:check`（`check-public-types.mjs`）通过——但注意该脚本只按「组件**文件名**」校验 `${prefix}${File}Props`，对单文件多导出的子组件（MenuItem/SubMenu、PrintPageBreak、StepsItem、DropdownMenu/Item 等）不单独校验，存在覆盖盲区（与 A-5 同源，见该节）。
- ⚠️ P3｜Vue index 冗余且与 React 不对称的核心类型再导出：[packages/vue/src/index.ts:9](../packages/vue/src/index.ts) 用 `export type { DrawerPlacement, DrawerSize, ListItem, TableColumn, TreeNode, UploadFile } from '@expcat/tigercat-core'`，而上一行 [:8](../packages/vue/src/index.ts) 已 `export * from '@expcat/tigercat-core'` 全量再导出，这 6 个类型属重复；React index 仅靠 `export *`（[packages/react/src/index.tsx:8](../packages/react/src/index.tsx)），无此块。
- ℹ️ 刻意的框架差异（非缺陷）：React 暴露 context 钩子/类型与 ref 句柄（`useFormContext`、`FormHandle`、`FormSubmitEvent`、各 `*ContextValue`、`SignatureRef`/`ImageCropperRef`/`CarouselRef`、`useControlledState`）；Vue 暴露 `v-model` 取向的类型（`VueDatePickerModelValue`、`VueTimePickerModelValue`、`TigerConfig`、`AnchorContext`）。属 React Context/forwardRef vs Vue v-model/expose 的惯用差异，`validate-api` 的 overlay/受控量 parity 检查均通过。

**公共内容决策**

- A-1 冗余再导出：**拆出/删除**（删 Vue index 第 9–16 行的 6 类型再导出，统一只靠 `export *`）；或维持现状仅作风格统一——低优先。
- 框架差异类：**保持框架分离**，不强行对齐，仅在文档说明。

**建议修复顺序**：随 A-7 一并处理（低优先，可延后）。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

### A-2 package.json 导出映射

**发现问题**

- ✅ core 导出映射完整一致：[packages/core/package.json](../packages/core/package.json) 列 13 个 `./locales/*` + 13 个 `./datepicker-locales/*` + 5 个 `./icons/*` + `./tailwind`、`./tailwind/modern`、`./tokens.css`、`./figma-variables.json`、`./utils/table-export`。与源码目录逐一吻合：`packages/core/src/utils/i18n/{locales,datepicker-locales}/` 各正好 13 个 locale 文件（+ index）。无「列了导出却缺源」或「有源却未导出」。
- ⚠️ P3｜core 的 locale/datepicker/icon 子路径为**手工枚举**（38+ 条），新增 locale 时需手动改 package.json，且无自动护栏校验「源 locale 文件 ↔ 导出映射」同步。当前无缺陷，属维护风险。
- ℹ️ 刻意差异（非缺陷）：React/Vue 为 **ESM-only**（`exports["."]` 仅 `import`/`default`，无 `require`），core 为 import+require 双格式；`sideEffects` 在 core 为 `false`、在 React/Vue 列了 chunk/component 通配（与 tree-shaking 取舍相关，归 Task F 体积扫描深究）。

**公共内容决策**：locale↔导出映射同步校验属**脚本 helper 候选**（可与 G 类脚本扫描合并），非组件公共内容；其余保持现状。

**建议修复顺序**：P3，可延后到 Task G（脚本/自动化扫描）。

**目标验证命令**：`pnpm api:baseline:check`、`pnpm example:build`。

---

### A-3 废弃 API 残留

**发现问题**

- ✅ `packages/*/src/**/*.{ts,tsx}` 全量 Grep `@deprecated` **0 命中**；`validate-api.mjs` 的 `deprecated-in-example` 检查无可标记项。无废弃 API 残留、无示例误用废弃 API。前几轮清理（如 `kanbanAddCardClasses`、`shouldLoadMore`）已落地干净。

**公共内容决策**：无。

**建议修复顺序**：无需处理。

**目标验证命令**：`pnpm api:validate`。

---

### A-4 公共 API 基线（api-reports）— **P1**

**发现问题**

- 🔴 P1｜**基线内容滞后于源码**：`api-reports/public-api-baseline.json`（已提交版）缺少源码中确已存在的核心导出。格式无关取证：
  - `git show HEAD:api-reports/public-api-baseline.json | grep -c TigerLocaleTimePicker` → **0**，但源码定义于 [packages/core/src/types/locale.ts](../packages/core/src/types/locale.ts)（另见 locale-utils.ts）。
  - `git show HEAD:… | grep -c ZH_CN_UPLOAD_LABELS` → **0**，但源码定义于 [packages/core/src/utils/locale-utils.ts](../packages/core/src/utils/locale-utils.ts)、`utils/i18n/locales/zh-CN.ts`。
  - 即 baseline 未在这些导出加入后重新生成。
- 🔴 P1｜**基线校验门禁恒失败（跨平台，非 Windows 特有）**：[scripts/generate-api-baseline.mjs:219](../scripts/generate-api-baseline.mjs) 用 `JSON.stringify(snapshot, null, 2)` 直写——非空数组**永远多行**、且**不经 prettier**；但 `.prettierignore`（[查看](../.prettierignore)）未排除 `api-reports/`，故 `pnpm format` 会用 prettier 把短数组压成单行（printWidth 100），**已提交基线即 prettier 压缩态**（如 `AffixProps.props` 单行）。而 `api:baseline:check = pnpm api:baseline && git diff --exit-code api-reports`（[package.json:53](../package.json)）中间**无格式化步骤**：重生成的多行 ≠ 已提交的单行 → `git diff --exit-code` 必非零 → 门禁恒失败，真实内容漂移（上一条）被淹没在格式 diff 里（本轮重生成 diff 达 +497/−79，绝大多数是短数组 reflow）。
  - 对照：`generate-api-docs.mjs` 自身调用 prettier（`formatMarkdown`），故 `docs:api:check` 不存在此类格式错配（见 A-5）。两者范式应统一。

**公共内容决策**：属**脚本/门禁修复**（非组件公共 API 变更）。基线本身已是 core/vue/react 三端共享快照，无需再拆合。

**建议修复顺序**（P1，建议本轮后优先）：

1. 让基线生成自带格式化——在 `generate-api-baseline.mjs` 输出前过一遍 prettier（对齐 `generate-api-docs.mjs` 范式）；或在 `api:baseline:check` 内于 diff 前补 `prettier --write api-reports`；或把 `api-reports/` 加入 `.prettierignore` 并以「生成器原样多行」重生成提交。三选一，使「生成器输出 == 已提交格式」。
2. 修好格式错配后重跑 `pnpm api:baseline`，审阅暴露出的真实新增（`TigerLocaleTimePicker`、`ZH_CN_UPLOAD_LABELS` 等），确认无意外破坏后提交刷新基线（按需在 MIGRATION/changeset 记录）。

**目标验证命令**：`pnpm api:baseline`、`pnpm api:baseline:check`、`pnpm quality:release`（其内含该门禁）。

---

### A-5 生成 references 漂移与「组件索引」生成逻辑 — **P2**

**发现问题**

- 🟠 P2｜**「权威组件索引」用错数据源，误列/漏列组件**：[skills/tigercat/references/component-index.md](../skills/tigercat/references/component-index.md) 自称 canonical route map，但 [generate-api-docs.mjs](../scripts/generate-api-docs.mjs) 的 `getComponentRows`/`propsToComponents` 是从 **core `*Props` 接口 + 文件名兜底**推导组件，而非读真实 index 导出，导致：
  - **误列（不是导出组件）**：`TableToolbar`——来自 [composite.ts:968](../packages/core/src/types/composite.ts) 的 `TableToolbarProps`，但两端 index 都不导出 `TableToolbar`（生成器自己的 `COMPONENT_USAGE_NOTES.TableToolbar` 都注明「不作为独立组件导出」）；`Drag`——`drag.ts` 无任何 `*Props` 接口，被 `getComponentRows` 的文件名兜底 `kebabToPascal('drag')` 凭空造出（公共 API 只有 `useDrag` 钩子/组合式）。
  - **漏列（确为导出组件）**：`StepsItem`、`PrintPageBreak`——两端 index 均导出（[react index.tsx:178/376](../packages/react/src/index.tsx)、[vue index.ts:150/344](../packages/vue/src/index.ts)），但其 Props 不在 core 类型里（[steps.ts](../packages/core/src/types/steps.ts) 仅 `StepsProps`、[print-layout.ts](../packages/core/src/types/print-layout.ts) 仅 `PrintLayoutProps`；Vue `PrintPageBreak` 本身无 props），故生成器看不到、不收录。
  - 该索引「自洽」（已提交版与重生成版一致），所以 `docs:api:check` 不报错——属**生成逻辑缺陷**而非漂移，门禁照样放行。
- 🟢 P3（本机噪声，非真实漂移）：本检出上 `pnpm docs:api` 后 `git diff` 显示约 21 个 references 文件「changed」，全部伴随 `LF will be replaced by CRLF` 警告——CRLF/prettier 本机噪声（与记忆中「prettier 在本检出为红」一致）。真实漂移须在干净 CI 复核。

**公共内容决策**：见 A-7——根因是「公开组件枚举」逻辑分散且口径不一，应**合并为共享脚本 helper**，让 component-index 以真实 index 导出为权威来源（必要时辅以 core 类型补 Props 字段）。

**建议修复顺序**（P2，紧随 A-7）：

1. 先做 A-7 的共享 helper。
2. 改 `getComponentRows` 以「真实 index 导出的组件集」为准来产生行（Drag/TableToolbar 自然消失、StepsItem/PrintPageBreak 自然纳入），Props 字段仍可来自 core 类型，缺失 Props 的子组件按需走 `VIRTUAL_COMPONENTS` 或别名补齐。
3. 重生成并提交 references。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

### A-6 ~ A-7 文档生成链路一致性与公共拆合判断 — **P2**

**发现问题**

- 🟠 P2｜**「从 index 枚举公开组件」逻辑三处重复且口径不一**（核心拆合问题，亦是 A-5 根因）：
  - [validate-api.mjs:530 `collectPublicComponentExports`](../scripts/validate-api.mjs)：读真实 index、正则 `export {…} from './components/`、PascalCase、滤 `*Context`；并配 `DOC_SECTION_ALIASES`（StepsItem→Steps、PrintPageBreak→PrintLayout…）做覆盖校验——**口径最权威**（故其 LLM 文档覆盖检查能正确认到子组件，`api:validate` 通过）。
  - [generate-api-baseline.mjs:158 `componentExports`](../scripts/generate-api-baseline.mjs)：与上者近乎重复的 index 解析（读真实 index、同款正则与过滤）。
  - [generate-api-docs.mjs](../scripts/generate-api-docs.mjs)：**不读 index**，改从 core `*Props` + 文件名兜底推导——即 A-5 误列/漏列的来源。
  - 三套对「什么是公开组件」的定义不一致（baseline 报 148、component-index 报 147、且成员集不同），是典型的「该合未合」。
- ℹ️ `validate-api.mjs` 经核实**不存在** A-5 的盲区（靠别名表正确归并子组件）；问题集中在 `generate-api-docs.mjs` 用了不同且更弱的来源。

**公共内容决策**：**合并到共享脚本 helper**。把「解析框架 index → 公开组件/导出集（PascalCase、滤 Context、含子组件、别名表）」抽成单一模块（如 `scripts/lib/public-components.mjs`），由 `validate-api`、`generate-api-baseline`、`generate-api-docs` 三者共同消费；component-index 改以该权威集为准。属脚本层公共内容，不涉及组件运行时，不入 core 包。

**建议修复顺序**（P2）：A-7 抽 helper → A-5 改 component-index 生成 → A-4 修基线门禁格式错配并刷新（A-4 也可独立先行）。均为脚本/文档层改动，无公共 API 破坏。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm docs:api:check`。

---

### 任务 A 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| 公开组件枚举逻辑（A-6/A-7） | **合并→共享脚本 helper** | 三脚本各写一份、口径不一；抽 `scripts/lib/public-components.mjs` 统一。脚本层，不入 core。 |
| component-index 生成来源（A-5） | **改用权威来源** | 以真实 index 导出为准，Props 字段仍取 core 类型；消除 Drag/TableToolbar 误列、补齐 StepsItem/PrintPageBreak。 |
| api 基线格式/门禁（A-4） | **修复门禁（不拆合）** | 生成器自带 prettier 或门禁补格式化，使「生成==提交」，再刷新滞后内容。 |
| locale↔导出映射同步（A-2） | **延后（脚本 helper 候选）** | 归 Task G 脚本扫描，加同步校验；当前无缺陷。 |
| Vue index 冗余核心类型再导出（A-1） | **拆出/删除（低优先）** | 删 Vue index 第 9–16 行，统一靠 `export *`。 |
| React/Vue 框架差异类导出（A-1） | **保持框架分离** | Context/ref vs v-model 惯用差异，仅文档说明。 |

---

### 本轮验证命令实跑输出摘要（证据）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `pnpm api:validate` | ✅ 通过（0 问题） | 命名/双端 parity/overlay/受控量/废弃用法/文档覆盖均无问题 |
| `pnpm types:check` | ✅ 通过 | 「All public component props types are exported.」（按文件名校验，有子组件盲区，见 A-1/A-5） |
| Grep `@deprecated` (packages/*/src) | ✅ 0 命中 | 无废弃 API 残留（A-3） |
| `pnpm api:baseline` + `git diff` | ⚠️ +497/−79 | `git show HEAD` 证实 `TigerLocaleTimePicker`/`ZH_CN_UPLOAD_LABELS` 缺失（真实滞后）；其余为短数组多行↔单行格式错配（A-4）。已 `git checkout -- api-reports` 还原 |
| `pnpm docs:api` + `git diff` | ⚠️ ~21 文件 | 全部 CRLF/prettier 本机噪声（A-5 P3）；component-index 逻辑缺陷为独立问题（A-5 P2）。已 `git checkout -- skills/tigercat/references` 还原 |

> 还原后工作树仅余 `docs/ROADMAP_CHECK.md`（本文件）与 `docs/ROADMAP.md`（状态标记）两处文档改动，未触碰任何源码/脚本/生成产物。

---

## 任务 B — Core 工具、类型、主题、i18n、token 扫描

**扫描范围**：`packages/core/src/types`、`packages/core/src/utils`、`packages/core/src/themes`、`packages/core/src/theme-runtime`、`packages/core/src/tokens`、`packages/core/src/tailwind-entry*.ts`、`packages/core/src/tailwind-plugin.ts`、`packages/core/tokens/*`、`packages/core/package.json`、`packages/core/tsup.config.ts`，以及与 core locale/theme/token 直接相关的 React/Vue DatePicker、ConfigProvider 和 core 测试。

**结论速览**：core 基础门禁健康：`types:check`、`api:validate` 和目标 core 测试均通过；未发现需要在扫描阶段立刻改动公共 API 的 P1。主要问题集中在 **i18n / theme / token 三条公共内容链路的来源不够统一**：DatePicker locale 未纳入全局 ConfigProvider 使用路径、DatePicker 文案存在双源维护、ThemePreset 非 colors 字段公开但运行时未完整应用、token/Tailwind/theme 默认值多处手写。另有两个 P3 清理项：宽兼容 barrel 的公开面需要后续分级审计，示例导出会干扰朴素扫描。

---

### B-1 DatePicker i18n 未接入全局 ConfigProvider locale — **P2**

**发现问题**

- 🟠 P2｜`TigerLocale` 类型已包含 `datePicker?: Partial<DatePickerLocalePreset>`（[packages/core/src/types/locale.ts](../packages/core/src/types/locale.ts)），`DatePickerLocaleInput` 也支持 `{ datePicker: ... }` 形状（[packages/core/src/types/datepicker.ts](../packages/core/src/types/datepicker.ts)），但 React/Vue DatePicker 当前只从自身 `locale` prop 解析：
  - React：`useDatePickerState` 中 `getDatePickerLocaleCode(props.locale)` / `getDatePickerLabels(props.locale, props.labels)`（[packages/react/src/components/DatePicker/state.ts](../packages/react/src/components/DatePicker/state.ts)），未读取 `useTigerConfig()`。
  - Vue：`DatePicker` 中同样只用 `props.locale` / `props.labels`（[packages/vue/src/components/DatePicker.ts](../packages/vue/src/components/DatePicker.ts)），未注入 `useTigerConfig()`。
- 🟠 P2｜全局 locale preset 当前也没有装配 `datePicker`：13 个 `packages/core/src/utils/i18n/locales/*` 文件覆盖 `common/modal/drawer/upload/pagination/table/timePicker/formWizard/taskBoard/formValidation` 等字段，但没有 `datePicker` 字段；`tests/core/i18n-locales.spec.ts` 的 required keys 也未包含 `datePicker`。因此 `<ConfigProvider locale={zhCN}>` 对 DatePicker 的日历按钮文案不生效，仍需组件级 `locale` prop 或字符串 locale。

**公共内容决策**

- **合并到 core locale 使用链路**：DatePicker 的纯 locale 解析仍留在 core helper；React/Vue 组件应在框架层读取 ConfigProvider merged locale，并按“显式 props > ConfigProvider locale > 默认 locale”的现有优先级合并。
- 不在扫描阶段改 public API。后续修复可复用现有 `TigerLocale.datePicker` 字段，无需新增字段。

**建议修复顺序**

1. React/Vue DatePicker 接入 ConfigProvider merged locale；优先级保持 `props.locale` / `props.labels` 最高。
2. 为 `zhCN` / `enUS` 等 locale preset 装配 `datePicker` 字段，或补一个 core helper 将完整 TigerLocale 与 DatePicker locale preset 合流。
3. 补 React/Vue DatePicker + ConfigProvider 回归测试，覆盖全局 `datePicker` 文案和组件级覆盖。

**目标验证命令**：`pnpm vitest run tests/core/datepicker-i18n.spec.ts tests/react/DatePicker.spec.tsx tests/vue/DatePicker.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

### B-2 DatePicker 文案来源重复 — **P2**

**发现问题**

- 🟠 P2｜DatePicker locale 有两套权威来源：
  - [packages/core/src/utils/datepicker-i18n.ts](../packages/core/src/utils/datepicker-i18n.ts) 内置 `EN_US_DATEPICKER_LOCALE`、`ZH_CN_DATEPICKER_LOCALE`，并在 `DATEPICKER_LABELS_BY_LANGUAGE` 里手写 `en/zh/es/fr/de/pt/ar` 7 组 fallback labels。
  - [packages/core/src/utils/i18n/datepicker-locales/](../packages/core/src/utils/i18n/datepicker-locales/) 下维护 13 个可导出的 DatePicker locale preset，并通过 `package.json` 暴露 `./datepicker-locales/*` 子路径。
- 🟠 P2｜这会形成维护盲区：`getDatePickerLabels('ja-JP')`、`ko-KR`、`th-TH`、`vi-VN`、`id-ID`、`zh-TW` 等语言不会从对应 preset 自动读取，只会回落到英文；但直接传入 `@expcat/tigercat-core/datepicker-locales/<id>` preset 又能拿到完整翻译。`tests/core/datepicker-i18n.spec.ts` 只覆盖了内置 map 的新西文/阿拉伯语和显式 preset merge，没有覆盖“字符串 locale 与 13 个 preset 一致”。

**公共内容决策**

- **合并 DatePicker labels 来源**：以 `utils/i18n/datepicker-locales/*` preset 文件作为文案单一来源；`datepicker-i18n.ts` 只保留解析、合并和 fallback helper。
- 不直接删除子路径导出；这些 locale preset 已是公开入口，应保持稳定。

**建议修复顺序**

1. 建立 `locale id -> DatePickerLocalePreset` 的内部 map，来源为现有 preset 文件。
2. 让 `getDatePickerLabels(string)` 从该 map 解析，未知 locale 再回落 en-US。
3. 补 13 个 DatePicker locale 字符串回归测试，避免新增语言只改 preset 不改 helper。

**目标验证命令**：`pnpm vitest run tests/core/datepicker-i18n.spec.ts tests/core/i18n-locales.spec.ts`、`pnpm api:validate`。

---

### B-3 ThemePreset 非 colors 字段公开但运行时未完整应用 — **P2**

**发现问题**

- 🟠 P2｜`ThemeConfig` 公开了 `colors`、`typography`、`radius`、`shadows`、`spacing`、`motion`（[packages/core/src/types/theme.ts](../packages/core/src/types/theme.ts)），内置 themes 也填写了非 colors 字段，例如 `defaultTheme.light.radius/shadows`、`modernTheme.light.radius/shadows/motion`（[packages/core/src/themes/default/theme.ts](../packages/core/src/themes/default/theme.ts)、[packages/core/src/themes/modern/theme.ts](../packages/core/src/themes/modern/theme.ts)）。
- 🟠 P2｜运行时 ThemeManager 只把 `config.colors` 通过 `THEME_CSS_VARS` 写入 DOM；`radius/shadows/typography/spacing/motion` 不会被 `ThemeManager.setTheme()` 应用（[packages/core/src/themes/manager.ts](../packages/core/src/themes/manager.ts)）。
- 🟠 P2｜Tailwind plugin 的 `createTigercatPlugin({ preset })` 同样只映射 `preset.light.colors` / `preset.dark.colors`；radius/shadows/motion 等由 `MODERN_BASE_TOKENS_*` 与 `MODERN_OVERRIDE_TOKENS_*` 另一路注入（[packages/core/src/tailwind-plugin.ts](../packages/core/src/tailwind-plugin.ts)）。这会让使用者以为 `ThemePreset.radius` 能随 `ThemeManager.setTheme('modern')` 生效，但实际只有颜色跟随 preset。

**公共内容决策**

- **合并 theme preset 应用语义**：要么补齐非 colors 字段到 CSS var 的映射并由 ThemeManager/plugin 共同消费，要么收窄文档/类型说明，明确非 colors 字段当前只作 preset metadata / modern token layer 参考。
- 公共 API 默认保持兼容；若要收窄类型或改变应用时机，需要单独 migration。

**建议修复顺序**

1. 优先新增内部 `ThemeConfig -> CSS vars` helper，覆盖 colors/radius/shadows/typography/spacing/motion。
2. ThemeManager 与 `createTigercatPlugin({ preset })` 复用同一映射，避免运行时与构建时不一致。
3. 补 `ThemeManager.setTheme()` 对 radius/shadow/motion 的 DOM 变量测试，以及 plugin preset 输出测试。

**目标验证命令**：`pnpm vitest run tests/core/themes-manager.spec.ts tests/core/modern-theme.spec.ts tests/core/modern-theme-interaction.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

### B-4 tokens、Tailwind plugin、theme preset 默认值多源维护 — **P2**

**发现问题**

- 🟠 P2｜token 单一来源在文档中定义为 `packages/core/tokens/tokens.json`，并由 [packages/core/scripts/generate-tokens.mjs](../packages/core/scripts/generate-tokens.mjs) 生成 `tokens.css`、`src/tokens/tokens.ts`、`tailwind-tokens.js`、`figma-variables.json`。
- 🟠 P2｜但 Tailwind plugin 仍手写 `tigercatTheme` / `tigercatDarkTheme` legacy CSS vars（[packages/core/src/tailwind-plugin.ts](../packages/core/src/tailwind-plugin.ts)），内置 theme preset 文件也分别手写同类颜色、radius、shadow、motion 值（[packages/core/src/themes](../packages/core/src/themes)）。这些值与 tokens 生成链路没有自动校验。
- 🟠 P2｜`generate-tokens.mjs` 同时生成 canonical `--tiger-primitive-*` / `--tiger-semantic-*` / `--tiger-component-*` 和 compatibility `--tiger-*` 变量；但 plugin 注入的 `--tiger-*` 默认值并非从 `tokens.ts` 或 `tokens.json` 读取。后续 token 调整可能出现 CSS token、Tailwind plugin 默认变量、ThemePreset 三者漂移。

**公共内容决策**

- **合并 token/theme 默认值来源或加同步校验**：优先让 Tailwind plugin / themes 通过共享 token mapping helper 派生默认变量；若短期不改结构，至少新增测试校验关键 `--tiger-*` 变量和 theme preset 与 tokens 的一致性。
- 不在扫描阶段运行 `pnpm tokens:build`，避免重写生成产物。

**建议修复顺序**

1. 先补低风险校验：读取 `tokens.json` / generated `tokens.ts`，校验 plugin 默认 vars 与 default theme 的关键语义值。
2. 再考虑把 `tigercatTheme` / `tigercatDarkTheme` 从共享 helper 派生。
3. 修改 token 源后统一运行 `pnpm tokens:build` 并审阅生成产物 diff。

**目标验证命令**：`pnpm vitest run tests/core/design-tokens.spec.ts tests/core/modern-theme.spec.ts tests/core/reduced-motion.spec.ts`；涉及 token 源变更时追加 `pnpm tokens:build`、`git diff -- packages/core/src/tokens packages/core/tokens`。

---

### B-5 core utils 兼容 barrel 公开面过宽 — **P3**

**发现问题**

- 🟢 P3｜[packages/core/src/utils/index.ts](../packages/core/src/utils/index.ts) 为兼容性从 `helpers/icons/a11y/i18n/styles/motion` 到大量组件级 `*-utils` 做平铺再导出。粗扫 `packages/core/src/{types,utils,themes,theme-runtime,tokens}` 的显式导出并在仓库源码/测试/示例/文档中计数，有 146 个文件组包含仓库内零外部引用的导出符号。
- 🟢 P3｜该结果不能直接等同死代码：其中大量是公开 API、类型别名、样式常量或外部消费者可能使用的 helper；但它说明当前 flat barrel 已难以区分“公开承诺 API”“框架内部共享 helper”“组件局部实现细节”。

**公共内容决策**

- **延后到任务 H 或后续 API 清理**：先分类，不直接删除。跨框架共享且稳定的纯逻辑保留 core；只服务单组件且无外部价值的 helper 后续可逐步回收到组件局部；已公开符号删除前必须走 deprecated/migration。

**建议修复顺序**

1. 生成公开 helper 分类表：外部文档/API 示例使用、React/Vue 内部使用、测试/benchmark 使用、零仓库使用。
2. 对零仓库使用但已公开的 helper 标注保留/废弃/回收建议。
3. 真正删除前补 API baseline、migration、changeset，并按 semver 处理。

**目标验证命令**：`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm types:check`。

---

### B-6 `types/base.ts` 示例导出干扰朴素扫描 — **P3**

**发现问题**

- 🟢 P3｜[packages/core/src/types/base.ts](../packages/core/src/types/base.ts) 的 JSDoc 示例中包含 `export interface MyButtonProps extends BaseInteractiveProps { ... }`。因为示例位于源码注释内，当前 TypeScript 编译没有问题；但朴素的文本扫描或自制导出提取脚本若没有先剥离注释，可能误把 `MyButtonProps` 当成真实公开导出。
- 🟢 P3｜本轮只读导出粗筛就曾捕获到 `MyButtonProps`，说明它会污染简单审计工具的候选结果。现有 `api:validate` / `types:check` 未因此失败。

**公共内容决策**

- **局部文档清理**：不涉及运行时代码和公共 API。后续可把示例中的 `export interface` 改为 `interface`，或改名为更明显的伪代码示例，降低脚本误报概率。

**建议修复顺序**：低优先，随下一次 core 类型文档清理一起改。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

### 任务 B 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| DatePicker 与 ConfigProvider locale | **合并→统一 locale 使用链路** | React/Vue DatePicker 应消费 ConfigProvider merged locale；显式 prop 仍最高优先级。 |
| DatePicker labels 来源 | **合并→datepicker locale preset 为权威来源** | `datepicker-i18n.ts` 只做解析/合并；避免字符串 locale 与 preset 子路径漂移。 |
| ThemeConfig 非 colors 字段 | **合并应用语义或明确收窄** | 当前公开类型和运行时行为不完全一致；优先抽 `ThemeConfig -> CSS vars` helper。 |
| token / Tailwind plugin / themes 默认值 | **合并或加同步校验** | `tokens.json`、plugin 手写 vars、theme preset 手写值需共享来源或测试护栏。 |
| core utils flat barrel | **延后分类** | 不直接删；先区分公开 API、框架共享 helper、组件局部 helper。 |
| `MyButtonProps` 示例导出 | **局部清理** | 文档示例改写即可，无公共 API 影响。 |

---

### 本轮验证命令实跑输出摘要（证据）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `git status --short` | ✅ 干净 | 扫描前后未留下源码/生成产物改动 |
| `pnpm types:check` | ✅ 通过 | `All public component props types are exported.` |
| `pnpm api:validate` | ✅ 通过 | API 一致性检查 0 问题 |
| `pnpm vitest run tests/core/design-tokens.spec.ts tests/core/datepicker-i18n.spec.ts tests/core/i18n-locales.spec.ts tests/core/custom-text-labels.spec.ts tests/core/kanban-utils.spec.ts` | ✅ 通过 | 5 个测试文件、62 个测试通过 |
| `rg -n "datePicker" packages/core/src/utils/i18n/locales packages/core/src/utils/i18n/datepicker-locales tests/core/i18n-locales.spec.ts tests/core/define-locale.spec.ts` | ⚠️ 0 命中 | 证明完整 TigerLocale preset 与 i18n locale 测试未覆盖 `datePicker` 字段 |

> 本轮任务 B 只记录扫描结论和修复建议；未改组件源码、未改公共 API、未运行 `pnpm tokens:build` 或其他会重写生成产物的命令。

---

## 任务 C — 组件分组扫描

> 任务 C 按组件分组逐组扫描，每组结果独立成 `### Cxx` 子段并给出 `发现问题 / 公共内容决策 / 建议修复顺序 / 目标验证命令`。下为首组 C01 结果，后续组（C02…）追加到本段。

### C01 基础动作与文本

**扫描范围**：8 个轻量组件 Button、ButtonGroup、Link、Text、Code、Icon、Tag、Badge 的全链路——core 类型 `packages/core/src/types/{button,link,tag,badge,icon,text,code}.ts`、core 工具 `packages/core/src/utils/{button,badge,tag,text,link,icon,group}-utils.ts` 与 `class-names.ts`/`compose-classes.ts`/`coerce-class-value.ts`/`svg-attrs.ts`/`dev-warn.ts`/`common-icons.ts`、`packages/core/src/theme-runtime/colors.ts`、`packages/{react,vue}/src/components` 的双端实现、`tests/{react,vue}` 对应 spec、`skills/tigercat/references/component-index.md`。

**结论速览**：C01 基础面健康——业务逻辑已下沉 core `*-utils` / `theme-runtime`，双端值与行为对称，测试覆盖 role 与 label。**无 P1**。1 条 **P2**（默认标签本地化策略三套不一致、Badge 标签不可覆盖），其余为 **P3** 清理与命名/可访问性观察。注意：Vue 实现行数比 React 多约 65%（Vue 978 / React 594），但差异几乎全是 `defineComponent` 的 props 声明 + JSDoc 样板，**非重复业务逻辑**（不计入发现）。

---

#### C01-1 类组合助手采用不一致（该合未合）— **P3**

**发现问题**

- 🟢 P3｜`composeComponentClasses`（[compose-classes.ts](../packages/core/src/utils/compose-classes.ts)）的文档明确写着它就是为「remove the repeated `classNames(..., props.className, coerceClassValue(attrs.class))` boilerplate present in every Vue/React component」而建，并给了 Vue+React 两个用例。但 C01 中**只有 Vue Button** 用了它（[Button.ts:126](../packages/vue/src/components/Button.ts)）。其余 Vue 组件各自手写、且写法不一：Tag `classNames(tagClasses, coerceClassValue(attrsClass))`（[Tag.ts:147](../packages/vue/src/components/Tag.ts)）、Badge `classNames(badgeClasses, props.className, coerceClassValue(attrs.class))`（[Badge.ts:106](../packages/vue/src/components/Badge.ts)）、Icon `classNames(iconWrapperClasses, coerceClassValue(attrs.class))`（[Icon.ts:57](../packages/vue/src/components/Icon.ts)）、Link 用数组形式 `[linkClasses, attrs.class]`（[Link.ts:91](../packages/vue/src/components/Link.ts)）。为该助手而生的样板仍散落各处。

**公共内容决策**：助手已在 core，**统一采用**（Vue 全组件改用 `composeComponentClasses`；React 同组件亦可换用以对齐）。纯重构，无公共 API 变更、无双端行为差异。

**建议修复顺序**：P3，可与 C01-3 同批。

**目标验证命令**：`pnpm types:check`、`pnpm vitest run tests/react/{Tag,Badge,Icon,Link}.spec.tsx tests/vue/{Tag,Badge,Icon,Link}.spec.ts`。

---

#### C01-2 内联 SVG 图标渲染重复 + 常量未复用 + 内置图标 strokeWidth 魔数（图标渲染）— **P3**

**发现问题**

- 🟢 P3｜**常量未复用**：`SVG_DEFAULT_XMLNS` / `SVG_DEFAULT_FILL` 已在 [svg-attrs.ts:12](../packages/core/src/utils/svg-attrs.ts) 定义并被 Icon 使用，但 Button 的加载 spinner（[React Button.tsx:23](../packages/react/src/components/Button.tsx) / [Vue Button.ts:35](../packages/vue/src/components/Button.ts)）与 Tag 的 `CloseIcon`（[React Tag.tsx:31](../packages/react/src/components/Tag.tsx) / [Vue Tag.ts:30](../packages/vue/src/components/Tag.ts)）仍硬编码 `'http://www.w3.org/2000/svg'` 与 `fill="none"`。
- 🟢 P3｜**内置图标 strokeWidth 魔数**：Icon 渲染**内置**图标时硬编码 `stroke-width: 1.5`（[React Icon.tsx:48](../packages/react/src/components/Icon.tsx) / [Vue Icon.ts:80](../packages/vue/src/components/Icon.ts)），而渲染**自定义子 SVG** 时用常量 `iconSvgDefaultStrokeWidth`（=`2`，[icon-utils.ts:14](../packages/core/src/utils/icon-utils.ts)）。结果：内置图标 1.5 与自定义图标 2 描边粗细不一致，且 `1.5` 在 React+Vue 两处重复、无命名常量、易漂移。

**公共内容决策**：渲染（JSX vs `h()`）属框架细节，**保留框架层**；**数据/常量沉 core**——(a) Button/Tag 内联 SVG 复用 `SVG_DEFAULT_XMLNS` / `SVG_DEFAULT_FILL`；(b) 为内置图标描边新增命名常量（如 `iconBuiltInStrokeWidth = 1.5`）替代两处魔数，或确认应统一为 `iconSvgDefaultStrokeWidth` 后对齐。

**建议修复顺序**：P3。先确认 strokeWidth 是「刻意 1.5」还是「应为 2」（需视觉确认）再落常量。

**目标验证命令**：`pnpm vitest run tests/react/{Icon,Button,Tag}.spec.tsx tests/vue/{Icon,Button,Tag}.spec.ts`；涉及视觉默认值，必要时 `pnpm example:build` 目检。

---

#### C01-3 Tag 关闭按钮类未抽到 core（该提取未提取）— **P3**

**发现问题**

- 🟢 P3｜Tag 关闭按钮的类在 React+Vue **逐字重复**：`const scheme = defaultTagThemeColors[variant]; classNames(tagCloseButtonBaseClasses, scheme.closeBgHover, scheme.text)`（[React Tag.tsx:68](../packages/react/src/components/Tag.tsx) / [Vue Tag.ts:119](../packages/vue/src/components/Tag.ts)），两端都直接 reach-in `defaultTagThemeColors`。对照：Code 的「复制按钮类」已有 core 助手 `getCodeBlockCopyButtonClasses(isCopied)` 被双端共享，Tag 缺同类助手——属同组内不一致。
- ℹ️ `defaultTagThemeColors` 已覆盖全部 6 个 `TagVariant`（[colors.ts:421](../packages/core/src/theme-runtime/colors.ts)）且为 typed `Record`，**无崩溃风险**；纯属重复样板。

**公共内容决策**：**抽 `getTagCloseButtonClasses(variant)` 到 core**（与 `getTagVariantClasses` / `getCodeBlockCopyButtonClasses` 同址同风格），双端调用。

**建议修复顺序**：P3，与 C01-1 同批。

**目标验证命令**：`pnpm types:check`、`pnpm vitest run tests/react/Tag.spec.tsx tests/vue/Tag.spec.ts`。

---

#### C01-4 默认标签本地化策略三套不一致 + Badge 标签不可覆盖（i18n / a11y）— **P2**

**发现问题**

- 🟠 P2｜同组三种做法、默认语言混用（均有测试锁定）：
  - **Code**：`copyLabel` / `copiedLabel` 专属 props，默认**中文** `复制` / `已复制`（[code.ts](../packages/core/src/types/code.ts)；测试 `tests/react/Code.spec.tsx:61`）。
  - **Tag**：`closeAriaLabel` 专属 prop，默认**英文** `Close tag`（[tag.ts:41](../packages/core/src/types/tag.ts)；测试 `tests/react/Tag.spec.tsx:53`）。
  - **Badge**：**无任何 label prop**，aria-label 默认**英文** `notification` / `N notifications` **硬编码在组件内**（[React Badge.tsx:49](../packages/react/src/components/Badge.tsx) / [Vue Badge.ts:94](../packages/vue/src/components/Badge.ts)），仅能靠透传原生 `aria-label` 覆盖，**无法本地化**。
- ℹ️ 对照：仓库已有 locale 体系（13 语言）与 Drawer 的 `labels={{ closeAriaLabel }}` 模式（`tests/react/custom-text.spec.tsx:40`），但 C01 这几个轻量组件都绕开了它。

**公共内容决策**：跨框架默认文案应**统一策略并沉 core**（接入 locale，或统一 `labels` / 单字段 props），至少（a）给 Badge 增加可覆盖的 label；（b）统一默认语言。**属公共 API 变更**——按任务 H 策略：不直接改默认值破坏行为，应先加可覆盖入口、必要时 deprecate 旧默认、补 migration/changeset、过 `api:baseline:check`；改默认文案需同步更新被锁定的测试。

**建议修复顺序**：P2，独立成项（C01 内最大的双端一致性项）。先定方案（locale vs labels-prop）再落地。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm vitest run tests/react/{Code,Tag,Badge}.spec.tsx tests/vue/{Code,Tag,Badge}.spec.ts`、`pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C01-5 尺寸 / variant / color 命名分歧（命名观察）— **P3 / 观察**

**发现问题**

- 🟢 P3｜**尺寸尺度不统一**：Button `xs|sm|md|lg|xl`、Icon `sm|md|lg|xl`（无 xs）、Link/Tag/Badge `sm|md|lg`、Text `xs|sm|base|lg|xl…6xl`（中号叫 `base` 而非 `md`，跟随 Tailwind 字号命名）。
- 🟢 P3｜**variant 两套哲学**：Button/Link 是**样式** variant（`primary|secondary|outline|ghost|link` / `primary|secondary|default`），Tag/Badge 是**语义/状态** variant（`default|primary|success|warning|danger|info`）。同一个值 `variant="primary"` 在 Button 表示「主填充样式」、在 Tag 表示「蓝色语义」——跨组件含义不同，易混淆。
- 🟢 P3｜**`danger` 重载**：Button 上 `danger` 是布尔修饰（叠加在任意 variant 上，[button.ts:82](../packages/core/src/types/button.ts)），Tag/Badge 上 `danger` 是 variant 取值。
- 🟢 P3｜**color 三种模型**：Text 是枚举 `color`（[text.ts:49](../packages/core/src/types/text.ts)）、Icon 是自由 CSS 字符串 `color`、Button/Tag 不支持 color 且 `warnUnsupportedColorProp` 告警（[dev-warn.ts:40](../packages/core/src/utils/dev-warn.ts)，文档注明仅限 Button/Tag）。

**公共内容决策**：上述多为**刻意的领域差异**，倾向**保持现状 + 文档说明**（在 skill/docs 一次性说明「样式 variant vs 语义 variant」「Button.danger 是修饰符」「三种 color 模型」），避免消费者误用。若产品确需，可后续给 Tag/Badge 补 `xs`/`xl`——**延后**，非本轮动作。

**建议修复顺序**：P3 文档项 / 多数观察延后。

**目标验证命令**：`pnpm docs:api:check`（若补文档）。

---

#### C01-6 Tag 与 Badge 的 variant 联合类型逐字重复（该合）— **P3**

**发现问题**

- 🟢 P3｜`TagVariant`（[tag.ts:8](../packages/core/src/types/tag.ts)）与 `BadgeVariant`（[badge.ts:6](../packages/core/src/types/badge.ts)）成员**完全相同**：`'default'|'primary'|'success'|'warning'|'danger'|'info'`。

**公共内容决策**：可在 core 抽**共享语义类型**（如 `StatusVariant`）并令二者 `= StatusVariant` 别名——成员不变、**结构等价、非破坏**。仅限「键联合」共享；二者的 theme 色板（`TagThemeColors` 含 border+closeBgHover，`BadgeThemeColors` 仅 bg+text）合理不同，不合并。

**建议修复顺序**：P3，可延后（收益主要是单一真相源）。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C01-7 Vue Link 吞掉用户 `@keydown`（双端 parity，latent）— **P3**

**发现问题**

- 🟢 P3｜React Link 把 `onKeyDown` 解构后在禁用判断后**转发** `onKeyDown?.(event)`（[Link.tsx:65](../packages/react/src/components/Link.tsx)）。Vue Link 的 `keydown` 不在 `emits`，渲染时 `...attrs`（含用户 `onKeydown`）之后又显式 `onKeydown: handleKeydown` **覆盖**，且 `handleKeydown` 只做禁用拦截、不转发（[Link.ts:79](../packages/vue/src/components/Link.ts) / [:98](../packages/vue/src/components/Link.ts)）——用户 `@keydown` 监听被丢弃（而 `@click` 因走 `emit` 正常）。

**公共内容决策**：属框架层 bug，**在 Vue 层修**（把 keydown 纳入 emits / 合并监听器，使禁用拦截后仍转发），对齐 React。

**建议修复顺序**：P3（影响低、当前无测试覆盖、键盘按键在链接上少见，但确为双端不一致）。

**目标验证命令**：`pnpm vitest run tests/react/Link.spec.tsx tests/vue/Link.spec.ts`（建议补 keydown 转发用例）。

---

#### C01-8 其余低优先观察 — **P3**

**发现问题**

- 🟢 P3｜**Tag `role="status"`**：每个 Tag 都带 `role="status"`（隐式 `aria-live=polite`，[Tag.tsx:87](../packages/react/src/components/Tag.tsx)；双端测试已锁 `tests/react/Tag.spec.tsx:18`）。静态标签作为 live region 在大量 filter chip 场景可能造成读屏噪声——**值得复核语义**，但属刻意且被测试锁定，改动即行为变更，**列为待议**而非建议直改。Badge `role="status"`（计数通知）相对可辩护。
- 🟢 P3｜**Vue Text 冗余默认**：Vue Text 在 props 声明 `size:'base'`/`weight:'normal'`/`color:'default'`，与 `getTextClasses` 内部默认（[text-utils.ts:17](../packages/core/src/utils/text-utils.ts)）重复（双真相源）；React Text 不声明、全靠 core 默认。当前结果一致，仅维护性微瑕。
- 🟢 P3｜**Button spinner 固定尺寸**：spinner 恒为 `h-4 w-4`，不随按钮 `size` 缩放；多数场景可接受，记录备查。

**公共内容决策**：均为低优先观察；Tag `role` 待议（不动），Vue Text 冗余默认与 Button spinner 尺寸可随相关组件下次改动顺手处理。

**建议修复顺序**：P3，无独立行动项。

**目标验证命令**：`pnpm vitest run tests/react/{Tag,Text,Button}.spec.tsx tests/vue/{Tag,Text,Button}.spec.ts`。

---

#### C01 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| `composeComponentClasses` 统一采用（C01-1） | **合并→统一用已有 core 助手** | P3 |
| Tag 关闭按钮类抽 `getTagCloseButtonClasses`（C01-3） | **提取→core 助手** | P3 |
| SVG 常量复用 + 内置图标 strokeWidth 命名常量（C01-2） | **常量沉 core，渲染留框架层** | P3 |
| 默认标签本地化统一 + Badge 可覆盖（C01-4） | **统一策略，接入 locale/labels（公共 API，走 H 流程）** | **P2** |
| Tag/Badge variant 抽 `StatusVariant` 别名（C01-6） | **合并→共享类型别名（非破坏）** | P3 |
| Vue Link keydown 转发（C01-7） | **框架层修复，对齐 React** | P3 |
| 尺寸/variant/color 命名分歧（C01-5） | **保持现状 + 文档说明** | P3/观察 |
| Tag `role="status"` 语义（C01-8） | **待议（测试已锁，暂不改）** | P3 |

---

#### C01 取证摘要（静态实读，未跑门禁命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Grep `composeComponentClasses` 在 C01 组件的调用 | 仅 Vue Button 1 处；Tag/Badge/Icon/Link 手写 `classNames+coerceClassValue` | C01-1 |
| 比对 `iconSvgDefaultStrokeWidth` 与内置图标分支 | 常量=2，内置图标分支双端硬编码 1.5 | C01-2 |
| 比对 Tag 关闭按钮类 vs Code 复制按钮类 | Code 有 `getCodeBlockCopyButtonClasses` 助手，Tag 双端 reach-in `defaultTagThemeColors` | C01-3 |
| Grep 默认 label / aria-label 取值与测试断言 | Code 默认 `复制`/`已复制`、Tag `Close tag`、Badge 硬编码 `notification(s)`；均被双端 spec 断言 | C01-4 |
| 比对各组件 `*Size` / `*Variant` 类型联合 | 尺寸/variant 尺度与命名分歧；`TagVariant`≡`BadgeVariant` | C01-5 / C01-6 |
| Grep `role="status"` 断言 | Tag、Badge 双端 spec 均锁定 `role="status"` | C01-8 |
| `defaultTagThemeColors` 变体覆盖 | 完整覆盖 6 个 `TagVariant`（typed Record，无崩溃风险） | C01-3 |

> 本轮 C01 只记录扫描结论和修复建议；未改任何组件源码、core 工具、脚本或生成产物（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「仅更新 Roadmap 文档不要求跑完整门禁」，C01 阶段未执行 `pnpm` 门禁命令；表中「目标验证命令」供未来逐条修复时使用。

---

### C06 Steps/Tabs

**扫描范围**：4 个导航组件 Steps、StepsItem、Tabs、TabPane 的全链路——core 类型 `packages/core/src/types/{steps,tabs}.ts`、core 工具 `packages/core/src/utils/{steps,tabs}-utils.ts`、`packages/{react,vue}/src/components/{Steps,StepsItem,Tabs,TabPane}`、双端 Steps/Tabs spec、`tests/core/tabs-utils.spec.ts`、generated references 中的 `component-index.md`、`shared/props/navigation.md`、`examples/navigation.md`。

**结论速览**：C06 主行为健康——双端 Steps/Tabs 目标测试通过，Steps 的状态/class 计算与 Tabs 的 nav/indicator/pane class helper 已下沉 core 并被 React/Vue 共用；`pnpm api:validate` 与 `pnpm types:check` 也通过。**无 P1**。本组发现 **4 条 P2**（Vue Tabs 公开 props 类型漏 `lazy`、React uncontrolled Tabs roving tabindex 可能滞后、editable tab 关闭控件语义、generated references 漏 `StepsItem`）与 **2 条 P3**（Steps finish 图标常量重复/无消费者、`getNextActiveKey` 公开但无仓库消费者）。

---

#### C06-1 Vue `VueTabsProps` 漏声明 `lazy`（公开类型漂移）— **P2**

**发现问题**

- 🟠 P2｜core `TabsProps` 已声明 `lazy?: boolean`（[tabs.ts:67](../packages/core/src/types/tabs.ts)），React `TabsProps` 也声明 `lazy?: boolean`（[Tabs.tsx:357](../packages/react/src/components/Tabs.tsx)），Vue 运行时 props 同样支持 `lazy`（[Tabs.ts:425](../packages/vue/src/components/Tabs.ts)），且 Vue 测试实际使用 `props: { defaultActiveKey: '1', lazy: true }` 并通过（[tests/vue/Tabs.spec.ts:750](../tests/vue/Tabs.spec.ts)）。
- 🟠 P2｜但导出的 `VueTabsProps` 接口缺少 `lazy?: boolean`（[Tabs.ts:56](../packages/vue/src/components/Tabs.ts)），TS 用户通过 `VueTabsProps` 建模时无法表达已存在的运行时能力。`pnpm types:check` 仍通过，因为该脚本只校验 props 类型是否导出，不校验 Vue props 接口与运行时 props 成员一致。

**公共内容决策**：**补齐 Vue 公开类型**，让 `VueTabsProps` 与 core/React/运行时 props 对齐。该变更只新增可选类型字段，不改运行时行为、不破坏 API。

**建议修复顺序**：P2，优先级较高且改动小；可独立修复并补类型/基线验证。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm vitest run tests/vue/Tabs.spec.ts`。

---

#### C06-2 React uncontrolled Tabs 的 roving `tabIndex` 可能滞后（受控状态 / 键盘导航）— **P2**

**发现问题**

- 🟠 P2｜React Tabs 在抽取 `tabItems` 时计算 `resolvedActiveKey = controlledActiveKey ?? defaultActiveKey ?? firstKey`，并据此给克隆出来的 tab item 写入 `tabIndex`（[Tabs.tsx:447](../packages/react/src/components/Tabs.tsx) / [:457](../packages/react/src/components/Tabs.tsx)）。这个 `useMemo` 依赖 `children`、`controlledActiveKey`、`defaultActiveKey`、`idBase`，**不依赖 `internalActiveKey`**（[Tabs.tsx:477](../packages/react/src/components/Tabs.tsx)）。
- 🟠 P2｜非受控模式点击后，`activeKey` 会切到 `internalActiveKey`，所以 `aria-selected`、内容面板、indicator 都会更新；但 `tabIndex` 仍来自初始 `defaultActiveKey`/first tab，可能导致 roving tabindex 停在旧 tab。现有 React 测试覆盖了 uncontrolled 内容切换与 `aria-selected`，但没有断言点击后的 `tabIndex`（`rg tabIndex/tabindex tests/react/Tabs.spec.tsx` 无相关断言）。
- ℹ️ Vue Tabs 在 render 内用 `resolvedActiveKey = currentActiveKey.value ?? firstTabKey` 重新计算 tabIndex（[Tabs.ts:631](../packages/vue/src/components/Tabs.ts) / [:645](../packages/vue/src/components/Tabs.ts)），没有同样的 memo stale 形状。

**公共内容决策**：属 React 框架层状态同步 bug，**不需要沉 core**。保留 core 的 class/indicator helper；React 侧让 tab item 克隆的 `tabIndex` 使用最终 `activeKey` 或把 clone 计算拆到 activeKey 之后。

**建议修复顺序**：P2，与 C06-1 可同批修。先补失败用例：uncontrolled click 后新 active tab `tabIndex=0`、旧 active tab `tabIndex=-1`；再调整 React Tabs clone 计算。

**目标验证命令**：`pnpm vitest run tests/react/Tabs.spec.tsx`、`pnpm api:validate`、`pnpm types:check`。

---

#### C06-3 editable Tabs 关闭控件是嵌套交互语义（键盘 / aria）— **P2**

**发现问题**

- 🟠 P2｜React/Vue editable tab 的关闭控件都渲染在 `button role="tab"` 内部，并使用 `span role="button"`：React [Tabs.tsx:254](../packages/react/src/components/Tabs.tsx) / [:273](../packages/react/src/components/Tabs.tsx)，Vue [Tabs.ts:281](../packages/vue/src/components/Tabs.ts) / [:303](../packages/vue/src/components/Tabs.ts)。这形成“交互控件嵌套交互控件”的语义，读屏与自动化 a11y 工具可能表现不一致。
- 🟠 P2｜键盘关闭路径已有覆盖：Tab 本体获得焦点后按 Backspace/Delete 会触发 `handleTabClose`（React [Tabs.tsx:173](../packages/react/src/components/Tabs.tsx)，Vue [Tabs.ts:203](../packages/vue/src/components/Tabs.ts)）。但鼠标关闭控件本身 `tabIndex={-1}`，且 role/button 只是 span，不能作为独立按钮完整表达；当前双端测试主要验证 close 事件与可关闭状态，没有锁定更合理的语义结构。
- ℹ️ 该问题不影响现有 `pnpm vitest` 主路径，属于可访问性和语义正确性修复。

**公共内容决策**：**框架渲染层重构**，不沉 core。保留 `tabCloseButtonClasses` 与 close icon path 常量在 core；双端可改为非嵌套结构（例如 tab label 与 close button 做兄弟节点、或用符合 tablist 模式的删除交互策略），并继续支持 Delete/Backspace 快捷删除。

**建议修复顺序**：P2，但应在 C06-1/C06-2 后处理；需要一次小设计，避免破坏 tablist 键盘导航。

**目标验证命令**：`pnpm vitest run tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts`，必要时追加 `pnpm test:a11y` 或对应 isolated a11y 测试。

---

#### C06-4 generated references 漏 `StepsItem`（文档生成链路）— **P2**

**发现问题**

- 🟠 P2｜`StepsItem` 是双端真实导出：React index 导出 `Steps, StepsItem` 与 `StepsItemProps`，Vue index 导出 `Steps, StepsItem` 与 `VueStepsItemProps`；组件文件也提供独立 re-export（[StepsItem.tsx](../packages/react/src/components/StepsItem.tsx)、[StepsItem.ts](../packages/vue/src/components/StepsItem.ts)）。
- 🟠 P2｜但 generated `component-index.md` 的 C06 相关项只有 `Steps`、`Tabs`、`TabPane`，没有 `StepsItem`（[component-index.md:160](../skills/tigercat/references/component-index.md)）。`shared/props/navigation.md` 也只列 `StepsProps`、`TabsProps`、`TabPaneProps`，没有 `StepsItemProps`（[navigation.md:203](../skills/tigercat/references/shared/props/navigation.md)）。这与任务 A 已记录的 component-index 生成来源问题一致：生成器从 core `*Props`/文件名推导，`steps.ts` 只有 `StepsProps`，看不到子组件 `StepsItem`。

**公共内容决策**：**修生成器，不直接改 generated references**。后续应按 A-5/A-7：让 `scripts/generate-api-docs.mjs` 使用真实 index 导出的公开组件集，再把缺 props 的子组件按别名/虚拟组件补齐。

**建议修复顺序**：P2，归入任务 A/A-7 的生成链路修复批次；C06 不单独手改 `skills/tigercat/references/*`。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C06-5 Steps finish 图标常量重复，`stepFinishChar` 无消费者（图标渲染 / 无用公开项）— **P3**

**发现问题**

- 🟢 P3｜Steps 完成态图标的 SVG path 与 `strokeWidth="3"` 在 React/Vue 逐字双写：React [Steps.tsx:135](../packages/react/src/components/Steps.tsx)、Vue [Steps.ts:211](../packages/vue/src/components/Steps.ts)。这与 C01 的 SVG 常量复用问题同类，渲染层可以框架分离，但 path/viewBox/stroke 这类数据常量适合沉 core。
- 🟢 P3｜core `steps-utils.ts` 公开了 `stepFinishChar = '✓'`（[steps-utils.ts:10](../packages/core/src/utils/steps-utils.ts)），但仓库内未被 Steps 实现、测试、文档消费；实际 UI 已改用 SVG checkmark。由于它通过 `@expcat/tigercat-core` flat utils barrel 公开，不能直接删除。

**公共内容决策**：finish 图标 path/viewBox/stroke 可**沉 core 常量**，渲染仍留 React/Vue。`stepFinishChar` 进入任务 H 的公开 helper 分类：若确认外部价值低，走 deprecated/migration；若保留，则补文档说明用途。

**建议修复顺序**：P3，可与 C01 SVG 常量类清理同批。

**目标验证命令**：`pnpm vitest run tests/react/Steps.spec.tsx tests/vue/Steps.spec.ts`、`pnpm api:baseline:check`（若新增/废弃公开符号）。

---

#### C06-6 `getNextActiveKey` 公开但无仓库消费者、无测试（无消费者工具）— **P3**

**发现问题**

- 🟢 P3｜`getNextActiveKey` 在 core `tabs-utils.ts` 中公开（[tabs-utils.ts:319](../packages/core/src/utils/tabs-utils.ts)），并通过 `utils/styles/index.ts` 与 core flat barrel 暴露；但仓库源码、测试、示例、references 中没有实际调用者。
- 🟢 P3｜现有 `tests/core/tabs-utils.spec.ts` 只覆盖 tab indicator/nav list helper，没有覆盖 `getNextActiveKey`。Tabs 关闭逻辑当前也只向外 emit/edit，不使用该 helper 计算下一 active key。

**公共内容决策**：**先保留，任务 H 分类**。它可能是早期可关闭 tabs 行为的残留，也可能仍对外部消费者有价值；扫描阶段不删除、不改 API。若未来组件内部要接管 close 后 active key，可复用并补测试；若确认废弃，走 deprecated/migration。

**建议修复顺序**：P3，延后到 core utils 公开面分类或 editable tabs 行为重做时处理。

**目标验证命令**：`pnpm vitest run tests/core/tabs-utils.spec.ts tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts`、`pnpm api:baseline:check`（若废弃/删除）。

---

#### C06 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Vue `VueTabsProps.lazy` 类型补齐（C06-1） | **补齐公开类型，对齐运行时** | **P2** |
| React uncontrolled Tabs roving `tabIndex`（C06-2） | **框架层修复，不沉 core** | **P2** |
| editable tab close 语义（C06-3） | **框架渲染层重构，core 保留常量/class** | **P2** |
| `StepsItem` generated references 缺失（C06-4） | **修生成器公开组件来源，不手改 generated 文件** | **P2** |
| Steps finish 图标常量与 `stepFinishChar`（C06-5） | **图标数据沉 core；无消费者符号进 H 分类** | P3 |
| `getNextActiveKey` 无仓库消费者（C06-6） | **保留并分类；删除需 deprecated/migration** | P3 |

---

#### C06 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| `pnpm vitest run tests/core/tabs-utils.spec.ts tests/react/Steps.spec.tsx tests/vue/Steps.spec.ts tests/react/Tabs.spec.tsx tests/vue/Tabs.spec.ts` | ✅ 5 个测试文件、129 个测试通过 | C06 基线 |
| `pnpm api:validate` | ✅ 通过 | C06 基线 |
| `pnpm types:check` | ✅ 通过；但只校验 props 类型导出，不校验 Vue props 成员 parity | C06-1 |
| Grep `lazy` in core/React/Vue Tabs | core 类型、React 类型、Vue 运行时 props 均有；`VueTabsProps` 接口无 | C06-1 |
| Grep `tabIndex/tabindex` in Tabs specs | 双端测试未断言 uncontrolled 点击后的 roving tabindex | C06-2 |
| 比对 editable close 渲染 | 双端均为 `button[role=tab]` 内嵌 `span role="button"` | C06-3 |
| 比对 generated references | `component-index.md` 有 Steps/Tabs/TabPane，缺 StepsItem；`shared/props/navigation.md` 缺 StepsItem props | C06-4 |
| Grep `stepFinishChar` / SVG checkmark | `stepFinishChar` 无消费者；双端 Steps finish SVG path/stroke 双写 | C06-5 |
| Grep `getNextActiveKey` | core 公开但无仓库调用，core tabs-utils 测试未覆盖 | C06-6 |

> 本轮 C06 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C06 阶段只执行目标 vitest、`pnpm api:validate` 与 `pnpm types:check`。

---

### C07 Menu 单组

**扫描范围**：Menu / MenuItem / MenuItemGroup / SubMenu 全链路——core 类型 [packages/core/src/types/menu.ts](../packages/core/src/types/menu.ts)、core 工具 [packages/core/src/utils/menu-utils.ts](../packages/core/src/utils/menu-utils.ts)（并对照 [focus-utils.ts](../packages/core/src/utils/focus-utils.ts)）、React [Menu.tsx](../packages/react/src/components/Menu.tsx) 与 `Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}`、Vue [Menu.ts](../packages/vue/src/components/Menu.ts)（单文件含 MenuItem/MenuItemGroup/SubMenu/ExpandIcon）与 `{MenuItem,MenuItemGroup,SubMenu}.ts` re-export、[tests/react/Menu.spec.tsx](../tests/react/Menu.spec.tsx)、[tests/vue/Menu.spec.ts](../tests/vue/Menu.spec.ts)、[tests/core/menu-utils.spec.ts](../tests/core/menu-utils.spec.ts)、[component-index.md](../skills/tigercat/references/component-index.md)。

**结论速览**：C07 基础面健康——纯逻辑（class 生成、search/filter、height-transition 控制器、roving-tabindex DOM 助手、导航键解析）已下沉 core `menu-utils.ts` 双端共享；双端值/行为/ARIA 对称，测试强且镜像（首字母回退、方向键 roving、Home/End、Escape、collapsed、data-state、portal/teleport 均覆盖；目标 vitest 3 文件 119 测试通过）。**无 P1**。1 条 **P2**（core 两套菜单键盘导航实现并存，决策延后到 C08/H），其余为 P3 清理/结构观察与 a11y/测试加固项。「上下文拆分」检查结论：单一 context 合理，**不拆**。

---

#### C07-1 menu-utils 错位/孤立 JSDoc（文档缺陷）— **P3**

**发现问题**

- 🟢 P3｜[menu-utils.ts:483](../packages/core/src/utils/menu-utils.ts) 起的注释「Query all enabled, visible menu-item buttons that are direct children…」明显描述 `getMenuButtons`，却悬在 [`getMenuNavigationKeys`:493](../packages/core/src/utils/menu-utils.ts)（其自带 :487–492 注释）之上；真正的 [`getMenuButtons`:503](../packages/core/src/utils/menu-utils.ts) 反而无注释。纯文档错位，无运行时影响。

**公共内容决策**：保留 core；把孤立注释移回 `getMenuButtons` 上方。

**建议修复顺序**：P3，随任意 menu-utils 改动顺手修。

**目标验证命令**：`pnpm types:check`。

---

#### C07-2 core 两套菜单键盘导航实现并存（该合未合）— **P2**

**发现问题**

- 🟠 P2｜core 存在两套菜单键盘导航：① `menu-utils.ts` 的 roving-tabindex（查询 `button[data-tiger-menuitem="true"]`：`getMenuButtons`/`moveFocusInMenu`/`focusMenuEdge`/`initRovingTabIndex`/`focusFirstChildItem`/`getMenuNavigationKeys`），由 **Menu（C07）** 使用；② [focus-utils.ts](../packages/core/src/utils/focus-utils.ts) 的 `getMenuItems`/`handleMenuNavigation`/`focusFirstMenuItem`（查询 `[role="menuitem"]`，简单 ↑↓/Home/End 移焦），由 **Dropdown（C08）** 使用（[Dropdown.tsx:21](../packages/react/src/components/Dropdown.tsx)、[Dropdown.ts:28](../packages/vue/src/components/Dropdown.ts)）。二者都作用于 `role="menuitem"` 元素却模型不同（roving + 方向 + 环绕 vs 纯移焦），属典型「该合未合」。

**公共内容决策**：两套都属 core 公共逻辑；**合并/明确分工的决策延后到 C08（Dropdown）或任务 H**——届时 Menu + Dropdown 两个消费者同时在视野，才能判断是统一为一套，还是按「roving 菜单 vs 简单移焦菜单」明确文档化。本组不单独动。

**建议修复顺序**：P2，记录待 C08/H 取舍；非 C07 单独行动项。

**目标验证命令**：`pnpm vitest run tests/core/menu-utils.spec.ts tests/core/focus-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C07-3 React MenuItemGroup 靠函数名识别 SubMenu + 全员缺 displayName（latent 脆性）— **P3**

**发现问题**

- 🟢 P3｜[menu-item-group.tsx:6](../packages/react/src/components/Menu/menu-item-group.tsx) 定义 `isComponentNamed`，:22 用 `child.type === MenuItem || isComponentNamed(child.type, 'SubMenu')`——MenuItem 走稳健的直引比较，SubMenu 因循环依赖（[submenu.tsx:30](../packages/react/src/components/Menu/submenu.tsx) 已 import 本文件）只能靠函数 `.name`/`.displayName`。但所有 React Menu 子组件**均未设 `displayName`**，故仅依赖箭头函数赋值常量推断出的 `.name === 'SubMenu'`。消费端激进压缩改名后，`MenuItemGroup` 内直挂的 `SubMenu` 会静默丢失 `level`/`collapsed` 透传（缩进错误、collapsed popup 覆盖失效）。SubMenu 自身 `renderContent`（[submenu.tsx:315](../packages/react/src/components/Menu/submenu.tsx)）用直引 `child.type === SubMenu`，不受影响。

**公共内容决策**：框架层修；给 Menu 子组件设 `displayName`（兼利 devtools）或加稳定静态标记，避免依赖压缩后的函数名。Vue 侧用 `name: 'TigerSubMenu'` 等组件名识别（[Menu.ts:701](../packages/vue/src/components/Menu.ts)、[:1111](../packages/vue/src/components/Menu.ts)），相对稳定。

**建议修复顺序**：P3（需特定嵌套 + 压缩才触发），可与 C07-4 同批框架层小修。

**目标验证命令**：`pnpm vitest run tests/react/Menu.spec.tsx`、`pnpm types:check`。

---

#### C07-4 Vue focusFirstChild 反推标题元素（双端 parity / 健壮性）— **P3**

**发现问题**

- 🟢 P3｜Vue `focusFirstChild`（[Menu.ts:981](../packages/vue/src/components/Menu.ts)）`await nextTick()` 后用 `document.activeElement` 当标题元素传给 `focusFirstChildItem`；React `openInline`（[submenu.tsx:178](../packages/react/src/components/Menu/submenu.tsx)）直接捕获 `event.currentTarget` 标题按钮传入。实践可用（Enter 后焦点仍在标题按钮），但若 await 期间焦点移动则 Vue 会定位到错误元素。

**公共内容决策**：框架层修，Vue 在 `handleTitleKeyDown` 捕获 `current` 按钮并透传，对齐 React。

**建议修复顺序**：P3。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`（建议补「Enter 展开 inline 子菜单后焦点落到首子项」断言）。

---

#### C07-5 Vue 单文件 monolith vs React 多文件拆分（结构观察）— **P3**

**发现问题**

- 🟢 P3｜Vue [Menu.ts](../packages/vue/src/components/Menu.ts) 单文件 1274 行承载 Menu + MenuItem + MenuItemGroup + SubMenu + ExpandIcon + context + types，另有 `MenuItem.ts`/`MenuItemGroup.ts`/`SubMenu.ts` 三个 6 行 re-export；React 拆成 `Menu.tsx` + `Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}`。维护性上属「该拆未拆」。

**公共内容决策**：可选重构（Vue 镜像 React 拆分）；当前因共享 `MenuContext`/helper 而内聚，非缺陷，**延后**。

**建议修复顺序**：P3，非本轮动作。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`、`pnpm types:check`、`pnpm api:validate`（确保拆分后导出不变）。

---

#### C07-6 Vue 首字母回退取值更脆（边缘）— **P3**

**发现问题**

- 🟢 P3｜Vue MenuItem collapsed-无 icon 分支用 `String(defaultSlot[0].children || '')` 取首字母（[Menu.ts:596](../packages/vue/src/components/Menu.ts)），React 用 `String(children || '')`（[menu-item.tsx:107](../packages/react/src/components/Menu/menu-item.tsx)）。复合 slot（如 `<Icon/>文本`）下 Vue 取「首个 vnode 的 children」可能取错。

**公共内容决策**：记录为边缘场景（collapsed + 无 `icon` prop + 多节点 slot）；测试仅覆盖纯文本标签。

**建议修复顺序**：P3，可与 C07-4 同批。

**目标验证命令**：`pnpm vitest run tests/vue/Menu.spec.ts`。

---

#### C07-7 上下文拆分：单一 context 合理（观察 / 无动作）

**发现问题**

- ℹ️ 双端均单一 context（React `MenuContext` [context.ts:5](../packages/react/src/components/Menu/context.ts) / Vue `MenuContextKey` [Menu.ts:64](../packages/vue/src/components/Menu.ts)），载 mode/theme/collapsed/inlineIndent/popupPortal/selectedKeys/openKeys + 两个 handler。子项几乎都需其中多数值；选中态变化会让 contextValue 整体更新、消费组件较广重渲染，但菜单体量小，拆「静态配置 vs 选中态」两 context 收益有限。

**公共内容决策**：**保持单一 context，不拆**（直接回应 ROADMAP「上下文拆分」检查项：结论为设计合理）。

**建议修复顺序**：无动作。

**目标验证命令**：—。

---

#### C07-8 缺 ARIA 首字母 typeahead 导航 + roving-tabindex 核心助手无直接单测（a11y / 测试加固）— **P3**

**发现问题**

- 🟢 P3｜键盘处理覆盖方向键/Home/End/Enter/Space/Escape，但**无 WAI-ARIA 首字母 typeahead 导航**（敲字母跳到下一个匹配项）——与 collapsed 首字母展示、`searchable` 输入框是不同特性；双端一致，非回退。
- 🟢 P3｜`getMenuButtons`/`moveFocusInMenu`/`focusMenuEdge`/`initRovingTabIndex`/`focusFirstChildItem` **无直接 core 单测**（[tests/core/menu-utils.spec.ts](../tests/core/menu-utils.spec.ts) 仅覆盖 height-transition/search/classes/`getMenuNavigationKeys`），只经 React/Vue 组件 spec 间接覆盖。

**公共内容决策**：typeahead 属可选 a11y 增强，若做应抽 core 共享 typeahead 助手（双端复用）；roving-tabindex DOM 助手建议补 core 单测加固这批逻辑密集函数。

**建议修复顺序**：P3，独立可选项。

**目标验证命令**：`pnpm vitest run tests/core/menu-utils.spec.ts tests/react/Menu.spec.tsx tests/vue/Menu.spec.ts`。

> 「首字母回退」歧义澄清：组件实现的是 **collapsed 模式首字母展示回退**（无 icon 时显示首字母 + sr-only 全名），双端均实现且被测试断言（[tests/react/Menu.spec.tsx:811](../tests/react/Menu.spec.tsx)、[tests/vue/Menu.spec.ts:871](../tests/vue/Menu.spec.ts) 断言 `'A'`）；**首字母 typeahead 检索导航并不存在**（即本条）。

---

#### C07 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| 两套菜单键盘导航（C07-2） | **该合未合，决策延后 C08/H** | **P2** |
| menu-utils 错位 JSDoc（C07-1） | 注释移位修正 | P3 |
| React SubMenu 名识别 + displayName（C07-3） | 框架层加 displayName/标记 | P3 |
| Vue focusFirstChild 反推元素（C07-4） | 框架层对齐 React | P3 |
| Vue monolith 拆分（C07-5） | 可选重构，延后 | P3 |
| Vue 首字母取值脆性（C07-6） | 边缘记录 | P3 |
| 单一 context（C07-7） | 保持不拆 | 观察 |
| typeahead / 核心单测（C07-8） | a11y 增强 + 补 core 单测 | P3 |

---

#### C07 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| 读 `menu-utils.ts:479-575` 注释/函数排布 | :483-486 注释错位于 `getMenuNavigationKeys` 上方，`getMenuButtons`@503 无注释 | C07-1 |
| Grep `handleMenuNavigation`/`getMenuItems`/`focusFirstMenuItem` 消费者（src） | 仅 Dropdown（React/Vue）使用 focus-utils；Menu 用 menu-utils | C07-2 |
| Grep `displayName`（React Menu 目录） | 仅 `isComponentNamed` 内部读取，无任何子组件设 displayName | C07-3 |
| 比对 React `openInline` vs Vue `focusFirstChild` | React 传 `event.currentTarget`；Vue 反推 `document.activeElement` | C07-4 |
| `wc -l` Vue Menu.ts 与 re-export | Menu.ts=1274；MenuItem/MenuItemGroup/SubMenu.ts 各 6 行 | C07-5 |
| 比对首字母取值 | Vue `defaultSlot[0].children`（:596） vs React `String(children)`（:107） | C07-6 |
| 比对 context 定义 | 双端单一 context，载 8 字段 + 2 handler | C07-7 |
| 读 keydown 分支 + `menu-utils.spec.ts` | 无 typeahead 分支；core spec 不测 roving-tabindex DOM 助手 | C07-8 |
| collapsed 首字母测试 | React spec:811 / Vue spec:871 均断言 aria-hidden 首字母 `'A'` + sr-only 全名 | 首字母回退已实现并测 |
| 实跑目标 vitest | `tests/react/Menu.spec.tsx` + `tests/vue/Menu.spec.ts` + `tests/core/menu-utils.spec.ts`：3 文件 119 测试通过 | 结论速览 |
| 实跑 `pnpm api:validate` / `pnpm types:check` | 均通过（API 一致性 0 问题；公共 props 类型齐全） | 无 P1 |

> 本轮 C07 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C07 阶段只执行目标 vitest、`pnpm api:validate` 与 `pnpm types:check`（均通过）。
