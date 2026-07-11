import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('icon')

export default function IconDemo() {
  return <DemoPage title="Icon 图标" description="语义化的矢量图形。" modules={modules} />
}
