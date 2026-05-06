---
name: tigercat-shared-props-advanced
description: Shared props definitions for advanced interaction components - Splitter, Resizable, CodeEditor, RichTextEditor, Kanban, VirtualTable, InfiniteScroll, FileManager
---

# Advanced Interaction Components - Props Reference (v0.8.0)

共享 Props 定义，框架差异在表格中标注。

---

## Splitter 分割面板

### Props

| Prop         | Type                       | Default        | Vue | React | Description             |
| ------------ | -------------------------- | -------------- | :-: | :---: | ----------------------- |
| direction    | `'horizontal' \| 'vertical'` | `'horizontal'` |  ✓  |   ✓   | 分割方向               |
| sizes        | `number[]`                 | -              |  ✓  |   ✓   | 面板尺寸比例           |
| min          | `number`                   | -              |  ✓  |   ✓   | 面板最小尺寸           |
| max          | `number`                   | -              |  ✓  |   ✓   | 面板最大尺寸           |
| gutterSize   | `number`                   | `4`            |  ✓  |   ✓   | 分割条宽度 (px)        |
| disabled     | `boolean`                  | `false`        |  ✓  |   ✓   | 禁用交互               |
| className    | `string`                   | -              |  ✓  |   ✓   | 自定义类名             |
| style        | `Record<string, string \| number>` | -       |  ✓  |   ✓   | 内联样式               |

### SplitterPaneConfig

| Prop         | Type       | Default | Description            |
| ------------ | ---------- | ------- | ---------------------- |
| key          | `string`   | -       | 面板唯一标识           |
| defaultSize  | `number`   | -       | 默认尺寸               |
| min          | `number`   | -       | 面板级最小尺寸         |
| max          | `number`   | -       | 面板级最大尺寸         |
| collapsible  | `boolean`  | `false` | 是否可折叠             |
| collapsed    | `boolean`  | `false` | 是否折叠               |

### Events

| Event       | Payload             | Vue     | React       | Description        |
| ----------- | ------------------- | ------- | ----------- | ------------------ |
| resize      | `number[]`          | `@resize` | `onResize`  | 面板尺寸变化       |
| collapse    | `number`            | `@collapse` | `onCollapse` | 面板折叠          |

---

## Resizable 可调整容器

### Props

| Prop         | Type                                          | Default                               | Vue | React | Description          |
| ------------ | --------------------------------------------- | ------------------------------------- | :-: | :---: | -------------------- |
| defaultWidth | `number`                                      | `200`                                 |  ✓  |   ✓   | 初始宽度             |
| defaultHeight| `number`                                      | `200`                                 |  ✓  |   ✓   | 初始高度             |
| minWidth     | `number`                                      | `0`                                   |  ✓  |   ✓   | 最小宽度             |
| minHeight    | `number`                                      | `0`                                   |  ✓  |   ✓   | 最小高度             |
| maxWidth     | `number`                                      | -                                     |  ✓  |   ✓   | 最大宽度             |
| maxHeight    | `number`                                      | -                                     |  ✓  |   ✓   | 最大高度             |
| handles      | `ResizeHandlePosition[]`                      | `['right', 'bottom', 'bottom-right']` |  ✓  |   ✓   | 拖拽手柄位置         |
| axis         | `ResizeAxis`                                  | `'both'`                              |  ✓  |   ✓   | 调整轴向             |
| lockAspectRatio | `boolean`                                  | `false`                               |  ✓  |   ✓   | 锁定宽高比           |
| disabled     | `boolean`                                     | `false`                               |  ✓  |   ✓   | 禁用调整             |
| className    | `string`                                      | -                                     |  ✓  |   ✓   | 自定义类名           |

### Events

| Event       | Payload                        | Vue       | React       | Description       |
| ----------- | ------------------------------ | --------- | ----------- | ----------------- |
| resize      | `{ width, height }`           | `@resize` | `onResize`  | 尺寸变化          |
| resizeStart | `{ width, height }`           | `@resize-start` | `onResizeStart` | 开始调整    |
| resizeEnd   | `{ width, height }`           | `@resize-end` | `onResizeEnd` | 结束调整      |

---

## CodeEditor 代码编辑器

### Props

| Prop               | Type                            | Default   | Vue | React | Description          |
| ------------------ | ------------------------------- | --------- | :-: | :---: | -------------------- |
| value / modelValue | `string`                        | `''`      |  ✓  |   ✓   | 代码内容             |
| defaultValue       | `string`                        | -         |  ✓  |   ✓   | 初始代码内容（非受控）|
| language           | `CodeLanguage`                  | `'plain'` |  ✓  |   ✓   | 编程语言             |
| theme              | `'light' \| 'dark'`            | `'light'` |  ✓  |   ✓   | 编辑器主题           |
| readOnly           | `boolean`                       | `false`   |  ✓  |   ✓   | 只读模式             |
| disabled           | `boolean`                       | `false`   |  ✓  |   ✓   | 禁用编辑             |
| lineNumbers        | `boolean`                       | `true`    |  ✓  |   ✓   | 显示行号             |
| tabSize            | `number`                        | `2`       |  ✓  |   ✓   | Tab 缩进空格数       |
| placeholder        | `string`                        | -         |  ✓  |   ✓   | 占位文本             |
| highlightActiveLine| `boolean`                       | `true`    |  ✓  |   ✓   | 高亮当前行           |
| wordWrap           | `boolean`                       | `false`   |  ✓  |   ✓   | 自动换行             |
| minLines           | `number`                        | `3`       |  ✓  |   ✓   | 最小行数             |
| maxLines           | `number`                        | `0`       |  ✓  |   ✓   | 最大行数（0=无限）   |
| className          | `string`                        | -         |  ✓  |   ✓   | 自定义类名           |

---

## RichTextEditor 富文本编辑器

### Props

| Prop               | Type                                  | Default   | Vue | React | Description        |
| ------------------ | ------------------------------------- | --------- | :-: | :---: | ------------------ |
| value / modelValue | `string`                              | `''`      |  ✓  |   ✓   | 内容               |
| defaultValue       | `string`                              | -         |  ✓  |   ✓   | 初始内容（非受控） |
| mode               | `'html' \| 'markdown' \| 'plain'`    | -         |  ✓  |   ✓   | 编辑格式模式       |
| toolbar            | `ToolbarItem[]`                       | -         |  ✓  |   ✓   | 自定义工具栏       |
| readOnly           | `boolean`                             | `false`   |  ✓  |   ✓   | 只读模式           |
| disabled           | `boolean`                             | `false`   |  ✓  |   ✓   | 禁用编辑           |
| placeholder        | `string`                              | -         |  ✓  |   ✓   | 占位文本           |
| height             | `string \| number`                    | -         |  ✓  |   ✓   | 编辑器高度         |
| className          | `string`                              | -         |  ✓  |   ✓   | 自定义类名         |

> `ToolbarItem` = `ToolbarButton | ToolbarSeparator`，支持按钮和分隔符

---

## Kanban 看板

### Props

| Prop           | Type                          | Default | Vue | React | Description        |
| -------------- | ----------------------------- | ------- | :-: | :---: | ------------------ |
| columns        | `TaskBoardColumn[]`           | `[]`    |  ✓  |   ✓   | 列数据             |
| allowAddCard   | `boolean`                     | `false` |  ✓  |   ✓   | 允许添加卡片       |
| allowAddColumn | `boolean`                     | `false` |  ✓  |   ✓   | 允许添加列         |
| columnWidth    | `number \| string`            | -       |  ✓  |   ✓   | 列宽度             |
| className      | `string`                      | -       |  ✓  |   ✓   | 自定义类名         |

### Events

| Event       | Payload                             | Vue         | React       | Description    |
| ----------- | ----------------------------------- | ----------- | ----------- | -------------- |
| card-move   | `{ cardId, fromCol, toCol, toIdx }` | `@card-move` | `onCardMove` | 卡片移动     |
| card-add    | `columnId`                          | `@card-add` | `onCardAdd`  | 添加卡片     |
| column-add  | -                                   | `@column-add` | `onColumnAdd` | 添加列     |

---

## VirtualTable 虚拟表格

### Props

| Prop       | Type             | Default | Vue | React | Description      |
| ---------- | ---------------- | ------- | :-: | :---: | ---------------- |
| data       | `T[]`            | `[]`    |  ✓  |   ✓   | 数据源           |
| columns    | `TableColumn[]`  | `[]`    |  ✓  |   ✓   | 列配置           |
| rowHeight  | `number`         | `48`    |  ✓  |   ✓   | 行高度 (px)      |
| height     | `number`         | `400`   |  ✓  |   ✓   | 容器高度 (px)    |
| overscan   | `number`         | `5`     |  ✓  |   ✓   | 额外渲染行数     |
| rowKey     | `string`         | -       |  ✓  |   ✓   | 行唯一标识字段   |
| loading    | `boolean`        | `false` |  ✓  |   ✓   | 加载状态         |
| emptyText  | `string`         | -       |  ✓  |   ✓   | 空数据提示       |
| className  | `string`         | -       |  ✓  |   ✓   | 自定义类名       |

---

## InfiniteScroll 无限滚动

### Props

| Prop       | Type                           | Default    | Vue | React | Description        |
| ---------- | ------------------------------ | ---------- | :-: | :---: | ------------------ |
| hasMore    | `boolean`                      | `true`     |  ✓  |   ✓   | 是否有更多数据     |
| loading    | `boolean`                      | `false`    |  ✓  |   ✓   | 加载状态           |
| threshold  | `number`                       | `100`      |  ✓  |   ✓   | 触发阈值 (px)      |
| direction  | `'vertical' \| 'horizontal'`  | `'vertical'` | ✓ |   ✓   | 滚动方向           |
| inverse    | `boolean`                      | `false`    |  ✓  |   ✓   | 反向滚动           |
| disabled   | `boolean`                      | `false`    |  ✓  |   ✓   | 禁用加载           |
| className  | `string`                       | -          |  ✓  |   ✓   | 自定义类名         |

### Events

| Event      | Payload | Vue        | React      | Description      |
| ---------- | ------- | ---------- | ---------- | ---------------- |
| loadMore   | -       | `@load-more` | `onLoadMore` | 触发加载更多   |

---

## FileManager 文件管理器

### Props

| Prop         | Type                           | Default    | Vue | React | Description        |
| ------------ | ------------------------------ | ---------- | :-: | :---: | ------------------ |
| files        | `FileItem[]`                   | `[]`       |  ✓  |   ✓   | 文件列表           |
| viewMode     | `'list' \| 'grid'`            | `'list'`   |  ✓  |   ✓   | 显示模式           |
| currentPath  | `string[]`                     | `[]`       |  ✓  |   ✓   | 当前目录路径段数组 |
| selectedKeys | `(string \| number)[]`         | `[]`       |  ✓  |   ✓   | 选中文件 key 数组  |
| showHidden   | `boolean`                      | `false`    |  ✓  |   ✓   | 显示隐藏文件       |
| searchable   | `boolean`                      | -          |  ✓  |   ✓   | 显示搜索栏         |
| searchText   | `string`                       | -          |  ✓  |   ✓   | 搜索关键字         |
| multiple     | `boolean`                      | -          |  ✓  |   ✓   | 允许多选           |
| draggable    | `boolean`                      | -          |  ✓  |   ✓   | 允许拖拽           |
| loading      | `boolean`                      | -          |  ✓  |   ✓   | 加载状态           |
| emptyText    | `string`                       | -          |  ✓  |   ✓   | 空数据提示         |
| sortField    | `FileSortField`                | -          |  ✓  |   ✓   | 排序字段           |
| sortOrder    | `FileSortOrder`                | -          |  ✓  |   ✓   | 排序方向           |
| className    | `string`                       | -          |  ✓  |   ✓   | 自定义类名         |

### Events

| Event      | Payload            | Vue          | React        | Description      |
| ---------- | ------------------ | ------------ | ------------ | ---------------- |
| select     | `FileItem`         | `@select`    | `onSelect`   | 选择文件         |
| open       | `FileItem`         | `@open`      | `onOpen`     | 打开文件         |
| navigate   | `string`           | `@navigate`  | `onNavigate` | 导航到目录       |

---

## Drag Enhancements (v0.8.0)

以下现有组件在 v0.8.0 中增加了拖拽支持：

### List

| Prop       | Type       | Default | Description          |
| ---------- | ---------- | ------- | -------------------- |
| draggable  | `boolean`  | `false` | 允许拖拽排序列表项   |

| Event    | Vue        | React       | Description          |
| -------- | ---------- | ----------- | -------------------- |
| reorder  | `@reorder` | `onReorder` | 拖拽排序后触发       |

### Tree

| Prop       | Type       | Default | Description          |
| ---------- | ---------- | ------- | -------------------- |
| draggable  | `boolean`  | `false` | 允许拖拽树节点       |

| Event    | Vue     | React    | Description                              |
| -------- | ------- | -------- | ---------------------------------------- |
| drop     | `@drop` | `onDrop` | 拖拽放下时触发 `{ dragKey, dropKey }`    |

### Modal

| Prop       | Type       | Default | Description          |
| ---------- | ---------- | ------- | -------------------- |
| draggable  | `boolean`  | `false` | 允许拖拽移动弹窗     |

---

## VirtualList 虚拟列表

### Props

| Prop               | Type     | Default | Vue | React | Description                         |
| ------------------ | -------- | ------- | :-: | :---: | ----------------------------------- |
| itemCount          | `number` | -       |  ✓  |   ✓   | 列表总项数                          |
| itemHeight         | `number` | -       |  ✓  |   ✓   | 固定行高（px，fixed 模式）          |
| estimatedItemHeight | `number` | -      |  ✓  |   ✓   | 估算行高（variable 模式）           |
| height             | `number` | -       |  ✓  |   ✓   | 可视区域高度（px）                  |
| overscan           | `number` | `5`     |  ✓  |   ✓   | 额外渲染行数（上下各 n 行缓冲）    |
| className          | `string` | -       |  -  |   ✓   | 自定义类名                          |

### Events

| Vue Event  | React Prop | Payload                                 | Description |
| ---------- | ---------- | --------------------------------------- | ----------- |
| `@scroll`  | `onScroll`  | `(scrollTop: number)`                  | 滚动事件    |
