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
| E02 | Avatar / AvatarGroup / Empty / Result / Statistic / QRCode / Watermark                                                         | React/Vue: `#/avatar`, `#/empty`, `#/result`, `#/statistic`, `#/qrcode`, `#/watermark`                                                                                            | 未开始               |
| E03 | Image / ImageGroup / ImagePreview / ImageViewer / CropUpload / ImageCropper                                                    | React/Vue: `#/image`, `#/image-viewer`, `#/crop-upload`, `#/image-cropper`                                                                                                        | 未开始               |
| E04 | Layout / Header / Sidebar / Content / Footer / Container / Row / Col / Space / Divider                                         | React/Vue: `#/layout`, `#/grid`, `#/space`, `#/divider`                                                                                                                           | 未开始               |
| E05 | Card / List / Descriptions / Skeleton / Splitter / Resizable / Carousel                                                        | React/Vue: `#/card`, `#/list`, `#/descriptions`, `#/skeleton`, `#/splitter`, `#/resizable`, `#/carousel`                                                                          | 未开始               |
| E06 | Affix / Anchor / BackTop / Breadcrumb / ScrollSpy / FloatButton                                                                | React/Vue: `#/affix`, `#/anchor`, `#/backtop`, `#/breadcrumb`, `#/scroll-spy`, `#/float-button`                                                                                   | 未开始               |
| E07 | Menu / Dropdown / Steps / Tabs / Tree / Pagination / Spotlight                                                                 | React/Vue: `#/menu`, `#/dropdown`, `#/steps`, `#/tabs`, `#/tree`, `#/pagination`, `#/spotlight`                                                                                   | 未开始               |
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
