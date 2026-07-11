import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('virtual-table')

export default function VirtualTableDemo() {
  return (
    <DemoPage
      title="VirtualTable 虚拟表格"
      description="虚拟滚动表格，可高效渲染大量数据行。"
      modules={modules}
    />
  )
}
