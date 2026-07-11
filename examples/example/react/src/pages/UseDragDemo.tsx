import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('use-drag')

export default function UseDragDemo() {
  return (
    <DemoPage
      title="useDrag 拖拽"
      description="框架无关的拖拽逻辑封装，提供 getDragItemProps / getDropZoneProps \n          来快速绑定 HTML 拖拽事件。"
      modules={modules}
    />
  )
}
