---
name: tigercat-shared-props-composite
description: Shared props definitions for composite components - ChatWindow
---

# Composite Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

---

## ChatWindow 聊天窗口

### Props

| Prop            | Type                                             | Default      | Vue | React | Description                         |
| --------------- | ------------------------------------------------ | ------------ | :-: | :---: | ----------------------------------- |
| messages        | `ChatMessage[]`                                  | `[]`         |  ✓  |   ✓   | 消息列表                            |
| modelValue      | `string`                                         | -            |  ✓  |   -   | 输入内容（v-model）                 |
| value           | `string`                                         | -            |  -  |   ✓   | 输入内容（受控）                    |
| defaultValue    | `string`                                         | `''`         |  ✓  |   ✓   | 输入默认值（非受控）                |
| placeholder     | `string`                                         | `'请输入消息'` |  ✓  |   ✓   | 输入占位                           |
| disabled        | `boolean`                                        | `false`      |  ✓  |   ✓   | 输入区禁用                          |
| maxLength       | `number`                                         | -            |  ✓  |   ✓   | 最大字数                            |
| emptyText       | `string`                                         | `'暂无消息'` |  ✓  |   ✓   | 空态文案                            |
| sendText        | `string`                                         | `'发送'`     |  ✓  |   ✓   | 发送按钮文案                        |
| statusText      | `string`                                         | -            |  ✓  |   ✓   | 状态区文案                          |
| statusVariant   | `BadgeVariant`                                   | `'info'`     |  ✓  |   ✓   | 状态区 Badge 颜色                  |
| showAvatar      | `boolean`                                        | `true`       |  ✓  |   ✓   | 显示头像                            |
| showName        | `boolean`                                        | `true`       |  ✓  |   ✓   | 显示名称                            |
| showTime        | `boolean`                                        | `false`      |  ✓  |   ✓   | 显示时间                            |
| inputType       | `'input' \| 'textarea'`                         | `'textarea'` |  ✓  |   ✓   | 输入组件类型                        |
| inputRows       | `number`                                         | `3`          |  ✓  |   ✓   | Textarea 行数                       |
| sendOnEnter     | `boolean`                                        | `true`       |  ✓  |   ✓   | Enter 快捷发送                      |
| allowShiftEnter | `boolean`                                        | `true`       |  ✓  |   ✓   | Shift+Enter 换行                    |
| allowEmpty      | `boolean`                                        | `false`      |  ✓  |   ✓   | 允许发送空内容                      |
| clearOnSend     | `boolean`                                        | `true`       |  ✓  |   ✓   | 发送后清空输入                      |

### Events

| Vue Event             | React Callback | Payload     | Description |
| --------------------- | -------------- | ----------- | ----------- |
| `@update:modelValue`  | `onChange`     | `string`    | 输入变更    |
| `@input`              | `onChange`     | `string`    | 输入变更    |
| `@change`             | `onChange`     | `string`    | 输入变更    |
| `@send`               | `onSend`       | `string`    | 发送消息    |

### Slots / Render Props

| Vue Slot                         | React Prop     | Description        |
| -------------------------------- | -------------- | ------------------ |
| `message` (scoped: `{ message, index }`) | `renderMessage` | 自定义消息气泡内容 |

### ChatMessage

| Prop        | Type                                 | Default | Description            |
| ----------- | ------------------------------------ | ------- | ---------------------- |
| id          | `string \| number`                  | -       | 消息唯一标识           |
| content     | `string \| number`                  | -       | 消息内容               |
| direction   | `'self' \| 'other'`                 | `'other'` | 消息方向             |
| user        | `ChatUser`                           | -       | 发送者                 |
| time        | `string \| number \| Date`         | -       | 时间                   |
| status      | `'sending' \| 'sent' \| 'failed'`  | -       | 发送状态               |
| statusText  | `string`                             | -       | 自定义状态文案         |
| meta        | `Record<string, unknown>`            | -       | 扩展数据               |

### ChatUser

| Prop    | Type                 | Default | Description |
| ------- | -------------------- | ------- | ----------- |
| id      | `string \| number`  | -       | 用户标识    |
| name    | `string`             | -       | 显示名称    |
| avatar  | `string`             | -       | 头像地址    |
