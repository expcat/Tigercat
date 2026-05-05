# Tigercat 2026-04 剩余优化清单

> 2026-05-04 核对：并非全部完成。本文只保留源码、测试或文档中仍未完成、部分完成、待评估的优化项。

> 2026-05-04 执行：完成 Feedback / Floating middleware 缓存。`Tooltip` / `Popover` / `Popconfirm` 共用的 core floating middleware 现在按参数与 arrow 元素缓存，并新增 core 单测覆盖复用与隔离行为。

> 2026-05-04 执行：完成 Feedback / Notification stack rAF。全局 Notification 的堆叠刷新现在通过 core rAF scheduler 按 position 批量到下一帧，并新增 core 调度器测试与 Vue/React 行为验证。

> 2026-05-04 执行：完成 Feedback / Watermark 绘制优化。Watermark 绘制现在通过 core controller 统一 rAF 批量与 ResizeObserver 重绘，文本水印优先使用 OffscreenCanvas，图片与兼容场景保留 DOM canvas fallback，并新增 core 与 Vue/React 测试。

> 2026-05-04 执行：完成 Feedback / Loading overlay 复用。Fullscreen Loading 现在与 Modal / Drawer 一样挂载到 body，并共用 core body scroll lock 计数器；Modal / Drawer 也接入同一锁，新增 core 与 Vue/React Loading 测试覆盖 portal/teleport 与滚动锁行为。

> 2026-05-04 执行：完成 Feedback / overlay hooks 收敛。Vue / React 内部 overlay 工具新增 body scroll lock 与 focus trap 封装，Modal / Drawer / Loading 接入共享 hooks/composables，Vue Modal 的 Esc 处理对齐 Drawer，并新增 Vue/React Drawer 滚动锁与焦点循环回归测试。更大的 overlay 共享层总项仍保留，用于后续继续收敛 portal/teleport 与跨 overlay 策略。

> 2026-05-04 执行：完成 Feedback / mask close 语义收敛。core overlay utils 新增 `shouldCloseOnMaskClick`，Vue / React 的 Modal 与 Drawer 共用同一 maskClosable 判断，并新增 core 单测覆盖直接 mask 点击、内容点击与禁用关闭场景。更大的 overlay 共享层总项仍保留，用于后续继续收敛 portal/teleport。

> 2026-05-04 执行：完成 Feedback / portal 入口收敛。React overlay utils 新增 `renderBodyPortal`，Vue overlay utils 新增 `renderVueBodyTeleport`，Modal / Drawer / Loading 不再各自直连 `document.body` portal 或 `Teleport to="body"`，后续如需调整 overlay 挂载策略可从框架内部共享入口继续推进。

> 2026-05-04 执行：完成 PR-21 视觉回归。新增 Playwright overlay visual spec，跨 Chromium / Firefox / WebKit 覆盖 Vue 与 React 的 Modal / Drawer / Popover 打开态截图基线；同时修复 Vue Drawer demo 仍使用旧 `v-model:visible` 导致抽屉无法打开的问题。

## 1. 最高优先级

| 任务                   | 对应组件 / 范围                                           | 来源                                                             | 完成标准                                                           |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| 默认主题像素回归       | Button / Input / Card / Form / Overlay 等核心默认主题组件 | [phase1c-theme-modernization.md](phase1c-theme-modernization.md) | 默认配置与 v1.0.x 视觉保持一致，完成核心组件截图/像素差验证        |
| 收敛 overlay 共享层    | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading | [phase2.3-feedback.md](phase2.3-feedback.md)                     | 统一 portal/teleport、lock-scroll、focus trap、Esc 与 mask 行为    |
| 推进 picker-utils 二期 | AutoComplete / Cascader / TreeSelect / Transfer           | [phase2.2-form.md](phase2.2-form.md)                             | 按各自键盘与 ARIA 语义复用共享 picker 行为                         |
| 处理 Table 性能二期    | Table                                                     | [phase2.6-data.md](phase2.6-data.md)                             | ResizeObserver + rAF 批量、virtual 默认策略、export-utils 子路径化 |

## 2. 分组索引

| 分组                  | 文档                                                                     | 未完成对应组件 / 范围                                                                                              |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 依赖与工具链          | [deps-matrix.md](deps-matrix.md)                                         | CLI / workspace / 模板依赖                                                                                         |
| 主题现代化            | [phase1c-theme-modernization.md](phase1c-theme-modernization.md)         | 默认主题核心组件                                                                                                   |
| i18n / CLI / examples | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | ConfigProvider / locale barrel / CLI bin                                                                           |
| Basic                 | [phase2.1-basic.md](phase2.1-basic.md)                                   | Empty / Divider                                                                                                    |
| Form                  | [phase2.2-form.md](phase2.2-form.md)                                     | Form / AutoComplete / Cascader / TreeSelect / Transfer / Radio / Checkbox                                          |
| Feedback              | [phase2.3-feedback.md](phase2.3-feedback.md)                             | Modal / Drawer / Popover / Tooltip / Popconfirm                                                                    |
| Layout                | [phase2.4-layout.md](phase2.4-layout.md)                                 | Row / Col / Splitter / Resizable / List / Statistic / Descriptions / Container                                     |
| Navigation            | [phase2.5-navigation.md](phase2.5-navigation.md)                         | Menu / Dropdown / Anchor / Breadcrumb / Steps / Tabs / Pagination / FloatButton                                    |
| Data                  | [phase2.6-data.md](phase2.6-data.md)                                     | Table / Timeline                                                                                                   |
| Charts                | [phase2.7-charts.md](phase2.7-charts.md)                                 | TreeMap / Sunburst / Gauge / chart interaction hot paths                                                           |
| Composite             | [phase2.8-composite.md](phase2.8-composite.md)                           | DataTableWithToolbar / NotificationCenter / ActivityFeed / Timeline / CropUpload / FormWizard                      |
| Advanced              | [phase2.9-advanced.md](phase2.9-advanced.md)                             | VirtualList / InfiniteScroll / FileManager / ImageViewer / TaskBoard / VirtualTable / PrintLayout / RichTextEditor |
