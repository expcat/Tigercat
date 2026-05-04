# Tigercat 2026-04 剩余优化清单

> 2026-05-04 复核：本目录仅保留仍未完成或仍需验证的优化内容。

## 1. 最高优先级

| 任务                   | 来源                                                                     | 完成标准                                                                                                |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 刷新当前覆盖率         | [coverage-baseline.json](coverage-baseline.json) / PR-21                 | 重新运行 `pnpm test:coverage`，生成当前覆盖率摘要；避免继续引用 2026-04 baseline                        |
| 完成 PR-21 剩余回归    | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | 补齐 a11y 扫描、modern 样式触发、Message/Notification sideEffects、Playwright 视觉回归、bench 场景      |
| 收敛 overlay 共享层    | [phase2.3-feedback.md](phase2.3-feedback.md)                             | Modal/Drawer/Popover/Tooltip/Popconfirm/Loading 统一 portal/teleport、lock-scroll、focus trap、Esc 行为 |
| 推进 picker-utils 二期 | [phase2.2-form.md](phase2.2-form.md)                                     | AutoComplete/Cascader/TreeSelect/Transfer 按各自键盘与 ARIA 语义复用共享 picker 行为                    |
| 处理 Table 性能二期    | [phase2.6-data.md](phase2.6-data.md)                                     | ResizeObserver/rAF 批量、sticky/virtual 组合压测、export-utils 子路径化                                 |

## 2. 分组剩余项

| 分组                  | 剩余内容                                                                                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core utils            | `BaseInteractiveProps` / `BaseFormControlProps` / `BaseLayoutProps` 未落地；`animation.ts` / `transition.ts` 仍未合并为 `motion/`；`helpers/` 目录未按 dom/class/motion 细分；死代码扫描未执行                                                      |
| i18n / CLI / examples | `defineLocale`、ConfigProvider 异步 locale、根入口 locale tree-shaking 方案仍未完成；commander 14 等 Node 20+；workspace catalog/overrides 未配置；CLI Windows shim 与 `doctor` 命令仍待做                                                          |
| Basic                 | Empty 默认插画体积、Divider 文件合并评估仍待做                                                                                                                                                                                                      |
| Form                  | Form O(N²) 校验、picker-utils 二期、Radio/Checkbox icon 体积、命令式 Form API 仍待评估或实现                                                                                                                                                        |
| Feedback              | Watermark OffscreenCanvas/ResizeObserver、Notification stack rAF、Floating middleware 缓存、Loading overlay 复用仍待做                                                                                                                              |
| Layout                | Splitter/Resizable 仍是组件内 mousemove；Carousel autoplay 仍用 `setInterval`；List 未复用 VirtualList；Row/Col 与 Descriptions 性能项未完成                                                                                                        |
| Navigation            | Menu/Dropdown/Anchor/Breadcrumb/Steps/Tabs 父子组件同文件约定未落地；Pagination lazy locale / idle 校验、Menu 动画等仍待做                                                                                                                          |
| Data                  | Calendar memo、Collapse rAF transition、Timeline pseudo-element 仍待做；Table virtual 默认策略仍待确认                                                                                                                                              |
| Charts                | Heatmap canvas fallback、TreeMap/Sunburst memo、Gauge rAF 动画等性能项仍待做                                                                                                                                                                        |
| Composite / Advanced  | Composite 配方化文档、DataTableWithToolbar/Table 边界、CommentThread 深度限制、ActivityFeed/Timeline 复用、InfiniteScroll IO、FileManager 共享 model、ImageViewer 手势 util、VirtualList 策略化、VirtualTable 压测、PrintLayout stylesheet 化仍待做 |

## 3. 延期边界

| 项目                        | 状态       | 说明                                                                |
| --------------------------- | ---------- | ------------------------------------------------------------------- |
| commander 14                | Deferred   | 当前根 `engines.node` 仍是 `>=18.0.0`，commander 14 需要 Node 20+   |
| Node engines bump           | Pending    | 需单独评估 CI、发布 workflow 与 devDependency 要求                  |
| workspace catalog/overrides | Pending    | `pnpm-workspace.yaml` 仍未使用 catalog/overrides 固定核心工具链版本 |
| Kanban / TaskBoard v2 API   | Discussion | 需评估公开 API、兼容策略与迁移成本                                  |

## 4. 本轮完成记录

| 日期       | 任务                          | 状态 | 验证                                                                                                                                                                                   |
| ---------- | ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-04 | React Button spinner lazy PR  | Done | `Button.spec.tsx` + `ButtonSpinnerLazy.spec.tsx` 通过；`pnpm --filter @expcat/tigercat-react build` 通过                                                                               |
| 2026-05-04 | Group 类组件共享 util PR      | Done | Group 聚焦测试 62 个通过；`core` / `react` / `vue` 三端包构建通过                                                                                                                      |
| 2026-05-04 | ImagePreview 交互测试 PR      | Done | React/Vue ImagePreview 聚焦测试 30 个通过；补齐 rotate 交互；`core` / `react` / `vue` 三端包构建通过                                                                                   |
| 2026-05-04 | ImageCropper 交互测试 PR      | Done | React/Vue ImageCropper 聚焦测试 22 个通过；补齐键盘移动/缩放；`react` / `vue` 两端包构建通过                                                                                           |
| 2026-05-04 | Typography 合并评估 PR        | Done | Text/Code 保持独立公开 API；Code class composer 收敛到 core；Text/Code 聚焦测试 28 个通过，三端构建通过                                                                                |
| 2026-05-04 | InputNumber/Stepper 长按 PR   | Done | 新增 core rAF repeat controller；React/Vue 长按步进测试与 core 调度测试 92 个通过；三端包构建通过                                                                                      |
| 2026-05-04 | Upload 拖拽复用 PR            | Done | Upload drag over/leave/drop 复用 core helper；core/React/Vue Upload 聚焦测试 90 个通过；三端包构建通过                                                                                 |
| 2026-05-04 | Switch class composer PR      | Done | Switch 外层 class 合并收敛到 core `composeComponentClasses`；core/React/Vue Switch 聚焦测试 58 个通过；三端包构建通过                                                                  |
| 2026-05-04 | Mentions 定位复核 PR          | Done | Mentions 下拉定位复用 core floating helper；core/React/Vue Mentions 聚焦测试 25 个通过；三端包构建通过                                                                                 |
| 2026-05-04 | DatePicker locale 子路径 PR   | Done | DatePicker 专用 locale preset 支持按子路径导入；core/React/Vue DatePicker 聚焦测试 65 个通过；三端包构建通过                                                                           |
| 2026-05-04 | BackTop rAF throttle PR       | Done | 新增 core BackTop visibility controller；React/Vue scroll 监听 rAF throttle；点击滚动改用原生 smooth/auto；core/React/Vue BackTop 聚焦测试 15 个通过；三端包构建通过                   |
| 2026-05-04 | Segmented transform PR        | Done | 新增 core Segmented indicator style；React/Vue 滑块位置改用 transform；core/React/Vue Segmented 聚焦测试 29 个通过；三端包构建通过                                                     |
| 2026-05-04 | Tabs indicator transform PR   | Done | 新增 core Tabs indicator/grid style；React/Vue line tabs 指示条位置改用 transform；core/React/Vue Tabs 聚焦测试 81 个通过；三端包构建通过                                              |
| 2026-05-04 | Chart interaction rAF PR      | Done | 新增 core chart pointer rAF scheduler；React/Vue `useChartInteraction` mousemove 坐标合帧并在 leave/dispose 取消；core/React/Vue chart interaction 聚焦测试 105 个通过；三端包构建通过 |
| 2026-05-04 | ChartCanvas ResizeObserver PR | Done | 新增 core chart resize observer controller；React/Vue ChartCanvas 支持 `responsive` 父容器 ResizeObserver+rAF 合帧；core/React/Vue ChartCanvas 聚焦测试 9 个通过；三端包构建通过       |
| 2026-05-04 | Chart numeric tick cache PR   | Done | 新增 core 线性 tick value 缓存，按 domain + tickCount 复用 nice/tick 计算；`chart-utils.spec.ts` 98 个通过；三端包构建通过                                                             |
| 2026-05-04 | ChartTooltip transform PR     | Done | 新增 core tooltip transform helper；React/Vue ChartTooltip 改用 `translate3d` 跟随定位，不再动态写入 left/top；core/React/Vue ChartTooltip 聚焦测试 31 个通过；三端包构建通过          |
| 2026-05-04 | Chart SVG stable keys PR      | Done | 新增 core series key helper；React/Vue Line/Area/Radar 多系列 SVG defs、series group 与 points 改用稳定 seriesKey；Charts 聚焦测试 107 个通过；三端包构建通过                          |
