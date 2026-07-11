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
      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">可清除</label>
          <DatePicker
            className={PICKER_WIDTH}
            value={dateWithDefault}
            onChange={setDateWithDefault}
            clearable={true}
            locale={locale}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">不可清除</label>
          <DatePicker
            className={PICKER_WIDTH}
            value={dateWithDefault}
            onChange={setDateWithDefault}
            clearable={false}
            locale={locale}
          />
        </div>
      </div>
    </>
  )
}
