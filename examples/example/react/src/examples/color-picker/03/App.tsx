import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

export default function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <ColorPicker defaultValue="#059669" />
          <span className="text-sm text-gray-500">非受控</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorPicker defaultValue="rgba(245, 158, 11, 0)" showAlpha format="rgb" />
          <span className="text-sm text-gray-500">alpha=0</span>
        </div>
        <div className="flex items-center gap-2">
          <ColorPicker value="#94a3b8" disabled />
          <span className="text-sm text-gray-500">disabled</span>
        </div>
      </div>
    </ConfigProvider>
  )
}
