import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

export default function App() {
  const [value, setValue] = useState('0 9 * * 1-5')

  return (
    <ConfigProvider locale={zhTW}>
      <FormItem label="執行計畫">
        <CronEditor value={value} onChange={setValue} />
      </FormItem>
    </ConfigProvider>
  )
}
