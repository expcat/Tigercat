import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('virtual-list')

export default function VirtualListDemo() {
  return (
    <DemoPage
      title="VirtualList 虚拟列表"
      description="只渲染可视窗口里的项。height 是 px 数字；命令式滚动用 scrollToIndex。"
      modules={modules}
    />
  )
}
