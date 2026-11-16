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

- 先做 ChartTooltip（C145）和 AreaChart 上的共享条目（C138-F02），它们并入了 6 到 10 张图。
- 默认可访问名称一组一起做：C149-F05、C150-F02、C153-F01、C155-F01、C156-F01、C157-F01，都是无 title 时没读 `*ChartAriaLabel`。
- OrgChart 的节点全是 `tabindex=0`、方向键无效，TreeMapChart 的 `nextTreeMapNodeIndex` 没有调用方。这两处报告没有编号，见 [13](13-evidence.md) 的未立项观察。

## 概览

本篇 30 条：P1 0、P2 5、P3 25。
按波次：W6 5、W9 25。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C141-F01、C141-F02、C141-F03、C144-F01、C145-F01、C145-F02、C138-F01、C139-F01、C139-F02、C146-F01、C147-F01、C149-F01、C150-F03、C152-F01、C155-F02、C155-F03、C156-F02、C147-F02、C147-F03、C147-F05、C148-F01、C148-F02、C146-F02、C149-F02、C149-F03、C150-F01、C153-F02。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                               | 归属         | 同验                                                                                                                        |
| -------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| C138-F02 responsive 注释默认 false，实际 true      | AreaChart    | BarChart、FunnelChart、GaugeChart、HeatmapChart、LineChart、PieChart、RadarChart、ScatterChart、SunburstChart、TreeMapChart |
| C145-F03 content 只有换行时仍挂载空气泡            | ChartTooltip | FunnelChart、GaugeChart、HeatmapChart、LineChart、ScatterChart、SunburstChart、TreeMapChart                                 |
| C146-F04 padding 注释默认是坐标轴对象，运行时是 24 | FunnelChart  | Gantt、GaugeChart、OrgChart、PieChart、RadarChart                                                                           |

## 条目

### C138 AreaChart

报告 `groups/charts/AreaChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                 | 验收                                                                                |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| C138-F02 | P3   | W9   | Core | 文档 | responsive 注释默认 false，实际 true | responsive 的 @default 注释与两端不传该 prop 时的行为（根 class 是否含 w-full）一致 |

### C139 BarChart

报告 `groups/charts/BarChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02 影响。

### C140 ChartAxis

报告 `groups/charts/ChartAxis.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                   | 验收                                                                            |
| -------- | ---- | ---- | ----- | ------ | -------------------------------------- | ------------------------------------------------------------------------------- |
| C140-F01 | P3   | W9   | React | 无障碍 | React 根丢调用方 aria-hidden，Vue 保留 | 根传 aria-hidden=true 时 React 与 Vue 的根 g 结果一致；不传时两端根都没有该属性 |

### C141 ChartCanvas

报告 `groups/charts/ChartCanvas.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                              | 验收                                                                      |
| -------- | ---- | ---- | --- | ---- | --------------------------------- | ------------------------------------------------------------------------- |
| C141-F04 | P3   | W9   | Vue | 行为 | Vue 不发初始 resolved-size-change | Vue 传 width=0、height=0 挂载后 emit 一次 resolved-size-change（320×200） |

### C144 ChartSeries

报告 `groups/charts/ChartSeries.md`，队列状态 needs-evidence。另受 S01、S02 影响。

### C145 ChartTooltip

报告 `groups/charts/ChartTooltip.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                           | 验收                                                                                         |
| -------- | ---- | ---- | ---- | ---- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| C145-F03 | P3   | W9   | 双端 | 行为 | content 只有换行时仍挂载空气泡 | open 且 content 为单个换行时两端都不挂 role=tooltip 节点，与空字符串一致；a 换行 b 仍渲染 ul |

### C146 FunnelChart

报告 `groups/charts/FunnelChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端               | 类别 | 条目                                            | 验收                                                                             |
| -------- | ---- | ---- | ---------------- | ---- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| C146-F03 | P3   | W9   | Core+文档·生成器 | 文档 | gradient 注释和生成表写垂直渐变，水平时实际沿 x | gradient 的类型注释和生成表 funnel-chart.md 都写沿漏斗方向渐变，不再写垂直       |
| C146-F04 | P3   | W9   | Core             | 文档 | padding 注释默认是坐标轴对象，运行时是 24       | FunnelChartProps.padding 的 JSDoc 显示 @default 24，不再是 bottom/left 52 的对象 |

### C147 Gantt

报告 `groups/charts/Gantt.md`，队列状态 needs-evidence。另受 S01、S07、C146-F04 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                                          | 验收                                                                                       |
| -------- | ---- | ---- | --- | ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| C147-F04 | P3   | W9   | Vue | 样式 | Vue 任务名没有 clipPath，长标签不受标签栏限制 | 任务名超出 taskLabelWidth 时，Vue 文字带 clip-path，指向按 labelX、labelWidth 建的裁切矩形 |

### C148 GaugeChart

报告 `groups/charts/GaugeChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03、C146-F04 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                         | 验收                                                                                       |
| -------- | ---- | ---- | --------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| C148-F03 | P3   | W9   | Core+双端 | 行为   | min≥max 时刻度标签全相同、aria 区间颠倒      | min 100、max 0、tickCount 4 时只有一个刻度标签，aria-valuemin 不大于 aria-valuemax         |
| C148-F04 | P3   | W9   | Vue       | 无障碍 | Vue 装饰节点没有 aria-hidden，React 有       | Vue 默认仪表的 DOM 和 SSR 字符串里，轨道、弧、刻度、针、圆心和文字的 aria-hidden 都是 true |
| C148-F05 | P3   | W9   | 双端+Core | 行为   | segments 存在时 value 弧仍引用渐变，违背注释 | gradient、segments 盖满 0 到 100、value 72 时 value 弧 fill 不以 url(# 开头，或注释已改    |

### C149 HeatmapChart

报告 `groups/charts/HeatmapChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                     | 验收                                                                                      |
| -------- | ---- | ---- | ---- | ------ | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| C149-F04 | P3   | W9   | 双端 | i18n   | RTL 下行标签不跟随书写方向               | ConfigProvider direction 为 rtl 时行标签在绘图区右侧且 text-anchor 为 start，列仍从左到右 |
| C149-F05 | P3   | W9   | 双端 | 无障碍 | 无标题时未用 heatmapChartAriaLabel       | 不传 title、locale 为 zh-CN 时，热力图 SVG 的可访问名称是「热力图」                       |
| C149-F06 | P3   | W9   | Core | 样式   | 空格填色写死 #f3f4f6，不随主题也不能覆盖 | 缺数据的格子 fill 不再恒为 #f3f4f6，暗色下跟随主题 token 或能被 emptyColor 覆盖           |

### C150 LineChart

报告 `groups/charts/LineChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                            | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ------------------------------- | -------------------------------------------------------------------------------- |
| C150-F02 | P3   | W9   | 双端 | 无障碍 | 无标题时未用 lineChartAriaLabel | zh-CN Provider 下不传 title 时，svg 的 aria-label 是「折线图」，SSR 字符串里也有 |

### C151 OrgChart

报告 `groups/charts/OrgChart.md`，队列状态 needs-evidence。另受 S01、S07、C146-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                  | 验收                                                                                            |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C151-F01 | P2   | W6   | Demo | 示例 | 02 Demo 用被拒绝的 data: 地址演示头像 | 两端 org-chart/02 的节点渲染出 image，href 是 https 或站内路径；或标题和描述不再称头像演示      |
| C151-F02 | P3   | W9   | 双端 | 样式 | 节点文字 y 写死，不随 nodeHeight 变   | nodeHeight 为 48 且节点有 label、title、subtitle 时，画出的每行文字 y 都小于 48，放不下的行不画 |

### C152 PieChart

报告 `groups/charts/PieChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C146-F04 影响。

### C153 RadarChart

报告 `groups/charts/RadarChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C146-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                              | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| C153-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称                | zh-CN 下不传 title 时 svg 的 aria-label 为「雷达图」；传 title=能力 时为「能力」 |
| C153-F03 | P3   | W9   | 双端 | 行为   | RadarChartSeries.className 不生效                 | 系列带 className=series-extra 时，两端该系列 g 的 class 含 series-extra          |
| C153-F04 | P3   | W9   | Core | 行为   | 负值警告写 skipped，点却以 0 留在中心并发布给提示 | 某指标值为 -5 时悬停该点，提示不再显示「速度: 0」这一合成值                      |

### C154 SankeyChart

报告 `groups/charts/SankeyChart.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                   | 验收                                                                                            |
| -------- | ---- | ---- | --------- | ---- | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C154-F01 | P2   | W6   | 双端      | 行为 | 节点 label 不画出，也不是可访问名称    | 节点 label 为「来源」「左支」时，两端 DOM 与 SSR 标记里出现该文本，或对应 rect 带这个可访问名称 |
| C154-F02 | P2   | W6   | 双端      | 行为 | padding 写死 16，desc 未传给画布       | padding=40 并传 desc 时内层 g 为 translate(40, 40)，SVG 里有 desc 元素                          |
| C154-F03 | P3   | W9   | 双端+Core | 行为 | responsive 默认值不一致且外壳无 w-full | 注释默认值与两端运行时相同；默认为 true 且省略 responsive 时外壳带跟随容器宽度的 class          |
| C154-F04 | P3   | W9   | Vue       | 行为 | Vue attrs.class 盖掉 className         | className=prop-class、class=attr-class 时 Vue 根 class 同时含两者                               |

### C155 ScatterChart

报告 `groups/charts/ScatterChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                   | 验收                                                                                      |
| -------- | ---- | ---- | ----- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| C155-F01 | P3   | W9   | 双端  | 无障碍 | 无 title 时 svg 没有默认可访问名称     | zh-CN 下不传 title 时 svg 的 aria-label 为「散点图」；传 title=季度 时为「季度」          |
| C155-F04 | P3   | W9   | React | 行为   | 只传 onPointClick 时两端图例标签不一致 | showLegend 且只传 onPointClick 时两端图例项都是 DIV，点击第一点 onPointClick 仍只调用一次 |

### C156 SunburstChart

报告 `groups/charts/SunburstChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                               | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| C156-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称 | zh-CN 下不传 title 时 svg 的 aria-label 为「旭日图」；传 title=区域 时为「区域」 |

### C157 TreeMapChart

报告 `groups/charts/TreeMapChart.md`，队列状态 needs-evidence。另受 S01、S02、S07、C138-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                   | 验收                                                                                            |
| -------- | ---- | ---- | ---- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C157-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称     | zh-CN 下不传 title 时 svg 的 aria-label 为「矩形树图」；传 title=份额 时为「份额」              |
| C157-F02 | P3   | W9   | 双端 | 键盘   | 方向键按布局顺序线性移动，不走几何邻居 | 两片叶子并排、只传 onNodeClick，聚焦第一块按 ArrowDown 焦点留在第一块，按 ArrowRight 才到第二块 |

### C158 WaterfallChart

报告 `groups/charts/WaterfallChart.md`，队列状态 needs-evidence。另受 S01、C154-F03、C154-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                              | 验收                                                                                            |
| -------- | ---- | ---- | ---- | ---- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| C158-F01 | P2   | W6   | 双端 | 行为 | 柱 label 不画出，也不是可访问名称 | 数据 label 为「期初」「新增」时，两端 DOM 与 SSR 标记里出现该文本，或对应 rect 带这个可访问名称 |
| C158-F02 | P2   | W6   | 双端 | 行为 | padding 写死 24，desc 未传给画布  | padding=40 并传 desc 时 g 为 translate(40, 40)，第一根柱 y 为 50，SVG 有 desc 元素              |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件        | 报告                           | 并入的条目    |
| ---- | ----------- | ------------------------------ | ------------- |
| C142 | ChartGrid   | `groups/charts/ChartGrid.md`   | S01、S02      |
| C143 | ChartLegend | `groups/charts/ChartLegend.md` | S01、S02、S07 |
