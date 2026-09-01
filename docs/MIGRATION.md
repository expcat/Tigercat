# Tigercat 迁移指南

本文集中记录当前仍需要用户处理的 Breaking change 与推荐迁移路径。完整发布历史见 [CHANGELOG.md](../CHANGELOG.md)。

## 未发布

Pie 默认从 12 点钟起（`startAngle = -Math.PI / 2`）。Donut 默认 `innerRadiusRatio` 是 0.6，色板与 Pie 同一份 `--tiger-chart-*`。扇区不再是 `role="img"`。Vue 从主入口引 `PieChartProps` / `DonutChartProps`。

Radar 多系列共用第一列的角域（或 `indicators`）。负值 / 非有限不再拉进圆心。默认 padding 36。点默认 `aria-hidden`。Vue 从主入口引 `RadarChartProps`。`gradient` 写在 core。

Funnel `direction="horizontal"` 会沿 x 画。缺 label 走 locale `chart.stageName`，core 不再写 `Stage N`。Vue 从主入口引 `FunnelChartProps`。

Gauge 角度：0 = 12 点钟、顺时针。默认 `-135…135` 底开口，不再是右侧缺口的 135–405。根是 `role="meter"`，不再默认进 Tab。删未实现的 `colors`。Vue 从主入口引 `GaugeChartProps`。

Bar / Line / Area / Scatter 默认 padding 与 ChartCanvas 同一份（底/左 52）。`barRadius` 传入后不再被 `--tiger-chart-bar-radius` 盖掉。Area `gradient` 默认是 false。Scatter `datum.size` 默认仍是像素半径并 clamp 到 40；要按数据度量缩放请开 `sizeScale`。点默认不再是 `role="img"`。Vue 从主入口引 `BarChartProps` / `LineChartProps` / `AreaChartProps` / `ScatterChartProps`。`onPointClick` 不必再开 `selectable`。

ChartCanvas `responsive` 观察的是画布宿主，不是外面的 legend 壳。默认 padding 从 `24` 改成 `{ top: 24, right: 24, bottom: 52, left: 52 }`。有 `title` / `aria-label` 时 svg 是 `role="img"`。React children 可以是 `( { innerRect, width, height } ) => node`。

`useChartInteraction`：`onClick` 在点到元素时就会发，不再先看 `selectable`。取消选中时 `onClick` 仍是原始 index，`onSelectedIndexChange` / `update:selectedIndex` 才是 `null`。Vue 不再要 `emit` + `eventNames`，和 React 一样传 `onClick` / `onHover` / `onHoveredIndexChange` / `onSelectedIndexChange`。删除 hook 的 `createLegendItems` 和公开的 `localHoveredIndex` / `localSelectedIndex`。`useResponsiveChartSize` 从根入口导出。

高阶图的 legend mixin 改名 `ChartLegendToggleProps`。`ChartLegend` 组件 props 才叫 `ChartLegendProps`，必填 `items`；`position` 改成 `orientation`（`horizontal` | `vertical`）。`aria-pressed` 只表示选中。关着的 `ChartTooltip` 不再留在 DOM。删除 `defaultTooltipFormatter` / `chartInteractiveClasses` / `getChartAnimationStyle` / `getChartEntranceTransform` / `applyChartBrush` / `createChartLinkController`。

Tour `current` 是 `steps` 的原始下标。非受控关掉再开会回到 0；受控请在 `onOpenChange(false)` / `@close` 里把 `current` 归零。`closable={false}` 只藏关闭钮，Esc 和点遮罩仍关，除非再设 `keyboard={false}` / `maskClosable={false}`。`target` 可以是选择器或 `HTMLElement`，非法选择器不再抛。Finish 事件顺序是 `finish` → `close` → `open=false`。Vue 从主入口引 `TourProps`。删除 `getTourSpotlightStyle`。

Message / notification / LoadingBar 是命令式 API，不是空 `<Message />`。关闭名走 locale 字段（zh-TW 是「關閉訊息」不是「關閉消息」）。`Message.loading({ duration })` 尊重传入的 duration。Vue `MessageContainer` / `NotificationContainer` 发 `close`（`@close`），不要只绑 `:on-close`。LoadingBar 默认名是 `Loading...`；`finish` 后下一次 `start()` 不再粘上一次的 color；需要确定进度用 `set` / `inc`。根入口 `MessageProps` / `NotificationProps` 是组件字段，命令参数用 `MessageOptions` / `NotificationOptions`。

Alert 默认不再是 `role="alert"`。静态 info/success/warning 没有 live region；有内容的 `type="error"` 才是 `alert`。空 `<Alert />` 不是 live。关闭名走 `locale.alert.closeAriaLabel`（en-US `Close alert`，zh-CN `关闭提示`）。点关闭和 `duration` 只发 `onClose` / `close`（都带 Event），组件自己不 `return null`；父级卸载或 `visible={false}`。`duration` 不再要求 `closable`。有 `title` 时默认槽 / children 仍渲染。Vue 从主入口引 `AlertProps`。

Loading 全屏走 overlay-host，打开时背后 `inert`。默认名是官方 `common.loadingText`（`Loading...` / `加载中...`），不要再写 fallback `'Loading'`。区域遮罩用 children / 默认槽 + `spinning`，不要手写 `absolute inset-0`。删 Vue `disableTeleport`。dots/bars 关键帧进 Tailwind plugin，不再 `injectLoadingAnimationStyles`。Vue 从主入口引 `LoadingProps`。

Affix / BackTop / Anchor 共用 `resolveScrollRoot`。Affix `target` 不再只是字符串，也可以是节点或 getter。非法选择器不再抛，回退 window。

BackTop `duration` 不是毫秒：`0` 立刻滚到顶，正数用浏览器原生 smooth。默认 `auto` 走 viewport `placement`/`offset`（24px），不再是 window 专用的 `bottom-8 right-8`。自定义容器默认也是视口 fixed；要贴在容器里请显式 `position="sticky"` 且按钮是容器子孙。隐身时不进 Tab。默认 `aria-label` 走 `locale.backTop`。

Anchor 默认 `affix` 使用 Affix（有占位），不再给根加裸 `fixed`。默认有 ink。根是 `<nav>`，链接在 `ul > li`，当前项 `aria-current="location"`。点链接会 `onChange` 并写入 hash；`ctrl`/`meta`/`_blank` 不 preventDefault。`getContainer` 与 Affix `target` 同一套输入。删除 `AnchorClickInfo` / `AnchorChangeInfo` / `getContainerHeight`。Vue 从主入口引 `AffixProps` / `BackTopProps` / `AnchorProps` / `AnchorContextKey`。

NavigationMenu 默认不再悬停或聚焦就开层。用点击或 Enter / Space / ArrowDown；需要悬停请显式 `openOnHover`。再点同一 Trigger 会关上。不要依赖默认 `aria-label="Main"`，多个导航请各自命名。`1` 与 `'1'` 是同一项。Mega 面板是 `menu` 不是孤立 `group`。Vue 从主入口引 `NavigationMenuProps` 和 `NavigationMenuList`。

Menu 点选永远是单选：`selectedKeys` 长度 0/1，再点已选项变成 `[]`。`multiple` 只表示可否同时打开多个 submenu，不再让初值多选、一点就塌成一项。`1` 与 `'1'` 是同一 key。

`popupPortal` 默认 `true`。popup（horizontal / collapsed vertical）也读写 `openKeys`，点 horizontal 标题会 toggle。搜索会把匹配子孙的祖先写进 `openKeys`；受控时请回写。未传 `searchPlaceholder` / `emptyText` 走 locale `common`。

垂直/inline 根不再是 `role="menu"`（是 `<nav>` + `<ul>`）；horizontal 是 `menubar`。有 `href` 的项是 `<a>`。字符串 `icon` 不再当 HTML。Vue 从主入口引 `MenuProps`。

Dropdown 默认 `trigger` 从 `hover` 改为 `click`。需要悬停打开请显式 `trigger="hover"`（仍可用键盘和点按打开）。触发器不再是带 `aria-haspopup` 的包装 div：不传 `asChild` 时自渲 `<button type="button">`，`asChild` 或唯一原生 `button`/`a` 把 ARIA 合并到那颗节点。SplitButton / DataExport 已走 `asChild`。

Tooltip 默认 hover 同时响应 focus 和 click。`aria-describedby` 只在打开时写在焦点节点上。

Popconfirm 默认文案走 locale（en-US `OK` / `Cancel` / `Are you sure you want to continue?`），不再写死简体。打开后焦点进 Cancel。OK/Cancel 是 Button。`onConfirm` 返回 Promise 时 pending 不关层。

SplitButton 根不再是 ButtonGroup；不要把它塞进 ButtonGroup。chevron 默认名走 `locale.common.moreOptionsText`。Vue `type` / `htmlType` 写到主按钮。无菜单时不渲染 chevron。

ContextMenu 触发面进 Tab（自渲 button，或 asChild 合并到子控件）。点 Sub 标题会打开子菜单。

Tree 的 `1` 与 `'1'` 是同一 key。`filterValue` 会摘掉不匹配的节点（不是整棵高亮）；内置搜索与 `filterValue` 共用 `searchValue` / `onSearch`。`loadData` 必须返回新 children，不要写 `node.children =`；受控树听 `onTreeDataChange` / `update:treeData`。`onCheck` 第一参和 `checkedNodes` 是同一批 strategy 过滤后的 key，没有 `checkedNodesPositions`。`onDrop` 现在是 `{ dragKey, dropKey, dropPosition, treeData }`；不绑的话非受控树会自己重排。默认 `aria-label` 走 locale（「树」/「樹」），有 `aria-labelledby` 时不要再写 label。`height` 只收 px 数字。`showIcon` 只控制 `node.icon`，展开三角一直在。Vue 从主入口引 `TreeProps` 才是组件 props。

DataExport 增加 `csv`。`fileName="report.xlsx"` 不再变成 `report.xlsx.xlsx`。只有 `render`、记录上没有对应字段的列默认不导出；要跳过隐藏列传 `hiddenColumnKeys`。多格式触发器的 `aria-haspopup` / `aria-expanded` 在那颗 button 上，不要再给可见按钮另写一套不含该文本的 `aria-label`。Vue 主入口导出 `DataExportProps`。

VirtualTable 选择按 `rowKey`（默认 `id`），不要再用窗口下标 `0` 当选中。点行即选，没有 checkbox 列。列虚拟化必须数字 `width` 且无固定列。删除 React `renderCell`，用 `column.render`。命令式滚动用 `scrollToIndex`。Vue 主入口导出 `VirtualTableProps`。

Table 行身份是 `rowKey`（及 `rowSelection.getRowKey`），缺键时用 **dataSource 下标**，不要再当页内 `0,1,…`。`onCellChange` / `onRowClick` / `column.render` / `editableCells` 都是这份下标。`editableCells` 从 `Map<string, Set<number>>` 改成 `{ [columnKey]: number[] }`。

`pagination.total: 0` 不再被当成「没传」。remote 默认不跑本地 filter/sort/group（要当前页再筛设 `pagination.localProcessing`）。省略 `pagination` 仍默认开（`pageSize` 10），关掉请 `false`；传入的分页对象与默认浅合并。`autoVirtual` 默认 `false`。

Table `exportable` 只出 CSV。删除 `exportFormat: 'excel'` 和 HTML 假 `.xls`；真 xlsx 用 DataExport。CSV 带 BOM、CRLF。Vue 主入口导出 `TableProps`。

VirtualList / Table / VirtualTable 行窗口现在是同一份 exclusive 算术：默认 overscan 下可见条数比旧的 VirtualList/Table 少（不再 `2 * overscan` 后再 inclusive 多渲一行）。`height` 只收 px。命令式滚动用 `scrollToIndex` / `scrollToOffset`，不要再找 `firstElementChild` 写 `scrollTop` 再 `dispatchEvent('scroll')`。嵌在 Tree/List 里的 VirtualList 请传 `role="none"`。删除类型 `VirtualListItemSize`。Vue 主入口导出 `VirtualListProps`。

InfiniteScroll 必须把滚动盒定高（`height` 或 class），否则会一次拉完或拉不动。`onLoadMore` / `@load-more` 必须同步把 `loading` 置 true。`threshold` 是像素 rootMargin，不是 IO 相交比例。横向 sentinel 不再是 0×0。`inverse` 的结束文案在内容前。Vue 主入口导出 `InfiniteScrollProps`。

Upload 不传 `action` 也不传 `customRequest` 时文件停在 `ready`，不再标 `success`。`autoUpload={false}` 用 ref / expose 的 `submit()`。React `onChange` 仍是 `(file, fileList)`，FormItem 写入的是第二参列表。`listType="picture"` 现在是带缩略图的文本行。隐藏 file input 改 `sr-only`，不要再给它 `name`。

Transfer 省略 `value` / `targetKeys` 时移动会改两栏。`1` 与 `'1'` 是同一 key。面板不再是 `listbox`/`option`。React `onChange` 第一参仍是目标键数组。Vue 主入口导出 `TransferProps`。

CropUpload 确认结果带 `file`（原文件名）。触发器是 `<label>` 不是 `div role=button`。自定义 trigger 不要再包一层 button。删除 example 站 `.tiger-crop-upload-modal` 覆写。

Mentions 省略 `value` / `modelValue` 是非受控（不要再默认 `''`）；空正文才是 `''`。插入格式是 `prefix + option.value + 空格`，过滤同时匹配 `label` 和 `value`。新增 `defaultValue` / `open` / `onSearch` / `loading` / `filterOption` / `status`。弹层走 overlay-host。删除 `--tiger-mentions-*` 和 `getMentionsInputClasses`。Vue 导出 `MentionsProps` 与 `MentionOption`。

MaskInput `v-model` 仍是 raw；`disabled` 时 hidden 不再提交。Clear 与 error 同时存在。自定义 token 的 `/g` 不再跳字。

InputOTP 默认一个 Tab 停（roving）。多字只在第一格或 autofill 时整段覆盖。`pattern` 会改 `inputMode`。

TagsInput 关闭钮不进 Tab。被拒的 pending 留在输入框。多值粘贴会先带上正在打的字。`name` 改为每个 tag 一个 hidden（`FormData.getAll`）。

TimePicker 列点只改面板草稿，Footer OK 才写入；Escape / 点外面丢草稿。`Now` 立即提交当前时刻。空单选是 `null`，空 range 也是 `null`（不要再用 `[null, null]` 当空）。存储值永远是 24 小时 `'HH:mm'` / `'HH:mm:ss'`（由 `showSeconds` 决定）；`format="12"` 只影响显示和键入解析。`locale` 只收官方 locale 对象，不要传 `'zh-CN'`。新增 `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）、`disabledTime`、`status`、`placement` / `offset` / `dropdownClassName` / `getPopupContainer`。输入框可按当前 `format` 键入；`readonly` 才禁止打开。小屏是原生 `<select>`，不再同时挂桌面列。删除 `getTimePickerInputClasses` / `getTimePickerIconButtonClasses` / `timePickerClearButtonClasses` / `timePickerPanelContentClasses` / `timePickerDesktopPanelContentClasses` / `timePickerMobileWheelClasses` / `timePickerMobileWheelSelectClasses` / `timePickerInputWrapperClasses`（chrome 走 Input helpers）。Vue 主入口导出 `TimePickerProps`。React `forwardRef` 接到 input。

Cascader 未选是 `undefined`（不要再用 `[]` 当空）。Clear 发出 `undefined`。新增 `defaultValue` / `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）和 `loadData`。打开不再清空 `defaultSearchValue`。trigger 不再是 native `button`，而是 `role="combobox"`；搜索时 combobox 是输入框。列模式只有当前列是 `listbox`。空态走 `empty.noResults`，placeholder 走 `select.placeholder`。删除假 token `--tiger-cascader-*`。Vue 主入口导出 `CascaderProps` 与 `CascaderOption`。

TreeSelect 未选是 `undefined`（多选 `[]`），`''` / `0` 是合法 key。新增 `defaultValue` / `open` / `expandedKeys` / `loadData`。下拉是 `role="tree"`，不是扁平 listbox。多选接 Tree 的 checkbox + `checkStrictly`（默认 true）/ `checkStrategy`。空态走 `empty.noResults`。删除假 token `--tiger-treeselect-*` 以及 `flattenTreeSelectNodes` / `filterTreeSelectNodes` / `findTreeSelectNode` / `getAllTreeSelectKeys`（改用 `tree-utils`）。Vue 主入口导出 `TreeSelectProps` 与 `TreeSelectValue`。

AutoComplete 的 `value` / `modelValue` 只表示已提交值，输入框走 `searchValue`。打字不再每键 `onChange` / `update:modelValue`。未选是 `undefined`（不要再用 `''` 当空）；`''` 是合法已选值。Clear 发出 `undefined`。新增 `defaultValue` / `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）。`defaultActiveFirstOption` 默认 true 时 Enter 选高亮项，自由文本用 blur 提交或关掉该 prop。空态走 `empty.noResults`。删除假 token `--tiger-autocomplete-*`。Vue 主入口导出 `AutoCompleteProps` 与 `AutoCompleteOption`。

Select 未选是 `undefined`（多选 `[]`），`''` 是合法选项值。React `onChange` 单选 Clear 第一参是 `undefined`，不要 `next ?? ''`。新增 `defaultValue` / `open` / `defaultOpen` / `onOpenChange`（Vue `v-model:open`）。搜索输入即时更新，`onSearchChange` 才 debounce；React 即时通道是 `onSearchValueChange`。trigger 不再是 native `button`，而是 `role="combobox"`；搜索时 combobox 是输入框。选项不再抢焦点（`aria-activedescendant`）。删除假 token `--tiger-select-*`。`listHeight` 是面板内容区高度。Vue 主入口导出 `SelectProps`。

Input React 支持 `readOnly`（与 `readonly` 同一属性）。Input 的 clear / 密码按钮进 Tab，文案走 `locale.input`。InputGroup 没有可访问名时不再写 `role="group"`。删除 InputGroupAddon 的 `type` / `addonType`（从未改视觉）。InputNumber `parser` 可返回 `null`，`NaN` 当空；`controlsPosition="right"` 是阅读方向的尾侧。React InputNumber `onChange` 仍是 `(value: number | null)`。Textarea 新增 `status` / `errorMessage`。

Splitter 删除公开类型 `SplitterPaneConfig`（组件从未读取，也没有 `Splitter.Pane` / 折叠）。`sizes` 按值受控：父级回写才改比例，仅数组身份变化不会重置拖拽。拿掉 `sizes` 后停在最后比例，不会均分。百分比随容器重算。gutter 需要可读名（locale 默认「Resize panes {index}」）。水平拖拽在 `dir=rtl` 下跟着指针。

Resizable 新增受控 `width` / `height`。`left` / `top` 手柄会移动原点。`lockAspectRatio` 时上下手柄也会改宽度。`axis="horizontal"` 不再渲染 `top`/`bottom`。角手柄不进 Tab，只给指针用。默认名走 `locale.resizable.handleAriaLabel`。Vue 的内部宽高覆盖用户 `style.width` / `style.height`。

Carousel 默认不再是名为 “Image carousel” / “图片轮播” 的 `region`。需要 landmark 时传 `aria-label` / `aria-labelledby` 或 `labels.ariaLabel`。`aria-roledescription` 走 locale。圆点改为 `role="tab"`，测请用 `getByRole('tab')` / `aria-selected`，不要再找 `tablist button` + `aria-current`。手势是 `pointer*`，不再听 `touch*`。`infinite` 循环不再把轨道从末张滑回开头。Vue 类型名是 `CarouselProps` / `CarouselMethods`（`VueCarouselProps` 仍是别名）。

List `bordered` 改为外框布尔（默认 `false`），项间线只走 `split`（默认 `true`）。删除 `'none' | 'divided' | 'bordered'` 和 `ListBorderStyle`。`bordered="divided"` 改成不传或 `split`；`bordered="none"` 改成 `bordered={false}`。`pagination.current` / `pageSize` 只要传入就是受控。拖拽下标是数据源下标，行上不再 HTML5 `draggable`（手柄 + `useDrag`）。loading 不再卸 listitem。

Descriptions / Masonry / List 网格的断点对象跟**容器宽**和 `--tiger-breakpoint-*`（`xs`…`2xl`）。删除 `xxl` / `xxxl`。竖向 Descriptions 也按 `column`/`span` 排格。

ScrollArea 的 `className` / 高度约束打在视口上；不溢出时视口不进 Tab。横轴阴影/拇指用逻辑边。`direction="both"` 不再强制 `min-w-max`。

PrintLayout `pageSize` 写入 `@page size`。删除 `custom` 枚举（改 `pageWidth`/`pageHeight`）。页眉页脚在屏幕上可见并随打印重复。`PrintPageBreak` 打印时不再 `display:none`。删除假 token `--tiger-print-ink`。`ref.print()` 只打这一份。

Layout 默认不再写 `min-h-screen`。有 Sidebar 直子时根是横排；标准壳是外层列、内层再一个 Layout 包 Sidebar + Content，不要再手写一层 `flex`。全屏壳用 `fullHeight`。Content 默认仍是 `<main>`，一页多个预览请 `as="div"`。Header / Footer 未传 `height` 不再写 inline（Footer 也不再写 `height: auto`）。`collapsedWidth="0px"` 的 Sidebar 会 `inert`。数字 `gutter={n}` 只开横缝；双轴传 `[h, v]`。Col 传 `flex` 不必再 `span={0}`；`span={0}` 改为隐藏。删除 `getGutterStyles` / `getColGutterClasses` / `rowGutterClasses` / `colGutterClasses`。Container `maxWidth="full"` 是 `max-width: 100%`，与 `false`（无 max-width）不同。

Tag 不再是 live region（无默认 `role="status"`）。点关闭只发 `onClose` / `close`，组件不会自己 `return null`；从列表删或设 `visible={false}`。关闭钮名走 locale `status.tagCloseAriaLabel`，不是写死 `Close tag`。新增 `pill`。

Badge 默认不是 `role="status"`。`type="number"` 只接受有限数字或十进制串（`content="NEW"` 请设 `type="text"`）。`type="text"` 不被 `max` 封顶。叠放必须 `standalone={false}`，并把计数写进宿主可访问名。`position` 的 left/right 跟阅读方向。删除 `formatBadgeContent` / `shouldHideBadge`，改用 `resolveBadgeContent`。

Avatar 图片名落在 `img alt`（可用 `text`）。`src` 变化会重试。组 `max` 只计 Avatar 子节点，overflow 额外一槽。假 token `--tiger-avatar-*` 改为 `--tiger-surface-muted` 等 canonical 名。

Image 默认 `preview=true` 时宿主是 `<button>`，不再是 `div role=button`。预览名走 `locale.image.previewAriaLabel`；开启 preview 时内层 img `alt=""`。React `ref` 指向 `<img>`；`onLoad` / `onError` / `srcSet` 不再落在包装节点。`previewTrigger="hover"` 仍可键盘聚焦出浮层、点击进全屏。`registerImageGroupItem` 改为 `{ id, src, alt? }`，按实例注销，不再按 URL `indexOf`。`getImageGroupClasses` 合并自定义 class，不再替换基类。

ImagePreview 与 ImageViewer 收成**一套**全屏 dialog（overlay-host、滚锁、焦点陷阱、Escape 栈）。公开名仍两个：`ImageViewer` 是同一实现的配置别名，`minZoom`/`maxZoom` 映射到 `minScale`/`maxScale`。导航改为到头 disable，不再 `% length` 循环。`images` 为 `string | { src, alt? }`；空列表会 emit 关闭。默认缩放范围统一为 0.25–5。删除 `ImagePreviewToolbarAction` 与 `clampZoom`。文案走 `locale.imageViewer`（含 `previewImageAriaLabel`），不再写死 `Preview image n` / `Image n`。

ImageCompare 滑块名走 `locale.imageCompare.ariaLabel`。删除 `DEFAULT_IMAGE_COMPARE_ARIA_LABEL` 与 `--tiger-image-compare-position`。空 `ariaLabel` 不再回落成英文；有 `aria-labelledby` 时不写默认 `aria-label`。水平模式从 inline-start 裁切（RTL 下 ArrowRight 减少）。拖拽只绑 `pointer*`。

ImageCropper 坏图进入错误态，不再无限转圈。显示用的 `<img>` 不再写死 CORS。`getCropResult()` 在未 ready / canvas 失败时 reject。删除假 token `--tiger-image-cropper-*`。缩放柄默认不进 Tab。产出仍是 `getCropResult()`，不是 `value`。Vue 导出 `ImageCropperRef`。

Marquee 默认不再是名为 “Scrolling content” 的 `region`。需要 landmark 时传 `ariaLabel` / `aria-label` / `aria-labelledby`。`repeat={0}` 现在是静态一份，不再回落到 2。`pauseOnHover={false}` 不再关掉焦点暂停（用 `pauseOnFocus={false}`）。删除 `DEFAULT_MARQUEE_ARIA_LABEL`，文案在 `enUS.marquee.ariaLabel` / `getMarqueeLabels`。纵向不要再靠外挂 `h-*` 才能像跑马灯。

Text `align` 改为逻辑值：`start` / `center` / `end` / `justify`。运行时仍接受 `left`/`right` 并映射到 `start`/`end`。

Link `disabled` 不再拆掉 `href`（仍是 `role=link`）。`underline` 默认在静止态显示，不再只在 hover。`target="_blank"` 会把 `noopener noreferrer` 并入已有 `rel`。

Button `loading` 不再设置原生 `disabled`。加载中仍可聚焦、读屏能听到 `aria-busy`；click / Enter / Space 继续被吞掉，不会提交。真正禁用只走 `disabled`。

`htmlType` 与原生 `type` 是同一属性：`htmlType ?? type ?? 'button'`。Vue `<Button type="submit">` 现在会提交表单。

ButtonGroup 直子必须是 Button；组和 Button 之间不能插 Tooltip/`span`。需要 `aria-label` 或 `aria-labelledby`。

拖拽原语收成两份，产品必须走它们：

- `createDocumentDragSession` 只绑 `pointermove` / `pointerup` / `pointercancel` + Escape。`DocumentDragSessionEvent.event` 是原始 `Event`（pointer 或 keyboard），带 `cancelled`。Splitter / Resizable / ScrollArea / Modal 已迁走，不要再抄 `document mousemove`。
- 列表重排走 `createListReorderController` / `useDrag`。`DragConfig` 删除未实现的 `ghostClass` / `scrollSpeed` / `scrollMargin`。`direction: 'both'` 不再默认 `lockAxis: 'y'`。`moveItemBetweenContainers` 越界返回 `null`，不再搬走 `sourceItems[0]`。`DragDropEvent` 增加 `overItem`。已删除 `applyFileDragReorder`（改用 `reorderSequence`）。项绑定不再写 `role="listitem"` / `aria-grabbed` / `aria-dropeffect`；class 只追加。子路径 `@expcat/tigercat-react/useDrag` 与 `@expcat/tigercat-vue/useDrag`。

Locale / i18n 系统改为只读官方 locale 对象。需要处理的路径：

- 不要再从 `@expcat/tigercat-core` 导入 `DEFAULT_*_LABELS` / `ZH_CN_*_LABELS`。缺省文案读 `enUS.<section>`，中文读 `zhCN.<section>`。
- `get*Labels({ locale: 'zh-CN' })`（只有语言码、没有对应段）现在回落 **en-US**，不再猜简体。传入 `zhCN` / `zhTW` 等完整对象。
- `getTimePickerLabels('es-ES')` 不再按语言码查第三张表。传入 `esES` 或带 `timePicker` 段的对象。
- `defineLocale` 只给应用 overlay：省略的键填成英文。内置包已是完整对象，不要再用来「补全」官方语言。

Overlay 默认 portal 目标链改为最近 overlay-host → ConfigProvider 根 → `document.body`。测试或 CSS 不要再假设浮层一定是 `document.body` 的直接子节点。已删除无人调用的 `applyFloatingStyles`；定位走 overlay adapter。

React `useControlledState` 只接受 options 对象，不再是位置参数：

```diff
- const [value, setValue] = useControlledState(controlledValue, defaultValue, onChange)
+ const [value, setValue] = useControlledState({
+   value: controlledValue,
+   defaultValue,
+   onChange,
+   postState // optional clamp/normalize
+ })
```

- `undefined` 非受控，`null` / `0` / `false` / `''` 是合法受控空值。
- 同值 setter 不 `setState`、不调 `onChange`。
- 父级把 `value` 从有改成省略时，显示最后一次受控值，不是 `defaultValue`。
- 组件 `onChange` 形状是 `(value, ...args)` 时交给 hook，不要 `setX` 后再发一次。
- `T` 不能是函数（函数参数一律当 updater）。

Vue 没有这份 hook；`modelValue` 默认必须是 `undefined`（禁止 `null`），省略才是非受控。

Form 引擎收成一份 `createFormEngine` / `useFormController`。需要处理的路径：

- React `<Form>` 不再默认 `model={}`（每次 render 新对象）。省略 `model` 时内部持有值；受控时请传 `onChange`（或 `controller`）。
- Vue Form 仍写入传入的 reactive `model`，并额外 `emit('update:model')`。可用 `v-model:model`。
- `useFormController` 的返回值可以传给 `<Form controller={ctrl}>`；`resetFields` 即 `ctrl.reset()`。嵌套名 `'user.email'` 走 `setValueByPath`，不再写成顶层怪键。
- FormItem **接管**显示：不必再给 Input 绑 `value`/`v-model`。Clear 也走同一条变更。
- `labelPosition` 默认改为 `'left'`（label 在字段前）。以前默认 `'right'` 实际也是 label 在左、文字右对齐；现在 `'right'` 会把 label 放到字段右侧。`FormLabelAlign` 去掉 `'top'`（堆叠用 `labelPosition="top"`）。
- 删除从未实现的 `dynamicFields`。`fieldDependencies` 可传普通对象，不必 `new Map`。
- 校验文案只读 locale 对象的 `formValidation` 段。`ConfigProvider locale={{ locale: 'zh-CN' }}` 不再灌简体，请传 `zhCN` / `zhTW`。
- 防抖校验被 `cancel()` 时 pending Promise **reject**（`FormValidationCancelledError`），不再当成 valid。
- `showMessage={false}` / `inlineMessage={false}` 不再把错误交给 Input extras；只留 `aria-invalid`。

## v2.1.2

v2.1.2 是相对 v2.1.1 的 patch。**没有 breaking change，组件用户无需迁移步骤。**
本版本为 ColorPicker / Select / RichTextEditor / MarkdownEditor 增补可选 `labels` 与 locale 键，默认英文行为不变。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v212)。

## v2.1.1

v2.1.1 是相对 v2.1.0 的 patch。**没有 breaking change，组件用户无需迁移步骤。**
本版本是 v2.1.0 之后的审查修复补丁（暗色 chrome、受控绑定、overlay 视口、无障碍/行为修复）。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v211)。

## v2.1.0

v2.1.0 是相对 v2.0.19 的 minor 发布。**没有 breaking change，组件用户无需迁移步骤。** `@expcat/tigercat-core` / `-vue` / `-react` / `-cli` / `-mcp` 的既有公开 API 保持向后兼容。

本版本只增加可选能力（Roadmap 批次 1–5）：

- 新组件：InputOTP、TagsInput、MaskInput、ScrollArea、Masonry、AspectRatio、ContextMenu、NavigationMenu、PageHeader、Kbd、Highlight、SplitButton、Marquee、ImageCompare、LoadingBar（及对应子组件入口）。
- 既有组件增强：Cascader / TreeSelect 新增可选 `virtual`（默认 `false`），默认非虚拟渲染不变。

未使用这些新组件或未打开虚拟化的现有代码不需要改动。完整条目见 [CHANGELOG.md](../CHANGELOG.md#v210)。

## v2.0.19

补记条目：v2.0.19 是 patch 号，但 `@expcat/tigercat-mcp` 有两处需要用户处理的行为变化。**只影响直接使用 MCP 包的项目**；`@expcat/tigercat-core` / `-vue` / `-react` / `-cli` 的公开 API 无变化，组件用户无需任何改动。

### `@expcat/tigercat-mcp` 无参调用默认改为远程

此前无参调用会从当前工作目录向上查找 Tigercat 仓库根，读本地 `skills/`；现在默认从 GitHub Pages（`https://expcat.github.io/Tigercat/mcp/`）拉取。内部辅助 `findTigercatRoot` 已移除，不再有「自动发现仓库根」的行为。

受影响的是把 MCP 当库调用、且依赖自动发现本地 skills 的代码 —— 它现在会改走网络，在离线或 CI 沙箱中会失败：

```ts
// v2.0.19 前：在仓库内无参调用会自动找到仓库根并读本地 skills
await loadSkillIndex()
await diagnoseTigercatMcp()

// v2.0.19 起：需要显式传入仓库根才走本地
await loadSkillIndex(repoRoot) // 等价于 { root: repoRoot }
await diagnoseTigercatMcp({ root: repoRoot })
```

命令行同理：仓库开发与离线场景显式传 `--root`，镜像站用 `--base-url` 或环境变量 `TIGERCAT_MCP_BASE_URL`。

```bash
npx tigercat-mcp --root /path/to/Tigercat
```

### MCP 工具响应结构改为指针 + 小节

`routeTigercatTask` 现在内联并去重 sources，长引用通过 `createReferencePointer` 以会话级背景文档的指针形式返回，而不再内联全文；引用可按 markdown 小节抽取。响应体积显著下降，但**解析响应结构的消费方需要适配**：不能再假设引用正文一定内联在工具返回里，需按指针取背景文档。仅通过 MCP 客户端把结果交给 LLM 消费的用法不受影响。

## v2.0.0

v2.0.0 正式版（与 v2.0.0-rc.2 公开 API 一致）。从 v1.x 升级请按本条目执行：core / React / Vue 发布面已切换为 ESM-only；React / Vue component 子路径已收敛为 PascalCase 显式 exports；tree-shaking 副作用声明、deprecated / compat API、legacy token / icon path 兼容层、示例与 references 均已按下列迁移路径收口。依赖 CommonJS `require()` 加载 Tigercat 包或 core 子路径的项目需要改用 ESM `import`。

### 锚点浮层 DOM 挂载层级

Select、DatePicker、Dropdown、Tooltip 等锚点浮层现在默认挂载到最近的 Modal/Drawer layer host；不在 overlay layer 中时挂载到 `document.body`。因此浮层不会参与 Modal/Drawer 内容区布局，也不会被内容区的 `overflow` 裁剪。嵌套 Modal/Drawer、自定义 `zIndex`、滚动和视口边缘碰撞由组件库自动处理，不需要业务侧追加 `overflow: visible`、提高局部 `z-index` 或判断 Modal 上下文。

如果测试或业务 CSS 曾依赖“浮层是触发器 DOM 子节点”，请改为使用组件公开的 ARIA/`data-tiger-*` 标识或从 `document.body` 查询；不要用父子选择器控制浮层。Dropdown `portal={false}` / `:portal="false"` 与 Menu `popupPortal={false}` / `:popup-portal="false"` 仍保留原有就地挂载语义，但定位与 dismiss 仍由同一基础设施执行。表单组件不新增 `portal` 属性。

旧组件私有定位工具 `positionMentionsDropdown`、`PositionMentionsDropdownOptions` 与 `getSubmenuPopupZIndex` 已删除。应用不应直接调用这些工具；请使用 Mentions/Menu 组件，由统一浮层层负责定位与层级。

### React / Vue component 子路径改为显式 PascalCase

React / Vue 根入口 named exports 保持可用：

```ts
import { Button } from '@expcat/tigercat-react'
```

但生产应用中推荐组件 value imports 使用 PascalCase 子路径，让 bundler 更容易在路由或交互边界拆包：

```diff
- import { Button, DatePicker } from '@expcat/tigercat-react'
+ import { Button } from '@expcat/tigercat-react/Button'
+ import { DatePicker } from '@expcat/tigercat-react/DatePicker'
```

```diff
- import { Button, DatePicker } from '@expcat/tigercat-vue'
+ import { Button } from '@expcat/tigercat-vue/Button'
+ import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
```

hooks/composables、`Message` / `notification` 命令式 API、共享类型和 core 工具仍可从根入口或 `@expcat/tigercat-core` 导入。

组件子路径现在只声明 PascalCase 入口；如果项目曾借助旧通配 exports 导入非 PascalCase 路径，请改为组件名路径：

```diff
- import { Button } from '@expcat/tigercat-react/button'
+ import { Button } from '@expcat/tigercat-react/Button'
```

### Basic / Layout 轻量组件类型别名合并

core 不再导出等同 shared contracts 的轻量组件类型别名：

- `SpaceDirection` / `SpaceAlign` → `BaseLayoutProps['direction']` / `BaseLayoutProps['align']`
- `CardDirection` → `BaseLayoutProps['direction']`
- `StatisticSize` / `DescriptionsSize` / `ListSize` → `ComponentSize`

```diff
- import type { SpaceDirection, StatisticSize } from '@expcat/tigercat-core'
+ import type { BaseLayoutProps, ComponentSize } from '@expcat/tigercat-core'

- const direction: SpaceDirection = 'horizontal'
- const size: StatisticSize = 'md'
+ const direction: BaseLayoutProps['direction'] = 'horizontal'
+ const size: ComponentSize = 'md'
```

`ButtonSize`、`AvatarSize`、`TextSize` 和 `SkeletonShape` 仍保留，因为它们不是 `ComponentSize` / `BaseLayoutProps` 的简单重复。

### Form primitives 受控模型与尺寸类型收敛

core 不再导出等同 `ComponentSize` 的表单基础组件尺寸别名：

- `InputSize` / `TextareaSize`
- `CheckboxSize` / `RadioSize` / `SwitchSize`
- `SliderSize` / `SegmentedSize` / `StepperSize` / `ColorSwatchSize`

请直接使用 `ComponentSize`：

```diff
- import type { InputSize, SwitchSize } from '@expcat/tigercat-core'
+ import type { ComponentSize } from '@expcat/tigercat-core'

- const size: InputSize = 'md'
+ const size: ComponentSize = 'md'
```

Vue Checkbox、Radio、Switch 的单体受控状态改为默认 `v-model`；`defaultChecked` / `update:checked` / `v-model:checked` 不再保留：

```diff
- <Switch v-model:checked="enabled" />
- <Radio value="agree" v-model:checked="agreed" />
- <Checkbox :default-checked="true" />
+ <Switch v-model="enabled" />
+ <Radio value="agree" v-model="agreed" />
+ <Checkbox :default-value="true" />
```

Vue RadioGroup 也从 `v-model:value` 收敛为默认 `v-model`。`Radio` 的 `value` 仍表示选项值，不表示单体 checked 状态：

```diff
- <RadioGroup v-model:value="choice">
+ <RadioGroup v-model="choice">
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
  </RadioGroup>
```

React Checkbox、Radio、Switch 保持 React 惯用的 `checked` / `defaultChecked` / `onChange`。

### Form composite selectors 搜索、空态与尺寸类型收敛

core 不再导出等同 `ComponentSize` 的表单复合组件尺寸别名：

- `SelectSize` / `TreeSelectSize` / `CascaderSize` / `AutoCompleteSize`
- `DatePickerSize` / `TimePickerSize` / `TransferSize` / `ColorPickerSize`
- `InputGroupSize` / `FormSize`

请直接使用 `ComponentSize`：

```diff
- import type { SelectSize, FormSize } from '@expcat/tigercat-core'
+ import type { ComponentSize } from '@expcat/tigercat-core'

- const selectSize: SelectSize = 'md'
+ const selectSize: ComponentSize = 'md'
```

DatePicker / TimePicker 只保留一个 public model surface。此前区分 single / range 的 public aliases 已删除：

```diff
- import type { DatePickerSingleValue, TimePickerRangeValue } from '@expcat/tigercat-core'
+ import type { DatePickerModelValue, TimePickerModelValue } from '@expcat/tigercat-core'
```

Select、TreeSelect、Cascader、AutoComplete、Transfer 的搜索受控量统一为 `searchValue` / `defaultSearchValue`。React 回调统一为 `onSearchChange`：

```diff
- <Select showSearch onSearch={setSearch} noOptionsText="No matches" />
+ <Select searchable onSearchChange={setSearch} emptyText="No matches" />
```

```diff
- <Transfer showSearch onSearch={(side, value) => setSearch(side, value)} notFoundText="No data" />
+ <Transfer
+   searchable
+   searchValue={{ source: sourceSearch, target: targetSearch }}
+   onSearchChange={(next) => setSearch(next)}
+   emptyText="No data"
+ />
```

Vue 对应使用 `v-model:search-value` / `search-change`，空态文案统一为 `empty-text`：

```diff
- <TreeSelect show-search @search="setSearch" not-found-text="No matches" />
+ <TreeSelect searchable @search-change="setSearch" empty-text="No matches" />
```

```diff
- <AutoComplete v-model="value" @search="setSearch" not-found-text="No results" />
+ <AutoComplete v-model="value" v-model:search-value="search" empty-text="No results" />
```

未显式传入 `emptyText` / `empty-text` 时，空态文案继续按组件 locale、ConfigProvider locale 和英文默认值解析。旧 `notFoundText`、`noOptionsText`、`noDataText` 不再保留。

Upload 的上传队列、分片和断点续传 helper 已从内部 `upload-utils` 拆入 `upload-queue-utils`。根入口 named exports 保持可用；仅需要选择、拖拽、文件状态或样式 helper 的场景不会再因为基础 Upload helper 拉入队列 / 分片逻辑：

```diff
- import { getUploadItemStatusClasses, runUploadQueue } from '@expcat/tigercat-core'
+ import { getUploadItemStatusClasses } from '@expcat/tigercat-core'
+ import { runUploadQueue } from '@expcat/tigercat-core'
```

### Navigation 受控回调与子组件子路径收敛

React Navigation 组件的非表单受控量统一使用 `on<Prop>Change`。Tabs / ScrollSpy 不再使用通用 `onChange` 作为 active key 受控出口：

```diff
- <Tabs activeKey={tab} onChange={setTab}>
+ <Tabs activeKey={tab} onActiveKeyChange={setTab}>
    <TabPane tabKey="overview" label="Overview">...</TabPane>
  </Tabs>
```

```diff
- <ScrollSpy activeKey={section} onChange={setSection} items={items} />
+ <ScrollSpy activeKey={section} onActiveKeyChange={setSection} items={items} />
```

Menu 搜索回调与 Form composite search API 一致，React 使用 `onSearchChange`：

```diff
- <Menu searchable searchValue={query} onSearch={setQuery} items={items} />
+ <Menu searchable searchValue={query} onSearchChange={setQuery} items={items} />
```

Menu / Tree 的受控 key 状态使用专门的 key-change 回调；原来的交互事件仍保留，用于读取节点、是否展开、选中原因等上下文：

```diff
  <Menu
    selectedKeys={selectedKeys}
    openKeys={openKeys}
-   onSelect={(key) => setSelectedKeys([key])}
-   onOpenChange={(_, info) => setOpenKeys(info.openKeys)}
+   onSelectedKeysChange={setSelectedKeys}
+   onOpenKeysChange={setOpenKeys}
  />
```

```diff
  <Tree
    expandedKeys={expandedKeys}
    selectedKeys={selectedKeys}
    checkedKeys={checkedKeys}
-   onExpand={setExpandedKeys}
-   onSelect={setSelectedKeys}
-   onCheck={setCheckedKeys}
+   onExpandedKeysChange={setExpandedKeys}
+   onSelectedKeysChange={setSelectedKeys}
+   onCheckedKeysChange={setCheckedKeys}
  />
```

Vue 端继续使用框架惯用的 `update:*` / `v-model:*` 与 kebab-case 事件，例如 `v-model:active-key`、`v-model:selected-keys`、`v-model:open-keys`、`v-model:expanded-keys`。

Navigation 子组件的 PascalCase package subpath 保持可用，但现在直接指向父组件产物，避免发布包为子组件 shim 生成额外入口：

```ts
import { MenuItem } from '@expcat/tigercat-react/MenuItem'
import { TabPane } from '@expcat/tigercat-vue/TabPane'
```

源码级深路径（如 `packages/react/src/components/MenuItem`）不再保留；库内部或源码级集成应从父组件文件导入。

### Pagination 页容量事件与 simple 样式 helpers 收敛

Pagination 页容量变更只通过 React `onPageSizeChange` / Vue `page-size-change` 通知，并携带调整后的页码；即使当前页因总页数减少而被收敛，也不再额外触发页面导航 `onChange` / `change`。若业务侧此前依赖 `onChange` / `change` 同步感知页容量变更，请改为监听页容量事件。

core 已移除仅供旧 Table/List 简易分页拼装的 `getSimplePaginationContainerClasses`、`getSimplePaginationTotalClasses`、`getSimplePaginationControlsClasses`、`getSimplePaginationSelectClasses`、`getSimplePaginationButtonClasses`、`getSimplePaginationPageIndicatorClasses` 与 `getSimplePaginationButtonsWrapperClasses`。业务代码请直接渲染 React/Vue `Pagination`；确需自定义分页样式时，改用 `getPaginationContainerClasses`、`getPaginationButtonBaseClasses`、`getPaginationEllipsisClasses`、`getTotalTextClasses` 或 `getBuiltInPaginationContainerClasses`。

### Data / Table 数据、选择与虚拟滚动入口收敛

VirtualTable 与 Table 的数据入口统一为 `dataSource`。VirtualTable 不再保留旧的 `data` / `rowHeight` / `height` 命名：

```diff
- <VirtualTable data={rows} rowHeight={40} height={320} />
+ <VirtualTable dataSource={rows} virtualItemHeight={40} virtualHeight={320} />
```

Vue 对应使用 kebab-case：

```diff
- <VirtualTable :data="rows" :row-height="40" :height="320" />
+ <VirtualTable :data-source="rows" :virtual-item-height="40" :virtual-height="320" />
```

VirtualTable 选择状态统一复用 Table 的 `rowSelection.selectedRowKeys` 模型。React 使用 `onSelectionChange(selectedKeys)` 接收选择结果：

```diff
- <VirtualTable selectable selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])} />
+ <VirtualTable
+   rowSelection={{ selectedRowKeys }}
+   onSelectionChange={setSelectedKeys}
+ />
```

Vue 使用 `row-selection`，并可监听 `selection-change` 或使用 `v-model:row-selection`：

```diff
- <VirtualTable selectable :selected-keys="selectedKeys" @select="selectRow" />
+ <VirtualTable
+   :row-selection="{ selectedRowKeys }"
+   @selection-change="selectedKeys = $event"
+ />
```

Table 自动虚拟化和推荐态只保留一个阈值 `virtualThreshold`；`autoVirtualThreshold` 不再保留。`virtual=true` 仍强制启用虚拟滚动，`autoVirtual=false` 时达到阈值只暴露推荐状态：

```diff
- <Table :data-source="rows" :auto-virtual-threshold="10000" :virtual-threshold="1000" />
+ <Table :data-source="rows" :virtual-threshold="1000" />
```

core 不再导出与 Table 类型重复的泛型接口：

- `GenericTableColumn<T>` → `TableColumn<T>`
- `GenericRowSelection<T>` → `RowSelectionConfig<T>`
- `GenericExpandable<T>` → `ExpandableConfig<T>`
- `GenericTableProps<T>` → `TableProps<T>`

```diff
- import type { GenericTableProps, GenericTableColumn } from '@expcat/tigercat-core'
+ import type { TableProps, TableColumn } from '@expcat/tigercat-core'
```

### Composite / business 组件数据模型与回调收敛

Kanban 复用 TaskBoard 的卡片、列与移动事件数据模型；不再导出并行的 `Kanban*` 类型别名：

- `KanbanCard` → `TaskBoardCard`
- `KanbanColumn` → `TaskBoardColumn`
- `KanbanCardMoveEvent` → `TaskBoardCardMoveEvent`
- `KanbanColumnMoveEvent` → `TaskBoardColumnMoveEvent`

```diff
- import type { KanbanCard, KanbanColumn } from '@expcat/tigercat-core'
+ import type { TaskBoardCard, TaskBoardColumn } from '@expcat/tigercat-core'
```

`KanbanProps` 与 `KanbanSwimlane` 保留，Kanban 仍是 TaskBoard 的薄封装。

DataTableWithToolbar 的搜索 / 筛选 / 批量操作业务回调统一从 `toolbar` 配置发出，组件顶层不再保留 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction`。React 把这些回调移入 `toolbar`：

```diff
  <DataTableWithToolbar
    columns={columns}
    dataSource={rows}
-   toolbar={{ searchPlaceholder: '搜索' }}
-   onSearchChange={setKeyword}
-   onSearch={runSearch}
-   onFiltersChange={setFilters}
-   onBulkAction={handleBulk}
+   toolbar={{
+     searchPlaceholder: '搜索',
+     onSearchChange: setKeyword,
+     onSearch: runSearch,
+     onFiltersChange: setFilters,
+     onBulkAction: handleBulk
+   }}
    onPageChange={handlePageChange}
    onSelectionChange={setSelectedRowKeys}
  />
```

Vue 继续使用组件事件（无需迁移）：

```vue
<DataTableWithToolbar
  :columns="columns"
  :data-source="rows"
  :toolbar="{ searchPlaceholder: '搜索' }"
  @search-change="keyword = $event"
  @search="runSearch"
  @filters-change="filters = $event"
  @bulk-action="handleBulk" />
```

`onPageChange` / `onPageSizeChange` / `onSelectionChange`（Vue `@page-change` / `@page-size-change` / `@selection-change`）等分页与表格回调仍是组件顶层 API。core composite 类型文件已按组件拆分，但公共类型导出经 `@expcat/tigercat-core` 根入口保持不变，无需调整 import 路径。

### Charts 类型拆分、datum 别名与 ChartTooltip open 收敛

Charts 类型已按职责拆分为 `chart-core`、`chart-cartesian`、`chart-radial`、`chart-visualization` 内部类型文件；公共导入路径保持不变，继续从 `@expcat/tigercat-core`、`@expcat/tigercat-react` 或 `@expcat/tigercat-vue` 导入。

core 不再导出仅重复现有数据结构的 `AreaChartDatum` / `DonutChartDatum`：

```diff
- import type { AreaChartDatum, AreaChartSeries } from '@expcat/tigercat-core'
+ import type { LineChartDatum, AreaChartSeries } from '@expcat/tigercat-core'

- const data: AreaChartDatum[] = []
+ const data: LineChartDatum[] = []
```

```diff
- import type { DonutChartDatum } from '@expcat/tigercat-core'
+ import type { PieChartDatum } from '@expcat/tigercat-core'

- const data: DonutChartDatum[] = []
+ const data: PieChartDatum[] = []
```

独立 `ChartTooltip` 使用 `open` 表示显示状态；高阶图表组件的内置 tooltip 开关仍是 `showTooltip`：

```diff
- <ChartTooltip content="Value: 42" visible={open} x={120} y={80} />
+ <ChartTooltip content="Value: 42" open={open} x={120} y={80} />
```

```diff
- <ChartTooltip content="Value: 42" :visible="open" :x="120" :y="80" />
+ <ChartTooltip content="Value: 42" :open="open" :x="120" :y="80" />
```

### Carousel 索引改为受控模型

`Carousel` 移除 `initialSlide`，改为与其他非表单受控量一致的 `currentIndex` 模型。

React:

```diff
- <Carousel initialSlide={1} />
+ <Carousel defaultCurrentIndex={1} />
```

```tsx
<Carousel currentIndex={index} onCurrentIndexChange={setIndex} />
```

Vue:

```diff
- <Carousel :initialSlide="1" />
+ <Carousel :defaultCurrentIndex="1" />
```

```vue
<Carousel v-model:current-index="index" />
```

### Feedback / overlay open 与 close lifecycle 收敛

Tooltip、Popover、Popconfirm 等 overlay 组件统一使用 `open` 命名；旧 React source hook `usePopup` 已删除，不再提供 `visible` / `defaultVisible` / `onVisibleChange` 合约。

React:

```diff
- <Tooltip visible={open} onVisibleChange={setOpen} />
+ <Tooltip open={open} onOpenChange={setOpen} />
```

Vue:

```diff
- <Tooltip v-model:visible="open" />
+ <Tooltip v-model:open="open" />
```

Drawer 关上默认会播滑出，然后 hidden 或卸载。删掉 `deferDestroyOnClose`：`destroyOnClose` 自己等关场结束再卸。

```diff
- <Drawer destroyOnClose deferDestroyOnClose onAfterClose={handleAfterClose} />
+ <Drawer destroyOnClose onAfterClose={handleAfterClose} />
```

```diff
- <Drawer destroy-on-close defer-destroy-on-close @after-close="handleAfterClose" />
+ <Drawer destroy-on-close @after-close="handleAfterClose" />
```

Modal / Drawer 关闭名走官方 locale（en-US `Close` / `OK` / `Cancel`，不再是 Close + 确定 混用，Drawer 也不再是 `Close drawer`）。`mask={false}` 时空区点得透。`closable={false}` 只藏 X；关掉 Esc 请传 `keyboard={false}`。Vue 从主入口引 `ModalProps` / `DrawerProps`。React `ref` 接到 dialog。`placement` 可写 `start` / `end`。

Modal 现在也提供关闭后生命周期：React 使用 `onAfterClose`，Vue 使用 `@after-close`。外部受控 `open=false` 只表示状态变化，不再触发 close intent；需要记录用户关闭意图时继续监听 React `onClose` / Vue `close`，需要观察动画关闭完成时使用 `onAfterClose` / `after-close`。

```diff
- <Modal open={open} onClose={handleAnyClose} />
+ <Modal open={open} onClose={handleUserClose} onAfterClose={handleClosed} />
```

Vue Modal / Drawer 始终 teleport 到 `document.body`，测试中不再传 `disableTeleport`，请从 `document.body` 查询 overlay 内容。

### Message / notification 命令式 API 与容器入口拆分

React / Vue package 现在声明 `sideEffects: false`，普通 root named import 或组件子路径 import 可以被 bundler 摇掉未使用的命令式 Message / notification 挂载代码。

命令式 API 继续从根入口使用：

```ts
import { Message, notification } from '@expcat/tigercat-react'
```

如果只需要可渲染容器组件，请使用独立容器入口：

```ts
import { MessageContainer } from '@expcat/tigercat-react/MessageContainer'
import { NotificationContainer } from '@expcat/tigercat-react/NotificationContainer'
```

### Token CSS：三层 layered 名 + 运行时 `--tiger-*` 别名

`tokens.json` 是唯一事实源。`tokens.css` 同时输出：

- 三层 layered token：`--tiger-primitive-*` / `--tiger-semantic-*` / `--tiger-component-*`（Figma / 设计）
- 与组件相同的运行时别名：`--tiger-primary`、`--tiger-surface`、`--tiger-radius-md`、`--tiger-transition-base` …（`:root` 与 `.dark`）

覆盖旧 `--tiger-color-primary-*` 请改 layered 名。覆盖组件皮肤请改运行时 `--tiger-primary`（或 `ThemeManager` / plugin），不要再维护第二套 palette。

首屏用 Tailwind plugin 写出这些运行时名；`tokens.css` 不是另一套主题。

### Token JS API 移除 global / alias 兼容命名

core 不再导出 `globalColors` / `globalSpace` / `globalRadius` / `globalShadow` / `globalFont` / `globalDuration` / `globalEasing`、`aliasTokens` 及对应 `Global*` 类型别名：

```diff
- import { globalColors, aliasTokens } from '@expcat/tigercat-core'
+ import { primitiveColors, semanticTokens } from '@expcat/tigercat-core'
```

### Icon path 兼容别名改为分组命名

DatePicker / TimePicker 旧 icon path 别名已删除。请改用 picker icon 的 canonical 名称：

```diff
- import { CalendarIconPath, CloseIconPath, ClockIconPath } from '@expcat/tigercat-core'
+ import {
+   calendarSolidIcon20PathD,
+   closeSolidIcon20PathD,
+   clockSolidIcon20PathD
+ } from '@expcat/tigercat-core'
```

如果项目曾经导入内部 `common-icons` 兼容 barrel，请改为分组 icon 子路径：

```diff
- import { closeIconPathD } from '@expcat/tigercat-core/dist/utils/common-icons'
+ import { closeIconPathD } from '@expcat/tigercat-core/icons/common'
```

### DatePicker i18n 字符串查表改为显式 registry

`getDatePickerLabels(localeString)` 现在只返回英文 fallback，不再从 core 默认入口静态查找所有内置 DatePicker locale。这样 `DatePicker` 子路径和 `defineText` 可以完全裁剪未使用语言。

如果业务需要按运行时字符串在内置 DatePicker locale 中查表，请改用 registry 子路径：

```diff
- import { getDatePickerLabels } from '@expcat/tigercat-core'
+ import { getDatePickerLabelsFromLocale } from '@expcat/tigercat-core/datepicker-locales/registry'

- const labels = getDatePickerLabels(userLocale)
+ const labels = getDatePickerLabelsFromLocale(userLocale)
```

如果已经显式导入 DatePicker preset，则无需使用 registry：

```ts
import { ZH_CN_DATEPICKER_LOCALE } from '@expcat/tigercat-core/datepicker-locales/zh-CN'

const labels = getDatePickerLabels(ZH_CN_DATEPICKER_LOCALE)
```

### `defineText` 改为纯文本 overlay

`defineText(...)` 不再补齐 en-US 基线，也不会导入任何内置 locale pack。它只克隆并返回传入的 `TigerText`，适合单语言应用做全局自定义文案：

```ts
const text = defineText({ modal: { okText: 'Confirm' } })
```

需要完整 locale 对象时请使用 `defineLocale(...)`；需要 DatePicker 翻译时请显式传入 DatePicker preset：

```ts
const fr = defineLocale({
  locale: 'fr-FR',
  datePicker: FR_FR_DATEPICKER_LOCALE,
  common: { okText: 'OK' }
})
```

### 移除 `getResultHttpLabel`

core 已删除 v1.5.0 标记为废弃的 `getResultHttpLabel(status)`。该函数的返回值始终等于 HTTP status 本身；请使用 `isHttpResultStatus(status)` 判断后直接使用原 status。

```diff
- const label = getResultHttpLabel(status)
+ const label = isHttpResultStatus(status) ? status : undefined
```

### ImageGroup 预览回调统一为 open 命名

React `ImageGroup` 删除旧回调 `onPreviewVisibleChange`：

```diff
- <ImageGroup onPreviewVisibleChange={handlePreviewChange}>
+ <ImageGroup onPreviewOpenChange={handlePreviewChange}>
    <Image src="/photo.jpg" />
  </ImageGroup>
```

Vue `ImageGroup` 删除旧事件 `preview-visible-change`：

```diff
- <ImageGroup @preview-visible-change="handlePreviewChange">
+ <ImageGroup @preview-open-change="handlePreviewChange">
    <Image src="/photo.jpg" />
  </ImageGroup>
```

### Advanced / media 受控值与 viewer 合约收敛

core `NumberKeyboardProps` 不再包含 Vue 专属的 `modelValue` 字段。跨框架 shared contract 使用 `value` / `defaultValue`；React 继续通过 `onChange(value, payload)` 接收变化，Vue 组件仍支持默认 `v-model`。

```diff
- import type { NumberKeyboardProps } from '@expcat/tigercat-core'
- const props: NumberKeyboardProps = { modelValue: amount }
+ import type { NumberKeyboardProps } from '@expcat/tigercat-core'
+ const props: NumberKeyboardProps = { value: amount }
```

`ImagePreviewProps` 与 `ImageViewerProps` 继续作为两个 public surface 保留，但共享 `ImageViewerBaseProps` 的 `open` / `currentIndex` 合约。旧的 `visible` / `defaultIndex` / `onIndexChange` 不再作为 viewer API 使用。

```diff
- <ImageViewer images={images} currentIndex={i} onIndexChange={setI} />
+ <ImageViewer images={images} currentIndex={i} onCurrentIndexChange={setI} />
```

## v1.5.0

### 跨端 API 对称：受控量 / 事件回调统一命名

为消除受控量与事件回调的双端命名/对称不一致，以下三处做了破坏性改名。准则：受控 prop `X` → Vue `update:X`（可 `v-model:x`）/ React `on<X>Change`。

**ImageViewer（React）**：索引变更回调与受控 prop `currentIndex` 对齐。

```diff
- <ImageViewer images={images} currentIndex={i} onIndexChange={setI} />
+ <ImageViewer images={images} currentIndex={i} onCurrentIndexChange={setI} />
```

**CommentThread（Vue）**：展开事件改为受控量 `update:expandedKeys`，可直接 `v-model`。

```diff
- <CommentThread :nodes="nodes" :expanded-keys="keys" @expand-change="keys = $event" />
+ <CommentThread :nodes="nodes" v-model:expanded-keys="keys" />
```

```diff
  <!-- 或显式监听 -->
- <CommentThread :nodes="nodes" @expand-change="onChange" />
+ <CommentThread :nodes="nodes" @update:expanded-keys="onChange" />
```

> React 端回调名保持不变（`onExpandedChange`），对应同一个受控量 `expandedKeys`；不要改成 `onExpandedKeysChange`。

**Spotlight（Vue）**：移除冗余的 `close` 事件，统一用 `open-change`（`open-change(false)` 即关闭）。

```diff
- <Spotlight :items="items" @close="onClose" />
+ <Spotlight :items="items" @open-change="(open) => { if (!open) onClose() }" />
```

> 仍支持 `v-model:open`，关闭时会发 `update:open(false)` 与 `open-change(false)`。

### React `useControlledState` 升级为回调透传版（返回 2-tuple）

React 公共 hook `useControlledState` 升级为合并 `onChange` 的版本（参照 Ant Design `useMergedState` / Radix `useControllableState`）：

- 返回值由 3-tuple `[value, setValue, isControlled]` 收敛为 2-tuple `[value, setValue]`。
- 新增可选第三参 `onChange`；返回的 `setValue(next, ...args)` 在**非受控**时写内部 state，并在两种模式下**始终**调用 `onChange?.(next, ...args)`。
- `setValue` 还支持 updater 形式 `setValue(prev => next)`，并保持稳定引用（identity）。

绝大多数使用者只消费返回的 `value` 与 setter，无需改动。若你此前读取了第三个返回值 `isControlled`，请自行派生；若你此前手写了「非受控才写内部 + 调用 `onChange`」的样板，可改为把 `onChange` 交给 hook：

```diff
- const [value, setValue, isControlled] = useControlledState(controlledValue, defaultValue)
- const handleChange = (next) => {
-   if (!isControlled) setValue(next)
-   onChange?.(next)
- }
+ const [value, setValue] = useControlledState(controlledValue, defaultValue, onChange)
+ const handleChange = (next) => setValue(next)
```

```diff
  // 仍需要 isControlled 时自行派生（与 hook 内部判定一致）：
+ const isControlled = controlledValue !== undefined
```

> 注意：旧版 setter（`setInternalValue`）无论受控与否都会写内部 state；新版 `setValue` 在受控模式下不再写内部 state（由父组件持有值），与受控语义一致。

### 移除废弃别名 `kanbanAddCardClasses`

core 移除了废弃别名 `kanbanAddCardClasses`。它自 v0.9.0 起仅是 `taskBoardAddCardClasses` 的向后兼容别名，现已删除。请直接使用 `taskBoardAddCardClasses`：

```diff
- import { kanbanAddCardClasses } from '@expcat/tigercat-core'
+ import { taskBoardAddCardClasses } from '@expcat/tigercat-core'
```

> 说明：本次同时把 core 内部目录 `src/theme/` 重命名为 `src/theme-runtime/`（以区别于命名预设主题目录 `src/themes/`）。该重命名不影响公共 API——`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 等仍从主入口 `@expcat/tigercat-core` 导出，无需迁移。

### Dropdown 菜单默认渲染到 body

Dropdown 菜单包装层默认通过 React portal / Vue Teleport 渲染到 `document.body`（zIndex 1000），与 Tooltip / Popover / Popconfirm 等浮层组件保持一致。展开的菜单不会再被表格固定列（sticky 单元格）遮挡，也不会被 `overflow` 滚动容器裁剪——表格固定操作列中的行内菜单无需再用全局 CSS 覆盖 z-index。

需要处理的场景：

- **依赖菜单 DOM 层级的样式选择器**（如 `.tiger-dropdown-container > .absolute`）：菜单不再是触发器容器的子节点。推荐改用菜单包装层新增的 `data-tiger-dropdown-menu` 属性查询；或设置 `portal: false` 恢复旧 DOM 结构。
- **测试中查询菜单节点**：从 `document.body`（React testing-library 的 `baseElement`）查询，而不是组件 `container`。

```diff
- container.querySelector('.tiger-dropdown-container > .absolute')
+ document.querySelector('[data-tiger-dropdown-menu]')
```

完全恢复旧行为：

```diff
- <Dropdown trigger="click">
+ <Dropdown trigger="click" portal={false}>   <!-- Vue: :portal="false" -->
```

## v1.2.0

v1.2.0 移除了上一阶段保留的 Image 预览可见性旧命名。请统一使用 `open` 语义，保持 Vue 与 React API 对齐。

### ImagePreview

```diff
- <ImagePreview :visible="showPreview" />
+ <ImagePreview :open="showPreview" />
```

### Image Vue 事件

```diff
- <Image @preview-visible-change="handlePreviewChange" />
+ <Image @preview-open-change="handlePreviewChange" />
```

### Image React 回调

```diff
- <Image onPreviewVisibleChange={handlePreviewChange} />
+ <Image onPreviewOpenChange={handlePreviewChange} />
```

## v1.0.0

Vue 事件命名统一为 kebab-case。

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

## v0.5.0

弹出层可见性统一使用 `open` / `update:open` / `onOpenChange`，Button 原生按钮类型使用 `htmlType`。

```diff
- <Modal :visible="open" />
+ <Modal :open="open" />

- <Button type="submit" />
+ <Button htmlType="submit" />
```
