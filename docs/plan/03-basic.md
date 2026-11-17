# 03 基础组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

basic 组 32 个组件（C001–C032）。这一组的浏览器证据最全，队列里 28 个是 complete，多数条目有截图和真实按键记录。

## 目标

- 文档、Demo 与实现对不上的地方改到一致。

## 非目标

- 不新增 variant、size 或兼容别名。
- 原型继承键（S11）和 Vue Props 类型（S13）已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)。

## 概览

本篇 2 条：P1 0、P2 1、P3 1。
按波次：W1 0、W5 1、W9 1。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C001-F004、C007-F04、C013-V01、C026-V01、C026-V04、C002-F002（S11）、C003-F003（S11）、C004-F001（S11）、C006-F002（S02）、C022-F03（S13）、C025-F01、C025-F02、C025-F03（S02）、C025-F04、C025-F05、C026-F01、C026-F02、C026-F03、C026-V02、C026-V03、C027-F01（S11）、C014-S01、C014-V01、C017-F02、C017-F03、C017-V01、C017-V02。

## 条目

### C014 Gallery

报告 `groups/basic/Gallery.md`，队列状态 complete。

### C017 ImageCompare

报告 `groups/basic/ImageCompare.md`，队列状态 complete。

### C029 SplitButton

报告 `groups/basic/SplitButton.md`，队列状态 needs-evidence。定向原图与逐键记录见 `project/w10-fix1-evidence.md`；完整视觉矩阵与实际读屏缺口见 [13](13-evidence.md)。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C032 Watermark

报告 `groups/basic/Watermark.md`，队列状态 complete。

### C020 ImagePreview

报告 `groups/basic/ImagePreview.md`，队列状态 complete。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目                                                                                                              | 验收                                                      |
| ---- | ---- | ---- | --- | ---- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| T16  | P2   | W5   | Vue | 行为 | ImagePreview 调用 useVueEscapeKey 后没有接住解除函数，内部 watch 也没有 onCleanup。打开时卸载会留下 Escape 处理。 | 预览打开后卸载组件，再按 Escape，不再触发这次预览的关闭。 |

### C031 Tag

报告 `groups/basic/Tag.md`，队列状态 complete。

| 编号 | 级别 | 波次 | 端   | 类别 | 条目                                                            | 验收                                         |
| ---- | ---- | ---- | ---- | ---- | --------------------------------------------------------------- | -------------------------------------------- |
| T18  | P3   | W9   | Demo | 示例 | use-drag/01 两端的 Tag 传了 color="blue"。Tag 没有 color prop。 | 两端示例不再传 color，Tag 只使用现有 props。 |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件        | 报告                          | 并入的条目         |
| ---- | ----------- | ----------------------------- | ------------------ |
| C008 | ButtonGroup | `groups/basic/ButtonGroup.md` | S02、S04、S05、S11 |
| C009 | Code        | `groups/basic/Code.md`        | S05                |
