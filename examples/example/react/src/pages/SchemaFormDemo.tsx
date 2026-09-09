import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('schema-form')

export default function SchemaFormDemo() {
  return (
    <DemoPage
      title="SchemaForm 动态表单"
      description="用 JSON schema 渲 Form / FormItem。支持分组、嵌套路径、校验与值映射。不是表单设计器。"
      modules={modules}
    />
  )
}
