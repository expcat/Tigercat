# Tigercat v2 Core API 与 Shared Contracts 审计

<!-- LLM-INDEX
type: v2-api-audit
scope: R11 core API and shared contracts audit for R12-R20 execution
verified-date: 2026-06-29
source: current repository state after R13 Feedback/overlay cleanup completion
-->

本文是 R11 的审计输出，只记录 v2.0.0 发布前 R12-R20 批次要执行的 API 删除、合并与命名收敛计划。R11 不删除运行时 API，也不新增兼容层。

## 审计基线

- `api-reports/public-api-baseline.json` 当前覆盖 156 个 `*Props` 接口、2911 个 core exports、148 个 React 公开组件和 148 个 Vue 公开组件。
- `scripts/validate-api.mjs` 当前已守护：公开 API 禁止 `@deprecated`、core type props 禁止 `visible`/`isVisible` 等旧命名、overlay `open` 双端对称、Feedback 示例与 React hook source 不回退到 `visible` / `defaultVisible` / `onVisibleChange`、登记过的受控量 parity、Skill references 覆盖与文档预算。
- `packages/core/src/types/base.ts`、`events.ts`、`generics.ts` 是公共合约收敛事实源；后续批次应优先复用这些 shared contracts，不能在 React/Vue 组件内各自临时发明命名。
- `packages/core/src/types/index.ts` 与 `packages/core/src/utils/index.ts` 仍以宽 barrel 公开大量类型与工具；R12-R20 删除或合并 public exports 时必须同步更新 API baseline、迁移说明和对应分组测试。

## Shared Contract Rules

- v2 破坏性清理不新增 `@deprecated` 过渡层，不保留 compat prop/event/method 分支。
- 每个删除项必须写出唯一替代 API；没有唯一替代 API 的项目必须留在阻塞区，不能在组件批次中临时决定。
- Overlay 可见性统一为 `open` / `defaultOpen` / React `onOpenChange` / Vue `update:open`。公开 API 不再新增 `visible`、`defaultVisible`、`onVisibleChange`。
- 表单值统一为 React `value` / `defaultValue` / `onChange`，Vue `modelValue` / `defaultValue` / `update:modelValue` / `change`。非表单命名受控量统一为 React `on<Prop>Change` 与 Vue `update:<prop>`。
- 组件级 `Size`、`Direction`、`Align` 等纯别名只有在扩展 shared union 时保留；等同于 `ComponentSize`、`BaseLayoutProps` 或 `events.ts` handler 的类型应在所属批次合并。
- 大型类型文件只能按组件组拆分：`chart.ts`、`composite.ts`、`table.ts` 的拆分必须与 R18、R20、R17 分别绑定，不能提前跨组移动。
- React/Vue 运行时行为必须同批收敛；命名差异只允许来自框架惯例，不允许同一语义在两端使用不同受控量名称。

## R12-R20 清单

| Batch                        | Planned removals / merges                                                                                                                                                                                                                                                                                                                   | Replacement API                                                                                                                                                                                    | Evidence                                                                                                                                                                                                                                                                       | Blocking notes                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| R12 Basic + Layout           | 合并等同于 shared union 的轻量组件类型：`SpaceDirection` / `SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize`、`SkeletonShape` 等只保留确有组件专属语义的类型；清理 `Carousel` 的仅初始态命名 `initialSlide`，补受控索引模型；统一 Basic/Layout 组件 class/style 透传策略。                                     | `BaseLayoutProps`、`ComponentSize`，以及 `currentIndex` / `defaultCurrentIndex` / `onCurrentIndexChange` / Vue `update:currentIndex`。                                                             | `packages/core/src/types/base.ts`、`packages/core/src/types/space.ts`、`card.ts`、`statistic.ts`、`descriptions.ts`、`list.ts`、`skeleton.ts`、`carousel.ts`。                                                                                                                 | `ButtonSize`、`AvatarSize`、`TextSize` 等扩展了 `ComponentSize` 或拥有排版语义，R12 执行时只能按实际差异决定是否保留。           |
| R13 Feedback + Overlay       | 删除 React 公开 hook `usePopup` 的旧 `visible` / `defaultVisible` / `onVisibleChange` 合约；清理 overlay 中重复 close/destroy/portal 命名；保留 R05 的 Message/notification imperative sideEffects 隔离。                                                                                                                                   | 使用 `open` / `defaultOpen` / `onOpenChange` / `update:open`；若仍需公开 hook，改为与 `packages/react/src/utils/use-popup.ts` 同语义的 open model。                                                | `packages/react/src/hooks/usePopup.ts`、`packages/react/src/hooks/index.ts`、`packages/react/src/utils/use-popup.ts`、`packages/vue/src/utils/use-floating-popup.ts`、`packages/core/src/types/{modal,drawer,dropdown,popover,popconfirm,tooltip,floating-popup}.ts`。         | Message/notification root 与 container 的拆分是 R05 sideEffects 边界，R13 不得把命令式挂载重新并回普通组件入口。                 |
| R14 Form primitives          | 统一 primitive controlled model，删除重复 `*Size` aliases（如 `CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`）中等同 `ComponentSize` 的部分；收敛单选/勾选语义，避免 `value` 同时表示表单值和 checked 状态；参数化重复 primitive tests。                                                                          | `ComponentSize`；React `checked` / `defaultChecked` / `onChange` 与 Vue `modelValue` / `update:modelValue`；数值控件继续使用 `value` / `defaultValue`。                                            | `packages/core/src/types/{checkbox,radio,switch,slider,segmented,input,input-number,textarea,color-swatch}.ts`、`packages/react/src/hooks/useControlledState.ts`、`packages/vue/src/composables/useFormController.ts`。                                                        | Checkbox 的 `value` 在 group 场景仍有集合值意义，R14 必须拆清 single checkbox checked 与 group option value 后再删除。           |
| R15 Form composite selectors | 合并 Select/TreeSelect/Cascader/AutoComplete/DatePicker/TimePicker 的 value/search/filter/empty/loading/locale 命名；删除重复 `DatePickerSingleValue` / `DatePickerSingleModelValue`、`TimePickerSingleValue` / `TimePickerSingleModelValue` 等成对模型别名；拆分 heavy picker/upload helpers，避免按需导入拉入无关 locale 或上传队列逻辑。 | `DatePickerModelValue`、`TimePickerModelValue`、`SelectModelValue`；搜索统一为 `searchValue` / `defaultSearchValue` / `onSearchChange` / Vue `update:searchValue`；空态文本走 locale/custom text。 | `packages/core/src/types/{select,tree-select,cascader,auto-complete,datepicker,timepicker,upload,form,input-group}.ts`、`packages/core/src/utils/{datepicker-i18n,picker-utils,upload-utils}.ts`。                                                                             | Date/Time picker 的字符串输入格式兼容必须以现有 tests/core `datepicker-i18n` 与 custom-text labels 为准。                        |
| R16 Navigation               | 统一 `activeKey`、`selectedKeys`、`openKeys`、`expandedKeys` 受控命名；清理深路径子组件 re-export 策略，明确子组件是否保留 package subpath；合并 search props 命名。                                                                                                                                                                        | React `onActiveKeyChange` / `onSelectedKeysChange` / `onOpenKeysChange`，Vue `update:*`；子组件导出只通过公开组件事实源生成的 PascalCase subpath。                                                 | `packages/core/src/types/{tabs,menu,tree,collapse,breadcrumb,steps,pagination,anchor,scroll-spy,float-button}.ts`、`scripts/lib/public-components.mjs`、`scripts/sync-package-exports.mjs`。                                                                                   | 删除子组件 subpath 会影响 package exports，R16 必须同步 `exports:sync` / `exports:check` 和迁移说明。                            |
| R17 Data + Table             | 合并 Table 与 VirtualTable 的 `dataSource` / `data`、`rowSelection.selectedRowKeys` / `selectedKeys`、`virtualThreshold` / `autoVirtualThreshold`；收敛 fixed-column、hidden-column、filter/sort/pagination 与 toolbar alias；删除 `GenericTable*` 中与 `Table*` 重复的公共类型。                                                           | `TableProps<T>` / `TableColumn<T>` / `RowSelectionConfig<T>` / `ExpandableConfig<T>`；虚拟滚动统一走 `virtual` + `virtualItemHeight` + `virtualThreshold`；固定列走 shared table utils。           | `packages/core/src/types/{table,virtual-table,generics,composite}.ts`、`packages/core/src/utils/{table-utils,virtual-table-utils,table-filter-utils,table-resize-utils}.ts`。                                                                                                  | `DataTableWithToolbar` 同属 R20 composite 收口，R17 只处理 table stack 基础合约，toolbar 业务外壳在 R20 最终删除 alias。         |
| R18 Charts + Visualization   | 拆分 `chart.ts` 巨型类型文件；删除 chart datum/series 重复 aliases；统一 tooltip 可见性，避免公开 `visible` 与 core `showTooltip` 并存；确保基础组件导入不拉入 charts。                                                                                                                                                                     | `ChartSeriesPoint` / `ChartInteractionProps` / `ChartTooltipProps`；standalone `ChartTooltip` 使用 `open`，chart components 使用 `showTooltip` 控制内置 tooltip。                                  | `packages/core/src/types/chart.ts`、`packages/react/src/components/ChartTooltip.tsx`、`packages/vue/src/components/ChartTooltip.ts`、`packages/core/src/utils/chart*`。                                                                                                        | Chart datum 类型承载不同图表数据结构，R18 拆分时必须保留每个图表的 typed data surface，不能只用 `Record<string, unknown>` 替代。 |
| R19 Advanced editors + Media | 统一 file/image/editor value 与 open/currentIndex 命名；删除 `NumberKeyboard` 的 `modelValue` core prop；合并 `ImagePreviewProps` 与 `ImageViewerProps` 的重复 viewer 合约；隔离 rich text / markdown / code heavy runtime。                                                                                                                | React `value` / `defaultValue` / `onChange`，Vue `modelValue` / `update:modelValue`；preview/viewer 使用 `open` / `currentIndex` / `onCurrentIndexChange` / `update:currentIndex`。                | `packages/core/src/types/{code-editor,markdown-editor,rich-text-editor,file-manager,image,image-viewer,image-annotation,virtual-list,infinite-scroll,signature,number-keyboard}.ts`、`packages/core/src/utils/{rich-text-engine,image-viewer-utils,virtual-list-utils}.ts`。   | `ImagePreview` 与 `ImageViewer` 当前可能代表不同 public surfaces，R19 必须先确认 examples 与 Skill docs 是否仍需要两者并存。     |
| R20 Composite + Business     | 拆分 `composite.ts` 巨型类型文件；删除 `Kanban*` 对 `TaskBoard*` 的 public type aliases 或明确 Kanban 为薄 wrapper；收敛 `TableToolbarProps` 与 `DataTableWithToolbarProps` 的重复 search/filter/bulk/pagination alias；统一业务对象字段和 base component 新 API。                                                                          | `TaskBoard*` 作为唯一拖拽看板数据模型；`DataTableWithToolbar` 只保留 `toolbar` 配置与 Table 直传 API，业务回调从 toolbar context 发出。                                                            | `packages/core/src/types/composite.ts`、`packages/core/src/types/kanban.ts`、`packages/react/src/components/DataTableWithToolbar.tsx`、`packages/vue/src/components/DataTableWithToolbar.ts`、`packages/core/src/utils/{task-board-utils,kanban-utils,form-wizard-utils}.ts`。 | R20 依赖 R12-R19 完成后的最终 public API 形状；发布后 `smoke:published` 仍是发布后验证项。                                       |

## Blocking / Needs Evidence

- 暂无外部阻塞项。
- R12 的视觉尺寸别名、R18 的 chart datum 类型和 R19 的 ImagePreview/ImageViewer 双 surface 需要在各自批次用 examples 与 generated references 再确认后删除；这些不是 R11 阻塞，只是批次内必须完成的证据点。

## Completed Batch Records

### R12 Basic + Layout lightweight components（2026-06-29）

- 实际删除 / 合并：移除 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize` public type aliases；`SpaceProps` 复用 `BaseLayoutProps`，`CardProps.direction` 复用 `BaseLayoutProps['direction']`，`StatisticProps.size` / `DescriptionsProps.size` / `ListProps.size` 复用 `ComponentSize`。
- 实际保留：`ButtonSize`、`AvatarSize`、`TextSize` 保留，因为它们扩展或偏离 `ComponentSize`；`SkeletonShape` 保留，因为当前没有共享 shape contract。
- Carousel 变更：删除 `initialSlide`，新增 `currentIndex` / `defaultCurrentIndex`；React 新增 `onCurrentIndexChange`，Vue 新增 `update:currentIndex`，并保持 `onChange` / `change` 与 `onBeforeChange` / `before-change`。
- 证据：core type files、React/Vue Carousel tests、example Carousel demos、generated API baseline 和 generated Skill references 均已更新。
- 实际验证：`npx -y pnpm@11.9.0 vitest run tests/react/Carousel.spec.tsx tests/vue/Carousel.spec.ts`、`npx -y pnpm@11.9.0 api:validate`、`npx -y pnpm@11.9.0 types:check`、R12 分组与生成物门禁见 `docs/V2_COMPLETED.md#r12-basic--layout-lightweight-components`。
- 剩余阻塞：无；下一批次为 R13 Feedback and overlay components。

### R13 Feedback + Overlay（2026-06-29）

- 实际删除 / 合并：删除 React source hook `packages/react/src/hooks/usePopup.ts` 及 `packages/react/src/hooks/index.ts` re-export，旧 `visible` / `defaultVisible` / `onVisibleChange` hook 合约不再作为 public source surface 保留；删除 Vue Modal/Drawer 的 `disableTeleport` 测试逃生口。
- Drawer 变更：`destroyOnCloseAfterLeave` 改为 `deferDestroyOnClose`；React `onAfterLeave` 改为 `onAfterClose`；Vue `after-leave` 改为 `after-close`。
- Modal 变更：新增 React `onAfterClose` 与 Vue `after-close`；外部 `open=false` 只触发关闭后生命周期，不触发 React `onClose` 或 Vue `close` close-intent 事件；用户确认、取消、遮罩、关闭按钮和 Escape 仍触发对应 intent。
- Popup 行为：Tooltip、Popover、Popconfirm 继续使用双端 shared open popup utilities；Popconfirm confirm/cancel 关闭后恢复触发器焦点；Message/notification imperative root 与 pure container 的 R05 sideEffects 边界保持不变。
- 唯一替代 API：overlay 可见性使用 React `open` / `defaultOpen` / `onOpenChange`，Vue `open` / `defaultOpen` / `update:open` / `open-change`；Drawer 延迟销毁使用 `deferDestroyOnClose`；关闭后生命周期使用 React `onAfterClose` 或 Vue `after-close`；Vue Modal/Drawer 测试应查询 `document.body` 中的 teleport 内容。
- 证据：core Drawer types、React/Vue Modal/Drawer/Popconfirm components、React/Vue popup utilities、Feedback example demos、targeted Feedback tests、`api-reports/public-api-baseline.json`、generated Skill references 和 `scripts/validate-api.mjs` 已同步更新。
- 实际验证：`npx -y pnpm@11.9.0 test:group:feedback`、`npx -y pnpm@11.9.0 vitest run tests/core/imperative-side-effects.spec.ts`、`npx -y pnpm@11.9.0 e2e:smoke`、`npx -y pnpm@11.9.0 example:ssr:check`、`npx -y pnpm@11.9.0 api:validate`、`npx -y pnpm@11.9.0 types:check`、`npx -y pnpm@11.9.0 api:baseline && npx -y pnpm@11.9.0 api:baseline:check`、`npx -y pnpm@11.9.0 docs:api && npx -y pnpm@11.9.0 docs:api:check`、`npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`、`git diff --check`。
- 剩余阻塞：无；下一批次为 R14 Form primitives。

完成任一涉及 public API 或 shared contract 清理的 R12-R20 任务后，必须在本节追加对应 `### Rxx ...（YYYY-MM-DD）` 记录，并包含：

- 实际删除、合并或保留的 props、events、methods、type aliases 与 helper exports。
- 每个删除项的唯一替代 API；没有替代 API 的项必须说明为何直接删除。
- 证据来源，包括源码文件、generated references、examples、API baseline 或测试覆盖。
- 实际运行的验证命令；若命令与 `docs/ROADMAP.md` 计划不同，必须说明原因。
- 剩余阻塞或后续批次依赖；无剩余阻塞时写明 `无`。

## Execution Rules For Component Batches

- 每个批次开始前先读取本文件对应行、`docs/ROADMAP.md` 对应 Rxx 条目、`api-reports/public-api-baseline.json` 和对应 `skills/tigercat/references/shared/props/*.md`。
- 删除 public API 后必须更新 `docs/MIGRATION.md`、`CHANGELOG.md`、API baseline、generated Skill references、examples 和对应分组测试。
- 完成批次后必须回写 `Completed Batch Records`；若该批次经审计没有实际 public API/shared contract 变更，也必须在对应任务归档中说明无需新增审计记录。
- 若新增受控量或发现新的跨端 parity 规则，优先扩展 `scripts/validate-api.mjs` 的显式 parity 表；不要用宽泛正则制造大量误报。
- 生成物只能通过事实源或生成脚本更新；不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 掩盖漂移。
