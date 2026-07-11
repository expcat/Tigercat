import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('spotlight')

export default function SpotlightDemo() {
  return (
    <DemoPage
      title="Spotlight 命令面板"
      description="支持分组结果、模糊搜索与键盘导航的命令面板。"
      modules={modules}
    />
  )
}
