import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('steps')

export default function StepsDemo() {
  return (
    <DemoPage
      title="Steps 步骤条"
      description="引导用户按照流程完成任务的导航条。"
      modules={modules}
    />
  )
}
