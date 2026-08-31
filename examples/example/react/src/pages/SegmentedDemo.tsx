import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('segmented')

export default function SegmentedDemo() {
  return (
    <DemoPage
      title="Segmented 分段控制器"
      description="真 radiogroup。每组需要 aria-label。指示条跟阅读方向。"
      modules={modules}
    />
  )
}
