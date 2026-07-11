import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('list')

export default function ListDemo() {
  return (
    <DemoPage
      title="List 列表"
      description="通用列表组件，用于展示一系列相似的数据项。"
      modules={modules}
    />
  )
}
