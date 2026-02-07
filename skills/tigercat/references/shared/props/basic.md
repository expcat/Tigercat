---
name: tigercat-shared-props-basic
description: Shared props definitions for basic components - Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text
---

# Basic Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

---

## Button 按钮

### Props

| Prop        | Type                                                         | Default     | Vue | React | Description    |
| ----------- | ------------------------------------------------------------ | ----------- | :-: | :---: | -------------- |
| variant     | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` |  ✓  |   ✓   | 按钮样式       |
| size        | `'sm' \| 'md' \| 'lg'`                                       | `'md'`      |  ✓  |   ✓   | 按钮尺寸       |
| disabled    | `boolean`                                                    | `false`     |  ✓  |   ✓   | 禁用状态       |
| loading     | `boolean`                                                    | `false`     |  ✓  |   ✓   | 加载状态       |
| block       | `boolean`                                                    | `false`     |  ✓  |   ✓   | 块级按钮       |
| type        | `'button' \| 'submit' \| 'reset'`                            | `'button'`  |  ✓  |   ✓   | 原生类型       |
| loadingIcon | `ReactNode`                                                  | -           |  -  |   ✓   | 自定义加载图标 |
| className   | `string`                                                     | -           |  -  |   ✓   | 自定义类名     |

### Events

| Vue Event | React Callback | Payload      | Description |
| --------- | -------------- | ------------ | ----------- |
| `@click`  | `onClick`      | `MouseEvent` | 点击事件    |

### Slots / Children

| Vue Slot       | React Prop    | Description    |
| -------------- | ------------- | -------------- |
| `default`      | `children`    | 按钮内容       |
| `loading-icon` | `loadingIcon` | 自定义加载图标 |

---

## Alert 警告提示

### Props

| Prop        | Type                                          | Default  | Vue | React | Description |
| ----------- | --------------------------------------------- | -------- | :-: | :---: | ----------- |
| type        | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` |  ✓  |   ✓   | 类型        |
| title       | `string`                                      | -        |  ✓  |   ✓   | 标题        |
| description | `string`                                      | -        |  ✓  |   ✓   | 描述内容    |
| closable    | `boolean`                                     | `false`  |  ✓  |   ✓   | 可关闭      |

### Events

| Vue Event | React Callback | Payload | Description |
| --------- | -------------- | ------- | ----------- |
| `@close`  | `onClose`      | -       | 关闭事件    |

---

## Avatar 头像

### Props

| Prop  | Type                             | Default    | Vue | React | Description          |
| ----- | -------------------------------- | ---------- | :-: | :---: | -------------------- |
| src   | `string`                         | -          |  ✓  |   ✓   | 图片地址             |
| size  | `'sm' \| 'md' \| 'lg' \| number` | `'md'`     |  ✓  |   ✓   | 尺寸                 |
| shape | `'circle' \| 'square'`           | `'circle'` |  ✓  |   ✓   | 形状                 |
| text  | `string`                         | -          |  ✓  |   ✓   | 文字（无图片时显示） |

---

## Badge 徽标

### Props

| Prop  | Type               | Default | Vue | React | Description               |
| ----- | ------------------ | ------- | :-: | :---: | ------------------------- |
| value | `number \| string` | -       |  ✓  |   ✓   | 显示值                    |
| max   | `number`           | `99`    |  ✓  |   ✓   | 最大值，超过显示 `{max}+` |
| dot   | `boolean`          | `false` |  ✓  |   ✓   | 小红点模式                |

### Slots / Children

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `default` | `children` | 徽标包裹的内容 |

---

## Tag 标签

### Props

| Prop     | Type           | Default | Vue | React | Description |
| -------- | -------------- | ------- | :-: | :---: | ----------- |
| color    | `string`       | -       |  ✓  |   ✓   | 颜色        |
| size     | `'sm' \| 'md'` | `'md'`  |  ✓  |   ✓   | 尺寸        |
| closable | `boolean`      | `false` |  ✓  |   ✓   | 可关闭      |

### Events

| Vue Event | React Callback | Payload | Description |
| --------- | -------------- | ------- | ----------- |
| `@close`  | `onClose`      | -       | 关闭事件    |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 标签内容    |

---

## Icon 图标

### Props

| Prop      | Type                           | Default        | Vue | React | Description                         |
| --------- | ------------------------------ | -------------- | :-: | :---: | ----------------------------------- |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         |  ✓  |   ✓   | 尺寸                                |
| color     | `string`                       | `currentColor` |  ✓  |   ✓   | 颜色（CSS color 值）                |
| className | `string`                       | -              |  ✗  |   ✓   | 自定义类名（Vue 使用 `class` attr） |

### Slots / Children

| Vue Slot  | React Prop | Description       |
| --------- | ---------- | ----------------- |
| `default` | `children` | 传入 SVG 图标内容 |

### Accessibility

- 无 `aria-label` / `aria-labelledby` / `role` 时自动设置 `aria-hidden="true"`（装饰性图标）
- 提供 `aria-label` 或 `aria-labelledby` 时自动添加 `role="img"`
- 支持自定义 `role` 覆盖默认行为

### SVG 默认属性

传入的 `<svg>` 子元素会自动注入以下默认属性（可被显式值覆盖）：

| 属性            | 默认值                       |
| --------------- | ---------------------------- |
| xmlns           | `http://www.w3.org/2000/svg` |
| viewBox         | `0 0 24 24`                  |
| fill            | `none`                       |
| stroke          | `currentColor`               |
| stroke-width    | `2`                          |
| stroke-linecap  | `round`                      |
| stroke-linejoin | `round`                      |

---

## Text 文本

### Props

| Prop     | Type                                                            | Default    | Vue | React | Description               |
| -------- | --------------------------------------------------------------- | ---------- | :-: | :---: | ------------------------- |
| size     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                          | `'md'`     |  ✓  |   ✓   | 字号                      |
| weight   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                  | `'normal'` |  ✓  |   ✓   | 字重                      |
| color    | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | -          |  ✓  |   ✓   | 颜色                      |
| ellipsis | `boolean`                                                       | `false`    |  ✓  |   ✓   | 文本溢出省略              |
| maxWidth | `number`                                                        | -          |  ✓  |   ✓   | 最大宽度（配合 ellipsis） |

> **Vue 注意**: maxWidth 使用 kebab-case `max-width`

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 文本内容    |

---

## Code 代码

### Props

| Prop     | Type      | Default | Vue | React | Description |
| -------- | --------- | ------- | :-: | :---: | ----------- |
| value    | `string`  | -       |  ✓  |   ✓   | 代码内容    |
| lang     | `string`  | -       |  ✓  |   ✓   | 语言        |
| copyable | `boolean` | `false` |  ✓  |   ✓   | 可复制      |

---

## Link 链接

### Props

| Prop     | Type                     | Default     | Vue | React | Description |
| -------- | ------------------------ | ----------- | :-: | :---: | ----------- |
| href     | `string`                 | -           |  ✓  |   ✓   | 链接地址    |
| variant  | `'default' \| 'primary'` | `'default'` |  ✓  |   ✓   | 样式        |
| disabled | `boolean`                | `false`     |  ✓  |   ✓   | 禁用        |

### Events

| Vue Event | React Callback | Payload      | Description |
| --------- | -------------- | ------------ | ----------- |
| `@click`  | `onClick`      | `MouseEvent` | 点击事件    |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 链接内容    |

---

## Divider 分割线

### Props

| Prop      | Type                            | Default        | Vue | React | Description |
| --------- | ------------------------------- | -------------- | :-: | :---: | ----------- |
| direction | `'horizontal' \| 'vertical'`    | `'horizontal'` |  ✓  |   ✓   | 方向        |
| align     | `'left' \| 'center' \| 'right'` | `'center'`     |  ✓  |   ✓   | 文本对齐    |
| text      | `string`                        | -              |  ✓  |   -   | 分割线文本  |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 分割线文本  |

---

> **See also**: [Vue examples](../vue/basic.md) · [React examples](../react/basic.md)
