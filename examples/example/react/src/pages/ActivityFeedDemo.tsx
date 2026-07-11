import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('activity-feed')

export default function ActivityFeedDemo() {
  return (
    <DemoPage
      title="ActivityFeed 活动动态流"
      description="组合组件，适配审计日志与动态信息流。"
      modules={modules}
    />
  )
}
