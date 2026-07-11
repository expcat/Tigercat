import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('statistic')

export default function StatisticDemo() {
  return (
    <DemoPage
      title="Statistic 统计"
      description="展示统计数值，支持精度、前缀后缀和千分位分隔。"
      modules={modules}
    />
  )
}
