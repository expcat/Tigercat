# Tigercat 迁移指南

本文集中记录当前仍需要用户处理的 Breaking change 与推荐迁移路径。完整发布历史见 [CHANGELOG.md](../CHANGELOG.md)。

## v2.0.0

v2.0.0 破坏性升级已进入执行阶段；当前批次已同步版本号、运行时 version、CLI 模板版本与 release readiness 文档入口，将 core / React / Vue 发布面切换为 ESM-only，将 React / Vue component 子路径收敛为 PascalCase 显式 exports，收紧 React / Vue tree-shaking 副作用声明，删除首批 deprecated / compat API 与 legacy token / icon path 兼容层，并将示例与 references 迁移为组件子路径和 lazy import 优先。依赖 CommonJS `require()` 加载 Tigercat 包或 core 子路径的项目需要改用 ESM `import`。

### React / Vue component 子路径改为显式 PascalCase

React / Vue 根入口 named exports 保持可用：

```ts
import { Button } from '@expcat/tigercat-react'
```

但生产应用中推荐组件 value imports 使用 PascalCase 子路径，让 bundler 更容易在路由或交互边界拆包：

```diff
- import { Button, DatePicker } from '@expcat/tigercat-react'
+ import { Button } from '@expcat/tigercat-react/Button'
+ import { DatePicker } from '@expcat/tigercat-react/DatePicker'
```

```diff
- import { Button, DatePicker } from '@expcat/tigercat-vue'
+ import { Button } from '@expcat/tigercat-vue/Button'
+ import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
```

hooks/composables、`Message` / `notification` 命令式 API、共享类型和 core 工具仍可从根入口或 `@expcat/tigercat-core` 导入。

组件子路径现在只声明 PascalCase 入口；如果项目曾借助旧通配 exports 导入非 PascalCase 路径，请改为组件名路径：

```diff
- import { Button } from '@expcat/tigercat-react/button'
+ import { Button } from '@expcat/tigercat-react/Button'
```

### Basic / Layout 轻量组件类型别名合并

core 不再导出等同 shared contracts 的轻量组件类型别名：

- `SpaceDirection` / `SpaceAlign` → `BaseLayoutProps['direction']` / `BaseLayoutProps['align']`
- `CardDirection` → `BaseLayoutProps['direction']`
- `StatisticSize` / `DescriptionsSize` / `ListSize` → `ComponentSize`

```diff
- import type { SpaceDirection, StatisticSize } from '@expcat/tigercat-core'
+ import type { BaseLayoutProps, ComponentSize } from '@expcat/tigercat-core'

- const direction: SpaceDirection = 'horizontal'
- const size: StatisticSize = 'md'
+ const direction: BaseLayoutProps['direction'] = 'horizontal'
+ const size: ComponentSize = 'md'
```

`ButtonSize`、`AvatarSize`、`TextSize` 和 `SkeletonShape` 仍保留，因为它们不是 `ComponentSize` / `BaseLayoutProps` 的简单重复。

### Form primitives 受控模型与尺寸类型收敛

core 不再导出等同 `ComponentSize` 的表单基础组件尺寸别名：

- `InputSize` / `TextareaSize`
- `CheckboxSize` / `RadioSize` / `SwitchSize`
- `SliderSize` / `SegmentedSize` / `StepperSize` / `ColorSwatchSize`

请直接使用 `ComponentSize`：

```diff
- import type { InputSize, SwitchSize } from '@expcat/tigercat-core'
+ import type { ComponentSize } from '@expcat/tigercat-core'

- const size: InputSize = 'md'
+ const size: ComponentSize = 'md'
```

Vue Checkbox、Radio、Switch 的单体受控状态改为默认 `v-model`；`defaultChecked` / `update:checked` / `v-model:checked` 不再保留：

```diff
- <Switch v-model:checked="enabled" />
- <Radio value="agree" v-model:checked="agreed" />
- <Checkbox :default-checked="true" />
+ <Switch v-model="enabled" />
+ <Radio value="agree" v-model="agreed" />
+ <Checkbox :default-value="true" />
```

Vue RadioGroup 也从 `v-model:value` 收敛为默认 `v-model`。`Radio` 的 `value` 仍表示选项值，不表示单体 checked 状态：

```diff
- <RadioGroup v-model:value="choice">
+ <RadioGroup v-model="choice">
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
  </RadioGroup>
```

React Checkbox、Radio、Switch 保持 React 惯用的 `checked` / `defaultChecked` / `onChange`。

### Carousel 索引改为受控模型

`Carousel` 移除 `initialSlide`，改为与其他非表单受控量一致的 `currentIndex` 模型。

React:

```diff
- <Carousel initialSlide={1} />
+ <Carousel defaultCurrentIndex={1} />
```

```tsx
<Carousel currentIndex={index} onCurrentIndexChange={setIndex} />
```

Vue:

```diff
- <Carousel :initialSlide="1" />
+ <Carousel :defaultCurrentIndex="1" />
```

```vue
<Carousel v-model:current-index="index" />
```

### Feedback / overlay open 与 close lifecycle 收敛

Tooltip、Popover、Popconfirm 等 overlay 组件统一使用 `open` 命名；旧 React source hook `usePopup` 已删除，不再提供 `visible` / `defaultVisible` / `onVisibleChange` 合约。

React:

```diff
- <Tooltip visible={open} onVisibleChange={setOpen} />
+ <Tooltip open={open} onOpenChange={setOpen} />
```

Vue:

```diff
- <Tooltip v-model:visible="open" />
+ <Tooltip v-model:open="open" />
```

Drawer 的关闭后生命周期和延迟销毁命名已收敛：

```diff
- <Drawer destroyOnClose destroyOnCloseAfterLeave onAfterLeave={handleAfterClose} />
+ <Drawer destroyOnClose deferDestroyOnClose onAfterClose={handleAfterClose} />
```

```diff
- <Drawer destroy-on-close destroy-on-close-after-leave @after-leave="handleAfterClose" />
+ <Drawer destroy-on-close defer-destroy-on-close @after-close="handleAfterClose" />
```

Modal 现在也提供关闭后生命周期：React 使用 `onAfterClose`，Vue 使用 `@after-close`。外部受控 `open=false` 只表示状态变化，不再触发 close intent；需要记录用户关闭意图时继续监听 React `onClose` / Vue `close`，需要观察动画关闭完成时使用 `onAfterClose` / `after-close`。

```diff
- <Modal open={open} onClose={handleAnyClose} />
+ <Modal open={open} onClose={handleUserClose} onAfterClose={handleClosed} />
```

Vue Modal / Drawer 始终 teleport 到 `document.body`，测试中不再传 `disableTeleport`，请从 `document.body` 查询 overlay 内容。

### Message / notification 命令式 API 与容器入口拆分

React / Vue package 现在声明 `sideEffects: false`，普通 root named import 或组件子路径 import 可以被 bundler 摇掉未使用的命令式 Message / notification 挂载代码。

命令式 API 继续从根入口使用：

```ts
import { Message, notification } from '@expcat/tigercat-react'
```

如果只需要可渲染容器组件，请使用独立容器入口：

```ts
import { MessageContainer } from '@expcat/tigercat-react/MessageContainer'
import { NotificationContainer } from '@expcat/tigercat-react/NotificationContainer'
```

### Legacy token CSS 变量改为 canonical 三层 token

`@expcat/tigercat-core/tokens.css` 现在只生成三层 canonical token：

- `--tiger-primitive-*`
- `--tiger-semantic-*`
- `--tiger-component-*`

如果应用 CSS 直接覆盖旧兼容变量，请迁移到对应 canonical token：

```diff
- --tiger-color-primary-600: #2563eb;
- --tiger-primary: #2563eb;
+ --tiger-primitive-color-primary-600: #2563eb;
+ --tiger-semantic-color-interactive-primary: #2563eb;
```

组件运行时主题仍可能使用 `--tiger-primary`、`--tiger-surface` 等主题变量；本次删除的是 token 生成物中的旧兼容变量输出，不要求业务组件样式整体重写。

### Token JS API 移除 global / alias 兼容命名

core 不再导出 `globalColors` / `globalSpace` / `globalRadius` / `globalShadow` / `globalFont` / `globalDuration` / `globalEasing`、`aliasTokens` 及对应 `Global*` 类型别名：

```diff
- import { globalColors, aliasTokens } from '@expcat/tigercat-core'
+ import { primitiveColors, semanticTokens } from '@expcat/tigercat-core'
```

### Icon path 兼容别名改为分组命名

DatePicker / TimePicker 旧 icon path 别名已删除。请改用 picker icon 的 canonical 名称：

```diff
- import { CalendarIconPath, CloseIconPath, ClockIconPath } from '@expcat/tigercat-core'
+ import {
+   calendarSolidIcon20PathD,
+   closeSolidIcon20PathD,
+   clockSolidIcon20PathD
+ } from '@expcat/tigercat-core'
```

如果项目曾经导入内部 `common-icons` 兼容 barrel，请改为分组 icon 子路径：

```diff
- import { closeIconPathD } from '@expcat/tigercat-core/dist/utils/common-icons'
+ import { closeIconPathD } from '@expcat/tigercat-core/icons/common'
```

### DatePicker i18n 字符串查表改为显式 registry

`getDatePickerLabels(localeString)` 现在只返回英文 fallback，不再从 core 默认入口静态查找所有内置 DatePicker locale。这样 `DatePicker` 子路径和 `defineText` 可以完全裁剪未使用语言。

如果业务需要按运行时字符串在内置 DatePicker locale 中查表，请改用 registry 子路径：

```diff
- import { getDatePickerLabels } from '@expcat/tigercat-core'
+ import { getDatePickerLabelsFromLocale } from '@expcat/tigercat-core/datepicker-locales/registry'

- const labels = getDatePickerLabels(userLocale)
+ const labels = getDatePickerLabelsFromLocale(userLocale)
```

如果已经显式导入 DatePicker preset，则无需使用 registry：

```ts
import { ZH_CN_DATEPICKER_LOCALE } from '@expcat/tigercat-core/datepicker-locales/zh-CN'

const labels = getDatePickerLabels(ZH_CN_DATEPICKER_LOCALE)
```

### `defineText` 改为纯文本 overlay

`defineText(...)` 不再补齐 en-US 基线，也不会导入任何内置 locale pack。它只克隆并返回传入的 `TigerText`，适合单语言应用做全局自定义文案：

```ts
const text = defineText({ modal: { okText: 'Confirm' } })
```

需要完整 locale 对象时请使用 `defineLocale(...)`；需要 DatePicker 翻译时请显式传入 DatePicker preset：

```ts
const fr = defineLocale({
  locale: 'fr-FR',
  datePicker: FR_FR_DATEPICKER_LOCALE,
  common: { okText: 'OK' }
})
```

### 移除 `getResultHttpLabel`

core 已删除 v1.5.0 标记为废弃的 `getResultHttpLabel(status)`。该函数的返回值始终等于 HTTP status 本身；请使用 `isHttpResultStatus(status)` 判断后直接使用原 status。

```diff
- const label = getResultHttpLabel(status)
+ const label = isHttpResultStatus(status) ? status : undefined
```

### ImageGroup 预览回调统一为 open 命名

React `ImageGroup` 删除旧回调 `onPreviewVisibleChange`：

```diff
- <ImageGroup onPreviewVisibleChange={handlePreviewChange}>
+ <ImageGroup onPreviewOpenChange={handlePreviewChange}>
    <Image src="/photo.jpg" />
  </ImageGroup>
```

Vue `ImageGroup` 删除旧事件 `preview-visible-change`：

```diff
- <ImageGroup @preview-visible-change="handlePreviewChange">
+ <ImageGroup @preview-open-change="handlePreviewChange">
    <Image src="/photo.jpg" />
  </ImageGroup>
```

## v1.5.0

### 跨端 API 对称：受控量 / 事件回调统一命名

为消除受控量与事件回调的双端命名/对称不一致，以下三处做了破坏性改名。准则：受控 prop `X` → Vue `update:X`（可 `v-model:x`）/ React `on<X>Change`。

**ImageViewer（React）**：索引变更回调与受控 prop `currentIndex` 对齐。

```diff
- <ImageViewer images={images} currentIndex={i} onIndexChange={setI} />
+ <ImageViewer images={images} currentIndex={i} onCurrentIndexChange={setI} />
```

**CommentThread（Vue）**：展开事件改为受控量 `update:expandedKeys`，可直接 `v-model`。

```diff
- <CommentThread :nodes="nodes" :expanded-keys="keys" @expand-change="keys = $event" />
+ <CommentThread :nodes="nodes" v-model:expanded-keys="keys" />
```

```diff
  <!-- 或显式监听 -->
- <CommentThread :nodes="nodes" @expand-change="onChange" />
+ <CommentThread :nodes="nodes" @update:expanded-keys="onChange" />
```

> React 端回调名保持不变（`onExpandedChange`），对应同一个受控量 `expandedKeys`；不要改成 `onExpandedKeysChange`。

**Spotlight（Vue）**：移除冗余的 `close` 事件，统一用 `open-change`（`open-change(false)` 即关闭）。

```diff
- <Spotlight :items="items" @close="onClose" />
+ <Spotlight :items="items" @open-change="(open) => { if (!open) onClose() }" />
```

> 仍支持 `v-model:open`，关闭时会发 `update:open(false)` 与 `open-change(false)`。

### React `useControlledState` 升级为回调透传版（返回 2-tuple）

React 公共 hook `useControlledState` 升级为合并 `onChange` 的版本（参照 Ant Design `useMergedState` / Radix `useControllableState`）：

- 返回值由 3-tuple `[value, setValue, isControlled]` 收敛为 2-tuple `[value, setValue]`。
- 新增可选第三参 `onChange`；返回的 `setValue(next, ...args)` 在**非受控**时写内部 state，并在两种模式下**始终**调用 `onChange?.(next, ...args)`。
- `setValue` 还支持 updater 形式 `setValue(prev => next)`，并保持稳定引用（identity）。

绝大多数使用者只消费返回的 `value` 与 setter，无需改动。若你此前读取了第三个返回值 `isControlled`，请自行派生；若你此前手写了「非受控才写内部 + 调用 `onChange`」的样板，可改为把 `onChange` 交给 hook：

```diff
- const [value, setValue, isControlled] = useControlledState(controlledValue, defaultValue)
- const handleChange = (next) => {
-   if (!isControlled) setValue(next)
-   onChange?.(next)
- }
+ const [value, setValue] = useControlledState(controlledValue, defaultValue, onChange)
+ const handleChange = (next) => setValue(next)
```

```diff
  // 仍需要 isControlled 时自行派生（与 hook 内部判定一致）：
+ const isControlled = controlledValue !== undefined
```

> 注意：旧版 setter（`setInternalValue`）无论受控与否都会写内部 state；新版 `setValue` 在受控模式下不再写内部 state（由父组件持有值），与受控语义一致。

### 移除废弃别名 `kanbanAddCardClasses`

core 移除了废弃别名 `kanbanAddCardClasses`。它自 v0.9.0 起仅是 `taskBoardAddCardClasses` 的向后兼容别名，现已删除。请直接使用 `taskBoardAddCardClasses`：

```diff
- import { kanbanAddCardClasses } from '@expcat/tigercat-core'
+ import { taskBoardAddCardClasses } from '@expcat/tigercat-core'
```

> 说明：本次同时把 core 内部目录 `src/theme/` 重命名为 `src/theme-runtime/`（以区别于命名预设主题目录 `src/themes/`）。该重命名不影响公共 API——`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 等仍从主入口 `@expcat/tigercat-core` 导出，无需迁移。

### Dropdown 菜单默认渲染到 body

Dropdown 菜单包装层默认通过 React portal / Vue Teleport 渲染到 `document.body`（zIndex 1000），与 Tooltip / Popover / Popconfirm 等浮层组件保持一致。展开的菜单不会再被表格固定列（sticky 单元格）遮挡，也不会被 `overflow` 滚动容器裁剪——表格固定操作列中的行内菜单无需再用全局 CSS 覆盖 z-index。

需要处理的场景：

- **依赖菜单 DOM 层级的样式选择器**（如 `.tiger-dropdown-container > .absolute`）：菜单不再是触发器容器的子节点。推荐改用菜单包装层新增的 `data-tiger-dropdown-menu` 属性查询；或设置 `portal: false` 恢复旧 DOM 结构。
- **测试中查询菜单节点**：从 `document.body`（React testing-library 的 `baseElement`）查询，而不是组件 `container`。

```diff
- container.querySelector('.tiger-dropdown-container > .absolute')
+ document.querySelector('[data-tiger-dropdown-menu]')
```

完全恢复旧行为：

```diff
- <Dropdown trigger="click">
+ <Dropdown trigger="click" portal={false}>   <!-- Vue: :portal="false" -->
```

## v1.2.0

v1.2.0 移除了上一阶段保留的 Image 预览可见性旧命名。请统一使用 `open` 语义，保持 Vue 与 React API 对齐。

### ImagePreview

```diff
- <ImagePreview :visible="showPreview" />
+ <ImagePreview :open="showPreview" />
```

### Image Vue 事件

```diff
- <Image @preview-visible-change="handlePreviewChange" />
+ <Image @preview-open-change="handlePreviewChange" />
```

### Image React 回调

```diff
- <Image onPreviewVisibleChange={handlePreviewChange} />
+ <Image onPreviewOpenChange={handlePreviewChange} />
```

## v1.0.0

Vue 事件命名统一为 kebab-case。

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

## v0.5.0

弹出层可见性统一使用 `open` / `update:open` / `onOpenChange`，Button 原生按钮类型使用 `htmlType`。

```diff
- <Modal :visible="open" />
+ <Modal :open="open" />

- <Button type="submit" />
+ <Button htmlType="submit" />
```
