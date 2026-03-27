# Migration Guide: v0.7.0 → v0.8.0

## Overview

v0.8.0 introduces a unified drag-and-drop system, advanced business components, CLI tooling, and bundle size optimizations.

## New Features

### Drag & Drop System

A headless, framework-agnostic drag abstraction layer is now available in `@expcat/tigercat-core`, with Vue composable (`useDrag`) and React hook (`useDrag`) wrappers.

```ts
// Core (framework-agnostic)
import { createDragState, handleDragStart, handleDragOver, handleDrop } from '@expcat/tigercat-core'

// Vue
import { useDrag } from '@expcat/tigercat-vue'

// React
import { useDrag } from '@expcat/tigercat-react'
```

### New Components

| Component      | Description    |
| -------------- | -------------- |
| Splitter       | 分割面板       |
| Resizable      | 可调整大小容器 |
| CodeEditor     | 代码编辑器     |
| RichTextEditor | 富文本编辑器   |
| Kanban         | 看板组件       |
| VirtualTable   | 虚拟化表格     |
| InfiniteScroll | 无限滚动       |
| FileManager    | 文件管理器     |

### Drag-Enhanced Existing Components

- **List**: `draggable` prop for item reordering
- **Tree**: Enhanced drag-drop with the unified drag system
- **Table**: Column and row drag sorting
- **Modal/Drawer**: Drag to reposition window

### CLI Tooling

```bash
npx @expcat/tigercat-cli create my-app --template vue3
npx @expcat/tigercat-cli generate component MyComponent
```

## Breaking Changes

None in this release. All changes are additive.

## Bundle Size

Advanced components (RichTextEditor, CodeEditor, FileManager) are available as separate entry points to minimize bundle impact:

```ts
// Tree-shakeable imports (recommended)
import { Splitter } from '@expcat/tigercat-vue'

// Direct entry (for advanced components)
import { RichTextEditor } from '@expcat/tigercat-vue/RichTextEditor'
```
