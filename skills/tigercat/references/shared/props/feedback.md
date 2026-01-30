---
name: tigercat-shared-props-feedback
description: Shared props definitions for feedback components - Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip
---

# Feedback Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

> **显示状态差异**: Vue 使用 `visible`，React 使用 `open`。详见 [patterns/common.md](../patterns/common.md)

---

## Modal 对话框

### Props

| Prop              | Type                                     | Default    | Vue | React | Description                |
| ----------------- | ---------------------------------------- | ---------- | :-: | :---: | -------------------------- |
| visible           | `boolean`                                | `false`    |  ✓  |   -   | 显示状态 (v-model:visible) |
| open              | `boolean`                                | `false`    |  -  |   ✓   | 显示状态                   |
| title             | `string`                                 | -          |  ✓  |   ✓   | 标题                       |
| size              | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`     |  ✓  |   ✓   | 尺寸                       |
| okText            | `string`                                 | `'OK'`     |  ✓  |   ✓   | 确认按钮文案               |
| cancelText        | `string`                                 | `'Cancel'` |  ✓  |   ✓   | 取消按钮文案               |
| closable          | `boolean`                                | `true`     |  ✓  |   ✓   | 显示关闭按钮               |
| maskClosable      | `boolean`                                | `true`     |  ✓  |   ✓   | 点击遮罩关闭               |
| showDefaultFooter | `boolean`                                | `false`    |  ✓  |   -   | 显示默认底部               |
| footer            | `ReactNode`                              | -          |  -  |   ✓   | 自定义底部                 |
| locale            | `{ modal: ModalLocale }`                 | -          |  ✓  |   ✓   | 国际化                     |

### Events

| Vue Event         | React Callback | Description  |
| ----------------- | -------------- | ------------ |
| `@update:visible` | `onOpenChange` | 显示状态变更 |
| `@ok`             | `onOk`         | 确认事件     |
| `@cancel`         | `onCancel`     | 取消事件     |
| `@close`          | `onClose`      | 关闭事件     |

### Slots / Children

| Vue Slot                            | React Prop | Description |
| ----------------------------------- | ---------- | ----------- |
| `default`                           | `children` | 内容        |
| `footer` (scoped: `{ ok, cancel }`) | `footer`   | 自定义底部  |

---

## Drawer 抽屉

### Props

| Prop         | Type                                     | Default   | Vue | React | Description                |
| ------------ | ---------------------------------------- | --------- | :-: | :---: | -------------------------- |
| visible      | `boolean`                                | `false`   |  ✓  |   -   | 显示状态 (v-model:visible) |
| open         | `boolean`                                | `false`   |  -  |   ✓   | 显示状态                   |
| title        | `string`                                 | -         |  ✓  |   ✓   | 标题                       |
| placement    | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` |  ✓  |   ✓   | 弹出位置                   |
| width        | `string \| number`                       | `300`     |  ✓  |   ✓   | 宽度（left/right 时）      |
| height       | `string \| number`                       | `300`     |  ✓  |   ✓   | 高度（top/bottom 时）      |
| closable     | `boolean`                                | `true`    |  ✓  |   ✓   | 显示关闭按钮               |
| maskClosable | `boolean`                                | `true`    |  ✓  |   ✓   | 点击遮罩关闭               |

### Events

| Vue Event         | React Callback | Description  |
| ----------------- | -------------- | ------------ |
| `@update:visible` | `onOpenChange` | 显示状态变更 |
| `@close`          | `onClose`      | 关闭事件     |

---

## Message 消息提示

静态方法调用，Vue 和 React API 完全相同。

### API Methods

| Method                                | Description |
| ------------------------------------- | ----------- |
| `Message.success(content \| options)` | 成功提示    |
| `Message.error(content \| options)`   | 错误提示    |
| `Message.info(content \| options)`    | 信息提示    |
| `Message.warning(content \| options)` | 警告提示    |

### Options

| Option   | Type     | Default | Description    |
| -------- | -------- | ------- | -------------- |
| content  | `string` | -       | 消息内容       |
| duration | `number` | `3000`  | 显示时长（ms） |

---

## Notification 通知

静态方法调用，Vue 和 React API 完全相同。

### API Methods

| Method                          | Description |
| ------------------------------- | ----------- |
| `Notification.open(options)`    | 打开通知    |
| `Notification.success(options)` | 成功通知    |
| `Notification.error(options)`   | 错误通知    |
| `Notification.info(options)`    | 信息通知    |
| `Notification.warning(options)` | 警告通知    |

### Options

| Option      | Type                                                           | Default       | Description    |
| ----------- | -------------------------------------------------------------- | ------------- | -------------- |
| title       | `string`                                                       | -             | 标题           |
| description | `string`                                                       | -             | 描述           |
| type        | `'success' \| 'error' \| 'info' \| 'warning'`                  | -             | 类型           |
| duration    | `number`                                                       | `4500`        | 显示时长（ms） |
| placement   | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | 位置           |

---

## Popconfirm 气泡确认框

### Props

| Prop       | Type                                     | Default    | Vue | React | Description  |
| ---------- | ---------------------------------------- | ---------- | :-: | :---: | ------------ |
| title      | `string`                                 | -          |  ✓  |   ✓   | 确认标题     |
| okText     | `string`                                 | `'OK'`     |  ✓  |   ✓   | 确认按钮文案 |
| cancelText | `string`                                 | `'Cancel'` |  ✓  |   ✓   | 取消按钮文案 |
| placement  | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`    |  ✓  |   ✓   | 弹出位置     |

### Events

| Vue Event  | React Callback | Description |
| ---------- | -------------- | ----------- |
| `@confirm` | `onConfirm`    | 确认事件    |
| `@cancel`  | `onCancel`     | 取消事件    |

---

## Popover 气泡卡片

### Props

| Prop      | Type                                     | Default   | Vue | React | Description |
| --------- | ---------------------------------------- | --------- | :-: | :---: | ----------- |
| content   | `string`                                 | -         |  ✓  |   -   | 内容文本    |
| content   | `ReactNode`                              | -         |  -  |   ✓   | 内容节点    |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` |  ✓  |   ✓   | 触发方式    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   |  ✓  |   ✓   | 位置        |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 触发元素    |
| `content` | `content`  | 弹出内容    |

---

## Tooltip 文字提示

### Props

| Prop      | Type                                     | Default   | Vue | React | Description |
| --------- | ---------------------------------------- | --------- | :-: | :---: | ----------- |
| content   | `string`                                 | -         |  ✓  |   ✓   | 提示内容    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   |  ✓  |   ✓   | 位置        |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` |  ✓  |   ✓   | 触发方式    |

---

## Loading 加载

### Props

| Prop     | Type      | Default | Vue | React | Description |
| -------- | --------- | ------- | :-: | :---: | ----------- |
| spinning | `boolean` | `false` |  ✓  |   ✓   | 加载状态    |
| text     | `string`  | -       |  ✓  |   ✓   | 加载文案    |

---

## Progress 进度条

### Props

| Prop        | Type                               | Default    | Vue | React | Description    |
| ----------- | ---------------------------------- | ---------- | :-: | :---: | -------------- |
| value       | `number`                           | `0`        |  ✓  |   ✓   | 进度值 (0-100) |
| type        | `'line' \| 'circle'`               | `'line'`   |  ✓  |   ✓   | 类型           |
| status      | `'normal' \| 'success' \| 'error'` | `'normal'` |  ✓  |   ✓   | 状态           |
| showText    | `boolean`                          | `true`     |  ✓  |   ✓   | 显示进度文本   |
| strokeWidth | `number`                           | `8`        |  ✓  |   ✓   | 线条宽度       |

---

> **See also**: [Vue examples](../vue/feedback.md) �� [React examples](../react/feedback.md)

---

> **See also**: [Vue examples](../vue/feedback.md) �� [React examples](../react/feedback.md)
