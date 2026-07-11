import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('drawer')

export default function DrawerDemo() {
  return (
    <DemoPage
      title="Drawer 抽屉"
      description="从页面边缘滑出的面板，用于展示详细信息或进行操作。"
      modules={modules}
    />
  )
}
