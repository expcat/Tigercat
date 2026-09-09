import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')

export default function WorkflowDesignerDemo() {
  return (
    <DemoPage
      title="WorkflowDesigner 流程设计器"
      description="摘要卡扫读，点选后编辑。复用 WorkflowTimelineStep，可选子路径。不是 BPMN。"
      modules={modules}
    />
  )
}
