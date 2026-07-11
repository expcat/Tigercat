import React, { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'
import { useLang } from '@demo-runtime/context'

const PICKER_WIDTH = 'w-full max-w-[260px]'

const RANGE_PICKER_WIDTH = 'w-full max-w-[340px]'

export default function App() {
  const { lang: locale } = useLang()

  const [date, setDate] = useState<Date | null>(null)

  const [dateWithDefault, setDateWithDefault] = useState<Date | null>(new Date('2024-01-15'))

  const [minMaxDate, setMinMaxDate] = useState<Date | null>(null)

  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  const minDate = new Date('2024-01-01')

  const maxDate = new Date('2024-12-31')

  return (
    <>
      <div className="max-w-md space-y-4">
        <DatePicker
          range
          className={RANGE_PICKER_WIDTH}
          value={range}
          onChange={setRange}
          placeholder="请选择日期范围"
          locale={locale}
        />
        <p className="text-sm text-gray-600">
          已选范围：
          {range[0] ? range[0].toLocaleDateString(locale) : '未选择'} -{' '}
          {range[1] ? range[1].toLocaleDateString(locale) : '未选择'}
        </p>
      </div>
    </>
  )
}
