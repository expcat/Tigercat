import { useState } from 'react'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { useTigerConfig } from '@expcat/tigercat-react/ConfigProvider'

function formatCurrency(value: number | undefined, locale: string | undefined) {
  if (value === undefined) return ''
  return `¥ ${new Intl.NumberFormat(locale || 'zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`
}

const parseCurrency = (displayValue: string) => {
  const parsed = Number.parseFloat(displayValue.replace(/[^\d.-]/g, ''))
  return Number.isNaN(parsed) ? null : parsed
}

export default function App() {
  const locale = useTigerConfig().locale?.locale
  const [value, setValue] = useState<number | null>(1288.5)

  return (
    <div className="w-full max-w-sm space-y-3">
      <InputNumber
        value={value}
        onChange={(next) => {
          if (typeof next === 'number' || next === null) setValue(next)
          else {
            const parsed = Number(next)
            setValue(Number.isNaN(parsed) ? null : parsed)
          }
        }}
        min={0}
        max={10000}
        step={100}
        precision={2}
        formatter={(next) => formatCurrency(next, locale)}
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
