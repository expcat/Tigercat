import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'

export default function App() {
  const [six, setSix] = useState('0 0 0 * * *')
  const [custom, setCustom] = useState('* * * * *')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          6 段表达式保持原样，五列禁用，不会被改写成每分钟。
        </p>
        <CronEditor value={six} onChange={setSix} presets={[]} />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          从 Any 切到 Custom 后可以输入 1,15,30。不认 MON / Quartz。
        </p>
        <CronEditor value={custom} onChange={setCustom} presets={[]} />
      </div>
    </div>
  )
}
