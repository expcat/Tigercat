# Phase 2.6 — Data 组件剩余任务

> 本页只保留 Data 组件仍未完成的优化项。

> 2026-05-05 执行：完成 Table 性能二期。Table 新增 ResizeObserver + rAF 批量测量工具，Vue / React Table 用测得列宽更新 fixed column offset 并记录行高快照；virtual 策略明确为不自动启用，超过 `virtualThreshold` 时提供 `data-tiger-virtual-recommended="true"` 建议信号；CSV export 工具剥离到 `@expcat/tigercat-core/utils/table-export` 子路径。

| 任务                        | 对应组件 / 范围     | 优先级 | 完成标准                                                                   |
| --------------------------- | ------------------- | ------ | -------------------------------------------------------------------------- |
| Table resize 批量           | Table               | P1     | Done：列宽/row height 计算通过 ResizeObserver + rAF 批量，避免频繁同步布局 |
| Table virtual 默认策略      | Table / VirtualList | P1     | Done：明确不默认启用 virtual，超过阈值提供自动建议信号与文档说明           |
| table-export-utils 子路径化 | Table export utils  | P1     | Done：export 相关 util 从主入口剥离到子路径                                |
| Timeline pseudo-element     | Timeline            | P2     | 节点/连接线减少额外 DOM，改用 CSS pseudo-element 或说明保留原因            |
