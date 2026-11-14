# 01 共性根因

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [共性根因](01-shared-root-causes.md) · [波次](14-waves.md) · [证据](13-evidence.md)

同一个根因在很多组件的报告里重复出现。这里把它们收成 13 个任务（S01–S13），共 42 条发现加 1 条沿用任务（T01），全部排在 W0。修一处，再按并入清单逐个组件验，不在各组件里分别打补丁。

## 目标

- 每个根因只改一处源头：生成器、Core helper，或两端共用的写法。
- 并入清单里的组件全部验过才算做完。

## 非目标

- 不在这一波处理各组件自己的条目，那些在 02–12。
- 不手改生成物。S01–S03 改完重跑生成器。

## 依赖与顺序

- S01、S02、S03 改同一个生成器，一批做，只重跑一次 `pnpm docs:api` 和 `pnpm mcp:build`。各组件文档类条目里要重跑生成器的，等这一批之后再做。
- S04、S05 改主题运行时和 token 生成器，一批做。
- S06 先于各组件的 i18n 条目。
- S07–S10 是两端的同一种写法问题，可以按组件分给多人并行，但每个 S 要先在主发现的组件上定好写法。
- 「并入」的意思是那份组件报告确认了同一个问题。清单来自各报告的归并记录，个别组件只是部分适用，以报告原文为准。

## 总表

| 任务 | 根因                                    | 主发现                                  | 波及组件数 |
| ---- | --------------------------------------- | --------------------------------------- | ---------- |
| S01  | 生成器：compact Props 表漏列公开字段    | C040-F01、X04-F02                       | 130        |
| S02  | 生成器：示例目录靠组件名猜              | C025-F03、C006-F002                     | 49         |
| S03  | 生成器：Events 行被丢                   | C162-F03、C160-F04                      | 6          |
| S04  | 过渡 shorthand 只有最后一项拿到时长     | X02-F001                                | 50         |
| S05  | 运行时主题 scope 盖掉辅助媒体偏好       | X02-F002                                | 7          |
| S06  | W9 辅助文案绕过标准 locale              | X02-F003                                | 44         |
| S07  | 根节点 style 与原生属性没有透传         | C056-F04                                | 38         |
| S08  | 数值 0 被真值判断吞掉                   | C039-F03                                | 28         |
| S09  | 内部事件处理器盖掉调用方监听            | C067-F02                                | 18         |
| S10  | 受控值被父级拒收后，显示和提交值分离    | C056-F01                                | 14         |
| S11  | 运行时回退把原型继承键当成合法值        | C004-F001、C003-F003、C002-F002 等 5 条 | 10         |
| S12  | Vue 动态 class 停在初始值               | C089-F01                                | 6          |
| S13  | Vue 手写导出的 Props 类型与运行时不一致 | C022-F03、C034-F04、C048-F02 等 23 条   | 23         |

## S01 生成器：compact Props 表漏列公开字段

**现状。** `scripts/lib/docs-api.mjs` 里 `MAX_COMPACT_PROPS = 4`。必填之外只按手写的优先字段补到 4 行，其余公开 prop 不进 compact 表，MCP 回包跟着缺。`Pick` / `Omit` 的类型参数又被整份当成父接口合并，Space、Popconfirm、SchemaForm、Gantt、OrgChart 的分母偏大。

**做法。** 改生成器的取行规则和 heritage 展开，不逐个组件补优先字段。规则要先定（见 [14](14-waves.md#开工前要先定方向的条目)）。改完重跑 `pnpm docs:api` 与 `pnpm mcp:build`，不手改生成物。

**做完的标准。** 各报告点名的漏列字段能在生成页或它链到的完整页里查到；五个分母与下表一致；`pnpm docs:api:check` 通过。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                          | 验收                                                                  |
| -------- | ---- | ---- | ----------- | ---- | --------------------------------------------- | --------------------------------------------------------------------- |
| C040-F01 | P2   | W0   | 文档·生成器 | 文档 | compact props 与 MCP 未列出公开 size          | footer.md 与 MCP Footer 回包列出 size 的 default/compact 取值与默认值 |
| X04-F02  | P2   | W0   | 文档·生成器 | 文档 | `Pick` / `Omit` 排除的字段仍计入 compact 分母 | 分母变为 Space 5、Popconfirm 17、SchemaForm 29、Gantt 33、OrgChart 25 |

并入的组件（129）：ActivityFeed、Alert、Anchor、AppShell、AreaChart、AutoComplete、BackTop、BarChart、Breadcrumb、BreadcrumbItem、Calendar、Cascader、ChartAxis、ChartCanvas、ChartGrid、ChartLegend、ChartSeries、ChartTooltip、ChatWindow、Checkbox、CheckboxGroup、CodeEditor、Collapse、CollapsePanel、ColorPicker、ColorSwatch、CommentThread、ContextMenu、Countdown、CronEditor、DataExport、DataTableWithToolbar、DatePicker、Drag、Drawer、Dropdown、DropdownItem、FileManager、FloatButton、FloatButtonGroup、Form、FormItem、FormWizard、FullscreenButton、FunnelChart、Gantt、GaugeChart、Header、HeatmapChart、ImageAnnotation、InfiniteScroll、Input、InputNumber、InputOTP、Layout、LineChart、List、Loading、LoadingBar、LoadingBarContainer、MarkdownEditor、MaskInput、Masonry、Mentions、Menu、MenuItem、MenuItemGroup、Message、Modal、NavigationMenu、NavigationMenuItem、NavigationMenuLink、NavigationMenuTrigger、NotificationCenter、NotificationContainer、NumberKeyboard、OrgChart、PageHeader、Pagination、PieChart、Popconfirm、Popover、PrintLayout、Progress、RadarChart、Radio、RadioGroup、Resizable、RichTextEditor、SankeyChart、ScatterChart、SchemaForm、ScrollArea、ScrollSpy、Select、Sidebar、Signature、Skeleton、Slider、Space、Splitter、Spotlight、Steps、StepsItem、SubMenu、SunburstChart、Switch、TabPane、Table、Tabs、TagsInput、TaskBoard、Textarea、TimePicker、Timeline、Tooltip、Tour、Transfer、Tree、TreeMapChart、TreeSelect、VirtualList、VirtualTable、WaterfallChart、WorkflowActionBar、WorkflowDesigner、WorkflowDetailShell、WorkflowTimeline、WorkflowViewer。专题 X03、X04 的报告也并入了这一条。

## S02 生成器：示例目录靠组件名猜

**现状。** 生成器用 `pascalToKebab(组件名)` 拼示例目录，不读真实的 Demo 注册。X03 统计 185 条示例文档里 98 条路径不存在，涉及 49 个目录名：QRCode、DatePicker、BackTop、TimePicker、TreeMapChart 的目录名对不上，另外 44 个子组件本来就没有独立示例。

**做法。** 路径取自现存的 Demo 注册事实；组合组件和子组件指向父组件里真实消费它的 Demo。不改示例目录名，不手改生成物。

**做完的标准。** 示例文档与 MCP 回包里的 Runnable modules 路径全部存在。

| 编号      | 级别 | 波次 | 端          | 类别 | 条目                                              | 验收                                                                        |
| --------- | ---- | ---- | ----------- | ---- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| C025-F03  | P2   | W0   | 文档·生成器 | 文档 | 生成示例文档与 MCP 指向不存在的 qr-code Demo 目录 | 示例文档与 MCP 的 Runnable modules 指向实际存在的 src/examples/qrcode/ 目录 |
| C006-F002 | P2   | W0   | 文档·生成器 | 文档 | 示例文档指向不存在的 avatar-group 目录            | avatar-group.md 的 runnable modules 指向两端真实存在的 avatar/03、avatar/04 |

并入的组件（47）：AnchorLink、BackTop、BreadcrumbItem、ButtonGroup、ChartAxis、ChartCanvas、ChartGrid、ChartLegend、ChartSeries、ChartTooltip、CheckboxGroup、Col、CollapsePanel、Container、Content、ContextMenuItem、ContextMenuMenu、ContextMenuSub、DatePicker、DropdownItem、DropdownMenu、FloatButtonGroup、Footer、FormItem、Header、ImageGroup、InputGroupAddon、LoadingBarContainer、MenuItem、MenuItemGroup、MessageContainer、NavigationMenuContent、NavigationMenuItem、NavigationMenuLink、NavigationMenuList、NavigationMenuTrigger、NotificationContainer、PrintPageBreak、RadioGroup、Row、Sidebar、StepsItem、SubMenu、TabPane、TimePicker、TreeMapChart、WorkflowActionBar。专题 X03、X04 的报告也并入了这一条。

## S03 生成器：Events 行被丢

**现状。** `on*` 成员先被标成 event，`frameworkOwn` 又只留 prop，事件在合并前就丢了。生成器只索引以 `Props` 结尾的接口，拿不到 `UseDragOptions` 的成员；继承子句还把类型参数约束拼进了父类型名。

**做法。** 事件成员保留到 `eventRows`；Vue 的 emits 写进导出类型，或由生成器读取。不靠改名绕过。

**做完的标准。** 下表两页有 Events 行；InfiniteScroll、MarkdownEditor、WorkflowDetailShell、WorkflowTimeline 的生成页同样列出回调。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                          | 验收                                                                                         |
| -------- | ---- | ---- | ----------- | ---- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| C162-F03 | P2   | W0   | 文档·生成器 | 文档 | 生成 Props 页整段缺 Events 行，五个回调未列出 | 生成页有 Events 行，含 onChange、onSelect、onToolChange、onReady、onError                    |
| C160-F04 | P2   | W0   | 文档·生成器 | 文档 | 生成 Props 页缺四个拖拽回调，基线继承文本拼坏 | Drag Props 页事件行含 onDragStart、onDragOver、onDrop、onDragEnd；基线继承文本不含拼坏的约束 |

并入的组件（4）：InfiniteScroll、MarkdownEditor、WorkflowDetailShell、WorkflowTimeline。

## S04 过渡 shorthand 只有最后一项拿到时长

**现状。** 运行时和 token 生成器把 8 个 property 的逗号串与单份 duration / easing 拼在一起，只有末项 `transform` 得到时长和 easing。

**做法。** 在运行时与生成器事实源里为每个 property 分别生成 duration / easing，重跑 `pnpm tokens:build`。[02](02-core-theme-i18n.md) 的 X01-F019、X01-F020 在同一段代码上，同批看。

**做完的标准。** 下表验收通过后，在并入清单里各抽一个组件核对计算样式。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                | 验收                                                                         |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| X02-F001 | P2   | W0   | Core | 样式 | 过渡 shorthand 仅最后的 transform 获得时长与 easing | Button/Input/InputOTP/InputNumber 等过渡的 8 项 transitionDuration 均为 0.2s |

并入的组件（50）：ActivityFeed、Alert、AssigneePicker、Button、ButtonGroup、Calendar、Checkbox、CheckboxGroup、ColorPicker、ColorSwatch、CommentThread、CopyButton、CronEditor、DataExport、DatePicker、Drawer、FloatButton、FloatButtonGroup、Inplace、Input、InputNumber、InputOTP、MaskInput、Mentions、Message、MessageContainer、Modal、NavigationMenu、NavigationMenuTrigger、NotificationBell、NotificationCenter、NotificationContainer、NumberKeyboard、Radio、RadioGroup、Select、Signature、Steps、StepsItem、Switch、TabPane、Tabs、TagsInput、TaskBoard、Textarea、TimePicker、Transfer、Tree、TreeSelect、Upload。

## S05 运行时主题 scope 盖掉辅助媒体偏好

**现状。** scope 写的是普通 preset 变量，没有同 scope 的媒体覆盖；reduce-motion、contrast、forced-colors 的变量只在 `:root, .dark` 上。经 ConfigProvider 就能走到。

**做法。** 让辅助媒体规则同样覆盖运行时 scope 和嵌套 scope，核对应用、切换、释放之后的计算值。

**做完的标准。** 见下表。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                            |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | ------------------------------------------------------------------------------- |
| X02-F002 | P2   | W0   | Core | 样式 | 运行时主题 scope 覆盖辅助媒体偏好的变量 | reduce 下 scope apply 后 duration 仍 0ms；contrast/forced-colors 变量保持媒体值 |

并入的组件（7）：Badge、Button、ButtonGroup、Code、ConfigProvider、CopyButton、Text。

## S06 W9 辅助文案绕过标准 locale

**现状。** W9 文案按 locale ID 选词典，或者直接写死英文，不走 TigerLocale 的合并与覆盖链。Select、TagsInput、AvatarGroup 等 44 个组件的报告并入了这一条。原路线图的「Cron 中文范围摘要」是同一件事的一部分，记为 T01。

**做法。** 把仍在用的文案纳入 TigerLocale，消费者读合并后的结果和标准覆盖规则，不再扩充按 locale ID 选词典的旁路。[02](02-core-theme-i18n.md) 的 X02-F004 同批看。

**做完的标准。** 见下表；并入清单里的组件在中文、法语 Provider 下不出英文，zh-TW 不出简体。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                                                                                        | 验收                                                                                 |
| -------- | ---- | ---- | --------- | ---- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| X02-F003 | P2   | W0   | Core+双端 | i18n | W9 辅助文案绕过标准 locale 与覆盖路径                                                                       | 中/法语 Provider 下 Select 全选按钮随之变化，zhTW 不出简体；TagsInput/AvatarGroup 同 |
| T01      | P2   | W0   | 双端      | i18n | Cron 中文范围摘要：当前说明是英文，分钟范围会展开全部值；复用既有 locale 与解析能力给出中文的范围和步长摘要 | 任意、指定、范围、步长的含义准确，0–59 保留范围语义，320px 可读，Vue 与 React 一致   |

并入的组件（44）：AssigneePicker、AutoComplete、Avatar、AvatarGroup、Badge、Calendar、Code、ColorPicker、ConfigProvider、ContextMenu、CronEditor、CropUpload、DatePicker、Drag、Drawer、Dropdown、DropdownItem、FileManager、Form、FormWizard、Gallery、Image、ImageCropper、ImageGroup、ImagePreview、LineChart、MarkdownEditor、NotificationBell、NumberKeyboard、Pagination、QRCode、RichTextEditor、SankeyChart、Select、Sidebar、Signature、Splitter、Table、TagsInput、TimePicker、Transfer、Tree、Upload、WaterfallChart。

## S07 根节点 style 与原生属性没有透传

**现状。** Vue 侧 `inheritAttrs: false` 之后根节点只绑了 class，style 和其余 attrs 丢失；React 侧不转发剩余属性。

**做法。** 先定每个组件的属性承载点（根或 trigger），再沿用现有的 attrs / style 合并 helper 转发。内部 ARIA 和事件的合并规则不动。

**做完的标准。** 并入清单里的每个组件：两端传 `style` 与 `data-*` 后，承载节点保留二者。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                             | 验收                                                         |
| -------- | ---- | ---- | ---- | ---- | -------------------------------- | ------------------------------------------------------------ |
| C056-F04 | P2   | W0   | 双端 | 行为 | 根样式及原生属性未按公开契约透传 | 两端传 margin:13px 与 data-probe=c056 后，SSR 根节点保留二者 |

并入的组件（37）：Anchor、AppShell、AreaChart、AssigneePicker、BarChart、Breadcrumb、ChartLegend、ChartTooltip、ColorSwatch、ContextMenuSub、CronEditor、DatePicker、FloatButton、FullscreenButton、FunnelChart、Gantt、GaugeChart、HeatmapChart、LineChart、MenuItemGroup、NavigationMenuContent、NavigationMenuItem、NotificationBell、NumberKeyboard、OrgChart、PieChart、RadarChart、ScatterChart、Select、SubMenu、SunburstChart、Switch、TabPane、TimePicker、Transfer、TreeMapChart、TreeSelect。

## S08 数值 0 被真值判断吞掉

**现状。** title、extra、children 这类内容槽用真值判断，合法的 `0` 不渲染，或者回退到别的数据源。

**做法。** 改成明确的存在性判断，把 `0` 和空值分开。

**做完的标准。** 并入清单里的每个组件：报告点名的内容槽传 `0` 时渲染出 0。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                  | 验收                                                                     |
| -------- | ---- | ---- | ---- | ---- | --------------------- | ------------------------------------------------------------------------ |
| C039-F03 | P2   | W0   | 双端 | 行为 | 数值 0 被真值判断吞掉 | 双端 title=0、extra=0 渲染出 0；React children=0 显示 0 而不回退到 items |

并入的组件（27）：Alert、BackTop、Breadcrumb、BreadcrumbItem、Calendar、CollapsePanel、Countdown、Drawer、FileManager、FloatButtonGroup、FormItem、Input、List、NotificationContainer、PageHeader、Popconfirm、Popover、PrintLayout、Progress、Radio、Spotlight、Steps、StepsItem、TabPane、Timeline、Tooltip、Upload。

## S09 内部事件处理器盖掉调用方监听

**现状。** 两端先展开调用方的 rest / attrs，再绑内部处理器，调用方传的同名监听不会被调用。

**做法。** 内部处理器链上调用方的回调（Vue 用 `callUnknownEventHandler`），内部处理顺序不变。

**做完的标准。** 并入清单里的每个组件：调用方传报告点名的原生事件监听，触发一次回调计数为 1，组件自身行为不变。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                | 验收                                                                                           |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| C067-F02 | P2   | W0   | 双端 | 行为 | 内部 paste/composition 处理器吞掉调用方原生事件回调 | 调用方传 onPaste、compositionstart/end 监听并触发事件时，两端回调计数各为 1 且掩码处理结果不变 |

并入的组件（17）：CodeEditor、ContextMenuSub、DropdownItem、FullscreenButton、ImageAnnotation、MarkdownEditor、Mentions、NavigationMenu、NavigationMenuLink、NavigationMenuTrigger、NumberKeyboard、SubMenu、TagsInput、Transfer、Upload、VirtualList、VirtualTable。

## S10 受控值被父级拒收后，显示和提交值分离

**现状。** 组件在父级接受之前就改了内部显示状态。父级保持原值时，同步逻辑不把显示还原。

**做法。** 受控模式下由外部值驱动已提交的显示，草稿和已提交分开，父级拒收后回到受控值。

**做完的标准。** 并入清单里的每个组件：`value` 固定且父级不改值，操作后可见值、输入框和 hidden 字段仍是原值。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                       | 验收                                                                           |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| C056-F01 | P2   | W0   | 双端 | 行为 | 受控提交被父级拒收后，显示颜色与提交值分离 | value=#ff0000 且父级不改值，点选绿色 preset 后色块、输入与 hidden 仍为 #ff0000 |

并入的组件（13）：CronEditor、Input、InputNumber、InputOTP、MaskInput、Mentions、Radio、RadioGroup、Signature、Switch、Textarea、Transfer、Upload。

## S11 运行时回退把原型继承键当成合法值

**现状。** Core 的映射表用 `in` 或直接索引普通对象，`toString`、`constructor`、`__proto__` 命中原型成员，结果是输出函数文本或直接抛错。

**做法。** 成员判断和取值只认映射自身的键，现有的非法输入回退行为不变。五处用同一种写法。

**做完的标准。** 见下表；Avatar、AvatarGroup、ButtonGroup、Card、AspectRatio 经共享 helper 受影响，一并核对。

| 编号      | 级别 | 波次 | 端   | 类别 | 条目                                     | 验收                                                                                   |
| --------- | ---- | ---- | ---- | ---- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| C004-F001 | P2   | W0   | Core | 行为 | Button 运行时回退误接收对象继承键        | variant/size 传 toString/constructor/`_\_proto__` 时回退 primary/md，无函数文本        |
| C003-F003 | P2   | W0   | Core | 行为 | 运行时回退把继承的原型属性名当作有效枚举 | size/weight/color 传 toString、`_\_proto__` 等继承键时回退 base/normal/default         |
| C002-F002 | P2   | W0   | Core | 行为 | 原型属性名称被当成图标定义，双端渲染抛错 | name 为 toString/constructor/`_\_proto__` 时两端同 missing-icon 输出空 span，不抛错    |
| C027-F01  | P2   | W0   | Core | 行为 | 未知状态回退误取继承属性，双端渲染抛错   | status 为 toString / constructor / `_\_proto__` 时颜色方案回退 info，双端 SSR 不再抛错 |
| C037-F01  | P2   | W0   | Core | 行为 | 原型继承键会生成无效 max-width           | maxWidth 运行时传 toString 或 constructor 时不输出 max-width，与普通未知值一样被忽略   |

并入的组件（5）：AspectRatio、Avatar、AvatarGroup、ButtonGroup、Card。

## S12 Vue 动态 class 停在初始值

**现状。** `setup` 里保存了第一次的 `attrs.class`，computed 一直合并旧值，render 又把当前 class 剔掉。

**做法。** 每次 render 读当前 `attrs.class`，再用现有 helper 合并。

**做完的标准。** 见下表；ContextMenuMenu、ContextMenuSub、Dropdown、DropdownItem、DropdownMenu 同样通过。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                        | 验收                                                                   |
| -------- | ---- | ---- | --- | ---- | --------------------------- | ---------------------------------------------------------------------- |
| C089-F01 | P2   | W0   | Vue | 行为 | Vue 的动态 class 保留初始值 | Item 的 class 由 attr-before 改为 attr-after 后，DOM 类名为 attr-after |

并入的组件（5）：ContextMenuMenu、ContextMenuSub、Dropdown、DropdownItem、DropdownMenu。

## S13 Vue 手写导出的 Props 类型与运行时不一致

**现状。** Vue 组件的运行时 props 和导出的 `Vue*Props` 接口是两份手写声明。运行时加了字段，接口没跟上；也有接口还留着已删除的字段，或者把 Core 的类型收窄了。

**做法。** 逐个补齐只是止血。同一批加一道能发现漂移的检查（类型测试或 API 基线），形式开工时定；不新增第二套 Props 类型。

**做完的标准。** 下表每条通过；新加的检查在任一接口少字段时失败。

| 编号     | 级别 | 波次 | 端       | 类别 | 条目                                                            | 验收                                                                                               |
| -------- | ---- | ---- | -------- | ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| C022-F03 | P2   | W0   | Vue      | 类型 | Vue keys 类型拒绝 Core/React 支持的只读数组                     | ['Ctrl','K'] as const 赋给 VueKbdProps 与 Vue 组件 $props 不再报 TS2322                            |
| C034-F04 | P2   | W0   | Vue      | 类型 | VueCardProps 缺少已支持的 titleLevel                            | const props: VueCardProps = { titleLevel: 4 } 不再报 TS2353                                        |
| C048-F02 | P2   | W0   | Vue      | 类型 | Vue 公开 Props 类型遗漏运行时支持的 collapsible                 | const props: VueSidebarProps = { collapsible: true } 通过类型检查，不再报 TS2561                   |
| C050-F02 | P2   | W0   | Vue      | 类型 | VueSpaceProps 遗漏运行时公开支持的三个字段                      | 用 VueSpaceProps 声明含 split、className 或 style 的对象不再报 TS2353                              |
| C051-F03 | P2   | W0   | Vue      | 类型 | VueSplitterProps 漏掉运行时支持的 collapsible                   | const vueProps: VueSplitterProps = { collapsible: true } 不再报 TS2353                             |
| C060-F04 | P3   | W0   | Vue      | 类型 | VueFormProps 漏导出 showErrorSummary 类型                       | 公开导出的 VueFormProps 含可选 showErrorSummary 字段，TypeScript 消费者可从该接口获得              |
| C061-F05 | P3   | W0   | Vue      | 类型 | VueFormItemProps 漏导出 disabled                                | 导出的 VueFormItemProps 接口含可选 disabled 字段                                                   |
| C072-F02 | P2   | W0   | Vue      | 类型 | Vue 导出的 VueSelectProps 缺少三个已实现的公开字段              | 从包入口引入 VueSelectProps 可表达 maxCount、readOnly、optionFields 三个字段且类型检查通过         |
| C074-F04 | P2   | W0   | Vue      | 类型 | VueSliderProps 漏掉四个已实现的公开字段                         | 显式 VueSliderProps 可表达 readOnly、pushApart、showRange、formatTooltip                           |
| C080-F03 | P2   | W0   | Vue      | 类型 | Vue 导出 Props 仍声明已经移除的 height                          | VueTreeSelectProps/TreeSelectProps 不再声明 height；listHeight=80 时 tree 内联 maxHeight 仍为 80px |
| C086-F03 | P2   | W0   | Vue      | 类型 | Vue 公开 BreadcrumbProps 缺少 runtime 已支持的 locale/labels    | 用 VueBreadcrumbProps 声明带 locale、labels 的对象时不再触发超额属性检查                           |
| C088-F05 | P2   | W0   | Vue      | 类型 | Vue 公开 ContextMenuProps 没有覆盖 runtime 的 items             | 用 VueContextMenuProps 或 ContextMenuProps 声明含 items 的配置对象时类型检查通过                   |
| C095-F02 | P2   | W0   | Vue      | 类型 | Vue 导出 FloatButtonProps 漏掉运行时 href 与 badge              | 以 Vue FloatButtonProps 类型声明含 href 与 badge 的对象可通过类型检查                              |
| C109-F06 | P3   | W0   | Vue      | 类型 | 导出的 VuePaginationProps 缺少运行时已有的两个 prop             | 导出的 VuePaginationProps 含 ellipsisJump 与 itemRender，传这两项能过类型检查                      |
| C112-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 StepsProps 少了三个运行时 prop                       | 按 Vue 包导出的 StepsProps 标注含 progressDot: true、locale、labels 的对象时类型检查不报错         |
| C113-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 StepsItemProps 少了 stepIndex 和 isLast              | 按 Vue 包导出的 StepsItemProps 标注含 stepIndex、isLast 的对象时类型检查不报错                     |
| C114-F04 | P3   | W0   | Vue      | 类型 | Vue 导出的 TabsProps 少了 locale 和 labels                      | 按 Vue 包导出的 TabsProps 标注含 locale、labels 的对象时类型检查不报错                             |
| C116-F05 | P3   | W0   | Vue      | 类型 | Vue 导出的 TreeProps 没有 expandOnClick                         | 按 Vue 包导出的 TreeProps 标注含 expandOnClick 的对象时类型检查不报错                              |
| C118-F04 | P3   | W0   | Vue      | 类型 | Vue 导出的 DrawerProps 没有 resizable                           | 用导出的 Vue DrawerProps 注解含 resizable: true 的 props 对象不再报类型错误                        |
| C124-F03 | P3   | W0   | Vue      | 类型 | 导出的 VueModalProps 没有运行时存在的 showCancel                | 用导出的 Vue ModalProps 注解含 showCancel: false 的 props 对象不再报类型错误                       |
| C127-F01 | P3   | W0   | Vue+Core | 类型 | Vue 导出类型漏了运行时 prop                                     | 导出的 Vue PopoverProps 接受这四个字段；重新生成的 props 计数含 closeOnScroll                      |
| C129-F01 | P3   | W0   | Vue      | 类型 | Vue 导出的 TooltipProps 漏了运行时存在的 showDelay 和 hideDelay | 用导出的 Vue TooltipProps 注解含 showDelay、hideDelay 的对象不再报类型错误                         |
| C135-F03 | P3   | W0   | Vue      | 类型 | Vue 导出类型缺 customExport                                     | 从 Vue 包入口导入的 VueDataExportProps 含 customExport，与运行时和 React 一致                      |
