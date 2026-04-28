# Phase 2.3 — Feedback 组件审查 (2026-04)

> 范围：12 个组件 — Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Result, Tooltip, Tour, Watermark
> 共享 utils：`overlay-utils.ts`、`floating-popup-utils.ts`、`floating.ts`、`message-utils.ts`、`notification-utils.ts`、`tour-utils.ts`、`watermark-utils.ts`、`drawer-utils.ts`、`modal-utils.ts`、`tooltip-utils.ts`、`popover-utils.ts`、`popconfirm-utils.ts`、`progress-utils.ts`、`loading-utils.ts`、`result-utils.ts`

## 1. 体积现状

| 组件       | Vue dts | 备注                                  |
| ---------- | ------- | ------------------------------------- |
| Modal      | 7.7 KB  | 较大，含拖拽 / resize / footer 自定义 |
| Drawer     | 6.6 KB  | placement + size + nested             |
| Popconfirm | 4.8 KB  | 内部含 Popover + Button               |
| Popover    | 3.8 KB  | floating UI                           |
| Tooltip    | 3.2 KB  | floating UI                           |
| Loading    | 2.6 KB  | spinner / mask / global               |
| Tour       | 2.8 KB  | 步骤导航 + spotlight                  |
| Watermark  | 3.2 KB  | canvas + repeat                       |
| Progress   | 3.7 KB  | line / circle / dashboard             |

## 2. 代码层优化

| #    | 优化项                                                                                                                                                                                                                                                       | 优先级 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FB1  | **Modal / Drawer / Popover / Tooltip / Popconfirm**：5 个 overlay 组件应共享 `overlay-utils.ts` 提供的 portal/teleport/lock-scroll/focus-trap 完整逻辑，确认无重复实现                                                                                       | **P0** |
| FB2  | **Message / Notification**：全局 `MessageContainer` / `NotificationContainer` 是有副作用的（mount 到 body）。当前 `sideEffects: false` 可能导致 chunk 被 esbuild 标记为 ignored → 需在 `sideEffects` 白名单加 `dist/components/Message.*` / `Notification.*` | **P0** |
| FB3  | **Message / Notification imperative API**：检查是否在两端共享 `imperative-api.ts`（已有 util）                                                                                                                                                               | P1     |
| FB4  | **Tooltip / Popover**：Floating UI middlewares 在每次 mount 都重新构造，应模块级缓存 middleware 工厂                                                                                                                                                         | P1     |
| FB5  | **Progress**：circle 使用 SVG `<circle>` + `stroke-dasharray`，避免使用 `requestAnimationFrame` 手动插值（CSS transition 即可）                                                                                                                              | P1     |
| FB6  | **Tour**：spotlight 用 SVG `<rect>` mask 实现，避免大 box-shadow（性能更好）                                                                                                                                                                                 | P1     |
| FB7  | **Watermark**：canvas → dataURL 后 background-image 重复；改用 `OffscreenCanvas` + ResizeObserver 重绘                                                                                                                                                       | P1     |
| FB8  | **Loading**：global mask 实现应复用 `overlay-utils` 的 lock-scroll / portal 逻辑                                                                                                                                                                             | P1     |
| FB9  | **Modal**：drag-to-move 需使用 `useDrag` hook（已有），避免内部各写一份 mousemove                                                                                                                                                                            | P1     |
| FB10 | **Notification stack**：检查多条同时弹出的 reflow 性能（建议用 `requestAnimationFrame` 批量更新）                                                                                                                                                            | P2     |
| FB11 | **Result**：图标内联 SVG 应抽到 `common-icons.ts`                                                                                                                                                                                                            | P2     |
| FB12 | a11y：所有 overlay 必须支持 `aria-modal` / `aria-labelledby` / `aria-describedby` / focus-trap / Esc 关闭 — 用 `tests/utils/a11y-helpers.ts` 验证                                                                                                            | P1     |

## 3. 样式现代化清单

| 组件                            | 现代化方案                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Modal**                       | `rounded-[var(--tiger-radius-lg,12px)]`；表面 `--tiger-shadow-xl + --tiger-shadow-glass`；mask 使用 `bg-black/40 backdrop-blur-sm`；进入用 `emphasized` easing + 微缩放 0.96→1 |
| **Drawer**                      | 同 Modal；侧边玻璃面板；slide-in 用 spring easing                                                                                                                              |
| **Popover / Tooltip**           | 玻璃表面 + `--tiger-radius-md`；arrow 跟随玻璃模糊；浅色 hover 引导色边                                                                                                        |
| **Popconfirm**                  | 同 Popover + footer 按钮使用现代化 button                                                                                                                                      |
| **Message**                     | 浮动卡片，玻璃 + `--tiger-radius-pill` 形态备选；进入 spring + 微回弹；图标用品牌色脉冲 1 次                                                                                   |
| **Notification**                | 卡片堆叠，hover 时邻接卡片让位（`transform: translateY`）；右侧 progress 条变细到 2px                                                                                          |
| **Loading**                     | 全局 mask 用 `backdrop-blur-md` + 居中卡片玻璃；spinner 改为渐变 stroke + spring rotation                                                                                      |
| **Progress (line)**             | 渐变填充 `--tiger-gradient-primary`；indeterminate 用更长 ease curve                                                                                                           |
| **Progress (circle/dashboard)** | stroke 改为 渐变 `<linearGradient>` 引用                                                                                                                                       |
| **Tour**                        | spotlight 周围 4px halo + 引导卡片玻璃化                                                                                                                                       |
| **Watermark**                   | 支持 `oklch()` 颜色 + 角度抖动                                                                                                                                                 |
| **Result**                      | 图标用渐变填充；CTA 按钮使用现代化样式                                                                                                                                         |

## 4. 演示案例改进

| 组件                           | 缺失/可强化                                      |
| ------------------------------ | ------------------------------------------------ |
| ModalDemo                      | 加 nested modal、drag/resize、async confirm      |
| DrawerDemo                     | 加 multi-level + nested                          |
| MessageDemo / NotificationDemo | 加 stack 演示 + 自定义 icon                      |
| TooltipDemo / PopoverDemo      | 加 placement 全部 12 方位的网格演示              |
| PopconfirmDemo                 | 加异步 onConfirm（loading 状态）                 |
| ProgressDemo                   | 加渐变填充演示                                   |
| TourDemo                       | 当前可能仅基础步骤，加"动态目标 + 滚动到视图"    |
| WatermarkDemo                  | 加防篡改演示（MutationObserver 自恢复）          |
| LoadingDemo                    | 加 `<TigerLoading.Provider>` 全局命令式 API 演示 |

## 5. 风险与依赖

- FB2 是 P0：与 Phase 1B sideEffects 修复绑定
- FB1 影响 5 个组件，建议作为单独 PR
- 玻璃拟态在低端 GPU 设备需提供 `@media (prefers-reduced-transparency: reduce)` fallback
