import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-timeline')

export default function WorkflowTimelineDemo() {
  return (
    <DemoPage
      title="WorkflowTimeline 审批时间线"
      description="把 WorkflowTimelineStep 映射到现有 Timeline。不是第二套时间线，不是 BPMN。"
      modules={modules}
    />
  )
}
