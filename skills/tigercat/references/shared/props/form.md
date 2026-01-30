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

| Prop          | Type                         | Default   | Vue | React | Description    |
| ------------- | ---------------------------- | --------- | :-: | :---: | -------------- |
| model         | `object`                     | -         |  ✓  |   -   | 表单数据对象   |
| rules         | `object`                     | -         |  ✓  |   -   | 校验规则       |
| labelWidth    | `string \| number`           | -         |  ✓  |   ✓   | 标签宽度       |
| labelPosition | `'left' \| 'right' \| 'top'` | `'right'` |  ✓  |   ✓   | 标签位置       |
| disabled      | `boolean`                    | `false`   |  ✓  |   ✓   | 禁用所有表单项 |

### Methods (Vue only)

| Method        | Type                                 | Description  |
| ------------- | ------------------------------------ | ------------ |
| validate      | `() => Promise<boolean>`             | 验证表单     |
| validateField | `(prop: string) => Promise<boolean>` | 验证单个字段 |
| resetFields   | `() => void`                         | 重置表单     |
| clearValidate | `(props?: string[]) => void`         | 清除验证状态 |

> **React**: 表单验证需自行实现或使用第三方库（如 react-hook-form）

---

## FormItem 表单项

### Props

| Prop     | Type      | Default | Vue | React | Description                   |
| -------- | --------- | ------- | :-: | :---: | ----------------------------- |
| prop     | `string`  | -       |  ✓  |   -   | 字段名（对应 model 中的 key） |
| name     | `string`  | -       |  -  |   ✓   | 字段名                        |
| label    | `string`  | -       |  ✓  |   ✓   | 标签文本                      |
| required | `boolean` | `false` |  ✓  |   ✓   | 必填标记                      |
| error    | `string`  | -       |  ✓  |   ✓   | 错误信息                      |

---

## Input 输入框

### Props

| Prop         | Type                                          | Default  | Vue | React | Description      |
| ------------ | --------------------------------------------- | -------- | :-: | :---: | ---------------- |
| modelValue   | `string`                                      | -        |  ✓  |   -   | 绑定值 (v-model) |
| value        | `string`                                      | -        |  -  |   ✓   | 绑定值           |
| type         | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` |  ✓  |   ✓   | 输入类型         |
| placeholder  | `string`                                      | -        |  ✓  |   ✓   | 占位符           |
| disabled     | `boolean`                                     | `false`  |  ✓  |   ✓   | 禁用             |
| clearable    | `boolean`                                     | `false`  |  ✓  |   ✓   | 可清除           |
| prefix       | `string`                                      | -        |  ✓  |   -   | 前缀文本         |
| prefix       | `ReactNode`                                   | -        |  -  |   ✓   | 前缀节点         |
| suffix       | `string`                                      | -        |  ✓  |   -   | 后缀文本         |
| suffix       | `ReactNode`                                   | -        |  -  |   ✓   | 后缀节点         |
| status       | `'error' \| 'warning'`                        | -        |  ✓  |   ✓   | 状态             |
| errorMessage | `string`                                      | -        |  ✓  |   ✓   | 错误信息         |

### Events

| Vue Event            | React Callback | Payload           | Description |
| -------------------- | -------------- | ----------------- | ----------- |
| `@update:modelValue` | `onChange`     | `string \| Event` | 值变更      |
| `@change`            | `onChange`     | `Event`           | 值变更      |
| `@blur`              | `onBlur`       | `FocusEvent`      | 失焦        |
| `@focus`             | `onFocus`      | `FocusEvent`      | 聚焦        |
| `@clear`             | `onClear`      | -                 | 清除        |

### Slots / Children

| Vue Slot | React Prop | Description |
| -------- | ---------- | ----------- |
| `prefix` | `prefix`   | 前缀内容    |
| `suffix` | `suffix`   | 后缀内容    |

---

## Textarea 文本域

### Props

| Prop        | Type                                | Default | Vue | React | Description |
| ----------- | ----------------------------------- | ------- | :-: | :---: | ----------- |
| modelValue  | `string`                            | -       |  ✓  |   -   | 绑定值      |
| value       | `string`                            | -       |  -  |   ✓   | 绑定值      |
| rows        | `number`                            | `3`     |  ✓  |   ✓   | 行数        |
| autosize    | `boolean \| { minRows?, maxRows? }` | `false` |  ✓  |   ✓   | 自适应高度  |
| placeholder | `string`                            | -       |  ✓  |   ✓   | 占位符      |
| disabled    | `boolean`                           | `false` |  ✓  |   ✓   | 禁用        |

---

## Select 选择器

### Props

| Prop        | Type                                                  | Default | Vue | React | Description |
| ----------- | ----------------------------------------------------- | ------- | :-: | :---: | ----------- |
| modelValue  | `any`                                                 | -       |  ✓  |   -   | 绑定值      |
| value       | `any`                                                 | -       |  -  |   ✓   | 绑定值      |
| options     | `{ label: string, value: any, disabled?: boolean }[]` | `[]`    |  ✓  |   ✓   | 选项        |
| multiple    | `boolean`                                             | `false` |  ✓  |   ✓   | 多选        |
| clearable   | `boolean`                                             | `false` |  ✓  |   ✓   | 可清除      |
| filterable  | `boolean`                                             | `false` |  ✓  |   ✓   | 可搜索      |
| placeholder | `string`                                              | -       |  ✓  |   ✓   | 占位符      |
| disabled    | `boolean`                                             | `false` |  ✓  |   ✓   | 禁用        |

### Events

| Vue Event            | React Callback | Payload | Description |
| -------------------- | -------------- | ------- | ----------- |
| `@update:modelValue` | `onChange`     | `any`   | 值变更      |
| `@change`            | `onChange`     | `any`   | 值变更      |

---

## Checkbox 复选框

### Props

| Prop          | Type      | Default | Vue | React | Description |
| ------------- | --------- | ------- | :-: | :---: | ----------- |
| modelValue    | `boolean` | `false` |  ✓  |   -   | 绑定值      |
| checked       | `boolean` | `false` |  -  |   ✓   | 选中状态    |
| disabled      | `boolean` | `false` |  ✓  |   ✓   | 禁用        |
| indeterminate | `boolean` | `false` |  ✓  |   ✓   | 半选状态    |

### Events

| Vue Event            | React Callback | Payload   | Description |
| -------------------- | -------------- | --------- | ----------- |
| `@update:modelValue` | `onChange`     | `boolean` | 状态变更    |

---

## CheckboxGroup 复选框组

### Props

| Prop       | Type                                                  | Default        | Vue | React | Description |
| ---------- | ----------------------------------------------------- | -------------- | :-: | :---: | ----------- |
| modelValue | `any[]`                                               | `[]`           |  ✓  |   -   | 绑定值      |
| value      | `any[]`                                               | `[]`           |  -  |   ✓   | 选中值数组  |
| options    | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           |  ✓  |   ✓   | 选项        |
| direction  | `'horizontal' \| 'vertical'`                          | `'horizontal'` |  ✓  |   ✓   | 排列方向    |

---

## RadioGroup 单选框组

### Props

| Prop       | Type                                                  | Default        | Vue | React | Description |
| ---------- | ----------------------------------------------------- | -------------- | :-: | :---: | ----------- |
| modelValue | `any`                                                 | -              |  ✓  |   -   | 绑定值      |
| value      | `any`                                                 | -              |  -  |   ✓   | 当前值      |
| options    | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           |  ✓  |   ✓   | 选项        |
| direction  | `'horizontal' \| 'vertical'`                          | `'horizontal'` |  ✓  |   ✓   | 排列方向    |
| button     | `boolean`                                             | `false`        |  ✓  |   ✓   | 按钮样式    |

---

## Switch 开关

### Props

| Prop       | Type                   | Default | Vue | React | Description |
| ---------- | ---------------------- | ------- | :-: | :---: | ----------- |
| modelValue | `boolean`              | `false` |  ✓  |   -   | 绑定值      |
| checked    | `boolean`              | `false` |  -  |   ✓   | 开关状态    |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`  |  ✓  |   ✓   | 尺寸        |
| disabled   | `boolean`              | `false` |  ✓  |   ✓   | 禁用        |

---

## Slider 滑块

### Props

| Prop        | Type                         | Default | Vue | React | Description |
| ----------- | ---------------------------- | ------- | :-: | :---: | ----------- |
| modelValue  | `number \| [number, number]` | `0`     |  ✓  |   -   | 绑定值      |
| value       | `number \| [number, number]` | `0`     |  -  |   ✓   | 值          |
| min         | `number`                     | `0`     |  ✓  |   ✓   | 最小值      |
| max         | `number`                     | `100`   |  ✓  |   ✓   | 最大值      |
| step        | `number`                     | `1`     |  ✓  |   ✓   | 步长        |
| range       | `boolean`                    | `false` |  ✓  |   ✓   | 范围选择    |
| disabled    | `boolean`                    | `false` |  ✓  |   ✓   | 禁用        |
| showTooltip | `boolean`                    | `false` |  ✓  |   ✓   | 显示提示    |

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

> **See also**: [Vue examples](../vue/form.md) �� [React examples](../react/form.md)

---

> **See also**: [Vue examples](../vue/form.md) �� [React examples](../react/form.md)
