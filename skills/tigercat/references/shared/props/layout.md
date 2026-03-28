---
name: tigercat-shared-props-layout
description: Shared props definitions for layout components - Card, Container, Descriptions, Divider, Grid, Layout, List, PrintLayout, Skeleton, Space, Statistic
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
| direction | `'vertical' \| 'horizontal'`                        | `'vertical'`         |  ✓  |   ✓   | 布局方向           |
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

| Prop           | Type      | Default   | Vue | React | Description             |
| -------------- | --------- | --------- | :-: | :---: | ----------------------- |
| className      | `string`  | -         |  ✓  |   ✓   | 自定义 CSS class        |
| width          | `string`  | `'256px'` |  ✓  |   ✓   | 侧边栏宽度              |
| collapsedWidth | `string`  | `'64px'`  |  ✓  |   ✓   | 折叠后宽度（mini 模式） |
| collapsed      | `boolean` | `false`   |  ✓  |   ✓   | 是否折叠                |

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

| Prop         | Type                         | Default        | Vue | React | Description      |
| ------------ | ---------------------------- | -------------- | :-: | :---: | ---------------- |
| title        | `string` / `ReactNode`       | -              |  ✓  |   ✓   | 标题             |
| extra        | `unknown` / `ReactNode`      | -              |  ✓  |   ✓   | 标题右侧额外内容 |
| bordered     | `boolean`                    | `false`        |  ✓  |   ✓   | 显示边框         |
| column       | `number`                     | `3`            |  ✓  |   ✓   | 每行列数         |
| size         | `'sm' \| 'md' \| 'lg'`       | `'md'`         |  ✓  |   ✓   | 尺寸             |
| layout       | `'horizontal' \| 'vertical'` | `'horizontal'` |  ✓  |   ✓   | 布局方向         |
| colon        | `boolean`                    | `true`         |  ✓  |   ✓   | 标签后显示冒号   |
| labelStyle   | `CSSProperties`              | -              |  ✓  |   ✓   | 标签全局样式     |
| contentStyle | `CSSProperties`              | -              |  ✓  |   ✓   | 内容全局样式     |
| items        | `DescriptionsItem[]`         | `[]`           |  ✓  |   ✓   | 数据项           |
| className    | `string`                     | -              |  ✓  |   ✓   | 额外 CSS class   |

### DescriptionsItem

| Prop             | Type      | Default  | Description      |
| ---------------- | --------- | -------- | ---------------- |
| label            | `string`  | required | 标签文本         |
| content          | `unknown` | -        | 内容             |
| span             | `number`  | `1`      | 跨列数           |
| labelClassName   | `string`  | -        | 标签自定义 class |
| contentClassName | `string`  | -        | 内容自定义 class |

### Slots (Vue) / Props (React)

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `title`   | `title`    | 标题内容       |
| `extra`   | `extra`    | 额外操作区域   |
| `default` | `children` | 自定义附加内容 |

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

## PrintLayout 打印布局

打印布局容器，提供 `@media print` 优化样式、页眉页脚、分页符。

### PrintLayout Props

| Prop           | Type                                              | Default      | Vue | React | Description      |
| -------------- | ------------------------------------------------- | ------------ | :-: | :---: | ---------------- |
| pageSize       | `'A4' \| 'A3' \| 'Letter' \| 'Legal' \| 'custom'` | `'A4'`       |  ✓  |   ✓   | 纸张尺寸         |
| orientation    | `'portrait' \| 'landscape'`                       | `'portrait'` |  ✓  |   ✓   | 方向             |
| showHeader     | `boolean`                                         | `false`      |  ✓  |   ✓   | 显示页眉         |
| showFooter     | `boolean`                                         | `false`      |  ✓  |   ✓   | 显示页脚         |
| headerText     | `string`                                          | -            |  ✓  |   ✓   | 页眉文本         |
| footerText     | `string`                                          | -            |  ✓  |   ✓   | 页脚文本         |
| showPageBreaks | `boolean`                                         | `true`       |  ✓  |   ✓   | 显示分页符指示器 |
| className      | `string`                                          | -            |  ✓  |   ✓   | 自定义类名       |

### Slots / Children

| Vue Slot  | React Prop     | Description                   |
| --------- | -------------- | ----------------------------- |
| `default` | `children`     | 打印内容                      |
| `header`  | `headerRender` | 自定义页眉（覆盖 headerText） |
| `footer`  | `footerRender` | 自定义页脚（覆盖 footerText） |

### PrintPageBreak 分页组件

在内容中插入 `<PrintPageBreak />` 表示打印分页点。屏幕上显示虚线指示器，打印时触发 `break-before-page`。

---

## Statistic 统计数值

### Props

| Prop           | Type                  | Default | Vue | React | Description                     |
| -------------- | --------------------- | ------- | :-: | :---: | ------------------------------- |
| title          | `string`              | -       |  ✓  |   ✓   | 标题/标签                       |
| value          | `string \| number`    | -       |  ✓  |   ✓   | 数值或文本                      |
| precision      | `number`              | -       |  ✓  |   ✓   | 数值精度（小数位数）            |
| prefix         | `string`              | -       |  ✓  |   ✓   | 值前缀（如 ¥、$）              |
| suffix         | `string`              | -       |  ✓  |   ✓   | 值后缀（如 %、元）             |
| groupSeparator | `boolean`             | -       |  ✓  |   ✓   | 千分位分隔符（如 1,000）        |
| size           | `'sm' \| 'md' \| 'lg'` | `'md'` |  ✓  |   ✓   | 尺寸                            |
| className      | `string`              | -       |  -  |   ✓   | 自定义类名                      |

### Slots / Children

| Vue Slot  | React Prop | Description      |
| --------- | ---------- | ---------------- |
| `prefix`  | `prefix`   | 自定义前缀内容   |
| `suffix`  | `suffix`   | 自定义后缀内容   |

---

> **See also**: [Vue examples](../vue/layout.md) · [React examples](../react/layout.md)
