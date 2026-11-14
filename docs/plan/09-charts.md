# 09 图表组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [共性根因](01-shared-root-causes.md) · [波次](14-waves.md) · [证据](13-evidence.md)

charts 组 21 个组件（C138–C158），视觉与键盘全部 blocked。很多条目是同一段共享代码在不同图上的表现，按下面的顺序做能少改几遍。

## 目标

- 图表的点、扇区、格子能用方向键走，tabindex 跟着焦点。
- 没有 title 时有本地化的默认名称。
- 隐藏的系列不再响应指针。

## 非目标

- 不引入第三方图表库。
- 不为单张图复制一份交互逻辑。

## 依赖与顺序

- 先做 ChartTooltip（C145）和 AreaChart 上的共享条目（C138-F01、C138-F02），它们并入了 6 到 10 张图。
- roving tabindex 一组一起做：C147-F01、C149-F01、C150-F03、C152-F01、C155-F02、C155-F03、C156-F02。共享代码在 `useCartesianSeriesPoints` 和各图的键盘处理里。
- 默认可访问名称一组一起做：C149-F05、C150-F02、C153-F01、C155-F01、C156-F01、C157-F01，都是无 title 时没读 `*ChartAriaLabel`。
- 图表系列 key 去重是 [02](02-core-theme-i18n.md) 的 X01-F005。
- OrgChart 的节点全是 `tabindex=0`、方向键无效，TreeMapChart 的 `nextTreeMapNodeIndex` 没有调用方。这两处报告没有编号，见 [13](13-evidence.md) 的未立项观察。

## 概览

本篇 57 条：P1 0、P2 32、P3 25。
按波次：W6 32、W9 25。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                                  | 归属         | 同验                                                                                                                        |
| ----------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| C138-F01 图例隐藏系列只设 opacity 0，命中和最近邻仍在 | AreaChart    | LineChart、PieChart、RadarChart、ScatterChart、SunburstChart、TreeMapChart                                                  |
| C138-F02 responsive 注释默认 false，实际 true         | AreaChart    | BarChart、FunnelChart、GaugeChart、HeatmapChart、LineChart、PieChart、RadarChart、ScatterChart、SunburstChart、TreeMapChart |
| C139-F02 tiger-bar-animated 的 CSS 未进插件           | BarChart     | LineChart、PieChart、ScatterChart                                                                                           |
| C145-F01 Vue 无监听仍吞 Escape，React 不会            | ChartTooltip | FunnelChart、GaugeChart、HeatmapChart、LineChart、PieChart、RadarChart、ScatterChart、SunburstChart、TreeMapChart           |
| C145-F03 content 只有换行时仍挂载空气泡               | ChartTooltip | FunnelChart、GaugeChart、HeatmapChart、LineChart、ScatterChart、SunburstChart、TreeMapChart                                 |
| C146-F04 padding 注释默认是坐标轴对象，运行时是 24    | FunnelChart  | Gantt、GaugeChart、OrgChart、PieChart、RadarChart                                                                           |
| C150-F03 关提示时方向键不移动点的 roving tabindex     | LineChart    | SunburstChart、TreeMapChart                                                                                                 |

## 条目

### C138 AreaChart

报告 `groups/charts/AreaChart.md`，队列状态 needs-evidence。另受 S01、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                         | 验收                                                                                |
| -------- | ---- | ---- | ---- | ---- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| C138-F01 | P2   | W6   | 双端 | 行为 | 图例隐藏系列只设 opacity 0，命中和最近邻仍在 | 图例隐藏系列 0 后，对其 g 的 mouseEnter、click 不再触发 series-hover、series-click  |
| C138-F02 | P3   | W9   | Core | 文档 | responsive 注释默认 false，实际 true         | responsive 的 @default 注释与两端不传该 prop 时的行为（根 class 是否含 w-full）一致 |

### C139 BarChart

报告 `groups/charts/BarChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                         | 验收                                                                                  |
| -------- | ---- | ---- | ---- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| C139-F01 | P2   | W6   | 双端 | 行为 | 图例只留第一根柱，隐藏后全部柱透明但命中仍在 | Mon/Tue 两柱开图例时有 2 个图例项；隐藏一根后仅该柱隐藏，且不再触发 hover、onBarClick |
| C139-F02 | P2   | W6   | Core | 样式 | tiger-bar-animated 的 CSS 未进插件           | animated=true 时 .tiger-bar-animated 的计算样式带 y、height、opacity、filter 过渡     |

### C140 ChartAxis

报告 `groups/charts/ChartAxis.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                   | 验收                                                                            |
| -------- | ---- | ---- | ----- | ------ | -------------------------------------- | ------------------------------------------------------------------------------- |
| C140-F01 | P3   | W9   | React | 无障碍 | React 根丢调用方 aria-hidden，Vue 保留 | 根传 aria-hidden=true 时 React 与 Vue 的根 g 结果一致；不传时两端根都没有该属性 |

### C141 ChartCanvas

报告 `groups/charts/ChartCanvas.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端          | 类别   | 条目                                     | 验收                                                                                 |
| -------- | ---- | ---- | ----------- | ------ | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| C141-F01 | P2   | W6   | Vue         | 行为   | Vue 字符串 style 打崩 ChartCanvas        | Vue 传字符串 style「margin-top: 13px」时正常挂载，svg 带该样式，与对象形式一致       |
| C141-F02 | P2   | W6   | 双端        | 无障碍 | 调用方 aria 引用被丢，aria-label 不生效  | 无 title/desc 时调用方 aria 引用保留；title=Sales、aria-label=Custom 时名称为 Custom |
| C141-F03 | P2   | W6   | 文档·生成器 | 文档   | 生成说明写 role=img，实现固定 role=group | 重跑 docs:api 后 chart-canvas 的 props 与 examples 页说明写 role=group，与运行时一致 |
| C141-F04 | P3   | W9   | Vue         | 行为   | Vue 不发初始 resolved-size-change        | Vue 传 width=0、height=0 挂载后 emit 一次 resolved-size-change（320×200）            |

### C144 ChartSeries

报告 `groups/charts/ChartSeries.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                              |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | --------------------------------------------------------------------------------- |
| C144-F01 | P2   | W6   | 双端 | 行为 | paint 为空时清掉调用方的 fill 和 stroke | 传 fill=red、stroke=green 且 type=custom（或只传 color）时，两端 g 保留这两个属性 |

### C145 ChartTooltip

报告 `groups/charts/ChartTooltip.md`，队列状态 needs-evidence。另受 S01、S02、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                    | 验收                                                                                         |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| C145-F01 | P2   | W6   | Vue  | 键盘 | Vue 无监听仍吞 Escape，React 不会       | Vue open 且未绑 dismiss 时按 Escape，defaultPrevented 为 false；绑定后回调走一次             |
| C145-F02 | P2   | W6   | 双端 | SSR  | 首次 transform 两端不一致（Vue 已偏移） | x=y=100 且 open 时，两端服务端渲染的首次 transform 相同（同为 112,92 或 100,100）            |
| C145-F03 | P3   | W9   | 双端 | 行为 | content 只有换行时仍挂载空气泡          | open 且 content 为单个换行时两端都不挂 role=tooltip 节点，与空字符串一致；a 换行 b 仍渲染 ul |

### C146 FunnelChart

报告 `groups/charts/FunnelChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F01、C145-F02、C145-F03 影响。

| 编号     | 级别 | 波次 | 端               | 类别 | 条目                                            | 验收                                                                                        |
| -------- | ---- | ---- | ---------------- | ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C146-F01 | P2   | W6   | 双端             | 行为 | 图例隐藏的漏斗段仍可悬停、点击和聚焦            | 三段正值、开图例交互并点第一项图例后，该段无 tabindex，mouseenter 和 click 不再带回 index 0 |
| C146-F02 | P2   | W6   | Core             | 行为 | 夹有 0 或负值时阶段比例拿被丢弃的值当基准       | 100、0、40 时 40 段 versusPrevious 非 null；-10、100 时标签和 aria 不出现 -1000%            |
| C146-F03 | P3   | W9   | Core+文档·生成器 | 文档 | gradient 注释和生成表写垂直渐变，水平时实际沿 x | gradient 的类型注释和生成表 funnel-chart.md 都写沿漏斗方向渐变，不再写垂直                  |
| C146-F04 | P3   | W9   | Core             | 文档 | padding 注释默认是坐标轴对象，运行时是 24       | FunnelChartProps.padding 的 JSDoc 显示 @default 24，不再是 bottom/left 52 的对象            |

### C147 Gantt

报告 `groups/charts/Gantt.md`，队列状态 needs-evidence。另受 S01、S07、C146-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                          | 验收                                                                                       |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| C147-F01 | P2   | W6   | Vue  | 键盘 | Vue 任务条无 roving tabindex，方向键无效      | 两个未禁用任务、selectable 时 Vue 的 tabindex 是 0、-1，ArrowDown 后变成 -1、0             |
| C147-F02 | P2   | W6   | Core | 行为 | maxDate 不走闭区间，最后一天宽度为 0          | 任务 01-01 到 01-05、maxDate 2026-01-05 时，1 月 5 日在轴内有非零日期宽度                  |
| C147-F03 | P2   | W6   | 双端 | 行为 | responsive 属性被丢掉，外壳和画布各走默认     | 传 responsive={false} 时画布宿主不带 h-full；传 true 时外壳带 w-full，外壳与画布取同一个值 |
| C147-F04 | P3   | W9   | Vue  | 样式 | Vue 任务名没有 clipPath，长标签不受标签栏限制 | 任务名超出 taskLabelWidth 时，Vue 文字带 clip-path，指向按 labelX、labelWidth 建的裁切矩形 |
| C147-F05 | P2   | W6   | Demo | 示例 | React gantt 02 示例未开 draggable             | react:gantt:02 拖动任务条后 onDataChange 被调用并写回；或两端都不提供拖拽且 demo.json 相符 |

### C148 GaugeChart

报告 `groups/charts/GaugeChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F01、C145-F03、C146-F04 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                         | 验收                                                                                       |
| -------- | ---- | ---- | --------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| C148-F01 | P2   | W6   | Core+双端 | 无障碍 | value 越界时 aria-valuenow 仍是原值          | min 0、max 100 时 value 150 的 aria-valuenow 不超过 100，value -10 的不小于 0              |
| C148-F02 | P2   | W6   | Core      | 行为   | 外弧 sweep 写死 1，反向角度和超 360° 画错    | startAngle 135、endAngle -135 时外弧 sweep 为 0；segment [80, 20] 同样反向画               |
| C148-F03 | P3   | W9   | Core+双端 | 行为   | min≥max 时刻度标签全相同、aria 区间颠倒      | min 100、max 0、tickCount 4 时只有一个刻度标签，aria-valuemin 不大于 aria-valuemax         |
| C148-F04 | P3   | W9   | Vue       | 无障碍 | Vue 装饰节点没有 aria-hidden，React 有       | Vue 默认仪表的 DOM 和 SSR 字符串里，轨道、弧、刻度、针、圆心和文字的 aria-hidden 都是 true |
| C148-F05 | P3   | W9   | 双端+Core | 行为   | segments 存在时 value 弧仍引用渐变，违背注释 | gradient、segments 盖满 0 到 100、value 72 时 value 弧 fill 不以 url(# 开头，或注释已改    |

### C149 HeatmapChart

报告 `groups/charts/HeatmapChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F02、C145-F01、C145-F03 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                          | 验收                                                                                      |
| -------- | ---- | ---- | ----- | ------ | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| C149-F01 | P2   | W6   | 双端  | 键盘   | 关提示时方向键不移动 roving tabindex          | 关提示只传 onCellClick，ArrowRight 后第二格 tabindex 为 0，canvas 名含 B × One: 2         |
| C149-F02 | P2   | W6   | React | 无障碍 | React 的 SVG 模式没有 sr-only 数值表          | React 小矩阵、renderMode auto、非交互时，DOM 和 SSR 都含 data-heatmap-table 及各格数值    |
| C149-F03 | P2   | W6   | 双端  | 无障碍 | canvas 模式只剩尺寸摘要和单格名称，格值读不到 | renderMode=canvas 的 2×2 里隐藏文本含全部 4 个格值，不只是 2 rows by 2 columns            |
| C149-F04 | P3   | W9   | 双端  | i18n   | RTL 下行标签不跟随书写方向                    | ConfigProvider direction 为 rtl 时行标签在绘图区右侧且 text-anchor 为 start，列仍从左到右 |
| C149-F05 | P3   | W9   | 双端  | 无障碍 | 无标题时未用 heatmapChartAriaLabel            | 不传 title、locale 为 zh-CN 时，热力图 SVG 的可访问名称是「热力图」                       |
| C149-F06 | P3   | W9   | Core  | 样式   | 空格填色写死 #f3f4f6，不随主题也不能覆盖      | 缺数据的格子 fill 不再恒为 #f3f4f6，暗色下跟随主题 token 或能被 emptyColor 覆盖           |

### C150 LineChart

报告 `groups/charts/LineChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F01、C138-F02、C139-F02、C145-F01、C145-F03 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                     | 验收                                                                                   |
| -------- | ---- | ---- | --------- | ------ | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| C150-F01 | P2   | W6   | Core+双端 | 行为   | 系列级 showArea、areaOpacity 没进布局    | 仅系列写 showArea、areaOpacity 0.9 时有面积且 stop-opacity 为 0.9；系列写 false 不填充 |
| C150-F02 | P3   | W9   | 双端      | 无障碍 | 无标题时未用 lineChartAriaLabel          | zh-CN Provider 下不传 title 时，svg 的 aria-label 是「折线图」，SSR 字符串里也有       |
| C150-F03 | P2   | W6   | 双端      | 键盘   | 关提示时方向键不移动点的 roving tabindex | 两个点、selectable、showTooltip=false，ArrowRight 后第二点 tabindex 为 0，第一点为 -1  |

### C151 OrgChart

报告 `groups/charts/OrgChart.md`，队列状态 needs-evidence。另受 S01、S07、C146-F04、C147-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                  | 验收                                                                                            |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C151-F01 | P2   | W6   | Demo | 示例 | 02 Demo 用被拒绝的 data: 地址演示头像 | 两端 org-chart/02 的节点渲染出 image，href 是 https 或站内路径；或标题和描述不再称头像演示      |
| C151-F02 | P3   | W9   | 双端 | 样式 | 节点文字 y 写死，不随 nodeHeight 变   | nodeHeight 为 48 且节点有 label、title、subtitle 时，画出的每行文字 y 都小于 48，放不下的行不画 |

### C152 PieChart

报告 `groups/charts/PieChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F01、C138-F02、C139-F02、C145-F01、C146-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                          | 验收                                                                                        |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C152-F01 | P2   | W6   | 双端 | 键盘 | 方向键在当前扇区的 g 里查下一扇区，焦点不移动 | 两个正值扇区、selectable，ArrowRight 后焦点在第二扇区且其 tabindex 为 0；关指针跟踪时也一样 |

### C153 RadarChart

报告 `groups/charts/RadarChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F01、C138-F02、C145-F01、C146-F04 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                              | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| C153-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称                | zh-CN 下不传 title 时 svg 的 aria-label 为「雷达图」；传 title=能力 时为「能力」 |
| C153-F02 | P2   | W6   | 双端 | 行为   | 一次点击或一次 Enter 把系列回调触发两次           | 传入 onSeriesClick，点一次面积 path 后回调次数为 1，再在点上按一次 Enter 后为 2  |
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

报告 `groups/charts/ScatterChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F01、C138-F02、C139-F02、C145-F01、C145-F03 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                   | 验收                                                                                      |
| -------- | ---- | ---- | ----- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| C155-F01 | P3   | W9   | 双端  | 无障碍 | 无 title 时 svg 没有默认可访问名称     | zh-CN 下不传 title 时 svg 的 aria-label 为「散点图」；传 title=季度 时为「季度」          |
| C155-F02 | P2   | W6   | 双端  | 键盘   | 圆点方向键移焦点但 tabindex 不跟随     | 两个圆点只传 onPointClick，聚焦第一点按 ArrowRight 后第二点 tabindex 为 0，第一点为 -1    |
| C155-F03 | P2   | W6   | 双端  | 键盘   | 非圆形点之间方向键不移动焦点           | 两个方点只传 onPointClick，聚焦第一点按 ArrowRight 后 document.activeElement 是第二点     |
| C155-F04 | P3   | W9   | React | 行为   | 只传 onPointClick 时两端图例标签不一致 | showLegend 且只传 onPointClick 时两端图例项都是 DIV，点击第一点 onPointClick 仍只调用一次 |

### C156 SunburstChart

报告 `groups/charts/SunburstChart.md`，队列状态 needs-evidence。另受 S01、S07、C138-F01、C138-F02、C145-F01、C145-F03、C150-F03 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                        | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ------------------------------------------- | -------------------------------------------------------------------------------- |
| C156-F01 | P3   | W9   | 双端 | 无障碍 | 无 title 时 svg 没有默认可访问名称          | zh-CN 下不传 title 时 svg 的 aria-label 为「旭日图」；传 title=区域 时为「区域」 |
| C156-F02 | P2   | W6   | 双端 | 键盘   | 已有选中时方向键移焦点，tabindex 留在选中弧 | selectable 且 selectedIndex=0，聚焦第一弧按 ArrowRight 后第二弧 tabindex 为 0    |

### C157 TreeMapChart

报告 `groups/charts/TreeMapChart.md`，队列状态 needs-evidence。另受 S01、S02、S07、C138-F01、C138-F02、C145-F01、C145-F03、C150-F03、C156-F02 影响。

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
