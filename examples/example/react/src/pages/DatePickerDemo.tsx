import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('datepicker')

export default function DatePickerDemo() {
  return (
    <DemoPage title="DatePicker 日期选择器" description="用于选择或输入日期。" modules={modules} />
  )
}
