# 09 图表组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

charts 组 21 个组件（C138–C158），视觉与键盘全部 blocked。很多条目是同一段共享代码在不同图上的表现，按下面的顺序做能少改几遍。

## 目标

- 图表的点、扇区、格子能用方向键走，tabindex 跟着焦点。
- 没有 title 时有本地化的默认名称。
- 隐藏的系列不再响应指针。

## 非目标

- 不引入第三方图表库。
- 不为单张图复制一份交互逻辑。

## 依赖与顺序

- OrgChart 的可交互节点都是 tabindex 0，方向键不移动焦点，登记为 T06。横向 rtl 不传 direction，登记为 T07。

## 概览

本篇 8 条：P1 0、P2 5、P3 3。
按波次：W6 5、W9 3。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C141-F01、C141-F02、C141-F03、C144-F01、C145-F01、C145-F02、C138-F01、C139-F01、C139-F02、C146-F01、C147-F01、C149-F01、C150-F03、C152-F01、C155-F02、C155-F03、C156-F02、C147-F02、C147-F03、C147-F05、C148-F01、C148-F02、C146-F02、C149-F02、C149-F03、C150-F01、C153-F02、C151-F01、C154-F01、C154-F02、C158-F01、C158-F02、C138-F02、C140-F01、C141-F04、C145-F03、C146-F03、C146-F04、C147-F04、C148-F03、C148-F04、C148-F05、C149-F04、C149-F05、C149-F06、C150-F02、C151-F02、C153-F01、C153-F03、C153-F04、C154-F03、C154-F04、C155-F01、C155-F04、C156-F01、C157-F01、C157-F02。

## 条目

### C138 AreaChart

报告 `groups/charts/AreaChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C139 BarChart

报告 `groups/charts/BarChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C140 ChartAxis

报告 `groups/charts/ChartAxis.md`，队列状态 needs-evidence。另受 S01、S02 影响。

### C141 ChartCanvas

报告 `groups/charts/ChartCanvas.md`，队列状态 needs-evidence。另受 S01、S02 影响。

### C144 ChartSeries

报告 `groups/charts/ChartSeries.md`，队列状态 needs-evidence。另受 S01、S02 影响。

### C145 ChartTooltip

报告 `groups/charts/ChartTooltip.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目                                                            | 验收                                                                   |
| ---- | ---- | ---- | --- | ---- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| T15  | P3   | W9   | Vue | 类型 | ChartTooltip 运行时有 id，导出的 VueChartTooltipProps 没有 id。 | VueChartTooltipProps 包含 id，把 id 传给 ChartTooltip 时类型检查通过。 |

### C146 FunnelChart

报告 `groups/charts/FunnelChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C147 Gantt

报告 `groups/charts/Gantt.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C148 GaugeChart

报告 `groups/charts/GaugeChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号 | 级别 | 波次 | 端   | 类别   | 条目                                                                    | 验收                                                            |
| ---- | ---- | ---- | ---- | ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| T14  | P2   | W6   | 双端 | 无障碍 | meter 的 aria-label 使用 label 空值合并 title。空字符串不会落到 title。 | label 为空字符串且 title 为「压力」时，meter 的名称是「压力」。 |
| T22  | P3   | W9   | Vue  | 类型   | GaugeChart 运行时有 bind，导出的 VueGaugeChartProps 没有。              | VueGaugeChartProps 包含 bind。                                  |

### C149 HeatmapChart

报告 `groups/charts/HeatmapChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C150 LineChart

报告 `groups/charts/LineChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C151 OrgChart

报告 `groups/charts/OrgChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号 | 级别 | 波次 | 端   | 类别 | 条目                                                                                                | 验收                                                                      |
| ---- | ---- | ---- | ---- | ---- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| T06  | P2   | W6   | 双端 | 键盘 | 可交互节点的 tabindex 都是 0，keydown 只处理 Enter 和 Space。nextOrgChartNodeIndex 没有被组件调用。 | 聚焦一个可交互节点后按方向键，焦点移到几何邻居，其余节点 tabindex 为 -1。 |
| T07  | P2   | W6   | 双端 | i18n | computeOrgChartLayout 支持 direction，横向 rtl 会改节点坐标。两端调用都不传 direction。             | ConfigProvider 为 rtl 且 orientation 为 horizontal 时，节点从右向左排列。 |
| T21  | P3   | W9   | Vue  | 类型 | OrgChart 运行时有 bind，导出的 VueOrgChartProps 没有。                                              | VueOrgChartProps 包含 bind。                                              |

### C152 PieChart

报告 `groups/charts/PieChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C153 RadarChart

报告 `groups/charts/RadarChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C154 SankeyChart

报告 `groups/charts/SankeyChart.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端   | 类别 | 条目                                                                                                                          | 验收                                                                   |
| ---- | ---- | ---- | ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| T25  | P2   | W6   | Core | 文档 | BaseChartProps 把 width 和 height 注释成默认 320 和 200。SankeyChart 两端运行时默认 480 和 280，生成笔记仍写 width 默认 320。 | SankeyChart 的 width、height 注释和生成笔记与运行时默认 480×280 一致。 |

### C155 ScatterChart

报告 `groups/charts/ScatterChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C156 SunburstChart

报告 `groups/charts/SunburstChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C157 TreeMapChart

报告 `groups/charts/TreeMapChart.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

### C158 WaterfallChart

报告 `groups/charts/WaterfallChart.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端   | 类别   | 条目                                                                        | 验收                                                            |
| ---- | ---- | ---- | ---- | ------ | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| T08  | P2   | W6   | 双端 | 无障碍 | 不传 title 时 ChartCanvas 的 accessibleName 为空。locale 没有瀑布图名称键。 | zh-CN 且不传 title 时，svg 的 aria-label 是本地化的瀑布图名称。 |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件        | 报告                           | 并入的条目    |
| ---- | ----------- | ------------------------------ | ------------- |
| C142 | ChartGrid   | `groups/charts/ChartGrid.md`   | S01、S02      |
| C143 | ChartLegend | `groups/charts/ChartLegend.md` | S01、S02、S07 |
