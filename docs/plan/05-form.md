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
- InputGroup 的尺寸继承（C059-F01、C063-F01）一批做，Mentions、TimePicker、TreeSelect 同验。

## 概览

本篇 65 条：P1 0、P2 62、P3 3。
按波次：W3 62、W9 3。

已完成，记录在 [CHANGELOG.md](../../CHANGELOG.md)：C056-F01（S10）、C056-F04（S07）、C060-F04（S13）、C061-F05（S13）、C072-F02（S13）、C074-F04（S13）、C080-F03（S13）。

## 波及多个组件的条目

这些条目的行在下面各组件的表里。修的时候把右列的组件一起验。

| 条目                                                                  | 归属           | 同验                             |
| --------------------------------------------------------------------- | -------------- | -------------------------------- |
| C054-F05 Checkbox 未消费组级错误状态                                  | Checkbox       | CheckboxGroup、RadioGroup        |
| C056-F05 readOnly 给原生按钮写入不支持的 aria-readonly                | ColorPicker    | CronEditor、NumberKeyboard       |
| C059-F01 两端均忽略 InputGroup 的 size                                | DatePicker     | Mentions、TimePicker、TreeSelect |
| C063-F02 生成文档的「直子必须是 chrome 根」与实际稳定 host 结构矛盾   | InputGroup     | MaskInput、Mentions、Textarea    |
| C069-F05 FormItem required 被写到不支持 aria-required 的 group/dialog | NumberKeyboard | Transfer、Upload                 |

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

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                | 验收                                                                               |
| -------- | ---- | ---- | ---- | ---- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| C054-F04 | P2   | W3   | Vue  | 行为 | Vue 缺省 value 被转换为 false，混淆缺值与显式布尔值 | Group defaultValue=[false] 下未传 value 的 Vue Checkbox 不选中；显式 false 仍选中  |
| C054-F05 | P2   | W3   | 双端 | 行为 | Checkbox 未消费组级错误状态                         | CheckboxGroup status='error'（无 FormItem）下子项呈错误样式，owner 带 aria-invalid |

### C055 CheckboxGroup

报告 `groups/form/CheckboxGroup.md`，队列状态 needs-evidence。另受 S01、S02、S04、C054-F05 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                           | 验收                                                                             |
| -------- | ---- | ---- | ---- | ------ | ------------------------------ | -------------------------------------------------------------------------------- |
| C055-F01 | P2   | W3   | 双端 | 无障碍 | 错误承载项未随实际可用子项更新 | FormItem error 下移除 a 后 b 带 aria-invalid；首项 disabled 时首次错误聚焦落到 b |

### C056 ColorPicker

报告 `groups/form/ColorPicker.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                          | 验收                                                                                |
| -------- | ---- | ---- | ---- | ------ | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| C056-F02 | P2   | W3   | Core | 行为   | 大于 1 的 CSS alpha 被当成 255 制数值         | rgba(255, 0, 0, 2) 与 rgb(255 0 0 / 2) 解析为不透明红；0 与 50% 仍为 0、0.5         |
| C056-F03 | P2   | W3   | Core | 行为   | 畸形小数通过颜色校验并可产生 NaN 颜色         | hsl(1..2 100% 50%) 与 rgba(255, 0, 0, 1..2) 解析返回 null，进入错误草稿且隐藏域为空 |
| C056-F05 | P2   | W3   | 双端 | 无障碍 | readOnly 给原生按钮写入不支持的 aria-readonly | readOnly 时 button 无 aria-readonly，axe aria-allowed-attr 0 命中，仍可打开         |

### C057 ColorSwatch

报告 `groups/form/ColorSwatch.md`，队列状态 needs-evidence。另受 S01、S04、S07、C056-F02、C056-F03 影响。

| 编号     | 级别 | 波次 | 端        | 类别 | 条目                                         | 验收                                                                                            |
| -------- | ---- | ---- | --------- | ---- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C057-F01 | P2   | W3   | 双端      | 键盘 | 可用色块仍存在时丢失 Tab 入口                | 选中项为 disabled，或焦点在第三项后 colors 缩为前两项时，仍恰有一个 enabled radio 的 tabindex=0 |
| C057-F02 | P2   | W3   | Core      | 键盘 | 垂直导航遇禁用项后未继续跨组                 | A 组两列第三项 disabled、B 组可用时，从 A0 按 ArrowDown 焦点到 B0（flat index 4）               |
| C057-F03 | P2   | W3   | 双端      | 行为 | 等价颜色可使多个 radio 同时选中              | 三个等价白色选项、value='#ffffff' 时仅一个 radio 为 aria-checked=true                           |
| C057-F04 | P2   | W3   | 双端      | 行为 | 不可解析选项仍被提交且始终无法选中           | 点击 not-a-color 选项后不发回调，hidden 不变成 not-a-color（或该项禁用）                        |
| C057-F05 | P2   | W3   | Core      | 行为 | 接受无 # 的十六进制值却不能涂色              | colors=['fff']、value='fff' 时色块 backgroundColor 为有效白色；或 fff 不再被接受为选中          |
| C057-F06 | P2   | W3   | Core+双端 | 行为 | columns 未统一归一，非整数抛错、0 值契约分裂 | columns=1.5 垂直导航不抛 TypeError；columns=0 时 grid 样式与导航使用同一有效列数                |
| C057-F07 | P3   | W9   | Demo      | 示例 | Demo01 初选描述与两端数据不符                | 两端 color-swatch/01 的 demo.json 描述与 App 初值指向同一颜色项                                 |

### C058 CronEditor

报告 `groups/form/CronEditor.md`，队列状态 needs-evidence。另受 S01、S04、S07、S10、C056-F05 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                           | 验收                                                                                      |
| -------- | ---- | ---- | ---- | ---- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| C058-F01 | P2   | W3   | Core | 行为 | 合法数字步长被静默退化为单个值 | 5/2 \* \* \* \* 要么分钟集合从 5 起按 2 展开且摘要/下次运行一致，要么校验返回 invalid     |
| C058-F02 | P2   | W3   | Vue  | 行为 | Vue 只读选择器显示与表达式脱节 | Vue readOnly、初值 \* \* \* \* \* 下选每天预设与 Minute every 后，select 显示不变且无回调 |

### C059 DatePicker

报告 `groups/form/DatePicker.md`，队列状态 needs-evidence。另受 S01、S02、S04、S07 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                | 验收                                                                         |
| -------- | ---- | ---- | ----- | ---- | ----------------------------------- | ---------------------------------------------------------------------------- |
| C059-F01 | P2   | W3   | 双端  | 行为 | 两端均忽略 InputGroup 的 size       | InputGroup sm/lg 内未设 size 的 DatePicker 输出 text-sm / text-lg 对应尺寸类 |
| C059-F02 | P2   | W3   | React | 行为 | React 离开打开的面板会重复触发 blur | 焦点从面板 Today 按钮移到外部按钮时 React blurCount=1，与 Vue 一致           |

### C060 Form

报告 `groups/form/Form.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端         | 类别 | 条目                                                 | 验收                                                                                |
| -------- | ---- | ---- | ---------- | ---- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| C060-F01 | P2   | W3   | React+Core | 行为 | React 外部 controller 的 pending debounce 校验被取消 | 外部 controller+debounce 下输入 Jo 等 90ms 后 onValidate 触发并带 aria-invalid      |
| C060-F02 | P2   | W3   | Vue        | 行为 | Vue 初次挂载不同步 Form 选项到外部 controller        | 空外部 controller 配 required rules 的 Vue Form 挂载后 validate() 返回 false        |
| C060-F03 | P2   | W3   | Vue        | 行为 | Vue 动态切换 controller 后仍订阅旧引擎               | controller 从 A 切到 B 后，B 写入 second-updated 时 UI 随之更新；再写旧 A 不改变 UI |

### C061 FormItem

报告 `groups/form/FormItem.md`，队列状态 needs-evidence。另受 S01、S02、S08 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                                | 验收                                                                         |
| -------- | ---- | ---- | ---- | ------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| C061-F01 | P2   | W3   | 双端 | 行为   | 切换 Form controller 后，两端均未迁移 FormItem 注册 | controller 切到 second 后 first 不再留 name，second.validate() 返回 false    |
| C061-F02 | P2   | W3   | Vue  | 行为   | Vue 动态改名残留旧字段 disabled                     | a(disabled) 改名 b 后 mounted 为 [b]，validateFields(['a']) 返回 false       |
| C061-F03 | P2   | W3   | 双端 | 行为   | 无名原生 checkbox 的显式 checked 被两端清除         | 无 name 的 FormItem 内原生 checkbox 传 checked=true 后 input.checked 为 true |
| C061-F04 | P2   | W3   | 双端 | 无障碍 | extra 帮助文本未与控件建立描述关联                  | 有 extra 无 error 时，input 的 aria-describedby 引用带 id 的 extra 段落      |

### C062 Input

报告 `groups/form/Input.md`，队列状态 needs-evidence。另受 S01、S04、S08、S10、C026-F01 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                                  | 验收                                                                                 |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| C062-F01 | P2   | W3   | Demo | 示例 | Vue“只读”Demo 使用未声明的小写 readonly，实际仍可编辑 | Vue input/05 的只读框原生 readOnly=true，输入后值保持「只读」且与 demo.json 说明一致 |

### C063 InputGroup

报告 `groups/form/InputGroup.md`，队列状态 needs-evidence。

| 编号     | 级别 | 波次 | 端          | 类别 | 条目                                                       | 验收                                                                      |
| -------- | ---- | ---- | ----------- | ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| C063-F01 | P2   | W3   | 双端        | 样式 | 两端 Button 不继承 InputGroup 的 sm/lg 尺寸                | InputGroup size=sm/lg 内未设 size 的 Button 输出对应尺寸类，不再是 md     |
| C063-F02 | P2   | W3   | 文档·生成器 | 文档 | 生成文档的「直子必须是 chrome 根」与实际稳定 host 结构矛盾 | input-group 文档写明直子可为含 chrome 的稳定 host，不再排除带计数的 Input |

### C065 InputNumber

报告 `groups/form/InputNumber.md`，队列状态 needs-evidence。另受 S01、S04、S10 影响。

| 编号     | 级别 | 波次 | 端          | 类别   | 条目                                         | 验收                                                                           |
| -------- | ---- | ---- | ----------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------ |
| C065-F01 | P2   | W3   | 文档·生成器 | 文档   | React onChange 文档漏掉 string               | input-number 文档与 MCP 写明 React onChange 为 number \| string \| null        |
| C065-F02 | P2   | W3   | 双端        | 无障碍 | FormItem required 未接到 spinbutton          | 必填 FormItem 内未手写 aria-required 的两端 spinbutton 输出 aria-required=true |
| C065-F03 | P2   | W3   | React       | SSR    | React SSR 可见输入为空，模型和 hidden 已有值 | React SSR value=0 带 name 时可见 input 值为 0，与 aria-valuenow、hidden 一致   |

### C067 MaskInput

报告 `groups/form/MaskInput.md`，队列状态 needs-evidence。另受 S01、S04、S10、C063-F02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                            | 验收                                                                                  |
| -------- | ---- | ---- | ---- | ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| C067-F01 | P2   | W3   | 双端 | 行为 | 外部 raw 已规范化显示，hidden 仍保留 dirty 原值 | mask=##、name=canonical、外部 raw 为 a12x3 且未编辑时，两端 visible 与 hidden 均为 12 |

### C068 Mentions

报告 `groups/form/Mentions.md`，队列状态 needs-evidence。另受 S01、S04、S10、C059-F01、C063-F02 影响。

| 编号     | 级别 | 波次 | 端        | 类别   | 条目                                                                | 验收                                                                                 |
| -------- | ---- | ---- | --------- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| C068-F02 | P2   | W3   | 双端      | 行为   | 两端提及插入绕过 maxLength                                          | maxLength=5 下输入 @ 后选择 Alice，值不变为 7 字符的 @alice，计数不出现 7 / 5        |
| C068-F03 | P2   | W3   | Vue       | 行为   | Vue autoResize 首次挂载不执行高度计算                               | 初值四行、autoResize、minRows=5、maxRows=8 时 Vue 首渲染后 textarea 已有高度内联样式 |
| C068-F04 | P2   | W3   | 双端+测试 | 无障碍 | 两端 textarea 使用不允许的 combobox 角色，现有 axe 用例豁免了该规则 | 取消 aria-allowed-role 豁免后，axe 对两端 Mentions textarea 0 violation              |

### C069 NumberKeyboard

报告 `groups/form/NumberKeyboard.md`，队列状态 needs-evidence。另受 S01、S04、S07、C056-F05 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                                         | 验收                                                                              |
| -------- | ---- | ---- | ----- | ------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| C069-F01 | P2   | W3   | Core  | 行为   | 空值补零小数点越过 maxLength，双端提交结果不一致             | amount、maxLength=1、空值按 . 时不生成 0.，Vue hidden 与 React onKeyPress 均无 0. |
| C069-F02 | P2   | W3   | Vue   | 行为   | Vue 非受控值在切换模式后继续提交旧模式字符串                 | defaultValue=12.34、mode 由 amount 改 number 后 Vue hidden 为空并标记非法         |
| C069-F03 | P2   | W3   | 双端  | 行为   | 用户纠正非法默认值后清空，历史默认值错误再次出现             | defaultValue=bad，按 1 再删除后两端无错误说明、无 aria-invalid=true               |
| C069-F04 | P2   | W3   | React | 行为   | React 原生 onKeyDown 监听覆盖内部键盘处理                    | React 传只计数的 onKeyDown 后发 keydown 5：外部 calls=1 且 hidden 为 5            |
| C069-F05 | P2   | W3   | 双端  | 无障碍 | FormItem required 被写到不支持 aria-required 的 group/dialog | FormItem required 包裹常显与底栏共四种组合，axe aria-allowed-attr 均 0 违规       |

### C071 RadioGroup

报告 `groups/form/RadioGroup.md`，队列状态 needs-evidence。另受 S01、S02、S04、S10、C054-F05、C055-F01 影响。

| 编号     | 级别 | 波次 | 端   | 类别   | 条目                                           | 验收                                                             |
| -------- | ---- | ---- | ---- | ------ | ---------------------------------------------- | ---------------------------------------------------------------- |
| C071-F01 | P2   | W3   | 双端 | 无障碍 | 双端必填 FormItem 未向 radiogroup 输出必填语义 | 必填 FormItem 内两端 role=radiogroup 容器输出 aria-required=true |

### C072 Select

报告 `groups/form/Select.md`，队列状态 needs-evidence。另受 S01、S04、S07、C063-F01 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                              | 验收                                                                             |
| -------- | ---- | ---- | ----- | ------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| C072-F01 | P2   | W3   | React | 类型   | React 单选类型排除了运行时与 Core 明确使用的 null | React 单选受控 value={null} 与接收 null 的 onChange 无需绕过检查即可通过类型检查 |
| C072-F03 | P2   | W3   | 双端  | 无障碍 | 双端 readOnly combobox 没有暴露 aria-readonly     | readOnly 渲染时两端 combobox 的 aria-readonly 为 true，仍可聚焦、可打开且值不变  |

### C073 Signature

报告 `groups/form/Signature.md`，队列状态 needs-evidence。另受 S01、S04、S10、C026-F01 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                               | 验收                                                                        |
| -------- | ---- | ---- | --- | ---- | ---------------------------------- | --------------------------------------------------------------------------- |
| C073-F01 | P2   | W3   | Vue | 行为 | Vue 独立使用的非法外部值被静默清空 | Vue 无 FormItem、modelValue=not-a-signature 时出现 role=status 的非法值提示 |

### C074 Slider

报告 `groups/form/Slider.md`，队列状态 needs-evidence。另受 S01 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                        | 验收                                                                                          |
| -------- | ---- | ---- | ----- | ------ | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| C074-F01 | P2   | W3   | React | 行为   | React 可见 tooltip 忽略 formatTooltip       | React value=30、formatTooltip 为 ${value}% 时可见气泡显示 30%                                 |
| C074-F02 | P2   | W3   | Vue   | 无障碍 | Vue 无 id 的 range 产生错误及重复的 ARIA ID | 两个无 id 的 Vue range 实例四个 thumb ID 非空且互不重复，aria-labelledby 引用的后缀节点均存在 |
| C074-F03 | P2   | W3   | 双端  | 行为   | 双端自定义越界 mark 可提交域外值            | min=0 max=100 step=10 marks={105:'outside'} 点 outside，两端不发出 105                        |

### C075 Switch

报告 `groups/form/Switch.md`，队列状态 needs-evidence。另受 S01、S04、S07、S10 影响。

| 编号     | 级别 | 波次 | 端  | 类别 | 条目                                   | 验收                                                                           |
| -------- | ---- | ---- | --- | ---- | -------------------------------------- | ------------------------------------------------------------------------------ |
| C075-F01 | P2   | W3   | Vue | 行为 | Vue 取消一次点击后会吞掉下一次正常切换 | Vue 首次点击被 preventDefault 后，第二次正常点击发出 true 且 aria-checked=true |

### C076 TagsInput

报告 `groups/form/TagsInput.md`，队列状态 needs-evidence。另受 S01、S04 影响。

| 编号     | 级别 | 波次 | 端    | 类别   | 条目                                                    | 验收                                                                                            |
| -------- | ---- | ---- | ----- | ------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| C076-F01 | P2   | W3   | React | 无障碍 | React 无 id 多实例生成重复标签与拒绝区 ID               | 同页两个无 id 且不在 FormItem 中的 TagsInput，SSR 不再同时出现 tags-tag-0，无重复 ID            |
| C076-F02 | P2   | W3   | 双端  | 无障碍 | 双端 aria-activedescendant 指向未建立拥有关系的兄弟节点 | 空输入按一次 Backspace 高亮末标签后，活跃项目标位于输入拥有或控制的结构内，不再是无关联兄弟节点 |
| C076-F04 | P2   | W3   | 双端  | 行为   | Vue 独占未文档化的拖拽排序，React 没有对应行为          | 同一双实例 SSR 中两端 draggable 数量一致（现为 React 0、Vue 2），排序能力在文档中有明确说明     |
| C076-F05 | P2   | W3   | Demo  | 示例   | Demo 02 与 03 前两个输入缺少持久可访问名称              | 双端 Demo 02 的输入与 03 前两个输入都有 FormItem label 或 aria-label，初始有标签时 AX 名称非空  |

### C077 Textarea

报告 `groups/form/Textarea.md`，队列状态 needs-evidence。另受 S01、S04、S10、C063-F02 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                     | 验收                                                                                                  |
| -------- | ---- | ---- | ---- | ---- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| C077-F01 | P2   | W3   | Vue  | 行为 | Vue FormItem 数值初值 SSR 为空           | Form/FormItem name=bio、初值 { bio: 123 } 且 Textarea 不传值时，Vue SSR 首屏文本为 123，与 React 一致 |
| C077-F02 | P2   | W3   | 双端 | 键盘 | 双端动态错误状态替换 textarea 并丢失焦点 | status=default 且带 errorMessage 时聚焦，再改 status=error，双端 textarea 为同一节点且仍持有焦点      |
| C077-F03 | P2   | W3   | Demo | 示例 | 双端 Demo03 的超额计数变色不可达         | 打开双端 Demo 03 时计数的 currentLength 大于 maxLength 并呈现超额变色，或说明不再宣称该状态           |
| C077-F04 | P2   | W3   | Demo | 示例 | 六个主责 Demo 都没有持久可访问名称       | 双端 textarea 01–03 共六个 Demo 的文本框都有 FormItem label 或 aria-label/aria-labelledby             |

### C079 Transfer

报告 `groups/form/Transfer.md`，队列状态 needs-evidence。另受 S01、S04、S07、S10、C069-F05 影响。

| 编号     | 级别 | 波次 | 端   | 类别 | 条目                                       | 验收                                                                                                             |
| -------- | ---- | ---- | ---- | ---- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| C079-F01 | P2   | W3   | 双端 | i18n | 双端 labels 中的标题被省略的专用 prop 覆盖 | 只传 labels.sourceTitle='Labels source'、targetTitle='Labels target' 时双端 SSR 标题为这两个值，专用 prop 仍优先 |
| C079-F02 | P2   | W3   | 双端 | i18n | 两个公开 ARIA 文案字段没有消费者           | labels 传 'Select all custom {title}' 与 'Custom items {title}' 后双端 HTML 出现对应文案，或两字段从公开契约移除 |
| C079-F03 | P3   | W9   | 双端 | 行为 | 等价的重复选中键使标题计数超过总数         | 数据源仅一条 key=1、source selection=[1,'1'] 时，双端标题为 Source (1/1) 而非 Source (2/1)                       |

### C080 TreeSelect

报告 `groups/form/TreeSelect.md`，队列状态 needs-evidence。另受 S01、S04、S07、C059-F01、C076-F05、C079-F02 影响。

| 编号     | 级别 | 波次 | 端       | 类别 | 条目                                            | 验收                                                                                                   |
| -------- | ---- | ---- | -------- | ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| C080-F02 | P2   | W3   | Core+Vue | 行为 | 同一懒加载节点在请求未结束时仍重复调用 loadData | 节点 {key:'lazy',isLeaf:false}、loadData 返回未 resolve 的 Promise，展开后连点同一行两次，双端 loads=1 |

### C081 Upload

报告 `groups/form/Upload.md`，队列状态 needs-evidence。另受 S04、S08、S10、C011-F002、C011-F003、C069-F05 影响。

| 编号     | 级别 | 波次 | 端    | 类别 | 条目                                                       | 验收                                                                                                                  |
| -------- | ---- | ---- | ----- | ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| C081-F01 | P2   | W3   | Core  | 行为 | 单选裁剪被 limit 分支覆盖，同一文件同时接受与拒绝          | 空列表、multiple=false、limit=2 一次输入 a/b/c 时只接受 a，b/c 仅因 single 被拒，接受与拒绝集合互斥                   |
| C081-F02 | P2   | W3   | React | 行为 | React 本地图片首次加入后缺少缩略图与内置预览操作           | 非受控、autoUpload=false、picture-card 选择 local.png 后，无额外重渲染即 img=1、preview button=1，与 Vue 一致         |
| C081-F03 | P2   | W3   | Core  | 行为 | 分片请求成功响应中的 URL 被丢弃，成功文件无法形成提交结果  | 6 字节文件、chunkSize=2、三次均返回 {url:'https://cdn.example/final.txt'} 后，文件带该 url 且 uploadSubmitValues 非空 |
| C081-F04 | P2   | W3   | Core  | 行为 | 原生表单提交包含未成功文件的 URL                           | name=files 且 ready/queued/uploading/error/success 各一条带合法 URL 时，双端只生成 success 对应的 1 个 hidden input   |
| C081-F06 | P2   | W3   | Core  | 行为 | 卸载时未取消 pending beforeUpload，React 仍向父级发 change | beforeUpload 待决时选文件后卸载再放行校验，Core host 不再收到 ready 文件，React onChange 卸载后调用 0 次              |

### 没有新增条目的组件

报告没有给这些组件立新的编号。右列是并入的既有条目，修那些条目时要在这里复验。

| 任务 | 组件            | 报告                             | 并入的条目                                       |
| ---- | --------------- | -------------------------------- | ------------------------------------------------ |
| C064 | InputGroupAddon | `groups/form/InputGroupAddon.md` | S02                                              |
| C066 | InputOTP        | `groups/form/InputOTP.md`        | S01、S04、S10                                    |
| C070 | Radio           | `groups/form/Radio.md`           | S01、S04、S08、S10                               |
| C078 | TimePicker      | `groups/form/TimePicker.md`      | S01、S02、S04、S07、C059-F01、C059-F02、C065-F03 |
