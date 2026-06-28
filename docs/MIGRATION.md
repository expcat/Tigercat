# Tigercat 迁移指南

本文集中记录当前仍需要用户处理的 Breaking change 与推荐迁移路径。完整发布历史见 [CHANGELOG.md](../CHANGELOG.md)。

## v2.0.0

v2.0.0 破坏性升级已进入执行阶段；当前批次已同步版本号、运行时 version、CLI 模板版本与 release readiness 文档入口，将 core / React / Vue 发布面切换为 ESM-only，并将 React / Vue component 子路径收敛为 PascalCase 显式 exports。依赖 CommonJS `require()` 加载 Tigercat 包或 core 子路径的项目需要改用 ESM `import`。legacy token、tree-shaking 和按需加载迁移项会随后续 R05-R09 任务落地后追加到本节。

### React / Vue component 子路径改为显式 PascalCase

React / Vue 根入口 named exports 保持可用：

```ts
import { Button } from '@expcat/tigercat-react'
```

组件子路径现在只声明 PascalCase 入口；如果项目曾借助旧通配 exports 导入非 PascalCase 路径，请改为组件名路径：

```diff
- import { Button } from '@expcat/tigercat-react/button'
+ import { Button } from '@expcat/tigercat-react/Button'
```

## v1.5.0

### `getResultHttpLabel` 标记为废弃

`getResultHttpLabel(status)` 的返回值始终等于 HTTP status 本身；新代码请使用 `isHttpResultStatus(status)` 判断是否为 HTTP 结果状态，再按需直接使用原 status。

```diff
- const label = getResultHttpLabel(status)
+ const label = isHttpResultStatus(status) ? status : undefined
```

旧函数仍保留为兼容别名，本次不要求立即迁移。

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
