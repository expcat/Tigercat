---
name: tigercat-vue-advanced
description: Vue 3 advanced components usage
---

# Advanced Components (Vue 3)

高级组件：Splitter / Resizable / CodeEditor / RichTextEditor / Kanban / VirtualTable / InfiniteScroll / FileManager / VirtualList

> **Props Reference**: [shared/props/advanced.md](../shared/props/advanced.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Splitter 分割面板

```vue
<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue'
</script>

<template>
  <Splitter direction="horizontal" :gutter-size="4" style="height: 300px">
    <div>左侧面板</div>
    <div>右侧面板</div>
  </Splitter>
</template>
```

---

## Resizable 可调整大小

```vue
<script setup lang="ts">
import { Resizable } from '@expcat/tigercat-vue'

function handleResize(event: { width: number; height: number }) {
  console.log('resize:', event.width, event.height)
}
</script>

<template>
  <Resizable
    :default-width="200"
    :default-height="150"
    :min-width="100"
    :min-height="80"
    @resize="handleResize">
    <div class="p-4 bg-gray-100">可拖拽调整大小</div>
  </Resizable>
</template>
```

---

## VirtualList 虚拟列表

```vue
<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue'
</script>

<template>
  <VirtualList :item-count="10000" :item-height="40" :height="400" :overscan="5">
    <template #default="{ index }">
      <div class="px-4 py-2 border-b">Item {{ index }}</div>
    </template>
  </VirtualList>
</template>
```

---

## VirtualTable 虚拟表格

```vue
<script setup lang="ts">
import { VirtualTable } from '@expcat/tigercat-vue'

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
</script>

<template>
  <VirtualTable
    :data="data"
    :columns="columns"
    :row-height="48"
    :height="400"
    sticky-header
    striped />
</template>
```

---

## InfiniteScroll 无限滚动

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InfiniteScroll } from '@expcat/tigercat-vue'

const items = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`))
const hasMore = ref(true)
const loading = ref(false)

function loadMore() {
  loading.value = true
  setTimeout(() => {
    const len = items.value.length
    items.value.push(...Array.from({ length: 20 }, (_, i) => `Item ${len + i + 1}`))
    if (items.value.length >= 100) hasMore.value = false
    loading.value = false
  }, 1000)
}
</script>

<template>
  <InfiniteScroll
    :has-more="hasMore"
    :loading="loading"
    loading-text="加载中..."
    end-text="没有更多了"
    @load-more="loadMore">
    <div v-for="item in items" :key="item" class="p-3 border-b">{{ item }}</div>
  </InfiniteScroll>
</template>
```

---

## CodeEditor 代码编辑器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@expcat/tigercat-vue'

const code = ref('function hello() {\n  return "world"\n}')
</script>

<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    :line-numbers="true"
    :highlight="true"
    :height="300" />
</template>
```

---

## RichTextEditor 富文本编辑器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RichTextEditor } from '@expcat/tigercat-vue'

const content = ref('<p>Hello, Tigercat!</p>')
</script>

<template>
  <RichTextEditor v-model="content" placeholder="开始编辑..." />
</template>
```

自定义工具栏（含分隔符与自定义按钮）：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RichTextEditor } from '@expcat/tigercat-vue'
import type { ToolbarItem } from '@expcat/tigercat-core'

const content = ref('')

const toolbar: ToolbarItem[] = [
  { key: 'bold', label: '粗体' },
  { key: 'italic', label: '斜体' },
  { type: 'separator' },
  { key: 'custom-save', label: '保存', icon: '<svg>...</svg>', action: () => console.log('Save!') }
]
</script>

<template>
  <RichTextEditor v-model="content" :toolbar="toolbar" />
</template>
```

---

## FileManager 文件管理器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue'
import type { FileManagerItem } from '@expcat/tigercat-core'

const files = ref<FileManagerItem[]>([
  { id: '1', name: 'Documents', type: 'folder' },
  { id: '2', name: 'photo.jpg', type: 'file', size: 1024000 },
  { id: '3', name: 'report.pdf', type: 'file', size: 2048000 }
])
</script>

<template>
  <FileManager
    :items="files"
    view-mode="grid"
    @item-click="(item) => console.log('click:', item.name)"
    @item-delete="(item) => console.log('delete:', item.name)" />
</template>
```

---

## Kanban 看板

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Kanban } from '@expcat/tigercat-vue'

const columns = ref([
  { id: 'todo', title: '待办', cards: [{ id: '1', title: '任务 A' }] },
  { id: 'doing', title: '进行中', cards: [{ id: '2', title: '任务 B' }] },
  { id: 'done', title: '已完成', cards: [] }
])
</script>

<template>
  <Kanban :columns="columns" @card-move="(e) => console.log(e)" />
</template>
```

> Kanban 与 TaskBoard 功能类似但 API 更简化，适合轻量使用场景。完整看板功能参见 [composite.md](composite.md#taskboard-任务看板)。

---

## PrintLayout 打印布局

```vue
<template>
  <PrintLayout title="Invoice">
    <section>第一页内容</section>
    <PrintPageBreak />
    <section>第二页内容</section>
  </PrintLayout>
</template>
```
