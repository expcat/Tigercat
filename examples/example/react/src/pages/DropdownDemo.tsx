import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('dropdown')

export default function DropdownDemo() {
  return <DemoPage title="Dropdown 下拉菜单" description="向下弹出的列表菜单。" modules={modules} />
}
