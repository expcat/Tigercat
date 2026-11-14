# 08 数据展示组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

data 组 7 个组件（C131–C137）。视觉与键盘全部 blocked。

## 目标

- Table、Calendar、Collapse 的边界输入不丢数据、不丢事件。

## 非目标

- 不做第二套 Timeline。

## 依赖与顺序

- Vue Table 排序复位页码（X01-F011）在 [02](02-core-theme-i18n.md)。

## 概览

本篇 14 条：P1 0、P2 8、P3 6。
按波次：W6 8、W9 6。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C135-F03（S13）。

## 条目

### C131 Calendar

报告 `groups/data/Calendar.md`，队列状态 needs-evidence。另受 S01、S04、S08 影响。

| 编号     | 级别 | 波次 | 端          | 类别   | 条目                               | 验收                                                                             |
| -------- | ---- | ---- | ----------- | ------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| C131-F01 | P2   | W6   | 文档·生成器 | 文档   | Vue 生成示例用 :value，选不中日期  | examples/calendar.md 的 Vue 示例为 v-model 或 :model-value，照示例挂载能选中日期 |
| C131-F02 | P3   | W9   | 双端        | 无障碍 | 月视图数据行的周数格没有单元格角色 | 显示周数列时两端每个数据行的周数格 role 为 rowheader，8 列网格每行角色齐全       |

### C133 CollapsePanel

报告 `groups/data/CollapsePanel.md`，队列状态 needs-evidence。另受 S01、S02、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                   | 验收                                                                                 |
| -------- | ---- | ---- | ---- | ------ | -------------------------------------- | ------------------------------------------------------------------------------------ |
| C133-F01 | P2   | W6   | Vue  | 无障碍 | Vue 收起后 aria-controls 指向缺失 id   | Vue 默认收起的面板标题按钮没有 aria-controls，展开后等于 region 的 id，与 React 一致 |
| C133-F02 | P3   | W9   | Core | 样式   | 内容外壳的过渡类从不被驱动，过渡不发生 | 内容外壳类不再含 transition-[max-height,opacity] 与 duration-300，关闭仍即卸载       |

### C134 Countdown

报告 `groups/data/Countdown.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                           | 验收                                                                         |
| -------- | ---- | ---- | ---- | ------ | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| C134-F01 | P2   | W6   | 双端 | 无障碍 | timer 可访问名不是格式化时间，与注释和笔记相反 | ariaLabel=「付款倒计时」、无 title、interval=0 时 timer 可访问名为 00:00:05  |
| C134-F02 | P3   | W9   | Vue  | 无障碍 | Vue 静态或已到期倒计时不发初始播报             | Vue 挂载已到期或 interval=0 的倒计时后 live region 有一次播报，与 React 一致 |

### C135 DataExport

报告 `groups/data/DataExport.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端               | 类别   | 条目                                       | 验收                                                                                 |
| -------- | ---- | ---- | ---------------- | ------ | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| C135-F01 | P2   | W6   | 文档·生成器+Demo | 文档   | 笔记与 Demo 仍写默认两格式、触发器名未接线 | 笔记与 Demo 文案写默认 xlsx/csv/markdown 三项，测试断言 Export CSV 菜单项            |
| C135-F02 | P2   | W6   | 双端             | 行为   | customExport 拿到未过滤的列和未格式化的行  | 隐藏 secret 时 customExport 收不到 secret 和 render-only 列，name 为 X:Ada           |
| C135-F04 | P3   | W9   | 双端             | 无障碍 | 单格式时调用方的 aria-label 被清掉         | 单格式按钮传 aria-label=「Save table」后 DOM 上仍是该值；多格式仍为 triggerAriaLabel |

### C136 Table

报告 `groups/data/Table.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                       | 验收                                                                                 |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| C136-F01 | P2   | W6   | 双端 | 行为 | 传入 sorts 会把未隐藏的 W9 面板挂进文档    | 传 sorts={[]} 时文档里查不到 data-tiger-header-menu 面板，多列排序仍可经表头完成     |
| C136-F02 | P2   | W6   | 双端 | 键盘 | grid 只改 data-grid-cell 并拆掉行焦点      | 开启 grid 的多列表按 ArrowRight 后焦点或 aria-activedescendant 落到下一格            |
| C136-F03 | P3   | W9   | Core | 文档 | virtual 注释说卡片树走同一行窗口，实现不是 | table.ts 的 virtual 注释写明卡片树不受 virtual 影响，卡片开窗只看正数 cardItemHeight |

### C137 Timeline

报告 `groups/data/Timeline.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                  | 验收                                                                        |
| -------- | ---- | ---- | ---- | ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| C137-F01 | P2   | W6   | 双端 | 无障碍 | 自定义 pending 的可见内容与播报不一致 | 播报里无 [object Object]；Vue 用 pending 槽时 role=status 不再是 Loading... |
| C137-F02 | P3   | W9   | 双端 | 无障碍 | 任意 label 都会写入 time 的 datetime  | label=「第一步」时 time 无 datetime；label 为 2024-01-02 时仍写 datetime    |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件     | 报告                      | 并入的条目 |
| ---- | -------- | ------------------------- | ---------- |
| C132 | Collapse | `groups/data/Collapse.md` | S01        |
