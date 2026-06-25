# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: future planned tasks only
verified-date: 2026-06-24
source: current repository state; v1.4.0 has been released
-->

本文只记录之后计划要完成的任务。已完成内容、发布记录、长期规则和命令说明不写入本文件。

## 后续计划

### 最新一轮全代码扫描与公共内容整理

本轮扫描覆盖版本库跟踪的源码、测试、示例、脚本、文档与 skill references；不扫描 `node_modules`、`dist`、coverage、Playwright 报告等生成或依赖产物。当前扫描口径约 1429 个被跟踪代码/文档文件，重点覆盖 `packages/core`、`packages/react`、`packages/vue`、`packages/cli`、`tests`、`examples`、`scripts`、`benchmarks`、`e2e`、`docs`、`skills/tigercat`。

扫描目标是分批发现并记录 Bug、冗余、重复实现、无用代码、低效路径、过度设计、复杂逻辑，以及公共内容该拆未拆或该合未合的问题。每个扫描任务只产出可验证的发现和修复建议，不在扫描阶段直接重构公共 API。

#### 任务 A：公共 API、导出面与文档生成链路扫描 ✅ 已扫描（2026-06-24）

> 扫描结果见 [ROADMAP_CHECK.md](ROADMAP_CHECK.md)（任务 A 节）；发现与修复建议记录在该文件，本表仅留计划与状态。

- 范围：`packages/*/src/index*`、`packages/*/package.json`、`api-reports`、`scripts/check-public-types.mjs`、`scripts/validate-api.mjs`、`scripts/generate-api-docs.mjs`、`skills/tigercat/references`。
- 目标：找缺失/多余导出、React/Vue 公共组件不对称、废弃 API 残留、generated references 与生成器规则漂移。
- 公共拆合判断：公开类型、Props、事件命名、受控量 parity 优先沉到 `core` 类型/工具；框架生命周期与渲染细节保留在 React/Vue 包内。

#### 任务 B：Core 工具、类型、主题、i18n、token 扫描

- 范围：`packages/core/src/types`、`utils`、`themes`、`theme-runtime`、`tokens`、Tailwind entry。
- 目标：找重复 helper、过宽工具模块、历史兼容别名、无消费者工具、低效遍历/缓存、locale 与 datepicker locale 重复。
- 公共拆合判断：两个框架共同依赖且无框架运行时依赖的逻辑合入 core；只服务单组件且无复用价值的工具回收到组件局部。

#### 任务 C：组件分组扫描

- 范围：以 `skills/tigercat/references/component-index.md` 为组件清单来源，按相近用途、共享 core helper、共享测试/示例/文档入口分组扫描。
- 执行单位：一个组件组一次扫描；Table、DataTableWithToolbar、VirtualTable、Menu、Form、Select、DatePicker、TimePicker、Upload 等体量较大的组件单独成组或只带强关联子组件。
- 统一检查：每组只打开本组相关的 core 类型/工具、React 实现、Vue 实现、React/Vue 测试、示例页面、generated references，并检查是否应提取、合并或拆分公共方法。
- 固定结论格式：每组扫描结果统一记录 `发现问题`、`公共内容决策`、`建议修复顺序`、`目标验证命令`，方便后续对比和执行。
- 公共拆合判断：纯逻辑和跨框架一致性优先沉到 core；框架生命周期、DOM ref、render/template 细节留在框架层。

##### C01 基础动作与文本

- 组件：Button、ButtonGroup、Link、Text、Code、Icon、Tag、Badge。
- 重点：尺寸/variant/color 命名、class 生成、aria 属性、图标渲染、轻量组件是否有重复样板。

##### C02 头像与状态展示

- 组件：Avatar、AvatarGroup、Empty、Result、Statistic、QRCode、Watermark。
- 重点：占位/回退内容、状态语义、重复布局 class、SVG/Canvas/水印计算逻辑是否应沉到 core。

##### C03 布局骨架

- 组件：Layout、Header、Sidebar、Content、Footer、Container、Row、Col、Space、Divider。
- 重点：布局 class 组合、响应式约束、Grid/Space 公共计算、框架实现是否保持对称。

##### C04 内容容器

- 组件：Card、List、Descriptions、Skeleton、Collapse、CollapsePanel、Timeline。
- 重点：容器 variant、列表/描述项结构、折叠状态、Skeleton 重复渲染逻辑、Timeline item 内容类型。

##### C05 导航轻量组

- 组件：Affix、Anchor、AnchorLink、BackTop、Breadcrumb、BreadcrumbItem、ScrollSpy、FloatButton、FloatButtonGroup。
- 重点：滚动监听、active 计算、固定定位、键盘/aria、导航 item 公共结构。

##### C06 Steps/Tabs

- 组件：Steps、StepsItem、Tabs、TabPane。
- 重点：上下文、受控状态、键盘导航、禁用态、面板挂载策略是否可共享。

##### C07 Menu 单组

- 组件：Menu、MenuItem、MenuItemGroup、SubMenu。
- 重点：体量较大，单独检查层级状态、展开/选中、键盘导航、首字母回退、上下文拆分。

##### C08 Overlay 触发器

- 组件：Dropdown、DropdownMenu、DropdownItem、Popover、Popconfirm、Tooltip。
- 重点：floating/overlay/focus 公共逻辑、触发方式、关闭时机、定位更新、事件穿透。

##### C09 Feedback 容器

- 组件：Modal、Drawer、Loading、Progress、Tour。
- 重点：open API、portal、scroll lock、focus restore、遮罩/层级、进度状态。

##### C10 消息通知

- 组件：Message、Notification、NotificationCenter。
- 重点：全局容器、重复节点、队列清理、定时器、严格模式重复渲染。

##### C11 Form 单组

- 组件：Form、FormItem、useFormController。
- 重点：体量较大，单独检查表单上下文、校验、依赖字段、受控/非受控、错误状态公共逻辑。

##### C12 输入基础组

- 组件：Input、Textarea、InputGroup、InputGroupAddon、InputNumber、NumberKeyboard、Mentions。
- 重点：输入展示/解析、自动尺寸、组合输入结构、数字边界、Mentions 导航和过滤公共逻辑。

##### C13 选择/切换基础组

- 组件：Checkbox、CheckboxGroup、Radio、RadioGroup、Switch、Slider、Stepper、Rate、Segmented。
- 重点：受控状态、键盘交互、禁用态、组选项、滑动/步进公共计算。

##### C14 Select 单组

- 组件：Select、AutoComplete。
- 重点：option state、过滤、键盘导航、popup、受控量 parity、与 TreeSelect/Cascader 的可共享边界。

##### C15 层级选择组

- 组件：Tree、TreeSelect、Cascader、Transfer。
- 重点：tree-utils、展开/选中/过滤、层级数据扁平化、移动项状态、虚拟化接入点。

##### C16 日期组

- 组件：DatePicker、Calendar。
- 重点：DatePicker 体量较大，检查 date-utils、datepicker locale、键盘导航、范围/面板状态。

##### C17 时间组

- 组件：TimePicker、Countdown、CronEditor。
- 重点：TimePicker 体量较大，检查 timepicker-utils、格式/解析、步进、倒计时和 cron 纯逻辑。

##### C18 Upload 单组

- 组件：Upload、FileManager、Signature。
- 重点：Upload 体量较大，检查文件状态、校验、拖放、可访问性、文件管理和签名输入的复用边界。

##### C19 图片展示组

- 组件：Image、ImagePreview、ImageGroup、ImageViewer。
- 重点：预览状态、受控量、手势、加载/错误态、图片组上下文。

##### C20 图片编辑组

- 组件：ImageCropper、ImageAnnotation、CropUpload。
- 重点：裁剪/标注纯逻辑是否可沉到 core、上传接入、坐标计算、撤销/重置。

##### C21 Table 单组

- 组件：Table。
- 重点：体量最大，单独扫描 fixed columns、pagination、selection、resize、export、i18n、card/virtual 推荐边界。

##### C22 DataTableWithToolbar 单组

- 组件：DataTableWithToolbar、TableToolbar。
- 重点：toolbar/filter/card mode、列隐藏/锁定、Table 共享边界、过滤值更新是否双端一致。

##### C23 VirtualTable 单组

- 组件：VirtualTable。
- 重点：虚拟滚动、固定列、可访问性、Table 复用关系、滚动性能。

##### C24 虚拟列表组

- 组件：VirtualList、InfiniteScroll。
- 重点：viewport、observer、scroll 性能、占位测量、加载触发条件。

##### C25 图表基础组

- 组件：ChartCanvas、ChartAxis、ChartGrid、ChartSeries、ChartLegend、ChartTooltip。
- 重点：chart shared/utils、坐标系、tooltip、legend、SVG 属性公共逻辑。

##### C26 笛卡尔图表组

- 组件：LineChart、AreaChart、BarChart、ScatterChart。
- 重点：scale、path、tooltip、降采样、点/线/柱复用边界。

##### C27 径向图表组

- 组件：PieChart、DonutChart、RadarChart、GaugeChart。
- 重点：角度计算、label 布局、重复 SVG 逻辑、空值和极值。

##### C28 专用图表组

- 组件：FunnelChart、HeatmapChart、TreeMapChart、SunburstChart、OrgChart、Gantt。
- 重点：专用布局算法、层级/时间轴计算、颜色映射、复杂数据边界。

##### C29 复合内容组

- 组件：ActivityFeed、ChatWindow、CommentThread。
- 重点：Avatar/Input/Textarea/Button/VirtualList 等依赖复用、列表性能、空态、交互回调。

##### C30 工作流复合组

- 组件：FormWizard、TaskBoard、Kanban。
- 重点：Steps、ConfigProvider、drag/task-board utilities、Kanban 与 TaskBoard 的薄封装边界。

##### C31 高级编辑器组

- 组件：CodeEditor、RichTextEditor、MarkdownEditor。
- 重点：引擎抽象、输入同步、内容转换、示例复杂度、无第三方运行时边界。

##### C32 交互能力组

- 组件：Drag、Carousel、Resizable、Splitter。
- 重点：pointer/keyboard/resize helper、拖拽状态、尺寸约束、动画/过渡公共逻辑。

#### 任务 F：测试、示例、E2E、benchmark 扫描

- 范围：`tests/core`、`tests/react`、`tests/vue`、`tests/utils`、`examples/example/*`、`examples/nextjs`、`examples/nuxt`、`e2e`、`benchmarks`。
- 目标：找失效测试、弱断言、重复测试样板、示例使用废弃 API、示例与公开 API 不一致、benchmark 覆盖缺口。
- 公共拆合判断：跨框架测试 fixture/helper 合并到 `tests/utils`；框架特有 render helper 保留独立。

#### 任务 G：CLI、脚本、发布与维护自动化扫描

- 范围：`packages/cli/src`、`scripts/*.mjs`、根 `package.json` scripts、release/check/publish/setup 工具。
- 目标：找跨平台问题、重复文件遍历、硬编码路径、错误输出不清晰、与 README/scripts 文档不一致的命令。
- 公共拆合判断：通用终端输出、pnpm 执行、walk/collectFiles 等脚本 helper 合并；一次性发布规则保持在对应脚本内。

#### 任务 H：最终公共内容拆分/合并决策汇总

- 范围：汇总 A-G 发现。
- 目标：形成“合并到 core / 保持框架分离 / 拆出局部 helper / 删除或废弃 / 延后”的决策表。
- 公共 API 变更默认策略：不直接删除公开内容；需要删除时先标记 deprecated、补 migration、补 changeset，并通过 API baseline 检查。

#### 验证计划

- 每个扫描任务完成后至少运行对应轻量门禁：`pnpm api:validate`、`pnpm types:check`、相关 `vitest` 目标、必要时 `pnpm docs:api:check`。
- 涉及示例、SSR、发布或公共导出时追加：`pnpm example:build`、`pnpm quality:ssr`、`pnpm api:baseline:check`。
- 整轮 Roadmap 收尾门禁：`pnpm quality:quick`、`pnpm test:validate`、`pnpm docs:api:check`、`pnpm api:baseline:check`、`git diff --check`。
- 若扫描只更新 Roadmap 文档，不要求跑完整 `pnpm quality:release`，也不运行 `pnpm docs:api`。
- 后续执行组件组扫描时，按组选择目标验证：相关 `vitest` 文件、`pnpm api:validate`、`pnpm types:check`；涉及示例或 public surface 时追加 `pnpm example:build`、`pnpm docs:api:check` 或 `pnpm api:baseline:check`。

#### 执行假设

- 本轮先规划并记录扫描任务，不直接实施重构或修复。
- `docs/ROADMAP.md` 继续只记录未来计划；已完成扫描结果和发布记录不写入本文件。
- `skills/tigercat/references/*` 视为生成结果；若发现文档问题，先改 `scripts/generate-api-docs.mjs` 或源码注释/类型来源，再生成。
- “全代码”指版本库跟踪的源码、测试、示例、脚本和文档，不包括依赖、构建产物、coverage 和报告目录。
- 组件分组以当前 `component-index.md` 和源码体量为准；后续新增组件时追加到最相近组，过大则单独成组。
- 每个组件组的扫描结果必须能独立阅读和验证，避免一次加载全库造成 token 消耗过大。
