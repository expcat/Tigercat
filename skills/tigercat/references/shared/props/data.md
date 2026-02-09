---
name: tigercat-shared-props-data
description: Shared props definitions for data display components - Table, Timeline
---

# Data Display Components - Props Reference

共享 Props 定义。

---

## Table 表格

### Props

| Prop           | Type                                          | Default     | Vue | React | Description             |
| -------------- | --------------------------------------------- | ----------- | :-: | :---: | ----------------------- |
| columns        | `TableColumn[]`                               | required    |  ✓  |   ✓   | 列配置                  |
| dataSource     | `T[]`                                         | `[]`        |  ✓  |   ✓   | 数据源                  |
| rowKey         | `string \| ((record: T) => string \| number)` | `'id'`      |  ✓  |   ✓   | 行唯一键                |
| size           | `'sm' \| 'md' \| 'lg'`                        | `'md'`      |  ✓  |   ✓   | 尺寸                    |
| bordered       | `boolean`                                     | `false`     |  ✓  |   ✓   | 显示边框                |
| striped        | `boolean`                                     | `false`     |  ✓  |   ✓   | 斑马纹                  |
| hoverable      | `boolean`                                     | `true`      |  ✓  |   ✓   | 行悬停高亮              |
| loading        | `boolean`                                     | `false`     |  ✓  |   ✓   | 加载状态                |
| emptyText      | `string`                                      | `'No data'` |  ✓  |   ✓   | 空数据文案              |
| sort           | `SortState`                                   | -           |  ✓  |   ✓   | 受控排序状态            |
| defaultSort    | `SortState`                                   | -           |  ✓  |   ✓   | 非受控默认排序          |
| filters        | `Record<string, unknown>`                     | -           |  ✓  |   ✓   | 受控筛选状态            |
| defaultFilters | `Record<string, unknown>`                     | -           |  ✓  |   ✓   | 非受控默认筛选          |
| pagination     | `PaginationConfig \| false`                   | `{...}`     |  ✓  |   ✓   | 分页配置，false 禁用    |
| rowSelection   | `RowSelectionConfig`                          | -           |  ✓  |   ✓   | 行选择配置              |
| rowClassName   | `string \| ((record, index) => string)`       | -           |  ✓  |   ✓   | 自定义行 class          |
| stickyHeader   | `boolean`                                     | `false`     |  ✓  |   ✓   | 固定表头                |
| maxHeight      | `string \| number`                            | -           |  ✓  |   ✓   | 最大高度（启用滚动）    |
| tableLayout    | `'auto' \| 'fixed'`                           | `'auto'`    |  ✓  |   ✓   | 表格布局算法            |
| columnLockable | `boolean`                                     | `false`     |  ✓  |   ✓   | 显示列锁定按钮          |
| className      | `string`                                      | -           |  ✗  |   ✓   | 额外 CSS class（React） |

### TableColumn

| Prop            | Type                                    | Default  | Vue | React | Description      |
| --------------- | --------------------------------------- | -------- | :-: | :---: | ---------------- |
| key             | `string`                                | required |  ✓  |   ✓   | 唯一字段名       |
| title           | `string`                                | required |  ✓  |   ✓   | 列标题           |
| dataKey         | `string`                                | `key`    |  ✓  |   ✓   | 数据字段名       |
| width           | `number \| string`                      | -        |  ✓  |   ✓   | 列宽             |
| align           | `'left' \| 'center' \| 'right'`         | `'left'` |  ✓  |   ✓   | 对齐方式         |
| sortable        | `boolean`                               | `false`  |  ✓  |   ✓   | 可排序           |
| sortFn          | `(a: unknown, b: unknown) => number`    | -        |  ✓  |   ✓   | 自定义排序函数   |
| filter          | `ColumnFilter`                          | -        |  ✓  |   ✓   | 筛选配置         |
| fixed           | `'left' \| 'right' \| false`            | `false`  |  ✓  |   ✓   | 固定列           |
| render          | `(record: T, index: number) => unknown` | -        |  ✓  |   ✓   | 自定义单元格渲染 |
| renderHeader    | `() => unknown`                         | -        |  ✓  |   ✓   | 自定义表头渲染   |
| className       | `string`                                | -        |  ✓  |   ✓   | 单元格 CSS class |
| headerClassName | `string`                                | -        |  ✓  |   ✓   | 表头 CSS class   |

### ColumnFilter

| Prop        | Type                                             | Default  | Description    |
| ----------- | ------------------------------------------------ | -------- | -------------- |
| type        | `'text' \| 'select' \| 'custom'`                 | `'text'` | 筛选类型       |
| options     | `{ label: string, value: string \| number }[]`   | -        | 选项（select） |
| placeholder | `string`                                         | -        | 占位文字       |
| filterFn    | `(value: unknown, filterValue: unknown) => bool` | -        | 自定义筛选函数 |

### RowSelectionConfig

| Prop                   | Type                                    | Default      | Description          |
| ---------------------- | --------------------------------------- | ------------ | -------------------- |
| selectedRowKeys        | `(string \| number)[]`                  | -            | 受控选中行键值       |
| defaultSelectedRowKeys | `(string \| number)[]`                  | -            | 非受控默认选中行键值 |
| type                   | `'checkbox' \| 'radio'`                 | `'checkbox'` | 选择类型             |
| showCheckbox           | `boolean`                               | `true`       | 显示选择框           |
| getRowKey              | `(record: T) => string \| number`       | -            | 获取行键值函数       |
| getCheckboxProps       | `(record: T) => { disabled?: boolean }` | -            | 控制行禁用状态       |

### Events

| Vue Event           | React Callback      | Payload                                 | Description  |
| ------------------- | ------------------- | --------------------------------------- | ------------ |
| `@change`           | `onChange`          | `{ sort, filters, pagination }`         | 综合状态变更 |
| `@row-click`        | `onRowClick`        | `(record, index)`                       | 行点击       |
| `@sort-change`      | `onSortChange`      | `SortState`                             | 排序变更     |
| `@filter-change`    | `onFilterChange`    | `Record<string, unknown>`               | 筛选变更     |
| `@selection-change` | `onSelectionChange` | `(string \| number)[]`                  | 选中行变更   |
| `@page-change`      | `onPageChange`      | `{ current: number, pageSize: number }` | 分页变更     |

### Slots (Vue only)

| Vue Slot       | Description      |
| -------------- | ---------------- |
| `header-{key}` | 自定义列头内容   |
| `cell-{key}`   | 自定义单元格内容 |

---

## Timeline 时间线

### Props

| Prop       | Type                               | Default  | Vue | React | Description        |
| ---------- | ---------------------------------- | -------- | :-: | :---: | ------------------ |
| items      | `TimelineItem[]`                   | `[]`     |  ✓  |   ✓   | 时间线数据         |
| mode       | `'left' \| 'right' \| 'alternate'` | `'left'` |  ✓  |   ✓   | 布局模式           |
| pending    | `boolean`                          | `false`  |  ✓  |   ✓   | 是否显示等待中状态 |
| pendingDot | `VNode / ReactNode`                | -        |  ✓  |   ✓   | 自定义等待节点内容 |
| reverse    | `boolean`                          | `false`  |  ✓  |   ✓   | 是否反转时间线顺序 |
| className  | `string`                           | -        |  ✓  |   ✓   | 额外 CSS 类名      |

> **React 专有 Props**: `pendingContent`（自定义等待内容）、`renderItem`（自定义项渲染）、`renderDot`（自定义节点渲染）

### TimelineItem

| Prop     | Type                | Default | Description            |
| -------- | ------------------- | ------- | ---------------------- |
| key      | `string \| number`  | -       | 唯一标识               |
| label    | `string`            | -       | 标签/时间戳            |
| content  | `string`            | -       | 内容描述               |
| color    | `string`            | -       | 节点颜色（CSS 颜色值） |
| dot      | `unknown`           | -       | 自定义节点内容         |
| position | `'left' \| 'right'` | -       | 交替模式下指定位置     |

### Slots / Render Props

| Vue Slot   | React Prop       | Description        |
| ---------- | ---------------- | ------------------ |
| `#item`    | `renderItem`     | 自定义时间线项内容 |
| `#dot`     | `renderDot`      | 自定义节点渲染     |
| `#pending` | `pendingContent` | 自定义等待中内容   |

---

## Collapse 折叠面板

### Collapse Props

| Prop               | Type                                     | Default   | Vue | React | Description                |
| ------------------ | ---------------------------------------- | --------- | :-: | :---: | -------------------------- |
| activeKey          | `string \| number \| (string\|number)[]` | -         |  ✓  |   ✓   | 当前激活的面板 key         |
| defaultActiveKey   | `string \| number \| (string\|number)[]` | -         |  ✓  |   ✓   | 默认激活的面板 key         |
| accordion          | `boolean`                                | `false`   |  ✓  |   ✓   | 手风琴模式（只能展开一个） |
| bordered           | `boolean`                                | `true`    |  ✓  |   ✓   | 是否有边框                 |
| expandIconPosition | `'start' \| 'end'`                       | `'start'` |  ✓  |   ✓   | 展开图标位置               |
| ghost              | `boolean`                                | `false`   |  ✓  |   ✓   | 透明无边框样式             |

> **Vue**: 使用 `v-model:active-key` 或 `@change` 监听变化
> **React**: 使用 `activeKey` + `onChange` 控制

### CollapsePanel Props

| Prop      | Type               | Default | Vue | React | Description      |
| --------- | ------------------ | ------- | :-: | :---: | ---------------- |
| panelKey  | `string \| number` | -       |  ✓  |   ✓   | 唯一标识（必需） |
| header    | `string \| slot`   | -       |  ✓  |   ✓   | 面板标题         |
| disabled  | `boolean`          | `false` |  ✓  |   ✓   | 禁用状态         |
| showArrow | `boolean`          | `true`  |  ✓  |   ✓   | 是否显示箭头     |

### Events

| Vue Event            | React Callback | Payload                                               | Description    |
| -------------------- | -------------- | ----------------------------------------------------- | -------------- |
| `@change`            | `onChange`     | `string \| number \| (string\|number)[] \| undefined` | 切换面板时触发 |
| `@update:active-key` | -              | `string \| number \| (string\|number)[] \| undefined` | v-model 更新   |

> **Accordion 模式说明**：当启用手风琴模式且所有面板都收起时，这两个事件会发出 `undefined` 作为 payload。

### Slots / Children

| Vue Slot  | React Prop | Description        |
| --------- | ---------- | ------------------ |
| `default` | `children` | CollapsePanel 组件 |
| `header`  | `header`   | 自定义标题内容     |
| `extra`   | `extra`    | 右侧额外内容       |

---

## Carousel 轮播图

### Props

| Prop          | Type                                     | Default    | Vue | React | Description        |
| ------------- | ---------------------------------------- | ---------- | :-: | :---: | ------------------ |
| autoplay      | `boolean`                                | `false`    |  ✓  |   ✓   | 是否自动播放       |
| autoplaySpeed | `number`                                 | `3000`     |  ✓  |   ✓   | 自动播放间隔（ms） |
| dots          | `boolean`                                | `true`     |  ✓  |   ✓   | 是否显示指示点     |
| dotPosition   | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` |  ✓  |   ✓   | 指示点位置         |
| effect        | `'scroll' \| 'fade'`                     | `'scroll'` |  ✓  |   ✓   | 切换效果           |
| arrows        | `boolean`                                | `false`    |  ✓  |   ✓   | 是否显示切换箭头   |
| infinite      | `boolean`                                | `true`     |  ✓  |   ✓   | 是否无限循环       |
| speed         | `number`                                 | `500`      |  ✓  |   ✓   | 切换动画速度（ms） |
| initialSlide  | `number`                                 | `0`        |  ✓  |   ✓   | 初始幻灯片索引     |
| pauseOnHover  | `boolean`                                | `true`     |  ✓  |   ✓   | 鼠标悬停时暂停     |
| pauseOnFocus  | `boolean`                                | `true`     |  ✓  |   ✓   | 聚焦时暂停         |

### Events

| Vue Event        | React Callback   | Payload           | Description |
| ---------------- | ---------------- | ----------------- | ----------- |
| `@change`        | `onChange`       | `(current, prev)` | 切换时触发  |
| `@before-change` | `onBeforeChange` | `(current, next)` | 切换前触发  |

### Methods (Imperative API)

| Method   | Arguments       | Description  |
| -------- | --------------- | ------------ |
| `next()` | -               | 下一张       |
| `prev()` | -               | 上一张       |
| `goTo()` | `index: number` | 跳转到指定张 |

> **Vue**: 使用 `ref` 获取组件实例调用方法
> **React**: 使用 `useRef<CarouselRef>` 获取 ref 调用方法

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 轮播内容    |

---

> **See also**: [Vue examples](../vue/data.md) · [React examples](../react/data.md)

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
