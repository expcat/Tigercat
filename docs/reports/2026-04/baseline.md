# Phase 0 — 基线任务（已完成）

> 2026-05-04 完成全部基线刷新。

| 任务                 | 状态 | 结果                                                                                                                |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| 刷新覆盖率基线       | Done | 267 files / 4998 tests 全通过；Stmts 80.51% / Branch 74.17% / Funcs 81.20% / Lines 82.59%（较旧基线全面提升 3-5pp） |
| 刷新体积基线         | Done | Core 72.3KB / Vue 198.8KB / React 229.3KB（均在 limit 内，余量充裕）                                                |
| 补 lint / bench 基线 | Done | lint 0 errors / 16 warnings（均为 react-hooks/exhaustive-deps）；bench classNames / chart-utils / pie 基线已记录    |
| 同步外部全局 SKILL   | Skip | 用户全局 skill 不在本仓库管理范围                                                                                   |

### 覆盖率基线对比

| 维度       | 2026-04-30 | 2026-05-04 | 变化   |
| ---------- | ---------- | ---------- | ------ |
| Statements | 76.26%     | 80.51%     | +4.25  |
| Branches   | 71.24%     | 74.17%     | +2.93  |
| Functions  | 77.58%     | 81.20%     | +3.62  |
| Lines      | 78.05%     | 82.59%     | +4.54  |

### 体积基线

| 包    | gzip size | limit  | 余量    |
| ----- | --------- | ------ | ------- |
| Core  | 72.3 KB   | 100 KB | 27.7 KB |
| Vue   | 198.8 KB  | 250 KB | 51.2 KB |
| React | 229.3 KB  | 250 KB | 20.7 KB |

### Lint 基线

- 0 errors, 16 warnings（全部为 `react-hooks/exhaustive-deps`，涉及 10 个组件文件）

### Bench 基线

| 场景                                | ops/sec       |
| ----------------------------------- | ------------- |
| classNames (simple)                 | 6,216,341     |
| classNames (mixed)                  | 5,329,940     |
| classNames (20 args)                | 2,414,688     |
| normalizeChartPadding               | 5,880,374     |
| getChartInnerRect                   | 5,548,902     |
| getNumberExtent (1000 values)       | 16,093        |
| getPieArcs (8 slices)               | 773,436       |
| polarToCartesian                    | 5,285,499     |
| createPieArcPath                    | 2,053,660     |
| getRadarAngles (12 axes)            | 809,887       |
