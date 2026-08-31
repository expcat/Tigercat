import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Statistic } from '@expcat/tigercat-react/Statistic'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Statistic
        title="本月收入"
        value={89320.5}
        precision={2}
        prefix="¥"
        suffix=" CNY"
        size="lg"
        groupSeparator
      />
    </ConfigProvider>
  )
}
