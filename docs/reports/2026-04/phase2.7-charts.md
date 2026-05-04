# Phase 2.7 — Charts 组件剩余任务

> 本页只保留 Charts 组件仍未完成的性能与架构项。

| 任务                    | 优先级 | 完成标准                                                    |
| ----------------------- | ------ | ----------------------------------------------------------- |
| TreeMap / Sunburst memo | P1     | squarify / partition 递归布局 memo 化，并有大数据 benchmark |
| Gauge rAF 动画          | P1     | 动画使用 rAF + easing，避免 setInterval                     |
| Chart benchmark         | P2     | benchmark 覆盖 path、layout、interaction 热路径             |
