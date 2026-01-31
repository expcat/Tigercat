---
name: tigercat-shared-props-data
description: Shared props definitions for data display components - Table, Timeline
---

# Data Display Components - Props Reference

共享 Props 定义。

---

## Table 表格

### Props

| Prop         | Type                          | Default     | Vue | React | Description |
| ------------ | ----------------------------- | ----------- | :-: | :---: | ----------- |
| columns      | `TableColumn[]`               | `[]`        |  ✓  |   ✓   | 列配置      |
| data         | `any[]`                       | `[]`        |  ✓  |   ✓   | 数据源      |
| rowKey       | `string \| ((row) => string)` | -           |  ✓  |   ✓   | 行唯一键    |
| loading      | `boolean`                     | `false`     |  ✓  |   ✓   | 加载状态    |
| selectable   | `boolean`                     | `false`     |  ✓  |   ✓   | 可选择      |
| selectedRows | `any[]`                       | `[]`        |  ✓  |   ✓   | 选中行      |
| expandable   | `boolean`                     | `false`     |  ✓  |   ✓   | 可展开      |
| bordered     | `boolean`                     | `false`     |  ✓  |   ✓   | 显示边框    |
| stripe       | `boolean`                     | `false`     |  ✓  |   ✓   | 斑马纹      |
| emptyText    | `string`                      | `'No Data'` |  ✓  |   ✓   | 空数据文案  |

> **Vue**: 使用 `v-model:selected-rows` 绑定选中行
> **React**: 使用 `selectedRows` + `onSelectionChange` 控制

### TableColumn

| Prop     | Type                                 | Vue | React | Description |
| -------- | ------------------------------------ | :-: | :---: | ----------- |
| key      | `string`                             |  ✓  |   ✓   | 字段名      |
| title    | `string`                             |  ✓  |   ✓   | 列标题      |
| width    | `number \| string`                   |  ✓  |   ✓   | 列宽        |
| align    | `'left' \| 'center' \| 'right'`      |  ✓  |   ✓   | 对齐方式    |
| sortable | `boolean`                            |  ✓  |   ✓   | 可排序      |
| filters  | `{ label: string, value: any }[]`    |  ✓  |   ✓   | 筛选项      |
| onFilter | `(value, row) => boolean`            |  ✓  |   ✓   | 筛选函数    |
| render   | `(row, index) => VNode \| ReactNode` |  ✓  |   ✓   | 自定义渲染  |
| fixed    | `'left' \| 'right'`                  |  ✓  |   ✓   | 固定列      |

### Events

| Vue Event               | React Callback      | Payload          | Description |
| ----------------------- | ------------------- | ---------------- | ----------- |
| `@row-click`            | `onRowClick`        | `(row, index)`   | 行点击      |
| `@sort-change`          | `onSortChange`      | `{ key, order }` | 排序变更    |
| `@filter-change`        | `onFilterChange`    | `{ key, value }` | 筛选变更    |
| `@update:selected-rows` | `onSelectionChange` | `rows[]`         | 选中变更    |

### Slots / Children

| Vue Slot                            | React Prop          | Description |
| ----------------------------------- | ------------------- | ----------- |
| `expand` (scoped: `{ row, index }`) | `expandedRowRender` | 展开行内容  |

---

## Timeline 时间线

### Props

| Prop    | Type                               | Default  | Vue | React | Description      |
| ------- | ---------------------------------- | -------- | :-: | :---: | ---------------- |
| items   | `TimelineItem[]`                   | `[]`     |  ✓  |   ✓   | 时间线数据       |
| mode    | `'left' \| 'right' \| 'alternate'` | `'left'` |  ✓  |   ✓   | 布局模式         |
| pending | `boolean \| string`                | `false`  |  ✓  |   ✓   | 最后一项为进行中 |

### TimelineItem

| Prop    | Type                                             | Default  | Description |
| ------- | ------------------------------------------------ | -------- | ----------- |
| content | `string`                                         | -        | 内容        |
| time    | `string`                                         | -        | 时间        |
| color   | `'blue' \| 'green' \| 'red' \| 'gray' \| string` | `'blue'` | 节点颜色    |

### Slots / Children

| Vue Slot                  | React Prop | Description |
| ------------------------- | ---------- | ----------- |
| `default` (Timeline.Item) | `children` | 时间线项    |
| `dot` (Timeline.Item)     | `dot`      | 自定义节点  |

---

## Collapse 折叠面板

### Collapse Props

| Prop               | Type                                   | Default   | Vue | React | Description            |
| ------------------ | -------------------------------------- | --------- | :-: | :---: | ---------------------- |
| activeKey          | `string \| number \| (string\|number)[]` | -         |  ✓  |   ✓   | 当前激活的面板 key     |
| defaultActiveKey   | `string \| number \| (string\|number)[]` | -         |  ✓  |   ✓   | 默认激活的面板 key     |
| accordion          | `boolean`                              | `false`   |  ✓  |   ✓   | 手风琴模式（只能展开一个） |
| bordered           | `boolean`                              | `true`    |  ✓  |   ✓   | 是否有边框             |
| expandIconPosition | `'start' \| 'end'`                     | `'start'` |  ✓  |   ✓   | 展开图标位置           |
| ghost              | `boolean`                              | `false`   |  ✓  |   ✓   | 透明无边框样式         |

> **Vue**: 使用 `v-model:active-key` 或 `@change` 监听变化
> **React**: 使用 `activeKey` + `onChange` 控制

### CollapsePanel Props

| Prop      | Type              | Default | Vue | React | Description        |
| --------- | ----------------- | ------- | :-: | :---: | ------------------ |
| panelKey  | `string \| number` | -       |  ✓  |   ✓   | 唯一标识（必需）   |
| header    | `string \| slot`  | -       |  ✓  |   ✓   | 面板标题           |
| disabled  | `boolean`         | `false` |  ✓  |   ✓   | 禁用状态           |
| showArrow | `boolean`         | `true`  |  ✓  |   ✓   | 是否显示箭头       |

### Events

| Vue Event             | React Callback | Payload                                             | Description  |
| --------------------- | -------------- | --------------------------------------------------- | ------------ |
| `@change`             | `onChange`     | `string \| number \| (string\|number)[] \| undefined` | 切换面板时触发 |
| `@update:active-key`  | -              | `string \| number \| (string\|number)[] \| undefined` | v-model 更新  |

> **Accordion 模式说明**：当启用手风琴模式且所有面板都收起时，这两个事件会发出 `undefined` 作为 payload。

### Slots / Children

| Vue Slot   | React Prop | Description      |
| ---------- | ---------- | ---------------- |
| `default`  | `children` | CollapsePanel 组件 |
| `header`   | `header`   | 自定义标题内容   |
| `extra`    | `extra`    | 右侧额外内容     |

---

## Carousel 轮播图

### Props

| Prop          | Type                                        | Default    | Vue | React | Description              |
| ------------- | ------------------------------------------- | ---------- | :-: | :---: | ------------------------ |
| autoplay      | `boolean`                                   | `false`    |  ✓  |   ✓   | 是否自动播放             |
| autoplaySpeed | `number`                                    | `3000`     |  ✓  |   ✓   | 自动播放间隔（ms）       |
| dots          | `boolean`                                   | `true`     |  ✓  |   ✓   | 是否显示指示点           |
| dotPosition   | `'top' \| 'bottom' \| 'left' \| 'right'`    | `'bottom'` |  ✓  |   ✓   | 指示点位置               |
| effect        | `'scroll' \| 'fade'`                        | `'scroll'` |  ✓  |   ✓   | 切换效果                 |
| arrows        | `boolean`                                   | `false`    |  ✓  |   ✓   | 是否显示切换箭头         |
| infinite      | `boolean`                                   | `true`     |  ✓  |   ✓   | 是否无限循环             |
| speed         | `number`                                    | `500`      |  ✓  |   ✓   | 切换动画速度（ms）       |
| initialSlide  | `number`                                    | `0`        |  ✓  |   ✓   | 初始幻灯片索引           |
| pauseOnHover  | `boolean`                                   | `true`     |  ✓  |   ✓   | 鼠标悬停时暂停           |
| pauseOnFocus  | `boolean`                                   | `true`     |  ✓  |   ✓   | 聚焦时暂停               |

### Events

| Vue Event        | React Callback   | Payload                 | Description  |
| ---------------- | ---------------- | ----------------------- | ------------ |
| `@change`        | `onChange`       | `(current, prev)`       | 切换时触发   |
| `@before-change` | `onBeforeChange` | `(current, next)`       | 切换前触发   |

### Methods (Imperative API)

| Method   | Arguments         | Description        |
| -------- | ----------------- | ------------------ |
| `next()` | -                 | 下一张             |
| `prev()` | -                 | 上一张             |
| `goTo()` | `index: number`   | 跳转到指定张       |

> **Vue**: 使用 `ref` 获取组件实例调用方法
> **React**: 使用 `useRef<CarouselRef>` 获取 ref 调用方法

### Slots / Children

| Vue Slot  | React Prop | Description    |
| --------- | ---------- | -------------- |
| `default` | `children` | 轮播内容       |

---

> **See also**: [Vue examples](../vue/data.md) · [React examples](../react/data.md)
