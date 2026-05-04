# Phase 2.3 — Feedback 组件剩余任务

> 本页只保留 Feedback 组件仍未完成的优化项。

| 任务                     | 对应组件 / 范围                                           | 优先级 | 完成标准                                                                 |
| ------------------------ | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| overlay 共享层           | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading | P0     | 统一 portal/teleport、lock-scroll、focus-trap、Esc 行为                  |
| Floating middleware 缓存 | Tooltip / Popover / Popconfirm                            | P1     | 避免每次 mount 重建 middleware；提供稳定工厂或缓存                       |
| Watermark 绘制优化       | Watermark                                                 | P1     | 评估 OffscreenCanvas + ResizeObserver 重绘，保留 SSR/浏览器兼容 fallback |
| Loading overlay 复用     | Loading / Modal / Drawer                                  | P1     | 全局 mask 复用 overlay 的 portal 与 lock-scroll 逻辑                     |
| Notification stack rAF   | Notification                                              | P2     | 多条通知堆叠更新批量到 rAF，减少 reflow                                  |
