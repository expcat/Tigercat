import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('form')

export default function FormDemo() {
  return (
    <DemoPage
      title="Form 表单"
      description="由输入框和选择器组成，用以收集、校验、提交数据。"
      modules={modules}
    />
  )
}
