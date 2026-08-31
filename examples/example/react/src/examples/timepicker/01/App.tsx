import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

export default function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <div className="flex flex-col gap-6">
        <FormItem label="時間">
          <TimePicker minTime="09:30" />
        </FormItem>
        <TimePicker format="12" />
      </div>
    </ConfigProvider>
  )
}
