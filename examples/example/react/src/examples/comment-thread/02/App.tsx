import { useRef, useState } from 'react'
import { CommentThread } from '@expcat/tigercat-react/CommentThread'
import type { CommentNode } from '@expcat/tigercat-core'

const initialComments: CommentNode[] = [
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
]

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

export default function App() {
  const [comments, setComments] = useState(initialComments)
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>([])
  const [activity, setActivity] = useState('展开回复后可触发加载、点赞和回复事件。')
  const nextReplyId = useRef(5)

  return (
    <div className="space-y-3">
      <CommentThread
        nodes={comments}
        expandedKeys={expandedKeys}
        maxReplies={2}
        onExpandedChange={(keys) => {
          setExpandedKeys(keys)
          setActivity(keys.length > 0 ? '已展开回复' : '已收起回复')
        }}
        onLike={(node, liked) => {
          setComments((current) =>
            updateComments(current, node.id, (item) => ({
              ...item,
              liked,
              likes: Math.max(0, (item.likes ?? 0) + (liked ? 1 : -1))
            }))
          )
          setActivity(`${liked ? '点赞' : '取消点赞'}：${node.user?.name ?? node.id}`)
        }}
        onReply={(node, value) => {
          const reply: CommentNode = {
            id: `reply-${nextReplyId.current++}`,
            parentId: node.id,
            content: value,
            user: { name: '我' },
            time: '刚刚'
          }
          setComments((current) =>
            updateComments(current, node.id, (item) => ({
              ...item,
              children: [...(item.children ?? []), reply]
            }))
          )
          setActivity(`已回复 ${node.user?.name ?? node.id}`)
        }}
        onLoadMore={(node) => setActivity(`已加载 ${node.children?.length ?? 0} 条回复`)}
        onMore={(node) => setActivity(`打开 ${node.user?.name ?? node.id} 的更多操作`)}
      />
      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        {activity}
      </p>
    </div>
  )
}
