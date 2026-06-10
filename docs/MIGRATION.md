# Tigercat 迁移指南

本文集中记录当前仍需要用户处理的 Breaking change 与推荐迁移路径。完整发布历史见 [CHANGELOG.md](../CHANGELOG.md)。

## Unreleased（v1.3.0）

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
