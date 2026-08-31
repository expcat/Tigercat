import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('infinite-scroll')

export default function InfiniteScrollDemo() {
  return (
    <DemoPage
      title="InfiniteScroll 无限滚动"
      description="滚到阈值自动加载更多。容器必须定高。02 是横向。"
      modules={modules}
    />
  )
}
