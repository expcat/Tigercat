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
      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">可清除</label>
          <TimePicker
            className={PICKER_WIDTH}
            value={time24}
            onChange={setTime24}
            clearable={true}
            locale={locale}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
          <TimePicker
            className={PICKER_WIDTH}
            value={time24}
            onChange={setTime24}
            clearable={false}
            locale={locale}
          />
        </div>
      </div>
    </>
  )
}
