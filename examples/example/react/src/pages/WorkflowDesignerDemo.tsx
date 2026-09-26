import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')

export default function WorkflowDesignerDemo() {
  return (
    <DemoPage
      title="WorkflowDesigner 流程设计器"
      description="中轴摘要卡画布，多分岔横向展开，结构操作在 Inspector。复用 WorkflowTimelineStep，可选子路径。不是 BPMN。"
      modules={modules}
    />
  )
}
