import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('descriptions')

export default function DescriptionsDemo() {
  return (
    <DemoPage
      title="Descriptions 描述列表"
      description="用于展示结构化数据、详情信息的描述列表组件。"
      modules={modules}
    />
  )
}
