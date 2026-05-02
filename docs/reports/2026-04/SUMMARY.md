# Tigercat 2026-04 优化执行总览

> 本页是 `docs/reports/2026-04/` 的短索引与执行看板。详细问题、原始审查表和组件级建议仍保留在各 phase 文档中；本页只记录决策、状态和下一步。

## 0. 文档维护规则

- `SUMMARY.md` 只做总览，不再承载逐 PR 的长变更日志。
- 单个 PR 备注控制在 1 句话内；测试数量、体积数字只保留最终值或关键变化。
- 细节证据放在对应 phase 文档、测试报告、PR 描述或 git 历史中。
- 后续更新优先改“状态看板”和“未完成任务规划”，避免在表格单元格中追加多段日志。
- 建议维持本文件低于 250 行、80 KB；当前重写目标是让它重新成为可读入口。

## 1. 报告索引

| 文档                                                                     | 用途                           | 当前结论                                                                      |
| ------------------------------------------------------------------------ | ------------------------------ | ----------------------------------------------------------------------------- |
| [baseline.md](baseline.md)                                               | 初始包体积与 tree-shaking 风险 | sideEffects 风险已作为 P0 处理                                                |
| [deps-matrix.md](deps-matrix.md)                                         | 依赖升级矩阵                   | Tailwind/TS/Vite/ESLint/vue-router 已推进；commander 14 延期到 Node 20        |
| [phase1b-core-utils.md](phase1b-core-utils.md)                           | core utils / barrel / 大文件   | chart-utils 拆分、icons/i18n 子路径、class composer 已落地                    |
| [phase1c-theme-modernization.md](phase1c-theme-modernization.md)         | modern 主题 token              | modern preset 与 radius/shadow/motion 等 token 已落地                         |
| [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | i18n / CLI / examples / tests  | i18n、CLI 模板、examples 已大部完成；tests 仍在 PR-21                         |
| [phase2.1-basic.md](phase2.1-basic.md)                                   | Basic 组件                     | SSR Button 与基础样式现代化已完成                                             |
| [phase2.2-form.md](phase2.2-form.md)                                     | Form 组件                      | Date/Time 去重、部分 picker-utils 完成；其余表单共享逻辑待收敛                |
| [phase2.3-feedback.md](phase2.3-feedback.md)                             | Feedback 组件                  | sideEffects 完成；overlay 共享层与 a11y 回归仍待做                            |
| [phase2.4-layout.md](phase2.4-layout.md)                                 | Layout 组件                    | radius token 迁移完成；Carousel/Splitter 等性能项待评估                       |
| [phase2.5-navigation.md](phase2.5-navigation.md)                         | Navigation 组件                | Tree virtual、Affix/Anchor IO 完成；父子组件文件合并待做                      |
| [phase2.6-data.md](phase2.6-data.md)                                     | Data 组件                      | Table 拆分完成；Table 性能细项、Calendar/Collapse 优化待做                    |
| [phase2.7-charts.md](phase2.7-charts.md)                                 | Charts 组件                    | chart-utils 拆分、配色 token、PR-19k 视觉增强已完成                           |
| [phase2.8-composite.md](phase2.8-composite.md)                           | Composite 组件                 | ChatWindow virtual、部分 core utils 下沉完成；Kanban/TaskBoard 与配方化待讨论 |
| [phase2.9-advanced.md](phase2.9-advanced.md)                             | Advanced 组件                  | Code/RichText engine 化完成；Virtual/File/Image/Kanban 仍有 P1/P2             |
| [coverage-baseline.json](coverage-baseline.json)                         | PR-21 G1 覆盖率基线            | 初始 lines 78.05%、branches 71.24%；后续补测需重新跑覆盖率刷新                |

## 2. 执行状态看板

| 范围                              | 状态         | 说明                                                                                                   |
| --------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| PR-1 sideEffects                  | Done         | 修复 chunk 被忽略风险，esbuild ignored-bare-import 归零                                                |
| PR-2 Tailwind core v4             | Done         | core 与 examples 统一到 Tailwind v4；plugin 经 v4 路径验证                                             |
| PR-3 非破坏性依赖升级             | Done         | 小版本依赖合包完成                                                                                     |
| PR-4 i18n locales 子路径化        | Done         | locales 拆分并保留向后兼容 re-export                                                                   |
| PR-5 icons 分组子路径             | Done         | common/picker/status/table 图标子路径完成                                                              |
| PR-6 modern theme token           | Done         | modern preset、radius、shadow、motion、glass 等 token 完成                                             |
| PR-7 examples 四件套开关          | Done         | theme、dark、modern、locale 顶部控制完成                                                               |
| PR-8 CLI 模板 v4 + modern         | Done         | 模板改用 Tailwind v4 CSS-first 与 modern plugin                                                        |
| PR-9 Button SSR + class composer  | Done         | Vue Button vnode 复用问题修复，class composer 下沉到 core                                              |
| PR-10 picker-utils                | Partial Done | Select 两端已复用；AutoComplete/Cascader/TreeSelect/Transfer 仍需按交互语义继续收敛                    |
| PR-11 DatePicker/TimePicker 去重  | Done         | padTwo/isSameDay 等轻量重复逻辑下沉                                                                    |
| PR-12 chart-utils 拆分            | Done         | 28 KB 单文件拆为 chart 子模块，旧入口薄 re-export                                                      |
| PR-13 Affix/Anchor IO             | Done         | 滚动检测切到 IntersectionObserver                                                                      |
| PR-14 Tree/ChatWindow virtual     | Done         | Tree 与 ChatWindow 增加 virtual 路径和测试                                                             |
| PR-15 Composite 去重              | Partial Done | FormWizard/CropUpload 下沉核心工具；DataTableWithToolbar 保持现状，留待 Table 后续评估                 |
| PR-16 Table 拆分                  | Done         | Vue/React Table 拆出 state + render 子模块，体积小幅下降                                               |
| PR-17 Code/RichText engine 化     | Done         | 提供 highlighter/engine opt-in，不打包重型编辑器引擎                                                   |
| PR-18 Kanban + TaskBoard 合并     | Pending      | 需先做 API/兼容性方案讨论，可能属于 v2 级变更                                                          |
| PR-19a..j radius token 迁移       | Done         | Basic/Form/Feedback/Layout/Navigation/Data/Composite/Advanced 与横切剩余项已完成                       |
| PR-19k chart 视觉增强             | Done         | tooltip/axis/legend/blocks/gradient/pointGradient/oklch 等 opt-in 项已收尾                             |
| PR-20 examples 重构               | Done         | 复制代码、hooks demo、a11y debug panel、跨框架 Home 对比完成                                           |
| PR-21 tests 覆盖率 + a11y/视觉    | In Progress  | G1 完成；G2 已补 Tour、themes-manager、image-utils、color-picker-utils、rich-text-engine、React Slider |
| PR-22 TypeScript 6 + vue-tsc 3    | Done         | 全包构建与测试通过；保留 TS 7 前的 baseUrl 弃用临时缓解                                                |
| PR-23 Vite 8 + plugin-react 6     | Done         | examples Vue/React build 通过                                                                          |
| PR-24 ESLint 10                   | Done         | rules-of-hooks error 清零，保留若干 exhaustive-deps warning 后续审视                                   |
| PR-25 vue-router 5 / commander 14 | Partial Done | vue-router 5 完成；commander 14 因 Node 20+ 要求延期                                                   |

## 3. 已完成收益归纳

### 体积与 tree-shaking

- sideEffects 风险已关闭，防止 imperative API 生产环境 chunk 被误删。
- i18n locales、icons、Tailwind plugin 提供子路径，支持更细粒度按需消费。
- chart-utils、Table、CodeEditor/RichTextEditor 完成结构性拆分或 thin shell 化。
- examples 与 CLI 模板已统一到 Tailwind v4 + modern token 路径。

### 主题与视觉现代化

- modern preset opt-in，不改变默认主题基线。
- radius token 已覆盖主要组件组，chart 视觉增强已用 opt-in prop 或 modern token 收尾。
- 深色模式相关硬编码白色描边已清理到 surface/chart token 路径。

### 性能与交互

- Affix/Anchor 使用 IntersectionObserver。
- Tree/ChatWindow 支持 virtual 路径。
- Table 拆分后更利于后续局部性能优化。
- Chart 系列增加多项渐变、hover、oklch、tabular-nums 等现代化能力。

### 测试进展

- PR-21 G1 已归档初始覆盖率基线：lines 78.05%，branches 71.24%。
- 已补齐或显著提升：Tour Vue/React、themes-manager、image-utils、color-picker-utils、rich-text-engine、React Slider。
- Test-only 子项不影响 core/vue/react 包体积。

## 4. 未完成任务规划

### 4.1 近期优先级

| 顺序 | 任务                              | 来源                                                                     | 完成标准                                                                  |
| ---- | --------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1    | 刷新 PR-21 覆盖率现状             | [coverage-baseline.json](coverage-baseline.json)                         | 重新运行 coverage，生成当前覆盖率摘要，避免继续引用已过期 baseline        |
| 2    | 补 TaskBoard Vue/React 测试       | [phase2.9-advanced.md](phase2.9-advanced.md) / PR-21                     | 覆盖列增删、卡片移动、拖拽边界、空态、禁用态，lines 至少 80%              |
| 3    | 补 ImageCropper Vue/React 测试    | [phase2.1-basic.md](phase2.1-basic.md) / PR-21                           | 覆盖裁剪框移动、缩放、aspect ratio、键盘/触控边界                         |
| 4    | 补 ImagePreview Vue/React 测试    | [phase2.1-basic.md](phase2.1-basic.md) / PR-21                           | 覆盖 open/close、prev/next、zoom/rotate、键盘导航                         |
| 5    | 补 Affix Vue 测试并核对覆盖率差异 | [phase2.5-navigation.md](phase2.5-navigation.md) / PR-21                 | 以最新 coverage 为准，覆盖 sentinel、offset、ResizeObserver、cleanup      |
| 6    | 完成 PR-21 G3/G5/G6               | [phase1d-i18n-cli-examples-tests.md](phase1d-i18n-cli-examples-tests.md) | a11y 扫描、modern 主题测试、Message/Notification sideEffects 回归测试落地 |

### 4.2 中期架构任务

| 任务                                       | 优先级 | 规划                                                                                                         |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------ |
| PR-18 Kanban + TaskBoard 合并方案          | P0     | 先写方案：保留两个入口还是 TaskBoard 作为 Kanban preset；明确是否破坏 API，再决定是否进入 v2                 |
| Composite 配方化                           | P1/P2  | DataTableWithToolbar、CropUpload、FormWizard 评估是否转为 cookbook 配方，避免 composite 继续膨胀             |
| Overlay 共享层                             | P1     | Modal/Drawer/Popover/Tooltip/Popconfirm/Loading 统一 portal、lock-scroll、focus-trap、Esc 行为               |
| Picker 共享层二期                          | P1     | AutoComplete、Cascader、TreeSelect、Transfer 按各自键盘/ARIA 语义扩展 picker-utils，不强行统一到 Select 语义 |
| Navigation 父子文件合并                    | P1     | Menu、Dropdown、Anchor、Breadcrumb、Steps、Tabs 建立父子组件同文件约定，减少 chunk 与导出链路                |
| Table 性能二期                             | P1     | rowKey 缓存、sticky/virtual 组合压测、export-utils 子路径化、ResizeObserver/rAF 批量更新                     |
| Virtual / Infinite / File / Image 工具抽离 | P1     | VirtualList 策略化、InfiniteScroll sentinel、FileManager 共享 model、ImageViewer 手势 core util              |

### 4.3 依赖与基础设施

| 任务                        | 状态     | 规划                                                                         |
| --------------------------- | -------- | ---------------------------------------------------------------------------- |
| commander 14                | Deferred | 等仓库开发工具链统一到 Node 20+ 后再升，避免破坏 Node 18 发布工作流          |
| Node engines bump           | Pending  | 单独 PR 评估 `engines.node`、CI、发布 workflow 与 devDependency 的 Node 要求 |
| workspace catalog/overrides | Pending  | 用 pnpm catalog 或 overrides 固定 Vue/React/TS/Tailwind/tsup 版本一致性      |
| Playwright 视觉回归         | Pending  | PR-21 G7：Modal/Drawer/Popover 跨浏览器截图对比                              |
| Benchmarks                  | Pending  | PR-21 G8：chart-utils 与 virtual-list-utils 添加 benchmark 场景              |

## 5. 后续 PR 建议顺序

1. `test: refresh coverage and close remaining G2 gaps`：先刷新覆盖率，再补 TaskBoard/ImageCropper/ImagePreview/Affix。
2. `test: add a11y/theme/sideEffects regression coverage`：覆盖 PR-21 G3/G5/G6。
3. `docs: propose Kanban and TaskBoard consolidation`：先出 PR-18 方案，不急着改 API。
4. `refactor: shared overlay behavior`：处理 feedback 组剩余高价值 P1。
5. `refactor: picker-utils phase 2`：按组件语义扩展共享 picker 行为。
6. `chore: prepare Node 20 toolchain bump`：为 commander 14、未来 Vite/ESLint 工具链要求铺路。

## 6. 已关闭与延期边界

- 已关闭：P0 sideEffects、Tailwind v4、chart-utils 拆分、Table 拆分、Affix/Anchor IO、Tree/ChatWindow virtual、Code/RichText engine 化、examples 重构、TS/Vite/ESLint/vue-router 升级。
- 部分关闭：picker-utils 只完成 Select 侧共享；Composite 去重只完成 FormWizard/CropUpload 的核心工具下沉。
- 明确延期：commander 14 依赖 Node 20+；Kanban/TaskBoard 合并需先过 API 方案。
- 继续跟踪：覆盖率、a11y、视觉回归、bench、剩余 P1 性能项。
