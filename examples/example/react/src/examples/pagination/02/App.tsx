import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">zh-CN，不传 labels</p>
        <ConfigProvider locale={zhCN}>
          <Pagination total={96} showQuickJumper showSizeChanger />
        </ConfigProvider>
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">zh-TW</p>
        <ConfigProvider locale={zhTW}>
          <Pagination total={96} showQuickJumper />
        </ConfigProvider>
      </div>
    </div>
  )
}
