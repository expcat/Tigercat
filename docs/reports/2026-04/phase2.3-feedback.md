# Phase 2.3 — Feedback 组件剩余任务

> 本页只保留 Feedback 组件仍未完成的优化项。

| 任务                                 | 优先级 | 完成标准                                                                                                          |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| overlay 共享层                       | P0     | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading 统一 portal/teleport、lock-scroll、focus-trap、Esc 行为 |
| Message/Notification imperative 复核 | P1     | 确认两端 imperative API 都复用共享 util，并补 sideEffects 回归测试                                                |
| Floating middleware 缓存             | P1     | Tooltip / Popover 避免每次 mount 重建 middleware；提供稳定工厂或缓存                                              |
| Watermark 绘制优化                   | P1     | 评估 OffscreenCanvas + ResizeObserver 重绘，保留 SSR/浏览器兼容 fallback                                          |
| Loading overlay 复用                 | P1     | 全局 mask 复用 overlay 的 portal 与 lock-scroll 逻辑                                                              |
| Notification stack rAF               | P2     | 多条通知堆叠更新批量到 rAF，减少 reflow                                                                           |
| overlay a11y 回归扩展                | P1     | 所有 overlay 覆盖 `aria-*`、focus trap、Esc、maskClosable 与 axe 扫描                                             |
