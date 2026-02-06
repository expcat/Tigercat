import { useCallback, useState } from 'react'
import { CommentThread } from '@expcat/tigercat-react'
import type { CommentNode } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'

const initialNodes: CommentNode[] = [
  {
    id: 1,
    content:
      '这个方案的整体架构设计很清晰，前后端分离做得很到位。特别是接口契约的部分，文档写得非常详细，方便后续团队协作。',
    user: {
      name: 'Ada',
      avatar: 'https://i.pravatar.cc/40?img=12',
      title: '技术负责人'
    },
    time: '2 小时前',
    likes: 12,
    liked: true,
    tag: { label: '置顶', variant: 'primary' },
    children: [
      {
        id: 2,
        parentId: 1,
        content: '赞同，接口文档确实很规范。希望后续能加上 Mock 数据的自动生成。',
        user: { name: 'Ben', avatar: 'https://i.pravatar.cc/40?img=32' },
        time: '1 小时前',
        likes: 5
      },
      {
        id: 3,
        parentId: 1,
        content: '前端这边用了组件库统一风格，开发效率提升了不少。',
        user: {
          name: 'Chris',
          avatar: 'https://i.pravatar.cc/40?img=45',
          title: '前端工程师'
        },
        time: '45 分钟前',
        likes: 3
      },
      {
        id: 8,
        parentId: 1,
        content: '后端的错误码规范也建议同步更新一下。',
        user: { name: 'Grace', avatar: 'https://i.pravatar.cc/40?img=19' },
        time: '30 分钟前'
      }
    ]
  },
  {
    id: 4,
    content: '交互细节打磨得很好，按钮的反馈动效和加载状态都考虑到了，用户体验很流畅。',
    user: { name: 'Dana', avatar: 'https://i.pravatar.cc/40?img=28', title: '设计师' },
    time: '1 小时前',
    likes: 8,
    tags: [
      { label: 'UX', variant: 'success' },
      { label: '设计评审', variant: 'info' }
    ],
    actions: [{ label: '标记已读', variant: 'ghost' }],
    children: [
      {
        id: 5,
        parentId: 4,
        content: '动效部分用的 CSS transition 还是 JS 动画？想参考一下实现方式。',
        user: { name: 'Evan', avatar: 'https://i.pravatar.cc/40?img=22' },
        time: '50 分钟前'
      }
    ]
  },
  {
    id: 6,
    content: '性能方面建议关注一下首屏渲染时间，目前 LCP 指标偏高。可以考虑对图片做懒加载处理。',
    user: { name: 'Fiona', avatar: 'https://i.pravatar.cc/40?img=14', title: '性能工程师' },
    time: '35 分钟前',
    likes: 6,
    tag: { label: '建议', variant: 'warning' }
  }
]

const basicSnippet = `<CommentThread
  nodes={nodes}
  defaultExpandedKeys={[1]}
  maxReplies={2}
  onReply={handleReply}
  onLoadMore={handleLoadMore}
  onLike={handleLike}
/>`

const flatSnippet = `<CommentThread
  items={items}
  defaultExpandedKeys={[100]}
/>`

const emptySnippet = `<CommentThread items={[]} emptyText="暂无评论" />`

const minimalSnippet = `<CommentThread
  nodes={nodes}
  showLike={false}
  showMore={false}
  showDivider={false}
/>`

const flatItems: CommentNode[] = [
  {
    id: 100,
    content: '扁平数据会自动按 parentId 构建成嵌套树。',
    user: { name: 'Evan', avatar: 'https://i.pravatar.cc/40?img=22' },
    time: '11:05'
  },
  {
    id: 101,
    parentId: 100,
    content: '没错，不需要手动嵌套 children，组件内部会自动处理。',
    user: { name: 'Fiona', avatar: 'https://i.pravatar.cc/40?img=14' },
    time: '11:07'
  },
  {
    id: 102,
    content: '这个功能在后端返回扁平列表时特别有用，省去了前端手动建树的步骤。',
    user: { name: 'Grace', avatar: 'https://i.pravatar.cc/40?img=19' },
    time: '11:10',
    likes: 2
  }
]

const minimalNodes: CommentNode[] = [
  {
    id: 200,
    content: '精简模式下隐藏了点赞和更多按钮，适合轻量展示。',
    user: { name: 'Ada', avatar: 'https://i.pravatar.cc/40?img=12' },
    time: '刚刚'
  },
  {
    id: 201,
    content: '可以自由控制每个功能按钮的显隐。',
    user: { name: 'Ben', avatar: 'https://i.pravatar.cc/40?img=32' },
    time: '1 分钟前'
  }
]

export default function CommentThreadDemo() {
  const [nodes, setNodes] = useState<CommentNode[]>(initialNodes)

  const handleReply = useCallback((node: CommentNode, value: string) => {
    setNodes((prev) => {
      let inserted = false
      const reply: CommentNode = {
        id: Date.now(),
        parentId: node.id,
        content: value,
        user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=68' },
        time: '刚刚'
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

      const next = appendReply(prev)
      return inserted ? next : prev
    })
  }, [])

  const handleLike = useCallback((node: CommentNode, liked: boolean) => {
    setNodes((prev) => {
      const toggle = (items: CommentNode[]): CommentNode[] =>
        items.map((item) => {
          if (item.id === node.id) {
            return {
              ...item,
              liked,
              likes: (item.likes ?? 0) + (liked ? 1 : -1)
            }
          }
          if (item.children && item.children.length > 0) {
            return { ...item, children: toggle(item.children) }
          }
          return item
        })
      return toggle(prev)
    })
  }, [])

  const handleLoadMore = useCallback((node: CommentNode) => {
    console.log('load more', node)
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CommentThread 评论线程</h1>
        <p className="text-gray-600">
          适用于评论、讨论、代码审查等场景的组合组件，支持嵌套回复、点赞互动和动态加载。
        </p>
      </div>

      <DemoBlock
        title="嵌套回复"
        description="支持多层嵌套、展开/收起、加载更多和实时回复。点击回复按钮试试。"
        code={basicSnippet}>
        <CommentThread
          nodes={nodes}
          defaultExpandedKeys={[1]}
          maxReplies={2}
          onReply={handleReply}
          onLoadMore={handleLoadMore}
          onLike={handleLike}
        />
      </DemoBlock>

      <DemoBlock
        title="扁平数据"
        description="传入 items（带 parentId）即可自动构建嵌套层级。"
        code={flatSnippet}>
        <CommentThread items={flatItems} defaultExpandedKeys={[100]} />
      </DemoBlock>

      <DemoBlock
        title="精简模式"
        description="隐藏点赞、更多按钮和分割线，适合轻量展示。"
        code={minimalSnippet}>
        <CommentThread nodes={minimalNodes} showLike={false} showMore={false} showDivider={false} />
      </DemoBlock>

      <DemoBlock title="空态" description="无数据时展示空状态文案。" code={emptySnippet}>
        <CommentThread items={[]} emptyText="暂无评论" />
      </DemoBlock>
    </div>
  )
}
