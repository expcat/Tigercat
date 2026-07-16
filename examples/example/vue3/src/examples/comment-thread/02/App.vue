<script setup lang="ts">
import { ref } from 'vue'
import { CommentThread } from '@expcat/tigercat-vue/CommentThread'
import type { CommentNode } from '@expcat/tigercat-core'

const comments = ref<CommentNode[]>([
  {
    id: 'proposal',
    content: '这个方案是否覆盖了键盘操作和移动端布局？',
    user: { name: 'Ada', title: '维护者' },
    time: '20 分钟前',
    likes: 8,
    children: Array.from({ length: 4 }, (_, index) => ({
      id: `reply-${index + 1}`,
      parentId: 'proposal',
      content: `补充回复 ${index + 1}：已完成对应场景验证。`,
      user: { name: index % 2 === 0 ? 'Ben' : 'Cora' },
      time: `${index + 2} 分钟前`
    }))
  }
])
const expandedKeys = ref<Array<string | number>>([])
const activity = ref('展开回复后可触发加载、点赞和回复事件。')
let nextReplyId = 5

const updateComments = (
  nodes: CommentNode[],
  id: string | number,
  update: (node: CommentNode) => CommentNode
): CommentNode[] =>
  nodes.map((node) => {
    if (node.id === id) return update(node)
    if (!node.children) return node
    return { ...node, children: updateComments(node.children, id, update) }
  })

const handleExpandedChange = (keys: Array<string | number>) => {
  expandedKeys.value = keys
  activity.value = keys.length > 0 ? '已展开回复' : '已收起回复'
}

const handleLike = (node: CommentNode, liked: boolean) => {
  comments.value = updateComments(comments.value, node.id, (item) => ({
    ...item,
    liked,
    likes: Math.max(0, (item.likes ?? 0) + (liked ? 1 : -1))
  }))
  activity.value = `${liked ? '点赞' : '取消点赞'}：${node.user?.name ?? node.id}`
}

const handleReply = (node: CommentNode, value: string) => {
  const reply: CommentNode = {
    id: `reply-${nextReplyId++}`,
    parentId: node.id,
    content: value,
    user: { name: '我' },
    time: '刚刚'
  }
  comments.value = updateComments(comments.value, node.id, (item) => ({
    ...item,
    children: [...(item.children ?? []), reply]
  }))
  activity.value = `已回复 ${node.user?.name ?? node.id}`
}
</script>

<template>
  <div class="space-y-3">
    <CommentThread
      :nodes="comments"
      :expanded-keys="expandedKeys"
      :max-replies="2"
      @update:expanded-keys="handleExpandedChange"
      @like="handleLike"
      @reply="handleReply"
      @load-more="activity = `已加载 ${$event.children?.length ?? 0} 条回复`"
      @more="activity = `打开 ${$event.user?.name ?? $event.id} 的更多操作`" />
    <p class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
      {{ activity }}
    </p>
  </div>
</template>
