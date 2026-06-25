# Tigercat 路线图扫描记录

<!-- LLM-INDEX
type: roadmap-scan
scope: ROADMAP「最新一轮全代码扫描」任务 A — 公共 API、导出面与文档生成链路（A-1~A-7）
verified-date: 2026-06-24
source: 实读 packages/{core,react,vue,cli}/src/index* 与 package.json；scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs；根 package.json scripts；api-reports/public-api-baseline.json（含 git show HEAD 对照）；skills/tigercat/references/component-index.md；.prettierignore/.prettierrc.json。实跑 pnpm api:validate / types:check（均通过）、pnpm api:baseline / docs:api（生成后 git diff 取证再 git checkout 还原）。Grep packages/*/src 的 @deprecated（0 命中）。
note: 本文仅记录可验证发现与修复建议，未改动任何源码/脚本/生成产物（仅本文件 + ROADMAP.md 状态标记）。结论与建议供维护者取舍。
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
