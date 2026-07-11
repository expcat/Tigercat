import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('anchor')

export default function AnchorDemo() {
  return (
    <DemoPage
      title="Anchor 锚点"
      description="用于跳转到页面指定位置的导航组件。"
      modules={modules}
    />
  )
}
