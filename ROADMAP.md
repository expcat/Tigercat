# Tigercat 开发路线图

本文档列出了 Tigercat UI 组件库的所有计划组件及其开发进度。

## v0.5.0 架构筑基 (Architecture Foundation)

| 阶段     | 内容                                         | 状态 |
| -------- | -------------------------------------------- | ---- |
| Phase 1  | Core 类型强化 (generics/events/slots)        | ✅   |
| Phase 2  | Design Token 系统                            | ✅   |
| Phase 3  | Props 命名统一 (visible→open, type→htmlType) | ✅   |
| Phase 4A | 组件增强: Button/Input/Select/Form           | ✅   |
| Phase 4B | 组件增强: Table/Modal/Drawer/DatePicker/Tree | ✅   |
| Phase 4C | 组件增强: Card/AvatarGroup/Alert/Tabs        | ✅   |
| Phase 5  | 动画过渡系统 (transition presets)            | ✅   |
| Phase 6  | a11y 首轮 (Dropdown/Select/Input)            | ✅   |
| Phase 7  | 测试覆盖率 & 文档收尾                        | ✅   |

新增组件: `ButtonGroup`, `AvatarGroup`
测试覆盖率: 81%+ (3321 tests)
详见 [MIGRATION_v0.5.0.md](MIGRATION_v0.5.0.md)

## v0.6.0 高级表单与数据组件 (Advanced Form & Data)

| 阶段    | 内容                                                    | 状态 |
| ------- | ------------------------------------------------------- | ---- |
| Phase 1 | 新增 P0 组件: Cascader/TreeSelect/AutoComplete/Transfer | ✅   |
| Phase 2 | 新增 P1 组件: ColorPicker/Rate/VirtualList/Segmented    | ✅   |
| Phase 3 | 新增 P2 组件: Calendar/Statistic/Mentions/QRCode        | ✅   |
| Phase 4 | Table 增强: 虚拟滚动/行编辑/高级筛选/分组/导出          | ✅   |
| Phase 5 | Form 增强: 动态字段/异步校验/字段依赖/撤销重做          | ✅   |
| Phase 6 | 现有组件增强: Select/DatePicker/Tree/Tabs/Menu 等       | ✅   |
| Phase 7 | i18n 扩展: 8 语言 (zh-CN/en-US/zh-TW/ja/ko/th/vi/id)    | ✅   |

新增组件: `Cascader`, `TreeSelect`, `AutoComplete`, `Transfer`, `ColorPicker`, `Rate`, `VirtualList`, `Segmented`, `Calendar`, `Statistic`, `Mentions`, `QRCode`, `Stepper`, `Collapse`, `Carousel`

## v0.7.0 视觉升级与主题系统 (Visual Upgrade & Theme System)

| 阶段    | 内容                                                        | 状态 |
| ------- | ----------------------------------------------------------- | ---- |
| Phase 1 | 5 套预设主题: Default/Vibrant/Professional/Minimal/Natural  | ✅   |
| Phase 2 | 主题管理器 + 暗色模式 (prefers-color-scheme)                | ✅   |
| Phase 3 | 新增视觉组件: Result/Empty/Watermark/Tour/FloatButton/Affix | ✅   |
| Phase 4 | 新增图表: TreeMap/Heatmap/Funnel/Gauge/Sunburst             | ✅   |
| Phase 5 | 20-25 组件 WCAG AA 视觉升级                                 | ✅   |

新增组件: `Result`, `Empty`, `Watermark`, `Tour`, `FloatButton`, `Affix`
新增图表: `TreeMapChart`, `HeatmapChart`, `FunnelChart`, `GaugeChart`, `SunburstChart`

## v0.8.0 高级交互与业务组件 (Advanced Interaction & Business)

| 阶段    | 内容                                             | 状态 |
| ------- | ------------------------------------------------ | ---- |
| Phase 1 | Headless 拖拽系统 (core/utils + Vue/React 封装)  | ✅   |
| Phase 2 | P0 组件: Splitter/Resizable/CodeEditor/RichText  | ✅   |
| Phase 3 | P1 组件: Kanban/VirtualTable/InfiniteScroll      | ✅   |
| Phase 4 | P2 组件: FileManager + 拖拽增强现有组件          | ✅   |
| Phase 5 | 性能优化: Bundle Size sideEffects + tree-shaking | ✅   |
| Phase 6 | CLI 脚手架: @expcat/tigercat-cli                 | ⬜   |
| Phase 7 | 测试覆盖率 & a11y 合规                           | ✅   |
| Phase 8 | 文档 & Skills 更新                               | ✅   |

详见 [docs/roadmap/04-v0.8.0-SPEC.md](docs/roadmap/04-v0.8.0-SPEC.md)

## 进度说明

- ⬜ 未开始
- ✅ 已完成

## 组件列表

### 基础组件 (Basic Components)

| 组件     | Component    | Vue | React | 文档 | 测试 |
| -------- | ------------ | --- | ----- | ---- | ---- |
| 按钮     | Button       | ✅  | ✅    | ✅   | ✅   |
| 链接     | Link         | ✅  | ✅    | ✅   | ✅   |
| 图标     | Icon         | ✅  | ✅    | ✅   | ✅   |
| 文本     | Text         | ✅  | ✅    | ✅   | ✅   |
| 图片     | Image        | ✅  | ✅    | ✅   | ✅   |
| 图片预览 | ImagePreview | ✅  | ✅    | ✅   | ✅   |
| 图片组   | ImageGroup   | ✅  | ✅    | ✅   | ✅   |
| 图片裁剪 | ImageCropper | ✅  | ✅    | ✅   | ✅   |

### 表单组件 (Form Components)

| 组件       | Component   | Vue | React | 文档 | 测试 |
| ---------- | ----------- | --- | ----- | ---- | ---- |
| 表单       | Form        | ✅  | ✅    | ✅   | ✅   |
| 输入框     | Input       | ✅  | ✅    | ✅   | ✅   |
| 数字输入框 | InputNumber | ✅  | ✅    | ✅   | ✅   |
| 文本域     | Textarea    | ✅  | ✅    | ✅   | ✅   |
| 单选框     | Radio       | ✅  | ✅    | ✅   | ✅   |
| 复选框     | Checkbox    | ✅  | ✅    | ✅   | ✅   |
| 选择器     | Select      | ✅  | ✅    | ✅   | ✅   |
| 开关       | Switch      | ✅  | ✅    | ✅   | ✅   |
| 滑块       | Slider      | ✅  | ✅    | ✅   | ✅   |
| 日期选择器 | DatePicker  | ✅  | ✅    | ✅   | ✅   |
| 时间选择器 | TimePicker  | ✅  | ✅    | ✅   | ✅   |
| 上传       | Upload      | ✅  | ✅    | ✅   | ✅   |

### 数据展示组件 (Data Display Components)

| 组件     | Component    | Vue | React | 文档 | 测试 |
| -------- | ------------ | --- | ----- | ---- | ---- |
| 表格     | Table        | ✅  | ✅    | ✅   | ✅   |
| 标签     | Tag          | ✅  | ✅    | ✅   | ✅   |
| 徽章     | Badge        | ✅  | ✅    | ✅   | ✅   |
| 卡片     | Card         | ✅  | ✅    | ✅   | ✅   |
| 头像     | Avatar       | ✅  | ✅    | ✅   | ✅   |
| 列表     | List         | ✅  | ✅    | ✅   | ✅   |
| 描述列表 | Descriptions | ✅  | ✅    | ✅   | ✅   |
| 时间线   | Timeline     | ✅  | ✅    | ✅   | ✅   |
| 树形控件 | Tree         | ✅  | ✅    | ✅   | ✅   |
| 进度条   | Progress     | ✅  | ✅    | ✅   | ✅   |
| 骨架屏   | Skeleton     | ✅  | ✅    | ✅   | ✅   |

### 导航组件 (Navigation Components)

| 组件     | Component  | Vue | React | 文档 | 测试 |
| -------- | ---------- | --- | ----- | ---- | ---- |
| 菜单     | Menu       | ✅  | ✅    | ✅   | ✅   |
| 标签页   | Tabs       | ✅  | ✅    | ✅   | ✅   |
| 面包屑   | Breadcrumb | ✅  | ✅    | ✅   | ✅   |
| 下拉菜单 | Dropdown   | ✅  | ✅    | ✅   | ✅   |
| 分页     | Pagination | ✅  | ✅    | ✅   | ✅   |
| 步骤条   | Steps      | ✅  | ✅    | ✅   | ✅   |

### 反馈组件 (Feedback Components)

| 组件     | Component       | Vue | React | 文档 | 测试 |
| -------- | --------------- | --- | ----- | ---- | ---- |
| 警告提示 | Alert           | ✅  | ✅    | ✅   | ✅   |
| 对话框   | Modal/Dialog    | ✅  | ✅    | ✅   | ✅   |
| 抽屉     | Drawer          | ✅  | ✅    | ✅   | ✅   |
| 消息提示 | Message         | ✅  | ✅    | ✅   | ✅   |
| 通知     | Notification    | ✅  | ✅    | ✅   | ✅   |
| 加载中   | Loading/Spinner | ✅  | ✅    | ✅   | ✅   |
| 弹出确认 | Popconfirm      | ✅  | ✅    | ✅   | ✅   |
| 气泡提示 | Tooltip         | ✅  | ✅    | ✅   | ✅   |
| 气泡卡片 | Popover         | ✅  | ✅    | ✅   | ✅   |

### 布局组件 (Layout Components)

| 组件   | Component | Vue | React | 文档 | 测试 |
| ------ | --------- | --- | ----- | ---- | ---- |
| 容器   | Container | ✅  | ✅    | ✅   | ✅   |
| 栅格   | Grid      | ✅  | ✅    | ✅   | ✅   |
| 布局   | Layout    | ✅  | ✅    | ✅   | ✅   |
| 分割线 | Divider   | ✅  | ✅    | ✅   | ✅   |
| 空间   | Space     | ✅  | ✅    | ✅   | ✅   |

### 其他组件 (Other Components)

| 组件     | Component | Vue | React | 文档 | 测试 |
| -------- | --------- | --- | ----- | ---- | ---- |
| 代码块   | Code      | ✅  | ✅    | ✅   | ✅   |
| 折叠面板 | Collapse  | ✅  | ✅    | ✅   | ✅   |
| 轮播图   | Carousel  | ✅  | ✅    | ✅   | ✅   |
| 回到顶部 | BackTop   | ✅  | ✅    | ✅   | ✅   |
| 锚点     | Anchor    | ✅  | ✅    | ✅   | ✅   |

### 组合组件 (Composite Components)

| 组件       | Component            | 功能                     | Vue | React | 文档 | 测试 |
| ---------- | -------------------- | ------------------------ | --- | ----- | ---- | ---- |
| 聊天窗口   | ChatWindow           | 消息列表 + 输入区 + 状态 | ✅  | ✅    | ✅   | ✅   |
| 评论线程   | CommentThread        | 递归回复 + 操作栏        | ✅  | ✅    | ✅   | ✅   |
| 通知中心   | NotificationCenter   | 分组/已读管理            | ✅  | ✅    | ✅   | ✅   |
| 表单向导   | FormWizard           | 多步表单流               | ✅  | ✅    | ✅   | ✅   |
| 表格工具栏 | DataTableWithToolbar | 搜索/筛选/批量操作       | ✅  | ✅    | ✅   | ✅   |
| 活动动态流 | ActivityFeed         | 动态/审计时间线          | ✅  | ✅    | ✅   | ✅   |
| 裁剪上传   | CropUpload           | 图片选择 + 裁剪 + 输出   | ✅  | ✅    | ✅   | ✅   |
| 任务看板   | TaskBoard            | 拖拽看板 + 列管理        | ✅  | ✅    | ✅   | ✅   |

### 数据可视化组件 (Chart Components)

| 组件   | Component    | Vue | React | 文档 | 测试 |
| ------ | ------------ | --- | ----- | ---- | ---- |
| 画布   | ChartCanvas  | ✅  | ✅    | ✅   | ✅   |
| 坐标轴 | ChartAxis    | ✅  | ✅    | ✅   | ✅   |
| 网格   | ChartGrid    | ✅  | ✅    | ✅   | ✅   |
| 图例   | ChartLegend  | ✅  | ✅    | ✅   | ✅   |
| 系列   | ChartSeries  | ✅  | ✅    | ✅   | ✅   |
| 提示框 | ChartTooltip | ✅  | ✅    | ✅   | ✅   |
| 柱状图 | BarChart     | ✅  | ✅    | ✅   | ✅   |
| 折线图 | LineChart    | ✅  | ✅    | ✅   | ✅   |
| 面积图 | AreaChart    | ✅  | ✅    | ✅   | ✅   |
| 饼图   | PieChart     | ✅  | ✅    | ✅   | ✅   |
| 环形图 | DonutChart   | ✅  | ✅    | ✅   | ✅   |
| 散点图 | ScatterChart | ✅  | ✅    | ✅   | ✅   |
| 雷达图 | RadarChart   | ✅  | ✅    | ✅   | ✅   |

### 共享逻辑 (Composables / Hooks)

| 功能             | Composable/Hook     | Vue | React | 说明                              |
| ---------------- | ------------------- | --- | ----- | --------------------------------- |
| 图表交互状态管理 | useChartInteraction | ✅  | ✅    | 统一处理 hover/select/legend 交互 |
| 拖拽系统         | useDrag             | ✅  | ✅    | Headless 拖拽(排序/跨容器/树)     |

### 高级交互组件 (Advanced Interaction Components) — v0.8.0

| 组件         | Component      | Vue | React | 文档 | 测试 |
| ------------ | -------------- | --- | ----- | ---- | ---- |
| 分割面板     | Splitter       | ✅  | ✅    | ✅   | ✅   |
| 可调整容器   | Resizable      | ✅  | ✅    | ✅   | ✅   |
| 代码编辑器   | CodeEditor     | ✅  | ✅    | ✅   | ✅   |
| 富文本编辑器 | RichTextEditor | ✅  | ✅    | ✅   | ✅   |
| 看板         | Kanban         | ✅  | ✅    | ✅   | ✅   |
| 虚拟表格     | VirtualTable   | ✅  | ✅    | ✅   | ✅   |
| 无限滚动     | InfiniteScroll | ✅  | ✅    | ✅   | ✅   |
| 文件管理器   | FileManager    | ✅  | ✅    | ✅   | ✅   |

## 开发优先级

我们将按照以下优先级进行开发：

1. **阶段一（高优先级）**：基础组件、表单组件、布局组件
2. **阶段二（中优先级）**：数据展示组件、导航组件
3. **阶段三（低优先级）**：反馈组件、其他组件

## 贡献指南

欢迎贡献！如果您想参与某个组件的开发，请：

1. 在 Issues 中创建或认领相关任务
2. Fork 本仓库并创建特性分支
3. 开发组件并确保通过测试
4. 提交 Pull Request

## 文档规范

每个组件都需要包含：

- API 文档
- 使用示例
- Props/参数说明
- 事件说明（如适用）
- 样式定制指南
