import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')

export default function WorkflowDesignerDemo() {
  return (
    <DemoPage
      title="WorkflowDesigner 流程设计器"
      description="纵向摘要卡流程画布 + Inspector 同屏。复用 WorkflowTimelineStep，可选子路径。不是 BPMN。"
      modules={modules}
    />
  )
}
