import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('context-menu')

export default function ContextMenuDemo() {
  return (
    <DemoPage
      title="ContextMenu 右键菜单"
      description="在触发区域右键打开菜单，支持坐标定位、嵌套子菜单与键盘导航。"
      modules={modules}
    />
  )
}
