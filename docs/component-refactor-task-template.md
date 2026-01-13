# 组件重构任务模板（单组件）

> 用途：每次开始一个组件时复制本模板，按 Step1-5 逐步推进，确保 API / a11y / theme / tests / docs 一次性收敛。

## 元信息

- 组件：`<ComponentName>`
- 优先级：`P0/P1/P2/P3`
- 目标版本/里程碑：`<optional>`
- 影响范围：Vue / React / Core / Docs / Tests / Demos

## Step1：API 对齐（Props/Events/Slots）

- [ ] Vue props / emits / slots 与 React props 对齐
- [ ] 默认值与边界行为明确（disabled/loading/empty 等）
- [ ] React 原生属性冲突排雷（用 `Omit<...>` 显式剔除）

## Step2：交互与 a11y（基线）

- [ ] 语义正确（role/aria/disabled 等）
- [ ] 键盘可用（Enter/Space/Esc/Tab 视组件而定）
- [ ] 焦点可见（focus ring / focus outline）

## Step3：主题/样式（CSS vars）

- [ ] 所有颜色相关使用 CSS vars + fallback
- [ ] hover/active/disabled/loading 等状态一致
- [ ] class 生成逻辑尽量下沉 `@tigercat/core`（如 `*-utils.ts` / `*-styles.ts`）

## Step4：测试（关键路径）

- [ ] Rendering / Props / Events / States 覆盖
- [ ] 关键交互路径：disabled/loading/keyboard/边界
- [ ] a11y 基线：至少 1 个 no-violations 用例

## Step5：文档与 Demo

- [ ] docs API 表与真实 props/events 对齐
- [ ] 最小可运行示例（Vue + React）
- [ ] 必要时更新 demo（避免示例依赖 core 内部实现）

## 验证

- [ ] `pnpm build` 通过
- [ ] 仅在必要时：跑相关单测（或全量测试）

## 变更记录（摘要）

- `<date>`：`<summary>`
