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
| minSizes     | `number[]`                 | -              |  ✓  |   ✓   | 面板最小尺寸           |
| maxSizes     | `number[]`                 | -              |  ✓  |   ✓   | 面板最大尺寸           |
| collapsible  | `boolean \| boolean[]`     | `false`        |  ✓  |   ✓   | 面板是否可折叠         |
| gutterSize   | `number`                   | `8`            |  ✓  |   ✓   | 分割条宽度 (px)        |
| className    | `string`                   | -              |  ✓  |   ✓   | 自定义类名             |

### Events

| Event       | Payload             | Vue     | React       | Description        |
| ----------- | ------------------- | ------- | ----------- | ------------------ |
| resize      | `number[]`          | `@resize` | `onResize`  | 面板尺寸变化       |
| collapse    | `number`            | `@collapse` | `onCollapse` | 面板折叠          |

---

## Resizable 可调整容器

### Props

| Prop         | Type                                          | Default     | Vue | React | Description          |
| ------------ | --------------------------------------------- | ----------- | :-: | :---: | -------------------- |
| width        | `number`                                      | `200`       |  ✓  |   ✓   | 初始宽度             |
| height       | `number`                                      | `200`       |  ✓  |   ✓   | 初始高度             |
| minWidth     | `number`                                      | `0`         |  ✓  |   ✓   | 最小宽度             |
| minHeight    | `number`                                      | `0`         |  ✓  |   ✓   | 最小高度             |
| maxWidth     | `number`                                      | `Infinity`  |  ✓  |   ✓   | 最大宽度             |
| maxHeight    | `number`                                      | `Infinity`  |  ✓  |   ✓   | 最大高度             |
| handles      | `ResizeHandle[]`                              | `['se']`    |  ✓  |   ✓   | 拖拽手柄位置         |
| lockAspectRatio | `boolean`                                  | `false`     |  ✓  |   ✓   | 锁定宽高比           |
| disabled     | `boolean`                                     | `false`     |  ✓  |   ✓   | 禁用调整             |
| className    | `string`                                      | -           |  ✓  |   ✓   | 自定义类名           |

### Events

| Event       | Payload                        | Vue       | React       | Description       |
| ----------- | ------------------------------ | --------- | ----------- | ----------------- |
| resize      | `{ width, height }`           | `@resize` | `onResize`  | 尺寸变化          |
| resizeStart | `{ width, height }`           | `@resize-start` | `onResizeStart` | 开始调整    |
| resizeEnd   | `{ width, height }`           | `@resize-end` | `onResizeEnd` | 结束调整      |

---

## CodeEditor 代码编辑器

### Props

| Prop          | Type                            | Default   | Vue | React | Description        |
| ------------- | ------------------------------- | --------- | :-: | :---: | ------------------ |
| value / modelValue | `string`                   | `''`      |  ✓  |   ✓   | 代码内容           |
| language      | `CodeLanguage`                  | `'text'`  |  ✓  |   ✓   | 编程语言           |
| theme         | `'light' \| 'dark'`            | `'light'` |  ✓  |   ✓   | 编辑器主题         |
| readOnly      | `boolean`                       | `false`   |  ✓  |   ✓   | 只读模式           |
| lineNumbers   | `boolean`                       | `true`    |  ✓  |   ✓   | 显示行号           |
| tabSize       | `number`                        | `2`       |  ✓  |   ✓   | Tab 缩进空格数     |
| placeholder   | `string`                        | -         |  ✓  |   ✓   | 占位文本           |
| height        | `string \| number`              | -         |  ✓  |   ✓   | 编辑器高度         |
| className     | `string`                        | -         |  ✓  |   ✓   | 自定义类名         |

---

## RichTextEditor 富文本编辑器

### Props

| Prop          | Type                            | Default   | Vue | React | Description        |
| ------------- | ------------------------------- | --------- | :-: | :---: | ------------------ |
| value / modelValue | `string`                   | `''`      |  ✓  |   ✓   | HTML 内容          |
| mode          | `'default' \| 'simple' \| 'full'` | `'default'` | ✓ |  ✓   | 工具栏模式         |
| toolbar       | `ToolbarButton[]`               | -         |  ✓  |   ✓   | 自定义工具栏       |
| readOnly      | `boolean`                       | `false`   |  ✓  |   ✓   | 只读模式           |
| placeholder   | `string`                        | -         |  ✓  |   ✓   | 占位文本           |
| height        | `string \| number`              | -         |  ✓  |   ✓   | 编辑器高度         |
| className     | `string`                        | -         |  ✓  |   ✓   | 自定义类名         |

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
| currentPath  | `string`                       | `'/'`      |  ✓  |   ✓   | 当前目录路径       |
| selectedKeys | `(string \| number)[]`         | `[]`       |  ✓  |   ✓   | 选中文件 key 数组  |
| showHidden   | `boolean`                      | `false`    |  ✓  |   ✓   | 显示隐藏文件       |
| searchable   | `boolean`                      | `true`     |  ✓  |   ✓   | 显示搜索栏         |
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
