# Tigercat Example Agent Requirements

<!-- LLM-INDEX
type: example-agent-requirements
scope: R28 example review tasks and execution status only
verified-date: 2026-07-01
source: docs/EXAMPLE_AGENT_PLAN.md
-->

本文只记录 Agent 需要执行的任务、当前状态和修复入口。详细浏览器证据、用户故事和审查过程保留在 `docs/EXAMPLE_AGENT_PLAN.md`，后续 Agent 默认先读本文件，只有需要证据时再回查原计划文档。

## 状态约定

- 未开始：尚未完成浏览器体验审查。
- 已审查：已完成浏览器体验审查，产生待办或确认无阻断项。
- 待修复：已确认需要 Example、文档或组件源码变更。
- 已完成：对应修复已完成并通过要求的复查。
- 阻塞：缺少环境、证据或决策，暂不能继续。

## Agent 审查队列

| 组  | 任务范围                                                                                                                       | 状态                 | 下一步                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------- |
| E01 | Button / Link / Text / Code / Icon / Tag / Badge                                                                               | 已审查（2026-07-01） | 处理 R01-R03                                          |
| E02 | Avatar / AvatarGroup / Empty / Result / Statistic / QRCode / Watermark                                                         | 已审查（2026-07-01） | 处理 R04-R08                                          |
| E03 | Image / ImageGroup / ImagePreview / ImageViewer / CropUpload / ImageCropper                                                    | 已审查（2026-07-01） | 处理 R09-R13                                          |
| E04 | Layout / Header / Sidebar / Content / Footer / Container / Row / Col / Space / Divider                                         | 已审查（2026-07-01） | 处理 R14-R18                                          |
| E05 | Card / List / Descriptions / Skeleton / Splitter / Resizable / Carousel                                                        | 已审查（2026-07-01） | 处理 R19-R25                                          |
| E06 | Affix / Anchor / BackTop / Breadcrumb / ScrollSpy / FloatButton                                                                | 未开始               | 浏览器审查                                            |
| E07 | Menu / Dropdown / Steps / Tabs / Tree / Pagination / Spotlight                                                                 | 未开始               | 浏览器审查                                            |
| E08 | Alert / Loading / Progress / Tooltip / Popover / Popconfirm                                                                    | 未开始               | 浏览器审查                                            |
| E09 | Modal / Drawer / Message / Notification / Tour                                                                                 | 未开始               | 浏览器审查                                            |
| E10 | Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper                                                        | 未开始               | 浏览器审查                                            |
| E11 | Checkbox / Radio / Switch / Slider / Segmented / Rate / ColorSwatch / ColorPicker                                              | 未开始               | 浏览器审查                                            |
| E12 | Select / AutoComplete / Cascader / TreeSelect / Mentions / Transfer                                                            | 未开始               | 浏览器审查                                            |
| E13 | DatePicker / TimePicker / Calendar / Countdown / CronEditor / NumberKeyboard                                                   | 未开始               | 浏览器审查                                            |
| E14 | Upload / Signature                                                                                                             | 未开始               | 浏览器审查                                            |
| E15 | Table / Collapse / Timeline                                                                                                    | 未开始               | 浏览器审查                                            |
| E16 | VirtualTable / VirtualList / InfiniteScroll                                                                                    | 未开始               | 浏览器审查                                            |
| E17 | AreaChart / BarChart / LineChart / ScatterChart / chart subcomponents                                                          | 未开始               | 浏览器审查                                            |
| E18 | PieChart / DonutChart / RadarChart / GaugeChart / FunnelChart / HeatmapChart / SunburstChart / TreeMapChart / Gantt / OrgChart | 未开始               | 浏览器审查                                            |
| E19 | CodeEditor / MarkdownEditor / RichTextEditor / FileManager / ImageAnnotation / PrintLayout                                     | 未开始               | 浏览器审查                                            |
| E20 | ActivityFeed / ChatWindow / CommentThread / DataTableWithToolbar / FormWizard / NotificationCenter / TaskBoard / Kanban        | 未开始               | 浏览器审查                                            |
| E21 | Hooks demos: useDrag / useControlledState / useChartInteraction / useFormController                                            | 未开始               | 浏览器审查；确认 useFormController 是否仍缺独立 route |

## 修复需求

| ID  | 来源 | 优先级 | 任务                                                             | 范围                        | 状态   |
| --- | ---- | ------ | ---------------------------------------------------------------- | --------------------------- | ------ |
| R01 | E01  | P2     | Tag 常规可关闭示例补业务化 `closeAriaLabel`                      | Example/文档                | 待修复 |
| R02 | E01  | P2     | Code 复制回调补更短 fixture/source 或局部可复制示例              | Example/文档                | 待修复 |
| R03 | E01  | P3     | Badge 真实场景补零值隐藏与 `showZero` 的业务取舍                 | Example/文档                | 待修复 |
| R04 | E02  | P1     | Avatar 团队成员示例改用 `AvatarGroup max`，修复 `+5` 只显示 `+`  | Example/文档                | 待修复 |
| R05 | E02  | P1     | QRCode 状态示例补中文 locale、refresh 回调，并评估刷新控件语义   | Example/文档；可能源码      | 待修复 |
| R06 | E02  | P2     | Empty/Result 操作按钮补最小可见反馈或导航意图                    | Example/文档                | 待修复 |
| R07 | E02  | P2     | Watermark 补图片水印示例，或收窄页面说明                         | Example/文档                | 待修复 |
| R08 | E02  | P3     | Statistic 补趋势颜色、同比环比或指标卡组场景                     | Example/文档                | 待修复 |
| R09 | E03  | P0     | ImageCropper 改用稳定本地 fixture 或补错误态，恢复裁剪器可体验性 | Example/文档；可能源码      | 待修复 |
| R10 | E03  | P1     | CropUpload 增加不依赖本地文件选择的完整裁剪体验入口              | Example/文档                | 待修复 |
| R11 | E03  | P2     | CropUpload 自定义触发按钮补业务化可访问名称示例                  | Example/文档                | 待修复 |
| R12 | E03  | P2     | ImageCropper 文档或示例说明跨域图片与 Canvas 输出限制            | Example/文档                | 待修复 |
| R13 | E03  | P3     | ImageViewer 补受控索引同步或外部状态展示                         | Example/文档                | 待修复 |
| R14 | E04  | P1     | 修复 Grid 响应式 span/order 示例或底层响应式类生成               | 组件源码/构建输出；Example  | 待修复 |
| R15 | E04  | P2     | 后台 Shell 侧栏折叠按钮补明确可访问名称                          | Example/文档                | 待修复 |
| R16 | E04  | P2     | Divider 示例和 props 摘要补 `gradient` 线型                      | Example/文档/generated refs | 待修复 |
| R17 | E04  | P3     | Grid `wrap=false` 移动端补横向滚动提示                           | Example/文档                | 待修复 |
| R18 | E04  | P3     | Layout Shell 示例补菜单选中与内容区联动场景                      | Example/文档                | 待修复 |
| R19 | E05  | P1     | 修复 Vue Splitter 示例为空，并移除或实现不存在的能力展示         | Example/文档；可能源码      | 待修复 |
| R20 | E05  | P1     | 修正 Splitter `sizes` 示例单位和文案，避免像素被写成百分比       | Example/文档                | 待修复 |
| R21 | E05  | P2     | Descriptions 示例补响应式 `column` 或移动端可读性方案            | Example/文档                | 待修复 |
| R22 | E05  | P2     | List/Card 操作补可见业务反馈，尤其列表选中或点击结果             | Example/文档                | 待修复 |
| R23 | E05  | P2     | Carousel 控制 aria-label/i18n 与受控 current index 示例          | Example/文档；可能源码      | 待修复 |
| R24 | E05  | P3     | Skeleton 加载完成文案中文化，并增加重新触发加载态入口            | Example/文档                | 待修复 |
| R25 | E05  | P3     | Card 封面图评估本地 fixture                                      | Example/文档                | 待修复 |

## 执行规则

- 每次只领取一个 E 组审查任务，或一个小批量同源 R 修复任务。
- 审查任务必须使用浏览器体验 React/Vue Example，不用测试命令替代体验结论。
- 修复任务完成后，把对应 R 项状态更新为已完成，并同步对应 E 组下一步。
- 只改 Example/文档时至少运行 `npx -y pnpm@11.9.0 example:sources:check` 和 `git diff --check -- docs/EXAMPLE_AGENT_REQUIREMENTS.md`；页面结构变化再运行 `npx -y pnpm@11.9.0 example:build`。
- 涉及组件源码、public API 或 generated refs 时，补充对应 focused tests、grouped validation 或 docs/API 生成检查。
