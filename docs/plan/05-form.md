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

本篇 7 条：P1 0、P2 5、P3 2。
按波次：W3 5、W9 2。

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

### C081 Upload

报告 `groups/form/Upload.md`，队列状态 needs-evidence。另受 S04、S08、S10、C011-F002、C011-F003 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                       | 验收                                                                                                                  |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| C081-F01 | P2   | W3   | Core  | 行为 | 单选裁剪被 limit 分支覆盖，同一文件同时接受与拒绝          | 空列表、multiple=false、limit=2 一次输入 a/b/c 时只接受 a，b/c 仅因 single 被拒，接受与拒绝集合互斥                   |
| C081-F02 | P2   | W3   | React | 行为 | React 本地图片首次加入后缺少缩略图与内置预览操作           | 非受控、autoUpload=false、picture-card 选择 local.png 后，无额外重渲染即 img=1、preview button=1，与 Vue 一致         |
| C081-F03 | P2   | W3   | Core  | 行为 | 分片请求成功响应中的 URL 被丢弃，成功文件无法形成提交结果  | 6 字节文件、chunkSize=2、三次均返回 {url:'https://cdn.example/final.txt'} 后，文件带该 url 且 uploadSubmitValues 非空 |
| C081-F04 | P2   | W3   | Core  | 行为 | 原生表单提交包含未成功文件的 URL                           | name=files 且 ready/queued/uploading/error/success 各一条带合法 URL 时，双端只生成 success 对应的 1 个 hidden input   |
| C081-F06 | P2   | W3   | Core  | 行为 | 卸载时未取消 pending beforeUpload，React 仍向父级发 change | beforeUpload 待决时选文件后卸载再放行校验，Core host 不再收到 ready 文件，React onChange 卸载后调用 0 次              |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件            | 报告                             | 并入的条目         |
| ---- | --------------- | -------------------------------- | ------------------ |
| C064 | InputGroupAddon | `groups/form/InputGroupAddon.md` | S02                |
| C066 | InputOTP        | `groups/form/InputOTP.md`        | S01、S04、S10      |
| C070 | Radio           | `groups/form/Radio.md`           | S01、S04、S08、S10 |
| C078 | TimePicker      | `groups/form/TimePicker.md`      | S01、S02、S04、S07 |
