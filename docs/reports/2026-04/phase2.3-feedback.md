# Phase 2.3 — Feedback 组件剩余任务

> 2026-05-05 执行：完成 overlay 共享层收敛。Tooltip / Popover / Popconfirm 的 Vue Teleport 与 React Portal 统一走框架内 overlay 入口，并让 outside-click 同时识别触发器容器与浮层节点；Esc、点击外部关闭与 Popconfirm 内部按钮行为已通过 Vue / React 单测验证。

> 本页只保留 Feedback 组件仍未完成的优化项。

| 任务           | 对应组件 / 范围                                           | 优先级 | 状态 | 完成标准                                                |
| -------------- | --------------------------------------------------------- | ------ | ---- | ------------------------------------------------------- |
| overlay 共享层 | Modal / Drawer / Popover / Tooltip / Popconfirm / Loading | P0     | Done | 统一 portal/teleport、lock-scroll、focus-trap、Esc 行为 |
