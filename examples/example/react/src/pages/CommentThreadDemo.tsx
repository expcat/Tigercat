import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('comment-thread')

export default function CommentThreadDemo() {
  return (
    <DemoPage
      title="CommentThread 评论线程"
      description="适用于评论、讨论、代码审查等场景的组合组件，支持嵌套回复、点赞互动和动态加载。"
      modules={modules}
    />
  )
}
