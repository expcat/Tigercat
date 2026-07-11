import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('form-wizard')

export default function FormWizardDemo() {
  return (
    <DemoPage
      title="FormWizard 表单向导"
      description="多步表单流，支持校验阻断与完成态。"
      modules={modules}
    />
  )
}
