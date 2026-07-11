import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('select')

export default function SelectDemo() {
  return (
    <DemoPage
      title="Select 选择器"
      description="当选项过多时，使用下拉菜单展示并选择内容。"
      modules={modules}
    />
  )
}
