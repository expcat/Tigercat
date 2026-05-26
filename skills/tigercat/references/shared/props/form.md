---
name: tigercat-shared-props-form
description: Shared props definitions for form components - AutoComplete, Cascader, Checkbox, CheckboxGroup, ColorPicker, ColorSwatch, DatePicker, Form, FormItem, Input, InputGroup, Mentions, NumberKeyboard, Radio, RadioGroup, Rate, Select, Signature, Slider, Stepper, Switch, Textarea, TimePicker, Transfer, TreeSelect, Upload
---

<!-- LLM-INDEX
type: props-reference
category: form
components: 25
key-apis: modelValue, value, checked, onChange, rules, validation, options, placeholder, disabled
-->

# Form Components - Props Reference

共享 Props 定义。Vue/React 默认双端支持，差异仅在 Type 或 Description 中标注。

> **绑定差异**: Vue 使用 `modelValue` + `v-model`，React 使用 `value`/`checked` + `onChange`。详见 [patterns/common.md](../patterns/common.md)

---

## Form 表单

### Props

| Prop                 | Type                         | Default   | Description                   |
| -------------------- | ---------------------------- | --------- | ----------------------------- |
| model                | `object`                     | `{}`      | 表单数据对象                  |
| rules                | `FormRules`                  | -         | 校验规则（字段名→规则）       |
| labelWidth           | `string \| number`           | -         | 标签宽度                      |
| labelPosition        | `'left' \| 'right' \| 'top'` | `'right'` | 标签位置                      |
| labelAlign           | `'left' \| 'right' \| 'top'` | `'right'` | 标签文字对齐                  |
| size                 | `'sm' \| 'md' \| 'lg'`       | `'md'`    | 表单尺寸（影响子表单项）      |
| inlineMessage        | `boolean`                    | `true`    | 是否行内显示校验消息          |
| showRequiredAsterisk | `boolean`                    | `true`    | 必填字段显示星号              |
| disabled             | `boolean`                    | `false`   | 禁用所有表单项                |
| loading              | `boolean`                    | `false`   | 加载状态（防止重复提交）      |
| fieldDependencies    | `Map<string, string[]>`      | -         | 字段依赖关系（联动校验）      |
| undoable             | `boolean`                    | `false`   | 启用撤销/重做功能             |
| maxHistorySize       | `number`                     | `50`      | 最大历史记录数（需 undoable） |
| className            | `string`                     | -         | 自定义 CSS 类 (React only)    |

### Events

| Vue Event   | React Callback | Payload                                      | Description     |
| ----------- | -------------- | -------------------------------------------- | --------------- |
| `@submit`   | `onSubmit`     | `{ valid, values, errors }`                  | 表单提交        |
| `@validate` | `onValidate`   | `(fieldName: string, valid, error?: string)` | 字段校验完成    |
| -           | `onChange`     | `FormValues`                                 | 值变更（React） |

### Methods (Vue expose / React FormHandle ref)

| Method         | Type                                          | Description                 |
| -------------- | --------------------------------------------- | --------------------------- |
| validate       | `() => Promise<boolean>`                      | 验证整个表单                |
| validateFields | `(fields: string[]) => Promise<boolean>`      | 验证指定字段列表            |
| validateField  | `(name: string, rules?, trigger?) => Promise` | 验证单个字段                |
| clearValidate  | `(fields?: string \| string[]) => void`       | 清除验证状态                |
| resetFields    | `() => void`                                  | 重置表单                    |
| undo           | `() => void`                                  | 撤销（需 `undoable: true`） |
| redo           | `() => void`                                  | 重做（需 `undoable: true`） |
| canUndo        | `boolean`                                     | 是否可撤销                  |
| canRedo        | `boolean`                                     | 是否可重做                  |

---

## FormItem 表单项

### Props

| Prop        | Type                     | Default | Description                                                                           |
| ----------- | ------------------------ | ------- | ------------------------------------------------------------------------------------- | --- | ------------- | --- | ---------------- | -------------------------------- | ---------- | --- | --- | ---------------------------------- |
| name        | `string`                 | -       | 字段名（对应 model 中的 key，支持嵌套如 `user.name`）                                 |
| label       | `string`                 | -       | 标签文本                                                                              |
| labelWidth  | `string \| number`       | -       | 标签宽度（覆盖 Form 级别）                                                            |
| required    | `boolean`                | -       | 必填标记（也可通过 rules 中 required 自动推断）                                       |
| rules       | `FormRule \| FormRule[]` | -       | 字段校验规则（覆盖 Form 级别）                                                        |
| error       | `string`                 | -       | 错误信息（受控模式）                                                                  |
| showMessage | `boolean`                | `true`  | 是否在表单项下方显示错误信息。设为 `false` 可让 Input 内部显示错误（抖动 + 错误文字） |
| size        | `'sm' \| 'md' \| 'lg'`   | -       | 尺寸（覆盖 Form 级别）                                                                |
| className   | `string`                 | -       | -                                                                                     | ✓   | 自定义 CSS 类 |     | errorDisplayMode | `'inline' \| 'popup' \| 'block'` | `'inline'` | ✓   | ✓   | 错误信息展示方式（行内/气泡/块级） |

---

## Input 输入框

### Props

| Prop         | Type                                                                        | Default     | Description                               |
| ------------ | --------------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| modelValue   | `string \| number`                                                          | -           | 绑定值 (v-model) (Vue only)               |
| value        | `string \| number`                                                          | -           | 绑定值（受控） (React only)               |
| defaultValue | `string \| number`                                                          | -           | 默认值（非受控） (React only)             |
| type         | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'`    | 输入类型                                  |
| size         | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`      | 尺寸                                      |
| placeholder  | `string`                                                                    | `''`        | 占位符                                    |
| disabled     | `boolean`                                                                   | `false`     | 禁用                                      |
| readonly     | `boolean`                                                                   | `false`     | 只读                                      |
| required     | `boolean`                                                                   | `false`     | 必填                                      |
| maxLength    | `number`                                                                    | -           | 最大长度                                  |
| minLength    | `number`                                                                    | -           | 最小长度                                  |
| name         | `string`                                                                    | -           | name 属性                                 |
| id           | `string`                                                                    | -           | id 属性                                   |
| autoComplete | `string`                                                                    | -           | 自动完成                                  |
| autoFocus    | `boolean`                                                                   | `false`     | 自动聚焦                                  |
| prefix       | `string`                                                                    | -           | 前缀文本 (Vue only)                       |
| prefix       | `ReactNode`                                                                 | -           | 前缀节点 (React only)                     |
| suffix       | `string`                                                                    | -           | 后缀文本 (Vue only)                       |
| suffix       | `ReactNode`                                                                 | -           | 后缀节点 (React only)                     |
| status       | `'default' \| 'error' \| 'success' \| 'warning'`                            | `'default'` | 验证状态                                  |
| errorMessage | `string`                                                                    | -           | 错误信息                                  |
| clearable    | `boolean`                                                                   | `false`     | 显示清除按钮                              |
| showPassword | `boolean`                                                                   | `false`     | 密码显示/隐藏切换（type=password 时生效） |
| showCount    | `boolean`                                                                   | `false`     | 显示字符计数（需设 maxLength）            |
| className    | `string`                                                                    | -           | 自定义 CSS 类                             |
| style        | `object`                                                                    | -           | 自定义行内样式                            |

> **a11y**: `status='error'` 时自动设置 `aria-invalid`；有 `errorMessage` 时自动关联 `aria-describedby`

### Events

| Vue Event            | React Callback | Payload            | Description |
| -------------------- | -------------- | ------------------ | ----------- |
| `@update:modelValue` | -              | `string \| number` | 值变更      |
| `@input`             | `onInput`      | `Event`            | 输入事件    |
| `@change`            | `onChange`     | `Event`            | 值变更      |
| `@focus`             | `onFocus`      | `FocusEvent`       | 聚焦        |
| `@blur`              | `onBlur`       | `FocusEvent`       | 失焦        |
| `@clear`             | `onClear`      | -                  | 清除内容    |

### Slots / Children

| Vue Slot | React Prop | Description |
| -------- | ---------- | ----------- |
| `prefix` | `prefix`   | 前缀内容    |
| `suffix` | `suffix`   | 后缀内容    |

---

## InputGroup 输入框组

组合式组件：`<InputGroup>` + `<InputGroupAddon>`，用于将输入框和附加元素组合。

### InputGroup Props

| Prop      | Type                   | Default | Description          |
| --------- | ---------------------- | ------- | -------------------- |
| size      | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸（传递给子组件） |
| compact   | `boolean`              | `false` | 紧凑模式（无间距）   |
| className | `string`               | -       | 自定义类名           |

### InputGroupAddon Props

| Prop      | Type               | Default  | Description                             |
| --------- | ------------------ | -------- | --------------------------------------- |
| type      | `'text' \| 'icon'` | `'text'` | 附加元素类型 (Vue only)                 |
| addonType | `'text' \| 'icon'` | `'text'` | 附加元素类型（React 专用） (React only) |
| className | `string`           | -        | 自定义类名                              |

### Slots / Children

| Vue Slot  | React Prop | Description      |
| --------- | ---------- | ---------------- |
| `default` | `children` | Input / Addon 等 |

> **Context**: InputGroup 通过 provide/inject (Vue) 或 createContext (React) 向子组件传递 `size` 和 `compact`。

---

## InputNumber 数字输入框

### Props

| Prop             | Type                                             | Default     | Description                   |
| ---------------- | ------------------------------------------------ | ----------- | ----------------------------- |
| modelValue       | `number \| null`                                 | -           | 绑定值 (v-model) (Vue only)   |
| value            | `number \| null`                                 | -           | 绑定值（受控） (React only)   |
| defaultValue     | `number \| null`                                 | -           | 默认值（非受控） (React only) |
| size             | `'sm' \| 'md' \| 'lg'`                           | `'md'`      | 尺寸                          |
| status           | `'default' \| 'error' \| 'success' \| 'warning'` | `'default'` | 校验状态                      |
| min              | `number`                                         | `-Infinity` | 最小值                        |
| max              | `number`                                         | `Infinity`  | 最大值                        |
| step             | `number`                                         | `1`         | 步长                          |
| precision        | `number`                                         | -           | 数值精度（小数位数）          |
| disabled         | `boolean`                                        | `false`     | 禁用                          |
| readonly         | `boolean`                                        | `false`     | 只读                          |
| placeholder      | `string`                                         | -           | 占位符                        |
| name             | `string`                                         | -           | 表单字段名                    |
| id               | `string`                                         | -           | 元素 ID                       |
| keyboard         | `boolean`                                        | `true`      | 支持键盘 ↑/↓ 调整             |
| controls         | `boolean`                                        | `true`      | 显示步进按钮                  |
| controlsPosition | `'right' \| 'both'`                              | `'right'`   | 步进按钮位置                  |
| formatter        | `(value: number \| undefined) => string`         | -           | 显示格式化函数                |
| parser           | `(displayValue: string) => number`               | -           | 输入解析函数                  |
| autoFocus        | `boolean`                                        | `false`     | 自动聚焦                      |

### Events

| Vue Event            | React Callback | Payload          | Description |
| -------------------- | -------------- | ---------------- | ----------- |
| `@update:modelValue` | -              | `number \| null` | 值变更      |
| `@change`            | `onChange`     | `number \| null` | 值提交      |
| `@focus`             | `onFocus`      | `FocusEvent`     | 聚焦        |
| `@blur`              | `onBlur`       | `FocusEvent`     | 失焦        |

---

## Textarea 文本域

### Props

| Prop         | Type                   | Default | Description                   |
| ------------ | ---------------------- | ------- | ----------------------------- |
| modelValue   | `string`               | -       | 绑定值 (v-model) (Vue only)   |
| value        | `string`               | -       | 绑定值（受控） (React only)   |
| defaultValue | `string`               | -       | 默认值（非受控） (React only) |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                          |
| placeholder  | `string`               | `''`    | 占位符                        |
| disabled     | `boolean`              | `false` | 禁用                          |
| readonly     | `boolean`              | `false` | 只读                          |
| required     | `boolean`              | `false` | 必填                          |
| rows         | `number`               | `3`     | 行数                          |
| autoResize   | `boolean`              | `false` | 自适应高度                    |
| minRows      | `number`               | -       | 最小行数（配合 autoResize）   |
| maxRows      | `number`               | -       | 最大行数（配合 autoResize）   |
| maxLength    | `number`               | -       | 最大字符数                    |
| minLength    | `number`               | -       | 最小字符数                    |
| showCount    | `boolean`              | `false` | 显示字符计数                  |
| name         | `string`               | -       | name 属性                     |
| id           | `string`               | -       | id 属性                       |
| autoComplete | `string`               | -       | 自动完成                      |
| autoFocus    | `boolean`              | `false` | 自动聚焦                      |
| className    | `string`               | -       | 自定义 CSS 类                 |
| style        | `object`               | -       | 自定义行内样式 (Vue only)     |

### Events

| Vue Event            | React Callback | Payload      | Description |
| -------------------- | -------------- | ------------ | ----------- |
| `@update:modelValue` | -              | `string`     | 值变更      |
| `@input`             | `onInput`      | `Event`      | 输入事件    |
| `@change`            | `onChange`     | `Event`      | 值变更      |
| `@focus`             | `onFocus`      | `FocusEvent` | 聚焦        |
| `@blur`              | `onBlur`       | `FocusEvent` | 失焦        |

---

## Select 选择器

### Props

| Prop          | Type                                       | Default                  | Description                 |
| ------------- | ------------------------------------------ | ------------------------ | --------------------------- |
| modelValue    | `SelectValue \| SelectValues \| undefined` | -                        | 绑定值 (v-model) (Vue only) |
| value         | `SelectValue \| SelectValues`              | -                        | 绑定值 (React only)         |
| options       | `(SelectOption \| SelectOptionGroup)[]`    | `[]`                     | 选项（支持分组）            |
| size          | `'sm' \| 'md' \| 'lg'`                     | `'md'`                   | 尺寸                        |
| multiple      | `boolean`                                  | `false`                  | 多选                        |
| clearable     | `boolean`                                  | `true`                   | 可清除                      |
| searchable    | `boolean`                                  | `false`                  | 可搜索                      |
| placeholder   | `string`                                   | `'Select an option'`     | 占位符                      |
| disabled      | `boolean`                                  | `false`                  | 禁用                        |
| noOptionsText | `string`                                   | `'No options found'`     | 搜索无结果时提示文案        |
| noDataText    | `string`                                   | `'No options available'` | 选项为空时提示文案          |
| maxTagCount   | `number`                                   | -                        | 多选模式下最大显示标签数    |
| virtual       | `boolean`                                  | `false`                  | 启用虚拟滚动（大数据量）    |
| listHeight    | `number`                                   | `256`                    | 下拉列表最大高度（px）      |

> `SelectOption = { label: string, value: string | number, disabled?: boolean }`
> `SelectOptionGroup = { label: string, options: SelectOption[] }`

### Events

| Vue Event            | React Callback | Payload                       | Description |
| -------------------- | -------------- | ----------------------------- | ----------- |
| `@update:modelValue` | `onChange`     | `SelectValue \| SelectValues` | 值变更      |
| `@change`            | -              | `SelectValue \| SelectValues` | 值变更      |
| `@search`            | `onSearch`     | `string`                      | 搜索关键字  |

---

## Checkbox 复选框

### Props

| Prop           | Type                          | Default | Description                   |
| -------------- | ----------------------------- | ------- | ----------------------------- |
| modelValue     | `boolean`                     | -       | 绑定值 (v-model) (Vue only)   |
| checked        | `boolean`                     | -       | 选中状态（受控） (React only) |
| defaultChecked | `boolean`                     | `false` | 默认选中（非受控）            |
| value          | `string \| number \| boolean` | -       | 选项值（用于分组）            |
| size           | `'sm' \| 'md' \| 'lg'`        | `'md'`  | 尺寸                          |
| disabled       | `boolean`                     | `false` | 禁用                          |
| indeterminate  | `boolean`                     | `false` | 半选状态                      |
| className      | `string`                      | -       | 自定义 CSS 类                 |

### Events

| Vue Event            | React Callback | Payload          | Description |
| -------------------- | -------------- | ---------------- | ----------- |
| `@update:modelValue` | `onChange`     | `boolean`        | 状态变更    |
| `@change`            | -              | `boolean, Event` | 值变更      |

---

## CheckboxGroup 复选框组

### Props

| Prop         | Type                              | Default | Description                 |
| ------------ | --------------------------------- | ------- | --------------------------- |
| modelValue   | `(string \| number \| boolean)[]` | `[]`    | 绑定值 (v-model) (Vue only) |
| value        | `(string \| number \| boolean)[]` | `[]`    | 选中值（受控） (React only) |
| defaultValue | `(string \| number \| boolean)[]` | `[]`    | 默认值（非受控）            |
| disabled     | `boolean`                         | `false` | 禁用所有复选框              |
| size         | `'sm' \| 'md' \| 'lg'`            | `'md'`  | 统一尺寸                    |
| className    | `string`                          | -       | 自定义 CSS 类               |

### Events

| Vue Event            | React Callback | Payload                           | Description |
| -------------------- | -------------- | --------------------------------- | ----------- |
| `@update:modelValue` | `onChange`     | `(string \| number \| boolean)[]` | 值变更      |
| `@change`            | -              | `(string \| number \| boolean)[]` | 值变更      |

---

## Radio 单选框

### Props

| Prop           | Type                   | Default | Description        |
| -------------- | ---------------------- | ------- | ------------------ |
| value          | `string \| number`     | -       | 选项值（必填）     |
| checked        | `boolean`              | -       | 选中状态（受控）   |
| defaultChecked | `boolean`              | `false` | 默认选中（非受控） |
| size           | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸               |
| disabled       | `boolean`              | `false` | 禁用               |
| name           | `string`               | -       | name 属性          |
| className      | `string`               | -       | 自定义 CSS 类      |
| style          | `object`               | -       | 自定义行内样式     |

### Events

| Vue Event         | React Callback | Payload            | Description |
| ----------------- | -------------- | ------------------ | ----------- |
| `@change`         | `onChange`     | `string \| number` | 值变更      |
| `@update:checked` | -              | `boolean`          | 选中状态    |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 标签内容    |

---

## RadioGroup 单选框组

### Props

| Prop         | Type                   | Default | Description      |
| ------------ | ---------------------- | ------- | ---------------- |
| value        | `string \| number`     | -       | 当前值（受控）   |
| defaultValue | `string \| number`     | -       | 默认值（非受控） |
| name         | `string`               | auto    | name 属性        |
| disabled     | `boolean`              | `false` | 禁用所有选项     |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  | 统一尺寸         |
| className    | `string`               | -       | 自定义 CSS 类    |

> Vue 使用 `v-model:value` 绑定；React 使用 `value` + `onChange`

### Events

| Vue Event       | React Callback | Payload            | Description |
| --------------- | -------------- | ------------------ | ----------- |
| `@update:value` | `onChange`     | `string \| number` | 值变更      |
| `@change`       | -              | `string \| number` | 值变更      |

### Slots / Children

| Vue Slot  | React Prop | Description      |
| --------- | ---------- | ---------------- |
| `default` | `children` | Radio 子组件列表 |

---

## Switch 开关

### Props

| Prop     | Type                   | Default | Description                      |
| -------- | ---------------------- | ------- | -------------------------------- |
| checked  | `boolean`              | `false` | 开关状态（Vue: v-model:checked） |
| size     | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                             |
| disabled | `boolean`              | `false` | 禁用                             |

### Events

| Vue Event         | React Callback | Payload   | Description |
| ----------------- | -------------- | --------- | ----------- |
| `@update:checked` | `onChange`     | `boolean` | 状态变更    |
| `@change`         | -              | `boolean` | 状态变更    |

---

## Slider 滑块

### Props

| Prop         | Type                                | Default | Description                    |
| ------------ | ----------------------------------- | ------- | ------------------------------ |
| value        | `number \| [number, number]`        | -       | 当前值（Vue 用 v-model:value） |
| defaultValue | `number \| [number, number]`        | -       | 默认值（非受控模式）           |
| min          | `number`                            | `0`     | 最小值                         |
| max          | `number`                            | `100`   | 最大值                         |
| step         | `number`                            | `1`     | 步长                           |
| range        | `boolean`                           | `false` | 范围选择                       |
| disabled     | `boolean`                           | `false` | 禁用                           |
| marks        | `boolean \| Record<number, string>` | `false` | 刻度标记                       |
| tooltip      | `boolean`                           | `true`  | 拖动时显示值提示               |
| size         | `'sm' \| 'md' \| 'lg'`              | `'md'`  | 尺寸                           |

### Events

| Vue Event       | React Callback | Payload                      | Description |
| --------------- | -------------- | ---------------------------- | ----------- |
| `@update:value` | `onChange`     | `number \| [number, number]` | 值变更      |
| `@change`       | -              | `number \| [number, number]` | 值变更      |

---

## DatePicker 日期选择器

### Props

| Prop         | Type                                                                          | Default         | Description               |
| ------------ | ----------------------------------------------------------------------------- | --------------- | ------------------------- |
| modelValue   | `Date \| string \| null \| [*, *]`                                            | `null`          | 绑定值 (Vue only)         |
| value        | `Date \| string \| null \| [*, *]`                                            | -               | 受控值 (React only)       |
| defaultValue | `Date \| string \| null \| [*, *]`                                            | -               | 非受控默认值 (React only) |
| range        | `boolean`                                                                     | `false`         | 范围选择                  |
| size         | `'sm' \| 'md' \| 'lg'`                                                        | `'md'`          | 尺寸                      |
| format       | `DateFormat`                                                                  | `'yyyy-MM-dd'`  | 日期格式                  |
| placeholder  | `string`                                                                      | `'Select date'` | 占位符                    |
| disabled     | `boolean`                                                                     | `false`         | 禁用                      |
| readonly     | `boolean`                                                                     | `false`         | 只读                      |
| required     | `boolean`                                                                     | `false`         | 必填                      |
| minDate      | `Date \| string \| null`                                                      | -               | 最小可选日期              |
| maxDate      | `Date \| string \| null`                                                      | -               | 最大可选日期              |
| clearable    | `boolean`                                                                     | `true`          | 显示清除按钮              |
| locale       | `string \| DatePickerLocalePreset \| { datePicker?: DatePickerLocalePreset }` | -               | 国际化 locale             |
| labels       | `Partial<DatePickerLabels>`                                                   | -               | 自定义文案                |
| shortcuts    | `DatePickerShortcut[]`                                                        | -               | 快捷选项列表              |
| name         | `string`                                                                      | -               | input name                |
| id           | `string`                                                                      | -               | input id                  |

> `DatePickerShortcut = { label: string, value: Date | [Date, Date] | (() => Date | [Date, Date]) }`

### Events

| Vue Event            | React Callback | Payload                        | Description |
| -------------------- | -------------- | ------------------------------ | ----------- |
| `@update:modelValue` | `onChange`     | `Date \| null \| [Date, Date]` | 值变更      |
| `@change`            | -              | `Date \| null \| [Date, Date]` | 值变更      |
| `@clear`             | `onClear`      | -                              | 清除        |

---

## TimePicker 时间选择器

### Props

| Prop         | Type                         | Default | Description                 |
| ------------ | ---------------------------- | ------- | --------------------------- |
| modelValue   | `string \| [string, string]` | -       | 绑定值 (v-model) (Vue only) |
| value        | `string \| [string, string]` | -       | 受控值 (React only)         |
| defaultValue | `string \| [string, string]` | -       | 非受控默认值 (React only)   |
| range        | `boolean`                    | `false` | 时间段选择                  |
| size         | `'sm' \| 'md' \| 'lg'`       | `'md'`  | 尺寸                        |
| format       | `'12' \| '24'`               | `'24'`  | 时间制式                    |
| showSeconds  | `boolean`                    | `false` | 显示秒                      |
| hourStep     | `number`                     | `1`     | 小时步长                    |
| minuteStep   | `number`                     | `1`     | 分钟步长                    |
| secondStep   | `number`                     | `1`     | 秒步长                      |
| placeholder  | `string`                     | -       | 占位符                      |
| disabled     | `boolean`                    | `false` | 禁用                        |
| readonly     | `boolean`                    | `false` | 只读                        |
| required     | `boolean`                    | `false` | 必填                        |
| minTime      | `string`                     | -       | 最小可选时间                |
| maxTime      | `string`                     | -       | 最大可选时间                |
| clearable    | `boolean`                    | `true`  | 可清除                      |
| locale       | `string`                     | -       | 语言标识                    |
| labels       | `Partial<TimePickerLabels>`  | -       | 自定义文案                  |
| name         | `string`                     | -       | input name                  |
| id           | `string`                     | -       | input id                    |

### Events

| Vue Event            | React Callback | Payload                              | Description |
| -------------------- | -------------- | ------------------------------------ | ----------- |
| `@update:modelValue` | `onChange`     | `string \| null \| [string, string]` | 值变更      |
| `@change`            | -              | `string \| null \| [string, string]` | 值变更      |
| `@clear`             | `onClear`      | -                                    | 清除        |

---

## Upload 上传

### Props

| Prop          | Type                                          | Default  | Description                             |
| ------------- | --------------------------------------------- | -------- | --------------------------------------- |
| fileList      | `UploadFile[]`                                | `[]`     | 文件列表                                |
| accept        | `string`                                      | -        | 接受的文件类型（同 HTML accept）        |
| multiple      | `boolean`                                     | `false`  | 多选                                    |
| limit         | `number`                                      | -        | 最大文件数量                            |
| maxSize       | `number`                                      | -        | 最大文件大小（字节）                    |
| disabled      | `boolean`                                     | `false`  | 禁用                                    |
| drag          | `boolean`                                     | `false`  | 拖拽上传                                |
| listType      | `'text' \| 'picture' \| 'picture-card'`       | `'text'` | 文件列表展示类型                        |
| showFileList  | `boolean`                                     | `true`   | 是否显示文件列表                        |
| autoUpload    | `boolean`                                     | `true`   | 选择文件后是否自动上传                  |
| customRequest | `(options: UploadRequestOptions) => void`     | -        | 自定义上传请求                          |
| beforeUpload  | `(file: File) => boolean \| Promise<boolean>` | -        | 上传前回调，返回 false 阻止上传         |
| locale        | `Partial<TigerLocale>`                        | -        | 国际化文案覆盖                          |
| labels        | `Partial<UploadLabels>`                       | -        | Upload UI 标签覆盖（优先级高于 locale） |

> **Vue**: 使用 `v-model:file-list` 绑定文件列表
> **React**: 使用 `fileList` + `onChange` 控制

### Events

| Vue Event           | React Callback | Payload                                      | Description                           |
| ------------------- | -------------- | -------------------------------------------- | ------------------------------------- |
| `@update:file-list` | -              | `(fileList: UploadFile[])`                   | 文件列表变更（Vue v-model 专用）      |
| `@change`           | `onChange`     | `(file: UploadFile, fileList: UploadFile[])` | 文件变更                              |
| `@remove`           | `onRemove`     | `(file: UploadFile, fileList: UploadFile[])` | 移除文件（React 返回 `false` 可阻止） |
| `@preview`          | `onPreview`    | `(file: UploadFile)`                         | 预览文件                              |
| `@progress`         | `onProgress`   | `(progress: number, file: UploadFile)`       | 上传进度                              |
| `@success`          | `onSuccess`    | `(response: unknown, file: UploadFile)`      | 上传成功                              |
| `@error`            | `onError`      | `(error: Error, file: UploadFile)`           | 上传失败                              |
| `@exceed`           | `onExceed`     | `(files: File[], fileList: UploadFile[])`    | 超出文件数量限制                      |

---

## AutoComplete 自动完成

### Props

| Prop                     | Type                                                                | Default | Description                   |
| ------------------------ | ------------------------------------------------------------------- | ------- | ----------------------------- |
| modelValue               | `string`                                                            | -       | 绑定值 (v-model) (Vue only)   |
| value                    | `string`                                                            | -       | 绑定值（受控） (React only)   |
| defaultValue             | `string`                                                            | -       | 默认值（非受控） (React only) |
| options                  | `AutoCompleteOption[]`                                              | `[]`    | 候选项列表                    |
| placeholder              | `string`                                                            | -       | 输入框占位符                  |
| size                     | `'sm' \| 'md' \| 'lg'`                                              | `'md'`  | 尺寸                          |
| disabled                 | `boolean`                                                           | `false` | 禁用状态                      |
| clearable                | `boolean`                                                           | `false` | 可清除                        |
| notFoundText             | `string`                                                            | -       | 无匹配时文案                  |
| filterOption             | `boolean \| (input: string, option: AutoCompleteOption) => boolean` | `true`  | 筛选函数（false 禁用过滤）    |
| defaultActiveFirstOption | `boolean`                                                           | `true`  | 默认高亮第一项                |
| allowFreeInput           | `boolean`                                                           | `true`  | 允许自由输入非候选值          |
| className                | `string`                                                            | -       | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop | Payload                        | Description  |
| -------------------- | ---------- | ------------------------------ | ------------ |
| `@update:modelValue` | -          | `string`                       | 值变更       |
| `@change`            | `onChange` | `(value: string)`              | 值变更       |
| `@select`            | `onSelect` | `(option: AutoCompleteOption)` | 选中候选项   |
| `@search`            | `onSearch` | `(value: string)`              | 搜索输入变更 |

---

## Cascader 级联选择

### Props

| Prop           | Type                            | Default   | Description                                |
| -------------- | ------------------------------- | --------- | ------------------------------------------ |
| modelValue     | `CascaderValue`                 | -         | 绑定值 (v-model) (Vue only)                |
| value          | `CascaderValue`                 | -         | 绑定值（受控） (React only)                |
| defaultValue   | `CascaderValue`                 | -         | 默认值（非受控） (React only)              |
| options        | `CascaderOption[]`              | `[]`      | 层级选项数据                               |
| placeholder    | `string`                        | -         | 占位符                                     |
| size           | `'sm' \| 'md' \| 'lg'`          | `'md'`    | 尺寸                                       |
| disabled       | `boolean`                       | `false`   | 禁用状态                                   |
| clearable      | `boolean`                       | `true`    | 可清除                                     |
| showSearch     | `boolean \| CascaderShowSearch` | `false`   | 显示搜索框（对象可配 filter/render/limit） |
| expandTrigger  | `'click' \| 'hover'`            | `'click'` | 子级展开触发方式                           |
| changeOnSelect | `boolean`                       | `false`   | 选择即改变（非叶子节点可选）               |
| separator      | `string`                        | `' / '`   | 显示值分隔符                               |
| notFoundText   | `string`                        | -         | 空数据文案                                 |
| className      | `string`                        | -         | 自定义类名 (React only)                    |

### Events

| Vue Event            | React Prop | Payload                  | Description |
| -------------------- | ---------- | ------------------------ | ----------- |
| `@update:modelValue` | -          | `CascaderValue`          | 值变更      |
| `@change`            | `onChange` | `(value: CascaderValue)` | 值变更      |

---

## ColorPicker 颜色选择器

### Props

| Prop         | Type                      | Default | Description                   |
| ------------ | ------------------------- | ------- | ----------------------------- |
| modelValue   | `string`                  | -       | 绑定值 (v-model) (Vue only)   |
| value        | `string`                  | -       | 绑定值（受控） (React only)   |
| defaultValue | `string`                  | -       | 默认值（非受控） (React only) |
| disabled     | `boolean`                 | `false` | 禁用状态                      |
| size         | `'sm' \| 'md' \| 'lg'`    | `'md'`  | 尺寸                          |
| showAlpha    | `boolean`                 | `false` | 显示透明度调节                |
| format       | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | 颜色值输出格式                |
| presets      | `string[]`                | -       | 预设色板                      |
| className    | `string`                  | -       | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop | Payload           | Description |
| -------------------- | ---------- | ----------------- | ----------- |
| `@update:modelValue` | -          | `string`          | 值变更      |
| `@change`            | `onChange` | `(color: string)` | 颜色值变更  |

---

## ColorSwatch 色板选择器

### Props

| Prop         | Type                       | Default            | Description                   |
| ------------ | -------------------------- | ------------------ | ----------------------------- |
| modelValue   | `string`                   | -                  | 绑定值 (v-model) (Vue only)   |
| value        | `string`                   | -                  | 绑定值（受控） (React only)   |
| defaultValue | `string`                   | -                  | 默认值（非受控） (React only) |
| disabled     | `boolean`                  | `false`            | 禁用状态                      |
| size         | `'sm' \| 'md' \| 'lg'`     | `'md'`             | 色块尺寸                      |
| colors       | `ColorSwatchOptionInput[]` | 默认预设色组       | 单组色板                      |
| groups       | `ColorSwatchGroup[]`       | 默认预设色组       | 自定义色组                    |
| columns      | `number`                   | `6`                | 每组列数                      |
| ariaLabel    | `string`                   | `'Color swatches'` | 色板组无障碍标签              |
| className    | `string`                   | -                  | 自定义类名 (React only)       |

### Types

| Type                     | Definition                                              |
| ------------------------ | ------------------------------------------------------- |
| `ColorSwatchOption`      | `{ value: string; label?: string; disabled?: boolean }` |
| `ColorSwatchOptionInput` | `string \| ColorSwatchOption`                           |
| `ColorSwatchGroup`       | `{ label?: string; colors: ColorSwatchOptionInput[] }`  |

### Events

| Vue Event            | React Prop | Payload                              | Description |
| -------------------- | ---------- | ------------------------------------ | ----------- |
| `@update:modelValue` | -          | `string`                             | 值变更      |
| `@change`            | `onChange` | `(value, option: ColorSwatchOption)` | 颜色值变更  |

---

## Signature 手写签名

### Props

| Prop            | Type                                                             | Default           | Description                     |
| --------------- | ---------------------------------------------------------------- | ----------------- | ------------------------------- |
| modelValue      | `string`                                                         | -                 | 绑定导出值 (v-model) (Vue only) |
| width           | `number`                                                         | `480`             | 画布逻辑宽度                    |
| height          | `number`                                                         | `180`             | 画布逻辑高度                    |
| penColor        | `string`                                                         | `'#111827'`       | 笔迹颜色                        |
| backgroundColor | `string`                                                         | -                 | 背景色；不传则透明              |
| lineWidth       | `number`                                                         | `2`               | 笔迹宽度，自动限制在 1-24       |
| disabled        | `boolean`                                                        | `false`           | 禁用状态                        |
| readonly        | `boolean`                                                        | `false`           | 只读状态                        |
| clearable       | `boolean`                                                        | `true`            | 显示清空按钮                    |
| exportType      | `'image/png' \| 'image/jpeg' \| 'image/webp' \| 'image/svg+xml'` | `'image/png'`     | `change` 输出格式               |
| quality         | `number`                                                         | `0.92`            | PNG/JPEG/WebP 导出质量          |
| ariaLabel       | `string`                                                         | `'Signature pad'` | 画布无障碍标签                  |
| clearText       | `string`                                                         | `'Clear'`         | 清空按钮文本                    |
| className       | `string`                                                         | -                 | 自定义类名 (React only)         |

### Events

| Vue Event            | React Prop | Payload                  | Description           |
| -------------------- | ---------- | ------------------------ | --------------------- |
| `@update:modelValue` | -          | `string`                 | 导出值变更 (Vue only) |
| `@change`            | `onChange` | `SignatureChangePayload` | 签名结束或清空后触发  |
| `@begin`             | `onBegin`  | -                        | 开始绘制              |
| `@end`               | `onEnd`    | `SignatureChangePayload` | 单次绘制结束          |
| `@clear`             | -          | -                        | 清空画板 (Vue only)   |

### Methods (Vue expose / React SignatureRef)

| Method    | Type                                                       | Description            |
| --------- | ---------------------------------------------------------- | ---------------------- |
| clear     | `() => void`                                               | 清空画板               |
| isEmpty   | `() => boolean`                                            | 当前是否为空           |
| toDataURL | `(type?: SignatureExportType, quality?: number) => string` | 导出 PNG/JPEG/WebP/SVG |
| toSVG     | `() => string`                                             | 导出 SVG 字符串        |

---

## NumberKeyboard 数字键盘

### Props

| Prop             | Type                                           | Default             | Description                         |
| ---------------- | ---------------------------------------------- | ------------------- | ----------------------------------- |
| modelValue       | `string`                                       | -                   | 绑定值 (v-model) (Vue only)         |
| value            | `string`                                       | -                   | 绑定值（受控） (React only)         |
| defaultValue     | `string`                                       | `''`                | 默认值（非受控）                    |
| mode             | `'number' \| 'amount' \| 'phone' \| 'id-card'` | `'number'`          | 输入模式                            |
| maxLength        | `number`                                       | 模式默认            | 最大长度，phone 默认 11，id-card 18 |
| precision        | `number`                                       | `2` (amount only)   | amount 模式小数位限制               |
| decimalSeparator | `string`                                       | `'.'`               | amount 模式小数分隔符               |
| disabled         | `boolean`                                      | `false`             | 禁用状态                            |
| readonly         | `boolean`                                      | `false`             | 只读状态                            |
| confirmText      | `string`                                       | `'Done'`            | 确认按钮文本                        |
| deleteText       | `string`                                       | `'Delete'`          | 删除按钮文本                        |
| ariaLabel        | `string`                                       | `'Number keyboard'` | 键盘无障碍标签                      |
| showConfirm      | `boolean`                                      | `true`              | 是否显示确认按钮                    |
| className        | `string`                                       | -                   | 自定义类名 (React only)             |

### Events

| Vue Event            | React Prop   | Payload                                         | Description       |
| -------------------- | ------------ | ----------------------------------------------- | ----------------- |
| `@update:modelValue` | -            | `string`                                        | 值变更 (Vue only) |
| `@change`            | `onChange`   | `(value, payload: NumberKeyboardChangePayload)` | 值变更            |
| `@key-press`         | `onKeyPress` | `(key, payload)`                                | 按键触发          |
| `@delete`            | `onDelete`   | `(value, payload)`                              | 删除键触发        |
| `@confirm`           | `onConfirm`  | `(value, payload)`                              | 确认键触发        |

---

## Mentions 提及

### Props

| Prop         | Type                   | Default | Description                   |
| ------------ | ---------------------- | ------- | ----------------------------- |
| modelValue   | `string`               | -       | 绑定值 (v-model) (Vue only)   |
| value        | `string`               | -       | 绑定值（受控） (React only)   |
| defaultValue | `string`               | -       | 默认值（非受控） (React only) |
| prefix       | `string`               | `'@'`   | 触发字符                      |
| options      | `MentionOption[]`      | `[]`    | 候选项列表                    |
| placeholder  | `string`               | -       | 占位符                        |
| disabled     | `boolean`              | `false` | 禁用状态                      |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                          |
| rows         | `number`               | `1`     | 文本框行数                    |
| className    | `string`               | -       | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop | Payload                   | Description    |
| -------------------- | ---------- | ------------------------- | -------------- |
| `@update:modelValue` | -          | `string`                  | 值变更         |
| `@change`            | `onChange` | `(value: string)`         | 值变更         |
| `@select`            | `onSelect` | `(option: MentionOption)` | 选中提及候选项 |

---

## Rate 评分

### Props

| Prop         | Type                   | Default | Description                   |
| ------------ | ---------------------- | ------- | ----------------------------- |
| modelValue   | `number`               | `0`     | 绑定值 (v-model) (Vue only)   |
| value        | `number`               | -       | 绑定值（受控） (React only)   |
| defaultValue | `number`               | `0`     | 默认值（非受控） (React only) |
| count        | `number`               | `5`     | 星星总数                      |
| allowHalf    | `boolean`              | `false` | 允许半选                      |
| disabled     | `boolean`              | `false` | 禁用状态                      |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                          |
| allowClear   | `boolean`              | `true`  | 允许清除（再次点击）          |
| character    | `string`               | -       | 自定义字符                    |
| className    | `string`               | -       | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop      | Payload           | Description |
| -------------------- | --------------- | ----------------- | ----------- |
| `@update:modelValue` | -               | `number`          | 值变更      |
| `@change`            | `onChange`      | `(value: number)` | 评分变更    |
| `@hover-change`      | `onHoverChange` | `(value: number)` | 悬停值变化  |

---

## Stepper 步进器

### Props

| Prop         | Type                   | Default     | Description                   |
| ------------ | ---------------------- | ----------- | ----------------------------- |
| modelValue   | `number`               | `0`         | 绑定值 (v-model) (Vue only)   |
| value        | `number`               | -           | 绑定值（受控） (React only)   |
| defaultValue | `number`               | `0`         | 默认值（非受控） (React only) |
| min          | `number`               | `-Infinity` | 最小值                        |
| max          | `number`               | `Infinity`  | 最大值                        |
| step         | `number`               | `1`         | 步长                          |
| disabled     | `boolean`              | `false`     | 禁用状态                      |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`      | 尺寸                          |
| precision    | `number`               | -           | 数值精度（小数位）            |
| className    | `string`               | -           | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop | Payload           | Description |
| -------------------- | ---------- | ----------------- | ----------- |
| `@update:modelValue` | -          | `number`          | 值变更      |
| `@change`            | `onChange` | `(value: number)` | 值变更      |

---

## Transfer 穿梭框

### Props

| Prop         | Type                                             | Default    | Description             |
| ------------ | ------------------------------------------------ | ---------- | ----------------------- |
| dataSource   | `TransferItem[]`                                 | `[]`       | 数据源                  |
| targetKeys   | `(string \| number)[]`                           | `[]`       | 目标框选中项 key 列表   |
| size         | `'sm' \| 'md' \| 'lg'`                           | `'md'`     | 尺寸                    |
| disabled     | `boolean`                                        | `false`    | 禁用状态                |
| showSearch   | `boolean`                                        | `false`    | 显示搜索框              |
| sourceTitle  | `string`                                         | `'Source'` | 左侧标题                |
| targetTitle  | `string`                                         | `'Target'` | 右侧标题                |
| notFoundText | `string`                                         | -          | 空数据文案              |
| filterOption | `(input: string, item: TransferItem) => boolean` | -          | 自定义搜索过滤          |
| className    | `string`                                         | -          | 自定义类名 (React only) |

### Events

| Vue Event | React Prop | Payload                                                                                            | Description |
| --------- | ---------- | -------------------------------------------------------------------------------------------------- | ----------- |
| `@change` | `onChange` | `(targetKeys: (string \| number)[], direction: TransferDirection, moveKeys: (string \| number)[])` | 选项移动    |

---

## TreeSelect 树选择

### Props

| Prop             | Type                   | Default | Description                   |
| ---------------- | ---------------------- | ------- | ----------------------------- |
| modelValue       | `TreeSelectValue`      | -       | 绑定值 (v-model) (Vue only)   |
| value            | `TreeSelectValue`      | -       | 绑定值（受控） (React only)   |
| defaultValue     | `TreeSelectValue`      | -       | 默认值（非受控） (React only) |
| treeData         | `TreeSelectNode[]`     | `[]`    | 树形数据                      |
| placeholder      | `string`               | -       | 占位符                        |
| size             | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                          |
| disabled         | `boolean`              | `false` | 禁用状态                      |
| clearable        | `boolean`              | `false` | 可清除                        |
| multiple         | `boolean`              | `false` | 多选                          |
| showSearch       | `boolean`              | `false` | 显示搜索框                    |
| notFoundText     | `string`               | -       | 空数据文案                    |
| defaultExpandAll | `boolean`              | `false` | 默认展开所有节点              |
| className        | `string`               | -       | 自定义类名 (React only)       |

### Events

| Vue Event            | React Prop | Payload                    | Description |
| -------------------- | ---------- | -------------------------- | ----------- |
| `@update:modelValue` | -          | `TreeSelectValue`          | 值变更      |
| `@change`            | `onChange` | `(value: TreeSelectValue)` | 值变更      |

> **See also**: [Vue examples](../../vue/form.md) · [React examples](../../react/form.md)

---

## useFormController 表单控制器

无头（headless）表单状态管理 hook，可脱离 `<Form>` 组件独立使用。

### Options

| Option         | Type        | Default | Description    |
| -------------- | ----------- | ------- | -------------- |
| initialValues  | `object`    | `{}`    | 初始值         |
| rules          | `FormRules` | -       | 校验规则       |
| undoable       | `boolean`   | `false` | 启用撤销/重做  |
| maxHistorySize | `number`    | `50`    | 最大历史记录数 |

### 返回值 (FormController)

| Field / Method | Type                                     | Description         |
| -------------- | ---------------------------------------- | ------------------- |
| values         | `Reactive<object>` / `object`            | 当前表单值          |
| errors         | `Record<string, string>`                 | 字段错误映射        |
| errorsByField  | `(name: string) => string \| undefined`  | 获取指定字段错误    |
| hasErrors      | `boolean`                                | 是否存在错误        |
| setFieldValue  | `(name: string, value: unknown) => void` | 设置单个字段值      |
| setValues      | `(values: object) => void`               | 批量设置值          |
| getFieldValue  | `(name: string) => unknown`              | 获取字段值          |
| validate       | `() => Promise<boolean>`                 | 验证全部字段        |
| validateFields | `(fields: string[]) => Promise<boolean>` | 验证指定字段        |
| validateField  | `(name: string) => Promise<boolean>`     | 验证单个字段        |
| clearValidate  | `(fields?: string \| string[]) => void`  | 清除校验状态        |
| reset          | `() => void`                             | 重置到初始值        |
| undo           | `() => void`                             | 撤销（需 undoable） |
| redo           | `() => void`                             | 重做（需 undoable） |
| canUndo        | `boolean`                                | 是否可撤销          |
| canRedo        | `boolean`                                | 是否可重做          |

### Usage

- **Vue**: `const ctrl = useFormController({ initialValues, rules })`
- **React**: `const ctrl = useFormController({ initialValues, rules })`
