---
name: tigercat-shared-props-basic
description: Shared props definitions for basic components - Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Code, ConfigProvider, Empty, Icon, Image, ImageCropper, ImageGroup, ImagePreview, ImageViewer, Link, QRCode, Rate, Result, Segmented, Statistic, Tag, Text, Watermark
---

<!-- LLM-INDEX
type: props-reference
category: basic
components: 24
key-apis: variant, size, disabled, loading, closable, open, preview, copyable, className
-->

# Basic Components - Props Reference

共享 Props 定义。Vue/React 默认双端支持，差异仅在 Type 或 Description 中标注。

---

## Button 按钮

### Props

| Prop         | Type                                                         | Default     | Description                 |
| ------------ | ------------------------------------------------------------ | ----------- | --------------------------- |
| variant      | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | 按钮样式                    |
| size         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                       | `'md'`      | 按钮尺寸                    |
| disabled     | `boolean`                                                    | `false`     | 禁用状态                    |
| loading      | `boolean`                                                    | `false`     | 加载状态                    |
| block        | `boolean`                                                    | `false`     | 块级按钮                    |
| danger       | `boolean`                                                    | `false`     | 危险按钮（红色）            |
| htmlType     | `'button' \| 'submit' \| 'reset'`                            | `'button'`  | 原生 type 属性              |
| iconPosition | `'left' \| 'right'`                                          | `'left'`    | 图标位置                    |
| loadingIcon  | `ReactNode`                                                  | -           | 自定义加载图标 (React only) |
| className    | `string`                                                     | -           | 自定义类名 (React only)     |

> **Breaking**: `type` 已重命名为 `htmlType`（迁移摘要见 [CHANGELOG.md](../../../../../CHANGELOG.md)）

---

## ButtonGroup 按钮组

组合多个 Button，统一传递 `size`。

### Props

| Prop     | Type                                   | Default | Description    |
| -------- | -------------------------------------- | ------- | -------------- |
| size     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | -       | 统一尺寸       |
| vertical | `boolean`                              | `false` | 垂直排列按钮组 |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | Button 列表 |

---

## Alert 警告提示

### Props

| Prop           | Type                                          | Default         | Description                          |
| -------------- | --------------------------------------------- | --------------- | ------------------------------------ |
| type           | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'`        | 类型                                 |
| size           | `'sm' \| 'md' \| 'lg'`                        | `'md'`          | 尺寸                                 |
| title          | `string`                                      | -               | 标题                                 |
| description    | `string`                                      | -               | 描述内容                             |
| showIcon       | `boolean`                                     | `true`          | 是否显示图标                         |
| closable       | `boolean`                                     | `false`         | 可关闭                               |
| duration       | `number`                                      | -               | 自动关闭延时（ms，需 closable=true） |
| closeAriaLabel | `string`                                      | `'Close alert'` | 关闭按钮无障碍标签                   |
| className      | `string`                                      | -               | 自定义类名                           |
| banner         | `boolean`                                     | `false`         | 全宽横幅模式（页面顶部提示）         |
| showCountdown  | `boolean`                                     | `false`         | 显示自动关闭倒计时进度条             |

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

| Prop      | Type                                 | Default    | Description                          |
| --------- | ------------------------------------ | ---------- | ------------------------------------ |
| src       | `string`                             | -          | 图片地址                             |
| alt       | `string`                             | `''`       | 图片替代文字                         |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'`       | `'md'`     | 尺寸                                 |
| shape     | `'circle' \| 'square' \| 'squircle'` | `'circle'` | 形状                                 |
| text      | `string`                             | -          | 文字（无图片时显示首字母缩写）       |
| bgColor   | `string`                             | 主题变量   | 文字/图标头像背景色（Tailwind 类名） |
| textColor | `string`                             | 主题变量   | 文字/图标头像文字色（Tailwind 类名） |
| className | `string`                             | -          | 自定义类名                           |

### Slots / Children

| Vue Slot  | React Prop | Description                    |
| --------- | ---------- | ------------------------------ |
| `default` | `children` | 图标内容（无图片和文字时显示） |

---

## AvatarGroup 头像组

### Props

| Prop      | Type                           | Default | Description                 |
| --------- | ------------------------------ | ------- | --------------------------- |
| max       | `number`                       | -       | 最大显示数，溢出显示 "+N"   |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | 统一尺寸（级联到子 Avatar） |
| className | `string`                       | -       | 自定义类名                  |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | Avatar 列表 |

---

## Badge 徽标

### Props

| Prop       | Type                                                                     | Default       | Description                                   |
| ---------- | ------------------------------------------------------------------------ | ------------- | --------------------------------------------- |
| variant    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'`    | 颜色变体                                      |
| size       | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`        | 尺寸                                          |
| type       | `'dot' \| 'number' \| 'text'`                                            | `'number'`    | 显示类型（小红点 / 数字 / 文本）              |
| content    | `number \| string`                                                       | -             | 显示内容（type='dot' 时忽略）                 |
| max        | `number`                                                                 | `99`          | 最大值，超过显示 `{max}+`（仅 type='number'） |
| showZero   | `boolean`                                                                | `false`       | 是否显示零值                                  |
| position   | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'`           | `'top-right'` | 非独立模式下的位置                            |
| standalone | `boolean`                                                                | `true`        | 独立模式（true）或包裹子元素模式（false）     |
| className  | `string`                                                                 | -             | 自定义类名                                    |

### Slots / Children

| Vue Slot  | React Prop | Description                           |
| --------- | ---------- | ------------------------------------- |
| `default` | `children` | 包裹的内容（standalone=false 时有效） |

---

## Tag 标签

### Props

| Prop           | Type                                                                     | Default       | Description                            |
| -------------- | ------------------------------------------------------------------------ | ------------- | -------------------------------------- |
| variant        | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'`   | 变体样式                               |
| size           | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`        | 尺寸                                   |
| closable       | `boolean`                                                                | `false`       | 可关闭                                 |
| closeAriaLabel | `string`                                                                 | `'Close tag'` | 关闭按钮的 aria-label（无障碍/多语言） |

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

| Prop      | Type                           | Default        | Description                                      |
| --------- | ------------------------------ | -------------- | ------------------------------------------------ |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         | 尺寸                                             |
| color     | `string`                       | `currentColor` | 颜色（CSS color 值）                             |
| className | `string`                       | -              | 自定义类名（Vue 使用 `class` attr） (React only) |

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

| Prop        | Type                                                                                                        | Default     | Description      |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ----------- | ---------------- |
| tag         | `'p'` \| `'span'` \| `'div'` \| `'h1'`–`'h6'` \| `'label'` \| `'strong'` \| `'em'` \| `'small'`             | `'p'`       | 渲染的 HTML 标签 |
| size        | `'xs'` \| `'sm'` \| `'base'` \| `'lg'` \| `'xl'` \| `'2xl'`–`'6xl'`                                         | `'base'`    | 字号             |
| weight      | `'thin'` \| `'light'` \| `'normal'` \| `'medium'` \| `'semibold'` \| `'bold'` \| `'extrabold'` \| `'black'` | `'normal'`  | 字重             |
| align       | `'left'` \| `'center'` \| `'right'` \| `'justify'`                                                          | -           | 文本对齐         |
| color       | `'default'` \| `'primary'` \| `'secondary'` \| `'success'` \| `'warning'` \| `'danger'` \| `'muted'`        | `'default'` | 颜色             |
| truncate    | `boolean`                                                                                                   | `false`     | 文本溢出省略     |
| italic      | `boolean`                                                                                                   | `false`     | 斜体             |
| underline   | `boolean`                                                                                                   | `false`     | 下划线           |
| lineThrough | `boolean`                                                                                                   | `false`     | 删除线           |

### Slots / Children

| Vue Slot  | React Prop | Description |
| --------- | ---------- | ----------- |
| `default` | `children` | 文本内容    |

---

## Code 代码

### Props

| Prop        | Type      | Default    | Description        |
| ----------- | --------- | ---------- | ------------------ |
| code        | `string`  | -          | 代码内容（必填）   |
| copyable    | `boolean` | `true`     | 显示复制按钮       |
| copyLabel   | `string`  | `'复制'`   | 复制按钮文案       |
| copiedLabel | `string`  | `'已复制'` | 复制成功后按钮文案 |

### Events

| Vue Event | React Callback | Payload  | Description            |
| --------- | -------------- | -------- | ---------------------- |
| `@copy`   | `onCopy`       | `string` | 复制成功，返回代码文本 |

---

## Link 链接

### Props

| Prop      | Type                                         | Default     | Description                                               |
| --------- | -------------------------------------------- | ----------- | --------------------------------------------------------- |
| href      | `string`                                     | -           | 链接地址                                                  |
| variant   | `'primary' \| 'secondary' \| 'default'`      | `'primary'` | 颜色变体                                                  |
| size      | `'sm' \| 'md' \| 'lg'`                       | `'md'`      | 尺寸                                                      |
| disabled  | `boolean`                                    | `false`     | 禁用（移除 href、tabindex=-1、aria-disabled）             |
| underline | `boolean`                                    | `true`      | 悬停下划线                                                |
| target    | `'_blank' \| '_self' \| '_parent' \| '_top'` | -           | 打开方式                                                  |
| rel       | `string`                                     | -           | rel 属性（target="\_blank" 时自动补 noopener noreferrer） |

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

> Props 定义见 [layout.md](layout.md#divider-分割线)

---

## Image 图片

### Props

| Prop        | Type                                                       | Default   | Description             |
| ----------- | ---------------------------------------------------------- | --------- | ----------------------- |
| src         | `string`                                                   | -         | 图片地址                |
| alt         | `string`                                                   | `''`      | 替代文本                |
| fit         | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | 适配模式                |
| width       | `string \| number`                                         | -         | 宽度                    |
| height      | `string \| number`                                         | -         | 高度                    |
| lazy        | `boolean`                                                  | `false`   | 懒加载                  |
| preview     | `boolean`                                                  | `true`    | 点击预览                |
| fallbackSrc | `string`                                                   | -         | 加载失败时的回退图片    |
| className   | `string`                                                   | -         | 自定义类名 (React only) |

### Events

| Vue Event              | React Callback        | Payload   | Description    |
| ---------------------- | --------------------- | --------- | -------------- |
| `@load`                | `onLoad`              | `Event`   | 加载完成       |
| `@error`               | `onError`             | `Event`   | 加载失败       |
| `@preview-open-change` | `onPreviewOpenChange` | `boolean` | 预览可见性变化 |

### Slots / Children

| Vue Slot      | React Prop          | Description    |
| ------------- | ------------------- | -------------- |
| `error`       | `errorRender`       | 自定义错误占位 |
| `placeholder` | `placeholderRender` | 自定义加载占位 |

---

## ImagePreview 图片预览

### Props

| Prop         | Type       | Default | Description  |
| ------------ | ---------- | ------- | ------------ |
| open         | `boolean`  | `false` | 是否可见     |
| images       | `string[]` | -       | 预览图片列表 |
| currentIndex | `number`   | `0`     | 当前显示索引 |
| zIndex       | `number`   | `1050`  | 层级         |
| maskClosable | `boolean`  | `true`  | 点击遮罩关闭 |
| scaleStep    | `number`   | `0.5`   | 每次缩放步长 |
| minScale     | `number`   | `0.25`  | 最小缩放倍率 |
| maxScale     | `number`   | `5`     | 最大缩放倍率 |

### Events

| Vue Event              | React Callback         | Payload   | Description  |
| ---------------------- | ---------------------- | --------- | ------------ |
| `@update:open`         | `onOpenChange`         | `boolean` | 可见性变化   |
| `@update:currentIndex` | `onCurrentIndexChange` | `number`  | 当前索引变化 |
| `@scale-change`        | `onScaleChange`        | `number`  | 缩放倍率变化 |

---

## ImageGroup 图片组

### Props

| Prop      | Type      | Default | Description             |
| --------- | --------- | ------- | ----------------------- |
| preview   | `boolean` | `true`  | 是否启用点击预览        |
| className | `string`  | -       | 自定义类名 (React only) |

### Events

| Vue Event                 | React Callback           | Payload   | Description    |
| ------------------------- | ------------------------ | --------- | -------------- |
| `@preview-visible-change` | `onPreviewVisibleChange` | `boolean` | 预览可见性变化 |

> **注意**：ImageGroup 的 `preview-visible-change` / `onPreviewVisibleChange` 尚未提供新 API 替代，后续将对齐 Image 的命名迁移到 `preview-open-change` / `onPreviewOpenChange`。

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

| Prop        | Type      | Default       | Description             |
| ----------- | --------- | ------------- | ----------------------- |
| src         | `string`  | -             | 原始图片地址            |
| aspectRatio | `number`  | -             | 裁剪框宽高比            |
| outputType  | `string`  | `'image/png'` | 输出 MIME 类型          |
| quality     | `number`  | `0.92`        | 输出质量（0-1）         |
| guides      | `boolean` | `true`        | 显示辅助线              |
| minWidth    | `number`  | `20`          | 最小裁剪宽度（px）      |
| minHeight   | `number`  | `20`          | 最小裁剪高度（px）      |
| className   | `string`  | -             | 自定义类名 (React only) |

### Events

| Vue Event      | React Callback | Payload    | Description  |
| -------------- | -------------- | ---------- | ------------ |
| `@crop-change` | `onCropChange` | `CropRect` | 裁剪区域变化 |
| `@ready`       | `onReady`      | -          | 图片加载完成 |

### Exposed / Ref

| Method / React Ref | Return                | Description                    |
| ------------------ | --------------------- | ------------------------------ |
| `getCropResult()`  | `Promise<CropResult>` | 获取裁剪结果（blob + dataURL） |

---

## Empty 空状态

### Props

| Prop        | Type                                                            | Default     | Description             |
| ----------- | --------------------------------------------------------------- | ----------- | ----------------------- |
| preset      | `'default' \| 'simple' \| 'no-data' \| 'no-results' \| 'error'` | `'default'` | 预设空状态类型          |
| description | `string`                                                        | -           | 描述文字                |
| showImage   | `boolean`                                                       | `true`      | 是否显示空状态图片      |
| className   | `string`                                                        | -           | 自定义类名 (React only) |

### Slots / Children

| Vue Slot      | React Prop | Description    |
| ------------- | ---------- | -------------- |
| `default`     | `children` | 底部额外操作区 |
| `image`       | `image`    | 自定义图片内容 |
| `description` | -          | 自定义描述内容 |
| `extra`       | `extra`    | 底部额外内容   |

---

## QRCode 二维码

### Props

| Prop      | Type                                 | Default     | Description             |
| --------- | ------------------------------------ | ----------- | ----------------------- |
| value     | `string`                             | required    | 二维码内容              |
| size      | `number`                             | `128`       | 尺寸（px）              |
| color     | `string`                             | `'#000000'` | 前景色                  |
| bgColor   | `string`                             | `'#ffffff'` | 背景色                  |
| level     | `'L' \| 'M' \| 'Q' \| 'H'`           | `'M'`       | 纠错等级                |
| status    | `'active' \| 'expired' \| 'loading'` | `'active'`  | 二维码状态              |
| className | `string`                             | -           | 自定义类名 (React only) |

### Events

| Vue Event  | React Callback | Payload | Description            |
| ---------- | -------------- | ------- | ---------------------- |
| `@refresh` | `onRefresh`    | -       | 点击刷新按钮（过期态） |

---

## Result 结果页

### Props

| Prop      | Type                                                                     | Default  | Description             |
| --------- | ------------------------------------------------------------------------ | -------- | ----------------------- |
| status    | `'success' \| 'error' \| 'warning' \| 'info' \| '404' \| '403' \| '500'` | `'info'` | 结果状态                |
| title     | `string`                                                                 | -        | 标题                    |
| subTitle  | `string`                                                                 | -        | 副标题                  |
| className | `string`                                                                 | -        | 自定义类名 (React only) |

### Slots / Children

| Vue Slot   | React Prop | Description      |
| ---------- | ---------- | ---------------- |
| `icon`     | `icon`     | 自定义图标       |
| `title`    | -          | 自定义标题内容   |
| `subTitle` | -          | 自定义副标题内容 |
| `extra`    | `extra`    | 额外操作区       |
| `default`  | `children` | 默认内容         |

---

## Statistic 统计数值

### Props

| Prop              | Type                   | Default | Description             |
| ----------------- | ---------------------- | ------- | ----------------------- |
| title             | `string`               | -       | 标题                    |
| value             | `string \| number`     | -       | 数值                    |
| precision         | `number`               | -       | 小数精度                |
| prefix            | `string`               | -       | 前缀                    |
| suffix            | `string`               | -       | 后缀                    |
| groupSeparator    | `boolean`              | `false` | 千分位分隔符            |
| animated          | `boolean`              | `false` | 数值动画                |
| animationDuration | `number`               | -       | 动画时长（ms）          |
| size              | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                    |
| className         | `string`               | -       | 自定义类名 (React only) |

---

## Rate 评分

### Props

| Prop       | Type                   | Default | Description             |
| ---------- | ---------------------- | ------- | ----------------------- |
| count      | `number`               | `5`     | 星星总数                |
| allowHalf  | `boolean`              | `false` | 允许半选                |
| disabled   | `boolean`              | `false` | 禁用状态                |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                    |
| allowClear | `boolean`              | `true`  | 允许再次点击清除        |
| character  | `string`               | -       | 自定义字符（替代星星）  |
| className  | `string`               | -       | 自定义类名 (React only) |

### Events

| Vue Event       | React Callback  | Payload  | Description |
| --------------- | --------------- | -------- | ----------- |
| `@change`       | `onChange`      | `number` | 选中值变化  |
| `@hover-change` | `onHoverChange` | `number` | 悬停值变化  |

> **Vue**: 支持 `v-model` 双向绑定（`modelValue` / `@update:modelValue`）

---

## Segmented 分段控制

### Props

| Prop      | Type                   | Default | Description             |
| --------- | ---------------------- | ------- | ----------------------- |
| options   | `SegmentedOption[]`    | `[]`    | 选项列表                |
| disabled  | `boolean`              | `false` | 禁用状态                |
| size      | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸                    |
| block     | `boolean`              | `false` | 撑满容器                |
| className | `string`               | -       | 自定义类名 (React only) |

### SegmentedOption

| Field    | Type               | Description |
| -------- | ------------------ | ----------- |
| value    | `string \| number` | 选项值      |
| label    | `string`           | 显示文本    |
| disabled | `boolean`          | 是否禁用    |
| icon     | `string`           | 图标        |

### Events

| Vue Event | React Callback | Payload            | Description |
| --------- | -------------- | ------------------ | ----------- |
| `@change` | `onChange`     | `string \| number` | 选中值变化  |

> **Vue**: 支持 `v-model` 双向绑定（`modelValue` / `@update:modelValue`）

---

## Watermark 水印

### Props

| Prop      | Type                 | Default | Description             |
| --------- | -------------------- | ------- | ----------------------- |
| content   | `string \| string[]` | -       | 水印文字（多行传数组）  |
| image     | `string`             | -       | 水印图片地址            |
| width     | `number`             | `120`   | 水印宽度                |
| height    | `number`             | `64`    | 水印高度                |
| rotate    | `number`             | `-22`   | 旋转角度                |
| zIndex    | `number`             | `9`     | 层级                    |
| gapX      | `number`             | `100`   | 水平间距                |
| gapY      | `number`             | `100`   | 垂直间距                |
| offsetX   | `number`             | `0`     | 水平偏移                |
| offsetY   | `number`             | `0`     | 垂直偏移                |
| font      | `WatermarkFont`      | -       | 字体配置                |
| className | `string`             | -       | 自定义类名 (React only) |

### WatermarkFont

| Field      | Type                                        | Default              | Description |
| ---------- | ------------------------------------------- | -------------------- | ----------- |
| fontSize   | `number`                                    | `16`                 | 字号        |
| fontFamily | `string`                                    | `'sans-serif'`       | 字体        |
| fontWeight | `'normal' \| 'bold' \| 'lighter' \| number` | `'normal'`           | 字重        |
| color      | `string`                                    | `'rgba(0,0,0,0.15)'` | 颜色        |

### Slots / Children

| Vue Slot  | React Prop | Description      |
| --------- | ---------- | ---------------- |
| `default` | `children` | 被水印覆盖的内容 |

---

## ImageViewer 图片查看器

独立的全屏图片查看器组件，支持缩放、旋转、多图导航。

### Props

| Prop         | Type       | Default | Description             |
| ------------ | ---------- | ------- | ----------------------- |
| images       | `string[]` | -       | 图片列表                |
| open         | `boolean`  | `false` | 是否显示                |
| currentIndex | `number`   | `0`     | 当前图片索引            |
| zoomable     | `boolean`  | `true`  | 是否可缩放              |
| rotatable    | `boolean`  | `true`  | 是否可旋转              |
| showNav      | `boolean`  | `true`  | 显示导航箭头            |
| showCounter  | `boolean`  | `true`  | 显示图片计数器          |
| maskClosable | `boolean`  | `true`  | 点击遮罩关闭            |
| minZoom      | `number`   | `0.5`   | 最小缩放倍率            |
| maxZoom      | `number`   | `3`     | 最大缩放倍率            |
| className    | `string`   | -       | 自定义类名 (React only) |

### Events

| Vue Event              | React Callback  | Payload   | Description  |
| ---------------------- | --------------- | --------- | ------------ |
| `@update:open`         | `onOpenChange`  | `boolean` | 可见性变化   |
| `@update:currentIndex` | `onIndexChange` | `number`  | 当前索引变化 |
| `@close`               | `onClose`       | -         | 关闭事件     |

> **Vue**: 支持 `v-model:open` 和 `v-model:currentIndex` 双向绑定

---

## ConfigProvider 全局配置

为子组件树注入国际化、主题和颜色方案等全局配置。

### Props

| Prop        | Type                                                       | Default | Description                    |
| ----------- | ---------------------------------------------------------- | ------- | ------------------------------ |
| locale      | `Partial<TigerLocale> \| PromiseLike \| () => PromiseLike` | -       | 国际化配置（同步/异步/懒加载） |
| theme       | `string`                                                   | -       | 主题名称                       |
| colorScheme | `'light' \| 'dark' \| 'auto'`                              | -       | 颜色方案                       |

### 注入值 (TigerConfig)

| 字段          | Type                   | Description        |
| ------------- | ---------------------- | ------------------ |
| locale        | `Partial<TigerLocale>` | 解析后的国际化对象 |
| localeLoading | `boolean`              | 异步 locale 加载中 |
| theme         | `string`               | 当前主题名称       |
| colorScheme   | `ColorScheme`          | 当前颜色方案       |

### 消费方式

- **Vue**: `inject(TigerConfigKey)` 获取 `ComputedRef<TigerConfig>`
- **React**: `useTigerConfig()` hook 获取 `TigerConfig`

> 详见 [i18n.md](../../i18n.md) 和 [theme.md](../../theme.md)

---

> **See also**: [Vue examples](../../vue/basic.md) · [React examples](../../react/basic.md)
