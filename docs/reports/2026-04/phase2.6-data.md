# Phase 2.6 — Data 组件审查 (2026-04)

> 范围：4 个组件 — Calendar, Collapse, Table, Timeline
> 共享 utils：`calendar-utils.ts`、`collapse-utils.ts`、`table-utils.ts`、`table-export-utils.ts`、`table-filter-utils.ts`、`table-group-utils.ts`、`timeline-utils.ts`、`date-utils.ts`

## 1. 体积现状

| 组件              | Vue dts     | 备注                                                |
| ----------------- | ----------- | --------------------------------------------------- |
| **Table**         | **11.6 KB** | 全包最大，含 sort/filter/select/expand/group/export |
| Tree → Navigation | —           | —                                                   |
| Calendar          | 中          | month/year/week/range                               |
| Collapse + Panel  | 4.3+2.5 KB  | 简单                                                |
| Timeline          | 2.6 KB      | mode + reverse + custom dot                         |

## 2. 代码层优化

| #   | 优化项                                                                                                                                                                                                                         | 优先级 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| D1  | **Table**：单文件 11.6 KB dts，源代码可能 30k+ 行。强烈建议**按职责拆分**：`Table.ts` (主) + `TableHeader.ts` + `TableBody.ts` + `TableFooter.ts` + `TableSelection.ts` + `TableExpand.ts` + `TableSort.ts` + `TableFilter.ts` | **P0** |
| D2  | **Table**：sort/filter/group 算法应已抽到 `table-*-utils.ts`，确认 vue/react 都用 core util，没有重复实现                                                                                                                      | **P0** |
| D3  | **Table**：列宽 / row height 计算应用 `requestAnimationFrame` 批量；resize observer 节流                                                                                                                                       | P1     |
| D4  | **Table**：大数据建议**默认启用** virtual mode（已有 VirtualTable，需在 Table 内 prop 暴露切换）                                                                                                                               | P1     |
| D5  | **Table**：固定列实现应用 CSS `position: sticky`，不依赖 JS 同步 scroll                                                                                                                                                        | P1     |
| D6  | **Table**：export-utils 体积是否值得放主入口？建议改为子路径按需 import                                                                                                                                                        | P1     |
| D7  | **Calendar**：日期算法用 `date-utils.ts`，避免与 DatePicker 重复                                                                                                                                                               | P1     |
| D8  | **Calendar**：cell 渲染应支持 `useMemo` / `computed` 缓存，月切换时仅重算受影响周                                                                                                                                              | P1     |
| D9  | **Collapse**：高度过渡应用 `requestAnimationFrame` + CSS transition（不要 setInterval）                                                                                                                                        | P1     |
| D10 | **Timeline**：节点定位用 CSS pseudo-element，避免 `<div class="dot">` 额外节点                                                                                                                                                 | P2     |
| D11 | **Table**：rowKey 计算缓存（避免重复计算；Vue/React 渲染与点击路径复用 page row keys）                                                                                                                                         | Done   |

## 3. 样式现代化清单

| 组件                   | 现代化方案                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Table**              | header 玻璃 sticky + 微渐变；row hover 渐变 + 圆角块；选中行渐变 primary halo；resize handle 玻璃化；分页区与 toolbar 一体玻璃面板 |
| **Table sort 图标**    | 升级为渐变图标，active 时 spring 弹跳一次                                                                                          |
| **Table filter 弹层**  | 玻璃 popover + `--tiger-radius-md`                                                                                                 |
| **Table expand 行**    | 展开 spring + 微背景渐变                                                                                                           |
| **Calendar**           | 月份切换 spring slide；today cell 加 4px halo + 渐变填充；week-row hover 玻璃微亮                                                  |
| **Calendar 日期 cell** | 圆角 `pill` 选中态；range 端点 `--tiger-radius-md`，中间段渐变                                                                     |
| **Collapse**           | header 玻璃 + 圆角 `--tiger-radius-md`；展开图标 spring 旋转；面板内容渐入                                                         |
| **Timeline**           | 节点用渐变填充；连接线渐变 (`linear-gradient(180deg, primary, transparent)`)；自定义节点支持玻璃化                                 |

## 4. 演示案例改进

| 组件             | 缺失/可强化                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TableDemo**    | 当前覆盖度未知，强烈建议拆分多 demo：basic / sort / filter / select / expand / virtual / fixed / export / group / editable，配合 SKILL 文档分小节 |
| **CalendarDemo** | 加事件/日程标记 + 自定义渲染 + range mode                                                                                                         |
| **CollapseDemo** | 加 accordion (单展开) + nested + custom header                                                                                                    |
| **TimelineDemo** | 加 alternate / left / right / custom dot 完整对比                                                                                                 |

## 5. 风险与依赖

- D1 (Table 拆分) 是核心 P0，工作量最大但收益最高；应作为单独里程碑 PR
- D6 (export 子路径) 与 Phase 1B 子路径方案绑定
- 现代化样式依赖 Phase 1C；Table sticky header 玻璃需测试 backdrop-blur 在大数据滚动下的性能
