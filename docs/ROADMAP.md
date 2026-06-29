# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 breaking component API simplification and grouped validation plan
verified-date: 2026-06-29
source: current repository state after R15 Form composite selectors completion
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节与发布收口记录不再保留在路线图中；R01-R11 已完成任务的详细执行记录归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，需要历史证据时从归档、git 历史、变更日志或对应提交中查找。

## 当前状态

截至 2026-06-29，上一轮 T01-T14 已完成，v2.0.0 已完成 R01-R15 基础设施、API 审计与前四个组件批次清理：包体积、按需加载、发布产物、ESM-only、显式 exports、sideEffects、首批兼容层、legacy token/icon 资源清理、按组件组验证通道、core/shared contracts 删除合并清单、Basic/Layout 轻量组件 API 清理、Feedback/overlay open/portal/focus/close lifecycle 收敛、Form primitives 受控模型与尺寸别名清理，以及 Form composite selectors 搜索、空态、模型别名与 heavy helper 拆分已经落地。v2.0.0 尚未完成发布前剩余组件级破坏性升级；R16-R20 是 v2.0.0 发布前剩余任务。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0（R01 Roadmap cleanup）、阶段 1（R02 version and release metadata、R03 ESM-only build surface）、阶段 2（R04 explicit exports and public component facts、R05 tree-shaking and sideEffects）、阶段 3（R06 remove deprecated and compatibility APIs、R07 token and legacy asset cleanup）与阶段 4（R08 on-demand usage docs and examples、R09 size and publish artifact gates），已完成于 2026-06-28；阶段 5（R10 grouped validation, docs, and examples infrastructure）、阶段 6（R11 Core API and shared contracts audit）、阶段 7（R12 Basic + Layout lightweight components）、阶段 8（R13 Feedback and overlay components）和阶段 9（R14-R15 Form primitives 与 composite selectors）已完成于 2026-06-29。
- 当前阶段：阶段 10（R16 Navigation components），状态为 `未开始`。
- 当前可执行任务：R16 Navigation components。
- 后续阶段：R16-R20 必须按阶段依赖执行；v2.0.0 只有 R20 完成并通过发布门禁后才算路线图完成。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- 每个组件批次必须同步处理源码、测试、Skill references、examples、迁移说明、变更记录、API baseline 和对应门禁。
- 每个组件批次优先运行对应分组测试；只有发布收口、跨组改动或门禁策略调整才运行全量 `quality:release`。
- 删除 public API 必须给出唯一替代 API；没有保留价值的 API 直接删除并在迁移说明中写明。
- 完成任一 Rxx 后，必须同步更新该任务状态、所属阶段状态、完成日期和关键验证命令；未更新状态视为任务未完成。
- 完成任务的详细执行摘要、实际验证命令和状态回写要求应移至 [V2_COMPLETED.md](V2_COMPLETED.md)；`ROADMAP.md` 只保留完成状态摘要和当前/后续任务执行要求，避免读取时消耗过多 token。
- 完成 R12-R20 中任何涉及 public API、shared contract、props、events、methods、type aliases 或 helper exports 删除/合并的任务后，必须在 [V2_API_AUDIT.md](V2_API_AUDIT.md) 追加或更新对应批次记录，写明实际变更、唯一替代 API、证据、验证命令和剩余阻塞。
- R10-R20 属于 v2.0.0 发布前计划，不插入 R01-R09 中间，也不得改变既有阶段依赖。

## 状态回写要求

完成任一任务后，必须同时更新以下位置：

- `阶段进度`：更新当前已完成阶段、下一阶段、当前可执行任务和后续阶段说明。
- `阶段与依赖`：更新所属阶段的 `阶段状态`；若阶段内任务部分完成则标为 `进行中`，全部完成则标为 `已完成（日期）`。
- 对应 `Rxx` 任务条目：更新 `状态`、完成日期、关键执行摘要；必要时补充实际验证命令和剩余发布后验证。
- `V2_API_AUDIT.md`：涉及 public API 或 shared contract 清理时追加对应 Rxx 完成记录；记录实际删除/合并项、替代 API、证据、验证命令和剩余阻塞。
- `路线图维护验证`：如新增或调整文档维护命令，必须同步更新本节。

## 阶段与依赖

| 阶段 | 阶段状态             | 任务    | 执行规则                                                              |
| ---- | -------------------- | ------- | --------------------------------------------------------------------- |
| 0    | 已完成（2026-06-28） | R01     | 只做路线图清理；为后续 v2 任务建立边界                                |
| 1    | 已完成（2026-06-28） | R02-R03 | 先稳定版本与 release metadata，再切换 ESM-only 发布面                 |
| 2    | 已完成（2026-06-28） | R04-R05 | 先建立显式 exports 与公开组件事实源，再调整 tree-shaking/sideEffects  |
| 3    | 已完成（2026-06-28） | R06-R07 | 删除兼容 API、legacy token 与旧资源；按 API baseline 和目标测试拆批次 |
| 4    | 已完成（2026-06-28） | R08-R09 | 更新按需加载使用面，并增加 size/publish artifact 门禁                 |
| 5    | 已完成（2026-06-29） | R10     | 先建立按组件组可执行的测试、文档和示例维护通道                        |
| 6    | 已完成（2026-06-29） | R11     | 审计 core API 与 shared contracts，形成组件批次删除/合并清单          |
| 7    | 已完成（2026-06-29） | R12     | 清理 Basic + Layout 轻量展示组件                                      |
| 8    | 已完成（2026-06-29） | R13     | 清理 Feedback 与 overlay 组件                                         |
| 9    | 已完成（2026-06-29） | R14-R15 | 分两批清理 Form primitives 与 composite selectors                     |
| 10   | 未开始               | R16     | 清理 Navigation 组件                                                  |
| 11   | 未开始               | R17     | 清理 Data 与 table stack                                              |
| 12   | 未开始               | R18     | 清理 Charts 与 visualization stack                                    |
| 13   | 未开始               | R19     | 清理 Advanced editors 与 media-heavy components                       |
| 14   | 未开始               | R20     | 清理 Composite/business components 并完成 v2.0 release hardening      |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## v2.0.0 任务队列

### R01-R11 completed infrastructure archive

R01-R11 已完成，详细执行摘要、实际验证命令和状态回写记录已归档到 [V2_COMPLETED.md](V2_COMPLETED.md)。当前执行入口只保留完成状态摘要，避免后续 Agent 读取 R12-R20 时消耗过多 token。

| 任务                                                      | 状态                 | 摘要                                                                               | 详情                                                                                         |
| --------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| R01 Roadmap cleanup                                       | 已完成（2026-06-28） | 清理路线图为 v2.0.0 分批执行入口。                                                 | [归档](V2_COMPLETED.md#r01-roadmap-cleanup)                                                  |
| R02 version and release metadata                          | 已完成（2026-06-28） | 同步 2.0.0 版本、运行时 version、CLI 模板和 release readiness 入口。               | [归档](V2_COMPLETED.md#r02-version-and-release-metadata)                                     |
| R03 ESM-only build surface                                | 已完成（2026-06-28） | 将 core/react/vue 发布面切为 ESM-only，并更新 publish smoke。                      | [归档](V2_COMPLETED.md#r03-esm-only-build-surface)                                           |
| R04 explicit exports and public component facts           | 已完成（2026-06-28） | 建立公开组件事实源和 React/Vue 显式 component subpath exports。                    | [归档](V2_COMPLETED.md#r04-explicit-exports-and-public-component-facts)                      |
| R05 tree-shaking and sideEffects                          | 已完成（2026-06-28） | 收敛 sideEffects，隔离 Message/notification 命令式入口并加 tree-shaking gates。    | [归档](V2_COMPLETED.md#r05-tree-shaking-and-sideeffects)                                     |
| R06 remove deprecated and compatibility APIs              | 已完成（2026-06-28） | 删除首批 deprecated/compat API，并让 api:validate 阻止新增 public deprecated API。 | [归档](V2_COMPLETED.md#r06-remove-deprecated-and-compatibility-apis)                         |
| R07 token and legacy asset cleanup                        | 已完成（2026-06-28） | 删除 legacy token CSS/TS 兼容命名、旧 icon path aliases 和 common-icons barrel。   | [归档](V2_COMPLETED.md#r07-token-and-legacy-asset-cleanup)                                   |
| R08 on-demand usage docs and examples                     | 已完成（2026-06-28） | 将 examples、SSR smoke 和 references 迁移到 subpath-first / lazy-first 用法。      | [归档](V2_COMPLETED.md#r08-on-demand-usage-docs-and-examples)                                |
| R09 size and publish artifact gates                       | 已完成（2026-06-28） | 增加 size/publish artifact gates，验证发布 tarball、exports 和 bundle 隔离。       | [归档](V2_COMPLETED.md#r09-size-and-publish-artifact-gates)                                  |
| R10 grouped validation, docs, and examples infrastructure | 已完成（2026-06-29） | 建立按组件组运行测试、文档和示例维护的基础设施。                                   | [归档](V2_COMPLETED.md#r10-grouped-validation-docs-and-examples-infrastructure)              |
| R11 Core API and shared contracts audit                   | 已完成（2026-06-29） | 输出 v2 shared contracts 审计和 R12-R20 API 删除/合并清单。                        | [归档](V2_COMPLETED.md#r11-core-api-and-shared-contracts-audit)，[API 审计](V2_API_AUDIT.md) |

### R12 Basic + Layout lightweight components

**状态**：已完成（2026-06-29）。

**目标**：清理 Basic 与 Layout 轻量展示组件，删除历史别名 props，统一 class/style 透传和子组件导出策略，并同步测试、Skill 文档与 examples。

**允许修改**：Basic/Layout 相关 core types、React/Vue 组件、目标 tests、Skill `shared/props/basic.md`、`shared/props/layout.md`、`examples/basic.md`、`examples/layout.md`、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Feedback/Form/Navigation/Data/Charts/Advanced/Composite 组件行为、测试分组基础设施、发布 workflow。

**依赖/阻塞**：依赖 R11。

**组件范围**：Button、Tag、Badge、Avatar、Card、Space、Skeleton、Divider、Text、Statistic、Descriptions、List、Carousel，以及同组内必要的子组件。

**完成验证**：

- `corepack pnpm test:group:basic`
- `corepack pnpm test:group:layout`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm size`
- `git diff --check`

**执行摘要**：已删除等同 shared contracts 的 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize` public type aliases；对应 props 改用 `BaseLayoutProps` 或 `ComponentSize`。`ButtonSize`、`AvatarSize`、`TextSize` 与 `SkeletonShape` 因具备组件专属语义或无共享替代而保留。Carousel 已从 `initialSlide` 切换为 `currentIndex` / `defaultCurrentIndex` 受控模型，React 新增 `onCurrentIndexChange`，Vue 新增 `update:currentIndex`，并同步 tests、examples、迁移说明、变更记录、API baseline 与 Skill references。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/react/Carousel.spec.tsx tests/vue/Carousel.spec.ts`
- `npx -y pnpm@11.9.0 test:group:basic`
- `npx -y pnpm@11.9.0 test:group:layout`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 size`
- `git diff --check`

**状态更新要求**：已写回状态、日期、删除的 API 摘要、Skill/examples 更新范围、分组测试命令和关键验证命令；阶段 7 已同步为完成。

### R13 Feedback and overlay components

**状态**：已完成（2026-06-29）。

**目标**：统一 Feedback 与 overlay 组件的 open/portal/focus/keyboard/after-close 合约，删除 visible 语义残留和旧 portal 兼容分支。

**允许修改**：Feedback 相关 core types、React/Vue 组件、overlay 工具、目标 tests/e2e、Skill feedback props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Navigation/Data/Charts/Advanced/Composite 组件行为、无关 package exports、size budget 结构。

**依赖/阻塞**：依赖 R11；若触及 Message/notification 命令式入口，必须保持 R05 的 sideEffects 隔离目标。

**组件范围**：Modal、Drawer、Tooltip、Popover、Popconfirm、Message、Notification、Loading、Tour、Progress。

**完成验证**：

- `corepack pnpm test:group:feedback`
- `corepack pnpm vitest run tests/core/imperative-side-effects.spec.ts`
- `corepack pnpm e2e:smoke` 或目标 overlay e2e
- `corepack pnpm example:ssr:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：已删除 React `packages/react/src/hooks/usePopup.ts` 旧 source hook 及 hooks barrel re-export，避免继续暴露 `visible` / `defaultVisible` / `onVisibleChange` 合约。Tooltip、Popover、Popconfirm 示例与 `api:validate` 护栏收敛到 `open` / `defaultOpen` / `onOpenChange` / `update:open`；Drawer 将 `destroyOnCloseAfterLeave` 改为 `deferDestroyOnClose`，React `onAfterLeave` / Vue `after-leave` 改为 `onAfterClose` / `after-close`；Modal 新增 React `onAfterClose` 与 Vue `after-close`，外部 `open=false` 只触发生命周期而不触发 close intent。Vue Modal/Drawer 删除 `disableTeleport`，统一 teleport 到 `body`；Popconfirm confirm/cancel 与 Escape/outside close 路径保持焦点恢复；Message/notification imperative root 与 pure container 的 R05 sideEffects 边界保持不变。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts tests/react/Drawer.spec.tsx tests/vue/Drawer.spec.ts tests/react/Popconfirm.spec.tsx tests/vue/Popconfirm.spec.ts`
- `npx -y pnpm@11.9.0 vitest run tests/react/Tooltip.spec.tsx tests/vue/Tooltip.spec.ts tests/react/Popover.spec.tsx tests/vue/Popover.spec.ts`
- `npx -y pnpm@11.9.0 vitest run tests/vue/DragEnhancements.spec.ts tests/vue/custom-text.spec.ts tests/core/a11y-interactive-regression.spec.tsx`
- `npx -y pnpm@11.9.0 test:group:feedback`
- `npx -y pnpm@11.9.0 vitest run tests/core/imperative-side-effects.spec.ts`
- `npx -y pnpm@11.9.0 e2e:smoke`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `git diff --check`

**状态更新要求**：已写回状态、日期、删除的 overlay/feedback API 摘要、Skill/examples 更新范围和关键验证命令；阶段 8 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R14。

### R14 Form primitives

**状态**：已完成（2026-06-29）。

**目标**：清理表单基础输入组件，统一 controlled/default/onChange 模型，删除重复 value alias，并将重复测试收缩为分组内参数化覆盖。

**允许修改**：Form primitive 相关 core types、React/Vue 组件、目标 tests、受控状态 helper 使用、Skill form props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form composite selectors、Feedback/Navigation/Data/Charts/Advanced/Composite 组件行为、测试分组基础设施。

**依赖/阻塞**：依赖 R11；可在 R13 完成后执行，避免 overlay/focus 变更交叉。

**组件范围**：Input、Textarea、InputNumber、Checkbox、Radio、Switch、Slider、Stepper、Segmented、ColorSwatch。

**完成验证**：

- `corepack pnpm test:group:form -- --filter primitives` 或等效目标文件集合
- `corepack pnpm vitest run tests/react/useControlledState.spec.tsx tests/vue/useFormController.spec.ts`
- `corepack pnpm test:a11y`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：已删除等同 `ComponentSize` 的 primitive 尺寸类型别名 `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize`；对应 props、core style utilities、theme runtime 和 React/Vue 组件实现改用 `ComponentSize`。Vue Checkbox、Radio、Switch 统一为 `modelValue` / `defaultValue` / `update:modelValue` / `change`，Vue RadioGroup 统一为 `modelValue` / `defaultValue` / `update:modelValue` / `change`；React checkable primitives 继续使用 `checked` / `defaultChecked` / `onChange`，Checkbox/Radio 的 `value` 保留为 group option identity。Vue examples、primitive tests、Skill references、API baseline、迁移说明、变更记录和 `api:validate` R14 护栏已同步更新。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:form -- --filter primitives`
- `npx -y pnpm@11.9.0 vitest run tests/react/useControlledState.spec.tsx tests/vue/useFormController.spec.ts`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 test:a11y`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `git diff --check`

**状态更新要求**：已写回状态、日期、删除的 primitive API 摘要、参数化测试收缩范围、Skill/examples 更新范围和关键验证命令；阶段 9 已同步为 `进行中`，当前可执行任务推进到 R15。

### R15 Form composite selectors

**状态**：已完成（2026-06-29）。

**目标**：清理表单复合选择器和大体量表单组件的多分支 API，统一 search/filter/empty/loading/locale 入口，并拆分可 tree-shake 的 heavy helpers。

**允许修改**：Form composite 相关 core types、React/Vue 组件、picker/select/upload/form helper、目标 tests、Skill form props/examples、example 使用、迁移说明、变更记录、API baseline、必要的 bundle smoke。

**不得修改**：Form primitives 已完成行为、Feedback/Navigation/Data/Charts/Advanced/Composite 组件行为、发布 workflow。

**依赖/阻塞**：依赖 R14；涉及 DatePicker/TimePicker locale 或 custom text 时必须保持 R08/R09 的按需加载与 locale trimming 目标。

**组件范围**：Select、TreeSelect、Cascader、AutoComplete、Transfer、DatePicker、TimePicker、ColorPicker、Upload、Form、FormItem、InputGroup。

**完成验证**：

- `corepack pnpm test:group:form`
- `corepack pnpm vitest run tests/core/custom-text-labels.spec.ts tests/core/datepicker-i18n.spec.ts`
- `corepack pnpm example:ssr:check`
- `corepack pnpm size`
- `corepack pnpm publish:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：已删除等同 `ComponentSize` 的 composite 尺寸类型别名 `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize`；DatePicker/TimePicker public model surface 收敛为 `DatePickerModelValue` 与 `TimePickerModelValue`。Select、TreeSelect、Cascader、AutoComplete、Transfer 搜索入口统一为 `searchValue` / `defaultSearchValue`、React `onSearchChange`、Vue `update:searchValue` / `search-change`，TreeSelect/Cascader/Transfer 的搜索开关统一为 `searchable`；空态文案统一为 `emptyText` 并继续从 locale/custom text fallback。Upload queue/chunk/resume helper 已拆入独立内部模块，基础 Upload helper 不再承载队列重逻辑；API baseline、Skill references、examples、迁移说明、变更记录和 `api:validate` R15 护栏已同步更新。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:form -- --filter composite`
- `npx -y pnpm@11.9.0 vitest run tests/core/custom-text-labels.spec.ts tests/core/datepicker-i18n.spec.ts`
- `npx -y pnpm@11.9.0 test:group:form`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 publish:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)"`
- `git diff --check`

**状态更新要求**：已写回状态、日期、删除的 composite form API 摘要、heavy helper 拆分范围、Skill/examples 更新范围和关键验证命令；阶段 9 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R16。

### R16 Navigation components

**状态**：未开始。

**目标**：清理 Navigation 组件，合并子项组件导出策略，删除深路径兼容 re-export，统一 active/open/selected/expanded 命名。

**允许修改**：Navigation 相关 core types、React/Vue 组件、子组件 re-export 文件、公开组件事实源、package exports、目标 tests、Skill navigation props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Data/Charts/Advanced/Composite 组件行为、非 Navigation 子路径、size budget 结构。

**依赖/阻塞**：依赖 R11；若删除 component subpath 或子组件 re-export，必须同步更新 exports 事实源和迁移说明。

**组件范围**：Tabs、Menu、Dropdown、Tree、Pagination、Anchor、Breadcrumb、Steps、Spotlight、FloatButton、BackTop、ScrollSpy、Affix。

**完成验证**：

- `corepack pnpm test:group:navigation`
- `corepack pnpm vitest run tests/core/examples-lazy-routes.spec.ts`
- `corepack pnpm test:a11y`
- `corepack pnpm exports:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Navigation API/subpath 摘要、Skill/examples 更新范围和关键验证命令；同步更新阶段 10 状态。

### R17 Data and table stack

**状态**：未开始。

**目标**：清理 Data 与 table stack，统一 columns/filter/sort/pagination/virtual props，删除重叠阈值和 toolbar alias，收敛固定列与虚拟滚动逻辑。

**允许修改**：Data/table 相关 core types、React/Vue 组件、table helper、目标 tests/e2e、Skill data/advanced props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Navigation/Charts/Advanced editors/Composite business 组件行为、无关 exports。

**依赖/阻塞**：依赖 R11；涉及 `DataTableWithToolbar` 时必须与 R20 的 composite/business 收口保持同一替代 API。

**组件范围**：Table、DataTableWithToolbar、VirtualTable、Calendar、Timeline、Collapse、Countdown。

**完成验证**：

- `corepack pnpm test:group:data`
- `corepack pnpm vitest run tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts`
- `corepack pnpm e2e:smoke`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Data/table API 摘要、固定列/虚拟滚动验证范围、Skill/examples 更新范围和关键验证命令；同步更新阶段 11 状态。

### R18 Charts and visualization stack

**状态**：未开始。

**目标**：拆分巨型 chart type/API，统一 data/series/tooltip/legend/a11y 合约，并确保基础组件不会拉入 charts。

**允许修改**：Charts 相关 core types、React/Vue chart components、chart hooks/helpers、目标 tests/bench smoke、Skill charts props/examples、example 使用、迁移说明、变更记录、API baseline、publish bundle smoke。

**不得修改**：Basic/Form/Feedback/Navigation/Data/Advanced/Composite 非图表行为、无关 package exports。

**依赖/阻塞**：依赖 R11；必须保持 R09 的 Button 子路径不拉入 charts 的隔离目标。

**组件范围**：ChartCanvas、ChartAxis、ChartGrid、ChartLegend、ChartTooltip、AreaChart、BarChart、LineChart、PieChart、DonutChart、RadarChart、ScatterChart、HeatmapChart、SunburstChart、TreeMapChart、FunnelChart、GaugeChart、Gantt、OrgChart。

**完成验证**：

- `corepack pnpm test:group:charts`
- `corepack pnpm publish:check`
- `corepack pnpm size`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 chart API 摘要、bundle 隔离结果、Skill/examples 更新范围和关键验证命令；同步更新阶段 12 状态。

### R19 Advanced editors and media-heavy components

**状态**：未开始。

**目标**：清理 Advanced editors 与 media-heavy components，隔离 heavy runtime，统一 file/image/editor value 与 event 命名，删除旧浏览器兼容分支中的 public API。

**允许修改**：Advanced 相关 core types、React/Vue 组件、editor/media helpers、目标 tests、SSR/browser guard tests、Skill advanced props/examples、example 使用、迁移说明、变更记录、API baseline、必要 bundle smoke。

**不得修改**：Charts/Data/Composite business 组件行为、发布 workflow、无关 package exports。

**依赖/阻塞**：依赖 R11；涉及 image preview/open 命名时必须保持 R06 已统一的 open API。

**组件范围**：CodeEditor、MarkdownEditor、RichTextEditor、FileManager、ImageViewer、ImageAnnotation、ImageCropper、PrintLayout、VirtualList、InfiniteScroll、Signature、NumberKeyboard。

**完成验证**：

- `corepack pnpm test:group:advanced`
- `corepack pnpm vitest run tests/core/browser-only-guards.spec.ts`
- `corepack pnpm example:ssr:check`
- `corepack pnpm publish:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Advanced/media API 摘要、SSR/browser guard 验证范围、Skill/examples 更新范围和关键验证命令；同步更新阶段 13 状态。

### R20 Composite/business components and v2.0 release hardening

**状态**：未开始。

**目标**：清理 Composite/business components，移除 legacy prop passthrough，统一业务对象字段和基础组件新 API 使用，并完成 v2.0.0 发布前迁移与门禁收口。

**允许修改**：Composite 相关 core types、React/Vue 组件、目标 tests、Skill composite props/examples、example 使用、迁移说明、变更记录、API baseline、size budget、release/publish 文档和必要发布门禁。

**不得修改**：R10-R19 已完成 API 的兼容回退、已完成分组测试入口的语义、未说明的新增功能。

**依赖/阻塞**：依赖 R12-R19 全部完成；发布后 `smoke:published` 只能在 v2.0.0 发布到 npm 后执行。

**组件范围**：ActivityFeed、ChatWindow、CommentThread、FormWizard、NotificationCenter、TaskBoard、Kanban、DataTableWithToolbar，以及最终发布收口。

**完成验证**：

- `corepack pnpm test:group:composite`
- `corepack pnpm example:build`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm quality:release`
- `corepack pnpm smoke:published`（发布后执行）
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Composite/business API 摘要、最终 MIGRATION/CHANGELOG/Skill/examples/API baseline/size budget 更新范围和关键验证命令；若发布后 smoke 尚未执行，明确标为发布后待跑；同步更新阶段 14 状态，并将 v2.0.0 路线图标为完成或发布后待验证。

## Public API 与文档规则

- 每个 R12-R20 批次必须列出计划移除的 props/events/methods/type aliases 和唯一替代 API。
- React 与 Vue 同一组件必须收敛到同一语义；命名差异只允许来自框架惯例。
- Skill 文档更新必须覆盖对应 `shared/props/{category}.md`、`examples/{category}.md` 和必要的 `component-index.md`。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 测试优化不是简单删除测试；应合并重复断言、参数化相似场景、保留边界、a11y、SSR 和交互关键覆盖。

## 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --check docs/ROADMAP.md`；R11 审计或完成任务归档改动运行 `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`；涉及 R11 审计或完成任务归档时同时覆盖 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`；涉及 R11 审计或完成任务归档时同时检查 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`，确认没有冲突标记。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
