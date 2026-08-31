import { Tag } from '@expcat/tigercat-react/Tag'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Tag closable>关闭名来自 locale</Tag>
    </ConfigProvider>
  )
}
