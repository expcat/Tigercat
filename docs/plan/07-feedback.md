# 07 反馈组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

feedback 组 14 个组件（C117–C130）。这一组没有截图，视觉与键盘全部 blocked，条目的证据是源码和 happy-dom。

## 目标

- 浮层的开合、焦点返回和容器行为在两端一致。

## 非目标

- 不改命令式 API 的签名。

## 依赖与顺序

- 动手前先在真实浏览器里复现，见 [13](13-evidence.md) 的 E09。

## 概览

本篇 0 条：P1 0、P2 0、P3 0。
按波次：W4 0、W9 0。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C118-F04（S13）、C121-F01、C124-F03（S13）、C127-F01（S13）、C129-F01（S13）、C117-F04、C118-F03、C118-F05、C118-F06、C119-F02、C119-F03、C128-F02、C130-F02、C130-F03。

## 条目

### C117 Alert

报告 `groups/feedback/Alert.md`，队列状态 needs-evidence。另受 S01、S04、S08 影响。

### C118 Drawer

报告 `groups/feedback/Drawer.md`，队列状态 needs-evidence。另受 S01、S04、S08 影响。

### C119 Loading

报告 `groups/feedback/Loading.md`，队列状态 needs-evidence。另受 S01 影响。

### C124 Modal

报告 `groups/feedback/Modal.md`，队列状态 needs-evidence。另受 S01、S04 影响。

### C128 Progress

报告 `groups/feedback/Progress.md`，队列状态 needs-evidence。另受 S01、S08 影响。

### C130 Tour

报告 `groups/feedback/Tour.md`，队列状态 needs-evidence。另受 S01 影响。

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件                | 报告                                     | 并入的条目 |
| ---- | ------------------- | ---------------------------------------- | ---------- |
| C120 | LoadingBarContainer | `groups/feedback/LoadingBarContainer.md` | S01、S02   |
| C123 | Message             | `groups/feedback/Message.md`             | S01、S04   |
| C127 | Popover             | `groups/feedback/Popover.md`             | S01、S08   |
