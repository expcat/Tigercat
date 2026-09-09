import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')

export default function WorkflowDesignerDemo() {
  return (
    <DemoPage
      title="WorkflowDesigner 流程设计器"
      description="简单 JSON 树流程编辑器。复用 WorkflowTimelineStep，可选子路径编辑。不是 BPMN。"
      modules={modules}
    />
  )
}
