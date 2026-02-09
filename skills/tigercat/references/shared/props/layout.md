---
name: tigercat-shared-props-layout
description: Shared props definitions for layout components - Card, Container, Descriptions, Divider, Grid, Layout, List, Skeleton, Space
---

# Layout Components - Props Reference

共享 Props 定义。

---

## Card 卡片

### Props

| Prop      | Type                                                | Default              | Vue | React | Description        |
| --------- | --------------------------------------------------- | -------------------- | :-: | :---: | ------------------ |
| variant   | `'default' \| 'bordered' \| 'shadow' \| 'elevated'` | `'default'`          |  ✓  |   ✓   | 卡片样式变体       |
| size      | `'sm' \| 'md' \| 'lg'`                              | `'md'`               |  ✓  |   ✓   | 尺寸（影响内边距） |
| hoverable | `boolean`                                           | `false`              |  ✓  |   ✓   | 显示悬停交互效果   |
| cover     | `string`                                            | -                    |  ✓  |   ✓   | 封面图片 URL       |
| coverAlt  | `string`                                            | `'Card cover image'` |  ✓  |   ✓   | 封面图片 alt 文本  |
| className | `string`                                            | -                    |  ✓  |   ✓   | 自定义 CSS 类名    |

### Slots / Children

| Vue Slot  | React Prop | Description        |
| --------- | ---------- | ------------------ |
| `default` | `children` | 主体内容           |
| `header`  | `header`   | 头部区域           |
| `footer`  | `footer`   | 底部区域           |
| `actions` | `actions`  | 操作区域（右对齐） |

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

| Prop        | Type                                             | Default        | Vue | React | Description                |
| ----------- | ------------------------------------------------ | -------------- | :-: | :---: | -------------------------- |
| orientation | `'horizontal' \| 'vertical'`                     | `'horizontal'` |  ✓  |   ✓   | 方向                       |
| lineStyle   | `'solid' \| 'dashed' \| 'dotted'`                | `'solid'`      |  ✓  |   ✓   | 线条样式                   |
| spacing     | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         |  ✓  |   ✓   | 周围间距                   |
| color       | `string`                                         | -              |  ✓  |   ✓   | 自定义颜色（CSS 值或变量） |
| thickness   | `string`                                         | -              |  ✓  |   ✓   | 自定义线条粗细             |

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

| Prop       | Type                                                  | Default        | Vue  | React | Description    |
| ---------- | ----------------------------------------------------- | -------------- | :--: | :---: | -------------- |
| dataSource | `ListItem[]`                                          | `[]`           |  ✓   |   ✓   | 数据源         |
| size       | `'sm' \| 'md' \| 'lg'`                                | `'md'`         |  ✓   |   ✓   | 列表尺寸       |
| bordered   | `'none' \| 'divided' \| 'bordered'`                   | `'divided'`    |  ✓   |   ✓   | 边框样式       |
| split      | `boolean`                                             | `true`         |  ✓   |   ✓   | 是否显示分割线 |
| itemLayout | `'horizontal' \| 'vertical'`                          | `'horizontal'` |  ✓   |   ✓   | 列表项布局     |
| loading    | `boolean`                                             | `false`        |  ✓   |   ✓   | 加载状态       |
| emptyText  | `string`                                              | `'No data'`    |  ✓   |   ✓   | 空状态文案     |
| hoverable  | `boolean`                                             | `false`        |  ✓   |   ✓   | 鼠标悬停效果   |
| rowKey     | `string \| ((item, index) => string \| number)`       | `'key'`        |  ✓   |   ✓   | 行键           |
| pagination | `ListPaginationConfig \| false`                       | `false`        |  ✓   |   ✓   | 分页配置       |
| grid       | `{ gutter?, column?, xs?, sm?, md?, lg?, xl?, xxl? }` | -              |  ✓   |   ✓   | 网格布局       |
| header     | -                                                     | -              | slot | prop  | 头部内容       |
| footer     | -                                                     | -              | slot | prop  | 底部内容       |

### Slots / Children

| Vue Slot                        | React Prop                                | Description      |
| ------------------------------- | ----------------------------------------- | ---------------- |
| `#renderItem="{ item, index }"` | `renderItem={(item, index) => ReactNode}` | 自定义列表项渲染 |
| `#header`                       | `header={ReactNode}`                      | 头部内容         |
| `#footer`                       | `footer={ReactNode}`                      | 底部内容         |

### Events

| Vue Event     | React Prop     | Payload                                 | Description |
| ------------- | -------------- | --------------------------------------- | ----------- |
| `item-click`  | `onItemClick`  | `(item: ListItem, index: number)`       | 点击列表项  |
| `page-change` | `onPageChange` | `{ current: number, pageSize: number }` | 分页变化    |

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

| Prop      | Type                                                    | Default    | Vue | React | Description                         |
| --------- | ------------------------------------------------------- | ---------- | :-: | :---: | ----------------------------------- |
| variant   | `'text' \| 'avatar' \| 'image' \| 'button' \| 'custom'` | `'text'`   |  ✓  |   ✓   | 骨架屏变体                          |
| animation | `'pulse' \| 'wave' \| 'none'`                           | `'pulse'`  |  ✓  |   ✓   | 动画类型                            |
| width     | `string`                                                | -          |  ✓  |   ✓   | 宽度（CSS 值）                      |
| height    | `string`                                                | -          |  ✓  |   ✓   | 高度（CSS 值）                      |
| shape     | `'circle' \| 'square'`                                  | `'circle'` |  ✓  |   ✓   | 形状（avatar 变体）                 |
| rows      | `number`                                                | `1`        |  ✓  |   ✓   | 行数（text 变体，>1 时渲染多行）    |
| paragraph | `boolean`                                               | `false`    |  ✓  |   ✓   | 段落模式（text 变体，行宽自动变化） |
| className | `string`                                                | -          |  ✓  |   ✓   | 自定义类名                          |

---

> **See also**: [Vue examples](../vue/layout.md) · [React examples](../react/layout.md)
