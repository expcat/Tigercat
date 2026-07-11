import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('table')

export default function TableDemo() {
  return (
    <DemoPage
      title="Table 表格"
      description="用于展示行列数据的表格组件，支持排序、筛选、分页等功能。"
      modules={modules}
    />
  )
}
