import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-viewer')

export default function WorkflowViewerDemo() {
  return (
    <DemoPage
      title="WorkflowViewer 审批树"
      description="只读审批拓扑：分岔与 loopTo 退回环，复用 WorkflowTimelineStep。不是第二套 Timeline，不是 BPMN。"
      modules={modules}
    />
  )
}
