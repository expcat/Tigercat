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
          <label className="block text-sm font-medium text-gray-700 mb-2">小尺寸</label>
          <TimePicker
            size="sm"
            className={PICKER_WIDTH}
            locale={locale}
            placeholder="小尺寸时间选择器"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">中尺寸</label>
          <TimePicker
            size="md"
            className={PICKER_WIDTH}
            locale={locale}
            placeholder="中尺寸时间选择器"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">大尺寸</label>
          <TimePicker
            size="lg"
            className={PICKER_WIDTH}
            locale={locale}
            placeholder="大尺寸时间选择器"
          />
        </div>
      </div>
    </>
  )
}
