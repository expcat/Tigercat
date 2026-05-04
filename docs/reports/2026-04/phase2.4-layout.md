# Phase 2.4 — Layout 组件剩余任务

> 本页只保留 Layout 组件仍未完成的结构和性能项。

| 任务                           | 优先级 | 完成标准                                                         |
| ------------------------------ | ------ | ---------------------------------------------------------------- |
| Row / Col 样式计算优化         | P1     | 减少每个 Col 的 inline style 计算，评估 CSS grid / CSS vars 方案 |
| Splitter / Resizable drag 复用 | P1     | 组件内 mousemove 逻辑收敛到 `useDrag` 或 core drag helper        |
| Carousel passive touch         | P1     | 触摸监听明确使用 `{ passive: true }`，避免滚动 jank              |
| List virtual mode              | P0     | List 复用 VirtualList，而不是保留独立虚拟逻辑或缺失虚拟路径      |
| Statistic 动画                 | P1     | 数字滚动动画使用 rAF + easing，并有测试覆盖                      |
| Descriptions 大列表性能        | P2     | 对 100+ items columns/rows 合并算法做复杂度测试或 benchmark      |
| Container 组件必要性           | P2     | 评估是否改为 class util；若保留组件，说明体积与 API 理由         |
