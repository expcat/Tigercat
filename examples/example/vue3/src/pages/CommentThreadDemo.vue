<script setup lang="ts">
import { ref } from 'vue'
import { CommentThread } from '@expcat/tigercat-vue'
import type { CommentNode } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const comments = ref<CommentNode[]>([
  {
    id: 1,
    content: '这个功能点考虑得很周到。',
    user: { name: 'Ada', avatar: 'https://i.pravatar.cc/40?img=12', title: '产品经理' },
    time: '10:25',
    likes: 3,
    tag: { label: '作者', variant: 'primary' },
    children: [
      {
        id: 2,
        parentId: 1,
        content: '赞同，尤其是回复区的设计。',
        user: { name: 'Ben', avatar: 'https://i.pravatar.cc/40?img=32' },
        time: '10:30'
      },
      {
        id: 3,
        parentId: 1,
        content: '可以考虑再加一个加载更多。',
        user: { name: 'Chris', avatar: 'https://i.pravatar.cc/40?img=45' },
        time: '10:32'
      }
    ]
  },
  {
    id: 4,
    content: '交互逻辑清晰，点赞按钮很顺手。',
    user: { name: 'Dana', avatar: 'https://i.pravatar.cc/40?img=28' },
    time: '10:40',
    likes: 1,
    actions: [{ label: '标记', variant: 'ghost' }]
  }
])

const flatItems = ref<CommentNode[]>([
  {
    id: 100,
    content: '扁平数据也能渲染成树。',
    user: { name: 'Evan', avatar: 'https://i.pravatar.cc/40?img=22' },
    time: '11:05'
  },
  {
    id: 101,
    parentId: 100,
    content: '是的，parentId 会自动组装。',
    user: { name: 'Fiona', avatar: 'https://i.pravatar.cc/40?img=14' },
    time: '11:07'
  }
])

const handleReply = (node: CommentNode, value: string) => {
  let inserted = false
  const reply: CommentNode = {
    id: Date.now(),
    parentId: node.id,
    content: value,
    user: { name: '我' },
    time: new Date().toLocaleTimeString()
  }

  const appendReply = (items: CommentNode[]): CommentNode[] =>
    items.map((item) => {
      const next = {
        ...item,
        children: item.children ? [...item.children] : []
      }

      if (!inserted && item.id === node.id) {
        next.children = [...(next.children ?? []), reply]
        inserted = true
        return next
      }

      if (!inserted && next.children && next.children.length > 0) {
        next.children = appendReply(next.children)
      }

      return next
    })

  const next = appendReply(comments.value)
  if (inserted) comments.value = next
}

const handleLoadMore = (node: CommentNode) => {
  console.log('load more', node)
}

const basicSnippet = `<CommentThread
  :nodes="comments"
  :default-expanded-keys="[1]"
  :max-replies="1"
  @reply="handleReply"
  @load-more="handleLoadMore"
/>`

const flatSnippet = `<CommentThread :items="flatItems" :default-expanded-keys="[100]" />`

const emptySnippet = `<CommentThread :items="[]" empty-text="暂无评论" />`
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">CommentThread 评论线程</h1>
      <p class="text-gray-600">组合组件，适配评论与讨论场景。</p>
    </div>

    <DemoBlock title="嵌套回复"
               description="支持展开/收起与加载更多。"
               :code="basicSnippet">
      <CommentThread
        :nodes="comments"
        :default-expanded-keys="[1]"
        :max-replies="1"
        @reply="handleReply"
        @load-more="handleLoadMore" />
    </DemoBlock>

    <DemoBlock title="扁平数据"
               description="使用 parentId 构建层级。"
               :code="flatSnippet">
      <CommentThread :items="flatItems"
                     :default-expanded-keys="[100]" />
    </DemoBlock>

    <DemoBlock title="空态" description="无数据时的展示。" :code="emptySnippet">
      <CommentThread :items="[]" empty-text="暂无评论" />
    </DemoBlock>
  </div>
</template>
