---
name: tigercat-react-advanced
description: React advanced components usage
---

# Advanced Components (React)

高级组件：Splitter / Resizable / CodeEditor / RichTextEditor / Kanban / VirtualTable / InfiniteScroll / FileManager / VirtualList

> **Props Reference**: [shared/props/advanced.md](../shared/props/advanced.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Splitter 分割面板

```tsx
import { Splitter } from '@expcat/tigercat-react'

export default function SplitterDemo() {
  return (
    <Splitter direction="horizontal" gutterSize={4} style={{ height: 300 }}>
      <div>左侧面板</div>
      <div>右侧面板</div>
    </Splitter>
  )
}
```

---

## Resizable 可调整大小

```tsx
import { Resizable } from '@expcat/tigercat-react'

export default function ResizableDemo() {
  return (
    <Resizable
      defaultWidth={200}
      defaultHeight={150}
      minWidth={100}
      minHeight={80}
      onResize={(e) => console.log('resize:', e.width, e.height)}>
      <div className="p-4 bg-gray-100">可拖拽调整大小</div>
    </Resizable>
  )
}
```

---

## VirtualList 虚拟列表

```tsx
import { VirtualList } from '@expcat/tigercat-react'

export default function VirtualListDemo() {
  return (
    <VirtualList
      itemCount={10000}
      itemHeight={40}
      height={400}
      overscan={5}
      renderItem={({ index }) => <div className="px-4 py-2 border-b">Item {index}</div>}
    />
  )
}
```

---

## VirtualTable 虚拟表格

```tsx
import { VirtualTable } from '@expcat/tigercat-react'

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态', width: 100 }
]

const data = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  status: i % 3 === 0 ? '完成' : '进行中'
}))

export default function VirtualTableDemo() {
  return (
    <VirtualTable data={data} columns={columns} rowHeight={48} height={400} stickyHeader striped />
  )
}
```

---

## InfiniteScroll 无限滚动

```tsx
import React, { useState, useCallback } from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react'

export default function InfiniteScrollDemo() {
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`))
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setItems((prev) => {
        const next = [
          ...prev,
          ...Array.from({ length: 20 }, (_, i) => `Item ${prev.length + i + 1}`)
        ]
        if (next.length >= 100) setHasMore(false)
        return next
      })
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loading={loading}
      loadingText="加载中..."
      endText="没有更多了"
      onLoadMore={loadMore}>
      {items.map((item) => (
        <div key={item} className="p-3 border-b">
          {item}
        </div>
      ))}
    </InfiniteScroll>
  )
}
```

---

## CodeEditor 代码编辑器

```tsx
import React, { useState } from 'react'
import { CodeEditor } from '@expcat/tigercat-react'

export default function CodeEditorDemo() {
  const [code, setCode] = useState('function hello() {\n  return "world"\n}')

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      lineNumbers
      highlight
      height={300}
    />
  )
}
```

---

## RichTextEditor 富文本编辑器

```tsx
import React, { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react'

export default function RichTextEditorDemo() {
  const [content, setContent] = useState('<p>Hello, Tigercat!</p>')

  return <RichTextEditor value={content} onChange={setContent} placeholder="开始编辑..." />
}
```

自定义工具栏（含分隔符与自定义按钮）：

```tsx
import React, { useState } from 'react'
import { RichTextEditor } from '@expcat/tigercat-react'
import type { ToolbarItem } from '@expcat/tigercat-core'

const toolbar: ToolbarItem[] = [
  { key: 'bold', label: '粗体' },
  { key: 'italic', label: '斜体' },
  { type: 'separator' },
  { key: 'custom-save', label: '保存', icon: '<svg>...</svg>', action: () => console.log('Save!') }
]

export default function CustomToolbarDemo() {
  const [content, setContent] = useState('')

  return <RichTextEditor value={content} onChange={setContent} toolbar={toolbar} />
}
```

---

## FileManager 文件管理器

```tsx
import React from 'react'
import { FileManager } from '@expcat/tigercat-react'
import type { FileManagerItem } from '@expcat/tigercat-core'

const files: FileManagerItem[] = [
  { id: '1', name: 'Documents', type: 'folder' },
  { id: '2', name: 'photo.jpg', type: 'file', size: 1024000 },
  { id: '3', name: 'report.pdf', type: 'file', size: 2048000 }
]

export default function FileManagerDemo() {
  return (
    <FileManager
      items={files}
      viewMode="grid"
      onItemClick={(item) => console.log('click:', item.name)}
      onItemDelete={(item) => console.log('delete:', item.name)}
    />
  )
}
```

---

## Kanban 看板

```tsx
import React, { useState } from 'react'
import { Kanban } from '@expcat/tigercat-react'

export default function KanbanDemo() {
  const [columns, setColumns] = useState([
    { id: 'todo', title: '待办', cards: [{ id: '1', title: '任务 A' }] },
    { id: 'doing', title: '进行中', cards: [{ id: '2', title: '任务 B' }] },
    { id: 'done', title: '已完成', cards: [] }
  ])

  return <Kanban columns={columns} onCardMove={(e) => console.log(e)} />
}
```

> Kanban 与 TaskBoard 功能类似但 API 更简化，适合轻量使用场景。完整看板功能参见 [composite.md](composite.md#taskboard-任务看板)。

---

## PrintLayout 打印布局

```tsx
<PrintLayout title="Invoice">
  <section>第一页内容</section>
  <PrintPageBreak />
  <section>第二页内容</section>
</PrintLayout>
```
