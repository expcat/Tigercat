import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('datepicker')

export default function DatePickerDemo() {
  return (
    <DemoPage
      title="DatePicker 日期选择器"
      description="选择或按格式输入日期。"
      modules={modules}
    />
  )
}
