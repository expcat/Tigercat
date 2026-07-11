import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tabs')

export default function TabsDemo() {
  return <DemoPage title="Tabs 标签页" description="用于内容的分类与切换。" modules={modules} />
}
