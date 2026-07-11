import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'

const presets = [
  { label: '每天上午九点', value: '0 9 * * *' },
  { label: '工作日每十五分钟', value: '*/15 9-18 * * 1-5' }
]

export default function App() {
  const [value, setValue] = useState('*/15 9-18 * * 1-5')
  const [validation, setValidation] = useState('有效表达式')

  return (
    <div className="space-y-2">
      <CronEditor
        value={value}
        onChange={(next, result) => {
          setValue(next)
          setValidation(result.valid ? '有效表达式' : (result.issues[0]?.message ?? '无效表达式'))
        }}
        presets={presets}
        size="lg"
        ariaLabel="编辑并校验执行计划"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">{validation}</p>
    </div>
  )
}
