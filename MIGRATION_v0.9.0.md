# Migration Guide: v0.8.0 → v0.9.0

## Overview

v0.9.0 is the final beta before v1.0.0. It focuses on API consistency, new components, accessibility improvements, and test coverage. Most changes are additive, but there are a few API renames with backward-compatible deprecation support.

## New Features

### New Components

| Component       | Description             |
| --------------- | ----------------------- |
| InputGroup      | 输入框组合（前缀/后缀） |
| InputGroupAddon | 输入框组合附加元素      |
| PrintLayout     | 打印布局容器            |
| PrintPageBreak  | 打印分页符              |
| ImageViewer     | 全屏图片浏览器          |

### Component Enhancements

| Component  | Enhancement      | Prop            |
| ---------- | ---------------- | --------------- |
| Alert      | Banner 模式      | `banner`        |
| Alert      | 自动关闭倒计时条 | `showCountdown` |
| Steps      | 可点击步骤       | `clickable`     |
| Breadcrumb | 超出时折叠中间项 | `maxItems`      |

### Accessibility Utilities

Core 新增 3 个 a11y 工具函数：

```ts
import { createFocusTrap, announceToScreenReader, manageLiveRegion } from '@expcat/tigercat-core'

// Focus trap for modals/drawers
const trap = createFocusTrap(containerEl, { escapeDeactivates: true })
trap.activate()
// ... later
trap.deactivate()

// Screen reader announcements
announceToScreenReader('Item deleted', 'assertive')

// Managed live region
const region = manageLiveRegion('polite')
region.announce('3 results found')
region.clear()
region.destroy()
```

### API Consistency Scanner

新增 `scripts/validate-api.mjs` 脚本，自动检查：

- Prop 命名规范（`isDisabled` → `disabled`，`visible` → `open`）
- Vue 事件 kebab-case
- React 事件 camelCase
- Vue/React 组件覆盖一致性

```bash
node scripts/validate-api.mjs        # 控制台输出
node scripts/validate-api.mjs --json # JSON 格式保存到 api-issues.json
```

## Breaking Changes (with Backward Compatibility)

以下改动已添加向后兼容支持。旧 API 仍可使用但标记为 `@deprecated`，将在 v1.0.0 中移除。

### 1. ImagePreview: `visible` → `open`

**原因：** 统一所有弹出层组件使用 `open` 控制可见性。

#### Vue

```vue
<!-- Before (deprecated, still works) -->
<ImagePreview :visible="show" @update:visible="show = $event" />

<!-- After (recommended) -->
<ImagePreview :open="show" @update:open="show = $event" />
```

#### React

```tsx
// Before (deprecated, still works)
<ImagePreview visible={show} onVisibleChange={setShow} />

// After (recommended)
<ImagePreview open={show} onOpenChange={setShow} />
```

### 2. Image: `preview-visible-change` → `preview-open-change`

#### Vue

```vue
<!-- Before (deprecated, still works) -->
<Image src="..." @preview-visible-change="handleChange" />

<!-- After (recommended) -->
<Image src="..." @preview-open-change="handleChange" />
```

#### React

```tsx
// Before (deprecated, still works)
<Image src="..." onPreviewVisibleChange={handleChange} />

// After (recommended)
<Image src="..." onPreviewOpenChange={handleChange} />
```

### 3. Calendar: Vue Event `panelChange` → `panel-change`

Vue 事件名统一为 kebab-case。

```vue
<!-- Before (no longer works) -->
<Calendar @panelChange="handler" />

<!-- After -->
<Calendar @panel-change="handler" />
```

> **Note:** 这是一个 **非兼容** 变更。Vue 3 的 `v-on` 在 `emits` 中匹配严格名称。

### 4. Rate: Vue Event `hoverChange` → `hover-change`

```vue
<!-- Before (no longer works) -->
<Rate @hoverChange="handler" />

<!-- After -->
<Rate @hover-change="handler" />
```

> **Note:** 这是一个 **非兼容** 变更，同上。

## Migration Steps

1. **搜索并替换 Vue 事件名**（必须）：

   ```bash
   # Calendar
   grep -rn "panelChange" src/ --include="*.vue" --include="*.ts"
   # Rate
   grep -rn "hoverChange" src/ --include="*.vue" --include="*.ts"
   ```

2. **ImagePreview `visible` → `open`**（建议）：

   ```bash
   grep -rn "visible" src/ --include="*.vue" --include="*.ts" --include="*.tsx" | grep -i "preview"
   ```

3. **Image `onPreviewVisibleChange` → `onPreviewOpenChange`**（建议）：

   ```bash
   grep -rn "PreviewVisibleChange\|preview-visible-change" src/
   ```

4. **验证构建无误**：
   ```bash
   pnpm build
   pnpm test
   ```

## Deprecation Timeline

| Deprecated API                 | Replacement                 | Removal Target |
| ------------------------------ | --------------------------- | -------------- |
| `ImagePreview.visible`         | `ImagePreview.open`         | v1.0.0         |
| `ImagePreview.onVisibleChange` | `ImagePreview.onOpenChange` | v1.0.0         |
| `Image.onPreviewVisibleChange` | `Image.onPreviewOpenChange` | v1.0.0         |
| `Image.preview-visible-change` | `Image.preview-open-change` | v1.0.0         |
