import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('rate')

export default function RateDemo() {
  return (
    <DemoPage
      title="Rate 评分"
      description="评分组件，支持半星、自定义字符和禁用状态。"
      modules={modules}
    />
  )
}
