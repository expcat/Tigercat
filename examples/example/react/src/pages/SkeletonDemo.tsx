import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('skeleton')

export default function SkeletonDemo() {
  return (
    <DemoPage
      title="Skeleton 骨架屏"
      description="用于在内容加载时显示占位符的骨架屏组件，提升用户体验。"
      modules={modules}
    />
  )
}
