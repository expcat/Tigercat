import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tree')

export default function TreeDemo() {
  return (
    <DemoPage title="Tree 树形控件" description="用于展示层级结构的树形数据。" modules={modules} />
  )
}
