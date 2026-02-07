---
name: tigercat-shared-props-form
description: Shared props definitions for form components - Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload
---

# Form Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

> **绑定差异**: Vue 使用 `modelValue` + `v-model`，React 使用 `value`/`checked` + `onChange`。详见 [patterns/common.md](../patterns/common.md)

---

## Form 表单

### Props

| Prop                 | Type                         | Default   | Vue | React | Description              |
| -------------------- | ---------------------------- | --------- | :-: | :---: | ------------------------ |
| model                | `object`                     | `{}`      |  ✓  |   ✓   | 表单数据对象             |
| rules                | `FormRules`                  | -         |  ✓  |   ✓   | 校验规则（字段名→规则）  |
| labelWidth           | `string \| number`           | -         |  ✓  |   ✓   | 标签宽度                 |
| labelPosition        | `'left' \| 'right' \| 'top'` | `'right'` |  ✓  |   ✓   | 标签位置                 |
| labelAlign           | `'left' \| 'right' \| 'top'` | `'right'` |  ✓  |   ✓   | 标签文字对齐             |
| size                 | `'sm' \| 'md' \| 'lg'`       | `'md'`    |  ✓  |   ✓   | 表单尺寸（影响子表单项） |
| inlineMessage        | `boolean`                    | `true`    |  ✓  |   ✓   | 是否行内显示校验消息     |
| showRequiredAsterisk | `boolean`                    | `true`    |  ✓  |   ✓   | 必填字段显示星号         |
| disabled             | `boolean`                    | `false`   |  ✓  |   ✓   | 禁用所有表单项           |
| className            | `string`                     | -         |  -  |   ✓   | 自定义 CSS 类            |

### Events

| Vue Event   | React Callback | Payload                                      | Description     |
| ----------- | -------------- | -------------------------------------------- | --------------- |
| `@submit`   | `onSubmit`     | `{ valid, values, errors }`                  | 表单提交        |
| `@validate` | `onValidate`   | `(fieldName: string, valid, error?: string)` | 字段校验完成    |
| -           | `onChange`     | `FormValues`                                 | 值变更（React） |

### Methods (Vue expose / React FormHandle ref)

| Method         | Type                                          | Description      |
| -------------- | --------------------------------------------- | ---------------- |
| validate       | `() => Promise<boolean>`                      | 验证整个表单     |
| validateFields | `(fields: string[]) => Promise<boolean>`      | 验证指定字段列表 |
| validateField  | `(name: string, rules?, trigger?) => Promise` | 验证单个字段     |
| clearValidate  | `(fields?: string \| string[]) => void`       | 清除验证状态     |
| resetFields    | `() => void`                                  | 重置表单         |

---

## FormItem 表单项

### Props

| Prop        | Type                     | Default | Vue | React | Description                                                                           |
| ----------- | ------------------------ | ------- | :-: | :---: | ------------------------------------------------------------------------------------- |
| name        | `string`                 | -       |  ✓  |   ✓   | 字段名（对应 model 中的 key，支持嵌套如 `user.name`）                                 |
| label       | `string`                 | -       |  ✓  |   ✓   | 标签文本                                                                              |
| labelWidth  | `string \| number`       | -       |  ✓  |   ✓   | 标签宽度（覆盖 Form 级别）                                                            |
| required    | `boolean`                | -       |  ✓  |   ✓   | 必填标记（也可通过 rules 中 required 自动推断）                                       |
| rules       | `FormRule \| FormRule[]` | -       |  ✓  |   ✓   | 字段校验规则（覆盖 Form 级别）                                                        |
| error       | `string`                 | -       |  ✓  |   ✓   | 错误信息（受控模式）                                                                  |
| showMessage | `boolean`                | `true`  |  ✓  |   ✓   | 是否在表单项下方显示错误信息。设为 `false` 可让 Input 内部显示错误（抖动 + 错误文字） |
| size        | `'sm' \| 'md' \| 'lg'`   | -       |  ✓  |   ✓   | 尺寸（覆盖 Form 级别）                                                                |
| className   | `string`                 | -       |  -  |   ✓   | 自定义 CSS 类                                                                         |

---

## Input 输入框

### Props

| Prop         | Type                                                                        | Default     | Vue | React | Description      |
| ------------ | --------------------------------------------------------------------------- | ----------- | :-: | :---: | ---------------- |
| modelValue   | `string \| number`                                                          | -           |  ✓  |   -   | 绑定值 (v-model) |
| value        | `string \| number`                                                          | -           |  -  |   ✓   | 绑定值（受控）   |
| defaultValue | `string \| number`                                                          | -           |  -  |   ✓   | 默认值（非受控） |
| type         | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'`    |  ✓  |   ✓   | 输入类型         |
| size         | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`      |  ✓  |   ✓   | 尺寸             |
| placeholder  | `string`                                                                    | `''`        |  ✓  |   ✓   | 占位符           |
| disabled     | `boolean`                                                                   | `false`     |  ✓  |   ✓   | 禁用             |
| readonly     | `boolean`                                                                   | `false`     |  ✓  |   ✓   | 只读             |
| required     | `boolean`                                                                   | `false`     |  ✓  |   ✓   | 必填             |
| maxLength    | `number`                                                                    | -           |  ✓  |   ✓   | 最大长度         |
| minLength    | `number`                                                                    | -           |  ✓  |   ✓   | 最小长度         |
| name         | `string`                                                                    | -           |  ✓  |   ✓   | name 属性        |
| id           | `string`                                                                    | -           |  ✓  |   ✓   | id 属性          |
| autoComplete | `string`                                                                    | -           |  ✓  |   ✓   | 自动完成         |
| autoFocus    | `boolean`                                                                   | `false`     |  ✓  |   ✓   | 自动聚焦         |
| prefix       | `string`                                                                    | -           |  ✓  |   -   | 前缀文本         |
| prefix       | `ReactNode`                                                                 | -           |  -  |   ✓   | 前缀节点         |
| suffix       | `string`                                                                    | -           |  ✓  |   -   | 后缀文本         |
| suffix       | `ReactNode`                                                                 | -           |  -  |   ✓   | 后缀节点         |
| status       | `'default' \| 'error' \| 'success' \| 'warning'`                            | `'default'` |  ✓  |   ✓   | 验证状态         |
| errorMessage | `string`                                                                    | -           |  ✓  |   ✓   | 错误信息         |
| className    | `string`                                                                    | -           |  ✓  |   ✓   | 自定义 CSS 类    |
| style        | `object`                                                                    | -           |  ✓  |   ✓   | 自定义行内样式   |

### Events

| Vue Event            | React Callback | Payload            | Description |
| -------------------- | -------------- | ------------------ | ----------- |
| `@update:modelValue` | -              | `string \| number` | 值变更      |
| `@input`             | `onInput`      | `Event`            | 输入事件    |
| `@change`            | `onChange`     | `Event`            | 值变更      |
| `@focus`             | `onFocus`      | `FocusEvent`       | 聚焦        |
| `@blur`              | `onBlur`       | `FocusEvent`       | 失焦        |

### Slots / Children

| Vue Slot | React Prop | Description |
| -------- | ---------- | ----------- |
| `prefix` | `prefix`   | 前缀内容    |
| `suffix` | `suffix`   | 后缀内容    |

---

## Textarea 文本域

### Props

| Prop         | Type                   | Default | Vue | React | Description                 |
| ------------ | ---------------------- | ------- | :-: | :---: | --------------------------- |
| modelValue   | `string`               | -       |  ✓  |   -   | 绑定值 (v-model)            |
| value        | `string`               | -       |  -  |   ✓   | 绑定值（受控）              |
| defaultValue | `string`               | -       |  -  |   ✓   | 默认值（非受控）            |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  |  ✓  |   ✓   | 尺寸                        |
| placeholder  | `string`               | `''`    |  ✓  |   ✓   | 占位符                      |
| disabled     | `boolean`              | `false` |  ✓  |   ✓   | 禁用                        |
| readonly     | `boolean`              | `false` |  ✓  |   ✓   | 只读                        |
| required     | `boolean`              | `false` |  ✓  |   ✓   | 必填                        |
| rows         | `number`               | `3`     |  ✓  |   ✓   | 行数                        |
| autoResize   | `boolean`              | `false` |  ✓  |   ✓   | 自适应高度                  |
| minRows      | `number`               | -       |  ✓  |   ✓   | 最小行数（配合 autoResize） |
| maxRows      | `number`               | -       |  ✓  |   ✓   | 最大行数（配合 autoResize） |
| maxLength    | `number`               | -       |  ✓  |   ✓   | 最大字符数                  |
| minLength    | `number`               | -       |  ✓  |   ✓   | 最小字符数                  |
| showCount    | `boolean`              | `false` |  ✓  |   ✓   | 显示字符计数                |
| name         | `string`               | -       |  ✓  |   ✓   | name 属性                   |
| id           | `string`               | -       |  ✓  |   ✓   | id 属性                     |
| autoComplete | `string`               | -       |  ✓  |   ✓   | 自动完成                    |
| autoFocus    | `boolean`              | `false` |  ✓  |   ✓   | 自动聚焦                    |
| className    | `string`               | -       |  ✓  |   ✓   | 自定义 CSS 类               |
| style        | `object`               | -       |  ✓  |   -   | 自定义行内样式              |

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

| Prop          | Type                                       | Default                  | Vue | React | Description          |
| ------------- | ------------------------------------------ | ------------------------ | :-: | :---: | -------------------- |
| modelValue    | `SelectValue \| SelectValues \| undefined` | -                        |  ✓  |   -   | 绑定值 (v-model)     |
| value         | `SelectValue \| SelectValues`              | -                        |  -  |   ✓   | 绑定值               |
| options       | `(SelectOption \| SelectOptionGroup)[]`    | `[]`                     |  ✓  |   ✓   | 选项（支持分组）     |
| size          | `'sm' \| 'md' \| 'lg'`                     | `'md'`                   |  ✓  |   ✓   | 尺寸                 |
| multiple      | `boolean`                                  | `false`                  |  ✓  |   ✓   | 多选                 |
| clearable     | `boolean`                                  | `true`                   |  ✓  |   ✓   | 可清除               |
| searchable    | `boolean`                                  | `false`                  |  ✓  |   ✓   | 可搜索               |
| placeholder   | `string`                                   | `'Select an option'`     |  ✓  |   ✓   | 占位符               |
| disabled      | `boolean`                                  | `false`                  |  ✓  |   ✓   | 禁用                 |
| noOptionsText | `string`                                   | `'No options found'`     |  ✓  |   ✓   | 搜索无结果时提示文案 |
| noDataText    | `string`                                   | `'No options available'` |  ✓  |   ✓   | 选项为空时提示文案   |

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

| Prop           | Type                          | Default | Vue | React | Description        |
| -------------- | ----------------------------- | ------- | :-: | :---: | ------------------ |
| modelValue     | `boolean`                     | -       |  ✓  |   -   | 绑定值 (v-model)   |
| checked        | `boolean`                     | -       |  -  |   ✓   | 选中状态（受控）   |
| defaultChecked | `boolean`                     | `false` |  ✓  |   ✓   | 默认选中（非受控） |
| value          | `string \| number \| boolean` | -       |  ✓  |   ✓   | 选项值（用于分组） |
| size           | `'sm' \| 'md' \| 'lg'`        | `'md'`  |  ✓  |   ✓   | 尺寸               |
| disabled       | `boolean`                     | `false` |  ✓  |   ✓   | 禁用               |
| indeterminate  | `boolean`                     | `false` |  ✓  |   ✓   | 半选状态           |
| className      | `string`                      | -       |  ✓  |   ✓   | 自定义 CSS 类      |

### Events

| Vue Event            | React Callback | Payload          | Description |
| -------------------- | -------------- | ---------------- | ----------- |
| `@update:modelValue` | `onChange`     | `boolean`        | 状态变更    |
| `@change`            | -              | `boolean, Event` | 值变更      |

---

## CheckboxGroup 复选框组

### Props

| Prop         | Type                              | Default | Vue | React | Description      |
| ------------ | --------------------------------- | ------- | :-: | :---: | ---------------- |
| modelValue   | `(string \| number \| boolean)[]` | `[]`    |  ✓  |   -   | 绑定值 (v-model) |
| value        | `(string \| number \| boolean)[]` | `[]`    |  -  |   ✓   | 选中值（受控）   |
| defaultValue | `(string \| number \| boolean)[]` | `[]`    |  ✓  |   ✓   | 默认值（非受控） |
| disabled     | `boolean`                         | `false` |  ✓  |   ✓   | 禁用所有复选框   |
| size         | `'sm' \| 'md' \| 'lg'`            | `'md'`  |  ✓  |   ✓   | 统一尺寸         |
| className    | `string`                          | -       |  ✓  |   ✓   | 自定义 CSS 类    |

### Events

| Vue Event            | React Callback | Payload                           | Description |
| -------------------- | -------------- | --------------------------------- | ----------- |
| `@update:modelValue` | `onChange`     | `(string \| number \| boolean)[]` | 值变更      |
| `@change`            | -              | `(string \| number \| boolean)[]` | 值变更      |

---

## Radio 单选框

### Props

| Prop           | Type                   | Default | Vue | React | Description        |
| -------------- | ---------------------- | ------- | :-: | :---: | ------------------ |
| value          | `string \| number`     | -       |  ✓  |   ✓   | 选项值（必填）     |
| checked        | `boolean`              | -       |  ✓  |   ✓   | 选中状态（受控）   |
| defaultChecked | `boolean`              | `false` |  ✓  |   ✓   | 默认选中（非受控） |
| size           | `'sm' \| 'md' \| 'lg'` | `'md'`  |  ✓  |   ✓   | 尺寸               |
| disabled       | `boolean`              | `false` |  ✓  |   ✓   | 禁用               |
| name           | `string`               | -       |  ✓  |   ✓   | name 属性          |
| className      | `string`               | -       |  ✓  |   ✓   | 自定义 CSS 类      |
| style          | `object`               | -       |  ✓  |   ✓   | 自定义行内样式     |

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

| Prop         | Type                   | Default | Vue | React | Description      |
| ------------ | ---------------------- | ------- | :-: | :---: | ---------------- |
| value        | `string \| number`     | -       |  ✓  |   ✓   | 当前值（受控）   |
| defaultValue | `string \| number`     | -       |  ✓  |   ✓   | 默认值（非受控） |
| name         | `string`               | auto    |  ✓  |   ✓   | name 属性        |
| disabled     | `boolean`              | `false` |  ✓  |   ✓   | 禁用所有选项     |
| size         | `'sm' \| 'md' \| 'lg'` | `'md'`  |  ✓  |   ✓   | 统一尺寸         |
| className    | `string`               | -       |  ✓  |   ✓   | 自定义 CSS 类    |

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

| Prop     | Type                   | Default | Vue | React | Description                      |
| -------- | ---------------------- | ------- | :-: | :---: | -------------------------------- |
| checked  | `boolean`              | `false` |  ✓  |   ✓   | 开关状态（Vue: v-model:checked） |
| size     | `'sm' \| 'md' \| 'lg'` | `'md'`  |  ✓  |   ✓   | 尺寸                             |
| disabled | `boolean`              | `false` |  ✓  |   ✓   | 禁用                             |

### Events

| Vue Event         | React Callback | Payload   | Description |
| ----------------- | -------------- | --------- | ----------- |
| `@update:checked` | `onChange`     | `boolean` | 状态变更    |
| `@change`         | -              | `boolean` | 状态变更    |

---

## Slider 滑块

### Props

| Prop         | Type                                | Default | Vue | React | Description                    |
| ------------ | ----------------------------------- | ------- | :-: | :---: | ------------------------------ |
| value        | `number \| [number, number]`        | -       |  ✓  |   ✓   | 当前值（Vue 用 v-model:value） |
| defaultValue | `number \| [number, number]`        | -       |  ✓  |   ✓   | 默认值（非受控模式）           |
| min          | `number`                            | `0`     |  ✓  |   ✓   | 最小值                         |
| max          | `number`                            | `100`   |  ✓  |   ✓   | 最大值                         |
| step         | `number`                            | `1`     |  ✓  |   ✓   | 步长                           |
| range        | `boolean`                           | `false` |  ✓  |   ✓   | 范围选择                       |
| disabled     | `boolean`                           | `false` |  ✓  |   ✓   | 禁用                           |
| marks        | `boolean \| Record<number, string>` | `false` |  ✓  |   ✓   | 刻度标记                       |
| tooltip      | `boolean`                           | `true`  |  ✓  |   ✓   | 拖动时显示值提示               |
| size         | `'sm' \| 'md' \| 'lg'`              | `'md'`  |  ✓  |   ✓   | 尺寸                           |

### Events

| Vue Event       | React Callback | Payload                      | Description |
| --------------- | -------------- | ---------------------------- | ----------- |
| `@update:value` | `onChange`     | `number \| [number, number]` | 值变更      |
| `@change`       | -              | `number \| [number, number]` | 值变更      |

---

## DatePicker 日期选择器

### Props

| Prop        | Type                           | Default        | Vue | React | Description |
| ----------- | ------------------------------ | -------------- | :-: | :---: | ----------- |
| modelValue  | `Date \| null \| [Date, Date]` | `null`         |  ✓  |   -   | 绑定值      |
| value       | `Date \| null \| [Date, Date]` | `null`         |  -  |   ✓   | 值          |
| format      | `string`                       | `'YYYY-MM-DD'` |  ✓  |   ✓   | 日期格式    |
| placeholder | `string`                       | -              |  ✓  |   ✓   | 占位符      |
| range       | `boolean`                      | `false`        |  ✓  |   ✓   | 范围选择    |
| disabled    | `boolean`                      | `false`        |  ✓  |   ✓   | 禁用        |
| locale      | `DatePickerLocale`             | -              |  ✓  |   ✓   | 国际化配置  |

---

## TimePicker 时间选择器

### Props

| Prop        | Type               | Default      | Vue | React | Description |
| ----------- | ------------------ | ------------ | :-: | :---: | ----------- |
| modelValue  | `string`           | -            |  ✓  |   -   | 绑定值      |
| value       | `string`           | -            |  -  |   ✓   | 值          |
| format      | `string`           | `'HH:mm:ss'` |  ✓  |   ✓   | 时间格式    |
| placeholder | `string`           | -            |  ✓  |   ✓   | 占位符      |
| disabled    | `boolean`          | `false`      |  ✓  |   ✓   | 禁用        |
| labels      | `TimePickerLabels` | -            |  ✓  |   ✓   | 标签文本    |

---

## Upload 上传

### Props

| Prop     | Type           | Default | Vue | React | Description    |
| -------- | -------------- | ------- | :-: | :---: | -------------- |
| fileList | `UploadFile[]` | `[]`    |  ✓  |   ✓   | 文件列表       |
| action   | `string`       | -       |  ✓  |   ✓   | 上传地址       |
| limit    | `number`       | -       |  ✓  |   ✓   | 最大数量       |
| accept   | `string`       | -       |  ✓  |   ✓   | 接受的文件类型 |
| drag     | `boolean`      | `false` |  ✓  |   ✓   | 拖拽上传       |
| multiple | `boolean`      | `false` |  ✓  |   ✓   | 多选           |
| disabled | `boolean`      | `false` |  ✓  |   ✓   | 禁用           |

> **Vue**: 使用 `v-model:file-list` 绑定文件列表
> **React**: 使用 `fileList` + `onChange` 控制

### Events

| Vue Event          | React Callback | Payload            | Description  |
| ------------------ | -------------- | ------------------ | ------------ |
| `@update:fileList` | `onChange`     | `UploadFile[]`     | 文件列表变更 |
| `@success`         | `onSuccess`    | `(file, response)` | 上传成功     |
| `@error`           | `onError`      | `(file, error)`    | 上传失败     |
| `@remove`          | `onRemove`     | `file`             | 移除文件     |

---

> **See also**: [Vue examples](../vue/form.md) · [React examples](../react/form.md)
