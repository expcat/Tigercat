---
name: tigercat-shared-props-basic
description: Shared props definitions for basic components - Alert, Avatar, Badge, Button, Code, Divider, Icon, Image, ImagePreview, ImageGroup, ImageCropper, Link, Tag, Text
---

# Basic Components - Props Reference

共享 Props 定义，框架差异在表格中标注。

---

## Button 按钮

### Props

| Prop        | Type                                                         | Default     | Vue | React | Description    |
| ----------- | ------------------------------------------------------------ | ----------- | :-: | :---: | -------------- |
| variant     | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` |  ✓  |   ✓   | 按钮样式       |
| size        | `'sm' \| 'md' \| 'lg'`                                       | `'md'`      |  ✓  |   ✓   | 按钮尺寸       |
| disabled    | `boolean`                                                    | `false`     |  ✓  |   ✓   | 禁用状态       |
| loading     | `boolean`                                                    | `false`     |  ✓  |   ✓   | 加载状态       |
| block       | `boolean`                                                    | `false`     |  ✓  |   ✓   | 块级按钮       |
| type        | `'button' \| 'submit' \| 'reset'`                            | `'button'`  |  ✓  |   ✓   | 原生类型       |
| loadingIcon | `ReactNode`                                                  | -           |  -  |   ✓   | 自定义加载图标 |
| className   | `string`                                                     | -           |  -  |   ✓   | 自定义类名     |

### Events

| Vue Event | React Callback | Payload      | Description |
| --------- | -------------- | ------------ | ----------- |
| `@click`  | `onClick`      | `MouseEvent` | 点击事件    |

### Slots / Children

| Vue Slot       | React Prop    | Description    |
| -------------- | ------------- | -------------- |
| `default`      | `children`    | 按钮内容       |
| `loading-icon` | `loadingIcon` | 自定义加载图标 |

---

## Alert 警告提示

### Props

| Prop           | Type                                          | Default         | Vue | React | Description        |
| -------------- | --------------------------------------------- | --------------- | :-: | :---: | ------------------ |
| type           | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'`        |  ✓  |   ✓   | 类型               |
| size           | `'sm' \| 'md' \| 'lg'`                        | `'md'`          |  ✓  |   ✓   | 尺寸               |
| title          | `string`                                      | -               |  ✓  |   ✓   | 标题               |
| description    | `string`                                      | -               |  ✓  |   ✓   | 描述内容           |
| showIcon       | `boolean`                                     | `true`          |  ✓  |   ✓   | 是否显示图标       |
| closable       | `boolean`                                     | `false`         |  ✓  |   ✓   | 可关闭             |
| closeAriaLabel | `string`                                      | `'Close alert'` |  ✓  |   ✓   | 关闭按钮无障碍标签 |
| className      | `string`                                      | -               |  ✓  |   ✓   | 自定义类名         |

### Events

| Vue Event | React Callback | Payload      | Description                              |
| --------- | -------------- | ------------ | ---------------------------------------- |
| `@close`  | `onClose`      | `MouseEvent` | 关闭事件（可 `preventDefault` 阻止隐藏） |

### Slots / Children

| Vue Slot      | React Prop        | Description                             |
| ------------- | ----------------- | --------------------------------------- |
| `default`     | `children`        | 默认内容（无 title/description 时生效） |
| `title`       | `titleSlot`       | 自定义标题内容（覆盖 title prop）       |
| `description` | `descriptionSlot` | 自定义描述内容（覆盖 description prop） |

---

## Avatar 头像

### Props

| Prop      | Type                           | Default    | Vue | React | Description                          |
| --------- | ------------------------------ | ---------- | :-: | :---: | ------------------------------------ |
| src       | `string`                       | -          |  ✓  |   ✓   | 图片地址                             |
| alt       | `string`                       | `''`       |  ✓  |   ✓   | 图片替代文字                         |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     |  ✓  |   ✓   | 尺寸                                 |
| shape     | `'circle' \| 'square'`         | `'circle'` |  ✓  |   ✓   | 形状                                 |
| text      | `string`                       | -          |  ✓  |   ✓   | 文字（无图片时显示首字母缩写）       |
| bgColor   | `string`                       | 主题变量   |  ✓  |   ✓   | 文字/图标头像背景色（Tailwind 类名） |
| textColor | `string`                       | 主题变量   |  ✓  |   ✓   | 文字/图标头像文字色（Tailwind 类名） |
| className | `string`                       | -          |  ✓  |   ✓   | 自定义类名                           |

### Slots / Children

| Vue Slot  | React Prop | Description                    |
| --------- | ---------- | ------------------------------ |
| `default` | `children` | 图标内容（无图片和文字时显示） |

---

## Badge 徽标

### Props

| Prop       | Type                                                                     | Default       | Vue | React | Description                                   |
| ---------- | ------------------------------------------------------------------------ | ------------- | :-: | :---: | --------------------------------------------- |
| variant    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'`    |  ✓  |   ✓   | 颜色变体                                      |
| size       | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`        |  ✓  |   ✓   | 尺寸                                          |
| type       | `'dot' \| 'number' \| 'text'`                                            | `'number'`    |  ✓  |   ✓   | 显示类型（小红点 / 数字 / 文本）              |
| content    | `number \| string`                                                       | -             |  ✓  |   ✓   | 显示内容（type='dot' 时忽略）                 |
| max        | `number`                                                                 | `99`          |  ✓  |   ✓   | 最大值，超过显示 `{max}+`（仅 type='number'） |
| showZero   | `boolean`                                                                | `false`       |  ✓  |   ✓   | 是否显示零值                                  |
| position   | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'`           | `'top-right'` |  ✓  |   ✓   | 非独立模式下的位置                            |
| standalone | `boolean`                                                                | `true`        |  ✓  |   ✓   | 独立模式（true）或包裹子元素模式（false）     |
| className  | `string`                                                                 | -             |  ✓  |   ✓   | 自定义类名                                    |

### Slots / Children

| Vue Slot  | React Prop | Description                           |
| --------- | ---------- | ------------------------------------- |
| `default` | `children` | 包裹的内容（standalone=false 时有效） |

---

## Tag 标签

### Props

| Prop           | Type                                                                     | Default       | Vue | React | Description                            |
| -------------- | ------------------------------------------------------------------------ | ------------- | :-: | :---: | -------------------------------------- |
| variant        | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'`   |  ✓  |   ✓   | 变体样式                               |
| size           | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`        |  ✓  |   ✓   | 尺寸                                   |
| closable       | `boolean`                                                                | `false`       |  ✓  |   ✓   | 可关闭                                 |
| closeAriaLabel | `string`                                                                 | `'Close tag'` |  ✓  |   ✓   | 关闭按钮的 aria-label（无障碍/多语言） |

### Events

| Vue Event | React Callback | Payload      | Description                                  |
| --------- | -------------- | ------------ | -------------------------------------------- |
| `@close`  | `onClose`      | `MouseEvent` | 关闭事件；调用 `preventDefault()` 可阻止关闭 |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 标签内容    |

---

## Icon 图标

### Props

| Prop      | Type                           | Default        | Vue | React | Description                         |
| --------- | ------------------------------ | -------------- | :-: | :---: | ----------------------------------- |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         |  ✓  |   ✓   | 尺寸                                |
| color     | `string`                       | `currentColor` |  ✓  |   ✓   | 颜色（CSS color 值）                |
| className | `string`                       | -              |  ✗  |   ✓   | 自定义类名（Vue 使用 `class` attr） |

### Slots / Children

| Vue Slot  | React Prop | Description       |
| --------- | ---------- | ----------------- |
| `default` | `children` | 传入 SVG 图标内容 |

### Accessibility

- 无 `aria-label` / `aria-labelledby` / `role` 时自动设置 `aria-hidden="true"`（装饰性图标）
- 提供 `aria-label` 或 `aria-labelledby` 时自动添加 `role="img"`
- 支持自定义 `role` 覆盖默认行为

### SVG 默认属性

传入的 `<svg>` 子元素会自动注入以下默认属性（可被显式值覆盖）：

| 属性            | 默认值                       |
| --------------- | ---------------------------- |
| xmlns           | `http://www.w3.org/2000/svg` |
| viewBox         | `0 0 24 24`                  |
| fill            | `none`                       |
| stroke          | `currentColor`               |
| stroke-width    | `2`                          |
| stroke-linecap  | `round`                      |
| stroke-linejoin | `round`                      |

---

## Text 文本

### Props

| Prop        | Type                                                                                                        | Default     | Vue | React | Description      |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ----------- | :-: | :---: | ---------------- |
| tag         | `'p'` \| `'span'` \| `'div'` \| `'h1'`–`'h6'` \| `'label'` \| `'strong'` \| `'em'` \| `'small'`             | `'p'`       |  ✓  |   ✓   | 渲染的 HTML 标签 |
| size        | `'xs'` \| `'sm'` \| `'base'` \| `'lg'` \| `'xl'` \| `'2xl'`–`'6xl'`                                         | `'base'`    |  ✓  |   ✓   | 字号             |
| weight      | `'thin'` \| `'light'` \| `'normal'` \| `'medium'` \| `'semibold'` \| `'bold'` \| `'extrabold'` \| `'black'` | `'normal'`  |  ✓  |   ✓   | 字重             |
| align       | `'left'` \| `'center'` \| `'right'` \| `'justify'`                                                          | -           |  ✓  |   ✓   | 文本对齐         |
| color       | `'default'` \| `'primary'` \| `'secondary'` \| `'success'` \| `'warning'` \| `'danger'` \| `'muted'`        | `'default'` |  ✓  |   ✓   | 颜色             |
| truncate    | `boolean`                                                                                                   | `false`     |  ✓  |   ✓   | 文本溢出省略     |
| italic      | `boolean`                                                                                                   | `false`     |  ✓  |   ✓   | 斜体             |
| underline   | `boolean`                                                                                                   | `false`     |  ✓  |   ✓   | 下划线           |
| lineThrough | `boolean`                                                                                                   | `false`     |  ✓  |   ✓   | 删除线           |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 文本内容    |

---

## Code 代码

### Props

| Prop        | Type      | Default    | Vue | React | Description        |
| ----------- | --------- | ---------- | :-: | :---: | ------------------ |
| code        | `string`  | -          |  ✓  |   ✓   | 代码内容（必填）   |
| copyable    | `boolean` | `true`     |  ✓  |   ✓   | 显示复制按钮       |
| copyLabel   | `string`  | `'复制'`   |  ✓  |   ✓   | 复制按钮文案       |
| copiedLabel | `string`  | `'已复制'` |  ✓  |   ✓   | 复制成功后按钮文案 |

### Events

| Vue Event | React Callback | Payload  | Description            |
| --------- | -------------- | -------- | ---------------------- |
| `@copy`   | `onCopy`       | `string` | 复制成功，返回代码文本 |

---

## Link 链接

### Props

| Prop      | Type                                         | Default     | Vue | React | Description                                               |
| --------- | -------------------------------------------- | ----------- | :-: | :---: | --------------------------------------------------------- |
| href      | `string`                                     | -           |  ✓  |   ✓   | 链接地址                                                  |
| variant   | `'primary' \| 'secondary' \| 'default'`      | `'primary'` |  ✓  |   ✓   | 颜色变体                                                  |
| size      | `'sm' \| 'md' \| 'lg'`                       | `'md'`      |  ✓  |   ✓   | 尺寸                                                      |
| disabled  | `boolean`                                    | `false`     |  ✓  |   ✓   | 禁用（移除 href、tabindex=-1、aria-disabled）             |
| underline | `boolean`                                    | `true`      |  ✓  |   ✓   | 悬停下划线                                                |
| target    | `'_blank' \| '_self' \| '_parent' \| '_top'` | -           |  ✓  |   ✓   | 打开方式                                                  |
| rel       | `string`                                     | -           |  ✓  |   ✓   | rel 属性（target="\_blank" 时自动补 noopener noreferrer） |

### Events

| Vue Event | React Callback | Payload      | Description |
| --------- | -------------- | ------------ | ----------- |
| `@click`  | `onClick`      | `MouseEvent` | 点击事件    |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 链接内容    |

---

## Divider 分割线

### Props

| Prop      | Type                            | Default        | Vue | React | Description |
| --------- | ------------------------------- | -------------- | :-: | :---: | ----------- |
| direction | `'horizontal' \| 'vertical'`    | `'horizontal'` |  ✓  |   ✓   | 方向        |
| align     | `'left' \| 'center' \| 'right'` | `'center'`     |  ✓  |   ✓   | 文本对齐    |
| text      | `string`                        | -              |  ✓  |   -   | 分割线文本  |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 分割线文本  |

---

---

## Image 图片

### Props

| Prop      | Type                                                       | Default   | Vue | React | Description          |
| --------- | ---------------------------------------------------------- | --------- | :-: | :---: | -------------------- |
| src       | `string`                                                   | -         |  ✓  |   ✓   | 图片地址             |
| alt       | `string`                                                   | `''`      |  ✓  |   ✓   | 替代文本             |
| fit       | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` |  ✓  |   ✓   | 适配模式             |
| width     | `string \| number`                                         | -         |  ✓  |   ✓   | 宽度                 |
| height    | `string \| number`                                         | -         |  ✓  |   ✓   | 高度                 |
| lazy      | `boolean`                                                  | `false`   |  ✓  |   ✓   | 懒加载               |
| preview   | `boolean`                                                  | `false`   |  ✓  |   ✓   | 点击预览             |
| fallback  | `string`                                                   | -         |  ✓  |   ✓   | 加载失败时的回退图片 |
| className | `string`                                                   | -         |  -  |   ✓   | 自定义类名           |

### Events

| Vue Event                 | React Callback           | Payload   | Description    |
| ------------------------- | ------------------------ | --------- | -------------- |
| `@load`                   | `onLoad`                 | `Event`   | 加载完成       |
| `@error`                  | `onError`                | `Event`   | 加载失败       |
| `@preview-visible-change` | `onPreviewVisibleChange` | `boolean` | 预览可见性变化 |

### Slots / Children

| Vue Slot      | React Prop          | Description    |
| ------------- | ------------------- | -------------- |
| `error`       | `errorRender`       | 自定义错误占位 |
| `placeholder` | `placeholderRender` | 自定义加载占位 |

---

## ImagePreview 图片预览

### Props

| Prop         | Type       | Default | Vue | React | Description      |
| ------------ | ---------- | ------- | :-: | :---: | ---------------- |
| visible      | `boolean`  | `false` |  ✓  |   ✓   | 是否可见         |
| src          | `string`   | -       |  ✓  |   ✓   | 单张预览图片地址 |
| srcList      | `string[]` | -       |  ✓  |   ✓   | 多张预览图片列表 |
| currentIndex | `number`   | `0`     |  ✓  |   ✓   | 当前显示索引     |
| maskClosable | `boolean`  | `true`  |  ✓  |   ✓   | 点击遮罩关闭     |
| className    | `string`   | -       |  -  |   ✓   | 自定义类名       |

### Events

| Vue Event              | React Callback         | Payload   | Description  |
| ---------------------- | ---------------------- | --------- | ------------ |
| `@update:visible`      | `onVisibleChange`      | `boolean` | 可见性变化   |
| `@update:currentIndex` | `onCurrentIndexChange` | `number`  | 当前索引变化 |
| `@scale-change`        | `onScaleChange`        | `number`  | 缩放倍率变化 |

---

## ImageGroup 图片组

### Props

| Prop      | Type     | Default | Vue | React | Description |
| --------- | -------- | ------- | :-: | :---: | ----------- |
| className | `string` | -       |  -  |   ✓   | 自定义类名  |

### Behavior

- 子组件 `Image` 自动注册到 Group，点击任一图片进入多图预览。
- 自动管理预览状态、图片列表和当前索引。

### Slots / Children

| Vue Slot  | React Prop | Description  |
| --------- | ---------- | ------------ |
| `default` | `children` | Image 子组件 |

---

## ImageCropper 图片裁剪

### Props

| Prop        | Type      | Default       | Vue | React | Description        |
| ----------- | --------- | ------------- | :-: | :---: | ------------------ |
| src         | `string`  | -             |  ✓  |   ✓   | 原始图片地址       |
| aspectRatio | `number`  | -             |  ✓  |   ✓   | 裁剪框宽高比       |
| outputType  | `string`  | `'image/png'` |  ✓  |   ✓   | 输出 MIME 类型     |
| quality     | `number`  | `0.92`        |  ✓  |   ✓   | 输出质量（0-1）    |
| guides      | `boolean` | `true`        |  ✓  |   ✓   | 显示辅助线         |
| minWidth    | `number`  | `20`          |  ✓  |   ✓   | 最小裁剪宽度（px） |
| minHeight   | `number`  | `20`          |  ✓  |   ✓   | 最小裁剪高度（px） |
| className   | `string`  | -             |  -  |   ✓   | 自定义类名         |

### Events

| Vue Event      | React Callback | Payload    | Description  |
| -------------- | -------------- | ---------- | ------------ |
| `@crop-change` | `onCropChange` | `CropRect` | 裁剪区域变化 |
| `@ready`       | `onReady`      | -          | 图片加载完成 |

### Exposed / Ref

| Method / React Ref | Return                | Description                    |
| ------------------ | --------------------- | ------------------------------ |
| `getCropResult()`  | `Promise<CropResult>` | 获取裁剪结果（blob + dataURL） |

> **See also**: [Vue examples](../vue/basic.md) · [React examples](../react/basic.md)
