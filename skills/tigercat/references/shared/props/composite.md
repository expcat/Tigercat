---
name: tigercat-shared-props-composite
description: Shared props definitions for composite components - ChatWindow / ActivityFeed / CommentThread / NotificationCenter
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

## CommentThread 评论线程

### Props

| Prop                | Type                   | Default         | Vue | React | Description                    |
| ------------------- | ---------------------- | --------------- | :-: | :---: | ------------------------------ |
| nodes               | `CommentNode[]`        | -               |  ✓  |   ✓   | 树形数据                       |
| items               | `CommentNode[]`        | -               |  ✓  |   ✓   | 扁平数据（通过 parentId 组装） |
| maxDepth            | `number`               | `3`             |  ✓  |   ✓   | 最大嵌套层级                   |
| maxReplies          | `number`               | `3`             |  ✓  |   ✓   | 单条最大展示回复数             |
| defaultExpandedKeys | `(string \| number)[]` | `[]`            |  ✓  |   ✓   | 默认展开回复                   |
| expandedKeys        | `(string \| number)[]` | -               |  ✓  |   ✓   | 展开回复（受控）               |
| emptyText           | `string`               | `'暂无评论'`    |  ✓  |   ✓   | 空态文案                       |
| replyPlaceholder    | `string`               | `'写下回复...'` |  ✓  |   ✓   | 回复输入占位                   |
| replyButtonText     | `string`               | `'回复'`        |  ✓  |   ✓   | 回复提交文案                   |
| cancelReplyText     | `string`               | `'取消'`        |  ✓  |   ✓   | 取消回复文案                   |
| likeText            | `string`               | `'点赞'`        |  ✓  |   ✓   | 点赞文案                       |
| likedText           | `string`               | `'已赞'`        |  ✓  |   ✓   | 已点赞文案                     |
| replyText           | `string`               | `'回复'`        |  ✓  |   ✓   | 操作栏回复文案                 |
| moreText            | `string`               | `'更多'`        |  ✓  |   ✓   | 操作栏更多文案                 |
| loadMoreText        | `string`               | `'加载更多'`    |  ✓  |   ✓   | 加载更多文案                   |
| showAvatar          | `boolean`              | `true`          |  ✓  |   ✓   | 显示头像                       |
| showDivider         | `boolean`              | `true`          |  ✓  |   ✓   | 显示分隔线                     |
| showLike            | `boolean`              | `true`          |  ✓  |   ✓   | 显示点赞                       |
| showReply           | `boolean`              | `true`          |  ✓  |   ✓   | 显示回复                       |
| showMore            | `boolean`              | `true`          |  ✓  |   ✓   | 显示更多                       |

### Behavior

- `nodes` 优先生效；未提供时会使用 `items` 并基于 `parentId` 构建树。
- 当 `maxDepth` 到达时，超出层级的回复不会渲染。
- 回复区支持展开/收起与“加载更多”。

### Events

| Vue Event        | React Callback     | Payload        | Description   |
| ---------------- | ------------------ | -------------- | ------------- |
| `@like`          | `onLike`           | `node, liked`  | 点赞/取消点赞 |
| `@reply`         | `onReply`          | `node, value`  | 提交回复      |
| `@more`          | `onMore`           | `node`         | 更多操作      |
| `@action`        | `onAction`         | `node, action` | 自定义动作    |
| `@expand-change` | `onExpandedChange` | `keys`         | 展开回复变化  |
| `@load-more`     | `onLoadMore`       | `node`         | 加载更多回复  |

### CommentNode

| Prop     | Type                       | Default | Description |
| -------- | -------------------------- | ------- | ----------- |
| id       | `string \| number`         | -       | 唯一标识    |
| parentId | `string \| number`         | -       | 父级标识    |
| content  | `string \| number`         | -       | 内容        |
| user     | `CommentUser`              | -       | 用户信息    |
| time     | `string \| number \| Date` | -       | 时间        |
| likes    | `number`                   | -       | 点赞数      |
| liked    | `boolean`                  | -       | 是否已点赞  |
| tag      | `CommentTag`               | -       | 单个标签    |
| tags     | `CommentTag[]`             | -       | 额外标签    |
| actions  | `CommentAction[]`          | -       | 自定义操作  |
| children | `CommentNode[]`            | -       | 子回复      |
| meta     | `Record<string, unknown>`  | -       | 扩展数据    |

### CommentUser

| Prop   | Type               | Default | Description |
| ------ | ------------------ | ------- | ----------- |
| id     | `string \| number` | -       | 用户标识    |
| name   | `string`           | -       | 显示名称    |
| avatar | `string`           | -       | 头像地址    |
| title  | `string`           | -       | 角色/头衔   |

### CommentTag

| Prop    | Type         | Default     | Description |
| ------- | ------------ | ----------- | ----------- |
| label   | `string`     | -           | 标签文案    |
| variant | `TagVariant` | `'default'` | 标签风格    |

### CommentAction

| Prop     | Type                     | Default   | Description |
| -------- | ------------------------ | --------- | ----------- |
| key      | `string \| number`       | -         | 唯一标识    |
| label    | `string`                 | -         | 操作文案    |
| variant  | `ButtonVariant`          | `'ghost'` | 按钮风格    |
| disabled | `boolean`                | `false`   | 禁用        |
| onClick  | `(node, action) => void` | -         | 点击回调    |

---

## NotificationCenter 通知中心

### Props

| Prop                  | Type                          | Default          | Vue | React | Description        |
| --------------------- | ----------------------------- | ---------------- | :-: | :---: | ------------------ |
| items                 | `NotificationItem[]`          | `[]`             |  ✓  |   ✓   | 通知列表（扁平）   |
| groups                | `NotificationGroup[]`         | -                |  ✓  |   ✓   | 分组数据           |
| groupBy               | `(item) => string`            | -                |  ✓  |   ✓   | 分组函数           |
| groupOrder            | `string[]`                    | -                |  ✓  |   ✓   | 分组顺序           |
| activeGroupKey        | `string \| number`            | -                |  ✓  |   ✓   | 当前分组（受控）   |
| defaultActiveGroupKey | `string \| number`            | -                |  ✓  |   ✓   | 默认分组（非受控） |
| readFilter            | `'all' \| 'unread' \| 'read'` | `'all'`          |  ✓  |   ✓   | 已读筛选（受控）   |
| defaultReadFilter     | `'all' \| 'unread' \| 'read'` | `'all'`          |  ✓  |   ✓   | 已读筛选（非受控） |
| loading               | `boolean`                     | `false`          |  ✓  |   ✓   | 加载中状态         |
| loadingText           | `string`                      | `'加载中...'`    |  ✓  |   ✓   | 加载文案           |
| emptyText             | `string`                      | `'暂无通知'`     |  ✓  |   ✓   | 空态文案           |
| title                 | `string`                      | `'通知中心'`     |  ✓  |   ✓   | 标题               |
| allLabel              | `string`                      | `'全部'`         |  ✓  |   ✓   | 全部筛选文案       |
| unreadLabel           | `string`                      | `'未读'`         |  ✓  |   ✓   | 未读筛选文案       |
| readLabel             | `string`                      | `'已读'`         |  ✓  |   ✓   | 已读筛选文案       |
| markAllReadText       | `string`                      | `'全部标记已读'` |  ✓  |   ✓   | 批量标记已读文案   |
| markReadText          | `string`                      | `'标记已读'`     |  ✓  |   ✓   | 单条标记已读文案   |
| markUnreadText        | `string`                      | `'标记未读'`     |  ✓  |   ✓   | 单条标记未读文案   |

### Behavior

- `groups` 优先生效；未提供 `groups` 时可用 `groupBy` 对 `items` 进行分组。
- 分组标签会显示当前分组未读数量。
- `readFilter` 控制列表筛选范围：全部/未读/已读。

### Events

| Vue Event                | React Callback       | Payload           | Description       |
| ------------------------ | -------------------- | ----------------- | ----------------- |
| `@update:activeGroupKey` | `onGroupChange`      | `key`             | 切换分组          |
| `@update:readFilter`     | `onReadFilterChange` | `filter`          | 切换已读筛选      |
| `@mark-all-read`         | `onMarkAllRead`      | `groupKey, items` | 批量标记已读      |
| `@item-click`            | `onItemClick`        | `item, index`     | 点击通知条目      |
| `@item-read-change`      | `onItemReadChange`   | `item, read`      | 单条标记已读/未读 |

### NotificationItem

| Prop        | Type                       | Default | Description |
| ----------- | -------------------------- | ------- | ----------- |
| id          | `string \| number`         | -       | 唯一标识    |
| title       | `string`                   | -       | 标题        |
| description | `string`                   | -       | 描述        |
| time        | `string \| number \| Date` | -       | 时间        |
| type        | `string`                   | -       | 类型/分组键 |
| read        | `boolean`                  | `false` | 是否已读    |
| meta        | `Record<string, unknown>`  | -       | 扩展数据    |

### NotificationGroup

| Prop  | Type                 | Default | Description |
| ----- | -------------------- | ------- | ----------- |
| key   | `string \| number`   | -       | 分组键      |
| title | `string`             | -       | 分组标题    |
| items | `NotificationItem[]` | -       | 分组内容    |

---

## FormWizard 表单向导

### Props

| Prop           | Type                         | Default        | Vue | React | Description                             |
| -------------- | ---------------------------- | -------------- | :-: | :---: | --------------------------------------- |
| steps          | `WizardStep[]`               | `[]`           |  ✓  |   ✓   | 步骤配置                                |
| current        | `number`                     | -              |  ✓  |   ✓   | 当前步骤（受控）                        |
| defaultCurrent | `number`                     | `0`            |  ✓  |   ✓   | 默认步骤（非受控）                      |
| clickable      | `boolean`                    | `false`        |  ✓  |   ✓   | 允许点击步骤切换                        |
| direction      | `'horizontal' \| 'vertical'` | `'horizontal'` |  ✓  |   ✓   | 步骤方向                                |
| size           | `'small' \| 'default'`       | `'default'`    |  ✓  |   ✓   | 步骤尺寸                                |
| simple         | `boolean`                    | `false`        |  ✓  |   ✓   | Steps 简洁模式                          |
| showSteps      | `boolean`                    | `true`         |  ✓  |   ✓   | 显示步骤条                              |
| showActions    | `boolean`                    | `true`         |  ✓  |   ✓   | 显示操作按钮                            |
| prevText       | `string`                     | `'Previous'`   |  ✓  |   ✓   | 上一步按钮文案                          |
| nextText       | `string`                     | `'Next'`       |  ✓  |   ✓   | 下一步按钮文案                          |
| finishText     | `string`                     | `'Finish'`     |  ✓  |   ✓   | 完成按钮文案                            |
| beforeNext     | `FormWizardValidator`        | -              |  ✓  |   ✓   | 下一步校验（返回 false 或 string 阻断） |

### Behavior

- `beforeNext` 返回 `string` 时会显示错误提示并阻断前进。
- 当点击可跳转步骤时，若目标步骤在前方，会先执行 `beforeNext`。

### Events

| Vue Event         | React Callback | Payload          | Description                                          |
| ----------------- | -------------- | ---------------- | ---------------------------------------------------- |
| `@update:current` | `-`            | `current`        | 当前步骤 v-model 更新（Vue 专用，无直接 React 等价） |
| `@change`         | `onChange`     | `current, prev`  | 步骤变化（React: `onChange(current, prev)`）         |
| `@finish`         | `onFinish`     | `current, steps` | 完成                                                 |

### Slots / Render Props

| Vue Slot                           | React Prop   | Description        |
| ---------------------------------- | ------------ | ------------------ |
| `step` (scoped: `{ step, index }`) | `renderStep` | 自定义步骤内容渲染 |

### WizardStep

| Prop        | Type                                         | Default | Description |
| ----------- | -------------------------------------------- | ------- | ----------- |
| key         | `string \| number`                           | -       | 唯一标识    |
| title       | `string`                                     | -       | 标题        |
| description | `string`                                     | -       | 描述        |
| status      | `'wait' \| 'process' \| 'finish' \| 'error'` | -       | 步骤状态    |
| icon        | `unknown`                                    | -       | 自定义图标  |
| disabled    | `boolean`                                    | `false` | 禁用步骤    |
| content     | `unknown`                                    | -       | 自定义内容  |

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

| Vue Event           | React Callback      | Payload                                   | Description  |
| ------------------- | ------------------- | ----------------------------------------- | ------------ |
| `@search-change`    | `onSearchChange`    | `string`                                  | 搜索输入变化 |
| `@search`           | `onSearch`          | `string`                                  | 提交搜索     |
| `@filters-change`   | `onFiltersChange`   | `Record<string, TableToolbarFilterValue>` | 筛选变化     |
| `@bulk-action`      | `onBulkAction`      | `(action, selectedKeys)`                  | 批量操作触发 |
| `@selection-change` | `onSelectionChange` | `(string \| number)[]`                    | 选中行变化   |
| `@page-change`      | `onPageChange`      | `current, pageSize`                       | 分页变化     |
| `@page-size-change` | `onPageSizeChange`  | `current, pageSize`                       | 页大小变化   |

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
