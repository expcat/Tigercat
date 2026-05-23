# 键盘导航清单

本文档记录 Tigercat 组件的键盘入口、快捷键和预期焦点行为。新增或修改组件交互时，需要同步更新对应行。

## 全局约定

- `Tab` / `Shift+Tab`：在可聚焦控件之间前进 / 后退。
- `Enter`：触发按钮、链接、菜单项、当前高亮选项或确认动作。
- `Space`：切换 checkbox、radio、switch、按钮、可选择项。
- `Esc`：关闭当前弹层、取消临时状态或返回触发元素。
- `Arrow Keys`：在同一组合控件内移动当前项。
- `Home` / `End`：移动到同一组合控件的第一项 / 最后一项。
- `PageUp` / `PageDown`：在分页、日期、时间或虚拟滚动场景中翻页 / 大步移动。

## Basic

| 组件         | 快捷键                                         | 焦点与行为                                             |
| ------------ | ---------------------------------------------- | ------------------------------------------------------ |
| Alert        | `Tab` 到可操作按钮；按钮使用 `Enter` / `Space` | 关闭按钮可聚焦；非关闭型 Alert 不抢焦点                |
| Avatar       | 无内置快捷键                                   | 纯展示；作为链接或按钮使用时遵循宿主元素键盘行为       |
| AvatarGroup  | 无内置快捷键                                   | 纯展示；溢出触发器如使用 Tooltip/Popover，遵循弹层规则 |
| Badge        | 无内置快捷键                                   | 纯展示；包裹可交互元素时焦点停留在子元素               |
| Button       | `Enter` / `Space`                              | 触发 click；disabled / loading 时不可操作              |
| ButtonGroup  | `Tab`、`Enter`、`Space`                        | 每个按钮独立聚焦；不拦截方向键                         |
| Code         | `Tab` 到复制按钮；`Enter` / `Space` 复制       | 代码文本不强制聚焦；复制成功状态需可感知               |
| Divider      | 无内置快捷键                                   | 纯展示分隔符                                           |
| Empty        | `Tab` 到 action                                | 空状态本身不聚焦；操作按钮遵循 Button                  |
| Icon         | 无内置快捷键                                   | 纯图标默认装饰；作为按钮时需由宿主元素提供键盘行为     |
| Image        | `Tab` 到预览触发器；`Enter` / `Space` 打开预览 | 预览打开后遵循 ImagePreview / Modal 弹层规则           |
| ImageCropper | `Tab` 到工具按钮；方向键微调裁剪框（如启用）   | 工具按钮可聚焦；拖拽能力应提供按钮替代路径             |
| Link         | `Enter`                                        | 使用原生链接行为；disabled 时不可触发导航              |
| QRCode       | 无内置快捷键                                   | 纯展示；下载/复制等 action 遵循 Button                 |
| Tag          | 关闭按钮 `Enter` / `Space`                     | 可关闭 Tag 的关闭按钮可聚焦；普通 Tag 不聚焦           |
| Text         | 无内置快捷键                                   | 纯文本展示                                             |

## Form

| 组件          | 快捷键                                                                 | 焦点与行为                                                 |
| ------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| AutoComplete  | `ArrowUp/Down`、`Enter`、`Esc`、`Home/End`                             | 输入框聚焦后打开候选；方向键移动高亮；Enter 选择；Esc 关闭 |
| Cascader      | `Enter` / `Space` 打开；`Arrow Keys` 导航；`Esc` 关闭                  | 焦点保持在触发器或当前菜单项；选择后回到触发器             |
| Checkbox      | `Space`                                                                | 切换 checked；disabled 时跳过                              |
| CheckboxGroup | `Tab`、`Shift+Tab`、`Space`                                            | 每个 checkbox 可独立聚焦并切换                             |
| ColorPicker   | `Enter` / `Space` 打开；`Esc` 关闭                                     | 色板/输入框按 Tab 顺序访问；确认后回到触发器               |
| DatePicker    | `Enter` / `Space` 打开；方向键移动日期；`PageUp/Down` 切月；`Esc` 关闭 | 面板打开后当前日期或选中日期可定位；确认/关闭后回到输入框  |
| Form          | `Tab` 顺序进入字段；提交按钮 `Enter` / `Space`                         | 校验失败时错误信息可朗读；焦点不应丢失                     |
| Input         | 原生文本输入键；`Esc` 可清空仅在组件支持时启用                         | label 与输入框关联；清除按钮可聚焦或可由键盘触发           |
| InputGroup    | 遵循内部 Input/Button                                                  | 前后缀 action 按 DOM 顺序聚焦                              |
| InputNumber   | `ArrowUp/Down` 步进；原生输入键；`Home/End` 可移动光标                 | stepper 按钮可聚焦；边界值不继续变化                       |
| Mentions      | `@` 打开候选；`ArrowUp/Down`、`Enter`、`Esc`                           | 候选高亮随方向键移动；选择后焦点留在输入区                 |
| Radio         | `Space`                                                                | 单个 radio 切换选中                                        |
| RadioGroup    | `ArrowLeft/Right/Up/Down`、`Space`                                     | 方向键在选项间移动并选择；Tab 进入/离开组合                |
| Rate          | `ArrowLeft/Right` 调整；`Home/End` 到最小/最大；`Space` 确认           | 当前评分应通过 aria 状态暴露                               |
| Select        | `Enter` / `Space` 打开；`ArrowUp/Down`；`Enter` 选择；`Esc` 关闭       | listbox 打开后选项可通过方向键高亮；多选项可用 Space 切换  |
| Slider        | `ArrowLeft/Right/Up/Down` 步进；`PageUp/Down` 大步；`Home/End` 到边界  | thumb 聚焦；aria-valuenow 随值更新                         |
| Stepper       | `ArrowUp/Down` 或按钮 `Enter` / `Space`                                | 加减按钮可聚焦；边界值按钮 disabled                        |
| Switch        | `Space` / `Enter`                                                      | 切换 checked；aria-checked 同步                            |
| Textarea      | 原生文本输入键；`Tab` 按表单策略处理                                   | label 与文本域关联；错误状态可朗读                         |
| TimePicker    | `Enter` / `Space` 打开；方向键调整列；`Enter` 确认；`Esc` 关闭         | 时分秒列可访问；关闭后回到输入框                           |
| Transfer      | `Tab`、`ArrowUp/Down`、`Space`、移动按钮 `Enter` / `Space`             | 列表项可选择；移动后焦点保持在相关操作区                   |
| TreeSelect    | `Enter` / `Space` 打开；方向键导航树；`Space` 选择；`Esc` 关闭         | 展开状态、选中状态和层级可感知                             |
| Upload        | `Enter` / `Space` 打开文件选择；`Delete` 删除可选文件                  | 拖拽上传必须有键盘可达的选择按钮                           |

## Feedback

| 组件         | 快捷键                                                             | 焦点与行为                                       |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------ |
| Drawer       | `Esc` 关闭；`Tab` / `Shift+Tab` 在抽屉内循环                       | 打开后焦点进入抽屉；关闭后回到触发元素           |
| Loading      | 无内置快捷键                                                       | 作为状态提示；不应抢焦点                         |
| Message      | 无内置快捷键                                                       | 动态消息通过 live region 感知；不抢焦点          |
| Modal        | `Esc` 关闭；`Tab` / `Shift+Tab` 在对话框内循环                     | 初始焦点进入 Modal；确认/取消后回到触发元素      |
| Notification | `Tab` 到关闭/操作按钮；`Enter` / `Space` 触发                      | 不自动抢焦点；重要内容可朗读                     |
| Popconfirm   | `Enter` / `Space` 打开；`Esc` 关闭；按钮 `Enter` / `Space`         | 打开后确认/取消按钮可访问；关闭后回到触发器      |
| Popover      | `Enter` / `Space` 或触发器策略打开；`Esc` 关闭                     | 弹层内容按 Tab 顺序访问                          |
| Progress     | 无内置快捷键                                                       | 状态展示；必要时通过 aria-valuenow 暴露进度      |
| Result       | `Tab` 到 action；按钮 `Enter` / `Space`                            | 结果内容不抢焦点；action 遵循 Button             |
| Tooltip      | `Focus` / `Hover` 触发；`Esc` 可关闭                               | Tooltip 不应包含必须用键盘操作的唯一内容         |
| Tour         | `Tab` 到步骤按钮；`Enter` / `Space` 下一步/上一步/结束；`Esc` 关闭 | 当前步骤内容被朗读；关闭后焦点回到目标或触发元素 |
| Watermark    | 无内置快捷键                                                       | 纯展示背景，不进入焦点顺序                       |

## Layout

| 组件         | 快捷键                                                    | 焦点与行为                                |
| ------------ | --------------------------------------------------------- | ----------------------------------------- |
| Card         | 无内置快捷键                                              | 容器展示；内部 action 自行聚焦            |
| Carousel     | `ArrowLeft/Right` 上一张/下一张；指示器 `Enter` / `Space` | 当前 slide 状态可感知；自动播放不应抢焦点 |
| Container    | 无内置快捷键                                              | 布局容器                                  |
| Descriptions | 无内置快捷键                                              | 结构化展示；内容按 DOM 顺序读取           |
| Grid         | 无内置快捷键                                              | 布局容器                                  |
| Layout       | 无内置快捷键                                              | 页面结构容器                              |
| List         | `Tab` 到列表 action                                       | 列表项展示；可交互子元素遵循自身规则      |
| Resizable    | 拖拽手柄可聚焦时用方向键调整；`Home/End` 到边界（如启用） | 需要提供尺寸变化的可感知反馈              |
| Skeleton     | 无内置快捷键                                              | 加载占位；不进入焦点顺序                  |
| Space        | 无内置快捷键                                              | 布局容器                                  |
| Splitter     | 分隔条聚焦后方向键调整；`Home/End` 到最小/最大            | aria-valuenow 或等价状态随尺寸更新        |
| Statistic    | 无内置快捷键                                              | 数据展示                                  |

## Navigation

| 组件        | 快捷键                                                                 | 焦点与行为                                             |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Affix       | 无内置快捷键                                                           | 固定定位不改变内部元素键盘行为                         |
| Anchor      | `Tab` 到链接；`Enter` 跳转                                             | 当前锚点状态可感知                                     |
| BackTop     | `Enter` / `Space` 滚动到顶部                                           | 按钮出现后可聚焦；触发后焦点保持可预测                 |
| Breadcrumb  | `Tab` 到链接；`Enter` 导航                                             | 当前页不作为可点击链接                                 |
| Dropdown    | `Enter` / `Space` 打开；`ArrowUp/Down` 菜单项；`Esc` 关闭              | 菜单打开后焦点进入菜单或保持在触发器并管理 active item |
| FloatButton | `Tab`、`Enter` / `Space`                                               | 单个浮动按钮按 Button；组展开遵循 Dropdown/Popover     |
| Menu        | `ArrowUp/Down/Left/Right`、`Enter`、`Space`、`Esc`                     | 当前项、选中项和展开项状态同步；子菜单可关闭           |
| Pagination  | `Tab` 到页码/按钮；`Enter` / `Space` 切页                              | 当前页 aria-current；禁用上一页/下一页不可触发         |
| Segmented   | `ArrowLeft/Right` 移动；`Space` / `Enter` 选择                         | 当前选中项可感知                                       |
| Steps       | `Tab` 到可点击步骤；`Enter` / `Space` 激活                             | 当前步骤通过 aria-current 或状态文本表达               |
| Tabs        | `ArrowLeft/Right` 切换 tab；`Home/End` 首尾；`Tab` 进入面板            | tab 与 tabpanel 关联；选中态同步                       |
| Tree        | `ArrowUp/Down` 移动；`ArrowRight` 展开；`ArrowLeft` 收起；`Space` 选择 | 层级、展开、选中和勾选状态可感知                       |

## Data

| 组件     | 快捷键                                                     | 焦点与行为                              |
| -------- | ---------------------------------------------------------- | --------------------------------------- |
| Calendar | 方向键移动日期；`PageUp/Down` 切月；`Enter` / `Space` 选择 | 当前日期、选中日期和禁用日期状态清晰    |
| Collapse | header `Enter` / `Space` 展开/收起                         | aria-expanded 同步；内容按 Tab 顺序访问 |
| Table    | `Tab` 到排序/筛选/分页控件；`Enter` / `Space` 触发         | 表头、排序状态和行选择状态可感知        |
| Timeline | 无内置快捷键                                               | 时间线展示；节点 action 自行聚焦        |

## Charts

| 组件          | 快捷键                                                               | 焦点与行为                                       |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| AreaChart     | `Tab` 到图例、数据点或工具按钮（如启用）                             | 图表容器提供名称；数据交互需有键盘路径或等价说明 |
| BarChart      | `Tab` 到图例、数据点或工具按钮（如启用）                             | 同 AreaChart                                     |
| ChartCanvas   | `Tab` 到可交互绘图层（如启用）                                       | Canvas 内容需要等价文本或表格说明                |
| ChartLegend   | `Tab` 到图例项；`Enter` / `Space` 切换（如启用）                     | 图例选中状态可感知                               |
| ChartTooltip  | 由焦点或数据点触发；`Esc` 关闭（如启用）                             | Tooltip 内容与触发点关联                         |
| DonutChart    | `Tab` 到扇区/图例（如启用）；方向键可在数据点间移动（如启用）        | 当前扇区名称和值可感知                           |
| FunnelChart   | `Tab` 到阶段/图例（如启用）                                          | 阶段名称和值可感知                               |
| GaugeChart    | `Tab` 到可交互阈值/工具按钮（如启用）                                | 当前值通过 aria-valuenow 或文本表达              |
| HeatmapChart  | `Tab` 到 cell 或图例（如启用）；方向键移动 cell（如启用）            | cell 行列和值可感知                              |
| LineChart     | `Tab` 到图例、数据点或工具按钮（如启用）                             | 数据点名称和值可感知                             |
| PieChart      | `Tab` 到扇区/图例（如启用）                                          | 当前扇区名称和值可感知                           |
| RadarChart    | `Tab` 到图例或数据点（如启用）                                       | 维度和值可感知                                   |
| ScatterChart  | `Tab` 到数据点（如启用）；方向键移动点（如启用）                     | x/y 值和系列名可感知                             |
| SunburstChart | `Tab` 到节点（如启用）；`Enter` / `Space` 下钻（如启用）；`Esc` 返回 | 层级和当前路径可感知                             |
| TreeMapChart  | `Tab` 到矩形节点（如启用）；方向键移动节点（如启用）                 | 节点名称和值可感知                               |

## Advanced

| 组件           | 快捷键                                                                       | 焦点与行为                         |
| -------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| CodeEditor     | 编辑器原生快捷键；工具栏 `Tab`、`Enter` / `Space`                            | 工具按钮名称和状态可感知           |
| FileManager    | `ArrowUp/Down` 移动文件；`Enter` 打开；`Space` 选择；`Delete` 删除（如启用） | 当前文件、选中项和路径可感知       |
| ImageViewer    | `ArrowLeft/Right` 切图；`+/-` 缩放（如启用）；`Esc` 关闭                     | 当前图片序号和缩放状态可感知       |
| InfiniteScroll | `Tab` 到内容 action；`PageDown` 浏览页面                                     | 加载更多状态可感知；不劫持原生滚动 |
| Kanban         | `Tab` 到卡片/按钮；拖拽操作需按钮替代；`Enter` 打开卡片                      | 列名、卡片标题和 WIP 状态可感知    |
| PrintLayout    | `Tab` 到打印/导出按钮；`Enter` / `Space` 触发                                | 打印预览不改变页面焦点顺序         |
| RichTextEditor | 编辑区原生快捷键；工具栏 `Tab`、`Enter` / `Space`；常见 `Cmd/Ctrl+B/I/U`     | 当前格式状态可感知                 |
| TaskBoard      | `Tab` 到卡片/按钮；拖拽操作需按钮替代；`Enter` 打开任务                      | 列、任务、选中和移动状态可感知     |
| VirtualList    | `Tab` 到可交互项；`PageUp/Down` 浏览视口                                     | 虚拟化不应跳乱朗读顺序             |
| VirtualTable   | `Tab` 到表格 action；`PageUp/Down` 浏览视口                                  | 表头关系、当前行和滚动位置可感知   |

## Composite

| 组件                 | 快捷键                                                       | 焦点与行为                             |
| -------------------- | ------------------------------------------------------------ | -------------------------------------- |
| ActivityFeed         | `Tab` 到 item action；`Enter` / `Space` 触发                 | 新活动不抢焦点；时间和用户信息可读     |
| ChatWindow           | 输入区原生键；`Enter` 发送（如配置）；`Shift+Enter` 换行     | 新消息通过 live region 或状态文本感知  |
| CommentThread        | `Tab` 到回复/操作按钮；编辑区原生键                          | 回复关系、作者和时间可读               |
| CropUpload           | 上传遵循 Upload；裁剪遵循 ImageCropper                       | 文件选择、裁剪确认和错误状态可感知     |
| DataTableWithToolbar | Toolbar 按钮 `Enter` / `Space`；Table 遵循表格规则           | 搜索、筛选和表格结果数量可感知         |
| FormWizard           | `Tab` 到字段和导航按钮；`Enter` / `Space` 下一步/上一步/完成 | 当前步骤、错误和完成状态可感知         |
| NotificationCenter   | `Tab` 到过滤/通知 action；方向键可在列表内移动（如启用）     | 未读状态、过滤状态和标记已读动作可感知 |

## PR 检查

当组件新增或修改键盘行为时，请确认：

- 文档中对应组件行已更新。
- 单测覆盖关键键位和焦点恢复。
- 屏幕阅读器手工测试记录包含键盘流程。
- 如果某能力暂不支持键盘替代路径，PR 中说明限制和后续计划。
