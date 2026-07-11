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
          defaultValue={[new Date('2024-03-10'), null]}
          locale={locale}
          labels={{
            today: locale === 'zh-CN' ? '今天（自定义）' : 'Today (Custom)',
            ok: locale === 'zh-CN' ? '确定（自定义）' : 'OK (Custom)',
            toggleCalendar: locale === 'zh-CN' ? '打开选择器' : 'Open picker'
          }}
        />
      </div>
    </>
  )
}
