import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('virtual-list')

export default function VirtualListDemo() {
  return (
    <DemoPage
      title="VirtualList 虚拟列表"
      description="虚拟滚动渲染大量列表项，只渲染可视区域内的元素。"
      modules={modules}
    />
  )
}
