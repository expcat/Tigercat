import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('progress')

export default function ProgressDemo() {
  return (
    <DemoPage
      title="Progress 进度条"
      description="用于展示操作进度的组件，支持线形和圆形两种展示方式。"
      modules={modules}
    />
  )
}
