# Phase 2.6 — Data 组件剩余任务

> 本页只保留 Data 组件仍未完成的优化项。

| 任务                        | 优先级 | 完成标准                                                             |
| --------------------------- | ------ | -------------------------------------------------------------------- |
| Table resize 批量           | P1     | 列宽/row height 计算通过 ResizeObserver + rAF 批量，避免频繁同步布局 |
| Table virtual 默认策略      | P1     | 明确大数据是否默认启用 virtual，或提供自动建议/文档与压测数据        |
| Table sticky 实现复核       | P1     | 固定列尽量依赖 CSS `position: sticky`，减少 JS 同步 scroll           |
| table-export-utils 子路径化 | P1     | export 相关 util 从主入口剥离到子路径或确认保留成本                  |
| Calendar date-utils 复核    | P1     | Calendar 日期算法复用 `date-utils.ts`，避免与 DatePicker 重复        |
| Calendar memo               | P1     | 月切换仅重算受影响周或有 computed/useMemo 缓存与测试                 |
| Collapse rAF transition     | P1     | 高度过渡使用 rAF + CSS transition，不引入 setInterval                |
| Timeline pseudo-element     | P2     | 节点/连接线减少额外 DOM，改用 CSS pseudo-element 或说明保留原因      |
