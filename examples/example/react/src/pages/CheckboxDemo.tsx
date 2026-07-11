import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('checkbox')

export default function CheckboxDemo() {
  return (
    <DemoPage
      title="Checkbox 多选框"
      description="在一组可选项中进行多项选择。"
      modules={modules}
    />
  )
}
