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

| 组  | 范围                                                                                                                           | 浏览器体验入口                                                                                                                                                                    | 状态   |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| E01 | Button / Link / Text / Code / Icon / Tag / Badge                                                                               | React/Vue: `#/button`, `#/link`, `#/text`, `#/code`, `#/icon`, `#/tag`, `#/badge`                                                                                                 | 未开始 |
| E02 | Avatar / AvatarGroup / Empty / Result / Statistic / QRCode / Watermark                                                         | React/Vue: `#/avatar`, `#/empty`, `#/result`, `#/statistic`, `#/qrcode`, `#/watermark`                                                                                            | 未开始 |
| E03 | Image / ImageGroup / ImagePreview / ImageViewer / CropUpload / ImageCropper                                                    | React/Vue: `#/image`, `#/image-viewer`, `#/crop-upload`, `#/image-cropper`                                                                                                        | 未开始 |
| E04 | Layout / Header / Sidebar / Content / Footer / Container / Row / Col / Space / Divider                                         | React/Vue: `#/layout`, `#/grid`, `#/space`, `#/divider`                                                                                                                           | 未开始 |
| E05 | Card / List / Descriptions / Skeleton / Splitter / Resizable / Carousel                                                        | React/Vue: `#/card`, `#/list`, `#/descriptions`, `#/skeleton`, `#/splitter`, `#/resizable`, `#/carousel`                                                                          | 未开始 |
| E06 | Affix / Anchor / BackTop / Breadcrumb / ScrollSpy / FloatButton                                                                | React/Vue: `#/affix`, `#/anchor`, `#/backtop`, `#/breadcrumb`, `#/scroll-spy`, `#/float-button`                                                                                   | 未开始 |
| E07 | Menu / Dropdown / Steps / Tabs / Tree / Pagination / Spotlight                                                                 | React/Vue: `#/menu`, `#/dropdown`, `#/steps`, `#/tabs`, `#/tree`, `#/pagination`, `#/spotlight`                                                                                   | 未开始 |
| E08 | Alert / Loading / Progress / Tooltip / Popover / Popconfirm                                                                    | React/Vue: `#/alert`, `#/loading`, `#/progress`, `#/tooltip`, `#/popover`, `#/popconfirm`                                                                                         | 未开始 |
| E09 | Modal / Drawer / Message / Notification / Tour                                                                                 | React/Vue: `#/modal`, `#/drawer`, `#/message`, `#/notification`, `#/tour`                                                                                                         | 未开始 |
| E10 | Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper                                                        | React/Vue: `#/form`, `#/input`, `#/textarea`, `#/input-group`, `#/input-number`, `#/stepper`                                                                                      | 未开始 |
| E11 | Checkbox / Radio / Switch / Slider / Segmented / Rate / ColorSwatch / ColorPicker                                              | React/Vue: `#/checkbox`, `#/radio`, `#/switch`, `#/slider`, `#/segmented`, `#/rate`, `#/color-swatch`, `#/color-picker`                                                           | 未开始 |
| E12 | Select / AutoComplete / Cascader / TreeSelect / Mentions / Transfer                                                            | React/Vue: `#/select`, `#/auto-complete`, `#/cascader`, `#/tree-select`, `#/mentions`, `#/transfer`                                                                               | 未开始 |
| E13 | DatePicker / TimePicker / Calendar / Countdown / CronEditor / NumberKeyboard                                                   | React/Vue: `#/datepicker`, `#/timepicker`, `#/calendar`, `#/countdown`, `#/cron-editor`, `#/number-keyboard`                                                                      | 未开始 |
| E14 | Upload / Signature                                                                                                             | React/Vue: `#/upload`, `#/signature`                                                                                                                                              | 未开始 |
| E15 | Table / Collapse / Timeline                                                                                                    | React/Vue: `#/table`, `#/collapse`, `#/timeline`                                                                                                                                  | 未开始 |
| E16 | VirtualTable / VirtualList / InfiniteScroll                                                                                    | React/Vue: `#/virtual-table`, `#/virtual-list`, `#/infinite-scroll`                                                                                                               | 未开始 |
| E17 | AreaChart / BarChart / LineChart / ScatterChart / chart subcomponents                                                          | React/Vue: `#/area-chart`, `#/bar-chart`, `#/line-chart`, `#/scatter-chart`; also inspect chart pages for ChartAxis/Canvas/Grid/Legend/Series/Tooltip behavior                    | 未开始 |
| E18 | PieChart / DonutChart / RadarChart / GaugeChart / FunnelChart / HeatmapChart / SunburstChart / TreeMapChart / Gantt / OrgChart | React/Vue: `#/pie-chart`, `#/donut-chart`, `#/radar-chart`, `#/gauge-chart`, `#/funnel-chart`, `#/heatmap-chart`, `#/sunburst-chart`, `#/treemap-chart`, `#/gantt`, `#/org-chart` | 未开始 |
| E19 | CodeEditor / MarkdownEditor / RichTextEditor / FileManager / ImageAnnotation / PrintLayout                                     | React/Vue: `#/code-editor`, `#/markdown-editor`, `#/rich-text-editor`, `#/file-manager`, `#/image-annotation`, `#/print-layout`                                                   | 未开始 |
| E20 | ActivityFeed / ChatWindow / CommentThread / DataTableWithToolbar / FormWizard / NotificationCenter / TaskBoard / Kanban        | React/Vue: `#/activity-feed`, `#/chat-window`, `#/comment-thread`, `#/data-table-with-toolbar`, `#/form-wizard`, `#/notification-center`, `#/task-board`, `#/kanban`              | 未开始 |
| E21 | Hooks demos: useDrag / useControlledState / useChartInteraction / useFormController                                            | React/Vue: `#/use-drag`, `#/use-controlled-state`, `#/use-chart-interaction`; `useFormController` 当前没有独立浏览器 demo route，如仍缺失则记录为“缺少可体验 Example”             | 未开始 |

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
