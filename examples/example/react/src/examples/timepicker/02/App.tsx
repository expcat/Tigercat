import React, { useState } from 'react'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'
import { useLang } from '@demo-runtime/context'

const PICKER_WIDTH = 'w-full max-w-[260px]'

const RANGE_PICKER_WIDTH = 'w-full max-w-[340px]'

export default function App() {
  const { lang: locale } = useLang()

  const [time, setTime] = useState<string | null>(null)

  const [time24, setTime24] = useState<string | null>('14:30')

  const [time12, setTime12] = useState<string | null>('14:30')

  const [timeWithSeconds, setTimeWithSeconds] = useState<string | null>('14:30:45')

  const [timeWithSteps, setTimeWithSteps] = useState<string | null>(null)

  const [timeWithRange, setTimeWithRange] = useState<string | null>(null)

  const [timeRange, setTimeRange] = useState<[string | null, string | null]>([null, null])

  return (
    <>
      <div className="max-w-md space-y-4">
        <TimePicker
          range
          className={RANGE_PICKER_WIDTH}
          locale={locale}
          value={timeRange}
          onChange={setTimeRange}
          placeholder={locale === 'zh-CN' ? '请选择时间段' : 'Select time range'}
        />
        <p className="text-sm text-gray-600">
          选中的时间段：{timeRange[0] || '未选择'} - {timeRange[1] || '未选择'}
        </p>
      </div>
    </>
  )
}
