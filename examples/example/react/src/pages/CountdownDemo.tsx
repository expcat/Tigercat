import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('countdown')

export default function CountdownDemo() {
  return (
    <DemoPage
      title="Countdown 倒计时"
      description="展示目标时间的剩余时长，支持格式化、结束事件和稳定初始值。"
      modules={modules}
    />
  )
}
