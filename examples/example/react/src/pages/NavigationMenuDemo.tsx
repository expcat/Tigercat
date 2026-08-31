import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('navigation-menu')

export default function NavigationMenuDemo() {
  return (
    <DemoPage
      title="NavigationMenu 站点导航"
      description="水平导航栏配合下拉与 MegaMenu 面板。点击或 Enter / ArrowDown 展开，再点同一触发器关闭。"
      modules={modules}
    />
  )
}
