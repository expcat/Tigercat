import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('pagination')

export default function PaginationDemo() {
  return (
    <DemoPage
      title="Pagination 分页"
      description="用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。"
      modules={modules}
    />
  )
}
