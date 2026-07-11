import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('timepicker')

export default function TimePickerDemo() {
  return (
    <DemoPage title="TimePicker 时间选择器" description="用于选择或输入时间。" modules={modules} />
  )
}
