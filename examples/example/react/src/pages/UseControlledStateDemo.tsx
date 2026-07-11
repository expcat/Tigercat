import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('use-controlled-state')

export default function UseControlledStateDemo() {
  return (
    <DemoPage
      title="useControlledState 受控/非受控"
      description="统一处理表单组件「受控 / 非受控」两种用法的样板代码，避免重复 if/else。"
      modules={modules}
    />
  )
}
