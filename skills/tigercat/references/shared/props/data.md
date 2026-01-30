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
