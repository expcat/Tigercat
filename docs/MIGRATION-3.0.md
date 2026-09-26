# Tigercat 3.0 迁移

3.0 不向前兼容。本文只列从 2.x 调用点改到 3.0 要换的导入、prop，以及会改变默认结果的约定。组件的完整 props 在 `skills/tigercat`，示例在 `examples`。

`tigercat migrate` 只改导入说明符和 `scripts/lib/public-components.mjs` 里的 `REMOVED_PUBLIC_NAMES`。它不改 props，运行时也不留旧名字。

下面没有点名的公开组件，导入名和 prop 名与 2.x 相同。

## 删除的名字

| 2.x                                                                                     | 3.0                                                                        |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `Kanban` / `KanbanProps`                                                                | `TaskBoard` / `TaskBoardProps`                                             |
| `ImageViewer`                                                                           | `ImagePreview`（`minScale` / `maxScale`）                                  |
| `DonutChart` / `DonutChartProps`                                                        | `PieChart`，环形用 `innerRadiusRatio`                                      |
| `Stepper` / `StepperProps` / `TigerLocaleStepper`                                       | `InputNumber`                                                              |
| `@expcat/tigercat-core/tailwind/modern`                                                 | `@expcat/tigercat-core` 的 `createTigercatPlugin({ preset: modernTheme })` |
| `@expcat/tigercat-core/datepicker-locales`                                              | `@expcat/tigercat-core/locales/<id>`，日期文案在 `locale.datePicker`       |
| `ThemeManager` / `registerBuiltInThemes` / `data-tiger-style`                           | `ConfigProvider` 的 `theme`                                                |
| `targetKeys` / `defaultTargetKeys`                                                      | `value` / `defaultValue`                                                   |
| `Drawer` 的 `panelClassName`                                                            | `className`                                                                |
| `exportFormat`                                                                          | 表内导出是 CSV；xlsx 用 `DataExport`                                       |
| `columnClassName`（Masonry）                                                            | `layout`                                                                   |
| `WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL`                                              | locale 或 `ariaLabel`                                                      |
| `createFocusTrap`                                                                       | `createFocusScope`                                                         |
| `announceToScreenReader`                                                                | `manageLiveRegion`                                                         |
| `renderCodeHighlightHtml` 等 HTML 高亮函数                                              | `{ text, className? }` token                                               |
| `DATA_EXPORT_SOFT_CELL_LIMIT` / `DATA_EXPORT_FORMULA_PREFIX` / `sanitizeDataExportText` | 超限抛 `DataExportLimitError`                                              |
| `isActiveListDragSameContainer` / `isActiveListDragCrossContainer`                      | 各自的 `createListReorderController`                                       |
| `injectMarqueeStyles` / `injectPrintLayoutStyles`                                       | Tailwind 插件里的样式                                                      |
| `getMessagePositionStyle`                                                               | 当前 `ConfigProvider` 的队列                                               |
| `sliderTooltipReserveClasses`                                                           | 删除。滑块 tooltip 不再用 `pt-12` 撑开轨道                                 |

框架包不再星号再导出 `@expcat/tigercat-core`。`types/composite`、`types/kanban`、`types/image-viewer` 这些兼容入口已删除。版本只读各包的 `package.json`。

## 包出口

从 `@expcat/tigercat-vue` / `@expcat/tigercat-react` 导入组件、hook 和命令式 API。类型和工具从 `@expcat/tigercat-core` 导入。

## ConfigProvider

最外层仍挂载的 `ConfigProvider` 写 `data-tiger-theme`、配色、`dir` 和 `lang`。`lang` 只来自本层 locale id；没有 id 时不改已有 `lang`。先卸载的兄弟根不会清掉后一个根的 `dir`。`colorScheme="auto"` 不另写 `.dark`。现代视觉是 `theme="modern"`，或 `createTigercatPlugin({ preset: modernTheme })`。子树可以自己成为主题根；强调色从 seed 阶梯派生。

删掉 `THEME_CSS_VARS` 的 `textMuted` / `fill` / `bg`，以及 `--tiger-text-muted` / `--tiger-fill` / `--tiger-bg`。

## 语言包

`getDatePickerLabels(locale)` 读同一套 locale 的 `datePicker`。命令式 `Message`、`notification`、`LoadingBar` 读当前文档属主 `ConfigProvider` 的 locale。

## 方向与动效

方向跟 `dir` 和逻辑属性（`padding-inline`、`inset-inline`、`margin-inline`）。过渡列出具体属性。`prefers-reduced-motion` 把 `--tiger-motion-duration-*` 写成 `0ms`。

## 链接

`Link`、`Anchor`、`Breadcrumb`、`ScrollSpy`、`PageHeader`、`Dropdown`、`ContextMenu`、`Menu`、`NavigationMenu`、菜单 schema、组织图头像共用 `link-utils`。允许 `http:`、`https:`、`mailto:`、`tel:`，以及站内路径、查询和 `#`。`javascript:`、`data:`、`vbscript:` 和 `//` 不输出 `href`、不渲染 image。禁用链接不输出 `href`。`target="_blank"` 带 `noopener` 和 `noreferrer`。schema 的 `path` 是站内路径，外链用 `href`。

## 表单共通

只读 prop 是 `readOnly`。Vue 值事件是 `update:modelValue`（`Upload` 是 `update:fileList`，打开是 `update:open`）。禁用字段不提交，只读字段提交。

适用：`DatePicker`、`TimePicker`、`ColorPicker`、`ColorSwatch`、`CronEditor`、`NumberKeyboard`、`Cascader`、`TreeSelect`、`AutoComplete`、`Mentions`、`Upload`、`Signature`、`Transfer`、`TagsInput`、`InputNumber`，以及同一套只读的基础字段。React `Input` 的 `readonly` 与 `readOnly` 是同一标志。

## Form

Vue 用 `v-model` / `modelValue`，父级自己写回 `update:modelValue`。React 用 `value` + `onChange`。

`required` 和 `requiredWhen` 进入校验，和表单规则拼成一份。一次 `validate()` 作废仍在飞的上一次（`FormValidationSupersededError`）。失败时聚焦第一个可聚焦的 `aria-invalid` 控件。`disabled` 或 `loading` 时提交返回 false，取消按钮仍可点。

数字规则比数值。纯空白算空。`date` 只接受不溢出的 `YYYY-MM-DD`，或有效的 `Date`。`id-card` 校验生日和 MOD 11-2 校验位。`url` 接受 localhost、点分域名和 IPv4。路径段拒绝 `__proto__`、`constructor`、`prototype`。大小比较只接受有限数字。

## FormItem

具名项只把值和校验接到第一个控件。错误文本留在文档里：字段校验是 `role="status"`，提交失败是 `role="alert"`。`setFieldError` 按字段写错误。`CropUpload` 的类型、大小和确认失败走这条，成功时清空。

## Input / Textarea / Radio

一次按键一次提交。单颗 `Radio` 写入自己的选项值，与 `RadioGroup` 同一份。缺键、`''`、`null` 是空。提交前让仍聚焦的控件失焦。放进 `InputGroup` 的字数和错误不参与同行拉伸，挂在输入 chrome 下方；组用 `data-tiger-field-extra` 留出一行或两行。`Textarea`、`MaskInput`、`Mentions` 同一套。`InputOTP` 每位都可输入，写入一位后焦点移到下一格；整段粘贴和首格一次性验证码仍从当前格铺开。

## Select

单选空是 `null`（`undefined` 表示非受控），多选空是 `[]`。`''` 是合法选项。清空按钮不进 Tab，退格删最后一枚标签。创建项留到 `options` 接过去。小屏列表仍锚在触发器上。`listHeight` 是面板高度。列、返回、展开文案在 `locale.cascader`，不在 Select 语言包。当前项（以及 TreeSelect、Cascader、AutoComplete、Mentions 的同一行）用面板裁切的底色，不再叠一层内描边焦点环。

## DatePicker

存储和 `name` 是公历 `YYYY-MM-DD`（范围 `start|end`）。解析用写出这段文字的同一套历法和数字。点选、键入、快捷方式和确定走同一道边界；结束早于开始会对调。确定提交完整预览，未完成留在面板里。空是 `null`。「今天」在点击时取 `now`；没传入就用点击时刻的本地日。区间写成当天到当天，面板保持打开。

## TimePicker

存储是 24 小时 `HH:mm`；`showSeconds` 为真才带秒。空单值是 `null`。半截区间留在元组里。此刻、键入和确定共用 `minTime`、`maxTime`、`disabledTime`。`locale` 只收官方 locale 对象。桌面列和手机 `select` 同时在文档里，用 CSS 切换。

## ColorPicker / ColorSwatch

文本在失焦或 Enter 时提交。解析失败不上屏，隐藏域提交空。拖动只更新预览，松手写入。色板按同一套解析判断选中。

## CronEditor

表单值是空，或一份合法 5 段表达式。空字段显示空。错误走 `FormItem`。

## NumberKeyboard

打开后焦点在对话框里。进入的值先按模式收成合法串，收不干净当空。可访问 id 走 `useId`。按键焦点环只在键盘聚焦时出现（`focus-visible`，跟按键圆角）。点按不留常驻描边。已删除 `numberKeyboardKeyActiveClasses`；`getNumberKeyboardKeyClasses` 不再接收 active。

## Cascader

空路径是 `[]`。缺键、`null`、`''` 都是 `[]`。浏览路径只在打开时初始化。`virtual` 时窗口跟着当前项。文案在 `locale.cascader`。

## TreeSelect

空单选是 `null`，空多选是 `[]`。`''` 不是键，`0` 是合法键。勾选框表示级联；`checkStrategy` 决定提交哪些键；`checkStrictly` 时不按策略过滤。搜索零命中是空列表。`defaultExpandAll` 只在第一次有数据时生效。浮层高度只留 `listHeight`（删掉 `height`）。文案在 `locale.treeSelect`。`virtual` 时窗口跟着当前项。

## Tree

`checkStrictly` 默认 false。勾选只在 `treeitem` 上用 `aria-checked`。`posinset` / `setsize` 按兄弟。`1` 与 `"1"` 是不同的键。搜索零命中是空列表。每棵树自己的拖拽容器。

## AutoComplete

关层时提交或还原。原生字段提交已提交的值。超过一屏走虚拟窗口。

## Mentions

按当前选区插入。解析和插入共用同一套分隔。超过一屏走虚拟窗口。

## Upload

界面、进度、`submit` 和表单写入用同一份列表。`name` 是表单字段，`fileFieldName` 是请求文件字段。`multiple` 为假时拖拽只留第一个。失败可重试。`runUploadQueue` 接受取消信号；`dispose` 之后不再取下一项。返回 `false` 标成错误。`resumable` 记住本次会话已完成的分片。

## Signature

值是空，或当前笔画的 SVG。解析不了的字符串当空。Escape 和 `pointercancel` 丢掉当前笔。

## Transfer

目标只留 `value`，初始值只留 `defaultValue`。数据源按字符串键收成一条，`1` 与 `'1'` 是同一行。搜索、全选和移动只处理当前可见项。搜索框的 Enter 不提交外层表单。打开着的空列表仍报告展开。面板高度固定，超过一屏走虚拟窗口。

## Slider

Vue 只认 `modelValue` / `update:modelValue`。方向读最近的 `dir`，否则读 `ConfigProvider`。拖动松手才写入，键盘立即写入。`marks` 过密时最多标两端，刻度不超过 21 个。区间拇指在字段名之外带上最小和最大。悬停 tooltip 不再给根节点加 `pt-12`。`getSliderRootClasses(disabled, className?, status?)` 不再接收 tooltip 是否打开。

## InputNumber

两侧按钮是 `controlsPosition="both"`。`snapToStep` 默认关闭，步长只约束按钮和方向键。值是有限数字或数字字符串，`null` 和 `''` 是空。可见输入不带 `name`。可访问名来自可见标签或 `aria-label`。尾侧步进条用 `end-0` 和固定宽度，不盖住数值。Switch 拇指用 `start-*`，选中时滑到阅读方向的末端。

## TagsInput

粘贴在光标处插入后再按分隔符切开。组合输入未结束时 Enter 不确认。错误和拒绝说明只走 `FormItem`。删掉 `errorMessage`。

空选择（`Select`、`TagsInput`、`Slider`、`InputNumber`）提交一个 `value=""` 的隐藏域。

## Highlight

`keywords` 只收字符串，按字面量匹配。`RegExp` 被忽略。

## Code / CodeEditor

高亮器返回 `{ text, className? }`。组件把 `text` 画成文本节点。

## RichTextEditor / MarkdownEditor

`target="_blank"` 写出 `rel="noreferrer noopener"`。粘贴和拖放只走一条消毒后的 DOM 写入。工具栏图标是 `{ path }`。

## QRCode

图片名字是 locale 状态，不读出编码值。SVG 对辅助技术隐藏。

## Watermark

平铺用样式表。宿主尺寸变化不重编码画布。`MutationObserver` 只发现改动。

## Drag

会话挂在各自的 `createListReorderController` 上。`drop` / `endDrag` 只结束自己的会话。

## DataExport

有限数字在 CSV 和 xlsx 里写成数字。文本去掉前导空白后，以 `=` `+` `-` `@`、Tab、CR、LF 或全角 `＝＋－＠` 开头才中和。单元格个数或单格长度超过上限时抛出 `DataExportLimitError`。文件名去掉路径字符、换行和双向控制符。Markdown 用同一条文本规则。

## VirtualList / InfiniteScroll

行窗口、列窗口和动态测高只走 `virtual-list-utils`（结束下标含底边行，测高键是条目 id）。`InfiniteScroll` 默认观察视口，一次一个在途请求，预加载边跟书写方向。滚动盒要有高度。`onLoadMore` 必须同步把 `loading` 置 true。

## Table / VirtualTable

服务端和客户端第一次都输出 `<table>`。窄视口卡片要显式 `responsiveMode="card"`，挂载后才切换。固定列用 `inset-inline-start` / `inset-inline-end`。没有行内控件时数据行共用一个 Tab 停靠。行拖拽只在把手上。缺身份的行键是 `tiger-row:` 前缀。内置导出只出 CSV。`VirtualTable` 不读列上的 `sortable` / `filter`。虚拟化是 `Table` 的策略；`VirtualTable` 与 `VirtualList` 共用同一份窗口。表头高度来自 DOM 测量。空窗口每次是新对象。行高只接受有限正数。

## Calendar

面板只用调用方时钟。受控日期由父级写回。

## ChartCanvas

svg 是 `role="group"`，名字在组上。轴和标记仍可逐条读到。

## PieChart

环形用 `innerRadiusRatio`（`0.6` 为甜甜圈）。默认扫角正好一圈。

## LineChart

`showArea` 时面积回到 `y = 0`。

## RadarChart

每个指标都有一个顶点。缺测留在该轴上。

## Gantt

日、周刻度带年份。拖拽跟 `draggable`。没有调用方时钟时，首屏不输出会随环境变化的钟点。

## TaskBoard

放下下标和指示线是同一个插入点，末尾是源数组长度。每列一个键盘停靠点，方向键在卡片之间移动。抓取播报源列、目标列和位置，句子走 locale。卡片里的按钮自己处理 Enter / Space。列 id 记在元素上。列移动和卡片移动共用一个在途门闩。

## WorkflowDesigner

条件是字段、运算符、值，只进入选中的那一条分支。`onChange` 带上 `issues`。有阻塞项时发布不可用。缺省权限只有 `defaultWorkflowFieldPermission`，更严的一边生效。空画布文案是 locale `emptyHint`。

画布是中轴上的紧凑摘要卡。两个及以上子节点横向分岔再汇合。上移、下移、复制、添加子步骤、删除只在选中节点的 Inspector。节点间 `+` 仍在画布上。中轴与分岔几何由 Tailwind plugin（`.tiger-workflow-designer__flow::before` 等）注入，消费者须加载该 plugin。

## WorkflowViewer

顺序节点同一列。两个及以上 `children` 横向分岔，下一项在分岔下方汇合。`loopTo` 是另一节点的 `key`，查看器在右侧画退回环；未知 key 和自环不画。会签人仍在卡片内，不是横向子卡。无新必填 prop。

## WorkflowActionBar

reducer 拒绝不属于当前操作者的动作，并拒绝空的必填意见。

## WorkflowDetailShell

`submit()` 与 `submitAction()` 都走 `mergeWorkflowFormValues`。`submitAction(action)` 再把动作条意见交给 `reduceWorkflowAction`。可访问名走 locale `workflowDetailShell.ariaLabel` 或 `ariaLabel`。

## CommentThread / ActivityFeed / NotificationCenter

环和重复 id 给出可见错误，能挂上的节点留下。评论输入和空态在 feed 外面。动态根是 region。通知筛选是一组有名字的单选；打开一条是按钮；加载时列表 inert。超过阈值只挂可见的一段；通知的非当前分组不挂列表。

## ChatWindow

贴底锚是最后一条消息 id。长列表默认虚拟窗口，实时区域不在滚动根上。发送闩维持到这一次 `onSend` 返回的 Promise 结束；结束后允许原样重发，失败后原文留着。评论用自己的闩。

## DataTableWithToolbar

`onFiltersChange` 带这一次要写的值。本地搜索和标量筛选把页码收到第 1 页。`query` 的提交和重置是按钮，收起后留下条件摘要。对象条件只交给父级，本地匹配跳过对象。

## FormWizard

`submit()` 返回 false 时留在当前步。父级直接改 `current` 时，步骤事件带 `{ skippedValidation: true }`。

## SchemaForm

必填和只读进同一套规则。`disabled` 不跑必填。模型按路径合并，晚到的记录能进还没编辑过的空表。

## Alert

省略 `open` 时，关闭按钮和到时由组件自己收起。传入 `open` 时只发事件。

外壳读已经发出的运行时 token：圆角 `--tiger-radius-md`，内边距 `--tiger-spacing-lg`，字号 `--tiger-font-size-base`。图标走字号阶梯，md 是 `h-5 w-5`。倒计时条用 `inset-x-0`。不再读未定义的 `--tiger-component-alert-*`。

## Loading

全屏盖住视口，高于模态，并占用同一套焦点栈。区域加载在置 `inert` 之前记住焦点，结束后还回去。

## Tooltip / Popover / Popconfirm

悬停只跟指针。焦点还在触发器上时，指针离开不关。`Popover` 和 `Popconfirm` 把焦点留在触发器上，Tab 离开即关。确认的 Promise 在进行中关不掉。

Tooltip 气泡用 `--tiger-text` 作底、`--tiger-surface` 作字，圆角 `--tiger-radius-sm`，阴影 `--tiger-shadow-lg`。箭头跟气泡同色，不再借用 Popconfirm 的白底描边。不再读未定义的 `--tiger-component-tooltip-*`。

## Modal / Drawer

确定可以等 Promise，拒绝则不关闭。层本身不滚动，只有正文滚动。离开回调等这一层过渡结束。`Drawer` 的面板类名只有 `className`。`bodyPadding={false}` 去掉默认内边距，自定义间距用 `bodyClassName`。

## Tour

只在打开和换步时把目标滚进视口一次。默认洞只是视觉。关掉后，非受控下标回到第一个未跳过的步骤；受控时发出回到该下标。

## Message / notification / LoadingBar

只改当前 `ConfigProvider` 里的队列。同一个 `key` 替换。`Message` 默认可关闭，悬停或焦点暂停计时。通知的主动作是按钮，整张卡片不承接点击。`LoadingBar` 的 `error()` 与 `finish()` 共用 `start` 计数。轨道用 `inset-x-0` 铺满视口顶边。Tailwind v4 不生成 `inset-inline-0`，缺左右 inset 时固定条宽度是 0。

通知卡片用 `--tiger-spacing-lg`、`--tiger-radius-lg`、`--tiger-shadow-lg`，宽度 `24rem`。角落位置和 Message 一样用 `start-*` / `end-*`；居中用 `inset-x-0`。Tailwind v4 不生成 `inset-inline-start-*` / `inset-inline-end-*`，那些名字会让固定层停在静态位置。不再读未定义的 `--tiger-component-notification-*`。

## Marquee

方向只用 `start` / `end` / `up` / `down`。没有 `aria-label`、`ariaLabel`、`labels.ariaLabel` 或 `aria-labelledby` 时不是地标。循环和减少动效在样式表里，组件不写 `<style>`。

## Masonry

默认 `layout="source"`，用 CSS 多列保持源顺序。`layout="shortest"` 才按最短列定位，并用逻辑起点。删掉 `columnClassName`、`masonryColumnClasses`、`getMasonryColumnClasses`。

## Button / SplitButton

`loading` 设置原生 `disabled`，并带 `aria-busy`。`SplitButton` 在 loading 时两颗按钮都禁用。菜单在打开前不挂载。

## Avatar / AvatarGroup

溢出头像是按钮。非 Avatar 子节点仍留在组里。

## ImageCompare

拖拽从手柄开始。

## ImagePreview

导航到头后禁用，不再按长度取模循环。`images` 为 `string | { src, alt? }`。默认缩放范围是 0.25–5。

## Carousel

圆点是按钮。请求自动播放且系统要求减少动效时，不渲染暂停按钮。轨道位移不因书写方向改符号。

## AspectRatio

默认不裁切内容（`overflow` 可见，内容不用绝对定位铺满）。

## Row / Col

`Col` 的 `flex` 字符串保持原样，下划线不改成空格。

## Splitter

传入的 `sizes` 按值受控。拿掉 `sizes` 后停在最后的比例，不重新均分。水平拖拽跟 `dir`。

## Spotlight

命令快捷键只出现在对应结果行的行尾。面板不再另画一份 footer 列表。`spotlightFooterShortcuts` 与 `navLabels.spotlightFooter` 已删除。

## Menu / Tabs / NavigationMenu

垂直菜单根是 `role="menu"`，同一时刻只有一个 Tab 停靠。页签、树和导航的键按类型区分：`1` 与 `"1"` 是不同项。再点已选项保持选中。`NavigationMenu` 的展开值就是 open 状态。关闭的 `Dropdown`、`ContextMenu` 和导航面板不挂到 portal。`Anchor` 当前项是 `aria-current="location"`。Tailwind 的 `aria-current:` 只匹配 `"true"`，当前项颜色用 `aria-[current=location]:`。

## Layout

最外层有一条跳到 `#tiger-main` 的链接，目标是页面上那一个 `main`。Header 的 `sticky` 单独开关，不由 `variant` 打开。

## AppShell

把 `Sidebar`、`Header`、`Breadcrumb`、`Tabs`、`PageHeader` 拼成一页。页签标题只来自调用方。`headerSticky` 只传给 `Header`。主内容是 `Layout` 的那一个 `main`。

## Collapse

收起的面板卸掉子树，焦点回到标题按钮。

## 焦点、复制与实时区域

`createFocusScope` 是唯一焦点范围：Tab 循环、离开拉回、Escape 只交给最上层、下层模态 `inert`、关闭恢复焦点；模态同时锁滚动。toast 用 `data-tiger-toast`，不跟模态一起 `inert`。键盘只认 `event.key`。

`copyTextToClipboard` 只走异步 Clipboard API，失败返回 `false`。

`manageLiveRegion()` 每次创建调用方自己的区域。`assertive` 只设置 `aria-live="assertive"`。

## 样式注入

`Divider`、`ImageCropper`、`Skeleton`、`Carousel`、`Dropdown`、`Menu`、`Card`、`AspectRatio`、`Watermark`、`Space`、`PrintLayout` 的关键帧和几何在 Tailwind 插件的 base 里。打印只打当前这一张纸，`@page` 跟实例一起卸。

## CLI / MCP

CLI 与 MCP 的对外版本等于各自 `package.json`。`doctor` 要求技能目录的版本和文件摘要与 CLI 一致，并要求 Tigercat 依赖的主版本与 CLI 主版本相同。MCP 默认读随包发布的技能快照；显式 https 基址必须与包的版本和文件摘要一致。`tigercat add` 写入可运行用法，并安装锁定版本。`tigercat create` 覆盖前列出将写入的文件；`--preset shell` 带上可运行的 `AppShell`。`tigercat_example` 只读示例。文档由 `pnpm docs:api` 生成，一组件一页。

## 3.0 新增的组件

这些名字在 2.x 不存在：`Inplace`、`CopyButton`、`Gallery`、`WaterfallChart`、`SankeyChart`、`NotificationBell`、`AssigneePicker`、`AppShell`。

`CopyButton` 只调用 `copyTextToClipboard`。`Gallery` 组合缩略图和 `ImagePreview`。`NotificationBell` 不读命令式提示队列。`AssigneePicker` 只消费调用方给的目录。

其余增强是可选 prop。旧调用点不用补上这些 prop。
