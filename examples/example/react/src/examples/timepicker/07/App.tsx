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
          className={PICKER_WIDTH}
          value={timeWithRange}
          onChange={setTimeWithRange}
          minTime="09:00"
          maxTime="18:00"
          locale={locale}
          placeholder="仅可选择 9:00-18:00"
        />
        <p className="text-sm text-gray-600">选中时间：{timeWithRange || '未选择'}</p>
      </div>
    </>
  )
}
