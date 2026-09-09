import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('drag')

export default function DragDemo() {
  return (
    <DemoPage
      title="Drag 拖拽"
      description="独立 Drag 组件与 useDrag 共用同一套 item props，落下后回写 items。"
      modules={modules}
    />
  )
}
