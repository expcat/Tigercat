# 10 高级组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

advanced 组 11 个组件（C159–C169），视觉与键盘全部 blocked。

## 目标

- 虚拟滚动的窗口能用键盘滚到后续行。
- 编辑器类组件的输入、粘贴和公告走 locale，不抛错。

## 非目标

- 不换编辑器内核。

## 依赖与顺序

- RichTextEditor 的引擎 `rich-text-engine.ts` 主责是 X01。

## 概览

本篇 0 条：P1 0、P2 0、P3 0。
按波次：W9 0。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C160-F04（S03）、C162-F03（S03）、C159-F01、C159-F02、C160-F01、C160-F02、C160-F03、C160-F05、C161-F01、C161-F02、C161-F03、C162-F01、C162-F02、C163-F01、C163-F02、C163-F03、C164-F01、C164-F02、C164-F03、C164-F04、C165-F01、C165-F02、C167-F02、C167-F03、C167-F04、C167-F05、C167-F06、C167-F07、C169-F02、C169-F03、C169-F04、C169-F05。

## 条目

### C159 CodeEditor

报告 `groups/advanced/CodeEditor.md`，队列状态 needs-evidence。另受 S01 影响。

### C160 Drag

报告 `groups/advanced/Drag.md`，队列状态 needs-evidence。另受 S01 影响。

### C161 FileManager

报告 `groups/advanced/FileManager.md`，队列状态 needs-evidence。另受 S01、S08 影响。

### C163 InfiniteScroll

报告 `groups/advanced/InfiniteScroll.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C164 MarkdownEditor

报告 `groups/advanced/MarkdownEditor.md`，队列状态 needs-evidence。另受 S01、S03 影响。

### C165 PrintLayout

报告 `groups/advanced/PrintLayout.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C167 RichTextEditor

报告 `groups/advanced/RichTextEditor.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C168 VirtualList

报告 `groups/advanced/VirtualList.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C169 VirtualTable

报告 `groups/advanced/VirtualTable.md`，队列状态 needs-evidence。另受 S01 影响。

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件           | 报告                                | 并入的条目 |
| ---- | -------------- | ----------------------------------- | ---------- |
| C166 | PrintPageBreak | `groups/advanced/PrintPageBreak.md` | S02        |
