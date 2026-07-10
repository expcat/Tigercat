# Changelog

本文档记录 Tigercat UI 组件库的所有版本变更。

## v2.0.0-rc.2

v2.0.0 rc.2 验证 rc.1 之后的 MCP package 与 LLM reference routing 更新，并同步当前依赖目录。

### Features

- **Tigercat MCP package**：新增 `@expcat/tigercat-mcp` 本地 MCP 服务，用于将 LLM 查询路由到 Tigercat skill references，并提供组件元数据、组件分类、参考文档路径和诊断信息。
- **组件元数据与诊断增强**：扩展 public component facts / Context7 生成内容，MCP 查询可返回更完整的组件匹配、建议 reference 和缺失配置诊断。

### Fixed

- **响应式图表与 VirtualTable**：React/Vue Bar、Line、Area、Scatter 的响应式外层不再保留固有宽度；VirtualTable 兑现既有 `TableColumn.render` / `renderHeader` 契约，并保持 React `renderCell` 优先级。
- **React Table 测量稳定性**：普通表格不再安装无用的 ResizeObserver；只在固定列、可锁列或虚拟表真正需要几何数据时观察，减少多 Table 页面冷启动时的并发状态更新。
- **Upload 与裁剪资源生命周期**：本地文件预览 URL 在替换、移除和卸载时正确撤销；CropUpload/ImageCropper 只在图像与容器尺寸为正且有限时计算裁剪几何。
- **复合组件视觉一致性**：ActivityFeed、NotificationCenter 与 CommentThread 的共享视觉 recipe 收敛为包内实现，React/Vue 使用相同 token 与 reduced-motion 规则，不增加 public API。
- **Example 体验收口**：React/Vue 示例补齐关键操作状态、移动端说明和窄屏布局，避免演示操作无可见反馈。

### Quality and release preparation

- 本地测试入口去重并清理重复断言；当前 canonical suite 为 383 files / 6,840 tests，public API baseline、generated Skill references 与 package exports 保持零漂移。
- 删除跨系统不稳定的 Playwright 图片对比 spec 和全部 PNG 基线；保留 Chromium、Firefox、WebKit 与移动 Chromium 的功能 E2E。
- 删除 CI、E2E、benchmark 与 security audit 的 Actions workflow；发布前验证统一在本地完成，Actions 只保留 tag、npm publish 与 Pages 部署流程。
- `docs/` 收敛为当前 `ROADMAP.md` 与用户需要的 `MIGRATION.md`；完成日志、临时 Example backlog 与重复 API 审计文档不再长期维护。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli`、`@expcat/tigercat-mcp` 统一为 `2.0.0-rc.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 更新 workspace catalog / lockfile 中的依赖版本，并将 MCP 包纳入 release readiness 的 fixed-version 检查。
- `React Table subpath` size 预算 40 kB → 41 kB，以覆盖 rc.1 后依赖 / 构建面更新后的稳定 gzip 体积（实测 40.52 kB）。
- `publish:check` 的 clean npm install 不再使用 `--prefer-offline`，避免本机旧 npm metadata 将当前 registry 已存在的 catalog 版本误判为 ETARGET。
- 本次 rc 无新增破坏性变更；迁移路径沿用当前 v2.0.0 条目。

## v2.0.0-rc.1

v2.0.0 rc.1 冻结当前 v2.0.0 发布面，收敛 Pagination 样式与页容量变更事件语义，并记录候选版本相对 preview.6 的 core helper 清理。

### Breaking Changes

- **移除 simple pagination 样式 helpers**：core 根入口不再导出 `getSimplePaginationContainerClasses`、`getSimplePaginationTotalClasses`、`getSimplePaginationControlsClasses`、`getSimplePaginationSelectClasses`、`getSimplePaginationButtonClasses`、`getSimplePaginationPageIndicatorClasses` 与 `getSimplePaginationButtonsWrapperClasses`。Table/List 内置分页已统一复用 Pagination；自定义分页应直接使用 React/Vue `Pagination`，或改用仍公开的通用 pagination 样式 helpers。

### Fixed

- **Pagination 激活态样式**：页码按钮激活态统一由 core 样式 helper 生成，React / Vue 不再各自拼接重复状态类。
- **Pagination 页容量事件**：变更 `pageSize` 时只触发 React `onPageSizeChange` / Vue `page-size-change`，并携带调整后的页码；即使当前页因总页数减少而被收敛，也不再额外触发页面导航 `onChange` / `change`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-rc.1`，并同步运行时版本、CLI 与示例首页元数据。
- 迁移和破坏性变更已同步到 `docs/MIGRATION.md`；RC 阶段不再引入未明确记录的 breaking public API。

## v2.0.0-preview.6

v2.0.0 preview 6 延续 v2.0.0 预览发布面，新增 DataExport 数据导出组件，并增强 Table / List 分页交互。

### Features

- **DataExport 数据导出组件**：Vue / React 新增 `DataExport` 组件（Data 分类，子路径 `@expcat/tigercat-react/DataExport` / `@expcat/tigercat-vue/DataExport`），支持将表格数据导出为 XLSX 或 Markdown。`columns` 复用 `TableColumn`，Table / DataTableWithToolbar 的列配置可直接透传；`formats` 单一格式渲染普通按钮、多格式渲染下拉菜单（默认 `['xlsx', 'markdown']`），另支持 `fileName`、`sheetName`、`cellFormatter`、`disabled`。序列化实现位于 core 新增子路径 `@expcat/tigercat-core/utils/data-export`，组件按需 lazy import，不使用导出功能时不进入 bundle。导出按钮文案随 locale（zh-CN / en-US）同步新增。
- **Table / List 分页增强**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `simple?: boolean`（强制简洁模式：上一页/下一页 + 页码指示，默认 ≤3 页自动简洁、>3 页显示页码按钮）与 `showQuickJumper?: boolean`（快速跳页输入框，默认 >3 页自动出现）；`pageIndicatorText?: (current, totalPages) => string` 可自定义简洁模式页码指示文案（缺省 `{current} / {totalPages}`）。同时改进分页可访问性。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.6`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 公开组件数 148 → 149（新增 DataExport），README 与示例首页统计同步更新。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.5

v2.0.0 preview 5 延续 v2.0.0 预览发布面，新增 Table / List 远程（服务端）分页模式。

### Features

- **Table / List 远程分页 `pagination.remote`**：`PaginationConfig` 与 `ListPaginationConfig` 新增 `remote?: boolean`（默认 `false`，完全向后兼容）。`remote: true` 语义：`dataSource` 即当前页数据，组件跳过内部切片原样渲染，总页数与 `showTotal` 范围文案全部由 `pagination.total` 计算；`current` / `pageSize` 仍为受控属性，`page-change` / `page-size-change` 事件行为不变，业务侧收到事件后按新页码重新请求。Vue / React 两端 Table 与 List 同步支持；`DataTableWithToolbar` 原样透传 `pagination`，无需额外配置。注意：remote 模式下组件内置排序/筛选仅作用于当前页数据，排序/筛选应由服务端完成。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.5`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.4

v2.0.0 preview 4 延续 v2.0.0 预览发布面，合入 Icon 组件 `icon` 属性与可 tree-shake 的扩展图标集。

### Features

- **Icon `icon` 属性**：Vue / React `Icon` 组件新增 `icon` 属性，接受 `IconDefinition`（viewBox + path 数据 + stroke/fill 模式），可将自定义图标（如品牌 logo）定义为常量复用，无需全局注册。优先级：自定义 SVG children > `icon` > `name`。
- **core 扩展图标集**：新增约 60 个 Heroicons outline 风格扩展图标（排序、视图、操作、通信媒体、状态反馈、商务、数据技术、场景等），以独立 `IconDefinition` 常量从 `@expcat/tigercat-core` 导出（如 `rocketIcon`、`sortAscendingIcon`），配合 `icon` 属性使用。常量带 `/*#__PURE__*/` 标注且包声明 `sideEffects: false`，未使用的图标可被 bundler tree-shake，不进入组件包体积；`iconRegistry` / `IconName` 保持原集合不变。`extendedIcons`（`Record<ExtendedIconName, IconDefinition>`）提供全量集合用于图标画廊等场景。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.4`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- `Core (full)` size 预算 118 kB → 125 kB（core 全量入口包含全部扩展图标定义；组件子路径与按需引入体积不受影响，仍由原有预算约束）。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.3

v2.0.0 preview 3 延续 v2.0.0 预览发布面，在 preview.2 之后合入 DatePicker locale 文案回退修复，以及 release 门禁维护更新。

### Bug Fixes

- **core DatePicker i18n**：`getDatePickerLabelsFromLocale(locale, overrides)` 现以 en-US 文案为基线合并，locale preset 缺失的键回退到 en-US，而非产生 `undefined`。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.3`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 移除 `FormItemContext` 未使用的 React 默认导入以通过 lint 门禁；将 `Core locale (zh-CN)` size 预算从 3 kB 提升至 4 kB 以容纳持续扩充的 i18n 文案。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.2

v2.0.0 preview 2 延续 v2.0.0 预览发布面，用于验证 preview.1 之后已合入的示例、测试和文档收口提交。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.2`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0-preview.1

v2.0.0 preview 1 对齐 v2.0.0 破坏性升级当前发布面，用于预览验证已完成的版本号、运行时 version 导出、ESM-only package surface、显式 component exports、tree-shaking 护栏、API 删除与文档 / 示例迁移收口。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一为 `2.0.0-preview.1`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- 迁移和破坏性变更内容沿用当前 v2.0.0 预览阶段条目；正式 v2.0.0 发布前继续在 `docs/MIGRATION.md` 与本文件集中更新。

## v2.0.0

本版本开启 v2.0.0 破坏性升级阶段，首批变更先稳定版本号、运行时 version 导出、CLI 模板版本和 release readiness 文档入口，并完成 ESM-only 发布面、显式 component exports、React / Vue tree-shaking 副作用收敛、首批 compat API 删除、legacy token / icon path 兼容层清理、按需加载文档迁移、size / publish artifact gate 收口、Basic / Layout 轻量组件 API 清理、Feedback / overlay open、portal、focus 与 close lifecycle 收敛，Form primitives 和 composite selectors 的受控模型、搜索、空态和尺寸类型收敛，Navigation 组件受控回调与子组件 subpath 产物收敛，Data/table stack 数据、选择与虚拟滚动入口统一，Charts/visualization 类型拆分与 tooltip 命名收敛，以及 Advanced/media viewer 与 editor runtime guard 收敛。

### Breaking Changes

- **core**：移除已废弃的 `getResultHttpLabel(status)`。请改用 `isHttpResultStatus(status) ? status : undefined`。
- **React ImageGroup**：移除旧回调 `onPreviewVisibleChange`，统一为 `onPreviewOpenChange(open)`。
- **Vue ImageGroup**：移除旧事件 `preview-visible-change`，统一为 `preview-open-change`。
- **design tokens**：`@expcat/tigercat-core/tokens.css` 不再生成旧 `--tiger-color-*`、`--tiger-space-*`、`--tiger-button-*` 和 pre-0.5.0 `--tiger-primary` 等兼容变量；请改用 `--tiger-primitive-*`、`--tiger-semantic-*` 或 `--tiger-component-*` 三层 token。
- **core token exports**：移除 `globalColors` / `globalSpace` / `globalRadius` / `globalShadow` / `globalFont` / `globalDuration` / `globalEasing`、`aliasTokens` 及对应 `Global*` 类型别名；请改用 `primitive*` 和 `semanticTokens`。
- **core icon path aliases**：移除 DatePicker / TimePicker 旧 icon path 别名 `CalendarIconPath`、`CloseIconPath`、`ChevronLeftIconPath`、`ChevronRightIconPath`、`ClockIconPath`、`TimePickerCloseIconPath`，并删除 `common-icons` 兼容 barrel；请改用 `calendarSolidIcon20PathD`、`closeSolidIcon20PathD`、`chevron*SolidIcon20PathD`、`clockSolidIcon20PathD` 或分组 icon 子路径。
- **core DatePicker i18n helper**：`getDatePickerLabels(string)` 不再默认查找 13 个内置 DatePicker locale，以避免默认 bundle 拉入全量语言表；按运行时字符串解析内置 DatePicker 文案请改用 `@expcat/tigercat-core/datepicker-locales/registry` 的 `getDatePickerLabelsFromLocale(locale)`。
- **core `defineText`**：`defineText(...)` 不再作为 `defineLocale(...)` 的别名补齐 en-US 基线，而是返回纯自定义文本 overlay；需要完整 en-US 基线时请改用 `defineLocale(...)`，需要 DatePicker 翻译时请显式传入对应 DatePicker preset。
- **core Basic / Layout type aliases**：移除等同 shared contracts 的 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize`；请分别改用 `BaseLayoutProps['direction']`、`BaseLayoutProps['align']` 或 `ComponentSize`。
- **Carousel**：移除仅初始化语义的 `initialSlide`，统一为受控索引模型；React 使用 `currentIndex` / `defaultCurrentIndex` / `onCurrentIndexChange`，Vue 使用 `currentIndex` / `defaultCurrentIndex` / `update:currentIndex`。
- **React hooks**：移除旧 source hook `usePopup` 及其 hooks barrel re-export；它只暴露 `visible` / `defaultVisible` / `onVisibleChange` 合约。Tooltip、Popover、Popconfirm 等 overlay 请直接使用组件级 `open` / `defaultOpen` / `onOpenChange`。
- **Drawer close lifecycle**：`destroyOnCloseAfterLeave` 重命名为 `deferDestroyOnClose`；React `onAfterLeave` 重命名为 `onAfterClose`；Vue `after-leave` 重命名为 `after-close`。
- **Modal close lifecycle**：React Modal 新增 `onAfterClose`，Vue Modal 新增 `after-close`；外部 `open=false` 不再触发 close intent（React `onClose` / Vue `close`），用户取消、确认、遮罩、关闭按钮和 Escape 仍触发对应 intent。
- **Vue Modal / Drawer teleport**：移除测试逃生口 `disableTeleport`，Modal 和 Drawer 始终 teleport 到 `document.body`；测试或样式选择器应查询 body 中的 overlay DOM。
- **core Form primitive size aliases**：移除等同 shared contract 的 `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize`；请统一改用 `ComponentSize`。
- **Vue Form primitives controlled model**：Checkbox、Radio、Switch 单体受控状态统一为默认 `v-model`（`modelValue` / `update:modelValue`）与 `default-value`；RadioGroup 也从 `v-model:value` 切换为默认 `v-model`。React Checkbox、Radio、Switch 继续使用 `checked` / `defaultChecked` / `onChange`。
- **core Form composite size aliases**：移除等同 shared contract 的 `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize`；请统一改用 `ComponentSize`。
- **DatePicker / TimePicker model aliases**：移除重复的 `DatePickerSingleModelValue`、`DatePickerRangeModelValue`、`DatePickerSingleValue`、`DatePickerRangeValue`、`TimePickerSingleValue`、`TimePickerRangeValue`；请分别使用 `DatePickerModelValue` 与 `TimePickerModelValue`。
- **Form composite search API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的搜索受控量统一为 `searchValue` / `defaultSearchValue`；React 回调统一为 `onSearchChange`，Vue 统一为 `update:searchValue` / `search-change`。TreeSelect、Cascader、Transfer 的旧 `showSearch` 改为 `searchable`。
- **Form composite empty text API**：Select、TreeSelect、Cascader、AutoComplete、Transfer 的组件级空态文案统一为 `emptyText`；旧 `notFoundText`、`noOptionsText`、`noDataText` 不再保留，未显式传入时继续从 locale / custom text 解析默认空态。
- **Upload queue helper split**：上传队列、分片与断点续传 helper 拆入 `upload-queue-utils`，普通选择、拖拽与样式 helper 继续保留在 `upload-utils`；根入口仍导出对应工具，但直接导入时应选择更小的 helper 模块。
- **React Navigation controlled callbacks**：Tabs / ScrollSpy 的受控 active key 回调从 `onChange` 改为 `onActiveKeyChange`；Menu 搜索回调从 `onSearch` 改为 `onSearchChange`；Menu / Tree 的受控 key 变化分别使用 `onSelectedKeysChange`、`onOpenKeysChange`、`onExpandedKeysChange`、`onCheckedKeysChange`。`onSelect` / `onOpenChange` / `onExpand` / `onCheck` 仍作为携带交互上下文的事件回调。
- **Navigation 子组件 subpath 产物收敛**：`AnchorLink`、`BreadcrumbItem`、`DropdownItem`、`DropdownMenu`、`MenuItem`、`MenuItemGroup`、`StepsItem`、`SubMenu`、`TabPane` 的 PascalCase package subpath 保持可用，但发布 exports 现在指向父组件产物（如 `./MenuItem` → `Menu`），源码层不再保留独立子组件 shim 文件。
- **VirtualTable 数据与选择 API**：VirtualTable 删除 `data`、`rowHeight`、`height`、`selectable`、`selectedKeys`、`onSelect` 公共入口；请改用 `dataSource`、`virtualItemHeight`、`virtualHeight`、`rowSelection`，React 使用 `onSelectionChange`，Vue 使用 `selection-change` / `update:rowSelection`。
- **Table 虚拟化阈值 API**：Table / DataTableWithToolbar 删除 `autoVirtualThreshold`；自动虚拟化启用和推荐态统一由 `virtualThreshold` 控制，`virtual=true` 仍强制启用。
- **core table 泛型类型**：移除重复的 `GenericTableColumn`、`GenericRowSelection`、`GenericExpandable`、`GenericTableProps`；请改用 `TableColumn<T>`、`RowSelectionConfig<T>`、`ExpandableConfig<T>`、`TableProps<T>`。
- **Kanban 数据模型类型别名**：移除 `KanbanCard`、`KanbanColumn`、`KanbanCardMoveEvent`、`KanbanColumnMoveEvent` 公共别名；Kanban 复用 TaskBoard 数据模型，请直接使用 `TaskBoardCard`、`TaskBoardColumn`、`TaskBoardCardMoveEvent`、`TaskBoardColumnMoveEvent`。`KanbanProps` 与 `KanbanSwimlane` 保留。
- **DataTableWithToolbar 业务回调收敛**：移除组件顶层 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`，业务回调统一从 `toolbar` 配置发出——React 使用 `toolbar.onSearchChange` / `toolbar.onSearch` / `toolbar.onFiltersChange` / `toolbar.onBulkAction`，Vue 继续使用 `@search-change` / `@search` / `@filters-change` / `@bulk-action` 事件。`onPageChange` / `onPageSizeChange` / `onSelectionChange` 等分页与表格回调仍为组件顶层 API。
- **Charts 类型拆分与重复别名删除**：`chart.ts` 拆分为 `chart-core`、`chart-cartesian`、`chart-radial`、`chart-visualization` 分组类型，根入口仍继续导出所有 chart 类型；删除重复的 `AreaChartDatum` 与 `DonutChartDatum`，请分别改用 `LineChartDatum` 与 `PieChartDatum`。
- **ChartTooltip 可见性命名**：独立 `ChartTooltip` 的可见性 prop 从 `visible` 改为 `open`；高阶图表组件继续使用 `showTooltip` 控制内置 tooltip。
- **core NumberKeyboard 受控值命名**：`NumberKeyboardProps` 删除 Vue 专属的 `modelValue` core prop，跨框架 shared contract 统一为 `value` / `defaultValue`。React 继续使用 `value` / `defaultValue` / `onChange`；Vue 组件仍保留本地 `modelValue` / `update:modelValue` 作为默认 `v-model` 入口。
- **ImagePreview / ImageViewer viewer 合约收敛**：core 新增 `ImageViewerBaseProps` 作为 `locale`、`images`、`open`、`currentIndex`、`maskClosable` 的共享 viewer contract；`ImagePreviewProps` 与 `ImageViewerProps` 继续作为两个 public surface 保留，不重新引入 `visible`、`defaultIndex` 或 `onIndexChange`。

### Added

- **Viewport positioning contracts**：BackTop 新增 `position` / `placement` / `offset`，FloatButton 新增 `floating` / `placement` / `offset`，并公开 `BackTopPosition`、`ViewportPlacement`、`ViewportOffset`、`getViewportOffsetStyle` 与相关 viewport/floating class helpers，用于统一 fixed/sticky 视口定位。
- **Notification actions**：通知命令式 API 支持内联 actions；core 新增 `NotificationAction` / `NotificationActionContext` 与 action button class helpers，action 点击可通过 `closeOnClick` 或 callback context 的 `close()` 关闭对应 toast。
- **Select labels and locale helpers**：Select 新增 `labels` / `locale` 支持，core 新增 `TigerLocaleSelect`、`DEFAULT_SELECT_LABELS`、`ZH_CN_SELECT_LABELS` 与 `getSelectLabels`，空态和选择完成按钮文案可继续从组件 locale / ConfigProvider locale 回退。
- **Picker and selector helper contracts**：core 新增 `DATEPICKER_LOCALES`、`getDatePickerLocalePreset`、`getDatePickerLabelsFromLocale` 与 `CascaderSearchConfig`，运行时字符串查找 DatePicker locale 需显式走 registry，Cascader 搜索配置使用具名 public contract。
- **ImagePreview touch gestures**：ImagePreview 新增 `touchSwipeable` 与 `touchSwipeThreshold`，用于移动端滑动切换预览图片。

### Infrastructure

- root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 统一规划为 `2.0.0`。
- 同步 core / React / Vue 运行时 `version` 导出、CLI `CLI_VERSION`、CLI 模板中的 Tigercat 依赖范围，以及示例首页展示版本。
- `scripts/sync-version.mjs` 不再写入旧版 Roadmap 发布表格字段，避免当前 Rxx 路线图结构下的版本同步脚本在最后一步失败。
- core / React / Vue 构建统一为 ESM-only，不再生成 CJS 产物；core package exports 移除 `require` 条件和 `.cjs` 目标。
- 发布体积随之约减半（相比 v1.5.0，gzip 压缩包与解包体积、文件数均下降约 50%）：

  | 包                       | v1.5.0（gzip / 解包 / 文件） | v2.0.0（gzip / 解包 / 文件） |
  | ------------------------ | ---------------------------- | ---------------------------- |
  | `@expcat/tigercat-core`  | 766 kB / 3.61 MB / 155       | 380 kB / 1.84 MB / 83        |
  | `@expcat/tigercat-react` | 503 kB / 2.44 MB / 869       | 259 kB / 1.22 MB / 440       |
  | `@expcat/tigercat-vue`   | 622 kB / 3.76 MB / 863       | 316 kB / 1.89 MB / 436       |
  | `@expcat/tigercat-cli`   | 16 kB / 60 kB / 5            | 15 kB / 60 kB / 5            |

- React / Vue package exports 移除 `./*` 通配入口，改为由 `scripts/lib/public-components.mjs` 事实源生成的 148 个 PascalCase 显式组件子路径；`exports:check` 与 `release:check` 会阻止清单漂移。
- React / Vue package `sideEffects` 收敛为 `false`，不再用 `dist/chunk-*` 或 `dist/components/*` 全量副作用兜底；`MessageContainer` 与 `NotificationContainer` 拆为独立纯容器入口，命令式 `Message` / `notification` 单例挂载逻辑保留在对应 imperative 入口中。
- `api:validate` 会直接阻止 core / React / Vue 公开源码重新引入 `@deprecated`，v2 不再新增过渡废弃层。
- `api:validate` 会阻止 Feedback 示例与 React hook source 重新引入 overlay `visible` / `defaultVisible` / `onVisibleChange` 用法，Feedback 当前示例统一使用 `open` 命名。
- `api:validate` 会阻止 Vue Checkbox / Radio / Switch 及对应 Vue examples 回退到旧 `checked` / `defaultChecked` / `update:checked` / `v-model:checked` 受控模型。
- `api:validate` 会阻止 Form composite selectors 回退到已删除的尺寸别名、DatePicker / TimePicker 旧模型别名、旧搜索 props/events 或重复空态命名。
- `api:validate` 会阻止 Navigation 子组件 subpath 重新指向独立 shim、React Tabs / ScrollSpy 回退到 `onChange`，或 React Menu 回退到旧 `onSearch`。
- `api:validate` 会阻止 Data/Table stack 回退到 VirtualTable 旧数据/选择 props、Table `autoVirtualThreshold` 或重复 `GenericTable*` public interfaces。
- `api:validate` 会阻止 Kanban 重新导出 `KanbanCard` / `KanbanColumn` / `KanbanCardMoveEvent` / `KanbanColumnMoveEvent` 别名，以及 DataTableWithToolbar 重新引入顶层 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction` 业务回调。
- core composite 巨型类型文件 `composite.ts` 按组件拆分为 `chat.ts`、`activity-feed.ts`、`comment-thread.ts`、`notification-center.ts`、`table-toolbar.ts`、`form-wizard.ts`、`task-board.ts`，`composite.ts` 改为薄 barrel；公共类型导出经 `@expcat/tigercat-core` 根入口保持不变。
- `api:validate` 会阻止 Charts 回退到重复 datum aliases 或独立 `ChartTooltip visible` prop；generated chart references 由拆分后的类型文件重新生成。
- `api:validate` 会阻止 Advanced/media 回退到 core `NumberKeyboardProps.modelValue`、viewer `visible` / `defaultIndex` / `onIndexChange` / `update:index` 旧命名；`browser-only-guards` 覆盖 RichTextEditor 内置 engine 在 Node/SSR 下对 `document.execCommand` / `window.prompt` 的 no-op 行为。
- `tokens:build` / `tokens:check` 的生成面收敛为 canonical token 输出，移除 legacy CSS 变量和 token alias API 生成。
- `release:check` 和 `publish:check` 增加 ESM-only 断言，发布 smoke 使用临时安装目录中的 bare ESM import 验证包入口，并阻止 `.cjs` 文件混入 tarball 或安装产物。
- `release:check` 会阻止 React / Vue 恢复宽泛 sideEffects 声明；`publish:check` 会对安装后的 React / Vue root Button named import 和 Button 子路径 import 做 bundler smoke，确保普通 Button bundle 不拉入 Message / notification 命令式挂载代码。
- `publish:check` 的 Button 子路径 smoke 增加 charts、editors 和全量 locale barrel 隔离断言，并将 React / Vue Button 子路径 bundle 上限固定为 6 kB / 8 kB；`quality:release` 现在包含 `publish:check`，发布 workflow 在现有触发面内改为执行完整 release gate。
- i18n 默认路径更利于裁剪：`defineText` 不再导入内置 locale，DatePicker 默认 helper 不再导入全量 DatePicker locale；新增 `@expcat/tigercat-core/datepicker-locales/registry` 作为显式 opt-in 的运行时字符串查表入口，`publish:check` 会防止默认 DatePicker 子路径和 `defineText` bundle 回退到全量 locale。

## v1.5.0

本版本汇总 v1.4.0 记录之后截至 2026-06-28 的主分支变更，重点标出升级后使用者需要留意的属性、行为与迁移点。

### Upgrade Notes

- **开发/发布环境要求提高**：根工程 `packageManager` 更新为 `pnpm@11.9.0`，`engines` 更新为 Node `>=22.13.0`、pnpm `>=11.9.0`。本地开发、示例构建和发布检查请先升级工具链。
- **Result 工具函数迁移建议**：`getResultHttpLabel(status)` 标记为弃用；新代码请改用 `isHttpResultStatus(status)` 判断 HTTP 状态，再按需直接使用原始 `status`。旧函数仍保留，现有导入不会立即失效。
- **Message 类型导出修正**：React `MessageProps` / Vue `VueMessageProps` 现在表示命令式 Message API 接受的 `MessageOptions`；容器组件 props 保持为单独的 `MessageContainerProps` / `VueMessageContainerProps`。如果业务侧曾把容器 props 当作全局 `message.*()` 配置类型使用，请改用新的容器 props 名称。

### Added

- **Locale 命名空间继续扩展**：`TigerLocale` 新增 `empty`、`tour`、`calendar`、`fileManager`、`imageViewer`、`imageEditor`、`status`、`qrcode`、`timeline` 等文案段，并补齐 en-US / zh-CN 及 13 个 locale preset 中的相关默认文案。新增 core helpers / 常量包括 `getTourLabels`、`getCalendarLabels`、`getFileManagerLabels`、`getImageViewerLabels`、`getImageEditorLabels`、`getStatusLabels`、`DEFAULT_*_LABELS` 与 `ZH_CN_*_LABELS`。
- **更多组件支持 `locale` 覆盖**：`AutoComplete`、`Badge`、`Calendar`、`CropUpload` / `ImageCropper`、`Empty`、`FileManager`、`ImageAnnotation`、`ImagePreview`、`ImageViewer`、`Loading`、`Tag` 等双端组件新增可选 `locale` prop，解析顺序为显式 prop / 组件 locale / ConfigProvider locale / 英文 fallback。
- **Calendar 受控能力补齐**：React `Calendar` 新增 `value`、`onChange`、`onPanelChange` 与 `locale`；Vue 侧对应行为通过既有 emits / `v-model` 对齐。
- **DataTableWithToolbar 工具栏能力补齐**：新增/公开 `onSearchChange`、`onSearch`、`onFiltersChange`、`onBulkAction`、`selectedKeys`、`tableClassName` 等属性，并把 toolbar 回调、搜索、筛选、批量操作和表格 class 传递纳入公开契约。
- **FileManager 受控与拖拽回调补齐**：新增 `onCurrentPathChange`、`onNavigate`、`onOpen`、`onSelect`、`onSelectedKeysChange`、`onSearchTextChange`、`onReorder` 等回调，支持选择、路径、搜索与重排状态外置。
- **VirtualTable 横向虚拟化与行定制**：新增 `width`、`virtualizeColumns`、`rowClassName`，core 新增 `calculateVirtualColumnRange` / `TableVirtualWindow` 等工具，用于大列数表格的横向窗口化渲染。
- **图表与编辑器能力补齐**：`GaugeChart` 新增 `tooltipFormatter`；`RichTextEditor` 的 `mode` 现在传入底层 engine；`CodeEditor` 新增 active-line 相关 core class/helper；图表 tooltip、downsample、Donut 入场动画等 core helper 纳入公开导出。
- **主题与 token 检查能力**：core 新增 `defaultThemeLightColors` / `defaultThemeDarkColors`、`THEME_CONFIG_CSS_VARS`、`themeConfigToCssVars`，Tailwind 默认主题变量改由默认主题色派生；新增 `pnpm tokens:check` 检查生成产物是否过期。

### Changed

- **DatePicker 文案来源收敛**：DatePicker labels 统一以 `datepicker-locales/*` preset 作为来源，`getDatePickerLabels(string)` 支持内置 13 个 locale id，未知 locale 自动回退 `en-US`。
- **公开但此前未完整生效的 props 落地**：Select、Table、VirtualTable、VirtualList、Kanban、RichTextEditor、图表、FileManager、Transfer、AutoComplete、Slider、Splitter、CodeEditor、ChatWindow、CropUpload、Cascader、FloatButton、Steps、Tabs、Calendar、InputNumber、CommentThread、DataTableWithToolbar 等组件完成“已声明/已透传但运行时未完全承接”的属性实现与双端对齐。
- **可访问性与键盘交互收敛**：Table / VirtualTable 行选择、展开行、筛选/导出控件、Tabs 关闭按钮、Rate、Segmented、Resizable、ImageAnnotation、Calendar、ChartLegend 等补齐 ARIA、键盘激活或可访问名称；折叠/交互场景更接近真实控件语义。
- **InputGroup 尺寸继承补齐**：React / Vue `InputNumber` 现在会继承 `InputGroup` size；Vue `InputNumber` 同时补齐 `defaultValue` 与 `className`。
- **质量脚本收敛**：`quality:ssr` 改走 `scripts/check-ssr-examples.mjs`，新增 `e2e` / `e2e:smoke` 脚本；CLI / 发布 / 校验脚本复用 `scripts/utils/files.mjs`、`scripts/utils/strings.mjs` 与 CLI `utils/exec.ts`。

### Fixed

- 修复 **MarkdownEditor** 空预览态把 `placeholder` 直接写入 `innerHTML` 的 XSS 风险：空态占位文案现在作为文本节点渲染，非空预览仍经 `sanitizeHtml`。
- 修复 **Message** 多位置渲染与类型契约：全局消息按 `top` / `top-left` / `top-right` / `bottom` / `bottom-left` / `bottom-right` 分组渲染，导出的 API options 类型不再与容器 props 混淆。
- 修复 **BackTop** 默认 `target` 在 SSR / 非浏览器环境直接访问 `window` 的问题。
- 修复 **Modal** 关闭回调顺序，避免受控关闭、确认、取消路径中 `onClose` / `onOpenChange` 语义混乱或重复触发。
- 修复 **TimePicker** 在存在秒值与 `minTime` / `maxTime` 时的禁用判断，秒列现在参与范围校验。
- 修复 **Form** 动态字段、reset、undo/redo 等路径中的内部值同步问题，减少受控 model 与内部 ref 脱节。
- 修复 **Vue** Anchor / AvatarGroup / Breadcrumb / Dropdown / DatePicker 等组件在响应式上下文、快捷日期和事件透传上的边缘问题。

### Infrastructure

- 依赖与工具链更新：Playwright、ESLint、Vitest、happy-dom、jiti、Prettier 等开发依赖升级；workspace 从 pnpm 10 迁移到 pnpm 11。
- API 基线生成与 release readiness 校验继续收敛，`api-reports/public-api-baseline.json` 纳入新增 locale/helper/props 契约，`skills/tigercat/references` 同步刷新到新的组件属性说明。
- Roadmap 文档从扫描日志整理为执行队列，历史 `docs/ROADMAP_CHECK.md` 内容已合并进 `docs/ROADMAP.md` 后删除。

## v1.4.0

本版本包含新增组件、表格列显隐、i18n 扩展、跨端逻辑收敛、发布门禁强化，以及需要迁移的 Breaking changes。迁移路径集中于 [迁移指南](docs/MIGRATION.md)。

### Added

- 新增 **MarkdownEditor** 高级组件：支持 Markdown 编辑、编辑/分屏/预览模式、内置工具栏、快捷键、预览渲染与自定义 renderer 扩展点，提供 Vue/React 双端实现、示例与测试。
- **Table 列显隐控制**：新增 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控），React 提供 `onHiddenColumnKeysChange`，Vue 支持 `v-model:hidden-column-keys` 与 `hidden-column-keys-change` 事件；`TableColumn` 新增 `hideable`（默认 `true`，`false` 时列设置面板中不可隐藏）。固定列偏移、卡片字段、导出与列拖拽只作用于可见列，隐藏列上已生效的筛选仍继续过滤数据。**DataTableWithToolbar** 工具栏新增列设置入口：`toolbar.showColumnSettings` 开启内置 Popover + Checkbox 面板，`toolbar.columnSettings.lockedColumnKeys` 可锁定不可隐藏列，标题支持 `toolbar.columnSettings.title` 与 locale（`table.columnSettingsText` / `columnSettingsAriaLabel`，13 语言预设已补齐）。core 新增 `filterHiddenColumns` 工具与 `FLOATING_OVERLAY_Z_INDEX`（1000）常量。
- **i18n 本地化扩展**：未配置 ConfigProvider 时英文渲染一律不变，无需逐实例传文案。
  - **Form** 内置校验消息本地化——新增 core `TigerLocaleFormValidation`、`getFormValidationLabels` 与 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS`，`TigerLocale` 新增 `formValidation` 段；双端 `Form` 新增可选 `locale` prop 并接入 ConfigProvider locale，`<ConfigProvider :locale="zhCN">` 下必填/类型/范围等内置报错自动中文，单条规则 `message` 仍为最高优先级；`validateRule` / `validateField` / `validateForm` / `validateFormFields` 新增可选 `messages` 末参（向后兼容）。
  - **内置文案接入 ConfigProvider locale**——`TigerLocaleCommon` 新增 `searchPlaceholder` / `clearText` / `noMoreText`（en-US / zh-CN 及多语言预设已补齐）。双端 `Select` / `Tree` / `TreeSelect` / `Transfer` / `Cascader` / `FileManager`（及 Vue `VirtualTable` / `QRCode` / `Timeline` / `Loading` / `ImageViewer` / `AutoComplete`）不再硬编码 `'Search...'` / `'Loading...'` / `'Close'` / `'Clear'`，改读 `mergeTigerLocale(ConfigProvider locale, props.locale)` 并新增可选 `locale` prop 作最高优先级覆盖。
  - **空态 / 加载 / 清除 / 终态默认文案回退 locale**——双端 `List` / `Tree` / `TreeSelect` / `Transfer` / `VirtualTable`（`emptyText` / `notFoundText`）、`InfiniteScroll`（`loadingText` / `endText` → `common.noMoreText`）、`Signature`（`clearText`）、`Spotlight`（`placeholder` / `emptyText`）、`Cascader`（`notFoundText`）、`Tour`（`nextText` / `prevText` / `finishText` → `formWizard`）、`NumberKeyboard`（`confirmText` → `common.okText`）、`Select`（`noOptionsText` / `noDataText` → `common.emptyText`）、`FileManager`（`emptyText` → `common.emptyText`）与 React `Loading`（aria 回退 → `common.loadingText`）的英文默认值改为「未传时回退 `mergeTigerLocale(...)` 的 `common.*` / `formWizard.*`」，显式 prop 仍为最高优先级；`List` / `InfiniteScroll` / `Signature` / `Spotlight` / `Tour` / `NumberKeyboard`（含 React `VirtualTable`）新增可选 `locale` prop。同时修复 Vue `Cascader` 空态此前直接渲染 `notFoundText`、未接 locale 的漏改（React 端早已正确）。
- **core 工具新增**：`date-utils` 新增不可变日期算术 `addDays` / `addMonths` / `addYears`（`addMonths` / `addYears` 按目标月长度裁剪日期，如 1 月 31 日 +1 月 → 2 月 28/29 日）；新增命令式实例 id 计数器工厂 `createInstanceCounter`（`imperative-api`，每实例从 1 起单调自增、互相隔离）与 InputNumber 显示/解析工具 `formatInputNumberDisplay` / `parseInputNumberValue`（`input-number-utils`，`formatter` / `precision` / `parser` 以参数注入），供双端复用。
- React **Signature** 新增 `onClear` 回调：清除（工具栏按钮或 ref `clear()`）时触发，与 Vue 端 `clear` 事件对齐。

### Changed

- **跨端纯逻辑下沉 core（行为不变）**：公共组件 API、props 与 a11y 键盘行为均不变。
  - **DatePicker** 移除各自实现的 `addDays`、手写月/年步进 wraparound，改用 `date-utils` 的 `addDays` / `addMonths`。
  - **键盘导航**——core 新增 `getTreeKeyboardAction` / `getFirstVisibleChildKey`（`tree-utils`）、`getCyclicIndex`（`picker-utils`）、`focusTimePickerOption` / `TimePickerFocusUnit` / `TimePickerFocusAction`（`timepicker-utils`）、`getMenuNavigationKeys`（`menu-utils`）；双端 **Tree**（方向键/Home/End 走查与展开收起/聚焦父子/选择/勾选）、**Mentions**（环绕列表导航）、**TimePicker**（列内 roving 焦点）、**Menu**（方向键映射）改调同一份 core 实现，消除两端内联重复。
  - **命令式 API 与 InputNumber**——**Message** / **Notification** 的实例自增 id 计数器（原各自内联，双端共 4 份）改用 `createInstanceCounter()`；**InputNumber** 的显示格式化与字符串解析改调 `formatInputNumberDisplay` / `parseInputNumberValue`。core 保留 `createInstanceIdGenerator` / `parseInputNumberInput` 兼容别名。
- **SSR 守卫统一（行为不变）**：浏览器端渲染不变，统一改用 core `isBrowser()`。
  - core 端——`a11y-utils`（`createFocusTrap` / `announceToScreenReader` / live-region）/ `anchor-utils` / `chart-export-utils` / `table-export-utils` / `focus-utils` / `image-utils` 中的浏览器端命令式助手统一加 `isBrowser()` 非浏览器早退、稳定 fallback 或明确 browser-only 错误，新增 `tests/core/browser-only-guards.spec.ts` 在 Node 环境回归；`rich-text-editor-utils` 为纯函数、无运行时 DOM 副作用，保持原样。
  - Vue 端——`ConfigProvider` / `Signature` / `ImageAnnotation` 的内联 `typeof window/document === 'undefined'` 改用 core `isBrowser()`（`ImageAnnotation` 保留 `window.Image` 特性检测）。
  - React 端——**ImagePreview** 门户挂载改用 `utils/overlay` 的 `renderBodyPortal`（内含 `isBrowser()` 守卫）替代直接 `createPortal(…, document.body)`，与 Tour / FloatButton / ChartTooltip 一致；测试基建 `tests/setup.ts` 的 `matchMedia` mock 加 `typeof window` 守卫，使 SSR spec 可共用同一 setup。
- **React 受控/非受控样板收敛**：升级版 `useControlledState`（合并 `onChange`、稳定 setter、支持 updater 形式）接入 `Checkbox` / `Input` / `InputNumber` / `Radio` / `RadioGroup` / `CheckboxGroup` / `Textarea` / `MarkdownEditor` / `RichTextEditor` / `Upload` / `Spotlight`，移除各组件手写受控样板；新增 hook 单测覆盖受控 / 非受控 / updater / extra-args / 稳定 setter identity。`ScrollSpy` 与 `NumberKeyboard` 不属纯样板，暂不迁移。组件公共 API 与行为不变。
- **React 单文件巨石按 `Table/` 子模块范式拆分（行为不变）**：**Select** / **DatePicker** / **TimePicker** / **Menu** / **Tree** 各保留瘦 wrapper（公共导出与 props 类型不变），状态、渲染、图标、类型和上下文逻辑拆入子模块。框架无关纯逻辑继续调 core，无新增抽取；**DatePicker** / **TimePicker** 的内部受控值接入 `useControlledState`。公共 API、props、渲染 / a11y 行为及 `api-reports` 基线快照不变。
- **TimePicker / Upload 文案收敛与深度 i18n**：默认文案表收敛到 `locale-utils` 单一来源（新增 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` / `DEFAULT_UPLOAD_LABELS` / `ZH_CN_UPLOAD_LABELS`），消除标签分散；TimePicker 标签并入 `TigerLocale`（新增 `timePicker` 区块），双端 TimePicker 接入 ConfigProvider locale 且保留字符串 locale 兼容；en-US / zh-CN locale pack 补 `upload` + `timePicker` 区块。公共 `getTimePickerLabels` / `getUploadLabels` 签名不变。
- **杂项收敛（行为不变）**：
  - `shouldLoadMore` 撤销 `@deprecated`——它是 InfiniteScroll 在 IntersectionObserver 不可用时的有意滚动回退路径，并非待移除 API。
  - core 内部 `src/theme/` 重命名为 `src/theme-runtime/`，与命名预设主题目录 `src/themes/`（预设 + `ThemeManager` + modern token）区分；`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 及各 `*Classes` 仍经主入口 `@expcat/tigercat-core` 导出，公共 API 不变。
  - 收窄双端组件中冗余 / 脆弱的非空断言（`!`）：`Image` / `QRCode` / `Mentions` / `Alert` 去除带默认值 prop 的断言，`Tree` / `CommentThread` / `Menu` 守卫分支内改用局部 const 收窄 `node.children`。
  - **CLI** 参数校验更严格、反馈更可预测：`tigercat create` 对非法 npm 包名（含大写 / 空格 / 非法字符）直接报错退出并给出建议名；`create` / `playground` 对非法 `--template` 立即失败并列出可选值；`add` 对显式非法 `--framework` 立即失败；非空目录确认文案改为「Overwrite conflicting template files? (other files are kept)」；新增内部工具 `cli/src/utils/validate.ts`。
  - **CLI** `tigercat doctor` 诊断更深：`Version compatibility matrix` 升级为对已检测 framework 的 peer 主版本实际校验（Vue `^3`、React 与 react-dom `^19`，过旧即失败）；新增 `Core exports` 检查，当 `@expcat/tigercat-core` 已安装且可解析时校验其 `exports` 暴露 `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json`（未安装 / 不可解析则跳过）。

### Breaking Changes

- **React hook**：公共 hook `useControlledState` 升级为回调透传版——返回值由 `[value, setValue, isControlled]` 收敛为 `[value, setValue]`，新增可选第三参 `onChange`；`setValue(next, ...args)` 在非受控时写内部 state 并在两种模式下始终调用 `onChange?.(next, ...args)`，受控模式不再写内部 state，且支持 updater 形式与稳定 identity。仅消费 `value` 与 setter 者无需改动；此前读取第三个返回值 `isControlled` 或手写受控样板者请见 [迁移指南](docs/MIGRATION.md)。
- **core**：移除废弃别名 `kanbanAddCardClasses`。自 v0.9.0 起它仅作为 `taskBoardAddCardClasses` 的向后兼容别名，现已删除；请改用 `taskBoardAddCardClasses`（详见 [迁移指南](docs/MIGRATION.md)）。
- **Dropdown**：菜单默认渲染到 `document.body`（React portal / Vue Teleport，zIndex 1000），解决表格固定列（sticky）遮挡与 overflow 容器裁剪；新增 `portal` prop（默认 `true`），`portal: false` 可恢复原位渲染的旧 DOM 结构。包装层新增 `data-tiger-dropdown-menu` 属性便于查询，依赖原 DOM 层级的样式选择器或测试需相应调整。
- **跨端 API 对称**：统一受控量 / 事件回调的双端命名（详见 [迁移指南](docs/MIGRATION.md)）。
  - **ImageViewer (React)**：`onIndexChange` 重命名为 `onCurrentIndexChange`，与受控 prop `currentIndex` 及 Vue `update:currentIndex` 对齐。
  - **CommentThread (Vue)**：展开事件由 `expand-change` 改为 `update:expandedKeys`（支持 `v-model:expanded-keys`），与受控 prop `expandedKeys` 及 React `onExpandedChange` 对齐。
  - **Spotlight (Vue)**：移除冗余的 `close` 事件，统一改用 `open-change`（`open-change(false)` 即关闭），与 React `onOpenChange` 对齐。

### Fixed

- 修复 React **Alert** 自动关闭时强制伪造 `MouseEvent` 的不安全类型转换：`onClose` 事件参数改为可选，自动关闭时不再传入伪造事件对象。
- 修复 React **Notification** 入场动画 `setTimeout` 缺少清理函数的问题，组件在动画前卸载不再触发对已卸载组件的状态更新。
- 修复 React **Splitter** 拖拽时分隔条高亮失效的问题：拖拽状态改用 state 追踪（与 Vue 端及 React Resizable 保持一致），按下分隔条即可正确显示拖拽高亮。
- 修复 **VirtualList** 固定高度列表在 `itemHeight` 为 0（或非正值）时可见范围计算产生 `Infinity` / `NaN` 的问题：`getFixedVirtualRange` 现对非正项高与空数据返回安全的空范围。
- 修复 **CLI** `tigercat generate test` / `generate doc-template` 在目标文件已存在时因 `logWarn` 未导入而抛 `ReferenceError` 崩溃的问题：现正确告警并跳过；同时将 CLI 源级 `tsc --noEmit` 类型检查纳入验证，避免仅靠 tsup 转译漏掉此类未定义引用。
- 修复 React 示例 `UseControlledStateDemo.tsx` 仍按旧 3-tuple 解构 `useControlledState` 导致 `pnpm example:build` 类型报错的问题：demo 与展示 snippet 改用新签名 `useControlledState(value, defaultValue, onChange)`，恢复 example 构建绿。

### Infrastructure

- **质量门禁体系**：新增分层门禁 `pnpm quality:quick` / `quality:size` / `quality:examples` / `quality:release`；新增 `pnpm release:check`（校验包版本、运行时 `version` 导出、公开 package exports、Changesets fixed group 与发布文档入口）；新增 SSR 门禁 `pnpm quality:ssr`（覆盖 Nuxt 与 Next.js 示例构建）并纳入 `quality:release`。接入测试覆盖率门禁——`vitest.config.ts` 新增 `coverage.thresholds`（lines 85 / statements 83 / functions 84 / branches 76，取实测基线略低值留漂移余量），`test:coverage` 改为 `vitest run --coverage`。覆盖率阈值（`test:coverage`）、公共 API 基线漂移（`api:baseline:check`）、references 漂移（`docs:api:check`）三道闸此前仅接 `ci.yml`，现一并纳入 `quality:release` 使本地发布链可达（与 CI 改回手动 `workflow_dispatch` 解耦），`release:check` 的必含步骤校验同步登记此三项固化为发布前红门禁。`ci.yml` 维持手动 `workflow_dispatch`（控 GitHub Actions 成本），`publish.yml` / `publish-on-tag.yml` 在发布前插入 `pnpm release:check`。
- **Tailwind v4 基线与体积预算**：新增 Tailwind v4-only 基线检查，覆盖 workspace catalog、CLI 模板版本、core peer dependency 与示例项目依赖入口。重设 size-limit 基线并扩展覆盖——随 MarkdownEditor、Table 列显隐与多组件 i18n 等新功能，full bundle 体积自然增长（已核对增量来自新功能源码而非依赖膨胀，运行时仅依赖 `@floating-ui/dom`），按实测上调三个主入口与 Button 子路径预算（Core 118 kB、Vue 284 kB、React 320 kB、Vue Button 22 kB、React Button 20 kB），并新增重组件子路径（Menu/DatePicker/Table/Tree/TimePicker 双端）与 core 子路径（`tailwind/modern`、`locales/zh-CN`、`icons/common`）的体积回归护栏。
- **API / references 漂移护栏**：新增公共 API 基线快照 `scripts/generate-api-baseline.mjs`（`pnpm api:baseline`）产出确定性的 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口的 props / extends、core 导出名、双端公开组件与命名导出），CI 经「生成 + `git diff --exit-code api-reports`」捕捉删导出 / 删 prop / 改名 / 改 extends 等版本间回归——与 `validate-api.mjs`（当下双端一致性）层次互补。`validate-api.mjs` 新增「受控量双端对称（controlled-parity）」护栏：把 overlay 的 `open → update:open / onOpenChange` 规则推广为显式 parity 表（`currentIndex` / `expandedKeys` / `query` / `hiddenColumnKeys` …），校验 Vue `update:<prop>` 与 React `on<Prop>Change` 成对一致（可按条目以白名单登记有意非对称），读取主文件 + `<Comp>/` 子目录以兼容拆分组件。修复 skill references 漂移：`generate-api-docs.mjs` 的 `formatMarkdown` 改经 `prettier.resolveConfig` 加载仓库配置（`printWidth` 100），生成物即 prettier-clean 且幂等；漂移闸由仅校验 `shared/api-summary.md` 扩展为校验整个 `skills/tigercat/references` 目录；`references/cli.md` 命令表转义未转义的 `|`、`references/performance.md` 补运行时基准段。
- **依赖 / CVE 扫描**：`.github/workflows/security.yml`（周度 + 手动触发，`pnpm audit --audit-level=high`）。发布包运行时仅依赖 `@floating-ui/dom`，现存 high 级告警均来自 example/dev 工具链（Nuxt / Vite / Playwright 等，不随产物分发），故 audit 取报告式（`continue-on-error` + step summary），暴露告警集供人工分诊。`.github/dependabot.yml` 自动升级当前已停用（保留为 `.github/dependabot.yml.disabled`，控 Actions / PR 成本），故现阶段无自动补救机制，依赖升级走人工。
- **运行时基准工作流** `.github/workflows/bench.yml`（周度 + 手动触发，`pnpm bench --run --outputJson` 并上传结果 JSON 产物供人工对比）：刻意非 PR 门禁、无硬回归阈值（micro-bench 在共享 runner 抖动大，硬阈值易误红）。
- **包导出与产物清理**：收敛 `@expcat/tigercat-core` 导出——移除失效冗余的 `./types` / `./theme` 子路径导出（目标文件从未由 tsup 产出、内容已由主入口导出且无消费者），`module` 字段由不存在的 `./dist/index.mjs` 修正为实际 ESM 产物 `./dist/index.js`，`release:check` 必需导出清单同步更新。修正 `@expcat/tigercat-cli` 发布 `files`——移除不存在的 `templates` 目录（实际模板内联进 `dist/index.js`），发布包稳定提供 bin/root 入口。清理 Vue 包内 7 个未使用的内部 composable（`usePopup` / `useDateNavigation` / `useDateSelection` / `useTimeSelection` / `useTimePanelKeyboard` / `useSelectOptions` / `useSelectKeyboard`，约 1,529 LOC）及其 barrel——属死代码移除，公共 composable `useChartInteraction` / `useFormController` / `useDrag` 不受影响。
- **CLI 模板单一来源与文档职责边界**：workspace catalog 补 `@vitejs/plugin-react` / `@vue/tsconfig` / `vue-tsc`，example 项目对应依赖改用 `catalog:`，使 catalog 成为全部模板 toolchain 依赖的单一来源；`tests/core/cli.spec.ts` 扩展为「全部 13 个可 catalog 化的 `TEMPLATE_VERSIONS` ↔ catalog 对齐表」并新增 example `catalog:` 断言，把模板版本漂移变为红色测试（`tigercat` 版本仍由 `release:check` 守护）。新增 [迁移指南](docs/MIGRATION.md) 作为 Breaking change 与迁移路径集中入口；明确 Roadmap、CHANGELOG、脚本文档与 API 文档的职责边界，避免完成历史长期堆回 Roadmap。

## v1.2.0 — Breaking Changes

### Removed

- **ImagePreview**: 移除已废弃的 `visible` prop，请使用 `open`。
- **Image (Vue)**: 移除已废弃的 `preview-visible-change` 事件，请使用 `preview-open-change`。
- **Image (React)**: 移除已废弃的 `onPreviewVisibleChange` prop，请使用 `onPreviewOpenChange`。

## v1.0.0 — 正式发布 🎉

Tigercat 首个正式版本，标志着从实验阶段进入稳定阶段。从 v1.0.0 起遵循 SemVer 语义化版本：
patch — Bug 修复；minor — 新特性/新组件；major — 破坏性变更。

### 亮点

- **133+ 组件** — Vue 3 + React 双端完整实现
- **4619+ 测试** — 237 test files，覆盖单元/集成/a11y
- **WCAG 2.1 AA** — 全组件无障碍达标
- **8 语言国际化** — zh-CN/en-US/zh-TW/ja/ko/th/vi/id
- **5 套预设主题** — Default/Vibrant/Professional/Minimal/Natural + 暗色模式
- **纯 SVG 图表** — 12 种图表类型，零第三方依赖
- **CLI 脚手架** — `@expcat/tigercat-cli` 项目初始化/组件生成
- **E2E 浏览器测试** — Playwright 覆盖 Chrome/Firefox/Safari
- **Bundle Size 监控** — size-limit CI 集成，核心 < 100KB gzip
- **CI/CD 完善** — lint/build/test/size-limit/e2e 全自动化

### 自 v0.8.0 以来的变更

#### 视觉样式升级

- **圆角体系升级** — 控件级 `rounded-md→rounded-lg` (4px→8px)，容器级 `rounded-lg→rounded-xl` (8px→12px)，Modal `rounded-2xl`
- **交互动效优化** — 过渡时长 150ms→200ms，新增 `ease-out` 缓动，slide 动画距离缩短 (translate-y-4→2)
- **Focus Ring 柔化** — 聚焦环从硬色改为 `/40` 半透明，视觉更柔和
- **叠加层模糊** — Modal/Drawer 遮罩新增 `backdrop-blur-[2px]` 毛玻璃效果
- **Card 悬浮** — hover 效果从 `scale-[1.02]` 改为 `-translate-y-1 + shadow-lg`，更自然
- **Token 同步** — tokens.ts / tokens.css / 5 套主题预设圆角值全部对齐
- **新增缓动常量** — `EASING_SPRING` (弹性) / `EASING_SMOOTH` (平滑) + 对应 CSS 变量
- 涉及 40+ 组件工具文件，所有 4619 测试通过

#### 新增组件

- **InputGroup** — 输入框组合容器，支持前后缀、嵌套 Input/Select/Button
- **PrintLayout** — 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制
- **ImageViewer** — 全功能图片查看器，支持缩放/旋转/翻页/键盘导航

#### 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

#### API 一致性改进

- **ImagePreview**: `visible` → `open`（向后兼容，`visible` 标记为 `@deprecated`）
- **Image**: `preview-visible-change` → `preview-open-change`（Vue，向后兼容）
- **Image**: `onPreviewVisibleChange` → `onPreviewOpenChange`（React，向后兼容）
- **Calendar**: `panelChange` → `panel-change`（Vue，**不向后兼容**）
- **Rate**: `hoverChange` → `hover-change`（Vue，**不向后兼容**）

#### a11y 改进

- 新增 `createFocusTrap()` — 焦点陷阱工具，支持 Tab/Shift+Tab 循环、Escape 回调
- 新增 `announceToScreenReader()` — 屏幕阅读器公告工具（aria-live region）
- 新增 `manageLiveRegion()` — 可管理的 live region 实例
- 所有新组件通过 axe-core a11y 自动化测试

#### 测试

- 测试总量: 4619 tests / 237 test files
- 新增 ButtonGroup Vue/React 测试（23 tests）
- 增强 Dropdown Vue/React 测试（+8 tests）
- 增强 Tag Vue/React 测试（+8 tests）
- 新增 a11y-utils 测试（11 new tests）

#### 基础设施

- **E2E 测试** — Playwright 跨浏览器测试（Chromium/Firefox/WebKit）
- **Bundle Size 监控** — size-limit 集成，CI 自动检查
- **性能基准** — Vitest bench 模式，关键组件渲染性能基线
- **CI/CD** — 新增 ci.yml（PR 自动检查）、e2e.yml（浏览器测试）
- **API 一致性扫描器** `scripts/validate-api.mjs` — 全量组件 API 命名检查
- **CLI 脚手架** `@expcat/tigercat-cli` v1.0.0 — 项目初始化、组件生成

#### 文档

- 迁移说明合并到 Changelog，减少根目录历史文档数量
- 文档站升级：客户端搜索、主题切换预览
- 更新 Skills 文档（shared/props、vue/react 代码示例）

### 迁移摘要

从 v0.8.0 升级到 v1.0.0 时，Vue 侧需要注意两个事件名变更：

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

以下 API 仍可用但已标记为弃用，建议改用 `open` 命名：

```diff
- <ImagePreview :visible="show" />
+ <ImagePreview :open="show" />

- <Image @preview-visible-change="handler" />
+ <Image @preview-open-change="handler" />
```

v0.5.0 的早期破坏性变更仍需留意：弹出层组件统一使用 `open` / `update:open`，Button 原生按钮类型使用 `htmlType` 而不是 `type`。

---

## v0.8.0 — 高级交互与业务组件

新增统一拖拽系统、Splitter、Resizable、CodeEditor、RichTextEditor、Kanban、VirtualTable、InfiniteScroll、FileManager，以及 CLI 脚手架能力；该版本主要为增量功能，无破坏性变更。

## v0.5.0 — 架构筑基

统一弹出层可见性 API（`visible` → `open`），Button 原生类型 API（`type` → `htmlType`），并引入泛型类型、类型安全事件/插槽、设计 Token 与菜单键盘导航等基础能力。
