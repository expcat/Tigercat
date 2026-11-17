# 11 组合组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

composite 组 16 个组件（C170–C185），视觉与键盘全部 blocked。

## 目标

- 满 40 行自动开窗之后，键盘仍能到后续条目，列表语义还在。
- 工作流组件的权限、校验和文案与类型注释一致。

## 非目标

- 不做 BPMN、Flowable、Camunda。
- 租户、组织、部门、字典组件不进库。

## 依赖与顺序

- ActivityFeed 示例已去掉数据表 Custom Filters。其余 composite 示例从第 26–28 行起仍混进这一节。W10-G4 复核后不立项，这是示例分类附录，不是组件缺陷。

## 概览

本篇 4 条：P1 0、P2 3、P3 1。
按波次：W1 0、W7 3、W9 1。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C170-F02、C170-F03、C170-F04、C170-F05、C171-F01、C171-F02、C171-F03、C172-F01、C172-F02、C172-F03、C172-F04、C172-F05、C172-F06、C172-F07、C173-F01、C173-F02、C173-F03、C173-F04、C174-F01、C174-F02、C174-F03、C174-F04、C174-F05、C174-F06、C175-F01、C175-F02、C175-F03、C175-F04、C175-F05、C175-F06、C176-F01、C176-F02、C176-F03、C176-F04、C176-F05、C176-F06、C177-F01、C177-F02、C177-F03、C177-F04、C178-F01、C178-F02、C178-F03、C179-F01、C179-F02、C179-F03、C179-F04、C180-F01、C180-F02、C180-F03、C181-F01、C181-F02、C181-F03、C181-F04、C182-F01、C183-F01、C184-F01、C184-F02。

## 条目

### C177 NotificationBell

报告 `groups/composite/NotificationBell.md`，队列状态 needs-evidence。另受 S04、S07 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C178 NotificationCenter

报告 `groups/composite/NotificationCenter.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C179 SchemaForm

报告 `groups/composite/SchemaForm.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端    | 类别 | 条目                                                                                                                  | 验收                                                                      |
| ---- | ---- | ---- | ----- | ---- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| T10  | P3   | W9   | React | 行为 | 未知 type 返回 null。React.Children.toArray 丢掉 null，FormItem 看到的子节点数不是 1，于是误报 single field control。 | 未知 type 不渲染控件，也不出现 FormItem supports a single field control。 |

### C180 TaskBoard

报告 `groups/composite/TaskBoard.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端   | 类别   | 条目                                                                              | 验收                                                   |
| ---- | ---- | ---- | ---- | ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| T11  | P2   | W7   | 双端 | 无障碍 | describeTaskBoardGrabAnnouncement 在抓列时把列名填进卡片模板的 card、from 和 to。 | 键盘抓取列时，播报说出列名和列位置，不再套用卡片句子。 |
| T12  | P2   | W7   | 双端 | 无障碍 | 根节点在展开 rest 或 attrs 之后写死 role 为 region，并写死看板 aria-label。       | 调用方传入的 role 和非空 aria-label 留在根上。         |

### C181 WorkflowDesigner

报告 `groups/composite/WorkflowDesigner.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C182 WorkflowDetailShell

报告 `groups/composite/WorkflowDetailShell.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号 | 级别 | 波次 | 端    | 类别 | 条目                                                                                                        | 验收                                      |
| ---- | ---- | ---- | ----- | ---- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| T13  | P2   | W7   | React | 行为 | 标题在 title 为空时回退到 labels.title。数字 0 也会回退。Vue 的 String prop 会把 0 收成字符串 0，不在此条。 | title 为 0 时标题显示 0，不回退默认标题。 |

### C183 WorkflowTimeline

报告 `groups/composite/WorkflowTimeline.md`，队列状态 needs-evidence。另受 S01、S03 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C184 WorkflowActionBar

报告 `groups/composite/WorkflowActionBar.md`，队列状态 needs-evidence。另受 S01、S02 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件           | 报告                                 | 并入的条目 |
| ---- | -------------- | ------------------------------------ | ---------- |
| C185 | WorkflowViewer | `groups/composite/WorkflowViewer.md` | S01        |
