import { Icon } from '@expcat/tigercat-react/Icon'
import { rocketIcon } from '@expcat/tigercat-core/icons/registry'

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Icon name="fullscreen" aria-label="全屏" />
      <Icon name="ticket" aria-label="工单" />
      <Icon name="bolt" aria-label="闪电" />
      <Icon name="chart-bar" aria-label="图表" />
      <Icon name="database" aria-label="数据库" />
      <Icon icon={rocketIcon} aria-label="rocket" />
    </div>
  )
}
