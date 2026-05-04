# Phase 2.6 — Data 组件剩余任务

> 本页只保留 Data 组件仍未完成的优化项。

| 任务                        | 对应组件 / 范围     | 优先级 | 完成标准                                                             |
| --------------------------- | ------------------- | ------ | -------------------------------------------------------------------- |
| Table resize 批量           | Table               | P1     | 列宽/row height 计算通过 ResizeObserver + rAF 批量，避免频繁同步布局 |
| Table virtual 默认策略      | Table / VirtualList | P1     | 明确大数据是否默认启用 virtual，或提供自动建议/文档与压测数据        |
| table-export-utils 子路径化 | Table export utils  | P1     | export 相关 util 从主入口剥离到子路径或确认保留成本                  |
| Timeline pseudo-element     | Timeline            | P2     | 节点/连接线减少额外 DOM，改用 CSS pseudo-element 或说明保留原因      |
