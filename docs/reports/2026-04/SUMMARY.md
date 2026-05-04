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
| Basic                 | React Button 仍有 module-level spinner；Group 类组件共享 `group-utils` 未落地；ImageCropper/ImagePreview 仍需更强交互测试                                                                                                                           |
| Form                  | Upload 拖拽、InputNumber/Stepper 长按、Form O(N²) 校验、Switch class composer、命令式 Form API 仍待评估或实现                                                                                                                                       |
| Feedback              | Watermark OffscreenCanvas/ResizeObserver、Notification stack rAF、Floating middleware 缓存、Loading overlay 复用仍待做                                                                                                                              |
| Layout                | Splitter/Resizable 仍是组件内 mousemove；Carousel autoplay 仍用 `setInterval`；List 未复用 VirtualList；Row/Col 与 Descriptions 性能项未完成                                                                                                        |
| Navigation            | Menu/Dropdown/Anchor/Breadcrumb/Steps/Tabs 父子组件同文件约定未落地；Pagination lazy locale / idle 校验、BackTop rAF、Menu 动画、Segmented transform 等仍待做                                                                                       |
| Data                  | Calendar memo、Collapse rAF transition、Timeline pseudo-element 仍待做；Table virtual 默认策略仍待确认                                                                                                                                              |
| Charts                | ChartCanvas ResizeObserver+rAF、chart interaction rAF throttle、Heatmap canvas fallback、TreeMap/Sunburst memo、Gauge rAF 动画等性能项仍待做                                                                                                        |
| Composite / Advanced  | Composite 配方化文档、DataTableWithToolbar/Table 边界、CommentThread 深度限制、ActivityFeed/Timeline 复用、InfiniteScroll IO、FileManager 共享 model、ImageViewer 手势 util、VirtualList 策略化、VirtualTable 压测、PrintLayout stylesheet 化仍待做 |

## 3. 延期边界

| 项目                        | 状态       | 说明                                                                |
| --------------------------- | ---------- | ------------------------------------------------------------------- |
| commander 14                | Deferred   | 当前根 `engines.node` 仍是 `>=18.0.0`，commander 14 需要 Node 20+   |
| Node engines bump           | Pending    | 需单独评估 CI、发布 workflow 与 devDependency 要求                  |
| workspace catalog/overrides | Pending    | `pnpm-workspace.yaml` 仍未使用 catalog/overrides 固定核心工具链版本 |
| Kanban / TaskBoard v2 API   | Discussion | 需评估公开 API、兼容策略与迁移成本                                  |
