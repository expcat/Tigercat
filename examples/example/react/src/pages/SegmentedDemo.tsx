import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('segmented')

export default function SegmentedDemo() {
  return (
    <DemoPage
      title="Segmented 分段控制器"
      description="分段选择器，类似 iOS UISegmentedControl。"
      modules={modules}
    />
  )
}
