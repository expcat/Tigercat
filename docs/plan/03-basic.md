# 03 基础组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

basic 组 32 个组件（C001–C032）。这一组的浏览器证据最全，队列里 28 个是 complete，多数条目有截图和真实按键记录。

## 目标

- 文档、Demo 与实现对不上的地方改到一致。

## 非目标

- 不新增 variant、size 或兼容别名。
- 原型继承键（S11）和 Vue Props 类型（S13）已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)。

## 概览

本篇 2 条：P1 2、P2 0、P3 0。
按波次：W1 2、W5 0、W9 0。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C001-F004、C007-F04、C013-V01、C026-V01、C026-V04、C002-F002（S11）、C003-F003（S11）、C004-F001（S11）、C006-F002（S02）、C022-F03（S13）、C025-F01、C025-F02、C025-F03（S02）、C025-F04、C025-F05、C026-F01、C026-F02、C026-F03、C026-V02、C026-V03、C027-F01（S11）、C014-S01、C014-V01、C017-F02、C017-F03、C017-V01、C017-V02。

## 条目

### C014 Gallery

报告 `groups/basic/Gallery.md`，队列状态 complete。

### C017 ImageCompare

报告 `groups/basic/ImageCompare.md`，队列状态 complete。

### C029 SplitButton

报告 `groups/basic/SplitButton.md`，队列状态 needs-evidence。W10-G2 使用 headless Chromium 149、1440×900 / light，从已确认入口复验；原图、AX 与逐键记录见 `project/w10-g2-evidence.md`。下列沿用原编号，根因尚未定位；Vue 本轮首次进入及稳定后的 Tab 后继均通过。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                                                                                                | 验收                                                                              |
| -------- | ---- | ---- | ----- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| C029-F02 | P1   | W1   | React | 键盘 | 首次 ArrowDown 打开菜单，等待定位完成及 2s 后焦点仍在 trigger；第二次 ArrowDown 才进入首项。原 Vue 症状本轮未复现，范围扩展至 React | 已获焦 trigger 首次 ArrowDown / ArrowUp 打开后即进入首个 / 末个启用项，Vue 同验   |
| C029-F03 | P1   | W1   | React | 键盘 | 首项获焦后 Tab 关闭菜单，等待 2s 落到前锚点 Before，下一次 Tab 到保存；历史 BODY 症状改为后继目标错误，不推断共同根因               | 菜单首项 Tab 关闭后到 trigger 后的 After；继续 Tab / Shift+Tab 顺序正确，Vue 同验 |

### C032 Watermark

报告 `groups/basic/Watermark.md`，队列状态 complete。

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件        | 报告                          | 并入的条目         |
| ---- | ----------- | ----------------------------- | ------------------ |
| C008 | ButtonGroup | `groups/basic/ButtonGroup.md` | S02、S04、S05、S11 |
| C009 | Code        | `groups/basic/Code.md`        | S05                |
