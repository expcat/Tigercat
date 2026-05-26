---
name: tigercat-shared-props-advanced
description: Shared props definitions for advanced interaction components - Splitter, Resizable, CodeEditor, RichTextEditor, MarkdownEditor, Kanban, VirtualTable, InfiniteScroll, FileManager, ImageAnnotation
---

<!-- LLM-INDEX
type: props-reference
category: advanced
components: 10
key-apis: direction, sizes, value, language, columns, dataSource, virtual, loadMore, files, annotations
-->

# Advanced Interaction Components - Props Reference (v0.8.0)

共享 Props 定义。Vue/React 默认双端支持，差异仅在 Type 或 Description 中标注。

---

## Splitter 分割面板

### Props

| Prop       | Type                               | Default        | Description     |
| ---------- | ---------------------------------- | -------------- | --------------- |
| direction  | `'horizontal' \| 'vertical'`       | `'horizontal'` | 分割方向        |
| sizes      | `number[]`                         | -              | 面板尺寸比例    |
| min        | `number`                           | -              | 面板最小尺寸    |
| max        | `number`                           | -              | 面板最大尺寸    |
| gutterSize | `number`                           | `4`            | 分割条宽度 (px) |
| disabled   | `boolean`                          | `false`        | 禁用交互        |
| className  | `string`                           | -              | 自定义类名      |
| style      | `Record<string, string \| number>` | -              | 内联样式        |

### SplitterPaneConfig

| Prop        | Type      | Default | Description    |
| ----------- | --------- | ------- | -------------- |
| key         | `string`  | -       | 面板唯一标识   |
| defaultSize | `number`  | -       | 默认尺寸       |
| min         | `number`  | -       | 面板级最小尺寸 |
| max         | `number`  | -       | 面板级最大尺寸 |
| collapsible | `boolean` | `false` | 是否可折叠     |
| collapsed   | `boolean` | `false` | 是否折叠       |

### Events

| Event    | Payload    | Description                                      |
| -------- | ---------- | ------------------------------------------------ |
| resize   | `number[]` | 面板尺寸变化 (Vue: `@resize`, React: `onResize`) |
| collapse | `number`   | 面板折叠 (Vue: `@collapse`, React: `onCollapse`) |

---

## Resizable 可调整容器

### Props

| Prop            | Type                     | Default                               | Description  |
| --------------- | ------------------------ | ------------------------------------- | ------------ |
| defaultWidth    | `number`                 | `200`                                 | 初始宽度     |
| defaultHeight   | `number`                 | `200`                                 | 初始高度     |
| minWidth        | `number`                 | `0`                                   | 最小宽度     |
| minHeight       | `number`                 | `0`                                   | 最小高度     |
| maxWidth        | `number`                 | -                                     | 最大宽度     |
| maxHeight       | `number`                 | -                                     | 最大高度     |
| handles         | `ResizeHandlePosition[]` | `['right', 'bottom', 'bottom-right']` | 拖拽手柄位置 |
| axis            | `ResizeAxis`             | `'both'`                              | 调整轴向     |
| lockAspectRatio | `boolean`                | `false`                               | 锁定宽高比   |
| disabled        | `boolean`                | `false`                               | 禁用调整     |
| className       | `string`                 | -                                     | 自定义类名   |

### Events

| Event       | Payload             | Description                                             |
| ----------- | ------------------- | ------------------------------------------------------- |
| resize      | `{ width, height }` | 尺寸变化 (Vue: `@resize`, React: `onResize`)            |
| resizeStart | `{ width, height }` | 开始调整 (Vue: `@resize-start`, React: `onResizeStart`) |
| resizeEnd   | `{ width, height }` | 结束调整 (Vue: `@resize-end`, React: `onResizeEnd`)     |

---

## CodeEditor 代码编辑器

### Props

| Prop                | Type                | Default   | Description            |
| ------------------- | ------------------- | --------- | ---------------------- |
| value / modelValue  | `string`            | `''`      | 代码内容               |
| defaultValue        | `string`            | -         | 初始代码内容（非受控） |
| language            | `CodeLanguage`      | `'plain'` | 编程语言               |
| theme               | `'light' \| 'dark'` | `'light'` | 编辑器主题             |
| readOnly            | `boolean`           | `false`   | 只读模式               |
| disabled            | `boolean`           | `false`   | 禁用编辑               |
| lineNumbers         | `boolean`           | `true`    | 显示行号               |
| tabSize             | `number`            | `2`       | Tab 缩进空格数         |
| placeholder         | `string`            | -         | 占位文本               |
| highlightActiveLine | `boolean`           | `true`    | 高亮当前行             |
| wordWrap            | `boolean`           | `false`   | 自动换行               |
| minLines            | `number`            | `3`       | 最小行数               |
| maxLines            | `number`            | `0`       | 最大行数（0=无限）     |
| className           | `string`            | -         | 自定义类名             |

---

## RichTextEditor 富文本编辑器

### Props

| Prop               | Type                              | Default | Description        |
| ------------------ | --------------------------------- | ------- | ------------------ |
| value / modelValue | `string`                          | `''`    | 内容               |
| defaultValue       | `string`                          | -       | 初始内容（非受控） |
| mode               | `'html' \| 'markdown' \| 'plain'` | -       | 编辑格式模式       |
| toolbar            | `ToolbarItem[]`                   | -       | 自定义工具栏       |
| readOnly           | `boolean`                         | `false` | 只读模式           |
| disabled           | `boolean`                         | `false` | 禁用编辑           |
| placeholder        | `string`                          | -       | 占位文本           |
| height             | `string \| number`                | -       | 编辑器高度         |
| className          | `string`                          | -       | 自定义类名         |

> `ToolbarItem` = `ToolbarButton | ToolbarSeparator`，支持按钮和分隔符

---

## MarkdownEditor Markdown 编辑器

### Props

| Prop               | Type                                   | Default   | Description                    |
| ------------------ | -------------------------------------- | --------- | ------------------------------ |
| value / modelValue | `string`                               | `''`      | Markdown 内容                  |
| defaultValue       | `string`                               | -         | 初始内容（非受控）             |
| placeholder        | `string`                               | -         | 占位文本                       |
| mode               | `'edit' \| 'split' \| 'preview'`       | -         | 受控显示模式                   |
| defaultMode        | `'edit' \| 'split' \| 'preview'`       | `'split'` | 非受控初始显示模式             |
| toolbar            | `MarkdownToolbarItem[] \| false`       | 内置工具  | 自定义工具栏或隐藏格式化工具栏 |
| showModeSwitch     | `boolean`                              | `true`    | 显示编辑/分屏/预览切换         |
| height             | `string \| number`                     | `360`     | 编辑器高度                     |
| readOnly           | `boolean`                              | `false`   | 只读模式                       |
| disabled           | `boolean`                              | `false`   | 禁用状态                       |
| renderer           | `{ render(markdown: string): string }` | -         | 自定义预览渲染器               |
| className          | `string`                               | -         | 自定义类名                     |

### Types

| Type                  | Definition                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| MarkdownEditorMode    | `'edit' \| 'split' \| 'preview'`                                                  |
| MarkdownToolbarItem   | `MarkdownToolbarButton \| MarkdownToolbarSeparator`                               |
| MarkdownToolbarButton | `{ name, label, icon?, tooltip?, hotkey?, action? }`                              |
| MarkdownToolbarAction | `'bold' \| 'italic' \| 'heading' \| 'blockquote' \| 'link' \| 'table'` 等内置动作 |
| MarkdownRenderer      | `{ render(markdown: string): string }`，输出会经过内置 HTML 清理                  |

### Events

| Vue Event       | React Prop     | Payload              | Description  |
| --------------- | -------------- | -------------------- | ------------ |
| `@update:value` | -              | `string`             | v-model 更新 |
| `@change`       | `onChange`     | `string`             | 内容变化     |
| `@update:mode`  | -              | `MarkdownEditorMode` | v-model 更新 |
| `@mode-change`  | `onModeChange` | `MarkdownEditorMode` | 显示模式变化 |

---

## Kanban 看板

### Props

| Prop           | Type                | Default | Description  |
| -------------- | ------------------- | ------- | ------------ |
| columns        | `TaskBoardColumn[]` | `[]`    | 列数据       |
| allowAddCard   | `boolean`           | `false` | 允许添加卡片 |
| allowAddColumn | `boolean`           | `false` | 允许添加列   |
| columnWidth    | `number \| string`  | -       | 列宽度       |
| className      | `string`            | -       | 自定义类名   |

### Events

| Event      | Payload                             | Description                                       |
| ---------- | ----------------------------------- | ------------------------------------------------- |
| card-move  | `{ cardId, fromCol, toCol, toIdx }` | 卡片移动 (Vue: `@card-move`, React: `onCardMove`) |
| card-add   | `columnId`                          | 添加卡片 (Vue: `@card-add`, React: `onCardAdd`)   |
| column-add | -                                   | 添加列 (Vue: `@column-add`, React: `onColumnAdd`) |

---

## VirtualTable 虚拟表格

### Props

| Prop      | Type            | Default | Description    |
| --------- | --------------- | ------- | -------------- |
| data      | `T[]`           | `[]`    | 数据源         |
| columns   | `TableColumn[]` | `[]`    | 列配置         |
| rowHeight | `number`        | `48`    | 行高度 (px)    |
| height    | `number`        | `400`   | 容器高度 (px)  |
| overscan  | `number`        | `5`     | 额外渲染行数   |
| rowKey    | `string`        | -       | 行唯一标识字段 |
| loading   | `boolean`       | `false` | 加载状态       |
| emptyText | `string`        | -       | 空数据提示     |
| className | `string`        | -       | 自定义类名     |

---

## InfiniteScroll 无限滚动

### Props

| Prop      | Type                         | Default      | Description    |
| --------- | ---------------------------- | ------------ | -------------- |
| hasMore   | `boolean`                    | `true`       | 是否有更多数据 |
| loading   | `boolean`                    | `false`      | 加载状态       |
| threshold | `number`                     | `100`        | 触发阈值 (px)  |
| direction | `'vertical' \| 'horizontal'` | `'vertical'` | 滚动方向       |
| inverse   | `boolean`                    | `false`      | 反向滚动       |
| disabled  | `boolean`                    | `false`      | 禁用加载       |
| className | `string`                     | -            | 自定义类名     |

### Events

| Event    | Payload | Description                                           |
| -------- | ------- | ----------------------------------------------------- |
| loadMore | -       | 触发加载更多 (Vue: `@load-more`, React: `onLoadMore`) |

---

## FileManager 文件管理器

### Props

| Prop         | Type                   | Default  | Description        |
| ------------ | ---------------------- | -------- | ------------------ |
| files        | `FileItem[]`           | `[]`     | 文件列表           |
| viewMode     | `'list' \| 'grid'`     | `'list'` | 显示模式           |
| currentPath  | `string[]`             | `[]`     | 当前目录路径段数组 |
| selectedKeys | `(string \| number)[]` | `[]`     | 选中文件 key 数组  |
| showHidden   | `boolean`              | `false`  | 显示隐藏文件       |
| searchable   | `boolean`              | -        | 显示搜索栏         |
| searchText   | `string`               | -        | 搜索关键字         |
| multiple     | `boolean`              | -        | 允许多选           |
| draggable    | `boolean`              | -        | 允许拖拽           |
| loading      | `boolean`              | -        | 加载状态           |
| emptyText    | `string`               | -        | 空数据提示         |
| sortField    | `FileSortField`        | -        | 排序字段           |
| sortOrder    | `FileSortOrder`        | -        | 排序方向           |
| className    | `string`               | -        | 自定义类名         |

### Events

| Event    | Payload    | Description                                        |
| -------- | ---------- | -------------------------------------------------- |
| select   | `FileItem` | 选择文件 (Vue: `@select`, React: `onSelect`)       |
| open     | `FileItem` | 打开文件 (Vue: `@open`, React: `onOpen`)           |
| navigate | `string`   | 导航到目录 (Vue: `@navigate`, React: `onNavigate`) |

---

## ImageAnnotation 图片标注

### Props

| Prop               | Type                    | Default  | Description             |
| ------------------ | ----------------------- | -------- | ----------------------- |
| src                | `string`                | -        | 图片地址                |
| alt                | `string`                | -        | 图片替代文本            |
| value / modelValue | `ImageAnnotation[]`     | -        | 受控标注列表            |
| defaultValue       | `ImageAnnotation[]`     | `[]`     | 非受控初始标注          |
| selectedId         | `string`                | -        | 受控选中标注            |
| defaultSelectedId  | `string`                | -        | 非受控初始选中标注      |
| tool               | `ImageAnnotationTool`   | -        | 受控当前工具            |
| defaultTool        | `ImageAnnotationTool`   | `select` | 非受控初始工具          |
| tools              | `ImageAnnotationTool[]` | 全部工具 | 可用工具                |
| disabled           | `boolean`               | `false`  | 禁用交互                |
| readonly           | `boolean`               | `false`  | 只读查看                |
| minSize            | `number`                | `0.01`   | 矩形/圆形最小归一化宽高 |
| strokeWidth        | `number`                | `2`      | SVG 标注描边宽度        |
| showLabels         | `boolean`               | `true`   | 显示标注标签            |
| className          | `string`                | -        | 自定义类名              |

### Types

| Type                 | Definition                                                            |
| -------------------- | --------------------------------------------------------------------- |
| ImageAnnotationTool  | `'select' \| 'rectangle' \| 'ellipse' \| 'polygon' \| 'freehand'`     |
| ImageAnnotation      | `ImageAnnotationBox \| ImageAnnotationPath`                           |
| ImageAnnotationBox   | `{ id, type: 'rectangle' \| 'ellipse', x, y, width, height, label? }` |
| ImageAnnotationPath  | `{ id, type: 'polygon' \| 'freehand', points, label? }`               |
| ImageAnnotationPoint | `{ x: number, y: number }`，坐标为 0-1 归一化值                       |

### Events

| Vue Event             | React Prop     | Payload                   | Description  |
| --------------------- | -------------- | ------------------------- | ------------ |
| `@update:model-value` | -              | `ImageAnnotation[]`       | v-model 更新 |
| `@change`             | `onChange`     | `(annotations, meta)`     | 标注变化     |
| `@select`             | `onSelect`     | `ImageAnnotation \| null` | 选择标注     |
| `@tool-change`        | `onToolChange` | `ImageAnnotationTool`     | 工具切换     |
| `@ready`              | `onReady`      | -                         | 图片加载完成 |

---

## Drag Enhancements (v0.8.0)

以下现有组件在 v0.8.0 中增加了拖拽支持：

### List

| Prop      | Type      | Default | Description        |
| --------- | --------- | ------- | ------------------ |
| draggable | `boolean` | `false` | 允许拖拽排序列表项 |

| Event   | Description                                          |
| ------- | ---------------------------------------------------- |
| reorder | 拖拽排序后触发 (Vue: `@reorder`, React: `onReorder`) |

### Tree

| Prop      | Type      | Default | Description    |
| --------- | --------- | ------- | -------------- |
| draggable | `boolean` | `false` | 允许拖拽树节点 |

| Event | Description                                                           |
| ----- | --------------------------------------------------------------------- |
| drop  | 拖拽放下时触发 `{ dragKey, dropKey }` (Vue: `@drop`, React: `onDrop`) |

### Modal

| Prop      | Type      | Default | Description      |
| --------- | --------- | ------- | ---------------- |
| draggable | `boolean` | `false` | 允许拖拽移动弹窗 |

---

## VirtualList 虚拟列表

### Props

| Prop                | Type     | Default | Description                     |
| ------------------- | -------- | ------- | ------------------------------- |
| itemCount           | `number` | -       | 列表总项数                      |
| itemHeight          | `number` | -       | 固定行高（px，fixed 模式）      |
| estimatedItemHeight | `number` | -       | 估算行高（variable 模式）       |
| height              | `number` | -       | 可视区域高度（px）              |
| overscan            | `number` | `5`     | 额外渲染行数（上下各 n 行缓冲） |
| className           | `string` | -       | 自定义类名 (React only)         |

### Events

| Vue Event | React Prop | Payload               | Description |
| --------- | ---------- | --------------------- | ----------- |
| `@scroll` | `onScroll` | `(scrollTop: number)` | 滚动事件    |
