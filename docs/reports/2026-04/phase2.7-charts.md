# Phase 2.7 — Charts 组件剩余任务

> 本页只保留 Charts 组件仍未完成的性能与架构项。

| 任务                    | 对应组件 / 范围                                               | 优先级 | 完成标准                                                                |
| ----------------------- | ------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| TreeMap / Sunburst memo | TreeMapChart / SunburstChart                                  | P1     | squarify / partition 递归布局 memo 化，并有大数据 benchmark             |
| Gauge rAF 动画          | GaugeChart                                                    | P1     | 动画使用 rAF + easing，避免 setInterval                                 |
| Chart benchmark 补齐    | TreeMapChart / SunburstChart / GaugeChart / chart interaction | P2     | benchmark 覆盖 TreeMap/Sunburst layout、Gauge 计算与 interaction 热路径 |
