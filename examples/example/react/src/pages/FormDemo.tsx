import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('form')

export default function FormDemo() {
  return (
    <DemoPage
      title="Form 表单"
      description="由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。"
      modules={modules}
    />
  )
}
