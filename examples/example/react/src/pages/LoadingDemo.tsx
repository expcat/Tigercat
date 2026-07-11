import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('loading')

export default function LoadingDemo() {
  return (
    <DemoPage
      title="Loading 加载中"
      description="用于展示加载状态，支持多种加载动画样式，可用于页面和区块的加载状态。"
      modules={modules}
    />
  )
}
