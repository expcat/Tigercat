# Tigercat Example 优化任务清单

<!-- LLM-INDEX
type: example-optimization-task-backlog
scope: R28 用户故事审查结论转化的可执行任务；源码/构建任务在前，Example 仅保留错误/歧义/中文站英文的必要修复
verified-date: 2026-07-01
source: docs/ROADMAP.md R28 review
-->

本文由 R28 的 React/Vue Example 用户故事审查结论转化而来，是后续修复的**唯一任务入口**。本轮已按执行价值重新规划：

- **源码 / 构建任务放在最前**（第一节），Example 只保留必要修复（第二节）。
- Example 仅处理**错误**（示例损坏/行为错误）、**歧义**（示例误导）和**中文站显示英文**；可复制性增强、新增演示、覆盖补全、远程资源替换和示例源码 warning **本轮不处理**（第三节记录，完整 R28 证据见 git history 与 `docs/V2_COMPLETED.md`）。
- 尽量把同根因的简单改动**合并成一个任务**（如 S5/S8 的 aria 本地化、EX16 的示例层中文文案）。

## 任务执行方式

- **取任务顺序**：先做第一节源码/构建任务，再做第二节 Example 任务；同节内 P0 → P1 → P2。
- **任务类型**：`源码`（组件源码/public API/i18n，需补 focused tests + `api:validate`）、`构建`（example 构建输出）、`Example`（只改 `examples/**`、生成器事实源或文档）。
- **交给 Agent**：给出「任务 ID + 组件 + 动作 + route + 验收」。Agent 只在标 `源码`/`构建` 时改组件源码或构建，其余一律在 Example 层完成。
- **完成回写**：在对应任务追加完成状态、验证命令和剩余风险，并同步 `docs/ROADMAP.md`（R29+）。
- 涉及 generated refs 时改事实源或生成器后重生成，勿手改 `skills/tigercat/references/*`。

## 验证要求

- 修复前先区分 Example/文档缺口和组件能力缺口，避免把说明不足误判为 API 不足。
- **浏览器复查必须用 `locale: 'zh-CN'` 上下文**（headless Chromium 默认 `en-US`，会把默认中文站误审成英文而误报 i18n/a11y）。
- `Example` 改动：`npx -y pnpm@11.9.0 example:sources:check`；调整页面结构再运行 `npx -y pnpm@11.9.0 example:build`。
- `源码`/`构建` 改动：补对应 React/Vue focused tests、`npx -y pnpm@11.9.0 api:validate`，并浏览器复查对应 route。
- 只整理本文：`npx -y pnpm@11.9.0 exec prettier --check docs/EXAMPLE_USER_STORY_REQUIREMENTS.md`、`git diff --check -- docs/EXAMPLE_USER_STORY_REQUIREMENTS.md`，并扫描冲突标记。

## 一、源码 / 构建修改任务（优先）

- **S1** `P1` `构建/源码` — 修复 Row/Col 响应式 `span`/`order`/`offset` 类在 example build 未生效（CSS 变量已写入 DOM，md/lg computed 未覆盖基础值）。验收：桌面 `#/grid` 可见 md/lg 分栏与排序；补 Row/Col focused tests。（源自 E04-1）
- **S2** `P1` `源码` — 修复 React Input/FormItem 内部校验 props（`errorMessage`/`_shakeTrigger`）透传到 DOM 触发的 console error。验收：`#/input`/`#/form` 无 console error；补 focused test。（E10-3）
- **S3** `P1` `源码` — ColorPicker 触发器/预设色块键盘可用，并让 `showAlpha`/`format` 按示例声明实现（无法实现则从示例移除并改文案）。验收：可 Tab/Enter 操作、声明=实际行为；补 focused a11y test（`#/color-picker`）。（E11-1/E11-2）
- **S4** `P1` `源码` — 修复三位数/货币图表 y 轴刻度标签被裁剪（默认 padding）。验收：`#/bar-chart`/`#/line-chart`/`#/area-chart` 轴标签完整；补图表 focused test。（E17-1）
- **S5** `P1` `源码` — 组件硬编码英文 aria/文案本地化（示例层无法覆写，统一补 `locale`/可覆写入口）。覆盖：Message/Notification 关闭 aria（容器经 `createRoot` 脱离 ConfigProvider）、Tabs `Add tab`/`Close …`、Tree checkbox `Select …`、Rate `Rating`/`N stars`、Carousel `Image carousel`/`Slide N of M`/dots/arrows。验收：默认中文站上述控件显示中文；补对应 React/Vue focused a11y tests + `api:validate`。（E09-2/E07-1/E07-2/E11-5/E05-5）
- **S6** `P1` `源码` — DatePicker 默认 placeholder/toggle/clear 本地化（已传 `locale` 仍显英文）。验收：传 `locale` 后 `#/datepicker` 默认文案中文；补 focused test。（E13-1）
- **S7** `P1` `源码` — MarkdownEditor / RichTextEditor / CronEditor 增加 `locale`/`labels`（字段、预设、错误消息、aria）。验收：中文界面；补 focused tests + `api:validate`（`#/markdown-editor` `#/rich-text-editor` `#/cron-editor`）。（E19-1/E13-2）
- **S8** `P2` `源码` — Cascader/TreeSelect 清除 aria、Transfer 移动/搜索 aria 与默认标题、ScatterChart `Point N`/`Chart legend` 本地化。验收：默认中文站显示中文；补 focused a11y tests。（E12-3/E17-3）
- **S9** `P2` `源码` — 修复 PrintLayout `showPageBreaks`（React DOM 泄漏 + 两端无效 prop）。验收：控制台无告警、prop 生效（`#/print-layout`）；补 focused test。（E19-2）
- **S10** `P2` `源码/Example` — 高层图表暴露/透传 `responsive` 并补 `title`/`desc` 可访问名（评估柱/点 aria 含数值）。验收：移动端自适应、图表有可访问名。（E17-2/E17-4）

**执行记录（2026-07-02）**：S1-S10 源码/构建任务已完成，保持现有 React/Vue 组件结构与使用方式，仅补齐缺失的 public props/types、locale labels、a11y 文案、必要透传与 focused tests。已运行 `types:check`、`api:validate`、40 个相关 focused test 文件（999 tests）、`example:sources:check`、`example:build`；API baseline 与 skill API refs 已按新增 public API 重生成。剩余风险：`api:baseline:check` / `docs:api:check` 在未提交前会因这些生成产物相对 Git HEAD 存在预期 diff 而失败。

## 二、Example 必要修改（错误 / 歧义 / 中文站英文）

### 错误（示例损坏或行为错误）

- **EX1** `P0` `Example` — ImageCropper 示例图改仓库内本地 fixture/data URL 并补加载失败态，替换卡 loading 的 `picsum.photos`。验收：裁剪器可拖拽/键盘调整/输出，无 `Image not loaded`（`#/image-cropper`）。（E03-1）
- **EX2** `P1` `Example` — 修复 Vue Splitter 示例空白（命名 slot 改默认 slot），并移除示例中不存在的 `collapsible`/`min-sizes`。验收：Vue `#/splitter` 有 pane/separator，与 React 一致、不宣传不存在能力。（E05-1）
- **EX3** `P1` `Example` — 修正 Affix 内部滚动容器示例，使「滚动触发固定」可体验。验收：滚动后真实固定（`#/affix`）。（E06-1）
- **EX4** `P1` `Example` — 修复 Anchor 指向不存在 DOM id 的链接（嵌套锚点、`#demo-ink`）并消除 React 渲染期更新警告。验收：锚点可跳转、无 console warning（`#/anchor`）。（E06-2）
- **EX5** `P1` `Example` — 修复/统一 `#/input-number` 入口不一致（声明 route 打开后空白/404）。验收：route 一致可打开。（E10-1）
- **EX6** `P1` `Example` — Vue Form 示例 `Button type="submit"` 改 `htmlType`/`html-type`，恢复提交校验。验收：Vue 提交触发校验、与 React 一致（`#/form`）。（E10-2）
- **EX7** `P1` `Example` — 修正 Upload「文件数量限制」示例的错误告警文案。验收：文案正确（`#/upload`）。（E14-1）
- **EX8** `P1` `Example` — 修复 Heatmap 示例全 0（示例数据改 label 字符串）。验收：热力值非全 0（`#/heatmap-chart`）；如兑现类型注释的数字索引能力则另开源码任务。（E18-1）
- **EX9** `P1` `Example` — 修复 Vue TaskBoard「基础用法」新增卡片无效（改用 `@card-add` 事件）。验收：Vue 新增卡片生效、与 React 一致（`#/task-board`）。（E20-1；拖拽为自定义指针 DnD，复查以结构+新增卡片为主）
- **EX10** `P1` `Example` — VirtualTable 固定列示例补 `rowKey="id"` 并修正 selected rows 与业务 ID 的对应关系。验收：选择与 ID 一致（`#/virtual-table`）。（E16-1）
- **EX11** `P1` `Example` — Vue Transfer「搜索与标题」改用 `source-title`/`target-title`，修复自定义标题失效与 React/Vue 不一致。验收：Vue 自定义标题生效（`#/transfer`）。（E12-1）

### 歧义（示例误导）

- **EX12** `P1` `Example` — Avatar「团队成员」改用 `AvatarGroup max`，替换手写 `Avatar text="+5"`（实际只渲染 `+`）。验收：溢出计数正确、含 `aria-label`（`#/avatar`）。（E02-1）
- **EX13** `P1` `Example` — 修正 Splitter `sizes` 单位文案，`30px/70px` 勿写成 `30%/70%`（若改支持百分比则另开源码任务）。验收：文案与像素行为一致（`#/splitter`）。（E05-2）
- **EX14** `P2` `Example` — Watermark 补图片水印 section，或将标题「文字和图片」收窄为当前文字能力。验收：说明与示例一致（`#/watermark`）。（E02-4）
- **EX15** `P2` `Example` — Descriptions 多列示例补响应式 `column`，修复窄视口字段截断。验收：窄视口字段可完整阅读（`#/descriptions`）。（E05-3）

### 中文站英文 / 缺失可访问名（示例层可覆写，合并处理）

- **EX16** `P1` `Example` — 用现有 props/locale 修正默认中文站英文/缺失的默认文案与可访问名，合并一次改完：
  - 示例站补中文 `ConfigProvider`（一次性修正 Select「Select an option」「Search...」等 locale 驱动文案）。（E12-2）
  - Alert 传 `closeAriaLabel`、Progress 传 `aria-label`。（E08-1/E08-2）
  - Modal/Drawer 补 `getDemoTigerLocale` 关闭文案。（E09-1）
  - QRCode 传 `locale` 并绑定刷新回调（过期态刷新控件 button 语义如需改则转源码）。（E02-2）
  - Signature 传中文 `ariaLabel`/`clearText`；Stepper/InputNumber 增减按钮传中文 `aria-label`；NumberKeyboard 传中文 `deleteText`；InfiniteScroll 传中文 `loadingText`/`endText`。（E14-4/E10-4/E13-3/E16-3）
  - Switch/Slider 补业务化中文 `aria-label`（Slider 范围 thumb 默认英文）；Loading 变体/尺寸/颜色说明文案改中文。（E11-3/E11-4/E08-4）
  - Skeleton 加载完成示例文案改中文；Table 列 `title`/筛选 placeholder 改中文；Timeline 状态 Tag 中文映射。（E05-6/E15-1/E15-4）
    验收：zh-CN 复查上述 route 均无英文/缺失的默认文案与可访问名。

## 三、本轮不处理（记录，避免遗漏）

以下 R28 findings 属可复制性增强/新增演示/覆盖补全/远程资源替换/示例源码 warning，非错误或歧义，本轮不做；如后续需要再从此处提任务。完整证据见 git history 与 `docs/V2_COMPLETED.md`。

- **业务反馈增强**：Empty/Result 按钮、List 可点击项、Card 操作、Popconfirm、Dropdown、FloatButton、ScrollSpy 点击反馈、Form/Input/Textarea 业务反馈、Upload 校验拒绝与自定义上传状态回显、Notification `alert` 替换、Table 操作列反馈、VirtualTable 选择回显、Gantt/OrgChart 选择回显（E02-3/E05-4/E07-3/E06-6/E06-5/E08-3/E10-6/E14-2/E14-3/E09-3/E15-3/E16-2/E18-3）。
- **新增场景/演示**：Statistic 趋势、Slider 区间、Calendar 日程、Countdown 重置、TimePicker 班次、Breadcrumb `maxItems`、Spotlight 快捷键、InputGroup `compact`、CodeEditor `disabled`、PrintLayout 打印预览/尺寸、Menu/Tree 状态面板、Pagination 控件拆分、CropUpload fixture 体验入口、弹层 `open` 状态面板、四选择页 section 与回显、Signature 尺寸/props 覆盖、VirtualTable 移动端单列、Message/Notification 按钮 variant、FileManager 文案统一，以及 E21 hooks 新增 route 与示例扩展（含 `useFormController` 新页）（E02-5/E11-7/E13-4/E13-5/E06-3/E07-6/E10-5/E19-6/E19-3/E07-5/E07-4/E03-2/E08-5/E12-4/E14-5/E16-5/E09-4/E19-5/E21-\*）。
- **能力覆盖补全**：Divider `gradient`、ImageViewer 受控索引、VirtualList 动态高度、图表移动端说明、Grid `wrap=false` 滚动提示、径向/层级图 `title`/`desc` a11y、Pie/Donut 回显、Area/Line 悬停一致性、Layout Shell 联动（E04-3/E03-5/E16-4/E18-2/E04-4/E18-4/E18-5/E17-5/E04-5）。
- **远程图片改本地 fixture**：Card 封面、ImageAnnotation、ActivityFeed/ChatWindow/CommentThread 头像（E05-7/E19-4/E20-3）。
- **示例源码 raw-source / 片段 / warning**：Code `onCopy` 短 fixture、Table/Collapse/Timeline dead-code 常量、E21 hooks 示例 warning、DataTableWithToolbar 状态隔离（E01-2/E15-2/E21-2/E20-2）。
- **纯 a11y 命名细化（默认已中文，仅想更具体）**：Tag `closeAriaLabel`、CropUpload 触发器名、Shell 折叠按钮、BackTop 按钮、CommentThread 回复按钮、AutoComplete `aria-autocomplete`/TreeSelect 语义、ColorSwatch/Kanban 文案（E01-1/E03-3/E03-4/E04-2/E06-4/E20-4/E12-5/E11-6/E20-5）。
- **Badge 零值业务说明**（E01-3）。
