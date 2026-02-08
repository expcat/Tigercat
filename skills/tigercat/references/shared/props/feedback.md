---
name: tigercat-shared-props-feedback
description: Shared props definitions for feedback components - Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip
---

# Feedback Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

> **显示状态差异**: Modal/Drawer → Vue 使用 `visible`，React 使用 `open`。Tooltip/Popover/Popconfirm → 双框架统一使用 `visible`。详见 [patterns/common.md](../patterns/common.md)
>
> **Floating Popup 共享架构**: Tooltip、Popover、Popconfirm 共享 `useFloatingPopup` (Vue) / `usePopup` (React) hook，统一管理 visibility、定位、dismiss 与 trigger 事件。详见 [patterns/common.md](../patterns/common.md#floating-popup-共享架构)

---

## Modal 对话框

### Props

| Prop              | Type                                     | Default    | Vue | React | Description                |
| ----------------- | ---------------------------------------- | ---------- | :-: | :---: | -------------------------- |
| visible           | `boolean`                                | `false`    |  ✓  |   ✓   | 显示状态 (Vue: v-model:visible) |
| title             | `string`                                 | -          |  ✓  |   ✓   | 标题                       |
| size              | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`     |  ✓  |   ✓   | 尺寸                       |
| closable          | `boolean`                                | `true`     |  ✓  |   ✓   | 显示关闭按钮               |
| mask              | `boolean`                                | `true`     |  ✓  |   ✓   | 显示遮罩层                 |
| maskClosable      | `boolean`                                | `true`     |  ✓  |   ✓   | 点击遮罩关闭               |
| centered          | `boolean`                                | `false`    |  ✓  |   ✓   | 垂直居中                   |
| destroyOnClose    | `boolean`                                | `false`    |  ✓  |   ✓   | 关闭时销毁内容             |
| zIndex            | `number`                                 | `1000`     |  ✓  |   ✓   | 层级                       |
| showDefaultFooter | `boolean`                                | `false`    |  ✓  |   ✓   | 显示内置确定/取消页脚       |
| okText            | `string`                                 | `'确定'`   |  ✓  |   ✓   | 确认按钮文案               |
| cancelText        | `string`                                 | `'取消'`   |  ✓  |   ✓   | 取消按钮文案               |
| className         | `string`                                 | -          |  ✓  |   ✓   | 自定义类名                 |
| locale            | `{ modal: ModalLocale }`                 | -          |  ✓  |   ✓   | 国际化                     |

### Events

| Vue Event         | React Callback    | Description  |
| ----------------- | ----------------- | ------------ |
| `@update:visible` | `onVisibleChange` | 显示状态变更 |
| `@ok`             | `onOk`            | 确认事件     |
| `@cancel`         | `onCancel`        | 取消事件     |
| `@close`          | `onClose`         | 关闭事件     |

### Slots / Children

| Vue Slot                            | React Prop | Description |
| ----------------------------------- | ---------- | ----------- |
| `default`                           | `children` | 内容        |
| `footer` (scoped: `{ ok, cancel }`) | `footer`   | 自定义底部  |

---

## Drawer 抽屉

### Props

| Prop           | Type                                      | Default   | Vue | React | Description                    |
| -------------- | ----------------------------------------- | --------- | :-: | :---: | ------------------------------ |
| visible        | `boolean`                                 | `false`   |  ✓  |   ✓   | 显示状态 (Vue: v-model:visible) |
| title          | `string`                                  | -         |  ✓  |   ✓   | 标题                           |
| placement      | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` |  ✓  |   ✓   | 弹出位置                       |
| size           | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`    |  ✓  |   ✓   | 尺寸（left/right 为宽度，top/bottom 为高度） |
| closable       | `boolean`                                 | `true`    |  ✓  |   ✓   | 显示关闭按钮                   |
| mask           | `boolean`                                 | `true`    |  ✓  |   ✓   | 显示遮罩层                     |
| maskClosable   | `boolean`                                 | `true`    |  ✓  |   ✓   | 点击遮罩关闭                   |
| zIndex         | `number`                                  | `1000`    |  ✓  |   ✓   | 层级                           |
| destroyOnClose | `boolean`                                 | `false`   |  ✓  |   ✓   | 关闭时销毁内容                 |
| className      | `string`                                  | -         |  ✓  |   ✓   | 面板自定义类名                 |
| bodyClassName  | `string`                                  | -         |  ✓  |   ✓   | 内容区域自定义类名             |
| closeAriaLabel | `string`                                  | `'Close drawer'` | ✓ | ✓  | 关闭按钮 aria-label            |
| locale         | `{ drawer: DrawerLocale }`                | -         |  ✓  |   ✓   | 国际化                         |

### Events

| Vue Event         | React Callback | Description        |
| ----------------- | -------------- | ------------------ |
| `@update:visible` | -              | 显示状态变更       |
| `@close`          | `onClose`      | 关闭事件           |
| `@after-enter`    | `onAfterEnter` | 打开动画结束       |
| `@after-leave`    | `onAfterLeave` | 关闭动画结束       |

### Slots / Children

| Vue Slot  | React Prop | Description  |
| --------- | ---------- | ------------ |
| `default` | `children` | 内容         |
| `header`  | `header`   | 自定义头部   |
| `footer`  | `footer`   | 自定义底部   |

---

## Message 消息提示

静态方法调用，Vue 和 React API 完全相同。每个方法返回一个 `() => void` 关闭函数，可用于手动关闭该条消息。

### API Methods

| Method                                | Return       | Description |
| ------------------------------------- | ------------ | ----------- |
| `Message.info(content \| options)`    | `() => void` | 信息提示    |
| `Message.success(content \| options)` | `() => void` | 成功提示    |
| `Message.warning(content \| options)` | `() => void` | 警告提示    |
| `Message.error(content \| options)`   | `() => void` | 错误提示    |
| `Message.loading(content \| options)` | `() => void` | 加载提示（默认不自动关闭） |
| `Message.clear()`                     | `void`       | 清空所有消息 |

### Options

| Option    | Type         | Default | Description                       |
| --------- | ------------ | ------- | --------------------------------- |
| content   | `string`     | -       | 消息内容（必填）                  |
| duration  | `number`     | `3000`  | 显示时长（ms），`0` 表示不自动关闭 |
| closable  | `boolean`    | `false` | 是否显示关闭按钮                  |
| onClose   | `() => void` | -       | 关闭时的回调                      |
| icon      | `string`     | -       | 自定义图标 SVG path d 属性        |
| className | `string`     | -       | 额外 CSS 类名                     |

---

## Notification 通知

静态方法调用，Vue 和 React API 完全相同。每个方法返回一个 `() => void` 关闭函数，可用于手动关闭该条通知。支持字符串快捷方式（等同于 `{ title: string }`）。

### API Methods

| Method                               | Return       | Description |
| ------------------------------------ | ------------ | ----------- |
| `notification.info(options)`         | `() => void` | 信息通知    |
| `notification.success(options)`      | `() => void` | 成功通知    |
| `notification.warning(options)`      | `() => void` | 警告通知    |
| `notification.error(options)`        | `() => void` | 错误通知    |
| `notification.clear(position?)`      | `void`       | 清空通知    |

### Options

`options` 可以是 `string`（等同 `{ title: string }`）或如下配置对象：

| Option      | Type                                                           | Default       | Description                        |
| ----------- | -------------------------------------------------------------- | ------------- | ---------------------------------- |
| title       | `string`                                                       | -             | 标题（必填）                       |
| description | `string`                                                       | -             | 描述                               |
| duration    | `number`                                                       | `4500`        | 显示时长（ms），`0` 表示不自动关闭 |
| position    | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | 位置                               |
| closable    | `boolean`                                                      | `true`        | 是否显示关闭按钮                   |
| onClose     | `() => void`                                                   | -             | 关闭时的回调                       |
| onClick     | `() => void`                                                   | -             | 点击通知时的回调                   |
| icon        | `string`                                                       | -             | 自定义图标 SVG path d 属性         |
| className   | `string`                                                       | -             | 额外 CSS 类名                      |

---

## Popconfirm 气泡确认框

### Props

| Prop           | Type                                                                                                           | Default      | Vue | React | Description        |
| -------------- | -------------------------------------------------------------------------------------------------------------- | ------------ | :-: | :---: | ------------------ |
| visible        | `boolean`                                                                                                      | -            |  ✓  |   ✓   | 受控显示状态       |
| defaultVisible | `boolean`                                                                                                      | `false`      |  ✓  |   ✓   | 默认显示状态       |
| title          | `string`                                                                                                       | -            |  ✓  |   ✓   | 确认标题           |
| description    | `string`                                                                                                       | -            |  ✓  |   ✓   | 描述文本           |
| icon           | `'warning' \| 'info' \| 'error' \| 'success' \| 'question'`                                                   | `'warning'`  |  ✓  |   ✓   | 图标类型           |
| showIcon       | `boolean`                                                                                                      | `true`       |  ✓  |   ✓   | 是否显示图标       |
| okText         | `string`                                                                                                       | `'确定'`     |  ✓  |   ✓   | 确认按钮文案       |
| cancelText     | `string`                                                                                                       | `'取消'`     |  ✓  |   ✓   | 取消按钮文案       |
| okType         | `'primary' \| 'danger'`                                                                                        | `'primary'`  |  ✓  |   ✓   | 确认按钮类型       |
| placement      | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| ... \| 'left' \| 'left-start' \| ... \| 'right' \| ...`     | `'top'`      |  ✓  |   ✓   | 弹出位置           |
| offset         | `number`                                                                                                       | `8`          |  ✓  |   ✓   | 距触发元素偏移(px) |
| disabled       | `boolean`                                                                                                      | `false`      |  ✓  |   ✓   | 是否禁用           |

### Events

| Vue Event        | React Callback    | Description      |
| ---------------- | ----------------- | ---------------- |
| `@confirm`       | `onConfirm`       | 确认事件         |
| `@cancel`        | `onCancel`        | 取消事件         |
| `@visible-change`| `onVisibleChange`  | 显示状态变更事件 |

### Slots / Children

| Vue Slot      | React Prop         | Description      |
| ------------- | ------------------ | ---------------- |
| `default`     | `children`         | 触发元素         |
| `title`       | `titleContent`     | 自定义标题内容   |
| `description` | `descriptionContent` | 自定义描述内容 |

---

## Popover 气泡卡片

### Props

| Prop           | Type                                                         | Default   | Vue | React | Description            |
| -------------- | ------------------------------------------------------------ | --------- | :-: | :---: | ---------------------- |
| visible        | `boolean`                                                    | -         |  ✓  |   ✓   | 受控显示状态           |
| defaultVisible | `boolean`                                                    | `false`   |  ✓  |   ✓   | 默认显示状态           |
| title          | `string`                                                     | -         |  ✓  |   ✓   | 标题文本               |
| content        | `string`                                                     | -         |  ✓  |   ✓   | 内容文本               |
| trigger        | `'click' \| 'hover' \| 'focus' \| 'manual'`                  | `'click'` |  ✓  |   ✓   | 触发方式               |
| placement      | `FloatingPlacement`                                          | `'top'`   |  ✓  |   ✓   | 弹出位置               |
| disabled       | `boolean`                                                    | `false`   |  ✓  |   ✓   | 禁用状态               |
| width          | `string \| number`                                           | -         |  ✓  |   ✓   | 宽度（像素数或类名）   |
| offset         | `number`                                                     | `8`       |  ✓  |   ✓   | 偏移距离 (px)          |
| className      | `string`                                                     | -         |  ✓  |   ✓   | 自定义 CSS 类          |
| style          | `StyleValue` / `CSSProperties`                               | -         |  ✓  |   ✓   | 自定义样式             |

### Slots / Children

| Vue Slot  | React Prop       | Description  |
| --------- | ---------------- | ------------ |
| `default` | `children`       | 触发元素     |
| `title`   | `titleContent`   | 自定义标题   |
| `content` | `contentContent` | 自定义内容   |

### Events

| Vue Event        | React Prop       | Description  |
| ---------------- | ---------------- | ------------ |
| `update:visible` | `onVisibleChange` | 显示状态变化 |
| `visible-change` | `onVisibleChange` | 显示状态变化 |

---

## Tooltip 文字提示

### Props

| Prop           | Type                                                                                            | Default   | Vue | React | Description              |
| -------------- | ----------------------------------------------------------------------------------------------- | --------- | :-: | :---: | ------------------------ |
| visible        | `boolean`                                                                                       | -         |  ✓  |   ✓   | 受控显示状态             |
| defaultVisible | `boolean`                                                                                       | `false`   |  ✓  |   ✓   | 默认显示（非受控）       |
| content        | `string` (Vue) / `ReactNode` (React)                                                            | -         |  ✓  |   ✓   | 提示内容                 |
| placement      | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'right'` | `'top'`   |  ✓  |   ✓   | 位置                     |
| trigger        | `'hover' \| 'click' \| 'focus' \| 'manual'`                                                    | `'hover'` |  ✓  |   ✓   | 触发方式                 |
| disabled       | `boolean`                                                                                       | `false`   |  ✓  |   ✓   | 禁用                     |
| offset         | `number`                                                                                        | `8`       |  ✓  |   ✓   | 偏移距离 (px)            |
| className      | `string`                                                                                        | -         |  ✓  |   ✓   | 自定义 class             |

### Slots (Vue) / Children (React)

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 触发元素    |
| `content` | `content`  | 自定义内容  |

### Events

| Vue Event        | React Prop        | Description  |
| ---------------- | ----------------- | ------------ |
| `update:visible` | `onVisibleChange` | 显示状态变化 |
| `visible-change` | `onVisibleChange` | 显示状态变化 |

---

## Loading 加载

### Props

| Prop        | Type                                                                  | Default                    | Vue | React | Description                          |
| ----------- | --------------------------------------------------------------------- | -------------------------- | :-: | :---: | ------------------------------------ |
| variant     | `'spinner' \| 'dots' \| 'bars' \| 'ring' \| 'pulse'`               | `'spinner'`                |  ✓  |   ✓   | 动画样式                             |
| size        | `'sm' \| 'md' \| 'lg' \| 'xl'`                                     | `'md'`                     |  ✓  |   ✓   | 尺寸                                 |
| color       | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'default'` | `'primary'` |  ✓  |   ✓   | 颜色变体                             |
| text        | `string`                                                              | -                          |  ✓  |   ✓   | 加载文案                             |
| fullscreen  | `boolean`                                                             | `false`                    |  ✓  |   ✓   | 全屏遮罩模式                         |
| delay       | `number`                                                              | `0`                        |  ✓  |   ✓   | 延迟显示 (ms)，避免闪烁              |
| background  | `string`                                                              | `'rgba(255,255,255,0.9)'`  |  ✓  |   ✓   | 全屏模式背景色                       |
| customColor | `string`                                                              | -                          |  ✓  |   ✓   | 自定义颜色（覆盖 color）             |
| className   | `string`                                                              | -                          |  ✓  |   ✓   | 自定义类名                           |

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

> **See also**: [Vue examples](../vue/feedback.md) · [React examples](../react/feedback.md)
