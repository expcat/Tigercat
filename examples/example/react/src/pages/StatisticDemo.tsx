import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('statistic')

export default function StatisticDemo() {
  return (
    <DemoPage
      title="Statistic 统计"
      description="数字走 Intl + ConfigProvider locale。animated 在 mount 后播；减少动态时直接终值。"
      modules={modules}
    />
  )
}
