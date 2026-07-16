import { useState } from 'react'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'

const formatCurrency = (value: number | undefined) =>
  value === undefined
    ? ''
    : `¥ ${new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`

const parseCurrency = (displayValue: string) => {
  const parsed = Number.parseFloat(displayValue.replace(/[^\d.-]/g, ''))
  return Number.isNaN(parsed) ? 0 : parsed
}

export default function App() {
  const [value, setValue] = useState<number | null>(1288.5)

  return (
    <div className="w-full max-w-sm space-y-3">
      <InputNumber
        value={value}
        onChange={setValue}
        min={0}
        max={10000}
        step={100}
        precision={2}
        formatter={formatCurrency}
        parser={parseCurrency}
        controlsPosition="both"
        incrementAriaLabel="增加预算"
        decrementAriaLabel="减少预算"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
        原始数值：{value ?? '未填写'}；减号与加号分列输入框两侧。
      </p>
    </div>
  )
}
