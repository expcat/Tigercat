import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('rate')

export default function RateDemo() {
  return (
    <DemoPage
      title="Rate 评分"
      description="半星跟阅读方向。只读用 readOnly（可聚焦）；disabled 才出 Tab。"
      modules={modules}
    />
  )
}
