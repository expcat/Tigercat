import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('infinite-scroll')

export default function InfiniteScrollDemo() {
  return (
    <DemoPage
      title="InfiniteScroll 无限滚动"
      description="滚动到底部自动加载更多内容。"
      modules={modules}
    />
  )
}
