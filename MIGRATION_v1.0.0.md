# 迁移指南：v0.8.0 → v1.0.0

本文档帮助你从 Tigercat v0.8.0 迁移到 v1.0.0。

## 概述

v1.0.0 是 Tigercat 的首个正式稳定版本。从此版本起，API 遵循 SemVer 语义化版本规范，不会在 v1.x 系列中引入破坏性变更。

v1.0.0 包含了原计划在 v0.9.0 中发布的所有功能，因此本指南覆盖 v0.8.0 → v1.0.0 的全部变更。

## 破坏性变更

### Calendar 事件重命名

```diff
<!-- Vue -->
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />
```

```diff
// React — 无变化，仍为 onPanelChange
```

### Rate 事件重命名

```diff
<!-- Vue -->
- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

```diff
// React — 无变化，仍为 onHoverChange
```

## 向后兼容的弃用

以下 API 仍然可用，但标记为 `@deprecated`，将在 v2.0.0 移除：

### ImagePreview

```diff
<!-- Vue -->
- <ImagePreview :visible="show" />
+ <ImagePreview :open="show" />

// React
- <ImagePreview visible={show} />
+ <ImagePreview open={show} />
```

### Image 事件

```diff
<!-- Vue -->
- <Image @preview-visible-change="handler" />
+ <Image @preview-open-change="handler" />

// React
- <Image onPreviewVisibleChange={handler} />
+ <Image onPreviewOpenChange={handler} />
```

## 新增组件

| 组件          | 说明                                                 |
| ------------- | ---------------------------------------------------- |
| `InputGroup`  | 输入框组合容器，支持前后缀、嵌套 Input/Select/Button |
| `PrintLayout` | 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制      |
| `ImageViewer` | 全功能图片查看器，支持缩放/旋转/翻页/键盘导航        |

## 新增 a11y 工具

```ts
import { createFocusTrap, announceToScreenReader, manageLiveRegion } from '@expcat/tigercat-core'

// 焦点陷阱
const trap = createFocusTrap(containerEl, { escapeDeactivates: true })
trap.activate()

// 屏幕阅读器公告
announceToScreenReader('Item deleted', 'assertive')

// 可管理的 live region
const region = manageLiveRegion('polite')
region.announce('Loading complete')
region.destroy()
```

## 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

## 安装

```bash
# 更新到 v1.0.0
pnpm update @expcat/tigercat-vue@^1.0.0
pnpm update @expcat/tigercat-react@^1.0.0
pnpm update @expcat/tigercat-core@^1.0.0

# CLI 工具
pnpm update @expcat/tigercat-cli@^1.0.0
```
