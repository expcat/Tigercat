# Tigercat 后续优化路线图

<!-- LLM-INDEX
type: active-roadmap
scope: docs and examples follow-up work only
verified-date: 2026-05-06
source: user-requested next optimization plan
-->

本文档只记录下一轮可执行规划。已完成的历史任务、阶段报告说明和旧评估结论不再保留；后续 Agent 完成条目后，应直接删除对应条目或将剩余工作合并到新的待办中。

## 执行原则

1. 以 `packages/core/src`、`packages/vue/src`、`packages/react/src` 和公开导出入口为当前组件最新版的判断来源。
2. 审查文档时同步覆盖 `skills/tigercat/references/shared/props`、`skills/tigercat/references/vue`、`skills/tigercat/references/react`。
3. 审查 example 时只修改 `examples/example/shared`、`examples/example/vue3/src`、`examples/example/react/src`；不要把 `dist`、coverage、报告产物作为规划依据。
4. 文档与 example 的改动应保持 Vue 事件 kebab-case、React 事件 camelCase，并优先沿用现有 DemoBlock、路由和分组配置。

## 后续步骤

| 优先级 | 项目                    | 范围                                                                                                                        | 完成标准                                                                                                                                                                              | 状态 |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| P1     | Example 展示模式改造    | `examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/react/src/components/DemoBlock.tsx`、相关 demo 页面 | DemoBlock 从 `示例 / 代码 / 混合` 改为 `示例 / 代码 / 脚本`；删除混合模式布局；新增脚本模式用于展示该示例所需的 setup、state、handler、mock data 或运行脚本；React/Vue 行为和文案一致 | ✅ 已完成 |
| P1     | Example 数据结构统一    | Vue / React demo 页面、可复用 demo 元数据                                                                                   | 每个 DemoBlock 至少支持 `code`，需要时支持 `script`；缺少脚本内容的 demo 不展示空脚本；复制按钮与代码展示在代码/脚本模式都可用；类型定义清晰且不使用 `any`                            | ✅ 已完成 |
| P1     | Example 代表性迁移      | ButtonDemo、InputDemo、TableDemo（React + Vue）                                                                              | 3 个代表性 demo（简单/表单/复杂）已迁移到新的 `示例 / 代码 / 脚本` 模式，有 state/handler 逻辑的 DemoBlock 已添加 `script` 属性                                                      | ✅ 已完成 |
| P1     | 剩余 demo 页面批量迁移  | 所有 Vue/React demo 页面                                                                                                     | 所有有 state/handler/mock data 的 DemoBlock 补齐 `script` 属性                                                                                                                        | ✅ 已完成 |
| P1     | Example 导航与覆盖检查  | `examples/example/shared/app-config.ts`、Vue/React router、demo pages                                                       | 组件导航分组与当前公开组件一致；每个已导出的组件都有对应 demo 页面或明确记录为无需独立 demo；Vue/React demo 覆盖项尽量对齐                                                            | ✅ 已完成 |
| P1     | 组件分组文档审查        | Basic、Form、Feedback、Layout、Navigation、Data、Charts、Advanced、Composite                                                | 对每个分组逐项比对共享 Props、Vue 示例、React 示例与源码导出；补齐新增/遗漏 props、默认值、事件、slots/render props、边界状态和主题/i18n 说明                                         | ✅ 已完成 |
| P1     | 组件分组 example 审查   | `examples/example/vue3/src/pages`、`examples/example/react/src/pages`                                                       | 每个组件 demo 与当前 API 一致；示例覆盖基础用法、受控/非受控或 v-model、禁用/加载/空态、尺寸/变体、关键交互；移除过时 prop、错误事件名和已废弃模式                                    | ✅ 与文档审查同步完成 |
| P2     | 文档与 example 体验优化 | skills 文档、demo 页面文案与布局                                                                                            | 说明文字更聚焦真实使用场景；代码片段可直接复制；复杂组件补充更接近生产场景的数据；移动端和深色模式下 demo 不出现明显布局溢出                                                          | 待开始 |
| P2     | 校验与回归              | build、lint、test、examples build                                                                                           | 完成每组审查后运行相关类型检查/测试；Example 模式改造完成后至少构建 Vue 和 React example，必要时补充 DemoBlock 相关单测或 e2e 检查                                                    | 待开始 |

## 推荐执行顺序

1. ~~先改造 React/Vue DemoBlock 的展示模式，确定 `script` 字段 API 与复用样式。~~ ✅
2. ~~选择 2-3 个代表性 demo 页面迁移到 `示例 / 代码 / 脚本`，覆盖简单组件、表单组件和复杂组件。~~ ✅
3. ~~批量迁移剩余 demo 页面，并同步清理所有 `mixed` 命名、文案和测试期望。~~ ✅
4. ~~导航与覆盖检查：确认 10 个分组 93 项导航与路由、Demo 页面三端同步，Vue/React 各 104 个 Demo 文件完全镜像。~~ ✅
5. ~~按 Basic -> Form -> Feedback -> Layout -> Navigation -> Data -> Charts -> Advanced -> Composite 的顺序审查文档和 example。~~ ✅
6. ~~每完成一个分组，更新对应 skills 文档、demo 页面和必要测试，再从本文档删除已完成的分组任务。~~ ✅
7. **下一步**：P2 文档与 example 体验优化 + 校验与回归。

## 导航覆盖审计结论（2026-05-06）

- **导航 ↔ 路由 ↔ Demo 页面三端完全同步**：10 个分组、93 个导航条目，Vue/React 各 104 个 Demo 文件完全镜像
- **以下导出无独立导航入口，已确认为合理（无需独立 Demo）：**
  - `InputNumber`：在 InputDemo 中有完整专区（基础/范围/精度/尺寸/状态/按钮位置/格式化）
  - `Container`：在 LayoutDemo 首个 DemoBlock 中展示
  - `ConfigProvider` / `useTigerConfig`：全局配置工具，Home 页已提及用法
  - `useFormController`：表单控制 composable，建议在 Form 分组审查时补充到 FormDemo
  - 子组件（`ButtonGroup`、`FormItem`、`CollapsePanel`、`TabPane` 等）：在各自父组件 Demo 中展示
  - 图表构建块（`ChartCanvas`、`ChartAxis` 等）：底层 API，无独立导航需求
- **Vue `UseControlledStateDemo.vue`**：说明页，解释 Vue 用 `v-model` 替代此 React-only hook，导航已标注 `(React)`，无需修改

## 分组审查清单

| 分组       | 共享 Props                                              | Vue 文档                                       | React 文档                                       | Example                   |
| ---------- | ------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ | ------------------------- |
| Basic      | `skills/tigercat/references/shared/props/basic.md`      | `skills/tigercat/references/vue/basic.md`      | `skills/tigercat/references/react/basic.md`      | ✅ 已审查               |
| Form       | `skills/tigercat/references/shared/props/form.md`       | `skills/tigercat/references/vue/form.md`       | `skills/tigercat/references/react/form.md`       | ✅ 已审查               |
| Feedback   | `skills/tigercat/references/shared/props/feedback.md`   | `skills/tigercat/references/vue/feedback.md`   | `skills/tigercat/references/react/feedback.md`   | ✅ 已审查               |
| Layout     | `skills/tigercat/references/shared/props/layout.md`     | `skills/tigercat/references/vue/layout.md`     | `skills/tigercat/references/react/layout.md`     | ✅ 已审查               |
| Navigation | `skills/tigercat/references/shared/props/navigation.md` | `skills/tigercat/references/vue/navigation.md` | `skills/tigercat/references/react/navigation.md` | ✅ 已审查               |
| Data       | `skills/tigercat/references/shared/props/data.md`       | `skills/tigercat/references/vue/data.md`       | `skills/tigercat/references/react/data.md`       | ✅ 已审查               |
| Charts     | `skills/tigercat/references/shared/props/charts.md`     | `skills/tigercat/references/vue/charts.md`     | `skills/tigercat/references/react/charts.md`     | ✅ 已审查               |
| Advanced   | `skills/tigercat/references/shared/props/advanced.md`   | `skills/tigercat/references/vue/advanced.md`   | `skills/tigercat/references/react/advanced.md`   | ✅ 已审查               |
| Composite  | `skills/tigercat/references/shared/props/composite.md`  | `skills/tigercat/references/vue/composite.md`  | `skills/tigercat/references/react/composite.md`  | ✅ 已审查               |
