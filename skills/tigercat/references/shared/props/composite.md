---
name: tigercat-shared-props-composite
description: Shared props definitions for composite components - ChatWindow
---

# Composite Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

---

## ChatWindow 聊天窗口

### Props

| Prop                 | Type                    | Default        | Vue | React | Description          |
| -------------------- | ----------------------- | -------------- | :-: | :---: | -------------------- |
| messages             | `ChatMessage[]`         | `[]`           |  ✓  |   ✓   | 消息列表             |
| modelValue           | `string`                | -              |  ✓  |   -   | 输入内容（v-model）  |
| value                | `string`                | -              |  -  |   ✓   | 输入内容（受控）     |
| defaultValue         | `string`                | `''`           |  ✓  |   ✓   | 输入默认值（非受控） |
| placeholder          | `string`                | `'请输入消息'` |  ✓  |   ✓   | 输入占位             |
| disabled             | `boolean`               | `false`        |  ✓  |   ✓   | 输入区禁用           |
| maxLength            | `number`                | -              |  ✓  |   ✓   | 最大字数             |
| emptyText            | `string`                | `'暂无消息'`   |  ✓  |   ✓   | 空态文案             |
| sendText             | `string`                | `'发送'`       |  ✓  |   ✓   | 发送按钮文案         |
| messageListAriaLabel | `string`                | `'消息列表'`   |  ✓  |   ✓   | 消息列表无障碍标签   |
| inputAriaLabel       | `string`                | `placeholder`  |  ✓  |   ✓   | 输入框无障碍标签     |
| sendAriaLabel        | `string`                | `sendText`     |  ✓  |   ✓   | 发送按钮无障碍标签   |
| statusText           | `string`                | -              |  ✓  |   ✓   | 状态区文案           |
| statusVariant        | `BadgeVariant`          | `'info'`       |  ✓  |   ✓   | 状态区 Badge 颜色    |
| showAvatar           | `boolean`               | `true`         |  ✓  |   ✓   | 显示头像             |
| showName             | `boolean`               | `true`         |  ✓  |   ✓   | 显示名称             |
| showTime             | `boolean`               | `false`        |  ✓  |   ✓   | 显示时间             |
| inputType            | `'input' \| 'textarea'` | `'textarea'`   |  ✓  |   ✓   | 输入组件类型         |
| inputRows            | `number`                | `3`            |  ✓  |   ✓   | Textarea 行数        |
| sendOnEnter          | `boolean`               | `true`         |  ✓  |   ✓   | Enter 快捷发送       |
| allowShiftEnter      | `boolean`               | `true`         |  ✓  |   ✓   | Shift+Enter 换行     |
| allowEmpty           | `boolean`               | `false`        |  ✓  |   ✓   | 允许发送空内容       |
| clearOnSend          | `boolean`               | `true`         |  ✓  |   ✓   | 发送后清空输入       |

### Behavior

- `allowEmpty=true` 时允许发送空字符串。
- `allowShiftEnter` 仅在 `inputType='textarea'` 时生效。
- 消息状态文案默认使用 `发送中/已送达/发送失败`，可通过 `ChatMessage.statusText` 覆盖。
- `statusText` 为底部状态区文案，与消息内 `status` 文案无关。

### Events

| Vue Event            | React Callback | Payload  | Description |
| -------------------- | -------------- | -------- | ----------- |
| `@update:modelValue` | `onChange`     | `string` | 输入变更    |
| `@input`             | `onChange`     | `string` | 输入变更    |
| `@change`            | `onChange`     | `string` | 输入变更    |
| `@send`              | `onSend`       | `string` | 发送消息    |

### Slots / Render Props

| Vue Slot                                 | React Prop      | Description        |
| ---------------------------------------- | --------------- | ------------------ |
| `message` (scoped: `{ message, index }`) | `renderMessage` | 自定义消息气泡内容 |

### ChatMessage

| Prop       | Type                              | Default   | Description    |
| ---------- | --------------------------------- | --------- | -------------- |
| id         | `string \| number`                | -         | 消息唯一标识   |
| content    | `string \| number`                | -         | 消息内容       |
| direction  | `'self' \| 'other'`               | `'other'` | 消息方向       |
| user       | `ChatUser`                        | -         | 发送者         |
| time       | `string \| number \| Date`        | -         | 时间           |
| status     | `'sending' \| 'sent' \| 'failed'` | -         | 发送状态       |
| statusText | `string`                          | -         | 自定义状态文案 |
| meta       | `Record<string, unknown>`         | -         | 扩展数据       |

### ChatUser

| Prop   | Type               | Default | Description |
| ------ | ------------------ | ------- | ----------- |
| id     | `string \| number` | -       | 用户标识    |
| name   | `string`           | -       | 显示名称    |
| avatar | `string`           | -       | 头像地址    |

---

## ActivityFeed 活动动态流

### Props

| Prop           | Type               | Default       | Vue | React | Description      |
| -------------- | ------------------ | ------------- | :-: | :---: | ---------------- |
| items          | `ActivityItem[]`   | `[]`          |  ✓  |   ✓   | 动态列表（扁平） |
| groups         | `ActivityGroup[]`  | -             |  ✓  |   ✓   | 分组数据         |
| groupBy        | `(item) => string` | -             |  ✓  |   ✓   | 分组函数         |
| groupOrder     | `string[]`         | -             |  ✓  |   ✓   | 分组顺序         |
| loading        | `boolean`          | `false`       |  ✓  |   ✓   | 加载中状态       |
| loadingText    | `string`           | `'加载中...'` |  ✓  |   ✓   | 加载文案         |
| emptyText      | `string`           | `'暂无动态'`  |  ✓  |   ✓   | 空态文案         |
| showAvatar     | `boolean`          | `true`        |  ✓  |   ✓   | 显示头像         |
| showTime       | `boolean`          | `true`        |  ✓  |   ✓   | 显示时间         |
| showGroupTitle | `boolean`          | `true`        |  ✓  |   ✓   | 显示分组标题     |

### Behavior

- `groups` 优先生效；未提供 `groups` 时可用 `groupBy` 对 `items` 进行分组。
- `groupOrder` 可用于控制分组顺序，未包含的分组会排在后面。

### Slots / Render Props

| Vue Slot                                  | React Prop          | Description    |
| ----------------------------------------- | ------------------- | -------------- |
| `item` (scoped: `{ item, index, group }`) | `renderItem`        | 自定义条目渲染 |
| `groupTitle` (scoped: `{ group }`)        | `renderGroupHeader` | 自定义分组标题 |
| `empty`                                   | -                   | 自定义空态     |
| `loading`                                 | -                   | 自定义加载态   |

### ActivityItem

| Prop        | Type                       | Default | Description |
| ----------- | -------------------------- | ------- | ----------- |
| id          | `string \| number`         | -       | 唯一标识    |
| title       | `string`                   | -       | 标题        |
| description | `string`                   | -       | 描述        |
| time        | `string \| number \| Date` | -       | 时间        |
| user        | `ActivityUser`             | -       | 用户        |
| status      | `ActivityStatusTag`        | -       | 状态标签    |
| actions     | `ActivityAction[]`         | -       | 操作入口    |
| content     | `unknown`                  | -       | 自定义内容  |

### ActivityGroup

| Prop  | Type               | Default | Description |
| ----- | ------------------ | ------- | ----------- |
| key   | `string \| number` | -       | 分组键      |
| title | `string`           | -       | 分组标题    |
| items | `ActivityItem[]`   | -       | 分组内容    |

### ActivityStatusTag

| Prop    | Type         | Default     | Description |
| ------- | ------------ | ----------- | ----------- |
| label   | `string`     | -           | 状态文案    |
| variant | `TagVariant` | `'default'` | 标签风格    |

### ActivityAction

| Prop     | Type                                         | Default | Description |
| -------- | -------------------------------------------- | ------- | ----------- |
| key      | `string \| number`                           | -       | 唯一标识    |
| label    | `string`                                     | -       | 操作文案    |
| href     | `string`                                     | -       | 链接地址    |
| target   | `'_blank' \| '_self' \| '_parent' \| '_top'` | -       | 链接 target |
| disabled | `boolean`                                    | `false` | 禁用        |
| onClick  | `(item, action) => void`                     | -       | 点击回调    |

### ActivityUser

| Prop   | Type               | Default | Description |
| ------ | ------------------ | ------- | ----------- |
| id     | `string \| number` | -       | 用户标识    |
| name   | `string`           | -       | 显示名称    |
| avatar | `string`           | -       | 头像地址    |

---

## DataTableWithToolbar 表格工具栏

> 组合 Table + Toolbar + Pagination 的统一容器。

### Props

| Prop             | Type                          | Default | Vue | React | Description             |
| ---------------- | ----------------------------- | ------- | :-: | :---: | ----------------------- |
| columns          | `TableColumn[]`               | -       |  ✓  |   ✓   | 表格列配置（同 Table）  |
| dataSource       | `any[]`                       | `[]`    |  ✓  |   ✓   | 数据源                  |
| rowSelection     | `RowSelectionConfig`          | -       |  ✓  |   ✓   | 行选择配置              |
| rowKey           | `string \| ((row) => string)` | `'id'`  |  ✓  |   ✓   | 行唯一键                |
| loading          | `boolean`                     | `false` |  ✓  |   ✓   | 加载状态                |
| toolbar          | `TableToolbarProps`           | -       |  ✓  |   ✓   | 工具栏配置              |
| pagination       | `PaginationProps \| false`    | `false` |  ✓  |   ✓   | 分页配置                |
| onPageChange     | `(current, pageSize) => void` | -       |  -  |   ✓   | 分页变化回调（React）   |
| onPageSizeChange | `(current, pageSize) => void` | -       |  -  |   ✓   | 页大小变化回调（React） |

> 其余 Table 相关 Props（如 `striped`/`hoverable`/`stickyHeader`）保持一致。

### Events

| Vue Event           | React Callback       | Payload                                   | Description  |
| ------------------- | -------------------- | ----------------------------------------- | ------------ |
| `@search-change`    | `onSearchChange`     | `string`                                  | 搜索输入变化 |
| `@search`           | `onSearch`           | `string`                                  | 提交搜索     |
| `@filters-change`   | `onFiltersChange`    | `Record<string, TableToolbarFilterValue>` | 筛选变化     |
| `@bulk-action`      | `onBulkAction`       | `(action, selectedKeys)`                  | 批量操作触发 |
| `@selection-change` | `onSelectionChange`  | `(string \| number)[]`                    | 选中行变化   |
| `@page-change`      | `onPageChange`       | `current, pageSize`                       | 分页变化     |
| `@page-size-change` | `onPageSizeChange`   | `current, pageSize`                       | 页大小变化   |

### TableToolbarProps

| Prop               | Type                   | Default    | Description          |
| ------------------ | ---------------------- | ---------- | -------------------- |
| searchValue        | `string`               | -          | 搜索值（受控）       |
| defaultSearchValue | `string`               | -          | 搜索默认值（非受控） |
| searchPlaceholder  | `string`               | `'搜索'`   | 搜索占位             |
| searchButtonText   | `string`               | `'搜索'`   | 搜索按钮文案         |
| showSearchButton   | `boolean`              | `true`     | 显示搜索按钮         |
| filters            | `TableToolbarFilter[]` | -          | 筛选配置             |
| bulkActions        | `TableToolbarAction[]` | -          | 批量操作配置         |
| selectedKeys       | `(string \| number)[]` | `[]`       | 选中行 keys          |
| selectedCount      | `number`               | -          | 选中行数量           |
| bulkActionsLabel   | `string`               | `'已选择'` | 批量操作前缀文案     |

### TableToolbarFilter

| Prop         | Type                      | Default  | Description  |
| ------------ | ------------------------- | -------- | ------------ |
| key          | `string`                  | -        | 过滤键       |
| label        | `string`                  | -        | 过滤标题     |
| options      | `FilterOption[]`          | -        | 过滤选项     |
| placeholder  | `string`                  | -        | 触发按钮占位 |
| clearable    | `boolean`                 | `true`   | 是否可清空   |
| clearLabel   | `string`                  | `'全部'` | 清空文案     |
| value        | `TableToolbarFilterValue` | -        | 受控值       |
| defaultValue | `TableToolbarFilterValue` | -        | 非受控默认值 |

### TableToolbarAction

| Prop     | Type                     | Default     | Description |
| -------- | ------------------------ | ----------- | ----------- |
| key      | `string \| number`       | -           | 操作键      |
| label    | `string`                 | -           | 操作文案    |
| variant  | `ButtonVariant`          | `'outline'` | 按钮风格    |
| disabled | `boolean`                | `false`     | 禁用        |
| onClick  | `(selectedKeys) => void` | -           | 点击回调    |
