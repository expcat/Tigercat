import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('divider')

export default function DividerDemo() {
  return <DemoPage title="Divider 分割线" description="区隔内容的分割线。" modules={modules} />
}
