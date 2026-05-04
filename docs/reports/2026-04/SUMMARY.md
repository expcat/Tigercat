# Tigercat 2026-04 剩余优化清单

> 2026-05-04 核对：并非全部完成。本文只保留源码、测试或文档中仍未完成、部分完成、待评估的优化项。

## 1. 最高优先级

| 任务                   | 对应组件 / 范围                                           | 来源                                                                     | 完成标准                                                           |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 默认主题像素回归       | Button / Input / Card / Form / Overlay 等核心默认主题组件 | [phase1c-theme-modernization.md](phase1c-theme-modernization.md)         | 默认配置与 v1.0.x 视觉保持一致，完成核心组件截图/像素差验证        |
| 完成 PR-21 视觉回归    | Modal / Drawer / Popover                                  | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | Playwright 跨浏览器截图对比覆盖主要 overlay 打开态                 |
| 收敛 overlay 共享层    | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading | [phase2.3-feedback.md](phase2.3-feedback.md)                             | 统一 portal/teleport、lock-scroll、focus trap、Esc 与 mask 行为    |
| 推进 picker-utils 二期 | AutoComplete / Cascader / TreeSelect / Transfer           | [phase2.2-form.md](phase2.2-form.md)                                     | 按各自键盘与 ARIA 语义复用共享 picker 行为                         |
| 处理 Table 性能二期    | Table                                                     | [phase2.6-data.md](phase2.6-data.md)                                     | ResizeObserver + rAF 批量、virtual 默认策略、export-utils 子路径化 |

## 2. 分组索引

| 分组                  | 文档                                                                     | 未完成对应组件 / 范围                                                                                              |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 依赖与工具链          | [deps-matrix.md](deps-matrix.md)                                         | CLI / workspace / 模板依赖                                                                                         |
| 主题现代化            | [phase1c-theme-modernization.md](phase1c-theme-modernization.md)         | 默认主题核心组件                                                                                                   |
| i18n / CLI / examples | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | ConfigProvider / locale barrel / CLI bin / Modal / Drawer / Popover                                                |
| Basic                 | [phase2.1-basic.md](phase2.1-basic.md)                                   | Empty / Divider                                                                                                    |
| Form                  | [phase2.2-form.md](phase2.2-form.md)                                     | Form / AutoComplete / Cascader / TreeSelect / Transfer / Radio / Checkbox                                          |
| Feedback              | [phase2.3-feedback.md](phase2.3-feedback.md)                             | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading / Notification / Watermark                               |
| Layout                | [phase2.4-layout.md](phase2.4-layout.md)                                 | Row / Col / Splitter / Resizable / List / Statistic / Descriptions / Container                                     |
| Navigation            | [phase2.5-navigation.md](phase2.5-navigation.md)                         | Menu / Dropdown / Anchor / Breadcrumb / Steps / Tabs / Pagination / FloatButton                                    |
| Data                  | [phase2.6-data.md](phase2.6-data.md)                                     | Table / Timeline                                                                                                   |
| Charts                | [phase2.7-charts.md](phase2.7-charts.md)                                 | TreeMap / Sunburst / Gauge / chart interaction hot paths                                                           |
| Composite             | [phase2.8-composite.md](phase2.8-composite.md)                           | DataTableWithToolbar / NotificationCenter / ActivityFeed / Timeline / CropUpload / FormWizard                      |
| Advanced              | [phase2.9-advanced.md](phase2.9-advanced.md)                             | VirtualList / InfiniteScroll / FileManager / ImageViewer / TaskBoard / VirtualTable / PrintLayout / RichTextEditor |
