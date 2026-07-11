import { CommentThread } from '@expcat/tigercat-react/CommentThread'
import type { CommentNode } from '@expcat/tigercat-core'

const comments: CommentNode[] = [
  {
    id: 1,
    content: '示例结构已经足够清晰，可以合并。',
    user: { name: 'Ada', title: '维护者' },
    time: '10 分钟前',
    likes: 3,
    tag: { label: '已解决', variant: 'success' },
    children: [
      {
        id: 2,
        parentId: 1,
        content: '收到，我会保留一个可复制的代表示例。',
        user: { name: 'Ben' },
        time: '刚刚'
      }
    ]
  }
]

export default function App() {
  return <CommentThread nodes={comments} defaultExpandedKeys={[1]} />
}
