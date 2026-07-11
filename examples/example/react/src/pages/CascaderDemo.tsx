import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('cascader')

export default function CascaderDemo() {
  return (
    <DemoPage
      title="Cascader 级联选择"
      description="多级联动选择器，适用于省市区等层级数据。"
      modules={modules}
    />
  )
}
