import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('layout')

export default function LayoutDemo() {
  return <DemoPage title="Layout 布局" description="协助进行页面级整体布局。" modules={modules} />
}
