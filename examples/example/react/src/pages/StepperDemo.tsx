import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('stepper')

export default function StepperDemo() {
  return (
    <DemoPage
      title="Stepper 步进器"
      description="数值增减控制器，支持步长、范围和精度。"
      modules={modules}
    />
  )
}
