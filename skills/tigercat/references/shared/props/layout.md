---
name: tigercat-shared-props-layout
description: Shared props definitions for layout components - Card, Container, Descriptions, Divider, Grid, Layout, List, Skeleton, Space
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

## Divider 分割线

### Props

| Prop        | Type                                        | Default          | Vue | React | Description                            |
| ----------- | ------------------------------------------- | ---------------- | :-: | :---: | -------------------------------------- |
| orientation | `'horizontal' \| 'vertical'`                | `'horizontal'`   |  ✓  |   ✓   | 方向                                   |
| lineStyle   | `'solid' \| 'dashed' \| 'dotted'`           | `'solid'`        |  ✓  |   ✓   | 线条样式                               |
| spacing     | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     |  ✓  |   ✓   | 周围间距                               |
| color       | `string`                                    | -                |  ✓  |   ✓   | 自定义颜色（CSS 值或变量）             |
| thickness   | `string`                                    | -                |  ✓  |   ✓   | 自定义线条粗细                         |

无 Slots / Children。渲染为 `<div role="separator">`。

---

## Grid 栅格（Row + Col）

采用 24 分栏的 Row + Col 模式。

### Row Props

| Prop    | Type                                                                                  | Default   | Vue | React | Description                     |
| ------- | ------------------------------------------------------------------------------------- | --------- | :-: | :---: | ------------------------------- |
| gutter  | `number \| [number, number]`                                                          | `0`       |  ✓  |   ✓   | 栅格间隔（水平或 [水平, 垂直]） |
| align   | `'top' \| 'middle' \| 'bottom' \| 'stretch'`                                          | `'top'`   |  ✓  |   ✓   | 垂直对齐方式                    |
| justify | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` |  ✓  |   ✓   | 水平排列方式                    |
| wrap    | `boolean`                                                                             | `true`    |  ✓  |   ✓   | 是否自动换行                    |

### Col Props

| Prop   | Type                                            | Default | Vue | React | Description                     |
| ------ | ----------------------------------------------- | ------- | :-: | :---: | ------------------------------- |
| span   | `number \| Partial<Record<Breakpoint, number>>` | `24`    |  ✓  |   ✓   | 栅格占位数（1-24 或响应式对象） |
| offset | `number \| Partial<Record<Breakpoint, number>>` | `0`     |  ✓  |   ✓   | 栅格左侧偏移数                  |
| order  | `number \| Partial<Record<Breakpoint, number>>` | -       |  ✓  |   ✓   | 栅格排列顺序                    |
| flex   | `string \| number`                              | -       |  ✓  |   ✓   | flex 布局填充                   |

---

## Layout 布局

### Layout Props

| Prop      | Type     | Default | Vue | React | Description      |
| --------- | -------- | ------- | :-: | :---: | ---------------- |
| className | `string` | -       |  ✓  |   ✓   | 自定义 CSS class |

### Header Props

| Prop      | Type     | Default  | Vue | React | Description      |
| --------- | -------- | -------- | :-: | :---: | ---------------- |
| className | `string` | -        |  ✓  |   ✓   | 自定义 CSS class |
| height    | `string` | `'64px'` |  ✓  |   ✓   | 头部高度         |

### Sidebar Props

| Prop      | Type      | Default   | Vue | React | Description      |
| --------- | --------- | --------- | :-: | :---: | ---------------- |
| className | `string`  | -         |  ✓  |   ✓   | 自定义 CSS class |
| width     | `string`  | `'256px'` |  ✓  |   ✓   | 侧边栏宽度       |
| collapsed | `boolean` | `false`   |  ✓  |   ✓   | 是否折叠         |

### Content Props

| Prop      | Type     | Default | Vue | React | Description      |
| --------- | -------- | ------- | :-: | :---: | ---------------- |
| className | `string` | -       |  ✓  |   ✓   | 自定义 CSS class |

### Footer Props

| Prop      | Type     | Default  | Vue | React | Description      |
| --------- | -------- | -------- | :-: | :---: | ---------------- |
| className | `string` | -        |  ✓  |   ✓   | 自定义 CSS class |
| height    | `string` | `'auto'` |  ✓  |   ✓   | 底部高度         |

---

## Space 间距

### Props

| Prop      | Type                                                      | Default        | Vue | React | Description |
| --------- | --------------------------------------------------------- | -------------- | :-: | :---: | ----------- |
| direction | `'horizontal' \| 'vertical'`                              | `'horizontal'` |  ✓  |   ✓   | 方向        |
| size      | `'sm' \| 'md' \| 'lg' \| number`                          | `'md'`         |  ✓  |   ✓   | 间距大小    |
| wrap      | `boolean`                                                 | `false`        |  ✓  |   ✓   | 自动换行    |
| align     | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | `'start'`      |  ✓  |   ✓   | 对齐方式    |

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
