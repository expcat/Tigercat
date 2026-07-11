import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('switch')

export default function SwitchDemo() {
  return (
    <DemoPage
      title="Switch 开关"
      description="表示两种相互对立的状态间的切换，多用于触发「开/关」。"
      modules={modules}
    />
  )
}
