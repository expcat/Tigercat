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

> 2026-05-05 执行：完成 Theme / 默认主题像素回归。新增 Playwright default-theme visual spec，覆盖 Vue 与 React 的 Button / Input / Card / Form 默认主题截图基线；Modal / Drawer / Popover 继续由已有 overlay visual spec 覆盖。本次在 Chromium 下生成基线并复跑通过。

> 2026-05-05 执行：完成 Feedback / overlay 共享层收敛。Tooltip / Popover / Popconfirm 的浮层内容现在分别通过 Vue `renderVueBodyTeleport` 与 React `renderBodyPortal` 挂载到 body，outside-click 同时识别触发器容器与浮层节点；Modal / Drawer / Loading 已在前置步骤共用 portal/teleport、滚动锁与焦点陷阱，本轮补齐 floating popup 后总项标记完成。

> 2026-05-05 执行：完成 Form / picker-utils 二期。core `picker-utils` 补齐启用项导航、combobox/listbox/option ARIA props 与触发器按键动作归一化，Vue / React 的 AutoComplete、Cascader、TreeSelect、Transfer 已接入共享键盘与 ARIA 基础逻辑，并新增 AutoComplete 禁用首项键盘选择回归测试。

> 2026-05-05 执行：完成 Form / 校验复杂度。Form context 现在提供按字段索引的错误 map，Vue / React FormItem 读取自身错误为 O(1)，避免字段数和错误数同时增长时每个 FormItem 都扫描 errors；新增 Vue / React 多字段 validateField 回归测试，确认单字段校验不会执行其它字段规则。

> 2026-05-05 执行：完成 Data / Table 性能二期。Table 新增 ResizeObserver + rAF 批量测量工具，Vue / React Table 用测得列宽更新 fixed column offset，并记录 row height 快照；virtual 策略明确为不自动启用，超过 `virtualThreshold` 时提供 `data-tiger-virtual-recommended="true"` 建议信号；CSV export 工具剥离到 `@expcat/tigercat-core/utils/table-export` 子路径。

> 2026-05-05 执行：完成 Layout / List virtual mode。Vue / React List 在 virtual 模式下复用现有 VirtualList 渲染固定高度窗口，新增 virtualHeight / virtualItemHeight / virtualOverscan 配置；grid 列表继续保留原 grid 渲染路径，避免混用布局策略。

> 2026-05-05 执行：完成 Composite / DataTableWithToolbar 边界。Vue / React DataTableWithToolbar 不再自行渲染 Pagination，而是将 pagination 回交内部 Table；Table 分页总数现在尊重显式 `pagination.total`，DataTableWithToolbar 只保留 toolbar 搜索、筛选与批量操作编排。

## 1. 最高优先级

| 任务                            | 对应组件 / 范围                   | 来源                                                                     | 完成标准                                                                                                              |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 根入口 locale tree-shaking 方案 | Core i18n barrel / locale presets | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | 当前根入口仍会经 `utils/i18n` re-export 全部 locale；需决定是否保留兼容 barrel，或引入更轻的 locale-only 默认导出策略 |

## 2. 分组索引

| 分组                  | 文档                                                                     | 未完成对应组件 / 范围                                                                                              |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 依赖与工具链          | [deps-matrix.md](deps-matrix.md)                                         | CLI / workspace / 模板依赖                                                                                         |
| 主题现代化            | [phase1c-theme-modernization.md](phase1c-theme-modernization.md)         | 已完成默认主题像素回归                                                                                             |
| i18n / CLI / examples | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | ConfigProvider / locale barrel / CLI bin                                                                           |
| Basic                 | [phase2.1-basic.md](phase2.1-basic.md)                                   | Empty / Divider                                                                                                    |
| Form                  | [phase2.2-form.md](phase2.2-form.md)                                     | Radio / Checkbox / Form 命令式 API；Form 校验复杂度与 picker-utils 二期已完成                                      |
| Feedback              | [phase2.3-feedback.md](phase2.3-feedback.md)                             | 已完成 overlay 共享层                                                                                              |
| Layout                | [phase2.4-layout.md](phase2.4-layout.md)                                 | Row / Col / Splitter / Resizable / Statistic / Descriptions / Container；List virtual mode 已完成                  |
| Navigation            | [phase2.5-navigation.md](phase2.5-navigation.md)                         | Menu / Dropdown / Anchor / Breadcrumb / Steps / Tabs / Pagination / FloatButton                                    |
| Data                  | [phase2.6-data.md](phase2.6-data.md)                                     | Timeline；Table 性能二期已完成                                                                                     |
| Charts                | [phase2.7-charts.md](phase2.7-charts.md)                                 | TreeMap / Sunburst / Gauge / chart interaction hot paths                                                           |
| Composite             | [phase2.8-composite.md](phase2.8-composite.md)                           | NotificationCenter / ActivityFeed / Timeline / CropUpload / FormWizard；DataTableWithToolbar 边界已完成            |
| Advanced              | [phase2.9-advanced.md](phase2.9-advanced.md)                             | VirtualList / InfiniteScroll / FileManager / ImageViewer / TaskBoard / VirtualTable / PrintLayout / RichTextEditor |
