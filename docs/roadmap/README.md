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

| 优先级 | 项目                    | 范围                                                                                                                        | 完成标准                                                                                                                                                                              |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1     | Example 展示模式改造    | `examples/example/vue3/src/components/DemoBlock.vue`、`examples/example/react/src/components/DemoBlock.tsx`、相关 demo 页面 | DemoBlock 从 `示例 / 代码 / 混合` 改为 `示例 / 代码 / 脚本`；删除混合模式布局；新增脚本模式用于展示该示例所需的 setup、state、handler、mock data 或运行脚本；React/Vue 行为和文案一致 |
| P1     | Example 数据结构统一    | Vue / React demo 页面、可复用 demo 元数据                                                                                   | 每个 DemoBlock 至少支持 `code`，需要时支持 `script`；缺少脚本内容的 demo 不展示空脚本；复制按钮与代码展示在代码/脚本模式都可用；类型定义清晰且不使用 `any`                            |
| P1     | Example 导航与覆盖检查  | `examples/example/shared/app-config.ts`、Vue/React router、demo pages                                                       | 组件导航分组与当前公开组件一致；每个已导出的组件都有对应 demo 页面或明确记录为无需独立 demo；Vue/React demo 覆盖项尽量对齐                                                            |
| P1     | 组件分组文档审查        | Basic、Form、Feedback、Layout、Navigation、Data、Charts、Advanced、Composite                                                | 对每个分组逐项比对共享 Props、Vue 示例、React 示例与源码导出；补齐新增/遗漏 props、默认值、事件、slots/render props、边界状态和主题/i18n 说明                                         |
| P1     | 组件分组 example 审查   | `examples/example/vue3/src/pages`、`examples/example/react/src/pages`                                                       | 每个组件 demo 与当前 API 一致；示例覆盖基础用法、受控/非受控或 v-model、禁用/加载/空态、尺寸/变体、关键交互；移除过时 prop、错误事件名和已废弃模式                                    |
| P2     | 文档与 example 体验优化 | skills 文档、demo 页面文案与布局                                                                                            | 说明文字更聚焦真实使用场景；代码片段可直接复制；复杂组件补充更接近生产场景的数据；移动端和深色模式下 demo 不出现明显布局溢出                                                          |
| P2     | 校验与回归              | build、lint、test、examples build                                                                                           | 完成每组审查后运行相关类型检查/测试；Example 模式改造完成后至少构建 Vue 和 React example，必要时补充 DemoBlock 相关单测或 e2e 检查                                                    |

## 推荐执行顺序

1. 先改造 React/Vue DemoBlock 的展示模式，确定 `script` 字段 API 与复用样式。
2. 选择 2-3 个代表性 demo 页面迁移到 `示例 / 代码 / 脚本`，覆盖简单组件、表单组件和复杂组件。
3. 批量迁移剩余 demo 页面，并同步清理所有 `mixed` 命名、文案和测试期望。
4. 按 Basic -> Form -> Feedback -> Layout -> Navigation -> Data -> Charts -> Advanced -> Composite 的顺序审查文档和 example。
5. 每完成一个分组，更新对应 skills 文档、demo 页面和必要测试，再从本文档删除已完成的分组任务。

## 分组审查清单

| 分组       | 共享 Props                                              | Vue 文档                                       | React 文档                                       | Example                   |
| ---------- | ------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ | ------------------------- |
| Basic      | `skills/tigercat/references/shared/props/basic.md`      | `skills/tigercat/references/vue/basic.md`      | `skills/tigercat/references/react/basic.md`      | basic 导航分组与页面      |
| Form       | `skills/tigercat/references/shared/props/form.md`       | `skills/tigercat/references/vue/form.md`       | `skills/tigercat/references/react/form.md`       | form 导航分组与页面       |
| Feedback   | `skills/tigercat/references/shared/props/feedback.md`   | `skills/tigercat/references/vue/feedback.md`   | `skills/tigercat/references/react/feedback.md`   | feedback 导航分组与页面   |
| Layout     | `skills/tigercat/references/shared/props/layout.md`     | `skills/tigercat/references/vue/layout.md`     | `skills/tigercat/references/react/layout.md`     | layout 导航分组与页面     |
| Navigation | `skills/tigercat/references/shared/props/navigation.md` | `skills/tigercat/references/vue/navigation.md` | `skills/tigercat/references/react/navigation.md` | navigation 导航分组与页面 |
| Data       | `skills/tigercat/references/shared/props/data.md`       | `skills/tigercat/references/vue/data.md`       | `skills/tigercat/references/react/data.md`       | data 导航分组与页面       |
| Charts     | `skills/tigercat/references/shared/props/charts.md`     | `skills/tigercat/references/vue/charts.md`     | `skills/tigercat/references/react/charts.md`     | charts 导航分组与页面     |
| Advanced   | `skills/tigercat/references/shared/props/advanced.md`   | `skills/tigercat/references/vue/advanced.md`   | `skills/tigercat/references/react/advanced.md`   | advanced 导航分组与页面   |
| Composite  | `skills/tigercat/references/shared/props/composite.md`  | `skills/tigercat/references/vue/composite.md`  | `skills/tigercat/references/react/composite.md`  | composite 导航分组与页面  |
