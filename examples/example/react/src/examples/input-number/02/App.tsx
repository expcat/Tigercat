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
  return Number.isNaN(parsed) ? null : parsed
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
        aria-label="预算"
      />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        原始数值：{value ?? '未填写'}。聚焦时框里是裸数字，失焦再套格式。
      </p>
    </div>
  )
}
