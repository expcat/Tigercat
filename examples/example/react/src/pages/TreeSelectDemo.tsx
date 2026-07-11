import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tree-select')

export default function TreeSelectDemo() {
  return (
    <DemoPage
      title="TreeSelect 树选择"
      description="树形结构选择器，适用于组织架构等层级数据。"
      modules={modules}
    />
  )
}
