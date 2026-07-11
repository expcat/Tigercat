import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tag')

export default function TagDemo() {
  return (
    <DemoPage title="Tag 标签" description="用于标记和分类的小型标签组件。" modules={modules} />
  )
}
