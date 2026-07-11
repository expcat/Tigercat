import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('calendar')

export default function CalendarDemo() {
  return (
    <DemoPage
      title="Calendar 日历"
      description="按月/年展示日期的日历面板，支持日期选择和禁用。"
      modules={modules}
    />
  )
}
