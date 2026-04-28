# Phase 2.7 — Charts 组件审查 (2026-04)

> 范围：17 个组件 — AreaChart, BarChart, ChartCanvas, ChartAxis, ChartGrid, ChartSeries, ChartLegend, ChartTooltip, DonutChart, FunnelChart, GaugeChart, HeatmapChart, LineChart, PieChart, RadarChart, ScatterChart, SunburstChart, TreeMapChart
> 共享 utils：`chart-utils.ts` (28 KB)、`chart-shared.ts` (4.3 KB)、`chart-interaction.ts`、`funnel-chart-utils.ts`、`gauge-chart-utils.ts`、`heatmap-chart-utils.ts`、`treemap-chart-utils.ts`、`sunburst-chart-utils.ts`

## 1. 体积现状

| 组件               | Vue dts        | 备注                     |
| ------------------ | -------------- | ------------------------ |
| **chart-utils.ts** | **28 KB 源码** | 横切共享（不算入单组件） |
| RadarChart         | 10.3 KB        | 较大                     |
| LineChart          | 9.9 KB         |                          |
| ScatterChart       | 9.3 KB         |                          |
| DonutChart         | 7.5 KB         |                          |
| PieChart           | 6.9 KB         |                          |
| FunnelChart        | 5.3 KB         |                          |
| HeatmapChart       | 5.1 KB         |                          |
| SunburstChart      | 5.1 KB         |                          |
| TreeMapChart       | 5.2 KB         |                          |
| GaugeChart         | 3.8 KB         |                          |
| BarChart           | —              |                          |
| AreaChart          | —              |                          |

> 17 个 chart 单独按需加载是 tree-shaking 关键。

## 2. 代码层优化

| #   | 优化项                                                                                                                                                   | 优先级 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C1  | **chart-utils.ts 拆分**：28 KB 单文件应拆为 `chart/scale.ts` + `axis.ts` + `path.ts` (svg path 字符串工厂) + `format.ts` + `color.ts` + `interpolate.ts` | **P0** |
| C2  | **Path 字符串构造**：每次渲染都拼接新字符串，建议在 `chart-utils` 用 `Array.join` 而非字符串 `+`                                                         | P1     |
| C3  | **数值轴 tick 算法**：使用 d3-scale 风格的 nice() 算法，避免重复计算（每帧都跑）                                                                         | P1     |
| C4  | **chart-interaction.ts**：mousemove 必须 throttle 到 `requestAnimationFrame`；当前 hook (`useChartInteraction`) 检查实现                                 | P1     |
| C5  | **Tooltip 跟随**：transform translate 而非 left/top；避免每帧 reflow                                                                                     | P1     |
| C6  | **Legend 同步**：series 高亮态应通过 context 传递，避免 props 链                                                                                         | P2     |
| C7  | **SVG 节点复用**：series 数量变化时使用 `key` + 复用元素，避免全量重渲                                                                                   | P1     |
| C8  | **DonutChart / PieChart**：扇区角度计算可缓存 (data 不变时)                                                                                              | P2     |
| C9  | **HeatmapChart**：cell 数量大（>10000）时建议改 canvas fallback                                                                                          | P2     |
| C10 | **TreeMap / Sunburst**：递归布局算法（squarify / partition）需 memo 化                                                                                   | P1     |
| C11 | **GaugeChart**：动画用 `requestAnimationFrame` + cubic-bezier；避免 setInterval                                                                          | P1     |
| C12 | **Chart 配色**：所有 chart 默认色应来自 `THEME_CSS_VARS.chart1..6`，确认无硬编码色                                                                       | **P0** |
| C13 | **响应式**：chart 容器 resize 用 ResizeObserver + rAF debounce；多 chart 共用一个 observer                                                               | P1     |

## 3. 样式现代化清单

| 组件                             | 现代化方案                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **所有 chart**                   | 默认 stroke 用 `--tiger-chart-1..6` 渐变 (`<linearGradient>` defs)；hover series 玻璃描边 + halo                     |
| **LineChart / AreaChart**        | line 端点圆滑；area 填充改为渐变 alpha (`from primary 30% to primary 0%`)；hover 时 emphasis line stroke 加粗 spring |
| **BarChart**                     | bar 顶部圆角 `--tiger-radius-sm`；进入用 emphasized easing 从底部展开；hover bar 加微渐变高亮                        |
| **PieChart / DonutChart**        | hover 扇区径向外推 spring；center 文字玻璃化（DonutChart）                                                           |
| **ScatterChart**                 | 点 hover 加 4px halo + spring 缩放                                                                                   |
| **RadarChart**                   | 多边形填充用渐变 alpha；网格线柔化                                                                                   |
| **FunnelChart**                  | 各段渐变填充 + 微边距                                                                                                |
| **GaugeChart**                   | 圆弧渐变填充；指针 spring 旋转 + emphasized easing；中心数字 tabular-nums                                            |
| **HeatmapChart**                 | cell 圆角 `--tiger-radius-sm`；色阶用 `oklch()` 提供视觉一致性                                                       |
| **TreeMapChart / SunburstChart** | 块圆角 `--tiger-radius-sm`；间距 2px；hover 提亮                                                                     |
| **ChartLegend**                  | 标记圆点改为渐变；hover 整行玻璃微亮                                                                                 |
| **ChartTooltip**                 | 玻璃面板 + `--tiger-radius-md` + `--tiger-shadow-glass`；进入 spring + 微缩放                                        |
| **ChartAxis**                    | tick 文字 tabular-nums；轴线柔化                                                                                     |

## 4. 演示案例改进

| 组件                                 | 缺失/可强化                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **AreaChartDemo / LineChartDemo**    | 加 stack / smooth / multi-series + tooltip 同步 + 大数据 (10k 点) 演示                             |
| **BarChartDemo**                     | 加 stacked / grouped / horizontal + 渐变填充                                                       |
| **PieChart / DonutChartDemo**        | 加交互（点击切换 series 显隐）+ 中心 KPI 演示                                                      |
| **RadarChartDemo**                   | 加多边形 / 圆形两种网格 + 多 series 半透叠加                                                       |
| **ScatterChartDemo**                 | 加气泡尺寸映射 + 颜色映射                                                                          |
| **HeatmapChartDemo**                 | 加 calendar heatmap (GitHub 风) 演示                                                               |
| **TreeMapChart / SunburstChartDemo** | 加 drilldown 演示                                                                                  |
| **FunnelChartDemo**                  | 加 conversion 标签                                                                                 |
| **GaugeChartDemo**                   | 加多个 metrics dashboard                                                                           |
| **共用**                             | 加"现代化主题"对比按钮（默认 vs modern）；加暗色模式联动；加 ChartLegend / ChartTooltip 自定义示例 |

## 5. 风险与依赖

- C1 (chart-utils 拆分) 是 P0，影响所有 chart；分多个 PR 渐进
- C12 (硬编码色清理) 是 P0，必须保证主题切换 / 暗色模式生效
- 渐变填充需要 `<defs>` + `<linearGradient>` 全 chart 一致约定
- 性能：HeatmapChart/Scatter 大数据场景下玻璃 tooltip 的 backdrop-blur 需可关闭
