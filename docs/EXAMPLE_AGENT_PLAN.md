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
| E08 | Alert / Loading / Progress / Tooltip / Popover / Popconfirm                                                                    | React/Vue: `#/alert`, `#/loading`, `#/progress`, `#/tooltip`, `#/popover`, `#/popconfirm`                                                                                         | 未开始               |
| E09 | Modal / Drawer / Message / Notification / Tour                                                                                 | React/Vue: `#/modal`, `#/drawer`, `#/message`, `#/notification`, `#/tour`                                                                                                         | 未开始               |
| E10 | Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper                                                        | React/Vue: `#/form`, `#/input`, `#/textarea`, `#/input-group`, `#/input-number`, `#/stepper`                                                                                      | 未开始               |
| E11 | Checkbox / Radio / Switch / Slider / Segmented / Rate / ColorSwatch / ColorPicker                                              | React/Vue: `#/checkbox`, `#/radio`, `#/switch`, `#/slider`, `#/segmented`, `#/rate`, `#/color-swatch`, `#/color-picker`                                                           | 未开始               |
| E12 | Select / AutoComplete / Cascader / TreeSelect / Mentions / Transfer                                                            | React/Vue: `#/select`, `#/auto-complete`, `#/cascader`, `#/tree-select`, `#/mentions`, `#/transfer`                                                                               | 未开始               |
| E13 | DatePicker / TimePicker / Calendar / Countdown / CronEditor / NumberKeyboard                                                   | React/Vue: `#/datepicker`, `#/timepicker`, `#/calendar`, `#/countdown`, `#/cron-editor`, `#/number-keyboard`                                                                      | 未开始               |
| E14 | Upload / Signature                                                                                                             | React/Vue: `#/upload`, `#/signature`                                                                                                                                              | 未开始               |
| E15 | Table / Collapse / Timeline                                                                                                    | React/Vue: `#/table`, `#/collapse`, `#/timeline`                                                                                                                                  | 未开始               |
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
