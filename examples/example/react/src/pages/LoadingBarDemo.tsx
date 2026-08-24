import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('loading-bar')

export default function LoadingBarDemo() {
  return (
    <DemoPage
      title="LoadingBar 顶部加载条"
      description="页面顶部进度条，命令式 start / finish / error，适合路由切换与请求过程。"
      modules={modules}
    />
  )
}
