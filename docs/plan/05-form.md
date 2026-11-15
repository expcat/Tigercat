# 05 表单组件

[路线图](../ROADMAP.md) · [范围与口径](00-scope.md) · [波次](14-waves.md) · [证据](13-evidence.md)

form 组 30 个组件（C052–C081）。这一组没有截图，视觉与键盘全部 blocked，条目的证据是源码、定向测试和 happy-dom。

## 目标

- 键盘能走完选择、清空、提交的主路径。
- 受控值、组上下文（尺寸、错误状态）和 FormItem 的关联在两端一致。

## 非目标

- 不加新的表单控件。
- 受控拒收（S10）、根属性透传（S07）已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)。

## 依赖与顺序

- S10 波及 13 个表单组件，先做 S10 再做这些组件里其余的受控条目。

## 概览

本篇 2 条：P1 0、P2 0、P3 2。
按波次：W3 0、W9 2。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C056-F01（S10）、C056-F04（S07）、C060-F04（S13）、C061-F05（S13）、C072-F02（S13）、C074-F04（S13）、C080-F03（S13）。

## 条目

### C052 AutoComplete

报告 `groups/form/AutoComplete.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                         | 验收                                                                           |
| -------- | ---- | ---- | ---- | ---- | ---------------------------- | ------------------------------------------------------------------------------ |
| C052-F04 | P3   | W9   | Core | 文档 | 选项值注释仍称空串不是未选态 | AutoCompleteOption.value 注释与 AutoCompleteProps.value 一致，表述空串为未提交 |

### C053 Cascader

报告 `groups/form/Cascader.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C054 Checkbox

报告 `groups/form/Checkbox.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C055 CheckboxGroup

报告 `groups/form/CheckboxGroup.md`，队列状态 needs-evidence。另受 S01、S02、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C056 ColorPicker

报告 `groups/form/ColorPicker.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### C057 ColorSwatch

报告 `groups/form/ColorSwatch.md`，队列状态 needs-evidence。另受 S01、S04、S07 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                          | 验收                                                            |
| -------- | ---- | ---- | ---- | ---- | ----------------------------- | --------------------------------------------------------------- |
| C057-F07 | P3   | W9   | Demo | 示例 | Demo01 初选描述与两端数据不符 | 两端 color-swatch/01 的 demo.json 描述与 App 初值指向同一颜色项 |

### C058 CronEditor

报告 `groups/form/CronEditor.md`，队列状态 needs-evidence。另受 S01、S04、S07、S10 影响。

| 编号 | 级别 | 波次 | 端  | 类别 | 条目 | 验收 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件            | 报告                             | 并入的条目         |
| ---- | --------------- | -------------------------------- | ------------------ |
| C064 | InputGroupAddon | `groups/form/InputGroupAddon.md` | S02                |
| C066 | InputOTP        | `groups/form/InputOTP.md`        | S01、S04、S10      |
| C070 | Radio           | `groups/form/Radio.md`           | S01、S04、S08、S10 |
| C078 | TimePicker      | `groups/form/TimePicker.md`      | S01、S02、S04、S07 |
