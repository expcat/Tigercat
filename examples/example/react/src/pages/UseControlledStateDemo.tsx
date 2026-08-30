import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('use-controlled-state')

export default function UseControlledStateDemo() {
  return (
    <DemoPage
      title="useControlledState 受控/非受控"
      description="受控与非受控两块样板。省略 value 时保留最后一次展示值；undefined 非受控，null 是合法空值。"
      modules={modules}
    />
  )
}
