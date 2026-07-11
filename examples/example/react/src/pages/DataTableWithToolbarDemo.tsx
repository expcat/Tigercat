import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('data-table-with-toolbar')

export default function DataTableWithToolbarDemo() {
  return (
    <DemoPage
      title="DataTableWithToolbar 表格工具栏"
      description="搜索、筛选、批量操作与分页联动的组合组件。"
      modules={modules}
    />
  )
}
