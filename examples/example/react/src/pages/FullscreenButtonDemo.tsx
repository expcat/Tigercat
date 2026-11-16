import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('fullscreen-button')

export default function FullscreenButtonDemo() {
  return (
    <DemoPage
      title="FullscreenButton 全屏按钮"
      description="进入/退出浏览器全屏。SSR 首屏不禁用，挂载后根据浏览器支持情况禁用；请求失败可通过 onError 处理。也可用 useFullscreen。"
      modules={modules}
    />
  )
}
