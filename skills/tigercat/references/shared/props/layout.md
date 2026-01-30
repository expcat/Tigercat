---
name: tigercat-shared-props-layout
description: Shared props definitions for layout components - Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space
---

# Layout Components - Props Reference

共享 Props 定义。

---

## Card 卡片

### Props

| Prop     | Type                             | Default    | Vue | React | Description  |
| -------- | -------------------------------- | ---------- | :-: | :---: | ------------ |
| title    | `string`                         | -          |  ✓  |   ✓   | 标题         |
| bordered | `boolean`                        | `true`     |  ✓  |   ✓   | 显示边框     |
| shadow   | `'always' \| 'hover' \| 'never'` | `'always'` |  ✓  |   ✓   | 阴影显示方式 |

### Slots / Children

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `default` | `children` | 内容           |
| `header`  | `header`   | 自定义头部     |
| `extra`   | `extra`    | 头部右侧操作区 |

---

## Container 容器

### Props

| Prop    | Type               | Default | Vue | React | Description |
| ------- | ------------------ | ------- | :-: | :---: | ----------- |
| width   | `string \| number` | -       |  ✓  |   ✓   | 最大宽度    |
| padding | `string \| number` | -       |  ✓  |   ✓   | 内边距      |

---

## Grid 栅格

### Props

| Prop | Type                                    | Default | Vue | React | Description |
| ---- | --------------------------------------- | ------- | :-: | :---: | ----------- |
| cols | `number \| { xs?, sm?, md?, lg?, xl? }` | `1`     |  ✓  |   ✓   | 列数        |
| gap  | `string \| number`                      | `0`     |  ✓  |   ✓   | 间距        |

---

## Layout 布局

### Layout Props

| Prop | Type                         | Default      | Vue | React | Description |
| ---- | ---------------------------- | ------------ | :-: | :---: | ----------- |
| mode | `'horizontal' \| 'vertical'` | `'vertical'` |  ✓  |   ✓   | 布局模式    |

### Sider Props

| Prop           | Type               | Default | Vue | React | Description |
| -------------- | ------------------ | ------- | :-: | :---: | ----------- |
| width          | `string \| number` | `200`   |  ✓  |   ✓   | 宽度        |
| collapsed      | `boolean`          | `false` |  ✓  |   ✓   | 折叠状态    |
| collapsedWidth | `number`           | `80`    |  ✓  |   ✓   | 折叠宽度    |

---

## Space 间距

### Props

| Prop      | Type                                         | Default        | Vue | React | Description |
| --------- | -------------------------------------------- | -------------- | :-: | :---: | ----------- |
| direction | `'horizontal' \| 'vertical'`                 | `'horizontal'` |  ✓  |   ✓   | 方向        |
| size      | `'sm' \| 'md' \| 'lg' \| number`             | `'md'`         |  ✓  |   ✓   | 间距大小    |
| wrap      | `boolean`                                    | `false`        |  ✓  |   ✓   | 自动换行    |
| align     | `'start' \| 'center' \| 'end' \| 'baseline'` | -              |  ✓  |   ✓   | 对齐方式    |

---

## List 列表

### Props

| Prop   | Type                           | Default | Vue | React | Description |
| ------ | ------------------------------ | ------- | :-: | :---: | ----------- |
| items  | `any[]`                        | `[]`    |  ✓  |   ✓   | 数据源      |
| rowKey | `string \| ((item) => string)` | -       |  ✓  |   ✓   | 行键        |
| split  | `boolean`                      | `false` |  ✓  |   ✓   | 显示分割线  |

### Slots / Children

| Vue Slot                              | React Prop   | Description |
| ------------------------------------- | ------------ | ----------- |
| `default` (scoped: `{ item, index }`) | `renderItem` | 列表项渲染  |

---

## Descriptions 描述列表

### Props

| Prop       | Type                              | Default        | Vue | React | Description |
| ---------- | --------------------------------- | -------------- | :-: | :---: | ----------- |
| items      | `{ label: string, value: any }[]` | -              |  ✓  |   ✓   | 数据项      |
| columns    | `number`                          | `3`            |  ✓  |   ✓   | 列数        |
| layout     | `'horizontal' \| 'vertical'`      | `'horizontal'` |  ✓  |   ✓   | 布局        |
| labelStyle | `CSSProperties`                   | -              |  ✓  |   ✓   | 标签样式    |

---

## Skeleton 骨架屏

### Props

| Prop     | Type                                        | Default  | Vue | React | Description |
| -------- | ------------------------------------------- | -------- | :-: | :---: | ----------- |
| loading  | `boolean`                                   | `true`   |  ✓  |   ✓   | 加载状态    |
| rows     | `number`                                    | `3`      |  ✓  |   ✓   | 行数        |
| shape    | `'text' \| 'circle' \| 'button' \| 'image'` | `'text'` |  ✓  |   ✓   | 形状        |
| animated | `boolean`                                   | `true`   |  ✓  |   ✓   | 动画效果    |

---

> **See also**: [Vue examples](../vue/layout.md) · [React examples](../react/layout.md)
