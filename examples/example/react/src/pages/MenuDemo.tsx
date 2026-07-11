import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('menu')

export default function MenuDemo() {
  return (
    <DemoPage title="Menu 菜单" description="为页面和功能提供导航的菜单列表。" modules={modules} />
  )
}
