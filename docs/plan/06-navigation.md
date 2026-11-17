# 06 导航组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

navigation 组 35 个组件（C082–C116）。审查时这一组同样没有浏览器证据。

## 目标

- 菜单类组件有唯一的 Tab 入口，方向键只在当前层移动，子菜单能用键盘开合。
- 现有的 axe 用例通过，不关规则。

## 非目标

- 不做第二套 Menu。
- 不为了对齐两端而改 ARIA 角色以外的公开 API。

## 依赖与顺序

- Affix 的 16 格视觉 / 键盘已补齐；固定尺寸更新与重绑通知共 8 组回归通过，当前证据见 [13](13-evidence.md)。

## 概览

本篇 0 条：P2 0、P3 0。
按波次：W4 0、W9 0。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C086-F03（S13）、C088-F05（S13）、C095-F02（S13）、C109-F06（S13）、C111-F01、C111-F02、C111-F03、C111-F04、C112-F01（S13）、C113-F01（S13）、C114-F04（S13）、C116-F05（S13）、C114-F01、C114-F02、C115-F01、C116-F01、C116-F02、C116-F03、C085-F01、C089-F02、C093-F01、C098-F04、C108-F01、C109-F05、C109-F07、C110-F02、C110-F03、C111-F05、C111-F06、C114-F03、C114-F05、C114-F06、C116-F04、C116-F06。

## 条目

### C088 ContextMenu

报告 `groups/navigation/ContextMenu.md`，队列状态 needs-evidence。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C092 Dropdown

报告 `groups/navigation/Dropdown.md`，队列状态 needs-evidence。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C108 PageHeader

报告 `groups/navigation/PageHeader.md`，队列状态 needs-evidence。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C110 ScrollSpy

报告 `groups/navigation/ScrollSpy.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C111 Spotlight

报告 `groups/navigation/Spotlight.md`，队列状态 needs-evidence。另受 S01、S08 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C114 Tabs

报告 `groups/navigation/Tabs.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C116 Tree

报告 `groups/navigation/Tree.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件                  | 报告                                         | 并入的条目         |
| ---- | --------------------- | -------------------------------------------- | ------------------ |
| C090 | ContextMenuMenu       | `groups/navigation/ContextMenuMenu.md`       | S02                |
| C091 | ContextMenuSub        | `groups/navigation/ContextMenuSub.md`        | S02、S07           |
| C094 | DropdownMenu          | `groups/navigation/DropdownMenu.md`          | S02                |
| C103 | NavigationMenuContent | `groups/navigation/NavigationMenuContent.md` | S02、S07           |
| C112 | Steps                 | `groups/navigation/Steps.md`                 | S01、S04、S08      |
| C113 | StepsItem             | `groups/navigation/StepsItem.md`             | S01、S02、S04、S08 |
