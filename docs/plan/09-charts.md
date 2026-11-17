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

- 默认可访问名称一组一起做：C155-F01、C156-F01、C157-F01，都是无 title 时没读 `*ChartAriaLabel`。
- OrgChart 的节点全是 `tabindex=0`、方向键无效，TreeMapChart 的 `nextTreeMapNodeIndex` 没有调用方。这两处报告没有编号，见 [13](13-evidence.md) 的未立项观察。

## 概览

本篇 5 条：P1 0、P2 0、P3 5。
按波次：W9 5。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C141-F01、C141-F02、C141-F03、C144-F01、C145-F01、C145-F02、C138-F01、C139-F01、C139-F02、C146-F01、C147-F01、C149-F01、C150-F03、C152-F01、C155-F02、C155-F03、C156-F02、C147-F02、C147-F03、C147-F05、C148-F01、C148-F02、C146-F02、C149-F02、C149-F03、C150-F01、C153-F02、C151-F01、C154-F01、C154-F02、C158-F01、C158-F02、C138-F02、C140-F01、C141-F04、C145-F03、C146-F03、C146-F04、C147-F04、C148-F03、C148-F04、C148-F05、C149-F04、C149-F05、C149-F06、C150-F02、C151-F02、C153-F01、C153-F03、C153-F04、C154-F03、C154-F04。

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

### C146 FunnelChart

报告 `groups/charts/FunnelChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C147 Gantt

报告 `groups/charts/Gantt.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C148 GaugeChart

报告 `groups/charts/GaugeChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C149 HeatmapChart

报告 `groups/charts/HeatmapChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C150 LineChart

报告 `groups/charts/LineChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C151 OrgChart

报告 `groups/charts/OrgChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C152 PieChart

报告 `groups/charts/PieChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C153 RadarChart

报告 `groups/charts/RadarChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

### C154 SankeyChart

报告 `groups/charts/SankeyChart.md`，队列状态 needs-evidence。另受 S01 影响。

### C155 ScatterChart

报告 `groups/charts/ScatterChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                   | 验收                                                                                      |
| -------- | ---- | ---- | ----- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| C155-F01 | P3   | W9   | 双端  | 无障碍 | 无 title 时 svg 没有默认可访问名称     | zh-CN 下不传 title 时 svg 的 aria-label 为「散点图」；传 title=季度 时为「季度」          |
| C155-F04 | P3   | W9   | React | 行为   | 只传 onPointClick 时两端图例标签不一致 | showLegend 且只传 onPointClick 时两端图例项都是 DIV，点击第一点 onPointClick 仍只调用一次 |

### C156 SunburstChart

报告 `groups/charts/SunburstChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                               | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| C156-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称 | zh-CN 下不传 title 时 svg 的 aria-label 为「旭日图」；传 title=区域 时为「区域」 |

### C157 TreeMapChart

报告 `groups/charts/TreeMapChart.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                   | 验收                                                                                            |
| -------- | ---- | ---- | ---- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C157-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称     | zh-CN 下不传 title 时 svg 的 aria-label 为「矩形树图」；传 title=份额 时为「份额」              |
| C157-F02 | P3   | W9   | 双端 | 键盘   | 方向键按布局顺序线性移动，不走几何邻居 | 两片叶子并排、只传 onNodeClick，聚焦第一块按 ArrowDown 焦点留在第一块，按 ArrowRight 才到第二块 |

### C158 WaterfallChart

报告 `groups/charts/WaterfallChart.md`，队列状态 needs-evidence。另受 S01 影响。

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件        | 报告                           | 并入的条目    |
| ---- | ----------- | ------------------------------ | ------------- |
| C142 | ChartGrid   | `groups/charts/ChartGrid.md`   | S01、S02      |
| C143 | ChartLegend | `groups/charts/ChartLegend.md` | S01、S02、S07 |
