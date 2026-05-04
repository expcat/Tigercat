# Phase 2.7 — Charts 组件剩余任务

> 本页只保留 Charts 组件仍未完成的性能与架构项。

| 任务                       | 优先级 | 完成标准                                                                            |
| -------------------------- | ------ | ----------------------------------------------------------------------------------- |
| chart interaction rAF      | P1     | mousemove / hover 更新 throttle 到 `requestAnimationFrame`，并补高频事件测试        |
| ChartCanvas ResizeObserver | P1     | 容器 resize 使用 ResizeObserver + rAF debounce；多个 chart 复用 observer 或共享策略 |
| 数值轴 tick 缓存           | P1     | nice/tick 计算按 scale 输入缓存，避免每帧重复计算                                   |
| Tooltip transform 定位     | P1     | tooltip 跟随使用 transform translate，避免 left/top reflow                          |
| SVG 节点复用               | P1     | series 数量变化时 key 稳定，避免全量重渲；补快照或交互测试                          |
| Pie / Donut 扇区缓存       | P2     | 数据不变时角度计算 memo 化                                                          |
| Heatmap canvas fallback    | P2     | cell 数量过大时提供 canvas fallback 或明确 SVG 上限与文档提示                       |
| TreeMap / Sunburst memo    | P1     | squarify / partition 递归布局 memo 化，并有大数据 benchmark                         |
| Gauge rAF 动画             | P1     | 动画使用 rAF + easing，避免 setInterval                                             |
| Chart benchmark            | P2     | benchmark 覆盖 path、layout、interaction 热路径                                     |
