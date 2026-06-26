# Tigercat 路线图扫描记录

<!-- LLM-INDEX
type: roadmap-scan
scope: ROADMAP「最新一轮全代码扫描」任务 A-B；任务 C 组件分组扫描 C01「基础动作与文本」（C01-1~C01-8）、C02「头像与状态展示」（C02-1~C02-5）、C03「布局骨架」（C03-1~C03-2）、C04「内容容器」（C04-1~C04-8）、C05「导航轻量组」（C05-1~C05-5）、C06「Steps/Tabs」（C06-1~C06-6）、C07「Menu 单组」（C07-1~C07-8）、C08「Overlay 触发器」（C08-1~C08-7）、C09「Feedback 容器」（C09-1~C09-7）、C10「消息通知」（C10-1~C10-7）、C11「Form 单组」（C11-1~C11-6）、C12「输入基础组」（C12-1~C12-6）、C13「选择/切换基础组」（C13-1~C13-4）、C14「Select 单组」（C14-1~C14-8）
verified-date: 2026-06-26
source: 任务 A：实读 packages/{core,react,vue,cli}/src/index* 与 package.json；scripts/{validate-api,check-public-types,generate-api-docs,generate-api-baseline}.mjs；根 package.json scripts；api-reports/public-api-baseline.json（含 git show HEAD 对照）；skills/tigercat/references/component-index.md；.prettierignore/.prettierrc.json。实跑 pnpm api:validate / types:check（均通过）、pnpm api:baseline / docs:api（生成后 git diff 取证再 git checkout 还原）。Grep packages/*/src 的 @deprecated（0 命中）。任务 B：实读 packages/core/src/{types,utils,themes,theme-runtime,tokens}、tailwind entry/plugin、packages/core/tokens、packages/core/package.json、packages/core/tsup.config.ts、React/Vue DatePicker 与 ConfigProvider、相关 tests/core；复核时直接 pnpm 因本机 11.7.0 低于 engines.pnpm >=11.9.0 被拦截，改用 packageManager 指定的 corepack pnpm 11.9.0 实跑 types:check / api:validate / 目标 vitest（均通过）。任务 C/C01：实读 8 组件（Button/ButtonGroup/Link/Text/Code/Icon/Tag/Badge）的 core 类型 types/{button,link,tag,badge,icon,text,code}.ts、core 工具 utils/{button,badge,tag,text,link,icon,group}-utils.ts 与 class-names/compose-classes/coerce-class-value/svg-attrs/dev-warn/common-icons、theme-runtime/colors.ts，packages/{react,vue}/src/components 的 8 组件实现，tests/{react,vue} 对应 spec，component-index.md；静态实读取证（含 grep 取证 role/label/helper 用法），C01 为仅文档变更未跑门禁命令。任务 C/C02：实读 packages/{core,react,vue}/src/components/{Avatar,AvatarGroup,Empty,Result,Statistic,QRCode,Watermark}.{tsx,ts} 与对应 core/src/utils/{avatar,empty,result,statistic,qrcode,watermark}-utils.ts 及 core/src/types/*。任务 C/C03：实读 packages/core/src/types/{layout,container,grid,space,divider}.ts、packages/core/src/utils/{layout-utils,container-utils,grid,space,divider}.ts、React/Vue 对应布局组件实现、tests/{core,react,vue} 定向测试、examples/example/{react,vue3} 布局示例、skills/tigercat/references 相关 generated references。任务 C/C04：实读 packages/core/src/types/{card,list,descriptions,skeleton,collapse,timeline}.ts 与 locale.ts、packages/core/src/utils/{card,list,descriptions,skeleton,collapse,timeline}-utils.ts（对照 grid.ts/table-utils.ts/markdown-editor-utils.ts 安全 class 写法）、React/Vue 对应七组件实现、tests/{react,vue} 定向 spec、examples/example/{react,vue3} 内容容器示例、skills/tigercat/references；实跑 C04 定向 vitest（12 files/210 tests 通过）+ validate-api/check-public-types 通过，未改动任何源码。任务 C/C05：实读 packages/core/src/types/{affix,anchor,back-top,breadcrumb,float-button,scroll-spy}.ts、packages/core/src/utils/{affix-utils,anchor-utils,back-top-utils,breadcrumb-utils,float-button-utils,scroll-spy-utils}.ts、React/Vue 对应导航组件实现、tests/{core,react,vue} 定向测试、skills/tigercat/references/shared/props/navigation.md 与 examples/navigation.md；实跑本地 vitest/API/type 验证通过；未改动任何源码。任务 C/C06：实读 Steps/StepsItem/Tabs/TabPane 的 core 类型 types/{steps,tabs}.ts、core 工具 utils/{steps,tabs}-utils.ts、packages/{react,vue}/src/components/{Steps,StepsItem,Tabs,TabPane}、tests/{react,vue}/{Steps,Tabs}.spec 与 tests/core/tabs-utils.spec.ts、skills/tigercat/references/{component-index.md,shared/props/navigation.md,examples/navigation.md}；实跑 C06 目标 vitest、pnpm api:validate、pnpm types:check（均通过）。任务 C/C07：实读 Menu/MenuItem/MenuItemGroup/SubMenu 的 core 类型 types/menu.ts、core 工具 utils/menu-utils.ts（并对照 utils/focus-utils.ts）、packages/react/src/components/Menu.tsx 与 Menu/{context,state,types,menu-item,submenu,menu-item-group,icons}、packages/vue/src/components/Menu.ts 单文件与 {MenuItem,MenuItemGroup,SubMenu}.ts re-export、tests/{react,vue}/Menu.spec.ts* 与 tests/core/menu-utils.spec.ts、skills/tigercat/references/component-index.md；grep 取证 focus-utils 菜单函数消费者仅 Dropdown、React Menu 子组件无 displayName、Vue {class,style,...rest} 透传样板（7 处）；实跑 C07 目标 vitest（tests/react/Menu.spec.tsx + tests/vue/Menu.spec.ts + tests/core/menu-utils.spec.ts，3 文件 119 测试通过）、pnpm api:validate、pnpm types:check（均通过）。任务 C/C08：实读 Dropdown/DropdownMenu/DropdownItem/Popover/Popconfirm/Tooltip 的 core 类型、floating/overlay/focus 工具、React/Vue 实现、双端 usePopup/useFloatingPopup 与 overlay 封装、4 个 popup 双端 spec、core floating/focus/overlay spec、generated references；grep 取证 BaseFloatingPopupProps/PopoverTrigger/TooltipTrigger/defer/focus-utils 菜单消费者；实跑 C08 目标 vitest（12 文件 225 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C09：实读 Modal/Drawer/Loading/Progress/Tour 的 core 类型与工具、React/Vue 实现、overlay helper、feedback props/examples references、双端 spec 与 core overlay/tour-utils spec；grep 取证 open callback、mask=false、locale、portal/Teleport、focus/scroll/Escape/aria；实跑 C09 目标 vitest（13 文件 243 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C10：实读 Message/Notification/NotificationCenter 的 core 类型 types/{message,notification}.ts、core 工具 utils/{message-utils,notification-utils,notification-center-utils}.ts、React/Vue 三组件实现与 packages/{react,vue}/src/index 导出、tests/{core,react,vue} 8 个定向 spec、generated references（component-index.md、shared/props/feedback.md、shared/api-summary.md）；grep 取证 Message position 未被 addMessage 读取（双端单例恒 top）、NotificationCenter `_currentGroup` 双端死代码、imperative 共享 helper（normalizeStringOption/createInstanceCounter/ANIMATION_DURATION_MS/isBrowser）与 `Message`/`notification` 导出命名、core 回退不对称；实跑 C10 目标 vitest（8 文件 112 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C11：实读 Form/FormItem/useFormController 的 core 类型 types/form.ts、core 工具 utils/{form-validation,form-dependency-utils,form-item-styles,form-history-utils}.ts、React 实现 components/{Form,FormItem}.tsx 与 hooks/useFormController.ts、Vue 实现 components/{Form,FormItem}.ts 与 composables/useFormController.ts、tests/{core,react,vue} 8 个定向 spec、generated references（component-index.md、shared/props/form.md、shared/api-summary.md、examples/form.md）；FormWizard（C30）排除；grep 取证 useFormContext 消费者与 context.model/updateValue 无人读、8 个 core 表单 helper 无生产消费者、addField/resetFields/undo 双端契约差异、getValueByPath 数组段限制；实跑 C11 目标 vitest（8 文件 248 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。任务 C/C12：实读 Input/Textarea/InputGroup/InputGroupAddon/InputNumber/NumberKeyboard/Mentions 的 core 类型 types/{input,textarea,input-group,input-number,number-keyboard,mentions}.ts、core 工具 utils/{input-styles,textarea-auto-resize,input-group-utils,input-number-utils,number-keyboard-utils,mentions-utils}.ts、React/Vue 对应组件实现、tests/{core,react,vue} 16 个定向 spec、generated references（component-index.md、shared/props/form.md、shared/patterns/common.md、examples/form.md）；grep 取证 InputGroup size 上下文消费者、React Input/Textarea reference onChange 示例、Vue InputNumber defaultValue/className props、Mentions filteredOptions 打开/渲染分支、InputNumber 重复 spec、NumberKeyboard delete/confirm locale；实跑 C12 目标 vitest（16 文件 473 测试通过）、corepack pnpm api:validate、corepack pnpm types:check（均通过）。
source-c13: 实读 Checkbox/CheckboxGroup、Radio/RadioGroup、Switch、Slider、Stepper、Rate、Segmented 的 core 类型 types/{checkbox,radio,switch,slider,stepper,rate,segmented}.ts、core 工具 utils/{radio-utils,radio-group-utils,rate-utils,stepper-utils,segmented-utils}.ts 与 utils/helpers/slider-utils.ts，双端组件实现、双端定向 spec、tests/core/{segmented-utils,switch-theme}.spec.ts，以及 component-index、shared/props/{form,basic}.md、examples/form.md；grep 取证 ARIA/键盘事件、marks 布局、slider/stepper 数值 helper 消费者与测试覆盖。
source-c14: 实读 Select/AutoComplete 全链路——core 类型 types/{select,auto-complete}.ts、core 工具 utils/{select-utils,auto-complete-utils,picker-utils}.ts、React 实现 components/Select.tsx 与 Select/{state,render-option,types,icons}、components/AutoComplete.tsx、Vue 实现 components/{Select,AutoComplete}.ts、tests/{react,vue}/{Select,AutoComplete}.spec.* 与 tests/core/{picker-utils,select-utils}.spec.ts、examples SelectDemo/AutoCompleteDemo、generated component-index；grep 取证 allowFreeInput 双端零消费、Select virtual/listHeight 双端零消费、getPickerTriggerKeyAction 仅 TreeSelect/Cascader 消费而 Select 未用；以 packageManager pnpm 11.9.0 实跑 C14 目标 vitest（6 文件 190 测试通过）与 api:validate / types:check（均通过），未改动源码。
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
| `git status --short` | ✅ 扫描前干净 | 完成后仅留下本次 Roadmap 文档更新；未留下源码/生成产物改动 |
| `pnpm types:check` | ⚠️ 环境拦截 | 本机默认 `pnpm 11.7.0` 低于仓库 `engines.pnpm >=11.9.0` |
| `corepack pnpm -v` | ✅ 11.9.0 | 使用 `packageManager: pnpm@11.9.0` 对齐仓库配置 |
| `corepack pnpm types:check` | ✅ 通过 | `All public component props types are exported.` |
| `corepack pnpm api:validate` | ✅ 通过 | API 一致性检查 0 问题 |
| `corepack pnpm vitest run tests/core/design-tokens.spec.ts tests/core/datepicker-i18n.spec.ts tests/core/i18n-locales.spec.ts tests/core/custom-text-labels.spec.ts tests/core/kanban-utils.spec.ts` | ✅ 通过 | 5 个测试文件、62 个测试通过 |
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

### C02 头像与状态展示

**扫描范围**：Avatar、AvatarGroup、Empty、Result、Statistic、QRCode、Watermark 七个组件的 React/Vue 实现、core 类型/工具模块、测试文件、示例页面。

**结论速览**：core 工具层已高度下沉，Canvas/SVG 逻辑均已提取到 `core/utils/`，双端实现对称度良好。但发现 **2 条功能 Bug**（P1）、**2 条 token/代码质量问题**（P2）、**1 条 i18n 缺口**（P2）。

---

#### C02-1 Vue AvatarGroup `size` prop 不响应式 — **P1 Bug**

**文件**：[packages/vue/src/components/AvatarGroup.ts:44](../packages/vue/src/components/AvatarGroup.ts)

```ts
provide<AvatarGroupContext>(AVATAR_GROUP_INJECTION_KEY, {
  size: props.size,   // ← setup 执行一次后不再更新
  itemClass: getAvatarGroupItemClasses()
})
```

`provide` 注入的是静态对象快照，`props.size` 变化后子 Avatar 读到的 inject 值不更新，导致动态切换 AvatarGroup `size` 时子头像尺寸不跟随变化。

对比 React 版（[packages/react/src/components/AvatarGroup.tsx:31](../packages/react/src/components/AvatarGroup.tsx)）使用 `useMemo` 在每次渲染时重新生成 contextValue，行为正确。

**公共内容决策**：属 Vue 框架层问题，无需沉到 core；修复保留在 Vue 组件内。

**建议修复**：改为 provide 一个 `reactive` 对象，并在 setup 内用 `watch` 同步 `props.size`：

```ts
const groupContext = reactive<AvatarGroupContext>({
  size: props.size,
  itemClass: getAvatarGroupItemClasses()
})
watch(() => props.size, (s) => { groupContext.size = s })
provide(AVATAR_GROUP_INJECTION_KEY, groupContext)
```

**目标验证命令**：`pnpm vitest run tests/vue/Avatar.spec.ts`、`pnpm types:check`。

---

#### C02-2 React QRCode 缺少 locale 支持，与 Vue 不对称 — **P1 不对称**

**文件**：
- [packages/react/src/components/QRCode.tsx:75](../packages/react/src/components/QRCode.tsx)（`"Loading..."` 硬编码）
- [packages/vue/src/components/QRCode.ts:44-46](../packages/vue/src/components/QRCode.ts)（已接入 `useTigerConfig` + `mergeTigerLocale` + `resolveLocaleText`）

Vue QRCode 接受 `locale` prop 并通过 `resolveLocaleText` 走 locale 系统（仅 loading 文本），React QRCode 完全无 locale prop，loading 文本写死为英文。`"QR code expired"` 和 `"Refresh"` 两端均硬编码，未走 locale（属共同缺口，见 C02-3）。

**公共内容决策**：locale key 合入 core `TigerLocale` 类型（`qrcode` 命名空间）；`resolveLocaleText` 已在 core 中，无需新增 helper。

**建议修复**：
1. 在 `packages/core/src/types/locale.ts`（或 locale-utils.ts）补 `qrcode: { expiredText, refreshText, loadingText }` key。
2. React QRCode 加 `locale?: Partial<TigerLocale>` prop，接入 `useConfigProvider`，用 `resolveLocaleText` 渲染三段文本。
3. Vue QRCode 同步补 `expiredText` / `refreshText` 两段文本的 locale 覆盖（当前只做了 loadingText）。

**目标验证命令**：`pnpm vitest run tests/react/QRCode.spec.tsx tests/vue/QRCode.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C02-3 QRCode loading/expired 状态文本使用裸 Tailwind 类而非 CSS token — **P2**

**文件**：[packages/react/src/components/QRCode.tsx:75](../packages/react/src/components/QRCode.tsx)、[packages/vue/src/components/QRCode.ts:114](../packages/vue/src/components/QRCode.ts)

两端 loading overlay 均写了 `'text-sm text-gray-500'`，与组件其他地方（如 `qrcodeExpiredTextClasses`）使用 `var(--tiger-text-muted)` token 的风格不一致，切换主题时颜色不随 token 变化。

**公共内容决策**：补常量到 `packages/core/src/utils/qrcode-utils.ts`，两端直接引用。

**建议修复**：在 `qrcode-utils.ts` 补：

```ts
export const qrcodeLoadingTextClasses =
  'text-sm text-[var(--tiger-qrcode-loading-text,var(--tiger-text-muted,#6b7280))]'
```

React/Vue 两端将 `'text-sm text-gray-500'` 替换为该常量。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C02-4 `getResultHttpLabel` 函数无实质作用 — **P2 冗余**

**文件**：[packages/core/src/utils/result-utils.ts:124](../packages/core/src/utils/result-utils.ts)

```ts
const httpStatusLabels: Record<string, string> = {
  '404': '404',
  '403': '403',
  '500': '500'
}
export function getResultHttpLabel(status: ResultStatus): string | undefined {
  return httpStatusLabels[status]
}
```

`httpStatusLabels` 的值与 key 完全相同，函数实际只起「判断是否 HTTP 状态码并透传原字符串」的作用，查表意义为零。

**公共内容决策**：删除查找表，改为语义更清晰的类型守卫导出；保留在 core。

**建议修复**：

```ts
const HTTP_RESULT_STATUSES = new Set<ResultStatus>(['404', '403', '500'])

export function isHttpResultStatus(status: ResultStatus): boolean {
  return HTTP_RESULT_STATUSES.has(status)
}
```

调用方改为 `isHttpResultStatus(status) ? status : undefined`，删除 `getResultHttpLabel`。此为**公共 API 变更**，需走 deprecated → migration → changeset 流程，并刷新 `api:baseline`。

**目标验证命令**：`pnpm api:validate`、`pnpm api:baseline:check`、`pnpm vitest run tests/core/result-utils.spec.ts`。

---

#### C02-5 Empty 描述文本仅硬编码英文，未接入 locale — **P2 i18n 缺口**

**文件**：[packages/core/src/utils/empty-utils.ts:28](../packages/core/src/utils/empty-utils.ts)

```ts
const presetDescriptions: Record<EmptyPreset, string> = {
  default: 'No data',
  simple: 'No data',
  'no-data': 'No data available',
  'no-results': 'No results found',
  error: 'Something went wrong'
}
```

`getEmptyDescription(preset)` 固定返回英文，React/Vue Empty 组件直接消费，无 locale 覆盖机制。与已支持 locale 的 QRCode、Table 等组件形成一致性缺口。

**公共内容决策**：locale key 合入 core `TigerLocale` 类型（`empty` 命名空间）；`getEmptyDescription` 函数接受可选 locale 参数，或各端组件读取 ConfigProvider locale 后直接取值；核心 helper 保留在 core。

**建议修复**：在 locale 类型中补 `empty: { noData, noDataAvailable, noResults, error }`，两端 Empty 组件读取 ConfigProvider locale 后通过 `resolveLocaleText` 渲染描述文本，`getEmptyDescription` 降级为 fallback。

**目标验证命令**：`pnpm vitest run tests/core/empty-utils.spec.ts tests/react/Empty.spec.tsx tests/vue/Empty.spec.ts`、`pnpm api:validate`。

---

#### C02 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
|---|---|---|
| Canvas/SVG/QR 矩阵逻辑（watermark-utils、qrcode-utils） | **已在 core，保持** | 两端共用，无运行时框架依赖，已正确下沉 |
| `qrcodeLoadingTextClasses` 常量（C02-3） | **合入 core/utils/qrcode-utils.ts** | 统一 token 引用，删两端裸 Tailwind 字符串 |
| QRCode locale key（C02-2） | **合入 core TigerLocale 类型** | 补 `qrcode.expiredText / refreshText / loadingText` |
| Empty locale key（C02-5） | **合入 core TigerLocale 类型** | 补 `empty.*` 命名空间 |
| `isHttpResultStatus` 替换 `getResultHttpLabel`（C02-4） | **保留 core，走 deprecated 流程** | 公共 API 变更，需 changeset |
| Vue AvatarGroup reactive provide（C02-1） | **保留 Vue 组件层** | 纯框架生命周期问题，不涉及 core |
| `easeOutCubic` / `interpolateStatisticValue`（statistic-utils） | **已在 core，保持** | 动画纯逻辑，无框架依赖，已正确位置 |
| 水印 MutationObserver 逻辑（React/Vue Watermark） | **保留各框架层** | 依赖 DOM ref 生命周期，不可沉 core |

---

#### 本轮验证说明（C02）

扫描为纯静态阅读，未运行任何命令、未改动任何源码。C02 修复实施后应运行：

```bash
pnpm types:check
pnpm api:validate
pnpm vitest run tests/react/Avatar.spec.tsx tests/vue/Avatar.spec.ts
pnpm vitest run tests/react/QRCode.spec.tsx tests/vue/QRCode.spec.ts
pnpm vitest run tests/core/result-utils.spec.ts tests/core/empty-utils.spec.ts
# C02-4 涉及公共 API 变更时追加：
pnpm api:baseline:check
```

---

### C03 布局骨架

**扫描范围**：Layout、Header、Sidebar、Content、Footer、Container、Row、Col、Space、Divider 十个组件的 core 类型/工具模块、React/Vue 实现、测试文件、示例页面与 generated references。Divider 虽在 component-index 归 Basic，但 ROADMAP C03 明确列入，本次按 ROADMAP 口径纳入布局骨架扫描。

**结论速览**：未发现 Layout/Grid/Space/Divider 的 P1 运行时 Bug。布局 class/style 计算整体已沉到 core，React/Vue 实现多为薄包装，语义标签、attrs/native props 透传、Grid CSS 变量路径和 Space/Divider 行为基本对称。本轮发现 **1 条 generated reference 文档问题**（P2）和 **1 条 legacy public utility 清理项**（P3）。

---

#### C03-1 Space props reference 表格被联合类型说明中的 `|` 打坏 — **P2 文档生成**

**文件**：[skills/tigercat/references/shared/props/layout.md:154](../skills/tigercat/references/shared/props/layout.md)、[scripts/generate-api-docs.mjs:570](../scripts/generate-api-docs.mjs)

`Space` 的 generated props 表格当前被 `SpaceSize` 注释里的联合类型说明打成 6 列：

```md
| Prop         | Type             | Default        | Notes                                                  |
| ------------ | ---------------- | -------------- | ------------------------------------------------------ | ------- | --------------------------- |
| `size?`      | `SpaceSize`      | `'md'`         | Space size between items Can be a preset size ('sm' \ | 'md' \ | 'lg') or a custom number... |
```

源码注释来自 [packages/core/src/types/space.ts:32](../packages/core/src/types/space.ts)：`Can be a preset size ('sm' | 'md' | 'lg') or a custom number (in pixels)`。生成器虽然在 `tableText()` 中对 `|` 做了转义，但经过 markdown formatter 后仍输出为会被表格解析的分隔符，导致 `Space` 段落在 rendered reference 中列数错乱。

**公共内容决策**：修复应落在 `scripts/generate-api-docs.mjs` 的 markdown table cell 转义/格式化链路；`skills/tigercat/references/*` 是生成结果，不手改 generated reference。

**建议修复顺序**：

1. 在 `generate-api-docs.mjs` 的 table cell 生成阶段统一处理 description 中的 pipe，确保 prettier markdown 格式化后仍保持单元格内文本。
2. 重跑 `pnpm docs:api`，确认 `Space` props 表格恢复 4 列，并提交 generated references。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C03-2 `getGutterStyles` 已是旧 inline gutter helper — **P3 legacy 清理候选**

**文件**：[packages/core/src/utils/grid.ts:208](../packages/core/src/utils/grid.ts)

`getGutterStyles(gutter)` 仍返回旧式 `rowStyle` / `colStyle` inline margin/padding 对象；当前 React/Vue Grid 实现已经使用 CSS 变量路径：

- React/Vue Row 使用 `getRowGutterStyleVars`。
- React/Vue Col 使用 `getColMergedStyleVars` 与 `getColGutterClasses`。
- `rg` 结果显示 `getGutterStyles` 只在 `tests/core/grid.spec.ts` 中被覆盖，框架实现、示例和 generated references 均不消费该旧 helper。

同时，Grid/Space/Divider/Layout/Container 工具通过 [packages/core/src/utils/styles/index.ts:55](../packages/core/src/utils/styles/index.ts) 的 layout style utility 汇总进入 core flat utilities，属于公开 utility 面；不能把 `getGutterStyles` 当内部死代码直接删除。

**公共内容决策**：先作为兼容 legacy helper 保留。若后续要删除或替换，应按公共 API 变更处理：标记 deprecated、补 migration/changeset、刷新 baseline；若不删，可在注释中标明 legacy inline gutter path，推荐新实现继续使用 CSS 变量 helper。

**建议修复顺序**：P3，可延后到任务 H 的公共拆分/合并决策汇总，或在任务 G/API 清理批次中统一处理 public utility deprecation。

**目标验证命令**：若仅加 deprecated 注释，运行 `pnpm types:check`、`pnpm api:validate`；若删除或改导出，追加 `pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C03 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| Layout/Header/Sidebar/Content/Footer class/style helper | **已在 core，保持** | 纯 class/style 计算无框架运行时依赖，两端薄包装消费正确 |
| Container/Space/Divider style helper | **已在 core，保持** | 两端共用，attrs/native props 透传留在框架层 |
| Grid CSS 变量 gutter/span/order/flex helper | **已在 core，保持** | React/Vue 均使用同一套 CSS 变量计算，避免双端重复 |
| `getGutterStyles` legacy inline helper（C03-2） | **保留兼容，列入 deprecation 候选** | 已无框架消费，但属 public flat utility，不能直接删除 |
| generated props 表格转义（C03-1） | **修生成器，不手改生成物** | 先改 `generate-api-docs.mjs`，再重生 references |

---

#### 本轮验证命令实跑输出摘要（C03）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests/core/grid.spec.ts tests/react/LayoutSections.spec.tsx tests/react/Container.spec.tsx tests/react/Grid.spec.tsx tests/react/Space.spec.tsx tests/react/Divider.spec.tsx tests/vue/LayoutSections.spec.ts tests/vue/Container.spec.ts tests/vue/Grid.spec.ts tests/vue/Space.spec.ts tests/vue/Divider.spec.ts` | ✅ 通过 | 11 个 test files、114 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |
| `pnpm ...` wrapper | ⚠️ 本机阻塞 | 无 TTY 下触发依赖状态检查/安装并因 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 中止；已改用本地 bin / node 脚本完成验证 |

---

### C04 内容容器

**扫描范围**：Card、List、Descriptions、Skeleton、Collapse、CollapsePanel、Timeline 七个组件的 core 类型/工具模块、React/Vue 实现、测试文件、示例页面与 generated references。

**结论速览**：core 工具层下沉良好——Collapse 过渡控制器、Descriptions 行分组、Skeleton 段落宽度、Timeline 定位数学均已在 core 双端复用，框架实现多为薄包装。本轮发现 **1 条双端不对称（P1）**、**3 条质量问题（P2）**、**4 条清理/一致性项（P3）**；C04 定向测试与 API/type 检查均通过，所有发现均为潜在问题（未触发现有门禁）。

---

#### C04-1 React Timeline 缺少 locale 支持，与 Vue 不对称 — **P1 不对称**

**文件**：[packages/react/src/components/Timeline.tsx:168](../packages/react/src/components/Timeline.tsx)（`Loading...` 硬编码、无 `locale` prop、未接 ConfigProvider）、[packages/vue/src/components/Timeline.ts:228](../packages/vue/src/components/Timeline.ts)（已接 `useTigerConfig` + `mergeTigerLocale`，pending 文本走 `resolveLocaleText`）

Vue Timeline 暴露 `locale?: Partial<TigerLocale>` prop，并通过 `resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)` 渲染 pending 文本；React Timeline 无 `locale` prop、未接入 ConfigProvider，pending 文本写死英文 `Loading...`。与 C02-2（React QRCode 缺 locale）同型。React 仅有 `pendingContent` 逃生口，默认 pending 文本无法本地化；本地化面较小（仅一段 pending 文本）。

**公共内容决策**：`common.loadingText` 已在 core `TigerLocale`，无需新增 key；React Timeline 加 `locale?: Partial<TigerLocale>` prop、接 `useTigerConfig`、用 `resolveLocaleText` 渲染默认 pending 文本即可对齐。渲染逻辑保留框架层。

**建议修复顺序**：

1. React Timeline 接入 ConfigProvider locale，pending 默认文本走 `resolveLocaleText`。
2. 补 React 测试覆盖 locale 覆盖路径。
3. `pnpm api:validate` 复核双端 parity。

**目标验证命令**：`pnpm vitest run tests/react/Timeline.spec.tsx tests/vue/Timeline.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C04-2 List `getGridColumnClasses` 动态拼接 grid-cols 类（Tailwind 不可扫描）+ xs/column 撞车 + 零测试 — **P2 潜在功能 Bug**

**文件**：[packages/core/src/utils/list-utils.ts:191](../packages/core/src/utils/list-utils.ts)，被 [packages/react/src/components/List.tsx:251](../packages/react/src/components/List.tsx)、[packages/vue/src/components/List.ts:307](../packages/vue/src/components/List.ts) 在 grid 模式消费

两类问题：

1. **Tailwind JIT 无法扫描**：函数拼接 `grid-cols-${column}`、`sm:grid-cols-${sm}` 等模板字符串。这正是 [timeline-utils.ts:19](../packages/core/src/utils/timeline-utils.ts) 注释明令禁止的写法（“NEVER interpolate … the scanner will NOT resolve them”）。库内同类需求均用安全写法规避：[table-utils.ts:959](../packages/core/src/utils/table-utils.ts) 用静态 `COL_SPAN_CLASSES` 映射、[grid.ts:63](../packages/core/src/utils/grid.ts) 用 CSS 变量、[markdown-editor-utils.ts:94](../packages/core/src/utils/markdown-editor-utils.ts) 用完整静态串。消费方若用 Tigercat Tailwind preset 构建，List grid 模式列数 class 很可能不被生成（列布局静默失效），除非业务侧恰好在别处用到或自行 safelist。
2. **逻辑撞车**：`xs` 被推成无前缀 `grid-cols-${xs}`，与无前缀的 `grid-cols-${column}` 同级；同时设 `column` 与 `xs` 时输出两个基础列 class，最终以生成 CSS 顺序决定胜者（与 className 顺序无关），结果不确定。

现有测试对 `getGridColumnClasses` **零覆盖**（仓库无任何引用该函数的 spec），故上述问题在 jsdom 测试中不暴露。

**公共内容决策**：网格能力已在 core——应让 List grid 复用 [grid.ts](../packages/core/src/utils/grid.ts) 的 CSS 变量列宽体系，或改用 `table-utils` 式静态映射；避免在 core 里新造第三套且不可扫描的实现。属公开 flat utility，重写需走 deprecated/baseline 流程。

**建议修复顺序**：

1. 先补 `tests/core` 对 `getGridColumnClasses` 的断言（含 xs+column 同设）。
2. 改实现为静态映射或 CSS 变量路径。
3. 双端 List grid 示例回归 + `pnpm example:build` 确认列生效。
4. 若改导出签名追加 `pnpm api:baseline:check`。

**目标验证命令**：`pnpm vitest run tests/react/List.spec.tsx tests/vue/List.spec.ts`、`pnpm example:build`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C04-3 Collapse/CollapsePanel 使用裸 gray/white Tailwind 而非 CSS token — **P2 主题一致性**

**文件**：[packages/core/src/utils/collapse-utils.ts:11](../packages/core/src/utils/collapse-utils.ts)（另见 :26 / :32 / :37 / :54 / :59 / :77）

`collapse-utils.ts` 大量使用裸色值：`bg-white`、`border-gray-200`、`hover:bg-gray-50`、`bg-gray-50`、`text-gray-700`、`text-gray-500`、`text-gray-900`。C04 其余六个组件（card / list / descriptions / skeleton / timeline-utils）全部用 `var(--tiger-surface/border/text/text-muted…)` token；唯独 Collapse 用固定灰白，切换主题/暗色时颜色不跟随。属 token 漂移（同 C02-3 与 C03 token 一致性主题）。

**公共内容决策**：在 `collapse-utils.ts` 把裸色替换为 `var(--tiger-*)` token（surface / border / surface-muted / text / text-muted），保留 core，双端零改动即生效。

**建议修复顺序**：

1. 替换 collapse-utils 颜色为 token。
2. Collapse 双端 vitest 回归（断言基于 `border` / `bg-transparent` 等结构类，不依赖具体灰度，预期不破）。
3. 视觉/暗色抽查。

**目标验证命令**：`pnpm vitest run tests/react/Collapse.spec.tsx tests/vue/Collapse.spec.ts`、`pnpm types:check`、`pnpm api:validate`。

---

#### C04-4 List 分页文案硬编码英文，未用既有 pagination locale — **P2 i18n 缺口**

**文件**：[packages/react/src/components/List.tsx:481](../packages/react/src/components/List.tsx)、[packages/vue/src/components/List.ts:528](../packages/vue/src/components/List.ts)（另见 Previous / Next / 页码 / 每页条数各处）

两端 List 自建内联分页，文案 `Showing {s} to {e} of {t} items`、`Previous`、`Next`、`Page {c} of {t}`、`{size} / page` 全硬编码英文（双端一致）。而 core 已有 [TigerLocalePagination](../packages/core/src/types/locale.ts)（`totalText`、`pageText`、`pageIndicatorText`、`itemsPerPageText`、`prevPageAriaLabel`/`nextPageAriaLabel` 等）；List 未消费该命名空间。List 的 emptyText 已本地化（`common.emptyText`），分页却没有，组件内自相矛盾。

**公共内容决策**：locale key 已在 core，无需新增；两端 List 分页文本改走 `resolveLocaleText` + `mergedLocale.pagination.*`（沿用现有 `{total}/{start}/{end}/{current}` 模板约定）。helper 留 core，渲染留框架层。

**建议修复顺序**：

1. 两端 List 分页文本接入 `pagination` locale。
2. 补 locale 覆盖测试。
3. `pnpm api:validate` 复核。

**目标验证命令**：`pnpm vitest run tests/react/List.spec.tsx tests/vue/List.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C04-5 Vue Collapse/CollapsePanel 缺 `inheritAttrs: false` 又手动并入 attrs.class，致重复 class — **P3 一致性**

**文件**：[packages/vue/src/components/Collapse.ts:133](../packages/vue/src/components/Collapse.ts)、[packages/vue/src/components/CollapsePanel.ts:102](../packages/vue/src/components/CollapsePanel.ts)

两者均**未**声明 `inheritAttrs: false`，却在 `containerClasses` / `panelClasses` 里手动 `coerceClassValue(attrs.class)`。默认 `inheritAttrs: true` 时 Vue 已把 `$attrs.class` 自动并到根元素；再手动并一次会让父级传入的 class 重复出现（浏览器虽去重，属冗余且语义混乱）。C04 其余 Vue 组件（Card/List/Descriptions/Skeleton/Timeline）统一 `inheritAttrs: false` + `...attrs` 展开后用显式 `class`/`style` 覆盖（正确范式）；Collapse 两件套是组内唯一例外。

**公共内容决策**：保留 Vue 框架层；改为与同组一致——加 `inheritAttrs: false` 并 `...attrs` 展开（或删手动 `coerceClassValue(attrs.class)` 单纯依赖继承），二选一消除重复。

**建议修复顺序**：P3，与 C04-3 同批改 Vue Collapse 文件时一并处理。

**目标验证命令**：`pnpm vitest run tests/vue/Collapse.spec.ts`、`pnpm types:check`。

---

#### C04-6 `VueListProps` 公共接口与运行时 props 漂移 — **P3 类型文档**

**文件**：[packages/vue/src/components/List.ts:622](../packages/vue/src/components/List.ts)

导出的 `VueListProps` 缺 `locale`、`virtual`、`virtualHeight`、`virtualItemHeight`、`virtualOverscan`、`draggable`，而组件 `props` 实有这些。`check-public-types.mjs` 只校验 `VueListProps` 是否存在、不校验完整性（与 A-5 同源盲区），故漂移不被门禁拦。

**公共内容决策**：补齐 `VueListProps` 字段使其与运行时 props 对齐（保持 Vue 层）。

**建议修复顺序**：P3，随任意 List 改动补齐。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C04-7 Vue Descriptions style 合并次序与同组相反 — **P3 一致性**

**文件**：[packages/vue/src/components/Descriptions.ts:331](../packages/vue/src/components/Descriptions.ts)

Descriptions 用 `mergeStyleValues(props.style, attrs.style)`（→ attrs.style 覆盖 props.style）；而 Card（[Card.ts:135](../packages/vue/src/components/Card.ts)）、List（[List.ts:595](../packages/vue/src/components/List.ts)）、Skeleton（[Skeleton.ts:106](../packages/vue/src/components/Skeleton.ts)）、Timeline（[Timeline.ts:120](../packages/vue/src/components/Timeline.ts)）均为 `mergeStyleValues(attrs*, props.style)`（→ props.style 覆盖 attrs）。Descriptions 是组内唯一反向，导致同名 style 冲突时优先级与其它组件不一致。

**公共内容决策**：统一为「props.style 覆盖 attrs.style」次序（与同组对齐），保留框架层。

**建议修复顺序**：P3 清理。

**目标验证命令**：`pnpm vitest run tests/vue/Descriptions.spec.ts`、`pnpm types:check`。

---

#### C04-8 重复 cell padding 标尺 + Timeline pending dot 裸 border-white — **P3 清理候选**

**文件**：[packages/core/src/utils/list-utils.ts:31](../packages/core/src/utils/list-utils.ts)、[packages/core/src/utils/descriptions-utils.ts:27](../packages/core/src/utils/descriptions-utils.ts)、[packages/core/src/utils/timeline-utils.ts:84](../packages/core/src/utils/timeline-utils.ts)

- **重复标尺**：`listItemSizeClasses` 与 `descriptionsCellSizeClasses` 取值完全相同（`sm:'px-3 py-2' / md:'px-4 py-3' / lg:'px-6 py-4'`）。属「该合未合」的重复常量，可抽公共 `cellPaddingClasses`；但二者均为公开 flat utility，合并需走 deprecated/baseline 流程，列为候选不强求。
- **裸色**：`getPendingDotClasses()`（:84）用 `border-white`，而同文件 `timelineDotBase`（:14）用 `border-[var(--tiger-surface,#ffffff)]`；建议 pending dot 同步改 token，保持时间轴点边框一致。

**公共内容决策**：标尺合并 → 任务 H 公共拆分批次统一评估；border-white → 直接改 token（core 内、无 API 变更）。

**建议修复顺序**：P3，延后到任务 H / 清理批次。

**目标验证命令**：`pnpm types:check`；若动公开 utility 追加 `pnpm api:baseline:check`、`pnpm docs:api:check`。

---

#### C04 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| 折叠过渡控制器 / Descriptions 行分组 / Skeleton 段落宽度 / Timeline 定位数学 | **已在 core，保持** | 纯逻辑双端复用，正确下沉 |
| React Timeline locale 接入（C04-1） | **保持框架分离，对齐 Vue** | core key 已具备，仅 React 端补 ConfigProvider 接入 |
| List grid 列 class（C04-2） | **改用 core 既有安全实现** | 复用 grid.ts CSS 变量或 table-utils 静态映射，弃可扫描失败的拼接 |
| Collapse token 化（C04-3） | **修 core util，保留 core** | 裸 gray/white → `var(--tiger-*)` |
| List 分页 locale（C04-4） | **接既有 pagination 命名空间** | 不新增 key，双端接 `resolveLocaleText` |
| Collapse attrs 透传（C04-5） | **保留框架层，对齐同组范式** | 加 `inheritAttrs:false` + `...attrs` |
| VueListProps 漂移（C04-6） | **补齐类型** | 与运行时 props 对齐 |
| Descriptions style 次序（C04-7） | **统一次序** | props.style 覆盖 attrs |
| 重复 cell padding / pending dot 裸色（C04-8） | **延后 / 直接改 token** | 重复常量合并走 deprecation；border-white 直接 token 化 |

---

#### 本轮验证命令实跑输出摘要（C04）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests/react/Card.spec.tsx tests/vue/Card.spec.ts tests/react/List.spec.tsx tests/vue/List.spec.ts tests/react/Descriptions.spec.tsx tests/vue/Descriptions.spec.ts tests/react/Skeleton.spec.tsx tests/vue/Skeleton.spec.ts tests/react/Collapse.spec.tsx tests/vue/Collapse.spec.ts tests/react/Timeline.spec.tsx tests/vue/Timeline.spec.ts` | ✅ 通过 | 12 个 test files、210 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |
| `pnpm ...` wrapper | ⚠️ 本机阻塞 | 无 TTY 下因 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 中止；已改用本地 bin / node 脚本完成验证 |

> 上表确认所有 C04 发现均为潜在问题（未触发现有门禁）；扫描未改动任何源码/脚本/生成产物，仅更新本文件与 ROADMAP.md 状态标记。

---

### C05 导航轻量组

**扫描范围**：Affix、Anchor、AnchorLink、BackTop、Breadcrumb、BreadcrumbItem、ScrollSpy、FloatButton、FloatButtonGroup 九个组件的 core 类型/工具模块、React/Vue 实现、测试文件与 generated references。

**结论速览**：Affix、Anchor/ScrollSpy 的滚动监听与 active 计算已大体沉到 core helper，Breadcrumb/BackTop/FloatButton 的样式常量也已共享。现有 C05 定向测试与 API/type 检查均通过。但本轮发现 **4 条运行时或 SSR 风险**（P2）和 **1 条 generated reference 信息缺口**（P3），主要集中在 Vue 响应式 provide/register、FloatButtonGroup 公开语义未实现、BackTop render 阶段访问 `window`。

---

#### C05-1 `FloatButtonGroup.shape` 公开语义未实现 — **P2 不对称/功能缺口**

**文件**：[packages/core/src/types/float-button.ts:62](../packages/core/src/types/float-button.ts)、[packages/react/src/components/FloatButton.tsx:82](../packages/react/src/components/FloatButton.tsx)、[packages/vue/src/components/FloatButton.ts:107](../packages/vue/src/components/FloatButton.ts)、[skills/tigercat/references/shared/props/navigation.md:120](../skills/tigercat/references/shared/props/navigation.md)

`FloatButtonGroupProps.shape` 的 core 注释和 generated props 都说明它会 “Shape applied to all child buttons”。但 React 版将该 prop 解构为 `shape: _shape = 'circle'` 后完全不使用；Vue 版声明并接收 `props.shape`，但只用 group class、trigger 与 open state，不向子 `FloatButton` 传递 shape。

现有测试只覆盖单个 `FloatButton shape="square"`，未覆盖 group shape 继承，因此门禁通过但公开语义没有落地。

**公共内容决策**：shape 继承语义应保留在框架层 context/provide；core 只保留类型和 class 常量，不引入运行时组件树逻辑。

**建议修复顺序**：

1. React `FloatButtonGroup` 增加 group context，`FloatButton` 在自身 `shape` 未显式传入时读取 group shape；Vue 使用 provide/inject 做同等行为。
2. 调整 `FloatButton` 框架层默认值：内部默认仍为 `'circle'`，但允许区分“未传 shape”与“显式传入 shape”，保证单个按钮 prop 优先于 group shape。
3. 补 React/Vue 测试：group `shape="square"` 时子按钮默认变方形，子按钮显式 `shape="circle"` 时不被覆盖。

**目标验证命令**：`pnpm vitest run tests/react/FloatButton.spec.tsx tests/vue/FloatButton.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-2 Vue `Breadcrumb` 父级 `separator` 更新后子项不响应 — **P2 Bug**

**文件**：[packages/vue/src/components/Breadcrumb.ts:256](../packages/vue/src/components/Breadcrumb.ts)、[packages/vue/src/components/Breadcrumb.ts:129](../packages/vue/src/components/Breadcrumb.ts)

Vue `Breadcrumb` 在 setup 中提供的是普通对象快照：

```ts
provide<BreadcrumbContext>(BreadcrumbContextKey, {
  separator: props.separator
})
```

`BreadcrumbItem` 的 computed 会读取 `breadcrumbContext.separator`，但这个 context 对象不是 reactive，父组件后续把 `separator` 从 `'/'` 切到 `'arrow'`、`'chevron'` 或自定义字符串时，未设置 item-level separator 的子项不会更新。React 版 context value 随 render 用 `useMemo({ separator })` 重新提供，行为正确。

**公共内容决策**：属 Vue provide 响应式问题，保留在 Vue 框架层；`getSeparatorContent` 等纯逻辑已在 core，位置正确。

**建议修复顺序**：

1. Vue `Breadcrumb` 改为 provide 一个 reactive context，并 watch `props.separator` 同步 `context.separator`。
2. 保持现有 `BreadcrumbContext` 形状不变，避免破坏外部深度导入类型。
3. 补 Vue rerender 测试：父级 separator 更新后，未覆盖 separator 的 `BreadcrumbItem` 分隔符跟随变化；item-level separator 仍优先。

**目标验证命令**：`pnpm vitest run tests/vue/Breadcrumb.spec.ts tests/core/breadcrumb-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-3 Vue `AnchorLink.href` 动态变化后注册表残留旧 href — **P2 Bug**

**文件**：[packages/vue/src/components/Anchor.ts:96](../packages/vue/src/components/Anchor.ts)、[packages/vue/src/components/Anchor.ts:100](../packages/vue/src/components/Anchor.ts)、[packages/react/src/components/Anchor.tsx:78](../packages/react/src/components/Anchor.tsx)

Vue `AnchorLink` 只在 mount 时 `registerLink(props.href)`，在 unmount 时 `unregisterLink(props.href)`。如果业务根据状态把某个 link 的 `href` 从 `#a` 更新为 `#b`，DOM 上的 `href` 与 `data-anchor-href` 会更新，但父级 `links` 注册表仍包含旧 href，IntersectionObserver 继续按旧目标列表工作。

React 版用 `useEffect` 依赖 `[href, register, unregister]`，href 变化时会清理旧 href 并注册新 href。

**公共内容决策**：注册生命周期是框架层逻辑，保留在 Vue 组件；anchor target 解析、滚动和 active 计算继续留在 core helper。

**建议修复顺序**：

1. Vue `AnchorLink` 增加 `watch(() => props.href, (next, prev) => { unregister(prev); register(next) })`，并保留 unmount 清理当前 href。
2. 避免重复注册：沿用父级 `registerLink` 的去重逻辑即可。
3. 补 Vue rerender 测试：href 更新后点击新链接触发新 href，旧 href 不再留在父级 observer 输入中。

**目标验证命令**：`pnpm vitest run tests/vue/Anchor.spec.ts tests/core/anchor-utils.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C05-4 `BackTop` render 阶段访问默认 `window`，存在 SSR 风险 — **P2 SSR**

**文件**：[packages/react/src/components/BackTop.tsx:44](../packages/react/src/components/BackTop.tsx)、[packages/react/src/components/BackTop.tsx:86](../packages/react/src/components/BackTop.tsx)、[packages/vue/src/components/BackTop.ts:64](../packages/vue/src/components/BackTop.ts)、[packages/vue/src/components/BackTop.ts:117](../packages/vue/src/components/BackTop.ts)

React `BackTop` 的默认 target 是：

```ts
const getDefaultTarget = () => window
```

组件 render 期间的 `buttonClasses` `useMemo` 会调用 `target()` 判断 fixed/sticky 类。SSR 环境没有 `window`，因此默认 `<BackTop />` 在服务端 render 时可能直接抛错。Vue 版同样将 prop 默认值写成 `default: () => window`，且 `buttonClasses` computed 在未 mounted 时会走 `props.target()`。

滚动监听本身已放在 mounted/effect 阶段，问题集中在 render/computed 阶段为了选择 position class 而提前解析 target。

**公共内容决策**：SSR guard 属框架层渲染策略；`createBackTopVisibilityController`、`scrollToTop`、class 常量继续保留在 core。

**建议修复顺序**：

1. React/Vue 默认 target 改为 SSR-safe getter：仅浏览器环境返回 `window`，否则返回 `null` 或延迟到 mounted/effect。
2. render 阶段不要调用用户传入 target；未 mounted/未解析 target 时默认使用 window/fixed classes，mounted 后根据实际 target 切换 fixed/sticky。
3. 补 React/Vue SSR smoke 测试：服务端 render 默认 `<BackTop />` 不抛错；客户端现有 scroll 行为保持。

**目标验证命令**：`pnpm vitest run tests/react/BackTop.spec.tsx tests/vue/BackTop.spec.ts tests/core/back-top-utils.spec.ts tests/core/ssr-frameworks.spec.ts`、`pnpm quality:ssr`、`pnpm api:validate`。

---

#### C05-5 `ScrollSpyProps` 缺少源码注释，generated props 信息不足 — **P3 文档**

**文件**：[packages/core/src/types/scroll-spy.ts:20](../packages/core/src/types/scroll-spy.ts)、[skills/tigercat/references/shared/props/navigation.md:128](../skills/tigercat/references/shared/props/navigation.md)

`ScrollSpyProps` 的 core 类型字段没有注释，导致 generated props 文档中 `items`、`activeKey`、`defaultActiveKey` 等字段 Notes 全部为 `-`。这不是运行时问题，但与同组 Anchor、BackTop、Breadcrumb 的 props 文档质量不一致，也降低了 skill reference 的可用性。

**公共内容决策**：修复源头应在 `packages/core/src/types/scroll-spy.ts` 的字段注释；`skills/tigercat/references/*` 是生成物，不手改。

**建议修复顺序**：

1. 为 `ScrollSpyItem`、`ScrollSpyChangePayload`、`ScrollSpyProps` 增加简短 JSDoc，尤其说明受控/非受控 activeKey、offsetTop/targetOffset、sticky 与 ariaLabel。
2. 运行 `pnpm docs:api` 生成 references，再检查 `navigation.md` 的 ScrollSpy props Notes 不再为空。
3. 保持字段名称和 public type 不变，不触发 API 破坏。

**目标验证命令**：`pnpm docs:api`、`pnpm docs:api:check`、`pnpm api:validate`。

---

#### C05 整体公共拆合决策汇总（供任务 H 汇总）

| 项 | 决策 | 说明 |
| --- | --- | --- |
| Affix 位置计算与 observer helper | **已在 core，保持** | React/Vue 均消费 `calculateAffixState`、`resolveAffixTarget`、`createAffixObserver` |
| Anchor / ScrollSpy target、active、scroll helper | **已在 core，保持** | `ScrollSpy` 复用 anchor observer/scroll helper，公共边界合理 |
| Breadcrumb separator 与折叠计算 | **已在 core，保持** | Vue 响应式 provide 问题不需要移动 core 逻辑 |
| BackTop visibility controller 与 scroll helper | **已在 core，保持** | SSR guard 只涉及框架 render/mount 时机 |
| FloatButtonGroup shape 继承（C05-1） | **保留框架层 context/provide** | 需要组件树注入和 prop 优先级判断，不适合沉入 core |
| Vue Breadcrumb context（C05-2） | **保留 Vue 层修复** | 改 reactive provide，不改公共类型形状 |
| Vue AnchorLink 注册生命周期（C05-3） | **保留 Vue 层修复** | href watch 属框架生命周期，不改 core |
| ScrollSpy generated props 注释（C05-5） | **修 core 类型注释并重生 docs** | 不手改 generated references |

---

#### 本轮验证命令实跑输出摘要（C05）

| 命令 | 结果 | 备注 |
| --- | --- | --- |
| `.\node_modules\.bin\vitest.cmd run tests\core\anchor-utils.spec.ts tests\core\back-top-utils.spec.ts tests\core\breadcrumb-utils.spec.ts tests\core\float-button-utils.spec.ts tests\react\Anchor.spec.tsx tests\react\Affix.spec.tsx tests\react\Breadcrumb.spec.tsx tests\react\BackTop.spec.tsx tests\react\FloatButton.spec.tsx tests\react\ScrollSpy.spec.tsx tests\vue\Anchor.spec.ts tests\vue\Affix.spec.ts tests\vue\Breadcrumb.spec.ts tests\vue\BackTop.spec.ts tests\vue\FloatButton.spec.ts tests\vue\ScrollSpy.spec.ts` | ✅ 通过 | 16 个 test files、298 个 tests 通过 |
| `node .\scripts\validate-api.mjs` | ✅ 通过 | API 一致性检查通过，没有发现问题 |
| `node .\scripts\check-public-types.mjs` | ✅ 通过 | `All public component props types are exported.` |

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

---

### C08 Overlay 触发器

**扫描范围**：Dropdown / DropdownMenu / DropdownItem / Popover / Popconfirm / Tooltip 全链路——core 类型 [floating-popup.ts](../packages/core/src/types/floating-popup.ts)、[dropdown.ts](../packages/core/src/types/dropdown.ts)、[popover.ts](../packages/core/src/types/popover.ts)、[popconfirm.ts](../packages/core/src/types/popconfirm.ts)、[tooltip.ts](../packages/core/src/types/tooltip.ts)，core 工具 [floating.ts](../packages/core/src/utils/floating.ts)、[floating-popup-utils.ts](../packages/core/src/utils/floating-popup-utils.ts)、[overlay-utils.ts](../packages/core/src/utils/overlay-utils.ts)、[focus-utils.ts](../packages/core/src/utils/focus-utils.ts)、[dropdown-utils.ts](../packages/core/src/utils/dropdown-utils.ts)、[popover-utils.ts](../packages/core/src/utils/popover-utils.ts)、[popconfirm-utils.ts](../packages/core/src/utils/popconfirm-utils.ts)、[tooltip-utils.ts](../packages/core/src/utils/tooltip-utils.ts)，React/Vue 对应组件实现、React `usePopup` / Vue `useFloatingPopup` 与 overlay 封装、4 个 popup 双端 spec、core floating/focus/overlay spec、generated references。

**结论速览**：C08 浮层基础面健康——定位（`floating.ts`）、外点/composedPath（`overlay-utils.ts`）、焦点（`focus-utils.ts`）、触发器映射（`buildTriggerHandlerMap`）、aria id 工厂已沉 core；Tooltip / Popover / Popconfirm 双端共享 `usePopup` / `useFloatingPopup`，对称良好；references 准确，4 个 popup 双端 spec + core floating/focus/overlay spec 齐全。**无 P1**。发现集中在 P3：1 条 latent 双端 bug、2 条该合未合类型、1 条 Dropdown 绕开共享 hook、3 条 parity/一致性清理。

---

#### C08-1 Vue Dropdown context 静态快照（双端 parity / latent bug）— **P3**

**发现问题**

- 🟢 P3｜Vue `provide(DropdownContextKey, { closeOnClick: props.closeOnClick, handleItemClick })`（[Dropdown.ts:381](../packages/vue/src/components/Dropdown.ts)）注入的是 setup 时静态快照；`DropdownItem` 读 `context?.closeOnClick`（[DropdownItem.ts:65](../packages/vue/src/components/DropdownItem.ts)）也会拿到定格值。React `useMemo(() => ({ closeOnClick, handleItemClick }), [closeOnClick, handleItemClick])`（[Dropdown.tsx:257](../packages/react/src/components/Dropdown.tsx)）会随 prop 重算。
- 🟢 P3｜影响窄但真实：`handleItemClick` 自身读活 `props.closeOnClick`（[Dropdown.ts:273](../packages/vue/src/components/Dropdown.ts)），所以 `true → false` 动态切换仍正确；但 `false → true` 时 item 侧 `if (context?.closeOnClick)` 仍为旧 false，导致不调用关闭逻辑。测试只覆盖静态 `closeOnClick={false}`，未覆盖动态切换。

**公共内容决策**：Vue 框架层修（provide reactive/computed 或 item 直读 reactive），不沉 core。与 C02-1 属同类 provide 快照反模式，但影响面更窄。

**建议修复顺序**：P3，可与 C02-1 同批处理。

**目标验证命令**：`pnpm vitest run tests/vue/Dropdown.spec.ts tests/react/Dropdown.spec.tsx`、`pnpm types:check`。

---

#### C08-2 共享 `BaseFloatingPopupProps` 声明并导出却无人继承（该合未合）— **P3**

**发现问题**

- 🟢 P3｜[floating-popup.ts:16](../packages/core/src/types/floating-popup.ts) 定义并导出 `BaseFloatingPopupProps`（`open` / `defaultOpen` / `placement` / `disabled` / `offset` / `className`），注释自述为 Tooltip / Popover / Popconfirm 共享基类。
- 🟢 P3｜但 `TooltipProps`（[tooltip.ts:15](../packages/core/src/types/tooltip.ts)）、`PopoverProps`（[popover.ts:15](../packages/core/src/types/popover.ts)）、`PopconfirmProps`（[popconfirm.ts:15](../packages/core/src/types/popconfirm.ts)）各自重复这些字段，无一继承该基类；grep 也只看到声明/文档引用，没有真实类型复用。

**公共内容决策**：合并候选。三 Props 可改为 `extends BaseFloatingPopupProps`（结构等价、非破坏）；但 Popconfirm 当前无 `offset` / `trigger`，需要 `Omit` 或拆更细基类。若决定弃用该导出，也应走 deprecated/migration，不直接删除已公开符号。

**建议修复顺序**：P3，和 C08-3 同批。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`、`pnpm api:baseline:check`。

---

#### C08-3 `PopoverTrigger` / `TooltipTrigger` 重复 `FloatingTrigger`（该合未合）— **P3**

**发现问题**

- 🟢 P3｜`FloatingTrigger = 'click' | 'hover' | 'focus' | 'manual'`（[floating-popup.ts:10](../packages/core/src/types/floating-popup.ts)）已被 `buildTriggerHandlerMap`、React `usePopup`、Vue `useFloatingPopup` 共同消费。
- 🟢 P3｜`PopoverTrigger`（[popover.ts:10](../packages/core/src/types/popover.ts)）成员完全相同；`TooltipTrigger`（[tooltip.ts:10](../packages/core/src/types/tooltip.ts)）成员也相同，仅顺序不同。与 C01-6（TagVariant 等价 BadgeVariant）同型。

**公共内容决策**：合并候选。令 `PopoverTrigger` / `TooltipTrigger` 变成 `FloatingTrigger` 别名，成员不变、非破坏；`DropdownTrigger = 'click' | 'hover'` 是真子集，应保留独立。

**建议修复顺序**：P3，与 C08-2 同批。

**目标验证命令**：`pnpm types:check`、`pnpm api:validate`。

---

#### C08-4 Dropdown 绕开共享 popup hook，双端各自重写编排（该合未合 / 结构观察）— **P3**

**发现问题**

- 🟢 P3｜Tooltip / Popover / Popconfirm 双端走共享 hook：React `usePopup`、Vue `useFloatingPopup` 统一处理受控可见性、floating、外点、Esc、触发器映射。
- 🟢 P3｜Dropdown 双端没有使用这层 hook，而是在组件内重写可见性、hover 100/150ms 延时、`useFloating` / `useClickOutside` / `useEscapeKey`、焦点 capture/restore 与菜单键盘导航（React [Dropdown.tsx:161](../packages/react/src/components/Dropdown.tsx)，Vue [Dropdown.ts:246](../packages/vue/src/components/Dropdown.ts)）。双端实现彼此对称，不是 parity 缺陷，但与共享 hook 存在一层编排重复。

**公共内容决策**：可选重构。Dropdown 可基于共享 hook 叠加 hover 延时/菜单焦点，也可保留独立并注释说明边界。考虑 Dropdown 的菜单语义和焦点需求更强，本轮只记录，不直接重构。

**建议修复顺序**：P3/可选，延后。

**目标验证命令**：`pnpm vitest run tests/react/Dropdown.spec.tsx tests/vue/Dropdown.spec.ts`。

---

#### C08-5 React Dropdown 外点监听缺 `defer`，与 Vue/usePopup 不一致（双端 parity）— **P3**

**发现问题**

- 🟢 P3｜React `usePopup` 的 click-outside 传 `defer: true`（[use-popup.ts:135](../packages/react/src/utils/use-popup.ts)），Vue `useFloatingPopup` 同样传 `defer: true`（[use-floating-popup.ts:158](../packages/vue/src/utils/use-floating-popup.ts)）；Vue Dropdown 的 click-outside 也传 `defer: true`（[Dropdown.ts:324](../packages/vue/src/components/Dropdown.ts)）。
- 🟢 P3｜React Dropdown 直接调用 `useClickOutside` 时未传 `defer`（[Dropdown.tsx:208](../packages/react/src/components/Dropdown.tsx)）。当前多半良性：触发器在 `containerRef` 内，开启那次 click 对 `isEventOutside` 返回 false；但它仍偏离了本组已形成的“开启后延迟挂外点监听”约定。

**公共内容决策**：React 框架层对齐，给 React Dropdown 补 `defer: true`。不涉及 core API。

**建议修复顺序**：P3，小修。

**目标验证命令**：`pnpm vitest run tests/react/Dropdown.spec.tsx`。

---

#### C08-6 hover 触发的 Popover 内容不可悬停进入（latent UX / parity 观察）— **P3**

**发现问题**

- 🟢 P3｜Dropdown 菜单 wrapper 双端都挂了 `onMouseEnter` / `onMouseLeave`（React [Dropdown.tsx:305](../packages/react/src/components/Dropdown.tsx)，Vue [Dropdown.ts:463](../packages/vue/src/components/Dropdown.ts)）以便指针移入菜单后保持打开。
- 🟢 P3｜Tooltip / Popover 浮层内容没有类似 mouse enter/leave 保持逻辑；`trigger="hover"` 的 Popover 若内容可交互，指针从触发器移向浮层时会触发隐藏，导致内容难以进入。Tooltip 非交互内容可接受；Popover 默认 `trigger='click'`，影响有限。

**公共内容决策**：若明确支持 hover 交互 Popover，需要浮层补 hover 保持/safe-bridge；若不支持，应在文档说明 hover Popover 仅适合非交互内容。双端共享 hook 可以承接该策略，但本轮只记录。

**建议修复顺序**：P3/观察。

**目标验证命令**：`pnpm vitest run tests/react/Popover.spec.tsx tests/vue/Popover.spec.ts`（建议补 hover-into-content 用例）。

---

#### C08-7 浮层 style 合并 / 挂载策略次要不一致（清理）— **P3**

**发现问题**

- 🟢 P3｜style 合并：Dropdown / Popconfirm 双端会用 `mergeStyleValues` 合并外部 style；Tooltip / Popover 仅透传 `style: props.style`（Vue [Tooltip.ts:86](../packages/vue/src/components/Tooltip.ts)、[Popover.ts:100](../packages/vue/src/components/Popover.ts)，React 侧同型）。由于 style 是声明 prop，attrs.style 通常为空，当前没有明确 bug，只是组内写法不齐。
- 🟢 P3｜挂载策略：Tooltip / Popover 双端 mount-on-open；Popconfirm 双端 always-mounted + `hidden` 切换。各自双端对称，组内不同。当前没有行为缺陷，但后续若统一动画、SEO、可访问性或性能策略，需要一起取舍。

**公共内容决策**：低优先统一，无公共 API 影响。style 合并可框架层顺手对齐；挂载策略需结合动画/focus/portal 行为再决定。

**建议修复顺序**：P3，随相关组件下次改动处理。

**目标验证命令**：`pnpm vitest run tests/react/{Tooltip,Popover,Popconfirm}.spec.tsx tests/vue/{Tooltip,Popover,Popconfirm}.spec.ts`。

---

#### C08 健康项与 C07 延后项承接

- ✅ 核心逻辑已下沉 core：floating 定位、overlay composedPath 外点判断、焦点捕获/恢复、触发器事件映射、aria id 工厂均可复用。
- ✅ React `usePopup` 与 Vue `useFloatingPopup` 对称，Tooltip / Popover / Popconfirm 行为基线稳定。
- ✅ references 对本组的 portal、`data-state`、trigger 作用域插槽与 feedback props 描述未见漂移。
- ✅ 目标测试齐全：4 个 popup 双端 spec + core floating/focus/overlay spec 通过。
- ℹ️ 承接 C07-2：`focus-utils` 的 `handleMenuNavigation` / `focusFirstMenuItem` / `getMenuItems` 消费者经 grep 确认仅 Dropdown（React/Vue），Menu 使用自有 `menu-utils`。C08 确认边界：两套键盘导航是否合并留待任务 H（跨 C07+C08）。

---

#### C08 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Vue Dropdown context 静态快照（C08-1） | Vue 框架层 reactive 修复，不沉 core | P3 |
| `BaseFloatingPopupProps` 未被继承（C08-2） | 合并候选；或弃用需走 deprecated/migration | P3 |
| `PopoverTrigger` / `TooltipTrigger` 重复 `FloatingTrigger`（C08-3） | 改为 `FloatingTrigger` 别名；DropdownTrigger 保留独立 | P3 |
| Dropdown 绕开共享 hook（C08-4） | 可选重构或注释边界，延后 | P3 |
| React Dropdown click-outside 缺 `defer`（C08-5） | React 框架层补齐 `defer: true` | P3 |
| hover Popover 内容不可悬停进入（C08-6） | 补 hover 保持或文档限制，先观察 | P3 |
| style 合并 / 挂载策略差异（C08-7） | 低优先统一，无 API 影响 | P3 |
| C07/C08 两套菜单键盘导航 | 保持记录，交给任务 H 统一分类 | **P2** |

---

#### C08 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Vue Dropdown provide + DropdownItem inject | provide 写入 `props.closeOnClick` 快照；item 先判断 `context?.closeOnClick` 再调用 handler | C08-1 |
| React Dropdown contextValue | `useMemo` 依赖 `closeOnClick` / `handleItemClick`，prop 改变时会更新 | C08-1 |
| Grep `BaseFloatingPopupProps` | core 类型声明和 references 文档引用存在；Tooltip/Popover/Popconfirm Props 未继承 | C08-2 |
| 比对 trigger 类型 | `FloatingTrigger`、`PopoverTrigger`、`TooltipTrigger` 成员等价；DropdownTrigger 为子集 | C08-3 |
| 比对 popup hook 消费 | Tooltip/Popover/Popconfirm 使用共享 hook；Dropdown 双端内联编排 | C08-4 |
| 比对 click-outside defer | React/Vue popup hook 与 Vue Dropdown 有 `defer: true`；React Dropdown 缺失 | C08-5 |
| 比对 hover 内容保持 | Dropdown 浮层容器有 mouse enter/leave；Tooltip/Popover 内容容器无 | C08-6 |
| 比对 style / mount 策略 | Dropdown/Popconfirm 合并 style；Tooltip/Popover 仅用 props.style；Popconfirm always-mounted，Tooltip/Popover mount-on-open | C08-7 |
| Grep `handleMenuNavigation` / `getMenuItems` / `focusFirstMenuItem` 消费者（src） | 仅 Dropdown（React/Vue）使用 focus-utils；Menu 使用 menu-utils | C07-2 / C08 承接 |
| `corepack pnpm vitest run tests/react/Dropdown.spec.tsx tests/react/Popover.spec.tsx tests/react/Popconfirm.spec.tsx tests/react/Tooltip.spec.tsx tests/vue/Dropdown.spec.ts tests/vue/Popover.spec.ts tests/vue/Popconfirm.spec.ts tests/vue/Tooltip.spec.ts tests/core/floating.spec.ts tests/core/focus-utils.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts` | ✅ 12 个测试文件、225 个测试通过 | C08 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C08 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C08 基线 |

> 本轮 C08 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C08 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

### C09 Feedback 容器

**扫描范围**：Modal / Drawer / Loading / Progress / Tour 五个组件的 core 类型 [modal.ts](../packages/core/src/types/modal.ts)、[drawer.ts](../packages/core/src/types/drawer.ts)、[loading.ts](../packages/core/src/types/loading.ts)、[progress.ts](../packages/core/src/types/progress.ts)、[tour.ts](../packages/core/src/types/tour.ts)，core 工具 [modal-utils.ts](../packages/core/src/utils/modal-utils.ts)、[drawer-utils.ts](../packages/core/src/utils/drawer-utils.ts)、[loading-utils.ts](../packages/core/src/utils/loading-utils.ts)、[progress-utils.ts](../packages/core/src/utils/progress-utils.ts)、[tour-utils.ts](../packages/core/src/utils/tour-utils.ts)、[overlay-utils.ts](../packages/core/src/utils/overlay-utils.ts)、[focus-utils.ts](../packages/core/src/utils/focus-utils.ts)，React/Vue 对应组件实现、双端 overlay helper、feedback generated references 与相关 spec。

**结论速览**：Modal / Drawer / Loading / Progress 的基础面健康：scroll lock、focus trap、focus restore、mask click 判定、Loading 动画注入、Progress clamp/format/circle 计算均有 core helper 或双端镜像实现；C09 目标 vitest 13 文件 243 测试通过，`api:validate` / `types:check` 均通过。**无 P1**。发现主要集中在 3 条 P2：React Modal open callback 语义偏 observer、React Loading 缺少组件级 locale prop、Tour 宣称 `aria-modal` 但没有复用 overlay lifecycle；其余为遮罩语义、Tour i18n、Progress a11y 结构等 P3 清理项。

---

#### C09-1 React Modal 把 `onOpenChange` / `onClose` 当作 prop observer 调用 — **P2**

**发现问题**

- 🟠 P2｜React Modal 在 effect 中对每次 `open` prop 变化调用 `onOpenChange?.(open)`，并在 `open=false` 时调用 `onClose?.()`（[Modal.tsx:166](../packages/react/src/components/Modal.tsx)）。这意味着 `<Modal open={false} onClose={...} />` 初次挂载后也会触发 `onClose`，`open={true}` 初次挂载会触发 `onOpenChange(true)`。
- 🟠 P2｜Vue Modal 没有 immediate observer：只在关闭动作里 `emit('update:open', false)` / `emit('cancel')`，并在 `open` 从 true 变 false 的 watcher 中 `emit('close')`（[Modal.ts:292](../packages/vue/src/components/Modal.ts)、[Modal.ts:357](../packages/vue/src/components/Modal.ts)）。因此双端 callback 语义不一致。
- 🟠 P2｜现有 React 测试明确锁住了该 observer 行为（[tests/react/Modal.spec.tsx:304](../tests/react/Modal.spec.tsx)），但这和 Drawer / Tour / 大多数受控组件的 `onOpenChange` 语义不同：回调通常代表用户请求变更，而不是父级 prop 已变化。

**公共内容决策**：属于 React 框架层 open API 语义修正，不沉 core。若保留 observer 行为，需要在文档中明确；若改为 action-only，应按兼容变更处理并同步测试。

**建议修复顺序**：P2。先决定是否要 breaking-compatible 迁移：推荐让 `onOpenChange` 只在内部关闭/确认动作时触发，`onClose` 只在从 open 到 closed 的有效过渡或内部 close action 后触发；补“初始 closed 不触发 onClose”的回归测试。

**目标验证命令**：`pnpm vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C09-2 Modal `mask=false` 仍保留外层点击关闭区域 — **P3**

**发现问题**

- 🟢 P3｜React Modal 的 mask 节点只负责视觉遮罩；真正的关闭点击挂在 content container（[Modal.tsx:351](../packages/react/src/components/Modal.tsx)、[Modal.tsx:360](../packages/react/src/components/Modal.tsx)）。Vue Modal 同型，mask 节点没有 click handler，container 有 `onClick: handleMaskClick`（[Modal.ts:530](../packages/vue/src/components/Modal.ts)、[Modal.ts:540](../packages/vue/src/components/Modal.ts)）。
- 🟢 P3｜因此 `mask={false}` 时视觉遮罩消失，但固定定位 wrapper/container 仍覆盖视口；点击内容外空白区域仍会因为 `event.target === event.currentTarget` 触发关闭。Drawer 不同：Drawer 的关闭点击只挂在 mask 节点上，`mask=false` 后没有外层关闭点击（[Drawer.tsx:290](../packages/react/src/components/Drawer.tsx)、[Drawer.ts:498](../packages/vue/src/components/Drawer.ts)）。
- 🟢 P3｜现有测试只覆盖 “mask 节点不渲染”，没有覆盖 `mask=false` 时外部点击是否应关闭。

**公共内容决策**：属于 Modal/Drawer 行为语义统一问题，关闭判定 helper `shouldCloseOnMaskClick` 已在 core，无需新增 core 逻辑。若希望 `mask=false` 后仍可点空白关闭，应文档写明；若语义是“没有 mask 就没有 mask click”，则 Modal 框架层把 container click guard 改成 `mask && shouldCloseOnMaskClick(...)`。

**建议修复顺序**：P3。先补双端测试固定预期，再改 Modal 或文档；同时确认 `maskClosable=false` 与 `mask=false` 的组合语义。

**目标验证命令**：`pnpm vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts`。

---

#### C09-3 React Loading 缺少组件级 `locale` prop，与 Vue 不对称 — **P2**

**发现问题**

- 🟠 P2｜Vue Loading 扩展了 `locale?: Partial<TigerLocale>`，并用 `mergeTigerLocale(config.value.locale, props.locale)` 解析无文本时的 aria-label（[Loading.ts:29](../packages/vue/src/components/Loading.ts)、[Loading.ts:93](../packages/vue/src/components/Loading.ts)、[Loading.ts:241](../packages/vue/src/components/Loading.ts)）。
- 🟠 P2｜React Loading 只读取 ConfigProvider locale（[Loading.tsx:38](../packages/react/src/components/Loading.tsx)、[Loading.tsx:146](../packages/react/src/components/Loading.tsx)），React `LoadingProps` 继承 core `LoadingProps`，core 类型没有 `locale` 字段（[loading.ts](../packages/core/src/types/loading.ts)）。单个 Loading 实例无法像 Vue 一样用组件级 locale 覆盖无文本 aria-label，只能传 `text` 或包一层 ConfigProvider。
- 🟠 P2｜这与 Modal / Drawer 的双端 locale+labels API 方向不一致，也不会被现有 Loading 测试覆盖：测试只断言默认 aria-label 与 `text` 覆盖。

**公共内容决策**：locale 语义应合到 core `LoadingProps` 或至少双端 wrapper props 对齐。渲染仍留框架层，`resolveLocaleText`/`mergeTigerLocale` 已在 core 可复用。

**建议修复顺序**：P2。给 core `LoadingProps` 补 `locale?: Partial<TigerLocale>`（或 React wrapper 补同名 prop并与 Vue 对齐），React Loading 合并 ConfigProvider + props locale；补双端“组件级 locale 覆盖 aria-label”的测试。若变更 core type，刷新 API baseline。

**目标验证命令**：`pnpm vitest run tests/react/Loading.spec.tsx tests/vue/Loading.spec.ts`、`pnpm api:validate`、`pnpm types:check`、涉及 public type baseline 时追加 `pnpm api:baseline:check`。

---

#### C09-4 Tour 使用 `aria-modal` 但未接入 overlay lifecycle — **P2**

**发现问题**

- 🟠 P2｜React/Vue Tour popover 都设置 `role="dialog"` 和 `aria-modal="true"`（[Tour.tsx:180](../packages/react/src/components/Tour.tsx)、[Tour.ts:310](../packages/vue/src/components/Tour.ts)），但没有像 Modal / Drawer 那样接入 Escape 关闭、focus trap、打开后聚焦、关闭后恢复焦点、body scroll lock。
- 🟠 P2｜React Tour 直接 `ReactDOM.createPortal(content, document.body)`（[Tour.tsx:226](../packages/react/src/components/Tour.tsx)），Vue Tour 直接 `h(Teleport, { to: 'body' }, children)`（[Tour.ts:323](../packages/vue/src/components/Tour.ts)），没有复用 React/Vue overlay helper，也没有使用 core `captureActiveElement` / `restoreFocus` / `lockBodyScroll`。
- 🟠 P2｜现有 Tour 双端测试覆盖渲染、导航、mask click、portal 与基础 a11y，但没有覆盖 Escape、Tab 环绕、焦点恢复、scroll lock。

**公共内容决策**：overlay lifecycle 的纯逻辑已在 core 与双端 overlay helper 中，Tour 应复用现有 helper；Tour 定位/step 逻辑继续留在 `tour-utils.ts` 与框架组件内。

**建议修复顺序**：P2。先补双端测试：打开后聚焦 close/primary button、Escape 关闭、Tab 环绕、关闭后恢复触发元素、可选 scroll lock。实现时 React 用 `renderBodyPortal` / `useEscapeKey` / `useFocusTrap` / `useBodyScrollLock`；Vue 用 `renderVueBodyTeleport` / `useVueEscapeKey` / `useVueFocusTrap` / `useVueBodyScrollLock`。若产品语义不希望 Tour 锁滚动或 trap focus，应移除 `aria-modal` 或降为非 modal dialog 语义。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts`。

---

#### C09-5 Tour target spotlight mask 不拦截背景交互，且不能点击关闭 — **P3**

**发现问题**

- 🟢 P3｜无 target 的 Tour mask 是全屏固定 div，点击会关闭（React [Tour.tsx:175](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:230](../packages/vue/src/components/Tour.ts)）。有 target 时则渲染 `getTourSpotlightStyle(targetRect)` 的单个 overlay；该 helper 明确设置 `pointerEvents: 'none'`（[tour-utils.ts](../packages/core/src/utils/tour-utils.ts)），所以背景点击会穿透到页面，且不会关闭 Tour。
- 🟢 P3｜这和 `aria-modal="true"` 的体验不匹配，也和无 target mask 的点击关闭不一致。现有测试只验证 spotlight overlay 存在，没有验证背景点击是否被阻止或关闭。

**公共内容决策**：spotlight 几何/样式 helper 保留 core；是否阻止背景交互是 Tour 组件行为策略。若要可点击关闭，需要额外 overlay layer 或把 spotlight mask 改为 pointer-aware 结构；不能只改 `pointerEvents`，否则 target hole 也会被挡住。

**建议修复顺序**：P3，与 C09-4 一起决策。推荐先定义 `maskClosable` / spotlight 背景交互语义，再补测试。若保留穿透能力，应取消 `aria-modal` 并在文档说明 target step 不阻塞页面。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/tour-utils.spec.ts`。

---

#### C09-6 Tour 复用 `formWizard` locale 且 close label 硬编码 — **P3**

**发现问题**

- 🟢 P3｜Tour 的 Next / Previous / Finish 文案使用 `mergedLocale.formWizard`（React [Tour.tsx:61](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:84](../packages/vue/src/components/Tour.ts)），而组件本身不是 FormWizard。`TigerLocale` 也没有 `tour` 命名空间（[locale.ts:170](../packages/core/src/types/locale.ts)）。
- 🟢 P3｜close button aria-label 两端均硬编码 `"Close tour"`（React [Tour.tsx:190](../packages/react/src/components/Tour.tsx)、Vue [Tour.ts:251](../packages/vue/src/components/Tour.ts)），没有使用 `common.closeText` 或组件级 locale。用户只能覆盖 next/prev/finish，不能本地化 close label。

**公共内容决策**：新增 `TigerLocaleTour` 更清晰；短期也可兼容读取 `tour.*` 后回落到 `formWizard.*`，避免破坏已有使用。close label 可先回落 `common.closeText`。

**建议修复顺序**：P3。补 core locale 类型与 locale preset 字段、React/Vue Tour 文案解析和测试；generated references 由 `docs:api` 生成，不手改。

**目标验证命令**：`pnpm vitest run tests/react/Tour.spec.tsx tests/vue/Tour.spec.ts tests/core/i18n-locales.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C09-7 Progress 语义 attrs 分布不一致，role 落在内部图形节点 — **P3**

**发现问题**

- 🟢 P3｜Progress 的 `role="progressbar"` 与 aria value 属性挂在内部 fill/circle 节点；外层 wrapper 负责接收 `className` / `style` / 宽高（React [Progress.tsx:72](../packages/react/src/components/Progress.tsx)、[Progress.tsx:84](../packages/react/src/components/Progress.tsx)、[Progress.tsx:120](../packages/react/src/components/Progress.tsx)，Vue [Progress.ts:84](../packages/vue/src/components/Progress.ts)、[Progress.ts:111](../packages/vue/src/components/Progress.ts)、[Progress.ts:144](../packages/vue/src/components/Progress.ts)）。
- 🟢 P3｜React 会从 rest props 中摘出 `aria-label` / `aria-labelledby` / `aria-describedby` 后只放到内部 progressbar；Vue 则先 `...attrs` 到外层，再把相同 aria 字段放到内部 progressbar（[Progress.ts:87](../packages/vue/src/components/Progress.ts)、[Progress.ts:68](../packages/vue/src/components/Progress.ts)）。双端测试目前按内部 progressbar 断言，未覆盖 attrs 是否重复或 `id` / `aria-describedby` 指向外层时的使用体验。

**公共内容决策**：Progress 计算 helper（clamp、format、circle path、status variant）已正确沉 core；语义结构属于框架渲染层。建议统一为“外层根节点就是 progressbar，内部 fill/circle 只负责视觉”，或明确保持内部 progressbar 并确保 attrs 不重复。

**建议修复顺序**：P3。先补 a11y 结构测试，决定 role 所在节点；若迁移到外层 role，注意现有用户依赖 `querySelector('[role="progressbar"]')` 后取父节点的测试/用法可能变化，但公共 API 不变。

**目标验证命令**：`pnpm vitest run tests/react/Progress.spec.tsx tests/vue/Progress.spec.ts`、`pnpm types:check`。

---

#### C09 健康项

- ✅ Modal / Drawer 的视觉样式、尺寸、关闭按钮图标、触摸关闭方向、focus trap、focus restore 与 scroll lock 大体已对齐；纯判定和样式 helper 已在 core。
- ✅ Loading 的 SVG/点/柱动画配置、文本 class、animation style 注入已在 core，双端实现薄且测试覆盖 delay/fullscreen/lockScroll。
- ✅ Progress 的百分比 clamp、文本 format、circle path、status variant 已在 core，双端测试镜像完整。
- ✅ Drawer `destroyOnCloseAfterLeave` 双端已覆盖，动画后销毁路径稳定。
- ✅ Feedback references 当前能列出 C09 组件，未发现 C09 组件索引漏列。

---

#### C09 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| React Modal open callback observer（C09-1） | React open API 语义修正；不沉 core | **P2** |
| Modal `mask=false` 仍可外部点击关闭（C09-2） | 行为语义先定，框架层对齐或文档说明 | P3 |
| Loading 组件级 locale parity（C09-3） | 合入 core `LoadingProps` 或 React wrapper 对齐 Vue | **P2** |
| Tour overlay lifecycle（C09-4） | 复用现有 overlay helper，或取消 modal 语义 | **P2** |
| Tour spotlight mask 背景交互（C09-5） | Tour 行为策略；spotlight 几何 helper 保留 core | P3 |
| Tour locale namespace（C09-6） | 新增 `TigerLocaleTour`，兼容回落 formWizard/common | P3 |
| Progress role/attrs 结构（C09-7） | 框架层统一语义结构，计算 helper 继续留 core | P3 |
| Modal/Drawer/Loading/Progress core helper | 已在 core，保持 | - |

---

#### C09 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| React Modal `useEffect([open])` | 初始 closed 也会调用 `onClose`，初始 open 会调用 `onOpenChange(true)` | C09-1 |
| Vue Modal watcher / close action | 不 immediate；`update:open` 只在内部 action，`close` 在关闭过渡时发出 | C09-1 |
| Modal mask click 位置 | mask 只视觉；container click 执行 `shouldCloseOnMaskClick`，`mask=false` 仍有空白点击关闭区 | C09-2 |
| Drawer mask click 位置 | click handler 挂在 mask 节点；`mask=false` 后没有同类关闭区 | C09-2 |
| Loading locale props | Vue 有组件级 locale 并 merge；React 只读 ConfigProvider locale | C09-3 |
| Tour portal/Teleport | React/Vue Tour 直接 createPortal/Teleport，未接 overlay helper | C09-4 |
| Tour focus/Escape/scroll grep | Tour 未使用 `useEscapeKey` / `useFocusTrap` / `useBodyScrollLock` / `captureActiveElement` / `restoreFocus` | C09-4 |
| Tour spotlight style | target mask 使用 `pointerEvents: 'none'`；无 target mask 可点击关闭 | C09-5 |
| Tour locale grep | next/prev/finish 读取 `formWizard`，close aria-label 硬编码 `Close tour` | C09-6 |
| Progress aria 比对 | role/aria 在内部 fill/circle；Vue attrs 同时落外层和内部 | C09-7 |
| `corepack pnpm vitest run tests/react/Modal.spec.tsx tests/react/Drawer.spec.tsx tests/react/Loading.spec.tsx tests/react/Progress.spec.tsx tests/react/Tour.spec.tsx tests/vue/Modal.spec.ts tests/vue/Drawer.spec.ts tests/vue/Loading.spec.ts tests/vue/Progress.spec.ts tests/vue/Tour.spec.ts tests/core/tour-utils.spec.ts tests/core/overlay-utils.spec.ts tests/core/overlay-scroll-lock.spec.ts` | ✅ 13 个测试文件、243 个测试通过 | C09 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C09 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C09 基线 |

> 本轮 C09 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C09 阶段执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C10 消息通知

**扫描范围**：Message / Notification / NotificationCenter 三个组件的 core 类型 [message.ts](../packages/core/src/types/message.ts)、[notification.ts](../packages/core/src/types/notification.ts)（NotificationCenter 的 `NotificationItem`/`NotificationGroup`/`NotificationCenterProps` 在 [composite.ts](../packages/core/src/types/composite.ts)），core 工具 [message-utils.ts](../packages/core/src/utils/message-utils.ts)、[notification-utils.ts](../packages/core/src/utils/notification-utils.ts)、[notification-center-utils.ts](../packages/core/src/utils/notification-center-utils.ts) 与共享 imperative helper [imperative-api.ts](../packages/core/src/utils/imperative-api.ts)，React/Vue 三组件实现、`packages/{react,vue}/src/index` 导出，tests/{core,react,vue} 8 个定向 spec，generated references（component-index.md、shared/props/feedback.md、shared/api-summary.md）。

**结论速览**：基础面健康——imperative API 公共管线（`normalizeStringOption`、`createInstanceCounter`、`ANIMATION_DURATION_MS`、`isBrowser`）、Notification 栈位更新调度器（`createNotificationStackUpdateScheduler`，rAF 批处理）、NotificationCenter 分组逻辑（`buildNotificationGroups`/`sortNotificationGroups`）、全部 class/颜色/图标常量均已沉 core 并双端共享、有 core spec；Notification 的 per-position 容器生命周期与 clear 双端对称、测试镜像；单例守卫在 DOM 被外部清空时复位 root，未发现严格模式重复容器节点。**无 P1**。发现集中在 2 条 **P2**（Message `position` 公共字段被 imperative API 静默忽略、与 Notification 不对称；Message/Notification 双端四实现各自手写近乎相同的 imperative 栈簿记，「该合未合」、合并决策延后 H）+ 5 条 P3（定时器/队列清理、Message 空容器不销毁、NotificationCenter 死代码、硬编码中文默认文案重复、一组首渲染/回退/动画/命名/属性写法的 parity 清理）。

---

#### C10-1 Message `position` 被 imperative API 静默忽略，与 Notification 不对称 — **P2**

**发现问题**

- 🟠 P2｜公共 `MessageProps`（[message.ts:108](../packages/core/src/types/message.ts)）与 imperative 入参 `MessageConfig` 都带 `position?: MessagePosition`，`messagePositionClasses` 提供 6 个方位（[message-utils.ts:23](../packages/core/src/utils/message-utils.ts)），feedback.md 把 Message 记作 `3/7 props`。但 React `addMessage` 只把 `{id,type,content,duration,closable,onClose,icon,className}` 写入实例，**从不读 `config.position`**（[Message.tsx:199](../packages/react/src/components/Message.tsx)），单例容器恒以默认 `'top'` 渲染（[Message.tsx:128](../packages/react/src/components/Message.tsx)、`containerRoot?.render(<MessageContainer />)` 无 position [Message.tsx:191](../packages/react/src/components/Message.tsx)）。
- 🟠 P2｜Vue 同型：`addMessage` 不读 position（[Message.ts:201](../packages/vue/src/components/Message.ts)），`ensureContainer` 用 `createApp(MessageContainer)` 不传 props（[Message.ts:194](../packages/vue/src/components/Message.ts)），容器 `position` prop 默认 `'top'`（[Message.ts:76](../packages/vue/src/components/Message.ts)）。因此 `Message.info({ content, position: 'bottom-right' })` 双端都被静默落到 `'top'`。
- 🟠 P2｜Notification 则真正按 position 分区建容器（[Notification.tsx:271](../packages/react/src/components/Notification.tsx)、[Notification.ts:300](../packages/vue/src/components/Notification.ts)），有测试锁定（`respects position by creating a container per position`，[tests/react/Notification.spec.tsx:84](../tests/react/Notification.spec.tsx)、[tests/vue/Notification.spec.ts:73](../tests/vue/Notification.spec.ts)）。Message 双端均无任何 position 测试。

**公共内容决策**：属框架层 imperative API 语义修正，不新增 core 逻辑。两条路线二选一：① Message imperative API 真正支持 position（与 Notification 对齐，可顺势复用 C10-2 的共享 controller，按方位分容器）；② 把 `position` 从 `MessageProps`/`MessageConfig` 标 `@deprecated` 并精简 `messagePositionClasses`。涉及 public type 时走 baseline。

**建议修复顺序**：P2。先定产品语义（Message 是否需要多方位）；落地前补「`Message.x({position})` 渲染到对应容器」或「position 已弃用」的双端测试，再改实现或类型。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/vue/Message.spec.ts`、`pnpm api:validate`、`pnpm types:check`，涉及 public type 追加 `pnpm api:baseline:check`。

---

#### C10-2 Message 与 Notification 双端各自手写近乎相同的 imperative 栈簿记（该合未合，决策延后 H）— **P2**

**发现问题**

- 🟠 P2｜四份实现（React/Vue × Message/Notification）重复同一套簿记骨架：实例存储、单调 id（都用 core `createInstanceCounter`）、`ensureContainer`/`destroyContainer`、`addX`/`removeX`/`clearAll`、自动关闭 `setTimeout`、DOM 被外部清空时复位 root。Message 用单一扁平数组 + 单例容器（[Message.tsx:37](../packages/react/src/components/Message.tsx)），Notification 多一层 per-position 分区 + rAF 调度器（[Notification.tsx:37](../packages/react/src/components/Notification.tsx)），其余结构高度同形。
- 🟠 P2｜纯簿记（实例表、id、定时器跟踪、clear、按 key 分区）与框架无关，目前在 4 个文件各写一遍；只有 render + root 挂载（createRoot/createApp、flushSync/Teleport）才是真正框架层。属典型「该合未合」。

**公共内容决策**：候选抽取 core 框架无关的「imperative stack controller」（管理 instances-by-key、id、timer、ensure/destroy 回调、clear），框架仅注入「挂载/卸载容器」与「触发重渲染」。与 C10-1 的 position 决策强耦合（Message 是否也要 per-key 分区）。**合并决策延后任务 H**——届时 Message + Notification 双端四实现同时在视野，参照 C07-2/C08 的延后处理。本组不单独动。

**建议修复顺序**：P2，记录待 H 取舍；非 C10 单独行动项。

**目标验证命令**：（决策项，无新增测试）届时 `pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts tests/core/notification-utils.spec.ts`。

---

#### C10-3 自动关闭定时器未跟踪、手动关闭/clear 不清除 — **P3**

**发现问题**

- 🟢 P3｜`addX` 里 `setTimeout(() => removeX(id), duration)` 的 handle 被丢弃，未存入实例也无从清除（[Message.tsx:228](../packages/react/src/components/Message.tsx)、[Notification.tsx:295](../packages/react/src/components/Notification.tsx)、[Message.ts:221](../packages/vue/src/components/Message.ts)、[Notification.ts:325](../packages/vue/src/components/Notification.ts)）。
- 🟢 P3｜手动 close（关闭按钮 / 返回的 close fn）与 `clear()` 只移除实例，不取消定时器；定时器仍到点触发 `removeX(id)`，但 `findIndex` 已命中不到该 id 故为 no-op。因 id 由 `createInstanceCounter` 单调自增、永不复用，**不会误删后续实例，当前 benign**。
- 🟢 P3｜但这正是 C10 重点「定时器/队列清理」：`clear()` 后仍可能残留悬挂定时器，fake-timer 测试中 `advanceTimersByTime` 会触发这些已无效的回调；现有测试未断言「手动关闭/clear 应清除待触发定时器」。

**公共内容决策**：定时器跟踪属框架层簿记（或并入 C10-2 的共享 controller）。建议把每实例 timer handle 存入实例/Map，`removeX`/`clearAll` 时 `clearTimeout`。无需新增 core 纯逻辑。

**建议修复顺序**：P3。可与 C10-2 一并处理；先补「手动关闭后推进定时器不应二次触发 / 不留悬挂回调」的双端测试。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts`。

---

#### C10-4 Message 空时不销毁全局容器，与 Notification 清空即销毁不一致 — **P3**

**发现问题**

- 🟢 P3｜Message `removeMessage` 在队列清空后不销毁容器（[Message.tsx:241](../packages/react/src/components/Message.tsx)、[Message.ts:234](../packages/vue/src/components/Message.ts)）；空的 `#tiger-message-container-root` 与已挂载的 React root / Vue app 常驻 `document.body`，直到显式 `Message.clear()` 才 unmount 并移除节点（[Message.tsx:271](../packages/react/src/components/Message.tsx)、[Message.ts:248](../packages/vue/src/components/Message.ts)）。
- 🟢 P3｜Notification 相反：某 position 队列清空即 `destroyContainer`（unmount + 移除节点 + 取消调度）（[Notification.tsx:321](../packages/react/src/components/Notification.tsx)、[Notification.ts:351](../packages/vue/src/components/Notification.ts)）。两个同类全局容器组件生命周期策略不一致；Message 留一个空容器节点（非重复节点，单例守卫避免重复创建）。

**公共内容决策**：属框架层容器生命周期策略。二选一并双端统一：① Message 跟随 Notification，空时 `destroyContainer`；② 明确「Message 单例容器有意常驻以省去频繁重建」并文档说明。无 core 改动。

**建议修复顺序**：P3，与 C10-2 一起决定（共享 controller 可统一容器生命周期）。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/vue/Message.spec.ts`。

---

#### C10-5 NotificationCenter `_currentGroup` 计算属性双端死代码 — **P3**

**发现问题**

- 🟢 P3｜React `const _currentGroup = useMemo(...)`（[NotificationCenter.tsx:93](../packages/react/src/components/NotificationCenter.tsx)）与 Vue `const _currentGroup = computed(...)`（[NotificationCenter.ts:170](../packages/vue/src/components/NotificationCenter.ts)）声明后从未被读取——下划线前缀即标记其闲置；实际使用的是带读态覆盖的 `effectiveCurrentGroup`。属纯死代码，连同其 memo/computed 计算开销可安全删除。

**公共内容决策**：双端删除即可，不涉及 core 或公共 API。

**建议修复顺序**：P3，独立小清理。

**目标验证命令**：`pnpm vitest run tests/react/NotificationCenter.spec.tsx tests/vue/NotificationCenter.spec.ts`、`pnpm types:check`。

---

#### C10-6 NotificationCenter 默认文案硬编码中文且双端重复 — **P3**

**发现问题**

- 🟢 P3｜9 条界面默认串（`加载中...`、`暂无通知`、`通知中心`、`全部`、`未读`、`已读`、`全部标记已读`、`标记已读`、`标记未读`）作为 props 默认值在两端各写一份（[NotificationCenter.tsx:44](../packages/react/src/components/NotificationCenter.tsx)、[NotificationCenter.ts:74](../packages/vue/src/components/NotificationCenter.ts)）。
- 🟢 P3｜这与库内其它组件「英文默认 + `TigerLocale` 覆盖」方向不一致（同组 Message/Notification 的 aria-label 用英文 `Close message`/`Close notification`）；默认值重复且无法经 ConfigProvider locale 本地化。

**公共内容决策**：默认文案可沉到 core 共享常量或 `TigerLocale` 的 notificationCenter 命名空间（候选），双端从同一来源读取；渲染留框架层。属「该合未合 / i18n 一致性」。

**建议修复顺序**：P3。若新增 locale 命名空间需改 core 类型与 preset、刷新 baseline、由 `docs:api` 生成 references（不手改）。

**目标验证命令**：`pnpm vitest run tests/react/NotificationCenter.spec.tsx tests/vue/NotificationCenter.spec.ts`，涉及 core locale 追加 `pnpm api:validate`、`pnpm types:check`。

---

#### C10-7 一组双端 parity / 清理项（合并） — **P3**

**发现问题**

- 🟢 P3｜① React 首渲染策略不一致：Message 用 `flushSync` 包裹容器渲染（[Message.tsx:191](../packages/react/src/components/Message.tsx)），Notification 用普通 `.render()` 并依赖容器 mount effect 的初次同步（[Notification.tsx:246](../packages/react/src/components/Notification.tsx)、[Notification.tsx:179](../packages/react/src/components/Notification.tsx)）；两者都能工作但机制不同。
- 🟢 P3｜② core 回退不对称：`getNotificationTypeClasses`/`getNotificationIconPath` 带 `|| info` 兜底（[notification-utils.ts:93](../packages/core/src/utils/notification-utils.ts)、[notification-utils.ts:110](../packages/core/src/utils/notification-utils.ts)），`getMessageTypeClasses`/`getMessageIconPath` 无（[message-utils.ts:91](../packages/core/src/utils/message-utils.ts)、[message-utils.ts:110](../packages/core/src/utils/message-utils.ts)）；两个 type 都是严格联合，要么 notification 侧兜底冗余、要么 message 侧缺一致兜底。
- 🟢 P3｜③ 自动关闭路径跳过退出动画：手动 close 先 `setIsVisible(false)` 再延时移除（React）/ 经 TransitionGroup（Vue），自动关闭直接 `removeX(id)`，无退出过渡。
- 🟢 P3｜④ imperative 导出命名 `Message`（大写）vs `notification`（小写）双端一致但彼此不一致（[index.tsx:201](../packages/react/src/index.tsx)、[index.ts:170](../packages/vue/src/index.ts)）；改名属 breaking，倾向保留 + 文档说明。
- 🟢 P3｜⑤ data 属性写法不一：React Message 用裸 `data-tiger-message`（渲染为 `="true"`）、Notification 用显式 `data-tiger-notification=""`；选择器多按「属性存在」匹配故无 bug，但约定不统一。

**公共内容决策**：均为框架层一致性/清理；纯逻辑已在 core，无需新增 core。回退不对称（②）若统一，应在 core 两侧取齐。

**建议修复顺序**：P3，低优先批量清理；先决定回退/动画/命名是否统一，再补少量断言。

**目标验证命令**：`pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts`、`pnpm types:check`。

---

#### C10 健康项

- ✅ imperative API 公共管线 `normalizeStringOption` / `createInstanceCounter`（[imperative-api.ts:10](../packages/core/src/utils/imperative-api.ts)、[imperative-api.ts:29](../packages/core/src/utils/imperative-api.ts)）、`ANIMATION_DURATION_MS`（[animation.ts:310](../packages/core/src/utils/animation.ts)）、`isBrowser`（[env.ts:1](../packages/core/src/utils/env.ts)）已沉 core，双端共享。
- ✅ `createNotificationStackUpdateScheduler`（[notification-utils.ts:187](../packages/core/src/utils/notification-utils.ts)，rAF 批处理、多 position 合帧、cancel）在 core，有 core spec（[notification-utils.spec.ts](../tests/core/notification-utils.spec.ts)）双端同构消费。
- ✅ `buildNotificationGroups`/`sortNotificationGroups`（[notification-center-utils.ts](../packages/core/src/utils/notification-center-utils.ts)）在 core，有 core spec（[notification-center-utils.spec.ts](../tests/core/notification-center-utils.spec.ts)）双端共享。
- ✅ 全部 message/notification class/颜色/图标常量在 core-utils；NotificationCenter 双端结构（分组、读态过滤、`manageReadState` 覆盖、mark-all-read、Tabs/List）对称，测试镜像。
- ✅ 单例守卫在 DOM 被外部清空（测试 `innerHTML=''`）时自动复位 root（[Message.tsx:174](../packages/react/src/components/Message.tsx)、[Notification.tsx:227](../packages/react/src/components/Notification.tsx)、[Message.ts:179](../packages/vue/src/components/Message.ts)、[Notification.ts:260](../packages/vue/src/components/Notification.ts)），避免悬挂 root 并使 React StrictMode/测试重置安全——未发现严格模式重复容器节点。
- ✅ Feedback references 当前能列出 Message/Notification/NotificationCenter，未发现 C10 组件索引漏列。

---

#### C10 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Message position 被忽略（C10-1） | 框架层落实 position 或弃用字段；走 baseline | **P2** |
| imperative 栈簿记四实现重复（C10-2） | 候选抽 core 框架无关 controller；决策延后 H | **P2** |
| 自动关闭定时器未清（C10-3） | 框架层跟踪并 clearTimeout（或并入 C10-2） | P3 |
| Message 空容器不销毁（C10-4） | 双端统一生命周期或文档说明 | P3 |
| NotificationCenter `_currentGroup` 死代码（C10-5） | 双端删除 | P3 |
| NotificationCenter 中文默认重复（C10-6） | 沉 core 常量/locale（候选） | P3 |
| 一组 parity/清理（C10-7） | 框架层统一，core 无改动 | P3 |
| imperative helper / scheduler / 分组 / class 常量已在 core | 已在 core，保持 | - |

---

#### C10 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| React/Vue addMessage 入参 | 不读 `config.position`；单例容器恒 `top` | C10-1 |
| Notification addNotification | 按 position 分容器，有双端测试锁定 | C10-1 |
| 四实现结构比对 | instances/id/ensure-destroy/add-remove-clear/timeout 同形重复 | C10-2 |
| 自动关闭 setTimeout handle | 丢弃、不清除；id 单调故触发时 no-op、benign | C10-3 |
| removeMessage vs removeNotification 空队列 | Message 不销毁容器；Notification `destroyContainer` | C10-4 |
| grep `_currentGroup` | 仅声明、双端无读取点 | C10-5 |
| NotificationCenter props 默认 | 9 条中文默认双端各写一份 | C10-6 |
| flushSync / 回退 / 动画 / 命名 / data-attr 比对 | 五处双端或组件间不一致 | C10-7 |
| grep imperative helper 消费 | `normalizeStringOption`/`createInstanceCounter`/`ANIMATION_DURATION_MS`/`isBrowser` 双端共享 | 健康项 |
| `corepack pnpm vitest run tests/react/Message.spec.tsx tests/react/Notification.spec.tsx tests/react/NotificationCenter.spec.tsx tests/vue/Message.spec.ts tests/vue/Notification.spec.ts tests/vue/NotificationCenter.spec.ts tests/core/notification-utils.spec.ts tests/core/notification-center-utils.spec.ts` | ✅ 8 个测试文件、112 个测试通过 | C10 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C10 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C10 基线 |

> 本轮 C10 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C10 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C11 Form 单组

**扫描范围**：Form / FormItem / useFormController 三者的 core 类型 [form.ts](../packages/core/src/types/form.ts)，core 工具 [form-validation.ts](../packages/core/src/utils/form-validation.ts)、[form-dependency-utils.ts](../packages/core/src/utils/form-dependency-utils.ts)、[form-item-styles.ts](../packages/core/src/utils/form-item-styles.ts)、[form-history-utils.ts](../packages/core/src/utils/form-history-utils.ts)，React 实现 [Form.tsx](../packages/react/src/components/Form.tsx)、[FormItem.tsx](../packages/react/src/components/FormItem.tsx)、[useFormController.ts](../packages/react/src/hooks/useFormController.ts)，Vue 实现 [Form.ts](../packages/vue/src/components/Form.ts)、[FormItem.ts](../packages/vue/src/components/FormItem.ts)、[useFormController.ts](../packages/vue/src/composables/useFormController.ts)，tests/{core,react,vue} 8 个定向 spec，generated references（component-index.md、shared/props/form.md、shared/api-summary.md、examples/form.md）。**FormWizard 属 C30，本组排除**（form-wizard-utils 同排除）。

**结论速览**：纯逻辑沉降良好——校验（form-validation）、条件 DSL/依赖图（form-dependency-utils）、撤销/重做历史（form-history-utils）、表单项样式（form-item-styles，token 化 class）全在 core，双端共享并各有 core spec；防抖器 setTimer/clearTimer 可注入；i18n（`mergeTigerLocale`+`getFormValidationLabels`）与 a11y（label for、aria-invalid/required/describedby、`role=alert`/`role=group`）双端镜像；`FormController` 类型 core 统一、React hook/Vue composable 同构。**无 P1**。发现集中在 **3 条 P2**（① React 维护无人读取的 `formValues` 影子状态 + `updateValue` 上下文方法，与 Vue 单一数据源不对称；② `resetFields` 不重置字段值仅清错误，与方法名/常规语义不符且双端实现不一致；③ `addField/removeField/undo/redo` 的受控数据流双端契约不一致——C11 重点「受控/非受控」核心）+ 3 条 P3（core 表单工具公开面偏宽且与组件 hand-rolled 重复、点路径不支持数组段、一组低优先观察）。多数公共拆合判断指向「双端契约统一 / 公开面精简」，且因涉及公开类型而**延后任务 H**。

---

#### C11-1 React Form 维护无人读取的 `formValues` 影子状态 + `updateValue` 上下文方法（冗余受控层 / 双端不对称）— **P2**

**发现问题**

- 🟠 P2｜React Form 有内部 `formValues` useState（[Form.tsx:202](../packages/react/src/components/Form.tsx)）、`setFormValues(model)` 同步 effect（[Form.tsx:215](../packages/react/src/components/Form.tsx)）、`updateValue`（[Form.tsx:516](../packages/react/src/components/Form.tsx)），并把 `model: formValues` 与 `updateValue` 放进 `FormContextValue`（[Form.tsx:642](../packages/react/src/components/Form.tsx)）。但校验/条件求值读的是 `formValuesRef.current`，而该 ref 在**每次渲染被无条件重置为 `model` prop**（[Form.tsx:227](../packages/react/src/components/Form.tsx)）。
- 🟠 P2｜grep 取证：`useFormContext` 消费者只有 [FormItem.tsx](../packages/react/src/components/FormItem.tsx) 与 index re-export；FormItem **从不读 `context.model`、从不调用 `context.updateValue`**（`formContext.model` / `formContext.updateValue` 消费端 0 命中）。即 `context.model`（影子 state）与 `context.updateValue` 被 provide 却无人消费——相对实际数据流是冗余受控层。
- 🟠 P2｜Vue 端 FormContext 既无 `updateValue`，`context.model` 直接是 `props.model`（[Form.ts:552](../packages/vue/src/components/Form.ts)，单一数据源，无影子 state）。文档用法（[examples/form.md](../skills/tigercat/references/examples/form.md) 行 17）也是消费者把每个 Input 的 value/onChange（React）或 v-model（Vue）直接绑到自有 model，不经 Form 的 updateValue。

**公共内容决策**：`FormContextValue.model` / `updateValue` 是 React 包公开类型（`FormContextValue`、`useFormContext` 均公开），删除属 breaking。记为「该简化未简化 / 双端不对称」：候选方向是 React 也以 `model` prop 为单一数据源、移除影子 `formValues` + `updateValue`（或反向把它做成有文档的受控写入口，并让 Vue 对齐）。涉及公开类型与受控语义，**延后任务 H** 统一取舍；本组不动。

**建议修复顺序**：P2，记录待 H；非本组单独行动项。

**目标验证命令**：（决策项）届时 `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm api:validate`、`corepack pnpm types:check`，涉及公开类型追加 `corepack pnpm api:baseline:check`。

---

#### C11-2 `resetFields` 不重置字段值、仅清校验错误，且与方法名常规语义不符、双端实现不一致 — **P2**

**发现问题**

- 🟠 P2｜React `resetFields` = `clearValidate()` + `setFormValues(model)`（[Form.tsx:486](../packages/react/src/components/Form.tsx)）；受控用法下 `model` 即当前值，`setFormValues(model)` ≈ 无值变化（且只改无人读取的影子 state，见 C11-1）。
- 🟠 P2｜Vue `resetFields` = `validationDebouncer.cancel()` + `clearValidate()`（[Form.ts:481](../packages/vue/src/components/Form.ts)），**完全不碰字段值**。
- 🟠 P2｜两端测试都只断言「清除校验错误」（[tests/react/Form.spec.tsx:975](../tests/react/Form.spec.tsx)、[tests/vue/Form.spec.ts:1441](../tests/vue/Form.spec.ts) 标题均为 `resetFields clears validation errors`），未断言值被重置。
- 🟠 P2｜Form 不存初始值（只有 `useFormController` 用 `initialRef`/`initialValues` 存了快照、其 `reset()` 能恢复初值——[useFormController.ts:51](../packages/react/src/hooks/useFormController.ts)、[useFormController.ts:131](../packages/vue/src/composables/useFormController.ts)）；故两端 `resetFields` 都无法恢复初值，而方法名 `resetFields` 易被理解为「重置字段值 + 清校验」（Element Plus 语义）。

**公共内容决策**：属框架层语义对齐，纯逻辑无需新增 core。二选一并双端统一：① 明确「`resetFields` 仅清校验」并改文档/或考虑改名（如 `clearValidate` 别名）；② 真正支持「重置值到初始」——需双端存初始快照（参照 useFormController 的 initialRef），并补值重置测试。

**建议修复顺序**：P2。先定语义，再双端对齐实现与测试。

**目标验证命令**：`corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`、`corepack pnpm types:check`。

---

#### C11-3 `addField`/`removeField`/`undo`/`redo` 的受控数据流双端契约不一致（受控/非受控）— **P2**

**发现问题**

- 🟠 P2｜React：`addField`/`removeField`（[Form.tsx:491](../packages/react/src/components/Form.tsx)）与 `undo`/`redo`（[Form.tsx:572](../packages/react/src/components/Form.tsx)）走 `setFormValues` + `onChange(next)` 通知父级，**不改 `model`**；影子 state 在 `model` 引用变化时被 effect 重置，且校验读 `formValuesRef.current`（=`model`）看不到这些变更（见 C11-1）。
- 🟠 P2｜Vue：`addField`/`removeField`（[Form.ts:486](../packages/vue/src/components/Form.ts)）与 `undo`/`redo`（[Form.ts:517](../packages/vue/src/components/Form.ts)）**直接就地突变 `props.model`**（`delete` / 赋值 / `Object.assign`），**不 emit 任何事件**。
- 🟠 P2｜取证：React 测试断言 `onChange` 被调用并带新增/移除后的对象（[tests/react/Form.spec.tsx:1463](../tests/react/Form.spec.tsx)、[:1480](../tests/react/Form.spec.tsx)）；Vue 测试断言 `model.age===25` / `model.email===undefined`（[tests/vue/Form.spec.ts:2136](../tests/vue/Form.spec.ts)、[:2166](../tests/vue/Form.spec.ts)）。即同名命令集成契约不同：React「内部 state + onChange 回传」，Vue「直接突变共享 reactive model + 无事件」。

**公共内容决策**：纯逻辑（`createFormHistory`/`pushFormHistory`/`undoFormHistory`/`redoFormHistory`）已在 core 且双端共享；差异在框架层数据所有权模型。与 C11-1 同根——React 影子 state vs Vue 直接突变 model。建议随 C11-1 一并在任务 H 决定统一契约（如双端都以 model 为单一数据源 + 统一变更事件），并补「addField/undo 后值与校验一致」的双端断言。

**建议修复顺序**：P2，与 C11-1 合并决策，延后 H。

**目标验证命令**：（决策项）届时 `corepack pnpm vitest run tests/react/Form.spec.tsx tests/vue/Form.spec.ts`。

---

#### C11-4 core 表单工具公开面偏宽：多个 helper 仅测试消费 + 与组件 hand-rolled 重复 — **P3**

**发现问题**

- 🟢 P3｜以下 core 公开导出**无生产消费者，仅被单元测试引用**（grep packages/{react,vue}/src + examples 生产代码 0 命中；nuxt `.output` 为构建产物不计）：`validateFormFields`、`getFieldError`、`getErrorFields`、`getFieldDependencies`、`getValidationOrder`、`resolveFormConditionState`、`createFormValidationRule`、`FORM_VALIDATION_PRESETS`。
- 🟢 P3｜`validateFormFields`（[form-validation.ts:461](../packages/core/src/utils/form-validation.ts)，含 `Array.from(new Set(...))` dedupe）功能上等价于 React/Vue Form 各自 hand-roll 的 `validateFields`（[Form.tsx:437](../packages/react/src/components/Form.tsx)、[Form.ts:427](../packages/vue/src/components/Form.ts)），但**两端都没用它**（该用未用 + 重复实现）；React inline 版迭代原始 `fieldNames` 不 dedupe，与 core 版口径不一。
- 🟢 P3｜`getValidationOrder`（拓扑序，[form-dependency-utils.ts:54](../packages/core/src/utils/form-dependency-utils.ts)）**从未用于排序校验**：`validateForm` 按 `Object.entries(rules)` 插入序执行（[form-validation.ts:443](../packages/core/src/utils/form-validation.ts)），依赖只驱动 `getDependentFields` 的「再校验触发」，不影响顺序 → 拓扑序 helper 实为死路径。`resolveFormConditionState` 被组件以 `resolveFormFieldConditionState`（合并 conditions 后）替代。
- 🟢 P3｜公开 headless API `useFormController`/`FormController` **无 generated reference 覆盖**（[shared/props/form.md](../skills/tigercat/references/shared/props/form.md) 只列组件 Props，[api-summary.md](../skills/tigercat/references/shared/api-summary.md) form.ts 行只列 `FormProps, FormItemProps`），文档缺口。

**公共内容决策**：与 B-5「core utils 兼容 barrel 公开面过宽」同源。均为 core 公开导出，删除属 breaking → 两条路线：① 作为面向消费者的公开工具保留并补文档（含 useFormController reference）；② 对确认无用者（如 `getValidationOrder`/`resolveFormConditionState`）标 `@deprecated` 并走 baseline。本组只记录，统一并入 B-5/任务 H。

**建议修复顺序**：P3，随 B-5 一并处理。

**目标验证命令**：`corepack pnpm api:validate`、`corepack pnpm types:check`，标 deprecated 时追加 `corepack pnpm api:baseline:check`。

---

#### C11-5 `getValueByPath` / `setValueByPath` 不支持数组路径段（嵌套数组字段受限）— **P3**

**发现问题**

- 🟢 P3｜`getValueByPath` 遇到数组即返回 undefined：`if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined`（[form-validation.ts:59](../packages/core/src/utils/form-validation.ts)）→ 形如 `items.0.name` 的点路径取不到值。
- 🟢 P3｜React `updateValue` 内联 `setValueByPath`（[Form.tsx:544](../packages/react/src/components/Form.tsx)）中间段只创建普通对象、不创建数组，写嵌套数组路径同样不可行。校验读路径用同一个 `getValueByPath` → 嵌套数组字段无法按点路径校验。可能是有意（表单偏扁平），但与类型注释「Supports dotted paths」（[form.ts:138](../packages/core/src/types/form.ts)）承诺有出入。
- 🟢 P3｜注：Vue 端无 `setValueByPath`（直接突变 model），故这是「React 写路径 + 双端读路径（core）」的共同限制。

**公共内容决策**：若要支持数组段，写/读路径解析应统一沉到 core 一个 `getValueByPath`/`setValueByPath` 对（当前 set 只在 React 内联），双端共享；否则在类型注释明确「仅对象点路径」。属能力边界说明。

**建议修复顺序**：P3，低优先；先文档澄清，必要时再扩展并补 core spec。

**目标验证命令**：`corepack pnpm vitest run tests/core/form-validation.spec.ts`、`corepack pnpm types:check`。

---

#### C11-6 一组低优先观察（合并）— **P3**

**发现问题**

- 🟢 P3｜① `isEmpty`（[form-validation.ts:200](../packages/core/src/utils/form-validation.ts)）不把纯空白串视为空：`required` + 空格串会通过 required 校验（除非规则配 `transform: (v)=>v.trim()`）；常见表单期望先 trim。属行为说明。
- 🟢 P3｜② `validateType` 的 `number` 分支 `typeof value !== 'number' && isNaN(Number(value))`——字符串数字（如 `'12'`）按 number 通过，而 `boolean`/`array`/`object` 走严格 `typeof`（[form-validation.ts:229](../packages/core/src/utils/form-validation.ts)）；type 宽严不一，文档可说明。
- 🟢 P3｜③ undo 历史不克隆 `present`：`undoFormHistory` 直接 `present: previous`（[form-history-utils.ts:65](../packages/core/src/utils/form-history-utils.ts)），而 `pushFormHistory`/`redoFormHistory` 用 `{ ...newValues }` 克隆（[:49](../packages/core/src/utils/form-history-utils.ts)、[:83](../packages/core/src/utils/form-history-utils.ts)）；因 past 条目本就是历史快照、当前 benign，但不对称。
- 🟢 P3｜④ `form-item-styles` 仅 3 个测试 / 21 行覆盖（[tests/core/form-item-styles.spec.ts](../tests/core/form-item-styles.spec.ts)）偏弱，但样式逻辑简单、风险低。

**公共内容决策**：均为 core 纯逻辑的行为/一致性说明，无需新增 core 或改公共 API；如统一行为（trim、type 宽严、克隆）应在 core 两侧取齐并补少量断言。

**建议修复顺序**：P3，低优先批量清理。

**目标验证命令**：`corepack pnpm vitest run tests/core/form-validation.spec.ts tests/core/form-history-utils.spec.ts tests/core/form-item-styles.spec.ts`。

---

#### C11 健康项

- ✅ 校验 / 条件 DSL / 依赖图 / 历史 / 表单项样式 纯逻辑全在 core（[form-validation.ts](../packages/core/src/utils/form-validation.ts)、[form-dependency-utils.ts](../packages/core/src/utils/form-dependency-utils.ts)、[form-history-utils.ts](../packages/core/src/utils/form-history-utils.ts)、[form-item-styles.ts](../packages/core/src/utils/form-item-styles.ts)），双端共享，各有 core spec；`form-item-styles` 用 token 化 class（`text-[var(--tiger-text,#111827)]`/`var(--tiger-error,#ef4444)`），无裸主题色。
- ✅ 防抖器 `createFormValidationDebouncer`（[form-validation.ts:102](../packages/core/src/utils/form-validation.ts)）在 core，`setTimer`/`clearTimer` 可注入（测试友好）；React 用 ref + 重建 effect（[Form.tsx:219](../packages/react/src/components/Form.tsx)）、Vue 用 watch 重建（[Form.ts:499](../packages/vue/src/components/Form.ts)），卸载/依赖变更时 `cancel`。
- ✅ i18n 双端一致：`mergeTigerLocale` + `getFormValidationLabels`（ConfigProvider locale + prop `locale` + 每规则 `message` 优先）双端同构接入（[Form.tsx:197](../packages/react/src/components/Form.tsx)、[Form.ts:226](../packages/vue/src/components/Form.ts)），校验默认消息走 locale。
- ✅ a11y 双端镜像：label `for`/`htmlFor` 绑定字段 id、`aria-invalid`/`aria-required`、`aria-describedby`（`mergeAriaDescribedBy` 去重合并）、错误容器 `role="alert"`、field wrapper `role="group"`+`aria-labelledby`（[FormItem.tsx](../packages/react/src/components/FormItem.tsx)、[FormItem.ts](../packages/vue/src/components/FormItem.ts)）。
- ✅ FormItem「错误状态未变则不触发更新」优化两端镜像（React `setErrors` 返回同引用 [FormItem 源同款逻辑 Form.tsx:366](../packages/react/src/components/Form.tsx)、Vue 比较后跳过 splice [Form.ts:364](../packages/vue/src/components/Form.ts)），并据此只对真正新出现的错误触发 shake。
- ✅ `FormController` 类型在 core 统一（[form.ts:415](../packages/core/src/types/form.ts)），React hook（[useFormController.ts](../packages/react/src/hooks/useFormController.ts)）/ Vue composable（[useFormController.ts](../packages/vue/src/composables/useFormController.ts)）同构实现，且 `reset()` 正确恢复 `initialValues`（与 Form 的 resetFields 形成对照，见 C11-2）。
- ✅ 单文件多导出（Form/FormItem 同源 form.ts）双端 Props 类型齐全，`types:check` 通过（FormItem 作为 `${prefix}FormItemProps` 走文件名校验覆盖）。

---

#### C11 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| React 影子 `formValues` + `updateValue` 无人读、与 Vue 不对称（C11-1） | 统一以 model 为单一数据源 / 精简上下文；公开类型走 baseline；延后 H | **P2** |
| `resetFields` 不重置值、双端不一致（C11-2） | 双端统一语义（仅清校验或真重置到初值） | **P2** |
| addField/removeField/undo/redo 受控契约双端不一致（C11-3） | 随 C11-1 统一框架层数据所有权；延后 H | **P2** |
| core 表单工具公开面偏宽 + 与组件 hand-rolled 重复（C11-4） | 并入 B-5：保留并补文档 或 标 deprecated；useFormController 补 reference | P3 |
| 点路径不支持数组段（C11-5） | 文档澄清「仅对象点路径」或统一 core get/set 路径并扩展 | P3 |
| 一组低优先观察（C11-6） | core 行为/一致性说明，按需取齐 | P3 |
| 校验/DSL/依赖/历史/样式/防抖/i18n/a11y/FormController 已在 core 双端共享 | 已在 core，保持 | - |

---

#### C11 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `useFormContext` 消费者 + `formContext.model`/`.updateValue` 读取点 | 仅 FormItem/index；FormItem 不读 model、不调 updateValue（0 命中） | C11-1 |
| React vs Vue resetFields 实现 + 两端测试标题 | React clearValidate+setFormValues(model)、Vue 仅 clearValidate；测试均只断言清错误 | C11-2 |
| React vs Vue addField/removeField/undo/redo + 测试断言 | React onChange 通知不改 model；Vue 直接突变 props.model 无事件 | C11-3 |
| grep 8 个 core helper 的生产消费者 | 0 生产命中（仅测试 + nuxt 构建产物）；validateFormFields 与组件 validateFields 重复 | C11-4 |
| `getValueByPath` 数组分支 + React `setValueByPath` 中间段 | 数组返回 undefined；中间段只建对象 → 嵌套数组点路径不支持 | C11-5 |
| `isEmpty`/`validateType` number/undo present 克隆/form-item-styles 测试数 | 空白串非空、字符串数字通过、undo 不克隆、3 测试 | C11-6 |
| `corepack pnpm vitest run tests/core/form-validation.spec.ts tests/core/form-dependency-utils.spec.ts tests/core/form-history-utils.spec.ts tests/core/form-item-styles.spec.ts tests/react/Form.spec.tsx tests/react/useFormController.spec.tsx tests/vue/Form.spec.ts tests/vue/useFormController.spec.ts` | ✅ 8 个测试文件、248 个测试通过 | C11 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C11 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C11 基线 |

> 本轮 C11 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C11 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。FormWizard（C30）不在本组范围。

---

### C12 输入基础组

**扫描范围**：Input / Textarea / InputGroup / InputGroupAddon / InputNumber / NumberKeyboard / Mentions 七个组件的 core 类型 [input.ts](../packages/core/src/types/input.ts)、[textarea.ts](../packages/core/src/types/textarea.ts)、[input-group.ts](../packages/core/src/types/input-group.ts)、[input-number.ts](../packages/core/src/types/input-number.ts)、[number-keyboard.ts](../packages/core/src/types/number-keyboard.ts)、[mentions.ts](../packages/core/src/types/mentions.ts)，core 工具 [input-styles.ts](../packages/core/src/utils/input-styles.ts)、[textarea-auto-resize.ts](../packages/core/src/utils/textarea-auto-resize.ts)、[input-group-utils.ts](../packages/core/src/utils/input-group-utils.ts)、[input-number-utils.ts](../packages/core/src/utils/input-number-utils.ts)、[number-keyboard-utils.ts](../packages/core/src/utils/number-keyboard-utils.ts)、[mentions-utils.ts](../packages/core/src/utils/mentions-utils.ts)，React/Vue 对应组件实现，tests/{core,react,vue} 16 个定向 spec，generated references（component-index.md、shared/props/form.md、shared/patterns/common.md、examples/form.md）。

**结论速览**：C12 基线健康：目标 vitest、API 校验、公共类型导出检查均通过；输入样式、数值解析/格式化、数字键盘输入规则、Mentions 查询/定位等主要纯逻辑已沉 core 并被双端复用。未发现 P1。主要问题集中在 **文档/契约准确性与双端 parity**：InputGroup 的 size 上下文承诺与实际不符、React Input/Textarea reference 示例的 `onChange` 形态错误、Vue InputNumber 缺少 core/React 已具备的 `defaultValue` 非受控语义。另有 3 个 P3：Mentions 过滤边界、InputNumber 重复 core spec、NumberKeyboard 删除文案 i18n 边界。

---

#### C12-1 InputGroup `size` 上下文只影响 Addon，不影响 Input/Textarea/InputNumber，与类型描述不符 — **P2**

**发现问题**

- 🟠 P2｜core 类型说明 `InputGroupProps.size` 是 “Size applied to all children in the group”（[input-group.ts:16](../packages/core/src/types/input-group.ts)），React/Vue 也分别 provide size/compact 上下文（[InputGroup.tsx:40](../packages/react/src/components/InputGroup.tsx)、[InputGroup.ts:46](../packages/vue/src/components/InputGroup.ts)）。
- 🟠 P2｜但消费端只有 `InputGroupAddon` 读取上下文并传给 `getInputGroupAddonClasses`（[InputGroup.tsx:58](../packages/react/src/components/InputGroup.tsx)、[InputGroup.ts:89](../packages/vue/src/components/InputGroup.ts)）。Input、Textarea、InputNumber 均没有读取 InputGroup context，仍使用自身 `size = 'md'` 默认值（[Input.tsx:84](../packages/react/src/components/Input.tsx)、[Textarea.tsx:27](../packages/react/src/components/Textarea.tsx)、[InputNumber.tsx:53](../packages/react/src/components/InputNumber.tsx)、[Input.ts:61](../packages/vue/src/components/Input.ts)、[Textarea.ts:47](../packages/vue/src/components/Textarea.ts)、[InputNumber.ts:58](../packages/vue/src/components/InputNumber.ts)）。
- 🟠 P2｜现有 InputGroup 测试只断言 group 接受 size、Addon class 存在，未覆盖「子 Input 自动继承 size」（[InputGroup.spec.tsx:62](../tests/react/InputGroup.spec.tsx)、[InputGroup.spec.ts:79](../tests/vue/InputGroup.spec.ts)）。因此当前实现是可通过测试但与公开说明不一致。

**公共内容决策**：二选一并双端统一：① 修改文档/类型说明为「size applies to InputGroupAddon; form controls should set size explicitly」；② 让 Input/Textarea/InputNumber 消费 InputGroup 上下文并仅在自身未显式传 size 时继承。若新增 context 消费属框架层行为变更，core 只保留已有 class helper。

**建议修复顺序**：P2。优先定语义；若选择继承，先补双端 InputGroup+Input/Textarea/InputNumber 组合测试，再改实现。

**目标验证命令**：`corepack pnpm vitest run tests/react/InputGroup.spec.tsx tests/react/Input.spec.tsx tests/react/Textarea.spec.tsx tests/react/InputNumber.spec.tsx tests/vue/InputGroup.spec.ts tests/vue/Input.spec.ts tests/vue/Textarea.spec.ts tests/vue/InputNumber.spec.ts`、`corepack pnpm types:check`。

---

#### C12-2 React Input/Textarea reference 示例把 `onChange` 写成值回调，实际组件传 DOM event — **P2**

**发现问题**

- 🟠 P2｜generated reference 的通用绑定示例写 `<Input value={value} onChange={setValue} />`（[common.md:95](../skills/tigercat/references/shared/patterns/common.md)），form 示例也写 Input/Textarea 的 React 用法为 `onChange={setValue}`（[form.md:18](../skills/tigercat/references/examples/form.md)、[form.md:22](../skills/tigercat/references/examples/form.md)）。
- 🟠 P2｜真实 React Input 类型是 `onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void`（[Input.tsx:43](../packages/react/src/components/Input.tsx)），实现直接 `onChange?.(event)`（[Input.tsx:145](../packages/react/src/components/Input.tsx)）；Textarea 同理传 `React.ChangeEvent<HTMLTextAreaElement>`（[Textarea.tsx:18](../packages/react/src/components/Textarea.tsx)、[Textarea.tsx:80](../packages/react/src/components/Textarea.tsx)）。
- 🟠 P2｜React 示例页和测试都按 event 用法写：`onChange={(e) => setBasicText(e.target.value)}`（[InputDemo.tsx:7](../examples/example/react/src/pages/InputDemo.tsx)），Textarea 测试同样读取 `e.target.value`（[Textarea.spec.tsx:377](../tests/react/Textarea.spec.tsx)）。因此 reference 示例会误导消费者把 React state setter 直接接到 event。

**公共内容决策**：属于 generated references/示例文档准确性问题，不改公共 API。后续应从生成源修正（不要手改 generated references）：React Input/Textarea 绑定示例写成 `(event) => setValue(event.target.value)`；保留 InputNumber/Mentions 等值回调组件的 `onChange={setValue}` 示例。

**建议修复顺序**：P2。优先修文档生成源，避免继续生成错误示例。

**目标验证命令**：修复生成源后运行 `corepack pnpm docs:api:check`；若只改文档源，补 `corepack pnpm types:check`。

---

#### C12-3 Vue InputNumber 缺 `defaultValue` 非受控运行时 prop，且本地接口含未实现 `className` — **P2 / P3**

**发现问题**

- 🟠 P2｜core `InputNumberProps` 定义 `defaultValue?: number | null`（[input-number.ts:31](../packages/core/src/types/input-number.ts)），React InputNumber 实现并测试了非受控 `defaultValue`（[InputNumber.tsx:52](../packages/react/src/components/InputNumber.tsx)、[InputNumber.spec.tsx:23](../tests/react/InputNumber.spec.tsx)）。
- 🟠 P2｜Vue InputNumber 运行时 props 只有 `modelValue`，没有 `defaultValue`（[InputNumber.ts:55](../packages/vue/src/components/InputNumber.ts)）；内部 `internalValue` 初始化为 `props.modelValue ?? null`（[InputNumber.ts:152](../packages/vue/src/components/InputNumber.ts)）。因此 Vue 侧无法用 `defaultValue` 初始化非受控值，与 core/React 语义不一致。
- 🟢 P3｜Vue 本地接口 `VueInputNumberProps` 声明了 `className?: string`（[InputNumber.ts:48](../packages/vue/src/components/InputNumber.ts)），但运行时 props 没有 `className`，wrapper class 只合并 `attrs.class`（[InputNumber.ts:264](../packages/vue/src/components/InputNumber.ts)）。这与同组 Textarea/NumberKeyboard 显式支持 `className` 的 Vue 组件不一致，属于类型/实现清理项。

**公共内容决策**：`defaultValue` 属 core 公开 props，应补齐 Vue 运行时能力或在 generated references 明确 Vue 仅用 `modelValue`。建议补齐 Vue `defaultValue`，保持与 NumberKeyboard Vue 的非受控模式一致；`className` 则二选一：运行时补 prop，或从本地接口删除并统一推荐 `class`。

**建议修复顺序**：P2 先补 Vue `defaultValue` + 测试；P3 再处理 `className` 一致性。

**目标验证命令**：`corepack pnpm vitest run tests/vue/InputNumber.spec.ts tests/react/InputNumber.spec.tsx tests/core/input-number-utils.spec.ts tests/core/input-number-display-utils.spec.ts`、`corepack pnpm types:check`。

---

#### C12-4 Mentions 打开条件与过滤结果使用不同口径，无匹配/禁用项时进入不可见打开态 — **P3**

**发现问题**

- 🟢 P3｜React `handleInput` 判断 `result && options.length > 0` 就 `setIsOpen(true)`（[Mentions.tsx:58](../packages/react/src/components/Mentions.tsx)），但渲染 listbox 需要 `isOpen && filteredOptions.length > 0`（[Mentions.tsx:138](../packages/react/src/components/Mentions.tsx)）。过滤本身排除 disabled option（[Mentions.tsx:49](../packages/react/src/components/Mentions.tsx)）。
- 🟢 P3｜Vue `handleInput` 在设置新 query 前读取 `filteredOptions.value.length`（[Mentions.ts:57](../packages/vue/src/components/Mentions.ts)），此时 computed 仍基于旧 query；随后设置 query 后渲染又看新的 `filteredOptions.value.length`（[Mentions.ts:138](../packages/vue/src/components/Mentions.ts)）。因此输入一个无匹配 query 或只匹配禁用项时，可能短暂进入 `isOpen=true` 但无 listbox 渲染的状态。
- 🟢 P3｜现有测试覆盖下拉定位、键盘导航、过滤和自定义 prefix；React disabled-option 测试只确认组件存在，没有断言无 listbox / 不进入打开态（[Mentions.spec.tsx:188](../tests/react/Mentions.spec.tsx)）。Vue 侧无 disabled option 分支测试。

**公共内容决策**：过滤和打开条件应统一复用同一 core helper 或至少同一份 filtered result。无须改公共 API；建议把「计算 query + 过滤候选 + 是否打开」整理成框架无关 helper，双端消费。

**建议修复顺序**：P3。先补无匹配/disabled-only 双端测试，再收敛打开条件。

**目标验证命令**：`corepack pnpm vitest run tests/react/Mentions.spec.tsx tests/vue/Mentions.spec.ts tests/core/mentions-utils.spec.ts`。

---

#### C12-5 InputNumber core 解析/格式化 helper 有两份近重复 spec — **P3**

**发现问题**

- 🟢 P3｜[input-number-utils.spec.ts](../tests/core/input-number-utils.spec.ts) 与 [input-number-display-utils.spec.ts](../tests/core/input-number-display-utils.spec.ts) 都测试 `formatInputNumberDisplay` / `parseInputNumberValue`，覆盖点高度重合：null/undefined、formatter 优先、precision、默认 Number 解析、空串/单 `-`、非法输入。
- 🟢 P3｜这两份测试都能通过，但未来修改格式化/解析行为时需要同步维护两处断言，增加噪音。实际 helper 已在 [input-number-utils.ts:195](../packages/core/src/utils/input-number-utils.ts) / [:212](../packages/core/src/utils/input-number-utils.ts) 单源实现，测试也应单源。

**公共内容决策**：纯测试清理；保留一个 core spec 文件即可。建议把较完整的边界用例合并到 `input-number-utils.spec.ts`，删除 `input-number-display-utils.spec.ts` 或改为覆盖真正缺口（如 parser 返回 NaN、precision 非整数策略）。

**建议修复顺序**：P3，低风险清理。

**目标验证命令**：`corepack pnpm vitest run tests/core/input-number-utils.spec.ts tests/react/InputNumber.spec.tsx tests/vue/InputNumber.spec.ts`。

---

#### C12-6 NumberKeyboard confirm 文案接 locale，delete 默认文案未接 locale，i18n 边界不对称 — **P3**

**发现问题**

- 🟢 P3｜React/Vue NumberKeyboard 的 confirm 文案通过 `resolveLocaleText('Done', confirmText, mergedLocale?.common?.okText)` 接入 ConfigProvider locale（[NumberKeyboard.tsx:58](../packages/react/src/components/NumberKeyboard.tsx)、[NumberKeyboard.ts:52](../packages/vue/src/components/NumberKeyboard.ts)）。
- 🟢 P3｜delete 文案只有 prop 默认值 `deleteText = 'Delete'` / `default: 'Delete'`，传给 core key layout（[NumberKeyboard.tsx:41](../packages/react/src/components/NumberKeyboard.tsx)、[NumberKeyboard.ts:38](../packages/vue/src/components/NumberKeyboard.ts)、[number-keyboard-utils.ts:160](../packages/core/src/utils/number-keyboard-utils.ts)），不会从 locale 派生。当前 `TigerLocaleCommon` 只有 `okText` / `cancelText` / `emptyText` 等字段，无 deleteText（[locale.ts:7](../packages/core/src/types/locale.ts)）。
- 🟢 P3｜这不是现有测试红灯：双端测试覆盖默认 Delete/Done、自定义 deleteText/confirmText、showConfirm=false（[NumberKeyboard.spec.tsx:12](../tests/react/NumberKeyboard.spec.tsx)、[NumberKeyboard.spec.ts:11](../tests/vue/NumberKeyboard.spec.ts)），但未覆盖 locale 下 delete label 的预期。

**公共内容决策**：可保持现状并在文档说明「deleteText 需显式传入」；若要统一 i18n，则需要给 `TigerLocale` 增加 numberKeyboard/deleteText 命名空间或 common deleteText，属于 core 类型/API 扩展，需 baseline 与 references 更新。

**建议修复顺序**：P3。先文档说明；若产品要求全局本地化，再走 locale 类型扩展。

**目标验证命令**：`corepack pnpm vitest run tests/react/NumberKeyboard.spec.tsx tests/vue/NumberKeyboard.spec.ts tests/core/number-keyboard-utils.spec.ts`，若改 locale 类型追加 `corepack pnpm api:validate`、`corepack pnpm types:check`、`corepack pnpm api:baseline:check`。

---

#### C12 健康项

- ✅ Input 基础 class、状态、prefix/suffix、clearable、password toggle、showCount、number 解析统一走 core `input-styles`（[input-styles.ts](../packages/core/src/utils/input-styles.ts)），React/Vue 行为镜像；error `aria-describedby` / `aria-invalid` 已覆盖。
- ✅ Textarea 自动尺寸逻辑沉到 core `autoResizeTextarea`（[textarea-auto-resize.ts](../packages/core/src/utils/textarea-auto-resize.ts)），双端分别在 `useLayoutEffect` / `watch + nextTick` 调用，minRows/maxRows 逻辑一致。
- ✅ InputNumber 的 clamp/step/precision、重复按压 rAF controller、display format/parse 已在 core（[input-number-utils.ts](../packages/core/src/utils/input-number-utils.ts)），双端同构消费；长按 repeat 测试双端覆盖。
- ✅ NumberKeyboard 输入规则、布局、mode-specific maxLength/precision、delete/confirm payload 均在 core（[number-keyboard-utils.ts](../packages/core/src/utils/number-keyboard-utils.ts)），React/Vue 事件 payload 对齐，ConfigProvider locale 能覆盖 confirm 文案。
- ✅ Mentions 的输入 class、option class、query 提取、dropdown floating position 与 cyclic index helper 已在 core（[mentions-utils.ts](../packages/core/src/utils/mentions-utils.ts)、[picker-utils.ts:96](../packages/core/src/utils/picker-utils.ts)），双端复用。
- ✅ component-index 与 form props/api-summary 能列出 C12 组件；`api:validate` 与 `types:check` 均通过，未发现导出缺口。

---

#### C12 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| InputGroup size 上下文未影响子输入（C12-1） | 文档澄清 Addon-only 或双端实现未显式 size 时继承 | **P2** |
| React Input/Textarea reference `onChange={setValue}` 错误（C12-2） | 修生成源示例；React DOM event handler 与值回调组件分开 | **P2** |
| Vue InputNumber 缺 `defaultValue`（C12-3） | 补齐 Vue 非受控默认值语义；`className` 单独清理 | **P2** |
| Mentions 打开条件/过滤口径不一（C12-4） | 双端统一 filtered result；可沉 core helper | P3 |
| InputNumber helper 重复 spec（C12-5） | 合并测试文件，保留单源覆盖 | P3 |
| NumberKeyboard delete 文案未接 locale（C12-6） | 文档说明显式 deleteText；或扩展 locale 类型 | P3 |
| 输入样式/自动尺寸/数值解析/数字键盘/Mentions 定位等核心逻辑已在 core | 已在 core，保持 | - |

---

#### C12 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep InputGroup context 消费者 + Input/Textarea/InputNumber size 默认 | 只有 Addon 消费 context；子输入不继承 group size | C12-1 |
| references `onChange={setValue}` vs React 组件类型/示例页 | reference 写值回调；真实组件传 DOM event，示例页使用 `event.target.value` | C12-2 |
| core/React InputNumber `defaultValue` vs Vue runtime props | core/React 有 defaultValue；Vue 没有 runtime prop，内部值从 modelValue 初始化 | C12-3 |
| Vue InputNumber `className` 接口 vs props/wrapper class | interface 有 `className`，runtime 只合并 `attrs.class` | C12-3 |
| Mentions handleInput/open/render/filter 分支 | 打开口径与渲染过滤口径不同；无匹配/disabled-only 缺测试锁定 | C12-4 |
| core InputNumber 两份 spec 文件 | `input-number-utils.spec.ts` 与 `input-number-display-utils.spec.ts` 覆盖高度重复 | C12-5 |
| NumberKeyboard confirm/delete 文案路径 | confirm 走 locale common.okText；delete 只走 prop/default `Delete` | C12-6 |
| `corepack pnpm vitest run tests/react/Input.spec.tsx tests/react/Textarea.spec.tsx tests/react/InputGroup.spec.tsx tests/react/InputNumber.spec.tsx tests/react/NumberKeyboard.spec.tsx tests/react/Mentions.spec.tsx tests/vue/Input.spec.ts tests/vue/Textarea.spec.ts tests/vue/InputGroup.spec.ts tests/vue/InputNumber.spec.ts tests/vue/NumberKeyboard.spec.ts tests/vue/Mentions.spec.ts tests/core/input-number-utils.spec.ts tests/core/input-number-display-utils.spec.ts tests/core/number-keyboard-utils.spec.ts tests/core/mentions-utils.spec.ts` | ✅ 16 个测试文件、473 个测试通过 | C12 基线 |
| `corepack pnpm api:validate` | ✅ 通过；API 一致性检查 0 问题 | C12 基线 |
| `corepack pnpm types:check` | ✅ 通过；公共 props 类型导出齐全 | C12 基线 |

> 本轮 C12 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，C12 阶段只执行目标 vitest、`corepack pnpm api:validate` 与 `corepack pnpm types:check`（均通过）。

---

### C13 选择/切换基础组

**扫描范围**：Checkbox、CheckboxGroup、Radio、RadioGroup、Switch、Slider、Stepper、Rate、Segmented 的全链路——core 类型 `packages/core/src/types/{checkbox,radio,switch,slider,stepper,rate,segmented}.ts`，core 工具 `utils/{radio-utils,radio-group-utils,rate-utils,stepper-utils,segmented-utils}.ts`、`utils/helpers/slider-utils.ts`，React/Vue 对应组件实现、双端定向 spec、`tests/core/{segmented-utils,switch-theme}.spec.ts`，以及 generated component index 与 `shared/props/{form,basic}.md`。

**结论速览**：Checkbox/Radio 保持原生输入语义，组内受控/非受控值、禁用继承和 Radio 箭头键导航双端对称；Slider 的键盘、范围约束和 ARIA thumb 也已有双端覆盖。**无 P1**。需处理的发现为：Rate/Segmented 仅披露 radio 角色而不提供实际键盘操作，且 Rate 把多个星标同时标为已选；Slider 的 `marks={true}` 是空渲染；Slider/Stepper 的数值契约对零/负 step 与反向边界没有保护，核心计算又无直接单测；Vue Switch 覆盖调用方传入的 click/keydown 监听器。

---

#### C13-1 Rate / Segmented 的 ARIA radio 语义没有可键盘操作实现，Rate 还会产生多选 radio 状态（a11y）— **P2**

**发现问题**

- 🟠 P2｜Rate 两端将每个星标渲染为 `span role="radio"`（[Rate.tsx:119](../packages/react/src/components/Rate.tsx)、[Rate.ts:143](../packages/vue/src/components/Rate.ts)），没有 `tabIndex`、`onKeyDown` 或原生可聚焦控件；只能鼠标点击。`value=3` 时前三个星都按 `full || half` 赋 `aria-checked=true`，不符合单选组只能有一个选项被选中的语义。
- 🟠 P2｜Segmented 两端同样以不可聚焦的 `label role="radio"` 表示选项（[Segmented.tsx:57](../packages/react/src/components/Segmented.tsx)、[Segmented.ts:80](../packages/vue/src/components/Segmented.ts)），只绑定 click，没有 roving tabindex、方向键、Home/End 或 Enter/Space 选择。React 组件也不透传根节点属性，调用方不能提供 `aria-label` / `aria-labelledby`；Vue 虽透传 attrs，但默认组没有名称。
- 🟠 P2｜现有 Rate/Segmented 双端 spec 只验证 click、静态 aria 属性和 axe 结果；没有键盘、焦点顺序、radio 单选基数或可定制组名称断言。axe 无法证明自定义角色可以由键盘操作。

**公共内容决策**：这是框架层交互与 ARIA 模式问题，不应把 DOM 焦点管理沉入 core。Rate 先确定正确模式：更适合以一个 `role="slider"` 表达 0～count（含 half）评分；若保留 radiogroup，必须只让精确值对应一个 radio。Segmented 应使用原生 radio 或 button + roving-tabindex，并在双端统一命名入口。共享的选项索引/跳过禁用项计算可在确认两端需求后沉入 core。

**建议修复顺序**：P2。先确定 Rate 的 ARIA 模式，再为两组件补键盘和焦点行为，最后补 React/Vue 对等的键盘、禁用跳过、名称和半分值测试。

**目标验证命令**：`pnpm vitest run tests/react/Rate.spec.tsx tests/vue/Rate.spec.ts tests/react/Segmented.spec.tsx tests/vue/Segmented.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13-2 Slider 的 `marks={true}` 是静默空实现，测试未锁定承诺的可见标记 — **P2**

**发现问题**

- 🟠 P2｜React/Vue 都把布尔 `marks` 转为空对象（[Slider.tsx:287](../packages/react/src/components/Slider.tsx)、[Slider.ts:364](../packages/vue/src/components/Slider.ts)），随后只遍历对象条目；因此 `marks={true}` 仅渲染空容器，不显示任何标记或标签。
- 🟠 P2｜props 注释承诺 boolean 用于“show marks”，但没有默认 marks 集合。两端测试的 `marks=true` 用例只断言 slider thumb 存在（[Slider.spec.tsx:338](../tests/react/Slider.spec.tsx)、[Slider.spec.ts:405](../tests/vue/Slider.spec.ts)），注释称 DOM 是实现细节，未验证该布尔值的实际效果。

**公共内容决策**：marks 的布局仍属框架组件；默认 marks 的纯派生规则若需要双端一致，可抽为 core helper。先确定兼容语义：让 `true` 至少派生 min/max 标记，或收窄类型和文档，只接受显式 map；不能继续保留无效果的 boolean 分支。

**建议修复顺序**：P2。先确定 `true` 的默认标记策略，双端接入同一派生结果，并补可见文本/位置断言和空区间边界测试。

**目标验证命令**：`pnpm vitest run tests/react/Slider.spec.tsx tests/vue/Slider.spec.ts`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13-3 Slider / Stepper 数值参数缺少有效域保护，核心计算没有直接单测 — **P2**

**发现问题**

- 🟠 P2｜`sliderNormalizeValue` 直接以 `step` 作除数（[slider-utils.ts:22](../packages/core/src/utils/helpers/slider-utils.ts)）；`step=0` 会经 `Infinity * 0` 产生 `NaN`，并传播到键盘、轨道点击和拖动路径。Slider props 未限制 `step > 0` 或 `min <= max`，双端实现也未归一化外部 value/defaultValue。
- 🟠 P2｜Stepper 同样接受任意 `step`、min/max 与 precision（[Stepper.tsx:22](../packages/react/src/components/Stepper.tsx)、[Stepper.ts:20](../packages/vue/src/components/Stepper.ts)）；零 step 使动作无效，负 step 会让加减方向反转，`min > max` 会令按钮边界和 `clampStepperValue` 语义冲突。
- 🟠 P2｜核心 `sliderNormalizeValue` / `sliderGetValueFromPosition` / `sliderGetKeyboardValue` 与 `clampStepperValue` 只由组件消费，仓库没有 core direct spec；现有组件 spec 覆盖正常整数、小数、范围交叉和键盘路径，但不覆盖零/负 step、反向区间或非有限数。

**公共内容决策**：有效域归一化是跨框架纯逻辑，应保持在 core；框架层只处理 DOM 事件与受控值通知。不要在 React/Vue 分别补不同的 guard。后续需先定义无效 props 的兼容策略（开发期告警并安全回退，或显式约束/抛错），再由 core helper 统一实施。

**建议修复顺序**：P2。先给 Slider/Stepper 的数值参数定契约，补 core 单测，再让两端在挂载和交互时复用归一化结果；这项不改 public API 前也可作为防御性修复。

**目标验证命令**：新增 `tests/core/slider-utils.spec.ts`、`tests/core/stepper-utils.spec.ts` 后运行 `pnpm vitest run tests/core/slider-utils.spec.ts tests/core/stepper-utils.spec.ts tests/react/Slider.spec.tsx tests/vue/Slider.spec.ts tests/react/Stepper.spec.tsx tests/vue/Stepper.spec.ts`。

---

#### C13-4 Vue Switch 覆盖调用方的原生 click / keydown 监听器，和 React 透传语义不一致 — **P3**

**发现问题**

- 🟢 P3｜Vue Switch 先展开 `attrs`，随后同一 vnode 又写入 `onClick: emitChange`、`onKeydown: handleKeyDown`（[Switch.ts:101](../packages/vue/src/components/Switch.ts)）；未声明为组件 emits 的 `@click` / `@keydown` 会作为 attrs 到达，但被内部 handler 覆盖，调用方监听器不会执行。
- 🟢 P3｜React Switch 明确先调用外部 `onClick` / `onKeyDown`，再在事件未取消时 toggle（[Switch.tsx:36](../packages/react/src/components/Switch.tsx)），可以保留业务拦截和默认阻止语义。Vue spec 仅验证切换和 disabled，不覆盖调用方监听器与 preventDefault。

**公共内容决策**：保持事件编排在框架层；Vue 应采用合并 listener 的方式并与 React 保持“外部监听器先运行、`defaultPrevented` 时不切换”的契约。无需新增 core helper 或公共 API。

**建议修复顺序**：P3。补 Vue click/keydown 透传与 preventDefault 回归测试后，最小化调整 vnode listener 合并。

**目标验证命令**：`pnpm vitest run tests/vue/Switch.spec.ts tests/react/Switch.spec.tsx`、`pnpm api:validate`、`pnpm types:check`。

---

#### C13 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| Rate / Segmented 键盘与 ARIA 状态（C13-1） | DOM/focus 留框架层；候选选项索引/跳过禁用计算按需沉 core | **P2** |
| Slider `marks=true`（C13-2） | 先确定 boolean 语义；若派生默认 marks，再抽 core 纯规则 | **P2** |
| Slider / Stepper 数值契约（C13-3） | 归一化和有效域 guard 合入 core，框架层复用 | **P2** |
| Vue Switch listener 覆盖（C13-4） | 框架层最小修复，保持 React 对等事件契约 | P3 |
| Checkbox/Radio 原生输入、组选项、禁用继承与箭头键导航 | 已健康，保持双端现状 | - |

---

#### C13 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| Rate / Segmented 双端 render | 自定义 radio 均无焦点/键盘路径；Rate value=3 可产生 3 个 `aria-checked=true` | C13-1 |
| Rate / Segmented 双端 spec | 覆盖 click/静态 aria/axe；无键盘、焦点、单选基数或可配置名称断言 | C13-1 |
| Slider `marks` 分支与双端 spec | boolean 分支转 `{}`；测试只验证 thumb 存在 | C13-2 |
| slider-utils / stepper-utils 消费者与 tests/core | helper 只被双端组件消费；无 direct core spec；无无效数值参数用例 | C13-3 |
| Vue / React Switch 事件处理 | Vue 后写 handler 覆盖 attrs listener；React 先回调调用方并尊重 defaultPrevented | C13-4 |
| 目标 vitest、`pnpm api:validate`、`pnpm types:check` | ⚠️ 未运行：本机 `node_modules` 缺失，冻结安装在下载 `typescript@6.0.3` 及平台二进制包时超时；不作为组件结论 | C13 基线 |

> 本轮 C13 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，目标 vitest、`pnpm api:validate` 与 `pnpm types:check` 因本机依赖重建的下载超时未能启动；该环境问题不作为组件结论。

---

### C14 Select 单组

**扫描范围**：Select、AutoComplete 的全链路——core 类型 `packages/core/src/types/{select,auto-complete}.ts`，core 工具 `utils/{select-utils,auto-complete-utils,picker-utils}.ts`，React 实现 `components/Select.tsx` + `Select/{state,render-option,types,icons}`、`components/AutoComplete.tsx`，Vue 实现 `components/{Select,AutoComplete}.ts`，双端定向 spec、`tests/core/{picker-utils,select-utils}.spec.ts`，examples `SelectDemo`/`AutoCompleteDemo`，generated component-index。

**结论速览**：Select/AutoComplete 核心行为健康、双端对称且测试充分——受控量（`value`/`onChange` ↔ `modelValue`/`update:modelValue`）、多选切换、clearable、过滤、creatable、remote、debounce、键盘导航均双端锁定。**无 P1**。需处理项集中在两类：① **公共 props 名实不符**——`allowFreeInput` 双端声明零实现、Select `virtual`/`listHeight` 双端 no-op、React AutoComplete 整体缺 `locale`（与 Vue 不对称）；② **该合未合**——Select 绕开同族 picker helpers（连 TreeSelect/Cascader 都用的 `getPickerTriggerKeyAction`），把导航/trigger/aria 在 React+Vue 各手写一遍。其余为 a11y / i18n / 一致性 P3。

---

#### C14-1 AutoComplete `allowFreeInput` 死 prop、`defaultActiveFirstOption` JSDoc 名实不符（公共 API 卫生）— **P2**

**发现问题**

- 🟠 P2｜`allowFreeInput` 为**双端声明、零实现、零测试、零示例**的公共 prop：定义于 [auto-complete.ts:41](../packages/core/src/types/auto-complete.ts)（注释「Whether to allow free-form text input」），Vue 声明默认 `true`（[AutoComplete.ts:96](../packages/vue/src/components/AutoComplete.ts)）、React 只把它放进 `AUTOCOMPLETE_KEYS` 过滤集（[AutoComplete.tsx:48](../packages/react/src/components/AutoComplete.tsx)），但两端 setup/render **从不读取**它。语义上 AutoComplete 本就是自由输入框，该 prop 既无效果又含义含糊。
- 🟢 P3｜`defaultActiveFirstOption` 的 JSDoc 写「Whether to select the first match automatically **when losing focus**」（[auto-complete.ts:38](../packages/core/src/types/auto-complete.ts)），但实现只用它在**打开/输入时**设置高亮 active 索引（React [AutoComplete.tsx:104](../packages/react/src/components/AutoComplete.tsx)/[:122](../packages/react/src/components/AutoComplete.tsx)、Vue [AutoComplete.ts:137](../packages/vue/src/components/AutoComplete.ts)/[:156](../packages/vue/src/components/AutoComplete.ts)）；全代码没有任何 blur-select 行为。文档与实现不符。

**公共内容决策**：属公共 API 卫生，走任务 H 策略（不直接删公开内容）。`allowFreeInput` 二选一——要么按文档实现（失焦/回车时是否限定为 options 内的值），要么标 deprecated + migration + changeset 后移除，并过 `api:baseline:check`。`defaultActiveFirstOption` 先修 JSDoc 以匹配实际「打开时高亮首项」语义。

**建议修复顺序**：P2。先定 `allowFreeInput` 去留（实现 or 废弃）；JSDoc 修正可随手并入。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`。

---

#### C14-2 Select `virtual` / `listHeight` 是双端 no-op 的公共 API，且 `virtual` 文档承诺性能优化（过度设计 / 未实现）— **P2**

**发现问题**

- 🟠 P2｜`virtual`（`@since 0.5.0`，注释「only visible options are rendered for better performance」）与 `listHeight`（`@since 0.5.0`，默认 256）是公开 props（[select.ts:117](../packages/core/src/types/select.ts)/[:149](../packages/core/src/types/select.ts)），但两端**均未实现虚拟滚动**：React 只把二者放进 `SELECT_KEYS` 过滤集（[state.ts:33](../packages/react/src/components/Select/state.ts)/[:38](../packages/react/src/components/Select/state.ts)）、从不消费；Vue 声明了 props（[Select.ts:195](../packages/vue/src/components/Select.ts)/[:225](../packages/vue/src/components/Select.ts)）也从不引用。dropdown 始终一次性渲染全部选项。
- ℹ️ 测试「should handle large number of options」对 100 项**全量渲染**断言（[tests/react/Select.spec.tsx:519](../tests/react/Select.spec.tsx)、[tests/vue/Select.spec.ts:653](../tests/vue/Select.spec.ts)），反证无虚拟化。对照：同批 `@since 0.5.0` 的 `maxTagCount` 已实现并测试。

**公共内容决策**：公共 API 变更走任务 H。二选一——要么接入真实虚拟滚动（C24 已有 `VirtualList` 可复用，属框架层接入，纯滚动/测量计算可沉 core），要么把 `virtual`/`listHeight` 标 deprecated + migration、修正 `virtual` 注释中的性能承诺，过 `api:baseline:check`。不可继续保留「声明了性能优化但无效果」的 props。

**建议修复顺序**：P2，独立成项。先决策实现 vs 废弃。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm api:baseline:check`、`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14-3 React AutoComplete 缺 `locale`，与 Vue 不对称；Vue `notFoundText` 又未走 locale（i18n 不对称）— **P2**

**发现问题**

- 🟠 P2｜**双端不对称**：Vue AutoComplete 接 `locale` prop 并经 `useTigerConfig` + `mergeTigerLocale` + `resolveLocaleText` 本地化 clear 按钮 `aria-label`（[AutoComplete.ts:100](../packages/vue/src/components/AutoComplete.ts)/[:266](../packages/vue/src/components/AutoComplete.ts)）；**React AutoComplete 完全没有 `locale` prop**，clear `aria-label="Clear"` 硬编码英文、无法本地化（[AutoComplete.tsx:205](../packages/react/src/components/AutoComplete.tsx)）。与 B-1（DatePicker 未接 ConfigProvider locale）同向、与 C02-2（React QRCode 缺 locale）同型。注意 Select 双端均已接 `locale`，唯 AutoComplete 不对称。
- 🟢 P3｜Vue AutoComplete 虽有 `mergedLocale`，但空态 `notFoundText` 直接用 prop 默认英文（[AutoComplete.ts:310](../packages/vue/src/components/AutoComplete.ts)），**未走 locale**；而 Vue Select 的空态走 `mergedLocale?.common?.emptyText`（[Select.ts:826](../packages/vue/src/components/Select.ts)）——同组内空态本地化策略不一致。

**公共内容决策**：locale 解析留 core（`mergeTigerLocale`/`resolveLocaleText` 已在 core），框架层消费。React AutoComplete 应补 `locale` prop 并对齐 Vue 的「显式 prop > ConfigProvider locale > 默认」优先级；clear/notFoundText 文案统一接 `common`（如 `clearText`/`emptyText`）。属公共 API 新增（React 加 prop），双端 parity 收敛。

**建议修复顺序**：P2。先给 React AutoComplete 补 locale 接入与 clear 文案本地化，再统一两端空态走 locale，补 ConfigProvider 回归测试。

**目标验证命令**：`pnpm api:validate`、`pnpm types:check`、`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`。

---

#### C14-4 Select 绕开共享 picker helpers，把导航/trigger/aria 在双端各手写一遍（该合未合 + 双端重复）— **P2**

**发现问题**

- 🟠 P2｜[picker-utils.ts:1](../packages/core/src/utils/picker-utils.ts) 自述为「Select、AutoComplete、Cascader、TreeSelect、Transfer」的**共享键盘导航/aria 层**，提供 `getPickerNavigationIndex`、`getPickerComboboxAria`/`getPickerListboxAria`/`getPickerOptionAria`、`getPickerTriggerKeyAction`、`getInitialPickerActiveIndex` 等。AutoComplete、Cascader、TreeSelect、Transfer、Mentions、Spotlight 都消费这些高层 helper；**唯独 Select 只用底层 `findFirstEnabledIndex`/`findLastEnabledIndex`/`findNextEnabledIndex`**（[state.ts:10](../packages/react/src/components/Select/state.ts)、[Select.ts:17](../packages/vue/src/components/Select.ts)），把导航键派发、option/listbox aria 在两端**逐处内联**。
- 🟠 P2｜尤其 `getPickerTriggerKeyAction(key, expanded)` 连 Select 的**同族** TreeSelect、Cascader 都在用（[TreeSelect.tsx:176](../packages/react/src/components/TreeSelect.tsx)、[TreeSelect.ts:223](../packages/vue/src/components/TreeSelect.ts)、[Cascader.tsx:211](../packages/react/src/components/Cascader.tsx)、[Cascader.ts:240](../packages/vue/src/components/Cascader.ts)），Select 却在 trigger handler 里另写一套 Enter/Space/Arrow/Escape 分支（[state.ts:269](../packages/react/src/components/Select/state.ts)、[Select.ts:437](../packages/vue/src/components/Select.ts)）。
- 🟠 P2｜后果是**跨框架重复**：Select 的 trigger/dropdown/search 三个键盘 switch 在 React `state.ts` 与 Vue `Select.ts` 之间近乎逐字重复；option/listbox 的 `role`/`aria-selected`/`aria-disabled` 也在两端各写一遍（React [render-option.tsx:27](../packages/react/src/components/Select/render-option.tsx)、Vue [Select.ts:741](../packages/vue/src/components/Select.ts)），而这正是 `getPickerOptionAria` 已封装的内容。
- ℹ️ ARIA 模式差异（非缺陷，限定可合范围）：Select 是 **button 触发 + 焦点移入选项（roving tabindex + DOM focus + scrollIntoView）**；AutoComplete 是 **combobox + `aria-activedescendant`（焦点留输入框）**。故 `getPickerComboboxAria`（输出 `role="combobox"`）**不应**套到 Select 触发器。可安全共享的是：dropdown 的方向键派发改用 `getPickerNavigationIndex`、option aria 改用 `getPickerOptionAria`；`getPickerTriggerKeyAction` 可评估接入（行为敏感、双端 spec 已锁，需谨慎）。

**公共内容决策**：**合并到已有 core picker-utils**。纯逻辑（导航索引派发、trigger 键意图、option aria）沉 core 共享，焦点/DOM/事件编排留框架层。优先低风险项（`getPickerNavigationIndex`、`getPickerOptionAria`），`getPickerTriggerKeyAction` 接入需对照现有键盘 spec 逐项验证等价。无公共 API 破坏（纯内部重构）。

**建议修复顺序**：P3→P2 渐进。先用 `getPickerNavigationIndex` 收敛 Select dropdown 的 4 个方向键分支（与底层 finder 行为等价、零风险），再用 `getPickerOptionAria` 收敛 option aria；最后评估 trigger 键合并。每步跑双端 Select spec 保证行为不变。

**目标验证命令**：`pnpm vitest run tests/core/picker-utils.spec.ts tests/react/Select.spec.tsx tests/vue/Select.spec.ts`、`pnpm types:check`、`pnpm api:validate`。

---

#### C14-5 同组 clear 控件 a11y 模式不一致：Select 用不可聚焦 `<span>`，AutoComplete 用 `<button>`（a11y）— **P3**

**发现问题**

- 🟢 P3｜Select 的清除控件是嵌在触发 `<button>` 内的 `<span data-tiger-select-clear onClick>`（[Select.tsx:47](../packages/react/src/components/Select.tsx)、[Select.ts:673](../packages/vue/src/components/Select.ts)），**不可聚焦、无键盘路径**——键盘用户无法清除（Select 也未提供 Delete/Backspace 清除）。且交互元素（span onClick）嵌套在 button 内，语义不佳。
- 🟢 P3｜对照同组 AutoComplete 的清除控件是真正的 `<button aria-label>`（[AutoComplete.tsx:202](../packages/react/src/components/AutoComplete.tsx)、[AutoComplete.ts:259](../packages/vue/src/components/AutoComplete.ts)），键盘可达。同一 C14 组内两套清除模式。

**公共内容决策**：框架层 a11y 修复，不入 core。Select clear 宜改为可聚焦控件（独立 `<button>` 或补键盘路径），并避免 button 内嵌 onClick span。属行为/结构调整，双端 spec 仅断言 `[data-tiger-select-clear]` 存在与点击清除，改造空间可控。

**建议修复顺序**：P3。补 Select 键盘清除回归测试后再调结构，双端对齐。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14-6 Select clear 的 `aria-label` 硬编码英文未本地化（i18n）— **P3**

**发现问题**

- 🟢 P3｜Select 清除控件 `aria-label="Clear selection"` 双端硬编码（[Select.tsx:51](../packages/react/src/components/Select.tsx)、[Select.ts:679](../packages/vue/src/components/Select.ts)），**未走 locale**——即便 Vue Select 已有 `mergedLocale`、且仓库已有 `common.clearText` 这一 key（Vue AutoComplete 正用它本地化 clear）。结果 Select 的清除标签无法本地化。

**公共内容决策**：接入已有 locale 链路（`resolveLocaleText('Clear selection', mergedLocale?.common?.clearText)` 之类），与 Vue AutoComplete 统一。core 已有 helper，无需新增。与 C14-3、C01-4（默认标签本地化）同向，可合并到一次 i18n 收敛。

**建议修复顺序**：P3，随 C14-3 / a11y 标签本地化一并处理。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`、`pnpm api:validate`。

---

#### C14-7 AutoComplete 三处双端一致但与 Select 不一致的小问题（一致性）— **P3**

**发现问题**

- 🟢 P3｜**hover 高亮禁用项**：AutoComplete option 的 `onMouseEnter` 无条件 `setActiveIndex`（[AutoComplete.tsx:233](../packages/react/src/components/AutoComplete.tsx)、[AutoComplete.ts:296](../packages/vue/src/components/AutoComplete.ts)），可把 active 落到 disabled 项（Enter 仍被 `handleSelect` 拦截，仅视觉/语义瑕疵）；Select 的 hover 有 `!option.disabled` 判断（[render-option.tsx:32](../packages/react/src/components/Select/render-option.tsx)、[Select.ts:745](../packages/vue/src/components/Select.ts)）。
- 🟢 P3｜**键盘导航不滚动**：AutoComplete 走 `aria-activedescendant` 但方向键导航**从不 scrollIntoView**，长列表 active 项可能在视口外；Select 会 `scrollIntoView({block:'nearest'})`（[state.ts:179](../packages/react/src/components/Select/state.ts)、[Select.ts:339](../packages/vue/src/components/Select.ts)）。combobox 模式同样需手动滚动 active 项。
- 🟢 P3｜**Vue 多一个 `change` 事件**：Vue AutoComplete 在 emits 声明并在输入/选择/清除时额外发 `change`（[AutoComplete.ts:105](../packages/vue/src/components/AutoComplete.ts)/[:153](../packages/vue/src/components/AutoComplete.ts)），React 无对应 `onChange`-distinct 事件（React `onChange` 等价 Vue `update:modelValue`）——事件面双端不完全对称。
- ℹ️ 另：`auto-complete-utils.ts` 的 `filterAutoCompleteOptions`/`defaultAutoCompleteFilter` 无 `tests/core` direct spec，仅经组件测试间接覆盖（对照 `select-utils`/`picker-utils` 均有 core spec）。

**公共内容决策**：(a)(b) 框架层补 disabled 判断与 scrollIntoView，与 Select 对齐；(c) 评估 Vue `change` 是保留（文档化为非 v-model 事件）还是移除以对齐 React，属事件契约取舍；core filter helper 可补 direct spec。均不涉及公共拆合到 core 的结构变更。

**建议修复顺序**：P3，低优先，随 AutoComplete 下次改动顺手处理；补 `tests/core/auto-complete-utils.spec.ts`。

**目标验证命令**：`pnpm vitest run tests/react/AutoComplete.spec.tsx tests/vue/AutoComplete.spec.ts`（如补 core spec 追加 `tests/core/auto-complete-utils.spec.ts`）。

---

#### C14-8 受控量 / 双端 parity 健康面 + active-index 重算策略细微差异（观察）— **P3 / 观察**

**发现问题**

- ✅ 受控量/事件双端对称：`value`/`onChange` ↔ `modelValue`/`update:modelValue`；多选 toggle、clear 回值（单选 `undefined` / 多选 `[]`）、`maxTagCount` 截断、`creatable`（去重 + `create` 回调）、`remote`（跳过本地过滤）、`searchDebounce`、键盘（Arrow/Home/End/Enter/Space/Escape/Tab）均双端 spec 锁定且行为一致。option 过滤、空态、分组渲染一致。
- 🟢 P3｜**active-index 重算策略**：打开时两端都「优先选中项、否则首个可用项」；但**选项变化时**——React 用单 effect 仍偏向选中项（[state.ts:410](../packages/react/src/components/Select/state.ts)），Vue 的 `flatSelectableOptions` watch 无条件回到 `findFirstEnabledIndex`、忽略选中项（[Select.ts:615](../packages/vue/src/components/Select.ts)）。实时过滤时选中值通常已不在结果内，差异概率低，但属双端不完全一致，列为观察。

**公共内容决策**：parity 健康面无需动作。active-index 差异如要统一，可在 C14-4 收敛键盘/状态逻辑时一并对齐两端「选项变化后是否保留选中高亮」的语义。

**建议修复顺序**：P3 观察，随 C14-4 顺带评估。

**目标验证命令**：`pnpm vitest run tests/react/Select.spec.tsx tests/vue/Select.spec.ts`。

---

#### C14 公共拆分/合并决策汇总（供任务 H 汇总）

| 项 | 决策 | 优先级 |
| --- | --- | --- |
| AutoComplete `allowFreeInput` 死 prop（C14-1） | 实现 or 废弃（走 H 流程）；`defaultActiveFirstOption` 修 JSDoc | **P2** |
| Select `virtual`/`listHeight` 双端 no-op（C14-2） | 接入真实虚拟滚动（复用 VirtualList）或废弃 + 改注释 | **P2** |
| React AutoComplete 缺 `locale`（C14-3） | React 补 locale 接入；空态/clear 文案双端统一走 locale | **P2** |
| Select 绕开 picker-utils 高层 helper（C14-4） | 合并→core 共享（先 `getPickerNavigationIndex`/`getPickerOptionAria`，再评估 `getPickerTriggerKeyAction`） | **P2** |
| Select clear `<span>` 不可键盘聚焦（C14-5） | 框架层改可聚焦控件 + 键盘路径 | P3 |
| Select clear `aria-label` 硬编码英文（C14-6） | 接入已有 `common.clearText` locale key | P3 |
| AutoComplete hover 禁用项 / 无 scrollIntoView / Vue 多 change 事件（C14-7） | 框架层对齐 Select；补 core filter direct spec | P3 |
| 受控量/parity 健康面 + active-index 重算差异（C14-8） | 健康面保持；差异随 C14-4 顺带统一 | P3/观察 |

---

#### C14 取证摘要（静态实读 + 目标命令）

| 取证 | 结果 | 对应发现 |
| --- | --- | --- |
| grep `allowFreeInput` 全仓 | 仅类型 + 双端声明出现，setup/render 零消费 | C14-1 |
| grep Select `virtual`/`listHeight` 消费者 | 仅 React `SELECT_KEYS` 过滤集；双端无虚拟渲染；100 项全量渲染测试反证 | C14-2 |
| 比对 React/Vue AutoComplete `locale` | Vue 有 locale + 本地化 clear；React 无 locale、clear 硬编码英文 | C14-3 |
| grep picker-utils 高层 helper 消费者 | AutoComplete/Cascader/TreeSelect/Transfer/Mentions/Spotlight 用；Select 仅用底层 finder；`getPickerTriggerKeyAction` 被 TreeSelect/Cascader 用而 Select 未用 | C14-4 |
| 比对 Select vs AutoComplete clear 控件 | Select=不可聚焦 `<span onClick>`；AutoComplete=`<button>` | C14-5 |
| grep Select clear `aria-label` | 双端硬编码 `Clear selection`，未走 `common.clearText` | C14-6 |
| 比对 onMouseEnter/scrollIntoView/emits | AutoComplete hover 不滤 disabled、无 scrollIntoView、Vue 多 `change`；Select 反之 | C14-7 |
| 目标 vitest、`api:validate`、`types:check` | ✅ vitest 6 文件 190 测试通过；`api:validate` 一致性检查通过（0 问题）；`types:check` 全部 props 类型导出 | C14 基线 |

> 本轮 C14 只记录扫描结论和修复建议；未改任何组件源码、core 工具、公共 API、生成器或 generated references（仅本文件 + `docs/ROADMAP.md` 状态标记）。按 ROADMAP「若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`」，本轮以 packageManager 指定的 pnpm 11.9.0（本机无 corepack）实跑 C14 目标 vitest（6 文件 190 测试通过）、`pnpm run api:validate`（一致性检查 0 问题）与 `pnpm run types:check`（全部 props 类型导出），均为只读校验、未改动仓库。
