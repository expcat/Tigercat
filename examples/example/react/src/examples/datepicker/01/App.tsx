import { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

export default function App() {
  const [value, setValue] = useState<Date | null>(null)

  return (
    <ConfigProvider locale={zhTW}>
      <FormItem label="日期" className="w-full max-w-[280px]">
        <DatePicker value={value} onChange={setValue} />
      </FormItem>
    </ConfigProvider>
  )
}
