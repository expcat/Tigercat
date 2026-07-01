# Tigercat Example Agent Plan

<!-- LLM-INDEX
type: example-agent-plan
scope: R28 example user-story component review queue
verified-date: 2026-07-01
source: docs/ROADMAP.md R28
-->

本文是 R28 的后续 Agent 执行队列。目标不是本轮预填全部用户故事，而是固定分组、事实源、输出格式和体验要求，让后续 Agent 可以按组件族用模拟浏览器从真实使用者角度审查 React/Vue Example 的体验问题与优化建议。

## 执行方式

- 每次只领取一个 E 组，先读取本文件对应分组，再读取 `skills/tigercat/references/component-index.md`、对应 `skills/tigercat/references/examples/{category}.md`、对应 `skills/tigercat/references/shared/props/{category}.md` 和 React/Vue Example 页面。
- 必须启动或复用示例站点，用模拟浏览器体验组件：Vue 默认 `http://localhost:5173/#/{route}`，React 默认 `http://localhost:5174/#/{route}`；如端口被占用，以实际 dev server 输出为准并记录。
- 审查时以用户能否理解、点击、输入、滚动、复制、组合和落地 Example 为主，不把任务扩大成源码重构。
- 不得用 `test:group:*`、hook spec 或单元测试命令替代体验审查；测试只允许在后续进入源码/Example 修复时作为补充验证。
- 只记录已从浏览器体验、当前 Example、props 文档、源码中核实的事实；不确定的点写成待确认，不写成结论。
- 如果发现需要修改组件源码、Example 实现、生成引用或 public API，先在本文件记录建议和优先级，后续另开 Rxx 或扩展允许修改范围后再实施。

## 输出模板

每个分组执行后，在对应 E 组下追加以下内容：

```md
**状态**：未开始 / 进行中 / 已完成（YYYY-MM-DD） / 阻塞。

**体验入口**：列出实际访问的 React/Vue URL、视口尺寸、主题/语言设置和浏览器操作路径。

**审查入口**：列出实际读取的 Example 页面、generated refs 和源码文件。

**用户故事**：

- 作为使用者，我希望...

**Example 体验问题**：

- 问题：
- 浏览器证据：
- 影响：

**组件能力建议**：

- 类型：API 缺口 / 默认行为 / a11y / i18n / 移动端 / 组合使用 / 性能 / 样式扩展 / 文档示例。
- 建议：
- 证据：

**建议优先级**：

- P0：阻断常规使用或示例不可运行。
- P1：常见业务场景缺失或 React/Vue 明显不一致。
- P2：易用性、组合性、文档清晰度改善。
- P3：示例丰富度、命名、说明文字或低风险 polish。

**后续执行建议**：只改 Example/文档，或需要组件源码/API 变更；列出建议的体验复查路径，修复阶段再补充测试命令。
```

## 分组队列

| 组  | 范围                                                                                                                           | 浏览器体验入口                                                                                                                                                                    | 状态                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| E01 | Button / Link / Text / Code / Icon / Tag / Badge                                                                               | React/Vue: `#/button`, `#/link`, `#/text`, `#/code`, `#/icon`, `#/tag`, `#/badge`                                                                                                 | 已完成（2026-07-01） |
| E02 | Avatar / AvatarGroup / Empty / Result / Statistic / QRCode / Watermark                                                         | React/Vue: `#/avatar`, `#/empty`, `#/result`, `#/statistic`, `#/qrcode`, `#/watermark`                                                                                            | 已完成（2026-07-01） |
| E03 | Image / ImageGroup / ImagePreview / ImageViewer / CropUpload / ImageCropper                                                    | React/Vue: `#/image`, `#/image-viewer`, `#/crop-upload`, `#/image-cropper`                                                                                                        | 已完成（2026-07-01） |
| E04 | Layout / Header / Sidebar / Content / Footer / Container / Row / Col / Space / Divider                                         | React/Vue: `#/layout`, `#/grid`, `#/space`, `#/divider`                                                                                                                           | 已完成（2026-07-01） |
| E05 | Card / List / Descriptions / Skeleton / Splitter / Resizable / Carousel                                                        | React/Vue: `#/card`, `#/list`, `#/descriptions`, `#/skeleton`, `#/splitter`, `#/resizable`, `#/carousel`                                                                          | 已完成（2026-07-01） |
| E06 | Affix / Anchor / BackTop / Breadcrumb / ScrollSpy / FloatButton                                                                | React/Vue: `#/affix`, `#/anchor`, `#/backtop`, `#/breadcrumb`, `#/scroll-spy`, `#/float-button`                                                                                   | 已完成（2026-07-01） |
| E07 | Menu / Dropdown / Steps / Tabs / Tree / Pagination / Spotlight                                                                 | React/Vue: `#/menu`, `#/dropdown`, `#/steps`, `#/tabs`, `#/tree`, `#/pagination`, `#/spotlight`                                                                                   | 已完成（2026-07-01） |
| E08 | Alert / Loading / Progress / Tooltip / Popover / Popconfirm                                                                    | React/Vue: `#/alert`, `#/loading`, `#/progress`, `#/tooltip`, `#/popover`, `#/popconfirm`                                                                                         | 已完成（2026-07-01） |
| E09 | Modal / Drawer / Message / Notification / Tour                                                                                 | React/Vue: `#/modal`, `#/drawer`, `#/message`, `#/notification`, `#/tour`                                                                                                         | 已完成（2026-07-01） |
| E10 | Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper                                                        | React/Vue: `#/form`, `#/input`, `#/textarea`, `#/input-group`, `#/input-number`, `#/stepper`                                                                                      | 已完成（2026-07-01） |
| E11 | Checkbox / Radio / Switch / Slider / Segmented / Rate / ColorSwatch / ColorPicker                                              | React/Vue: `#/checkbox`, `#/radio`, `#/switch`, `#/slider`, `#/segmented`, `#/rate`, `#/color-swatch`, `#/color-picker`                                                           | 已完成（2026-07-01） |
| E12 | Select / AutoComplete / Cascader / TreeSelect / Mentions / Transfer                                                            | React/Vue: `#/select`, `#/auto-complete`, `#/cascader`, `#/tree-select`, `#/mentions`, `#/transfer`                                                                               | 已完成（2026-07-01） |
| E13 | DatePicker / TimePicker / Calendar / Countdown / CronEditor / NumberKeyboard                                                   | React/Vue: `#/datepicker`, `#/timepicker`, `#/calendar`, `#/countdown`, `#/cron-editor`, `#/number-keyboard`                                                                      | 已完成（2026-07-01） |
| E14 | Upload / Signature                                                                                                             | React/Vue: `#/upload`, `#/signature`                                                                                                                                              | 已完成（2026-07-01） |
| E15 | Table / Collapse / Timeline                                                                                                    | React/Vue: `#/table`, `#/collapse`, `#/timeline`                                                                                                                                  | 已完成（2026-07-01） |
| E16 | VirtualTable / VirtualList / InfiniteScroll                                                                                    | React/Vue: `#/virtual-table`, `#/virtual-list`, `#/infinite-scroll`                                                                                                               | 未开始               |
| E17 | AreaChart / BarChart / LineChart / ScatterChart / chart subcomponents                                                          | React/Vue: `#/area-chart`, `#/bar-chart`, `#/line-chart`, `#/scatter-chart`; also inspect chart pages for ChartAxis/Canvas/Grid/Legend/Series/Tooltip behavior                    | 未开始               |
| E18 | PieChart / DonutChart / RadarChart / GaugeChart / FunnelChart / HeatmapChart / SunburstChart / TreeMapChart / Gantt / OrgChart | React/Vue: `#/pie-chart`, `#/donut-chart`, `#/radar-chart`, `#/gauge-chart`, `#/funnel-chart`, `#/heatmap-chart`, `#/sunburst-chart`, `#/treemap-chart`, `#/gantt`, `#/org-chart` | 未开始               |
| E19 | CodeEditor / MarkdownEditor / RichTextEditor / FileManager / ImageAnnotation / PrintLayout                                     | React/Vue: `#/code-editor`, `#/markdown-editor`, `#/rich-text-editor`, `#/file-manager`, `#/image-annotation`, `#/print-layout`                                                   | 未开始               |
| E20 | ActivityFeed / ChatWindow / CommentThread / DataTableWithToolbar / FormWizard / NotificationCenter / TaskBoard / Kanban        | React/Vue: `#/activity-feed`, `#/chat-window`, `#/comment-thread`, `#/data-table-with-toolbar`, `#/form-wizard`, `#/notification-center`, `#/task-board`, `#/kanban`              | 未开始               |
| E21 | Hooks demos: useDrag / useControlledState / useChartInteraction / useFormController                                            | React/Vue: `#/use-drag`, `#/use-controlled-state`, `#/use-chart-interaction`; `useFormController` 当前没有独立浏览器 demo route，如仍缺失则记录为“缺少可体验 Example”             | 未开始               |

## 分组执行记录

### E01 Button / Link / Text / Code / Icon / Tag / Badge

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/button`、`#/link`、`#/text`、`#/code`、`#/icon`、`#/tag`、`#/badge`。
- React：`http://localhost:5174/#/button`、`#/link`、`#/text`、`#/code`、`#/icon`、`#/tag`、`#/badge`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、`示例`/`代码`页签、页面级横向溢出；点击 Button 计数/重置、Link 点击计数、Code 复制回调、Tag 关闭/阻止关闭、Badge 通知递增/清零，并在 Button 页面打开 `代码`页签确认 raw-source 代码可见与可复制。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/shared/props/basic.md`。
- React Example：`examples/example/react/src/pages/ButtonDemo.tsx`、`LinkDemo.tsx`、`TextDemo.tsx`、`CodeDemo.tsx`、`IconDemo.tsx`、`TagDemo.tsx`、`BadgeDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`。
- Vue Example：`examples/example/vue3/src/pages/ButtonDemo.vue`、`LinkDemo.vue`、`TextDemo.vue`、`CodeDemo.vue`、`IconDemo.vue`、`TagDemo.vue`、`BadgeDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`。
- Route source：`examples/example/react/src/router.tsx`、`examples/example/vue3/src/router.ts`。

**用户故事**：

- 作为使用者，我希望先从 Button 页面快速比较类型、尺寸、状态、原生 `htmlType` 和宽度写法，并能复制同页源码落地到业务按钮区。
- 作为使用者，我希望 Link 页面清楚展示变体、尺寸、禁用、下划线、外链安全属性和点击拦截，避免在业务中误触发 hash 跳转。
- 作为使用者，我希望 Text 页面能同时判断语义标签、颜色、字号、字重、对齐和截断效果，方便建立正文/标签/标题的排版规范。
- 作为使用者，我希望 Code 页面能验证默认复制、自定义复制文案、禁用复制和复制回调，方便把代码展示嵌入文档页或控制台页面。
- 作为使用者，我希望 Icon 页面能确认自定义 SVG、内置 `name`、尺寸、颜色、填充图标和 `aria-label` 语义图标的差异。
- 作为使用者，我希望 Tag 页面能覆盖状态标签、分类标签、可移除标签、关闭按钮 a11y 文案和阻止关闭，方便映射筛选条件或状态标记。
- 作为使用者，我希望 Badge 页面能覆盖独立徽章、包裹按钮、位置、最大值、零值隐藏和真实通知计数，方便判断通知/消息/状态点的组合方式。

**Example 体验问题**：

- 问题：E01 未发现 P0/P1 阻断问题；React/Vue 路由均可打开，桌面与移动视口无页面级横向溢出，关键交互均能完成。
  浏览器证据：桌面视口逐页返回目标 `h1` 与预期 section 数量；移动 `390x844` 下 14 个 route 的 `hasHorizontalOverflow=false`；Button 点击后显示 `已点击 1 次` 并可重置，Link 点击后显示 `点击计数：1`，Code 复制回调显示 `上次复制:`，Tag 可关闭标签移除第一项且阻止关闭示例保留，Badge 通知从 `5` 递增到 `6` 后清零并隐藏零值。
  影响：当前 E01 可作为 Basic 展示类组件的可复制示例入口。
- 问题：Code 页面每个 Code 组件都展示完整同页源码，复制回调示例本身会让每个 section 文本包含其他 section 标题；从普通用户视角可复制性强，但页面内查找某个小示例时阅读成本偏高。
  浏览器证据：`#/code` 的 4 个 section 均含同页 raw source，浏览器验证复制事件回调时必须按第 4 个 section 定位，而不能按“复制事件回调”文本筛选。
  影响：不阻断使用；属于 Code 示例信息密度与局部片段可读性问题。
- 问题：部分 Tag 关闭按钮默认 `aria-label` 均为“关闭标签”，只有专门的 a11y 示例展示 `closeAriaLabel`。
  浏览器证据：Tag 的可关闭、不同类型、不同大小和应用场景 section 中多个关闭按钮同名；“关闭按钮无障碍标签” section 才出现 `移除标签：JavaScript` / `移除标签：已完成`。
  影响：用户能发现可自定义能力，但常规示例若直接复制，多个同名关闭按钮在复杂筛选区中语义不够精确。

**组件能力建议**：

- 类型：文档示例。
  建议：保留 E01 当前 raw-source 策略，同时在后续 Example 改进任务中考虑给 Code 页面增加一个更短的 fixture/source 示例，专门展示 `onCopy` 的最小可复制写法。
  证据：Code 页面复制回调可运行，但完整源码示例让每个 section 文本很长，定位局部用法时噪声较多。
- 类型：a11y / 文档示例。
  建议：在 Tag 常规“可关闭标签”或“应用场景”示例中给至少一个可关闭标签加入业务化 `closeAriaLabel`，让用户不必只在专门 a11y section 才看到最佳实践。
  证据：默认同名“关闭标签”按钮可用，但多个可关闭标签并列时可访问名称缺少对象信息。
- 类型：文档示例 / 组合使用。
  建议：Badge 实际应用示例后续可补一条说明或小场景，明确零值默认隐藏与 `showZero` 的业务取舍，例如通知清零后隐藏、库存/计数器可能显示零。
  证据：浏览器点击“清除通知”后零值按默认隐藏；同页已有 `显示零值` section，但真实通知场景未解释该取舍。

**建议优先级**：

- P2：为 Tag 常规可关闭示例补业务化 `closeAriaLabel`。
- P2：为 Code 复制回调补更短的 fixture/source 示例或局部可复制示例。
- P3：在 Badge 真实场景中补充零值隐藏/显示的业务说明。

**后续执行建议**：只改 Example/文档即可，不需要组件源码/API 变更。修复阶段应复查 React/Vue `#/code`、`#/tag`、`#/badge`，并补充 `npx -y pnpm@11.9.0 example:sources:check`；如调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。

### E02 Avatar / AvatarGroup / Empty / Result / Statistic / QRCode / Watermark

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/avatar`、`#/empty`、`#/result`、`#/statistic`、`#/qrcode`、`#/watermark`。
- React：`http://localhost:5174/#/avatar`、`#/empty`、`#/result`、`#/statistic`、`#/qrcode`、`#/watermark`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、`示例`/`代码`页签、页面级横向溢出；在 Avatar 页面切换首个 DemoBlock 到 `代码`页签确认 raw-source 可见与复制按钮存在；点击 QRCode 过期态刷新文案、Empty `立即创建`、Result `返回首页`/`查看订单`；检查 Watermark 背景水印图层、Statistic 千分位/前后缀、Avatar 回退与在线状态场景。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/shared/props/basic.md`。
- React Example：`examples/example/react/src/pages/AvatarDemo.tsx`、`EmptyDemo.tsx`、`ResultDemo.tsx`、`StatisticDemo.tsx`、`QRCodeDemo.tsx`、`WatermarkDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/AvatarDemo.vue`、`EmptyDemo.vue`、`ResultDemo.vue`、`StatisticDemo.vue`、`QRCodeDemo.vue`、`WatermarkDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/react/src/components/AvatarGroup.tsx`、`packages/core/src/utils/avatar-utils.ts`、`packages/react/src/components/QRCode.tsx`、`packages/vue/src/components/QRCode.ts`、`packages/core/src/types/qrcode.ts`。

**用户故事**：

- 作为使用者，我希望 Avatar 页面能直接看出图片、失败回退、文字缩写、图标、尺寸、形状、主题色和业务列表/评论/在线状态的组合方式。
- 作为使用者，我希望 AvatarGroup 页面或示例能展示真实多人头像超额计数，而不是让我手写一个容易被头像缩写逻辑改变的 `+N` 头像。
- 作为使用者，我希望 Empty 页面能覆盖无数据、无结果、错误、无图片模式和带操作按钮的空状态，便于落地列表、搜索和创建流程。
- 作为使用者，我希望 Result 页面能展示基础状态、HTTP 状态和可执行操作区，并能看出按钮在真实页面里应如何导航或反馈。
- 作为使用者，我希望 Statistic 页面能确认精度、千分位、前后缀、大小和卡片组合，方便复用到指标卡或运营看板。
- 作为使用者，我希望 QRCode 页面能展示尺寸、颜色、纠错等级、过期/加载状态和刷新回调，并与当前中文示例站语言一致。
- 作为使用者，我希望 Watermark 页面能确认文字、多行、自定义角度/间距/层级的实际覆盖效果，并理解图片水印能力是否也可用。

**Example 体验问题**：

- 问题：E02 未发现 P0 阻断问题；React/Vue 6 个 route 均可打开，桌面与移动视口无页面级横向溢出，Avatar/Empty/Result/Statistic/QRCode/Watermark 的主要展示均渲染。
  浏览器证据：桌面 `1280x720` 下 React/Vue 分别返回目标 `h1`；Avatar 为 8 个 section，Empty 为 2 个，Result/Statistic/QRCode/Watermark 均为 3 个；移动 `390x844` 下 12 个 route 的 `hasHorizontalOverflow=false`；Avatar 首个 DemoBlock 的 `代码`页签可切换并出现 `复制代码`按钮和同页 raw source。
  影响：当前 E02 基础展示可作为用户审查入口继续使用。
- 问题：Avatar 的“团队成员（头像组）”示例没有使用 `AvatarGroup` / `max`，而是手写重叠布局和 `Avatar text="+5"`；浏览器实际只显示 `+`，不是源码里看起来的 `+5`。
  浏览器证据：React `#/avatar` 的“实际应用示例”可见文本包含“团队成员（头像组）CD+”，不包含 `+5`；源码中同处写的是 `Avatar text="+5"`，而 `getInitials` 对单个 ASCII word 只取首字符。
  影响：这是常见团队成员场景，用户复制后会得到错误的超额计数表现，也看不到已有 `AvatarGroup max` 能力。
- 问题：QRCode 状态示例在中文示例站中显示英文状态文案，且过期态 `Refresh` 不是可访问 `button`，示例也没有绑定刷新回调。
  浏览器证据：React/Vue `#/qrcode` 状态 section 文本包含 `QR code expired`、`Refresh`、`Loading...`；按 role 查找 `Refresh` button 数量为 0；源码里 QRCode 组件支持 `locale` / `onRefresh`（React）和 `locale` / `refresh` emit（Vue）。
  影响：用户能看到状态外观，但无法从中文示例复制出本地化和刷新流程的最佳实践。
- 问题：Empty 的 `立即创建` 与 Result 的 `返回首页` / `查看订单` 都是静态按钮，点击后没有反馈、导航或状态变化。
  浏览器证据：React `#/empty` 中 `立即创建` 可点击但页面无变化；React `#/result` 中 `返回首页`、`查看订单` 点击后 URL 仍为 `http://localhost:5174/#/result`。
  影响：不影响组件展示，但常见业务入口缺少“按钮应该接什么逻辑”的可复制线索。
- 问题：Watermark 页面标题说明支持“文字和图片”，但 Example 只展示文字、多行文字和配置项，没有图片水印示例。
  浏览器证据：React/Vue `#/watermark` 均只有“文字水印”“多行水印”“自定义配置”3 个 section；浏览器可见每个 section 的水印背景图层存在，但没有 `image` prop 场景。
  影响：用户无法直接判断图片水印的尺寸、透明度和回退写法。

**组件能力建议**：

- 类型：文档示例 / 组合使用。
  建议：把 Avatar “团队成员（头像组）”改为使用 `AvatarGroup max`，并在 React/Vue 示例中展示 `AvatarGroup` 的溢出计数和 `aria-label`，不要用 `Avatar text="+5"` 手写超额头像。
  证据：`AvatarGroup` 已有 `max` 与 overflow label 实现；当前 Example 可见结果把 `+5` 缩成 `+`。
- 类型：i18n / 文档示例 / a11y。
  建议：为 QRCode 状态示例补中文 `locale` 覆盖和刷新回调；若进入源码修复阶段，再评估过期态刷新控件是否应渲染为 button 或具备 button role/键盘语义。
  证据：React/Vue QRCode 源码已支持 locale；当前中文站仍显示英文状态文案，`Refresh` 不是 button。
- 类型：文档示例 / 组合使用。
  建议：Empty 和 Result 的操作按钮可在 Example 中加最小状态反馈，例如“已点击创建”或“准备跳转到订单页”，让用户看到 extra 区域如何接业务逻辑。
  证据：按钮可点击但无反馈，Result 点击后 hash route 不变。
- 类型：文档示例。
  建议：Watermark 增加一个图片水印 section，或把标题文案收窄到当前已展示的文字水印能力。
  证据：页面说明写“文字和图片”，实际 section 只覆盖文字水印。
- 类型：文档示例。
  建议：Statistic 后续可补“趋势颜色/同比环比”或“指标卡组”小场景，强化运营看板可复制性。
  证据：当前示例已覆盖数值格式，但月增长只用 `↑` 文本，没有展示正负趋势区分。

**建议优先级**：

- P1：Avatar 团队成员示例改用 `AvatarGroup max`，修复 `+5` 实际只显示 `+` 的误导。
- P1：QRCode 状态示例补 locale/onRefresh，并评估过期态刷新控件的 button 语义。
- P2：Empty/Result 操作按钮补最小可见反馈或导航意图。
- P2：Watermark 补图片水印示例或收窄页面说明。
- P3：Statistic 补趋势颜色/同比环比的业务指标示例。

**后续执行建议**：优先只改 Example/文档；AvatarGroup 示例、QRCode locale/refresh、Empty/Result 反馈和 Watermark 图片水印都不需要 public API 变更。修复阶段应复查 React/Vue `#/avatar`、`#/qrcode`、`#/empty`、`#/result`、`#/watermark`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。若 QRCode 刷新控件改语义，补充 React/Vue QRCode focused tests。

### E03 Image / ImageGroup / ImagePreview / ImageViewer / CropUpload / ImageCropper

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/image`、`#/image-viewer`、`#/crop-upload`、`#/image-cropper`。
- React：`http://localhost:5174/#/image`、`#/image-viewer`、`#/crop-upload`、`#/image-cropper`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、页面级横向溢出、图片/文件输入/对话框角色；点击 Image 单图预览、ImageGroup 组图预览、独立 ImagePreview、ImageViewer 全功能按钮，并操作下一张、放大、右旋；检查 CropUpload 触发器、隐藏 file input、禁用态；等待 ImageCropper 8 秒后点击“裁剪”复查是否产生裁剪结果。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/examples/advanced.md`、`skills/tigercat/references/shared/props/basic.md`、`skills/tigercat/references/shared/props/advanced.md`。
- React Example：`examples/example/react/src/pages/ImageDemo.tsx`、`ImageViewerDemo.tsx`、`CropUploadDemo.tsx`、`ImageCropperDemo.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/ImageDemo.vue`、`ImageViewerDemo.vue`、`CropUploadDemo.vue`、`ImageCropperDemo.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/image.ts`、`packages/core/src/types/image-viewer.ts`、`packages/react/src/components/Image.tsx`、`ImageViewer.tsx`、`CropUpload.tsx`、`ImageCropper.tsx`、`packages/vue/src/components/Image.ts`、`ImageViewer.ts`、`CropUpload.ts`、`ImageCropper.ts`、`packages/core/src/utils/locale-utils.ts`。

**用户故事**：

- 作为使用者，我希望 Image 页面能直接比较尺寸、fit、加载失败、懒加载、点击预览、悬停预览、组图预览和受控预览，方便复制到商品图、头像墙或内容图库。
- 作为使用者，我希望 ImageGroup 和 ImagePreview 能展示多图计数、上一张/下一张、缩放、旋转和关闭方式，避免只知道单图预览。
- 作为使用者，我希望 ImageViewer 专页能从按钮打开指定图片，并验证计数、导航、缩放、旋转后的状态变化，方便做相册/附件查看器。
- 作为使用者，我希望 CropUpload 页面不用准备本地文件也能理解“选择图片 -> 裁剪弹窗 -> 确认 -> 输出结果”的完整链路，并能看出文件大小错误如何反馈。
- 作为使用者，我希望 ImageCropper 页面打开后能立即拖动裁剪框、键盘微调、输出 PNG/JPEG/WebP 结果，并知道外链图片失败时如何处理。

**Example 体验问题**：

- 问题：ImageCropper 示例在 React/Vue 中都卡在“正在加载待裁剪图片”，等待 8 秒后仍无 `<img>`、无 `role="application"` 裁剪器、无辅助线，点击“裁剪”也没有裁剪结果。
  浏览器证据：React/Vue `#/image-cropper` 均有 4 个 `role="img"` 加载占位，aria-label 均为“正在加载待裁剪图片”；`imgCount=0`、`guideCount=0`、`resultImages=0`；React 点击“裁剪”后 dev server 记录 `Unhandled rejection: Error: Image not loaded`。源码里的 `PHOTO` 是 `https://picsum.photos/seed/cropper/800/600`，组件内部用 `crossOrigin='anonymous'` 预加载，示例没有错误态或本地备用图。
  影响：这是 E03 唯一阻断项；用户无法体验 ImageCropper 的拖拽、键盘调整、固定比例、JPEG 输出或裁剪结果。
- 问题：CropUpload 页面展示 5 个触发器和 disabled 状态，但完整链路依赖本地文件选择；页面没有内置样例文件、模拟上传按钮或错误 fixture，浏览器审查无法验证弹窗裁剪、确认输出和 maxSize 错误反馈。
  浏览器证据：React/Vue `#/crop-upload` 均有 5 个隐藏 `input[type=file]`，`accept="image/*"`；5 个触发器 aria-label 均为“选择图片进行裁剪并上传”，最后一个 `aria-disabled="true"` 且 `tabIndex=-1`；初始状态 `modalOpen=false`、`hasResult=false`。
  影响：真实用户可以选择本地文件，但 Example 的可复制性和自动化复查不足，尤其无法从页面直接看到裁剪弹窗和错误状态。
- 问题：CropUpload 的多个触发器使用相同 `aria-label`，包括自定义“📷 上传头像”和禁用示例。
  浏览器证据：React/Vue 5 个 trigger 的 aria-label 都是“选择图片进行裁剪并上传”，可见文本分别是“选择图片”“📷 上传头像”“选择图片”等。
  影响：不阻断使用；但示例没有展示如何给头像上传、封面裁剪、大小限制等业务场景提供更具体的可访问名称。
- 问题：Image 页面常规预览、组图预览和独立 ImagePreview 功能可用，但示例仍主要依赖 `picsum.photos` 外链，缺少本地图片 fixture 对“离线/内网/CI”体验的兜底说明。
  浏览器证据：React/Vue `#/image` 均有 8 个 section、20 张图片、10 个预览 role button；桌面和移动无横向溢出。单图/独立预览打开后显示“图片预览”、工具栏含“关闭预览/缩小/重置/放大/向左旋转/向右旋转”；ImageGroup 第 3 张打开为 `3 / 6`，点下一张变为 `4 / 6`。
  影响：当前 Image 预览链路可用；风险集中在示例资产稳定性，而不是组件 API。
- 问题：ImageViewer 专页交互可用，但基础和全部功能都只通过按钮打开，没有展示缩放/旋转后如何受控记录当前索引或同步外部状态。
  浏览器证据：React/Vue `#/image-viewer` 均为 2 个 section；点击“打开查看器（第2张）”后显示 `2 / 4`，点下一张、放大、右旋后变为 `3 / 4`，图片 transform 为 `translate(0px, 0px) scale(1.25) rotate(90deg)`。
  影响：不影响当前体验；属于更完整业务示例的缺口。

**组件能力建议**：

- 类型：文档示例 / 默认行为。
  建议：把 ImageCropper 示例图片改为仓库内本地 fixture 或 data URL，并在示例中补加载失败提示；如果保留远程图，也应说明 CORS/跨域图片对 Canvas 输出的要求。
  证据：当前 `picsum.photos` 远程图在 React/Vue 示例里都导致 cropper 长时间停在 loading，占位没有错误态。
- 类型：文档示例 / 组合使用。
  建议：给 CropUpload 增加一个“使用示例图片体验裁剪”的 Example 辅助入口，或拆一个纯 ImageCropper + 本地 fixture 的完整头像裁剪场景，确保不依赖系统文件选择也能看到弹窗、确认和输出结果。
  证据：现有页面只有隐藏 file input 和触发器；未选择本地文件前无 modal、无结果、无错误状态。
- 类型：a11y / 文档示例。
  建议：在 CropUpload 自定义触发按钮示例中展示业务化 aria-label 或等价可访问名称，例如“上传头像并裁剪”“上传封面并裁剪”，同时保留 disabled 示例的不可聚焦状态。
  证据：5 个触发器当前同名；disabled 触发器已正确暴露 `aria-disabled="true"` 和 `tabIndex=-1`。
- 类型：文档示例 / 组合使用。
  建议：ImageViewer “全部功能”后续可补受控 `currentIndex` / `onCurrentIndexChange` 展示，或者在按钮旁显示当前图片索引变化。
  证据：浏览器确认内部计数和 transform 会变化，但 Example 没有展示如何把这些变化同步给业务状态。

**建议优先级**：

- P0：ImageCropper 示例改用稳定本地 fixture 或补错误态，恢复裁剪器可体验性。
- P1：CropUpload 增加不依赖本地文件选择的完整裁剪体验入口，或至少增加 fixture 驱动的裁剪结果演示。
- P2：CropUpload 自定义触发按钮补业务化可访问名称示例。
- P2：ImageCropper 文档/示例说明跨域图片与 Canvas 输出限制。
- P3：ImageViewer 补受控索引同步或外部状态展示。

**后续执行建议**：优先只改 Example/文档；ImageCropper fixture、CropUpload 示例入口和 a11y 文案都不需要 public API 变更。修复阶段应复查 React/Vue `#/image-cropper`、`#/crop-upload`、`#/image`、`#/image-viewer`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若新增本地示例资源或调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。如组件层补 ImageCropper 加载失败态，再补充 React/Vue ImageCropper focused tests。

### E04 Layout / Header / Sidebar / Content / Footer / Container / Row / Col / Space / Divider

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/layout`、`#/grid`、`#/space`、`#/divider`。
- React：`http://localhost:5174/#/layout`、`#/grid`、`#/space`、`#/divider`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、`示例`/`代码`页签、页面级横向溢出；点击普通 Sidebar 折叠按钮和后台 Shell 侧栏收起按钮；在 Grid 页面切换桌面/移动视口核对响应式 span/order 与 `wrap=false` 内部横向滚动；在 Space 页面核对 `wrap` tag 换行和自定义 `24px` gap；在 Divider 页面切换首个 `代码`页签，并检查 separator role、横/竖向分割线、线型、粗细和是否展示 `gradient`。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/layout.md`、`skills/tigercat/references/shared/props/layout.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/shared/props/basic.md`。
- React Example：`examples/example/react/src/pages/LayoutDemo.tsx`、`GridDemo.tsx`、`SpaceDemo.tsx`、`DividerDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/LayoutDemo.vue`、`GridDemo.vue`、`SpaceDemo.vue`、`DividerDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/layout.ts`、`grid.ts`、`space.ts`、`divider.ts`、`packages/core/src/utils/grid.ts`、`space.ts`、`divider.ts`、`packages/react/src/components/Layout.tsx`、`Space.tsx`、`Divider.tsx`、`packages/vue/src/components/Layout.ts`、`Space.ts`、`Divider.ts`。

**用户故事**：

- 作为使用者，我希望 Layout 页面能展示页面骨架、Header/Footer 高度、普通 Sidebar、折叠 Sidebar、后台 Shell 侧栏和 Mini 侧栏，方便复制到管理后台应用。
- 作为使用者，我希望 Grid 页面能实际验证 24 分栏、gutter、响应式 span/offset/order、对齐、偏移、排序、nowrap 和 flex 自适应，而不只是看到静态文案。
- 作为使用者，我希望 Space 页面能直接比较水平/垂直间距、内置 size、自定义 px gap、align 和 wrap，在移动端也能看出换行行为。
- 作为使用者，我希望 Divider 页面能确认水平/垂直 separator 语义、solid/dashed/dotted/gradient、spacing、color 和 thickness 的视觉差异，并复制对应 React/Vue 写法。
- 作为使用者，我希望每个 Layout 类页面的 `代码`页签都来自当前页面 raw source，这样复制出的导入路径、状态管理和 Vue/React 绑定差异是可信的。

**Example 体验问题**：

- 问题：E04 未发现 P0 route-level 阻断问题；React/Vue 8 个 route 均可打开，桌面与移动视口无页面级横向溢出，Layout 折叠、Space 换行、Divider 语义和代码页签基本可体验。
  浏览器证据：React/Vue `#/layout` 分别有 8 个 section，`#/grid` 有 9 个，`#/space` 有 5 个，`#/divider` 有 5 个；移动 `390x844` 复查 8 个 route 的 `hasHorizontalOverflow=false`。普通 Sidebar 的“折叠侧边栏”按钮可点击，React 示例中目标 Sidebar 从 `192px` 收到 `64px`，按钮文案变为“展开侧边栏”。Space 的 14 个 tag 在桌面为 3 行、移动为 7 行；Divider 暴露 14 个 `role="separator"`，横向/竖向 `aria-orientation` 与边框方向一致；首个 Divider `代码`页签可切换，出现 `复制代码`按钮和 raw source import。
  影响：E04 大多数页面可作为 Layout 类组件的审查入口继续使用。
- 问题：Grid 的响应式 span/order 示例在桌面 `1280x720` 下没有呈现 md/lg 分栏和排序变化，视觉仍按 `xs` 基础值整行堆叠。
  浏览器证据：React `#/grid` 的“响应式栅格”四个 Col 都带有 CSS 变量，例如 `--tiger-col-span-md: 50%`、`--tiger-col-span-lg: 33.333333%`，但 computed width 仍为 `798px`（整行 100%）；Vue 同组在桌面也全部为整行宽度。数字 span 示例正常：`col-12` 约 `399px`、`col-8` 约 `266px`、`col-6` 约 `200px`，说明问题集中在响应式类/构建输出而不是基础栅格。响应式排序同样停留在 xs 视觉顺序：`xs:1 -> md:2` 位于最左，`xs:3 -> md:1` 没有在桌面移到第一列。
  影响：用户会复制一个声称支持响应式的示例，但在示例站看不到 md/lg 行为；这是常见布局能力，属于 React/Vue 同时可见的 P1 体验/行为问题。
- 问题：后台 Shell 侧栏收起按钮在 React/Vue 中没有 `aria-label`，折叠后按钮可见宽度约 `39px`，主要可见内容是符号加“展开侧栏”的压缩文本。
  浏览器证据：坐标点击 `"<收起侧栏"` 后 React/Vue Shell Sidebar 都从 `240px` 收到 `64px`，aside 增加 `tiger-sidebar-collapsed`；收起后按钮文本为 `">展开侧栏"`，`buttonAria=null`。
  影响：功能可用，但这个管理后台 Shell 是推荐复制场景，示例没有示范折叠按钮在窄宽度下的明确可访问名称。
- 问题：Divider 类型和核心实现支持 `lineStyle="gradient"`，但 props 摘要与 Example 页面只展示 `solid / dashed / dotted`。
  浏览器证据：`packages/core/src/types/divider.ts` 中 `DividerLineStyle = 'solid' | 'dashed' | 'dotted' | 'gradient'`，`getDividerClasses` 为 gradient 生成背景渐变线；React/Vue `#/divider` 页面 `hasGradientText=false`，14 个 separator 的 computed `backgroundImage` 都是 `none`。
  影响：用户无法从 Example 发现现代主题下的柔和渐变分割线能力，属于文档/Example 覆盖缺口。
- 问题：Grid 的 `wrap=false` 示例在移动端正确把溢出限制在内部滚动容器，但页面没有明显提示“这里需要横向滚动查看后续列”。
  浏览器证据：移动 `390x844` 下页面级无横向溢出；`wrap=false` 内部容器 `clientWidth=165`、`scrollWidth=720`，`overflow-x-auto` 生效。
  影响：技术实现正确；但从普通用户视角，移动端如果没有滚动提示，容易误以为后几列不可见或示例被截断。

**组件能力建议**：

- 类型：默认行为 / 文档示例 / 构建输出。
  建议：优先修复 Row/Col 响应式 span/order 类在 example build 中不生效的问题，或调整 Grid 实现为不依赖未生成的响应式任意值类；修复后在 React/Vue 示例中重新验证 `span={{ xs, md, lg }}`、响应式 `offset` 和响应式 `order`。
  证据：CSS 变量已写入 DOM，但 md/lg computed width/order 未覆盖基础 `w-[var(--tiger-col-span)]` / `order-[var(--tiger-col-order)]`。
- 类型：a11y / 文档示例。
  建议：后台 Shell 示例的收起/展开按钮增加业务化 `aria-label` 或 `title`，并在折叠态保持明确的可访问名称，例如“展开后台侧栏”“收起后台侧栏”。
  证据：Shell 折叠交互可用，但按钮没有 `aria-label`，折叠后可视宽度只剩约 `39px`。
- 类型：文档示例。
  建议：Divider 的线条样式 section 增加 `gradient`，并同步 props 摘要或 generated docs，让用户看到类型中已有的渐变分割线能力。
  证据：源码支持 `gradient`，当前页面与 props 摘要只展示 solid/dashed/dotted。
- 类型：文档示例 / 移动端。
  建议：Grid `wrap=false` 示例在内部滚动容器旁补一个轻量可视提示或场景文案，说明移动端可横向滚动查看后续列。
  证据：内部 `overflow-x-auto` 已限制溢出，但移动端可见区域只显示部分列。
- 类型：组合使用。
  建议：Layout 页面后续可把后台 Shell 示例里的 Header/Content 与侧栏菜单状态连成更完整的小应用骨架，例如展示选中菜单项对应的内容标题。
  证据：当前 Shell 已覆盖 Sidebar + Menu collapsed popup，但 Content 只显示静态“Shell 内容区域”。

**建议优先级**：

- P1：修复 Grid 响应式 span/order 示例或底层响应式类生成，使 React/Vue `#/grid` 在桌面能看到 md/lg 分栏与排序。
- P2：为后台 Shell 侧栏折叠按钮补明确可访问名称。
- P2：Divider 示例和 props 摘要补 `gradient` 线型。
- P3：Grid `wrap=false` 移动端补横向滚动提示。
- P3：Layout Shell 示例补菜单选中与内容区联动场景。

**后续执行建议**：Grid 响应式问题需要组件源码/构建输出层修复，不应只改文案；修复阶段应复查 React/Vue `#/grid` 的响应式 span、offset、order，并补充 `Row`/`Col` focused tests 或对应 grouped layout 验证。Shell a11y、Divider gradient 和 nowrap 提示可优先只改 Example/文档；修复后复查 React/Vue `#/layout`、`#/divider`、`#/grid`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。

### E05 Card / List / Descriptions / Skeleton / Splitter / Resizable / Carousel

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/card`、`#/list`、`#/descriptions`、`#/skeleton`、`#/splitter`、`#/resizable`、`#/carousel`。
- React：`http://localhost:5174/#/card`、`#/list`、`#/descriptions`、`#/skeleton`、`#/splitter`、`#/resizable`、`#/carousel`。
- 视口：桌面默认 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、`示例`/`代码`页签、图片加载、ARIA 角色和页面级横向溢出；在 Card 页面打开首个 `代码`页签确认 raw-source；点击 List 分页、加载按钮和可点击列表项；等待 Skeleton 加载态切换；用键盘操作 Splitter separator 与 Resizable handle；点击 Carousel dot position 和编程式 `Next`。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/layout.md`、`skills/tigercat/references/shared/props/layout.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/shared/props/basic.md`。
- React Example：`examples/example/react/src/pages/CardDemo.tsx`、`ListDemo.tsx`、`DescriptionsDemo.tsx`、`SkeletonDemo.tsx`、`SplitterDemo.tsx`、`ResizableDemo.tsx`、`CarouselDemo.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/CardDemo.vue`、`ListDemo.vue`、`DescriptionsDemo.vue`、`SkeletonDemo.vue`、`SplitterDemo.vue`、`ResizableDemo.vue`、`CarouselDemo.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/card.ts`、`list.ts`、`descriptions.ts`、`skeleton.ts`、`splitter.ts`、`resizable.ts`、`carousel.ts`、`packages/react/src/components/Splitter.tsx`、`Resizable.tsx`、`Carousel.tsx`、`packages/vue/src/components/Splitter.ts`、`Resizable.ts`、`Carousel.ts`。

**用户故事**：

- 作为使用者，我希望 Card 页面能比较变体、尺寸、内边距、封面、header/footer/actions 和完整商品卡片，复制后能直接做内容卡或商品卡。
- 作为使用者，我希望 List 页面能覆盖基础数据、头像、extra 操作、自定义渲染、分页、加载、空态、点击和竖直布局，并在交互后看到业务状态变化。
- 作为使用者，我希望 Descriptions 页面在桌面和移动端都能读清详情字段，并看到响应式 `column` 的推荐写法，而不是在窄列里截断字段。
- 作为使用者，我希望 Skeleton 页面能真实展示加载前后切换，且加载完成后的业务内容语言与中文站一致。
- 作为使用者，我希望 Splitter 页面能直接拖拽或键盘调整水平/垂直/嵌套面板，并且 React/Vue 示例表现一致。
- 作为使用者，我希望 Resizable 页面能用鼠标或键盘调整容器尺寸，看到当前宽高同步变化，并理解锁定比例、单轴和禁用状态。
- 作为使用者，我希望 Carousel 页面能验证 dots、arrows、autoplay、fade、dot position、非循环边界和 ref 控制，同时控制名称符合当前语言环境。

**Example 体验问题**：

- 问题：E05 未发现整组 route-level P0 阻断问题；React/Vue 除 Vue Splitter 内容缺失外，其余 route 均可打开，桌面和移动视口无页面级横向溢出，Card/List/Skeleton/Resizable/Carousel 主要交互可体验。
  浏览器证据：React/Vue `#/card` 均为 7 个 section、6 张封面图加载完成；`#/list` 均为 14 个 section，点击第 2 页后显示 `当前：第 2 页，10 / 页` 且出现 `列表项 11`，点击“模拟加载”后按钮变为 `加载中...` 并有 `aria-busy=true`，2 秒后恢复；`#/skeleton` 初始有 58 个 skeleton/pulse 节点，等待 3.8 秒后出现“文章标题”和 `Item 1`；`#/resizable` 右下 handle 键盘 ArrowRight/ArrowDown 后从 `300 × 150` 变为 `310 × 160`；`#/carousel` 点击 `right` 后按钮变为 primary，点击编程式 `Next` 后 transform 从 `0` 变为 `-831px` / `-197px` 等位移。移动 `390x844` 下 14 个 E05 route 的 `pageOverflow=false`。
  影响：E05 大多数页面可继续作为 Layout/Advanced 交互类组件的用户审查入口。
- 问题：Splitter 示例把 `sizes={[30, 70]}` / `:sizes="[30, 70]"` 文案写成 `30% / 70%`，但组件公开类型和实现按像素解释 `sizes`，React 实际渲染为 `width: 30px` 与 `width: 70px`，左侧内容还出现内部溢出。
  浏览器证据：React `#/splitter` 首个水平示例有 5 个 `role="separator"`；键盘按 ArrowRight 前首两个 pane 为 `30px / 70px`，按后变为 `40px / 60px`。`packages/core/src/types/splitter.ts` 写明 `sizes?: number[]` 是 “Initial sizes of each pane in pixels”；React/Vue 示例源码和 snippet 均把文本写作“左侧面板 (30%) / 右侧面板 (70%)”。
  影响：用户会误以为 `sizes` 是百分比，并复制出几乎不可用的窄面板；这是高频布局场景，应作为 P1 修复。
- 问题：Vue `#/splitter` 页面使用 `#panel-0` / `#panel-1` 命名 slot，但 Vue Splitter 实现只读取默认 slot，导致 4 个示例容器有高度和边框却没有 pane、separator 或示例文本。
  浏览器证据：Vue `#/splitter` 显示 `h1` 和 4 个 section（水平分割、垂直分割、嵌套分割、可折叠），但 `paneCount=0`、`separatorCount=0`，`hasLeftPanel=false`、`hasRightPanel=false`；4 个 `data-direction` 容器宽 `879px`、高 `200/300px`，`text=""`。源码 `packages/vue/src/components/Splitter.ts` 使用 `slots.default?.()`，而 `examples/example/vue3/src/pages/SplitterDemo.vue` 只传命名 slot。
  影响：Vue 用户无法体验 Splitter 的核心拖拽/键盘调整能力，且 React/Vue 示例明显不一致。
- 问题：Vue Splitter 示例展示“可折叠”并传入 `:collapsible` / `:min-sizes`，但当前 Vue Splitter props 没有 `collapsible` 或 `minSizes`，React 同组只展示“最小尺寸”。
  浏览器证据：`packages/vue/src/components/Splitter.ts` props 只有 `direction`、`sizes`、`min`、`max`、`gutterSize`、`disabled`、`className`、`style`；`packages/core/src/types/splitter.ts` 的公开 `SplitterProps` 也没有 `collapsible` / `minSizes`。Vue Example 第 4 个 DemoBlock 标题为“可折叠”，React 第 4 个为“最小尺寸”。
  影响：即使修复 slot 后，Vue 页面仍会宣传不存在的组件能力，属于 React/Vue 不一致和 API 误导。
- 问题：Descriptions 在多列示例中没有使用响应式 `column` 或移动端降级，多个详情容器在桌面小列宽与移动视口下出现内部内容溢出/截断。
  浏览器证据：React/Vue `#/descriptions` 桌面 `1280x720` 下“不同尺寸”中 Descriptions 容器 `clientWidth=229px`、`scrollWidth=381/449/548px`；移动 `390x844` 下多处 Descriptions 容器 `clientWidth=165px`、`scrollWidth=545/552/548px`，容器 class 含 `overflow-hidden`，页面级 `pageOverflow=false`。
  影响：页面整体不横向滚动，但用户在窄视口无法完整阅读邮箱、地址、系统版本等字段；示例没有展示类型中已有的响应式 `column` 写法。
- 问题：List 的“可点击列表”和 Card/List 操作按钮多数只触发控制台或没有可见反馈，用户难以复制出业务状态流。
  浏览器证据：点击 React `#/list` 可点击列表第一项后页面没有“点击了/已选择/选中”等可见状态，也没有 selected/active 类应用到列表项，控制台仅记录 `点击了列表项: Object 索引: 0`；Card 的“收藏/购买”、List 的“查看/购买/添加”按钮源码没有绑定反馈。
  影响：组件交互能力存在，但 Example 对业务接线的可复制性不足，尤其列表选择、任务查看、商品购买等常见场景。
- 问题：Skeleton 加载完成后的真实场景内容混入英文文案，且定时加载只能等待，缺少可重新触发的控制。
  浏览器证据：React/Vue `#/skeleton` 等待 3.8 秒后显示“文章标题”和 `Item 1`，但页面同时出现 `This is the content loaded after the skeleton.`；重新体验加载态需要刷新页面，没有“重新加载”按钮。
  影响：中文示例站语言不一致；用户也不便反复观察 Skeleton 与真实内容的切换边界。
- 问题：Carousel 在中文示例站的内部控制和无障碍名称仍是英文，且页面没有展示受控 `currentIndex` / `onCurrentIndexChange` 的外部状态同步。
  浏览器证据：React/Vue `#/carousel` 均有 45 个按钮，其中 dots/arrows aria-label 为 `Go to slide N`、`Previous slide`、`Next slide`，root/slide aria-label 源码也写死 `Image carousel` / `Slide N of M`；点击编程式 `Next` 能改变 transform，但页面没有显示当前 slide index 或 change 回调结果。
  影响：视觉交互可用，但 a11y/i18n 与可复制业务状态示例不足。

**组件能力建议**：

- 类型：文档示例 / 默认行为。
  建议：修复 Splitter 示例的尺寸语义；若继续按像素 API，示例应使用合理像素值（如 `240/520`）并把文案改为 px；若期望百分比分割，则需要先扩展组件 API 后再更新示例。
  证据：公开类型和实现均按像素处理 `sizes`，当前示例却写成百分比并渲染为 `30px/70px`。
- 类型：文档示例 / React-Vue 一致性。
  建议：Vue Splitter 示例改用默认 slot 子节点，移除不存在的 `collapsible` / `min-sizes` 展示，或在后续源码任务中真正实现对应 pane config 后再展示。
  证据：Vue `#/splitter` 当前没有 pane/separator，可折叠 props 不在公开 `SplitterProps` / Vue props 中。
- 类型：移动端 / 文档示例。
  建议：Descriptions 示例把高列数场景改为响应式 `column={{ xs: 1, md: 2, lg: 3 }}` / Vue 等价对象，或在窄容器旁显式加入内部横向滚动与提示。
  证据：类型已支持 responsive object；当前示例固定 `column={2/3/4}` 在移动端和小列宽下截断内容。
- 类型：组合使用 / 文档示例。
  建议：List 可点击、Card 操作和 List extra 操作补最小可见反馈，例如当前选中项、已收藏/已加入购物车、已查看任务，避免只写 `console.log`。
  证据：点击列表项只产生日志，页面无选择状态；多个操作按钮无 handler。
- 类型：i18n / 文档示例。
  建议：Skeleton 加载完成内容统一中文，并给加载态示例增加“重新加载”按钮或受控 loading 示例；Carousel 后续补中文 aria-label / locale 能力或示例层覆写，并展示受控当前页状态。
  证据：Skeleton 真实场景出现英文内容；Carousel 源码 aria-label 写死英文且 Example 没有 current index 状态展示。
- 类型：文档示例 / 资产稳定性。
  建议：Card 封面图后续可考虑仓库内 fixture 或本地可控图片，降低外链图片对离线/内网/CI 体验的影响。
  证据：当前 6 张 Unsplash 外链在本次浏览器体验中加载成功，但与 E03 图片类问题类似，示例资产稳定性仍依赖外网。

**建议优先级**：

- P1：修复 Vue Splitter 示例为空的问题，并移除/实现不存在的 `collapsible` / `min-sizes` 能力展示。
- P1：修正 Splitter `sizes` 的示例单位和文案，避免 `30px/70px` 被写成 `30%/70%`。
- P2：Descriptions 示例补响应式 `column` 或移动端可读性方案。
- P2：List/Card 操作补可见业务反馈，尤其可点击列表的选中/点击结果。
- P2：Carousel 控制 aria-label/i18n 与受控 current index 示例。
- P3：Skeleton 加载完成文案中文化并增加重新触发加载态入口。
- P3：Card 封面图后续评估本地 fixture。

**后续执行建议**：Splitter 需要优先进入 Example/组件一致性修复：先只改 Vue Splitter 示例 slot 与错误 props、修正 React/Vue `sizes` 示例值/文案；若选择支持百分比或折叠能力，则另开组件源码/API 任务并补 React/Vue focused tests。Descriptions/List/Card/Skeleton/Carousel 可先作为 Example/文档改进；修复阶段复查 React/Vue `#/splitter`、`#/descriptions`、`#/list`、`#/skeleton`、`#/carousel`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。

### E06 Affix / Anchor / BackTop / Breadcrumb / ScrollSpy / FloatButton

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/affix`、`#/anchor`、`#/backtop`、`#/breadcrumb`、`#/scroll-spy`、`#/float-button`。
- React：`http://localhost:5174/#/affix`、`#/anchor`、`#/backtop`、`#/breadcrumb`、`#/scroll-spy`、`#/float-button`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点当前默认主题；页面正文为中文，部分组件默认 aria/工具栏文案受全局语言切换影响显示英文。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 标题、React/Vue 页面级横向溢出；滚动 Affix 内部容器；点击 Anchor 自定义容器 `Section 4` 和事件示例链接；滚动 BackTop 页面主容器和内部容器；检查 Breadcrumb 外链、当前项和折叠示例覆盖；点击 ScrollSpy 水平导航和自定义容器导航；悬停 FloatButtonGroup 触发器并检查禁用态、独立悬浮位置；在 FloatButton 页面切换 `代码` tab，确认 raw-source 代码和 `复制代码`按钮可见。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/navigation.md`、`skills/tigercat/references/shared/props/navigation.md`。
- React Example：`examples/example/react/src/pages/AffixDemo.tsx`、`AnchorDemo.tsx`、`BackTopDemo.tsx`、`BreadcrumbDemo.tsx`、`ScrollSpyDemo.tsx`、`FloatButtonDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/AffixDemo.vue`、`AnchorDemo.vue`、`BackTopDemo.vue`、`BreadcrumbDemo.vue`、`ScrollSpyDemo.vue`、`FloatButtonDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/affix.ts`、`anchor.ts`、`back-top.ts`、`breadcrumb.ts`、`float-button.ts`、`scroll-spy.ts`。

**用户故事**：

- 作为使用者，我希望 Affix 页面能清楚验证窗口滚动和容器滚动下元素何时吸顶/吸底，方便复制到工具栏、筛选栏或操作按钮区。
- 作为使用者，我希望 Anchor 页面能点击每一个锚点并跳到真实内容，事件示例能显示点击与激活结果，嵌套锚点也能对应到真实章节。
- 作为使用者，我希望 BackTop 页面能同时验证页面主滚动容器和局部滚动容器，并能看出按钮的可访问名称、位置和点击回调。
- 作为使用者，我希望 Breadcrumb 页面覆盖链接、当前项、外链安全、图标、扩展区域、多级折叠和 `maxItems`，方便落地到后台详情页。
- 作为使用者，我希望 ScrollSpy 页面能展示页面目录、水平目录、自定义容器、事件来源和 disabled/children 数据结构，方便复制到文档页或设置页。
- 作为使用者，我希望 FloatButton 页面能验证基础按钮、分组展开、禁用、固定到视口、可访问名称和点击反馈，方便复制到客服、帮助和快捷操作入口。

**Example 体验问题**：

- 问题：E06 未发现 route-level P0 阻断问题；React/Vue 12 个 route 均可打开，桌面和移动视口无页面级横向溢出，BackTop、Anchor 自定义容器、ScrollSpy 自定义容器和 FloatButtonGroup 的主要交互可触发。
  浏览器证据：React/Vue `#/affix`、`#/anchor`、`#/backtop`、`#/breadcrumb`、`#/scroll-spy`、`#/float-button` 均返回目标 `h1`；移动 `390x844` 下 12 个 route 的 `pageOverflow=false`、`mainOverflow=false`；Anchor 点击 `Section 4` 后内部容器从 `0` 滚到 `370/385`；BackTop 主容器滚到 `650/666` 后出现页面级和容器级 `Back to top` 按钮，内部容器滚到 `220`；FloatButtonGroup hover 后出现 `操作 A` / `操作 B`；FloatButton 独立悬浮按钮固定在视口右下角，`aria-label="客服入口"`。
  影响：E06 可作为 Navigation 浮动/滚动/路径类组件的审查入口继续使用。
- 问题：Affix 示例把“向下滚动触发固定”放在内部滚动容器内，但没有给 Affix 指定该容器作为 `target`；滚动内部容器后没有出现固定态元素，用户无法从页面直接体验固钉触发。
  浏览器证据：React/Vue `#/affix` 内部容器 `scrollTop` 从 `0` 改到 `180`，但页面内 `position: fixed` 的 Affix 文本为空；源码中顶部示例只传 `offsetTop`，未传 `target`。
  影响：用户会误以为内部容器滚动应触发 Affix，但复制示例后看不到预期效果，属于常见滚动容器场景的误导。
- 问题：Anchor 页面多个链接指向不存在的 DOM id，包括嵌套锚点章节和右侧目录的 `#demo-ink`。
  浏览器证据：React/Vue `#/anchor` 中存在 `#chapter1`、`#section1-1`、`#section1-2`、`#chapter2`、`#section2-1`、`#demo-ink` 链接，但页面没有同名元素；点击事件示例后可见事件文本为 `激活: #demo-basic`，无法完整验证嵌套章节跳转；React dev server 还记录 `Cannot update a component (AnchorDemo) while rendering a different component (Anchor)`。
  影响：嵌套锚点和墨水指示器看起来可点击，但用户复制到文档目录时容易遗漏真实目标节点；React 示例还存在渲染期更新噪声。
- 问题：Breadcrumb 公开支持 `maxItems` 折叠，但 Example 没有展示折叠/展开；多级层次只是完整展示所有项。
  浏览器证据：`packages/core/src/types/breadcrumb.ts` 和 generated props 均列出 `maxItems`；React/Vue `#/breadcrumb` 有多级层次 section，但页面没有 `...` 折叠项，浏览器检查 `hasMaxItemsExample=false`。
  影响：后台详情页常见的长路径折叠能力不可从 Example 发现，用户需要回到 props 文档自行推断。
- 问题：BackTop 的可见按钮默认可访问名称为英文 `Back to top`，与中文示例正文不一致；页面和容器同时显示时两个按钮同名。
  浏览器证据：React/Vue `#/backtop` 主容器滚动后有两个可见按钮 `aria-label="Back to top"`，分别位于容器左下和页面右下。
  影响：视觉使用不阻断，但中文示例站的 a11y 文案不一致；多个 BackTop 并存时屏幕阅读器用户难以区分页面返回顶部和容器返回顶部。
- 问题：ScrollSpy 自定义容器能滚动并产生事件，但示例没有展示 disabled 项或更明确的点击来源反馈；点击更深的 `监控` 导航后最终事件可能停在中间 section 的 scroll 来源。
  浏览器证据：React/Vue `#/scroll-spy` 点击自定义容器导航后容器滚动到 `292/306`，最近事件显示 `发布 / scroll`；props 支持 `disabled`，页面没有 disabled item 示例。
  影响：核心能力可用，但用户难以判断 click 与 scroll 来源如何稳定接业务分析或侧边目录状态。
- 问题：FloatButton 基础按钮和点击回调主要写入控制台，页面没有可见反馈；分组只展示 hover 触发，没有 click/controlled open 场景。
  浏览器证据：React/Vue `#/float-button` hover `菜单` 后出现 `操作 A` / `操作 B`，禁用按钮为 `不可用`，固定按钮为 `客服入口`；点击基础按钮页面无可见状态变化。公开 props 支持 `trigger="click"` / `open`。
  影响：展示外观和展开没问题，但用户复制到帮助/客服场景时缺少可见业务接线和移动端更友好的点击展开示例。

**组件能力建议**：

- 类型：文档示例 / 默认行为。
  建议：Affix 示例补一个真实可滚动目标：如果当前 API 只支持 selector `target`，给内部容器稳定 id 并传 `target`；或者把示例改成页面主滚动触发，避免把无效内部滚动写成体验路径。
  证据：内部滚动容器滚动后没有固定态；顶部示例未绑定 `target`。
- 类型：文档示例 / 组合使用。
  建议：Anchor 嵌套章节补真实 `id` 内容块，并把右侧目录 `#demo-ink` 改为真实 `id` 或移除；事件示例可同时显示最近点击 href 与最近激活 href，便于理解差异。
  证据：多个 href 没有对应 DOM 目标，事件文本只显示最终激活项。
- 类型：文档示例。
  建议：Breadcrumb 增加 `maxItems` 折叠示例，覆盖长路径折叠、展开和当前项语义；现有外链 `rel="noopener noreferrer"` 可保留为安全示例。
  证据：公开 props 已支持 `maxItems`，但 Example 没有折叠项。
- 类型：a11y / i18n / 文档示例。
  建议：BackTop 在页面级和容器级示例中展示自定义 aria-label 或 locale 文案，例如“返回页面顶部”“返回容器顶部”；若组件层已有 locale 能力，Example 应显式示范。
  证据：两个可见 BackTop 按钮都叫 `Back to top`。
- 类型：文档示例 / 组合使用。
  建议：ScrollSpy 补 disabled 项和可见 click/scroll 来源日志，或让点击自定义容器导航后的目标与最近事件更稳定对应。
  证据：当前自定义容器可滚动，但最终事件显示中间项 `发布 / scroll`。
- 类型：文档示例 / 移动端。
  建议：FloatButton 补 click 触发或受控 `open` 的分组示例，并给基础按钮加最小可见反馈，例如“已打开客服入口”或“已触发快捷操作”。
  证据：hover 分组可用，但 click/controlled open 和业务反馈未展示。

**建议优先级**：

- P1：修正 Affix 内部滚动容器示例，使“滚动触发固定”真实可体验。
- P1：修复 Anchor 中指向不存在 DOM id 的链接，尤其嵌套锚点和 `#demo-ink`，并消除 React Anchor 渲染期更新警告。
- P2：Breadcrumb 增加 `maxItems` 折叠/展开示例。
- P2：BackTop 页面级/容器级按钮展示中文且互相区分的可访问名称。
- P2：ScrollSpy 补 click/scroll 来源反馈和 disabled item 示例。
- P3：FloatButton 补 click/controlled 分组与可见业务反馈。

**后续执行建议**：优先只改 Example/文档，不需要 public API 变更。修复阶段应复查 React/Vue `#/affix`、`#/anchor`、`#/breadcrumb`、`#/backtop`、`#/scroll-spy`、`#/float-button`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。若 BackTop 需要组件级 locale/aria API 才能区分按钮，再另开组件源码任务并补 focused tests。

### E07 Menu / Dropdown / Steps / Tabs / Tree / Pagination / Spotlight

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/menu`、`#/dropdown`、`#/steps`、`#/tabs`、`#/tree`、`#/pagination`、`#/spotlight`。
- React：`http://localhost:5174/#/menu`、`#/dropdown`、`#/steps`、`#/tabs`、`#/tree`、`#/pagination`、`#/spotlight`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 数量、`示例`/`代码`页签、页面级横向溢出；点击 Menu 折叠/展开、Dropdown 触发器与受控按钮、Steps 上/下一步和可点击步骤、Tabs 新增标签、Tree 节点过滤与禁用节点、Pagination 下一页/快速跳页/i18n 切换、Spotlight 打开命令面板/搜索/选择命令。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/navigation.md`、`skills/tigercat/references/shared/props/navigation.md`。
- React Example：`examples/example/react/src/pages/MenuDemo.tsx`、`DropdownDemo.tsx`、`StepsDemo.tsx`、`TabsDemo.tsx`、`TreeDemo.tsx`、`PaginationDemo.tsx`、`SpotlightDemo.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/MenuDemo.vue`、`DropdownDemo.vue`、`StepsDemo.vue`、`TabsDemo.vue`、`TreeDemo.vue`、`PaginationDemo.vue`、`SpotlightDemo.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/menu.ts`、`dropdown.ts`、`steps.ts`、`tabs.ts`、`tree.ts`、`pagination.ts`、`spotlight.ts`、`packages/react/src/components/Menu.tsx`、`Dropdown.tsx`、`Steps.tsx`、`Tabs.tsx`、`Tree.tsx`、`Pagination.tsx`、`Spotlight.tsx`、对应 Vue 组件文件。

**用户故事**：

- 作为使用者，我希望 Menu 页面能比较竖向、横向、inline、折叠、暗色、图标、分组和单展开状态，并能确认选中/展开状态如何受控。
- 作为使用者，我希望 Dropdown 页面能直接体验 hover/click、placement、disabled、portal、受控 open、点击不关闭和菜单项点击反馈，方便复制到操作菜单。
- 作为使用者，我希望 Steps 页面能展示流程推进、错误状态、纵向步骤、可点击步骤、禁用步骤和自定义图标，并能看到当前步骤同步到业务状态。
- 作为使用者，我希望 Tabs 页面能覆盖基础、卡片、可编辑、不同位置、居中、尺寸、禁用、图标和销毁 inactive pane，且新增/关闭标签的 a11y 文案适合中文站。
- 作为使用者，我希望 Tree 页面能展示选择、勾选、父子独立、禁用、懒加载、过滤、连接线、多选、受控展开、空数据和 block node，且复选框/节点标签可直接复制到中文业务里。
- 作为使用者，我希望 Pagination 页面能清楚体验页码切换、快速跳页、pageSize、simple、size、alignment、totalText、disabled、hideOnSinglePage、showLessItems、i18n 和 labels，且同页多个分页示例不会互相污染状态。
- 作为使用者，我希望 Spotlight 页面能打开命令面板、搜索命令、跳过 disabled 命令、选择后显示结果，并看到受控 query 如何反馈到页面。

**Example 体验问题**：

- 问题：E07 未发现 P0 阻断问题；React/Vue 14 个 route 均可打开，桌面与移动视口无页面级横向溢出。
  浏览器证据：桌面 `1280x720` 下 React/Vue 分别返回目标 `h1`；Menu 2 个 section、Dropdown 4 个、Steps 2 个、Tabs 3 个、Tree 4 个、Pagination 3 个、Spotlight 1 个；移动 `390x844` 下复查 14 个 route 的 `hasHorizontalOverflow=false`。
  影响：当前 E07 页面可作为 Navigation 组件体验审查入口继续使用。
- 问题：Dropdown 的“点击事件”示例只提示“查看控制台”，页面无可见业务反馈；同页还出现大量 portal 菜单文本，普通用户难以确认刚刚点击了哪个菜单项。
  浏览器证据：React `#/dropdown` 页面文本包含“监听菜单项的点击事件（查看控制台）”，浏览器检查 `bodyHasVisibleFeedback=false`；页面正文/portal 文本中同时出现多组“编辑/复制/删除/菜单项”，但没有“已选择/已点击/上次操作”等状态。
  影响：用户能看到 Dropdown 外观和 open 控制，但复制点击事件示例时缺少可见反馈模式。
- 问题：Tabs 可编辑卡片可新增标签，但中文示例站中的新增/关闭按钮可访问名称仍是英文前缀。
  浏览器证据：React `#/tabs` 点击 `aria-label="Add tab"` 后出现“新标签 4”；新增后按钮 aria-label 包含 `Close 标签 1`、`Close 标签 2`、`Close 标签 3`、`Close 新标签 4` 和 `Add tab`。
  影响：功能可用，但中文站 a11y 文案不一致，用户复制后会得到中英混杂的可访问名称。
- 问题：Tree 复选框可访问名称使用英文 `Select ...` 前缀，且节点过滤示例只有输入框和过滤结果，没有可见“匹配数量/空结果”状态。
  浏览器证据：React `#/tree` checkbox aria-label 包含 `Select 父节点 1`、`Select 子节点 1-1`、`Select 子节点 1-2 (禁用)`；过滤输入 placeholder 为“搜索节点...”，页面已有“暂无数据”空态示例但过滤区未显示匹配数量。
  影响：树控件功能完整，但中文示例的复选框 a11y 文案和搜索反馈不够业务化。
- 问题：Pagination 页面在同一页展示多个快速跳页与 pageSize 控件，它们共享通用 aria-label；部分示例复用同一组 `current` / `pageSize` 状态。
  浏览器证据：React `#/pagination` 初始可见 4 个 `aria-label="跳至"` number input 和 3 个 `aria-label="条/页"` select；源码中“改变每页条数”和“完整示例”复用 `current3` / `pageSize`，不同尺寸示例复用 `current5`，不同对齐示例复用 `current6`。
  影响：单个分页功能可用，但同页复查和用户复制时容易混淆“这个控件控制哪个示例”，共享状态也会让独立示例互相联动。
- 问题：Menu 和 Steps 的基础交互可用，但缺少更明确的业务状态面板来解释选中项、展开项或流程提交意图。
  浏览器证据：React `#/menu` 点击“收起”后按钮变为“展开”，折叠态仍保留完整文本标签；React `#/steps` 有 `当前步骤: 1/3` 反馈和 disabled 步骤，但 Menu 页面主要依赖视觉选中态，未在页面上显示 selectedKeys/openKeys。
  影响：不阻断使用；对于受控导航/流程组件，用户仍需从代码中理解状态结构。
- 问题：Spotlight 基本用法可搜索和选择，但受控搜索与 disabled command 的体验线索偏弱。
  浏览器证据：React `#/spotlight` 点击“打开命令面板”后出现 `role="dialog"`、`aria-label="搜索页面或操作"` 的 search input 和 4 个 option；输入“客户”后只剩“客户列表”，选择后页面显示“已选择：客户列表”。命令列表含 disabled 的“账单设置”，但 Example 未直接展示尝试选择 disabled 命令后的可见说明。
  影响：核心命令面板可用；受控 query、disabled 命令和快捷键说明还可以更可复制。

**组件能力建议**：

- 类型：文档示例 / 组合使用。
  建议：Dropdown 点击事件示例改为显示“上次操作：编辑/复制/删除”，同时保留 console 作为辅助；受控模式示例可同步显示 `open` 状态。
  证据：当前页面只有“查看控制台”提示，没有可见业务反馈。
- 类型：a11y / i18n。
  建议：Tabs 可编辑卡片补中文 aria-label 能力或示例层覆写，例如“新增标签页”“关闭标签 1”；若组件暂不支持 locale，后续另开组件源码任务。
  证据：中文示例站实际暴露 `Add tab` / `Close 标签 1`。
- 类型：a11y / i18n / 文档示例。
  建议：Tree checkbox aria-label 支持 locale 或示例层传入中文选择文案；节点过滤示例增加匹配数量和空结果反馈。
  证据：复选框 aria-label 使用 `Select ...`，过滤区只有输入和结果树。
- 类型：文档示例 / 组合使用。
  建议：Pagination 拆分或标注多个快速跳页/pageSize 控件，避免同名控件和共享状态造成混淆；“完整示例”给出可见 change/pageSizeChange 日志而不是仅查看控制台。
  证据：同页有 4 个 `跳至` input、3 个 `条/页` select，且多个示例复用状态。
- 类型：文档示例。
  建议：Menu 增加一个状态面板显示 `selectedKeys` / `openKeys`；Steps 在可点击/禁用步骤示例中补“提交当前步骤”或“下一步业务动作”的最小状态说明。
  证据：Menu 交互主要靠视觉选中态，Steps 已有当前步骤但缺少流程结果示例。
- 类型：文档示例 / a11y。
  建议：Spotlight 增加 disabled command 的明确展示和尝试选择后的说明，补充快捷键触发/关闭说明与受控 query 的更短可复制示例。
  证据：基本搜索与选择可用，但 disabled 命令只作为不可选项出现。

**建议优先级**：

- P1：Tabs 可编辑卡片的 `Add tab` / `Close ...` 中文站 a11y 文案修正或 locale 能力补齐。
- P1：Tree checkbox `Select ...` 中文站 a11y 文案修正或 locale 能力补齐。
- P2：Dropdown 点击事件示例补可见“上次操作”反馈。
- P2：Pagination 拆分同名快速跳页/pageSize 控件或补局部状态说明，避免共享状态污染。
- P2：Menu 补 `selectedKeys` / `openKeys` 状态面板；Tree 过滤补匹配数量/空态反馈。
- P3：Spotlight 补快捷键、disabled command 和受控 query 的更小可复制示例。

**后续执行建议**：优先只改 Example/文档；Dropdown 可见反馈、Pagination 状态隔离、Menu 状态面板、Tree 过滤反馈、Spotlight 说明都不需要 public API 变更。Tabs/Tree 的英文 aria-label 若无法在示例层覆写，需要另开组件源码/i18n 任务并补 focused a11y tests。修复阶段应复查 React/Vue `#/dropdown`、`#/tabs`、`#/tree`、`#/pagination`、`#/menu`、`#/spotlight`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时再运行 `npx -y pnpm@11.9.0 example:build`。

### E08 Alert / Loading / Progress / Tooltip / Popover / Popconfirm

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/alert`、`#/loading`、`#/progress`、`#/tooltip`、`#/popover`、`#/popconfirm`。
- React：`http://localhost:5174/#/alert`、`#/loading`、`#/progress`、`#/tooltip`、`#/popover`、`#/popconfirm`。
- 视口：桌面 `1280x720`（交互脚本用 `1280x900` 以容纳弹层）；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器工具：本轮交互式 preview MCP 在当前环境无法绑定端口、Chrome 扩展未连接，改用脚本化 headless Chromium（仓库内置 Playwright/Chromium）对同一 dev server 做 DOM 查询与用户操作复查，证据等价于模拟浏览器体验。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、`h3` 子分节、`示例`/`代码`页签、桌面与移动页面级横向溢出、控制台报错；Tooltip 悬停基础触发、点击触发、聚焦触发、悬停禁用触发并检查 `role="tooltip"` 出现/消失；Popover 点击触发读 `role="dialog"` 内容与 `aria-describedby`；Popconfirm 点击“删除”读 `取消`/`确定` 按钮、点击“确定”捕获 console 与页面可见反馈、检查危险按钮红色；Alert 统计 `role="alert"`、点击关闭与重置、读取全部关闭按钮 `aria-label`；Loading 点击“显示全屏加载”与“刷新数据”并读英文说明文案；Progress 读 `aria-valuenow/min/max/label`、点击“开始上传”前后读上传条百分比、检查圆形进度文本；移动端打开 Popconfirm/Tooltip 检查弹层是否落在视口内。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/feedback.md`、`skills/tigercat/references/shared/props/feedback.md`、`skills/tigercat/references/shared/props/basic.md`（Alert 归入 Basic）。
- React Example：`examples/example/react/src/pages/AlertDemo.tsx`、`LoadingDemo.tsx`、`ProgressDemo.tsx`、`TooltipDemo.tsx`、`PopoverDemo.tsx`、`PopconfirmDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/AlertDemo.vue`、`LoadingDemo.vue`、`ProgressDemo.vue`、`TooltipDemo.vue`、`PopoverDemo.vue`、`PopconfirmDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/alert.ts`、`loading.ts`、`progress.ts`、`tooltip.ts`、`popover.ts`、`popconfirm.ts`、`packages/react/src/components/Alert.tsx`、`Progress.tsx`、`Popconfirm.tsx`、`Tooltip.tsx`、`Popover.tsx`、对应 Vue 组件文件。

**用户故事**：

- 作为使用者，我希望 Alert 页面能比较类型、尺寸、图标、可关闭、描述、自定义内容和实际业务场景，复制到页面提示区，并在关闭后能重置。
- 作为使用者，我希望 Loading 页面能比较动画变体、尺寸、颜色、全屏、区域、按钮和延迟加载，落地页面级与区块级 loading。
- 作为使用者，我希望 Progress 页面能比较线形/圆形、变体、状态、尺寸、文本、条纹和自定义尺寸，并在上传与仪表盘场景确认进度语义与无障碍属性。
- 作为使用者，我希望 Tooltip 页面能验证 hover/click/focus 触发、位置、偏移、禁用、自动翻转和自定义内容。
- 作为使用者，我希望 Popover 页面能验证标题、自定义内容、位置、触发方式、受控、宽度、禁用、偏移和自动翻转。
- 作为使用者，我希望 Popconfirm 页面能验证位置、图标、按钮文案、危险操作、描述、受控、隐藏图标和禁用，并能看出确认/取消后应如何接业务逻辑。

**Example 体验问题**：

- 问题：E08 未发现 P0/P1 route-level 阻断问题；React/Vue 12 个 route 均可打开，桌面与移动视口无页面级横向溢出，无控制台报错，Tooltip/Popover/Popconfirm/Alert/Loading/Progress 主要交互均可完成，且 React/Vue 结构与行为高度一致。
  浏览器证据：桌面 `1280x720` 下 React/Vue 分别返回目标 `h1`，`h3` 子分节数一致（Alert 各含实际应用 4 项、Loading 7、Progress 12、Tooltip 7、Popover 9、Popconfirm 7）；移动 `390x844` 下 12 个 route 的 `pageOverflow=false`；`errors=[]`；Progress 暴露 37 个 `role="progressbar"`（`aria-valuenow/min/max` 正确），Popconfirm 渲染 17 个 `role="dialog"`（关闭态 `aria-hidden`），Alert 渲染 25 个 `role="alert"`；Tooltip 悬停基础触发出现 `role="tooltip"` 文本“这是一个气泡提示”，移出后归 0，点击/聚焦触发同样可见，悬停“禁用”触发保持 0；移动端打开 Popconfirm（`left=8`、`right=288`、`withinViewport=true`）与 Tooltip（`withinViewport=true`）弹层均落在视口内。
  影响：E08 可作为 Feedback 提示/加载/进度/弹层类组件的审查入口继续使用。
- 问题：Popconfirm 的确认/取消回调只写入控制台，页面没有任何可见业务反馈；基本用法、危险操作、发布文章、表单提交、受控模式都是同一模式。
  浏览器证据：React/Vue `#/popconfirm` 点击“删除”后弹层出现 `取消` / `确定` 两个中文按钮，点击“确定”后控制台记录 `[log] Confirmed!`，但 `pageVisibleFeedbackAfterConfirm=false`（页面无“已删除/删除成功/已确认”等文本）；源码 handler 为 `console.log('Confirmed!')` / `console.log('Cancelled!')`。
  影响：弹层交互本身可用，但用户复制后缺少“确认后如何接真实业务动作”的可见线索，与 E05/E06/E07 记录的“仅 console 反馈”问题同类。
- 问题：Alert 可关闭按钮的默认无障碍名称为英文 `Close alert`，与中文示例站不一致；只有专门传 `closeAriaLabel` 的一个示例是中文。
  浏览器证据：React/Vue `#/alert` 5 个可关闭 Alert 的关闭按钮 `aria-label` 中，4 个为 `Close alert`，1 个为 `关闭提示`；源码 `packages/core/src/types/alert.ts`、`packages/react/src/components/Alert.tsx`、`packages/vue/src/components/Alert.ts` 的 `closeAriaLabel` 默认值硬编码为 `'Close alert'`，Alert 无 `locale` 能力。
  影响：常规可关闭示例复制后会在中文界面上带英文可访问名称，与 E07 Tabs/Tree 英文 aria-label 同类。
- 问题：Progress 组件渲染的默认 `aria-label` 为英文 `Progress: N%`，中文示例站上屏幕阅读器读到英文标签。
  浏览器证据：React/Vue `#/progress` 前若干进度条 `aria-valuenow/min/max` 正确，但 `aria-label` 依次为 `Progress: 0%`、`Progress: 50%`、`Progress: 100%`…；源码 `packages/react/src/components/Progress.tsx`、`packages/vue/src/components/Progress.ts` 在未传 `ariaLabel`/`aria-labelledby` 时回退为 `` `Progress: ${percentage}%` ``。示例未覆写该标签。
  影响：进度语义可用，但无障碍标签在中文站为英文；示例既没有传中文 `aria-label`，组件也没有 locale 兜底。
- 问题：Loading 页面的变体/尺寸/颜色说明文案为英文，与中文示例站不一致。
  浏览器证据：React/Vue `#/loading` 页面文本包含 `Spinner`、`Ring`、`Dots`、`Bars`、`Pulse`、`Small`、`Medium`、`Large`、`Extra Large`、`Primary`、`Secondary` 等英文说明；这些是示例手写 `<span>` 标签，而非组件输出。
  影响：不阻断使用；属于中文示例站的文案 i18n polish 缺口。
- 问题：Tooltip/Popover/Popconfirm 的受控示例可切换 open，但页面没有可见的当前 open 状态面板，用户需回到代码理解受控结构。
  浏览器证据：React/Vue `#/tooltip`、`#/popover`、`#/popconfirm` 受控示例点击后弹层出现/消失（如 Popover 点击后 `role="dialog"` 内容“这是一个气泡卡片的内容”、`aria-describedby=tiger-popover-1-content`、`aria-modal=false`），但页面未显示 `open` 值或最近状态。
  影响：不阻断使用；属于受控弹层可复制业务状态的小缺口。

**组件能力建议**：

- 类型：a11y / i18n / 文档示例。
  建议：Alert 常规“可关闭”与“实际应用场景”示例给关闭按钮传业务化中文 `closeAriaLabel`（如“关闭提交成功提示”“关闭系统维护通知”）；若希望默认中文，则另开组件源码任务为 Alert 增加 locale 能力。
  证据：4/5 关闭按钮为 `Close alert`，组件默认值硬编码英文且无 locale。
- 类型：a11y / i18n / 文档示例。
  建议：Progress 示例在中文站传中文 `aria-label`（React `ariaLabel` / Vue `aria-label`），或在组件层用 locale 生成“进度”文案；圆形进度可视文本已正常（浏览器统计到 32 个 `%` 文本节点），无需改视觉。
  证据：`aria-valuenow` 正确，但 `aria-label` 回退为英文 `Progress: N%`。
- 类型：文档示例 / 组合使用。
  建议：Popconfirm 的 `onConfirm` / `onCancel` 示例补最小可见反馈（如“已删除记录 #202312310001”“已发布文章”），保留 console 作为辅助；受控示例可同步显示 `open` 状态。
  证据：确认后仅 `console.log('Confirmed!')`，页面无可见反馈。
- 类型：i18n / 文档示例。
  建议：Loading 变体/尺寸/颜色说明文案改中文或中英并列，与中文示例站一致。
  证据：页面存在 `Spinner`/`Small`/`Primary` 等英文手写说明。
- 类型：文档示例。
  建议：Tooltip/Popover/Popconfirm 受控示例补一个可见当前 `open` 状态面板，便于理解受控结构（低优先）。
  证据：受控切换可用，但页面未显示 open 值。

**建议优先级**：

- P1：Alert 可关闭示例的英文默认 `Close alert` 中文站 a11y 修正（示例传 `closeAriaLabel` 或组件补 locale）。
- P1：Progress 英文默认 `aria-label`（`Progress: N%`）中文站 a11y 修正（示例传 `aria-label` 或组件补 locale）。
- P2：Popconfirm 确认/取消示例补可见业务反馈，避免仅 console.log。
- P3：Loading 变体/尺寸/颜色英文说明文案中文化。
- P3：弹层受控示例补可见当前 `open` 状态面板。

**后续执行建议**：优先只改 Example/文档；Alert `closeAriaLabel`、Progress `aria-label` 都可在示例层用现有 props 直接覆写（无需 public API 变更），Popconfirm 可见反馈与 Loading 文案同为纯 Example 改动。若选择组件级 locale（Alert 当前无 `locale` prop，Progress 的英文 aria 文案在组件内生成），再另开组件源码/i18n 任务并补 React/Vue focused a11y tests。修复阶段应复查 React/Vue `#/alert`、`#/progress`、`#/popconfirm`、`#/loading`、`#/tooltip`、`#/popover`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时再运行 `npx -y pnpm@11.9.0 example:build`。

### E09 Modal / Drawer / Message / Notification / Tour

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/modal`、`#/drawer`、`#/message`、`#/notification`、`#/tour`。
- React：`http://localhost:5174/#/modal`、`#/drawer`、`#/message`、`#/notification`、`#/tour`。
- 视口：桌面 `1280x800`（弹层交互脚本用 `1280x900` 以容纳对话框/抽屉）；移动 `390x844`。
- 主题/语言：示例站点默认主题；语言由 `getStoredLang()` 决定，未写入 localStorage 时回退 `navigator.language`，`zh` 开头判为 `zh-CN`（真实中文用户默认中文文案）。
- 浏览器工具：本轮交互式 preview MCP 在当前环境无法绑定端口、Chrome 扩展未连接，改用脚本化 headless Chromium（仓库内置 playwright-core@1.61.1 + ms-playwright chromium_headless_shell-1228）对同一 dev server 做 DOM 查询与用户操作复查。**重要方法学**：headless Chromium 的 `navigator.language` 默认 `en-US`，会让示例站默认切到 en-US 并渲染英文文案/aria；本轮显式给浏览器上下文设 `locale: 'zh-CN'` 以复现真实中文用户体验，后续 Agent 复查 E09/E1x 弹层与 i18n 时必须同样设 `zh-CN`，否则会把默认英文误判成 bug。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、`section`/`h2` 分节数、桌面与移动页面级横向溢出、控制台报错；Modal 打开基础对话框读 `role="dialog"`/`aria-modal`/关闭按钮 aria-label，`Esc` 关闭，打开“删除确认”点“确认删除”读页面可见反馈，打开“编辑资料”空提交读校验错误，打开“自定义文案对话框”读 labels 覆盖后的关闭 aria-label；Drawer 打开基础抽屉读 dialog/关闭 aria-label，打开 labels 抽屉读覆盖后的 aria-label；Message 点击信息/成功/错误读 `role=status/alert`、`aria-live`、可关闭消息的关闭按钮 aria-label；Notification 点击信息/错误读 `role`/文案/关闭 aria-label，点“显示带操作通知”读内嵌操作按钮；Tour 点“开始引导”读步骤标题、`1 / 3` 计数与导航按钮文案，点“下一步”读第二步；移动端打开右下角/左上角 Notification 与 Message 测量弹层右边界是否落在视口内。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/feedback.md`、`skills/tigercat/references/shared/props/feedback.md`。
- React Example：`examples/example/react/src/pages/ModalDemo.tsx`、`DrawerDemo.tsx`、`MessageDemo.tsx`、`NotificationDemo.tsx`、`TourDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/ModalDemo.vue`、`DrawerDemo.vue`、`MessageDemo.vue`、`NotificationDemo.vue`、`TourDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/modal.ts`、`drawer.ts`、`message.ts`、`tour.ts`、`packages/react/src/components/Modal.tsx`、`Drawer.tsx`、`MessageContainer.tsx`、`NotificationContainer.tsx`、`Message.tsx`、`Tour.tsx`、对应 Vue 组件文件、`packages/core/src/utils/locale-utils.ts`（`getTourLabels` / `mergeTigerLocale`）、`packages/core/src/utils/i18n/locales/zh-CN.ts`、`examples/example/shared/tiger-locale.ts`、`examples/example/shared/prefs.ts`。

**用户故事**：

- 作为使用者，我希望 Modal 页面能比较尺寸、居中、自定义/默认页脚、labels 文案、嵌套、遮罩控制、关闭销毁，并在删除确认、协议阅读、表单编辑等业务场景看到可见反馈与校验。
- 作为使用者，我希望 Drawer 页面能验证位置、尺寸、内边距、自定义头尾、无蒙层、禁用蒙层关闭、隐藏关闭按钮、labels 文案和关闭销毁，方便落地设置面板或详情侧栏。
- 作为使用者，我希望 Message 页面能验证类型、持续时间、手动关闭、队列、回调、自定义样式/图标和上传/保存/删除/网络错误等业务流程。
- 作为使用者，我希望 Notification 页面能验证类型、四角位置、持续时间、可关闭性、手动控制、点击/回调、内嵌操作、清空和快捷写法。
- 作为使用者，我希望 Tour 页面能点开始引导逐步走查、看到步骤计数和导航按钮，并确认自定义按钮文字与指示器，且在中文站得到中文导航文案。

**Example 体验问题**：

- 问题：E09 未发现 P0/P1 route-level 阻断问题；React/Vue 10 个 route 均可打开，桌面与移动视口无页面级横向溢出，无控制台报错，Modal/Drawer/Message/Notification/Tour 主要交互均可完成，且 React/Vue 结构与行为高度一致。
  浏览器证据：桌面 `1280x800` 下 React/Vue 分别返回目标 `h1`，`section` 数一致（Modal 5、Drawer 8、Message 9、Notification 10、Tour 1）；移动 `390x844` 下 10 个 route 的 `pageOverflow=false`；`errors=[]`。Modal 基础对话框为 `role="dialog"`、`aria-modal="true"`；“删除确认”点“确认删除”后页面出现 `已确认：删除操作已提交（示例）`，“编辑资料”空提交出现 `请填写姓名`。Message 点击信息/成功/错误渲染 3 条 `role=status/status/alert`、`aria-live=polite/polite/assertive`。Notification 内嵌操作示例渲染 `查看` / `撤销` 两个业务操作按钮。Tour 点“开始引导”出现 `步骤一…1 / 3`，`zh-CN` 下导航按钮为 `下一步` / `上一步`、关闭 aria-label `关闭导览`，点“下一步”进入 `步骤二…2 / 3`。移动端右下角/左上角 Notification 右边界 `366`/`382`（视口 `390`，`within=true`），Message 右边界 `284`，均落在视口内。
  影响：E09 可作为 Feedback 弹层/全局提示/引导类组件的审查入口继续使用。
- 问题：Modal 与 Drawer 基础示例的右上角关闭按钮在中文站仍暴露英文 aria-label（Modal `Close`、Drawer `Close drawer`），只有专门的“自定义文案 (labels)”示例是中文。
  浏览器证据：`locale=zh-CN` 下 React/Vue `#/modal` 基础对话框关闭按钮 `aria-label="Close"`，labels 示例为 `关闭对话框`；`#/drawer` 基础抽屉 `aria-label="Close drawer"`，labels 示例为 `关闭抽屉`。根因：示例站 `getDemoTigerLocale('zh-CN')` 只提供 `locale:'zh-CN'` + `formWizard` + `upload`，未提供 `modal` / `drawer` / `common` 键；`ConfigProvider` 不会把 `'zh-CN'` 字符串展开成完整 bundle（`getImmediateTigerLocale` 原样返回传入对象），Modal/Drawer 的 `resolveLocaleText` 因此回退到组件内英文默认 `'Close'` / `'Close drawer'`。
  影响：常规弹层复制后会在中文界面带英文可访问名称，与 E07 Tabs/Tree、E08 Alert/Progress 记录的英文默认 aria-label 同类。
- 问题：Message 与 Notification 的关闭按钮 aria-label 为硬编码英文，且无法通过示例站 locale 修复。
  浏览器证据：`locale=zh-CN` 下可关闭 Message 的关闭按钮 `aria-label="Close message"`，Notification 关闭按钮 `aria-label="Close notification"`；源码 `packages/react/src/components/MessageContainer.tsx` 常量 `MESSAGE_CLOSE_ARIA_LABEL = 'Close message'`、`NotificationContainer.tsx` 直接写 `aria-label="Close notification"`。Message/Notification 通过 `Message.tsx` 的 `createRoot` 挂到 `document.body` 独立根（`MessageHost`），脱离应用 `ConfigProvider` 树，无法继承 locale context；imperative 配置（`MessageProps`）也没有 `closeAriaLabel` / `locale` 选项。
  影响：即使把示例站 locale 补全，也修不了 Message/Notification 的英文关闭 aria-label；这是组件级 i18n/a11y 缺口，需要 API 或全局配置层解决。
- 问题：Notification 的“点击和回调”“内嵌操作”示例用原生 `alert()`（`alert('查看详情功能')` / `alert('打开通知详情')`）作为点击反馈。
  浏览器证据：`NotificationDemo.tsx` / `.vue` 的 `showClickableNotification`、`showActionNotification` 内联 `alert(...)`；点击时会弹出阻塞式浏览器对话框。
  影响：不阻断使用；但作为可复制业务模式，阻塞式 `alert` 不够理想，建议改为页面内可见反馈或 Message/Notification 二次提示。
- 问题：Message 与 Notification 示例用自定义 `className`（如 `bg-blue-600` / `bg-indigo-500`）手写彩色按钮，而非使用库内 `Button` 的 `variant`。
  浏览器证据：`MessageDemo.tsx` / `NotificationDemo.tsx` 的触发按钮均在 `Button` 上叠加 Tailwind 颜色类；`Modal`/`Drawer`/`Tour` 示例则使用 `variant`。
  影响：不阻断使用；属于示例可复制性与跨页一致性的 polish 缺口，用户容易照抄成脱离主题 token 的硬编码颜色。

**组件能力建议**：

- 类型：i18n / a11y / 文档示例。
  建议：优先在示例站 `getDemoTigerLocale('zh-CN')` 补 `modal: { closeAriaLabel: '关闭' }`、`drawer: { closeAriaLabel: '关闭' }`、`common: { closeText: '关闭' }`（或直接引入 core 已有的完整 zh-CN bundle），一处修复即可覆盖全站 Modal/Drawer 关闭 aria-label；单个示例也可显式传 `labels={{ closeAriaLabel }}`。
  证据：core `zh-CN.ts` 已有 `modal.closeAriaLabel`/`drawer.closeAriaLabel = '关闭'`，但示例站 locale 未引入，导致基础示例回退英文。
- 类型：a11y / i18n / 组件源码。
  建议：为 Message/Notification 提供关闭 aria-label 的本地化入口——在 imperative 配置增加 `closeAriaLabel`（或全局 `Message.config({ locale })` / 让 `MessageHost` 读取全局 locale），否则中文站的全局提示关闭按钮无法本地化。
  证据：关闭 aria-label 硬编码英文，容器脱离 `ConfigProvider`，`MessageProps` 无相关字段。
- 类型：文档示例 / 组合使用。
  建议：Notification 点击/内嵌操作示例改用页面内可见反馈或二次 Message/Notification，替换阻塞式 `alert`；保留 `console.log` 作为辅助。
  证据：`showClickableNotification` / `showActionNotification` 使用 `alert()`。
- 类型：文档示例 / 样式扩展。
  建议：Message/Notification 触发按钮改用 `Button` 的 `variant`（primary/secondary/danger 等），或在说明中标注彩色类仅为演示分组，避免用户照抄硬编码颜色。
  证据：示例按钮用 Tailwind 颜色类覆盖 Button，与 Modal/Drawer/Tour 的 variant 用法不一致。

**建议优先级**：

- P1：示例站 zh-CN locale 补 `modal`/`drawer`/`common` 关闭文案（或引入完整 bundle），修正基础 Modal/Drawer 中文站英文关闭 aria-label。
- P1：Message/Notification 关闭 aria-label 组件级本地化入口（imperative `closeAriaLabel` 或全局 locale），该项无法在示例层修复。
- P2：Notification 点击/内嵌操作示例用可见反馈替换 `alert`。
- P3：Message/Notification 触发按钮改用 Button `variant` 或补说明。

**后续执行建议**：分两类修复：示例/文档层可处理 Modal/Drawer 中文关闭文案（改 `getDemoTigerLocale` 或传 `labels`）、Notification `alert` 替换、Message/Notification 按钮 variant；组件源码/API 层需处理 Message/Notification 关闭 aria-label 本地化（`MessageProps` 增字段或 host 读全局 locale）。修复阶段务必在浏览器上下文 `locale: 'zh-CN'` 下复查 React/Vue `#/modal`、`#/drawer`、`#/message`、`#/notification`、`#/tour`，Example 改动运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时再运行 `npx -y pnpm@11.9.0 example:build`；组件/API 修复补 React/Vue Message/Notification focused a11y tests。

### E10 Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5175/#/form`、`#/input`、`#/textarea`、`#/input-group`、`#/input-number`、`#/stepper`。
- React：`http://localhost:5176/#/form`、`#/input`、`#/textarea`、`#/input-group`、`#/input-number`、`#/stepper`。
- 视口：桌面 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案；Stepper/InputNumber 控制按钮 aria 文案仍为英文。
- 浏览器工具：本轮使用内置浏览器 Playwright 接入真实 Vite dev server；默认端口被占用，Vue 实际跑在 `5175`，React 实际跑在 `5176`。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、section 标题、`示例`/`代码`页签、桌面与移动页面级横向溢出；React Form 点击提交校验、填入有效用户名/邮箱/年龄/网站并再次提交；Vue Form 点击提交校验与手动校验；Input 输入基础文本、触发错误抖动、检查 InputNumber 格式化与控制按钮；Textarea 输入多行文本、字符计数与组合示例；Stepper 点击增加按钮并读取当前值；在 React `#/input` 切换第一个 `代码` tab，确认 raw-source 代码和复制按钮可见。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/form.md`、`skills/tigercat/references/shared/props/form.md`。
- React Example：`examples/example/react/src/pages/FormDemo.tsx`、`InputDemo.tsx`、`TextareaDemo.tsx`、`InputGroupDemo.tsx`、`StepperDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/FormDemo.vue`、`InputDemo.vue`、`TextareaDemo.vue`、`InputGroupDemo.vue`、`StepperDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/form.ts`、`input.ts`、`textarea.ts`、`input-group.ts`、`input-number.ts`、`stepper.ts`、`button.ts`、`packages/react/src/components/Button.tsx`、`packages/vue/src/components/Button.ts`、对应 Form/Input/Textarea/InputGroup/InputNumber/Stepper 组件文件。

**用户故事**：

- 作为使用者，我希望 Form 页面能展示基础收集、提交校验、手动校验、清除校验、布局、尺寸、禁用、自定义校验器和错误展示模式，方便复制到注册、资料编辑或设置页。
- 作为使用者，我希望 FormItem 示例清楚展示 `name`、`label`、`required`、错误消息位置和 `labelPosition` 的关系，避免只看到输入框堆叠。
- 作为使用者，我希望 Input 页面能比较受控/非受控、文本/密码/邮箱/电话/搜索、尺寸、禁用、只读、前后缀、required、长度限制、状态提示和错误抖动。
- 作为使用者，我希望 InputNumber 能从独立入口或明确 section 体验范围、精度、尺寸、状态、禁用、只读、左右控制按钮、隐藏控制按钮和格式化解析。
- 作为使用者，我希望 Textarea 页面能验证不同行数、自动高度、字符计数、禁用/只读/必填和组合能力，方便复制到备注、评论或描述输入。
- 作为使用者，我希望 InputGroup 页面能展示搜索、域名前后缀、尺寸、紧凑模式和响应式组合，方便落地到工具栏过滤或 URL 输入。
- 作为使用者，我希望 Stepper 页面能点击增减按钮、确认范围/步长/小数精度/禁用状态，并能在中文站获得中文可访问名称。

**Example 体验问题**：

- 问题：`#/input-number` 在 React/Vue 均不是有效体验入口；E10 队列表声明了该 route，但 InputNumber 实际只合并在 `#/input` 的“数字输入框 InputNumber”section 中。
  浏览器证据：Vue `http://localhost:5175/#/input-number` 返回空页面，无 `h1`、无 section、无 input；React `http://localhost:5176/#/input-number` 返回 `Unexpected Application Error!` / `404 Not Found`；React/Vue `#/input` 均有“数字输入框 InputNumber”section，含 36 个 input，其中格式化值显示 `$ 1,000`。
  影响：这是 E10 唯一 route-level 阻断项；用户按计划入口打开 `#/input-number` 会误以为 InputNumber 示例缺失或应用异常。
- 问题：Vue Form 的“提交”和“提交并校验”示例写作 `<Button type="submit">`，但 Tigercat Button 使用 `htmlType` 透传 HTML button type；浏览器中这些按钮实际仍是 `type="button"`，点击不会触发表单 submit。
  浏览器证据：Vue `#/form` 中“提交”“提交并校验”按钮 DOM `type="button"`；点击“提交并校验”后最近一次校验结果仍停留在表单数据预览，不出现 `valid=false`；点击同一表单的“手动校验”后出现 `{ "valid": false }`，并显示 `请输入用户名`、`请输入邮箱`、`请输入年龄`。React `#/form` 使用 `htmlType="submit"`，点击“提交并校验”可得到 `valid=false`，填入 `alice` / `alice@example.com` / `32` / `https://example.com` 后再次提交得到 `valid=true`。
  影响：React/Vue 体验明显不一致；Vue 用户复制基础提交示例后不会得到预期 submit 行为。
- 问题：Stepper 与 InputNumber 的增减按钮在中文示例站中暴露英文 aria-label `Increase` / `Decrease`。
  浏览器证据：React/Vue `#/stepper` 均有 7 个 `aria-label="Increase"` 的增加按钮；点击第一个增加按钮后当前值从 `当前值: 3` 变为 `当前值: 4`，说明交互可用但可访问名称为英文。React/Vue `#/input` 的 InputNumber 控制按钮同样输出多组 `Increase` / `Decrease`。
  影响：视觉交互不阻断，但中文业务页面复制后会得到中英混杂的无障碍文案，和 E07/E08 记录的英文 aria-label 问题同类。
- 问题：React `#/input` 触发控制台错误，提示 `errorMessage` 和内部 `_shakeTrigger` 被透传到 DOM 元素。
  浏览器证据：React dev server 在访问 `#/input` 时记录 `React does not recognize the errorMessage prop on a DOM element` 和 `React does not recognize the _shakeTrigger prop on a DOM element`；页面上的错误抖动示例仍可用，点击“触发错误”后显示 `验证失败，请重试！`。
  影响：用户视觉体验不阻断，但示例页会产生 React console error，后续修复应继续追查 FormItem/Input 的 clone 或 prop 透传链路，避免把内部校验状态泄漏到原生 DOM。
- 问题：InputGroup 页面文案说明“支持前后缀和紧凑模式”，但示例只覆盖搜索组合、Select + Input + Select 和尺寸，没有展示 `compact` prop，也没有展示移动端窄屏下组合控件如何降级。
  浏览器证据：React/Vue `#/input-group` 均只有“基本用法”“混合组件”“尺寸”3 个 section；generated props 列出 `compact?: boolean`；移动 `390x844` 下页面级 `hasHorizontalOverflow=false`，但混合组件仍是同一行组合，用户无法从 Example 判断紧凑/非紧凑差异。
  影响：核心组合可用，但公开 props 和页面说明不完全对齐，常见工具栏/域名输入场景缺少紧凑模式参考。
- 问题：Textarea 与 Input 的基础能力可用，但长文本、自动高度、字符计数和长度限制更偏 props 展示，缺少真实业务场景和提交联动；Input 长度限制示例只显示当前长度，没有展示超限/校验反馈的推荐写法。
  浏览器证据：React `#/textarea` 输入多行文本后正文回显成功，限制最大长度示例显示 `12/100`，组合示例显示 `4/500`；React `#/input` 输入基础文本后回显 `输入的内容：hello tiger`，点击“触发错误”显示 `验证失败，请重试！`。
  影响：不阻断使用；用户能复制组件写法，但对“备注超过上限如何提示”“评论输入如何提交/清空”等业务落地仍需自行组合。
- 问题：Form 基础用法提交会弹出 `alert` / 写 console，数据预览只包含 `basicForm` 与 `validateForm`；自定义校验器没有独立显示最近一次校验结果。
  浏览器证据：React Form 校验 section 已有 `最近一次校验结果`，但自定义校验器点击“校验”只在字段下显示错误；基础用法 submit 使用 `alert(valid ? ...)`。Vue 基础用法受 `type`/`htmlType` 问题影响，点击提交不会触发 submit。
  影响：提交/自定义校验能力存在，但用户复制到业务页面时缺少统一的“提交结果/异步校验结果”可见状态模式。

**组件能力建议**：

- 类型：文档示例。
  建议：要么为 React/Vue 增加真实 `#/input-number` route 并从侧边导航暴露，要么把 E10 队列表和页面说明改为“InputNumber 位于 `#/input`”，避免计划入口与实际路由不一致。
  证据：`#/input-number` 在 Vue 为空、React 为 404；`#/input` 已承载完整 InputNumber section。
- 类型：文档示例 / React-Vue 一致性。
  建议：把 Vue Form 示例中的提交按钮改为 `htmlType="submit"` / `html-type="submit"`，重置和普通按钮改为 `htmlType="button"` / `html-type="button"`；同时更新 snippet，避免用户复制错误写法。
  证据：Vue Button 组件 props 为 `htmlType`，当前示例使用的 `type="submit"` 未生效；React 示例已使用 `htmlType` 且 submit 正常。
- 类型：a11y / i18n。
  建议：Stepper 和 InputNumber 提供中文 aria-label 覆写或 locale 能力；若组件已有可覆写入口，Example 应显式传入“增加”“减少”等中文文案。
  证据：中文示例站中增减按钮 aria-label 仍为 `Increase` / `Decrease`。
- 类型：默认行为 / 组件源码。
  建议：修复 React FormItem/Input 内部校验 props 的透传链路，确保 `errorMessage` 和 `_shakeTrigger` 只用于组件内部状态，不落到原生 DOM。
  证据：React `#/input` 访问和错误抖动示例会触发 React console error。
- 类型：文档示例 / 组合使用。
  建议：InputGroup 补 `compact` section，并增加一个响应式搜索/筛选条场景，展示窄屏下如何换行或保持可用宽度。
  证据：props 有 `compact`，页面说明提到紧凑模式，但 Example 未展示。
- 类型：文档示例 / 组合使用。
  建议：Textarea 增加评论/备注提交小场景，Input 增加“长度限制 + 状态反馈”的最小可复制示例；Form 自定义校验器补最近一次校验结果面板。
  证据：输入、计数、错误抖动都可用，但业务提交和超限反馈仍需用户自行拼装。

**建议优先级**：

- P1：修复或移除 `#/input-number` 入口不一致，避免 E10 声明 route 打开后空白/404。
- P1：修正 Vue Form 示例 `Button type="submit"` 为 `htmlType` / `html-type`，恢复提交校验与 React 一致。
- P1：修复 React Input/FormItem 内部校验 props 透传导致的 console error。
- P2：Stepper/InputNumber 中文站增减按钮 aria-label 覆写或 locale 能力补齐。
- P2：InputGroup 增加 `compact` 和响应式组合示例。
- P3：Form 自定义校验器、Input 长度限制、Textarea 评论/备注场景补可见业务反馈。

**后续执行建议**：优先拆成两类修复：Example/文档层可处理 `#/input-number`、Vue Form `htmlType`、InputGroup `compact`、Form/Input/Textarea 业务反馈；组件源码层需要处理 React `errorMessage` / `_shakeTrigger` 透传，以及 Stepper/InputNumber 英文 aria-label 若没有示例层覆写入口。修复阶段应复查 React/Vue `#/form`、`#/input`、`#/input-number`、`#/input-group`、`#/textarea`、`#/stepper`，Example 改动运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时再运行 `npx -y pnpm@11.9.0 example:build`；源码修复补 React focused tests 或 a11y tests。

### E11 Checkbox / Radio / Switch / Slider / Segmented / Rate / ColorSwatch / ColorPicker

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/checkbox`、`#/radio`、`#/switch`、`#/slider`、`#/segmented`、`#/rate`、`#/color-swatch`、`#/color-picker`。
- React：`http://localhost:5174/#/checkbox`、`#/radio`、`#/switch`、`#/slider`、`#/segmented`、`#/rate`、`#/color-swatch`、`#/color-picker`。
- 视口：桌面 `1280x720` / 交互复查 `1280x900`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器工具：Vue dev server 实际端口 `5173`，React dev server 实际端口 `5174`。本轮先连接 in-app Browser；批量 route、移动视口与交互复查使用仓库现有 Playwright/Chromium 对同一 dev server 执行。
- 浏览器操作路径：逐页直达 hash route；检查 `h1`、页面级横向溢出、控制台错误；点击 Checkbox 基础项与全选、Radio 基础项与 number value、Switch 基础开关、Segmented “周”、ColorSwatch 色块；键盘操作 Slider 与 Rate；打开 ColorPicker 面板并分别验证 Enter/Space/click 触发、面板字段和预设色块属性。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/form.md`、`skills/tigercat/references/shared/props/form.md`、`skills/tigercat/references/examples/basic.md`、`skills/tigercat/references/shared/props/basic.md`。
- React Example：`examples/example/react/src/pages/CheckboxDemo.tsx`、`RadioDemo.tsx`、`SwitchDemo.tsx`、`SliderDemo.tsx`、`SegmentedDemo.tsx`、`RateDemo.tsx`、`ColorSwatchDemo.tsx`、`ColorPickerDemo.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/CheckboxDemo.vue`、`RadioDemo.vue`、`SwitchDemo.vue`、`SliderDemo.vue`、`SegmentedDemo.vue`、`RateDemo.vue`、`ColorSwatchDemo.vue`、`ColorPickerDemo.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/react/src/components/Switch.tsx`、`Slider.tsx`、`Rate.tsx`、`ColorSwatch.tsx`、`ColorPicker.tsx`；`packages/vue/src/components/Switch.ts`、`Slider.ts`、`Rate.ts`、`ColorSwatch.ts`、`ColorPicker.ts`；`packages/core/src/types/slider.ts`、`rate.ts`、`color-swatch.ts`、`color-picker.ts`。

**用户故事**：

- 作为使用者，我希望 Checkbox 页面能验证单选、非受控、禁用、半选全选、分组 value 和 group size 继承，便于落地批量选择或权限勾选场景。
- 作为使用者，我希望 Radio 页面能验证受控/非受控、单独使用、禁用、尺寸、number value 和自定义样式，避免表单枚举值类型出错。
- 作为使用者，我希望 Switch 页面能展示开关状态、禁用和尺寸，并给屏幕阅读器可理解的开关名称。
- 作为使用者，我希望 Slider 页面能通过鼠标/键盘调整单值、范围、步进、marks、tooltip、禁用和尺寸，并能从 a11y 名称分辨每个滑块控制的业务字段。
- 作为使用者，我希望 Segmented 页面能快速切换周期/视图，并确认禁用选项和 block 宽度效果。
- 作为使用者，我希望 Rate 页面能验证整星、半星、键盘调整、自定义字符、星数和禁用态，并在中文站得到中文评分语义。
- 作为使用者，我希望 ColorSwatch 页面能选择默认色、品牌色组、状态色和禁用色，并获得业务化色板/色值名称。
- 作为使用者，我希望 ColorPicker 页面能通过鼠标和键盘打开面板，选择透明度、预设颜色与格式，并复制真实可运行的颜色输入示例。

**Example 体验问题**：

- 问题：E11 未发现 P0 route-level 阻断问题；React/Vue 16 个 route 均可打开，桌面与移动视口无页面级横向溢出，无控制台错误，Checkbox/Radio/Slider/Segmented/Rate/ColorSwatch 的核心交互可完成。
  浏览器证据：桌面 `1280x720` 与移动 `390x844` 下 `#/checkbox`、`#/radio`、`#/switch`、`#/slider`、`#/segmented`、`#/rate`、`#/color-swatch`、`#/color-picker` 均返回目标 `h1`，`pageOverflow=false`，`logs=[]`。Checkbox 点击后出现 `选中状态：true`，全选后出现 `已选择：apple, banana, orange`；Radio 点击“女”后出现 `当前选中：female`，点击 number 选项后出现 `当前值：2（类型：number）`；Slider 键盘 `ArrowRight` 后基础值变为 `51`；Segmented 点击“周”后显示 `当前选中: weekly`；Rate 半星项键盘 `ArrowRight` 后显示 `当前值: 3`；ColorSwatch 点击第二个色块后显示 `选中颜色: #f97316`。
  影响：E11 页面可作为表单开关、数值、评分与颜色选择类组件的体验审查入口继续使用。
- 问题：Switch 示例的 `role="switch"` 控件没有可访问名称；旁边虽然显示“开启/关闭”，但没有通过 `aria-label`、`aria-labelledby` 或可见文本绑定到按钮。
  浏览器证据：React/Vue `#/switch` 页面主体内 6 个 switch 的 `text=""`、`ariaLabel=null`；点击基础开关后页面文本从“开启”变为“关闭”，说明交互可用但名称仍缺失。源码层 React/Vue Switch 都透传 attrs，因此示例层可以传 `aria-label` 或 `aria-labelledby`。
  影响：视觉用户能操作，屏幕阅读器用户只能听到未命名开关；直接复制示例会带出 a11y 缺口。
- 问题：Slider 示例中多数 `role="slider"` 没有 `aria-label`，范围滑块默认英文 `Minimum value` / `Maximum value`，中文站无法分辨每个滑块控制的业务含义。
  浏览器证据：React/Vue `#/slider` 页面主体内 14 个 slider 中，单值滑块 `ariaLabel=null`，范围滑块两个 thumb 分别为 `Minimum value` / `Maximum value`；键盘 `ArrowRight` 可把基础值从 `50` 调到 `51`。
  影响：键盘交互可用，但同页多滑块场景下无障碍名称不足，复制示例后难以对应“基础值/步进/温度/尺寸”等业务字段。
- 问题：Rate 示例在中文站输出英文无障碍文案，且页面没有展示 hover / allowClear / 自定义 valueText 的业务反馈。
  浏览器证据：React/Vue `#/rate` 的 8 个 `role="slider"` 均为 `aria-label="Rating"`，`aria-valuetext` 为 `3 stars`、`2.5 stars`、`4 stars` 等；半星项可通过键盘改到 `当前值: 3`。
  影响：核心评分交互可用，但中文产品复制后会得到英文 SR 文案，用户也看不到清空同值或 hover 预览如何接业务文案。
- 问题：ColorSwatch 示例默认色板与分组色板的 radiogroup 名称均为英文 `Color swatches`，多处色值 label 也直接是英文或 hex；中文示例没有展示 `ariaLabel` 的业务化写法。
  浏览器证据：React/Vue `#/color-swatch` 页面主体内 4 个 radiogroup 的 `ariaLabel` 均为 `Color swatches`；自定义组包含 `Ink`、`Blue`、`Cyan`、`Green`、`Success`、`Warning`、`Danger`，默认色板则大量暴露 `#ef4444`、`#f97316` 等 hex label。
  影响：选择功能可用，但中文站复制示例后色板组语义和颜色名称不够业务化。
- 问题：ColorPicker 示例声明“支持透明度、预设颜色和多种格式”，并在示例中传 `showAlpha` 与 `format="rgb"`，但实际面板只渲染 `Hue` / `Hex` 和 hex 输入；没有透明度输入，也没有 RGB/HSL 格式展示。
  浏览器证据：React/Vue `#/color-picker` 第二个示例点击打开后，面板 labels 只有 `Hue`、`Hex`，inputs 只有 `type="range" aria-label="Hue"` 和 `type="text" aria-label="Color value" value="#2563eb"`；源码中 React 将 `showAlpha` / `format` 解构为 `_showAlpha` / `_format` 未使用，Vue 也只渲染 Hue 与 Hex。
  影响：这是 Example 文案/props 与组件真实能力不一致，用户会误以为透明度和 RGB 格式已经可用。
- 问题：ColorPicker 触发器是 `role="button"` 的 `div`，有 `tabIndex=0` 但没有键盘打开逻辑；预设色块也不是 button 且没有 tabIndex。
  浏览器证据：React/Vue `#/color-picker` 页面主体内 6 个触发器均为 `tag=DIV`、`tabIndex=0`、`text=""`；聚焦第二个触发器后按 Enter / Space，`Color value` input 数量仍为 0，鼠标 click 后变为 1。打开第二个示例时没有预设色块属性可读，说明当前点击的是 `showAlpha` 示例；源码显示 presets 色块同样是带 `aria-label="Select ..."` 的 `div`，未设置 role/tabIndex/keydown。
  影响：鼠标可用，键盘用户无法打开 ColorPicker 或访问预设色块；这更接近组件源码/a11y 缺口，而不是单纯文案问题。

**组件能力建议**：

- 类型：a11y / 文档示例。
  建议：Switch 示例给每个开关传业务化中文 `aria-label` 或 `aria-labelledby`，例如“启用消息通知”“小号开关示例”；组件已有 attrs 透传，优先只改 Example。
  证据：页面 switch 均无文本和 `aria-label`，但 React/Vue 组件可透传 attrs。
- 类型：a11y / 文档示例。
  建议：Slider 示例为单值滑块传中文 `aria-label`，范围滑块传业务化 label；若希望默认中文 `Minimum value` / `Maximum value`，另开组件 i18n 任务。
  证据：多数滑块无名称，范围 thumb 默认英文。
- 类型：a11y / i18n / 组件能力。
  建议：Rate 增加可覆写 `aria-label` / `aria-valuetext` 或 locale 能力；短期可在 Example 中补“当前评分/清空评分/hover 预览”可见反馈，源码任务再处理 SR 文案。
  证据：所有评分 slider 均输出 `Rating` 与 `N stars`。
- 类型：a11y / i18n / 文档示例。
  建议：ColorSwatch 示例传中文 `ariaLabel`，并把默认/品牌/状态色 label 改成业务化中文名称；必要时保留 hex 作为辅助文本。
  证据：所有 radiogroup 均为 `Color swatches`，色值 label 多为英文或 hex。
- 类型：API 缺口 / 文档示例。
  建议：ColorPicker 要么先把 Example 文案改为当前真实能力（Hue + Hex + presets + size + disabled），要么另开组件任务真正实现 `showAlpha` 和 `format`；不要继续展示未生效 props。
  证据：`showAlpha` / `format="rgb"` 示例面板仍只有 Hue 与 Hex。
- 类型：a11y / 组件能力。
  建议：ColorPicker 触发器改成原生 `button` 或补 Enter/Space 键盘处理；presets 色块改成 button 或至少补 role/tabIndex/keydown，并提供可覆写中文 trigger/preset aria 文案。
  证据：触发器聚焦后 Enter/Space 均不打开，click 才打开；源码 presets 色块为不可聚焦 div。

**建议优先级**：

- P1：ColorPicker `showAlpha` / `format` 示例与真实能力不一致，需修正 Example 文案或实现组件能力。
- P1：ColorPicker 触发器和预设色块键盘不可用，需组件源码/a11y 修复。
- P1：Switch 示例补业务化中文 `aria-label` / `aria-labelledby`。
- P1：Slider 示例补业务化中文 `aria-label`，并处理范围 thumb 默认英文。
- P1：Rate `Rating` / `N stars` 中文站 a11y 文案修正或 locale 能力补齐。
- P2：ColorSwatch 示例补中文 `ariaLabel` 与业务化颜色 label。
- P3：Rate 示例补 hover / allowClear / 当前评分业务反馈；Slider 示例可补一个更真实的“预算/温度/区间筛选”组合场景。

**后续执行建议**：Switch、Slider、ColorSwatch 的大部分问题优先只改 Example/文档；Rate 需要组件支持可覆写 a11y 文案或 locale 才能彻底修正；ColorPicker 至少需要组件源码任务处理键盘可用性，并决定 `showAlpha` / `format` 是实现还是从示例中移除。修复阶段应复查 React/Vue `#/switch`、`#/slider`、`#/rate`、`#/color-swatch`、`#/color-picker`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；若改组件源码，再补对应 React/Vue focused a11y tests 与 `npx -y pnpm@11.9.0 api:validate`。

### E12 Select / AutoComplete / Cascader / TreeSelect / Mentions / Transfer

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/select`、`#/auto-complete`、`#/cascader`、`#/tree-select`、`#/mentions`、`#/transfer`。
- React：`http://localhost:5174/#/select`、`#/auto-complete`、`#/cascader`、`#/tree-select`、`#/mentions`、`#/transfer`。
- 视口：桌面 `1280x720`（交互复查用 `1280x900` 以容纳下拉/穿梭框）；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器工具：本轮 dev server 实际端口被占用后 Vue 落在 `5176`、React 落在 `5175`（默认约定仍为 Vue `5173`/React `5174`）；交互式 preview 在当前环境无法绑定端口、Chrome 扩展未连接，改用仓库现有 Playwright/Chromium 对同一 dev server 做 DOM 查询与用户操作复查，证据等价于模拟浏览器体验。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、`section > h2` 分节数、`示例`/`代码`页签、桌面与移动页面级横向溢出、控制台报错；Select 打开基础下拉读 `role="option"` 并选择、读“选中的值”，验证 clearable 清除、searchable 过滤 + `onSearchChange`“最近一次搜索”、multiple 结果、禁用选项 `aria-disabled`、空态“暂无数据”，并读取 trigger `aria-haspopup`/`aria-expanded`、清除按钮 `aria-label`、内置搜索框 placeholder；AutoComplete 输入 `V` 读候选并选中回填；Cascader 逐级点击 浙江 / 杭州 / 西湖区 读 trigger 路径与 searchable placeholder；TreeSelect 点击 chevron 展开 研发部 → 前端组/后端组、读 trigger role 与下拉角色；Mentions 输入 `@` 读用户候选并选择回填、验证自定义 `#` 前缀；Transfer 读 Source/Target 计数与面板标题、勾选移动、读移动按钮 `aria-label` 与面板搜索 placeholder。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/form.md`、`skills/tigercat/references/shared/props/form.md`。
- React Example：`examples/example/react/src/pages/SelectDemo.tsx`、`AutoCompleteDemo.tsx`、`CascaderDemo.tsx`、`TreeSelectDemo.tsx`、`MentionsDemo.tsx`、`TransferDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/SelectDemo.vue`、`AutoCompleteDemo.vue`、`CascaderDemo.vue`、`TreeSelectDemo.vue`、`MentionsDemo.vue`、`TransferDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/select.ts`、`transfer.ts`；`packages/core/src/utils/locale-utils.ts`（`DEFAULT_*` vs `ZH_CN_*`、`getSelectLabels`）；`packages/react/src/components/Select.tsx`、`Select/state.ts`、`Cascader.tsx`、`TreeSelect.tsx`、`Transfer.tsx`；对应 `packages/vue/src/components/Transfer.ts`。

**用户故事**：

- 作为使用者，我希望 Select 页面能覆盖基础/默认值/禁用/尺寸/禁用选项/可清空/可搜索/多选/多选+搜索/分组/空态，并在选择、清除、搜索后看到可见结果，方便直接落地到表单选择器。
- 作为使用者，我希望 AutoComplete 页面能验证输入过滤、候选选择回填，并看出禁用、尺寸、异步或自由文本等常见变体如何写。
- 作为使用者，我希望 Cascader 页面能逐级选择省市区并看到最终路径，同时验证搜索、尺寸与禁用。
- 作为使用者，我希望 TreeSelect 页面能展开组织架构树、选择成员并看到结果，验证搜索、尺寸与禁用。
- 作为使用者，我希望 Mentions 页面能用 `@` 唤起用户列表、插入提及文本，并验证自定义触发符与尺寸/禁用。
- 作为使用者，我希望 Transfer 页面能双向穿梭、看到两栏计数与自定义标题，并验证搜索，且 React/Vue 表现一致。

**Example 体验问题**：

- 问题：E12 未发现 route-level P0 阻断问题；React/Vue 12 个 route 均可打开，桌面与移动视口无页面级横向溢出、无控制台报错，Select/AutoComplete/Cascader/TreeSelect/Mentions/Transfer 主要交互均可完成，且 React/Vue 结构与行为高度一致（唯一显著差异见下条 Transfer 自定义标题）。
  浏览器证据：桌面 `1280x720` 下 React/Vue 分别返回目标 `h1`；分节数一致（Select 11、AutoComplete 2、Cascader 3、TreeSelect 3、Mentions 3、Transfer 2）；移动 `390x844` 复查 12 个 route 的 `pageOverflow=false`、`errors=[]`。Select 基础下拉出现 4 个 `role="option"`，选择“选项 3”后显示“选中的值：option3”，searchable 输入“美”过滤为“美国”、“日”触发“最近一次搜索：日”，禁用选项 `aria-disabled=true`，多选显示“选中：option1, option3”，清除后 trigger 回到 placeholder，空态显示“暂无数据”；AutoComplete 输入“V”得到 [Vue, Svelte] 并回填“Vue”；Cascader 逐级点击后 trigger 显示“浙江 / 杭州 / 西湖区”；TreeSelect 点击 chevron 后 研发部 展开为 前端组/后端组；Mentions 输入“你好 @”出现 4 个用户候选，选择后值为“你好 @zhangsan ”；Transfer 显示 Source (8)/Target (2) 两栏与 2 个移动按钮。
  影响：E12 可作为 Form 选择/输入类组件的审查入口继续使用。
- 问题：Vue Transfer “搜索与标题”示例传入的是不存在的 `:titles="['可选', '已选']"` 数组属性（组件公开属性是 `sourceTitle` / `targetTitle`，`TransferProps` 没有 `titles`），因此 Vue 面板标题仍是英文默认 `Source (8)` / `Target (2)`，与 React 同一示例显示中文“可选 (8)/已选 (2)”不一致，该 section 声称的“自定义标题”实际未生效。
  浏览器证据：React `#/transfer` 第 2 个 section 面板文本为“可选 (8) … 已选 (2)”、搜索框 `aria-label="Search 可选"`；Vue 同一 section 面板文本为“Source (8) … Target (2)”、搜索框 `aria-label="Search Source"`；`examples/example/vue3/src/pages/TransferDemo.vue` 第 45-49 行传 `:titles="['可选', '已选']"`，而 `packages/core/src/types/transfer.ts` 只有 `sourceTitle` / `targetTitle`、`packages/vue/src/components/Transfer.ts` props 也只声明 `sourceTitle` / `targetTitle`。
  影响：Vue 用户复制该示例得不到自定义标题，且 React/Vue 明显不一致，属于 Example 端 P1 修复。
- 问题：中文示例站在多个 Form 组件上显示英文内置默认文案（可见文本与 a11y 文案都有），根因是示例 app 根节点没有包裹中文 `ConfigProvider`/locale，导致内置字符串回退到默认英文 locale。
  浏览器证据：Select 未显式传 placeholder 的示例 trigger 显示英文默认“Select an option”（`Select/state.ts` 默认参数硬编码），下拉内搜索框 placeholder 为“Search...”、清除按钮 `aria-label="Clear selection"`；Cascader/TreeSelect 搜索框 placeholder 均为“Search...”，其清除 `aria-label="Clear selection"` 在 `packages/react/src/components/Cascader.tsx:268`、`TreeSelect.tsx:241` 为硬编码英文；Transfer 基础示例面板标题为英文“Source/Target”、移动按钮 `aria-label` 为“Move selected to target”/“Move selected to source”（`packages/react/src/components/Transfer.tsx:272/286` 硬编码）、面板搜索 `aria-label="Search {title}"`。`packages/core/src/utils/locale-utils.ts` 同时存在英文默认与 `ZH_CN_*` 中文 locale，示例站两侧 app 根节点均未设置 `ConfigProvider`。
  影响：与 E07（Tabs/Tree 英文 aria）、E08（Alert/Progress 英文 aria）同类，且此处“Select an option”“Search...”“Source/Target”均为可见文本，中文站观感与可复制性受影响。
- 问题：AutoComplete、Cascader、TreeSelect、Mentions 的示例覆盖偏薄（分别 2、3、3、3 个 section），且这几页除 trigger 外普遍没有把“已选值/当前状态”回显到页面上，用户不易看出受控值结构；相比之下 Select 页面每个示例都有“选中的值/选中：…”回显。
  浏览器证据：AutoComplete 仅“基本用法/自定义选项”两节，无禁用/尺寸/异步/自由文本；Cascader、TreeSelect 仅“基本用法/可搜索/尺寸与禁用”，无多选/勾选/change 回显；Mentions 仅“基本用法/自定义触发符/尺寸与禁用”；Cascader/TreeSelect/Mentions 基础节均无结果段落，选择后只能从 trigger/输入框读取。
  影响：不阻断使用；属于文档/Example 覆盖与可复制性缺口，而非 API 缺口。
- 问题：TreeSelect 下拉以 `role="listbox"` + `role="option"`（扁平化节点）呈现树，而非 `role="tree"` / `treeitem`；AutoComplete 触发器 `role="combobox"` 但缺少 `aria-autocomplete`。
  浏览器证据：TreeSelect 打开后 body 角色统计为 `listbox:1`、`option:2`（折叠态仅顶层 研发部/产品部），展开 chevron 后才追加子节点 option；AutoComplete `[role="combobox"]` 的 `aria-autocomplete` 为 `null`、`aria-expanded` 随输入变化。
  影响：功能可用（组合框-列表框是可接受的折衷），属于 a11y 语义精度的低优先 polish。

**组件能力建议**：

- 类型：组合使用 / 文档示例。
  建议：把 Vue Transfer “搜索与标题”示例的 `:titles="['可选', '已选']"` 改为 `source-title="可选" target-title="已选"`（与 React 对齐），并复查 raw-source 代码页签，避免继续展示无效属性。
  证据：`titles` 不在 `TransferProps` 中；Vue 面板仍显示英文 `Source/Target`，React 正确显示中文。
- 类型：i18n / a11y / 组件能力。
  建议：优先在示例站两端 app 根节点包裹中文 `ConfigProvider`/locale，使 Select 的搜索 placeholder（`common.searchPlaceholder`）、清除 `aria-label`（`common.clearText`）等 locale 驱动文案本地化；Select 默认 placeholder “Select an option” 目前非 locale 驱动，可在示例各 section 显式传中文 placeholder，或另开组件任务改为 locale 兜底。
  证据：`Select/state.ts` 中 `searchPlaceholder`/`clearAriaLabel` 走 `resolveLocaleText(..., mergedLocale?.common?.*)`，示例未设置中文 locale；默认 placeholder 为硬编码英文参数。
- 类型：a11y / i18n / 组件能力。
  建议：Cascader/TreeSelect 的清除 `aria-label`、Transfer 的移动按钮与面板搜索 `aria-label`、面板默认标题均为组件层硬编码英文，需另开组件源码/i18n 任务改为可 locale 覆写（并补 React/Vue focused a11y tests）；短期示例可对 Transfer 显式传中文标题、对 Cascader/TreeSelect 说明该限制。
  证据：`Cascader.tsx:268`、`TreeSelect.tsx:241`、`Transfer.tsx:272/286` 及面板 `aria-label="Search {title}"` 均为字面英文。
- 类型：文档示例 / 组合使用。
  建议：为 AutoComplete/Cascader/TreeSelect/Mentions 各补 1-2 个更贴业务的 section（如 AutoComplete 异步/自由文本、Cascader change-on-select、TreeSelect 勾选多选、Mentions 过滤/加载），并像 Select 一样在页面回显已选值，提升可复制性。
  证据：这四页覆盖偏薄且多数基础节无结果回显。
- 类型：a11y。
  建议：AutoComplete 触发器补 `aria-autocomplete="list"`；TreeSelect 可评估是否升级为 `role="tree"`/`treeitem` 语义（低优先）。
  证据：AutoComplete `aria-autocomplete=null`；TreeSelect 使用 listbox/option 呈现树。

**建议优先级**：

- P1：Vue Transfer “搜索与标题”改用 `source-title`/`target-title`，修复自定义标题失效与 React/Vue 不一致。
- P1：示例站两端补中文 `ConfigProvider`/locale（或分散传中文 placeholder），修正 Select 的可见“Select an option”“Search...”与清除 aria。
- P2：Cascader/TreeSelect 清除 aria、Transfer 移动/搜索 aria 与默认标题的英文文案（组件层 locale 能力）。
- P2：AutoComplete/Cascader/TreeSelect/Mentions 补业务化 section 并在页面回显已选值。
- P3：AutoComplete 补 `aria-autocomplete`；TreeSelect 树语义 polish。

**后续执行建议**：优先只改 Example/文档；Vue Transfer 标题属性、Transfer 显式中文标题、四页覆盖与结果回显都不需要 public API 变更。示例站补中文 `ConfigProvider` 可一次性修正 Select 等 locale 驱动文案；Cascader/TreeSelect/Transfer 的硬编码英文 a11y 文案需另开组件源码/i18n 任务并补 React/Vue focused a11y tests 与 `npx -y pnpm@11.9.0 api:validate`。修复阶段应复查 React/Vue `#/transfer`、`#/select`、`#/cascader`、`#/tree-select`、`#/auto-complete`、`#/mentions`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时再运行 `npx -y pnpm@11.9.0 example:build`。

### E13 DatePicker / TimePicker / Calendar / Countdown / CronEditor / NumberKeyboard

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/datepicker`、`#/timepicker`、`#/calendar`、`#/countdown`、`#/cron-editor`、`#/number-keyboard`。
- React：`http://localhost:5174/#/datepicker`、`#/timepicker`、`#/calendar`、`#/countdown`、`#/cron-editor`、`#/number-keyboard`。
- 视口：桌面默认 `1280x720`；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器工具：本轮 dev server 使用默认端口，Vue 为 `http://127.0.0.1:5173/`，React 为 `http://127.0.0.1:5174/`；用模拟浏览器访问并操作上述 hash route。
- 浏览器操作路径：逐页直达 hash route；检查每页 `h1`、`section > h2` 分节数、桌面与移动页面级横向溢出、控制台错误；DatePicker 打开基础日历并选择 `2026-07-15`，检查默认文案与清除按钮 aria；TimePicker 打开时间面板并点击小时/分钟选项，读取选中值；Calendar 检查月视图、年视图和禁用周末按钮；Countdown 等待结束事件变更状态；CronEditor 输入 `60 * * * *` 验证校验文案；NumberKeyboard 输入金额、手机号、身份证模式并读取确认值、删除键和 `X` 键 aria。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/form.md`、`skills/tigercat/references/examples/data.md`、`skills/tigercat/references/shared/props/form.md`、`skills/tigercat/references/shared/props/data.md`。
- React Example：`examples/example/react/src/pages/DatePickerDemo.tsx`、`TimePickerDemo.tsx`、`CalendarDemo.tsx`、`CountdownDemo.tsx`、`CronEditorDemo.tsx`、`NumberKeyboardDemo.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/DatePickerDemo.vue`、`TimePickerDemo.vue`、`CalendarDemo.vue`、`CountdownDemo.vue`、`CronEditorDemo.vue`、`NumberKeyboardDemo.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/datepicker.ts`、`timepicker.ts`、`calendar.ts`、`countdown.ts`、`cron-editor.ts`、`number-keyboard.ts`；`packages/core/src/utils/datepicker-i18n.ts`、`number-keyboard-utils.ts`、`cron-editor-utils.ts`；`packages/react/src/components/DatePicker.tsx`、`CronEditor.tsx`、`NumberKeyboard.tsx`；对应 Vue 组件源码。

**用户故事**：

- 作为使用者，我希望 DatePicker 页面能覆盖单日期、范围、自定义文案、尺寸、格式、日期限制、禁用/只读和清除，并在选择后看到可见回显。
- 作为使用者，我希望 TimePicker 页面能覆盖单时间、时间段、尺寸、12/24 小时、秒、步长、时间范围、禁用/只读和清除，并能确认时间面板选项的本地化文案。
- 作为使用者，我希望 Calendar 页面能展示月视图、年视图、全屏和禁用日期，并在选中日期后看到当前值，方便落地排期或可预约日期场景。
- 作为使用者，我希望 Countdown 页面能展示常规倒计时、格式/前后缀和结束事件，能复用到活动、发售、支付保留等场景。
- 作为使用者，我希望 CronEditor 页面能直接编辑表达式、使用预设、查看字段拆分和校验错误，并能复制到定时任务配置表单。
- 作为使用者，我希望 NumberKeyboard 页面能覆盖金额、手机号和身份证输入，能确认长度/精度限制、删除、确认和特殊 `X` 键行为。

**Example 体验问题**：

- 问题：E13 未发现 route-level P0 阻断问题；React/Vue 12 个 route 均可打开，桌面与移动视口无页面级横向溢出、无控制台错误，DatePicker/TimePicker/Calendar/Countdown/CronEditor/NumberKeyboard 的主要交互均能完成。
  浏览器证据：桌面下 React/Vue 均返回目标 `h1`；分节数一致（DatePicker 8、TimePicker 9、Calendar 3、Countdown 3、CronEditor 2、NumberKeyboard 3）；移动 `390x844` 下 12 个 route 的 `pageOverflow=false`。React DatePicker 选择 `2026-07-15` 后输入值为 `2026-07-15` 且回显“选中的日期：2026/7/15”；Vue TimePicker 打开后出现 84 个时间选项并可更新“选中的时间”；React Calendar 周末禁用按钮含 `2026-07-04`、`2026-07-05` 等 disabled；Vue Countdown 等待 10 秒后“付款保留时间”显示 `00:00:00` 且状态变为“订单已释放”；React CronEditor 输入 `60 * * * *` 后出现 `Minute must be between 0 and 59`；React NumberKeyboard 金额输入 `12.34` 后显示“已确认：¥12.34”，手机号限制到 `12345678901`。
  影响：E13 可作为日期/时间/定时任务/移动数字输入类组件的审查入口继续使用。
- 问题：DatePicker 在中文示例站里仍大量显示英文默认 placeholder 与 aria 文案；示例已经传 `locale={locale}` / `:locale="locale"`，但未传 placeholder/labels 的场景仍回退为 `Select date`、`Select date range`、`Toggle calendar`、`Clear date`。
  浏览器证据：React/Vue `#/datepicker` 中“日期格式”“禁用和只读”“可清除”等 section 的输入 `placeholder` / `aria-label` 为 `Select date`，清除按钮为 `Clear date`，日历按钮为 `Toggle calendar`；源码中 React `DatePicker.tsx` 用 `ctx.placeholder || 'Select date'`，Vue `DatePicker.ts` 默认 `props.placeholder ?? (props.range ? 'Select date range' : 'Select date')`，英文标签来自 `datepicker-locales/en-US.ts`。
  影响：中文站可见文本和 a11y 文案不一致，用户复制示例时会把英文默认文案带入业务表单。
- 问题：CronEditor 的可见字段标签、预设选项、错误消息和 aria 全是英文，中文示例站只把外层标题与“校验结果”翻译成中文。
  浏览器证据：React `#/cron-editor` 两个 section 均显示 `Preset`、`Every minute`、`Minute`、`Any`、`Specific`、`Range`、`Custom`；输入 `60 * * * *` 后错误为 `Minute must be between 0 and 59`，控件 aria 为 `Cron expression`、`Cron preset`、`Minute mode`、`Hour value` 等。源码中 React/Vue `CronEditor` 直接写 `aria-label="Cron expression"` / `Cron preset`，字段元数据与校验消息来自英文 `cron-editor-utils.ts`。
  影响：定时任务编辑是高理解成本组件，英文字段会明显降低中文用户理解和复制落地质量。
- 问题：NumberKeyboard 只有金额示例显式传了中文 `deleteText="退格"` / `delete-text="退格"`；手机号和身份证示例默认删除键显示英文 `Delete`，金额小数点 aria 为 `Decimal`，身份证 `X` 键 aria 为 `ID card X`。
  浏览器证据：React `#/number-keyboard` 金额 section 按钮为“退格/完成”，手机号和身份证 section 按钮为 `Delete/完成`；浏览器点击金额 `1`、`2`、`.`、`3`、`4`、`完成` 后显示 `已确认：¥12.34`，手机号输入 12 次数字后值被限制为 `12345678901`，身份证 section 的 `X` 按钮可访问名为 `ID card X`。源码中 React/Vue `NumberKeyboard` 默认 `deleteText = 'Delete'`，`number-keyboard-utils.ts` 默认 `deleteText || 'Delete'`、小数 aria 为 `Decimal`、身份证 X aria 为 `ID card X`。
  影响：常见移动端输入示例可用，但中文站复制 phone/id-card 示例会得到英文操作键和英文 aria。
- 问题：Calendar / Countdown 示例可运行但业务覆盖偏薄；Calendar 没有事件/排班/预约日渲染或面板切换回显，Countdown 没有暂停/重置、服务器时间同步或结束后按钮状态等真实业务场景。
  浏览器证据：React/Vue `#/calendar` 均只有“基础用法”“年视图 & 全屏”“禁用日期”3 节，浏览器能看到选中日期与周末禁用；React/Vue `#/countdown` 均只有“基本用法”“格式与前后缀”“结束事件”3 节，结束事件能显示“订单已释放”。
  影响：不阻断使用；但日期展示和倒计时常用于高频业务流程，当前 Example 对组合落地线索不足。

**组件能力建议**：

- 类型：i18n / a11y / 默认行为。
  建议：为 DatePicker 默认 placeholder 与 labels 接入 locale，或在 Example 所有未显式 placeholder 的 DatePicker 场景补中文 placeholder/labels；源码修复需覆盖 React/Vue DatePicker。
  证据：示例传入 `locale` 后月份/星期可以本地化，但 placeholder、toggle、clear 仍回退英文。
- 类型：i18n / a11y / 组件能力。
  建议：为 CronEditor 增加 locale/labels 能力，覆盖字段标签、预设选项、校验消息和 aria；短期 Example 可在标题或文档中说明当前字段为英文 DSL 术语，但错误消息和 aria 更适合组件层本地化。
  证据：`CronEditorProps` 当前只有 `size` / `disabled` / `readonly` 等少量 props，没有 labels/locale；浏览器中输入非法 minute 后错误为英文。
- 类型：i18n / 文档示例 / a11y。
  建议：NumberKeyboard 的手机号和身份证示例显式传中文 `deleteText`，并评估组件层是否应从 `ConfigProvider` locale 读取 `numberKeyboard.deleteText`、decimal aria 和 id-card X aria。
  证据：amount 示例因显式传 `deleteText` 显示中文，phone/id-card 默认 `Delete`；core locale 已有 `numberKeyboard.deleteText` 中文字段，但组件未使用。
- 类型：文档示例 / 组合使用。
  建议：Calendar 后续补一个“带日程/预约状态”的 cell 渲染或选中回显场景，Countdown 补一个支付/活动结束后按钮状态切换或可重置场景。
  证据：当前两页都只覆盖基础能力与一条事件/禁用示例，缺少用户最常复制的业务组合。
- 类型：文档示例。
  建议：TimePicker 可补一条跨班次/营业时间业务示例，把 `minTime` / `maxTime` / `hourStep` / `minuteStep` 与结果回显放在同一场景中。
  证据：当前 TimePicker 覆盖较完整，但步长、范围限制和结果回显分散在不同 section。

**建议优先级**：

- P1：DatePicker 中文站默认 placeholder / toggle / clear 文案本地化，避免 `locale` 已传仍显示英文。
- P1：CronEditor 增加或规划 locale/labels 能力，至少覆盖字段、预设、错误消息和 aria。
- P2：NumberKeyboard phone/id-card 示例补中文 `deleteText`，并评估组件层读取 locale 的实现。
- P2：Calendar 补业务化日程/预约状态示例；Countdown 补结束后业务状态或可重置示例。
- P3：TimePicker 补跨班次/营业时间组合示例。

**后续执行建议**：DatePicker 和 NumberKeyboard 可先做 Example/文档层修复（显式中文 placeholder/labels/deleteText），再另开组件 i18n 任务把默认行为接入 locale；CronEditor 需要组件源码/API 级 labels/locale 扩展，不建议只靠 Example 文案掩盖。修复阶段应复查 React/Vue `#/datepicker`、`#/cron-editor`、`#/number-keyboard`、`#/calendar`、`#/countdown`、`#/timepicker`，并运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及组件源码/i18n 时补充 React/Vue focused tests、`npx -y pnpm@11.9.0 api:validate` 和对应 `test:group:form` / `test:group:data`。

### E14 Upload / Signature

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/upload`、`#/signature`。
- React：`http://localhost:5174/#/upload`、`#/signature`。
- 视口：桌面 `1280x720`；移动 `390x844`；Upload/Signature 交互复查用 `1280x900`。
- 主题/语言：示例站点默认主题与默认中文文案。
- 浏览器工具：in-app browser 已用于连接本地页面，但文件选择接口不暴露 `setInputFiles`；实际交互复查改用同一 dev server 上的 Playwright/Chromium，完成文件选择、签名绘制、导出和移动视口检查。
- 浏览器操作路径：逐页直达 hash route；检查 `h1`、section 数量、`示例`/`代码`页签、桌面与移动页面级横向溢出、控制台错误；Upload 选择/移除文件、触发数量限制、验证 accept / beforeUpload 拒绝、图片卡片预览/移除按钮、customRequest 上传完成；Signature 在画布上绘制、清空、导出 PNG/SVG，并检查 disabled/readonly 画布状态。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/form.md`、`skills/tigercat/references/shared/props/form.md`。
- React Example：`examples/example/react/src/pages/UploadDemo.tsx`、`SignatureDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`。
- Vue Example：`examples/example/vue3/src/pages/UploadDemo.vue`、`SignatureDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/upload.ts`、`signature.ts`、`packages/core/src/utils/upload-labels.ts`、`upload-utils.ts`、`signature-utils.ts`、`packages/react/src/components/Upload.tsx`、`Signature.tsx`、对应 Vue `Upload.ts` / `Signature.ts`。

**用户故事**：

- 作为使用者，我希望 Upload 页面能覆盖按钮上传、拖拽上传、多文件、数量限制、类型/大小限制、图片卡片、禁用态和自定义上传，并能看到文件名、大小、移除、预览和上传状态。
- 作为使用者，我希望 Upload 示例在拒绝文件时给出可见反馈，避免只看到文件没有加入列表却不知道原因。
- 作为使用者，我希望 Upload 数量限制示例的提示文案能准确表达“最多 3 个”，而不是暴露内部当前列表长度。
- 作为使用者，我希望 Signature 页面能画出签名、清空签名、导出 PNG/SVG，并看到 disabled/readonly 下不可绘制的状态。
- 作为使用者，我希望中文示例站的 Signature 默认画布名称和清空按钮都能本地化或在示例中显式传入中文文案，避免复制后混入英文 a11y/可见文本。

**Example 体验问题**：

- 问题：E14 未发现 route-level P0 阻断问题；React/Vue `#/upload` 与 `#/signature` 均可打开，桌面与移动视口无页面级横向溢出、无控制台错误，Upload 基础选择/移除、图片卡片和 Signature 绘制/清空/导出均可完成。
  浏览器证据：桌面 `1280x720` 下 React/Vue `#/upload` 均为 8 个 section，`#/signature` 均为 3 个 section；移动 `390x844` 四个 route 的 `pageOverflow=false`、`errors=[]`。Upload 基础上传 `contract-note.txt` 后显示文件名和 `21.00 B`，移除按钮 `aria-label="移除 contract-note.txt"` 且点击后文件消失；图片卡片上传 `stamp.png` 后出现图片和 `预览 stamp.png` / `移除 stamp.png` 按钮。Signature 基础画布绘制后显示 `已生成签名值：data:image/svg+xml...`，清空后回到“等待签名”；导出区绘制后 PNG 预览图片可见，SVG `<pre>` 输出以 `<svg ... width="420" height="180"` 开头。
  影响：E14 可作为上传和签名组件的体验审查入口继续使用。
- 问题：Upload “文件数量限制”示例选择 4 个文件时，React/Vue 都弹出“最多只能上传 0 个文件！”，但页面实际保留前 3 个文件；提示文案和示例目标不一致。
  浏览器证据：在 React/Vue `#/upload` 的“文件数量限制”section 一次选择 `a.txt`、`b.txt`、`c.txt`、`d.txt` 后，dialog message 均为 `最多只能上传 0 个文件！`，section 文本显示 `a.txt`、`b.txt`、`c.txt` 三个文件。
  影响：用户能看出 limit 生效，但复制示例会得到误导性告警；这是 E14 最高优先级 Example 修复。
- 问题：Upload “文件类型和大小限制”示例拒绝不符合 accept / beforeUpload 的文件时没有页面内反馈，尤其第一个“仅允许图片”只显示 accept 文案，用户不知道拒绝原因；第二个自定义校验使用 `alert`，但本轮选择 txt 文件后页面仍无持久状态。
  浏览器证据：在 React/Vue 两端分别向“仅允许图片”和“自定义校验（JPG/PNG，小于2MB）”输入 txt 文件后，section 文本仍只保留 `支持：image/*` 与 `支持：image/jpeg,image/png 大小限制：2.00 MB`，文件未加入列表，也没有页面内错误提示。
  影响：校验能力存在，但 Example 对失败路径不可观察，可复制性弱。
- 问题：Upload “自定义上传”说明“可观察上传进度”，但当前文件列表只显示文件名和大小；用户不能从示例页面读到百分比或成功完成状态，只能间接依赖图标变化。
  浏览器证据：React/Vue `#/upload` 自定义上传选择 `contract-note.txt` 后，中途与完成后的 section 文本都只有 `contract-note.txt 21.00 B`，没有百分比、成功文案或响应信息。
  影响：customRequest 能运行，但示例没有把最关键的 progress/success 数据可视化。
- 问题：Signature “导出”与“禁用和只读”示例没有传 `ariaLabel` / `clearText`，中文页面仍显示英文默认 `Signature pad` 和 `Clear`；基础示例已经展示了中文 `aria-label="合同签名"` 与 `clearText="清空"`。
  浏览器证据：React/Vue `#/signature` 的“导出”section 首个清空按钮文本为 `Clear`，画布 `aria-label="Signature pad"`；disabled/readonly 两个画布同样为 `Signature pad`、`aria-disabled="true"`、`tabIndex="-1"`。
  影响：组件支持本地化覆写，但常规示例复制后会在中文站混入英文可见文本和 a11y 名称。
- 问题：Signature 示例只覆盖固定尺寸、颜色、线宽、导出、禁用/只读，没有展示 `clearable=false`、`backgroundColor` 与 `quality` 的业务差异，也没有说明移动端固定 `420px` 画布的宽度取舍。
  浏览器证据：React/Vue `#/signature` 只有“基本用法 / 导出 / 禁用和只读”3 个 section；移动 `390x844` 下未出现页面级横向滚动，但画布仍是 `420` 宽的固定尺寸，依赖容器裁切/缩放体验不直观。
  影响：不阻断使用，属于 Example 覆盖和响应式说明缺口。

**组件能力建议**：

- 类型：文档示例。
  建议：修正 Upload “文件数量限制”示例的 `onExceed` 文案，直接使用配置上限或 `limit` 变量表达“最多只能上传 3 个文件”，不要用当前 `fileList.length`。
  证据：一次选择 4 个文件后实际保留 3 个，但告警显示 0。
- 类型：文档示例 / 组合使用。
  建议：Upload 校验示例用页面内状态展示被拒绝原因，例如 `lastError` 或 rejected file summary；保留 alert 也应同步展示持久反馈。
  证据：accept / beforeUpload 拒绝后没有可见失败信息。
- 类型：文档示例 / 组合使用。
  建议：Upload 自定义上传示例把 `onProgress` / `onSuccess` / `onError` 回显到页面，展示当前百分比、完成响应或失败原因；如组件当前列表不显示百分比，示例外层状态可先补。
  证据：customRequest 已按 20% 步进执行，但页面文本只显示文件名和大小。
- 类型：a11y / i18n / 文档示例。
  建议：Signature 所有示例统一传中文 `ariaLabel` 和 `clearText`；禁用/只读示例可分别命名为“禁用签名板”“只读签名板”，导出示例命名为“导出签名”。
  证据：基础示例已传中文，但导出、禁用、只读仍为 `Signature pad` / `Clear`。
- 类型：文档示例 / 移动端。
  建议：Signature 增加一个容器宽度友好的业务示例或说明固定 `width`/`height` 的移动端取舍，并补充 `clearable=false`、`backgroundColor`、`quality` 的最小展示。
  证据：当前只有 3 个 section，且移动视口虽然无页面级溢出，但固定 `420px` 画布不解释响应式策略。

**建议优先级**：

- P1：修正 Upload “文件数量限制”示例的错误告警文案。
- P1：Upload 校验拒绝路径补页面内错误反馈。
- P2：Upload 自定义上传示例补进度/成功/失败状态回显。
- P2：Signature 导出、禁用、只读示例补中文 `ariaLabel` / `clearText`。
- P3：Signature 补移动端/固定尺寸说明和 `clearable`、`backgroundColor`、`quality` 示例覆盖。

**后续执行建议**：优先只改 Example/文档，不需要 public API 变更。Upload 的数量限制文案、校验错误回显、自定义上传状态回显，以及 Signature 的中文 `ariaLabel` / `clearText` 都可在 React/Vue Example 内完成。修复阶段应复查 React/Vue `#/upload`、`#/signature` 的桌面与移动视口，并运行 `npx -y pnpm@11.9.0 example:sources:check`；如果调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。

### E15 Table / Collapse / Timeline

**状态**：已完成（2026-07-01）。

**体验入口**：

- Vue：`http://localhost:5173/#/table`、`#/collapse`、`#/timeline`。
- React：`http://localhost:5174/#/table`、`#/collapse`、`#/timeline`。
- 视口：桌面 `1280x800`（Table 交互复查用 `1280x900` 以容纳分页/下拉）；移动 `390x844`。
- 主题/语言：示例站点默认主题与默认中文文案（两端 app 根节点均未包裹 `ConfigProvider`/locale）。
- 浏览器工具：本轮交互式 preview 在当前环境无法绑定端口、Chrome 扩展未连接，改用仓库现有 Playwright/Chromium（`@playwright/test` chromium-1228）对已运行的 dev server（Vue `5173`、React `5174`，均监听 `[::1]`）做 DOM 查询与用户操作复查，证据等价于模拟浏览器体验。
- 浏览器操作路径：逐页直达 hash route；先在桌面/移动两视口检查 `h1`、`section` 分节数、`示例`/`代码`页签、页面级横向溢出、控制台报错；Table 点击 `Name` 列头做三态排序并读 `aria-sort`、在筛选列输入 `Jane` 读筛选后行数、勾选表头/行 checkbox 读“已选择”回显、点分页 `第 2 页` 读首行变化、展开 `可展开行` 读展开按钮 `aria-label` 与行数变化、读 `表头锁按钮` 的锁定 `aria-label`、在移动视口读 `响应式卡片模式` 是否隐藏 `<table>` 改渲卡片、切 `代码`页签读 raw source 长度并点复制按钮读 `aria-label` 变化、点 `自定义列渲染` 的 `Edit` 读原生 alert；Collapse 读每个面板 trigger 的 `aria-expanded`/`aria-disabled`，验证基础多开、手风琴自动收起、禁用面板不可展开、嵌套面板独立；Timeline 读基础项数、`反转顺序` 文本先后、`等待中状态` 自定义“正在处理”文案、`renderItem`/item 插槽 的 Tag 状态与日期。

**审查入口**：

- Generated refs：`skills/tigercat/references/component-index.md`、`skills/tigercat/references/examples/data.md`、`skills/tigercat/references/shared/props/data.md`。
- React Example：`examples/example/react/src/pages/TableDemo.tsx`、`CollapseDemo.tsx`、`TimelineDemo.tsx`、`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/react/src/router.tsx`、`examples/example/react/src/main.tsx`、`App.tsx`。
- Vue Example：`examples/example/vue3/src/pages/TableDemo.vue`、`CollapseDemo.vue`、`TimelineDemo.vue`、`examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/vue3/src/router.ts`。
- Source checks：`packages/core/src/types/table.ts`、`collapse.ts`、`timeline.ts`；`examples/example/react/tsconfig.json`、`examples/example/vue3/tsconfig.json`（`noUnusedLocals: false`）。

**用户故事**：

- 作为使用者，我希望 Table 页面能覆盖排序、筛选、行选择、分页、固定表头、固定列/锁定列、可展开行、加载/空态、尺寸、固定布局与响应式卡片模式，并在操作后看到可见结果，方便直接落地到业务数据表。
- 作为使用者，我希望 Collapse 页面能验证多开、手风琴、无边框、透明背景、图标位置、禁用、嵌套、自定义标题/额外内容与隐藏箭头，并确认展开/收起交互与禁用拦截。
- 作为使用者，我希望 Timeline 页面能验证 left/right/alternate 模式、颜色、自定义节点（dot / renderDot / 插槽）、自定义内容（renderItem / 插槽）、等待中状态与反转顺序。

**Example 体验问题**：

- 问题：E15 未发现 P0/P1 阻断问题；React/Vue 6 个 route 均可打开，桌面与移动视口无页面级横向溢出、无控制台报错，Table/Collapse/Timeline 主要交互均可完成，且 React/Vue 结构与行为高度一致。
  浏览器证据：桌面 `1280x800` 与移动 `390x844` 下 12 次加载 `errors=[]`、`overflow=false`（Table `scroll==client==1280/390`，Collapse/Timeline 同）；分节数 Table 18、Collapse 9、Timeline 9，两端一致。Table：`Name` 列头三态排序（`John…` → `Alice,Bob,Charlie,Jane,John` → 反向，`aria-sort=descending` 与降序序一致）；`Jane` 文本筛选 5→1 行只剩 `Jane Smith`（1 输入 +1 下拉）；勾选后“已选择: 无 → 已选择: 1, 3”（含表头全选框）；分页 `第 2 页` 使首行 `User 1 → User 11`（页码 `aria-label` 为中文“上一页/第 N 页/下一页”，页大小 `10`）；可展开行有 3 个 `展开行`（仅 active 行）按钮，点第一个行数 5→6；锁定按钮 `aria-label` 为中文“锁定Name列”等；`Edit` 触发原生 `alert:Editing: John Doe`。Collapse：基础 `aria-expanded` `[true,false,false] → [true,true,false] → [false,true,false]`（可多开），手风琴 `[true,false,false] → 全 false → [false,true,false]`（自动收起其他），禁用面板 `aria-disabled=true` 点击后仍 `false`（不可展开），嵌套 4 个 trigger 独立。Timeline：基础 3 项，`反转顺序` 中“发布版本”位于“创建项目”之前，`等待中状态` 含自定义“正在处理”，`renderItem`/item 插槽 命中 4 个状态 Tag 与日期。
  影响：E15 可作为 Data 表格/折叠/时间线类组件的审查入口继续使用。
- 问题：Table 列标题（`Name/Age/Email/Status/Actions/Address`）与筛选 placeholder（`Search name...`）在中文示例站中是英文；卡片模式字段标签也随列标题显示英文（`STATUS/AGE/EMAIL`）。与之相对，组件自带 chrome（分页 `第 N 页`、展开 `展开行`、锁定 `锁定X列` 的 `aria-label`）已是中文，两者混排导致同一页“组件文案中文、数据列头英文”的观感不一致。
  浏览器证据：`基础用法` 表头文本为 `NAME/AGE/EMAIL`（CSS 大写，底层 `Name/Age/Email`）；`筛选功能` 文本输入 placeholder 为 `Search name...`；移动 `响应式卡片模式` 卡片文本为 `John Doe STATUS active AGE 28 EMAIL …`；同页分页/展开/锁定 `aria-label` 均为中文。`main.tsx`/`App.vue` 均无 `ConfigProvider`，说明中文 chrome 来自 Table 组件默认 locale，英文来自示例作者填写的列 `title`/`filter.placeholder`。
  影响：不阻断使用；属于 Example 端 i18n/一致性 polish，而非 API 缺口——把列 `title` 与筛选 placeholder 改中文即可对齐。
- 问题：Table/Collapse/Timeline 每个 section 的 `代码`页签展示的都是整页 raw source（`fullPageSnippet`，React `766` 行、Vue `722` 行），且三页各自声明了大量按 section 命名的手写片段常量（`basicSnippet`、`borderedSnippet`、`sortingSnippet`… / Collapse、Timeline 同款）却全部未被引用，属于历史迁移遗留的 dead code。
  浏览器证据：Table `基础用法` 切 `代码`后 `<pre>` 文本 React `len=23125/766` 行、Vue `len=21820/722` 行且以 `import React`/`<script setup` 开头，`复制`按钮 `aria-label` `复制代码 → 已复制`；`grep` 确认三页 18/9/9 个 DemoBlock 均 `code={fullPageSnippet}` / `:code="fullPageSnippet"`，per-section 常量无处引用；`examples/example/{react,vue3}/tsconfig.json` 均 `noUnusedLocals: false`，故 tsc/vue-tsc 不报错、`example:build` 仍通过，这些常量长期无 gate 拦截。
  影响：整页 raw source 可复制性强（符合计划要求，不应恢复手写 snippet），但定位单个 section 用法时阅读成本高（同 E01 Code 页信息密度问题）；未引用常量是可安全删除的冗余。
- 问题：Table 的 `自定义列渲染`/`锁定列` 等操作列用原生 `alert()` / `window.confirm()` 反馈（`Edit` 弹 `Editing: John Doe`，`Delete` 弹确认后删行）。
  浏览器证据：点击 `自定义列渲染` 的 `Edit` 捕获到 `alert:Editing: John Doe`。
  影响：功能可用，但原生弹窗对“真实业务里操作列应接什么反馈”的示范偏弱，Message/Modal 更贴近落地写法。
- 问题：Timeline `自定义内容（renderItem/item 插槽）` 与 `完整示例` 的 Tag 显示英文状态值 `completed / in-progress / pending`（数据 `status` 字段直出）。
  浏览器证据：`renderItem` section 命中 4 个 `completed|in-progress|pending` Tag。
  影响：不阻断；中文站可把状态映射为中文标签（如 已完成/进行中/待处理）以提升可复制性。

**组件能力建议**：

- 类型：i18n / 文档示例。
  建议：把 Table 列 `title`（`Name/Age/Email/Status/Actions/Address`）与筛选 `filter.placeholder` 改为中文，并同步卡片模式字段标签，让数据列头与组件中文 chrome 一致；如需保留英文示例，可另加一节说明。
  证据：中文站列头显示 `NAME/AGE/EMAIL`、筛选 placeholder `Search name...`，而分页/展开/锁定 `aria-label` 已是中文。
- 类型：文档示例 / 代码可读性。
  建议：删除 Table/Collapse/Timeline 三页未引用的 per-section 片段常量（dead code）；若希望 `代码`页签更聚焦，可评估从可验证 fixture 派生更短的局部片段，但不要恢复与 raw source 脱节的手写 snippet。
  证据：三页 DemoBlock 全用 `fullPageSnippet`，per-section 常量无引用；`noUnusedLocals: false` 使其长期无 gate 拦截。
- 类型：组合使用 / 文档示例。
  建议：Table 操作列的 `Edit`/`Delete` 反馈从原生 `alert`/`confirm` 换成 Message/Modal 等库内反馈，示范真实业务操作列写法。
  证据：`Edit` 触发原生 `alert:Editing: John Doe`。
- 类型：i18n / 文档示例。
  建议：Timeline `renderItem`/`完整示例` 的状态 Tag 用中文标签映射（已完成/进行中/待处理），与中文站语言一致。
  证据：Tag 显示 `completed/in-progress/pending`。

**建议优先级**：

- P2：Table 列 `title` 与筛选 placeholder 改中文（含卡片字段标签），对齐组件中文 chrome。
- P3：删除 Table/Collapse/Timeline 三页未引用的 per-section 片段常量。
- P3：Table 操作列 `Edit`/`Delete` 反馈改用 Message/Modal 示范。
- P3：Timeline 状态 Tag 用中文标签映射。

**后续执行建议**：优先只改 Example/文档，不需要组件源码/public API 变更。Table 列标题/placeholder 中文化、三页 dead-code 常量清理、操作列反馈与 Timeline 状态标签本地化都可在 React/Vue Example 内完成。修复阶段应复查 React/Vue `#/table`、`#/collapse`、`#/timeline` 的桌面与移动视口，并运行 `npx -y pnpm@11.9.0 example:sources:check`；如调整页面结构，再运行 `npx -y pnpm@11.9.0 example:build`。

## 审查重点

- 用户故事是否能从 Example 页面直接看出业务意图，而不是只看到 props 展示。
- 必须模拟用户操作：点击按钮、打开弹层、输入文本、选择选项、滚动长内容、拖拽可拖动控件、切换主题/语言，并至少检查一个桌面视口和一个移动视口。
- React/Vue Example 是否覆盖同等场景；若框架差异来自惯例，需要记录差异理由。
- Code 标签是否仍来自同页 `?raw` source 或可验证 fixture；不得建议恢复手写 snippet。
- 示例是否足够可复制：导入路径、状态管理、数据结构、事件回调、样式扩展、i18n 和 a11y 线索是否完整。
- 复杂组件是否把可共存场景放在同一 Example 里，把互相干扰的弹层、异步、提交、命令式流程保持独立。
- 缺失建议要区分文档/Example 缺口和组件能力缺口，避免把说明不足误判为 API 不足。

## 验证要求

- 只更新本计划文档或路线图时，运行：
  - `npx -y pnpm@11.9.0 exec prettier --check docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`
  - `git diff --check -- docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`
  - `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`
- 如果后续 Agent 修改 Example 展示或 code source，额外运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时运行 `npx -y pnpm@11.9.0 example:build`。
- R28 审查本身不要求、也不接受用测试命令替代浏览器体验证据。
- 如果后续 Agent 修改组件源码或 public API，测试命令只作为修复验证补充；体验结论仍必须通过浏览器复查对应 Example route。
