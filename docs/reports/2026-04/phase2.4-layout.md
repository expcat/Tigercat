# Phase 2.4 — Layout 组件剩余任务

> 本页只保留 Layout 组件仍未完成的结构和性能项。

> 2026-05-05 执行：完成 List virtual mode。Vue / React List 新增 `virtual`、`virtualHeight`、`virtualItemHeight`、`virtualOverscan` props，非 grid 列表在 virtual 模式下复用现有 VirtualList 渲染当前数据窗口，避免再维护独立虚拟逻辑；补充 Vue / React 回归测试确认大列表不会整表渲染。

| 任务                           | 对应组件 / 范围      | 优先级 | 完成标准                                                          |
| ------------------------------ | -------------------- | ------ | ----------------------------------------------------------------- |
| Row / Col 样式计算优化         | Row / Col            | P1     | 减少每个 Col 的 inline style 计算，评估 CSS grid / CSS vars 方案  |
| Splitter / Resizable drag 复用 | Splitter / Resizable | P1     | 组件内 mousemove 逻辑收敛到 `useDrag` 或 core drag helper         |
| List virtual mode              | List / VirtualList   | P0     | Done：List 复用 VirtualList，而不是保留独立虚拟逻辑或缺失虚拟路径 |
| Statistic 动画                 | Statistic            | P1     | 数字滚动动画使用 rAF + easing，并有测试覆盖                       |
| Descriptions 大列表性能        | Descriptions         | P2     | 对 100+ items columns/rows 合并算法做复杂度测试或 benchmark       |
| Container 组件必要性           | Container            | P2     | 评估是否改为 class util；若保留组件，说明体积与 API 理由          |
