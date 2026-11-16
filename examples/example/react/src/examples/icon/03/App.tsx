import { useMemo } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Icon } from '@expcat/tigercat-react/Icon'
import { createIconRegistry, rocketIcon } from '@expcat/tigercat-core/icons/registry'

export default function App() {
  const iconRegistry = useMemo(() => {
    const registry = createIconRegistry()
    registry.register('app-rocket', rocketIcon)
    return registry
  }, [])

  return (
    <ConfigProvider iconRegistry={iconRegistry}>
      <div className="flex flex-wrap items-center gap-4">
        <Icon name="fullscreen" aria-label="全屏" />
        <Icon name="ticket" aria-label="工单" />
        <Icon name="bolt" aria-label="闪电" />
        <Icon name="chart-bar" aria-label="图表" />
        <Icon name="database" aria-label="数据库" />
        <Icon name="app-rocket" aria-label="rocket" />
      </div>
    </ConfigProvider>
  )
}
