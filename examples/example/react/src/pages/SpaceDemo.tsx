import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('space')

export default function SpaceDemo() {
  return <DemoPage title="Space 间距" description="设置组件之间的间距。" modules={modules} />
}
