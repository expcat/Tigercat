import { useCallback, useState } from 'react'
import { Calendar } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `const [date, setDate] = useState(new Date())

<Calendar value={date} onChange={setDate} />`

const yearSnippet = `<Calendar mode="year" fullscreen />`

const disabledSnippet = `const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

<Calendar value={date} onChange={setDate} disabledDate={isWeekend} />`

const CalendarDemo: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [date2, setDate2] = useState<Date | undefined>(new Date())

  const isWeekend = useCallback((d: Date) => {
    const day = d.getDay()
    return day === 0 || day === 6
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Calendar 日历</h1>
      <p className="text-gray-500 mb-8">按月/年展示日期的日历面板，支持日期选择和禁用。</p>

      <DemoBlock title="基础用法" description="默认月视图" code={basicSnippet}>
        <Calendar value={date} onChange={setDate} />
        <p className="mt-2 text-sm text-gray-500">选中日期: {date?.toLocaleDateString() ?? '无'}</p>
      </DemoBlock>

      <DemoBlock title="年视图 & 全屏" description="mode='year' + fullscreen" code={yearSnippet}>
        <Calendar mode="year" fullscreen />
      </DemoBlock>

      <DemoBlock title="禁用日期" description="disabledDate 禁用周末" code={disabledSnippet}>
        <Calendar value={date2} onChange={setDate2} disabledDate={isWeekend} />
      </DemoBlock>
    </div>
  )
}

export default CalendarDemo
